import test from "node:test";
import assert from "node:assert/strict";
import {parseHeightEntry,parseMassEntry,formatMassEntry,formatHeightEntry,switchHeightUnit,switchMassUnit} from "../shared/measurement-entry";
test("mixed units preserve canonical quantities",()=>{
 assert.equal(parseHeightEntry({unit:"ft-in",primary:"6",inches:"0"}).canonical,182.88);
 assert.ok(Math.abs((parseMassEntry({unit:"lb",value:"206"}) as {canonical:number}).canonical-93.44)<.01);
});
test("unfinished drafts are not silently reinterpreted on switch",()=>{
 assert.deepEqual(switchMassUnit({unit:"lb",value:"72."},"kg"),{kind:"incomplete"});
 assert.deepEqual(switchHeightUnit({unit:"ft-in",primary:"5",inches:"."},"cm"),{kind:"incomplete"});
 assert.equal(parseHeightEntry({unit:"ft-in",primary:"5",inches:"12"}).kind,"invalid");
});
test("round trips respect original measurement",()=>{
 for(const cm of [100,175,182.88,249])for(const unit of ["cm","m","ft-in"] as const){
  const result=parseHeightEntry(formatHeightEntry(cm,unit));
  assert.equal(result.kind,"valid");
  if(result.kind==="valid")assert.ok(Math.abs(result.canonical-cm)<.0001);
 }
 for(const kg of [50,72.5,93.44,200])for(const unit of ["kg","lb"] as const){
  const result=parseMassEntry(formatMassEntry(kg,unit));
  assert.equal(result.kind,"valid");
  if(result.kind==="valid")assert.ok(Math.abs(result.canonical-kg)<.0001);
 }
});

test("unit switching converts entered quantities without treating the same number as a new unit",()=>{
 const weight=switchMassUnit({unit:"lb",value:"200"},"kg");
 assert.ok("unit" in weight && weight.unit==="kg");
 if("unit" in weight){
  const parsed=parseMassEntry(weight);
  assert.equal(parsed.kind,"valid");
  if(parsed.kind==="valid") assert.ok(Math.abs(parsed.canonical-200/2.2046226218487757)<0.00001);
 }
 const height=switchHeightUnit({unit:"ft-in",primary:"5",inches:"11"},"cm");
 assert.ok("unit" in height && height.unit==="cm");
 if("unit" in height){
  const parsed=parseHeightEntry(height);
  assert.equal(parsed.kind,"valid");
  if(parsed.kind==="valid") assert.ok(Math.abs(parsed.canonical-180.34)<0.0001);
 }
 assert.deepEqual(switchMassUnit({unit:"lb",value:""},"kg"),{unit:"kg",value:""});
 assert.deepEqual(switchHeightUnit({unit:"cm",primary:"",inches:""},"ft-in"),{unit:"ft-in",primary:"",inches:""});
});
