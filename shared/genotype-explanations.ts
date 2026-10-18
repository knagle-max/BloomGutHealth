import { z } from "zod";
import catalogue from "./data/genotype-explanations.json";
const annotationSchema = z
  .object({
    rsid: z.string().regex(/^rs\d+$/),
    gene: z.string(),
    alleles: z.string().regex(/^[ACGT]{2}$/),
    geneRole: z.string().min(1),
    variantMeaning: z.string().min(1),
    evidence: z.string().min(1),
    comparisons: z.record(z.string().regex(/^[ACGT]{2}$/), z.string().min(1)),
    dietMeaning: z.string().min(1),
    limitations: z.string().min(1),
    sources: z
      .array(z.object({ title: z.string(), url: z.string().url() }))
      .min(2),
  })
  .strict();
export const genotypeAnnotations = z
  .array(annotationSchema)
  .parse(catalogue.variants);
export const GENOTYPE_EXPLANATION_VERSION = catalogue.version;
export function explainGenotypes(
  entries: Array<{ rsid: string; gene?: string; genotype: string }>,
  orientationConfirmed: boolean,
) {
  return entries.map((entry) => {
    const genotype = entry.genotype.toUpperCase().split("").sort().join("");
    const annotation = genotypeAnnotations.find((v) => v.rsid === entry.rsid);
    const status = !annotation
      ? ("not-curated" as const)
      : genotype === "--"
        ? ("no-call" as const)
        : !orientationConfirmed
          ? ("orientation-unconfirmed" as const)
          : !Object.hasOwn(annotation.comparisons, genotype)
            ? ("outside-studied-pair" as const)
            : ("matched" as const);
    const personalMeaning =
      status === "matched"
        ? annotation!.comparisons[genotype]
        : status === "no-call"
          ? "Your source reports no call. No genotype-specific conclusion can be drawn."
          : status === "orientation-unconfirmed"
            ? "Your strand orientation is unconfirmed. The reference comparisons below are educational; none is matched to your result."
            : status === "outside-studied-pair"
              ? "Your entry does not match the allele pair covered by this explanation. This may be a source/strand issue or an allele outside the studied pair; Bloom does not flip or replace it."
              : "No source-checked explanation is available for this SNP yet. Its gene identity, dietary effect and genotype comparisons are not inferred.";
    return {
      rsid: entry.rsid,
      submittedGene: entry.gene || "",
      gene: annotation?.gene || "Gene identity not curated",
      genotype,
      status,
      personalMeaning,
      version: GENOTYPE_EXPLANATION_VERSION,
      geneRole: annotation?.geneRole || null,
      variantMeaning: annotation?.variantMeaning || null,
      evidence: annotation?.evidence || "Not curated",
      dietMeaning: annotation?.dietMeaning || null,
      limitations: annotation?.limitations || null,
      sources: annotation?.sources || [],
      comparisons: annotation
        ? Object.entries(annotation.comparisons).map(([call, meaning]) => ({
            genotype: call,
            meaning,
            isYours: status === "matched" && call === genotype,
          }))
        : [],
      boundary:
        "Educational comparison, not a diagnosis, measured enzyme activity, personal disease probability or genotype-specific diet prescription. It does not add a marker to Bloom’s diet-ranking catalogue.",
    };
  });
}
export type GenotypeExplanation = ReturnType<typeof explainGenotypes>[number];
