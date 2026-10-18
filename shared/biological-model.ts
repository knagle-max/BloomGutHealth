import { checkedFoodPreferences } from "./weekly-planner";
import { z } from "zod";
import { evidenceNetwork } from "./evidence-network";
import {
  precisionFoods,
  markerDefinitions,
  type PrecisionReport,
} from "./precision-nutrition";
import {
  explainFoods,
  preferenceConflicts,
  type DietaryPreferences,
} from "./meal-intelligence";
export const BIOLOGY_VERSION = "biology-2026-10-18.1";
export const knowledgeEntitySchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.string(),
  summary: z.string(),
  metadata: z.record(z.unknown()),
});
export const knowledgeSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  design: z.string(),
  population: z.string(),
  limitation: z.string(),
});
export const knowledgeRelationshipSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  claim: z.string(),
  evidence: z.enum([
    "human-intervention",
    "association",
    "mechanistic",
    "composition",
    "guidance",
  ]),
  confidence: z.enum([
    "established-pattern",
    "limited-human",
    "mechanism-only",
    "reference",
  ]),
  humanRelevance: z.string(),
  direction: z.string(),
  context: z.string(),
  limitation: z.string(),
  contradictionStatus: z.enum([
    "limitations-recorded",
    "not-systematically-reviewed",
  ]),
  contradictions: z.array(z.string()),
  rule: z.enum([
    "context-only",
    "microbiome-food",
    "cardio-food",
    "folate-food",
  ]),
  sourceIds: z.array(z.string()).min(1),
});
export const biologicalRegistrySchema = z.object({
  version: z.string(),
  summary: z.string(),
  entities: z.array(knowledgeEntitySchema),
  relationships: z.array(knowledgeRelationshipSchema),
  sources: z.array(knowledgeSourceSchema),
});
export type BiologicalRegistry = z.infer<typeof biologicalRegistrySchema>;
export type KnowledgeRelationship = z.infer<typeof knowledgeRelationshipSchema>;

