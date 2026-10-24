import { goalGuidance, goalMealFit, goalSources } from "./goal-guidance";
import genotypeReference from "./data/genotype-reference.json";
import { explainGenotypes, genotypeAnnotations } from "./genotype-explanations";
import { z } from "zod";
import {
  recipes,
  preferenceConflicts,
  explainFoods,
  type DietaryPreferences,
} from "./meal-intelligence";
import { pathways, evidenceSources } from "./science-coach";

export const PRECISION_VERSION = "precision-2026-10-18.3";
export const precisionSources = [
  {
    id: "pnpla3-study",
    title: "Romeo et al. 2008 — PNPLA3 and hepatic fat",
    url: "https://www.nature.com/articles/ng.257",
    type: "Human genetic association",
    limitation:
      "Association with liver fat does not diagnose disease or validate a genotype-specific diet or supplement.",
  },
  {
    id: "tm6sf2-study",
    title: "Kozlitina et al. 2014 — TM6SF2 and liver fat",
    url: "https://www.nature.com/articles/ng.2901",
    type: "Human genetic association with functional experiments",
    limitation:
      "Liver and circulating lipid effects can differ. No genotype-specific food prescription is established here.",
  },
  {
    id: "gckr-study",
    title:
      "Orho-Melander et al. 2008 — GCKR, triglycerides and fasting glucose",
    url: "https://pubmed.ncbi.nlm.nih.gov/18678614/",
    type: "Human genetic association",
    limitation:
      "Associations can differ by metabolic outcome and population; a common variant does not set carbohydrate limits.",
  },
  ...["rs738409", "rs58542926", "rs1260326"].map((rsid) => ({
    id: `placement-${rsid}`,
    title: `Ensembl GRCh37 — ${rsid} placement and forward alleles`,
    url: `https://grch37.rest.ensembl.org/variation/human/${rsid}?content-type=application/json`,
    type: "Genome reference",
    limitation:
      "Placement and alleles are technical checks, not clinical interpretation. Only the reviewed allele pair is supported.",
  })),

  {
    id: "mthfr-trial",
    title:
      "Crider et al. 2011 — MTHFR, folate and homocysteine supplementation trial",
    url: "https://pubmed.ncbi.nlm.nih.gov/21508090/",
    type: "Human intervention",
    limitation:
      "Biomarker responses in Chinese women; not proof of a genotype-specific disease benefit.",
  },
  {
    id: "mthfr-guidance",
    title: "CDC — MTHFR and folic acid",
    url: "https://www.cdc.gov/folic-acid/data-research/mthfr/index.html",
    type: "Public health guidance",
    limitation:
      "A common variant does not establish a supplement need or require methylfolate.",
  },
  {
    id: "lactase-study",
    title: "Leseva et al. 2018 — Lactase genotype, methylation and expression",
    url: "https://pubmed.ncbi.nlm.nih.gov/29618745/",
    type: "Human functional association",
    limitation:
      "Ancestry-dependent marker; symptoms, dose and other persistence variants matter.",
  },
  {
    id: "heart-guidance",
    title: "AHA 2026 — Dietary guidance for cardiovascular health",
    url: "https://professional.heart.org/en/science-news/2026-dietary-guidance-to-improve-cardiovascular-health/top-things-to-know",
    type: "Scientific statement",
    limitation:
      "Dietary-pattern guidance, not predicted individual treatment effects of these recipes.",
  },
  {
    id: "b12-guidance",
    title: "NIH ODS — Vitamin B12",
    url: "https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/",
    type: "Nutrient evidence review",
    limitation:
      "Confirm the cause of a low result; replacement route and dose require individual assessment.",
  },
  {
    id: "d-guidance",
    title: "NIH ODS — Vitamin D",
    url: "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/",
    type: "Nutrient evidence review",
    limitation:
      "Thresholds vary; excess dosing and medicine interactions require review.",
  },
  {
    id: "iron-guidance",
    title: "NIH ODS — Iron status and replacement",
    url: "https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/",
    type: "Nutrient evidence review",
    limitation:
      "Ferritin can be affected by inflammation; evaluate the cause and other iron-status markers.",
  },
  {
    id: "fads-study",
    title:
      "Polymorphisms in FADS1 and FADS2 alter desaturase activity in young Canadian adults",
    url: "https://pubmed.ncbi.nlm.nih.gov/21414826/",
    type: "Human genotype–fatty-acid association",
    limitation:
      "Association and inferred enzyme activity do not establish a personal omega-3 dose or clinical benefit.",
  },
  {
    id: "tcf-study",
    title:
      "TCF7L2 polymorphisms and progression to diabetes in the Diabetes Prevention Program",
    url: "https://pubmed.ncbi.nlm.nih.gov/16855264/",
    type: "Genetic analysis within a human intervention trial",
    limitation:
      "Risk association is not a diagnosis or a validated genotype-specific diet prescription.",
  },
  {
    id: "snp-fads",
    title: "NCBI dbSNP rs174547",
    url: "https://www.ncbi.nlm.nih.gov/snp/rs174547",
    type: "Variant reference",
    limitation: "Placement does not independently confirm the raw call.",
  },
  {
    id: "snp-tcf",
    title: "NCBI ClinVar — TCF7L2 rs7903146 genomic placement",
    url: "https://www.ncbi.nlm.nih.gov/clinvar/RCV000007838.2/",
    type: "Variant reference",
    limitation: "Common susceptibility variant, not a deterministic diagnosis.",
  },
  {
    id: "raw-format",
    title: "23andMe — Reference genome and strand",
    url: "https://customercare.23andme.com/hc/en-us/articles/212883767-Which-Reference-Genome-and-Strand-Does-23andMe-Use",
    type: "Provider technical documentation",
    limitation: "Consumer raw calls are not clinical confirmation.",
  },
  {
    id: "snp-mthfr",
    title: "NCBI dbSNP rs1801133 — genomic placement",
    url: "https://www.ncbi.nlm.nih.gov/snp/rs1801133",
    type: "Variant reference",
    limitation:
      "A reference placement does not verify an individual's raw call.",
  },
  {
    id: "snp-lct",
    title: "NCBI dbSNP rs4988235 — genomic placement",
    url: "https://www.ncbi.nlm.nih.gov/snp/rs4988235",
    type: "Variant reference",
    limitation:
      "Forward genomic alleles differ from gene-oriented C/T notation.",
  },
];
// Deliberately bounded, reviewed catalogue. Add variants only with placement, strand,
// population applicability, source and actionability review; never interpret every SNP.
export const variantCatalog = [
  {
    rsid: "rs738409",
    gene: "PNPLA3",
    chromosome: "22",
    position: 44324727,
    alleles: "CG",
    pathway: "Hepatic lipid handling",
    sources: ["pnpla3-study", "placement-rs738409"],
    interpretation:
      "This common C/G marker is associated with hepatic fat and inflammation in studied populations. A raw genotype is a susceptibility finding, not a diagnosis or a measured liver-fat result.",
    limitation:
      "Use liver measurements and clinical context. No direct genotype-to-microbe interaction, supplement, or individual dietary response is established in this catalogue.",
  },
  {
    rsid: "rs58542926",
    gene: "TM6SF2",
    chromosome: "19",
    position: 19379549,
    alleles: "CT",
    pathway: "Hepatic lipid export / circulating lipids",
    sources: ["tm6sf2-study", "placement-rs58542926"],
    interpretation:
      "This common C/T marker is associated with hepatic fat and lipid traits. Liver-fat susceptibility and circulating lipid levels need separate interpretation.",
    limitation:
      "Do not infer liver health from cholesterol alone. Actual laboratory results and clinical liver assessment take priority; no genetic supplement or food prescription is made.",
  },
  {
    rsid: "rs1260326",
    gene: "GCKR",
    chromosome: "2",
    position: 27730940,
    alleles: "CT",
    pathway: "Hepatic glucose / triglyceride regulation",
    sources: ["gckr-study", "placement-rs1260326"],
    interpretation:
      "This common C/T marker is associated with triglyceride and fasting-glucose traits, which can move in different directions. It does not diagnose insulin resistance or a need to restrict a food group.",
    limitation:
      "Review measured triglycerides, glucose and HbA1c together. No genotype-specific carbohydrate dose or microbial effect is inferred.",
  },

  {
    rsid: "rs1801133",
    gene: "MTHFR",
    chromosome: "1",
    position: 11856378,
    alleles: "AG",
    pathway: "Folate / one-carbon metabolism",
    sources: ["mthfr-trial", "mthfr-guidance", "snp-mthfr"],
    interpretation:
      "The forward-strand A allele corresponds to gene-oriented 677T. This common variant can influence folate-related biomarkers; it does not diagnose a deficiency.",
    limitation:
      "No genetic supplement prescription. Assess actual intake and relevant laboratory findings.",
  },
  {
    rsid: "rs4988235",
    gene: "MCM6 / LCT",
    chromosome: "2",
    position: 136608646,
    alleles: "AG",
    pathway: "Lactose digestion / colonic fermentation",
    sources: ["lactase-study", "snp-lct"],
    interpretation:
      "Forward-strand A corresponds to the -13910T persistence-associated allele in studied populations. GG is compatible with non-persistence at this marker, not a diagnosis of intolerance.",
    limitation:
      "Other persistence variants occur across ancestries. Do not exclude dairy solely from this call; use tolerance observations.",
  },
  {
    rsid: "rs174547",
    gene: "FADS1",
    chromosome: "11",
    position: 61570783,
    alleles: "CT",
    pathway: "Long-chain polyunsaturated fatty-acid metabolism",
    sources: ["fads-study", "snp-fads"],
    interpretation:
      "This C/T marker is associated with fatty-acid profiles and inferred desaturase activity in studied populations. Effects vary with ancestry and diet.",
    limitation:
      "Do not infer omega-3 deficiency, require seafood, or prescribe fish oil from this marker. Use dietary intake and relevant measurements.",
  },
  {
    rsid: "rs7903146",
    gene: "TCF7L2",
    chromosome: "10",
    position: 114758349,
    alleles: "CT",
    pathway: "Insulin secretion / glucose regulation",
    sources: ["tcf-study", "snp-tcf"],
    interpretation:
      "The T allele is associated with type 2 diabetes susceptibility in studied populations. A common susceptibility call is not a diagnosis.",
    limitation:
      "Measured glucose, HbA1c and clinical context guide action. No genotype-specific carbohydrate limit or supplement is inferred.",
  },
] as const;
const isoDate = z
  .string()
  .datetime({ offset: true })
  .refine(
    (d) => +new Date(d) <= Date.now(),
    "Future measurements are not allowed",
  );
