import {groundInvestigationCandidate,type BiologicalInvestigationCandidate} from '../shared/biological-investigation';
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
 supportsCompetingHypothesisReview?:true;
 investigate:(input:{snapshot:Snapshot;evidence:Evidence;signal:AbortSignal;pass?:'initial'|'challenge';previousCandidate?:BiologicalInvestigationCandidate;constraints?:readonly string[]})=>Promise<unknown>;
};
const fallback=(reason:string)=>({status:'abstain' as const,reason,keepExistingSourceReview:true as const,outcomeClassification:['D'] as const,consumerInterpretation:null});
/** Bounded one- or two-pass orchestration, not a clinical verifier or public
 * recommendation path. Existing deterministic source review remains useful
 * when unavailable. Source/evidence/permission rechecks happen AFTER model work.
 * No private payload is forwarded through the public research adapter. */
export async function runPrivateInvestigation(input:{
 actor:string;privateReasoningApproved:boolean;engine?:PrivateInvestigationEngine;
 authorize:()=>Promise<boolean>;
 readSnapshot:()=>Promise<Snapshot>;
 retrieveEvidence:()=>Promise<Evidence>;
 timeoutMs?:number;
 passes?:1|2;
}){
 if(!input.actor||input.privateReasoningApproved!==true||!input.engine||input.engine.kind!=='bloom-private-runtime'||!input.engine.id||!input.engine.promptVersion)return fallback('private-engine-not-configured');
 if(input.passes!==undefined&&input.passes!==1&&input.passes!==2)return fallback('invalid-pass-budget');
 if(input.passes===2&&input.engine.supportsCompetingHypothesisReview!==true)return fallback('private-review-not-supported');
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
  let previousCandidate:BiologicalInvestigationCandidate|undefined;
  for(let pass=0;pass<(input.passes??1);pass++){
  if(!await input.authorize()||expired())return fallback('permission');
  // Scope changes can occur during authorization between passes. Recollect
  // before each invocation as well as after it; never reuse the first private
  // snapshot merely because overall personal-wellness permission remains true.
  const [beforePass,beforeEvidence]=await Promise.all([input.readSnapshot(),input.retrieveEvidence()]);
  if(expired())return fallback('deadline');
  if(beforePass.accountScope!==input.actor||beforePass.purpose!=='personal-wellness'||beforePass.externalTransferPermitted!==false)return fallback('permission');
  if(beforePass.sourceEpoch!==snapshot.sourceEpoch||beforePass.snapshotId!==snapshot.snapshotId||beforeEvidence.evidenceVersion!==evidence.evidenceVersion)return fallback('sources-changed');
  const untrusted=await engine.investigate({snapshot:structuredClone(beforePass),evidence:structuredClone(beforeEvidence),signal:controller.signal,
   pass:pass===0?'initial':'challenge',...(previousCandidate?{previousCandidate:structuredClone(previousCandidate)}:{}),
   constraints:['Evaluate competing explanations and materially distinguishing unknowns.','Missing information is unknown, never normal or none.','Temporal proximity is not causal evidence.','Current medication names are not historical dose or adherence records.','Unreviewed taxa cannot diagnose SIBO or IMO.','No diagnosis, prescribing, treatment, personal risk score or shared knowledge promotion.'],
  });
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
  if(pass===0&&input.passes===2&&!result.candidate.synthesis.abstention){previousCandidate=result.candidate;continue;}
  return {status:'research-only-unverified' as const,candidate:result.candidate,engineId:engine.id,promptVersion:engine.promptVersion,keepExistingSourceReview:true as const,outcomeClassification:['D'] as const,consumerInterpretation:null};
  }
  return fallback('investigation-unavailable');
  };
  return await Promise.race([run(),expiry]);
 }catch{return fallback('investigation-unavailable');}
 finally{if(timer)clearTimeout(timer);controller.abort();}
}
