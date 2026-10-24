import { mealNutritionSummary } from "./nutrition-summary";
export function describeRecordedDiet(meals: any[], now = new Date()) {
  const recent = meals.filter(
      (m) =>
        +new Date(m.loggedAt) >= +now - 28 * 86400000 &&
        +new Date(m.loggedAt) <= +now,
    ),
    summary = mealNutritionSummary(recent);
  const observations = ["fiber", "protein", "carbs", "fat"].map((key) => ({
    key,
    name: {
      fiber: "Fiber",
      protein: "Protein",
      carbs: "Carbohydrate",
      fat: "Fat",
    }[key]!,
    unit: "g",
    knownTotal: summary.totals[key],
    ...summary.coverage[key],
  }));
  return {
    evidenceStatus: "recorded-diet-observations",
    days: 28,
    mealsAnalyzed: recent.length,
    observations,
    predictedBacteria: [],
    insights: [],
    message: recent.length
      ? "These are known contributions from logged meals, not an assessment of your entire diet."
      : "Log a meal to start exploring your recorded food patterns.",
    note: "Food records alone cannot establish which organisms you carry, their abundance or how much of a metabolite they produce.",
  };
}
