import test from "node:test";
import assert from "node:assert/strict";
import { cmToHeight, heightToCm, kgToDisplay, displayToKg, quantityFromCanonical, quantityToCanonical } from "../shared/display-units";
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

test("canonical display conversions for all remaining Amendment D quantities",()=>{
 const cases=[
  ["circumference","in",100],["hydration","L",1800],
  ["hydration","US-fl-oz",1800],["temperature","F",37],
  ["energy","kJ",2250],["foodWeight","oz",275]
 ] as const;
 for(const [kind,unit,value] of cases)
  assert.ok(Math.abs(quantityToCanonical(kind,quantityFromCanonical(kind,value,unit),unit)-value)<1e-8);
 assert.throws(()=>quantityFromCanonical("hydration",100,"in"));
});


test("locale unit suggestions are nonbinding, bounded and do not invent residence from language",async()=>{
 const {measurementUnitSuggestion:suggest}=await import('../shared/measurement-suggestions');
 assert.equal(suggest('en-US').units.bodyWeight,'lb');assert.equal(suggest('en-US').units.height,'ft-in');
 for(const locale of ['en-CA','fr-CA','en-GB','en','fr',undefined,null,'','not_a_locale','x'.repeat(129)]){const hint=suggest(locale);assert.equal(hint.units.bodyWeight,'kg');assert.equal(hint.units.height,'cm');assert.equal(hint.units.energy,'kcal');}
 assert.equal(suggest('en-US-u-ms-metric').units.bodyWeight,'kg');
 assert.equal(suggest('en-CA-u-ms-ussystem').units.bodyWeight,'lb');
 assert.equal(suggest('EN-us').locale,'en-US');assert.equal(suggest(undefined).locale,null);
 const saved=experienceSettingsSchema.parse({displayUnits:{height:'cm',bodyWeight:'lb',energy:'kJ'}}),before=structuredClone(saved);suggest('en-US');assert.deepEqual(saved,before);
});