const shortText = z.string().trim().min(1).max(200);
const variantIds = genotypeAnnotations.map((v) => v.rsid) as [
  string,
  ...string[],
];
const callSchema = z
  .object({
    rsid: z.enum(variantIds),
    chromosome: z.string(),
    position: z.number().int(),
    genotype: z.string().regex(/^(?:[ACGT]{2}|--)$/),
  })
  .strict()
  .superRefine((call, ctx) => {
    const v = genotypeReference.variants.find((v) => v.rsid === call.rsid)!
      .mappings[0];
    if (
      v.chromosome !== call.chromosome ||
      v.position !== call.position ||
      (call.genotype !== "--" &&
        !call.genotype.split("").every((a) => v.alleles.split("/").includes(a)))
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Variant placement or alleles do not match the reviewed GRCh37 forward-strand entry",
      });
  });
export const geneticImportSchema = z
  .object({
    consent: z.literal(true),
    provider: z.literal("23andMe"),
    build: z.literal("GRCh37"),
    strand: z.literal("+"),
    collectedAt: isoDate,
    calls: z.array(callSchema).min(1).max(genotypeAnnotations.length),
    scannedVariants: z.number().int().min(1).max(2000000),
  })
  .strict()
  .superRefine((g, ctx) => {
    if (
      new Set(g.calls.map((c) => c.rsid)).size !== g.calls.length ||
      g.scannedVariants < g.calls.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Duplicate or inconsistent variant counts",
      });
  });
