import test from 'node:test';import assert from 'node:assert/strict';
import {buildPrecisionReport,contextSchema,labSchema,markerDefinitions} from '../shared/precision-nutrition';
import {defaultPreferences} from '../shared/meal-intelligence';
import {recordedLabPanelReview} from '../shared/lab-panel-review';
import {labFamilyGuidance} from '../shared/lab-family-guidance';
import {labEditorialFor,labEditorialSources} from '../shared/biology-labs';
const row=(marker:string,patch:Record<string,unknown>={})=>({id:'synthetic-'+marker,kind:'lab',payload:labSchema.parse({marker,value:100,unit:markerDefinitions.find(value=>value.id===marker)!.units[0],measuredAt:'2026-10-01T12:00:00Z',laboratory:'Synthetic lab',method:'Synthetic assay',fasting:'unknown',referenceLow:null,referenceHigh:50,...patch})});
const families=(records:ReturnType<typeof row>[])=>recordedLabPanelReview(buildPrecisionReport(records,contextSchema.parse({}),defaultPreferences,null)).families;
test('family context reuses exact relevant canonical questions and citations without TG leakage or modifying original observations',()=>{
 const source=[row('b12'),row('ferritin')],before=structuredClone(source),family=families(source).find(value=>value.id==='iron-cbc')!,guidance=labFamilyGuidance(family);
 assert.deepEqual(guidance.rows.map(value=>value.markerId).sort(),['b12','ferritin']);
 for(const value of guidance.rows){const profile=labEditorialFor(value.markerId)!;assert.equal(value.discussion,profile.whatToDiscuss);assert.deepEqual(value.citations,labEditorialSources(profile));assert.equal(value.sourceId,'synthetic-'+value.markerId);}
 assert.match(guidance.action!.href,/^\/precision\?tab=labs&labResult=synthetic-/);assert.deepEqual(source,before);assert.equal(guidance.rows.some(value=>value.markerId==='triglycerides'),false);
});
test('unconfirmed assay and unordered source occurrence do not borrow marker-specific discussion or a false current source action',()=>{
 const liver=families([row('bilirubin')]).find(value=>value.id==='liver')!;assert.deepEqual(labFamilyGuidance(liver),{rows:[],action:null});
 const original=row('alt'),duplicate={...row('alt'),id:'synthetic-duplicate'};const family=families([original,duplicate]).find(value=>value.id==='liver')!;assert.deepEqual(labFamilyGuidance(family),{rows:[],action:null});
});
