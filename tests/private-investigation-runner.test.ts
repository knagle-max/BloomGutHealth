import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runPrivateInvestigation,type PrivateInvestigationEngine} from '../server/private-investigation-runner';
import {scientificReleaseFixture} from './fixtures/scientific-release';
import {retrieveReviewedScientificEvidence} from '../server/scientific-evidence-retrieval';
import {collectPrivateInvestigationSnapshot} from '../server/biological-investigation-snapshot';
function setup(){
 const f=scientificReleaseFixture();let amount=3.5,allowed=true,evidenceWithdrawn=false,calls=0;
 const record=()=>({id:'lab',kind:'lab',createdAt:'2026-11-18T12:00:00Z',payload:{marker:'ldl',value:amount,unit:'mmol/L',measuredAt:'2026-11-18T12:00:00Z',laboratory:'Synthetic lab',method:'unknown',fasting:'unknown',referenceLow:null,referenceHigh:null,notes:''}});
 const store={getUser:async()=>({id:'a'}),getPrecisionContext:async()=>({}),getPrecisionRecords:async()=>[record()],getMeals:async()=>[],getExperienceRecords:async()=>[]} as any;
 const readSnapshot=()=>collectPrivateInvestigationSnapshot({actor:'a',purpose:'personal-wellness',window:{date:'2026-11-19',timeZone:'UTC'},store,authorize:async()=>allowed,now:()=>new Date('2026-11-19T12:00:00Z')});
 const retrieveEvidence=async()=>{
  if(evidenceWithdrawn)(f.current.withdrawals.sourceIds as Set<string>).add('source');
  return retrieveReviewedScientificEvidence({registry:f.payload.registry,reviews:f.payload.reviews,withdrawals:f.current.withdrawals,query:{entityIds:['a']},now:f.current.now});
 };
 const engine:PrivateInvestigationEngine={kind:'bloom-private-runtime',id:'synthetic-fixture-only',promptVersion:'fixture-v1',investigate:async({snapshot,evidence})=>{
  calls++;return{snapshotId:snapshot.snapshotId,sourceEpoch:snapshot.sourceEpoch,evidenceVersion:evidence.evidenceVersion,hypotheses:[{id:'unresolved',explanation:'Synthetic candidate requires independent source and applicability review.',observationIds:[snapshot.facts[0].id],supportingEvidenceIds:[],contradictingEvidenceIds:[evidence.cards[0].review.id],distinguishingObservations:['Relevant distinguishing observation has not been measured.'],materialUnknowns:['Individual applicability has not been established.'],confidence:'unresolved'}],synthesis:{finding:'No personal biological conclusion is established in this synthetic test.',hypothesisIds:['unresolved'],abstention:true,limits:['Synthetic model output is not independent scientific verification.']}};
 }};
 const input={actor:'a',privateReasoningApproved:true,engine,authorize:async()=>allowed,readSnapshot,retrieveEvidence};
 return{input,engine,get calls(){return calls;},setAmount:(value:number)=>{amount=value;},revoke:()=>{allowed=false;},withdraw:()=>{evidenceWithdrawn=true;}};
}
test('default unavailable/private approval missing preserves existing source review without invoking engine',async()=>{
 const f=setup();const result=await runPrivateInvestigation({...f.input,privateReasoningApproved:false});assert.equal(result.status,'abstain');assert.equal(result.consumerInterpretation,null);assert.equal(f.calls,0);
 assert.equal((await runPrivateInvestigation({...f.input,engine:undefined})).status,'abstain');
});
test('actual canonical source plus reviewed retrieval fixture yields only a research candidate, never consumer interpretation',async()=>{
 const f=setup(),result=await runPrivateInvestigation(f.input);assert.equal(result.status,'research-only-unverified');assert.equal(result.consumerInterpretation,null);assert.equal(f.calls,1);assert.equal(result.keepExistingSourceReview,true);
});
test('correction, permission revocation or evidence withdrawal during reasoning prevents stale candidate return',async()=>{
 for(const change of ['correction','permission','evidence']){
  const f=setup(),original=f.engine.investigate;f.engine.investigate=async request=>{const value=await original(request);if(change==='correction')f.setAmount(4);else if(change==='permission')f.revoke();else f.withdraw();return value;};
  const result=await runPrivateInvestigation(f.input);assert.equal(result.status,'abstain');assert.equal(result.consumerInterpretation,null);
 }
});
test('invented references and self-declared consumer approval do not leave research gate',async()=>{
 const f=setup();f.engine.investigate=async()=>({verified:true,releaseState:'feature-eligible',finding:'Invented clinical advice'});assert.equal((await runPrivateInvestigation(f.input)).status,'abstain');
});
test('deadline aborts slow source read before any engine invocation; late results cannot publish',async()=>{
 const f=setup(),original=f.input.readSnapshot;let release!:()=>void;
 const pending=new Promise<void>(resolve=>{release=resolve;});
 const result=await runPrivateInvestigation({...f.input,timeoutMs:10,readSnapshot:async()=>{await pending;return original();}});assert.equal(result.status,'abstain');assert.equal(f.calls,0);
 release();await new Promise(resolve=>setTimeout(resolve,25));assert.equal(f.calls,0);
});
test('engine failure and missing reviewed evidence keep fallback, with no private error leakage',async()=>{
 const f=setup();f.engine.investigate=async()=>{throw Error('PRIVATE FACTS MUST NOT LEAK');};const result=await runPrivateInvestigation(f.input);assert.equal(result.status,'abstain');assert.ok(!JSON.stringify(result).includes('PRIVATE FACTS'));
 const missing=setup();missing.withdraw();assert.equal((await runPrivateInvestigation(missing.input)).status,'abstain');assert.equal(missing.calls,0);
});
test('wrong account or public provider adapter cannot receive a private snapshot',async()=>{
 const f=setup();assert.equal((await runPrivateInvestigation({...f.input,actor:'b'})).status,'abstain');assert.equal(f.calls,0);
 assert.equal((await runPrivateInvestigation({...f.input,engine:{...f.engine,kind:'google-gemini'} as any})).status,'abstain');assert.equal(f.calls,0);
});
test('slow engine gets abort and cannot replace a completed deadline fallback',async()=>{
 const f=setup();let aborted=false,completed=false;
 f.engine.investigate=async({signal})=>{await new Promise(resolve=>setTimeout(resolve,40));aborted=signal.aborted;completed=true;return{finding:'late'};};
 const result=await runPrivateInvestigation({...f.input,timeoutMs:10});assert.equal(result.status,'abstain');assert.equal(result.consumerInterpretation,null);
 await new Promise(resolve=>setTimeout(resolve,60));assert.equal(completed,true);assert.equal(aborted,true);assert.equal(result.status,'abstain');
});
test('a CPU-blocked event loop cannot admit a valid engine result after its deadline',async()=>{
 const f=setup(),original=f.engine.investigate;
 f.engine.investigate=async request=>{const candidate=await original(request);const until=performance.now()+75;while(performance.now()<until){}return candidate;};
 const result=await runPrivateInvestigation({...f.input,timeoutMs:25});assert.equal(result.status,'abstain');assert.equal(result.consumerInterpretation,null);
});