// Versioned public reference data. Personal records remain in their encrypted stores.
export function buildBiologicalRegistry(): BiologicalRegistry {
  const legacy = evidenceNetwork();
  const sources = legacy.sources.map((s) => ({
    id: s.id,
    title: s.title,
    url: s.url,
    design: "design" in s ? s.design : s.type,
    population:
      "Population and applicability must be checked in the linked source; not assumed to match you.",
    limitation: s.limitation,
  }));
  sources.push(
    {
      id: "oat-viscosity-trial",
      title: "Wolever et al. 2010 — oat beta-glucan viscosity and LDL",
      url: "https://pubmed.ncbi.nlm.nih.gov/20660224/",
      design: "Four-week randomized cereal intervention",
      population: "Adults with raised LDL; 367 enrolled, 345 completed.",
      limitation:
        "Processing and beta-glucan properties affected response. A bowl's total fiber does not establish its active beta-glucan dose or your response.",
    },
    {
      id: "usda-composition",
      title: "USDA — Food and Nutrient Database for Dietary Studies",
      url: "https://www.ars.usda.gov/nea/bhnrc/fsrg",
      design: "Food composition reference",
      population:
        "Generic food composition, not a clinical trial or your package label.",
      limitation:
        "Preparation and products vary. Qualitative food components do not establish the amount in an unspecified serving.",
    },
    {
      id: "microbiome-consensus",
      title: "International consensus on microbiome testing (2025 issue)",
      url: "https://pubmed.ncbi.nlm.nih.gov/39647502/",
      design: "International expert consensus",
      population: "Clinical microbiome-testing practice.",
      limitation:
        "Routine consumer microbiome testing has limited demonstrated clinical utility; a reported organism is not a validated treatment target.",
    },
  );
  const entities = legacy.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    kind: n.kind,
    summary:
      n.kind === "organism"
        ? "A research-linked organism or community. Presence alone does not tell us its activity or whether it helps you."
        : n.kind === "molecule"
          ? "A substance made or transformed in biology. Its presence, amount and effect are separate questions."
          : "A research relationship to explore; personal activity is not measured by this diagram.",
    metadata: {},
  }));
  const relationships: KnowledgeRelationship[] = legacy.edges.map((e) => ({
    id: e.id,
    from: e.from,
    to: e.to,
    claim: e.relationship,
    evidence: e.evidence === "association" ? "association" : "mechanistic",
    confidence:
      e.evidence === "association" ? "limited-human" : "mechanism-only",
    humanRelevance:
      "Research context. Mechanisms and associations do not establish a personal clinical effect.",
    direction: "Context-dependent",
    context:
      "Species, strain, preparation, dose, study population and baseline health can change applicability.",
    limitation: e.limitation,
    contradictionStatus: "not-systematically-reviewed",
    contradictions: [],
    rule: "context-only",
    sourceIds: e.sourceIds,
  }));
  const add = (
    id: string,
    label: string,
    kind: string,
    summary: string,
    metadata: Record<string, unknown> = {},
  ) => {
    if (!entities.some((n) => n.id === id))
      entities.push({ id, label, kind, summary, metadata });
  };
  const edge = (
    value: Partial<KnowledgeRelationship> &
      Pick<KnowledgeRelationship, "id" | "from" | "to" | "claim" | "sourceIds">,
  ) =>
    relationships.push({
      evidence: "mechanistic",
      confidence: "mechanism-only",
      humanRelevance:
        "A plausible pathway is not a validated prediction of personal benefit.",
      direction: "Context-dependent",
      context:
        "Amount, preparation, tolerance and the rest of the diet matter.",
      limitation:
        "No individual effect size, microbial abundance or metabolite concentration is predicted.",
      contradictionStatus: "not-systematically-reviewed",
      contradictions: [],
      rule: "context-only",
      ...value,
    });
  for (const food of precisionFoods) {
    const id = "food:" + food.id;
    add(
      id,
      food.name,
      "food",
      "See its food components, relevant research and whether your saved context actually changes its priority.",
      {
        precisionFoodId: food.id,
        tags: food.tags,
        nutrients: food.nutrients,
        term: food.food,
      },
    );
    for (const nutrient of food.nutrients) {
      const n = "nutrient:" + nutrient.toLowerCase();
      add(
        n,
        nutrient,
        "nutrient",
        "A food component; the amount depends on the actual product, serving and preparation.",
      );
      edge({
        id: id + ":" + n,
        from: id,
        to: n,
        claim:
          "Can contribute this food component; quantity must come from a reviewed serving.",
        evidence: "composition",
        confidence: "reference",
        humanRelevance: "Composition reference, not a health outcome.",
        sourceIds: ["usda-composition"],
        rule:
          food.folate && /folate/i.test(nutrient)
            ? "folate-food"
            : "context-only",
      });
    }
    for (const pathway of explainFoods(food.food).pathways)
      edge({
        id: id + ":" + pathway.id,
        from: id,
        to: pathway.id,
        claim:
          "Can supply food substrates considered in this pathway. This is a food/preparation inference, not measured fermentation.",
        sourceIds: pathway.sourceIds,
        rule: "microbiome-food",
      });
    if (food.cardio) {
      add(
        "outcome:cardiometabolic",
        "Cardiometabolic dietary pattern",
        "health-outcome",
        "A food pattern relevant to heart and metabolic health; it does not diagnose or treat a condition by itself.",
      );
      edge({
        id: id + ":cardio",
        from: id,
        to: "outcome:cardiometabolic",
        claim:
          "Fits a fiber-rich or unsaturated-fat dietary pattern considered alongside current lipid/glucose results.",
        evidence: "guidance",
        confidence: "established-pattern",
        humanRelevance:
          "Dietary-pattern guidance; no personalized effect size.",
        sourceIds: ["heart-guidance"],
        rule: "cardio-food",
      });
    }
  }
  add(
    "nutrient:beta-glucan",
    "Beta-glucan",
    "nutrient",
    "A soluble fiber in oats and barley. Its viscosity depends on processing and molecular properties.",
  );
  add(
    "process:viscous-fiber",
    "Viscous fiber in digestion",
    "biological-process",
    "Thicker intestinal contents can affect cholesterol and bile-acid handling. This host pathway is separate from fermentation.",
  );
  add(
    "intervention:oat-foods",
    "Regular oat-containing foods",
    "intervention",
    "A possible routine to discuss and monitor, not a required supplement or a fixed personal dose.",
  );
  edge({
    id: "oats:beta-glucan",
    from: "food:oats",
    to: "nutrient:beta-glucan",
    claim:
      "Oats can contribute beta-glucan. Total fiber is not the same as beta-glucan content.",
    evidence: "composition",
    confidence: "reference",
    sourceIds: ["usda-composition", "oat-viscosity-trial"],
  });
  edge({
    id: "barley:beta-glucan",
    from: "food:barley",
    to: "nutrient:beta-glucan",
    claim:
      "Barley can contribute beta-glucan. Amount and processing need to be checked separately.",
    evidence: "composition",
    confidence: "reference",
    sourceIds: ["usda-composition"],
  });
  edge({
    id: "beta-glucan:viscosity",
    from: "nutrient:beta-glucan",
    to: "process:viscous-fiber",
    claim:
      "Beta-glucan's physical properties help explain why different preparations can have different LDL effects.",
    sourceIds: ["oat-viscosity-trial"],
    contradictionStatus: "limitations-recorded",
    contradictions: [
      "Lower-molecular-weight beta-glucan did not have the same significant LDL effect in this trial; food processing matters.",
    ],
  });
  for (const marker of markerDefinitions) {
    add(
      "biomarker:" + marker.id,
      marker.name,
      "biomarker",
      "A dated laboratory result. Reference ranges, units, method and clinical context matter.",
      { marker: marker.id },
    );
  }
  edge({
    id: "viscosity:ldl",
    from: "process:viscous-fiber",
    to: "biomarker:ldl",
    claim:
      "Some tested oat beta-glucan preparations reduced LDL in a randomized trial. The effect of your serving is not predicted.",
    evidence: "human-intervention",
    confidence: "limited-human",
    humanRelevance:
      "A short trial in adults with raised LDL; not a validated personal prescription.",
    direction: "Lower LDL in some tested groups",
    sourceIds: ["oat-viscosity-trial"],
    contradictionStatus: "limitations-recorded",
    contradictions: [
      "Response depended on beta-glucan molecular properties; not every preparation had the same result.",
    ],
  });
  edge({
    id: "oat-routine:food",
    from: "intervention:oat-foods",
    to: "food:oats",
    claim:
      "A routine can be recorded with adherence and digestive tolerance, then reviewed alongside appropriate dated laboratory follow-up.",
    evidence: "guidance",
    confidence: "reference",
    sourceIds: ["heart-guidance"],
  });
  return biologicalRegistrySchema.parse({
    version: BIOLOGY_VERSION,
    summary:
      "Versioned biological relationships. References describe populations or mechanisms; your measurements and recommendation effects are shown separately. No digital-twin prediction is implemented.",
    entities,
    relationships,
    sources,
  });
}
export function validateRegistry(registry: BiologicalRegistry) {
  const ids = new Set(registry.entities.map((n) => n.id)),
    sources = new Set(registry.sources.map((s) => s.id));
  if (
    ids.size !== registry.entities.length ||
    sources.size !== registry.sources.length ||
    new Set(registry.relationships.map((r) => r.id)).size !==
      registry.relationships.length
  )
    throw Error("Duplicate registry identifiers");
  for (const r of registry.relationships)
    if (
      !ids.has(r.from) ||
      !ids.has(r.to) ||
      r.sourceIds.some((s) => !sources.has(s))
    )
      throw Error("Unresolved registry reference");
  return registry;
}
export function assessFood(
  registry: BiologicalRegistry,
  id: string,
  report: PrecisionReport,
  prefs: DietaryPreferences,
) {
  const entity = registry.entities.find(
    (n) => n.id === id && n.kind === "food",
  );
  if (!entity) return null;
  const food = precisionFoods.find(
    (f) => f.id === entity.metadata.precisionFoodId,
  );
  if (!food) return null;
  const checked = checkedFoodPreferences(prefs, report.context.allergies);
  const clinicalReview = report.context.conditions.some((c) =>
    /kidney|renal|dialysis|eating disorder|anorexia|diabetes|heart failure|pku/i.test(
      c,
    ),
  );
  const conflicts = preferenceConflicts(
    {
      id: food.id,
      name: food.name,
      ingredients: [{ name: food.name, grams: 100, tags: food.tags }],
      steps: [],
      minutes: 0,
      goals: [],
      pathwayIds: [],
      rationale: "",
    },
    checked.preferences,
  );
  const reviewed =
    report.context.ageGroup === "adult" &&
    report.context.pregnancy === "no" &&
    report.context.safetyReviewed &&
    !clinicalReview &&
    !checked.unknownAllergies.length;
  const ranked = report.foods.find((f) => f.id === food.id),
    active = reviewed && !conflicts.length && !!ranked;
  const reasons = active ? ranked!.reasons : [];
  const relationshipEffects = registry.relationships.map((r) => {
    let affects = false;
    if (active && r.from === id) {
      if (r.rule === "cardio-food")
        affects = reasons.some((v) => v.startsWith("Fits a cardiometabolic"));
      if (r.rule === "folate-food")
        affects = reasons.some((v) => /dietary folate|Secondary MTHFR/.test(v));
      if (r.rule === "microbiome-food")
        affects =
          reasons.some((v) => v.startsWith("Substrate matches")) &&
          ranked!.pathways.some(
            (p) =>
              p.id === r.to &&
              (p.molecules.some(
                (m) => prefs.goals.includes("butyrate") && /butyrate/i.test(m),
              ) ||
                (p.id === "fermented-diversity" &&
                  prefs.goals.includes("diversity"))),
          );
    }
    return {
      id: r.id,
      affectsRecommendation: affects,
      reason: affects
        ? "This connection contributes to the existing food-priority rule for your reviewed context."
        : "Educational context only; this connection does not independently change your food priority.",
    };
  });
  return {
    version: registry.version,
    interpretation: {
      claimKind: "inferred-association",
      observationProvenance: "User-entered records; not independently verified",
      scientificReviewStatus: "pending-independent-review",
      personalEffectsPredicted: false,
    },
    food: entity,
    decision: conflicts.length
      ? "Does not fit your saved restrictions"
      : !reviewed
        ? "Review your health context, clinical needs and allergies to personalize"
        : ranked
          ? "Matches your saved priorities"
          : "General food context",
    conflicts,
    reasons,
    qualitativeNutrients: food.nutrients,
    observations: {
      labs: report.labs
        .filter((l) => ranked?.matchedRecordIds.includes(l.id))
        .map((l) => ({
          marker: l.marker,
          value: l.value,
          unit: l.unit,
          date: l.measuredAt,
          flag: l.flag,
          provenance:
            "User-entered laboratory report; not independently verified",
        })),
      genetics: report.genetics.findings
        .filter((f) => food.folate && f.rsid === "rs1801133" && f.genotype)
        .map((f) => ({
          gene: f.gene,
          rsid: f.rsid,
          genotype: f.genotype,
          status: f.status,
          note: reasons.some((r) => r.includes("Secondary MTHFR"))
            ? "Secondary folate context used; not a deficiency or supplement requirement."
            : "Recorded for context; not changing this recommendation.",
        })),
    },
    relationshipEffects,
    limits: [
      ...report.safetyBlocks,
      ...(checked.unknownAllergies.length
        ? [
            "Unrecognized allergies need ingredient review: " +
              checked.unknownAllergies.join(", "),
          ]
        : []),
      "Qualitative food components do not establish serving amounts. Use the journal for reviewed composition values.",
      "Reported microbes and pathway scores do not establish activity, personal metabolite output or a guaranteed dietary response.",
      "An unreviewed or unlisted connection means unknown, not safe or ineffective.",
    ],
    tracking: [
      "Record actual portions and adherence.",
      "Track digestive tolerance and other changes, such as medicines, exercise and illness.",
      "Review comparable dated laboratory results with your clinician; a before/after change does not prove cause.",
    ],
  };
}
