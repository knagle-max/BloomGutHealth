import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import express from 'express';
import {meals} from '../shared/schema';
import {mealContextSchema} from '../shared/meal-intelligence';
import {insertMealWithReceipt,mealSaveReceipt} from '../server/meal-save';
import {deleteOwnedMeal,getOwnedMeal,getOwnedMeals,getOwnedMealSaveRecord,updateOwnedMeal} from '../server/meal-records';
import {mealEditReceipt,mealRecordRevision,updateMealWithReview} from '../server/meal-edit';
import {registerPlannerRoutes} from '../server/planner-routes';

test('a delayed save retry cannot recreate a deleted meal',async()=>{
 const pg=new PGlite();
 await pg.exec(`CREATE TABLE meals(id varchar PRIMARY KEY,user_id varchar NOT NULL,meal_text text NOT NULL,
 meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,
 intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real)`);
 const database=drizzle(pg) as any;
 const meal={userId:'synthetic-a',mealText:'Synthetic private meal',mealType:'lunch',totalCalories:420,
  loggedAt:new Date('2025-01-01T12:00:00Z'),mealContext:{eatenAt:'2025-01-01T12:00:00Z',symptoms:{energy:2},_editReceipt:{id:'old',fingerprint:'private-hash'}},
  nutritionalData:[{private:'source'}],intelligence:{private:'analysis'},totalProtein:12,totalCarbs:20,totalFat:15};
 const receipt=mealSaveReceipt(meal.userId,'synthetic-intent',meal);
 try{
  const original=await insertMealWithReceipt(database,meal,receipt);
  await deleteOwnedMeal(database,receipt.id,'foreign');
  assert.ok(await getOwnedMeal(database,receipt.id,meal.userId));
  await deleteOwnedMeal(database,receipt.id,meal.userId);
  assert.equal(await getOwnedMeal(database,receipt.id,meal.userId),undefined);
  await assert.rejects(insertMealWithReceipt(database,meal,receipt),/MEAL_SAVE_DELETED/);
  assert.equal(await getOwnedMeal(database,receipt.id,meal.userId),undefined);
  assert.deepEqual(await getOwnedMeals(database,meal.userId),[]);
  assert.equal(await getOwnedMealSaveRecord(database,receipt.id,'foreign'),undefined);
  const [spent]=await database.select().from(meals).where(eq(meals.id,receipt.id));
  assert.deepEqual(spent.mealContext,{_deletedSaveIntent:true});
  assert.equal(spent.mealText,'');assert.equal(spent.mealType,null);
  for(const key of ['nutritionalData','intelligence','totalCalories','totalProtein','totalCarbs','totalFat'])assert.equal(spent[key],null);
  assert.notEqual(+spent.loggedAt,+meal.loggedAt);
  assert.equal(await updateOwnedMeal(database,receipt.id,{mealText:'restore',mealContext:{}},meal.userId),undefined);
  assert.equal(await updateMealWithReview(database,receipt.id,meal.userId,mealRecordRevision(original),{mealText:'restore'},mealEditReceipt(meal.userId,receipt.id,'edit',{})),undefined);
  await deleteOwnedMeal(database,receipt.id,meal.userId);
  assert.deepEqual((await getOwnedMealSaveRecord(database,receipt.id,meal.userId))?.mealContext,{_deletedSaveIntent:true});
  assert.equal(mealContextSchema.safeParse({_deletedSaveIntent:true}).success,false);
  // A deliberate new save is distinct; the spent intent remains spent.
  const next=mealSaveReceipt(meal.userId,'new-intent',meal);
  await insertMealWithReceipt(database,meal,next);
  assert.equal((await getOwnedMeals(database,meal.userId)).length,1);
  // Legacy rows without receipts retain hard deletion.
  await database.insert(meals).values({id:'legacy',userId:meal.userId,mealText:'legacy'});
  await deleteOwnedMeal(database,'legacy',meal.userId);
  assert.equal((await database.select().from(meals).where(eq(meals.id,'legacy'))).length,0);
  // Either arrival order of an already-confirmed retry and deletion stays deleted.
  for(const deletionFirst of [false,true]){
   const racing=mealSaveReceipt(meal.userId,'race-'+deletionFirst,meal);
   await insertMealWithReceipt(database,meal,racing);
   const remove=()=>deleteOwnedMeal(database,racing.id,meal.userId),retry=()=>insertMealWithReceipt(database,meal,racing);
   const results=await Promise.allSettled(deletionFirst?[remove(),retry()]:[retry(),remove()]);
   assert.equal(results[deletionFirst?0:1].status,'fulfilled');
   assert.equal(await getOwnedMeal(database,racing.id,meal.userId),undefined);
   await assert.rejects(insertMealWithReceipt(database,meal,racing),/MEAL_SAVE_DELETED/);
  }
  // Account erasure still removes the spent intent along with all owned rows.
  await database.delete(meals).where(eq(meals.userId,meal.userId));
  assert.deepEqual(await database.select().from(meals),[]);
 }finally{await pg.close();}
});

test('HTTP save retry returns a terminal owned conflict without analysis after deletion',async()=>{
 const pg=new PGlite();await pg.exec(`CREATE TABLE meals(id varchar PRIMARY KEY,user_id varchar NOT NULL,meal_text text NOT NULL,
 meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,
 intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real)`);
 const database=drizzle(pg) as any;let analyses=0,unavailable=false;
 const store:any={getMeal:(id:string,user:string)=>getOwnedMeal(database,id,user),getMealSaveRecord:(id:string,user:string)=>getOwnedMealSaveRecord(database,id,user),
  insertMeal:(meal:any,receipt:any)=>insertMealWithReceipt(database,meal,receipt)};
 const app=express();app.use(express.json());
 registerPlannerRoutes(app,((req:any,_res:any,next:any)=>{req.session={userId:req.get('x-user')};next();})as any,store,
  (async()=>{analyses++;if(unavailable)throw Error('Synthetic outage');return{intelligence:{},nutritionalData:[]};})as any);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
 const base=`http://127.0.0.1:${(server.address()as any).port}`,key='fbd0226d-efaf-4992-bd6e-cc45faef03f0';
 const request=(user='a',text='Synthetic meal')=>fetch(base+'/api/meals',{method:'POST',headers:{'content-type':'application/json','x-user':user,'idempotency-key':key},body:JSON.stringify({mealText:text,mealType:'lunch'})});
 try{
  const first=await request();assert.equal(first.status,200);const saved=await first.json();
  await deleteOwnedMeal(database,saved.id,'a');unavailable=true;
  const replay=await request();assert.equal(replay.status,409);const result=await replay.json();assert.equal(result.code,'MEAL_SAVE_DELETED');
  assert.match(result.error,/new entry/);assert.equal(analyses,1);
  assert.equal((await request('a','changed body')).status,409);assert.equal(analyses,1);
  assert.equal((await fetch(base+`/api/meals/${saved.id}/composer`,{headers:{'x-user':'a'}})).status,404);
  unavailable=false;assert.equal((await request('b')).status,200);assert.equal(analyses,2);
  assert.deepEqual(await getOwnedMeals(database,'a'),[]);assert.equal((await getOwnedMeals(database,'b')).length,1);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();}
});
