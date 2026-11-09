import test from 'node:test';import assert from 'node:assert/strict';
import {goalGuidance,goalMealFit,goalSources} from '../shared/goal-guidance';
import {recommendMeals,preferenceSchema} from '../shared/meal-intelligence';

test('digestive comfort is supported as an observation goal without an inferred diagnosis, restrictive diet or clinical priority',()=>{
 const goal=goalGuidance('Digestive tolerance');assert.equal(goal.id,'digestive');assert.ok(goal.sourceIds.every(id=>goalSources.some(source=>source.id===id)));
 assert.match(goal.actions.join(' '),/does not diagnose IBS/);assert.match(goal.tracking,/not proof/);
 assert.deepEqual(goalMealFit(['Digestive tolerance'],'Beans with oats'),[]);
 const choices=(goals:string[])=>recommendMeals(preferenceSchema.parse({goals,cookingMinutes:180,exclusions:['dairy','nuts']})).map(recipe=>recipe.id);
 assert.ok(choices(['Digestive tolerance']).length>0);assert.deepEqual(choices(['Digestive tolerance']),choices(['General health']),'A digestive goal alone must not invent new food exclusions');
 assert.equal(goalGuidance('Unspecified disease treatment').id,'unmapped');
});
