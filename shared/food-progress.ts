import { mealNutritionSummary } from './nutrition-summary';

/** Group recorded instants in the viewer's current timezone, as in the journal. */
export function recordedFoodDays<T extends { loggedAt: Date | string }>(meals: T[],maximumDays=7) {
  const days = new Map<string, T[]>();
  for (const meal of meals) {
    const instant = new Date(meal.loggedAt);
    if (!Number.isFinite(+instant)) continue;
    const day = `${instant.getFullYear()}-${String(instant.getMonth() + 1).padStart(2, '0')}-${String(instant.getDate()).padStart(2, '0')}`;
    days.set(day, [...(days.get(day) || []), meal]);
  }
  return Array.from(days.entries()).sort(([a], [b]) => b.localeCompare(a)).slice(0, maximumDays)
    .map(([day, rows]) => ({ day, meals: rows.length, ...mealNutritionSummary(rows) }));
}

/** Calendar windows use the same current local timezone as the saved-day grouping. */
export function recordedFoodPeriod<T extends{loggedAt:Date|string}>(meals:T[],period:7|28|'all',now=new Date()){
 if(period==='all')return recordedFoodDays(meals,Infinity);
 const start=new Date(now.getFullYear(),now.getMonth(),now.getDate()-(period-1)),end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
 return recordedFoodDays(meals.filter(row=>{const time=+new Date(row.loggedAt);return time>=+start&&time<+end;}),period);
}
