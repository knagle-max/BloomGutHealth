// A total is complete only when every saved meal has that nutrient.
export function summarizeMealNutrition(meals: Array<any>) {
  const fields = {
    calories: "calories",
    protein: "protein_g",
    carbs: "carbohydrates_total_g",
    fat: "fat_total_g",
    fiber: "fiber_g",
    sugar: "sugar_g",
    sodium: "sodium_mg",
    potassium: "potassium_mg",
    cholesterol: "cholesterol_mg",
  };
  const macros: Record<string, string> = {
    calories: "totalCalories",
    protein: "totalProtein",
    carbs: "totalCarbs",
    fat: "totalFat",
  };
  const totals: Record<string, number | null> = {};
  for (const [key, nutrient] of Object.entries(fields)) {
    const values = meals.map((meal) => {
      if (macros[key]) return meal[macros[key]];
      const rows = meal.nutritionalData;
      if (
        !Array.isArray(rows) ||
        !rows.length ||
        rows.some(
          (r) =>
            typeof r?.[nutrient] !== "number" || !Number.isFinite(r[nutrient]),
        )
      )
        return null;
      return rows.reduce((sum, r) => sum + r[nutrient], 0);
    });
    totals[key] = values.some(
      (v) => typeof v !== "number" || !Number.isFinite(v),
    )
      ? null
      : values.reduce((sum, v) => sum + v, 0);
  }
  return totals;
}
