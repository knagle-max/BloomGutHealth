import { z } from "zod";

export const GENETIC_CALL_NORMALIZATION = "uppercase-separators-unphased-order-v1" as const;
/** A bounded call token, never a raw file/row, person identifier or free text. */
export const geneticCallSourceSchema = z.object({
  original: z.string().min(2).max(8).regex(/^(?:[ACGTacgt][ \t/|]*[ACGTacgt]|--)$/).refine(value=>!/[\r\n]/.test(value)),
  normalization: z.literal(GENETIC_CALL_NORMALIZATION),
}).strict();
export type GeneticCallSource = z.infer<typeof geneticCallSourceSchema>;
export function normalizeUnphasedGenotype(original: string) {
  return original.toUpperCase().replace(/[\s/|]/g, "").split("").sort().join("");
}
export function geneticCallSourceMatches(source: GeneticCallSource | undefined, genotype: string) {
  return !source || normalizeUnphasedGenotype(source.original) === genotype;
}
