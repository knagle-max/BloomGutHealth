import {recordedB6ReferenceReview} from '../shared/recorded-b6-reference-review';
import {dietaryReferenceEligibility} from '../shared/dietary-reference-eligibility';
import {contextSchema} from '../shared/precision-nutrition';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {supplementIntakeSchema} from '../shared/supplement-intake';
import {recordedIntakeSources} from '../shared/recorded-intake-sources';
import {knownNutrientCoverage} from '../shared/nutrient-coverage';
const actor='a',date='2026-11-18',timeZone='UTC',asOf='2026-11-18T12:00:00Z';
function taken(labelId:string,amount:number,servings:number|null=1,unit='mg',name='Vitamin B6'){
 const value={takenAt:'2026-11-18T10:00:00Z',confirmedAt:'2026-11-18T10:01:00Z',confirmedTaken:true,servings,label:{source:'manual',id:labelId,name:'Synthetic '+labelId,brand:'Synthetic',servingDescription:'1 capsule',servingGrams:null,perServing:{},otherNutrients:[{name,amount,unit}],retrievedAt:'2026-11-17T12:00:00Z',url:null,notes:[]},mineralBasis:{iron_mg:'unknown',magnesium_mg:'unknown',zinc_mg:'unknown'},formulation:{labelVersion:'Synthetic label v1',batch:null}};
 return{id:createHash('sha256').update(randomUUID()).digest('hex'),userId:actor,kind:'supplement-intake',createdAt:value.confirmedAt,updatedAt:value.confirmedAt,payload:supplementIntakeSchema.parse({version:1,valueKind:'confirmed-supplement-consumption',intentId:randomUUID(),revision:randomUUID(),lifecycleId:randomUUID(),original:value,current:value,corrections:[]})};
}
const read=(supplements:unknown[])=>recordedIntakeSources({actor,date,timeZone,asOf,foods:[],supplements});
test('BIO-VALUE04/06: confirmed same-day native B6 overlap joins exact source amounts once, explains the duplicate-label issue and remains source-detail without clinical applicability',()=>{
 const a=taken('a',50),b=taken('b',25),unknown=taken('c',100,null),view=read([a,a,b,unknown]),before=structuredClone(view),finding=knownNutrientCoverage(view,actor,'vitamin_b6_mg').overlap!;
 assert.ok(finding);assert.equal(finding.knownSupplementalMg,75);assert.equal(finding.distinctLabels,2);assert.equal(finding.unknownSupplementEntries,1);assert.equal(finding.members.length,2);assert.deepEqual(finding.observationRefs.map(row=>row.sourceId),[a.id,b.id]);assert.match(finding.biologicalMeaning!,/Reviewing individual entries can miss the cumulative supplemental amount/);assert.equal(finding.releaseState,'detail-only');assert.equal(finding.evidenceClass,'source-arithmetic');assert.equal(finding.referenceApplicability,'not-established');assert.equal(finding.findingType,'source-observed');assert.equal(finding.practicalNextStepId,null);assert.equal(finding.priorityReason,null);assert.deepEqual(finding.relevantUserGoalIds,[]);assert.ok(finding.materialUnknowns.some(text=>/Personal reference applicability/.test(text)));assert.ok(finding.prohibitedClaims.includes('safe dose'));assert.deepEqual(view,before);
});
test('BIO-VALUE05/10: merely saved/planned, single-label, unknown quantity, source zero, compound mass and unsupported units never become an overlap headline',()=>{
 for(const input of [[],[{userId:actor,kind:'supplement-review'}],[taken('a',50)],[taken('a',50),taken('a',25)],[taken('a',50),taken('b',25,null)],[taken('a',50),taken('b',0)],[taken('a',50),taken('b',25,1,'µg')],[taken('a',50),taken('b',25,1,'mg','Pyridoxine hydrochloride')]])assert.equal(knownNutrientCoverage(read(input),actor,'vitamin_b6_mg').overlap,null);
 const unavailable=read([taken('a',50),taken('b',25)]);unavailable.events[1].sourceStatus='unavailable';assert.equal(knownNutrientCoverage(unavailable,actor,'vitamin_b6_mg').overlap,null);
 const records=[taken('a',50),taken('b',25)];records[1].payload.current.takenAt='2026-11-17T10:00:00Z';assert.equal(knownNutrientCoverage(read(records),actor,'vitamin_b6_mg').overlap,null);
});
test('BIO-VALUE07/13: current corrections/deletions change only current-source meaning/epoch; old source stays immutable and wrong accounts cannot acquire candidates',()=>{
 const a=taken('a',50),b=taken('b',25),first=knownNutrientCoverage(read([a,b]),actor,'vitamin_b6_mg').overlap!,original=structuredClone(a.payload.original),revision=randomUUID(),value={...a.payload.current,servings:.5};
 const corrected={...a,payload:supplementIntakeSchema.parse({...a.payload,revision,current:value,corrections:[{revision,changedAt:'2026-11-18T11:00:00Z',value}]})};
 const current=knownNutrientCoverage(read([corrected,b]),actor,'vitamin_b6_mg').overlap!;assert.equal(current.knownSupplementalMg,50);assert.notEqual(current.sourceEpoch,first.sourceEpoch);assert.deepEqual(corrected.payload.original,original);assert.equal(current.observationRefs[0].revision,revision);assert.equal(knownNutrientCoverage(read([b]),actor,'vitamin_b6_mg').overlap,null);
 assert.throws(()=>knownNutrientCoverage(read([a,b]),'b','vitamin_b6_mg'),/SCOPE/);
 const malformed=read([a,b]);malformed.events[0].rows.find(row=>row.nutrientKey==='vitamin_b6_mg')!.occurredAt='2026-11-17T10:00:00Z';assert.throws(()=>knownNutrientCoverage(malformed,actor,'vitamin_b6_mg'),/ROW_TIME/);
});