export const manualGeneticEntrySchema = z
  .object({
    rsid: z
      .string()
      .trim()
      .regex(/^rs[0-9]{1,12}$/),
    gene: z.string().trim().max(60).default(""),
    genotype: z
      .string()
      .trim()
      .transform((v) =>
        v
          .toUpperCase()
          .replace(/[\s/|]/g, "")
          .split("")
          .sort()
          .join(""),
      )
      .pipe(
        z
          .string()
          .regex(
            /^(?:[ACGT]{2}|--)$/,
            "Enter two DNA letters, or -- for no call",
          ),
      ),
  })
  .strict();
export const manualGeneticImportSchema = z
  .object({
    consent: z.literal(true),
    provider: z.literal("manual"),
    source: z.string().trim().min(1).max(200),
    strand: z.enum(["forward", "unknown"]),
    collectedAt: isoDate,
    entries: z.array(manualGeneticEntrySchema).min(1).max(200),
  })
  .strict()
  .refine(
    (g) => new Set(g.entries.map((e) => e.rsid)).size === g.entries.length,
    "Duplicate SNPs: keep one result per rsID; resolve conflicts with the source report",
  );
export type ManualGeneticImport = z.infer<typeof manualGeneticImportSchema>;
export function classifyManualGenetics(data: ManualGeneticImport) {
  return data.entries.map((entry) => {
    const variant = variantCatalog.find((v) => v.rsid === entry.rsid);
    const reason = !variant
      ? "Recorded only: this SNP is outside Bloom’s diet-ranking catalogue. Educational explanations, where available, are separate."
      : data.strand !== "forward"
        ? "Recorded only: forward-strand orientation has not been confirmed."
        : entry.genotype !== "--" &&
            !entry.genotype.split("").every((a) => variant.alleles.includes(a))
          ? "Recorded only: these alleles do not match the reviewed forward-strand marker. Check the rsID and source; Bloom does not guess or flip the call."
          : null;
    return {
      ...entry,
      reviewed: !reason,
      reason,
      canonicalGene: variant?.gene || null,
      note:
        entry.rsid === "rs429358" || entry.rsid === "rs7412"
          ? "No APOE type or disease-risk interpretation is inferred from these entries."
          : null,
    };
  });
}
const geneticsPayloadSchema = z.union([
  geneticImportSchema,
  manualGeneticImportSchema,
]);

