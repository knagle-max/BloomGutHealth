import test from 'node:test';import assert from 'node:assert/strict';import express from 'express';import{readFileSync}from'node:fs';
import{registerSyntheticDemoRoutes}from'../server/demo-routes';
test('public legacy demo API is fixed synthetic data regardless of signed account or forged owner',async()=>{
 const app=express();app.use((req,_res,next)=>{req.session={userId:req.get('x-session-user')}as any;next();});registerSyntheticDemoRoutes(app);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base=`http://127.0.0.1:${(server.address()as any).port}`;
 try{
  for(const path of ['/api/demo/user','/api/demo/samples']){
   let reference:unknown;
   for(const owner of ['', 'private-a', 'private-b', 'demo-user-123']){
    const response=await fetch(base+path+'?userId=private-b&sampleId=private-result',{headers:owner?{'x-session-user':owner}:{}});assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');const data=await response.json();
    if(reference===undefined)reference=data;else assert.deepEqual(data,reference);
    assert.doesNotMatch(JSON.stringify(data),/private-a|private-b|private-result|password|rawDataPath|saveReceipt|structuredData/);
    if(path.endsWith('/samples')){assert.equal(data.length,1);assert.equal(data[0].diversityIndex,null);assert.match(data[0].testingCompany,/Synthetic example/);assert.match(data[0].notes,/Not account data/);}else assert.match(data.username,/Synthetic/);
   }
  }
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
 // Production registration must not fall back to the old mutable account-backed API.
 const source=readFileSync(new URL('../server/routes.ts',import.meta.url),'utf8');assert.match(source,/registerSyntheticDemoRoutes\(app\)/);assert.doesNotMatch(source,/storage\.getDemo(?:User|Samples)\(/);
});
