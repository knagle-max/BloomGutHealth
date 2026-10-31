import test from 'node:test';
import assert from 'node:assert/strict';
import {practicalChoices} from '../shared/practical-planner';
import {preferenceSchema} from '../shared/meal-intelligence';
import {buildPrecisionReport,contextSchema} from '../shared/precision-nutrition';
import {weeklyRequestSchema} from '../shared/weekly-planner';
import {practicalPreferencesSchema} from '../shared/experience';
const preferences=preferenceSchema.parse({cookingMinutes:60});
const report=buildPrecisionReport([],contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true}),preferences,null);
const request=weeklyRequestSchema.parse({days:1,targets:{calories:2200,protein:200,fiber:30,fiberMaximum:45,sodium:2300,saturatedFat:5}});
const practical=practicalPreferencesSchema.parse({minutes:60});
test('planning explains excluded nutrient constraints without relaxing a maximum for protein',()=>{
 const original=structuredClone(request);
 const result=practicalChoices([{intelligence:{nutrients:[{key:'fat_saturated_g',amount:6,coverage:1}]}}],preferences,report,request,practical,false,'dinner');
 assert.equal(result.choices.length,0);assert.ok(result.diagnostics!.testedPortions>0);
 assert.equal(result.diagnostics!.nutrientLimits.find(c=>c.key==='fat_saturated_g')!.exceeded,result.diagnostics!.testedPortions);
 assert.deepEqual(request,original);assert.equal(request.targets.protein,200);assert.equal(request.targets.saturatedFat,5);
});
test('preparation and equipment exclusions are observable; absent logged nutrition is not an exceeded limit',()=>{
 const result=practicalChoices([],preferences,report,request,{...practical,minutes:5,equipment:['none']},false,'dinner');
 assert.ok(result.diagnostics!.excludedForTime>0);assert.ok(result.diagnostics!.excludedForEquipment>0);
 assert.ok(result.diagnostics!.excludedForTime<=result.diagnostics!.testedPortions);
 const ordinary=practicalChoices([{intelligence:{nutrients:[]},nutritionalData:[]}],preferences,report,{...request,targets:{...request.targets,saturatedFat:20}},practical,false,'dinner');
 assert.ok(ordinary.choices.length>0);assert.ok(ordinary.choices.every(c=>c.limitChecks.some(check=>check.status==='unverified')));
 assert.equal(practicalChoices([],preferences,report,request,practical,true).diagnostics,undefined);
});
