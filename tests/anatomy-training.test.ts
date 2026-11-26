import test from 'node:test';import assert from 'node:assert/strict';
import {projectTrainingSurfaces} from '../shared/anatomy-training';import type {MuscleContribution} from '../shared/muscle-history';
const set=(patch:Partial<MuscleContribution>={})=>({key:'set:synthetic',side:'both',primary:['pectoralis_major'],secondary:['anterior_deltoid'],stabilizers:['serratus_anterior'],...patch}as MuscleContribution);
test('surface projections preserve explicit anatomical laterality and unknown side stays text-only',()=>{
 const both=projectTrainingSurfaces([set()]);assert.equal(both.surfaces.length,4);assert.equal(both.surfaces.find(s=>s.pathId==='bloom-front-chest-01')?.side,'right');
 const left=projectTrainingSurfaces([set({side:'left'})]);assert.equal(left.surfaces.length,2);assert.ok(left.surfaces.every(s=>s.side==='left'));assert.ok(left.surfaces.some(s=>s.pathId==='bloom-front-chest-02'));
 const unknown=projectTrainingSurfaces([set({side:'unspecified'})]);assert.equal(unknown.surfaces.length,0);assert.deepEqual(unknown.unsidedSetKeys,['set:synthetic']);
});
test('multiple descriptors and duplicate projections never add the same set twice; deferred remains unmapped',()=>{
 const result=projectTrainingSurfaces([set({primary:['gastrocnemius','soleus'],secondary:['gastrocnemius']}),set({primary:['gastrocnemius','soleus'],secondary:[]})]);assert.ok(result.surfaces.length);for(const row of result.surfaces){assert.deepEqual(row.primaryKeys,['set:synthetic']);assert.equal(row.secondaryKeys.length,0);}
 const deferred=projectTrainingSurfaces([set({primary:['serratus_anterior','adductor_magnus'],secondary:[]})]);assert.equal(deferred.surfaces.length,0);assert.deepEqual(deferred.unmappedMuscles,['serratus_anterior','adductor_magnus']);
});
