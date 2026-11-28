import {exerciseCatalogue,exerciseCatalogueVersion} from '../shared/exercise-catalogue';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {localizedSymptomSchema,symptomRegionChoices,symptomRegionSource} from '../shared/localized-symptoms';
import {experienceEntrySchema} from '../shared/experience';
import {ExperienceStorage} from '../server/experience-storage';
const observation=()=>localizedSymptomSchema.parse({version:1,lifecycleId:randomUUID(),revision:randomUUID(),type:'soreness',location:{source:symptomRegionSource,view:'front',regionId:symptomRegionChoices.front[0].id,laterality:'unspecified'},observedAt:'2026-11-20T12:00:00Z',timeZone:null,onsetAt:null,severity:null,durationMinutes:null,ongoing:null,notes:'Synthetic localized observation',source:'user-reported'});
test('localized sources preserve null versus explicit zero and explicit user laterality',()=>{
 const unknown=observation();assert.equal(unknown.severity,null);assert.equal(unknown.durationMinutes,null);assert.equal(unknown.ongoing,null);assert.equal(unknown.location.laterality,'unspecified');
 const zero=localizedSymptomSchema.parse({...unknown,severity:0,durationMinutes:0,ongoing:false});assert.equal(zero.severity,0);assert.equal(zero.durationMinutes,0);assert.equal(zero.ongoing,false);
 assert.equal(localizedSymptomSchema.safeParse({...unknown,severity:11}).success,false);assert.equal(localizedSymptomSchema.safeParse({...unknown,severity:NaN}).success,false);assert.equal(localizedSymptomSchema.safeParse({...unknown,durationMinutes:-1}).success,false);
 assert.equal(localizedSymptomSchema.safeParse({...unknown,location:{...unknown.location,regionId:'invented-region'}}).success,false);
 assert.equal(localizedSymptomSchema.safeParse({...unknown,location:{...unknown.location,laterality:undefined}}).success,false);
 assert.equal(localizedSymptomSchema.safeParse({...unknown,onsetAt:'2026-11-21T12:00:00Z'}).success,false);
 assert.equal(localizedSymptomSchema.safeParse({...unknown,timeZone:'invented/zone'}).success,false);
 assert.equal(localizedSymptomSchema.safeParse({...unknown,userId:'foreign'}).success,false);
});
test('localized observations reuse encrypted canonical records, exact retry, revision correction and account deletion',async()=>{
 const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
  const store=new ExperienceStorage(drizzle(pg)as any),payload={...observation(),lifecycleId:await store.ensureExperienceLifecycle('a')},entry=experienceEntrySchema.parse({kind:'localized-symptom',payload});const first=await store.insertExperienceRecord('a',entry);assert.equal((await store.insertExperienceRecord('a',entry)).id,first.id);assert.equal((await store.getExperienceRecords('a','localized-symptom')).length,1);assert.equal((await store.getExperienceRecords('b','localized-symptom')).length,0);
  assert.equal(await store.updateExperienceRecord('b',first.id,entry),null);assert.equal(await store.deleteExperienceRecord('b',first.id),false);
  const raw=await pg.query('SELECT encrypted_payload FROM experience_records');assert.equal(JSON.stringify(raw.rows).includes(payload.notes),false);
  await store.putExperienceSettings('a',{exerciseCatalogue:{favourites:['exercise.000000000000000000000000'],custom:[{id:randomUUID(),name:'Synthetic custom exercise',aliases:[],category:'Custom exercise',equipment:[]}]}});assert.equal((await store.getExperienceSettings('a')).exerciseCatalogue.custom.length,1);assert.equal((await store.getExperienceSettings('b')).exerciseCatalogue.custom.length,0);
  const reload=new ExperienceStorage(drizzle(pg)as any);assert.deepEqual((await reload.getExperienceRecords('a','localized-symptom'))[0].payload,payload);
  const changed=experienceEntrySchema.parse({kind:'localized-symptom',payload:{...payload,revision:randomUUID(),previousRevision:payload.revision,severity:0,location:{...payload.location,laterality:'left'}}});const corrected=await reload.updateExperienceRecord('a',first.id,changed);assert.ok(corrected);assert.equal((await reload.updateExperienceRecord('a',first.id,changed))?.updatedAt,corrected.updatedAt,'Exact lost-response retry does not rewrite source time');
  await assert.rejects(reload.updateExperienceRecord('a',first.id,experienceEntrySchema.parse({kind:'localized-symptom',payload:{...payload,revision:randomUUID(),previousRevision:payload.revision,severity:9}})),/LOCALIZED_SYMPTOM_CONFLICT/);
  await assert.rejects(reload.insertExperienceRecord('a',changed),/LOCALIZED_SYMPTOM_CREATE_REVISION/);
  await assert.rejects(reload.insertExperienceRecord('a',experienceEntrySchema.parse({kind:'localized-symptom',payload:{...changed.payload,previousRevision:null}})),/LOCALIZED_SYMPTOM_CONFLICT/);
  const other=experienceEntrySchema.parse({kind:'localized-symptom',payload:{...payload,lifecycleId:await store.ensureExperienceLifecycle('b')}});await store.insertExperienceRecord('b',other);await store.clearExperienceData('a');await assert.rejects(store.insertExperienceRecord('a',entry),/LOCALIZED_SYMPTOM_SCOPE/);assert.equal((await reload.getExperienceRecords('a','localized-symptom')).length,0);assert.equal((await reload.getExperienceRecords('b','localized-symptom')).length,1);await reload.deleteExperienceRecord('b',(await reload.getExperienceRecords('b','localized-symptom'))[0].id);assert.equal((await reload.getExperienceRecords('b','localized-symptom')).length,0);
 }finally{await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});

