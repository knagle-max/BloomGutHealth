import test from 'node:test';
import assert from 'node:assert/strict';
import {lookupProductNutrition} from '../server/products';
import {productIngredient,type Product} from '../shared/products';
test('selected label snapshot retains canonical identity, serving and exact source values independently of later provider changes',async()=>{
 const current:Product={source:'usda-branded',id:'101',name:'Synthetic bar',brand:'Synthetic',barcode:'00012345678905',servingDescription:'1 bar (40 g)',servingGrams:40,perServing:{calories:200,protein_g:0},otherNutrients:[{name:'Declared extract',amount:1,unit:'mg'}],url:'https://fdc.nal.usda.gov/food-details/101/nutrients',retrievedAt:'2026-10-26T00:00:00Z',notes:['Original label'],provenance:{version:'usda-branded-v1',fdcId:101,gtin:'00012345678905',brandOwner:'Synthetic',marketCountry:'Canada',publishedDate:'2026-10-01',modifiedDate:null,ingredients:'Synthetic ingredients'}};
 const original=structuredClone(current),service:any={resolve:async(_ref:any,_store:any,userId:string)=>{assert.equal(userId,'owner');return [current];}};
 const store:any={getNutritionProducts:async()=>[]};
 const result=await lookupProductNutrition([productIngredient(current,2)],store,'owner',service);
 assert.deepEqual(result.productDetails[0].labelSnapshot,original);
 assert.equal(result.nutrients.find(n=>n.key==='calories')?.amount,400);assert.equal(result.nutrients.find(n=>n.key==='protein_g')?.amount,0);assert.equal(result.nutrients.find(n=>n.key==='sodium_mg')?.amount,null);
 const saved=JSON.parse(JSON.stringify(result));
 current.perServing.calories=999;current.perServing.sodium_mg=100;current.notes.push('Changed provider');current.provenance!.marketCountry='United States';current.otherNutrients![0].amount=99;
 assert.deepEqual(result.productDetails[0].labelSnapshot,original,'Snapshot must not alias mutable provider/cache data');assert.deepEqual(result,saved);
 const explicitNew=await lookupProductNutrition([productIngredient(current,2)],store,'owner',service);
 assert.equal(explicitNew.productDetails[0].labelSnapshot?.perServing.calories,999);assert.equal(saved.nutrients.find((n:any)=>n.key==='calories').amount,400);assert.equal(saved.productDetails[0].labelSnapshot.provenance.marketCountry,'Canada');
});

test('canonical meal persistence keeps original label values while a later explicit analysis uses changed source data',async()=>{
 const {PGlite}=await import('@electric-sql/pglite');const {drizzle}=await import('drizzle-orm/pglite');const {eq}=await import('drizzle-orm');const {meals}=await import('../shared/schema');const {insertMealWithReceipt,mealSaveReceipt}=await import('../server/meal-save');const {analyzeMeal,nutritionTotals}=await import('../server/meal-intelligence');
 const pg=new PGlite();await pg.exec(`CREATE TABLE meals(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real);`);const database=drizzle(pg);
 const label:Product={source:'manual',id:'private-label',name:'Private test bar',brand:'Synthetic',servingDescription:'1 bar',servingGrams:40,perServing:{calories:200,protein_g:0},url:null,retrievedAt:'2026-10-26T00:00:00Z',notes:[]};
 const store:any={getNutritionProducts:async()=>[label]},service:any={resolve:async()=>[label]};
 const analysis=()=>analyzeMeal('Private test bar',false,[productIngredient(label,2)],{store,userId:'owner',service});
 const read=async(id:string)=>(await database.select().from(meals).where(eq(meals.id,id)))[0];
 try{
  const original=await analysis();const saved=await insertMealWithReceipt(database as any,{userId:'owner',mealText:'Private test bar',...original,...nutritionTotals(original.nutritionalData)},mealSaveReceipt('owner','first-snapshot',{source:'private-label'}));
  label.perServing.calories=999;label.retrievedAt='2026-10-27T00:00:00Z';
  const later=await analysis();await insertMealWithReceipt(database as any,{userId:'owner',mealText:'Private test bar',...later,...nutritionTotals(later.nutritionalData)});
  const historical=await read(saved.id);assert.equal(historical.totalCalories,400);assert.equal((historical.intelligence as any).productDetails[0].labelSnapshot.perServing.calories,200);assert.equal((historical.intelligence as any).productDetails[0].labelSnapshot.retrievedAt,'2026-10-26T00:00:00Z');assert.equal(later.intelligence.productDetails![0].labelSnapshot!.perServing.calories,999);
  const legacy=structuredClone(original);delete legacy.intelligence.productDetails![0].labelSnapshot;
  const old=await insertMealWithReceipt(database as any,{userId:'owner',mealText:'Earlier analysis',...legacy,...nutritionTotals(legacy.nutritionalData)});assert.equal((await read(old.id)).intelligence?.productDetails?.[0]?.labelSnapshot,undefined,'Legacy analysis must not invent a snapshot from today’s label');
 }finally{await pg.close();}
});
