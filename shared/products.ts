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

/** Replacement changes identity; retain recorded mass only where the source basis supports it. */
export function replacementLabelAmount(servingGrams:number|null,originalGrams?:number|null) {
  if(originalGrams===undefined)return {servings:1,requiresReview:false};
  const servings=typeof originalGrams==="number"&&Number.isFinite(originalGrams)&&originalGrams>0&&originalGrams<=3000&&typeof servingGrams==="number"&&Number.isFinite(servingGrams)&&servingGrams>0?originalGrams/servingGrams:null;
  return servings!==null&&servings>0&&servings<=100
    ? {servings,requiresReview:false}
    : {servings:1,requiresReview:true};
}

// Runtime boundaries for public lookup responses. Do not coerce missing, string,
// negative or nonfinite nutrient amounts into plausible nutrition estimates.
export const productResponseSchema = z.object({
  source: productRefSchema.shape.source,
  id: productRefSchema.shape.id,
  name: z.string().min(1), brand: z.string(), barcode: z.string().optional(),
  servingDescription: z.string(), servingGrams: z.number().finite().positive().nullable(),
  perServing: z.record(z.string(),z.number().finite().nonnegative()),
  url: z.string().refine(value=>{try{return ['https:','http:'].includes(new URL(value).protocol);}catch{return false;}}).nullable(),
  retrievedAt: z.string(), notes: z.array(z.string()),
  otherNutrients: z.array(z.object({name:z.string(),amount:z.number().finite().nonnegative(),unit:z.string()})).optional(),
  provenance: z.object({version:z.literal('usda-branded-v1'),fdcId:z.number().int().positive(),gtin:z.string().nullable(),brandOwner:z.string(),marketCountry:z.string().nullable(),publishedDate:z.string().nullable(),modifiedDate:z.string().nullable(),ingredients:z.string().nullable()}).optional(),
});
export const productListResponseSchema=z.object({products:z.array(productResponseSchema)});
export const productSearchResponseSchema=productListResponseSchema.extend({warnings:z.array(z.string()),attribution:z.string(),query:z.object({original:z.string(),normalized:z.string()}).optional()});
export function readProductResponse<T>(schema:z.ZodType<T>,value:unknown):T{
 const result=schema.safeParse(value);
 if(!result.success)throw Error('The food source response could not be verified. Retry the search or enter the nutrition from your label.');
 return result.data;
}
