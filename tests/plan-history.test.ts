import test from 'node:test';
import assert from 'node:assert/strict';
import {historicalPlanRecord} from '../server/plan-history';
test('plan history preserves safe stored snapshots and zero targets without treating version or check flags as current clearance',()=>{
 const original={id:'synthetic',kind:'plan',payload:{type:'weekly-plan',version:'weekly-2026-10-17.1',checksPassed:true,request:{targets:{sodium:0}},days:[],biologicalEvidence:{}}};
 const projected=historicalPlanRecord(original) as any;
 assert.equal(projected.payload,original.payload);assert.equal(projected.interpretationStatus,'historical_plan_not_revalidated');assert.equal(projected.currentUse,'rebuild_required');
 assert.equal((original as any).interpretationStatus,undefined);
 for(const payload of [null,[],{},'weekly-plan',{type:'lab'}]){const record={kind:'plan',payload};assert.equal(historicalPlanRecord(record),record);}
 const lab={kind:'lab',payload:{type:'weekly-plan',value:0,unit:'original'}};assert.equal(historicalPlanRecord(lab),lab);
});
