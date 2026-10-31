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

test("small positive source nutrients survive portion scaling and daily aggregation without becoming measured zero", async()=>{
 const {scaleDatabaseNutrients}=await import('../shared/meal-intelligence');
 const nutrients=scaleDatabaseNutrients([{grams:5,foodNutrients:[{nutrient:{id:1178},amount:0.003},{nutrient:{id:1093},amount:0}]}],2);
 const b12=nutrients.find(n=>n.key==='vitamin_b12_ug')!;
 assert.equal(b12.amount,0.00015);assert.equal(b12.coverage,0.5);
 const rows=[{intelligence:{nutrients}},{nutritionalData:[{vitamin_b12_ug:0.00025,sodium_mg:0}]}];
 const original=structuredClone(rows),summary=mealNutritionSummary(rows);
 assert.ok(Math.abs(summary.totals.vitamin_b12_ug!-0.0004)<1e-15);
 assert.equal(summary.coverage.vitamin_b12_ug.partial,true);
 assert.equal(summary.totals.sodium,0);assert.equal(summary.totals.vitamin_d_ug,null);
 assert.equal(formatNutrientAmount(summary.totals.vitamin_b12_ug),'0.0004');assert.deepEqual(rows,original);
});

test("a private label's small known amount survives the merged meal estimate and history reader",async()=>{
 const {analyzeMeal}=await import('../server/meal-intelligence');
 const {recordedNutritionPeriod}=await import('../server/nutrition-history');
 const label={source:'manual' as const,id:'small-b12',name:'Synthetic source label',brand:'',servingDescription:'1 serving',servingGrams:1,perServing:{vitamin_b12_ug:0.0003,sodium_mg:0},retrievedAt:'2026-10-27',url:null,notes:[]};
 const ingredient={name:label.name,grams:0.5,preparation:'Selected label',assumption:'User selected',product:{source:'manual' as const,id:label.id,servings:0.5}};
 const result=await analyzeMeal('',false,undefined,{store:{getNutritionProducts:async()=>[label]},userId:'synthetic-precision',products:[ingredient]});
 const b12=result.intelligence.nutrients.find(n=>n.key==='vitamin_b12_ug')!;
 assert.equal(b12.amount,0.00015);assert.equal(b12.coverage,1);assert.equal(result.nutritionalData[0].vitamin_b12_ug,0.00015);
 const history=recordedNutritionPeriod([{...result,loggedAt:'2026-10-27T12:00:00Z'}]);
 assert.equal(history.totals.vitamin_b12_ug,0.00015);assert.equal(history.totals.sodium,0);assert.equal(history.totals.vitamin_d_ug,null);
 assert.equal(label.perServing.vitamin_b12_ug,0.0003);
});
