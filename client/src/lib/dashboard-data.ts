import { mealNutritionSummary } from "@shared/nutrition-summary";
export interface LoggedMeal {
  id: string;
  mealText: string;
  mealType: string | null;
  loggedAt: string;
  totalCalories: number | null;
  totalProtein: number | null;
  nutritionalData?: unknown;
}

export function localDayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function dailyMealSummary(meals: LoggedMeal[], now = new Date()) {
  const today = meals
    .filter((meal) => localDayKey(new Date(meal.loggedAt)) === localDayKey(now))
    .sort((a, b) => +new Date(b.loggedAt) - +new Date(a.loggedAt));
  const { totals, coverage } = mealNutritionSummary(today);
  return {
    meals: today,
    coverage,
    nutritionUnavailable: today.filter((meal) => meal.totalCalories === null)
      .length,
    calories: totals.calories,
    protein: totals.protein,
    fiber: totals.fiber,
  };
}

export function loggingHistory(
  meals: LoggedMeal[],
  days: number,
  now = new Date(),
) {
  const counts = new Map<string, number>();
  for (const meal of meals) {
    const key = localDayKey(new Date(meal.loggedAt));
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days + i + 1);
    return {
      date: localDayKey(date),
      label: date.toLocaleDateString(undefined, { weekday: "narrow" }),
      count: counts.get(localDayKey(date)) || 0,
    };
  });
}
