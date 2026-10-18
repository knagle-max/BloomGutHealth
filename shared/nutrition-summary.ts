import { nutrientDefinitions } from "./meal-intelligence";
const fields: Record<string, string> = {
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
for (const [key] of nutrientDefinitions) {
  if (!Object.values(fields).includes(key)) fields[key] = key;
}
const macros: Record<string, string> = {
  calories: "totalCalories",
  protein: "totalProtein",
  carbs: "totalCarbs",
  fat: "totalFat",
};
const known = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;
export function mealNutritionSummary(meals: Array<any>) {
  const totals: Record<string, number | null> = {};
  const coverage: Record<
    string,
    {
      knownMeals: number;
      completeMeals: number;
      totalMeals: number;
      partial: boolean;
    }
  > = {};
  for (const [key, nutrient] of Object.entries(fields)) {
    let sum = 0,
      knownMeals = 0,
      completeMeals = 0;
    for (const meal of meals) {
      const detail = meal.intelligence?.nutrients?.find(
        (n: any) => n.key === nutrient,
      );
      const rows = Array.isArray(meal.nutritionalData)
        ? meal.nutritionalData
        : [];
      const values = rows.map((r: any) => r?.[nutrient]).filter(known);
      let amount: number | null = null,
        complete = false;
      if (macros[key] && known(meal[macros[key]])) {
        amount = meal[macros[key]];
        complete = true;
      } else if (known(detail?.amount) && detail.coverage > 0) {
        amount = detail.amount;
        complete = detail.coverage === 1;
      } else if (values.length) {
        amount = values.reduce((a: number, b: number) => a + b, 0);
        complete = values.length === rows.length;
      }
      if (amount !== null) {
        sum += amount;
        knownMeals++;
        if (complete) completeMeals++;
      }
    }
    totals[key] =
      knownMeals || !meals.length ? Math.round(sum * 100) / 100 : null;
    coverage[key] = {
      knownMeals,
      completeMeals,
      totalMeals: meals.length,
      partial: completeMeals < meals.length,
    };
  }
  return {
    totals,
    coverage,
    isPartial: Object.values(coverage).some((c) => c.partial),
  };
}
// Keep known contributions; never replace an unknown value with a measured zero.
export function summarizeMealNutrition(meals: Array<any>) {
  return mealNutritionSummary(meals).totals;
}

export function localDayBounds(day: string, timezoneOffset: number) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    !Number.isInteger(timezoneOffset) ||
    Math.abs(timezoneOffset) > 840
  )
    throw Error("Invalid local date or timezone offset");
  const midnight = Date.parse(`${day}T00:00:00.000Z`);
  if (
    !Number.isFinite(midnight) ||
    new Date(midnight).toISOString().slice(0, 10) !== day
  )
    throw Error("Invalid local date");
  const start = midnight + timezoneOffset * 60000;
  return {
    startOfDay: new Date(start),
    endOfDay: new Date(start + 86400000 - 1),
  };
}
