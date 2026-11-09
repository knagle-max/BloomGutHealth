import test from "node:test";
import assert from "node:assert/strict";
import {captureNutrientSource,readNutrientSourceSnapshots} from "../shared/nutrient-source-snapshot";
import {analyzeMeal} from "../server/meal-intelligence";
import {catalogueFoods} from "../server/food-catalog";
import {mealReviewRevision} from "../server/meal-review-source";
import express from "express";
import {PGlite} from "@electric-sql/pglite";
import {drizzle} from "drizzle-orm/pglite";
import {eq} from "drizzle-orm";
import {meals} from "../shared/schema";
import {insertMealWithReceipt} from "../server/meal-save";
import {registerPlannerRoutes} from "../server/planner-routes";
import {randomUUID} from "node:crypto";

const input={sourceId:"fdc:999",sourceVersion:"Synthetic source fixture",sourceUrl:"https://fdc.nal.usda.gov/food-details/999/nutrients",ingredient:"Synthetic source",grams:100,per100g:{"1008":0,"1003":0.000001,"1106":5}};
test("source snapshots preserve native precision, reported zero and missing fields without equivalent conversion or verified-zero inference",()=>{
 const snapshot=captureNutrientSource(input),energy=snapshot.values.find(v=>v.key==="calories")!,protein=snapshot.values.find(v=>v.key==="protein_g")!,folate=snapshot.values.find(v=>v.key==="folate_ug")!;
 assert.equal(energy.sourceValuePer100g,0);assert.equal(energy.sourceReportsZero,true);assert.equal(energy.state,"estimated");
 assert.equal(protein.sourceValuePer100g,0.000001);assert.equal(protein.sourceReportsZero,false);
 assert.equal(folate.sourceValuePer100g,null);assert.equal(folate.sourceReportsZero,null);assert.equal(folate.state,"unknown");
 assert.equal(snapshot.values.find(v=>v.key==="vitamin_a_ug")!.sourceValuePer100g,5);assert.equal(snapshot.values.find(v=>v.key==="vitamin_a_ug")!.activityUnit,"µg RAE");
 assert.equal(snapshot.collectionDate,null);assert.equal(snapshot.values.length,21);
 const portion=captureNutrientSource({...input,grams:200});assert.deepEqual(portion.values,snapshot.values);assert.equal(portion.reviewedGrams,200);
 const mutable={...input,per100g:{...input.per100g}};const frozen=captureNutrientSource(mutable);mutable.per100g["1003"]=9;assert.equal(frozen.values.find(v=>v.key==="protein_g")!.sourceValuePer100g,0.000001);
});
test("legacy, malformed, foreign URLs, inconsistent zeros and duplicate fields never recreate a historical source",()=>{
 assert.equal(readNutrientSourceSnapshots(undefined).status,"not-captured");assert.deepEqual(readNutrientSourceSnapshots(undefined).snapshots,[]);
 const snapshot=captureNutrientSource(input);assert.equal(readNutrientSourceSnapshots([snapshot]).status,"available");
 for(const row of [{...snapshot,sourceUrl:"javascript:alert(1)"},{...snapshot,sourceUrl:"https://outside.example/source"},{...snapshot,sourceId:"fdc:1000"},{...snapshot,values:[snapshot.values[0],snapshot.values[0]]},{...snapshot,values:snapshot.values.map((v,i)=>i? v:{...v,state:"unknown"})}]){const result=readNutrientSourceSnapshots([row]);assert.equal(result.status,"unsupported");assert.deepEqual(result.snapshots,[]);}
 for(const invalid of [NaN,Infinity,-1]){const row=captureNutrientSource({...input,per100g:{"1008":invalid}}).values.find(v=>v.key==="calories")!;assert.equal(row.state,"unknown");assert.equal(row.sourceValuePer100g,null);}
});
test("actual analysis captures the selected raw source and fences source changes even when rounded totals are identical",async()=>{
 const first=await analyzeMeal("100 g pepperoni pizza"),snapshot=first.intelligence.nutrientSourceSnapshots![0];
 assert.ok(snapshot);assert.equal(snapshot.reviewedGrams,100);assert.equal(snapshot.values.length,21);
 const food=catalogueFoods.find(f=>`fdc:${f.fdcId}`===snapshot.sourceId)!;assert.ok(food);
 const original=food.per100g["1003"],hash=mealReviewRevision("a",first);
 try{
  food.per100g["1003"]=original+0.000000001;
  const changed=await analyzeMeal("100 g pepperoni pizza");assert.deepEqual(changed.intelligence.nutrients,first.intelligence.nutrients);
  assert.notEqual(mealReviewRevision("a",changed),hash,"Raw source changes are material even below display precision");
  assert.equal(snapshot.values.find(v=>v.key==="protein_g")!.sourceValuePer100g,original,"Earlier snapshot must not track the mutable catalogue");
 }finally{food.per100g["1003"]=original;}
 assert.equal(mealReviewRevision("a",await analyzeMeal("100 g pepperoni pizza")),hash);
});
test("actual reviewed source correction refuses stale save, freezes SQL source values, recovers exact replay and isolates another owner",async()=>{
 const pg=new PGlite();await pg.exec("CREATE TABLE meals(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real)");const db=drizzle(pg);
 const store:any={getMeal:async(id:string)=>(await db.select().from(meals).where(eq(meals.id,id)))[0],getMeals:(id:string)=>db.select().from(meals).where(eq(meals.userId,id)),insertMeal:(meal:any,receipt:any)=>insertMealWithReceipt(db as any,meal,receipt),getNutritionProducts:async()=>[],getExperienceRecords:async()=>[]};
 const app=express();app.use(express.json());registerPlannerRoutes(app,(req,_res,next)=>{req.session={userId:req.get("X-Fixture-Actor")||"a"}as any;next();},store);
 const server=app.listen(0,"127.0.0.1");await new Promise<void>(r=>server.once("listening",r));const base=`http://127.0.0.1:${(server.address()as any).port}`;
 const post=(path:string,body:any,extra:Record<string,string>={})=>fetch(base+path,{method:"POST",headers:{"content-type":"application/json",...extra},body:JSON.stringify(body)});
 let food:typeof catalogueFoods[number]|undefined,original:number|undefined;
 try{
  const review=await post("/api/meals/review",{mealText:"100 g pepperoni pizza"});assert.equal(review.status,200);const body=await review.json(),hash=review.headers.get("x-bloom-meal-review")!;
  const captured=body.intelligence.nutrientSourceSnapshots[0];food=catalogueFoods.find(f=>`fdc:${f.fdcId}`===captured.sourceId)!;original=food.per100g["1003"];
  food.per100g["1003"]=original+0.000000001;
  const command={mealText:"100 g pepperoni pizza",ingredients:body.intelligence.ingredients,reviewed:true};
  assert.equal((await post("/api/meals/confirm",command,{"If-Match":`"${hash}"`,"Idempotency-Key":randomUUID()})).status,409);assert.equal((await store.getMeals("a")).length,0);
  const refreshed=await post("/api/meals/review",{mealText:command.mealText,ingredients:command.ingredients}),freshBody=await refreshed.json(),freshHash=refreshed.headers.get("x-bloom-meal-review")!,key=randomUUID();
  const response=await post("/api/meals/confirm",command,{"If-Match":`"${freshHash}"`,"Idempotency-Key":key});assert.equal(response.status,200);const saved=await response.json();
  assert.deepEqual(saved.intelligence.nutrientSourceSnapshots,freshBody.intelligence.nutrientSourceSnapshots);
  assert.equal((await post("/api/meals/confirm",command,{"If-Match":`"${freshHash}"`,"Idempotency-Key":randomUUID(),"X-Fixture-Actor":"b"})).status,409);
  food.per100g["1003"]=original+1;
  const replay=await post("/api/meals/confirm",command,{"If-Match":`"${freshHash}"`,"Idempotency-Key":key});assert.equal(replay.status,200);assert.deepEqual((await replay.json()).intelligence.nutrientSourceSnapshots,saved.intelligence.nutrientSourceSnapshots);
  const reloaded=await store.getMeals("a");assert.equal(reloaded.length,1);assert.deepEqual(reloaded[0].intelligence.nutrientSourceSnapshots,saved.intelligence.nutrientSourceSnapshots);
  assert.equal((await store.getMeals("b")).length,0);
 }finally{if(food&&original!==undefined)food.per100g["1003"]=original;server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();}
});
