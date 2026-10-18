import test from "node:test";
import assert from "node:assert/strict";
import { analyzeMeal, nutritionTotals } from "../server/meal-intelligence";
import { estimateMealIngredients } from "../shared/meal-portions";
import {
  summarizeMealNutrition,
  mealNutritionSummary,
} from "../shared/nutrition-summary";
const description =
  "2 chicken skewers, 1 beef skewer, lemon potatoes all bbq. Bag salad that came with dressing and croutons";
test("ordinary BBQ meal saves sourced macros and micros without AI or nutrition keys", async () => {
  const result = await analyzeMeal(description);
  assert.equal(result.intelligence.ingredients.length, 8);
  assert.deepEqual(
    result.intelligence.ingredients.slice(0, 4).map((i) => i.grams),
    [150, 75, 200, 85],
  );
  assert.equal(result.intelligence.foodMatches.length, 8);
  assert.ok(
    result.intelligence.ingredients.every((i) =>
      /Estimated/.test(i.assumption),
    ),
  );
  const totals = nutritionTotals(result.nutritionalData);
  assert.ok(totals.totalCalories! > 800 && totals.totalCalories! < 1000);
  assert.ok(totals.totalProtein! > 60);
  assert.ok(
    result.intelligence.nutrients.find((n) => n.key === "iron_mg")!.amount! > 0,
  );
  for (const n of result.intelligence.nutrients)
    if (n.coverage < 1)
      assert.equal(result.nutritionalData[0][n.key], undefined);
  assert.ok(
    result.intelligence.foodMatches.every((m) =>
      m.url.includes(String(m.fdcId)),
    ),
  );
});
test("explicit masses take precedence, repeated fats are not added and counts scale", () => {
  const parts = estimateMealIngredients(
    "200 g chicken, 3 beef skewers, 150 g lemon potatoes, 20 g olive oil",
  );
  assert.deepEqual(
    parts.map((i) => i.grams),
    [200, 225, 150, 20, 15],
  );
  assert.equal(parts.filter((i) => i.name === "Olive oil").length, 1);
  assert.equal(estimateMealIngredients("2 eggs")[0].grams, 100);
  assert.equal(estimateMealIngredients("1 cup brown rice")[0].grams, 180);
});
test("unknown foods, conflicting preparations, invalid masses and excluded extras are not silently filled", async () => {
  for (const text of [
    "mystery casserole",
    "999999 g chicken",
    "chicken pizza",
  ]) {
    const r = await analyzeMeal(text);
    assert.equal(nutritionTotals(r.nutritionalData).totalCalories, null, text);
  }
  const parts = estimateMealIngredients(
    "bag salad with no dressing and croutons",
  );
  assert.equal(
    parts.some((i) => i.name.includes("dressing")),
    false,
  );
  const partial = await analyzeMeal("1 chicken skewer, mystery sauce");
  assert.equal(nutritionTotals(partial.nutritionalData).totalCalories, null);
  assert.ok(
    partial.intelligence.nutrients.find((n) => n.key === "protein_g")!
      .coverage < 1,
  );
});
test("correcting a saved ingredient amount recalculates sourced totals", async () => {
  const original = await analyzeMeal(description);
  const corrected = await analyzeMeal(
    description,
    false,
    original.intelligence.ingredients.map((i) => ({
      ...i,
      grams: i.grams! * 2,
      assumption: "User-edited portion",
    })),
  );
  assert.equal(
    nutritionTotals(corrected.nutritionalData).totalCalories,
    Math.round(nutritionTotals(original.nutritionalData).totalCalories! * 200) /
      100,
  );
});
test("daily totals retain known contributions without inventing unavailable nutrients", () => {
  assert.equal(
    summarizeMealNutrition([{ totalCalories: null, nutritionalData: [] }])
      .calories,
    null,
  );
  assert.equal(
    summarizeMealNutrition([
      { totalCalories: 100, nutritionalData: [{ fiber_g: 0 }] },
    ]).fiber,
    0,
  );
  assert.equal(
    summarizeMealNutrition([
      { totalCalories: 100, nutritionalData: [{ fiber_g: 0 }] },
      { totalCalories: null, nutritionalData: [] },
    ]).fiber,
    0,
  );
  assert.equal(summarizeMealNutrition([]).calories, 0);
});
