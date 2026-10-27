import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {readFileSync} from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
import {ExperienceStorage} from '../server/experience-storage';
import {registerExperienceRoutes} from '../server/experience-routes';
test('manual activity saves replay once, reject changed receipts, stay owned and support ordinary correction/export/deletion',async()=>{
 const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
 const store=new ExperienceStorage(drizzle(pg)as any),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')}as any;next();});registerExperienceRoutes(app,((req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401))as any,store as any,{}as any);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const origin=`http://127.0.0.1:${(server.address()as any).port}/api/experience`;
 const request=async(path:string,method='GET',body?:unknown,key?:string,user='a')=>{const response=await fetch(origin+path,{method,headers:{'content-type':'application/json',...(user?{'x-user':user}:{}),...(key?{'Idempotency-Key':key}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return{status:response.status,body:await response.json().catch(()=>null)as any};};
 const payload={title:'Lunch walk',startedAt:'2026-10-26T18:00:00Z',minutes:25,source:'manual',timeZone:'America/Regina',effort:null,notes:''},key=randomUUID();
 try{
  assert.equal((await request('/activities','POST',payload)).status,400);assert.equal((await request('/activities','POST',{...payload,minutes:0},key)).status,400);assert.equal((await request('/activities','POST',payload,key,'')).status,401);
  const created=await request('/activities','POST',payload,key);assert.equal(created.status,201);assert.equal(created.body.kind,'activity');assert.deepEqual(created.body.payload,payload);assert.doesNotMatch(JSON.stringify(created.body),new RegExp(key));
  const replay=await request('/activities','POST',payload,key);assert.equal(replay.status,201);assert.equal(replay.body.id,created.body.id);assert.equal(replay.body.updatedAt,created.body.updatedAt);assert.equal((await store.getExperienceRecords('a','activity')).length,1);
  assert.equal((await request('/activities','POST',{...payload,minutes:30},key)).status,409);assert.deepEqual((await request('/records?kind=activity','GET',undefined,undefined,'b')).body,[]);assert.deepEqual((await store.getExperienceRecords('a','session')),[],'Everyday activity does not become a training session');
  const correction=await request('/records/'+created.body.id,'PUT',{kind:'activity',payload:{...payload,minutes:30}});assert.equal(correction.status,200);assert.equal(correction.body.payload.startedAt,payload.startedAt);assert.equal(correction.body.payload.timeZone,payload.timeZone);assert.equal(correction.body.payload.minutes,30);
  assert.equal((await request('/export')).body.records[0].payload.minutes,30);assert.equal((await request('/records/'+created.body.id,'DELETE')).status,204);assert.deepEqual((await request('/records?kind=activity')).body,[]);
  const adapter=store.createActivity;(store as any).createActivity=undefined;assert.equal((await request('/activities','POST',payload,randomUUID())).status,503);store.createActivity=adapter;
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
