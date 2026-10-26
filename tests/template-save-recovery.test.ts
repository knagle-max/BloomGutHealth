import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {meals} from '../shared/schema';
import {insertMealWithReceipt} from '../server/meal-save';
import {registerExperienceRoutes} from '../server/experience-routes';

test('saved-template retry recovers the same meal despite removed source, rejects conflicting input and isolates owners',async()=>{
 const pg=new PGlite();await pg.exec(`CREATE TABLE meals(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real);`);
 const database=drizzle(pg);let sourceAvailable=true,reads=0;
 const store:any={getMeal:async(id:string)=>(await database.select().from(meals).where(eq(meals.id,id)))[0],insertMeal:(meal:any,receipt:any)=>insertMealWithReceipt(database as any,meal,receipt),getNutritionProducts:async()=>[],getExperienceRecords:async()=>{reads++;return sourceAvailable?[{id:'template',kind:'meal-template',payload:{name:'Banana',mealText:'100 g banana',ingredients:[{name:'banana',grams:100,preparation:'',assumption:''}]}}]:[];}};
 const app=express();app.use(express.json());
 const auth:any=(req:any,res:any,next:any)=>{req.session={userId:req.get('x-user')};return req.session.userId?next():res.sendStatus(401);};
 registerExperienceRoutes(app,auth,store,{} as any);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.on('listening',r));
 const root=`http://127.0.0.1:${(server.address() as any).port}/api/experience/templates/template/log`;
 const body={servings:1,mealType:'lunch',eatenAt:'2026-10-26T18:00:00Z'};
 const request=async(key:string|undefined,payload=body,user='a',templateId='template')=>{const res=await fetch(root.replace('/template/log','/'+templateId+'/log'),{method:'POST',headers:{'content-type':'application/json','x-user':user,...(key?{'Idempotency-Key':key}:{})},body:JSON.stringify(payload)});return {status:res.status,body:await res.json().catch(()=>null)};};
 try{
  const key=randomUUID();assert.equal((await request(key,body,'')).status,401);
  const first=await request(key);assert.equal(first.status,201);
  const replay=await request(key);assert.equal(replay.status,200);assert.equal(replay.body.id,first.body.id);assert.equal(reads,1);
  assert.equal((await request('invalid')).status,400);
  assert.equal((await request(key,{...body,servings:2})).status,409);
  assert.equal((await request(key,body,'a','different-template')).status,409);
  sourceAvailable=false;const recovered=await request(key);assert.equal(recovered.status,200);assert.equal(recovered.body.id,first.body.id);assert.equal(reads,1);
  assert.equal((await request(key,body,'b')).status,404);
  sourceAvailable=true;const other=await request(key,body,'b');assert.equal(other.status,201);assert.notEqual(other.body.id,first.body.id);assert.equal(other.body.userId,'b');
  const concurrent=randomUUID(),pair=await Promise.all([request(concurrent),request(concurrent)]);assert.ok(pair.every(r=>[200,201].includes(r.status)));assert.equal(pair[0].body.id,pair[1].body.id);
  const oldA=await request(undefined),oldB=await request(undefined);assert.notEqual(oldA.body.id,oldB.body.id);
  assert.equal((await database.select().from(meals)).length,5);
  sourceAvailable=false;let last;
  for(let i=0;i<31;i++)last=await request(randomUUID());
  assert.equal(last.status,429);
  assert.equal((await request(key)).body.id,first.body.id,'Committed recovery must not require another analysis allowance');
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();}
});
