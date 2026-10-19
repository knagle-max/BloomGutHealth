import test from "node:test";
import assert from "node:assert/strict";
import { cmToHeight, heightToCm, kgToDisplay, displayToKg } from "../shared/display-units";
import { experienceSettingsSchema, settingsPatchSchema } from "../shared/experience";

test("independent mixed-unit settings remain valid",()=>{
 const settings=experienceSettingsSchema.parse({displayUnits:{height:"cm",bodyWeight:"lb",hydration:"US-fl-oz"}});
 assert.equal(settings.displayUnits.height,"cm");
 assert.equal(settings.displayUnits.bodyWeight,"lb");
 assert.equal(settings.displayUnits.hydration,"US-fl-oz");
 assert.equal(settings.displayUnits.temperature,"C");
 assert.equal(settingsPatchSchema.safeParse({displayUnits:{...settings.displayUnits,height:"ft-in",bodyWeight:"kg"}}).success,true);
});
test("round-trip height and weight across independent unit systems",()=>{
 for(const cm of [43.18,175,182.88,249]){
  for(const unit of ["cm","m","ft-in"] as const){
   const v=cmToHeight(cm,unit);
   assert.ok(Math.abs(heightToCm(v.primary,unit,v.inches)-cm)<1e-8);
  }
 }
 for(const kg of [1,72.5,93.7,249]){
  for(const unit of ["kg","lb"] as const)
   assert.ok(Math.abs(displayToKg(kgToDisplay(kg,unit),unit)-kg)<1e-8);
 }
});
