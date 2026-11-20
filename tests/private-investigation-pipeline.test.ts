import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {PrecisionStorage} from '../server/precision-storage';
import {microbiomeSamples} from '../shared/schema';
import {collectPrivateInvestigationSnapshot} from '../server/biological-investigation-snapshot';
import {runPrivateInvestigation,type PrivateInvestigationEngine} from '../server/private-investigation-runner';
import {admitReviewedInvestigation,investigationCandidateDigest} from '../server/investigation-candidate-admission';
import {retrieveReviewedScientificEvidence} from '../server/scientific-evidence-retrieval';
import {scientificReleaseFixture} from './fixtures/scientific-release';

// Mechanical composition only. The fake engine/reviewer is deliberately not
// evidence of scientific usefulness, actual review or permission to release.
test('owned encrypted SQL → private investigation → explicit review admission invalidates on source and evidence withdrawal',async()=>{
 const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 const pg=new PGlite(),actor='synthetic-a';let permitted=true,calls=0;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users VALUES('synthetic-a','{}'),('synthetic-b','{}');");
  await pg.exec(readFileSync(new URL('../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8'));
  await pg.exec(`CREATE TABLE microbiome_samples(id varchar PRIMARY KEY,user_id varchar NOT NULL REFERENCES users(id),test_date timestamp NOT NULL,testing_company text,test_id text,raw_data_path text,structured_data jsonb,notes text,processing_status text NOT NULL,diversity_index real,uploaded_at timestamp NOT NULL);`);
  const db=drizzle(pg),precision=new PrecisionStorage(db as any),fixture=scientificReleaseFixture();
  for(const account of [actor,'synthetic-b']){
   await precision.insertPrecisionRecord(account,'lab',{marker:'ldl',value:3,unit:'mmol/L',measuredAt:'2026-10-01T00:00:00Z',laboratory:'Synthetic lab',method:'unknown',fasting:'unknown',referenceLow:null,referenceHigh:null,notes:''});
   await db.insert(microbiomeSamples).values({id:account+'-report',userId:account,testDate:new Date('2026-10-01T00:00:00Z'),uploadedAt:new Date('2026-10-02T00:00:00Z'),processingStatus:'completed',structuredData:{organisms:[{name:account+' synthetic organism',reported_status:'detected'}]}});
  }
  const store={getUser:async(id:string)=>({id}),getPrecisionContext:precision.getPrecisionContext.bind(precision),getPrecisionRecords:precision.getPrecisionRecords.bind(precision),getMeals:async()=>[],getExperienceRecords:async()=>[],getUserSamples:async(id:string)=>db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,id))} as any;
  const readSnapshot=()=>collectPrivateInvestigationSnapshot({actor,purpose:'personal-wellness',window:{date:'2026-11-19',timeZone:'UTC'},store,includeMicrobiome:true,authorize:async()=>permitted,now:()=>new Date(fixture.current.now)});
  const retrieveEvidence=async()=>retrieveReviewedScientificEvidence({registry:fixture.payload.registry,reviews:fixture.payload.reviews,withdrawals:fixture.current.withdrawals,query:{entityIds:['a']},now:fixture.current.now});
  const engine:PrivateInvestigationEngine={kind:'bloom-private-runtime',id:'synthetic-composition-only',promptVersion:'synthetic-v1',investigate:async({snapshot,evidence})=>{
   calls++;assert.equal(snapshot.externalTransferPermitted,false);assert.equal(JSON.stringify(snapshot).includes('synthetic-b'),false);
   assert.deepEqual(new Set(snapshot.facts.map(fact=>fact.domain)),new Set(['lab','microbiome']));
   const lab=snapshot.facts.find(fact=>fact.domain==='lab')!;
   return {numericClaims:[{id:'synthetic-source-number',operation:'source-value',observationIds:[lab.id],value:lab.amount,unit:lab.unit}],snapshotId:snapshot.snapshotId,sourceEpoch:snapshot.sourceEpoch,evidenceVersion:evidence.evidenceVersion,hypotheses:[{id:'synthetic-hypothesis',explanation:'Synthetic mechanical pipeline fixture without any personal biological conclusion.',observationIds:snapshot.facts.map(fact=>fact.id),supportingEvidenceIds:[],contradictingEvidenceIds:[evidence.cards[0].review.id],distinguishingObservations:['An unmeasured observation remains unavailable in this fixture.'],materialUnknowns:['Biological applicability is not established by this test.'],confidence:'unresolved'}],synthesis:{finding:'This synthetic pipeline fixture establishes no biological or clinical conclusion.',hypothesisIds:['synthetic-hypothesis'],abstention:false,limits:['Synthetic engine and review cannot authorize actual personal interpretation.']}};
  }};
  const input={actor,privateReasoningApproved:true,engine,authorize:async()=>permitted,readSnapshot,retrieveEvidence,timeoutMs:20_000};
  const result=await runPrivateInvestigation(input);assert.equal(result.status,'research-only-unverified','Synthetic pipeline result: '+result.status+('reason' in result?': '+result.reason:''));assert.equal(result.consumerInterpretation,null);
  assert.equal(calls,1);if(result.status!=='research-only-unverified')throw Error('Expected synthetic research candidate');
  const currentSnapshot=await readSnapshot(),evidence=await retrieveEvidence(),digest=investigationCandidateDigest(result.candidate);
  const current={accountScope:actor,purpose:'personal-wellness' as const,permitted:true,snapshotId:currentSnapshot.snapshotId,sourceEpoch:currentSnapshot.sourceEpoch,evidenceVersion:evidence.evidenceVersion,numericFacts:currentSnapshot.facts.filter(fact=>fact.domain==='lab'),observationIds:currentSnapshot.facts.map(fact=>fact.id),observationRefs:currentSnapshot.facts.map(fact=>({id:fact.id,sourceId:fact.sourceId,revision:fact.revision})),eligibleEvidenceIds:evidence.cards.map(card=>card.review.id)};
  const review={id:'synthetic-review',accountScope:actor,purpose:'personal-wellness',snapshotId:current.snapshotId,sourceEpoch:current.sourceEpoch,evidenceVersion:current.evidenceVersion,candidateDigest:digest,reviewerId:'synthetic-test-only',method:'independent-original-source-and-applicability-review',tier:'qualified-nonconsequential-explanation',disposition:'accepted-with-explicit-limits',coveredHypothesisIds:['synthetic-hypothesis'],verifiedEvidenceIds:current.eligibleEvidenceIds,contraryAndNullFindingsReviewed:true,exactFactsAndNumbersReviewed:true,harmsAndApplicabilityReviewed:true,validUntil:'2027-01-01T00:00:00Z'};
  const authority={accountScope:actor,purpose:'personal-wellness' as const,limitedExplanatoryRelease:true,approvedReviews:new Map<string,string>(),withdrawnReviews:new Set<string>(),now:fixture.current.now};
  const admission={actor,candidate:result.candidate,review,current,authority,observations:currentSnapshot.facts.map(fact=>({id:fact.id,sourceId:fact.sourceId,revision:fact.revision}))};
  assert.equal(admitReviewedInvestigation(admission),null,'Engine and review flags cannot self-approve');
  authority.approvedReviews.set(review.id,digest);const candidate=admitReviewedInvestigation(admission);assert.ok(candidate);assert.equal(candidate.practicalNextStepId,null);assert.equal(candidate.biologicalMeaning,null);assert.equal(candidate.observationRefs.length,2);
  assert.equal(admitReviewedInvestigation({...admission,actor:'synthetic-b'}),null);
  authority.withdrawnReviews.add(review.id);assert.equal(admitReviewedInvestigation(admission),null);authority.withdrawnReviews.clear();
  const original=engine.investigate;engine.investigate=async request=>{const output=await original(request);await db.delete(microbiomeSamples).where(eq(microbiomeSamples.userId,actor));return output;};
  const stale=await runPrivateInvestigation(input);assert.equal(stale.status,'abstain');assert.ok('reason' in stale&&stale.reason==='sources-changed','Deletion must be detected as a changed source, not hidden by an engine error');assert.equal(stale.consumerInterpretation,null);
  const changed=await readSnapshot();assert.notEqual(changed.sourceEpoch,current.sourceEpoch);
  assert.equal(admitReviewedInvestigation({...admission,current:{...current,snapshotId:changed.snapshotId,sourceEpoch:changed.sourceEpoch,observationIds:changed.facts.map(fact=>fact.id),observationRefs:changed.facts.map(fact=>({id:fact.id,sourceId:fact.sourceId,revision:fact.revision}))}}),null);
  assert.equal((await db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,'synthetic-b'))).length,1);
  (fixture.current.withdrawals.sourceIds as Set<string>).add('source');const before=calls;
  assert.equal((await runPrivateInvestigation(input)).status,'abstain');assert.equal(calls,before,'Withdrawn evidence never reaches engine');
  permitted=false;assert.equal((await runPrivateInvestigation(input)).status,'abstain');assert.equal(calls,before);
 }finally{await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});
