import { z } from "zod";
import { pathways, evidenceSources, type GoalId } from "./science-coach";

const tags = [
  "seafood",
  "dairy",
  "gluten",
  "legumes",
  "alliums",
  "fermented",
  "nuts",
  "eggs",
  "soy",
  "meat",
] as const;
export const preferenceSchema = z
  .object({
    dislikes: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
    exclusions: z.array(z.enum(tags)).max(10).default([]),
    dietaryPattern: z
      .enum(["omnivore", "vegetarian", "vegan"])
      .default("omnivore"),
    sensitiveGut: z.boolean().default(false),
    cookingMinutes: z.number().int().min(5).max(180).default(30),
    cuisines: z.string().trim().max(300).default(""),
    goals: z
      .array(z.enum(["butyrate", "diversity", "athletic", "longevity"]))
      .min(1)
      .max(4)
      .default(["butyrate"]),
  })
  .strict();
export type DietaryPreferences = z.infer<typeof preferenceSchema>;
export const defaultPreferences = preferenceSchema.parse({});
export const mealContextSchema = z
  .object({
    eatenAt: z.string().datetime({ offset: true }).optional(),
    portion: z.enum(["small", "medium", "large", "specified"]).optional(),
    symptoms: z
      .object({
        bloating: z.number().int().min(0).max(10).nullable(),
        energy: z.number().int().min(0).max(10).nullable(),
        comfort: z.number().int().min(0).max(10).nullable(),
        clarity: z.number().int().min(0).max(10).nullable(),
      })
      .optional(),
  })
  .strict();
