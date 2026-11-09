import { z } from "zod";
import catalogue from "./data/genotype-explanations.json";
import reference from "./data/genotype-reference.json";
import type { GeneticCallSource } from "./genetic-call-source";

// Reference compatibility is distinct from membership in a study's two-allele
// contrast. Neither check verifies the assay, build or orientation of a source.
export function genotypeReferenceCompatibility(rsid: string, genotype: string) {
  const mapping = reference.variants.find((v) => v.rsid === rsid)?.mappings[0];
  if (!mapping || !/^[ACGT]{2}$/.test(genotype)) return "unknown" as const;
  return genotype.split("").every((a) => mapping.alleles.split("/").includes(a))
    ? ("compatible" as const)
    : ("incompatible" as const);
}
const annotationSchema = z
  .object({
    rsid: z.string().regex(/^rs\d+$/),
    gene: z.string(),
    topic: z.string().min(1),
    resultAdvice: z.record(
      z.string().regex(/^[ACGT]{2}$/),
      z
        .object({
          headline: z.string().min(1),
          action: z.string().min(1),
          priority: z.enum([
            "general-habits",
            "no-specific-change",
            "check-status",
            "clinical-review",
            "food-choice",
          ]),
        })
        .strict(),
    ),
    practicalGuidance: z
      .object({
        foodSteps: z.array(z.string().min(1)).min(1).max(4),
        supplements: z.string().min(1),
        followUp: z.string().min(1),
      })
      .strict(),
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
  entries: Array<{ rsid: string; gene?: string; genotype: string; sourceCall?: GeneticCallSource }>,
  orientationConfirmed: boolean,
) {
  return entries.map((entry) => {
    const genotype = entry.genotype.toUpperCase().split("").sort().join("");
    const annotation = genotypeAnnotations.find((v) => v.rsid === entry.rsid);
    const referenceCompatibility = genotypeReferenceCompatibility(entry.rsid, genotype);
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
          ? "Your source did not give a readable result here. No personal conclusion or diet change can be drawn."
          : status === "orientation-unconfirmed"
            ? "We need to check how your source writes the DNA letters before interpreting your result. The information below is general and is not matched to you."
            : status === "outside-studied-pair"
              ? referenceCompatibility === "compatible"
                ? "These letters occur in Bloom’s stored GRCh37 forward-strand reference, but this explanation covers a different two-allele study contrast. This is an explanation coverage gap, not proof of an import error. Your source assay, build and orientation still need to be appropriate; no personal interpretation or diet advice is assigned."
                : "These letters are not covered by this explanation or compatible with Bloom’s stored GRCh37 forward-strand reference. Check the source rsID, build, assay and orientation. Bloom does not guess, flip or replace your call; no personal interpretation or diet advice is assigned."
              : "No source-checked explanation is available for this SNP yet. Its gene identity, dietary effect and genotype comparisons are not inferred.";
    return {
      rsid: entry.rsid,
      submittedGene: entry.gene || "",
      gene: annotation?.gene || "Gene identity not curated",
      genotype,
      sourceCall: entry.sourceCall || null,
      referenceCompatibility,
      status,
      personalMeaning,
      topic: annotation?.topic || null,
      resultAdvice:
        status === "matched" ? annotation!.resultAdvice[genotype] : null,
      practicalGuidance: annotation?.practicalGuidance || null,
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
