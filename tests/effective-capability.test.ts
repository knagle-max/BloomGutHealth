import test from 'node:test';
import assert from 'node:assert/strict';
import {effectiveCapabilityDecision,type EffectiveCapabilityFacts,type RegisteredCapability} from '../server/effective-capability';
import {restrictedCapabilityAllowed} from '../server/capability-policy';
const featureId='bloom.food.meal_logging',now=Date.parse('2026-10-25T00:00:00Z'),materialDigest='a'.repeat(64);
const source:RegisteredCapability={id:featureId,category:'GENERAL_RELEASE',approval:'APPROVED',publicEnabled:true};
// Deliberately synthetic independently approved facts; no real repository/installer.
const lookup=(id:string)=>id===featureId?structuredClone(source):null;
function fixture():EffectiveCapabilityFacts{
 const scope=()=>({territories:['CA'],populations:['adult'],purposes:['wellness']});
 return {featureId,now,deployment:{serviceId:'srv-syntheticreview',environment:'isolated-synthetic',materialDigest,requiredReviews:['LEGAL','SECURITY'],highConsequence:false,requireDistinctReviewers:true,consentPurpose:'optional-text-ai'},implementation:{readiness:'VERIFIED',materialDigest,verificationReference:'synthetic-test-evidence'},review:{id:'synthetic-review',featureId,status:'APPROVED',serviceId:'srv-syntheticreview',environment:'isolated-synthetic',materialDigest,validFrom:'2026-10-24T00:00:00Z',expiresAt:'2026-10-26T00:00:00Z',scope:scope(),maximumRolloutPercent:100,rolloutKeyId:'fixture-key',cohorts:[{id:'pilot-v1',accountIds:null}],evidence:[{role:'LEGAL',reviewerId:'legal-reviewer',reference:'synthetic-legal',status:'APPROVED',materialDigest,validFrom:'2026-10-24T00:00:00Z',expiresAt:'2026-10-26T00:00:00Z'},{role:'SECURITY',reviewerId:'security-reviewer',reference:'synthetic-security',status:'APPROVED',materialDigest,validFrom:'2026-10-24T00:00:00Z',expiresAt:'2026-10-26T00:00:00Z'}]},control:{featureId,revision:1,state:'enabled',serviceId:'srv-syntheticreview',environment:'isolated-synthetic',materialDigest,reviewId:'synthetic-review',scope:scope(),rolloutPercent:100,cohortId:'pilot-v1',changedBy:'synthetic-operator',expiresAt:'2026-10-25T12:00:00Z'},subject:{accountId:'subject-0',territory:'CA',population:'adult',populationVerified:true,purpose:'wellness',consent:{purpose:'optional-text-ai',granted:true,expiresAt:'2026-10-25T12:00:00Z'}},rolloutKey:{id:'fixture-key',secret:'synthetic-rollout-key-for-tests-only-0001'}};
}
test('canonical source is authoritative: unknown/research/incident and client flag overrides deny; approved flags alone cannot activate execution',()=>{
 assert.deepEqual(effectiveCapabilityDecision({featureId:'bloom.unknown',now}),{allowed:false,reason:'UNKNOWN_FEATURE'});
 assert.deepEqual(effectiveCapabilityDecision({featureId:'bloom.metabolite.scores',now}),{allowed:false,reason:'INCIDENT_DISABLED'});
 assert.deepEqual(effectiveCapabilityDecision({featureId:'bloom.microbiome.flux',now}),{allowed:false,reason:'RESEARCH_ISOLATION'});
 assert.deepEqual(effectiveCapabilityDecision(fixture()),{allowed:false,reason:'SOURCE_APPROVAL_REQUIRED'});
 assert.deepEqual(effectiveCapabilityDecision({...fixture(),source},lookup),{allowed:false,reason:'INVALID_CONTEXT'});
 assert.deepEqual(effectiveCapabilityDecision({featureId,now},lookup),{allowed:false,reason:'EXECUTION_UNCONFIGURED'});
 assert.equal(restrictedCapabilityAllowed(featureId),false);
 assert.deepEqual(effectiveCapabilityDecision(fixture(),()=>{throw Error('private-source-failure');}),{allowed:false,reason:'INVALID_CONTEXT'});
 assert.deepEqual(effectiveCapabilityDecision(fixture(),()=>({...source,id:'bloom.other'})),{allowed:false,reason:'UNKNOWN_FEATURE'});
 for(const id of ['bloom.metabolite.scores','bloom.microbiome.flux']){
  const input=fixture();input.featureId=id;input.review!.featureId=id;input.control!.featureId=id;
  assert.equal(effectiveCapabilityDecision(input,featureId=>({...source,id:featureId})).allowed,false,'A trusted approval adapter cannot reclassify a canonical incident/research feature');
 }
 const unknown=fixture();unknown.featureId='bloom.unregistered';assert.equal(effectiveCapabilityDecision(unknown,id=>({...source,id})).allowed,false);
});
test('effective execution needs independently scoped version/currentness/quorum/consent and cannot self-approve or widen deployment, audience or percentage',()=>{
 assert.deepEqual(effectiveCapabilityDecision(fixture(),lookup),{allowed:true,reason:null});
 const cases:Array<[string,(facts:any)=>void,string]>=[
  ['missing facts',p=>p.control=null,'EXECUTION_UNCONFIGURED'],
  ['unfinished',p=>p.implementation.readiness='FUNCTIONALLY_COMPLETE','IMPLEMENTATION_UNVERIFIED'],
  ['changed implementation',p=>p.implementation.materialDigest='b'.repeat(64),'IMPLEMENTATION_UNVERIFIED'],
  ['old review digest',p=>p.review.materialDigest='b'.repeat(64),'REVIEW_VERSION_MISMATCH'],
  ['other service',p=>p.deployment.serviceId='srv-other','REVIEW_VERSION_MISMATCH'],
  ['other environment',p=>p.review.environment='production','REVIEW_VERSION_MISMATCH'],
  ['expired review',p=>p.review.expiresAt='2026-10-25T00:00:00Z','REVIEW_INVALID'],
  ['future review',p=>p.review.validFrom='2026-10-25T01:00:00Z','REVIEW_INVALID'],
  ['unapproved review',p=>p.review.status='UNDER_REVIEW','REVIEW_INVALID'],
  ['licence review missing',p=>p.deployment.requiredReviews.push('DATA_RIGHTS'),'REVIEW_QUORUM_REQUIRED'],
  ['duplicate roles',p=>p.review.evidence[1].role='LEGAL','REVIEW_QUORUM_REQUIRED'],
  ['one reviewer',p=>p.review.evidence[1].reviewerId='legal-reviewer','REVIEW_QUORUM_REQUIRED'],
  ['expired individual review',p=>p.review.evidence[0].expiresAt='2026-10-25T00:00:00Z','REVIEW_EVIDENCE_INVALID'],
  ['superseded individual review',p=>p.review.evidence[0].materialDigest='b'.repeat(64),'REVIEW_EVIDENCE_INVALID'],
  ['suspended individual review',p=>p.review.evidence[0].status='SUSPENDED','REVIEW_EVIDENCE_INVALID'],
  ['control outlives individual review',p=>p.review.evidence[0].expiresAt='2026-10-25T01:00:00Z','ACTIVATION_SCOPE_INVALID'],
  ['self approval',p=>p.control.changedBy='legal-reviewer','SELF_APPROVAL'],
  ['paused',p=>p.control.state='paused','ACTIVATION_OFF'],
  ['incident control',p=>p.control.state='incident-disabled','ACTIVATION_OFF'],
  ['wrong approval',p=>p.control.reviewId='unrelated-review','ACTIVATION_SCOPE_INVALID'],
  ['wrong feature',p=>p.control.featureId='bloom.other','ACTIVATION_SCOPE_INVALID'],
  ['stale control',p=>p.control.materialDigest='b'.repeat(64),'ACTIVATION_SCOPE_INVALID'],
  ['expired control',p=>p.control.expiresAt='2026-10-25T00:00:00Z','ACTIVATION_SCOPE_INVALID'],
  ['outlives approval',p=>p.control.expiresAt='2026-10-27T00:00:00Z','ACTIVATION_SCOPE_INVALID'],
  ['wider territory',p=>p.control.scope.territories.push('US'),'ACTIVATION_SCOPE_INVALID'],
  ['larger percentage',p=>p.review.maximumRolloutPercent=10,'ACTIVATION_SCOPE_INVALID'],
  ['foreign subject',p=>p.subject.territory='US','SUBJECT_SCOPE_REQUIRED'],
  ['unverified population',p=>p.subject.populationVerified=false,'SUBJECT_SCOPE_REQUIRED'],
  ['unknown population',p=>{p.subject.population='unknown';p.review.scope.populations=['unknown'];p.control.scope.populations=['unknown'];},'SUBJECT_SCOPE_REQUIRED'],
  ['no consent',p=>p.subject.consent=null,'CONSENT_REQUIRED'],
  ['revoked consent',p=>p.subject.consent.granted=false,'CONSENT_REQUIRED'],
  ['wrong consent purpose',p=>p.subject.consent.purpose='unrelated-purpose','CONSENT_REQUIRED'],
  ['expired consent',p=>p.subject.consent.expiresAt='2026-10-25T00:00:00Z','CONSENT_REQUIRED'],
  ['high-consequence quorum missing',p=>{p.deployment.highConsequence=true;p.subject.purpose='clinical';p.control.scope.purposes=['clinical'];p.review.scope.purposes=['clinical'];},'REVIEW_QUORUM_REQUIRED'],
  ['unapproved cohort',p=>p.control.cohortId='other-cohort','ROLLOUT_NOT_INCLUDED'],
  ['cohort membership',p=>p.review.cohorts[0].accountIds=['other-account'],'ROLLOUT_NOT_INCLUDED'],
  ['key rotation unreviewed',p=>p.rolloutKey.id='other-key','ACTIVATION_SCOPE_INVALID'],
  ['forged control flags',p=>p.control.approved=true,'INVALID_CONTEXT'],
 ];
 for(const [name,mutate,reason] of cases){const input=fixture();mutate(input);const result=effectiveCapabilityDecision(input,lookup);assert.deepEqual(result,{allowed:false,reason},name);assert.doesNotMatch(JSON.stringify(result),/subject-0|fixture-key|synthetic-rollout-key|legal-reviewer/);}
 for(const category of ['DISABLED_INCIDENT','INTERNAL_RESEARCH_ONLY'])assert.equal(effectiveCapabilityDecision(fixture(),id=>({...source,id,category})).allowed,false);
});
test('rollout uses stable independent HMAC vectors, remains monotone across percent/revision changes and supports an explicit account cohort',()=>{
 // Golden vectors independently calculated with Python hmac/sha256, first 32 bits modulo 10000.
 const subjects=[0,1,2,3,4,7],expected50=[false,true,false,false,true,true],expected10=[false,false,false,false,false,true];
 for(let index=0;index<subjects.length;index++){
  const input=fixture();input.subject!.accountId='subject-'+subjects[index];input.control!.rolloutPercent=50;
  assert.equal(effectiveCapabilityDecision(input,lookup).allowed,expected50[index]);
  input.control!.revision=987;input.control!.changedBy='other-operator';input.control!.expiresAt='2026-10-25T10:00:00Z';
  assert.equal(effectiveCapabilityDecision(structuredClone(input),lookup).allowed,expected50[index]);
  input.control!.rolloutPercent=10;assert.equal(effectiveCapabilityDecision(input,lookup).allowed,expected10[index]);
  input.control!.rolloutPercent=0;assert.equal(effectiveCapabilityDecision(input,lookup).allowed,false);
  input.control!.rolloutPercent=100;assert.equal(effectiveCapabilityDecision(input,lookup).allowed,true);
 }
 const targeted=fixture();targeted.review!.cohorts[0].accountIds=['subject-0'];
 assert.equal(effectiveCapabilityDecision(targeted,lookup).allowed,true);targeted.subject!.accountId='other-subject';assert.equal(effectiveCapabilityDecision(targeted,lookup).allowed,false);
});