export function parse23andMe(text: string, collectedAt: string) {
  if (text.length > 50 * 1024 * 1024)
    throw new Error("Use an uncompressed 23andMe text file under 50 MB.");
  const comments = text
    .slice(0, 20000)
    .split(/\r?\n/)
    .filter((l) => l.startsWith("#"))
    .join("\n");
  if (/negative\s*(?:\(-\))?\s*strand|minus\s*strand/i.test(comments))
    throw new Error("Negative-strand exports are not supported.");
  if (
    !/23andme/i.test(comments) ||
    !/(?:build\s*37|GRCh37)/i.test(comments) ||
    /(?:build\s*38|GRCh38)/i.test(comments)
  )
    throw new Error(
      "Only explicitly identified 23andMe GRCh37 exports are supported. No genome build is guessed.",
    );
  const calls: z.infer<typeof callSchema>[] = [];
  let scannedVariants = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.startsWith("#")) continue;
    const [rsid, chromosome, position, genotype] = line.trim().split(/\s+/);
    if (!/^(?:rs\d+|i\d+)$/.test(rsid || ""))
      throw new Error("Malformed raw-data row.");
    scannedVariants++;
    if (genotypeAnnotations.some((v) => v.rsid === rsid))
      calls.push({
        rsid: rsid as any,
        chromosome,
        position: Number(position),
        genotype: (genotype || "").toUpperCase().split("").sort().join(""),
      });
  }
  return geneticImportSchema.parse({
    consent: true,
    provider: "23andMe",
    build: "GRCh37",
    strand: "+",
    collectedAt,
    calls,
    scannedVariants,
  });
}
export const markerDefinitions = [
  { id: "ldl", name: "LDL cholesterol", units: ["mmol/L", "mg/dL"] },
  { id: "apob", name: "ApoB", units: ["g/L", "mg/dL"] },
  { id: "triglycerides", name: "Triglycerides", units: ["mmol/L", "mg/dL"] },
  { id: "hdl", name: "HDL cholesterol", units: ["mmol/L", "mg/dL"] },
  { id: "alt", name: "ALT", units: ["U/L"] },
  { id: "ast", name: "AST", units: ["U/L"] },
  { id: "ggt", name: "GGT", units: ["U/L"] },
  { id: "glucose", name: "Glucose", units: ["mmol/L", "mg/dL"] },
  { id: "hba1c", name: "HbA1c", units: ["%", "mmol/mol"] },
  { id: "b12", name: "Vitamin B12", units: ["pmol/L", "pg/mL"] },
  { id: "vitamin_d", name: "25-OH vitamin D", units: ["nmol/L", "ng/mL"] },
  { id: "ferritin", name: "Ferritin", units: ["ug/L", "ng/mL"] },
  { id: "folate", name: "Serum folate", units: ["nmol/L", "ng/mL"] },
  { id: "homocysteine", name: "Homocysteine", units: ["umol/L"] },
] as const;
export type MarkerId = (typeof markerDefinitions)[number]["id"];
const markerIds = markerDefinitions.map((m) => m.id) as [
  MarkerId,
  ...MarkerId[],
];
export const labSchema = z
  .object({
    marker: z.enum(markerIds),
    value: z.number().finite().nonnegative().max(1000000),
    unit: shortText,
    measuredAt: isoDate,
    laboratory: shortText,
    method: shortText,
    fasting: z.enum(["yes", "no", "unknown"]),
    referenceLow: z.number().finite().nonnegative().nullable(),
    referenceHigh: z.number().finite().nonnegative().nullable(),
    notes: z.string().max(1000).default(""),
    sourceInput: z.object({text:z.string().max(1000),number:z.string().max(100),suppliedUnit:z.string().max(50).nullable(),capture:z.enum(["pasted-report","manual-report"])}).strict().optional(),
    unitReview: z.object({
      status: z.enum(["pending", "confirmed"]),
      originalValue: z.number().finite().nonnegative().max(1000000),
      originalUnit: z.string().max(50).nullable(),
      originalText: z.string().max(1000),
      suggestedUnit: z.string().max(50),
      confirmedAt: z.string().datetime().nullable(),
      supersedes: z.string().max(100).nullable(),
    }).strict().optional(),
  })
  .strict()
  .superRefine((l, ctx) => {
    if (
      !(
        markerDefinitions.find((m) => m.id === l.marker)!
          .units as readonly string[]
      ).includes(l.unit)
    )
      ctx.addIssue({
        code: "custom",
        message: "Unsupported unit for this marker",
      });
    if (
      l.referenceHigh !== null &&
      l.referenceLow !== null &&
      l.referenceLow >= l.referenceHigh
    )
      ctx.addIssue({
        code: "custom",
        message: "Reference low must be below reference high",
      });
  });
export type Lab = z.infer<typeof labSchema>;
export function canonicalLab(l: Lab) {
  if (l.unitReview?.status === "pending") throw Error("Confirm the source unit before normalizing this laboratory result.");
  let value = l.value,
    unit = l.unit;
  if (
    unit === "mg/dL" &&
    ["ldl", "hdl", "triglycerides", "glucose"].includes(l.marker)
  ) {
    value /=
      l.marker === "triglycerides"
        ? 88.57
        : l.marker === "glucose"
          ? 18.018
          : 38.67;
    unit = "mmol/L";
  }
  if (l.marker === "apob" && unit === "mg/dL") {
    value /= 100;
    unit = "g/L";
  }
  if (l.marker === "b12" && unit === "pg/mL") {
    value *= 0.7378;
    unit = "pmol/L";
  }
  if (l.marker === "vitamin_d" && unit === "ng/mL") {
    value *= 2.5;
    unit = "nmol/L";
  }
  if (l.marker === "folate" && unit === "ng/mL") {
    value *= 2.266;
    unit = "nmol/L";
  }
  if (l.marker === "ferritin" && unit === "ng/mL") unit = "ug/L";
  if (l.marker === "hba1c" && unit === "mmol/mol") {
    value = value * 0.09148 + 2.152;
    unit = "%";
  }
  return { value, unit };
}
export function labFlag(l: Lab) {
  if (l.unitReview?.status === "pending") return "unit unconfirmed";
  return l.referenceHigh !== null && l.value > l.referenceHigh
    ? "above reported range"
    : l.referenceLow !== null && l.value < l.referenceLow
      ? "below reported range"
      : l.referenceHigh === null || l.referenceLow === null
        ? "range incomplete"
        : "within reported range";
}
export const metaboliteSchema = z
  .object({
    name: z.enum([
      "butyrate",
      "acetate",
      "propionate",
      "lactate",
      "urolithin_a",
      "isoalloLCA",
    ]),
    value: z.number().finite().nonnegative(),
    unit: shortText,
    specimen: z.enum(["stool", "blood", "urine"]),
    measuredAt: isoDate,
    laboratory: shortText,
    method: shortText,
  })
  .strict();
export const contextSchema = z
  .object({
    goals: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
    medications: z.array(shortText).max(40).default([]),
    currentSupplements: z.array(shortText).max(40).default([]),
    conditions: z.array(shortText).max(30).default([]),
    allergies: z.array(shortText).max(30).default([]),
    pregnancy: z.enum(["no", "yes", "unknown"]).default("unknown"),
    ageGroup: z.enum(["adult", "under18", "unknown"]).default("unknown"),
    safetyReviewed: z.boolean().default(false),
  })
  .strict();
