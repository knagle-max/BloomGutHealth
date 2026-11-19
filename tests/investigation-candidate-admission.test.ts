import {test} from 'node:test';
import assert from 'node:assert/strict';
import {admitReviewedInvestigation,investigationCandidateDigest} from '../server/investigation-candidate-admission';
function fixture(){
 const candidate={snapshotId:'snapshot',sourceEpoch:'epoch',evidenceVersion:'evidence-v1',hypotheses:[{id:'alternative',explanation:'Synthetic qualified explanation for a source-grounding fixture.',observationIds:['fact'],supportingEvidenceIds:['support'],contradictingEvidenceIds:['null'],distinguishingObservations:['An appropriate discriminating observation is not measured.'],materialUnknowns:['Individual causality remains unestablished.'],confidence:'tentative'}],synthesis:{finding:'A source-reviewed explanatory possibility remains conditional in this synthetic fixture.',hypothesisIds:['alternative'],abstention:false,limits:['No clinical action or causal conclusion is established.']}};
 const digest=investigationCandidateDigest(candidate);
 const review={id:'review',accountScope:'a',purpose:'personal-wellness',snapshotId:'snapshot',sourceEpoch:'epoch',evidenceVersion:'evidence-v1',candidateDigest:digest,reviewerId:'synthetic-only',method:'independent-original-source-and-applicability-review',tier:'qualified-nonconsequential-explanation',disposition:'accepted-with-explicit-limits',coveredHypothesisIds:['alternative'],verifiedEvidenceIds:['support','null'],contraryAndNullFindingsReviewed:true,exactFactsAndNumbersReviewed:true,harmsAndApplicabilityReviewed:true,validUntil:'2027-01-01T00:00:00Z'};
 const current={accountScope:'a',purpose:'personal-wellness' as const,permitted:true,snapshotId:'snapshot',sourceEpoch:'epoch',evidenceVersion:'evidence-v1',observationIds:['fact'],eligibleEvidenceIds:['support','null']};
 const authority={accountScope:'a',purpose:'personal-wellness' as const,limitedExplanatoryRelease:true,approvedReviews:new Map([['review',digest]]),withdrawnReviews:new Set<string>(),now:Date.parse('2026-11-19T12:00:00Z')};
 return {actor:'a',candidate,review,current,authority,observations:[{id:'fact',sourceId:'canonical-source',revision:'source-revision',date:'2026-11-18'}]};
}
test('independently approved fixture adapts to existing candidate with original source refs/limits and no invented action',()=>{
 const f=fixture(),result=admitReviewedInvestigation(f);assert.ok(result);assert.equal(result.practicalNextStepId,null);assert.equal(result.applicability,'conditional');assert.deepEqual(result.observationRefs,[{sourceId:'canonical-source',revision:'source-revision',date:'2026-11-18'}]);assert.ok(result.materialUnknowns.includes('Individual causality remains unestablished.'));assert.equal(result.finding,f.candidate.synthesis.finding);
});
test('model/client review flags cannot self-authorize a consumer conclusion',()=>{
 const f=fixture();f.authority.approvedReviews.clear();assert.equal(admitReviewedInvestigation(f),null);
 const g=fixture();g.authority.limitedExplanatoryRelease=false;assert.equal(admitReviewedInvestigation(g),null);
});
test('account, permission, source/evidence corrections and withdrawn/expired reviews invalidate old finding',()=>{
 for(const change of ['account','permission','source','evidence','withdrawn','expired']){
  const f=fixture();if(change==='account')f.actor='b';else if(change==='permission')f.current.permitted=false;else if(change==='source')f.current.sourceEpoch='new';else if(change==='evidence')f.current.evidenceVersion='new';else if(change==='withdrawn')f.authority.withdrawnReviews.add('review');else f.review.validUntil='2026-11-18T00:00:00Z';assert.equal(admitReviewedInvestigation(f),null);
 }
});
test('editing a sentence, dropping contrary review or changing review class cannot reuse authority',()=>{
 const f=fixture();f.candidate.synthesis.finding='A newly fabricated clinical conclusion cannot inherit approval.';assert.equal(admitReviewedInvestigation(f),null);
 const g=fixture();g.review.verifiedEvidenceIds=['support'];assert.equal(admitReviewedInvestigation(g),null);
 const h=fixture();h.review.method='model-agreement';assert.equal(admitReviewedInvestigation(h),null);
});
test('missing source revisions, unknown or duplicate observations and explicit abstention cannot become a main insight',()=>{
 const f=fixture();f.observations=[];assert.equal(admitReviewedInvestigation(f),null);
 const blank=fixture();blank.observations[0].revision='';assert.equal(admitReviewedInvestigation(blank),null);
 const date=fixture();date.observations[0].date='2026-02-30';assert.equal(admitReviewedInvestigation(date),null);
 const g=fixture();g.observations.push({...g.observations[0]});assert.equal(admitReviewedInvestigation(g),null);
 const h=fixture();h.candidate.synthesis.abstention=true;assert.equal(admitReviewedInvestigation(h),null);
});
