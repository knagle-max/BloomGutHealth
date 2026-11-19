import assert from "node:assert/strict";
import { test } from "node:test";
import {
  GeminiResearchUnavailable, investigatePublishedScienceWithGemini,
} from "../server/gemini-science-research";

const env = {
  BLOOM_GEMINI_PUBLIC_SCIENCE_ENABLED:"true",
  GEMINI_API_KEY:"fixture-do-not-use",
  BLOOM_GEMINI_RESEARCH_MODEL:"gemini-3.5-flash-lite",
};
function testLedger() {
  let reserved=0,settled=0;
  return {
    get reserved(){return reserved;},
    get settled(){return settled;},
    reserve:async (_request:unknown,limits:unknown)=>{
      assert.ok(limits);
      reserved++;
      return {allowed:true as const,state:"reserved" as const,replay:false};
    },
    settle:async (_account:string,_request:string,_amount:number,basis:"actual"|"estimated")=>{
      assert.equal(basis,"estimated");
      settled++;
      return true;
    },
    releaseBeforeExecution:async()=>true,
  };
}
const token="test-gemini-request-0001";
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
  const output=await investigatePublishedScienceWithGemini(request,{env,fetcher:mockResponse(candidate) as typeof fetch,ledger:testLedger(),requestId:token});
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
  await assert.rejects(investigatePublishedScienceWithGemini(request,{env,fetcher:mockResponse(wrong) as typeof fetch,ledger:testLedger(),requestId:token}),GeminiResearchUnavailable);
});
test("provider error does not become evidence or a valid candidate",async()=>{
  const unavailable=(async()=>new Response("not available",{status:429})) as typeof fetch;
  await assert.rejects(investigatePublishedScienceWithGemini(request,{env,fetcher:unavailable,ledger:testLedger(),requestId:token}),GeminiResearchUnavailable);
});

test("enabled key without existing atomic ledger cannot call Gemini",async()=>{
  let called=false;
  await assert.rejects(investigatePublishedScienceWithGemini(request,{
    env,fetcher:(async()=>{called=true;throw Error("should not call")}) as typeof fetch,
  }),GeminiResearchUnavailable);
  assert.equal(called,false);
});
test("successful candidate reserves and settles existing spend ledger",async()=>{
  const ledger=testLedger();
  const output=await investigatePublishedScienceWithGemini(request,{env,fetcher:mockResponse(candidate) as typeof fetch,ledger,requestId:token});
  assert.equal(ledger.reserved,1);
  assert.equal(ledger.settled,1);
  assert.equal(output.status,"candidate_unreviewed");
});

test("oversized chunked provider body is cancelled before remaining chunks are read",async()=>{
 let cancelled=false,pulls=0;
 const stream=new ReadableStream<Uint8Array>({
  pull(controller){pulls++;controller.enqueue(new Uint8Array(20_001));if(pulls===3)controller.close();},
  cancel(){cancelled=true;},
 },{highWaterMark:0});
 const ledger=testLedger();
 await assert.rejects(investigatePublishedScienceWithGemini(request,{
  env,ledger,requestId:token,fetcher:(async()=>new Response(stream)) as typeof fetch,
 }),GeminiResearchUnavailable);
 assert.equal(cancelled,true);
 assert.equal(pulls,2);
 assert.equal(ledger.settled,0); // Execution began: uncertain billing stays reserved.
});

test("oversized declared response is cancelled without reading its body",async()=>{
 let cancelled=false,pulls=0;
 const stream=new ReadableStream<Uint8Array>({pull(){pulls++;},cancel(){cancelled=true;}},{highWaterMark:0});
 await assert.rejects(investigatePublishedScienceWithGemini(request,{
  env,ledger:testLedger(),requestId:token,
  fetcher:(async()=>new Response(stream,{headers:{'content-length':'40001'}})) as typeof fetch,
 }),GeminiResearchUnavailable);
 assert.equal(cancelled,true);assert.equal(pulls,0);
});

test("bounded streaming preserves UTF-8 characters split across provider chunks",async()=>{
 const unicode={...candidate,unansweredQuestions:['Does café culture generalize?']};
 const bytes=Buffer.from(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(unicode)}]}}]}));
 const boundary=bytes.indexOf(Buffer.from('é'))+1;
 let index=0;
 const pieces=[bytes.subarray(0,boundary),bytes.subarray(boundary)];
 const stream=new ReadableStream<Uint8Array>({pull(controller){
  if(index===pieces.length){controller.close();return;}controller.enqueue(pieces[index++]);
 }});
 const output=await investigatePublishedScienceWithGemini(request,{
  env,ledger:testLedger(),requestId:token,fetcher:(async()=>new Response(stream)) as typeof fetch,
 });
 assert.deepEqual(output.claims.unansweredQuestions,unicode.unansweredQuestions);
 assert.deepEqual(output.usage,{inputTokens:null,outputTokens:null});
});
