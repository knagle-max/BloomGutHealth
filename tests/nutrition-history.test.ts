import test from 'node:test';import assert from 'node:assert/strict';import express from 'express';
import {registerNutritionHistoryRoutes} from '../server/nutrition-history';
test('historical nutrition never converts missing meal values into zero or ignores sourced intelligence',async()=>{
 const app=express();app.use((req,_res,next)=>{req.session={userId:req.header('x-user')} as any;next();});
 const meals=[{loggedAt:'2026-10-01T12:00:00Z',totalCalories:null,totalProtein:0,totalCarbs:null,totalFat:null,intelligence:{nutrients:[{key:'fiber_g',amount:4,coverage:0.5}]},nutritionalData:[]}];
 let reads=0;registerNutritionHistoryRoutes(app,(req,res,next)=>req.session.userId?next():void res.sendStatus(401),{getMeals:async id=>{assert.equal(id,'synthetic-a');reads++;return meals;}});
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base=`http://127.0.0.1:${(server.address() as any).port}`;
 try{
  for(const period of ['monthly','yearly']){
   const path=`/api/nutrition/${period}/synthetic-a?year=2026${period==='monthly'?'&month=9':''}`;
   assert.equal((await fetch(base+path)).status,401);
   const response=await fetch(base+path,{headers:{'x-user':'synthetic-a'}}),body=await response.json();
   assert.equal(body.totals.calories,null);assert.equal(body.dailyAverages.calories,null);assert.equal(body.totals.protein,0);assert.equal(body.dailyAverages.protein,0);assert.equal(body.totals.fiber,4);assert.equal(body.dailyAverages.fiber,4);
   assert.equal(body.nutritionCoverage.fiber.partial,true);assert.equal(response.headers.get('cache-control'),'no-store');
   if(period==='yearly'){assert.equal(body.monthlyBreakdown[0].avgCalories,null);assert.equal(body.monthlyBreakdown[0].avgProtein,0);}
  }
  assert.equal(reads,2);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});

test('history periods validate strict dates, use explicit UTC boundaries, preserve denominators and deny cross-account reads before storage',async()=>{
 const app=express();app.use((req,_res,next)=>{req.session={userId:'synthetic-a'} as any;next();});let fail=false,reads=0;
 const rows=[{loggedAt:'2026-09-30T23:59:59.999Z',totalCalories:999},{loggedAt:'2026-10-01T00:00:00Z',totalCalories:100,totalProtein:10},{loggedAt:'2026-10-01T23:59:59Z',totalCalories:null,totalProtein:null},{loggedAt:'2026-10-03T12:00:00Z',totalCalories:300,totalProtein:30},{loggedAt:'2026-11-01T00:00:00Z',totalCalories:999},{loggedAt:'invalid',totalCalories:999}];
 registerNutritionHistoryRoutes(app,(_req,_res,next)=>next(),{getMeals:async()=>{reads++;if(fail)throw Error('PRIVATE_SQL_SENTINEL');return rows;}});
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base=`http://127.0.0.1:${(server.address() as any).port}/api/nutrition`;
 try{
  assert.equal((await fetch(base+'/monthly/other?year=2026&month=9')).status,403);assert.equal(reads,0);
  for(const query of ['year=2026x&month=9','year=2026&month=12','year=2026&month=-1','year=2026&month=9&month=8','year=NaN','year=2026&month=9&userId=other'])assert.equal((await fetch(base+'/monthly/synthetic-a?'+query)).status,400);
  assert.equal(reads,0);
  const body=await(await fetch(base+'/monthly/synthetic-a?year=2026&month=9')).json();assert.equal(body.calendar,'UTC');assert.equal(body.totalDays,31);assert.equal(body.totalMeals,3);assert.equal(body.daysWithMeals,2);assert.equal(body.totals.calories,400);assert.equal(body.dailyAverages.calories,200);const padded=await(await fetch(base+'/monthly/synthetic-a?year=2026&month=09')).json();assert.equal(padded.month,9);assert.equal(padded.totals.calories,400);assert.deepEqual(body.nutritionCoverage.calories,{knownMeals:2,completeMeals:2,totalMeals:3,partial:true});
  const empty=await(await fetch(base+'/monthly/synthetic-a?year=2025&month=1')).json();assert.equal(empty.totalDays,28);assert.equal(empty.daysWithMeals,0);assert.equal(empty.dailyAverages,null);
  const leap=await(await fetch(base+'/monthly/synthetic-a?year=2024&month=1')).json();assert.equal(leap.totalDays,29);
  fail=true;const broken=await fetch(base+'/yearly/synthetic-a?year=2026');assert.equal(broken.status,503);assert.ok(!(await broken.text()).includes('PRIVATE_SQL_SENTINEL'));
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
