import test from'node:test';import assert from'node:assert/strict';import express from'express';import{PGlite}from'@electric-sql/pglite';import{drizzle}from'drizzle-orm/pglite';import{getOwnedMeal,updateOwnedMeal,deleteOwnedMeal}from'../server/meal-records';import{registerPlannerRoutes}from'../server/planner-routes';import{requireActiveAccount}from'../server/account-auth';
const create=async()=>{const pg=new PGlite();await pg.exec("CREATE TABLE meals(id varchar PRIMARY KEY,user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real);INSERT INTO meals(id,user_id,meal_text,total_calories)VALUES('meal-a','a','Synthetic A',0),('meal-b','b','Synthetic B',20)");return{pg,database:drizzle(pg)as any};};
test('individual meal storage requires owner in every SQL read/update/delete and rejects identity reassignment',async()=>{
 const{pg,database}=await create();try{
  assert.equal(await getOwnedMeal(database,'meal-b','a'),undefined);assert.equal((await getOwnedMeal(database,'meal-a','a'))?.totalCalories,0);
  assert.equal(await updateOwnedMeal(database,'meal-b',{mealText:'Tampered'},'a'),undefined);await deleteOwnedMeal(database,'meal-b','a');assert.equal((await getOwnedMeal(database,'meal-b','b'))?.mealText,'Synthetic B');
  await assert.rejects(updateOwnedMeal(database,'meal-a',{userId:'b'}as any,'a'),/ownership cannot be changed/);await assert.rejects(updateOwnedMeal(database,'meal-a',{id:'meal-b'}as any,'a'),/ownership cannot be changed/);
  const updated=await updateOwnedMeal(database,'meal-a',{mealText:'Reviewed A',totalCalories:0},'a');assert.equal(updated?.userId,'a');assert.equal(updated?.totalCalories,0);
  let calls=0;const noAccess={select(){calls++;throw Error('Unexpected read');},update(){calls++;throw Error('Unexpected update');},delete(){calls++;throw Error('Unexpected deletion');}}as any;
  await assert.rejects(getOwnedMeal(noAccess,'meal-a',undefined as any),/Account context/);await assert.rejects(updateOwnedMeal(noAccess,'meal-a',{mealText:'x'},''),/Account context/);await assert.rejects(deleteOwnedMeal(noAccess,'meal-a',undefined as any),/Account context/);assert.equal(calls,0);
  await deleteOwnedMeal(database,'meal-a','a');assert.equal(await getOwnedMeal(database,'meal-a','a'),undefined);assert.equal((await getOwnedMeal(database,'meal-b','b'))?.mealText,'Synthetic B');
 }finally{await pg.close();}
});
test('actual correction route supplies session owner and does not remember an update deleted during analysis',async()=>{
 const{pg,database}=await create();let analyses=0,memories=0;
 const store:any={getMeal:(id:string,owner:string)=>getOwnedMeal(database,id,owner),updateMeal:(id:string,updates:any,owner:string)=>updateOwnedMeal(database,id,updates,owner),getExperienceRecords:async()=>[],getNutritionProducts:async()=>[],insertExperienceRecord:async()=>{memories++;}};
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')}as any;next();});registerPlannerRoutes(app,requireActiveAccount(async id=>['a','b'].includes(id)),store,(async()=>{analyses++;await deleteOwnedMeal(database,'meal-a','a');return{nutritionalData:[],intelligence:{ingredients:[]}};})as any);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base=`http://127.0.0.1:${(server.address()as any).port}`;
 const update=(id:string,owner='a',extra={})=>fetch(base+'/api/meals/'+id,{method:'PUT',headers:{'content-type':'application/json',...(owner?{'x-user':owner}:{})},body:JSON.stringify({mealText:'100 g banana',aiConsent:false,ingredients:[{name:'banana',grams:100,preparation:'',assumption:''}],...extra})});
 try{
  assert.equal((await update('meal-a','')).status,401);assert.equal((await update('meal-b')).status,404);assert.equal(analyses,0);assert.equal((await update('meal-a','a',{userId:'b'})).status,400);assert.equal(analyses,0);
  const deleted=await update('meal-a');assert.equal(deleted.status,404);assert.match((await deleted.json()).error,/Meal not found/);assert.equal(analyses,1);assert.equal(memories,0);assert.equal((await getOwnedMeal(database,'meal-b','b'))?.mealText,'Synthetic B');
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();}
});
