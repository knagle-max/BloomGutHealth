import test from'node:test';import assert from'node:assert/strict';
import{labSchema,canonicalLab,labFlag,buildPrecisionReport,contextSchema}from'../shared/precision-nutrition';import{defaultPreferences}from'../shared/meal-intelligence';
test('reported LDL and triglyceride unit pairs compare consistently without rewriting source numbers or ranges',()=>{
 // Synthetic reported intervals exercise source semantics; these are not clinical targets.
 for(const fixture of [{marker:'ldl',mass:154.68,source:'154.6800',canonical:4,low:77.34,high:193.35,canonicalLow:2,canonicalHigh:5},{marker:'triglycerides',mass:177.14,source:'177.1400',canonical:2,low:88.57,high:265.71,canonicalLow:1,canonicalHigh:3}]as const){
  const common={marker:fixture.marker,laboratory:'Synthetic lab',method:'Synthetic assay',fasting:'yes'};
  const mass=labSchema.parse({...common,value:fixture.mass,unit:'mg/dL',measuredAt:'2026-10-01T12:00:00Z',referenceLow:fixture.low,referenceHigh:fixture.high,sourceInput:{text:`${fixture.marker}, ${fixture.source}, mg/dL`,number:fixture.source,suppliedUnit:'mg/dL',capture:'pasted-report'}});
  const molar=labSchema.parse({...common,value:fixture.canonical,unit:'mmol/L',measuredAt:'2026-10-02T12:00:00Z',referenceLow:fixture.canonicalLow,referenceHigh:fixture.canonicalHigh,sourceInput:{text:`${fixture.marker}, ${fixture.canonical}.000, mmol/L`,number:`${fixture.canonical}.000`,suppliedUnit:'mmol/L',capture:'pasted-report'}});
  const original=structuredClone([mass,molar]);assert.ok(Math.abs(canonicalLab(mass).value-fixture.canonical)<1e-12);assert.equal(canonicalLab(molar).value,fixture.canonical);assert.equal(labFlag(mass),'within reported range');assert.equal(labFlag(molar),'within reported range');
  const report=buildPrecisionReport([mass,molar].map((payload,index)=>({id:`${fixture.marker}-${index}`,kind:'lab',payload,createdAt:payload.measuredAt})),contextSchema.parse({}),defaultPreferences,null,Date.parse('2026-10-28T12:00:00Z'));
  const trend=report.trends.find(item=>item.marker===fixture.marker)!;assert.equal(trend.comparable,true);assert.ok(Math.abs(trend.change!)<1e-12);assert.equal(trend.points[0].sourceValue,fixture.mass);assert.equal(trend.points[0].sourceUnit,'mg/dL');assert.equal(trend.points[0].referenceLow,fixture.low);assert.equal(trend.points[0].referenceHigh,fixture.high);assert.equal(trend.points[0].sourceInput?.number,fixture.source);assert.equal(trend.points[1].sourceInput?.number,`${fixture.canonical}.000`);assert.deepEqual([mass,molar],original);
 }
});
