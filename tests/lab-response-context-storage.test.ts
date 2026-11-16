import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {PrecisionStorage} from '../server/precision-storage';
import {ExperienceStorage} from '../server/experience-storage';
import {LabResponseContextStorage,LabResponseContextError} from '../server/lab-response-context-storage';
import {registerLabResponseContextRoutes} from '../server/lab-response-context-routes';
import {labSchema} from '../shared/precision-nutrition';
import {labReviewRevisionText} from '../shared/lab-source-review';
import type {LabResponseContextSave} from '../shared/lab-response-context';
const revision=(payload:unknown)=>createHash('sha256').update(labReviewRevisionText(payload as any)).digest('hex');
const rejects=(promise:Promise<unknown>,status:number)=>assert.rejects(promise,error=>error instanceof LabResponseContextError&&error.status===status);
async function fixture(run:(data:any)=>Promise<void>){
 const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('a'),('b');");for(const migration of ['0002_precision_nutrition.sql','0004_experience.sql'])await pg.exec(readFileSync(new URL('../migrations/'+migration,import.meta.url),'utf8'));
  const db=drizzle(pg),precision=new PrecisionStorage(db as any),experience=new ExperienceStorage(db as any),now=()=>new Date('2026-11-16T12:00:00Z'),storage=new LabResponseContextStorage(db as any,now);
  const labs=[];for(const [month,value] of [['09',120],['10',140]] as const){const payload=labSchema.parse({marker:'ldl',value,unit:'mg/dL',measuredAt:`2026-${month}-01T12:00:00Z`,laboratory:'Synthetic context lab',method:'Synthetic LDL assay',fasting:'yes',referenceLow:null,referenceHigh:130,sourceReport:{importId:randomUUID(),enteredDate:`2026-${month}-01`}});labs.push(await precision.insertPrecisionRecord('a','lab',payload));}
  const sourceReferences=labs.map(row=>({id:row.id,revision:revision(row.payload)})),prepare={family:'lipids' as const,sourceReferences},selection={family:'lipids' as const,sourceIds:sourceReferences.map(source=>source.id)};
  const command=(view:any,patch:Partial<LabResponseContextSave>={}):LabResponseContextSave=>({...prepare,intentId:randomUUID(),generationId:view.generationId,expectedCurrentId:view.latest?.record.id||null,answer:'yes',eventWindow:{from:'2026-09-15',to:'2026-09-20',precision:'range'},datePrecision:'range',notes:'Synthetic recalled medicine change; no cause claimed.',...patch});
  await run({pg,db,precision,experience,storage,labs,sourceReferences,prepare,selection,command});
 }finally{await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
}
test('source-current context saves once, keeps event/learned-at separate and replays historical receipts without replacing a later answer',()=>fixture(async({precision,storage,prepare,selection,command}:any)=>{
 const original=await precision.getPrecisionRecords('a'),empty=await storage.view('a',selection);assert.equal(empty.generationId,null);assert.equal(empty.historyCount,0);
 const prepared=await storage.prepare('a',prepare);assert.ok(prepared.generationId);assert.equal((await storage.prepare('a',prepare)).generationId,prepared.generationId);
 const request=command(prepared),saved=await storage.save('a',request),retry=await storage.save('a',request);assert.equal(saved.record.id,retry.record.id);assert.equal(retry.replayed,true);assert.equal(saved.record.payload.recordedAt,'2026-11-16T12:00:00.000Z');assert.equal(saved.record.payload.eventWindow.from,'2026-09-15');assert.deepEqual(saved.record.payload.reviewWindow,{from:'2026-09-01',to:'2026-10-01',basis:'source-date'});
 await rejects(storage.save('a',{...request,notes:'Changed retry'}),409);await rejects(storage.save('a',{...request,generationId:randomUUID()}),409);
 const firstView=await storage.view('a',selection);assert.equal(firstView.historyCount,1);assert.equal(firstView.latest.sourceCurrent,true);
 const next=command(firstView,{answer:'no',eventWindow:null,datePrecision:'not-applicable',notes:''});await storage.save('a',next);const oldReceipt=await storage.save('a',request);assert.equal(oldReceipt.isLatest,false);assert.equal((await storage.view('a',selection)).latest.record.payload.answer,'no');
 await rejects(storage.save('a',command(firstView)),409);assert.deepEqual(await precision.getPrecisionRecords('a'),original);
}));
test('own scope, family, exact source revision, source-date timing and explicit uncertainty are enforced before writes',()=>fixture(async({storage,prepare,selection,command}:any)=>{
 assert.equal((await storage.view('b',selection)).latest,null);await rejects(storage.prepare('b',prepare),404);
 await rejects(storage.prepare('a',{...prepare,family:'liver'}),409);await rejects(storage.prepare('a',{...prepare,sourceReferences:prepare.sourceReferences.map((source:any)=>({...source,revision:'f'.repeat(64)}))}),409);
 await rejects(storage.prepare('a',{...prepare,sourceReferences:[prepare.sourceReferences[0],prepare.sourceReferences[0]]}),400);
 const prepared=await storage.prepare('a',prepare);
 await rejects(storage.save('a',command(prepared,{eventWindow:{from:'2026-10-02',to:'2026-10-02',precision:'day'},datePrecision:'day'})),400);
 for(const answer of ['unknown','not-tracked','prefer-not-answer']){const view=await storage.view('a',selection);const saved=await storage.save('a',command(view,{answer,eventWindow:null,datePrecision:'not-applicable',notes:''}));assert.equal(saved.record.payload.answer,answer);assert.equal(saved.record.payload.eventWindow,null);}
 await rejects(storage.save('b',command(prepared)),409);
}));
test('source corrections and deletion withdraw currentness while context remains removable and original source history stays intact',()=>fixture(async({storage,precision,prepare,selection,command,labs}:any)=>{
 const prepared=await storage.prepare('a',prepare),request=command(prepared);await storage.save('a',request);
 const source=labs[1];await precision.reviewLabSource('a',source.id,{expectedRevision:revision(source.payload),marker:'ldl',unit:'mg/dL',referenceLow:null,referenceHigh:125,method:'Synthetic revised LDL assay',reason:'Synthetic original source review',reviewed:true},'context-source-review');
 assert.equal((await storage.view('a',selection)).latest.sourceCurrent,false);assert.equal((await storage.save('a',request)).sourceCurrent,false);await rejects(storage.prepare('a',prepare),404);
 const view=await storage.view('a',selection);await storage.deleteHistory('a',{...selection,intentId:randomUUID(),generationId:view.generationId,expectedHistoryRevision:view.historyRevision});assert.equal((await storage.view('a',selection)).historyCount,0);assert.equal((await precision.getPrecisionRecords('a')).length,3);
}));
test('context deletion fences queued saves, repeated deletion preserves later arrivals, and ordinary full erasure cannot resurrect old requests',()=>fixture(async({storage,experience,prepare,selection,command}:any)=>{
 const prepared=await storage.prepare('a',prepare),request=command(prepared);await storage.save('a',request);const view=await storage.view('a',selection),deletion={...selection,intentId:randomUUID(),generationId:view.generationId,expectedHistoryRevision:view.historyRevision};
 await storage.deleteHistory('a',deletion);await rejects(storage.save('a',request),409);const cleared=await storage.view('a',selection);assert.equal(cleared.latest,null);assert.notEqual(cleared.generationId,prepared.generationId);
 const later=await storage.save('a',command(cleared));await storage.deleteHistory('a',deletion);assert.equal((await storage.view('a',selection)).latest.record.id,later.record.id);
 await rejects(storage.deleteHistory('a',{...deletion,intentId:randomUUID()}),409);
 const old=command(await storage.view('a',selection));await experience.clearExperienceData('a');await rejects(storage.save('a',old),409);const recreated=await storage.prepare('a',prepare);assert.notEqual(recreated.generationId,old.generationId);await rejects(storage.save('a',old),409);assert.equal((await storage.view('a',selection)).historyCount,0);
}));
test('real HTTP derives signed account, validates source commands, preserves receipts and requires explicit exact deletion',()=>fixture(async({storage,prepare,selection,command}:any)=>{
 const app=express();app.use(express.json());let denied=false,calls=0,budgets=0;const actions:any={};for(const name of ['view','prepare','save','deleteHistory'])actions[name]=(...args:any[])=>{calls++;return storage[name](...args);};
 registerLabResponseContextRoutes(app,(req,res,next)=>{const actor=req.get('X-Fixture-Account');if(!actor)return void res.sendStatus(401);req.session={userId:actor} as any;next();},(_req,res,next)=>{budgets++;if(denied)return void res.sendStatus(503);next();},actions);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${(server.address() as any).port}/api/experience/lab-response-context`;
 const send=(path:string,body:any,actor:string|null='a',method='POST',extra:Record<string,string>={})=>fetch(base+path,{method,headers:{'content-type':'application/json',...(actor?{'X-Fixture-Account':actor}:{}),...extra},body:JSON.stringify(body)});
 try{
  const anonymous=await send('/prepare',prepare,null);assert.equal(anonymous.status,401);assert.equal(anonymous.headers.get('cache-control'),'no-store');assert.equal(calls,0);assert.equal(budgets,0);
  assert.equal((await send('/prepare',{...prepare,userId:'b'})).status,400);assert.equal((await send('/prepare?userId=b',prepare)).status,400);assert.equal(calls,0);
  denied=true;assert.equal((await send('/prepare',prepare)).status,503);assert.equal(calls,0);denied=false;
  assert.equal((await send('/prepare',prepare,'b')).status,404);
  const prepared=await send('/prepare',prepare);assert.equal(prepared.status,200);assert.equal(prepared.headers.get('cache-control'),'no-store');const request=command(await prepared.json());
  const saved=await send('/save',request);assert.equal(saved.status,201);const result=await saved.json();assert.equal(result.sourceCurrent,true);
  const replay=await send('/save',request);assert.equal(replay.status,200);assert.equal((await replay.json()).record.id,result.record.id);
  assert.equal((await send('/save',{...request,notes:'Different retry'})).status,409);
  const other=await(await send('/view',selection,'b')).json();assert.equal(other.latest,null);assert.equal(other.historyCount,0);
  const view=await(await send('/view',selection)).json(),deletion={...selection,intentId:randomUUID(),generationId:view.generationId,expectedHistoryRevision:view.historyRevision};
  const beforeDeleteCalls=calls;assert.equal((await send('',deletion,'a','DELETE')).status,400);assert.equal(calls,beforeDeleteCalls);
  assert.equal((await send('',deletion,'a','DELETE',{'X-Bloom-Confirm':'delete-lab-response-context-history'})).status,204);
  assert.equal((await send('/save',request)).status,409);assert.equal((await(await send('/view',selection)).json()).latest,null);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
}));
