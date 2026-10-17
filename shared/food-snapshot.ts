import data from "./data/planning-foods.json";
import {
  type Ingredient,
  type MealIntelligence,
  scaleDatabaseNutrients,
} from "./meal-intelligence";
export type SnapshotFood = {
  id: string;
  name: string;
  tags: string[];
  group: string;
  fdcId: number;
  description: string;
  dataType: string;
  url: string;
  retrievedAt: string;
  per100g: Record<string, number | undefined>;
};
export const snapshotFoods: SnapshotFood[] = data;
const normalized = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
// Only explicit prepared-food names match. "Chicken", "rice" and "a bowl of oats" are deliberately ambiguous.
export function lookupSnapshotNutrition(ingredients: Ingredient[]) {
  const matches: MealIntelligence["foodMatches"] = [];
  const scaled: Array<{
    grams: number;
    foodNutrients: Array<{ nutrient: { id: number }; amount: number }>;
  }> = [];
  for (const ingredient of ingredients) {
    if (ingredient.grams === null) continue;
    const food = snapshotFoods.find(
      (f) =>
        normalized(f.name) === normalized(ingredient.name) ||
        normalized(f.description) === normalized(ingredient.name),
    );
    if (!food) continue;
    scaled.push({
      grams: ingredient.grams,
      foodNutrients: Object.entries(food.per100g)
        .filter((e): e is [string, number] => typeof e[1] === "number")
        .map(([id, amount]) => ({ nutrient: { id: Number(id) }, amount })),
    });
    matches.push({
      ingredient: ingredient.name,
      grams: ingredient.grams,
      fdcId: food.fdcId,
      description: food.description,
      url: food.url,
      needsConfirmation: false,
    });
  }
  return {
    nutrients: scaleDatabaseNutrients(scaled, ingredients.length),
    foodMatches: matches,
    warnings: [
      "Sourced USDA SR Legacy snapshot (2026-10-17); only exact named preparation matches are used. Products and added ingredients can differ.",
      ...(matches.length < ingredients.length
        ? [
            "Some ingredients have no exact snapshot match. A live nutrition key or a supported prepared-food name is needed; missing nutrients are not zero.",
          ]
        : []),
    ],
  };
}
