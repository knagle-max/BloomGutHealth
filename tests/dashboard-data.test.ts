import test from "node:test";
import assert from "node:assert/strict";
import {
  dailyMealSummary,
  localDayKey,
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
    carbs: 0,
    fat: 0,
    fiber: 0,
  });
});

test('Today macro overview retains recorded zero, missing and partial canonical contributions',()=>{
  const first={...meal('a',8,null),totalProtein:0,totalCarbs:20,totalFat:null};
  const one=dailyMealSummary([first],now);assert.equal(one.protein,0);assert.equal(one.carbs,20);assert.equal(one.fat,null);
  const second={...meal('b',8,null),totalCalories:null,totalProtein:10,totalCarbs:null,totalFat:3};
  const combined=dailyMealSummary([first,second],now);assert.equal(combined.protein,10);assert.equal(combined.carbs,20);assert.equal(combined.fat,3);assert.equal(combined.coverage.carbs.partial,true);assert.equal(combined.coverage.fat.partial,true);assert.equal(combined.coverage.protein.partial,false);
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

test("an explicit local clock changes the selected journal day and history across DST without rewriting records",()=>{
 const previous=process.env.TZ;
 try{
  process.env.TZ="America/New_York";
  const records=[{...meal("yesterday",8),loggedAt:"2026-03-09T03:50:00Z"},{...meal("today",9),loggedAt:"2026-03-09T04:01:00Z"}];
  const current=new Date("2026-03-09T04:05:00Z");
  assert.equal(localDayKey(current),"2026-2-9");
  assert.deepEqual(dailyMealSummary(records,current).meals.map(row=>row.id),["today"]);
  assert.deepEqual(loggingHistory(records,3,current).map(day=>day.count),[0,1,1]);
  assert.equal(records[0].loggedAt,"2026-03-09T03:50:00Z");
 }finally{if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous;}
});