export const ingredientSchema = z.object({
  name: z.string().min(1).max(120),
  grams: z.number().positive().max(3000).nullable(),
  preparation: z.string().max(120),
  assumption: z.string().max(300),
});
export type Ingredient = z.infer<typeof ingredientSchema>;
export interface Nutrient {
  key: string;
  name: string;
  unit: string;
  amount: number | null;
  coverage: number;
}
export interface FoodMatch {
  ingredient: string;
  grams: number;
  fdcId: number;
  description: string;
  url: string;
  needsConfirmation: boolean;
}
export interface MealIntelligence {
  status: "database-estimate" | "provider-estimate" | "unavailable";
  parser: "ai" | "rules";
  ingredients: Ingredient[];
  clarificationQuestions: string[];
  warnings: string[];
  nutrients: Nutrient[];
  foodMatches: FoodMatch[];
  pathways: typeof pathways;
  sources: typeof evidenceSources;
  provider: string;
  analyzedAt: string;
}
export const nutrientDefinitions = [
  ["calories", "Energy", "kcal", 1008],
  ["protein_g", "Protein", "g", 1003],
  ["carbohydrates_total_g", "Carbohydrate", "g", 1005],
  ["fat_total_g", "Fat", "g", 1004],
  ["fiber_g", "Fiber", "g", 1079],
  ["sugar_g", "Total sugars", "g", 2000],
  ["sodium_mg", "Sodium", "mg", 1093],
  ["potassium_mg", "Potassium", "mg", 1092],
  ["calcium_mg", "Calcium", "mg", 1087],
  ["iron_mg", "Iron", "mg", 1089],
  ["magnesium_mg", "Magnesium", "mg", 1090],
  ["zinc_mg", "Zinc", "mg", 1095],
  ["vitamin_c_mg", "Vitamin C", "mg", 1162],
  ["vitamin_d_ug", "Vitamin D", "µg", 1114],
  ["vitamin_b12_ug", "Vitamin B12", "µg", 1178],
  ["folate_ug", "Folate, total", "µg", 1177],
  ["vitamin_a_ug", "Vitamin A, RAE", "µg", 1106],
  ["vitamin_e_mg", "Vitamin E", "mg", 1109],
  ["vitamin_k_ug", "Vitamin K", "µg", 1185],
  ["cholesterol_mg", "Cholesterol", "mg", 1253],
  ["fat_saturated_g", "Saturated fat", "g", 1258],
] as const;
const foodPathways = [
  {
    pattern:
      /\b(oats?|beans?|lentils?|chickpeas?|whole grains?|vegetables?|brown rice)\b/i,
    id: "wholefood-scfa",
  },
  { pattern: /\b(walnuts?)\b/i, id: "ellagitannin-urolithin" },
  {
    pattern:
      /\b(potato(?:es)?|rice|oats?|beans?|lentils?|chickpeas?|banana)\b/i,
    id: "starch-butyrate",
  },
  {
    pattern:
      /\b(onions?|garlic|leeks?|asparagus|chicory|inulin|artichokes?)\b/i,
    id: "fructan-butyrate",
  },
  {
    pattern: /\b(yogurt|yoghurt|kefir|kimchi|sauerkraut|fermented)\b/i,
    id: "fermented-diversity",
  },
];
export function explainFoods(description: string) {
  // Food presence is a mechanistic hypothesis, never abundance or dose inference.
  const ids = new Set(
    foodPathways.filter((x) => x.pattern.test(description)).map((x) => x.id),
  );
  const selected = pathways.filter((p) => ids.has(p.id));
  return {
    pathways: selected,
    sources: evidenceSources.filter((s) =>
      selected.some((p) => p.sourceIds.includes(s.id)),
    ),
    warnings: [
      "Substrate availability depends on amount and preparation. Starch foods are not all equivalent sources of resistant starch.",
      "These are potential pathways, not measured bacteria or metabolite production. A report showing a taxon does not prove the relevant strain or genes are active.",
    ],
  };
}
export function parseExplicitIngredients(text: string): Ingredient[] {
  return text
    .split(/[,;+]|\s+and\s+/i)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((part) => {
      const m = part.match(/^(\d+(?:\.\d+)?)\s*(g|grams?|kg)\s+(.+)$/i);
      return {
        name: m ? m[3] : part,
        grams:
          m &&
          Number(m[1]) > 0 &&
          Number(m[1]) * (m[2].toLowerCase() === "kg" ? 1000 : 1) <= 3000
            ? Number(m[1]) * (m[2].toLowerCase() === "kg" ? 1000 : 1)
            : null,
        preparation: "As described",
        assumption: m
          ? "User-specified mass"
          : "Quantity requires confirmation; no generic serving assumed",
      };
    });
}
export function scaleDatabaseNutrients(
  foods: Array<{
    grams: number;
    foodNutrients: Array<{ nutrient: { id: number }; amount?: number }>;
  }>,
  ingredientCount: number,
): Nutrient[] {
  return nutrientDefinitions.map(([key, name, unit, id]) => {
    let amount = 0,
      coverage = 0;
    for (const food of foods) {
      const n = food.foodNutrients.find((n) => n.nutrient.id === id);
      if (
        n &&
        typeof n.amount === "number" &&
        Number.isFinite(n.amount) &&
        n.amount >= 0
      ) {
        amount += (n.amount * food.grams) / 100;
        coverage++;
      }
    }
    return {
      key,
      name,
      unit,
      amount: coverage ? Math.round(amount * 100) / 100 : null,
      coverage: ingredientCount ? coverage / ingredientCount : 0,
    };
  });
}
export interface Recipe {
  id: string;
  name: string;
  ingredients: Array<{ name: string; grams: number; tags: string[] }>;
  steps: string[];
  minutes: number;
  goals: GoalId[];
  pathwayIds: string[];
  rationale: string;
}
export const recipes: Recipe[] = [
  {
    id: "potato-chicken",
    name: "Chicken, cooled potato & vegetable bowl",
    ingredients: [
      { name: "Cooked chicken breast", grams: 150, tags: ["meat"] },
      {
        name: "Cooked potato, cooled and refrigerated safely",
        grams: 150,
        tags: [],
      },
      { name: "Carrot", grams: 80, tags: [] },
      { name: "Olive oil", grams: 10, tags: [] },
    ],
    steps: [
      "Use safely refrigerated cooked potatoes.",
      "Combine with cooked chicken and carrots; dress with olive oil.",
    ],
    minutes: 20,
    goals: ["butyrate"],
    pathwayIds: ["starch-butyrate"],
    rationale:
      "Cooled potato provides a potential resistant-starch substrate. The recipe is a practical translation, not a trial-tested dose.",
  },
  {
    id: "potato-tofu",
    name: "Tofu & cooled potato bowl",
    ingredients: [
      { name: "Tofu", grams: 150, tags: ["soy", "legumes"] },
      {
        name: "Cooked potato, cooled and refrigerated safely",
        grams: 150,
        tags: [],
      },
      { name: "Carrot", grams: 80, tags: [] },
      { name: "Olive oil", grams: 10, tags: [] },
    ],
    steps: [
      "Use safely refrigerated cooked potatoes.",
      "Cook tofu, combine with potato and carrot, and dress with olive oil.",
    ],
    minutes: 20,
    goals: ["butyrate"],
    pathwayIds: ["starch-butyrate"],
    rationale:
      "A plant-based meal delivering a potential resistant-starch substrate; the bacterial response depends on the starting community.",
  },
  {
    id: "onion-lentils",
    name: "Lentil, onion & brown rice bowl",
    ingredients: [
      { name: "Cooked lentils", grams: 120, tags: ["legumes"] },
      { name: "Cooked brown rice", grams: 100, tags: [] },
      { name: "Onion", grams: 30, tags: ["alliums"] },
      { name: "Carrot", grams: 80, tags: [] },
      { name: "Olive oil", grams: 10, tags: [] },
    ],
    steps: [
      "Cook onion and carrot in olive oil.",
      "Stir in cooked lentils and serve with rice.",
    ],
    minutes: 25,
    goals: ["butyrate"],
    pathwayIds: ["fructan-butyrate"],
    rationale:
      "Onion supplies fructans for cross-feeding networks; this serving is not equivalent to the purified fiber doses studied.",
  },
  {
    id: "yogurt-breakfast",
    name: "Plain yogurt, oats & berry breakfast",
    ingredients: [
      {
        name: "Plain yogurt with live cultures",
        grams: 170,
        tags: ["dairy", "fermented"],
      },
      { name: "Rolled oats", grams: 40, tags: ["gluten"] },
      { name: "Blueberries", grams: 80, tags: [] },
      { name: "Walnuts", grams: 15, tags: ["nuts"] },
    ],
    steps: ["Mix oats into yogurt and top with berries and walnuts."],
    minutes: 5,
    goals: ["diversity"],
    pathwayIds: ["fermented-diversity"],
    rationale:
      "Yogurt is a component of a mixed fermented-food pattern studied in humans. This exact meal has not been tested for diversity changes.",
  },
  {
    id: "kefir-breakfast",
    name: "Kefir, berry & oat smoothie bowl",
    ingredients: [
      { name: "Plain kefir", grams: 200, tags: ["dairy", "fermented"] },
      { name: "Rolled oats", grams: 35, tags: ["gluten"] },
      { name: "Blueberries", grams: 80, tags: [] },
    ],
    steps: ["Blend ingredients or mix and let oats soften."],
    minutes: 5,
    goals: ["diversity"],
    pathwayIds: ["fermented-diversity"],
    rationale:
      "A fermented-food option within the human-studied pattern; it does not guarantee durable colonization.",
  },
  {
    id: "cabbage-potato",
    name: "Potato, egg & fermented cabbage plate",
    ingredients: [
      {
        name: "Cooked potato, cooled and refrigerated safely",
        grams: 150,
        tags: [],
      },
      { name: "Cooked egg", grams: 100, tags: ["eggs"] },
      {
        name: "Fermented cabbage, without onion or garlic",
        grams: 25,
        tags: ["fermented"],
      },
    ],
    steps: [
      "Serve cooled, safely refrigerated potatoes with cooked eggs.",
      "Add a small fermented cabbage side; check the product ingredients and sodium.",
    ],
    minutes: 15,
    goals: ["butyrate", "diversity"],
    pathwayIds: ["starch-butyrate", "fermented-diversity"],
    rationale:
      "Combines potential resistant starch with a fermented-food component. The recipe itself is an extrapolation.",
  },
  {
    id: "potato-seeds",
    name: "Cooled potato, carrot & pumpkin seed salad",
    ingredients: [
      {
        name: "Cooked potato, cooled and refrigerated safely",
        grams: 150,
        tags: [],
      },
      { name: "Carrot", grams: 80, tags: [] },
      { name: "Pumpkin seeds", grams: 25, tags: [] },
      { name: "Olive oil", grams: 10, tags: [] },
    ],
    steps: [
      "Use safely refrigerated cooked potatoes.",
      "Combine with grated carrot and pumpkin seeds, then dress with olive oil.",
    ],
    minutes: 10,
    goals: ["butyrate"],
    pathwayIds: ["starch-butyrate"],
    rationale:
      "A dairy-free, legume-free plant option supporting the resistant-starch pathway hypothesis.",
  },
];
// Broader complete-meal options share an explicit supported pattern; no new bacterial targets are invented.
recipes.push(
  {
    id: "oat-berry-bowl",
    name: "Oat, berry & pumpkin seed breakfast",
    ingredients: [
      { name: "Rolled oats", grams: 45, tags: ["gluten"] },
      { name: "Blueberries", grams: 80, tags: [] },
      { name: "Pumpkin seeds", grams: 20, tags: [] },
    ],
    steps: ["Cook oats in water.", "Top with berries and pumpkin seeds."],
    minutes: 10,
    goals: ["butyrate"],
    pathwayIds: ["wholefood-scfa"],
    rationale:
      "A mixed whole-food fiber meal, translated from dietary-pattern evidence; not proof this meal increases your butyrate.",
  },
  {
    id: "lentil-carrot-soup",
    name: "Lentil & carrot soup",
    ingredients: [
      { name: "Cooked lentils", grams: 150, tags: ["legumes"] },
      { name: "Carrot", grams: 100, tags: [] },
      { name: "Cooked brown rice", grams: 80, tags: [] },
      { name: "Olive oil", grams: 10, tags: [] },
    ],
    steps: [
      "Simmer cooked lentils, rice and carrot with water.",
      "Finish with olive oil.",
    ],
    minutes: 25,
    goals: ["butyrate"],
    pathwayIds: ["wholefood-scfa"],
    rationale:
      "Supplies a mixture of plant substrates for fermentation. The trial studied a whole diet, not this soup.",
  },
  {
    id: "chickpea-rice",
    name: "Chickpea, rice & vegetable plate",
    ingredients: [
      { name: "Cooked chickpeas", grams: 120, tags: ["legumes"] },
      { name: "Cooked brown rice", grams: 100, tags: [] },
      { name: "Broccoli", grams: 100, tags: [] },
      { name: "Olive oil", grams: 10, tags: [] },
    ],
    steps: [
      "Cook broccoli and combine with chickpeas and rice.",
      "Dress with olive oil.",
    ],
    minutes: 20,
    goals: ["butyrate"],
    pathwayIds: ["wholefood-scfa"],
    rationale:
      "Mixed plant substrates can support community fermentation; amount, tolerance and baseline microbes affect the response.",
  },
  {
    id: "chicken-rice",
    name: "Chicken, brown rice & broccoli",
    ingredients: [
      { name: "Cooked chicken breast", grams: 150, tags: ["meat"] },
      { name: "Cooked brown rice", grams: 100, tags: [] },
      { name: "Broccoli", grams: 100, tags: [] },
      { name: "Olive oil", grams: 10, tags: [] },
    ],
    steps: [
      "Serve cooked chicken with rice and cooked broccoli.",
      "Dress vegetables with olive oil.",
    ],
    minutes: 25,
    goals: ["butyrate"],
    pathwayIds: ["wholefood-scfa"],
    rationale:
      "Adds a whole-food plant component to a protein meal. The pathway rationale concerns the plant substrates, not a selective bacterial effect of chicken.",
  },
  {
    id: "tofu-rice",
    name: "Tofu, brown rice & broccoli",
    ingredients: [
      { name: "Tofu", grams: 150, tags: ["soy", "legumes"] },
      { name: "Cooked brown rice", grams: 100, tags: [] },
      { name: "Broccoli", grams: 100, tags: [] },
      { name: "Olive oil", grams: 10, tags: [] },
    ],
    steps: ["Cook tofu and broccoli.", "Serve with brown rice and olive oil."],
    minutes: 25,
    goals: ["butyrate"],
    pathwayIds: ["wholefood-scfa"],
    rationale:
      "A vegan whole-food meal with plant substrates; no exact metabolite amount can be calculated from the recipe.",
  },
  {
    id: "yogurt-seeds",
    name: "Yogurt, berries & pumpkin seeds",
    ingredients: [
      {
        name: "Plain yogurt with live cultures",
        grams: 170,
        tags: ["dairy", "fermented"],
      },
      { name: "Blueberries", grams: 80, tags: [] },
      { name: "Pumpkin seeds", grams: 20, tags: [] },
    ],
    steps: ["Combine yogurt, berries and seeds."],
    minutes: 5,
    goals: ["diversity"],
    pathwayIds: ["fermented-diversity"],
    rationale:
      "A fermented-food option without oats or nuts; still an extrapolation from a mixed-food trial.",
  },
  {
    id: "cabbage-tofu",
    name: "Tofu, rice & fermented cabbage bowl",
    ingredients: [
      { name: "Tofu", grams: 150, tags: ["soy", "legumes"] },
      { name: "Cooked brown rice", grams: 100, tags: [] },
      {
        name: "Fermented cabbage without onion or garlic",
        grams: 25,
        tags: ["fermented"],
      },
    ],
    steps: [
      "Cook tofu, serve with rice and a small fermented cabbage side.",
      "Check the cabbage product for salt and other ingredients.",
    ],
    minutes: 20,
    goals: ["diversity", "butyrate"],
    pathwayIds: ["fermented-diversity", "wholefood-scfa"],
    rationale:
      "Combines a fermented-food component with whole-food substrates. This meal has not been tested for a specific microbiome outcome.",
  },
  {
    id: "walnut-oats",
    name: "Walnut, oat & berry breakfast",
    ingredients: [
      { name: "Rolled oats", grams: 45, tags: ["gluten"] },
      { name: "Walnuts", grams: 20, tags: ["nuts"] },
      { name: "Blueberries", grams: 80, tags: [] },
    ],
    steps: ["Cook oats in water and add walnuts and berries."],
    minutes: 10,
    goals: ["butyrate"],
    pathwayIds: ["wholefood-scfa", "ellagitannin-urolithin"],
    rationale:
      "Whole-food fiber plus walnuts, whose polyphenol metabolism varies by urolithin metabotype. No longevity or guaranteed urolithin-production claim is made.",
  },
);
export function preferenceConflicts(
  recipe: Recipe,
  prefs: DietaryPreferences,
): string[] {
  const conflicts = new Set<string>();
  for (const i of recipe.ingredients) {
    for (const t of i.tags) {
      if (prefs.exclusions.includes(t as any)) conflicts.add(t);
      if (
        prefs.dietaryPattern !== "omnivore" &&
        (t === "meat" || t === "seafood")
      )
        conflicts.add(t);
      if (prefs.dietaryPattern === "vegan" && (t === "eggs" || t === "dairy"))
        conflicts.add(t);
      if (
        prefs.sensitiveGut &&
        (t === "alliums" || t === "legumes" || t === "fermented")
      )
        conflicts.add("sensitivity");
    }
    for (const dislike of prefs.dislikes) {
      const words = dislike.toLowerCase().split(/\s+/);
      const name = i.name.toLowerCase();
      if (words.every((w) => name.includes(w))) conflicts.add(dislike);
    }
  }
  if (recipe.minutes > prefs.cookingMinutes) conflicts.add("cooking time");
  return Array.from(conflicts);
}
export function recommendMeals(
  prefs: DietaryPreferences,
  recentMeals: string[] = [],
) {
  const eligible = recipes.filter(
    (r) =>
      !preferenceConflicts(r, prefs).length &&
      r.goals.some((g) => prefs.goals.includes(g)),
  );
  return eligible
    .map((recipe) => ({
      ...recipe,
      matchedGoals: recipe.goals.filter((g) => prefs.goals.includes(g)),
      alreadyMentioned: recentMeals.some((m) =>
        recipe.ingredients
          .filter((i) => /potato|yogurt|kefir|onion/i.test(i.name))
          .some((i) =>
            m.toLowerCase().includes(
              i.name
                .toLowerCase()
                .split(",")[0]
                .replace(/^cooked |^plain /, ""),
            ),
          ),
      ),
    }))
    .sort((a, b) => Number(a.alreadyMentioned) - Number(b.alreadyMentioned));
}
export const cohortResearch = [
  {
    id: "athletic",
    name: "Athlete research",
    sourceId: "athletes-2019",
    finding:
      "Exercise-associated lactate-to-propionate metabolism involving Veillonella.",
    comparison:
      "No universal athlete microbiome or validated personal match score is established.",
    foodStatus:
      "No proven diet prescription for reproducing the performance mechanism. General meal suggestions are shown only for separately selected supported goals.",
  },
  {
    id: "longevity",
    name: "Long-lived population research",
    sourceId: "centenarians-2021",
    finding:
      "Specific bile-acid transformations associated with some centenarian communities.",
    comparison:
      "An observed cohort association does not establish a longevity target or causal benefit.",
    foodStatus:
      "No validated meal intervention to reproduce this mechanism or extend lifespan.",
  },
];

