import test from "node:test";import assert from "node:assert/strict";
import {randomBytes} from "node:crypto";import {readFileSync} from "node:fs";import express from "express";
import {PGlite} from "@electric-sql/pglite";import {drizzle} from "drizzle-orm/pglite";
import {experienceEntrySchema,experienceSettingsSchema,settingsPatchSchema,wellnessChoiceSchema} from "../shared/experience";
import {ExperienceStorage} from "../server/experience-storage";import {registerExperienceRoutes} from "../server/experience-routes";
import {encryptPrecision} from "../server/precision-crypto";import {weeklyReview} from "../shared/practical-planner";
const lifecycleId="11111111-1111-4111-8111-111111111111";
const payload={version:1 as const,valueKind:"user-choice" as const,intentId:"22222222-2222-4222-8222-222222222222",date:"2026-11-07",timezoneOffset:0,actionId:"general-meal-pattern",actionVersion:"2026-11-07.1",contextRevision:"a".repeat(64),evidenceVersion:"b".repeat(64),decisionRevision:"c".repeat(64),requestRevision:"d".repeat(64),lifecycleId,choice:"try" as const,chosenAt:"2026-11-07T12:00:00Z"};
test("choice reader is explicitly an intention and lifecycle metadata cannot be submitted as a settings patch",()=>{
 assert.deepEqual(wellnessChoiceSchema.parse(payload),payload);
 assert.ok(experienceEntrySchema.safeParse({kind:"wellness-choice",payload}).success);
 for(const extra of [{completed:true},{minutes:30},{calories:400},{rawContext:{allergies:[]}}])assert.equal(wellnessChoiceSchema.safeParse({...payload,...extra}).success,false);
 assert.equal(wellnessChoiceSchema.safeParse({...payload,date:"2026-02-30"}).success,false);
 assert.equal(experienceSettingsSchema.parse({lifecycleId}).lifecycleId,lifecycleId);
 assert.equal(settingsPatchSchema.safeParse({lifecycleId}).success,false);
 assert.equal(experienceSettingsSchema.parse({}).lifecycleId,undefined);
});
test("encrypted own-account choice reader/export survives reload, contributes no activity/health outcome, and generic producers remain denied",async()=>{
 const pg=new PGlite(),previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");
 let server:ReturnType<ReturnType<typeof express>["listen"]>|undefined;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");
  await pg.exec(readFileSync(new URL("../migrations/0004_experience.sql",import.meta.url),"utf8"));
  await pg.query("INSERT INTO experience_records(id,user_id,kind,encrypted_payload) VALUES($1,$2,$3,$4)",["synthetic-choice","a","wellness-choice",encryptPrecision(payload,"a")]);
  await pg.query("INSERT INTO experience_settings(user_id,encrypted_payload) VALUES($1,$2)",["a",encryptPrecision(experienceSettingsSchema.parse({lifecycleId}),"a")]);
  const storage=new ExperienceStorage(drizzle(pg)as any),rows=await storage.getExperienceRecords("a","wellness-choice");
  assert.equal(rows.length,1);assert.equal(rows[0].kind,"wellness-choice");assert.deepEqual(rows[0].payload,payload);
  assert.deepEqual(await storage.getExperienceRecords("b","wellness-choice"),[]);
  assert.equal(weeklyReview(rows,"everyday",payload.date).entries,0);
  assert.ok(weeklyReview(rows,"everyday",payload.date).metrics.every(m=>m.current===null));
  assert.equal((await storage.exportExperience("a")).records.length,1);assert.equal((await storage.exportExperience("b")).records.length,0);
  const entry=experienceEntrySchema.parse({kind:"wellness-choice",payload});
  await assert.rejects(storage.insertExperienceRecord("a",entry),/WELLNESS_CHOICE_ACTION_REQUIRED/);
  await assert.rejects(storage.updateExperienceRecord("a","synthetic-choice",entry),/WELLNESS_CHOICE_ACTION_REQUIRED/);
  const app=express();app.use(express.json());const store=new Proxy(storage,{get(target,key){const value=Reflect.get(target,key);return typeof value==="function"?value.bind(target):value;}});
  registerExperienceRoutes(app,(req,res,next)=>{const actor=req.get("X-Fixture-Account");if(!actor)return res.sendStatus(401);req.session={userId:actor}as any;next();},store as any);
  server=app.listen(0,"127.0.0.1");await new Promise<void>(r=>server!.once("listening",r));const url=`http://127.0.0.1:${(server.address()as any).port}/api/experience`;
  assert.equal((await fetch(url+"/records?kind=wellness-choice")).status,401);
  assert.equal((await(await fetch(url+"/records?kind=wellness-choice",{headers:{"X-Fixture-Account":"a"}})).json()).length,1);
  assert.deepEqual(await(await fetch(url+"/records?kind=wellness-choice",{headers:{"X-Fixture-Account":"b"}})).json(),[]);
  for(const [method,path,body] of [["POST","/records",entry],["PUT","/records/synthetic-choice",entry],["PATCH","/settings",{lifecycleId}] ]as const){
   const response=await fetch(url+path,{method,headers:{"X-Fixture-Account":"a","content-type":"application/json"},body:JSON.stringify(body)});assert.equal(response.status,400);
  }
  const exported=await(await fetch(url+"/export",{headers:{"X-Fixture-Account":"a"}})).json();assert.equal(exported.records[0].payload.choice,"try");
  assert.equal((await new ExperienceStorage(drizzle(pg)as any).getExperienceRecords("a")).length,1);
  assert.equal((await storage.getExperienceSettings("a")).lifecycleId,lifecycleId);
 }finally{server?.closeAllConnections();if(server)await new Promise<void>(r=>server!.close(()=>r()));await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
