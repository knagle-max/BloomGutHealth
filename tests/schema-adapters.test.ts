import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { recipeProposalsSchema } from "../server/recipe-generation";
import { parseSchema } from "../server/meal-intelligence";
import { scanResultSchema } from "../server/experience-routes";
import { experienceSettingsSchema } from "../shared/experience";
test("patched collection validation rejects oversized input before collecting per-item failures",()=>{
 const result=z.array(z.object({name:z.string()})).max(20).safeParse(Array(10000).fill(null));
 assert.equal(result.success,false);
 if(!result.success){assert.equal(result.error.issues.length,1);assert.equal(result.error.issues[0].code,"too_big");}
});
test("Zod 4 preserves nested preference defaults and actual structured-output contracts without a provider call",()=>{
 const settings=experienceSettingsSchema.parse({});assert.equal(settings.athlete.healthReviewed,false);assert.equal(settings.displayUnits.bodyWeight,"kg");
 for(const [name,schema] of [["recipe",recipeProposalsSchema],["meal",parseSchema],["photo",scanResultSchema]] as const){
  const format=zodTextFormat(schema,name);assert.equal(format.type,"json_schema");assert.equal(format.strict,true);assert.equal(format.schema.type,"object");assert.equal(format.schema.additionalProperties,false);
 }
 const photo={description:"Synthetic label",name:"Fixture",brand:"",servingDescription:"",servingGrams:null,nutrients:[]};
 const format=zodTextFormat(scanResultSchema,"photo");assert.deepEqual(format.$parseRaw(JSON.stringify(photo)),photo);
});
