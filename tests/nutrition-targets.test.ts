import test from 'node:test';import assert from 'node:assert/strict';import express from 'express';import {registerNutritionTargetRoutes,nutritionTargetReference} from '../server/nutrition-targets';
test('missing profile does not silently invent demographics for a personal nutrition target',async()=>{
 const app=express();app.use((req,_res,next)=>{req.session={userId:'synthetic-a'} as any;next();});registerNutritionTargetRoutes(app,(_req,_res,next)=>next(),{getUser:async()=>({id:'synthetic-a',age:null,sex:null,heightCm:null,weightKg:null,activityLevel:'moderate'})});const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));try{const response=await fetch(`http://127.0.0.1:${(server.address() as any).port}/api/nutrition/targets/synthetic-a`);assert.equal(response.status,200);const body=await response.json();assert.equal(body.basis?.kind,'example-reference');assert.equal(body.basis.usesProfile,false);assert.equal(response.headers.get('cache-control'),'no-store');}finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});

test('existing adult formula uses only complete actual inputs; unknown, minor, invalid and missing fields never inherit an assumed demographic',()=>{
 const male={age:30,sex:'male',heightCm:175,weightKg:75,activityLevel:'moderate'};
 const m=nutritionTargetReference({...male,password:'PRIVATE_PASSWORD_SENTINEL',id:'PRIVATE_ID_SENTINEL'});assert.equal(m.calories,2633);assert.equal(m.protein,120);assert.equal(m.carbs,296);assert.equal(m.fat,88);assert.equal(m.basis.kind,'profile-estimate');assert.equal(m.basis.usesProfile,true);assert.ok(!JSON.stringify(m).includes('PRIVATE_'));
 const f=nutritionTargetReference({age:30,sex:'female',heightCm:165,weightKg:65,activityLevel:'moderate'});assert.equal(f.calories,2124);assert.equal(f.protein,104);assert.equal(f.carbs,239);assert.equal(f.fat,71);
 for(const change of [{age:null},{age:17},{age:0},{sex:null},{sex:'unknown'},{weightKg:null},{heightCm:undefined},{activityLevel:undefined},{activityLevel:'guess'},{weightKg:NaN},{heightCm:Infinity},{age:'30'},{age:120,heightCm:1,weightKg:1}]){
  const result=nutritionTargetReference({...male,...change});assert.equal(result.basis.kind,'example-reference');assert.equal(result.basis.usesProfile,false);assert.equal(result.calories,2000);assert.ok(result.basis.inputsNeedingReview.length>0);
 }
 assert.deepEqual(nutritionTargetReference(null).basis.inputsNeedingReview,['profile']);
 const first=nutritionTargetReference({});first.calories=1;assert.equal(nutritionTargetReference({}).calories,2000);
});

test('target references require auth and exact owner before lookup, and never turn a missing account/storage failure into examples',async()=>{
 const app=express();app.use((req,_res,next)=>{req.session={userId:req.header('x-user')} as any;next();});let reads=0,mode='missing';registerNutritionTargetRoutes(app,(req,res,next)=>req.session.userId?next():void res.sendStatus(401),{getUser:async id=>{assert.equal(id,'synthetic-a');reads++;if(mode==='error')throw Error('PRIVATE_SQL_SENTINEL');return undefined;}});const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base=`http://127.0.0.1:${(server.address() as any).port}/api/nutrition/targets/`;
 try{assert.equal((await fetch(base+'synthetic-a')).status,401);assert.equal((await fetch(base+'other',{headers:{'x-user':'synthetic-a'}})).status,403);assert.equal(reads,0);assert.equal((await fetch(base+'synthetic-a',{headers:{'x-user':'synthetic-a'}})).status,404);mode='error';const failed=await fetch(base+'synthetic-a',{headers:{'x-user':'synthetic-a'}});assert.equal(failed.status,503);assert.ok(!(await failed.text()).includes('PRIVATE_SQL_SENTINEL'));assert.equal(reads,2);}finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