export const checkinSchema = z
  .object({
    measuredAt: isoDate,
    weightKg: z.number().positive().max(500).nullable(),
    bodyFatPercent: z.number().positive().max(75).nullable(),
    waistCm: z.number().positive().max(300).nullable(),
    bloating: z.number().int().min(0).max(10).nullable(),
    energy: z.number().int().min(0).max(10).nullable(),
    adherencePercent: z.number().min(0).max(100).nullable(),
    planId: z.string().max(100).nullable(),
    notes: z.string().max(2000).default(""),
  })
  .strict()
  .refine(
    (c) =>
      [
        c.weightKg,
        c.bodyFatPercent,
        c.waistCm,
        c.bloating,
        c.energy,
        c.adherencePercent,
      ].some((v) => v !== null),
    "Record at least one observation",
  );
export const precisionEntrySchema = z.discriminatedUnion("kind", [
  z
    .object({ kind: z.literal("genetics"), payload: geneticsPayloadSchema })
    .strict(),
  z.object({ kind: z.literal("lab"), payload: labSchema }).strict(),
  z
    .object({ kind: z.literal("metabolite"), payload: metaboliteSchema })
    .strict(),
  z.object({ kind: z.literal("checkin"), payload: checkinSchema }).strict(),
]);
export type PrecisionEntry = z.infer<typeof precisionEntrySchema>;
export type PrecisionContext = z.infer<typeof contextSchema>;
export type PrecisionRecord = {
  id: string;
  kind: string;
  payload: unknown;
  createdAt: Date | string;
};
export type TaxonReport = {
  id: string;
  date: string;
  taxa: { name: string; abundance: number }[];
  predictions: { name: string; value: number | null }[];
};

