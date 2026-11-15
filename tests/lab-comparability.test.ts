import test from 'node:test';
import assert from 'node:assert/strict';
import {assessLabComparability,type LabComparabilityPoint} from '../shared/lab-comparability';
import {buildPrecisionReport,contextSchema,labSchema} from '../shared/precision-nutrition';
import {defaultPreferences} from '../shared/meal-intelligence';

const first:LabComparabilityPoint={date:'2026-07-01T12:00:00Z',value:0,unit:'mmol/L',laboratory:'Recorded lab',method:'Assay A',fasting:'yes'};
const second={...first,date:'2026-10-01T12:00:00Z',value:2};
test('comparison explains incompatible source context without discarding zero or rewriting inputs',()=>{
 const points=[first,{...second,laboratory:'Other lab',method:'Unknown',fasting:'unknown'}],original=structuredClone(points);
 const result=assessLabComparability('glucose',points);
 assert.equal(result.comparable,false);
 assert.deepEqual(result.reasons,['laboratory-changed','method-unknown','method-changed','fasting-changed','fasting-unknown']);
 assert.deepEqual(points,original);
 assert.deepEqual(assessLabComparability('glucose',[first,second]),{comparable:true,reasons:[]});
});
test('source identity, equivalent timestamps, incompatible units and invalid observations remain separate reasons',()=>{
 assert.deepEqual(assessLabComparability('vitamin_d',[first,second]).reasons,['assay-identity']);
 assert.deepEqual(assessLabComparability('ldl',[first,{...second,date:'2026-07-01T14:00:00+02:00'}]).reasons,['duplicate-time']);
 assert.deepEqual(assessLabComparability('ldl',[first,{...second,unit:'mg/dL'}]).reasons,['units-differ']);
 assert.ok(assessLabComparability('alt',[first,{...second,value:NaN,date:'not a date'}]).reasons.includes('invalid-observation'));
 assert.deepEqual(assessLabComparability('alt',[]),{comparable:false,reasons:['insufficient-results']});
 assert.deepEqual(assessLabComparability('alt',[first]).reasons,['insufficient-results']);
});
test('a compatible explicit pair does not clear an incompatible historical series or imply clinical significance',()=>{
 const middle={...first,date:'2026-08-01T12:00:00Z',method:'Assay B'};
 assert.equal(assessLabComparability('ldl',[first,middle,second]).comparable,false);
 assert.equal(assessLabComparability('ldl',[first,second]).comparable,true);
});
test('canonical report reuses reason assessment and converted values while preserving every source record',()=>{
 const records=[first,{...second,method:'Not supplied'}].map((point,index)=>({id:`owned-${index}`,kind:'lab',createdAt:point.date,payload:labSchema.parse({marker:'ldl',value:index?120:0,unit:'mg/dL',measuredAt:point.date,laboratory:point.laboratory,method:point.method,fasting:point.fasting,referenceLow:null,referenceHigh:null})}));
 const original=structuredClone(records);
 const report=buildPrecisionReport(records,contextSchema.parse({}),defaultPreferences,null);
 const trend=report.trends[0];
 assert.equal(trend.comparable,false);assert.equal(trend.change,null);
 assert.deepEqual(trend.comparabilityReasons,['method-unknown','method-changed']);
 assert.match(trend.note,/method is not recorded for every result/);
 assert.equal(trend.points.length,2);assert.equal(trend.points[0].sourceValue,0);
 assert.equal(trend.points[1].sourceValue,120);assert.equal(trend.points[1].unit,'mmol/L');
 assert.deepEqual(records,original);
 assert.deepEqual(buildPrecisionReport([],contextSchema.parse({}),defaultPreferences,null).trends,[]);
});