export function filterLegacyFoods<T extends { food: string }>(
  items: T[],
  prefs: DietaryPreferences,
): T[] {
  return items.filter((item) => {
    const text = item.food.toLowerCase();
    const ingredientTags: string[] = [];
    const patterns: Record<string, RegExp> = {
      seafood: /fish|salmon|mackerel|sardine|seafood|shrimp|tuna/,
      meat: /chicken|beef|pork|turkey/,
      dairy: /dairy|yogurt|kefir|milk|cheese/,
      gluten: /wheat|barley|whole grains/,
      legumes: /legume|bean|lentil|chickpea/,
      alliums: /onion|garlic|leek/,
      fermented: /fermented|yogurt|kefir/,
      nuts: /walnut|almond|nuts/,
      eggs: /egg/,
      soy: /soy|tofu/,
    };
    for (const [tag, pattern] of Object.entries(patterns))
      if (pattern.test(text)) ingredientTags.push(tag);
    return !preferenceConflicts(
      {
        id: "legacy",
        name: item.food,
        ingredients: [{ name: item.food, grams: 0, tags: ingredientTags }],
        minutes: 0,
        steps: [],
        goals: ["butyrate"],
        pathwayIds: [],
        rationale: "",
      },
      prefs,
    ).length;
  });
}
