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

test('calcium handles different female/male requirement ages, shared upper limits and uncertain 50–51/70–71 boundaries without fake birthdays',()=>{
 const run=(sex:string,age:number)=>dietaryReferenceEligibility({...base,profile:{id:'a',sex},birthYear:2026-age,nutrientKey:'calcium_mg'}).rows.filter(row=>row.eligible).map(row=>[row.reference.kind,row.reference.amount]);
 assert.deepEqual(run('male',36),[['EAR',800],['RDA',1000],['UL',2500]]);assert.deepEqual(run('female',55),[['EAR',1000],['RDA',1200],['UL',2000]]);
 assert.deepEqual(run('male',55),[['EAR',800],['RDA',1000],['UL',2000]]);
 assert.deepEqual(run('male',51),[['EAR',800],['RDA',1000]],'A possible50–51 age has no common UL category but the male requirement is unchanged');
 assert.deepEqual(run('female',51),[],'Both the requirement and UL vary across50–51');assert.deepEqual(run('male',71),[['UL',2000]],'A possible70–71 age cannot pick an RDA');
 assert.deepEqual(run('unknown',36),[['UL',2500]]);
});

test('potassium matches only the published adult sex-specific AI and keeps clinical or unknown context unmatched',()=>{
 const run=(patch={})=>eligible({...base,nutrientKey:'potassium_mg',...patch});assert.deepEqual(run(),[['AI',3400]]);assert.deepEqual(run({profile:{id:'a',sex:'female'}}),[['AI',2600]]);assert.deepEqual(run({profile:{id:'a',sex:'unknown'}}),[]);assert.deepEqual(run({birthYear:1995}),[['AI',3400]]);assert.deepEqual(run({healthContext:{...base.healthContext,medications:['Medicine']}}),[]);
});

test('dietary vitamin D preserves shared sex categories and abstains only for the birthday-dependent RDA at70–71',()=>{
 const run=(age:number,sex='male')=>eligible({...base,nutrientKey:'vitamin_d_ug',birthYear:2026-age,profile:{id:'a',sex}});assert.deepEqual(run(36),[['EAR',10],['RDA',15],['UL',100]]);assert.deepEqual(run(72,'female'),[['EAR',10],['RDA',20],['UL',100]]);assert.deepEqual(run(71),[['EAR',10],['UL',100]]);assert.deepEqual(run(36,'unknown'),[['EAR',10],['RDA',15],['UL',100]]);
});

test('vitamin A matches source sex/age context while preserving preformed-only UL and no amount or form inference',()=>{
 const run=(sex:string)=>dietaryReferenceEligibility({...base,nutrientKey:'vitamin_a_ug',profile:{id:'a',sex}});assert.deepEqual(eligible({...base,nutrientKey:'vitamin_a_ug'}),[['EAR',625],['RDA',900],['UL',3000]]);assert.deepEqual(eligible({...base,nutrientKey:'vitamin_a_ug',profile:{id:'a',sex:'female'}}),[['EAR',500],['RDA',700],['UL',3000]]);assert.deepEqual(eligible({...base,nutrientKey:'vitamin_a_ug',profile:{id:'a',sex:'unknown'}}),[['UL',3000]]);assert.equal(run('male').rows.find(row=>row.reference.kind==='UL')!.reference.intakeScope,'preformed-vitamin-a-only');assert.equal(run('male').adequacyAssessment,false);
});

test('folate and E profile applicability retains synthetic scope without calculating personal source-form amounts',()=>{
 for(const key of ['folate_ug','vitamin_e_mg']){const view=dietaryReferenceEligibility({...base,nutrientKey:key});assert.equal(view.rows.filter(row=>row.eligible).length,3);assert.equal(view.rows.find(row=>row.reference.kind==='UL')!.reference.intakeScope.startsWith('synthetic-'),true);assert.equal(view.adequacyAssessment,false);assert.equal(dietaryReferenceEligibility({...base,nutrientKey:key,healthContext:{...base.healthContext,pregnancy:'yes'}}).rows.some(row=>row.eligible),false);}
});

test('iron never infers menstruation or menopause from female Profile age; all general source values remain available',()=>{
 assert.deepEqual(eligible({...base,nutrientKey:'iron_mg'}),[['UL',45]]);
 for(const age of [36,51,72]){const view=dietaryReferenceEligibility({...base,nutrientKey:'iron_mg',profile:{id:'a',sex:'female'},birthYear:2026-age});assert.equal(view.rows.length,7);assert.deepEqual(view.rows.filter(row=>row.eligible).map(row=>[row.reference.kind,row.reference.amount]),[['UL',45]]);assert.ok(view.rows.filter(row=>row.reference.menstrualBasis).every(row=>row.reasons.includes('menstrual-context-not-established')));assert.equal(view.adequacyAssessment,false);}
});

test('B12 adult shared reference categories do not infer an absorption status or manufacture a zero UL',()=>{
 for(const age of [36,51,72]){const view=dietaryReferenceEligibility({...base,nutrientKey:'vitamin_b12_ug',birthYear:2026-age});assert.deepEqual(view.rows.filter(row=>row.eligible).map(row=>[row.reference.kind,row.reference.amount]),[['EAR',2],['RDA',2.4]]);assert.equal(view.adequacyAssessment,false);assert.equal(view.rows.some(row=>row.reference.kind==='UL'),false);}
});

test('sodium and vitamin K match published demographic context while unknown actual iron/zinc diet withholds requirements only',()=>{
 assert.deepEqual(eligible({...base,nutrientKey:'sodium_mg'}),[['AI',1500],['CDRR',2300]]);assert.deepEqual(eligible({...base,nutrientKey:'vitamin_k_ug'}),[['AI',120]]);assert.deepEqual(eligible({...base,nutrientKey:'vitamin_k_ug',profile:{id:'a',sex:'female'}}),[['AI',90]]);
 for(const key of ['iron_mg','zinc_mg']){const view=dietaryReferenceEligibility({...base,nutrientKey:key});assert.deepEqual(view.rows.filter(row=>row.eligible).map(row=>row.reference.kind),['UL']);assert.ok(view.rows.filter(row=>row.reference.kind!=='UL').every(row=>row.reasons.includes('dietary-pattern-not-established')));assert.ok(view.rows.length>1);assert.equal(view.adequacyAssessment,false);}
});
