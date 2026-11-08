import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {and,eq} from 'drizzle-orm';
import express from 'express';
import {meals} from '../shared/schema';
import {mealRecordRevision,mealEditReceipt,updateMealWithReview,MealEditConflict} from '../server/meal-edit';
import {registerPlannerRoutes} from '../server/planner-routes';

test('reviewed meal edit changes one owned row, preserves original date/receipt, rejects stale writes and replays only latest exact command',async()=>{
 const pg=new PGlite();await pg.exec('CREATE TABLE meals(id varchar PRIMARY KEY,user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real)');
 const database=drizzle(pg);const [original]=await database.insert(meals).values({id:'meal-a',userId:'a',mealText:'2 slices pizza',mealType:'dinner',loggedAt:new Date('2026-10-01T18:30:00Z'),mealContext:{_saveReceipt:'original-receipt',symptoms:{energy:0}},totalCalories:500}).returning();
 const revision=mealRecordRevision(original),receipt=mealEditReceipt('a',original.id,'key-1',{portion:1});
 try{
  assert.equal(await updateMealWithReview(database as any,original.id,'b',revision,{mealText:'foreign'},receipt),undefined);
  const changed=await updateMealWithReview(database as any,original.id,'a',revision,{mealText:'1 slice pizza',totalCalories:250},receipt);
  assert.equal(changed!.totalCalories,250);assert.equal(changed!.id,original.id);assert.equal(+changed!.loggedAt,+original.loggedAt);assert.equal((changed!.mealContext as any)._saveReceipt,'original-receipt');
  assert.equal((await updateMealWithReview(database as any,original.id,'a',revision,{mealText:'ignored replay'},receipt))!.mealText,'1 slice pizza');
  await assert.rejects(updateMealWithReview(database as any,original.id,'a',revision,{},mealEditReceipt('a',original.id,'key-1',{portion:2})),MealEditConflict);
  await assert.rejects(updateMealWithReview(database as any,original.id,'a',revision,{mealText:'stale'},mealEditReceipt('a',original.id,'key-2',{})),MealEditConflict);
  assert.equal((await database.select().from(meals)).length,1);
  const latestRevision=mealRecordRevision(changed!);
  const concurrent=await Promise.allSettled([1,2].map(index=>updateMealWithReview(database as any,original.id,'a',latestRevision,{totalCalories:100+index},mealEditReceipt('a',original.id,`race-${index}`,{index}))));
  assert.equal(concurrent.filter(result=>result.status==='fulfilled').length,1,'One original revision can authorize only one concurrent correction');
  assert.equal(concurrent.filter(result=>result.status==='rejected'&&result.reason instanceof MealEditConflict).length,1);
  await assert.rejects(updateMealWithReview(database as any,original.id,'a',revision,{},receipt),MealEditConflict,'An earlier receipt cannot replay across an intervening correction');
  await database.delete(meals).where(eq(meals.id,original.id));assert.equal(await updateMealWithReview(database as any,original.id,'a',revision,{},receipt),undefined);
 }finally{await pg.close();}
});

test('actual meal composer/review/update API rejects stale source and foreign targets; dropped-response replay bypasses changed source',async()=>{
 const pg=new PGlite();await pg.exec('CREATE TABLE meals(id varchar PRIMARY KEY,user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real)');const database=drizzle(pg);
 await database.insert(meals).values({id:'original',userId:'a',mealText:'100 g banana',mealType:'dinner',loggedAt:new Date('2026-10-01T18:00:00Z'),mealContext:{_saveReceipt:'retained'}});
 const store:any={getMeal:async(id:string,userId:string)=>(await database.select().from(meals).where(and(eq(meals.id,id),eq(meals.userId,userId))))[0],getExperienceRecords:async()=>[],getNutritionProducts:async()=>[],updateReviewedMeal:(id:string,userId:string,rev:string,updates:any,receipt:any)=>updateMealWithReview(database as any,id,userId,rev,updates,receipt)};
 let sourceChanged=false,analyses=0;const {analyzeMeal}=await import('../server/meal-intelligence');const analyzer:any=async(...args:any[])=>{analyses++;const result=await (analyzeMeal as any)(...args);if(sourceChanged)result.intelligence.ingredients[0].assumption+=' Changed source';return result;};
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')}as any;next();});registerPlannerRoutes(app,(req,res,next)=>req.session.userId?next():res.sendStatus(401),store,analyzer);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base=`http://127.0.0.1:${(server.address()as any).port}`;
 const request=(path:string,method='GET',body?:unknown,headers:Record<string,string>={})=>fetch(base+path,{method,headers:{'content-type':'application/json','x-user':'a',...headers},...(body?{body:JSON.stringify(body)}:{})});
 try{
  assert.equal((await request('/api/meals/original/composer','GET',undefined,{'x-user':'b'})).status,404);
  const loaded=await request('/api/meals/original/composer');assert.equal(loaded.headers.get('cache-control'),'no-store');const {revision}=await loaded.json();
  const preview=await request('/api/meals/review','POST',{mealText:'50 g banana'}),review=preview.headers.get('x-bloom-meal-review')!,analysis=await preview.json();
  const command={mealText:'50 g banana',ingredients:analysis.intelligence.ingredients,reviewed:true,expectedMealRevision:revision};const headers={'if-match':`"${review}"`,'idempotency-key':'bfe82e3b-c3d6-4a3d-9e68-1f6639cc2222'};
  assert.equal((await request('/api/meals/original/confirm','PUT',command)).status,400);
  sourceChanged=true;assert.equal((await request('/api/meals/original/confirm','PUT',command,headers)).status,409);assert.equal((await store.getMeal('original','a')).mealText,'100 g banana');
  sourceChanged=false;const saved=await request('/api/meals/original/confirm','PUT',command,headers);assert.equal(saved.status,200);const meal=await saved.json();assert.equal(meal.id,'original');assert.equal(meal.loggedAt,'2026-10-01T18:00:00.000Z');assert.equal(meal.mealType,'dinner');assert.equal(meal.mealContext._saveReceipt,'retained');
  sourceChanged=true;const count=analyses,replay=await request('/api/meals/original/confirm','PUT',command,headers);assert.equal(replay.status,200);assert.equal((await replay.json()).id,'original');assert.equal(analyses,count);
  assert.equal((await request('/api/meals/original/confirm','PUT',{...command,mealText:'different'},headers)).status,409);
  assert.equal((await request('/api/meals/original/confirm','PUT',command,{...headers,'idempotency-key':'bfe82e3b-c3d6-4a3d-9e68-1f6639cc3333'})).status,409);
  assert.equal((await request('/api/meals/original/confirm','PUT',command,{...headers,'x-user':'b'})).status,404);assert.equal((await database.select().from(meals)).length,1);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();}
});
