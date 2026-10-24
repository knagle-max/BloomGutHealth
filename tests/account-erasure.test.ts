import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import express from "express";
import {PGlite} from "@electric-sql/pglite";
import {drizzle} from "drizzle-orm/pglite";
import {getTableName} from "drizzle-orm";
import {getTableConfig} from "drizzle-orm/pg-core";
import * as s from "../shared/schema";
import {AccountErasureStorage,AccountErasureError} from "../server/account-erasure";
import {registerAccountRoutes} from "../server/account-routes";
import {requireActiveAccount,AccountSessionGuard} from "../server/account-auth";
import {sameOriginWrites} from "../server/security";

test("account erasure verifies credentials, rolls back all classes on failure, revokes sessions and isolates other accounts",async()=>{
 const pg=new PGlite();
 try{
 const tables=[s.users,s.meals,s.microbiomeSamples,s.bacterialComposition,s.metabolites,s.healthImpacts,s.mlAnalyses,s.recommendations,s.precisionProfiles,s.precisionRecords,s.nutritionProducts,s.experienceSettings,s.experienceRecords,s.healthSourceConsents,s.healthObservations,s.capabilityPreferences];
 for(const table of tables){const c=getTableConfig(table);await pg.exec(`CREATE TABLE "${c.name}" (${[...c.columns.map(col=>`"${col.name}" ${col.getSQLType()} ${col.primary?'PRIMARY KEY':''}`),...c.primaryKeys.map(k=>`PRIMARY KEY (${k.columns.map(col=>`"${col.name}"`).join(',')})`)].join(',')})`);}
 for(const table of tables){const c=getTableConfig(table);for(const fk of c.foreignKeys){const r=fk.reference();await pg.exec(`ALTER TABLE "${c.name}" ADD FOREIGN KEY (${r.columns.map(col=>`"${col.name}"`).join(',')}) REFERENCES "${getTableName(r.foreignTable)}" (${r.foreignColumns.map(col=>`"${col.name}"`).join(',')}) ON DELETE ${fk.onDelete||'no action'}`);}}
 await pg.exec('CREATE TABLE session(sid text PRIMARY KEY,sess jsonb);CREATE TABLE erasure_hold(user_id varchar REFERENCES users(id));');
 const db=drizzle(pg),store=new AccountErasureStorage(db as any),password='synthetic-password';
 for(const user of ['a','b']){
  await db.insert(s.users).values({id:user,username:user,password:await bcrypt.hash(password,4)});
  await db.insert(s.capabilityPreferences).values({userId:user,enabled:true,grantFingerprint:'synthetic-fingerprint'});
  await db.insert(s.meals).values({id:'meal-'+user,userId:user,mealText:user});
  await db.insert(s.microbiomeSamples).values({id:'sample-'+user,userId:user,testDate:new Date()});
  await db.insert(s.bacterialComposition).values({id:'bac-'+user,sampleId:'sample-'+user,bacterialName:user,taxonomyLevel:'species',abundance:1});
  await db.insert(s.metabolites).values({id:'met-'+user,sampleId:'sample-'+user,bacterialId:'bac-'+user,metaboliteName:user});
  await db.insert(s.healthImpacts).values({id:'impact-'+user,metaboliteId:'met-'+user,impactCategory:'historic',impactDescription:user});
  await db.insert(s.mlAnalyses).values({id:'analysis-'+user,sampleId:'sample-'+user,analysisType:'historic',modelVersion:'old',results:{}});
  await db.insert(s.recommendations).values({id:'rec-'+user,sampleId:'sample-'+user,analysisId:'analysis-'+user,recommendationType:'historic',category:'old',itemName:user,reasoning:'recorded'});
  for(const table of [s.precisionRecords,s.nutritionProducts,s.experienceRecords,s.healthObservations])await db.insert(table as any).values({id:'record-'+user,userId:user,kind:'lab',sourceKey:'key-'+user,encryptedPayload:{unreadable:'erasure does not need decryption'}});
  await db.insert(s.precisionProfiles).values({userId:user,encryptedContext:{}});await db.insert(s.experienceSettings).values({userId:user,encryptedPayload:{}});await db.insert(s.healthSourceConsents).values({userId:user,provider:'apple_health',encryptedPayload:{}});
  await pg.query('INSERT INTO session VALUES($1,$2),($3,$2)',[user+'-one',JSON.stringify({userId:user}),user+'-two']);
 }
 const count=async(table:string)=>(await pg.query<{n:number}>(`SELECT count(*)::int AS n FROM "${table}"`)).rows[0].n;
 await assert.rejects(()=>store.eraseAccount('a','wrong'),e=>e instanceof AccountErasureError&&e.reason==='credentials');assert.equal(await count('meals'),2);
 await pg.exec("INSERT INTO erasure_hold VALUES('a')");await assert.rejects(()=>store.eraseAccount('a',password));for(const table of tables)assert.equal(await count(getTableName(table)),2);assert.equal(await count('session'),4);
 await pg.exec('DELETE FROM erasure_hold;DROP TABLE health_observations;DROP TABLE health_source_consents;');
 let guarded=false;const sessionGuard=new AccountSessionGuard(db as any);await sessionGuard.withActiveAccount('a',async()=>{guarded=true;});assert.equal(guarded,true);
 await store.eraseAccount('a',password);
 await assert.rejects(()=>sessionGuard.withActiveAccount('a',async()=>{assert.fail('deleted account must not create a session');}));
 for(const table of tables.filter(t=>t!==s.healthObservations&&t!==s.healthSourceConsents))assert.equal(await count(getTableName(table)),1);
 assert.equal(await count('session'),2);assert.deepEqual((await pg.query<{id:string}>('SELECT id FROM users')).rows,[{id:'b'}]);
 // A missing persistent session table must roll back, never claim revocation.
 await pg.exec('DROP TABLE session');await assert.rejects(()=>store.eraseAccount('b',password));assert.equal(await count('users'),1);assert.equal(await count('meals'),1);
 }finally{await pg.close();}
});

