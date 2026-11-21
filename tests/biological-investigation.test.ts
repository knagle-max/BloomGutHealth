import assert from 'node:assert/strict';
import { test } from 'node:test';
import { groundInvestigationCandidate, type InvestigationGroundingContext } from '../shared/biological-investigation';
const context:InvestigationGroundingContext={accountScope:'a',purpose:'personal-wellness',permitted:true,snapshotId:'snapshot',sourceEpoch:'epoch',evidenceVersion:'evidence-v1',observationIds:['fact'],eligibleEvidenceIds:['support','null']};
function candidate() { return {snapshotId:'snapshot',sourceEpoch:'epoch',evidenceVersion:'evidence-v1',hypotheses:[{id:'alternative',explanation:'A candidate mechanism requires further independent verification.',observationIds:['fact'],supportingEvidenceIds:['support'],contradictingEvidenceIds:['null'],distinguishingObservations:['Measure the actual discriminating endpoint.'],materialUnknowns:['Individual applicability remains unknown.'],confidence:'tentative'}],synthesis:{finding:'The alternatives remain unresolved with available evidence.',hypothesisIds:['alternative'],abstention:true,limits:['Source relevance has not been independently established.']}}; }
test('genuine opposing references remain visible but a grounded candidate is not scientific verification',()=>{
 const result=groundInvestigationCandidate(candidate(),'a',context);
 assert.equal(result.state,'research-only-unverified');
 assert.ok(!('releaseState' in result));
 if(result.state==='research-only-unverified') assert.deepEqual(result.candidate.hypotheses[0].contradictingEvidenceIds,['null']);
});
test('wrong account and revoked permission never replay a prior candidate',()=>{
 assert.deepEqual(groundInvestigationCandidate(candidate(),'b',context),{state:'abstain',reason:'permission'});
 assert.deepEqual(groundInvestigationCandidate(candidate(),'a',{...context,permitted:false}),{state:'abstain',reason:'permission'});
});
test('source correction, evidence withdrawal and snapshot replacement invalidate old work',()=>{
 for(const change of [{sourceEpoch:'new'},{evidenceVersion:'new'},{snapshotId:'new'}]) assert.equal(groundInvestigationCandidate(candidate(),'a',{...context,...change}).state,'abstain');
 assert.deepEqual(groundInvestigationCandidate(candidate(),'a',{...context,eligibleEvidenceIds:['support']}),{state:'abstain',reason:'unresolved-reference'});
});
test('fabricated facts/citations, duplicate hypotheses and contradictory citation roles are rejected',()=>{
 const fakeFact=candidate(); fakeFact.hypotheses[0].observationIds=['fake'];
 const fakeStudy=candidate(); fakeStudy.hypotheses[0].supportingEvidenceIds=['invented'];
 const duplicate=candidate(); duplicate.hypotheses.push({...duplicate.hypotheses[0]});
 const badDirection=candidate(); badDirection.hypotheses[0].contradictingEvidenceIds=['support'];
 for(const value of [fakeFact,fakeStudy,duplicate,badDirection]) assert.equal(groundInvestigationCandidate(value,'a',context).state,'abstain');
});
test('model cannot assign verification, clinical actions, probabilities or consumer release',()=>{
 for(const extra of [{releaseState:'feature-eligible'},{verified:true},{action:'change medication'},{probability:0.98}]) assert.deepEqual(groundInvestigationCandidate({...candidate(),...extra},'a',context),{state:'abstain',reason:'invalid-contract'});
});
test('no supported hypothesis may honestly abstain; dangling or empty positive synthesis cannot pass',()=>{
 const value=candidate(); value.hypotheses=[]; value.synthesis.hypothesisIds=[];
 assert.equal(groundInvestigationCandidate(value,'a',context).state,'research-only-unverified');
 value.synthesis.abstention=false; assert.equal(groundInvestigationCandidate(value,'a',context).state,'abstain');
});
