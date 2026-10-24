import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { getTableConfig } from "drizzle-orm/pg-core";
import * as schema from "../shared/schema";
import { encryptPrecision } from "../server/precision-crypto";
import { AccountExportStorage } from "../server/account-export";
import { registerAccountRoutes } from "../server/account-routes";
import express from "express";

test("account snapshot includes every owned class, decrypts original payloads and isolates another account",async()=>{
 const pg=new PGlite(),previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");
 try {
 const tables=[schema.users,schema.meals,schema.microbiomeSamples,schema.bacterialComposition,schema.metabolites,schema.healthImpacts,schema.mlAnalyses,schema.recommendations,schema.precisionProfiles,schema.precisionRecords,schema.nutritionProducts,schema.experienceSettings,schema.experienceRecords,schema.healthSourceConsents,schema.healthObservations,schema.capabilityPreferences];
 for(const table of tables){const c=getTableConfig(table);await pg.exec(`CREATE TABLE "${c.name}" (${c.columns.map(col=>`"${col.name}" ${col.getSQLType()}`).join(',')})`);}
 const db=drizzle(pg),store=new AccountExportStorage(db as any);
 for(const user of ['a','b']) {
  await db.insert(schema.users).values({id:user,username:user,password:'HASH-MUST-NOT-EXPORT'});
  await db.insert(schema.capabilityPreferences).values({userId:user,enabled:true,grantFingerprint:'AUTH-GRANT-MUST-NOT-EXPORT'});
  await db.insert(schema.meals).values({id:'meal-'+user,userId:user,mealText:user+' lunch',totalCalories:0,nutritionalData:{calories:0,protein:null}});
  await db.insert(schema.microbiomeSamples).values({id:'sample-'+user,userId:user,testDate:new Date('2026-10-01Z'),rawDataPath:'/private/internal.fastq',structuredData:{originalUnit:'percent'}});
  await db.insert(schema.bacterialComposition).values({id:'bac-'+user,sampleId:'sample-'+user,bacterialName:user,taxonomyLevel:'species',abundance:0});
  await db.insert(schema.metabolites).values({id:'met-'+user,sampleId:'sample-'+user,metaboliteName:user});
  await db.insert(schema.healthImpacts).values({id:'impact-'+user,metaboliteId:'met-'+user,impactCategory:'historical',impactDescription:user});
  await db.insert(schema.mlAnalyses).values({id:'analysis-'+user,sampleId:'sample-'+user,analysisType:'historical',modelVersion:'old',results:{owner:user}});
  await db.insert(schema.recommendations).values({id:'rec-'+user,sampleId:'sample-'+user,recommendationType:'historical',category:'old',itemName:user,reasoning:'stored'});
  const payload={owner:user,value:12,unit:'source-unit',confirmation:'provisional'};
  for(const table of [schema.precisionRecords,schema.nutritionProducts,schema.experienceRecords,schema.healthObservations])await db.insert(table as any).values({id:'private-'+user,userId:user,kind:'lab',sourceKey:'key-'+user,encryptedPayload:encryptPrecision(payload,user)});
  await db.insert(schema.precisionProfiles).values({userId:user,encryptedContext:encryptPrecision(payload,user)});
  await db.insert(schema.experienceSettings).values({userId:user,encryptedPayload:encryptPrecision(payload,user)});
  await db.insert(schema.healthSourceConsents).values({userId:user,provider:'apple_health',encryptedPayload:encryptPrecision(payload,user)});
 }
 const a=await store.exportAccount('a'),b=await store.exportAccount('b');
 assert.equal(a.experimentalPreference?.enabled,true);assert.equal(a.profile.id,'a');assert.equal(a.journal.length,1);assert.equal(a.journal[0].totalCalories,0);
 assert.deepEqual(a.journal[0].nutritionalData,{calories:0,protein:null});
 for(const rows of Object.values(a.gutReports))assert.equal(rows.length,1);
 assert.equal(a.gutReports.samples[0].id,'sample-a');assert.equal(b.gutReports.samples[0].id,'sample-b');
 assert.deepEqual((a.biology.records[0].payload as any),{owner:'a',value:12,unit:'source-unit',confirmation:'provisional'});
 assert.equal((a.savedLabels[0].payload as any).owner,'a');assert.equal((a.experience.records[0].payload as any).owner,'a');assert.equal((a.healthSources.observations![0].payload as any).owner,'a');
 const text=JSON.stringify(a);for(const forbidden of ['HASH-MUST-NOT-EXPORT','AUTH-GRANT-MUST-NOT-EXPORT','/private/internal.fastq','encryptedPayload','ciphertext','sample-b','meal-b'])assert.equal(text.includes(forbidden),false);
 await assert.rejects(()=>store.exportAccount('missing'));
 await pg.exec('DROP TABLE health_source_consents');const older=await store.exportAccount('a');assert.equal(older.healthSources.storage.consents,'not-provisioned');assert.equal(older.healthSources.consents,null);assert.equal(older.healthSources.observations!.length,1);assert.equal(older.journal.length,1);
 await pg.exec('DROP TABLE health_observations');assert.equal((await store.exportAccount('a')).healthSources.observations,null);
 await db.update(schema.precisionRecords).set({encryptedPayload:encryptPrecision({owner:'b'},'b')});
 await assert.rejects(()=>store.exportAccount('a')); // No partial export on authentication/decryption failure.
 } finally {await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});

test("account export requires auth, uses session identity only and returns safe no-store failures",async()=>{
 const app=express(),calls:string[]=[];let fail=false,oversized=false;
 app.use((req,_res,next)=>{req.session={userId:req.headers['x-test-user']} as any;next();});
 registerAccountRoutes(app,(req,res,next)=>req.session.userId?next():void res.status(401).end(),{exportAccount:async id=>{calls.push(id);if(fail)throw Error('private database detail');return oversized?{data:'x'.repeat(26*1024*1024)}:{profile:{id}};}});
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.on('listening',r));const url='http://127.0.0.1:'+(server.address() as any).port+'/api/account/export';
 try{assert.equal((await fetch(url)).status,401);const response=await fetch(url+'?userId=b',{headers:{'x-test-user':'a'}});assert.equal(response.headers.get('cache-control'),'no-store');assert.match(response.headers.get('content-disposition')||'',/attachment/);assert.equal((await response.json()).profile.id,'a');assert.deepEqual(calls,['a']);fail=true;const error=await fetch(url,{headers:{'x-test-user':'a'}});assert.equal(error.status,503);assert.equal((await error.text()).includes('private database detail'),false);assert.equal(error.headers.get('content-disposition'),null);fail=false;oversized=true;const large=await fetch(url,{headers:{'x-test-user':'a'}});assert.equal(large.status,503);assert.equal(large.headers.get('content-disposition'),null);}finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
