/** Operator-authorized one-time live Gemini retry. No HTTP endpoint. Remove after receipt. */
import { Pool } from "pg";
import { SpendLedger, postgresSpendTransaction } from "../server/spend-ledger";
import { sessionSecret } from "../server/security";
import { investigatePublishedScienceWithGemini } from "../server/gemini-science-research";

const tag="[BLOOM_GEMINI_RETRY_B]";
const emit=(stage:string, details:Record<string,unknown>={})=>console.log(tag+" "+JSON.stringify({stage,...details}));
const previousId="bloom-gemini-bile-20261118-retry-v35";
const requestId="bloom-gemini-bile-20261118-retry-v35-b";
const question="What nonpersonal published evidence distinguishes microbial bile acid deconjugation from dehydroxylation and from host or dietary changes in the bile acid pool? Compare mechanistic and observational human hypotheses, identify limitations and contradictory interpretations, and distinguish associations from proven causation.";
const sources=[
 {sourceId:"doi:10.1038/s41579-022-00805-x",title:"Bile acids and the gut microbiota: metabolic interactions and impacts on disease",doi:"10.1038/s41579-022-00805-x",excerpt:"Independently authored source synopsis: This review discusses microbiota-mediated bile-acid transformations, including deconjugation and dehydroxylation, alongside host synthesis, enterohepatic recycling, diet and antibiotic exposure. Mechanisms do not by themselves demonstrate causal clinical effects in individual humans.",evidenceClass:"review" as const,status:"source-reviewed-for-research" as const,rights:"approved-for-provider-research" as const},
 {sourceId:"doi:10.3390/metabo12090846",title:"Fecal Bile Acids and Neutral Sterols Are Associated with Latent Microbial Subgroups in the Human Gut",doi:"10.3390/metabo12090846",excerpt:"Independently authored source synopsis: Cross-sectional human data show associations between fecal bile acid profiles and microbial community subgroups; this observational design cannot establish that any named bacterial group caused bile-acid changes or that changing it would cause a health outcome.",evidenceClass:"human-observational" as const,status:"source-reviewed-for-research" as const,rights:"approved-for-provider-research" as const}
];
async function main(){
 emit("preflight",{commit:process.env.RENDER_GIT_COMMIT??"unavailable",keyConfigured:!!process.env.GEMINI_API_KEY?.trim(),normalFeatureFlag:process.env.BLOOM_GEMINI_PUBLIC_SCIENCE_ENABLED==="true"?"enabled":"disabled",targetModel:"gemini-3.5-flash-lite"});
 if(!process.env.GEMINI_API_KEY?.trim()||!process.env.DATABASE_URL?.trim()){emit("blocked",{reason:"required_credential_or_database_unavailable"});return;}
 const pool=new Pool({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000,query_timeout:5000});
 try{
  const check=await pool.query("SELECT to_regclass('public.ai_spend_requests') IS NOT NULL AS present");
  if(!check.rows[0]?.present){emit("blocked",{reason:"atomic_ledger_missing"});return;}
  const ledger=new SpendLedger(postgresSpendTransaction(pool),sessionSecret());
  // First call reached Google and returned 404; retain conservative estimated
  // liability ($0.01) while freeing an otherwise stranded concurrency slot.
  const previousSettled=await ledger.settle("bloom-nonpersonal-research",previousId,10000,"estimated");
  if(!previousSettled){emit("blocked",{reason:"prior_request_not_found_for_safe_reconciliation"});return;}
  emit("prior_reservation_reconciled",{basis:"estimated",reservedUsd:0.01});
  let attempts=0,providerHttpStatus:number|null=null,providerErrorCode:string|null=null;
  const fetcher:typeof fetch=async(input,init)=>{
   if(++attempts>1)throw Error("one_call_maximum");
   const response=await fetch(input,init);
   providerHttpStatus=response.status;
   if(!response.ok){
     // Record only a Google error-code category, never response text, URLs or secrets.
     const classification:Record<number,string>={400:"invalid_request",401:"authentication",403:"permission_or_quota",404:"model_or_endpoint_not_found",429:"rate_limited",500:"provider_error",503:"service_unavailable"};
     providerErrorCode=classification[response.status]??"unexpected_http_error";
   }
   if(response.ok){
     try {
       const v=await response.clone().json() as {candidates?:Array<{content?:{parts?:Array<{text?:string}>}}> ,usageMetadata?:unknown};
       const txt=(v.candidates?.[0]?.content?.parts??[]).map(x=>x.text??"").join("");
       const candidate=JSON.parse(txt) as Record<string,unknown>;
       emit("provider_structured_diagnostic",{candidateKeys:Object.keys(candidate),questionExact:candidate.question===question,hypotheses:Array.isArray(candidate.hypotheses)?candidate.hypotheses.length:"missing",contradictions:Array.isArray(candidate.contradictingFindings)?candidate.contradictingFindings.length:"missing",usage:v.usageMetadata??null,publicScientificCandidate:candidate});
     } catch {emit("provider_structured_diagnostic",{parse:"not_valid_json_or_no_content"});}
   }
   return response;
  };
  try{
   const result=await investigatePublishedScienceWithGemini({
     question,sources,taskId:"gut-bile-20261118-live-retry",declaredDataClass:"nonpersonal-published-science",approvedForUnpaidGoogleProcessing:true,
   },{
     env:{...process.env,BLOOM_GEMINI_PUBLIC_SCIENCE_ENABLED:"true",BLOOM_GEMINI_RESEARCH_MODEL:"gemini-3.5-flash-lite"},
     requestId,ledger,fetcher,timeoutMs:18000
   });
   emit("result",{status:"PASS",actualProviderCalls:attempts,httpStatus:providerHttpStatus,model:result.model,usage:result.usage,estimatedSettledUsd:0.01,sourceDigest:result.sourceSetSha256,candidateStatus:result.status,noKnowledgePromotion:result.noKnowledgePromotion,claims:result.claims});
  }catch(e){
   const error=e instanceof Error?e.message:"unavailable";
   emit("result",{status:"FAIL",actualProviderCalls:attempts,httpStatus:providerHttpStatus,providerErrorCode,reason:["Gemini research is not configured or approved.","Research spend limit or duplicate request.","Candidate schema or research question mismatch.","Candidate cited an unknown scientific source.","Candidate was not valid structured JSON.","Could not settle Gemini spend reservation.","Unexpected Gemini response schema.","Gemini provider request unsuccessful.","Gemini transport unavailable."].includes(error)?error:"other_validation_or_spend_guard_failure"});
  }
 }catch{emit("blocked",{reason:"database_or_ledger_failure"});}
 finally{await pool.end().catch(()=>{});}
}
await main().catch(()=>emit("blocked",{reason:"unexpected_failure"}));
