import {groundInvestigationCandidate} from '../shared/biological-investigation';
import type {collectPrivateInvestigationSnapshot} from './biological-investigation-snapshot';
import type {retrieveReviewedScientificEvidence} from './scientific-evidence-retrieval';

type Snapshot=Awaited<ReturnType<typeof collectPrivateInvestigationSnapshot>>;
type Evidence=ReturnType<typeof retrieveReviewedScientificEvidence>;
/** In-process/private-runtime adapter only. No provider keys, URLs, network
 * tools, Gemini payloads or generic paid invoke callback are accepted here.
 * An installed engine still requires independent privacy/performance review;
 * this module does not provision one or authorize external health transfer. */
export type PrivateInvestigationEngine={
 kind:'bloom-private-runtime';id:string;promptVersion:string;
 investigate:(input:{snapshot:Snapshot;evidence:Evidence;signal:AbortSignal})=>Promise<unknown>;
};
const fallback=(reason:string)=>({status:'abstain' as const,reason,keepExistingSourceReview:true as const,consumerInterpretation:null});
/** First bounded one-pass orchestration, not a clinical verifier or public
 * recommendation path. Existing deterministic source review remains useful
 * when unavailable. Source/evidence/permission rechecks happen AFTER model work.
 * No private payload is forwarded through the public research adapter. */
export async function runPrivateInvestigation(input:{
 actor:string;privateReasoningApproved:boolean;engine?:PrivateInvestigationEngine;
 authorize:()=>Promise<boolean>;
 readSnapshot:()=>Promise<Snapshot>;
 retrieveEvidence:()=>Promise<Evidence>;
 timeoutMs?:number;
}){
 if(!input.actor||input.privateReasoningApproved!==true||!input.engine||input.engine.kind!=='bloom-private-runtime'||!input.engine.id||!input.engine.promptVersion)return fallback('private-engine-not-configured');
 const engine=input.engine,controller=new AbortController();
 if(input.timeoutMs!==undefined&&!Number.isFinite(input.timeoutMs))return fallback('invalid-budget');
 const timeout=Math.max(10,Math.min(input.timeoutMs??10_000,20_000));
 const deadlineAt=performance.now()+timeout;
 const expired=()=>controller.signal.aborted||performance.now()>=deadlineAt;
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{
  const expiry=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('INVESTIGATION_TIMEOUT'));},timeout);});
  const run=async()=>{
  if(!await input.authorize()||expired())return fallback('permission');
  const [snapshot,evidence]=await Promise.all([input.readSnapshot(),input.retrieveEvidence()]);
  if(expired())return fallback('deadline');
  if(snapshot.accountScope!==input.actor||snapshot.purpose!=='personal-wellness'||snapshot.externalTransferPermitted!==false)return fallback('permission');
  if(!snapshot.facts.length||!evidence.cards.length)return fallback('insufficient-reviewed-context');
  const untrusted=await engine.investigate({snapshot:structuredClone(snapshot),evidence:structuredClone(evidence),signal:controller.signal});
  // Timers cannot preempt a blocked event loop. Monotonic elapsed time still
  // refuses late output; actual private engines must separately bound compute.
  if(expired())return fallback('deadline');
  const [current,currentEvidence,permitted]=await Promise.all([input.readSnapshot(),input.retrieveEvidence(),input.authorize()]);
  if(expired())return fallback('deadline');
  if(!permitted||current.accountScope!==input.actor)return fallback('permission');
  if(current.sourceEpoch!==snapshot.sourceEpoch||current.snapshotId!==snapshot.snapshotId||currentEvidence.evidenceVersion!==evidence.evidenceVersion)return fallback('sources-changed');
  const result=groundInvestigationCandidate(untrusted,input.actor,{
   accountScope:current.accountScope,purpose:current.purpose,permitted,snapshotId:current.snapshotId,sourceEpoch:current.sourceEpoch,evidenceVersion:currentEvidence.evidenceVersion,
   numericFacts:current.facts.filter(fact=>fact.domain==='lab'),
   observationIds:current.facts.filter(fact=>!('computationEligible'in fact)||fact.computationEligible).map(fact=>fact.id),eligibleEvidenceIds:currentEvidence.cards.map(card=>card.review.id),
  });
  if(result.state==='abstain')return fallback(result.reason);
  return {status:'research-only-unverified' as const,candidate:result.candidate,engineId:engine.id,promptVersion:engine.promptVersion,keepExistingSourceReview:true as const,consumerInterpretation:null};
  };
  return await Promise.race([run(),expiry]);
 }catch{return fallback('investigation-unavailable');}
 finally{if(timer)clearTimeout(timer);controller.abort();}
}
