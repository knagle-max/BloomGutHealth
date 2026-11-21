import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {readDietaryReferenceInputs,registerDietaryReferenceContextRoutes} from '../server/dietary-reference-context';
import {encryptPrecision} from '../server/precision-crypto';
import {PrecisionStorage} from '../server/precision-storage';
import {contextSchema} from '../shared/precision-nutrition';
import {dietaryReferenceContextSchema} from '../shared/dietary-reference-eligibility';
test('private reference HTTP reads existing encrypted Profile/context consistently, stays owned and retracts matches on correction/erasure/outage',async()=>{
 const pg=new PGlite(),prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');let server:any;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,sex text,height_cm real,weight_kg real);INSERT INTO users(id,sex)VALUES('a','male'),('b','female')");
  for(const file of ['0002_precision_nutrition.sql','0016_profile_measurement_sources.sql'])await pg.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const database=drizzle(pg),precision=new PrecisionStorage(database as any),health=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true});
  for(const actor of ['a','b']){await precision.putPrecisionContext(actor,health);await pg.query('INSERT INTO profile_measurement_sources(user_id,revision,encrypted_payload)VALUES($1,gen_random_uuid(),$2)',[actor,JSON.stringify(encryptPrecision({birthYear:actor==='a'?1990:2005},JSON.stringify(['profile-measurement-source-v1',actor])))]);}
  let outage=false;const store={getDietaryReferenceInputs:async(actor:string)=>{if(outage)throw Error('Synthetic outage');return readDietaryReferenceInputs(database as any,actor);}};
  const app=express();app.use((req:any,res,next)=>{const actor=req.get('x-owner');if(!['a','b'].includes(actor))return res.sendStatus(401);req.session={userId:actor};res.setHeader('Cache-Control','no-store');next();});registerDietaryReferenceContextRoutes(app,store as any,()=>new Date('2026-11-18T12:00:00Z'));
  server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const root=`http://127.0.0.1:${server.address().port}/api/experience/dietary-reference-context?date=2026-11-18&timeZone=UTC&nutrientKey=magnesium_mg`;
  const get=async(actor='a',suffix='')=>{const response=await fetch(root+suffix,{headers:{'x-owner':actor}});return{status:response.status,headers:response.headers,body:await response.json().catch(()=>null)};};
  assert.equal((await get('')).status,401);assert.equal((await get('a','&userId=b')).status,400);
  const first=await get();assert.equal(first.status,200);assert.equal(first.headers.get('cache-control'),'no-store');const data=dietaryReferenceContextSchema.parse(first.body);assert.equal(data.userId,'a');assert.deepEqual(data.ageRange,{min:35,max:36});assert.equal(data.rows.find(row=>row.eligible&&row.reference.kind==='RDA')!.reference.amount,420);assert.equal('healthContext'in data,false);assert.equal('birthYear'in data,false);
  assert.equal((await get('a','&lifeStage=under18')).status,400);for(const stage of ['pregnancy-adult','lactation-adult']){const explored=await get('a','&lifeStage='+stage);assert.equal(explored.status,200);const context=dietaryReferenceContextSchema.parse(explored.body);assert.equal(context.userId,'a');assert.equal(context.rows.length,5);assert.ok(context.rows.every(row=>row.reference.lifeStage===stage&&!row.eligible&&row.reasons.includes('specific-life-stage-not-established')));assert.equal('healthContext'in context,false);}
  const other=dietaryReferenceContextSchema.parse((await get('b')).body);assert.equal(other.userId,'b');assert.equal(other.rows.find(row=>row.eligible&&row.reference.kind==='RDA')!.reference.amount,310);
  await pg.query("UPDATE users SET sex='female' WHERE id='a'");const corrected=(await get()).body;assert.notEqual(corrected.revision,data.revision);assert.equal(corrected.rows.find((row:any)=>row.eligible&&row.reference.kind==='RDA').reference.amount,320);
  await precision.putPrecisionContext('a',{...health,pregnancy:'yes'});const excluded=(await get()).body;assert.equal(excluded.rows.some((row:any)=>row.eligible),false);assert.equal(excluded.rows.length,data.rows.length,'General published references remain available');
  await pg.query("DELETE FROM profile_measurement_sources WHERE user_id='a'");assert.equal((await get()).body.ageRange,null);
  outage=true;assert.equal((await get()).status,503);outage=false;assert.equal((await get()).status,200);assert.equal((await readDietaryReferenceInputs(database as any,'missing')),null);
  const values=(await pg.query('SELECT count(*) AS n FROM precision_records')).rows[0];assert.equal(Number(values.n),0,'Reference matching writes no health observations or intake');
 }finally{server?.closeAllConnections();if(server)await new Promise<void>(r=>server.close(r));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
