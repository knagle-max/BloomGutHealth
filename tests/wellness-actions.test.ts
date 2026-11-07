import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";import {randomBytes,randomUUID} from "node:crypto";
import {PGlite} from "@electric-sql/pglite";import {drizzle} from "drizzle-orm/pglite";import express from "express";
import {contextSchema} from "../shared/precision-nutrition";import {preferenceSchema} from "../shared/meal-intelligence";
import {activitySchema,type ExperienceRecord} from "../shared/experience";import type {WellnessActionView,WellnessChoiceCommand} from "../shared/wellness-actions";
import {ExperienceStorage} from "../server/experience-storage";import {PrecisionStorage} from "../server/precision-storage";import {WellnessChoiceStorage} from "../server/wellness-choice-storage";
import {buildWellnessActionView,wellnessChoiceId} from "../server/wellness-actions";import {buildWellnessContext} from "../server/wellness-context";import {encryptPrecision} from "../server/precision-crypto";import {registerExperienceRoutes} from "../server/experience-routes";
const now=new Date("2026-11-07T12:00:00Z"),day={date:"2026-11-07",timezoneOffset:0};
const health=contextSchema.parse({goals:["general health"],ageGroup:"adult",pregnancy:"no",safetyReviewed:true,allergies:[],conditions:[],medications:[]});
async function fixture(run:(value:any)=>Promise<void>){
 const pg=new PGlite(),oldKey=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,age integer,dietary_preferences jsonb);INSERT INTO users(id,age) VALUES('a',30),('b',30);CREATE TABLE precision_profiles(user_id varchar PRIMARY KEY,encrypted_context jsonb NOT NULL,updated_at timestamp DEFAULT now());");
  await pg.exec(readFileSync(new URL("../migrations/0004_experience.sql",import.meta.url),"utf8"));
  const db=drizzle(pg),experience=new ExperienceStorage(db as any),precision=new PrecisionStorage(db as any),choices=new WellnessChoiceStorage(db as any,()=>now);
  await pg.query("UPDATE users SET dietary_preferences=$1",[preferenceSchema.parse({goals:["general health"]})]);
  await precision.putPrecisionContext("a",health);await precision.putPrecisionContext("b",health);
  await experience.putExperienceSettings("a",{mode:"everyday"});await experience.putExperienceSettings("b",{mode:"everyday"});
  await run({pg,db,experience,precision,choices});
 }finally{await pg.close();if(oldKey===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=oldKey;}
}
const command=(view:WellnessActionView,choice:WellnessChoiceCommand["choice"]="try",actionId="balanced-meal-pattern",intentId=randomUUID()):WellnessChoiceCommand=>({intentId,...view.day,actionId,choice,lifecycleId:view.lifecycleId!,requestRevision:view.actions.find(a=>a.action.id===actionId)!.requestRevision!});

