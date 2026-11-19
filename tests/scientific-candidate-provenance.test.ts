import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildScientificCandidateProvenance,prepareScientificCandidateProvenance,verifyScientificCandidateProvenance,scientificCandidateDigest,type CandidateRetentionAuthority} from '../server/scientific-candidate-provenance';
import {publicResearchTaskDigest,type ReviewedPublicResearchTask} from '../server/scientific-question-boundary';
import {geminiScienceSourceSetDigest} from '../server/gemini-science-research';

import {scientificCandidateFixture as fixture} from './fixtures/scientific-candidate';

test('approved nonpersonal retention produces deterministic source receipt without questions, excerpts or model prose',()=>{
 const f=fixture(),first=buildScientificCandidateProvenance(f.result,f.authority);
 assert.deepEqual(buildScientificCandidateProvenance(structuredClone(f.result),f.authority),first);
 assert.deepEqual(verifyScientificCandidateProvenance(first,f.authority),first);
 const text=JSON.stringify(first);
 for(const raw of [f.request.question,f.request.sources[0].excerpt,f.result.claims.hypotheses[0].claim])assert.equal(text.includes(raw),false);
 assert.equal(first.payload.sourceTruthVerified,false);assert.equal(first.payload.knowledgePromotionPermitted,false);
 assert.equal(first.payload.modelTrainingPermitted,false);assert.equal(first.payload.clinicalReleasePermitted,false);
 assert.equal(first.payload.reportedUsage.outputTokens,null);
});
test('receipt tampering and self-rehashed provider metadata are not approved by a raw candidate digest',()=>{
 const f=fixture(),receipt=buildScientificCandidateProvenance(f.result,f.authority);
 receipt.payload.generatedCounts.hypotheses=2;
 assert.throws(()=>verifyScientificCandidateProvenance(receipt,f.authority));
 receipt.id=createHash('sha256').update(JSON.stringify(receipt.payload)).digest('hex');
 assert.throws(()=>verifyScientificCandidateProvenance(receipt,f.authority));
 (f.authority.approvedCandidateReceiptDigests as Set<string>).add(scientificCandidateDigest(f.result));
 assert.throws(()=>verifyScientificCandidateProvenance(receipt,f.authority));
});
test('receipt reuse requires current retention/source authority and cannot carry raw prose',()=>{
 const f=fixture(),receipt=buildScientificCandidateProvenance(f.result,f.authority);
 f.authority.revision='synthetic-authority-v2';
 assert.deepEqual(verifyScientificCandidateProvenance(receipt,f.authority),receipt);
 assert.throws(()=>verifyScientificCandidateProvenance({...receipt,payload:{...receipt.payload,question:f.request.question}},f.authority));
 (f.authority.withdrawals.sourceIds as Set<string>).add('synthetic-public-source');
 assert.throws(()=>verifyScientificCandidateProvenance(receipt,f.authority));
 (f.authority.withdrawals.sourceIds as Set<string>).clear();
 (f.authority.approvedCandidateReceiptDigests as Set<string>).clear();
 assert.throws(()=>verifyScientificCandidateProvenance(receipt,f.authority));
});
test('outbound task approval cannot self-approve generated candidate retention',()=>{
 const f=fixture();(f.authority.approvedCandidateReceiptDigests as Set<string>).clear();
 assert.throws(()=>buildScientificCandidateProvenance(f.result,f.authority));
 assert.throws(()=>buildScientificCandidateProvenance({...f.result,approvedForRetention:true},f.authority));
});
test('changed output, source set, question, provenance or unknown citation is refused',()=>{
 for(const change of [
  (f:ReturnType<typeof fixture>)=>{f.result.claims.hypotheses[0].claim='Different generated unverified statement.';},
  (f:ReturnType<typeof fixture>)=>{f.result.sourceSetSha256='0'.repeat(64);},
  (f:ReturnType<typeof fixture>)=>{f.result.claims.question='A different broadly public question entirely.';},
  (f:ReturnType<typeof fixture>)=>{f.result.claims.hypotheses[0].evidenceSourceIds=['unknown-source'];},
 ]){
  const f=fixture();change(f);
  assert.throws(()=>buildScientificCandidateProvenance(f.result,f.authority));
  (f.authority.approvedCandidateReceiptDigests as Set<string>).add(scientificCandidateDigest(f.result));
  if(f.result.claims.hypotheses[0].claim.startsWith('Different'))continue;
  assert.throws(()=>buildScientificCandidateProvenance(f.result,f.authority));
 }
});
test('current catalog expiry, mutation, source/review/rights withdrawal and retention revocation fail closed',()=>{
 for(const change of [
  (f:ReturnType<typeof fixture>)=>{f.task.review.validUntil='2020-01-01T00:00:00Z';},
  (f:ReturnType<typeof fixture>)=>{f.task.request.sources[0].excerpt='Changed source content without a new review.';},
  (f:ReturnType<typeof fixture>)=>{f.task.review.withdrawn=true;},
  (f:ReturnType<typeof fixture>)=>{(f.authority.withdrawals.sourceIds as Set<string>).add('synthetic-public-source');},
  (f:ReturnType<typeof fixture>)=>{(f.authority.withdrawals.reviewIds as Set<string>).add('synthetic-task-review');},
  (f:ReturnType<typeof fixture>)=>{(f.authority.withdrawals.rightsIds as Set<string>).add('synthetic-task-review');},
 ]){const f=fixture();change(f);assert.throws(()=>buildScientificCandidateProvenance(f.result,f.authority));}
});
test('account/PHI containers, transcripts, unknown provider/model and malformed usage cannot enter receipt fields',()=>{
 const f=fixture();
 for(const changed of [{...f.result,userId:'synthetic-account'}, {...f.result,transcript:'synthetic unrelated text'},
  {...f.result,provider:'other-provider'},{...f.result,model:'unreviewed-model'},
  {...f.result,usage:{inputTokens:-1,outputTokens:0}}])assert.throws(()=>scientificCandidateDigest(changed));
});
