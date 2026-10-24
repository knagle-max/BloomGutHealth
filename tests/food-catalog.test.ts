import test from "node:test";
import assert from "node:assert/strict";
import { catalogueFoods, findFoodCandidates } from "../server/food-catalog";
import { analyzeMeal, nutritionTotals } from "../server/meal-intelligence";
import { mealNutritionSummary } from "../shared/nutrition-summary";
const burger =
  "Two frozen hamburger patties that were bbqd, no buns. With American cheese, ketchup and relish";
test("whole sourced catalogue supports varied foods without recipe-specific totals", async () => {
  assert.equal(catalogueFoods.length, 5431);
  for (const text of [
    "1 banana and yogurt",
    "2 slices whole wheat toast with peanut butter",
    "1 cup macaroni and cheese",
    "1 apple, 2 tbsp peanut butter",
    "a bowl of oatmeal with berries",
    "200 g pizza",
    "1 cup cottage cheese and blueberries",
    "2 fried eggs and bacon",
    "a baked potato with sour cream",
  ]) {
    const result = await analyzeMeal(text);
    assert.ok(nutritionTotals(result.nutritionalData).totalCalories! > 0, text);
    assert.ok(
      result.intelligence.foodMatches.every(
        (m) =>
          catalogueFoods.some((f) => f.fdcId === m.fdcId) ||
          m.url.includes(String(m.fdcId)),
      ),
    );
  }
  assert.match(findFoodCandidates("banana")[0].description, /raw/i);
  assert.match(findFoodCandidates("apple")[0].description, /raw/i);
  assert.doesNotMatch(
    findFoodCandidates("fried chicken")[0].description,
    /meatless/i,
  );
  assert.doesNotMatch(
    findFoodCandidates("pizza")[0].description,
    /dessert|mexican|stuffed/i,
  );
  assert.equal(findFoodCandidates("mystery foobar sauce").length, 0);
});
test("burger counts, no-bun exclusion and condiments resolve independently", async () => {
  const result = await analyzeMeal(burger);
  assert.equal(result.intelligence.ingredients.length, 4);
  assert.equal(result.intelligence.ingredients[0].name, "Beef, ground, patty");
  assert.equal(result.intelligence.ingredients[0].grams, 170);
  assert.ok(
    result.intelligence.ingredients.some((i) => i.name === "Cheese, American"),
  );
  assert.ok(
    result.intelligence.ingredients.some((i) => i.name === "Relish, pickle"),
  );
  assert.ok(
    !result.intelligence.foodMatches.some((i) =>
      /bun|bread|sandwich/i.test(i.description),
    ),
  );
  assert.ok(nutritionTotals(result.nutritionalData).totalProtein! > 30);
  const corrected = await analyzeMeal(
    burger,
    false,
    result.intelligence.ingredients.map((i, index) =>
      index === 0 ? { ...i, grams: 200 } : i,
    ),
  );
  assert.equal(
    corrected.intelligence.foodMatches[0].fdcId,
    result.intelligence.foodMatches[0].fdcId,
  );
  assert.ok(
    nutritionTotals(corrected.nutritionalData).totalCalories! >
      nutritionTotals(result.nutritionalData).totalCalories!,
  );
});
test("explicit household quantities, masses and unknown units do not silently become another portion", async () => {
  const result = await analyzeMeal(
    "2 tablespoons ketchup, 100 g American cheese",
  );
  assert.deepEqual(
    result.intelligence.ingredients.map((i) => i.grams),
    [34, 100],
  );
  assert.equal(
    (await analyzeMeal("999999 g ketchup")).intelligence.ingredients[0].grams,
    null,
  );
  assert.equal(
    (await analyzeMeal("-50 g ketchup")).intelligence.ingredients[0].grams,
    null,
  );
  const unknown = await analyzeMeal("2 slices ketchup");
  assert.equal(unknown.intelligence.ingredients[0].grams, null);
});
test("known components and known meals survive unavailable components and nutrients", async () => {
  const partial = await analyzeMeal(
    "100 g American cheese and mystery foobar sauce",
  );
  assert.equal(nutritionTotals(partial.nutritionalData).totalCalories, null);
  const knownMeal = {
    totalCalories: 300,
    totalProtein: 20,
    nutritionalData: [{ fiber_g: 4 }],
  };
  const missingMeal = {
    totalCalories: null,
    totalProtein: null,
    nutritionalData: [],
  };
  const summary = mealNutritionSummary([knownMeal, missingMeal]);
  assert.equal(summary.totals.calories, 300);
  assert.equal(summary.totals.fiber, 4);
  assert.equal(summary.coverage.calories.partial, true);
  const withPartial = mealNutritionSummary([
    knownMeal,
    { ...missingMeal, intelligence: partial.intelligence },
  ]);
  assert.ok(withPartial.totals.calories! > 300);
  assert.equal(withPartial.coverage.calories.knownMeals, 2);
  assert.equal(withPartial.coverage.calories.completeMeals, 1);
});

test("local day boundaries include Regina evening meals on the same calendar day", async () => {
  const { localDayBounds } = await import("../shared/nutrition-summary");
  const bounds = localDayBounds("2026-10-17", 360);
  assert.equal(bounds.startOfDay.toISOString(), "2026-10-17T06:00:00.000Z");
  assert.equal(bounds.endOfDay.toISOString(), "2026-10-18T05:59:59.999Z");
  const evening = new Date("2026-10-18T02:59:00Z");
  assert.ok(evening >= bounds.startOfDay && evening <= bounds.endOfDay);
  assert.throws(() => localDayBounds("2026-02-30", 360));
  assert.throws(() => localDayBounds("2026-10-17", 9999));
});

test("AI consent gates requests and quota failures expose a safe local-fallback notice", async () => {
  const { parseMeal } = await import("../server/meal-intelligence");
  const previousFetch = globalThis.fetch,
    previousKey = process.env.OPENAI_API_KEY,
    previousModel = process.env.OPENAI_SCIENCE_MODEL;
  let calls = 0;
  try {
    process.env.OPENAI_API_KEY = "synthetic-test-key";
    process.env.OPENAI_SCIENCE_MODEL = "gpt-5-mini";
    globalThis.fetch = async () => {
      calls++;
      return new Response(
        JSON.stringify({
          error: {
            type: "insufficient_quota",
            code: "insufficient_quota",
            message: "PRIVATE_PROVIDER_SENTINEL",
          },
        }),
        { status: 429, headers: { "content-type": "application/json" } },
      );
    };
    await parseMeal("mystery xyz sauce", false);
    assert.equal(calls, 0);
    const fallback = await parseMeal("mystery xyz sauce", true);
    assert.equal(calls, 1);
    assert.equal(fallback.parser, "rules");
    assert.match(fallback.parserNotice!, /insufficient API quota/);
    assert.ok(!fallback.parserNotice!.includes("PRIVATE_PROVIDER_SENTINEL"));
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_SCIENCE_MODEL;
    else process.env.OPENAI_SCIENCE_MODEL = previousModel;
  }
});
