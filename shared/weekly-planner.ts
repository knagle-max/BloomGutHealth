import {intoleranceWarnings,tasteMatches} from "./food-preference-policy";
import {foodCategory as category,foodPreferenceMatches} from "./food-preference-policy";
import { z } from "zod";
import { snapshotFoods } from "./food-snapshot";
import {
  nutrientDefinitions,
  preferenceConflicts,
  type DietaryPreferences,
  type Recipe,
} from "./meal-intelligence";
import { type PrecisionReport } from "./precision-nutrition";
import { personalEvidence, NETWORK_VERSION } from "./evidence-network";
import { pathways } from "./science-coach";

export const PLAN_VERSION = "weekly-2026-10-25.1";
const nutrientTarget = z
  .object({
    min: z.number().finite().nonnegative().max(100000).nullable(),
    max: z.number().finite().nonnegative().max(100000).nullable(),
  })
  .strict()
  .refine(
    (t) =>
      (t.min !== null || t.max !== null) &&
      (t.min === null || t.max === null || t.min <= t.max),
  );
export const recipeProposalSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]{1,50}$/),
    mealType: z.enum(["breakfast", "main", "snack"]),
    technique: z.enum(["bowl", "soup", "porridge"]),
    ingredients: z
      .array(
        z
          .object({
            foodId: z.enum(
              snapshotFoods.map((f) => f.id) as [string, ...string[]],
            ),
            grams: z.number().min(10).max(500),
          })
          .strict(),
      )
      .min(2)
      .max(6),
  })
  .strict();
export type RecipeProposal = z.infer<typeof recipeProposalSchema>;
export const weeklyRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(100).default("My weekly plan"),
    days: z.number().int().min(1).max(7).default(7),
    householdServings: z.number().int().min(1).max(8).default(1),
    targets: z
      .object({
        calories: z.number().int().min(1200).max(4500),
        protein: z.number().min(40).max(250),
        fiber: z.number().min(10).max(60),
        fiberMaximum: z.number().min(15).max(80).default(45),
        sodium: z.number().min(1000).max(4000),
        saturatedFat: z.number().min(5).max(40),
      })
      .strict(),
    customRecipes: z.array(recipeProposalSchema).max(12).default([]),
    nutrientTargets: z
      .record(
        z.string().refine(key => nutrientDefinitions.some(n => n[0] === key), "Unsupported nutrient target"),
        nutrientTarget,
      )
      .refine((t) => Object.keys(t).length <= 21)
      .prefault({}),
    locked: z
      .record(
        z.string(),
        z
          .object({
            recipeId: z.string().max(100),
            portion: z.number().min(0.5).max(2),
          })
          .strict(),
      )
      .refine((v) => Object.keys(v).length <= 28)
      .prefault({}),
  })
  .strict()
  .refine(
    (r) => r.targets.fiberMaximum >= r.targets.fiber,
    "Fiber maximum must be at least the minimum.",
  )
  .refine(
    (r) =>
      new Set(r.customRecipes.map((x) => x.id)).size === r.customRecipes.length,
    "Custom recipe IDs must be distinct.",
  );
