import assert from "node:assert/strict";
import test from "node:test";
import { reconcileHealthBatch } from "../shared/health-reconciliation";

const now = new Date("2026-10-18T18:00:00Z");
const consent = [{provider:"apple_health" as const, allowedKinds:["steps" as const], grantedAt:"2026-10-17T01:00:00Z", revokedAt:null}];
const row = {kind:"steps" as const, source:{provider:"apple_health" as const,deviceId:"watch-1",recordId:"r-1",sourceRevision:"1"},startAt:"2026-10-18T15:00:00Z",endAt:"2026-10-18T16:00:00Z",receivedAt:"2026-10-18T16:01:00Z",value:1600,unit:"count" as const};

test("consented record imported once, with exact retries counted",()=>{
 const first=reconcileHealthBatch([], [row], consent, now);
 assert.equal(first.accepted.length,1);
 const replay=reconcileHealthBatch(first.accepted,[row],consent,now);
 assert.equal(replay.replayed,1);
 assert.equal(replay.accepted.length,0);
});

test("identical revision conflicting value is withheld, not overwritten",()=>{
 const result=reconcileHealthBatch([row],[{...row,value:2600}],consent,now);
 assert.equal(result.conflicts,1);
 assert.equal(result.accepted.length,0);
});

test("revoked, forbidden and manual sources cannot pass the connector ingestion boundary",()=>{
 const revoked=[{...consent[0],revokedAt:"2026-10-18T17:00:00Z"}];
 assert.equal(reconcileHealthBatch([], [row],revoked,now).rejected,1);
 assert.equal(reconcileHealthBatch([], [{...row,kind:"heart_rate",unit:"beats/min",value:80}],consent,now).rejected,1);
 assert.equal(reconcileHealthBatch([], [{...row,source:{...row.source,provider:"manual"}}],consent,now).rejected,1);
});

test("different providers stay distinct; batches reject invalid records without partial acceptance",()=>{
 const updated={...row,source:{...row.source,sourceRevision:"2"},receivedAt:"2026-10-18T17:00:00Z",value:1700};
 assert.equal(reconcileHealthBatch([row],[updated],consent,now).accepted[0].value,1700);
 assert.throws(()=>reconcileHealthBatch([], [row,{...row,value:-20}],consent,now));
 assert.throws(()=>reconcileHealthBatch([],Array(1001).fill(row),consent,now),/HEALTH_BATCH_LIMIT/);
});

test("time-travel receipts and bad consent are rejected",()=>{
 assert.equal(reconcileHealthBatch([], [{...row,receivedAt:"2026-10-19T12:00:00Z"}],consent,now).rejected,1);
 assert.throws(()=>reconcileHealthBatch([], [row],[{...consent[0],allowedKinds:["steps","steps"]}],now));
});

test("older correction receipts cannot roll back an imported health record",()=>{
 const newer={...row,source:{...row.source,sourceRevision:"2"},receivedAt:"2026-10-18T17:00:00Z",value:1800};
 const stale={...row,source:{...row.source,sourceRevision:"1"},receivedAt:"2026-10-18T16:01:00Z"};
 const result=reconcileHealthBatch([newer],[stale],consent,now);
 assert.equal(result.conflicts,1);assert.equal(result.accepted.length,0);
});

test("future consent and duplicate provider permissions cannot authorize import",()=>{
 const future=[{...consent[0],grantedAt:"2026-10-19T00:00:00Z"}];
 assert.equal(reconcileHealthBatch([], [row],future,now).rejected,1);
 assert.throws(()=>reconcileHealthBatch([], [row],[consent[0],consent[0]],now),/HEALTH_DUPLICATE_CONSENT/);
});


test("consent granted after a device receipt does not authorize historical import",()=>{
 const laterGrant=[{...consent[0],grantedAt:"2026-10-18T17:00:00Z"}];
 const result=reconcileHealthBatch([], [row],laterGrant,now);
 assert.equal(result.rejected,1);
 assert.equal(result.accepted.length,0);
 const laterReceipt={...row,source:{...row.source,recordId:"r-later"},startAt:"2026-10-18T17:01:00Z",endAt:"2026-10-18T17:03:00Z",receivedAt:"2026-10-18T17:04:00Z"};
 assert.equal(reconcileHealthBatch([], [laterReceipt],laterGrant,now).accepted.length,1);
});


test("distance and hydration require independent metric-level consent",()=>{
 const metrics=[{...consent[0],allowedKinds:["distance","hydration"] as ("distance"|"hydration")[]}];
 const distance={...row,kind:"distance" as const,value:1200,unit:"m" as const,source:{...row.source,recordId:"distance-1"}};
 const hydration={...row,kind:"hydration" as const,value:400,unit:"mL" as const,source:{...row.source,recordId:"hydration-1"}};
 const result=reconcileHealthBatch([], [distance,hydration],metrics,now);
 assert.equal(result.accepted.length,2);
 assert.equal(reconcileHealthBatch([], [distance,hydration],consent,now).rejected,2);
 assert.throws(()=>reconcileHealthBatch([], [{...hydration,value:0}],metrics,now));
});


test("same-batch duplicate revisions cannot overwrite the first accepted observation",()=>{
 const changed={...row,value:2900};
 const result=reconcileHealthBatch([], [row,changed],consent,now);
 assert.equal(result.accepted.length,1);
 assert.equal(result.accepted[0].value,1600);
 assert.equal(result.conflicts,1);
 const duplicate=reconcileHealthBatch([], [row,row],consent,now);
 assert.equal(duplicate.accepted.length,1);
 assert.equal(duplicate.replayed,1);
});
test("same-batch revised records cannot override the first receipt",()=>{
 const second={...row,source:{...row.source,sourceRevision:"2"},receivedAt:"2026-10-18T17:00:00Z",value:2200};
 const result=reconcileHealthBatch([], [row,second],consent,now);
 assert.equal(result.accepted.length,1);
 assert.equal(result.accepted[0].source.sourceRevision,"1");
 assert.equal(result.conflicts,1);
});
