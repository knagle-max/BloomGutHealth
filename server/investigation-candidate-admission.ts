import {createHash} from 'node:crypto';
import {z} from 'zod';
import {biologicalInvestigationCandidateSchema,groundInvestigationCandidate,type InvestigationGroundingContext} from '../shared/biological-investigation';
import type {ConsumerValueCandidate} from '../shared/scientific-contracts';
const id=z.string().min(1).max(128),sha=z.string().regex(/^[a-f0-9]{64}$/);
const reviewSchema=z.object({
 id,accountScope:id,purpose:z.literal('personal-wellness'),snapshotId:id,
 sourceEpoch:z.string().min(1).max(4096),evidenceVersion:id,candidateDigest:sha,
 reviewerId:id,method:z.literal('independent-original-source-and-applicability-review'),
 tier:z.literal('qualified-nonconsequential-explanation'),
 disposition:z.literal('accepted-with-explicit-limits'),
 coveredHypothesisIds:z.array(id).min(1).max(4),
 verifiedEvidenceIds:z.array(id).min(1).max(24),
 contraryAndNullFindingsReviewed:z.literal(true),
 exactFactsAndNumbersReviewed:z.literal(true),
 harmsAndApplicabilityReviewed:z.literal(true),
 validUntil:z.string().datetime(),
}).strict();
/** Digest binds the complete model output, including uncertainty, alternatives,
 * omissions and synthesis. A changed sentence cannot reuse a prior review. */
export function investigationCandidateDigest(untrusted:unknown){
 return createHash('sha256').update(JSON.stringify(biologicalInvestigationCandidateSchema.parse(untrusted))).digest('hex');
}
/** Adapter into the EXISTING ConsumerValueCandidate contract. This is an
 * independent-review admission gate, not an automated semantic/scientific truth
 * checker. Review flags supplied by a model/client are insufficient: trusted
 * current account-scoped authority must approve the exact decision AND digest.
 * No production authority, clinical advice, action, UI or store is installed. */
export function admitReviewedInvestigation(input:{
 actor:string;candidate:unknown;review:unknown;
 current:InvestigationGroundingContext&{observationRefs:readonly {id:string;sourceId:string;revision:string;date?:string}[]};
 observations:readonly {id:string;sourceId:string;revision:string;date?:string}[];
 authority:{accountScope:string;purpose:'personal-wellness';limitedExplanatoryRelease:boolean;approvedReviews:ReadonlyMap<string,string>;withdrawnReviews:ReadonlySet<string>;now:number};
}):ConsumerValueCandidate|null{
 const {actor,current,authority}=input;
 if(!actor||authority.accountScope!==actor||authority.purpose!=='personal-wellness'||!authority.limitedExplanatoryRelease||!Number.isFinite(authority.now))return null;
 const grounded=groundInvestigationCandidate(input.candidate,actor,current),parsed=reviewSchema.safeParse(input.review);
 if(grounded.state!=='research-only-unverified'||!parsed.success||grounded.candidate.synthesis.abstention)return null;
 const candidate=grounded.candidate,review=parsed.data,digest=investigationCandidateDigest(candidate);
 if(review.accountScope!==actor||review.snapshotId!==current.snapshotId||review.sourceEpoch!==current.sourceEpoch||review.evidenceVersion!==current.evidenceVersion||review.candidateDigest!==digest||
    authority.approvedReviews.get(review.id)!==digest||authority.withdrawnReviews.has(review.id)||Date.parse(review.validUntil)<=authority.now)return null;
 const covered=new Set(review.coveredHypothesisIds),verified=new Set(review.verifiedEvidenceIds);
 if(covered.size!==review.coveredHypothesisIds.length||verified.size!==review.verifiedEvidenceIds.length||
    candidate.synthesis.hypothesisIds.some(id=>!covered.has(id))||review.coveredHypothesisIds.some(id=>!candidate.hypotheses.some(row=>row.id===id))||review.verifiedEvidenceIds.some(id=>!current.eligibleEvidenceIds.includes(id)))return null;
 const selected=candidate.hypotheses.filter(row=>covered.has(row.id));
 const usedEvidence=new Set(selected.flatMap(row=>[...row.supportingEvidenceIds,...row.contradictingEvidenceIds]));
 if(!usedEvidence.size||Array.from(usedEvidence).some(id=>!verified.has(id)))return null;
 const sourceSchema=z.array(z.object({id,sourceId:id,revision:z.string().min(1).max(4096),date:z.union([z.iso.date(),z.iso.datetime({offset:true})]).optional()}).strict()).max(2000);
 const sourceRows=sourceSchema.safeParse(input.observations),canonicalRows=sourceSchema.safeParse(current.observationRefs);
 if(!sourceRows.success||!canonicalRows.success||selected.some(row=>!row.supportingEvidenceIds.length&&!row.contradictingEvidenceIds.length))return null;
 // Caller-supplied presentation references cannot relabel a known observation.
 // The current canonical map is supplied by the trusted source recollection,
 // separately from candidate/review/presentation input; no client authority.
 const byId=new Map(canonicalRows.data.map(row=>[row.id,row]));
 const currentIds=new Set(current.observationIds);
 if(byId.size!==canonicalRows.data.length||currentIds.size!==current.observationIds.length||byId.size!==currentIds.size||Array.from(byId.keys()).some(id=>!currentIds.has(id))||new Set(sourceRows.data.map(row=>row.id)).size!==sourceRows.data.length)return null;
 if(sourceRows.data.some(row=>{const canonical=byId.get(row.id);return !canonical||row.sourceId!==canonical.sourceId||row.revision!==canonical.revision||row.date!==canonical.date;}))return null;
 if((candidate.numericClaims??[]).some(claim=>claim.observationIds.some(id=>{const numeric=current.numericFacts?.find(row=>row.id===id),canonical=byId.get(id);return !numeric||!canonical||numeric.sourceId!==canonical.sourceId||numeric.revision!==canonical.revision;})))return null;
 const providedIds=new Set(sourceRows.data.map(row=>row.id));
 const observationIds=Array.from(new Set([...selected.flatMap(row=>row.observationIds),...(candidate.numericClaims??[]).flatMap(row=>row.observationIds)]));
 if(!observationIds.length||observationIds.some(id=>!byId.has(id)||!providedIds.has(id)))return null;
 const materialUnknowns=Array.from(new Set([...candidate.synthesis.limits,...selected.flatMap(row=>row.materialUnknowns)]));
 return {candidateId:`investigation:${review.id}:${digest}`,findingType:'cross-domain-qualified',
  observationRefs:observationIds.map(id=>{const row=byId.get(id)!;return{sourceId:row.sourceId,revision:row.revision,...(row.date?{date:row.date}:{})};}),
  relevantUserGoalIds:[],finding:candidate.synthesis.finding,biologicalMeaning:null,
  evidenceRuleIds:[`independent-investigation-review:${review.id}`],applicability:'conditional',practicalNextStepId:null,
  materialUnknowns,prohibitedClaims:['personal diagnosis','causation established','treatment or supplement dose advice','clinical risk or probability','shared scientific knowledge promotion'],
  priorityReason:null,releaseState:'feature-eligible',sourceEpoch:current.sourceEpoch};
}
