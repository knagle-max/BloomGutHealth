import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {readFileSync} from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
import {PrecisionStorage} from '../server/precision-storage';
import express from 'express';
import {registerPrecisionRoutes} from '../server/precision-routes';
import {referenceCorrectionView,referenceStreamId} from '../server/lab-reference-corrections';
import {labReferenceCorrectionSchema} from '../shared/lab-reference-correction';
import {labSchema} from '../shared/precision-nutrition';
import {copiedLabReferenceSchema,type CopiedLabReference} from '../shared/lab-reference-correction';
import {copiedReferenceIntervalForPlot,referenceIntervalText} from '../shared/lab-reference-interval';
const limits:CopiedLabReference={low:null,high:45,lowOperator:null,highOperator:'<',unit:'U/L',laboratory:'',reportIdentifier:'',population:'',specimen:'',assay:'',method:''};
test('ambiguous, broken or malformed annotation chains abstain instead of picking a favourable interval',()=>{
 const revision='c'.repeat(64),payload=labReferenceCorrectionSchema.parse({version:1,valueKind:'lab-reference-range-correction',sourceId:referenceStreamId('a','fact'),observationId:'fact',reportSourceId:'b'.repeat(64),revision:randomUUID(),supersedes:null,sourceRevision:revision,limits,recordedAt:'2026-11-16T12:00:00Z',requestFingerprint:'d'.repeat(64)}),row={id:'e'.repeat(64),kind:'lab-report-metadata',payload,createdAt:new Date()};
 for(const rows of[[row,{...row,id:'f'.repeat(64),payload:{...payload,revision:randomUUID()}}],[{...row,payload:{...payload,supersedes:'f'.repeat(64)}}],[{...row,payload:{...payload,supersedes:row.id}}],[{...row,payload:{...payload,limits:{...limits,high:-1}}}]]){const view=referenceCorrectionView('a','fact',revision,rows);assert.equal(view.available,false);assert.equal(view.current,null);}
 assert.equal(referenceCorrectionView('b','fact',revision,[row]).current,null,'Foreign account stream cannot join');
 assert.equal(referenceCorrectionView('a','fact','0'.repeat(64),[row]).sourceCurrent,false);
});
test('copied bounds preserve operators, unknown endpoints, affine units, raw data and assay safeguards',()=>{
 const point={sourceValue:40,sourceUnit:'mmol/mol',unit:'%',method:'reported assay',referenceLow:null,referenceHigh:null};
 const before=structuredClone(point),a=copiedReferenceIntervalForPlot('hba1c',point,{...limits,low:20,high:42,lowOperator:'>=',highOperator:'<=',unit:'mmol/mol'})!;
 assert.equal(a.low,20*.09148+2.152);assert.equal(a.high,42*.09148+2.152);assert.equal(a.highInclusive,true);assert.deepEqual(point,before);
 assert.equal(referenceIntervalText(20,42,'mmol/mol',a),'≥20 and ≤42 mmol/mol');assert.equal(referenceIntervalText(0,40,'U/L',{lowInclusive:false,highInclusive:true}),'>0 and ≤40 U/L');
 const b=copiedReferenceIntervalForPlot('alt',{...point,sourceValue:0,sourceUnit:'U/L',unit:'U/L'},limits)!;assert.equal(b.low,null);assert.equal(b.high,45);assert.equal(b.highInclusive,false);
 for(const patch of [{unit:'mg/dL'},{low:50,lowOperator:'>='as const},{highOperator:null},{high:null}])assert.equal(copiedLabReferenceSchema.safeParse({...limits,...patch}).success,patch.unit==='mg/dL','Unit compatibility is validated against the actual marker separately');
 assert.equal(copiedReferenceIntervalForPlot('alt',{...point,sourceUnit:'U/L',unit:'U/L'},{...limits,unit:'mg/dL'}),null);
 assert.equal(copiedReferenceIntervalForPlot('vitamin_d',{sourceValue:25,sourceUnit:'ng/mL',unit:'nmol/L',method:'calcitriol'},{...limits,unit:'ng/mL'}),null);
 assert.equal(copiedReferenceIntervalForPlot('vitamin_d',{sourceValue:25,sourceUnit:'ng/mL',unit:'nmol/L',method:'25(OH)D'},{...limits,unit:'ng/mL',assay:'1,25-dihydroxy vitamin D'}),null,'Conflicting copied assay is not applied to a different analyte');
});
test('real encrypted SQL range versions are per observation, CAS protected, removable, source-bound and erased with their fact',async()=>{
 const old=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('a'),('b');");
  for(const file of['0002_precision_nutrition.sql','0017_lab_report_metadata.sql'])await pg.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const store=new PrecisionStorage(drizzle(pg)as any),importId=randomUUID(),fact=labSchema.parse({marker:'alt',value:55,unit:'U/L',measuredAt:'2026-05-09T12:00:00Z',laboratory:'Original laboratory',method:'Original assay',fasting:'unknown',referenceLow:null,referenceHigh:60,sourceReport:{importId,enteredDate:'2026-05-09'}});
  const a=await store.insertPrecisionRecord('a','lab',fact),b=await store.insertPrecisionRecord('a','lab',{...fact,marker:'ast'}),source=(await store.getLabSources('a'))[0];
  const before=JSON.stringify((await pg.query('SELECT id,encrypted_payload FROM precision_records ORDER BY id')).rows),view=source.referenceCorrections!.observations.find(row=>row.observationId===a.id)!;
  const command={observationId:a.id,sourceRevision:view.sourceRevision,expectedCorrectionRevision:null,limits,confirmedFromReport:true as const},key=randomUUID();
  await assert.rejects(store.saveLabReferenceCorrection('b',source.id,command,key),/not found/);
  await assert.rejects(store.saveLabReferenceCorrection('a',source.id,{...command,limits:{...limits,unit:'mg/dL'}},randomUUID()),/unit or assay/);
  for(const patch of[{laboratory:'Different laboratory'},{method:'Different assay method'}])await assert.rejects(store.saveLabReferenceCorrection('a',source.id,{...command,limits:{...limits,...patch}},randomUUID()),/differs from this saved source/);
  assert.equal((await store.getLabReportMetadataHistory('a')).records.length,0,'Rejected range leaves no partial annotation');
  const saved=await store.saveLabReferenceCorrection('a',source.id,command,key),current=saved.referenceCorrections!.observations.find(row=>row.observationId===a.id)!;
  assert.equal(current.current?.limits?.high,45);assert.equal(current.sourceCurrent,true);assert.equal(saved.metadata?.available,true);assert.equal(saved.metadata?.current,null);
  assert.equal(saved.referenceCorrections!.observations.find(row=>row.observationId===b.id)!.current,null);
  assert.deepEqual((await store.saveLabReferenceCorrection('a',source.id,command,key)).referenceCorrections,saved.referenceCorrections);
  await assert.rejects(store.saveLabReferenceCorrection('a',source.id,{...command,limits:{...limits,high:46}},key),/different range/);
  await assert.rejects(store.saveLabReferenceCorrection('a',source.id,command,randomUUID()),/range changed/);
  const next={...command,expectedCorrectionRevision:key,limits:{...limits,high:44}},race=await Promise.allSettled([store.saveLabReferenceCorrection('a',source.id,next,randomUUID()),store.saveLabReferenceCorrection('a',source.id,next,randomUUID())]);assert.equal(race.filter(row=>row.status==='fulfilled').length,1);
  const amended=(await store.getLabSources('a'))[0].referenceCorrections!.observations.find(row=>row.observationId===a.id)!;
  const removed=await store.saveLabReferenceCorrection('a',source.id,{...command,expectedCorrectionRevision:amended.current!.revision,limits:null},randomUUID()),tombstone=removed.referenceCorrections!.observations.find(row=>row.observationId===a.id)!;
  assert.equal(tombstone.current?.limits,null);assert.equal(tombstone.historyCount,2);assert.equal(tombstone.history.length,2);
  assert.equal((await store.saveLabReferenceCorrection('a',source.id,command,key)).referenceCorrections!.observations.find(row=>row.observationId===a.id)!.current!.revision,tombstone.current!.revision,'Old receipt never restores an older correction');
  assert.equal(JSON.stringify((await pg.query('SELECT id,encrypted_payload FROM precision_records ORDER BY id')).rows),before,'Original measured result, source interval, flags and ciphertext are immutable');
  await store.correctLabDate('a',b.id,{enteredDate:'2026-05-10',measuredAt:'2026-05-10T12:00:00Z',reason:'Reviewed other result date',reviewed:true},randomUUID());
  const afterOther=(await store.getLabSources('a'))[0];assert.equal(afterOther.referenceCorrections!.observations.find(row=>row.observationId===a.id)!.sourceRevision,view.sourceRevision,'Unrelated observation changes do not invalidate this fact');
  const provider={sourceRevision:afterOther.revision,metadataRevision:null,identity:{provider:'LifeLabs'as const,province:'BC'as const,otherProvider:'',location:'',assertion:'user-confirmed'as const},identityReviewed:true,overlay:{provider:'none'as const,province:'',otherProvider:''}};
  const changed=await store.saveLabReportMetadata('a',source.id,provider,randomUUID());
  const stale=(await store.getLabSources('a'))[0].referenceCorrections!.observations.find(row=>row.observationId===a.id)!;assert.equal(stale.sourceCurrent,false);
  await assert.rejects(store.saveLabReferenceCorrection('a',source.id,{...command,expectedCorrectionRevision:tombstone.current!.revision},randomUUID()),/range changed/);
  assert.equal(changed.metadata?.current?.identity?.provider,'LifeLabs');
  await store.deleteLabEntry('a',a.id);
  const history=await store.getLabReportMetadataHistory('a');assert.equal(history.records.some(row=>(row.payload as any)?.observationId===a.id),false,'SQL erasure removes every range version even when another report result remains');
  assert.equal(history.records.length,1,'Other performing-laboratory metadata remains intact');
 }finally{await pg.close();if(old===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=old;}
});
test('range route requires signed account, matching actor, strict command and an idempotency receipt',async()=>{
 const calls:any[]=[],app=express();app.use(express.json());
 registerPrecisionRoutes(app,((req:any,res:any,next:any)=>{req.session={userId:req.get('x-user')};return req.session.userId?next():res.sendStatus(401);})as any,{saveLabReferenceCorrection:async(...args:any[])=>{calls.push(args);return{saved:true};}}as any);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{
  const key=randomUUID(),source='a'.repeat(64),body={observationId:'actual-owned-fact',sourceRevision:'b'.repeat(64),expectedCorrectionRevision:null,limits,confirmedFromReport:true};
  const request=(user:string,actor:string,input:unknown=body,receipt=key)=>fetch(`http://127.0.0.1:${(server.address()as any).port}/api/precision/labs/sources/${source}/reference-range`,{method:'POST',headers:{'content-type':'application/json','x-user':user,'X-Bloom-Labs-Actor':actor,'Idempotency-Key':receipt},body:JSON.stringify(input)});
  assert.equal((await request('','')).status,401);assert.equal((await request('a','b')).status,409);
  assert.equal((await request('a','a',{...body,userId:'b'})).status,400);assert.equal((await request('a','a',body,'not-a-uuid')).status,400);assert.equal((await request('a','a',{...body,confirmedFromReport:false})).status,400);assert.equal(calls.length,0);
  const response=await request('a','a');assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.deepEqual(calls, [['a',source,body,key]]);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
