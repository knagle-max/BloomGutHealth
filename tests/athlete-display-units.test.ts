import test from "node:test";
import assert from "node:assert/strict";
import { displayToKg,kgToDisplay,quantityToCanonical,quantityFromCanonical } from "../shared/display-units";
import { athleteProfileSchema,hydrationSchema } from "../shared/experience";
test("Athlete mixed body mass and energy units convert before storage",()=>{
 const mass=displayToKg(205,"lb");
 const energy=Math.round(quantityToCanonical("energy",10460,"kJ"));
 const profile=athleteProfileSchema.parse({weightKg:mass,energyKcal:energy});
 assert.ok(Math.abs(kgToDisplay(profile.weightKg!,"lb")-205)<0.0001);
 assert.ok(Math.abs(quantityFromCanonical("energy",profile.energyKcal!,"kJ")-10460)<3);
});
test("Hydration observations store canonical kg and millilitres independently",()=>{
 const preKg=displayToKg(205,"lb"),postKg=displayToKg(204,"lb");
 const drankMl=quantityToCanonical("hydration",24,"US-fl-oz");
 const record=hydrationSchema.parse({date:"2026-10-18",minutes:60,preKg,postKg,drankMl,urineMl:quantityToCanonical("hydration",0.25,"L"),climate:"temperate"});
 assert.ok(Math.abs(quantityFromCanonical("hydration",record.drankMl,"US-fl-oz")-24)<1e-10);
 assert.ok(record.preKg>record.postKg);
});
