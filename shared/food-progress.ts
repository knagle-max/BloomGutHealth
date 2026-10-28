import { mealNutritionSummary } from './nutrition-summary';

/** Group recorded instants in the viewer's current timezone, as in the journal. */
export function recordedFoodDays<T extends { loggedAt: Date | string }>(meals: T[]) {
  const days = new Map<string, T[]>();
  for (const meal of meals) {
    const instant = new Date(meal.loggedAt);
    if (!Number.isFinite(+instant)) continue;
    const day = `${instant.getFullYear()}-${String(instant.getMonth() + 1).padStart(2, '0')}-${String(instant.getDate()).padStart(2, '0')}`;
    days.set(day, [...(days.get(day) || []), meal]);
  }
  return Array.from(days.entries()).sort(([a], [b]) => b.localeCompare(a)).slice(0, 7)
    .map(([day, rows]) => ({ day, meals: rows.length, ...mealNutritionSummary(rows) }));
}
