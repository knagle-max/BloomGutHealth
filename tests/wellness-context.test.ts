import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {buildWellnessContext} from "../server/wellness-context";
import {registerPrecisionRoutes} from "../server/precision-routes";

const user={id:"context-owner",age:30,dietaryPreferences:{goals:["general health"],exclusions:["dairy"]}};
const saved={goals:["cholesterol"],allergies:[],conditions:[],medications:[],pregnancy:"no",ageGroup:"adult",safetyReviewed:true};
test("goals-only context reuses cited guidance, never inventing defaults or dates",()=>{
  const empty=buildWellnessContext("a",undefined,{id:"a"});
  assert.deepEqual(empty.goals,[]);assert.deepEqual(empty.sources,[]);
  assert.equal(empty.constraints.allergies,null);assert.equal(empty.preferences.dietaryPattern,null);
  assert.deepEqual(empty.inputSources,[]);assert.ok(empty.missing.includes("saved-goals-not-recorded"));
  const context=buildWellnessContext(user.id,saved,user);
  assert.deepEqual(context.goals.map(g=>g.id),["metabolic","general"]);
  assert.ok(context.sources.some(s=>s.id==="goal-healthy-fats"));
  assert.deepEqual(context.constraints.allergies,[]);assert.equal(context.constraints.safetyReviewed,true);
  assert.deepEqual(context.preferences.exclusions,["dairy"]);
  assert.ok(context.inputSources.every(s=>s.observedAt===null&&s.dateStatus==="not-recorded"));
  assert.equal(context.purpose,"personal-wellness");
  assert.deepEqual(buildWellnessContext("a",undefined,{id:"a",dietaryPreferences:{}}).goals,[],"Schema default butyrate is not a selected goal");
});
test("source correction, deletion, account and age conflicts change context, not original records",()=>{
  const before=JSON.stringify({saved,user}),now=new Date("2026-11-07T12:00:00Z");
  const a=buildWellnessContext(user.id,saved,user,now);
  const later=buildWellnessContext(user.id,saved,user,new Date("2026-11-08T12:00:00Z"));
  assert.equal(a.revision,later.revision);assert.notEqual(a.asOf,later.asOf);
  const changed=buildWellnessContext(user.id,{...saved,goals:["digestive comfort"]},user,now);
  assert.notEqual(changed.revision,a.revision);
  const deleted=buildWellnessContext(user.id,undefined,user,now);
  assert.notEqual(deleted.revision,a.revision);assert.ok(deleted.missing.includes("health-context-not-recorded"));
  assert.equal(deleted.constraints.allergies,null);
  const minor=buildWellnessContext(user.id,saved,{...user,age:16},now);
  assert.equal(minor.constraints.ageGroup,"under18");assert.equal(minor.constraints.safetyReviewed,false);assert.ok(minor.conflicts.length);
  assert.ok(minor.inputSources.some(s=>s.sourceId==="nutrition-profile"));
  assert.throws(()=>buildWellnessContext("other",saved,user),/account mismatch/);
  assert.notEqual(buildWellnessContext("other",saved,{...user,id:"other"},now).revision,a.revision);
  assert.equal(JSON.stringify({saved,user}),before);
});
test("unmapped goals stay source text; malformed context cannot become an empty safe context",()=>{
  const context=buildWellnessContext(user.id,{goals:["private invented goal"]},user);
  const unknown=context.goals.find(g=>g.goal==="private invented goal")!;
  assert.equal(unknown.id,"unmapped");assert.deepEqual(unknown.sourceIds,[]);
  assert.throws(()=>buildWellnessContext(user.id,{...saved,allergies:"not an array"},user));
  const partial=buildWellnessContext(user.id,{goals:["general health"]},user);
  assert.equal(partial.constraints.allergies,null);assert.equal(partial.constraints.conditions,null);
  assert.equal(partial.constraints.safetyReviewed,false);
});
test("actual context route reads only the signed account goal/profile sources, has no-store and never invokes biology or model adapters",async()=>{
  const calls:string[]=[];let badOwner=false;
  const store=new Proxy({
    getPrecisionContext:async(id:string)=>{calls.push("context:"+id);return id===user.id?saved:undefined;},
    getUser:async(id:string)=>{calls.push("user:"+id);return badOwner?user:id===user.id?user:{id};},
  },{get(target,key){if(key in target)return target[key as keyof typeof target];return()=>{throw Error("Unexpected optional source read: "+String(key));};}});
  const app=express();app.use(express.json());
  registerPrecisionRoutes(app,(req,res,next)=>{const actor=req.get("X-Fixture-Account");if(!actor)return res.sendStatus(401);req.session={userId:actor}as any;next();},store as any);
  const server=app.listen(0,"127.0.0.1");await new Promise<void>(r=>server.once("listening",r));
  const url=`http://127.0.0.1:${(server.address()as any).port}/api/precision/wellness-context`;
  try{
    assert.equal((await fetch(url)).status,401);assert.deepEqual(calls,[]);
    const response=await fetch(url,{headers:{"X-Fixture-Account":user.id}});
    assert.equal(response.status,200);assert.equal(response.headers.get("cache-control"),"no-store");
    const result=await response.json();assert.equal(result.accountScope,user.id);assert.equal(result.goals[0].id,"metabolic");
    assert.deepEqual(calls,["context:"+user.id,"user:"+user.id]);calls.length=0;
    const other=await fetch(url+"?userId="+user.id,{headers:{"X-Fixture-Account":"other"}});
    const isolated=await other.json();assert.equal(isolated.accountScope,"other");assert.deepEqual(isolated.goals,[]);
    assert.deepEqual(calls,["context:other","user:other"]);
    badOwner=true;assert.notEqual((await fetch(url,{headers:{"X-Fixture-Account":"other"}})).status,200);
  }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
