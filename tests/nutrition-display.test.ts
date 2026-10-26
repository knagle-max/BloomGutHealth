import test from "node:test";
import assert from "node:assert/strict";
import { energyAmount, foodMass, foodMassDraft, nutrientDisplay, formatNutrientAmount } from "../shared/nutrition-display";
import { mealNutritionSummary } from "../shared/nutrition-summary";

test("nutrition display keeps unknown, zero, partial coverage and stored kcal distinct", () => {
  const meals = [{ totalCalories: 500 }, { totalCalories: null }];
  const before = structuredClone(meals);
  const summary = mealNutritionSummary(meals);
  assert.equal(energyAmount(summary.totals.calories, "kJ"), "2092");
  assert.equal(summary.coverage.calories.partial, true);
  assert.equal(energyAmount(null, "kJ"), "Unavailable");
  assert.equal(energyAmount(undefined, "kcal"), "Unavailable");
  assert.equal(energyAmount(NaN, "kJ"), "Unavailable");
  assert.equal(energyAmount(0, "kJ"), "0");
  assert.equal(energyAmount(500, "kcal"), "500");
  assert.deepEqual(meals, before);
  assert.equal(summary.totals.calories, 500);
});

test("only canonical kcal energy is converted, with no inferred lab or label conventions", () => {
  assert.deepEqual(nutrientDisplay("calories", 500, "kcal", {energy:"kJ"}), {amount:2092,unit:"kJ"});
  assert.deepEqual(nutrientDisplay("calories", 2092, "kJ", {energy:"kJ"}), {amount:2092,unit:"kJ"});
  assert.deepEqual(nutrientDisplay("protein_g", 20, "g", {energy:"kJ"}), {amount:20,unit:"g"});
  assert.deepEqual(nutrientDisplay("glucose", 5, "mmol/L", {energy:"kJ"}), {amount:5,unit:"mmol/L"});
  assert.deepEqual(nutrientDisplay("calories", null, "kcal", {energy:"kJ"}), {amount:null,unit:"kJ"});
  const intake = nutrientDisplay("calories", 500, "kcal", {energy:"kJ"}).amount!;
  const target = nutrientDisplay("calories", 2000, "kcal", {energy:"kJ"}).amount!;
  assert.equal(intake / target, 0.25);
});

test("ounce portion entry preserves exact mass and rejects unfinished or unsupported drafts", () => {
  const grams = foodMassDraft("4", "oz")!;
  assert.equal(grams, 113.3980925);
  assert.equal(foodMass(grams, "oz"), "4 oz");
  assert.equal(foodMass(grams, "g"), "113.4 g");
  assert.equal(foodMassDraft(".5", "oz"), 14.1747615625);
  assert.equal(foodMassDraft("3000", "g"), 3000);
  assert.equal(foodMassDraft("105.83", "oz"), null);
  for (const draft of ["", ".", "4.", "0", "-1", "1e3", "4 cups", "Infinity", "3001"]) {
    assert.equal(foodMassDraft(draft, "g"), null, draft);
  }
  assert.equal(foodMass(null, "oz"), "Amount unknown");
  assert.equal(foodMass(0, "oz"), "0 oz");
});

test("positive nutrient amounts remain positive on overview and detail while true zero and unknown stay distinct",()=>{
 for(const value of [Number.MIN_VALUE,1e-9,0.00003,0.004,0.11,0.26,0.999])assert.ok(Number(formatNutrientAmount(value))>0);
 assert.equal(formatNutrientAmount(0.11),"0.11");assert.equal(formatNutrientAmount(0.26),"0.26");assert.equal(formatNutrientAmount(35.14),"35.1");assert.equal(formatNutrientAmount(0),"0");
 for(const value of [null,undefined,NaN,Infinity,-1])assert.equal(formatNutrientAmount(value),"Unavailable");
});
