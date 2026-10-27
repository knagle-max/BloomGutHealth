import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {SharedRateLimiter} from '../server/shared-rate-limit';
async function serve(limiter:SharedRateLimiter,write:()=>void){
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:'PRIVATE_WORKSPACE_OWNER'}as any;next();});app.use(limiter.middleware());
 app.use((_req,res)=>{write();res.json({ok:true});});const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 return{base:`http://127.0.0.1:${(server.address()as any).port}`,close:async()=>{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}};
}
const send=(base:string,path:string,method='POST')=>fetch(base+path,{method,headers:{'content-type':'application/json','x-user-id':'FORGED_OTHER_OWNER'},...(['GET','HEAD'].includes(method)?{}:{body:JSON.stringify({userId:'FORGED_OTHER_OWNER'})})});
test('all workspace mutation aliases fail closed before route work when the shared store is unavailable',async()=>{
 let reached=0,queries=0;const server=await serve(new SharedRateLimiter({query:async()=>{queries++;throw Error('PRIVATE_CONNECTION_DETAIL');}},'synthetic-workspace-secret'),()=>reached++);
 try{for(const [path,method]of[['/api/experience/records','POST'],['/API/EXPERIENCE/RECORDS/','POST'],['/api/experience/settings','PUT'],['/api/experience/records/row','PATCH'],['/api/experience/records/row','DELETE'],['/api/experience/','DELETE']]){
  const response=await send(server.base,path,method);assert.equal(response.status,503);assert.equal(response.headers.get('retry-after'),'60');assert.equal(response.headers.get('cache-control'),'no-store');assert.doesNotMatch(await response.text(),/PRIVATE_|FORGED_/);
 }assert.equal(reached,0);assert.equal(queries,6);}finally{await server.close();}
});
test('workspace updates share the existing thirty-per-minute account allowance across replicas and path variants',async()=>{
 const pg=new PGlite(),left=new SharedRateLimiter(pg as any,'synthetic-workspace-secret'),right=new SharedRateLimiter(pg as any,'synthetic-workspace-secret');await left.initialize();let reached=0;
 const servers=await Promise.all([serve(left,()=>reached++),serve(right,()=>reached++)]);
 const variants=[['/api/experience/records','POST'],['/API/EXPERIENCE/SETTINGS/','PUT'],['/api/experience/records/item','PATCH'],['/api/experience/records/item','DELETE']];
 try{const responses=await Promise.all(Array.from({length:35},(_,i)=>send(servers[i%2].base,...variants[i%variants.length]as[string,string])));
  assert.equal(responses.filter(response=>response.status===200).length,30);assert.equal(responses.filter(response=>response.status===429).length,5);assert.equal(reached,30);
  assert.ok(responses.filter(response=>response.status===429).every(response=>response.headers.get('retry-after')==='60'));
  const raw=JSON.stringify((await pg.query('SELECT * FROM request_budgets')).rows);assert.doesNotMatch(raw,/PRIVATE_WORKSPACE_OWNER|FORGED_OTHER_OWNER/);
 }finally{await Promise.all(servers.map(server=>server.close()));await pg.close();}
});
test('ordinary workspace reads and adjacent unrelated paths do not acquire a new write budget',async()=>{
 let queries=0,reached=0;const server=await serve(new SharedRateLimiter({query:async()=>{queries++;throw Error('No budget expected');}},'synthetic-workspace-secret'),()=>reached++);
 try{assert.equal((await send(server.base,'/api/experience/records','GET')).status,200);assert.equal((await send(server.base,'/api/experience/settings/','HEAD')).status,200);assert.equal((await send(server.base,'/api/experience-like/records','POST')).status,200);assert.equal(queries,0);assert.equal(reached,3);}finally{await server.close();}
});

test('costly workspace actions retain the existing resource ceiling as well as the new shared workspace allowance',async()=>{
 const pg=new PGlite(),limiter=new SharedRateLimiter(pg as any,'synthetic-workspace-secret');await limiter.initialize();let reached=0;
 const server=await serve(limiter,()=>reached++);
 try{for(let index=0;index<30;index++)assert.equal(await limiter.consume('resource:account','PRIVATE_WORKSPACE_OWNER',30,60),true);
  const denied=await send(server.base,'/api/experience/recipe-suggestions');assert.equal(denied.status,429);assert.equal(reached,0);
  assert.equal(Number((await pg.query('SELECT count(*) AS count FROM request_budgets')).rows[0].count),2,'A denied resource attempt never consumes a later workspace scope');
 }finally{await server.close();await pg.close();}
});

test('a stalled shared check has a bounded denial and a late allowed result cannot resume route work',async()=>{
 let reached=0,release:((value:{rows:any[]})=>void)|undefined;
 const limiter=new SharedRateLimiter({query:()=>new Promise(resolve=>{release=resolve;})},'synthetic-workspace-secret',25);
 const server=await serve(limiter,()=>reached++);
 try{const response=await send(server.base,'/api/experience/records');assert.equal(response.status,503);assert.equal(response.headers.get('retry-after'),'60');assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(reached,0);
  release?.({rows:[{allowed:true}]});await new Promise<void>(resolve=>setImmediate(resolve));assert.equal(reached,0);
  assert.throws(()=>new SharedRateLimiter({query:async()=>({rows:[]})},'secret',0),/deadline/);
 }finally{await server.close();}
});


test('startup shared-budget initialization has the same bounded fail-closed deadline as request queries',async()=>{
 let calls=0;
 const limiter=new SharedRateLimiter({query:async()=>{calls++;return new Promise<never>(()=>{});}},'synthetic-startup-secret',25);
 await assert.rejects(()=>limiter.initialize(),/SHARED_BUDGET_UNAVAILABLE/);
 assert.equal(calls,1,'A stalled table initialization cannot continue to readiness or index work');
});
