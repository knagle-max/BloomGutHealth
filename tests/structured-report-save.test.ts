import{reportDerivedTablesSql}from"./fixtures/report-derived-tables";
import{updateOwnedSample,insertOwnedComposition,insertOwnedAnalysis}from'../server/report-records';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {microbiomeSamples,bacterialComposition,mlAnalyses} from '../shared/schema';
import {parseStructuredReport,type StructuredReport,type ReportImportFields} from '../shared/structured-report';
import {registerReportRoutes} from '../server/report-routes';
import {importStructuredReportWithReceipt,deleteOwnedMicrobiomeReport} from '../server/structured-report-storage';
import {ViomeReportContextError} from '../shared/viome-report-context';
import {publicSample} from '../server/analysis-boundary';
import {VIOME_FINDINGS_VERSION} from '../shared/viome-findings';
import {createViomePdfParser} from '../shared/viome-pdf';
import {syntheticViomePages,VIOME_PDF_CANARY} from './fixtures/viome-pdf';
const body={report:{bacteria_percentages:{Bifidobacterium:60,Roseburia:40}},notes:'Original source'};
test('owned canonical import preserves provider food rows atomically through retry and read without creating quantitative taxa',async()=>{
 const{pg,db,store}=await fixture();
 try{
  const report=parseStructuredReport({testing_company:'Synthetic provider',scores:[{name:'Synthetic category',status:'Attention'}],foods:Array.from({length:299},(_,i)=>({name:`Synthetic food ${i+1}`,reportedCategory:i<240?'Enjoy':i<268?'Superfood':i<290?'Minimize':'Avoid',sourcePage:8+Math.floor(i/60)}))});
  const key=randomUUID(),first=await store.importStructuredReport('a',report,{},null,key),replay=await store.importStructuredReport('a',report,{},null,key);
  assert.deepEqual(replay,first);const rows=await db.select().from(microbiomeSamples);assert.equal(rows.length,1);
  const visible=publicSample(rows[0]);assert.equal((visible.structuredData as any).foods.length,299);assert.deepEqual(parseStructuredReport(visible.structuredData).foods,report.foods);
  assert.equal((await db.select().from(bacterialComposition)).length,0);assert.equal((await db.select().from(mlAnalyses)).length,1);
  assert.equal((await db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,'b'))).length,0);
  const changed=parseStructuredReport({...report,sourceReport:{...report.sourceReport,foods:[{name:'Different source',reportedCategory:'Avoid'}]}});
  await assert.rejects(()=>store.importStructuredReport('a',changed,{},null,key));
  assert.equal((await db.select().from(microbiomeSamples)).length,1);
 }finally{await pg.close();}
});
async function fixture(){
 const pg=new PGlite();await pg.exec(`CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');CREATE TABLE microbiome_samples(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL REFERENCES users(id),test_date timestamp NOT NULL,testing_company text,test_id text,raw_data_path text,structured_data jsonb,notes text,processing_status text NOT NULL DEFAULT 'pending',diversity_index real,uploaded_at timestamp NOT NULL DEFAULT now());CREATE TABLE bacterial_composition(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),sample_id varchar NOT NULL REFERENCES microbiome_samples(id),bacterial_name text NOT NULL,taxonomy_level text NOT NULL,abundance real NOT NULL,genome_data jsonb);CREATE TABLE ml_analyses(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),sample_id varchar NOT NULL REFERENCES microbiome_samples(id),analysis_type text NOT NULL,model_version text NOT NULL,results jsonb NOT NULL,confidence real,explainability jsonb,compared_cohorts text[],analyzed_at timestamp NOT NULL DEFAULT now());`);await pg.exec(reportDerivedTablesSql);const db=drizzle(pg);
 const store:any={insertMicrobiomeSample:async(data:any)=>(await db.insert(microbiomeSamples).values(data).returning())[0],updateMicrobiomeSample:(id:string,updates:any,owner:string)=>updateOwnedSample(db as any,id,updates,owner),insertBacterialComposition:(data:any,owner:string)=>insertOwnedComposition(db as any,data,owner),insertMlAnalysis:(data:any,owner:string)=>insertOwnedAnalysis(db as any,data,owner),importStructuredReport:(owner:string,report:StructuredReport,fields:ReportImportFields,filename:string|null,key:string,reuse?:string)=>importStructuredReportWithReceipt(db,owner,report,fields,filename,key,reuse),deleteMicrobiomeReport:(owner:string,id:string,revision?:string)=>deleteOwnedMicrobiomeReport(db,owner,id,revision)};
 return{pg,db,store};
}
test('paired Viome sources and explicit reimport use owned transactional facts in either order; deleted links cannot resurrect and quantitative records survive',async()=>{
 const{pg,db,store}=await fixture();
 const source=(kind:'organisms'|'recommendations')=>{const parser=createViomePdfParser();syntheticViomePages(kind).forEach(parser.page);return{...parser.finish(),reviewConfirmed:true as const};};
 const organisms=source('organisms'),health=source('recommendations');
 const save=(value:unknown,key=randomUUID(),owner='a',reuse?:string)=>store.importStructuredReport(owner,parseStructuredReport(value),{},null,key,reuse);
 const code=(expected:string)=>(error:unknown)=>error instanceof ViomeReportContextError&&error.code===expected;
 try{
  const rootKey=randomUUID(),root=await save(organisms,rootKey),linked={...health,specimenEvent:{rootReportId:root.sampleId,confirmed:true}},key=randomUUID(),child=await save(linked,key);assert.deepEqual(await save(linked,key),child);assert.equal((await db.select().from(microbiomeSamples)).length,2);
  await assert.rejects(save(linked,randomUUID(),'b'),code('unavailable'));await assert.rejects(save({...linked,biologicalDates:{collectedOn:'2026-09-03'}}),code('incompatible'));await assert.rejects(save({...organisms,specimenEvent:linked.specimenEvent}),code('incompatible'));await assert.rejects(save(linked),code('occupied'));assert.equal((await db.select().from(microbiomeSamples)).length,2);
  const reprint=structuredClone(health);reprint.foods[0].position.page=20;
  const reused=await save(reprint,randomUUID(),'a',child.sampleId);assert.equal(reused.reusedExisting,true);assert.equal(reused.sampleId,child.sampleId);assert.equal((await db.select().from(microbiomeSamples)).length,2);
  await assert.rejects(save(organisms,rootKey,'a',root.sampleId));await assert.rejects(save(health,randomUUID(),'b',child.sampleId),code('unavailable'));await assert.rejects(save({...health,foods:health.foods.slice(1)},randomUUID(),'a',child.sampleId),code('changed'));await assert.rejects(save(linked,randomUUID(),'a',child.sampleId),code('incompatible'));
  const quant=await save({bacteria_percentages:{Roseburia:100}},randomUUID(),'b');assert.equal(await store.deleteMicrobiomeReport('b',root.sampleId),false);assert.equal(await store.deleteMicrobiomeReport('a',root.sampleId),true);assert.equal(await store.deleteMicrobiomeReport('a',root.sampleId),false);
  const remaining=(await db.select().from(microbiomeSamples)).find(row=>row.id===child.sampleId)!;const findings=(remaining.structuredData as any).sourceReport;assert.equal(findings.specimenEvent,undefined);assert.equal(findings.foods.length,299);assert.equal(findings.assessments.length,22);assert.ok((await db.select().from(microbiomeSamples)).some(row=>row.id===quant.sampleId));assert.equal(await store.deleteMicrobiomeReport('b',quant.sampleId),true,'Explicit universal deletion can remove owned quantified history');
  assert.deepEqual(await save(linked,key),child,'historical receipt retry can acknowledge the surviving source without relinking it');assert.equal(((await db.select().from(microbiomeSamples)).find(row=>row.id===child.sampleId)!.structuredData as any).sourceReport.specimenEvent,undefined);
  await assert.rejects(save(linked),code('unavailable'));
  const reverseRoot=await save(health),reverse=await save({...organisms,specimenEvent:{rootReportId:reverseRoot.sampleId,confirmed:true}});assert.ok(reverse.sampleId);assert.equal((await db.select().from(microbiomeSamples)).filter(row=>row.userId==='a').length,3);
 }finally{await pg.close();}
});
test('HTTP reuse/deletion require active ownership/actor and exact reviewed source; legacy no-key cannot smuggle a link',async()=>{
 const{pg,db,store}=await fixture(),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')}as any;next();});registerReportRoutes(app,((req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401))as any,store);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${(server.address()as any).port}`;
 const parser=createViomePdfParser();syntheticViomePages('organisms').forEach(parser.page);const source={...parser.finish(),reviewConfirmed:true};
 const post=async(body:unknown,owner='a',key:string|undefined=randomUUID())=>{const response=await fetch(base+'/api/microbiome/import',{method:'POST',headers:{'content-type':'application/json','x-user':owner,...(key?{'Idempotency-Key':key}:{})},body:JSON.stringify(body)});return{status:response.status,body:await response.json()as any};};
 try{
  const saved=await post({report:source});assert.equal(saved.status,200);const reuse=await post({report:source,reuseExistingReportId:saved.body.sampleId});assert.equal(reuse.status,200);assert.equal(reuse.body.reusedExisting,true);assert.equal(reuse.body.sampleId,saved.body.sampleId);assert.equal((await db.select().from(microbiomeSamples)).length,1);
  assert.equal((await post({report:source,reuseExistingReportId:saved.body.sampleId},'b')).status,404);assert.equal((await post({report:source,reuseExistingReportId:'provider-test-id'})).status,400);
  assert.equal((await post({report:{...source,specimenEvent:{rootReportId:saved.body.sampleId,confirmed:true}}},'a','')).status,409);
  const revision=publicSample((await db.select().from(microbiomeSamples))[0]).deletionRevision!;
  const remove=(owner:string,actor:string=owner)=>fetch(base+'/api/microbiome/reports/'+saved.body.sampleId,{method:'DELETE',headers:{...(owner?{'x-user':owner}:{}),'X-Bloom-Report-Actor':actor,'X-Bloom-Confirm':'delete-microbiome-report','If-Match':'"'+revision+'"'}});
  assert.equal((await remove('')).status,401);assert.equal((await remove('b')).status,200);assert.equal((await remove('a','b')).status,409);assert.equal((await remove('a','a')).status,200);assert.equal((await db.select().from(microbiomeSamples)).length,0);assert.equal((await db.select().from(mlAnalyses)).length,0);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();}
});
test('PDF-derived reviewed biological corrections use the actual owned HTTP/SQL receipt path without original bytes, identity or quantitative enrichment',async()=>{
 const{pg,db,store}=await fixture(),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')}as any;next();});registerReportRoutes(app,((req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401))as any,store);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${(server.address()as any).port}`;
 const parser=createViomePdfParser();syntheticViomePages('recommendations').forEach(parser.page);const draft=parser.finish();draft.foods[298].correctedCategory='Minimize';draft.foods[298].correctedName='Synthetic corrected food';
 const report={...draft,reviewConfirmed:true},key=randomUUID();
 const send=async(value:unknown,user='a')=>{const result=await fetch(base+'/api/microbiome/import',{method:'POST',headers:{'content-type':'application/json','x-user':user,'Idempotency-Key':key},body:JSON.stringify(value)});return{status:result.status,body:await result.json()};};
 try{
  const first=await send({report}),again=await send({report});assert.equal(first.status,200);assert.deepEqual(again,first);
  const rows=await db.select().from(microbiomeSamples);assert.equal(rows.length,1);assert.equal(rows[0].rawDataPath,null);assert.equal(rows[0].testId,null);assert.equal(rows[0].notes,null);
  const saved=rows[0].structuredData as any,roundtrip=parseStructuredReport(saved);assert.equal(roundtrip.scores.length,22);assert.equal(roundtrip.foods!.length,299);assert.equal(roundtrip.foods![298].name,'Synthetic corrected food');assert.equal(roundtrip.foods![298].reportedCategory,'Minimize');assert.equal((roundtrip.sourceReport as any).foods[298].reportedCategory,'Avoid');assert.deepEqual((roundtrip.sourceReport as any).foods[298].position,draft.foods[298].position);
  assert.equal(roundtrip.bacteria_percentages,undefined);assert.equal((await db.select().from(bacterialComposition)).length,0);assert.equal(JSON.stringify(rows).includes(VIOME_PDF_CANARY),false);assert.equal(JSON.stringify(rows).includes('%PDF-'),false);
  assert.equal((await db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,'b'))).length,0);
  const changed=structuredClone(report);changed.foods[298].correctedName='Changed correction';assert.equal((await send({report:changed})).status,409);assert.equal((await db.select().from(microbiomeSamples)).length,1);
  assert.equal((await send({report:{...report,originalPdf:VIOME_PDF_CANARY}})).status,400);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();}
});
test('actual owned HTTP/SQL findings import rejects identifying extras before hashing or storage and preserves only allowlisted source',async()=>{
 const{pg,db,store}=await fixture(),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')}as any;next();});registerReportRoutes(app,((req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401))as any,store);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${(server.address()as any).port}`;
 const source={schemaVersion:VIOME_FINDINGS_VERSION,provider:'Viome',documentKind:'active-gut-microbes',specimenType:'fecal',method:'qualitative RNA',biologicalDates:{collectedOn:'2026-09-01'},reviewConfirmed:true,organisms:[{name:'Bacteroides fragilis YCH46',reportedGroup:'Bacteria',reportedStatus:'reported_present',position:{page:2,column:1,row:1}}],assessments:[],foods:[]};
 const send=async(body:unknown,key=randomUUID(),user='a')=>{const response=await fetch(base+'/api/microbiome/import',{method:'POST',headers:{'content-type':'application/json','x-user':user,'Idempotency-Key':key},body:JSON.stringify(body)});return{status:response.status,body:await response.json()as any};};
 try{
  for(const extra of[{testId:'PrivateCanaryValue'},{notes:'PrivateCanaryValue'},{originalFilename:'PrivateCanaryValue.pdf'},{testingCompany:'Viome'},{testDate:'2026-09-01'}]){
   const result=await send({report:source,...extra});assert.equal(result.status,400);assert.equal(JSON.stringify(result.body).includes('PrivateCanaryValue'),false);
  }
  assert.equal((await send({report:{...source,PrivateCanaryKey:'PrivateCanaryValue'}})).status,400);
  assert.equal((await db.select().from(microbiomeSamples)).length,0);
  const parsed=parseStructuredReport(source);
  await assert.rejects(()=>store.importStructuredReport('a',parsed,{notes:'PrivateCanaryValue'},null,randomUUID()));
  await assert.rejects(()=>store.importStructuredReport('a',parsed,{},'PrivateCanaryValue.pdf',randomUUID()));
  const form=new FormData();form.set('file',new Blob([JSON.stringify(source)],{type:'application/json'}),'PrivateCanaryValue.json');
  const uploaded=await fetch(base+'/api/microbiome/upload',{method:'POST',headers:{'x-user':'a'},body:form});assert.equal(uploaded.status,400);assert.equal((await uploaded.text()).includes('PrivateCanaryValue'),false);
  assert.equal((await db.select().from(microbiomeSamples)).length,0);
  const key=randomUUID(),wrapper={...parsed,sourceLabel:'PrivateCanaryValue',rawText:'PrivateCanaryValue',bacteria_percentages:{'PrivateCanaryValue':100}};
  const first=await send({report:wrapper},key),again=await send({report:parsed},key);assert.equal(first.status,200);assert.deepEqual(again,first);
  const rows=await db.select().from(microbiomeSamples);assert.equal(rows.length,1);assert.equal(rows[0].testId,null);assert.equal(rows[0].notes,null);assert.equal(rows[0].rawDataPath,null);
  assert.equal(JSON.stringify(rows).includes('PrivateCanaryValue'),false);assert.deepEqual((rows[0].structuredData as any).sourceReport,source);
  assert.equal((await db.select().from(bacterialComposition)).length,0);assert.equal((await db.select().from(mlAnalyses)).length,1);
  assert.equal((await db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,'b'))).length,0);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();}
});
test('owned import receipts recover a lost response without duplicate reports/children; changed commands conflict and legacy callers remain compatible',async()=>{
 const{pg,db,store}=await fixture(),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')}as any;next();});registerReportRoutes(app,((req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401))as any,store);const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${(server.address()as any).port}`;
 const send=async(data:unknown,key?:string,user='a',actor?:string)=>{const response=await fetch(base+'/api/microbiome/import',{method:'POST',headers:{'content-type':'application/json',...(key?{'Idempotency-Key':key}:{}),...(user?{'x-user':user}:{}),...(actor?{'X-Bloom-Report-Actor':actor}:{})},body:JSON.stringify(data)});return{status:response.status,body:await response.json().catch(()=>null)as any};};
 try{
  const key=randomUUID();assert.equal((await send(body,key,'')).status,401);assert.equal((await send(body,'invalid')).status,400);
  assert.equal((await send(body,key,'a','b')).status,409,'A stale tab cannot import into a newly signed-in account');assert.equal((await db.select().from(microbiomeSamples)).length,0);
  const first=await send(body,key,'a','a'),replay=await send({notes:body.notes,report:{bacteria_percentages:{Roseburia:40,Bifidobacterium:60}}},key);assert.equal(first.status,200);assert.deepEqual(replay,first);assert.match(first.body.sampleId,/^report_[a-f0-9]{64}$/);assert.equal((await db.select().from(microbiomeSamples)).length,1);assert.equal((await db.select().from(bacterialComposition)).length,2);assert.equal((await db.select().from(mlAnalyses)).length,1);
  assert.equal((await send({...body,notes:'Changed'},key)).status,409);assert.equal((await db.select().from(microbiomeSamples)).length,1);
  const other=await send(body,key,'b');assert.equal(other.status,200);assert.notEqual(other.body.sampleId,first.body.sampleId);
  assert.equal((await send(body)).status,200,'Unaware legacy API remains compatible');const count=(await db.select().from(microbiomeSamples)).length;
  const adapter=store.importStructuredReport;store.importStructuredReport=undefined;assert.equal((await send(body,randomUUID())).status,503);assert.equal((await db.select().from(microbiomeSamples)).length,count,'A requested receipt never falls back to duplicate-prone legacy writes');store.importStructuredReport=adapter;
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();}
});
test('failed child insert rolls back the whole report; exact concurrent retry and functional-score imports preserve source truth without exposing receipt internals',async()=>{
 const{pg,db}=await fixture(),report=parseStructuredReport(body.report),key=randomUUID();
 try{
  await pg.exec("ALTER TABLE bacterial_composition ADD CONSTRAINT reject_fixture_taxon CHECK(bacterial_name <> 'Roseburia')");
  await assert.rejects(()=>importStructuredReportWithReceipt(db,'a',report,{},null,key),/could not be saved/);
  for(const table of [microbiomeSamples,bacterialComposition,mlAnalyses])assert.equal((await db.select().from(table)).length,0,'No partial failed import remains');
  await pg.exec('ALTER TABLE bacterial_composition DROP CONSTRAINT reject_fixture_taxon');
  const[a,b]=await Promise.all([importStructuredReportWithReceipt(db,'a',report,{},null,key),importStructuredReportWithReceipt(db,'a',report,{},null,key)]);assert.deepEqual(a,b);const rows=await db.select().from(microbiomeSamples);assert.equal(rows.length,1);assert.equal((await db.select().from(bacterialComposition)).length,2);assert.equal((await db.select().from(mlAnalyses)).length,1);
  const raw=rows[0].structuredData as any;assert.match(raw.importInfo.saveReceipt.requestHash,/^[a-f0-9]{64}$/);assert.ok(!JSON.stringify(raw).includes(key),'Raw retry key is not persisted');const projected=publicSample(rows[0]);assert.ok(!Object.hasOwn(projected,'rawDataPath'));assert.doesNotMatch(JSON.stringify(projected),/saveReceipt|requestHash/);assert.equal((projected.structuredData as any).importInfo.dateSource,'import-date');
  const functional=await importStructuredReportWithReceipt(db,'a',parseStructuredReport({scores:[{name:'Synthetic pathway',score:42}]}),{},null,randomUUID());assert.equal(functional.preview.kind,'functional-report');assert.equal(functional.preview.quantifiedTaxa,0);assert.equal((await db.select().from(bacterialComposition)).length,2,'Scores never manufacture additional taxa');
 }finally{await pg.close();}
});
