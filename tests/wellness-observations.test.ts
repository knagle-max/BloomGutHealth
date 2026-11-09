import test from "node:test";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {activitySchema,trainingSessionSchema,type ExperienceRecord} from "../shared/experience";
import {movementSourceObservations} from "../server/wellness-observations";
const now=new Date("2026-11-07T12:00:00Z"),time=now.toISOString();
const record=(kind:"activity"|"session",payload:unknown):ExperienceRecord=>({id:randomUUID(),kind,payload,createdAt:time,updatedAt:time} as ExperienceRecord);
test("mixed canonical children retain unknown duration, per-set confirmation and no duplicate parent totals or source text",()=>{
 const sets=[0,1,2,3,4].map(i=>({id:randomUUID(),exercise:"Private exercise description",reps:10,loadKg:null,completed:i<2,...(i===4?{state:"cancelled" as const}:{})}));
 const payload=activitySchema.parse({title:"Private title",startedAt:time,minutes:15,notes:"Private note",components:{version:1,items:[{id:randomUUID(),title:"Run",activityId:"run",match:"reported",minutes:null,distanceM:null},{id:randomUUID(),title:"Lift",activityId:"strength",match:"reported",minutes:15,distanceM:null,actualSets:{version:1,sets}}]}});
 const source=record("activity",payload),rows=movementSourceObservations("a",[source],now);
 assert.equal(rows.length,2);assert.equal(rows[0].reportedMinutes,null);assert.equal(rows[1].reportedMinutes,15);
 assert.deepEqual(rows[1].sets,{recorded:5,confirmedCompleted:2,notConfirmed:2,explicitlyCancelled:1});
 assert.equal(rows[0].sets,null);assert.ok(rows.every(r=>r.sourceId===source.id&&r.componentId!==null&&r.scheduledMinutes===null));
 assert.ok(!JSON.stringify(rows).includes("Private"));
 const changed=structuredClone(source);if(changed.kind==="activity")changed.payload.components!.items[1].actualSets!.sets[2].completed=true;
 const revised=movementSourceObservations("a",[changed],now);assert.equal(revised[1].sets!.confirmedCompleted,3);
 assert.notEqual(revised[0].sourceRevision,rows[0].sourceRevision);
 assert.deepEqual(movementSourceObservations("a",[source],new Date(+now+1000)),rows,"View clock must not rewrite elapsed source facts");
 assert.notEqual(movementSourceObservations("b",[source],now)[0].sourceRevision,rows[0].sourceRevision,"Fingerprints are account-bound; ownership admission remains caller responsibility");
});
test("session completion never turns scheduled duration into measured exercise; future and cancelled states remain explicit",()=>{
 const source=record("session",trainingSessionSchema.parse({title:"Session",startsAt:new Date(+now+3600000).toISOString(),minutes:60,discipline:"mixed",intensity:"easy",status:"completed"}));
 const row=movementSourceObservations("a",[source],now)[0];
 assert.equal(row.scheduledMinutes,60);assert.equal(row.reportedMinutes,null);assert.equal(row.valueKind,"marked-completed-session");assert.equal(row.temporalStatus,"future-entry");assert.equal(row.sets,null);
 if(source.kind==="session")source.payload.status="cancelled";
 assert.equal(movementSourceObservations("a",[source],now)[0].valueKind,"cancelled-session");
 assert.deepEqual(movementSourceObservations("a",[],now),[]);
});
test("reported bouts are not sets; absent or contradictory completion does not fabricate a performed set",()=>{
 const source=record("activity",activitySchema.parse({title:"Reported bout",startedAt:time,minutes:null,actualSets:{version:1,sets:[{exercise:"Push-ups",reps:10,loadKg:null,completed:false,reportedBout:true}]}}));
 assert.equal(movementSourceObservations("a",[source],now)[0].sets,null);
 if(source.kind==="activity")source.payload.actualSets={version:1,sets:[{exercise:"Bench",reps:10,loadKg:null,completed:true,state:"planned"}]};
 assert.deepEqual(movementSourceObservations("a",[source],now)[0].sets,{recorded:1,confirmedCompleted:0,notConfirmed:1,explicitlyCancelled:0});
});
