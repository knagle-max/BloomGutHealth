import test from 'node:test';
import assert from 'node:assert/strict';
import {dietaryReferenceEligibility} from '../shared/dietary-reference-eligibility';
import {contextSchema} from '../shared/precision-nutrition';
const base={actor:'a',profile:{id:'a',sex:'male'},birthYear:1990,healthContext:contextSchema.parse({pregnancy:'no',ageGroup:'adult',safetyReviewed:true}),nutrientKey:'magnesium_mg',date:'2026-11-18',timeZone:'UTC',asOf:'2026-11-18T12:00:00Z'};
const eligible=(input:typeof base=base)=>dietaryReferenceEligibility(input).rows.filter(row=>row.eligible).map(row=>[row.reference.kind,row.reference.amount]);
test('profile sex and possible age range select source EAR/RDA/UL without a birthday, reference conversion or personal assessment',()=>{
 const result=dietaryReferenceEligibility(base);assert.deepEqual(result.ageRange,{min:35,max:36});assert.deepEqual(eligible(),[['EAR',350],['RDA',420],['UL',350]]);assert.equal(result.adequacyAssessment,false);assert.equal(result.usualIntakeAssessment,false);
 assert.deepEqual(eligible({...base,profile:{id:'a',sex:'female'}}),[['EAR',265],['RDA',320],['UL',350]]);
 assert.deepEqual(eligible({...base,birthYear:2000}),[['EAR',330],['RDA',400],['UL',350]]);
 assert.deepEqual(eligible({...base,birthYear:1995}),[['UL',350]],'A possible30–31 age range does not select a birthday-dependent RDA');
 assert.deepEqual(eligible({...base,birthYear:2007}),[],'A possible18–19 age range does not assert adult19+ applicability');
 assert.equal(result.rows.find(row=>row.eligible&&row.reference.kind==='UL')!.reference.intakeScope,'pharmacological-only');
});
test('missing/conflicting/clinical/life-stage context never infers eligibility; generic published rows remain available',()=>{
 for(const patch of [{birthYear:null},{healthContext:undefined},{healthContext:{...base.healthContext,pregnancy:'yes'}},{healthContext:{...base.healthContext,pregnancy:'unknown'}},{healthContext:{...base.healthContext,safetyReviewed:false}},{healthContext:{...base.healthContext,conditions:['Reported condition']}},{healthContext:{...base.healthContext,medications:['Reported medicine']}},{healthContext:{...base.healthContext,ageGroup:'under18'}}]){
  const result=dietaryReferenceEligibility({...base,...patch});assert.ok(result.rows.length>0);assert.equal(result.rows.some(row=>row.eligible),false);
 }
 assert.deepEqual(eligible({...base,profile:{id:'a',sex:'unknown'}}),[['UL',350]],'An all-sex reference can retain eligibility when its other conditions are confirmed');
 assert.throws(()=>dietaryReferenceEligibility({...base,actor:'b'}),/SCOPE/);assert.throws(()=>dietaryReferenceEligibility({...base,healthContext:{pregnancy:'not-sure'}}),/CONTEXT/);
});
test('no smoking assumption, no historical stage/era projection, no invented B6 or missing references',()=>{
 const vitamin=dietaryReferenceEligibility({...base,nutrientKey:'vitamin_c_mg'});assert.deepEqual(vitamin.rows.filter(row=>row.eligible).map(row=>row.reference.kind),['UL']);assert.ok(vitamin.rows.filter(row=>row.reference.kind!=='UL').every(row=>row.reasons.includes('smoking-status-not-recorded')));
 const historical=dietaryReferenceEligibility({...base,date:'2025-11-18'});assert.deepEqual(historical.ageRange,{min:34,max:35});assert.equal(historical.rows.some(row=>row.eligible),false);assert.ok(historical.rows.every(row=>row.reasons.includes('historical-life-stage-and-reference-era-not-established')));
 assert.deepEqual(dietaryReferenceEligibility({...base,nutrientKey:'vitamin_b6_mg'}).rows,[]);
 for(const patch of [{date:'2026-02-30'},{timeZone:'invented'},{asOf:'not-a-date'}])assert.throws(()=>dietaryReferenceEligibility({...base,...patch}),/WINDOW/);
});
