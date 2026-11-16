import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {labResponseContextSchema,labResponseQuestions} from '../shared/lab-response-context';
import {experienceEntrySchema} from '../shared/experience';
import {ExperienceStorage} from '../server/experience-storage';
import {encryptPrecision} from '../server/precision-crypto';
import {registerExperienceRoutes} from '../server/experience-routes';
import {weeklyReview} from '../shared/practical-planner';
import {labReviewFamilies} from '../shared/lab-panel-review';
const payload={version:1 as const,valueKind:'recalled-context' as const,intentId:'00000000-0000-4000-8000-000000000001',family:'lipids' as const,question:'medication-change' as const,answer:'yes' as const,reviewWindow:{from:'2026-09-01',to:'2026-10-01',basis:'source-date' as const},eventWindow:{from:'2026-09-01',to:'2026-09-30',precision:'range' as const},datePrecision:'range' as const,recordedAt:'2026-11-16T12:00:00Z',sourceReferences:[{id:'source-before',revision:'a'.repeat(64)},{id:'source-after',revision:'b'.repeat(64)}],supersedes:null,notes:'Synthetic recollection, dates uncertain.'};
const lifecycle={version:1 as const,valueKind:'context-lifecycle' as const,scopeHash:'c'.repeat(64),generationId:'00000000-0000-4000-8000-000000000002',updatedAt:'2026-11-16T12:00:00Z'};
test('context reader separates remembered date precision from learned-at and rejects fabricated event or causal fields',()=>{
 assert.deepEqual(labResponseContextSchema.parse(payload),payload);
 assert.deepEqual(labResponseContextSchema.parse(lifecycle),lifecycle);
 for(const extra of [{answer:'yes'},{notes:'Private text'},{sourceReferences:payload.sourceReferences},{completed:true}])assert.equal(labResponseContextSchema.safeParse({...lifecycle,...extra}).success,false);
 assert.deepEqual(Object.keys(labResponseQuestions).sort(),labReviewFamilies.map(f=>f.id).sort());
 for(const family of labReviewFamilies)assert.equal(family.question,labResponseQuestions[family.id].text);
 for(const answer of ['no','unknown','not-tracked','prefer-not-answer'])assert.ok(labResponseContextSchema.safeParse({...payload,answer,eventWindow:null,datePrecision:'not-applicable',notes:''}).success);
 assert.ok(labResponseContextSchema.safeParse({...payload,eventWindow:null,datePrecision:'unknown'}).success);
 for(const patch of [{reviewWindow:{from:'2026-10-01',to:'2026-09-01',basis:'source-date'}},{eventWindow:{from:'2026-10-02',to:'2026-10-02',precision:'day'},datePrecision:'day'},{causalProbability:0.8},{confirmedPerformed:true},{userId:'foreign'},{recordedAt:'invalid'},{question:'acute-illness'},{sourceReferences:[payload.sourceReferences[0],payload.sourceReferences[0]]},{eventWindow:{from:'2026-02-30',to:'2026-03-01',precision:'range'}},{eventWindow:{from:'2026-09-30',to:'2026-09-01',precision:'range'}},{datePrecision:'day'},{eventWindow:{from:'2099-01-01',to:'2099-01-01',precision:'day'},datePrecision:'day'},{answer:'unknown'},{answer:'prefer-not-answer',eventWindow:null,datePrecision:'not-applicable'}])assert.equal(labResponseContextSchema.safeParse({...payload,...patch}).success,false,JSON.stringify(patch));
});
test('encrypted context reader survives reload/export, remains owned and cannot bypass the future source-reviewed writer',async()=>{
 const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 const pg=new PGlite();let server:ReturnType<typeof express.application.listen>|undefined;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
  await pg.query('INSERT INTO experience_records(id,user_id,kind,encrypted_payload) VALUES($1,$2,$3,$4)',['context-a','a','lab-response-context',encryptPrecision(payload,'a')]);
  await pg.query('INSERT INTO experience_records(id,user_id,kind,encrypted_payload) VALUES($1,$2,$3,$4)',['lifecycle-a','a','lab-response-context',encryptPrecision(lifecycle,'a')]);
  const storage=new ExperienceStorage(drizzle(pg) as any),entry=experienceEntrySchema.parse({kind:'lab-response-context',payload});
  const rows=await storage.getExperienceRecords('a','lab-response-context');assert.equal(rows.length,2);assert.deepEqual(rows.find(row=>row.id==='context-a')!.payload,payload);assert.deepEqual(await storage.getExperienceRecords('b','lab-response-context'),[]);
  assert.equal(weeklyReview(rows,'everyday','2026-11-16').entries,0);assert.ok(weeklyReview(rows,'everyday','2026-11-16').metrics.every(row=>row.current===null));
  assert.equal((await storage.exportExperience('a')).records.length,2);assert.equal((await storage.exportExperience('b')).records.length,0);
  await assert.rejects(storage.insertExperienceRecord('a',entry),/LAB_CONTEXT_ACTION_REQUIRED/);await assert.rejects(storage.updateExperienceRecord('a','context-a',entry),/LAB_CONTEXT_ACTION_REQUIRED/);await assert.rejects(storage.deleteExperienceRecord('a','context-a'),/LAB_CONTEXT_ACTION_REQUIRED/);
  const app=express();app.use(express.json());registerExperienceRoutes(app,(req,res,next)=>{const actor=req.get('X-Fixture-Account');if(!actor)return res.sendStatus(401);req.session={userId:actor} as any;next();},storage as any,{} as any);
  server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server!.once('listening',resolve));const url=`http://127.0.0.1:${(server.address() as any).port}/api/experience`;
  assert.equal((await fetch(url+'/records?kind=lab-response-context')).status,401);
  assert.equal((await(await fetch(url+'/records?kind=lab-response-context',{headers:{'X-Fixture-Account':'a'}})).json()).length,2);
  assert.deepEqual(await(await fetch(url+'/records?kind=lab-response-context',{headers:{'X-Fixture-Account':'b'}})).json(),[]);
  for(const [method,path,body] of [['POST','/records',entry],['PUT','/records/context-a',entry],['DELETE','/records/context-a',undefined]] as const){assert.equal((await fetch(url+path,{method,headers:{'X-Fixture-Account':'a','content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})).status,400);}
  assert.equal((await fetch(url+'/records/context-a',{method:'DELETE',headers:{'X-Fixture-Account':'b'}})).status,404);
  assert.equal((await(await fetch(url+'/export',{headers:{'X-Fixture-Account':'a'}})).json()).records.find((row:any)=>row.id==='context-a').payload.recordedAt,payload.recordedAt);
  assert.deepEqual((await new ExperienceStorage(drizzle(pg) as any).getExperienceRecords('a','lab-response-context')).find(row=>row.id==='context-a')!.payload,payload);
  const raw=await pg.query<{encrypted_payload:unknown}>('SELECT encrypted_payload FROM experience_records WHERE id=$1',['context-a']);assert.ok(!JSON.stringify(raw.rows[0].encrypted_payload).includes(payload.notes));
  await pg.query('INSERT INTO experience_records(id,user_id,kind,encrypted_payload) VALUES($1,$2,$3,$4)',['context-b','b','lab-response-context',encryptPrecision(payload,'b')]);
  await storage.clearExperienceData('a');assert.deepEqual(await storage.getExperienceRecords('a','lab-response-context'),[]);assert.equal((await storage.getExperienceRecords('b','lab-response-context')).length,1);
 }finally{server?.closeAllConnections();if(server)await new Promise<void>(resolve=>server!.close(()=>resolve()));await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
