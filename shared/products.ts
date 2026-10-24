import { z } from "zod";
import { normalizeBarcode } from "./barcodes";
export const productRefSchema = z
  .object({
    source: z.enum(["usda-local", "usda-branded", "off", "dsld", "manual"]),
    id: z.string().regex(/^[a-zA-Z0-9:-]{1,100}$/),
    servings: z.number().finite().positive().max(100),
    query: z.string().max(120).optional(),
  })
  .strict();
export type ProductRef = z.infer<typeof productRefSchema>;
export const labelInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    barcode: z.string().refine(v=>normalizeBarcode(v)!==null,"Use a valid package barcode").transform(v=>normalizeBarcode(v)!).optional(),
    brand: z.string().trim().max(100).default(""),
    servingDescription: z.string().trim().min(1).max(120),
    servingGrams: z.number().finite().positive().max(3000).nullable(),
    perServing: z
      .record(z.string().max(50), z.number().finite().nonnegative().max(100000))
      .refine((v) => Object.keys(v).length <= 21),
    otherNutrients: z
      .array(
        z
          .object({
            name: z.string().trim().min(1).max(120),
            amount: z.number().finite().nonnegative().max(100000),
            unit: z.string().trim().min(1).max(30),
          })
          .strict(),
      )
      .max(30)
      .optional(),
  })
  .strict()
  .refine(
    (v) => Object.keys(v.perServing).length > 0 || !!v.otherNutrients?.length,
    "Enter at least one amount shown on the label.",
  );
export type LabelInput = z.infer<typeof labelInputSchema>;
export type Product = {
  source: ProductRef["source"];
  id: string;
  name: string;
  brand: string;
  barcode?: string;
  servingDescription: string;
  servingGrams: number | null;
  perServing: Record<string, number>;
  url: string | null;
  retrievedAt: string;
  notes: string[];
  otherNutrients?: { name: string; amount: number; unit: string }[];
  provenance?: {
    version: "usda-branded-v1";
    fdcId: number;
    gtin: string | null;
    brandOwner: string;
    marketCountry: string | null;
    publishedDate: string | null;
    modifiedDate: string | null;
    ingredients: string | null;
  };
};
export function productIngredient(product: Product, servings = 1) {
  return {
    name: product.name.slice(0, 120),
    grams:
      product.servingGrams === null ? null : product.servingGrams * servings,
    preparation: "Selected product label",
    assumption: `${servings} × ${product.servingDescription}; ${product.source === "manual" ? "your saved label" : "database label — confirm the exact formula and country"}. Missing nutrients are unknown.`,
    product: { source: product.source, id: product.id, servings },
  };
}
