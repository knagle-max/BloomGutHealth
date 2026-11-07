import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {PGlite} from "@electric-sql/pglite";
import {drizzle} from "drizzle-orm/pglite";
import {and,eq} from "drizzle-orm";
import {randomUUID} from "node:crypto";
import {meals} from "../shared/schema";
import {ingredientSchema} from "../shared/meal-intelligence";
import {parseSchema,analyzeMeal} from "../server/meal-intelligence";
import {registerPlannerRoutes} from "../server/planner-routes";
import {insertMealWithReceipt} from "../server/meal-save";
import {getOwnedMeal} from "../server/meal-records";
import {catalogueFoods} from "../server/food-catalog";
const source={version:1,capture:"manual-portion",value:"4.000",unit:"oz"}as const;
const food=catalogueFoods.find(row=>/salmon/i.test(row.description))!;
const base={name:food.description.slice(0,120),grams:113.3980925,preparation:food.description.slice(0,120),assumption:"Synthetic manually entered portion",catalogue:{source:"usda-fndds",fdcId:food.fdcId}};
test("optional ingredient mass original is strict, bounded and canonically matched; legacy and AI parser never invent origins",()=>{
 assert.equal(ingredientSchema.parse(base).massEntry,undefined);assert.deepEqual(ingredientSchema.parse({...base,massEntry:source}).massEntry,source);
 for(const massEntry of[{...source,value:"4.001"},{...source,unit:"g"},{...source,value:"1e999"},{...source,value:"1e-999"},{...source,value:"4\n"},{...source,value:"1".repeat(129)},{...source,filename:"PrivateCanary"}])assert.equal(ingredientSchema.safeParse({...base,massEntry}).success,false);
 assert.equal(ingredientSchema.safeParse({...base,grams:null,massEntry:source}).success,false);
 const model=parseSchema.parse({ingredients:[{...base,massEntry:source}],clarificationQuestions:[]});assert.equal((model.ingredients[0]as any).massEntry,undefined);assert.equal((model.ingredients[0]as any).catalogue,undefined);
});
test("canonical server food resolution retains originals without changing source identity, grams or nutrition",async()=>{
 const before=await analyzeMeal("",false,[ingredientSchema.parse(base)]),after=await analyzeMeal("",false,[ingredientSchema.parse({...base,massEntry:source})]);
 assert.deepEqual(after.intelligence.ingredients[0].massEntry,source);assert.equal(after.intelligence.ingredients[0].catalogue!.fdcId,food.fdcId);assert.deepEqual(after.intelligence.nutrients,before.intelligence.nutrients);assert.deepEqual(after.nutritionalData,before.nutritionalData);
});
test("actual review/confirm HTTP and owned SQL reload retain original mass with review-bound idempotency and no duplicate meal",async()=>{
 const pg=new PGlite();await pg.exec("CREATE TABLE meals(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real)");const db=drizzle(pg);
 const store:any={getMeal:(id:string,user:string)=>getOwnedMeal(db as any,id,user),getMeals:(user:string)=>db.select().from(meals).where(eq(meals.userId,user)),getExperienceRecords:async()=>[],getNutritionProducts:async()=>[],insertMeal:(row:any,receipt:any)=>insertMealWithReceipt(db as any,row,receipt)};
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get("x-user")}as any;next();});registerPlannerRoutes(app,(req,res,next)=>req.session.userId?next():void res.sendStatus(401),store);
 const server=app.listen(0,"127.0.0.1");await new Promise<void>(resolve=>server.once("listening",resolve));const root=`http://127.0.0.1:${(server.address()as any).port}`;
 const body={mealText:"Synthetic source portion",ingredients:[{...base,massEntry:source}],mealType:"lunch",aiConsent:false};
 const request=(path:string,payload:unknown,revision?:string,key?:string,user="a")=>fetch(root+path,{method:"POST",headers:{"content-type":"application/json","x-user":user,...(revision?{"If-Match":`"${revision}"`}:{}),...(key?{"Idempotency-Key":key}:{})},body:JSON.stringify(payload)});
 try{
  const preview=await request("/api/meals/review",body);assert.equal(preview.status,200);const revision=preview.headers.get("x-bloom-meal-review")!,analysis=await preview.json();assert.deepEqual(analysis.intelligence.ingredients[0].massEntry,source);assert.equal((await store.getMeals("a")).length,0);
  const key=randomUUID(),saved=await request("/api/meals/confirm",{...body,reviewed:true},revision,key);assert.equal(saved.status,200);const row=await saved.json();
  const owned=await getOwnedMeal(db as any,row.id,"a");assert.deepEqual((owned!.intelligence as any).ingredients[0].massEntry,source);assert.equal(await getOwnedMeal(db as any,row.id,"b"),undefined);
  const retry=await request("/api/meals/confirm",{...body,reviewed:true},revision,key);assert.equal(retry.status,200);assert.equal((await retry.json()).id,row.id);assert.equal((await store.getMeals("a")).length,1);
  const mismatch=await request("/api/meals/review",{...body,ingredients:[{...base,grams:100,massEntry:source}]});assert.equal(mismatch.status,400);
  const changedOriginal=await request("/api/meals/confirm",{...body,reviewed:true,ingredients:[{...base,massEntry:{...source,value:"4.0"}}]},revision,key);assert.equal(changedOriginal.status,409);assert.equal((await store.getMeals("b")).length,0);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();}
});
