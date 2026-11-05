import test from "node:test";
import assert from "node:assert/strict";
import {captureAthleteReferenceSource,captureSessionEntrySource,captureHydrationEntrySource} from "../shared/athlete-entry-capture";
import {originalMassEntry,switchMassUnit,type MassEntry} from "../shared/measurement-entry";
test("Athlete capture preserves first manual originals across unit switches and omits copied canonical mass origins",()=>{
 const mass=switchMassUnit({unit:"lb",value:"154.000"},"kg")as MassEntry,values={weightKg:154/2.2046226218487757,energyKcal:2500};
 const original=captureAthleteReferenceSource(undefined,values,originalMassEntry(mass),{value:"10460.00",unit:"kJ"});
 assert.deepEqual(original?.fields,{weightKg:{unit:"lb",value:"154.000"},energyKcal:{value:"10460.00",unit:"kJ"}});
 assert.deepEqual(captureAthleteReferenceSource(original,values,null,undefined),original);
 assert.equal(captureAthleteReferenceSource(original,values,null,undefined,true)?.fields.weightKg,undefined);
 assert.equal(captureAthleteReferenceSource(original,{weightKg:80,energyKcal:null},null,undefined),undefined);
});
test("session capture keeps unchanged originals, replaces actual edits, clears missing values and cannot invent legacy origins",()=>{
 const original=captureSessionEntrySource(undefined,1500,{value:"1.500",unit:"L"});assert.deepEqual(captureSessionEntrySource(original,1500),original);
 assert.equal(captureSessionEntrySource(undefined,1500),undefined);assert.equal(captureSessionEntrySource(original,null,{value:"",unit:"L"}),undefined);
 assert.deepEqual(captureSessionEntrySource(original,1250,{value:"1250.00",unit:"mL"})?.fields.fluidMl,{value:"1250.00",unit:"mL"});
 assert.throws(()=>captureSessionEntrySource(original,1,{value:"1.0",unit:"L"}));
});
test("hydration captures only touched original inputs including explicit zero, without backfilling default zero or accepting nonfinite/underflow",()=>{
 const values={preKg:70,postKg:69,drankMl:1250,urineMl:0};
 assert.equal(captureHydrationEntrySource(values,{}),undefined);
 const source=captureHydrationEntrySource(values,{preKg:{value:"70.000",unit:"kg"},drankMl:{value:"1.25",unit:"L"},urineMl:{value:"0.0",unit:"mL"}});
 assert.equal(source?.fields.postKg,undefined);assert.equal(source?.fields.urineMl?.value,"0.0");
 for(const value of["1e999","1e-999","PrivateCanary"])assert.throws(()=>captureHydrationEntrySource(values,{urineMl:{value,unit:"mL"}}));
});
