import {DESCRIPTION_MAX_CANDIDATE_CHARS,DESCRIPTION_MAX_CHARS,descriptionDomainSchema,type DescriptionDomain,type DescriptionValidation} from "@shared/description-intelligence";
export interface DescriptionContext {sourceRevision:string;isCurrent:()=>boolean;locale:string;}
export type DescriptionUnavailable={status:"unavailable";reason:"model-not-available"|"worker-unavailable"|"cancelled"|"timeout"|"source-changed"|"runtime-failed"|"input-limit";reviewRequired:true};
const unavailable=(reason:DescriptionUnavailable["reason"]):DescriptionUnavailable=>({status:"unavailable",reason,reviewRequired:true});
const isCurrent=(context:DescriptionContext)=>{try{return context.isCurrent()===true;}catch{return false;}};
/** API presence is not a support/performance or offline-readiness assertion. */
export function descriptionCapabilities(){return{workerApiPresent:typeof Worker!=="undefined",wasmApiPresent:typeof WebAssembly!=="undefined",webGpuApiPresent:typeof navigator!=="undefined"&&"gpu"in navigator,modelAvailable:false as const,promotion:"NOT_YET_JUSTIFIED" as const};}
/** Shared future engine boundary. No validated local model is packaged or
 * enabled, and this function never silently uploads or downloads descriptions. */
export async function InterpretDescription(input:string,domain:DescriptionDomain,context:DescriptionContext,signal:AbortSignal):Promise<DescriptionUnavailable>{
 if(signal.aborted)return unavailable("cancelled");
 if(!isCurrent(context))return unavailable("source-changed");
 if(!descriptionDomainSchema.safeParse(domain).success||typeof input!=="string"||!input.trim()||input.length>DESCRIPTION_MAX_CHARS)return unavailable("input-limit");
 return unavailable("model-not-available");
}
let active:{cancel:()=>void}|undefined;
/** Internal synthetic/candidate evaluation. Real dedicated worker validates the
 * source contract; this is explicitly NOT model inference or an active UI path. */
export function validateCandidateInWorker(input:string,domain:DescriptionDomain,candidateJson:string,context:DescriptionContext,signal:AbortSignal,timeoutMs=3000):Promise<DescriptionValidation|DescriptionUnavailable>{
 if(signal.aborted)return Promise.resolve(unavailable("cancelled"));
 if(!isCurrent(context))return Promise.resolve(unavailable("source-changed"));
 if(!descriptionDomainSchema.safeParse(domain).success||typeof input!=="string"||!input.trim()||input.length>DESCRIPTION_MAX_CHARS||typeof candidateJson!=="string"||candidateJson.length>DESCRIPTION_MAX_CANDIDATE_CHARS)return Promise.resolve(unavailable("input-limit"));
 if(typeof Worker==="undefined")return Promise.resolve(unavailable("worker-unavailable"));
 active?.cancel();
 return new Promise(resolve=>{
  let worker:Worker;try{worker=new Worker(new URL("./description-validation-worker.ts",import.meta.url),{type:"module"});}catch{resolve(unavailable("runtime-failed"));return;}
  const id=crypto.randomUUID();let settled=false;
  const finish=(result:DescriptionValidation|DescriptionUnavailable)=>{if(settled)return;settled=true;clearTimeout(timer);signal.removeEventListener("abort",cancel);worker.terminate();if(active?.cancel===cancel)active=undefined;resolve(result);};
  const cancel=()=>finish(unavailable("cancelled"));
  const timer=setTimeout(()=>finish(unavailable("timeout")),Math.max(0,Math.min(10000,timeoutMs)));
  active={cancel};signal.addEventListener("abort",cancel,{once:true});
  worker.onerror=()=>finish(unavailable("runtime-failed"));
  worker.onmessage=(event:MessageEvent)=>{
   if(!isCurrent(context)){finish(unavailable("source-changed"));return;}
   const body=event.data,result=body?.result;
   if(body?.id!==id||body.version!=="description-validation-worker-v1"||result?.reviewRequired!==true||!["source-grounded-draft","needs-review"].includes(result?.status)){finish(unavailable("runtime-failed"));return;}
   finish(result);
  };
  try{worker.postMessage({id,input,domain,candidateJson});}catch{finish(unavailable("runtime-failed"));}
 });
}