test('localized HTTP records require sign-in, reject owner injection and stale edits, and preserve account isolation',async()=>{
 const express=(await import('express')).default;const {registerExperienceRoutes}=await import('../server/experience-routes');
 const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();let server:import('node:http').Server|undefined;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));const store=new ExperienceStorage(drizzle(pg)as any);const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.headers['x-test-actor']}as any;next();});const auth:any=(req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401);registerExperienceRoutes(app,auth,store as any,{}as any);server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server!.once('listening',resolve));const root=`http://127.0.0.1:${(server.address()as any).port}/api/experience`;
  async function request(path:string,method:string,body:unknown,actor:string,status:number){const response=await fetch(root+path,{method,headers:{'content-type':'application/json',...(actor?{'x-test-actor':actor}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});assert.equal(response.status,status,method+' '+path);if(status!==401)assert.equal(response.headers.get('cache-control'),'no-store');return status===204||status===401?null:response.json();}
  await request('/muscle-history','GET',undefined,'',401);
  await request('/muscle-history?userId=b','GET',undefined,'a',400);
  await request('/muscle-history?days=365','GET',undefined,'a',400);
  await request('/muscle-history?timeZone=unrecognized','GET',undefined,'a',400);
  const at=new Date().toISOString(),setId=randomUUID();
  const activity=experienceEntrySchema.parse({kind:'activity',payload:{startedAt:at,title:'Synthetic bench press',minutes:null,effort:'moderate',notes:'',actualSets:{version:1,sets:[{id:setId,exercise:'bench press',reps:10,loadKg:50,completed:true}]}}});
  assert.equal(activity.kind,'activity');if(activity.kind!=='activity')throw Error('fixture');const training=await store.createActivity('a',activity.payload,randomUUID());
  const history=await request('/muscle-history?days=7&timeZone=UTC','GET',undefined,'a',200);
  assert.equal(history.contributions.length,1);assert.equal(history.contributions[0].setId,setId);assert.equal(history.muscles.find((m:any)=>m.id==='pectoralis_major').knownExternalVolumeKgReps,500);
  const foreign=await request('/muscle-history?days=7&timeZone=UTC','GET',undefined,'b',200);assert.equal(foreign.contributions.length,0);assert.notEqual(history.sourceRevision,foreign.sourceRevision);
  await request('/records/'+training.id,'DELETE',undefined,'a',204);
  const removed=await request('/muscle-history?days=7&timeZone=UTC','GET',undefined,'a',200);assert.equal(removed.contributions.length,0);assert.notEqual(history.sourceRevision,removed.sourceRevision);
  const fullChoice=exerciseCatalogue.find(e=>e.name==='Alternating dumbbell bench press')!;
  const fullPayload={...activity.payload,title:fullChoice.name,actualSets:{version:1 as const,sets:[{...activity.payload.actualSets!.sets[0],id:randomUUID(),exercise:fullChoice.name,side:'both' as const,catalogueRef:{id:fullChoice.id,version:exerciseCatalogueVersion,match:'selected' as const,confirmed:true}}]}};
  const fullTraining=await store.createActivity('a',fullPayload,randomUUID());
  const expanded=await request('/muscle-history?days=7&timeZone=UTC','GET',undefined,'a',200);
  assert.equal(expanded.contributions.length,1);assert.equal(expanded.contributions[0].exerciseId,fullChoice.id);assert.equal(expanded.contributions[0].associationStates.length,5);assert.ok(expanded.contributions[0].associationStates.every((a:any)=>a.state==='preliminary'));assert.equal(expanded.muscles.find((m:any)=>m.id==='pectoralis_major').directSetRecords,1);
  assert.equal((await request('/muscle-history?days=7&timeZone=UTC','GET',undefined,'b',200)).contributions.length,0);
  await request('/records/'+fullTraining.id,'DELETE',undefined,'a',204);assert.equal((await request('/muscle-history?days=7&timeZone=UTC','GET',undefined,'a',200)).contributions.length,0);
  const context=await request('/localized-symptom-context','GET',undefined,'a',200);await request('/localized-symptom-context','GET',undefined,'b',200);const entry={kind:'localized-symptom',payload:{...observation(),lifecycleId:context.lifecycleId}};await request('/records','POST',entry,'b',409);await request('/records','POST',entry,'',401);await request('/records','POST',{...entry,userId:'b'},'a',400);const row=await request('/records','POST',entry,'a',201);assert.equal((await request('/records','POST',entry,'a',201)).id,row.id);assert.equal((await request('/records?kind=localized-symptom','GET',undefined,'a',200)).length,1);assert.deepEqual(await request('/records?kind=localized-symptom','GET',undefined,'b',200),[]);
  await request('/records/'+row.id,'PUT',entry,'b',404);await request('/records/'+row.id,'DELETE',undefined,'b',404);
  const corrected={kind:'localized-symptom',payload:{...entry.payload,revision:randomUUID(),previousRevision:entry.payload.revision,severity:0,durationMinutes:0}};await request('/records/'+row.id,'PUT',corrected,'a',200);await request('/records/'+row.id,'PUT',{kind:'localized-symptom',payload:{...entry.payload,revision:randomUUID(),previousRevision:entry.payload.revision,severity:7}},'a',409);const saved=await request('/records?kind=localized-symptom','GET',undefined,'a',200);assert.equal(saved[0].payload.severity,0);assert.equal(saved[0].payload.durationMinutes,0);await request('/records/'+row.id,'DELETE',undefined,'a',204);await request('/records','POST',entry,'a',409);assert.deepEqual(await request('/records?kind=localized-symptom','GET',undefined,'a',200),[]);
 }finally{if(server){server.closeAllConnections();await new Promise<void>(resolve=>server!.close(()=>resolve()));}await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
