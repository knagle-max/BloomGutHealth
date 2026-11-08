import {ExperimentHistoryUnavailable} from "../server/experience-errors";
import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import express from 'express';
import {ExperienceStorage} from '../server/experience-storage';
import {registerExperienceRoutes} from '../server/experience-routes';
import {experimentSchema} from '../shared/experience';

test('routine corrections atomically retain encrypted prior sources; ownership, no-op, immutable history, exports and deletion stay together',async()=>{
 const pg=new PGlite(),key=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 let server:ReturnType<express.Express['listen']>|undefined;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");
  await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
  assert.deepEqual(await new ExperienceStorage(drizzle(pg) as any).getExperimentHistory('a'),{status:'not-provisioned',versions:[]});
  const older=new ExperienceStorage(drizzle(pg) as any),legacyPayload=experimentSchema.parse({mode:'everyday',title:'Older deployment',startsOn:'2026-10-10',endsOn:'2026-10-17',action:'One familiar routine',outcome:'Source note'});
  const legacy=await older.insertExperienceRecord('a',{kind:'experiment',payload:legacyPayload});
  await assert.rejects(()=>older.updateExperienceRecord('a',legacy.id,{kind:'experiment',payload:{...legacyPayload,title:'Must not overwrite without history'}}),ExperimentHistoryUnavailable);
  assert.deepEqual((await older.getExperienceRecords('a'))[0].payload,legacyPayload);
  assert.equal((await older.updateExperienceRecord('a',legacy.id,{kind:'experiment',payload:legacyPayload}))?.id,legacy.id,'Exact unchanged save needs no history write');
  assert.equal((await older.getExperimentHistory('a',legacy.id))?.status,'not-provisioned');await older.deleteExperienceRecord('a',legacy.id);
  for(const file of ['0015_experiment_versions.sql','0015_experiment_versions.sql'])await pg.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const store=new ExperienceStorage(drizzle(pg) as any),payload=experimentSchema.parse({mode:'everyday',title:'Synthetic original focus',startsOn:'2026-10-10',endsOn:'2026-10-17',action:'One familiar food change',outcome:'Source comfort rating',design:{baselineStartsOn:'2026-10-01',baselineEndsOn:'2026-10-07',metricUnit:'source unit',measurementMethod:'Same source question',expectedDirection:'observe',confoundersToTrack:'Sleep'},observations:[{date:'2026-10-01',value:0,adherence:null,confounders:'Original source note'}]});
  const original=await store.insertExperienceRecord('a',{kind:'experiment',payload}),other=await store.insertExperienceRecord('b',{kind:'experiment',payload});
  assert.deepEqual(await store.getExperimentHistory('a',original.id),{status:'available',versions:[]});assert.equal(await store.getExperimentHistory('b',original.id),null);
  const corrected=experimentSchema.parse({...payload,observations:[{...payload.observations[0],value:0.00000123,adherence:0,confounders:'Corrected source note'}]});
  await store.updateExperienceRecord('a',original.id,{kind:'experiment',payload:corrected});
  const history=(await store.getExperimentHistory('a',original.id))!;assert.equal(history.versions.length,1);assert.deepEqual(history.versions[0].payload,payload);assert.equal(history.versions[0].recordId,original.id);assert.equal(history.versions[0].sourceUpdatedAt,original.updatedAt);
  await pg.exec("CREATE FUNCTION synthetic_deny_experiment_update() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic rollback'; END $$; CREATE TRIGGER synthetic_deny_experiment_update BEFORE UPDATE ON experience_records FOR EACH ROW EXECUTE FUNCTION synthetic_deny_experiment_update();");
  await assert.rejects(()=>store.updateExperienceRecord('a',original.id,{kind:'experiment',payload:{...corrected,title:'Must not persist'}}));
  await pg.exec('DROP TRIGGER synthetic_deny_experiment_update ON experience_records');
  assert.equal((await store.getExperimentHistory('a',original.id))!.versions.length,1,'Failed correction cannot leave a fictional history event');
  assert.equal((await store.getExperienceRecords('a'))[0].payload.title,corrected.title);
  const raw=(await pg.query('SELECT encrypted_payload FROM experiment_versions')).rows;assert.doesNotMatch(JSON.stringify(raw),/Original source note|Source comfort rating|Same source question/);
  await store.updateExperienceRecord('a',original.id,{kind:'experiment',payload:corrected});assert.equal((await store.getExperimentHistory('a',original.id))!.versions.length,1,'An exact retry does not create a fictional source version');
  assert.equal(await store.updateExperienceRecord('b',original.id,{kind:'experiment',payload}),null);
  await assert.rejects(()=>pg.exec('UPDATE experiment_versions SET superseded_at=now()'));
  await assert.rejects(()=>pg.exec('DELETE FROM experiment_versions'));
  await assert.rejects(()=>pg.exec('TRUNCATE experiment_versions'));
  const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')||'a'} as any;next();});registerExperienceRoutes(app,(_req,_res,next)=>next(),store as any,{} as any);
  server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server!.once('listening',r));const base=`http://127.0.0.1:${(server.address() as any).port}/api/experience`;
  const get=(path:string,user='a')=>fetch(base+path,{headers:{'x-user':user}});
  const response=await get(`/records/${original.id}/history`);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.status,200);assert.deepEqual((await response.json()).versions[0].payload,payload);
  assert.equal((await get(`/records/${original.id}/history`,'b')).status,404);assert.equal((await get(`/records/${original.id}/history?userId=b`)).status,400);
  const exported=await(await get('/export')).json();assert.deepEqual(exported.history.versions[0].payload,payload);assert.equal(exported.records[0].payload.observations[0].value,0.00000123);
  await store.deleteExperienceRecord('a',original.id);assert.equal(await store.getExperimentHistory('a',original.id),null);assert.equal((await pg.query('SELECT * FROM experiment_versions')).rows.length,0);
  await store.updateExperienceRecord('b',other.id,{kind:'experiment',payload:corrected});await pg.exec("DELETE FROM users WHERE id='b'");assert.equal((await pg.query('SELECT * FROM experiment_versions')).rows.length,0,'Account deletion cascades prior source versions');
 }finally{server?.closeAllConnections();if(server)await new Promise<void>(r=>server!.close(()=>r()));await pg.close();if(key===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=key;}
});

test('routine history outage returns a safe actionable response without accepting the correction',async()=>{
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:'synthetic-owner'} as any;next();});
 let calls=0;
 registerExperienceRoutes(app,(_req,_res,next)=>next(),{updateExperienceRecord:async()=>{calls++;throw new ExperimentHistoryUnavailable();}} as any,{} as any);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try {
  const payload=experimentSchema.parse({mode:'everyday',title:'Synthetic correction',startsOn:'2026-10-10',endsOn:'2026-10-17',action:'One routine',outcome:'Source note'});
  const response=await fetch(`http://127.0.0.1:${(server.address() as any).port}/api/experience/records/synthetic-id`,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({kind:'experiment',payload})});
  assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'no-store');
  const body=await response.json();assert.equal(body.code,'ROUTINE_HISTORY_UNAVAILABLE');assert.match(body.error,/saved routine was not changed/);assert.equal(calls,1);
 } finally {server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
