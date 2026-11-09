import test from 'node:test';import assert from 'node:assert/strict';
import {goalGuidance,goalMealFit} from '../shared/goal-guidance';
import {recommendMeals,preferenceSchema} from '../shared/meal-intelligence';

test('body and training goals connect observations without inventing composition, deficits or exercise prescriptions',()=>{
 const body=goalGuidance('Body composition'),training=goalGuidance('Training consistency');
 assert.equal(body.id,'body');assert.match(body.actions.join(' '),/do not directly measure body-fat/);assert.match(body.actions.join(' '),/does not create a calorie deficit/);assert.match(body.tracking,/rather than treating the latest Profile/);
 assert.equal(training.id,'training');assert.match(training.actions.join(' '),/does not prescribe training load/);assert.match(training.tracking,/unknown rather than evidence of a rest day/);
 assert.deepEqual(body.sourceIds,[]);assert.deepEqual(training.sourceIds,[],'Workflow guidance must not invent a clinical source');
 for(const goal of ['Body composition','Training consistency']){
  assert.deepEqual(goalMealFit([goal],'Oats with chicken'),[]);
  const baseline=recommendMeals(preferenceSchema.parse({goals:[goal],cookingMinutes:180,exclusions:['dairy','nuts']}));assert.ok(baseline.length>0);
  assert.deepEqual(baseline.map(r=>r.id),recommendMeals(preferenceSchema.parse({goals:['General health'],cookingMinutes:180,exclusions:['dairy','nuts']})).map(r=>r.id));
 }
 assert.equal(goalGuidance('Strength training').id,'muscle','Existing specific guidance retains precedence');assert.equal(goalGuidance('Unreviewed medical treatment').id,'unmapped');
});
