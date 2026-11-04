import test from 'node:test';import assert from 'node:assert/strict';
import {analyzeMeal,nutritionTotals} from '../server/meal-intelligence';
import {mealNutritionSummary} from '../shared/nutrition-summary';

test('fallback provider keeps literal source rows while canonical totals round once and invalid amounts remain unknown',async()=>{
 const originalFetch=globalThis.fetch,previousNinja=process.env.API_NINJAS_KEY,previousUSDA=process.env.USDA_FDC_API_KEY;
 process.env.API_NINJAS_KEY='offline-test';process.env.USDA_FDC_API_KEY='';
 let rows:any[]=[{calories:1.005,protein_g:-1,fat_total_g:0},{calories:.005,protein_g:1,fat_total_g:0}];let calls=0;
 globalThis.fetch=async(input:any)=>{assert.equal(new URL(String(input)).hostname,'api.api-ninjas.com');calls++;return{ok:true,json:async()=>structuredClone(rows)} as Response;};
 const ingredients=[{name:'Unknown offline provider fixture',grams:100,preparation:'Unknown',assumption:'Explicit mass; food identity unverified'}];
 try{
  const result=await analyzeMeal('Unknown offline provider fixture',false,ingredients);
  assert.equal(result.intelligence.status,'provider-estimate');assert.deepEqual(result.nutritionalData,rows,'Literal source rows retained');
  const totals=nutritionTotals(result.nutritionalData),summary=mealNutritionSummary([{...result,...totals}]);
  assert.equal(totals.totalCalories,1.01);assert.equal(totals.totalProtein,null);assert.equal(totals.totalFat,0);
  assert.equal(summary.totals.calories,1.01);assert.equal(summary.totals.protein,1);assert.equal(summary.coverage.protein.partial,true);assert.equal(summary.totals.fat,0);assert.equal(summary.totals.sodium,null);
  assert.equal(result.intelligence.nutrients.find(n=>n.key==='calories')!.amount,1.01);assert.equal(result.intelligence.nutrients.find(n=>n.key==='protein_g')!.coverage,.5);
  rows=[{calories:-1,protein_g:2}];const invalid=await analyzeMeal('Unknown offline provider fixture',false,ingredients);assert.deepEqual(invalid.nutritionalData,[]);assert.equal(nutritionTotals(invalid.nutritionalData).totalCalories,null);assert.equal(calls,2);
 }finally{globalThis.fetch=originalFetch;if(previousNinja===undefined)delete process.env.API_NINJAS_KEY;else process.env.API_NINJAS_KEY=previousNinja;if(previousUSDA===undefined)delete process.env.USDA_FDC_API_KEY;else process.env.USDA_FDC_API_KEY=previousUSDA;}
});
