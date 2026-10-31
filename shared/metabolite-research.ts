import { z } from "zod";
import type { WeeklyPlan } from "./weekly-planner";
import type { TaxonReport } from "./precision-nutrition";
import { snapshotFoods } from "./food-snapshot";

export const RESEARCH_VERSION = "bloom-scfa-research-v1";
export const researchMetabolites = [
  "acetate",
  "propionate",
  "butyrate",
] as const;
export const researchBoundary =
  "Experimental microbial net secretion flux under model assumptions; not measured production, stool or blood concentration, absorbed dose, or a health benefit. Results do not change meal-plan ranking or nutrient targets.";

// A diet manifest, deliberately NOT a growth medium: total fibre is not converted
// to fermentable carbon, and household shopping weights are not personal intake.
export function researchScenario(plan: WeeklyPlan, report: TaxonReport | null) {
  return {
    version: RESEARCH_VERSION,
    metabolites: [...researchMetabolites],
    microbiome: report
      ? {
          collectedAt: report.date,
          inputType: "reported-taxonomic-abundance" as const,
          functionalActivityVerified: false as const,
          taxa: report.taxa,
        }
      : null,
    days: plan.days.map((day) => {
      const foods = new Map<string, number>();
      for (const meal of day.meals)
        for (const i of meal.recipe.foodIngredients)
          foods.set(
            i.foodId,
            (foods.get(i.foodId) || 0) + i.grams * meal.portion,
          );
      return {
        day: day.day,
        foods: Array.from(foods, ([foodId, grams]) => {
          const f = snapshotFoods.find((f) => f.id === foodId)!;
          return {
            foodId,
            grams,
            preparation: f.description,
            fdcId: f.fdcId,
            sourceUrl: f.url,
          };
        }),
      };
    }),
    assumptions: [
      "Intended edible intake per person, not verified consumption. Household servings do not multiply the input.",
      "Reported taxa are unverified functional potential; absence and strain activity cannot be inferred.",
      "A separately curated, versioned food-to-colon-substrate mapping and microbial model database are required.",
      "Host genetics, laboratory results, names and account identifiers are excluded from the service request.",
    ],
  };
}
export type ResearchScenario = ReturnType<typeof researchScenario>;
const text = z.string().trim().min(1).max(1000);
const flux = z.number().finite();
const estimateSchema = z
  .object({
    day: z.number().int().min(1).max(7),
    metabolite: z.enum(researchMetabolites),
    value: flux,
    lower: flux,
    upper: flux,
  })
  .strict()
  .refine(
    (v) => v.lower <= v.value && v.value <= v.upper,
    "Invalid sensitivity range",
  );
export const researchResultSchema = z
  .object({
    version: z.literal(RESEARCH_VERSION),
    inputHash: z.string().regex(/^[a-f0-9]{64}$/),
    status: z.enum(["blocked", "simulated"]),
    blockers: z.array(text).max(30),
    model: z
      .object({
        engine: text,
        version: text,
        databaseVersion: text,
        substrateMappingVersion: text,
        solver: text,
        // These are sensitivity bounds, never a claimed clinical confidence interval.
        uncertaintyMethod: z.enum(["parameter-sensitivity", "model-ensemble"]),
        assumptions: z.array(text).min(1).max(30),
        citations: z.array(z.string().url().max(1000)).min(1).max(20),
      })
      .strict()
      .nullable(),
    coverage: z
      .object({
        matchedAbundanceFraction: z.number().finite().min(0).max(1),
        unmappedTaxa: z.array(text).max(5000),
        unmappedFoodIds: z.array(text).max(100),
      })
      .strict(),
    units: z.literal("mmol/gDW/h"),
    estimates: z.array(estimateSchema).max(21),
  })
  .strict();
export type ResearchResult = z.infer<typeof researchResultSchema>;
export function validateResearchResult(
  raw: unknown,
  hash: string,
  days: number[],
): ResearchResult {
  const r = researchResultSchema.parse(raw);
  if (r.inputHash !== hash) throw Error("RESEARCH_INPUT_MISMATCH");
  const keys = r.estimates.map((e) => `${e.day}:${e.metabolite}`);
  if (
    new Set(keys).size !== keys.length ||
    r.estimates.some((e) => !days.includes(e.day))
  )
    throw Error("RESEARCH_INVALID_ESTIMATES");
  if (r.status === "blocked") {
    if (!r.blockers.length || r.estimates.length)
      throw Error("RESEARCH_INVALID_BLOCK");
  } else if (
    !r.model ||
    r.blockers.length ||
    r.coverage.unmappedFoodIds.length ||
    r.coverage.matchedAbundanceFraction <= 0 ||
    days.some((d) =>
      researchMetabolites.some((m) => !keys.includes(`${d}:${m}`)),
    )
  ) {
    throw Error("RESEARCH_INCOMPLETE_SIMULATION");
  }
  return r;
}
