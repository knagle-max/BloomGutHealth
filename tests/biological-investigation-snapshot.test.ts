import assert from 'node:assert/strict';
import { test } from 'node:test';
import { collectPrivateInvestigationSnapshot, InvestigationSnapshotUnavailable } from '../server/biological-investigation-snapshot';
import { captureNutrientSource } from '../shared/nutrient-source-snapshot';
import { groundInvestigationCandidate } from '../shared/biological-investigation';
const now=()=>new Date('2026-11-19T12:00:00Z');
const window={date:'2026-11-19',timeZone:'UTC'};
function lab(id='lab',value=3.5){return {id,kind:'lab',createdAt:now(),payload:{marker:'ldl',value,unit:'mmol/L',measuredAt:'2026-11-18T12:00:00Z',laboratory:'Source lab',method:'unknown',fasting:'unknown',referenceLow:null,referenceHigh:null,notes:'Private note not to include'}};}
function setup(){
 const data={user:{id:'a'},context:{},records:[lab()],meals:[] as any[],supplements:[] as any[]};
 const calls:string[]=[];
 const store={getUser:async(actor:string)=>{calls.push(actor);return data.user;},getPrecisionContext:async()=>data.context,getPrecisionRecords:async()=>data.records,getMeals:async()=>data.meals,getExperienceRecords:async()=>data.supplements} as any;
 const read=(authorize=async()=>true)=>collectPrivateInvestigationSnapshot({actor:'a',purpose:'personal-wellness',window,store,authorize,now});
 return {data,calls,read,store};
}
test('canonical source collector retains exact lab facts but no private notes, invented intake, biology or external permission',async()=>{
 const fixture=setup(),result=await fixture.read();
 assert.equal(result.facts.length,1);assert.equal(result.facts[0].amount,3.5);
 assert.equal(result.externalTransferPermitted,false);assert.equal(result.intakeEvents.length,0);
 assert.equal(result.missing.intakeCoverage,'partial-or-unknown');assert.equal(result.missing.genetics,'not-collected');
 assert.ok(!JSON.stringify(result).includes('Private note'));
 assert.deepEqual(fixture.calls,['a','a']);
 const later=await collectPrivateInvestigationSnapshot({actor:'a',purpose:'personal-wellness',window,store:fixture.store,authorize:async()=>true,now:()=>new Date('2026-11-19T12:01:00Z')});
 assert.equal(result.sourceEpoch,later.sourceEpoch);assert.notEqual(result.asOf,later.asOf);
});
test('authorization before reads and revocation during reads fail closed; a foreign profile or meal never enters snapshot',async()=>{
 const fixture=setup();await assert.rejects(fixture.read(async()=>false),InvestigationSnapshotUnavailable);assert.deepEqual(fixture.calls,[]);
 let count=0;await assert.rejects(fixture.read(async()=>++count===1),InvestigationSnapshotUnavailable);
 fixture.data.user.id='b';await assert.rejects(fixture.read(),InvestigationSnapshotUnavailable);
 fixture.data.user.id='a';fixture.data.meals.push({id:'foreign',userId:'b',mealText:'foreign food',loggedAt:now()});await assert.rejects(fixture.read());
});
test('correction and deletion change epoch so an old candidate cannot be replayed',async()=>{
 const fixture=setup(),original=await fixture.read();
 fixture.data.records=[lab('lab',4)];const corrected=await fixture.read();
 assert.notEqual(corrected.sourceEpoch,original.sourceEpoch);
 const candidate={snapshotId:original.snapshotId,sourceEpoch:original.sourceEpoch,evidenceVersion:'v1',hypotheses:[],synthesis:{finding:'No verified interpretation is established from these observations.',hypothesisIds:[],abstention:true,limits:['Scientific interpretation has not been verified.']}};
 assert.deepEqual(groundInvestigationCandidate(candidate,'a',{accountScope:'a',purpose:'personal-wellness',permitted:true,...corrected,evidenceVersion:'v1',observationIds:corrected.facts.map(f=>f.id),eligibleEvidenceIds:[]}),{state:'abstain',reason:'stale-snapshot'});
 fixture.data.records=[];const removed=await fixture.read();assert.equal(removed.facts.length,0);assert.notEqual(removed.sourceEpoch,corrected.sourceEpoch);
});
test('recorded food time is never ingestion time; unknown source events remain represented',async()=>{
 const fixture=setup();fixture.data.meals=[{id:'meal',userId:'a',mealText:'Synthetic meal',loggedAt:now(),intelligence:null}];
 const unknown=await fixture.read();assert.equal(unknown.intakeEvents.length,1);assert.equal(unknown.intakeEvents[0].dateBasis,'food-record-time');assert.equal(unknown.intakeEvents[0].sourceStatus,'unavailable');
 fixture.data.meals[0].intelligence={nutrientSourceSnapshots:[captureNutrientSource({sourceId:'fdc:999',sourceVersion:'Synthetic',sourceUrl:'https://fdc.nal.usda.gov/food-details/999/nutrients',ingredient:'Synthetic food',grams:200,per100g:{'1003':10}})]};
 const known=await fixture.read();const protein=known.facts.find(f=>'nutrientKey'in f&&f.nutrientKey==='protein_g');assert.equal(protein?.amount,20);assert.equal(protein?.dateBasis,'food-record-time');assert.notEqual(known.sourceEpoch,unknown.sourceEpoch);
});
test('pending units are not eligible computation, unsupported/future records do not become measured facts',async()=>{
 const fixture=setup();(fixture.data.records[0].payload as any).unitReview={status:'pending',originalValue:3.5,originalUnit:null,originalText:'3.5',suggestedUnit:'mmol/L',confirmedAt:null,supersedes:null} as any;
 const pending=await fixture.read();assert.equal((pending.facts[0] as any).computationEligible,false);
 fixture.data.records=[lab()];const future=await collectPrivateInvestigationSnapshot({actor:'a',purpose:'personal-wellness',window:{date:'2026-11-17',timeZone:'UTC'},store:fixture.store,authorize:async()=>true,now:()=>new Date('2026-11-17T12:00:00Z')});assert.equal(future.facts.length,0);assert.equal(future.missing.futureLabs,1);
 fixture.data.records[0].payload.unit='wrong unit';const unsupported=await fixture.read();assert.equal(unsupported.facts.length,0);assert.equal(unsupported.missing.unsupportedLabs,1);
});
test('duplicate lab identities and invalid windows refuse an ambiguous snapshot',async()=>{
 const fixture=setup();fixture.data.records.push(lab());await assert.rejects(fixture.read(),InvestigationSnapshotUnavailable);
 await assert.rejects(collectPrivateInvestigationSnapshot({actor:'a',purpose:'personal-wellness',window:{date:'2026-02-30',timeZone:'UTC'},store:fixture.store,authorize:async()=>true,now}),InvestigationSnapshotUnavailable);
});

