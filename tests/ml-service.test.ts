import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mlServiceFetch, mlServiceTarget } from "../server/ml-service";
const token = "synthetic-service-token-for-tests-123456";
test("ML destinations and credentials fail closed before any health-data transfer", async () => {
  for (const config of [ {}, {ML_SERVICE_URL:"https://trusted.example"}, {ML_SERVICE_URL:"http://public.example",ML_SERVICE_TOKEN:token}, {ML_SERVICE_URL:"https://user:pass@trusted.example",ML_SERVICE_TOKEN:token}, {ML_SERVICE_URL:"https://trusted.example/path",ML_SERVICE_TOKEN:token}, {ML_SERVICE_URL:"https://trusted.example",ML_SERVICE_TOKEN:"short"} ]) {
    let sent = false;
    await assert.rejects(mlServiceFetch("/api/ml/analyze", {method:"POST",body:"synthetic-private-record"}, config, (async()=>{sent=true;throw Error("should not send");}) as any));
    assert.equal(sent,false);
  }
  assert.throws(()=>mlServiceTarget("/unknown",{ML_SERVICE_URL:"https://trusted.example",ML_SERVICE_TOKEN:token}));
  assert.throws(()=>mlServiceTarget("/api/ml/analyze",{ML_SERVICE_URL:"http://8.8.8.8",ML_SERVICE_TOKEN:token,ML_SERVICE_ALLOW_PRIVATE_HTTP:"true"}));
  assert.throws(()=>mlServiceTarget("/api/ml/analyze",{ML_SERVICE_URL:"http://bloom-ml:8000",ML_SERVICE_TOKEN:token}));
  assert.equal(mlServiceTarget("/api/ml/analyze",{ML_SERVICE_URL:"http://bloom-ml:8000",ML_SERVICE_TOKEN:token,ML_SERVICE_ALLOW_PRIVATE_HTTP:"true"}).url,"http://bloom-ml:8000/api/ml/analyze");
  assert.equal(mlServiceTarget("/health",{ML_SERVICE_URL:"http://localhost:8000"}).token,undefined);
});
test("ML HTTP client sends only service authentication, bounds requests and refuses redirects",async()=>{
  const received: {path:string;authorization?:string;cookie?:string;body:string}[]=[];
  const server=createServer(async(req,res)=>{
    let body="";for await(const chunk of req)body+=chunk;
    received.push({path:req.url!,authorization:req.headers.authorization,cookie:req.headers.cookie,body});
    if(req.url==="/api/ml/cohorts"){res.writeHead(302,{Location:"/unexpected"});res.end();return;}
    res.setHeader("Content-Type","application/json");res.end('{"status":"ok"}');
  }).listen(0,"127.0.0.1");
  await new Promise<void>(resolve=>server.once("listening",resolve));
  const base="http://127.0.0.1:"+(server.address() as any).port,config={ML_SERVICE_URL:base,ML_SERVICE_TOKEN:token};
  try{
    const response=await mlServiceFetch("/api/ml/analyze",{method:"POST",headers:{Authorization:"browser-token",Cookie:"session=private","Content-Type":"application/json"},body:JSON.stringify({sample_id:"synthetic"})},config);
    assert.equal(response.status,200);assert.equal(received[0].authorization,"Bearer "+token);assert.equal(received[0].cookie,undefined);assert.equal(received[0].body,'{"sample_id":"synthetic"}');
    await mlServiceFetch("/health",{headers:{Authorization:"must-not-forward"}},config);
    assert.equal(received[1].authorization,undefined);
    await assert.rejects(mlServiceFetch("/api/ml/cohorts",{},config));
    assert.ok(!received.some(r=>r.path==="/unexpected"));
    await mlServiceFetch("/api/ml/upload",{},config,(async(_url:any,options:any)=>{assert.equal(options.redirect,"error");assert.equal(options.size,5*1024*1024);assert.ok(options.signal instanceof AbortSignal);return response;}) as any);
  }finally{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
});
