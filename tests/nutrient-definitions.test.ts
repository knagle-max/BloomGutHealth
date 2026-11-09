import test from "node:test";
import assert from "node:assert/strict";
import {nutrientDefinitions,type MealIntelligence} from "../shared/meal-intelligence";
import {nutrientDefinitionDetails,nutrientDefinitionSource,reviewedNutrientName} from "../shared/nutrient-definitions";
import {analyzeMeal} from "../server/meal-intelligence";
test("structured nutrient definitions preserve the one source registry and distinguish RAE, total folate and specific fields without conversion",()=>{
 const defs=nutrientDefinitionDetails();assert.equal(defs.length,nutrientDefinitions.length);
 for(const [key,name,unit,id] of nutrientDefinitions){const d=defs.find(d=>d.key===key)!;assert.equal(d.name,name);assert.equal(d.amountUnit,unit);assert.equal(d.sourceMappings.usda,id);assert.equal(d.sourceMappings.cnf,null);assert.equal(d.conversionBasis,"source-reported-field-only");}
 assert.equal(defs.find(d=>d.key==="vitamin_a_ug")!.activityUnit,"µg RAE");
 assert.equal(defs.find(d=>d.key==="folate_ug")!.activityUnit,null);assert.match(defs.find(d=>d.key==="folate_ug")!.sourceBasis,/not dietary folate equivalents/);
 assert.equal(defs.find(d=>d.key==="vitamin_e_mg")!.chemicalForm,"alpha-tocopherol");assert.equal(defs.find(d=>d.key==="vitamin_k_ug")!.chemicalForm,"phylloquinone");
 assert.equal(defs.some(d=>d.key==="iodine_ug"),false,"An absent analyte is not a verified zero or invented source mapping");
});
test("source-backed review admits generic field meanings, while label/mixed/unknown sources withhold equivalent claims and never alter facts",async()=>{
 const analysis=(await analyzeMeal("2 slices of pepperoni pizza")).intelligence,before=JSON.stringify(analysis);
 assert.equal(nutrientDefinitionSource(analysis),"usda-field-mapping");assert.equal(reviewedNutrientName("vitamin_a_ug","Vitamin A, RAE",nutrientDefinitionSource(analysis)),"Vitamin A, RAE");
 for(const changed of [{...analysis,foodMatches:[]},{...analysis,foodMatches:analysis.foodMatches.map(m=>({...m,fdcId:null}))},{...analysis,ingredients:analysis.ingredients.map(i=>({...i,product:{source:"manual",id:"label",servings:1}}))},{...analysis,ingredients:[]}]as MealIntelligence[]){assert.equal(nutrientDefinitionSource(changed),"form-not-recorded");assert.equal(reviewedNutrientName("vitamin_a_ug","Vitamin A, RAE",nutrientDefinitionSource(changed)),"Vitamin A (basis unconfirmed)");assert.equal(reviewedNutrientName("folate_ug","Folate, total",nutrientDefinitionSource(changed)),"Folate (basis unconfirmed)");}
 assert.equal(JSON.stringify(analysis),before);
});
