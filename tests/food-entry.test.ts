import test from 'node:test';import assert from 'node:assert/strict';import express from 'express';
import {foodEntryMethods,parseFoodEntryMethod,availableFoodEntryMethods,parseAvailableFoodEntryMethod} from '../shared/food-entry';import {mealContextSchema} from '../shared/meal-intelligence';
import {capabilityApproval,restrictedCapabilityAllowed,requireRestrictedCapability} from '../server/capability-policy';
test('five food methods share strict route identifiers and retain optional user-entered restaurant context',()=>{
 assert.equal(foodEntryMethods.length,5);assert.equal(new Set(foodEntryMethods.map(m=>m.id)).size,5);
 for(const method of foodEntryMethods)assert.equal(parseFoodEntryMethod(method.id),method.id);assert.equal(parseFoodEntryMethod('unknown'),null);assert.equal(parseFoodEntryMethod(null),null);
 assert.deepEqual(mealContextSchema.parse({}),{});const context={restaurant:'Synthetic restaurant',market:'Canada',source:'user-entered-context'};assert.deepEqual(mealContextSchema.parse({restaurantContext:context}).restaurantContext,context);assert.equal(mealContextSchema.safeParse({restaurantContext:{...context,source:'verified-menu'}}).success,false);
});
test('provisional capability states never become approval and incident/research/photo outputs fail closed',()=>{
 assert.equal(capabilityApproval('REVIEW_REQUIRED'),'UNDER_REVIEW');assert.equal(capabilityApproval('NOT_APPROVED'),'PROPOSED');assert.equal(capabilityApproval('unknown'),'PROPOSED');
 for(const id of ['unknown','bloom.food.photo_ai','bloom.microbiome.flux','bloom.metabolite.scores','bloom.genetics.diet_rank'])assert.equal(restrictedCapabilityAllowed(id),false);
});
test('direct restricted API access rejects client-forged tester flags before executing the provider',async()=>{
 const app=express();let calls=0;app.use(express.json());app.post('/photo',requireRestrictedCapability('bloom.food.photo_ai'),(_req,res)=>{calls++;res.json({});});
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.on('listening',r));try{const response=await fetch('http://127.0.0.1:'+(server.address() as any).port+'/photo',{method:'POST',headers:{'content-type':'application/json','x-internal-tester':'true'},body:JSON.stringify({experimental:true,consent:true,approved:true})});assert.equal(response.status,403);assert.equal((await response.json()).code,'CAPABILITY_UNAVAILABLE');assert.equal(calls,0);}finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});

test('unfinished photo workflow is absent even with a forged ready flag and direct route falls back safely',()=>{assert.equal(availableFoodEntryMethods().length,4);assert.equal(availableFoodEntryMethods({photo:true}).some(method=>method.id==='photo'),false);assert.equal(parseAvailableFoodEntryMethod('photo'),null);assert.equal(parseAvailableFoodEntryMethod('barcode'),'barcode');assert.equal(availableFoodEntryMethods({search:false}).some(method=>method.id==='search'),false);});
