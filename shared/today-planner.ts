import {z} from 'zod';
import {
  nutrientDefinitions,
  type DietaryPreferences,
} from "./meal-intelligence";
import { mealNutritionSummary } from "./nutrition-summary";
import {
  eligiblePlanningRecipes,
  plannedMealChoiceSchema,
  recipeNutrients,
  type WeeklyRequest,
} from "./weekly-planner";
import { goalMealFit } from "./goal-guidance";
import type { PrecisionReport } from "./precision-nutrition";
export const todayMealSlots=['breakfast','lunch','dinner','snack'] as const;
export const todayMealChoicesSchema=z.partialRecord(z.enum(todayMealSlots),plannedMealChoiceSchema).prefault({});
export type TodayMealChoices=z.infer<typeof todayMealChoicesSchema>;
export class TodayMealChoiceError extends Error{constructor(message:string){super(message);this.name='TodayMealChoiceError';}}
const mealTypeForSlot=(slot:string)=>slot==='breakfast'?'breakfast':slot==='snack'?'snack':'main';
const aliases: Record<string, string> = {
  protein_g: "protein",
  carbohydrates_total_g: "carbs",
  fat_total_g: "fat",
  fiber_g: "fiber",
  sugar_g: "sugar",
  sodium_mg: "sodium",
  potassium_mg: "potassium",
  cholesterol_mg: "cholesterol",
};
export function remainingSlots(
  hour: number,
  meals: Array<{ mealType?: string | null }>,
) {
  const eaten = new Set(meals.map((m) => m.mealType));
  // Clock windows only suppress slots; they never assume that an unlogged meal was eaten.
  return todayMealSlots.filter(
    (s) =>
      s === "snack" ||
      (!eaten.has(s) &&
        (s === "breakfast" ? hour < 11 : s === "lunch" ? hour < 16 : true)),
  );
}
export function buildTodayPlan(
  meals: any[],
  hour: number,
  prefs: DietaryPreferences,
  report: PrecisionReport,
  request: WeeklyRequest,
  choices: TodayMealChoices = {},
) {
  const requestedChoices=todayMealChoicesSchema.parse(choices);
  const summary = mealNutritionSummary(meals),
    slots = remainingSlots(hour, meals);
  const consumed = Object.fromEntries(
    nutrientDefinitions.map(([key]) => [
      key,
      summary.totals[aliases[key] || key],
    ]),
  ) as Record<string, number | null>;
  const coverage = Object.fromEntries(
    nutrientDefinitions.map(([key]) => [
      key,
      summary.coverage[aliases[key] || key],
    ]),
  );
  const constraints: Record<
    string,
    { min: number | null; max: number | null }
  > = {
    calories: {
      min: request.targets.calories * 0.9,
      max: request.targets.calories * 1.1,
    },
    protein_g: { min: request.targets.protein, max: null },
    fiber_g: { min: request.targets.fiber, max: request.targets.fiberMaximum },
    sodium_mg: { min: null, max: request.targets.sodium },
    fat_saturated_g: { min: null, max: request.targets.saturatedFat },
    ...request.nutrientTargets,
  };
  const menu = eligiblePlanningRecipes(
    prefs,
    report.context.allergies,
    request.customRecipes,
  );
  const blocked =
    report.context.ageGroup !== "adult" ||
    report.context.pregnancy !== "no" ||
    !report.context.safetyReviewed ||
    menu.unknownAllergies.length > 0 ||
    report.context.conditions.some((c) =>
      /kidney|renal|dialysis|eating disorder|anorexia|phenylketonuria|pku/i.test(
        c,
      ),
    );
  if(!blocked)for(const [slot,choice]of Object.entries(requestedChoices)){
    if(!slots.includes(slot as typeof todayMealSlots[number]))throw new TodayMealChoiceError('This meal slot is no longer remaining. Clear meal choices and check today again.');
    const recipe=menu.recipes.find(recipe=>recipe.id===choice.recipeId);
    if(!recipe||recipe.mealType!==mealTypeForSlot(slot))throw new TodayMealChoiceError('This meal is no longer eligible for the selected slot. Clear choices and review current food preferences.');
  }
  const warnings = [
    ...(menu.unknownAllergies.length
      ? [
          `Unrecognized allergies need ingredient review: ${menu.unknownAllergies.join(", ")}.`,
        ]
      : []),
    ...(summary.isPartial
      ? [
          "Some logged nutrients are missing. Remaining amounts and limits are provisional; known intake is retained.",
        ]
      : []),
    ...(blocked
      ? [
          report.context.ageGroup === "under18"
            ? "Adult nutrition planning is unavailable for a profile under 18. Review the recorded Profile and health context."
            : "Confirm adult health context, pregnancy status, safety review and recognized allergies in Precision nutrition before calculating a personalized plan.",
        ]
      : []),
    ...(report.safetyBlocks || []),
  ];
  const total = (add: Record<string, number | null>) =>
    Object.fromEntries(
      nutrientDefinitions.map(([key]) => [
        key,
        consumed[key] === null || add[key] === null
          ? null
          : consumed[key]! + (add[key] || 0),
      ]),
    );
  const objective = (added: Record<string, number | null>) =>
    Object.entries(constraints).reduce((sum, [key, t]) => {
      const v = (consumed[key] ?? 0) + (added[key] ?? 0),
        scale = t.min || t.max || 1;
      return (
        sum +
        (t.min === null ? 0 : Math.max(0, t.min - v) / scale) *
          (key === "protein_g" ? 3 : key === "calories" ? 2 : 1)
      );
    }, 0);
  type Picked = {
    slot: string;
    recipe: (typeof menu.recipes)[number];
    portion: number;
    nutrients: Record<string, number | null>;
    reasons: string[];
  };
  let states: {
    meals: Picked[];
    added: Record<string, number | null>;
    score: number;
  }[] = [
    {
      meals: [],
      added: Object.fromEntries(nutrientDefinitions.map(([k]) => [k, 0])),
      score: objective({}),
    },
  ];
  const excludedByKnownLimit = new Set<string>();
  const candidates = menu.recipes.flatMap((recipe) =>
    [0.5, 0.75, 1, 1.25, 1.5].map((portion) => ({
      recipe,
      portion,
      n: recipeNutrients(recipe, portion),
    })),
  );
  // Reserve explicit meals first: automatic choices must not consume their
  // budget. Final presentation is restored to chronological slot order below.
  if (!blocked)
    for (const slot of [...slots.filter(slot=>requestedChoices[slot]),...slots.filter(slot=>!requestedChoices[slot])]) {
      const choice=requestedChoices[slot];
      const next = choice?[]:states.map((s) => ({ ...s })); // Leaving a slot empty is preferable to violating a known limit.
      const options = (choice?[{recipe:menu.recipes.find(recipe=>recipe.id===choice.recipeId)!,portion:choice.portion,n:recipeNutrients(menu.recipes.find(recipe=>recipe.id===choice.recipeId)!,choice.portion)}]:candidates)
        .filter(c=>c.recipe.mealType===mealTypeForSlot(slot))
        .sort(
          (a, b) =>
            objective(a.n) - objective(b.n) ||
            a.recipe.id.localeCompare(b.recipe.id),
        )
        .slice(0, 120);
      for (const state of states)
        for (const { recipe, portion, n } of options) {
          if (!choice&&state.meals.some((m) => m.recipe.id === recipe.id)) continue;
          const added = Object.fromEntries(
            nutrientDefinitions.map(([k]) => [
              k,
              state.added[k] === null || n[k] === null
                ? null
                : state.added[k]! + n[k]!,
            ]),
          );
          const exceeded = Object.entries(constraints).filter(([key,t]) =>
            t.max !== null && added[key] !== null && added[key]! > 0 &&
            (consumed[key] ?? 0) + added[key]! > t.max + 1e-6);
          for (const [key] of exceeded) {
            if (!coverage[key].partial) excludedByKnownLimit.add(key);
          }
          // Preserve the existing fail-closed treatment of missing upper-limit data.
          if (exceeded.length || Object.entries(constraints).some(([key,t]) =>
            t.max !== null && added[key] === null)) continue;
          const names = recipe.ingredients.map((i) => i.name).join(" "),
            fits = goalMealFit(
              [...report.context.goals, ...prefs.goals],
              names,
            );
          const microbiome = recipe.goals.filter((g) =>
            prefs.goals.includes(g),
          );
          const repeated = meals.some((m) =>
            String(m.mealText)
              .toLowerCase()
              .includes(names.split(" ")[0].toLowerCase()),
          );
          const bonus = Math.min(
              0.12,
              fits.length * 0.025 + microbiome.length * 0.025,
            ),
            score =
              objective(added) +
              state.meals.length * 0.012 -
              bonus +
              (repeated ? 0.025 : 0);
          next.push({
            meals: [
              ...state.meals,
              {
                slot,
                recipe,
                portion,
                nutrients: n,
                reasons: [
                  ...fits.map((f) => f.reason),
                  ...(microbiome.length
                    ? [
                        "Includes food substrates linked to your saved microbiome goals; metabolite output is not predicted.",
                      ]
                    : []),
                  ...(repeated
                    ? [
                        "Similar to a logged food; variety used as a tie-breaker.",
                      ]
                    : []),
                ],
              },
            ],
            added,
            score,
          });
        }
      states = next
        .sort((a, b) => a.score - b.score || a.meals.length - b.meals.length)
        .slice(0, 12);
      if(!states.length)break;
    }
  const best = states[0]||{meals:[] as Picked[],added:Object.fromEntries(nutrientDefinitions.map(([key])=>[key,0])) as Record<string,number|null>,score:objective({})},
    projected = total(best.added);
  const checks = nutrientDefinitions
    .filter(([key]) => constraints[key])
    .map(([key, name, unit]) => {
      const t = constraints[key],
        value = projected[key],
        complete = !coverage[key].partial && best.added[key] !== null;
      return {
        key,
        name,
        unit,
        ...t,
        consumed: consumed[key],
        added: best.added[key],
        projected: value,
        remaining:
          t.min === null
            ? null
            : consumed[key] === null
              ? null
              : Math.max(0, t.min - consumed[key]!),
        complete,
        status: !complete
          ? "Incomplete data"
          : value !== null &&
              (t.max === null || value <= t.max) &&
              (t.min === null || value >= t.min)
            ? "Within target"
            : value !== null && t.max !== null && value > t.max
              ? "Already above limit"
              : "Gap remains",
      };
    });
  const unappliedChoices=Object.keys(requestedChoices).filter(slot=>!best.meals.some(meal=>meal.slot===slot&&meal.recipe.id===requestedChoices[slot as keyof TodayMealChoices]?.recipeId&&meal.portion===requestedChoices[slot as keyof TodayMealChoices]?.portion));
  if(!blocked&&unappliedChoices.length)warnings.push('No searched combination with these meal choices fits the current constraints. Try another meal or portion; no limits were relaxed and no substitute was silently applied.');
  return {
    requestedChoices,
    unappliedChoices,
    availableChoices:blocked?[]:menu.recipes.map(recipe=>({id:recipe.id,name:recipe.name,mealType:recipe.mealType})),
    slots,
    eatenMeals: meals.length,
    consumed,
    coverage,
    meals: [...best.meals].sort((a,b)=>slots.indexOf(a.slot as typeof todayMealSlots[number])-slots.indexOf(b.slot as typeof todayMealSlots[number])),
    checks,
    tradeoffs: !blocked && checks.some(check=>check.status==="Gap remains") ? {
      unmetMinimums: checks.filter(check=>check.status==="Gap remains").map(check=>check.name),
      excludedByLimits: nutrientDefinitions.filter(([key])=>excludedByKnownLimit.has(key)).map(([,name])=>name),
      scope: "bounded-search" as const,
    } : null,
    request,
    preferences: prefs,
    warnings,
    status: blocked
      ? "needs-context"
      : best.meals.length
        ? "suggestions"
        : "no-fit",
    supplements: report.supplements,
    note: "Suggestions cover only meals still to come. A bounded search reduces remaining nutrient gaps, then considers your goals and variety. Known upper limits are enforced; incomplete intake prevents a guaranteed daily total. Supplements are reviewed separately and never automatically dosed to fill gaps.",
  };
}
export type TodayPlan = ReturnType<typeof buildTodayPlan>;