const reference=(patch:Record<string,unknown>={})=>({...dietaryReferenceEligibility({actor,profile:{id:actor,sex:'male'},birthYear:1990,healthContext:contextSchema.parse({pregnancy:'no',ageGroup:'adult',safetyReviewed:true}),nutrientKey:'vitamin_b6_mg',date,timeZone,asOf,...patch}),revision:'a'.repeat(64)});
test('BIO-VALUE04: a known partial supplemental overlap can reach a matched total-intake limit without becoming complete-day exposure or a toxicity diagnosis',()=>{
 const view=read([taken('a',50),taken('b',50),taken('c',20,null)]),before=structuredClone(view),review=recordedB6ReferenceReview(view,actor,reference())!;
 assert.ok(review);assert.match(review.finding,/reaches/);assert.doesNotMatch(review.finding,/exceeds/);assert.equal(review.reference.amount,100);assert.equal(review.reference.intakeScope,'total-intake');assert.equal(review.releaseState,'feature-eligible');assert.equal(review.referenceApplicability,'matched-published-context');assert.equal(review.unknownSupplementEntries,1);assert.match(review.biologicalMeaning,/single recorded day does not establish usual exposure or harm/);assert.match(review.discussion,/do not change a prescribed dose/);assert.equal(review.practicalNextStepId,null);assert.deepEqual(view,before);
 const higher=recordedB6ReferenceReview(read([taken('a',75),taken('b',50)]),actor,reference())!;assert.match(higher.finding,/exceeds/);assert.equal(recordedB6ReferenceReview(read([taken('a',50),taken('b',25)]),actor,reference()),null,'Below a limit cannot clear incomplete exposure');
});
test('BIO-VALUE06/07/13: missing/foreign/old/unmatched reference or substituted scope cannot produce a personalized B6 comparison; revisions change the dependency token',()=>{
 const view=read([taken('a',75),taken('b',50)]),ref=reference();
 for(const patch of [{birthYear:null},{date:'2025-11-18'},{healthContext:{pregnancy:'unknown',safetyReviewed:true}},{healthContext:{pregnancy:'no',safetyReviewed:true,medications:['Synthetic medicine']}}])assert.equal(recordedB6ReferenceReview(view,actor,reference(patch)),null);
 for(const context of [null,{...ref,date:'2026-11-17'},{...ref,timeZone:'America/Regina'},{...ref,referenceVersion:'old'},{...ref,rows:ref.rows.map(row=>row.reference.kind==='UL'?{...row,reference:{...row.reference,amount:12}}:row)},{...ref,rows:ref.rows.filter(row=>row.reference.kind!=='UL')}])assert.equal(recordedB6ReferenceReview(view,actor,context),null);
 assert.throws(()=>recordedB6ReferenceReview(view,actor,{...ref,userId:'b'}),/SCOPE/);assert.throws(()=>recordedB6ReferenceReview(view,'b',ref),/SCOPE/);
 assert.notEqual(recordedB6ReferenceReview(view,actor,ref)!.sourceEpoch,recordedB6ReferenceReview(view,actor,{...ref,revision:'b'.repeat(64)})!.sourceEpoch);
 assert.equal(recordedB6ReferenceReview(read([taken('a',125)]),actor,ref),null,'This rule specifically requires an actual distinct-label overlap');
});
