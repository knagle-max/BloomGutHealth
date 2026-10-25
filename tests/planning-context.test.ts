import test from 'node:test';import assert from 'node:assert/strict';import express from 'express';
import {resolvePlanningContext} from '../server/planning-context';
import {registerPrecisionRoutes} from '../server/precision-routes';import {contextSchema} from '../shared/precision-nutrition';import {defaultPreferences} from '../shared/meal-intelligence';
test('a known minor Profile cannot be upgraded by adult planning context or a direct client context update',async()=>{
 const source=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true});let stored=structuredClone(source),inserts=0,profileAge=17;
 const historical={id:'synthetic-history',kind:'plan',payload:{type:'weekly-plan',name:'Historical snapshot',checksPassed:true,request:{targets:{protein:0}}},createdAt:new Date('2026-10-01T00:00:00Z')};
 const store:any={getPrecisionContext:async()=>stored,getPrecisionRecords:async()=>[historical],getUser:async()=>({age:profileAge,dietaryPreferences:defaultPreferences}),getUserSamples:async()=>[],getMeals:async()=>[],getMetabolites:async()=>[],putPrecisionContext:async(_id:string,value:any)=>{stored=value;},insertPrecisionRecord:async()=>{inserts++;throw Error('Plan must remain blocked');}};
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:'synthetic-minor'} as any;next();});registerPrecisionRoutes(app,(_req,_res,next)=>next(),store);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base=`http://127.0.0.1:${(server.address() as any).port}`;
 try{const response=await fetch(base+'/api/precision'),report=await response.json();assert.equal(report.context.ageGroup,'under18');assert.deepEqual(stored,source);assert.equal(report.plans[0].interpretationStatus,'historical_plan_not_revalidated');assert.deepEqual(report.plans[0].payload,historical.payload);assert.equal((historical as any).interpretationStatus,undefined);assert.deepEqual(report.recommendations,[]);assert.deepEqual(report.supplements,[]);assert.ok(report.safetyBlocks.some((flag:string)=>/under 18/i.test(flag)));
 const request={name:'Synthetic blocked adult plan',days:1,householdServings:1,targets:{calories:2200,protein:100,fiber:30,fiberMaximum:45,sodium:2300,saturatedFat:20},nutrientTargets:{},customRecipes:[],locked:{}};
 const post=(path:string,body:any)=>fetch(base+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
 const preview=await(await post('/api/precision/weekly-plans/preview',request)).json();assert.equal(preview.status,'blocked');assert.ok(preview.blocks.some((flag:string)=>/under 18/i.test(flag)));
 const today=await(await post('/api/precision/today-plan',{date:'2026-10-25',timezoneOffset:0,hour:12,plan:request})).json();assert.equal(today.status,'needs-context');assert.equal(today.meals.length,0);assert.ok(today.warnings.some((flag:string)=>/under 18/i.test(flag)));
 assert.equal((await post('/api/precision/weekly-plans/save',request)).status,422);assert.equal((await post('/api/precision/plans',{name:'No adult override'})).status,400);
 await fetch(base+'/api/precision/context',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(source)});assert.equal((await(await fetch(base+'/api/precision')).json()).context.ageGroup,'under18');assert.deepEqual(stored,source);assert.equal(inserts,0);profileAge=18;assert.equal((await(await fetch(base+'/api/precision')).json()).context.ageGroup,'adult');assert.equal((await(await post('/api/precision/weekly-plans/preview',request)).json()).status,'feasible');
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});

test('age consistency can only narrow planning context and never mutates or verifies either source',()=>{
 const adult=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true}),before=structuredClone(adult);
 for(const age of [1,17]){const result=resolvePlanningContext(adult,age);assert.equal(result.context.ageGroup,'under18');assert.equal(result.context.safetyReviewed,false);assert.ok(result.blocks.length);assert.deepEqual(result.ageSources,{nutritionProfile:'under18',precisionContext:'adult',effectivePlanningGroup:'under18'});}
 for(const age of [0,-1,121,NaN,Infinity,'17']){const result=resolvePlanningContext(adult,age);assert.equal(result.context.ageGroup,'unknown');assert.equal(result.context.safetyReviewed,false);assert.equal(result.ageSources.nutritionProfile,'invalid');}
 for(const age of [null,undefined,18,120]){const result=resolvePlanningContext(adult,age);assert.deepEqual(result.context,adult);assert.deepEqual(result.blocks,[]);}
 for(const ageGroup of ['under18','unknown'] as const){const source=contextSchema.parse({ageGroup});assert.equal(resolvePlanningContext(source,30).context.ageGroup,ageGroup);}
 assert.deepEqual(adult,before);
});
