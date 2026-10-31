import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import express from 'express';

test('registered API candidates deny anonymous and deleted sessions before storage or processing work', {timeout:30000}, async t=>{
 // Isolated test process: no configured data service or model destination can be contacted.
 process.env.DATABASE_URL='postgresql://disabled:disabled@127.0.0.1:1/disabled';
 process.env.ML_SERVICE_URL='';
 const {storage}=await import('../server/storage');
 const {db,pool}=await import('../server/db');
 const unexpected:string[]=[];
 const reject=(label:string)=>(..._args:unknown[])=>{unexpected.push(label);throw Error('Unexpected test data access');};
 for(const name of Object.getOwnPropertyNames(Object.getPrototypeOf(storage))){if(name!=='constructor'&&typeof(storage as any)[name]==='function')(storage as any)[name]=reject('storage.'+name);}
 // A deleted session is deliberately not an active account. No database lookup occurs.
 storage.getUser=async id=>{assert.equal(id,'deleted-synthetic-account');return undefined;};
 for(const name of ['select','insert','update','delete','execute','transaction'])(db as any)[name]=reject('db.'+name);
 for(const name of ['query','connect'])(pool as any)[name]=reject('pool.'+name);
 const {registerRoutes}=await import('../server/routes');
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-test-deleted')?'deleted-synthetic-account':undefined}as any;next();});
 const server=await registerRoutes(app);await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+(server.address()as any).port;
 const inventory=JSON.parse(fs.readFileSync('docs/operations/API_EXPOSURE_INVENTORY.json','utf8'));
 const candidates=inventory.entries.filter((e:any)=>e.method!=='USE'&&!e.path.startsWith('/api/auth/')&&!e.path.startsWith('/api/demo/'));
 const paths=[...candidates.map((e:any)=>({method:e.method,path:e.path})),...['preview','save'].map(action=>({method:'POST',path:'/api/precision/weekly-plans/'+action})),...['analysis','recommendations','progress','adherence'].map(kind=>({method:'GET',path:'/api/health/'+kind+'/foreign-account'}))];
 const unique=[...new Map(paths.map(e=>[e.method+' '+e.path,e])).values()];
 assert.ok(unique.length>80);
 try{
  for(const mode of ["anonymous","deleted","changed-actor"])for(const route of unique){
   const path=route.path.replace(/:[A-Za-z]\w*\??/g,'foreign-record');
   const response=await fetch(base+path,{method:route.method,headers:{'content-type':'application/json',...(mode!=='anonymous'?{'x-test-deleted':'1'}:{}),...(mode==='changed-actor'?{'x-bloom-actor':'another-synthetic-account'}:{})},...(['GET','HEAD'].includes(route.method)?{}:{body:'{}'})});
   assert.equal(response.status,mode==='changed-actor'?409:401,`${mode} ${route.method} ${route.path}`);
  }
  for(const path of ['/api/demo/user','/api/demo/samples']){const response=await fetch(base+path);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.match(await response.text(),/Synthetic/);}
  assert.deepEqual(unexpected,[]);
  t.diagnostic(`${unique.length} protected source path/method candidates ×3 identity states; public synthetic compatibility checked separately. Inactive candidates may be denied by family mounts; this is not proof of every route registration or row/job isolation.`);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pool.end();}
});
