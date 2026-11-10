import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {randomBytes,randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {ExperienceStorage} from '../server/experience-storage';
import {registerExperienceRoutes} from '../server/experience-routes';
import {activityRoutineSchema,activityRoutinePlanSchema,activitySchema} from '../shared/experience';
import {experienceRecords} from '../shared/schema';
import {encryptPrecision} from '../server/precision-crypto';
import {activityAmountText} from '../shared/activity-capture';
import {activityTimeText} from '../shared/activity';

test('owned routine/source readers precede new writers; original target/zero/log-time survive history/export and independent deletion',async()=>{
 const oldKey=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();
 let server:ReturnType<ReturnType<typeof express>['listen']>|undefined;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
  const db=drizzle(pg),store=new ExperienceStorage(db as any),revision=randomUUID(),id='reader-routine',activityId='reader-activity';
  const plan=activityRoutinePlanSchema.parse({version:1,revision,name:'Synthetic source walking pad',components:{version:1,items:[{id:randomUUID(),title:'Walking pad',activityId:'walk',match:'reported',minutes:null,distanceM:null,steps:null,stepScope:'session'}]},weekdays:[1,2,3,4,5],timeZone:'UTC',effectiveFrom:'2026-10-01',effectiveTo:null,preferredTime:null,paused:false,stepTarget:{min:10000,max:15000}});
  const actual=activitySchema.parse({title:'Walking pad',startedAt:'2026-10-26T14:00:00Z',minutes:null,steps:0,stepScope:'session',routineSource:{routineId:id,revision,localDate:'2026-10-26',scheduledDate:'2026-10-26',occurrenceRevision:null,timeZone:'UTC',confirmedPerformed:true,timestampBasis:'log-time',planSnapshot:plan}});
  const routine=activityRoutineSchema.parse({plan,sourceActivityId:null,acknowledgedOccurrences:{'2026-10-26':{activityId,revision,receiptHash:'a'.repeat(64)}}});
  await db.insert(experienceRecords).values([{id,userId:'a',kind:'activity-routine',encryptedPayload:encryptPrecision(routine,'a')},{id:activityId,userId:'a',kind:'activity',encryptedPayload:encryptPrecision(actual,'a')}]);
  const app=express();app.use(express.json());registerExperienceRoutes(app,((req:any,res:any,next:any)=>{req.session={userId:req.get('x-user')};return req.session.userId?next():res.sendStatus(401);})as any,store as any,{}as any);server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server!.once('listening',resolve));const origin=`http://127.0.0.1:${(server.address()as any).port}/api/experience`;
  const request=async(path:string,method='GET',body?:unknown,user='a')=>{const response=await fetch(origin+path,{method,headers:{'content-type':'application/json','x-user':user,'Idempotency-Key':randomUUID()},...(body===undefined?{}:{body:JSON.stringify(body)})});return{status:response.status,cache:response.headers.get('cache-control'),body:await response.json().catch(()=>null)as any};};
  const all=await request('/records');assert.equal(all.status,200);assert.equal(all.cache,'no-store');assert.equal(all.body.length,2);assert.equal((await request('/records?kind=activity-routine')).body[0].payload.plan.stepTarget.min,10000);
  assert.deepEqual((await request('/records','GET',undefined,'b')).body,[]);assert.equal((await request('/records','GET',undefined,'')).status,401);
  const exported=await request('/export');const source=exported.body.records.find((row:any)=>row.kind==='activity');assert.deepEqual(source.payload,actual);assert.match(activityAmountText(actual),/0 steps.*Synthetic source walking pad/);assert.match(activityTimeText(actual),/Recorded .*activity start time not supplied/);
  assert.equal((await request('/records','POST',{kind:'activity-routine',payload:routine})).status,400);assert.equal((await request('/records/'+id,'PUT',{kind:'activity-routine',payload:routine})).status,400);
  const unreviewed=await request('/activities','POST',actual);assert.ok([409,503].includes(unreviewed.status),'Reader denies writes, later writer requires a genuine current occurrence');assert.equal((await store.getExperienceRecords('a','activity')).length,1);
  assert.equal((await request('/records/'+id,'DELETE',undefined,'b')).status,404);assert.equal((await request('/records/'+id,'DELETE')).status,204);assert.deepEqual((await request('/records?kind=activity')).body[0].payload,actual,'Deleting a template never deletes its saved occurrence');
  assert.equal((await request('/records/'+activityId,'DELETE')).status,204);assert.deepEqual((await request('/records')).body,[]);
 }finally{if(server){server.closeAllConnections();await new Promise<void>(resolve=>server!.close(()=>resolve()));}await pg.close();if(oldKey===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=oldKey;}
});
