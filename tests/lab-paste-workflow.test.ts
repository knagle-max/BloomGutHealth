import test from "node:test";
import assert from "node:assert/strict";
import {parseLabPaste} from "../shared/lab-paste";

const date="2026-10-18T12:00:00Z";
test("supported results preserve source values and units without guesses",()=>{
 const r=parseLabPaste("LDL, 3.2, mmol/L\nALT, 73, U/L",date,"Clinic");
 assert.equal(r.valid.length,2);assert.equal(r.pending.length,0);
 assert.equal(r.valid[0].payload.value,3.2);
 assert.equal(r.valid[0].payload.sourceInput?.number,"3.2");
 assert.equal(r.valid[1].payload.laboratory,"Clinic");
});
test("missing units stay provisional and cannot enter trends",()=>{
 const r=parseLabPaste("Vitamin D, 75",date);
 assert.equal(r.pending.length,1);
 assert.equal(r.pending[0].payload.unitReview?.status,"pending");
 assert.equal(r.pending[0].payload.unitReview?.originalValue,75);
});
test("duplicate analytes and unsupported units are withheld",()=>{
 const r=parseLabPaste("LDL, 3.2, mmol/L\nLDL, 3.5, mg/dL\nALT, 50, mg/dL",date);
 assert.equal(r.valid.length,1);
 assert.equal(r.errors.length,2);
});
test("ambiguous extra pasted details cannot quietly become a source unit",()=>{
 const r=parseLabPaste("LDL, 3.2, mmol/L 1.0-3.0",date);
 assert.equal(r.valid.length,0);assert.equal(r.errors.length,1);
});
test("invalid dates and excess rows are rejected before saving",()=>{
 assert.throws(()=>parseLabPaste("LDL, 2, mmol/L","not-a-date"));
 assert.throws(()=>parseLabPaste(Array(51).fill("ALT, 15, U/L").join("\n"),date));
});
