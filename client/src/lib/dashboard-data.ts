export interface LoggedMeal {
  id: string;
  mealText: string;
  mealType: string | null;
  loggedAt: string;
  totalCalories: number | null;
  totalProtein: number | null;
  nutritionalData?: unknown;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function dailyMealSummary(meals: LoggedMeal[], now = new Date()) {
  const today = meals
    .filter((meal) => dateKey(new Date(meal.loggedAt)) === dateKey(now))
    .sort((a, b) => +new Date(b.loggedAt) - +new Date(a.loggedAt));
  return {
    meals: today,
    nutritionUnavailable: today.filter((meal) => meal.totalCalories === null)
      .length,
    calories: today.reduce((sum, meal) => sum + (meal.totalCalories || 0), 0),
    protein: today.reduce((sum, meal) => sum + (meal.totalProtein || 0), 0),
    fiber: today.reduce(
      (sum, meal) =>
        sum +
        (Array.isArray(meal.nutritionalData)
          ? meal.nutritionalData.reduce(
              (total: number, item) => total + (Number(item?.fiber_g) || 0),
              0,
            )
          : 0),
      0,
    ),
  };
}

export function loggingHistory(
  meals: LoggedMeal[],
  days: number,
  now = new Date(),
) {
  const counts = new Map<string, number>();
  for (const meal of meals) {
    const key = dateKey(new Date(meal.loggedAt));
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - days + i + 1);
    return {
      date: dateKey(date),
      label: date.toLocaleDateString(undefined, { weekday: "narrow" }),
      count: counts.get(dateKey(date)) || 0,
    };
  });
}
