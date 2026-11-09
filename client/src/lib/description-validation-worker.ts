import {DESCRIPTION_MAX_CANDIDATE_CHARS,DESCRIPTION_MAX_CHARS,descriptionDomainSchema,validateDescriptionDraft} from "@shared/description-intelligence";
/** Validation prototype only: no model, network, persistent cache or inference. */
self.onmessage=(event:MessageEvent)=>{
 const data=event.data,domain=descriptionDomainSchema.safeParse(data?.domain);
 let result;
 if(!domain.success||typeof data?.input!=="string"||data.input.length>DESCRIPTION_MAX_CHARS||typeof data?.candidateJson!=="string"||data.candidateJson.length>DESCRIPTION_MAX_CANDIDATE_CHARS){result={status:"needs-review",reviewRequired:true,issues:["worker-input-limit"]};}
 else{try{result=validateDescriptionDraft(data.input,domain.data,JSON.parse(data.candidateJson));}catch{result={status:"needs-review",reviewRequired:true,issues:["candidate-json"]};}}
 self.postMessage({version:"description-validation-worker-v1",id:data?.id,result});
};
