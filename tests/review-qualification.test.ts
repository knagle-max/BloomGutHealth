import test from 'node:test';import assert from 'node:assert/strict';import express from 'express';
import binding from '../server/config/isolated-review-binding.json';import {qualifiedReview,registerReviewQualification} from '../server/review-qualification';
const runtime={serviceId:binding.serviceId,commit:'a'.repeat(40),configuredNeonEndpoint:binding.endpointId,databaseNameHash:binding.databaseNameHash,configuration:{isolatedSyntheticFlag:true}},schema={status:'catalog-ready',phase:'runtime'},now=Date.parse('2026-11-08T12:00:00Z');
test('review write-test qualification requires the observed exact isolated binding, full runtime schema, commit and unexpired review',()=>{
 assert.deepEqual(qualifiedReview(runtime,schema,now),{kind:'isolated-review',commit:'a'.repeat(40),expiresAt:binding.expiresAt});
 for(const patch of[{serviceId:'srv-another'},{configuredNeonEndpoint:'ep-bitter-field-arqdkfep'},{databaseNameHash:'different-database'},{configuration:{isolatedSyntheticFlag:false}},{commit:'not-a-sha'}])assert.equal(qualifiedReview({...runtime,...patch},schema,now),null);
 for(const status of ['incomplete','unavailable','pre-bootstrap-catalog-ready'])assert.equal(qualifiedReview(runtime,{...schema,status},now),null);
 assert.equal(qualifiedReview(runtime,{...schema,phase:'before-app-start'},now),null);
 assert.equal(qualifiedReview(runtime,schema,Date.parse(binding.expiresAt)),null);assert.equal(qualifiedReview(runtime,schema,NaN),null);
});
test('unqualified public probe exposes no database, schema or account facts and cannot be promoted by query input',async()=>{
 const app=express();registerReviewQualification(app,{...runtime,configuredNeonEndpoint:'ep-production'},schema);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));
 try{const response=await fetch(`http://127.0.0.1:${(server.address() as any).port}/api/review/qualification?isolated=true`);assert.equal(response.status,404);assert.equal(response.headers.get('cache-control'),'no-store');assert.deepEqual(await response.json(),{available:false});}finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
