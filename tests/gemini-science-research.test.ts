import assert from "node:assert/strict";
import { test } from "node:test";
import {
  GeminiResearchUnavailable, investigatePublishedScienceWithGemini,
} from "../server/gemini-science-research";

const env = {
  BLOOM_GEMINI_PUBLIC_SCIENCE_ENABLED:"true",
  GEMINI_API_KEY:"fixture-do-not-use",
  BLOOM_GEMINI_RESEARCH_MODEL:"gemini-2.5-flash",
};
const request = {
  question:"What source-supported hypotheses could explain differences in microbial bile acid processing?",
  taskId:"microbial-bile-acid-review",
  declaredDataClass:"nonpersonal-published-science",
  approvedForUnpaidGoogleProcessing:true,
  sources:[
    {sourceId:"DOI:test1",title:"Study One",doi:"10.1234/example",excerpt:"The study found a change under a defined experimental condition.",evidenceClass:"in-vitro",status:"source-reviewed-for-research",rights:"approved-for-provider-research"},
    {sourceId:"DOI:test2",title:"Study Two",excerpt:"A separate experimental observation did not reproduce the effect.",evidenceClass:"in-vitro",status:"source-reviewed-for-research",rights:"approved-for-provider-research"},
  ],
};
function mockResponse(content:unknown) {
  return async (_input:string|URL|Request, init?:RequestInit) => {
    assert.equal(init?.method,"POST");
    assert.ok(String(_input).startsWith("https://generativelanguage.googleapis.com/v1beta/models/"));
    const headers=init?.headers as Record<string,string>;
    assert.equal(headers["x-goog-api-key"],env.GEMINI_API_KEY);
    assert.ok(!String(init?.body).includes("fixture-do-not-use"));
    return new Response(JSON.stringify({
      candidates:[{content:{parts:[{text:JSON.stringify(content)}]}}],
      usageMetadata:{promptTokenCount:112,candidatesTokenCount:54},
    }), {status:200,headers:{"content-type":"application/json"}});
  };
}
const candidate={
  question:request.question,
  hypotheses:[{claim:"The experimental change may depend on the source conditions.",evidenceSourceIds:["DOI:test1"],uncertainty:"Applicability is not established beyond the assay.",hypothesis:true}],
  contradictingFindings:[{claim:"A separate study did not reproduce the finding.",evidenceSourceIds:["DOI:test2"],uncertainty:"Conditions may differ across experiments.",hypothesis:false}],
  unansweredQuestions:["Were the original strains and assay conditions comparable?"],
};

test("disabled by default and no request if config is absent",async()=>{
  let called=false;
  await assert.rejects(investigatePublishedScienceWithGemini(request,{env:{},fetcher:(async()=>{called=true;throw Error("should not call")}) as typeof fetch}),GeminiResearchUnavailable);
  assert.equal(called,false);
});
test("unreviewed sources and any extra personal fields fail closed",async()=>{
  let called=false;
  const fetcher=(async()=>{called=true;throw Error("should not call")}) as typeof fetch;
  await assert.rejects(investigatePublishedScienceWithGemini({...request,accountId:"private"},{env,fetcher}),GeminiResearchUnavailable);
  await assert.rejects(investigatePublishedScienceWithGemini({...request,approvedForUnpaidGoogleProcessing:false},{env,fetcher}),GeminiResearchUnavailable);
  await assert.rejects(investigatePublishedScienceWithGemini({...request,sources:[{...request.sources[0],status:"unreviewed"}]},{env,fetcher}),GeminiResearchUnavailable);
  assert.equal(called,false);
});
test("valid verified-source hypothesis is only a candidate, never knowledge",async()=>{
  const output=await investigatePublishedScienceWithGemini(request,{env,fetcher:mockResponse(candidate) as typeof fetch});
  assert.equal(output.status,"candidate_unreviewed");
  assert.equal(output.noKnowledgePromotion,true);
  assert.equal(output.provider,"google-gemini");
  assert.equal(output.claims.hypotheses.length,1);
  assert.equal(output.claims.contradictingFindings.length,1);
  assert.equal(output.usage.inputTokens,112);
  assert.match(output.sourceSetSha256,/^[0-9a-f]{64}$/);
});
test("invented citation ID causes result to be rejected",async()=>{
  const wrong={...candidate,hypotheses:[{...candidate.hypotheses[0],evidenceSourceIds:["DOI:invented"]}]};
  await assert.rejects(investigatePublishedScienceWithGemini(request,{env,fetcher:mockResponse(wrong) as typeof fetch}),GeminiResearchUnavailable);
});
test("provider error does not become evidence or a valid candidate",async()=>{
  const unavailable=(async()=>new Response("not available",{status:429})) as typeof fetch;
  await assert.rejects(investigatePublishedScienceWithGemini(request,{env,fetcher:unavailable}),GeminiResearchUnavailable);
});