test("erasure API enforces same origin, strict confirmation, password check and active session identity",async()=>{
 const app=express();app.use(express.json());let active=true,fail=false,destroyed=false,throwDestroy=false;const calls:string[]=[];
 app.use((req,_res,next)=>{req.session={userId:req.headers['x-test-user'],destroy:(cb:any)=>{if(throwDestroy)throw Error("local session cleanup");destroyed=true;cb();}} as any;next();});app.use(sameOriginWrites);
 registerAccountRoutes(app,requireActiveAccount(async()=>active),{exportAccount:async()=>({})},{eraseAccount:async(id,password)=>{calls.push(id);if(password!=='correct')throw new AccountErasureError('credentials');if(fail)throw new AccountErasureError('unavailable');active=false;}});
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.on('listening',r));const base='http://127.0.0.1:'+(server.address() as any).port;
 const send=(body:any,user='a',origin=base)=>fetch(base+'/api/account?userId=b',{method:'DELETE',headers:{'content-type':'application/json','x-test-user':user,origin},body:JSON.stringify(body)});
 try{
  assert.equal((await send({password:'correct',confirmation:'DELETE ACCOUNT'},'')).status,401);
  assert.equal((await send({password:'correct',confirmation:'DELETE ACCOUNT'},'a','https://other.invalid')).status,403);
  assert.equal((await send({password:'correct',confirmation:'delete'})).status,400);assert.equal(calls.length,0);
  assert.equal((await send({password:'correct',confirmation:'DELETE ACCOUNT',userId:'b'})).status,400);
  assert.equal((await send({password:'wrong',confirmation:'DELETE ACCOUNT'})).status,401);assert.equal(destroyed,false);
  fail=true;assert.equal((await send({password:'correct',confirmation:'DELETE ACCOUNT'})).status,503);assert.equal(destroyed,false);fail=false;
  const response=await send({password:'correct',confirmation:'DELETE ACCOUNT'});assert.equal(response.status,200);assert.equal((await response.json()).scope,'active-application-records');assert.equal(destroyed,true);assert.match(response.headers.get('set-cookie')||'',/connect.sid=/);assert.deepEqual(calls,['a','a','a']);
  assert.equal((await fetch(base+'/api/account/export',{headers:{'x-test-user':'a'}})).status,401);assert.equal((await send({password:'correct',confirmation:'DELETE ACCOUNT'})).status,401);
  active=true;throwDestroy=true;assert.equal((await send({password:'correct',confirmation:'DELETE ACCOUNT'})).status,200);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