export type WeeklyRequest = z.infer<typeof weeklyRequestSchema>;
export const planningFoods = snapshotFoods;
export type PlanningRecipe = Recipe & {
  mealType: "breakfast" | "main" | "snack";
  foodIngredients: { foodId: string; grams: number }[];
  source: "structured-template" | "ai-structured";
  style: string;
};
const byId = (id: string) => planningFoods.find((f) => f.id === id)!;
function recipe(
  id: string,
  name: string,
  mealType: PlanningRecipe["mealType"],
  parts: [string, number][],
  steps: string[],
  minutes: number,
  style = "Simple",
): PlanningRecipe {
  const text = parts.map(([id]) => id).join(" ");
  const pathwayIds = ["wholefood-scfa"];
  if (/onion/.test(text)) pathwayIds.push("fructan-butyrate");
  // Ordinary hot starch is not labelled a quantified resistant-starch intervention.
  return {
    id,
    name,
    mealType,
    foodIngredients: parts.map(([foodId, grams]) => ({ foodId, grams })),
    ingredients: parts.map(([id, grams]) => ({
      name: byId(id).name,
      grams,
      tags: byId(id).tags,
    })),
    steps,
    minutes,
    goals: ["butyrate"],
    pathwayIds,
    rationale:
      "Whole-food substrates may support microbial fermentation. Nutrients are calculated from explicit USDA records; no metabolite quantity or health effect is predicted for this recipe.",
    source: "structured-template",
    style,
  };
}
export function planningRecipes(
  custom: RecipeProposal[] = [],
): PlanningRecipe[] {
  const result: PlanningRecipe[] = [];
  for (const p of [
    "chicken",
    "salmon",
    "tofu",
    "lentils",
    "chickpeas",
    "beans",
    "egg",
  ])
    for (const s of [
      "rice",
      "quinoa",
      "potato",
      "sweetpotato",
      "millet",
      "buckwheat",
      "barley",
      "white-rice",
    ])
      for (const v of [
        "broccoli",
        "carrot",
        "spinach",
        "cauliflower",
        "brussels",
        "collards",
      ]) {
        const parts: [string, number][] = [
          [p, ["lentils", "chickpeas", "beans"].includes(p) ? 200 : 150],
          [s, 200],
          [v, 150],
        ];
        result.push(
          recipe(
            `${p}-${s}-${v}`,
            `${byId(p).name}, ${byId(s).name.toLowerCase()} & ${byId(v).name.toLowerCase()}`,
            "main",
            parts,
            [
              `Prepare ${byId(s).name.toLowerCase()} without added salt. Weights are edible cooked weights.`,
              `Use ${byId(p).name.toLowerCase()} in the stated cooked/prepared form; heat safely if needed.`,
              `Steam vegetables, drain and assemble. No added oil, salt or sauce is included in the calculation. Recalculate additions.`,
            ],
            25,
          ),
        );
      }
  for (const p of ["tofu", "egg", "lentils"]) {
    result.push(
      recipe(
        `breakfast-${p}`,
        `Apple oatmeal with ${byId(p).name.toLowerCase()} on the side`,
        "breakfast",
        [
          ["oats", 70],
          ["apple", 150],
          [p, p === "egg" ? 100 : 150],
        ],
        [
          "Cook dry oats in water. Stir in cooked apple.",
          "Serve the prepared protein separately. Listed oats are dry weight; other weights match the named preparation.",
        ],
        15,
      ),
    );
  }
  for (const p of ["tofu", "egg", "chicken"])
    for (const starch of ["potato", "rice"])
      result.push(
        recipe(
          `breakfast-${p}-${starch}`,
          `${byId(p).name} with ${byId(starch).name.toLowerCase()} & carrots`,
          "breakfast",
          [
            [p, 150],
            [starch, 180],
            ["carrot", 100],
          ],
          [
            "Prepare the named ingredients without added salt. All quantities match the listed edible preparation.",
            "Serve warm; heat leftovers safely.",
          ],
          15,
        ),
      );
  for (const p of ["tofu", "egg", "chickpeas", "beans"])
    result.push(
      recipe(
        `snack-${p}`,
        `${byId(p).name} & apple snack`,
        "snack",
        [
          [p, 100],
          ["apple", 150],
        ],
        [
          "Serve the prepared protein alongside the cooked apple. Use the named preparation and edible weights.",
        ],
        5,
      ),
    );
  // Soup variants provide different preparation without inventing new nutrients.
  for (const v of ["carrot", "spinach", "broccoli"])
    for (const p of ["lentils", "chickpeas", "beans"])
      result.push(
        recipe(
          `soup-${p}-${v}`,
          `${byId(p).name} & ${byId(v).name.toLowerCase()} soup`,
          "main",
          [
            [p, 200],
            ["potato", 200],
            [v, 150],
            ["onion", 40],
          ],
          [
            "Combine the already cooked ingredients with water.",
            "Simmer 10 minutes and blend part of the soup if desired. Ingredient amounts exclude water; no salt or oil is assumed.",
          ],
          15,
          "Soup",
        ),
      );
  for (const raw of custom) {
    const spec = recipeProposalSchema.parse(raw);
    if (
      new Set(spec.ingredients.map((i) => i.foodId)).size !==
      spec.ingredients.length
    )
      throw Error("Custom recipes require distinct ingredient IDs.");
    const parts = spec.ingredients.map(
      (i) => [i.foodId, i.grams] as [string, number],
    );
    const groups = parts.map(([id]) => byId(id).group);
    if (
      spec.mealType === "main" &&
      !["protein", "starch", "vegetable"].every((g) => groups.includes(g))
    )
      throw Error("Custom main meals require a protein, starch and vegetable.");
    const made = recipe(
      `custom-${spec.id}`,
      parts.map(([id]) => byId(id).name).join(" + "),
      spec.mealType,
      parts,
      [
        "Use the named prepared ingredients. Cook dry oats in water before assembling, if included.",
        spec.technique === "soup"
          ? "Combine with water and simmer 10 minutes; blend part if desired."
          : spec.technique === "porridge"
            ? "Fold prepared ingredients into cooked oatmeal or serve alongside."
            : "Arrange warm prepared ingredients in a bowl.",
        "Added oils, seasonings and salt are not included. Recalculate any additions.",
      ],
      spec.technique === "soup" ? 20 : 15,
      spec.technique,
    );
    result.push({ ...made, source: "ai-structured" });
  }
  return result;
}
export function recipeNutrients(recipe: PlanningRecipe, portion = 1) {
  return Object.fromEntries(
    nutrientDefinitions.map(([key, _name, _unit, id]) => {
      const values = recipe.foodIngredients.map((i) => ({
        g: i.grams,
        v: byId(i.foodId).per100g[String(id)],
      }));
      return [
        key,
        values.every((i) => typeof i.v === "number")
          ? values.reduce((n, i) => n + (i.v! * i.g * portion) / 100, 0)
          : null,
      ];
    }),
  ) as Record<string, number | null>;
}
export function checkedFoodPreferences(prefs: DietaryPreferences, allergies:string[]) {
  const unknownAllergies = allergies.filter(
    (a) =>
      !category(a) &&
      !planningFoods.some((f) =>
        f.name.toLowerCase().includes(a.toLowerCase()),
      ),
  );
  const extra = [...prefs.dislikes, ...allergies]
    .map(category)
    .filter(Boolean) as string[];
  const checked = {
    ...prefs,
    exclusions: Array.from(
      new Set([...prefs.exclusions, ...extra]),
    ) as DietaryPreferences["exclusions"],
    dislikes: [...prefs.dislikes, ...allergies],
  };
  return {preferences:checked,unknownAllergies};
}
export function eligiblePlanningRecipes(prefs:DietaryPreferences, allergies:string[], custom:RecipeProposal[]=[]) {
  const {preferences:checked,unknownAllergies}=checkedFoodPreferences(prefs,allergies);
  return {
    recipes: planningRecipes(custom).filter(
      (r) => !preferenceConflicts(r, checked).length&&!foodPreferenceMatches(r.ingredients,allergies).length,
    ),
    unknownAllergies,
  };
}
const slots = ["breakfast", "lunch", "dinner", "snack"] as const;
export type PlannedMeal = {
  slot: string;
  recipeId: string;
  portion: number;
  recipe: PlanningRecipe;
  nutrients: Record<string, number | null>;
  reasons: string[];
  pathways: typeof pathways;
};
function totals(meals: PlannedMeal[]) {
  return Object.fromEntries(
    nutrientDefinitions.map(([key]) => [
      key,
      meals.every((m) => m.nutrients[key] !== null)
        ? meals.reduce((s, m) => s + m.nutrients[key]!, 0)
        : null,
    ]),
  ) as Record<string, number | null>;
}
export function dailyChecks(
  n: Record<string, number | null>,
  t: WeeklyRequest["targets"],
  extra: WeeklyRequest["nutrientTargets"] = {},
) {
  return [
    {
      key: "calories",
      label: "Energy within 10% of your target",
      min: t.calories * 0.9,
      max: t.calories * 1.1,
    },
    { key: "protein_g", label: "Protein minimum", min: t.protein, max: null },
    { key: "fiber_g", label: "Fiber range", min: t.fiber, max: t.fiberMaximum },
    { key: "sodium_mg", label: "Sodium maximum", min: null, max: t.sodium },
    {
      key: "fat_saturated_g",
      label: "Saturated fat maximum",
      min: null,
      max: t.saturatedFat,
    },
    ...Object.entries(extra).map(([key, v]) => ({
      key,
      label: nutrientDefinitions.find((d) => d[0] === key)?.[1] || key,
      min: v.min,
      max: v.max,
    })),
  ].map((c) => ({
    ...c,
    value: n[c.key],
    passed:
      n[c.key] !== null &&
      (c.min === null || n[c.key]! >= c.min) &&
      (c.max === null || n[c.key]! <= c.max),
  }));
}
function objective(
  n: Record<string, number | null>,
  t: WeeklyRequest["targets"],
  extra: WeeklyRequest["nutrientTargets"] = {},
) {
  const c = dailyChecks(n, t, extra);
  return (
    c.reduce(
      (s, c) =>
        s +
        (c.value === null
          ? 100
          : c.min !== null && c.value < c.min
            ? ((c.min - c.value) / Math.max(c.min, 1)) ** 2 * 40
            : c.max !== null && c.value > c.max
              ? ((c.value - c.max) / Math.max(c.max, 1)) ** 2 * 40
              : 0),
      0,
    ) +
    Math.abs((n.calories || 0) - t.calories) / t.calories
  );
}
export function buildWeeklyPlan(
  input: WeeklyRequest,
  prefs: DietaryPreferences,
  report: PrecisionReport,
) {
  const parsed = weeklyRequestSchema.parse(input),
    eligible = eligiblePlanningRecipes(
      prefs,
      report.context.allergies,
      parsed.customRecipes,
    );
  const blocks: string[] = [];
  if (
    report.context.ageGroup !== "adult" ||
    report.context.pregnancy !== "no" ||
    !report.context.safetyReviewed
  )
    blocks.push(
      report.context.ageGroup === "under18"
        ? "Adult nutrition planning is unavailable for a profile under 18. Review the recorded Profile and health context."
        : "Confirm an adult profile, non-pregnant status and health context in Precision nutrition before generating a personalized plan.",
    );
  if (
    report.context.conditions.some((c) =>
      /kidney|renal|dialysis|eating disorder|anorexia|phenylketonuria|pku/i.test(
        c,
      ),
    )
  )
    blocks.push(
      "The recorded condition requires an individually reviewed diet outside this optimizer’s supported scope.",
    );
  if (eligible.unknownAllergies.length)
    blocks.push(
      `Allergies requiring ingredient review: ${eligible.unknownAllergies.join(", ")}. The optimizer cannot safely evaluate these entries.`,
    );
  const priorities = personalEvidence(report);
  const recipes = eligible.recipes;
  const byRecipe = new Map(recipes.map((r) => [r.id, r]));
  for (const [slot, lock] of Object.entries(parsed.locked))
    if (
      !/^d[0-6]-(breakfast|lunch|dinner|snack)$/.test(slot) ||
      Number(slot[1]) >= parsed.days ||
      !byRecipe.has(lock.recipeId)
    )
      throw Error("A locked meal is unknown, excluded or outside this plan.");
  const base = {
    name: parsed.name,
    version: PLAN_VERSION,
    type: "weekly-plan" as const,
    startedAt: new Date().toISOString(),
    request: parsed,
    goals: Array.from(new Set([...report.context.goals, ...prefs.goals])),
    biologicalEvidence: priorities,
    inputGuard: {
      context: report.context,
      preferences: prefs,
      sourceRecordIds: Array.from(
        new Set([
          ...report.labHistory.map((l) => l.id),
          ...report.microbiome.measuredMetabolites.map((m) => m.id),
          ...(report.genetics.import ? [report.genetics.import.id] : []),
        ]),
      ),
    },
    catalogue: {
      foods: planningFoods.length,
      recipes: planningRecipes(parsed.customRecipes).length,
      eligibleRecipes: recipes.length,
      source: "USDA FoodData Central SR Legacy snapshot, retrieved 2026-10-17",
    },
    nutrientDefinitions: nutrientDefinitions.map(([key, name, unit]) => ({
      key,
      name,
      unit,
    })),
    limitations: [
      "Deterministic beam search over structured recipes, not a clinically validated or globally optimal biological model.",
      "No microbial flux, metabolite concentration, strain activity, nutrient deficiency or expected clinical benefit is calculated.",
      "User-specified targets are planning constraints, not individual medical requirements. Missing nutrients remain unavailable.",
      "Ingredient data matches the named preparation. Check products, allergens and cross-contact. Household shopping quantities assume each person eats the same serving.",
      "Variety and pathway coverage are planning preferences; cohort resemblance is not a health outcome.",
    ],
    reviewFlags: report.reviewFlags,
  };
  if (blocks.length)
    return {
      ...base,
      status: "blocked" as const,
      blocks,
      days: [],
      shoppingList: [],
      recommendations: [],
      checksPassed: false,
    };
  let feasibleBaseline: PlannedMeal[] | undefined;
  const used = new Map<string, number>();
  const nutrientCache = new Map<string, ReturnType<typeof recipeNutrients>>();
  const nutrientsFor = (r: PlanningRecipe, p: number) => {
    const key = `${r.id}:${p}`;
    if (!nutrientCache.has(key)) nutrientCache.set(key, recipeNutrients(r, p));
    return nutrientCache.get(key)!;
  };
  const rankedReasons = (r: PlanningRecipe) => {
    const out = [
      "Fits saved dietary pattern, ingredient exclusions and cooking time.",
    ];
    if (
      priorities.labPriorities.some((l) =>
        ["ldl", "apob", "triglycerides", "glucose", "hba1c"].includes(l.marker),
      ) &&
      r.foodIngredients.some((i) =>
        ["oats", "lentils", "beans", "chickpeas"].includes(i.foodId),
      )
    )
      out.push(
        "Current reported cardiometabolic lab flag supports prioritizing this whole-food dietary pattern; no exact biomarker change is predicted.",
      );
    // Genetic pathway education never supplies a scoring bonus or target.
    if (prefs.cuisines && r.style === "Soup" && /soup/i.test(prefs.cuisines))
      out.push("Matches your saved soup preparation preference.");
    return out;
  };
  const days = Array.from({ length: parsed.days }, (_, day) => {
    let beam: Array<{ meals: PlannedMeal[]; score: number }> = [
      { meals: [], score: 0 },
    ];
    for (const [index, slot] of Array.from(slots.entries())) {
      const lock = parsed.locked[`d${day}-${slot}`];
      let options = recipes.filter(
        (r) =>
          r.mealType ===
            (slot === "lunch" || slot === "dinner" ? "main" : slot) &&
          (!lock || r.id === lock.recipeId),
      );
      if (!lock && options.length > 48)
        options = options
          .sort((a, b) => {
            const t = {
              ...parsed.targets,
              calories: parsed.targets.calories * 0.3,
              protein: parsed.targets.protein * 0.3,
              fiber: parsed.targets.fiber * 0.3,
              fiberMaximum: parsed.targets.fiberMaximum * 0.3,
              sodium: parsed.targets.sodium * 0.3,
              saturatedFat: parsed.targets.saturatedFat * 0.3,
            };
            return (
              objective(nutrientsFor(a, 1), t) +
              (used.get(a.id) || 0) * 0.25 -
              rankedReasons(a).length * 0.08 -
              (objective(nutrientsFor(b, 1), t) +
                (used.get(b.id) || 0) * 0.25 -
                rankedReasons(b).length * 0.08)
            );
          })
          .slice(0, 48);
      if (!options.length) {
        blocks.push(
          `No eligible ${slot} recipes. Restrictions were kept; no replacement was invented.`,
        );
        return null;
      }
      const expanded: Array<{ meals: PlannedMeal[]; score: number }> = [];
      for (const state of beam)
        for (const r of options)
          for (const portion of lock
            ? [lock.portion]
            : [0.75, 1, 1.25, 1.5, 2]) {
            if (!lock && state.meals.some((m) => m.recipeId === r.id)) continue;
            const meal: PlannedMeal = {
              slot,
              recipeId: r.id,
              portion,
              recipe: r,
              nutrients: nutrientsFor(r, portion),
              reasons: [...rankedReasons(r),...intoleranceWarnings(r.ingredients,report.context.intolerances)],
              pathways: pathways.filter((p) => r.pathwayIds.includes(p.id)),
            };
            const meals = [...state.meals, meal];
            const n = totals(meals),
              fraction = [0.27, 0.58, 0.88, 1][index];
            const partial = {
              ...parsed.targets,
              calories: parsed.targets.calories * fraction,
              protein: parsed.targets.protein * fraction,
              fiber: parsed.targets.fiber * fraction,
              fiberMaximum: parsed.targets.fiberMaximum * fraction,
              sodium: parsed.targets.sodium * fraction,
              saturatedFat: parsed.targets.saturatedFat * fraction,
            };
            const variety = meals.reduce(
              (s, m) => s + (used.get(m.recipeId) || 0) * 0.22,
              0,
            );
            const preferred =
              meals.reduce((s, m) => s + rankedReasons(m.recipe).length, 0) * 0.015;
            expanded.push({
              meals,
              score:
                objective(
                  n,
                  partial,
                  Object.fromEntries(
                    Object.entries(parsed.nutrientTargets).map(([key, t]) => [
                      key,
                      {
                        min: t.min === null ? null : t.min * fraction,
                        max: t.max,
                      },
                    ]),
                  ),
                ) +
                variety -
                preferred + meals.reduce((sum,meal)=>sum+tasteMatches(meal.recipe.ingredients,prefs.softDislikes).length,0)*0.02,
            });
          }
      beam = expanded
        .sort(
          (a, b) =>
            a.score - b.score ||
            a.meals
              .map((m) => m.recipeId)
              .join()
              .localeCompare(b.meals.map((m) => m.recipeId).join()),
        )
        .slice(0, 28);
    }
    const valid = beam.filter((b) =>
      dailyChecks(
        totals(b.meals),
        parsed.targets,
        parsed.nutrientTargets,
      ).every((c) => c.passed),
    );
    let best = (valid.length ? valid : beam)[0];
    const locksForDay = Object.entries(parsed.locked).filter(([key]) =>
      key.startsWith(`d${day}-`),
    );
    if (
      !valid.length &&
      feasibleBaseline &&
      locksForDay.every(([key, l]) =>
        feasibleBaseline!.some(
          (m) =>
            m.slot === key.split("-")[1] &&
            m.recipeId === l.recipeId &&
            m.portion === l.portion,
        ),
      )
    ) {
      best = {
        meals: feasibleBaseline.map((m) => ({
          ...m,
          reasons: [
            ...m.reasons,
            "Reused a feasible day because nutrient constraints take priority over recipe variety.",
          ],
        })),
        score: 0,
      };
    }
    if (
      best &&
      dailyChecks(
        totals(best.meals),
        parsed.targets,
        parsed.nutrientTargets,
      ).every((c) => c.passed)
    )
      feasibleBaseline = best.meals;

    if (!best) {
      blocks.push("No compatible combination was found.");
      return null;
    }
    best.meals.forEach((m) =>
      used.set(m.recipeId, (used.get(m.recipeId) || 0) + 1),
    );
    const nutrients = totals(best.meals);
    return {
      day: day + 1,
      meals: best.meals,
      nutrients,
      checks: dailyChecks(nutrients, parsed.targets, parsed.nutrientTargets),
    };
  }).filter((d): d is NonNullable<typeof d> => d !== null);
  const shopping = new Map<string, number>();
  for (const d of days)
    for (const m of d.meals)
      for (const i of m.recipe.foodIngredients)
        shopping.set(
          i.foodId,
          (shopping.get(i.foodId) || 0) +
            i.grams * m.portion * parsed.householdServings,
        );
  const shoppingList = Array.from(shopping).map(([id, grams]) => ({
    foodId: id,
    name: byId(id).name,
    grams: Math.round(grams),
    preparation: byId(id).description,
    sourceUrl: byId(id).url,
    note: "Edible quantity in the stated preparation, not raw purchase weight.",
  }));
  const checksPassed =
    days.length === parsed.days &&
    days.every((d) => d.checks.every((c) => c.passed));
  return {
    ...base,
    status: blocks.length
      ? ("incomplete" as const)
      : checksPassed
        ? ("feasible" as const)
        : ("targets-unmet" as const),
    blocks,
    days,
    shoppingList,
    checksPassed,
    recommendations: Array.from(
      new Set(days.flatMap((d) => d.meals.map((m) => m.recipeId))),
    ).map((id) => ({ id, name: byRecipe.get(id)!.name })),
    rankingNote: `${NETWORK_VERSION}: user targets, dietary preferences and supported measured context guide choices. Genetic pathways are educational only and do not rank meals or set portions.`,
  };
}
export type WeeklyPlan = ReturnType<typeof buildWeeklyPlan>;