test("low-risk actions distinguish missing context/calendar and listed activity from readiness or completed behavior",async()=>{
 await fixture(async({choices,experience}:any)=>{
  const view=await choices.view("a",day);assert.equal(view.primaryActionId,"balanced-meal-pattern");assert.equal(view.actions.find((a:any)=>a.action.id==="familiar-movement").eligible,true);
  const ctx=buildWellnessContext("a",undefined,{id:"a"},now);
  const fallback=buildWellnessActionView({context:ctx,settings:await experience.getExperienceSettings("a"),day,sessions:null,activities:null,choices:[],now});
  assert.equal(fallback.primaryActionId,"record-usual-meal");assert.equal(fallback.actions.filter(a=>a.eligible).length,1);
  await experience.createActivity("a",activitySchema.parse({title:"Running — duration unknown",startedAt:now.toISOString(),minutes:null}),randomUUID());
  const recorded=await choices.view("a",day);assert.equal(recorded.actions.find((a:any)=>a.action.id==="familiar-movement").eligible,false);
  assert.equal(recorded.actions.find((a:any)=>a.action.id==="balanced-meal-pattern").eligible,true);
  assert.equal((await experience.getExperienceRecords("a","activity"))[0].payload.minutes,null);
  const preferences=preferenceSchema.parse({goals:["general health"]}),settings=await experience.getExperienceSettings("a");
  for(const context of [{...health,pregnancy:"yes"},{...health,conditions:["kidney disease"]},{...health,medications:["recorded medication"]}]){
   const source=buildWellnessContext("a",context,{id:"a",age:30,dietaryPreferences:preferences},now);
   const limited=buildWellnessActionView({context:source,settings,day,sessions:[],activities:[],choices:[],now});
   assert.equal(limited.primaryActionId,"record-usual-meal");assert.ok(limited.actions.filter(a=>a.action.category!=="routine").every(a=>!a.eligible));
  }
  const source=buildWellnessContext("a",health,{id:"a",age:16,dietaryPreferences:preferences},now);
  assert.equal(buildWellnessActionView({context:source,settings,day,sessions:[],activities:[],choices:[],now}).primaryActionId,"record-usual-meal");
  const expired=await choices.view("a",{...day,date:"2026-11-06"});assert.equal(expired.dateCurrent,false);assert.equal(expired.primaryActionId,null);
 });
});
test("choice receipts replay exactly without reordering later intent; changed sources reject pending writes and withdraw current projection",async()=>{
 await fixture(async({choices,precision,experience}:any)=>{
  const firstView=await choices.view("a",day),first=command(firstView),created=await choices.create("a",first);
  assert.equal(created.payload.valueKind,"user-choice");assert.equal("completed"in created.payload,false);
  const second=command(firstView,"later"),later=await choices.create("a",second),replay=await choices.create("a",first);
  assert.deepEqual(replay,created);
  assert.equal((await choices.view("a",day)).actions.find((a:any)=>a.action.id===first.actionId).choice.id,later.id);
  await assert.rejects(choices.create("a",{...first,choice:"not-relevant"}),(e:any)=>e.code==="intent-conflict");
  const pending=command(firstView,"try");await precision.putPrecisionContext("a",{...health,goals:["digestive comfort"]});
  await assert.rejects(choices.create("a",pending),(e:any)=>e.code==="source-changed");
  assert.deepEqual(await choices.create("a",second),later);
  const changed=await choices.view("a",day);assert.ok(changed.actions.every((a:any)=>a.choice===null));assert.equal(changed.history.length,2);
  assert.equal((await experience.getExperienceRecords("a")).length,0,"Intent history is not the ordinary tracking feed");
  assert.equal((await experience.exportExperience("a")).records.length,2);
  assert.equal((await choices.view("b",day)).history.length,0);
  const current=await choices.view("a",day);
  await choices.create("a",command(current,"try","balanced-meal-pattern"));
  assert.equal((await choices.view("a",day)).primaryActionId,"balanced-meal-pattern","An explicit eligible choice takes precedence over the default digestive routine");
 });
});
test("clear/recreate and exact scoped history deletion reject old queued proofs while retaining later arrivals and other accounts",async()=>{
 await fixture(async({choices,experience}:any)=>{
  const view=await choices.view("a",day),one=command(view),two=command(view,"later");await choices.create("a",one);await choices.create("a",two);
  const captured=(await choices.view("a",day)).history.map(({id,intentId,revision}:any)=>({id,intentId,revision}));
  const newestCommand=command(view,"not-relevant"),newest=await choices.create("a",newestCommand);
  const foreign=await choices.create("b",command(await choices.view("b",day)));
  await assert.rejects(choices.removeHistory("a",{records:[captured[0],{id:foreign.id,intentId:foreign.payload.intentId,revision:captured[0].revision}]}),(e:any)=>e.code==="scope");
  assert.equal((await choices.view("a",day)).history.length,3);
  await assert.rejects(choices.removeHistory("a",{records:captured.map((r:any,i:number)=>i?{...r,revision:"0".repeat(64)}:r)}),(e:any)=>e.code==="source-changed");
  await choices.removeHistory("a",{records:captured});const after=await choices.view("a",day);
  assert.equal(after.history.length,1);assert.equal(after.actions.find((a:any)=>a.action.id===one.actionId).choice.id,newest.id);
  const generation=after.lifecycleId;await choices.removeHistory("a",{records:captured});assert.equal((await choices.view("a",day)).lifecycleId,generation);
  await assert.rejects(choices.create("a",one),(e:any)=>e.code==="source-changed");
  await assert.rejects(experience.deleteExperienceRecord("a",newest.id),(e:any)=>e.code==="dedicated-action");
  await experience.clearExperienceData("a");await assert.rejects(choices.create("a",newestCommand),(e:any)=>e.code==="source-changed");
  await experience.putExperienceSettings("a",{mode:"everyday"});assert.notEqual((await experience.getExperienceSettings("a")).lifecycleId,generation);
  await assert.rejects(choices.create("a",newestCommand),(e:any)=>e.code==="source-changed");
  await choices.create("a",command(await choices.view("a",day)));
  assert.equal((await choices.view("b",day)).history.length,1);
 });
});
test("choice quota cannot displace ordinary logging or remove choice history from private export",async()=>{
 await fixture(async({pg,choices,experience}:any)=>{
  const view=await choices.view("a",day),first=await choices.create("a",command(view));
  const rows=Array.from({length:1999},()=>{const intentId=randomUUID();return{id:wellnessChoiceId("a",intentId),user_id:"a",kind:"wellness-choice",encrypted_payload:encryptPrecision({...first.payload,intentId},"a")};});
  await pg.query("INSERT INTO experience_records(id,user_id,kind,encrypted_payload) SELECT id,user_id,kind,encrypted_payload FROM jsonb_to_recordset($1::jsonb) AS x(id varchar,user_id varchar,kind text,encrypted_payload jsonb)",[JSON.stringify(rows)]);
  await assert.rejects(choices.create("a",command(await choices.view("a",day))),(e:any)=>e.code==="limit");
  await experience.createActivity("a",activitySchema.parse({title:"Usual walk",startedAt:now.toISOString(),minutes:10}),randomUUID());
  assert.equal((await experience.getExperienceRecords("a")).length,1);
  assert.equal((await experience.exportExperience("a")).records.length,2001);
 });
});
test("actual source-scoped action APIs preserve ordinary settings JSON and require current choice proof",async()=>{
 await fixture(async({choices,experience}:any)=>{
  const store=new Proxy(experience,{get(target,key){if(key==="getWellnessActionView")return choices.view.bind(choices);if(key==="createWellnessChoice")return choices.create.bind(choices);if(key==="deleteWellnessChoiceHistory")return choices.removeHistory.bind(choices);const v=Reflect.get(target,key);return typeof v==="function"?v.bind(target):v;}});
  const app=express();app.use(express.json());registerExperienceRoutes(app,(req,res,next)=>{const actor=req.get("X-Fixture-Account");if(!actor)return res.sendStatus(401);req.session={userId:actor}as any;next();},store as any);
  const server=app.listen(0,"127.0.0.1");await new Promise<void>(r=>server.once("listening",r));const url=`http://127.0.0.1:${(server.address()as any).port}/api/experience`;
  const send=(path:string,actor="a",method="GET",body?:unknown)=>fetch(url+path,{method,headers:{"X-Fixture-Account":actor,"content-type":"application/json"},...(body?{body:JSON.stringify(body)}:{})});
  try{
   assert.equal((await fetch(url+"/wellness-actions?date="+day.date+"&timezoneOffset=0")).status,401);
   const settings=await(await send("/settings")).json();assert.equal("lifecycleId"in settings,false);
   const response=await send("/wellness-actions?date="+day.date+"&timezoneOffset=0"),view=await response.json();assert.equal(response.status,200);assert.equal(view.accountScope,"a");
   const pending=command(view),saved=await send("/wellness-choices","a","POST",pending);assert.equal(saved.status,201);const record=await saved.json();
   const duplicate=await(await send("/wellness-choices","a","POST",pending)).json();assert.equal(duplicate.id,record.id);
   assert.equal((await send("/wellness-choices","b","POST",pending)).status,409);
   assert.equal((await send("/records/"+record.id,"a","DELETE")).status,400);
   assert.equal((await send("/settings","a","PATCH",{lifecycleId:randomUUID()})).status,400);
  }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
 });
});
