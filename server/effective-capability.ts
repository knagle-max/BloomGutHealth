import {createHmac} from 'node:crypto';
import {z} from 'zod';
import registry from '../docs/architecture/LEGAL_PROVISIONAL_FEATURE_REGISTRY_2026-10-24.json';
import {normalizeCapabilityApproval} from '../shared/capability-state';

const id=z.string().regex(/^[A-Za-z0-9_.:/-]{1,120}$/),digest=z.string().regex(/^[a-f0-9]{64}$/),date=z.string().datetime({offset:true});
const environment=z.enum(['development-review','isolated-synthetic','production']);
const scope=z.object({territories:z.array(z.string().regex(/^[A-Z]{2}$/)).min(1).max(100),populations:z.array(id).min(1).max(100),purposes:z.array(id).min(1).max(100)}).strict();
const reviewRole=z.enum(['LEGAL','SECURITY','SCIENCE','DATA_RIGHTS']);
const sourceSchema=z.object({id,category:z.enum(['GENERAL_RELEASE','HIDDEN_PENDING_APPROVAL','INTERNAL_RESEARCH_ONLY','DISABLED_INCIDENT']),approval:z.enum(['PROPOSED','UNDER_REVIEW','APPROVED','REJECTED','SUSPENDED']),publicEnabled:z.boolean()}).strict();
export const capabilityControlSchema=z.object({featureId:id,revision:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),state:z.enum(['enabled','paused','disabled','incident-disabled']),serviceId:id,environment,materialDigest:digest,reviewId:id,scope,rolloutPercent:z.number().int().min(0).max(100),cohortId:id,changedBy:id,expiresAt:date}).strict();
export type CapabilityControl=z.infer<typeof capabilityControlSchema>;
export interface RegisteredCapability {id:string;category:string;approval:string;publicEnabled:boolean;}
const compiledSource=(featureId:string):RegisteredCapability|null=>{const row=registry.features.find(record=>record.feature_id===featureId);return row?{id:row.feature_id,category:row.release_category,approval:normalizeCapabilityApproval(row.approval_status),publicEnabled:row.public_enabled}:null;};
const schema=z.object({
 featureId:id,
 now:z.number().finite(),
 deployment:z.object({serviceId:id,environment,materialDigest:digest,requiredReviews:z.array(reviewRole).min(2).max(4),highConsequence:z.boolean(),requireDistinctReviewers:z.boolean(),consentPurpose:id.nullable()}).strict().nullable().optional(),
 implementation:z.object({readiness:z.enum(['PLANNED','IN_DEVELOPMENT','TESTABLE','FUNCTIONALLY_COMPLETE','VERIFIED']),materialDigest:digest,verificationReference:id}).strict().nullable().optional(),
 review:z.object({id,featureId:id,status:z.enum(['PROPOSED','UNDER_REVIEW','APPROVED','REJECTED','SUSPENDED']),serviceId:id,environment,materialDigest:digest,validFrom:date,expiresAt:date,scope,maximumRolloutPercent:z.number().int().min(0).max(100),rolloutKeyId:id,cohorts:z.array(z.object({id,accountIds:z.array(z.string().min(1).max(200)).min(1).max(10000).nullable()}).strict()).min(1).max(100),evidence:z.array(z.object({role:reviewRole,reviewerId:id,reference:id,status:z.enum(['PROPOSED','UNDER_REVIEW','APPROVED','REJECTED','SUSPENDED']),materialDigest:digest,validFrom:date,expiresAt:date}).strict()).min(2).max(4)}).strict().nullable().optional(),
 control:capabilityControlSchema.nullable().optional(),
 subject:z.object({accountId:z.string().min(1).max(200),territory:z.string().regex(/^[A-Z]{2}$/),population:id,populationVerified:z.boolean(),purpose:id,consent:z.object({purpose:id,granted:z.boolean(),expiresAt:date}).strict().nullable()}).strict().nullable().optional(),
 rolloutKey:z.object({id,secret:z.string().min(32).max(512).regex(/^\S+$/)}).strict().nullable().optional(),
}).strict();
export type EffectiveCapabilityFacts=z.infer<typeof schema>;
export type CapabilityDenial='INVALID_CONTEXT'|'UNKNOWN_FEATURE'|'INCIDENT_DISABLED'|'RESEARCH_ISOLATION'|'SOURCE_APPROVAL_REQUIRED'|'EXECUTION_UNCONFIGURED'|'IMPLEMENTATION_UNVERIFIED'|'REVIEW_INVALID'|'REVIEW_VERSION_MISMATCH'|'REVIEW_EVIDENCE_INVALID'|'REVIEW_QUORUM_REQUIRED'|'SELF_APPROVAL'|'ACTIVATION_OFF'|'ACTIVATION_SCOPE_INVALID'|'SUBJECT_SCOPE_REQUIRED'|'CONSENT_REQUIRED'|'ROLLOUT_NOT_INCLUDED';
export type EffectiveCapabilityDecision={allowed:true;reason:null}|{allowed:false;reason:CapabilityDenial};
const deny=(reason:CapabilityDenial):EffectiveCapabilityDecision=>({allowed:false,reason});
/** Trusted server facts only, never a request-body authorizer or approval issuer.
 * No live repository/installer is configured by this module. No IDs, keys or
 * bucket values are returned. Account rollout is stable across replicas and
 * control revisions, and domain-separated by feature/service/environment/cohort. */
