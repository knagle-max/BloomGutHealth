import test from 'node:test';import assert from 'node:assert/strict';import express from 'express';
import {gutReportInventory} from '../shared/biology-source-inventory';
import {registerPrecisionRoutes} from '../server/precision-routes';
import {contextSchema} from '../shared/precision-nutrition';import {defaultPreferences} from '../shared/meal-intelligence';
test('gut navigation inventory counts source documents, including qualitative and pending states, without fabricating measurements or mutating sources',()=>{
 assert.deepEqual(gutReportInventory([]),{saved:0,awaitingReview:0});const sources=[{processingStatus:'completed'},{processingStatus:'pending'},{processingStatus:'failed'},{processingStatus:'completed'}],before=JSON.stringify(sources);
 assert.deepEqual(gutReportInventory(sources),{saved:2,awaitingReview:2});assert.equal(JSON.stringify(sources),before);
});
test('actual precision HTTP inventory is owned and retains the quantitative-only selector; source failure never becomes zero reports',async()=>{
 let failed=false;const source={id:'synthetic-qualitative-a',userId:'a',processingStatus:'completed',testDate:new Date('2026-09-01'),structuredData:{schemaVersion:'bloom-report-v2',organisms:[{name:'Synthetic reported organism',reportedStatus:'reported_present',reportedAbundance:null}],capabilities:{quantitativeAbundance:false}}};
 const samples=[source,{...source,id:'synthetic-b',userId:'b',processingStatus:'pending'}];
 const app=express();app.use((req:any,_res,next)=>{req.session={userId:req.get('x-user')};next();});registerPrecisionRoutes(app,((req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401))as any,{getPrecisionContext:async()=>contextSchema.parse({}),getPrecisionRecords:async()=>[],getUser:async()=>({age:35,dietaryPreferences:defaultPreferences}),getUserSamples:async(owner:string)=>{if(failed)throw Error('PRIVATE_SOURCE_DRIVER');return samples.filter(row=>row.userId===owner);},getMeals:async()=>[]}as any);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${(server.address()as any).port}`;
 const get=(user='a',query='')=>fetch(base+'/api/precision'+query,{headers:{'x-user':user}});
 try{assert.equal((await get('')).status,401);const a=await(await get()).json();assert.deepEqual(a.gutReportInventory,{saved:1,awaitingReview:0});assert.equal(a.microbiome.report,null);assert.deepEqual(a.availableReports,[]);
  const b=await(await get('b')).json();assert.deepEqual(b.gutReportInventory,{saved:0,awaitingReview:1});assert.equal(JSON.stringify(b).includes('synthetic-qualitative-a'),false);
  assert.equal((await get('a','?sampleId=synthetic-qualitative-a')).status,404,'qualitative source cannot be passed off as a quantitative analysis');
  failed=true;const unavailable=await get();assert.equal(unavailable.status,503);const body=await unavailable.text();assert.equal(body.includes('gutReportInventory'),false);assert.equal(body.includes('PRIVATE_SOURCE_DRIVER'),false);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
