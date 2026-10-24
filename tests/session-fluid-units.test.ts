import test from "node:test";
import assert from "node:assert/strict";
import { quantityFromCanonical,quantityToCanonical } from "../shared/display-units";
import { trainingSessionSchema } from "../shared/experience";
test("session fluid roundtrip supports three independent fluid units",()=>{
 for(const unit of ["mL","L","US-fl-oz"] as const){
  const entered=quantityFromCanonical("hydration",650,unit);
  const canonical=quantityToCanonical("hydration",entered,unit);
  const parsed=trainingSessionSchema.parse({title:"Test",startsAt:"2026-10-18T12:00:00Z",minutes:60,intensity:"easy",discipline:"endurance",fluidMl:canonical});
  assert.ok(Math.abs(parsed.fluidMl!-650)<1e-8);
  assert.ok(Math.abs(quantityFromCanonical("hydration",parsed.fluidMl!,unit)-entered)<1e-8);
 }
});
test("missing session fluid stays unknown, never zero",()=>{
 const parsed=trainingSessionSchema.parse({title:"Test",startsAt:"2026-10-18T12:00:00Z",minutes:60,intensity:"easy",discipline:"endurance",fluidMl:null});
 assert.equal(parsed.fluidMl,null);
});
