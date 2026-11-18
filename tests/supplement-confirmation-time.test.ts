import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {SupplementIntakeStorage} from '../server/supplement-intake-storage';
import {registerSupplementIntakeRoutes} from '../server/supplement-intake-routes';

test('future confirmation cannot mature while source resolution waits; server receipt time survives create/correct and replay',async()=>{
 const pg=new PGlite(),prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');let server:any;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a')");
  for(const file of ['0003_nutrition_products.sql','0004_experience.sql'])await pg.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const start=Date.parse('2026-11-18T12:00:00Z');let now=start,delay=false,lookups=0;
  const store=new SupplementIntakeStorage(drizzle(pg)as any,()=>new Date(now));
  const label={id:'321:0',source:'dsld' as const,name:'Synthetic source',brand:'Synthetic',url:null,notes:[],servingDescription:'1 capsule',servingGrams:null,perServing:{iron_mg:10},retrievedAt:new Date(start).toISOString()};
  const products={resolve:async()=>{lookups++;if(delay)now+=10000;return[label];}};
  const app=express();app.use(express.json());app.use((req:any,_res,next)=>{req.session={userId:'a'};next();});
  registerSupplementIntakeRoutes(app,{}as any,store,(_req,_res,next)=>next(),products as any);
  server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const root=`http://127.0.0.1:${server.address().port}/api/experience/supplement-intakes`;
  const send=async(path:string,body:unknown,method='POST')=>{const r=await fetch(root+path,{method,headers:{'content-type':'application/json'},body:JSON.stringify(body)});return{status:r.status,data:await r.json()};};
  const draft={takenAt:new Date(start+5000).toISOString(),servings:1,source:{kind:'label',product:{source:'dsld',id:'321:0'}},mineralBasis:{iron_mg:'unknown',magnesium_mg:'unknown',zinc_mg:'unknown'},formulation:{labelVersion:null,batch:null}};
  const review=await send('/review',{draft});assert.equal(review.status,200);const command={intentId:randomUUID(),lifecycleId:review.data.lifecycleId,reviewRevision:review.data.reviewRevision,confirmedTaken:true,draft};
  delay=true;const before=lookups;const future=await send('/confirm',command);assert.equal(future.status,400,'A future claim at confirmation arrival must not become past during provider work');assert.equal(future.data.code,'FUTURE_INTAKE');assert.equal(lookups,before,'Reject future confirmation before source lookup');assert.equal((await store.list('a')).total,0);
  now=start;delay=false;const past={...draft,takenAt:new Date(start-1000).toISOString()},pastReview=await send('/review',{draft:past});delay=true;
  const acceptedCommand={...command,intentId:randomUUID(),draft:past,reviewRevision:pastReview.data.reviewRevision};const accepted=await send('/confirm',acceptedCommand);assert.equal(accepted.status,200);assert.equal(accepted.data.payload.current.confirmedAt,new Date(start).toISOString());assert.equal(accepted.data.createdAt,new Date(start+10000).toISOString());
  const replay=await send('/confirm',acceptedCommand);assert.equal(replay.data.id,accepted.data.id);assert.equal(replay.data.payload.current.confirmedAt,new Date(start).toISOString());
  now=start;delay=false;const target={id:accepted.data.id,revision:accepted.data.payload.revision};const editReview=await send('/review',{draft,target,refreshSource:true});delay=true;
  const edit={editId:randomUUID(),expectedRevision:target.revision,lifecycleId:editReview.data.lifecycleId,reviewRevision:editReview.data.reviewRevision,confirmedTaken:true,draft,refreshSource:true};const beforeEdit=lookups;const denied=await send('/'+target.id+'/confirm',edit,'PUT');assert.equal(denied.status,400);assert.equal(lookups,beforeEdit);assert.equal((await store.get('a',target.id))!.payload.corrections.length,0);
  now=start;delay=false;const revised={...past,servings:2},revisedReview=await send('/review',{draft:revised,target,refreshSource:true});delay=true;const validEdit={...edit,draft:revised,reviewRevision:revisedReview.data.reviewRevision};const corrected=await send('/'+target.id+'/confirm',validEdit,'PUT');assert.equal(corrected.status,200);assert.equal(corrected.data.payload.current.confirmedAt,new Date(start).toISOString());assert.equal(corrected.data.payload.corrections[0].changedAt,new Date(start+10000).toISOString());
  const editReplay=await send('/'+target.id+'/confirm',validEdit,'PUT');assert.equal(editReplay.status,200);assert.equal(editReplay.data.payload.corrections.length,1);
 }finally{server?.closeAllConnections();if(server)await new Promise<void>(r=>server.close(r));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
