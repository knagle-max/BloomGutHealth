import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {readFileSync} from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
import {ExperienceStorage} from '../server/experience-storage';
import {registerExperienceRoutes} from '../server/experience-routes';
import {trainingSessionSchema,activitySchema,athleteProfileSchema} from '../shared/experience';
import {buildAthleteDay} from '../shared/athlete';
test('training save receipts prevent ordinary duplicate workout duration and remain distinct from manual activity',async()=>{
 const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
 const store=new ExperienceStorage(drizzle(pg)as any),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')}as any;next();});registerExperienceRoutes(app,((req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401))as any,store as any,{}as any);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const origin=`http://127.0.0.1:${(server.address()as any).port}/api/experience`;
 const request=async(path:string,method='GET',body?:unknown,key?:string,user='a')=>{const response=await fetch(origin+path,{method,headers:{'content-type':'application/json',...(user?{'x-user':user}:{}),...(key?{'Idempotency-Key':key}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return{status:response.status,body:await response.json().catch(()=>null)as any};};
 const payload=trainingSessionSchema.parse({title:'Afternoon ride',startsAt:'2026-10-27T21:00:00Z',minutes:90,intensity:'moderate',discipline:'endurance'}),key=randomUUID();
 try{
  assert.equal((await request('/sessions','POST',payload)).status,400);assert.equal((await request('/sessions','POST',payload,key,'')).status,401);
  const first=await request('/sessions','POST',payload,key),replay=await request('/sessions','POST',payload,key);assert.equal(first.status,201);assert.equal(replay.status,201);assert.equal(replay.body.id,first.body.id);assert.equal(replay.body.updatedAt,first.body.updatedAt);assert.equal((await store.getExperienceRecords('a','session')).length,1);
  assert.equal((await request('/sessions','POST',{...payload,minutes:120},key)).status,409);assert.deepEqual((await request('/records?kind=session','GET',undefined,undefined,'b')).body,[]);
  const activity=await store.createActivity('a',activitySchema.parse({title:'Walk',startedAt:payload.startsAt,minutes:25}),key);assert.notEqual(activity.id,first.body.id);
  const all=await store.getExperienceRecords('a'),sessions=all.flatMap(row=>row.kind==='session'?[row.payload]:[]),day=buildAthleteDay(athleteProfileSchema.parse({}),sessions,[],all);assert.equal(day.minutes,90);assert.equal(day.sessions,1);assert.equal(day.blocked,true);assert.equal(day.recordedLoad,0,'Missing RPE is not inferred from the effort label');
  const adapter=store.createSession;(store as any).createSession=undefined;assert.equal((await request('/sessions','POST',payload,randomUUID())).status,503);store.createSession=adapter;
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