export function effectiveCapabilityDecision(input:unknown,lookupSource:(id:string)=>RegisteredCapability|null=compiledSource):EffectiveCapabilityDecision{
 const parsed=schema.safeParse(input);if(!parsed.success)return deny('INVALID_CONTEXT');
 const {now,deployment,implementation,review,control,subject,rolloutKey}=parsed.data;
 const canonical=compiledSource(parsed.data.featureId);
 if(!canonical)return deny('UNKNOWN_FEATURE');
 if(canonical.category==='DISABLED_INCIDENT')return deny('INCIDENT_DISABLED');
 if(canonical.category==='INTERNAL_RESEARCH_ONLY')return deny('RESEARCH_ISOLATION');
 let record:RegisteredCapability|null;try{record=lookupSource(parsed.data.featureId);}catch{return deny('INVALID_CONTEXT');}
 if(!record||record.id!==parsed.data.featureId)return deny('UNKNOWN_FEATURE');
 const checked=sourceSchema.safeParse(record);if(!checked.success)return deny('INVALID_CONTEXT');const source=checked.data;
 if(source.category!==canonical.category)return deny('SOURCE_APPROVAL_REQUIRED');
 if(source.category!=='GENERAL_RELEASE'||source.approval!=='APPROVED'||!source.publicEnabled)return deny('SOURCE_APPROVAL_REQUIRED');
 if(!deployment||!implementation||!review||!control||!subject||!rolloutKey)return deny('EXECUTION_UNCONFIGURED');
 if(implementation.readiness!=='VERIFIED'||implementation.materialDigest!==deployment.materialDigest)return deny('IMPLEMENTATION_UNVERIFIED');
 if(review.featureId!==source.id||review.status!=='APPROVED'||Date.parse(review.validFrom)>=Date.parse(review.expiresAt)||now<Date.parse(review.validFrom)||now>=Date.parse(review.expiresAt))return deny('REVIEW_INVALID');
 if(review.serviceId!==deployment.serviceId||review.environment!==deployment.environment||review.materialDigest!==deployment.materialDigest)return deny('REVIEW_VERSION_MISMATCH');
 if(review.evidence.some(item=>item.status!=='APPROVED'||item.materialDigest!==deployment.materialDigest||Date.parse(item.validFrom)>=Date.parse(item.expiresAt)||now<Date.parse(item.validFrom)||now>=Date.parse(item.expiresAt)))return deny('REVIEW_EVIDENCE_INVALID');
 const required=deployment.requiredReviews,roles=review.evidence.map(item=>item.role),reviewers=review.evidence.map(item=>item.reviewerId);
 if(!required.includes('LEGAL')||!required.includes('SECURITY')||new Set(required).size!==required.length||new Set(roles).size!==roles.length||required.some(role=>!roles.includes(role))||(deployment.requireDistinctReviewers&&new Set(reviewers).size!==reviewers.length)||(deployment.highConsequence&&(!required.includes('SCIENCE')||!deployment.requireDistinctReviewers)))return deny('REVIEW_QUORUM_REQUIRED');
 if(reviewers.includes(control.changedBy))return deny('SELF_APPROVAL');
 if(control.state!=='enabled'||control.rolloutPercent===0)return deny('ACTIVATION_OFF');
 const scopeKeys=['territories','populations','purposes'] as const;
 if(control.featureId!==source.id||control.serviceId!==deployment.serviceId||control.environment!==deployment.environment||control.materialDigest!==deployment.materialDigest||control.reviewId!==review.id||Date.parse(control.expiresAt)>Math.min(Date.parse(review.expiresAt),...review.evidence.map(item=>Date.parse(item.expiresAt)))||now>=Date.parse(control.expiresAt)||control.rolloutPercent>review.maximumRolloutPercent||scopeKeys.some(key=>new Set(control.scope[key]).size!==control.scope[key].length||control.scope[key].some(value=>!review.scope[key].includes(value))))return deny('ACTIVATION_SCOPE_INVALID');
 if(!subject.populationVerified||subject.population==='unknown'||!control.scope.territories.includes(subject.territory)||!control.scope.populations.includes(subject.population)||!control.scope.purposes.includes(subject.purpose))return deny('SUBJECT_SCOPE_REQUIRED');
 if(deployment.consentPurpose&&(!subject.consent?.granted||subject.consent.purpose!==deployment.consentPurpose||now>=Date.parse(subject.consent.expiresAt)))return deny('CONSENT_REQUIRED');
 if(new Set(review.cohorts.map(cohort=>cohort.id)).size!==review.cohorts.length||rolloutKey.id!==review.rolloutKeyId)return deny('ACTIVATION_SCOPE_INVALID');
 const cohort=review.cohorts.find(cohort=>cohort.id===control.cohortId);
 if(!cohort||cohort.accountIds&&!cohort.accountIds.includes(subject.accountId))return deny('ROLLOUT_NOT_INCLUDED');
 const domain=['bloom-feature-rollout-v1',source.id,deployment.serviceId,deployment.environment,cohort.id,subject.accountId].join('\0');
 const bucket=Number.parseInt(createHmac('sha256',rolloutKey.secret).update(domain).digest('hex').slice(0,8),16)%10000;
 return bucket<control.rolloutPercent*100?{allowed:true,reason:null}:deny('ROLLOUT_NOT_INCLUDED');
}
