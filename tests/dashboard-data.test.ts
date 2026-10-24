import test from "node:test";
import assert from "node:assert/strict";
import {
  dailyMealSummary,
  loggingHistory,
  type LoggedMeal,
} from "../client/src/lib/dashboard-data";
const now = new Date(2026, 9, 8, 12);
function meal(
  id: string,
  day: number,
  nutrition: unknown = [{ fiber_g: 4 }],
): LoggedMeal {
  return {
    id,
    mealText: "Oats",
    mealType: "breakfast",
    loggedAt: new Date(2026, 9, day, 9).toISOString(),
    totalCalories: 250,
    totalProtein: 12,
    nutritionalData: nutrition,
  };
}
test("today excludes earlier entries and sums only recorded nutrition", () => {
  const result = dailyMealSummary(
    [meal("1", 8), meal("2", 7), meal("3", 8, null)],
    now,
  );
  assert.equal(result.meals.length, 2);
  assert.equal(result.fiber, 4);
  assert.equal(result.protein, 24);
  assert.equal(result.calories, 500);
});
test("history includes zero-entry days and preserves local calendar dates", () => {
  const history = loggingHistory(
    [meal("1", 8), meal("2", 8), meal("3", 7), meal("4", 1)],
    7,
    now,
  );
  assert.deepEqual(
    history.map((day) => day.count),
    [0, 0, 0, 0, 0, 1, 2],
  );
  assert.equal(history[6].date, "2026-9-8");
  assert.equal(loggingHistory([], 14, now).length, 14);
});
test("empty journal has no invented nutrition", () => {
  const { coverage, ...result } = dailyMealSummary([], now);
  assert.equal(coverage.calories.partial, false);
  assert.deepEqual(result, {
    meals: [],
    nutritionUnavailable: 0,
    calories: 0,
    protein: 0,
    fiber: 0,
  });
});

test("a logged meal with unknown nutrition cannot appear as zero intake", () => {
  const unknown = {
    ...meal("unknown", 8, null),
    totalCalories: null,
    totalProtein: null,
  };
  const result = dailyMealSummary([unknown], now);
  assert.equal(result.calories, null);
  assert.equal(result.protein, null);
  assert.equal(result.fiber, null);
  assert.equal(result.nutritionUnavailable, 1);
});

test("a missing meal never erases other meals' known contributions", () => {
  const unknown = {
    ...meal("unknown", 8, null),
    totalCalories: null,
    totalProtein: null,
  };
  const result = dailyMealSummary([meal("known", 8), unknown], now);
  assert.equal(result.calories, 250);
  assert.equal(result.protein, 12);
  assert.equal(result.fiber, 4);
  assert.deepEqual(result.coverage.calories, {
    knownMeals: 1,
    completeMeals: 1,
    totalMeals: 2,
    partial: true,
  });
});
