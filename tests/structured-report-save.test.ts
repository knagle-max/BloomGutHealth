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
import {importStructuredReportWithReceipt} from '../server/structured-report-storage';
import {publicSample} from '../server/analysis-boundary';
const body={report:{bacteria_percentages:{Bifidobacterium:60,Roseburia:40}},notes:'Original source'};
async function fixture(){
 const pg=new PGlite();await pg.exec(`CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');CREATE TABLE microbiome_samples(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL REFERENCES users(id),test_date timestamp NOT NULL,testing_company text,test_id text,raw_data_path text,structured_data jsonb,notes text,processing_status text NOT NULL DEFAULT 'pending',diversity_index real,uploaded_at timestamp NOT NULL DEFAULT now());CREATE TABLE bacterial_composition(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),sample_id varchar NOT NULL REFERENCES microbiome_samples(id),bacterial_name text NOT NULL,taxonomy_level text NOT NULL,abundance real NOT NULL,genome_data jsonb);CREATE TABLE ml_analyses(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),sample_id varchar NOT NULL REFERENCES microbiome_samples(id),analysis_type text NOT NULL,model_version text NOT NULL,results jsonb NOT NULL,confidence real,explainability jsonb,compared_cohorts text[],analyzed_at timestamp NOT NULL DEFAULT now());`);const db=drizzle(pg);
 const store:any={insertMicrobiomeSample:async(data:any)=>(await db.insert(microbiomeSamples).values(data).returning())[0],updateMicrobiomeSample:async(id:string,updates:any)=>{await db.update(microbiomeSamples).set(updates).where(eq(microbiomeSamples.id,id));},insertBacterialComposition:async(data:any)=>{await db.insert(bacterialComposition).values(data);},insertMlAnalysis:async(data:any)=>(await db.insert(mlAnalyses).values(data).returning())[0].id,importStructuredReport:(owner:string,report:StructuredReport,fields:ReportImportFields,filename:string|null,key:string)=>importStructuredReportWithReceipt(db,owner,report,fields,filename,key)};
 return{pg,db,store};
}
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
