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
