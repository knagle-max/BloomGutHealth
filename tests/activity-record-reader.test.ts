import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {activitySchema} from '../shared/experience';
import {experienceRecords} from '../shared/schema';
import {encryptPrecision} from '../server/precision-crypto';
import {ExperienceStorage} from '../server/experience-storage';
import {registerExperienceRoutes} from '../server/experience-routes';
const activity=activitySchema.parse({title:'Lunch walk',startedAt:'2026-10-26T18:00:00Z',minutes:25,timeZone:'America/Regina'});
test('manual activity records preserve duration and source without inventing effort, energy or training context',()=>{
 assert.equal(activity.effort,null);assert.equal(activity.source,'manual');assert.equal(activity.startedAt,'2026-10-26T18:00:00Z');
 assert.equal(activitySchema.safeParse({...activity,caloriesBurned:100}).success,false);
 assert.equal(activitySchema.safeParse({...activity,source:'wearable'}).success,false);
 assert.equal(activitySchema.safeParse({...activity,timeZone:'Unknown/Zone'}).success,false);
 assert.equal(activitySchema.safeParse({...activity,title:'',minutes:0}).success,false);
 assert.equal(activitySchema.parse({...activity,effort:'easy'}).effort,'easy');
});
test('encrypted activity reader supports owned history/export/correction/deletion before ordinary capture is enabled',async()=>{
 const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
 const db=drizzle(pg),store=new ExperienceStorage(db as any);await db.insert(experienceRecords).values({id:'manual-activity',userId:'a',kind:'activity',encryptedPayload:encryptPrecision(activity,'a')});
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')}as any;next();});registerExperienceRoutes(app,((req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401))as any,store as any,{}as any);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const origin=`http://127.0.0.1:${(server.address()as any).port}/api/experience`;
 const request=async(path:string,method='GET',body?:unknown,user='a')=>{const response=await fetch(origin+path,{method,headers:{'content-type':'application/json',...(user?{'x-user':user}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return{status:response.status,body:await response.json().catch(()=>null)as any,cache:response.headers.get('cache-control')};};
 try{
  const own=await request('/records?kind=activity');assert.equal(own.status,200);assert.equal(own.cache,'no-store');assert.deepEqual(own.body[0].payload,activity);
  assert.deepEqual((await request('/records?kind=activity','GET',undefined,'b')).body,[]);assert.equal((await request('/records?kind=activity','GET',undefined,'')).status,401);
  assert.equal((await request('/records','POST',{kind:'activity',payload:activity})).status,400);await assert.rejects(()=>store.insertExperienceRecord('a',{kind:'activity',payload:activity}),/ACTIVITY_ACTION_REQUIRED/);
  assert.equal((await request('/records/manual-activity','PUT',{kind:'activity',payload:{...activity,title:'Evening walk'}},'b')).status,404);
  const corrected=await request('/records/manual-activity','PUT',{kind:'activity',payload:{...activity,minutes:30}});assert.equal(corrected.status,200);assert.equal(corrected.body.payload.minutes,30);
  const exported=await request('/export');assert.equal(exported.body.records[0].kind,'activity');assert.equal(exported.body.records[0].payload.minutes,30);
  const encrypted=await pg.query('SELECT encrypted_payload FROM experience_records');assert.doesNotMatch(JSON.stringify(encrypted.rows),/Lunch walk|America\/Regina/);
  assert.equal((await request('/records/manual-activity','DELETE',undefined,'b')).status,404);assert.equal((await request('/records/manual-activity','DELETE')).status,204);assert.deepEqual((await request('/records?kind=activity')).body,[]);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
