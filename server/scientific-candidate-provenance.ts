import {createHash} from 'node:crypto';
import {z} from 'zod';
import {geminiScienceCandidateSchema,geminiScienceModelSchema,geminiScienceSourceSetDigest} from './gemini-science-research';
import {selectReviewedPublicResearchTask,publicResearchTaskDigest,type ReviewedPublicResearchTask} from './scientific-question-boundary';
import type {ScientificWithdrawals} from './scientific-evidence-retrieval';

const digest=z.string().regex(/^[a-f0-9]{64}$/);
const usageSchema=z.object({inputTokens:z.number().int().nonnegative().nullable(),outputTokens:z.number().int().nonnegative().nullable()}).strict();
const candidateResultSchema=z.object({
 status:z.literal('candidate_unreviewed'),provider:z.literal('google-gemini'),model:geminiScienceModelSchema,
 sourceSetSha256:digest,taskId:z.string().regex(/^[a-zA-Z0-9:_-]{5,90}$/),
 claims:geminiScienceCandidateSchema,
 usage:usageSchema,
 noKnowledgePromotion:z.literal(true),
}).strict();
const receiptSchema=z.object({id:digest,payload:z.object({
 version:z.literal('scientific-candidate-provenance-v1'),status:z.literal('unreviewed-provenance-only'),
 candidateDigest:digest,publicTaskDigest:digest,sourceSetDigest:digest,
 taskId:z.string().regex(/^[a-zA-Z0-9:_-]{5,90}$/),taskReviewId:z.string().min(1).max(120),
 provider:z.literal('google-gemini'),model:geminiScienceModelSchema,
 sourceRefs:z.array(z.object({sourceId:z.string().min(1).max(128),sourceDigest:digest}).strict()).min(1).max(6),
 generatedCounts:z.object({hypotheses:z.number().int().min(0).max(4),contrary:z.number().int().min(0).max(4),unanswered:z.number().int().min(0).max(4)}).strict(),
 reportedUsage:usageSchema,
 providerExecutionVerified:z.literal(false),sourceTruthVerified:z.literal(false),knowledgePromotionPermitted:z.literal(false),
 modelTrainingPermitted:z.literal(false),clinicalReleasePermitted:z.literal(false),
}).strict()}).strict();
export type CandidateRetentionAuthority={
 revision:string;now:number;publicTasks:readonly ReviewedPublicResearchTask[];
 /** Trusted nonpersonal/privacy/retention review, NOT scientific truth approval.
  * An outbound reviewed question alone cannot approve arbitrary generated prose. */
 approvedCandidateReceiptDigests:ReadonlySet<string>;withdrawals:ScientificWithdrawals;
};
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export class ScientificCandidateUnavailable extends Error{
 constructor(){super('Scientific candidate provenance is unavailable or unapproved.');}
}
function candidate(untrusted:unknown){
 const parsed=candidateResultSchema.safeParse(untrusted);
 if(!parsed.success)throw new ScientificCandidateUnavailable();
 return parsed.data;
}
function currentTask(taskId:string,authority:CandidateRetentionAuthority){
 if(!authority.revision||!Number.isFinite(authority.now))throw new ScientificCandidateUnavailable();
 let request;
 try{request=selectReviewedPublicResearchTask({taskId},authority.publicTasks,authority.now);}
 catch{throw new ScientificCandidateUnavailable();}
 const task=authority.publicTasks.find(task=>task.request.taskId===taskId)!;
 if(authority.withdrawals.reviewIds.has(task.review.id)||authority.withdrawals.rightsIds.has(task.review.id)
    ||request.sources.some(source=>authority.withdrawals.sourceIds.has(source.sourceId)))throw new ScientificCandidateUnavailable();
 return {request,reviewId:task.review.id};
}
/** Exact normalized candidate digest for a separate trusted retention review.
 * Never a semantic verifier, anonymizer or permission supplied by model output. */
