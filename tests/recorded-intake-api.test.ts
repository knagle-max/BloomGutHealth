import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {registerRecordedIntakeSourceRoutes} from '../server/recorded-intake-sources';
import {supplementIntakeSchema} from '../shared/supplement-intake';

test('recorded source HTTP projection scopes canonical calls, keeps current events only and fails closed on source outages or foreign feed',async()=>{
 const intent='11111111-1111-4111-8111-111111111111',value={takenAt:'2026-11-17T12:00:00Z',confirmedAt:'2026-11-17T12:01:00Z',confirmedTaken:true,servings:2,label:{source:'manual',id:'label',name:'Synthetic',brand:'Synthetic',servingDescription:'1 capsule',servingGrams:null,perServing:{iron_mg:10,protein_g:0},retrievedAt:'2026-11-16T12:00:00Z',url:null,notes:[]},mineralBasis:{iron_mg:'elemental-label',magnesium_mg:'unknown',zinc_mg:'unknown'},formulation:{labelVersion:null,batch:null}};
 const payload=supplementIntakeSchema.parse({version:1,valueKind:'confirmed-supplement-consumption',intentId:intent,revision:intent,lifecycleId:'33333333-3333-4333-8333-333333333333',original:value,current:value,corrections:[]});
 let fail=false,foreign=false,calls:string[]=[];
 const store={getMeals:async(owner:string)=>{calls.push('food:'+owner);if(fail)throw Error('PRIVATE_DATABASE_DETAIL');return[];},getExperienceRecords:async(owner:string,kind:string)=>{calls.push(kind+':'+owner);return owner==='a'?[{id:'a'.repeat(64),kind:'supplement-intake',payload,createdAt:value.confirmedAt,updatedAt:value.confirmedAt,...(foreign?{userId:'b'}:{})}]:[];}};
 const app=express();app.use('/api/experience',(req,res,next)=>{res.setHeader('cache-control','no-store');const owner=req.get('x-synthetic-owner');if(!['a','b'].includes(owner??''))return res.sendStatus(401);req.session={userId:owner}as any;next();});registerRecordedIntakeSourceRoutes(app,store as any,()=>new Date('2026-11-18T00:00:00Z'));
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const path=`http://127.0.0.1:${(server.address()as any).port}/api/experience/recorded-intake-sources?date=2026-11-17&timeZone=America%2FRegina&nutrientKey=iron_mg`;
 const get=(owner='a',suffix='')=>fetch(path+suffix,{headers:{'x-synthetic-owner':owner}});
 try{
  assert.equal((await get('')).status,401);assert.equal(calls.length,0);
  let response=await get();assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');let body=await response.json();assert.equal(body.userId,'a');assert.equal(body.events.length,1);assert.equal(body.events[0].rows.length,1);assert.equal(body.events[0].rows[0].amount,20);assert.deepEqual(calls,['food:a','supplement-intake:a']);
  response=await get('b');body=await response.json();assert.equal(body.userId,'b');assert.deepEqual(body.events,[]);
  const before=calls.length;assert.equal((await get('a','&userId=b')).status,400);assert.equal(calls.length,before);
  fail=true;response=await get();assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/PRIVATE_|events|totals/);fail=false;
  foreign=true;response=await get();assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/label|20/);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
