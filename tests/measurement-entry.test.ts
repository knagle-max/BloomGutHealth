import test from "node:test";
import assert from "node:assert/strict";
import {parseHeightEntry,parseMassEntry,formatMassEntry,formatHeightEntry,switchHeightUnit,switchMassUnit,parseCircumferenceEntry,switchCircumferenceUnit} from "../shared/measurement-entry";
test("mixed units preserve canonical quantities",()=>{
 assert.equal(parseHeightEntry({unit:"ft-in",primary:"6",inches:"0"}).canonical,182.88);
 assert.ok(Math.abs((parseMassEntry({unit:"lb",value:"206"}) as {canonical:number}).canonical-93.44)<.01);
});

test("circumference drafts preserve their physical value and reject unfinished or invalid conversion",()=>{
 const initial={unit:"cm" as const,value:"91.44"};
 const converted=switchCircumferenceUnit(initial,"in");
 assert.deepEqual(converted,{unit:"in",value:"36"});
 if("unit" in converted){
  assert.deepEqual(parseCircumferenceEntry(converted),{kind:"valid",canonical:91.44});
  assert.deepEqual(switchCircumferenceUnit(converted,"cm"),initial);
 }
 for(const value of [".","91.","-","91e2","Infinity","0","-2","301"]){
  const entry={unit:"cm" as const,value};
  assert.equal("unit" in switchCircumferenceUnit(entry,"in"),false,value);
  assert.equal(parseCircumferenceEntry(entry).kind==="valid",false,value);
 }
 assert.deepEqual(switchCircumferenceUnit({unit:"cm",value:""},"in"),{unit:"in",value:""});
});

test("unchanged units do not rewrite valid or incomplete drafts on repeated hydration",()=>{
 const mass={unit:"kg" as const,value:"75.00"};
 const height={unit:"ft-in" as const,primary:"5",inches:"11."};
 const waist={unit:"in" as const,value:"36."};
 assert.equal(switchMassUnit(mass,"kg"),mass);
 assert.equal(switchHeightUnit(height,"ft-in"),height);
 assert.equal(switchCircumferenceUnit(waist,"in"),waist);
 assert.deepEqual(parseHeightEntry({unit:"ft-in",primary:"",inches:"6"}),{kind:"incomplete"});
 assert.deepEqual(switchHeightUnit({unit:"ft-in",primary:"",inches:"6"},"cm"),{kind:"incomplete"});
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