test('source-only correction suppresses superseded supported record without creating a new numeric observation',async()=>{
 const fixture=setup();
 fixture.data.records.push({id:'correction',kind:'lab',createdAt:now(),payload:{sourceOnly:true,reportedAnalyte:'Unidentified analyte',reportedValue:'3.5',reportedUnit:'mmol/L',measuredAt:'2026-11-18T12:00:00Z',laboratory:'Source lab',method:'unknown',fasting:'unknown',sourceInput:{text:'Unidentified analyte 3.5 mmol/L',number:'3.5',suppliedUnit:'mmol/L',capture:'manual-report'},sourceCorrection:{version:1,supersedes:'lab',previousRevision:'a'.repeat(64),reviewedAt:'2026-11-19T10:00:00Z',reason:'Correct assay identity',requestFingerprint:'b'.repeat(64),original:{kind:'supported',reportedAnalyte:'LDL',reportedValue:'3.5',reportedUnit:'mmol/L',reportedReferenceInterval:null,referenceLow:null,referenceHigh:null,method:'unknown'}}} as any});
 const result=await fixture.read();assert.equal(result.facts.length,0);assert.equal(result.missing.sourceOnlyLabs,1);
});
test('different vitamin D assay cannot become eligible vitamin D status computation',async()=>{
 const fixture=setup();fixture.data.records[0].payload={...fixture.data.records[0].payload,marker:'vitamin_d',unit:'nmol/L',method:'1,25-dihydroxy vitamin D'};
 const result=await fixture.read();assert.equal(result.facts.length,1);assert.equal((result.facts[0] as any).computationEligible,false);
});

test('a source changing during collection refuses the mixed snapshot',async()=>{
 const fixture=setup();let reads=0;const original=fixture.store.getPrecisionRecords;
 fixture.store.getPrecisionRecords=async()=>{reads++;return reads===1?await original():[lab('changed',4)];};
 await assert.rejects(fixture.read(),InvestigationSnapshotUnavailable);assert.equal(reads,2);
});
