import type { MealIntelligence } from "./meal-intelligence";

/** A successful HTTP save does not mean every food received nutrition. */
export function unmatchedFoods(analysis?: MealIntelligence | null) {
  if (!analysis) return [];
  return analysis.ingredients.filter((i) =>
    !analysis.foodMatches.some((m) => m.ingredient === i.name && m.grams === i.grams),
  );
}
export function nutritionUpdateFeedback(analysis?: MealIntelligence | null) {
  const missing = unmatchedFoods(analysis);
  if (missing.length) return {
    title: "Nutrition still needs a match",
    description: `Choose the product and serving for ${missing.map((i) => i.name).join("; ")}. Known nutrition from other foods is retained.`,
  };
  if (!analysis || !analysis.nutrients.some((n) => n.amount !== null)) return {
    title: "Nutrition is still unavailable",
    description: "Review the food, amount and product label below. Repeating recalculation alone cannot fill missing source data.",
  };
  return {
    title: "Meal nutrition updated",
    description: analysis.nutrients.some((n) => n.amount === null || n.coverage < 1)
      ? "Known label values were saved. Nutrients not provided by the source remain unavailable."
      : "Your nutrition overview is up to date.",
  };
}
