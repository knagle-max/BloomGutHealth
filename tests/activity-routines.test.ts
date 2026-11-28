import {activityTimeText} from '../shared/activity';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {activityRoutinePlanSchema,activitySchema,type ActivityRoutinePlan} from '../shared/experience';
import {routineDue,routineLocalDate,routinePlannedParts,routineActualParts,routineActualChildId,routineSourceMatches,routineOccurrencesForDate,addRoutineDays} from '../shared/activity-routines';
import {activityProjection} from '../shared/activity-capture';
import {ExperienceStorage} from '../server/experience-storage';

function plan():ActivityRoutinePlan{return activityRoutinePlanSchema.parse({version:1,revision:randomUUID(),name:'Workday walking pad',components:{version:1,items:[{id:randomUUID(),title:'Walking pad',activityId:'walk',match:'reported',minutes:null,distanceM:null,steps:null,stepScope:'session'}]},weekdays:[1,2,3,4,5],timeZone:'America/Regina',effectiveFrom:'2026-01-01',effectiveTo:null,preferredTime:null,paused:false,stepTarget:{min:10000,max:15000}});}
test('selected local weekdays and DST identify calendar occurrences; plans never become actual counts or completed sets',async()=>{
 const p=plan();assert.equal(routineDue(p,'2026-11-09'),true);assert.equal(routineDue(p,'2026-11-08'),false);assert.equal(routineDue({...p,paused:true},'2026-11-09'),false);
 assert.equal(routineDue({...p,effectiveTo:'2026-11-08'},'2026-11-09'),false);
 for(const at of ['2026-11-01T05:30:00Z','2026-11-01T06:30:00Z'])assert.equal(routineLocalDate('America/New_York',new Date(at)),'2026-11-01');
 assert.equal(routineLocalDate('America/Regina',new Date('2026-11-09T01:00:00Z')),'2026-11-08');
 const parts=await routineActualParts(p,'2026-11-09');assert.equal(parts[0].steps,null);assert.equal(parts[0].minutes,null);assert.notEqual(parts[0].id,p.components.items[0].id);assert.equal(await routineActualChildId('00000000-0000-4000-8000-000000000001','2026-11-09','00000000-0000-4000-8000-000000000002'),'cfb8f489-97ee-5ca7-ad11-5cfb8eb59af9','Independent RFC UUIDv5 reference fixture');assert.deepEqual(await routineActualParts(p,'2026-11-09'),parts);assert.notEqual((await routineActualParts(p,'2026-11-10'))[0].id,parts[0].id);
 const strength={...p.components.items[0],actualSets:{version:1 as const,sets:[{id:randomUUID(),exercise:'Bench press',reps:10,loadKg:50,completed:true}]}};
 const planned=routinePlannedParts([strength]);assert.equal(planned[0].actualSets?.sets[0].completed,false);assert.equal(planned[0].actualSets?.sets[0].state,'planned');
 assert.equal(activityRoutinePlanSchema.safeParse({...p,components:{version:1,items:[strength]}}).success,false);
 assert.equal(activityRoutinePlanSchema.safeParse({...p,components:{version:1,items:[{...parts[0],steps:12400}]}}).success,false);
 const actual=activitySchema.parse({...activityProjection(parts),components:{version:1,items:parts},startedAt:'2026-11-09T18:00:00Z',routineSource:{routineId:'owned',revision:p.revision,localDate:'2026-11-09',scheduledDate:'2026-11-09',occurrenceRevision:null,timeZone:p.timeZone,confirmedPerformed:true,timestampBasis:'log-time',planSnapshot:p}});
 assert.match(activityTimeText(actual),/Recorded .*activity start time not supplied/);
 assert.equal(routineSourceMatches(actual,p,new Date('2026-11-09T19:00:00Z')),true);
 assert.equal(routineSourceMatches(actual,{...p,revision:randomUUID()},new Date('2026-11-09T19:00:00Z')),false);
 assert.equal(routineSourceMatches(actual,p,new Date('2026-11-09T17:00:00Z')),false);
});
test('one-occurrence skip/restore/reschedule uses owned CAS and original scheduled identity without creating phantom performance',async()=>{
 const oldKey=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
  const store=new ExperienceStorage(drizzle(pg)as any),now=new Date(),today=routineLocalDate('UTC',now),p={...plan(),timeZone:'UTC',effectiveFrom:today,weekdays:[0,1,2,3,4,5,6]};
  const created=await store.createActivityRoutine('a',p,randomUUID(),null),skip={revision:randomUUID(),state:'skipped' as const,toDate:null};
  const skipped=await store.changeRoutineOccurrence('a',created.id,today,p.revision,null,skip);assert.equal(skipped?.kind,'activity-routine');if(skipped?.kind!=='activity-routine')throw Error('fixture');
  assert.deepEqual(routineOccurrencesForDate(skipped.payload,today),[]);assert.equal((await store.getExperienceRecords('a','activity')).length,0);
  assert.equal((await store.changeRoutineOccurrence('a',created.id,today,p.revision,null,skip))?.updatedAt,skipped.updatedAt,'Exact lost-response retry remains one override');
  await assert.rejects(store.changeRoutineOccurrence('a',created.id,today,p.revision,null,null),/changed elsewhere/);
  const restored=await store.changeRoutineOccurrence('a',created.id,today,p.revision,skip.revision,null);if(restored?.kind!=='activity-routine')throw Error('fixture');assert.equal(routineOccurrencesForDate(restored.payload,today).length,1);
  const from=addRoutineDays(today,7),move={revision:randomUUID(),state:'rescheduled' as const,toDate:today};
  assert.equal(await store.changeRoutineOccurrence('b',created.id,from,p.revision,null,move),null);
  const moved=await store.changeRoutineOccurrence('a',created.id,from,p.revision,null,move);if(moved?.kind!=='activity-routine')throw Error('fixture');assert.equal(routineOccurrencesForDate(moved.payload,today).length,2);assert.equal(routineOccurrencesForDate(moved.payload,from).length,0);
  const parts=await routineActualParts(p,from),payload=activitySchema.parse({...activityProjection(parts),components:{version:1,items:parts},startedAt:now.toISOString(),routineSource:{routineId:created.id,revision:p.revision,localDate:today,scheduledDate:from,occurrenceRevision:move.revision,timeZone:'UTC',confirmedPerformed:true,timestampBasis:'log-time',planSnapshot:p}});
  assert.equal(routineSourceMatches(payload,p,now,moved.payload.occurrenceOverrides),true);assert.equal(routineSourceMatches(payload,p,now,{}),false);
  const saves=await Promise.all([store.createActivity('a',payload,randomUUID()),store.createActivity('a',payload,randomUUID())]);assert.equal(saves[0].id,saves[1].id);assert.equal((await store.getExperienceRecords('a','activity')).length,1);
  await assert.rejects(store.changeRoutineOccurrence('a',created.id,from,p.revision,move.revision,null),/already recorded/);
  await assert.rejects(store.changeRoutineOccurrence('a',created.id,addRoutineDays(today,35),p.revision,null,skip),/within 28 days/);
  await store.deleteExperienceRecord('a',created.id);assert.equal((await store.getExperienceRecords('a','activity')).length,1,'Template deletion retains actual source');
 }finally{await pg.close();if(oldKey===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=oldKey;}
});
test('owned encrypted routine and canonical activity save are atomic, source versioned, retry safe and never resurrect a deleted occurrence',async()=>{
 const oldKey=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
  const store=new ExperienceStorage(drizzle(pg)as any),now=new Date(),date=routineLocalDate('UTC',now),p={...plan(),timeZone:'UTC',effectiveFrom:date,weekdays:[new Date(date+'T12:00:00Z').getUTCDay()]},key=randomUUID();
  const routine=await store.createActivityRoutine('a',p,key,null);assert.equal((await store.createActivityRoutine('a',p,key,null)).id,routine.id);assert.equal((await store.getExperienceRecords('a','activity')).length,0);
  const items=await routineActualParts(p,date);items[0].steps=12400;
  const actual=activitySchema.parse({...activityProjection(items),components:{version:1,items},startedAt:now.toISOString(),timeZone:'UTC',routineSource:{routineId:routine.id,revision:p.revision,localDate:date,scheduledDate:date,occurrenceRevision:null,timeZone:'UTC',confirmedPerformed:true,timestampBasis:'log-time',planSnapshot:p}});
  await assert.rejects(store.createActivity('b',actual,randomUUID()),/not found/);
  const saved=await store.createActivity('a',actual,randomUUID());assert.equal((await store.createActivity('a',actual,randomUUID())).id,saved.id);
  await assert.rejects(store.createActivity('a',{...actual,notes:'different occurrence receipt'},randomUUID()),/ACTIVITY_SAVE_CONFLICT/);
  assert.equal((await store.getExperienceRecords('a','activity')).length,1);
  const next={...p,revision:randomUUID(),stepTarget:{min:8000,max:12000}};const updated=await store.updateActivityRoutine('a',routine.id,p.revision,next);assert.equal(updated?.kind,'activity-routine');
  const retained=(await store.getExperienceRecords('a','activity'))[0];assert.equal(retained.kind,'activity');if(retained.kind==='activity'){assert.equal(retained.payload.steps,12400);assert.equal(retained.payload.routineSource?.planSnapshot.stepTarget?.min,10000);}
  await assert.rejects(store.updateActivityRoutine('a',routine.id,p.revision,{...next,revision:randomUUID()}),/changed elsewhere/);
  assert.equal(await store.updateActivityRoutine('b',routine.id,next.revision,{...next,revision:randomUUID()}),null);
  await store.deleteExperienceRecord('a',saved.id);await assert.rejects(store.createActivity('a',actual,randomUUID()),/already recorded/);
  await store.deleteExperienceRecord('a',routine.id);assert.deepEqual(await store.getExperienceRecords('a'),[]);
 }finally{await pg.close();if(oldKey===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=oldKey;}
});
