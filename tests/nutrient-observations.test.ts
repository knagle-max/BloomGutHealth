import test from "node:test";
import assert from "node:assert/strict";
import {captureNutrientSource} from "../shared/nutrient-source-snapshot";
import {recordedNutrientObservations} from "../shared/nutrient-observations";
import {analyzeMeal} from "../server/meal-intelligence";
const meal={id:"saved-meal",userId:"a",loggedAt:"2026-11-07T12:30:00Z"};
const snapshot=(grams=200)=>captureNutrientSource({sourceId:"fdc:999",sourceVersion:"Synthetic native fixture",sourceUrl:"https://fdc.nal.usda.gov/food-details/999/nutrients",ingredient:"Synthetic source",grams,per100g:{"1003":10,"1093":0}});
test("saved generic contribution reuses canonical portion calculation and separates source zero, unknown, native amount and record time",async()=>{
 const analysis=(await analyzeMeal("100 g pepperoni pizza")).intelligence;analysis.nutrientSourceSnapshots=[snapshot()];const original=JSON.stringify(analysis);
 const view=recordedNutrientObservations(analysis,meal,"a");assert.equal(view.status,"available");assert.equal(view.observations.length,21);
 const protein=view.observations.find(v=>v.nutrientKey==="protein_g")!,sodium=view.observations.find(v=>v.nutrientKey==="sodium_mg")!,folate=view.observations.find(v=>v.nutrientKey==="folate_ug")!;
 assert.equal(protein.amount,20);assert.equal(protein.nativeAmountPer100g,10);assert.equal(protein.unit,"g");assert.equal(protein.state,"estimated");assert.equal(protein.valueKind,"recorded_source_contribution");assert.equal(protein.mealId,meal.id);assert.equal(protein.occurredAt,"2026-11-07T12:30:00.000Z");assert.equal(protein.dateBasis,"meal-record-time");
 assert.equal(sodium.amount,0);assert.equal(sodium.sourceReportsZero,true);assert.equal(sodium.state,"estimated");assert.equal(folate.amount,null);assert.equal(folate.state,"unknown");
 assert.ok(view.observations.every(v=>v.adequacyAssessment===false&&v.state!=="verified_zero"));assert.equal(JSON.stringify(analysis),original);
 const half=structuredClone(analysis);half.nutrientSourceSnapshots![0].reviewedGrams=50;assert.equal(recordedNutrientObservations(half,meal,"a").observations.find(v=>v.nutrientKey==="protein_g")!.amount,5);
});
test("foreign scope, legacy source absence, unsupported definitions and unit conflict never invent a contribution or historical date",async()=>{
 const analysis=(await analyzeMeal("100 g pepperoni pizza")).intelligence;analysis.nutrientSourceSnapshots=[snapshot()];
 assert.deepEqual(recordedNutrientObservations(analysis,meal,"b").observations,[]);assert.deepEqual(recordedNutrientObservations(analysis,meal,undefined).observations,[]);
 const legacy={...analysis,nutrientSourceSnapshots:undefined};assert.equal(recordedNutrientObservations(legacy,meal,"a").status,"not-captured");
 const badUnit=structuredClone(analysis);badUnit.nutrientSourceSnapshots![0].values.find(v=>v.key==="protein_g")!.unit="mg";
 const conflict=recordedNutrientObservations(badUnit,meal,"a").observations.find(v=>v.nutrientKey==="protein_g")!;assert.equal(conflict.amount,null);assert.equal(conflict.state,"conflicting");assert.equal(conflict.nativeAmountPer100g,10);assert.equal(conflict.nativeUnit,"mg");
 const future=structuredClone(analysis);future.nutrientSourceSnapshots![0].definitionVersion="unsupported-definition";assert.ok(recordedNutrientObservations(future,meal,"a").observations.every(v=>v.amount===null));
 for(const loggedAt of [undefined,null,"","invalid","0","2026-11-07","2026-02-31T12:30:00Z","2025-02-29T12:30:00Z",new Date(NaN)]){
  const unknownDate=recordedNutrientObservations(analysis,{...meal,loggedAt},"a");assert.ok(unknownDate.observations.every(v=>v.occurredAt===null&&v.dateBasis==="not-recorded"));
 }
});
