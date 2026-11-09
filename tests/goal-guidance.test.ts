import {foodPreferenceMatches} from "../shared/food-preference-policy";
import test from 'node:test';import assert from 'node:assert/strict';
import {goalGuidance,goalMealFit,goalSources} from '../shared/goal-guidance';
import {preferenceSchema,recommendMeals} from '../shared/meal-intelligence';
import {buildPrecisionReport,contextSchema} from '../shared/precision-nutrition';

test('approved general-health goal has bounded food-pattern guidance and an actual public source without inventing targets',()=>{
 for(const goal of ['General health','Support overall health','Healthy eating','well-being']){
  const result=goalGuidance(goal);assert.equal(result.id,'general');assert.ok(result.sourceIds.every(id=>goalSources.some(source=>source.id===id)));assert.match(result.actions.join(' '),/does not add a calorie deficit/);assert.match(result.tracking,/not a diet-quality score/);
 }
 assert.equal(goalGuidance('an unrecognized personal goal').id,'unmapped');assert.equal(goalGuidance('muscle building for general health').id,'muscle');
 const original=['General health'];assert.deepEqual(goalMealFit(original,'Oats with walnuts'),[]);assert.deepEqual(original,['General health']);
});
test('goal explanations keep source attribution specific and cannot override hard food restrictions ',()=>{
 const metabolic=goalGuidance('cholesterol support');assert.ok(metabolic.sourceIds.includes('goal-healthy-fats'));assert.ok(!metabolic.sourceIds.includes('goal-liver'));
 const prefs=preferenceSchema.parse({goals:['General health'],exclusions:['dairy']});
 const report=buildPrecisionReport([],contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true,allergies:['nuts']}),prefs,null);
 assert.ok(report.goals.some(g=>g.id==='general'));
 assert.equal(report.recommendations.length,0,'A broad goal must not invent biology-specific recommendation priority');
 const library=recommendMeals(preferenceSchema.parse({goals:['General health'],exclusions:['dairy','nuts'],cookingMinutes:180}));assert.ok(library.length>0);for(const recipe of library)assert.deepEqual(foodPreferenceMatches(recipe.ingredients,['nuts','dairy']),[]);
 assert.ok(report.sources.some(source=>source.id==='goal-general'));
});