export const precisionFoods = [
  { id:"barley",name:"Barley",tags:["gluten"],cardio:true,folate:false,nutrients:["Fiber, including beta-glucan","Whole-grain carbohydrate"],food:"barley" },
  {
    id: "oats",
    name: "Rolled oats",
    tags: ["gluten"],
    cardio: true,
    folate: false,
    nutrients: ["Fiber, including beta-glucan", "Whole-grain carbohydrate"],
    food: "oats",
  },
  {
    id: "lentils",
    name: "Lentils",
    tags: ["legumes"],
    cardio: true,
    folate: true,
    nutrients: ["Folate", "Fiber", "Plant protein"],
    food: "lentils",
  },
  {
    id: "chickpeas",
    name: "Chickpeas",
    tags: ["legumes"],
    cardio: true,
    folate: true,
    nutrients: ["Folate", "Fiber", "Plant protein"],
    food: "chickpeas",
  },
  {
    id: "broccoli",
    name: "Broccoli",
    tags: [],
    cardio: true,
    folate: true,
    nutrients: ["Folate", "Vitamin C", "Fiber"],
    food: "vegetables",
  },
  {
    id: "walnuts",
    name: "Walnuts",
    tags: ["nuts"],
    cardio: true,
    folate: false,
    nutrients: ["Unsaturated fats", "ALA", "Fiber"],
    food: "walnuts",
  },
  {
    id: "potato",
    name: "Cooked and safely cooled potato",
    tags: [],
    cardio: false,
    folate: false,
    nutrients: [
      "Carbohydrate",
      "Potassium",
      "Preparation-dependent resistant starch",
    ],
    food: "potato",
  },
  {
    id: "yogurt",
    name: "Plain live-culture yogurt",
    tags: ["dairy", "fermented"],
    cardio: false,
    folate: false,
    nutrients: ["Protein", "Calcium", "Variable lactose"],
    food: "yogurt",
  },
];
export function buildPrecisionReport(
  records: PrecisionRecord[],
  context: PrecisionContext,
  prefs: DietaryPreferences,
  report: TaxonReport | null,
  now = Date.now(),
) {
  const entries = records.map((r) => ({
    record: r,
    parsed: precisionEntrySchema.safeParse({
      kind: r.kind,
      payload: r.payload,
    }),
  }));
  const allLabs = entries
    .flatMap((e) =>
      e.parsed.success && e.parsed.data.kind === "lab"
        ? [{ ...e.parsed.data.payload, id: e.record.id }]
        : [],
    )
    .sort((a, b) => +new Date(b.measuredAt) - +new Date(a.measuredAt));
  const superseded = new Set(allLabs.flatMap(l => l.unitReview?.supersedes ? [l.unitReview.supersedes] : []));
  const pendingLabs = allLabs.filter(l => l.unitReview?.status === "pending" && !superseded.has(l.id));
  const labs = allLabs.filter(l => l.unitReview?.status !== "pending" && !superseded.has(l.id));
  const latest = markerDefinitions.flatMap((m) => {
    const l = labs.find((l) => l.marker === m.id);
    return l
      ? [
          {
            ...l,
            flag: labFlag(l),
            canonical: canonicalLab(l),
            stale: now - +new Date(l.measuredAt) > 180 * 86400000,
          },
        ]
      : [];
  });
  const current = latest.filter((l) => !l.stale);
  const active = (ids: string[], flag: string) =>
    current.filter((l) => ids.includes(l.marker) && l.flag === flag);
  const highLipids = active(
    ["ldl", "apob", "triglycerides"],
    "above reported range",
  );
  const highGlucose = active(["glucose", "hba1c"], "above reported range");
  const lowFolate = active(["folate"], "below reported range");
  const highLiver = active(["alt", "ast", "ggt"], "above reported range");
  const genetics = entries
    .filter((e) => e.parsed.success && e.parsed.data.kind === "genetics")
    .sort(
      (a, b) => +new Date(b.record.createdAt) - +new Date(a.record.createdAt),
    )[0];
  const geneticData =
    genetics?.parsed.success && genetics.parsed.data.kind === "genetics"
      ? genetics.parsed.data.payload
      : null;
  const reviewedCalls =
    geneticData?.provider === "manual"
      ? classifyManualGenetics(geneticData).filter((e) => e.reviewed)
      : (geneticData?.calls || []).filter((c) => {
          const v = variantCatalog.find((v) => v.rsid === c.rsid);
          return (
            v &&
            (c.genotype === "--" ||
              c.genotype.split("").every((a) => v.alleles.includes(a)))
          );
        });
  const findings = variantCatalog.map((v) => {
    const call = reviewedCalls.find((c) => c.rsid === v.rsid);
    return {
      ...v,
      genotype: call?.genotype ?? null,
      status: !call
        ? "not available"
        : call.genotype === "--"
          ? "no call"
          : geneticData?.provider === "manual"
            ? "self-reported call"
            : "reported raw call",
      actionability: {
        rs738409:
          "Review measured liver status; no genotype-specific diet or supplement",
        rs58542926:
          "Consider liver and circulating lipid measurements separately",
        rs1260326:
          "Use paired glucose and triglyceride measurements, not a genetic carbohydrate limit",
        rs1801133:
          "Check diet and measured folate/B12 context; no automatic supplement",
        rs4988235: "Use symptom-led tolerance; no genetic dairy exclusion",
        rs174547:
          "Review dietary fats and actual measurements; no genetic supplement dose",
        rs7903146:
          "Use glucose and HbA1c context; no diagnostic or genotype-specific diet claim",
      }[v.rsid],
    };
  });
  const geneLactase = findings.find((v) => v.rsid === "rs4988235");
  const safetyBlocks: string[] = [];
  if (!context.safetyReviewed)
    safetyBlocks.push(
      "Medication, supplement, allergy and condition history has not been confirmed.",
    );
  if (context.ageGroup !== "adult")
    safetyBlocks.push(
      "Adult nutrition rules require a confirmed adult profile.",
    );
  if (context.pregnancy !== "no")
    safetyBlocks.push("Pregnancy status requires individualized review.");
  if (
    context.conditions.length ||
    context.medications.length ||
    context.currentSupplements.length
  )
    safetyBlocks.push(
      "Recorded conditions, medicines or supplements need clinician/pharmacist review; interaction screening is not comprehensive.",
    );
  const allergyPrefs = {
    ...prefs,
    dislikes: [...prefs.dislikes, ...context.allergies],
  };
  const personalReasons = [...highLipids, ...highGlucose, ...highLiver].map(
    (l) =>
      `${l.marker}: ${l.value} ${l.unit}, ${l.flag} (${l.measuredAt.slice(0, 10)})`,
  );
  const ranked = recipes
    .filter((r) => !preferenceConflicts(r, allergyPrefs).length)
    .map((recipe) => {
      const text = recipe.ingredients.map((i) => i.name).join(" ");
      const reasons: string[] = [],
        matchedRecordIds: string[] = [],
        sourceIds = new Set<string>();
      let priority = 0;
      const add = (
        points: number,
        reason: string,
        ids: string[],
        sources: string[],
      ) => {
        priority += points;
        reasons.push(reason);
        matchedRecordIds.push(...ids);
        sources.forEach((s) => sourceIds.add(s));
      };
      if (
        (highLipids.length || highGlucose.length) &&
        /oat|lentil|chickpea|broccoli|walnut/i.test(text)
      )
        add(
          40,
          "Whole grains, legumes, vegetables or nuts fit a cardiometabolic dietary pattern; exact response is unknown.",
          [...highLipids, ...highGlucose].map((l) => l.id),
          ["heart-guidance"],
        );
      if (lowFolate.length && /lentil|chickpea|broccoli/i.test(text))
        add(
          35,
          "Contains folate-contributing foods; a low laboratory result needs cause and B12 review.",
          lowFolate.map((l) => l.id),
          ["mthfr-guidance"],
        );
      // Genotype education is separate from recommendation priority.
      if (recipe.goals.some((g) => prefs.goals.includes(g)))
        add(10, "Matches your saved microbiome food goals.", [], []);
      for (const fit of goalMealFit([...context.goals, ...prefs.goals], text))
        add(8, fit.reason, [], fit.sourceIds);
      const microbiomePaths = pathways.filter((p) =>
        recipe.pathwayIds.includes(p.id),
      );
      microbiomePaths.forEach((p) =>
        p.sourceIds.forEach((s) => sourceIds.add(s)),
      );
      const observations = (report?.taxa || []).filter((t) =>
        microbiomePaths.some((p) =>
          JSON.stringify(p).toLowerCase().includes(t.name.toLowerCase()),
        ),
      );
      // Taxon presence never adds priority: no validated abundance targets or flux model.
      const tolerance =
        geneLactase?.genotype === "GG" &&
        recipe.ingredients.some((i) => i.tags.includes("dairy"))
          ? "Lactase marker suggests checking lactose tolerance; this does not automatically exclude this meal."
          : null;
      return {
        ...recipe,
        priority,
        reasons,
        matchedRecordIds: Array.from(new Set(matchedRecordIds)),
        sourceIds: Array.from(sourceIds),
        nutrientContributions: [
          /oat|rice/i.test(text) ? "Whole-grain carbohydrate and fiber" : null,
          /lentil|chickpea|broccoli/i.test(text)
            ? "Folate-contributing plant foods"
            : null,
          /chicken|egg|tofu|yogurt|kefir|lentil/i.test(text)
            ? "Protein-contributing ingredients"
            : null,
          /walnut|olive oil|pumpkin/i.test(text)
            ? "Unsaturated-fat-contributing ingredients"
            : null,
        ].filter((s): s is string => !!s),
        reportedTaxa: observations,
        tolerance,
        expectedBenefit:
          "Directionally supported dietary-pattern fit; magnitude and individual response are not estimated.",
      };
    })
    .filter((r) => r.priority > 0)
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  const rankedFoods = precisionFoods
    .filter(
      (f) =>
        !preferenceConflicts(
          {
            id: f.id,
            name: f.name,
            ingredients: [{ name: f.name, grams: 100, tags: f.tags }],
            steps: [],
            minutes: 0,
            goals: [],
            pathwayIds: [],
            rationale: "",
          },
          allergyPrefs,
        ).length,
    )
    .map((food) => {
      const explanation = explainFoods(food.food);
      let priority = 0;
      const reasons: string[] = [],
        matchedRecordIds: string[] = [],
        sourceIds: string[] = [];
      if (food.cardio && (highLipids.length || highGlucose.length)) {
        priority += 40;
        reasons.push(
          "Fits a cardiometabolic dietary pattern in the context of current laboratory flags.",
        );
        matchedRecordIds.push(
          ...[...highLipids, ...highGlucose].map((l) => l.id),
        );
        sourceIds.push("heart-guidance");
      }
      if (food.folate && lowFolate.length) {
        priority += 35;
        reasons.push(
          "Contributes dietary folate; investigate the cause of the low result.",
        );
        matchedRecordIds.push(...lowFolate.map((l) => l.id));
        sourceIds.push("mthfr-guidance");
      }
      // Common MTHFR calls remain educational context; no genotype-only food ranking.
      if (
        explanation.pathways.some(
          (p) =>
            p.molecules.some(
              (m) => prefs.goals.includes("butyrate") && /butyrate/i.test(m),
            ) ||
            (p.id === "fermented-diversity" &&
              prefs.goals.includes("diversity")),
        )
      ) {
        priority += 10;
        reasons.push(
          "Substrate matches a saved microbiome goal; personal metabolite output is unknown.",
        );
      }
      for (const fit of goalMealFit(
        [...context.goals, ...prefs.goals],
        food.name,
      )) {
        priority += 8;
        reasons.push(fit.reason.replace("meal", "food choice"));
        sourceIds.push(...fit.sourceIds);
      }
      sourceIds.push(...explanation.sources.map((s) => s.id));
      return {
        ...food,
        priority,
        reasons,
        matchedRecordIds,
        sourceIds: Array.from(new Set(sourceIds)),
        pathways: explanation.pathways,
        expectedBenefit:
          "Evidence supports a dietary-pattern or mechanistic rationale; individual effect size is unknown.",
        portion:
          "Choose an amount that fits the meal, nutrient needs and tolerance; this engine has no validated personalized dose.",
      };
    })
    .filter((f) => f.priority > 0)
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  const supplements = current
    .filter(
      (l) =>
        ["b12", "vitamin_d", "folate", "ferritin"].includes(l.marker) &&
        l.flag === "below reported range",
    )
    .map((l) => ({
      id: l.marker,
      name: {
        b12: "Vitamin B12 replacement assessment",
        vitamin_d: "Vitamin D replacement assessment",
        folate: "Folate replacement assessment",
        ferritin: "Iron-status assessment before any iron",
      }[l.marker as "b12" | "vitamin_d" | "folate" | "ferritin"],
      reason: `${l.value} ${l.unit} is below this report's reference interval. This is not an independently confirmed deficiency.`,
      recordId: l.id,
      status: safetyBlocks.length
        ? "blocked pending safety review"
        : "clinician review required",
      dose: null,
      checks: [
        ...safetyBlocks,
        ...(l.marker === "folate"
          ? [
              "Review B12 before folate replacement; do not select methylfolate solely from MTHFR.",
            ]
          : []),
        ...(l.marker === "ferritin"
          ? [
              "Review CBC, transferrin saturation, inflammation and the cause of a low result before iron.",
            ]
          : []),
        ...(l.marker === "vitamin_d"
          ? [
              "Review calcium, kidney function, total vitamin D intake and interacting medicines.",
            ]
          : []),
        ...(l.marker === "b12"
          ? [
              "Review cause, symptoms, absorption and confirmatory testing where appropriate.",
            ]
          : []),
      ],
      sources:
        l.marker === "vitamin_d"
          ? ["d-guidance"]
          : l.marker === "b12"
            ? ["b12-guidance"]
            : l.marker === "folate"
              ? ["mthfr-guidance", "b12-guidance"]
              : ["iron-guidance"],
    }));
  const trends = markerDefinitions.flatMap((m) => {
    const series = labs
      .filter((l) => l.marker === m.id)
      .sort((a, b) => +new Date(a.measuredAt) - +new Date(b.measuredAt));
    if (!series.length) return [];
    const first = series[0],
      last = series[series.length - 1];
    const known = (v: string) => !!v.trim() && !/^(unknown|not supplied)$/i.test(v.trim());
    const comparable = series.length > 1 && known(first.laboratory) && known(first.method) &&
      new Set(series.map(l => l.measuredAt)).size === series.length &&
      series.every(l => l.laboratory === first.laboratory && l.method === first.method &&
        l.fasting === first.fasting && canonicalLab(l).unit === canonicalLab(first).unit) &&
      (!["glucose", "triglycerides"].includes(m.id) || first.fasting !== "unknown");
    return [
      {
        marker: m.id,
        name: m.name,
        points: series.map((l) => ({
          id: l.id,
          date: l.measuredAt,
          laboratory: l.laboratory, method: l.method, sourceValue: l.value, sourceUnit: l.unit,
          provenance: l.unitReview ? "User-confirmed source unit" : "User-entered result",
          ...canonicalLab(l),
        })),
        comparable,
        change: comparable
          ? canonicalLab(last).value - canonicalLab(first).value
          : null,
        note: comparable
          ? "Same reported lab, known method and relevant fasting status; change is observational, not proof of dietary causation."
          : "Need separate dates and matching lab, method and relevant fasting conditions before a comparison is shown.",
      },
    ];
  });
  const checkins = entries
    .flatMap((e) =>
      e.parsed.success && e.parsed.data.kind === "checkin"
        ? [{ id: e.record.id, ...e.parsed.data.payload }]
        : [],
    )
    .sort((a, b) => +new Date(b.measuredAt) - +new Date(a.measuredAt));
  return {
    pendingLabs,
    version: PRECISION_VERSION,
    generatedAt: new Date(now).toISOString(),
    context,
    genetics: {
      coverage: `${variantCatalog.length} diet-ranking markers and ${genotypeAnnotations.length} markers with educational explanations; not whole-genome interpretation`,
      import: geneticData
        ? {
            id: genetics!.record.id,
            collectedAt: geneticData.collectedAt,
            scannedVariants:
              geneticData.provider === "manual"
                ? geneticData.entries.length
                : geneticData.scannedVariants,
            build:
              geneticData.provider === "manual"
                ? "Not supplied (manual entry)"
                : geneticData.build,
            provider: geneticData.provider,
          }
        : null,
      manual:
        geneticData?.provider === "manual"
          ? {
              source: geneticData.source,
              strand: geneticData.strand,
              entries: classifyManualGenetics(geneticData),
            }
          : null,
      explanations: explainGenotypes(
        geneticData?.provider === "manual"
          ? geneticData.entries
          : geneticData?.calls || [],
        geneticData?.provider === "23andMe" ||
          geneticData?.strand === "forward",
      ),
      findings,
    },
    labs: latest,
    labHistory: labs,
    microbiome: {
      report,
      geneticPathwayLinks: findings
        .filter(
          (f) =>
            f.status === "reported raw call" ||
            f.status === "self-reported call",
        )
        .map((f) => ({
          rsid: f.rsid,
          pathway: f.pathway,
          evidence:
            "research context; no validated personal interaction estimate",
          link:
            f.rsid === "rs4988235"
              ? "Host lactose digestion can change substrate delivery to colonic fermenters. This report cannot identify a causal organism or calculate an individual's gas or SCFA response."
              : f.rsid === "rs1801133"
                ? "Host folate metabolism and microbial nutrient transformations share a broad nutrient context. No microbial folate contribution, absorption or genotype-specific food effect is inferred."
                : "No reviewed direct genotype–microbe interaction is established for this locus in the current catalogue. Microbial mechanisms are shown separately from host genetic associations.",
          measured: false,
        })),
      measuredMetabolites: entries.flatMap((e) =>
        e.parsed.success && e.parsed.data.kind === "metabolite"
          ? [
              {
                id: e.record.id,
                ...e.parsed.data.payload,
                provenance: "user-entered laboratory measurement; unverified",
              },
            ]
          : [],
      ),
      note: "Reported taxa, model estimates and entered metabolite measurements are separate. Stool concentrations are not systemic exposure or production flux. No genotype-to-microbe causal interaction is established by this engine.",
    },
    foods: context.ageGroup === "adult" ? rankedFoods : [],
    recommendations: context.ageGroup === "adult" ? ranked : [],
    supplements: context.ageGroup === "adult" ? supplements : [],
    safetyBlocks,
    personalReasons,
    reviewFlags: [
      ...highLiver.map(
        (l) =>
          `${l.marker.toUpperCase()} above the supplied range: arrange clinical review; no liver-detox supplement is inferred.`,
      ),
      ...current
        .filter(
          (l) =>
            l.flag.includes("reported range") && !l.flag.startsWith("within"),
        )
        .map(
          (l) =>
            `${l.marker}: ${l.flag}; a laboratory reference interval is not a personal treatment target.`,
        ),
    ],
    goals: Array.from(
      new Set([
        ...context.goals,
        ...prefs.goals.filter(
          (g) => !["butyrate", "diversity", "athletic"].includes(g),
        ),
      ]),
    ).map(goalGuidance),
    trends,
    checkins,
    plans: records.filter((r) => r.kind === "plan"),
    sources: [
      ...precisionSources,
      ...goalSources,
      ...evidenceSources.map((s) => ({
        id: s.id,
        title: s.title,
        url: s.url,
        type: s.design,
        limitation: s.limitation,
      })),
    ],
    rankingNote:
      "Priority is a transparent rule score, not a probability, clinical benefit estimate or validated precision model. Recent laboratory flags contribute more than common variants. Unknown goals are retained without inventing recommendations.",
  };
}
export type PrecisionReport = ReturnType<typeof buildPrecisionReport>;