export function scientificCandidateDigest(untrusted:unknown){return hash(candidate(untrusted));}

/** Source-oriented receipt only. No raw questions, excerpts, generated claims,
 * account IDs, transcripts, model weights or graph relationships are returned.
 * Composition is server-only; no HTTP route/provider/database is installed. */
export function prepareScientificCandidateProvenance(untrusted:unknown,authority:CandidateRetentionAuthority){
 const result=candidate(untrusted),candidateDigest=hash(result);
 const {request,reviewId}=currentTask(result.taskId,authority);
 if(result.claims.question!==request.question||result.sourceSetSha256!==geminiScienceSourceSetDigest(request.sources))throw new ScientificCandidateUnavailable();
 const sources=new Set(request.sources.map(source=>source.sourceId));
 if([...result.claims.hypotheses,...result.claims.contradictingFindings]
   .some(claim=>claim.evidenceSourceIds.some(id=>!sources.has(id))))throw new ScientificCandidateUnavailable();
 const payload={
  version:'scientific-candidate-provenance-v1' as const,status:'unreviewed-provenance-only' as const,
  candidateDigest,publicTaskDigest:publicResearchTaskDigest(request),sourceSetDigest:result.sourceSetSha256,
  taskId:result.taskId,taskReviewId:reviewId,
  provider:result.provider,model:result.model,
  sourceRefs:request.sources.map(source=>({sourceId:source.sourceId,sourceDigest:hash(source)})),
  generatedCounts:{hypotheses:result.claims.hypotheses.length,contrary:result.claims.contradictingFindings.length,unanswered:result.claims.unansweredQuestions.length},
  reportedUsage:{...result.usage},
  providerExecutionVerified:false as const,sourceTruthVerified:false as const,knowledgePromotionPermitted:false as const,modelTrainingPermitted:false as const,clinicalReleasePermitted:false as const,
 };
 return {id:hash(payload),payload};
}

/** Separate exact-receipt privacy/retention approval is required before any
 * future persistence. Approving only the raw candidate hash would not protect
 * reconstructed receipt metadata after the raw prose has been discarded.
 * Approval never comes from the candidate/model and is not scientific review. */
export function buildScientificCandidateProvenance(untrusted:unknown,authority:CandidateRetentionAuthority){
 const receipt=prepareScientificCandidateProvenance(untrusted,authority);
 if(!authority.approvedCandidateReceiptDigests.has(receipt.id))throw new ScientificCandidateUnavailable();
 return receipt;
}

/** Recheck an eventual stored receipt without retaining/regenerating model prose.
 * Exact receipt approval binds counts/provider/source metadata too, so changing
 * a payload and recomputing its own hash cannot manufacture trusted provenance. */
/** Structural integrity only; never permission to retain, restore or reuse. */
export function parseScientificCandidateProvenance(untrusted:unknown){
 const parsed=receiptSchema.safeParse(untrusted);
 if(!parsed.success)throw new ScientificCandidateUnavailable();
 if(hash(parsed.data.payload)!==parsed.data.id)throw new ScientificCandidateUnavailable();
 return parsed.data;
}
export function verifyScientificCandidateProvenance(untrusted:unknown,authority:CandidateRetentionAuthority){
 const receipt=parseScientificCandidateProvenance(untrusted),p=receipt.payload;
 if(!authority.approvedCandidateReceiptDigests.has(receipt.id))throw new ScientificCandidateUnavailable();
 const {request,reviewId}=currentTask(p.taskId,authority);
 const refs=request.sources.map(source=>({sourceId:source.sourceId,sourceDigest:hash(source)}));
 if(p.taskReviewId!==reviewId||p.publicTaskDigest!==publicResearchTaskDigest(request)
    ||p.sourceSetDigest!==geminiScienceSourceSetDigest(request.sources)||JSON.stringify(p.sourceRefs)!==JSON.stringify(refs))
  throw new ScientificCandidateUnavailable();
 return receipt;
}
