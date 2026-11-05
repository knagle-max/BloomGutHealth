import test from "node:test";
import assert from "node:assert/strict";
import {parseHeightEntry,parseMassEntry,formatMassEntry,formatHeightEntry,switchHeightUnit,switchMassUnit,parseCircumferenceEntry,switchCircumferenceUnit,originalMassEntry,originalHeightEntry,originalCircumferenceEntry,type MassEntry,type HeightEntry,type CircumferenceEntry} from "../shared/measurement-entry";
test("mixed units preserve canonical quantities",()=>{
 assert.equal(parseHeightEntry({unit:"ft-in",primary:"6",inches:"0"}).canonical,182.88);
 assert.ok(Math.abs((parseMassEntry({unit:"lb",value:"206"}) as {canonical:number}).canonical-93.44)<.01);
});

test("circumference drafts preserve their physical value and reject unfinished or invalid conversion",()=>{
 const initial={unit:"cm" as const,value:"91.44"};
 const converted=switchCircumferenceUnit(initial,"in");
 assert.ok("unit" in converted&&converted.unit==="in"&&converted.value==="36");
 if("unit" in converted){
  assert.deepEqual(parseCircumferenceEntry(converted),{kind:"valid",canonical:91.44});
  const back=switchCircumferenceUnit(converted,"cm");assert.ok("unit" in back&&back.unit===initial.unit&&back.value===initial.value);
 }
 for(const value of [".","91.","-","91e2","Infinity","0","-2","301"]){
  const entry={unit:"cm" as const,value};
  assert.equal("unit" in switchCircumferenceUnit(entry,"in"),false,value);
  assert.equal(parseCircumferenceEntry(entry).kind==="valid",false,value);
 }
 assert.deepEqual(switchCircumferenceUnit({unit:"cm",value:""},"in"),{unit:"in",value:""});
});
test("many unit switches preserve exact canonical meaning and original precision without growing editor history",()=>{
 let mass:MassEntry={unit:"kg",value:"123.456789123"},height:HeightEntry={unit:"m",primary:"1.789123456",inches:""},waist:CircumferenceEntry={unit:"cm",value:"91.441234567"};
 const originalMass={...mass},originalHeight={...height},originalWaist={...waist};
 const expectedMass=parseMassEntry(mass),expectedHeight=parseHeightEntry(height),expectedWaist=parseCircumferenceEntry(waist);
 for(let i=0;i<1000;i++){
  mass=switchMassUnit(mass,mass.unit==="kg"?"lb":"kg") as MassEntry;
  height=switchHeightUnit(height,["cm","m","ft-in"][i%3] as HeightEntry["unit"]) as HeightEntry;
  waist=switchCircumferenceUnit(waist,waist.unit==="cm"?"in":"cm") as CircumferenceEntry;
  assert.deepEqual(parseMassEntry(mass),expectedMass);assert.deepEqual(parseHeightEntry(height),expectedHeight);assert.deepEqual(parseCircumferenceEntry(waist),expectedWaist);
 }
 assert.deepEqual(originalMassEntry(mass),originalMass);assert.deepEqual(originalHeightEntry(height),originalHeight);assert.deepEqual(originalCircumferenceEntry(waist),originalWaist);
 assert.ok(JSON.stringify({mass,height,waist}).length<1500);
 assert.equal(originalMassEntry(formatMassEntry(123.456789123,"lb")),null,"A canonical snapshot cannot invent original entry text");
 assert.equal(originalHeightEntry(formatHeightEntry(178.9123456,"ft-in")),null);
 const almostSixFeet=182.8799999999,shown=formatHeightEntry(almostSixFeet,"ft-in");
 assert.equal(shown.primary,"6");assert.equal(shown.inches,"0");assert.deepEqual(parseHeightEntry(shown),{kind:"valid",canonical:almostSixFeet});
});
test("actual edits and malformed/stale conversion data cannot override the displayed entry or bypass bounds",()=>{
 const shown=switchMassUnit({unit:"kg",value:"100.00"},"lb") as MassEntry;
 const changed={...shown,value:"200.000"};
 assert.deepEqual(parseMassEntry(changed),parseMassEntry({unit:"lb",value:"200.000"}));
 assert.deepEqual(originalMassEntry(changed),{unit:"lb",value:"200.000"});
 const forged={...shown,conversionBasis:{...shown.conversionBasis!,canonical:500.1}};
 assert.deepEqual(parseMassEntry(forged),parseMassEntry({unit:shown.unit,value:shown.value}));
 assert.equal(parseMassEntry({...shown,unit:"unknown" as any}).kind,"invalid");
 assert.equal(parseMassEntry({unit:"kg",value:"1".repeat(129)}).kind,"invalid");
 for(const kg of[.000001234567,500]){
  const switched=switchMassUnit({unit:"kg",value:String(kg)},"lb") as MassEntry;
  assert.ok(Number(switched.value)>0,"A small positive quantity cannot display as zero");
  assert.deepEqual(parseMassEntry(switched),{kind:"valid",canonical:kg});
 }
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
