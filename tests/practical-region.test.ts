import express from "express";
import {registerExperienceRoutes} from "../server/experience-routes";
import {experienceSettingsSchema} from "../shared/experience";
import test from 'node:test';import assert from 'node:assert/strict';import{randomBytes}from'node:crypto';import{readFileSync}from'node:fs';import{PGlite}from'@electric-sql/pglite';import{drizzle}from'drizzle-orm/pglite';
import{ExperienceStorage}from'../server/experience-storage';import{settingsRevision,SettingsRevisionConflict}from'../server/settings-source';import{practicalPreferencesSchema}from'../shared/experience';
import{measurementUnitSuggestion}from'../shared/measurement-suggestions';

test('optional encrypted browsing region remains owned, survives unaware practical writes and respects explicit clear and stale revisions',async()=>{
 const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b')");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));const store=new ExperienceStorage(drizzle(pg)as any);
  const initial=await store.getExperienceSettings('a'),old=settingsRevision('a',initial);assert.equal('region' in initial.practical,false);
  await store.putExperienceSettingsIfCurrent('a',{practical:{...initial.practical,region:'United States'}},old);
  assert.equal((await store.getExperienceSettings('a')).practical.region,'United States');assert.equal((await store.getExperienceSettings('b')).practical.region,undefined);
  await assert.rejects(store.putExperienceSettingsIfCurrent('a',{practical:{...initial.practical,minutes:60}},old),SettingsRevisionConflict);
  await store.putExperienceSettings('a',{practical:{...initial.practical,minutes:45}});const retained=await store.getExperienceSettings('a');assert.equal(retained.practical.region,'United States');assert.equal(retained.practical.minutes,45);
  await store.putExperienceSettingsIfCurrent('a',{practical:{...retained.practical,region:null}},settingsRevision('a',retained));assert.equal((await store.getExperienceSettings('a')).practical.region,null);
  assert.equal(practicalPreferencesSchema.safeParse({region:'invented-country'}).success,false);
  const encrypted=await pg.query('SELECT encrypted_payload FROM experience_settings');assert.ok(!JSON.stringify(encrypted.rows).includes('United States'));assert.ok(!JSON.stringify(encrypted.rows).includes('region'));
 }finally{await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
test('explicit browsing-region suggestions override browser hints without mutating independent saved units or inferring residence',()=>{
 assert.equal(measurementUnitSuggestion('en-US','Canada').units.bodyWeight,'kg');assert.equal(measurementUnitSuggestion('en-CA','United States').units.bodyWeight,'lb');
 assert.equal(measurementUnitSuggestion('en-US','Other / unspecified').units.bodyWeight,'kg');assert.equal(measurementUnitSuggestion('en-US',null).units.bodyWeight,'lb');assert.equal(measurementUnitSuggestion('en-CA','invalid').region,null);
 const saved={bodyWeight:'lb',height:'cm'};const before=structuredClone(saved);measurementUnitSuggestion('en-US','Canada');assert.deepEqual(saved,before);
});


test('settings field negotiation keeps strict older readers compatible and never changes account authorization',async()=>{
 const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();
 await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b')");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));const experience=new ExperienceStorage(drizzle(pg)as any),store:any={};for(const method of ['getExperienceSettings','putExperienceSettings','putExperienceSettingsIfCurrent'])store[method]=(experience as any)[method].bind(experience);
 const first=await experience.getExperienceSettings('a');await experience.putExperienceSettings('a',{practical:{...first.practical,region:'United States'}});
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')}as any;next();});registerExperienceRoutes(app,(req,res,next)=>req.session.userId?next():res.sendStatus(401),store,{}as any);const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base=`http://127.0.0.1:${(server.address()as any).port}/api/experience/settings`;
 const request=(aware:boolean,user='a',body?:unknown,revision?:string)=>fetch(base,{method:body?'PATCH':'GET',headers:{'content-type':'application/json',...(user?{'x-user':user}:{}),...(aware?{'X-Bloom-Settings-Fields':'practical-region-v1'}:{}),...(revision?{'If-Match':`"${revision}"`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 try{
  const old=await request(false),data=await old.json(),token=old.headers.get('x-bloom-settings-revision')!;assert.equal('region' in data.practical,false);experienceSettingsSchema.extend({practical:practicalPreferencesSchema.omit({region:true}).strict()}).parse(data);assert.equal(old.headers.get('cache-control'),'no-store');assert.match(old.headers.get('vary')!,/X-Bloom-Settings-Fields/);
  const aware=await request(true);assert.equal((await aware.json()).practical.region,'United States');assert.equal(aware.headers.get('x-bloom-settings-revision'),token);
  assert.equal((await request(false,'a',{practical:{...data.practical,minutes:50}},token)).status,200);assert.equal((await experience.getExperienceSettings('a')).practical.region,'United States');
  assert.equal((await(await request(true,'b')).json()).practical.region,undefined);assert.equal((await request(true,'')).status,401);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
