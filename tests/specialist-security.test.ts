import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import express from "express";
import { PGlite } from "@electric-sql/pglite";
import { SharedRateLimiter } from "../server/shared-rate-limit";
import { sameOriginWrites } from "../server/security";
import { encryptPrecision, decryptPrecision } from "../server/precision-crypto";
import { registerReportRoutes } from "../server/report-routes";
import { parseStructuredReport, parseReportDocument } from "../shared/structured-report";

test("two replicas share atomic budgets, do not retain identifiers and recover on expiry", async () => {
  const db = new PGlite();
  try {
    const a = new SharedRateLimiter(db as any, "synthetic-shared-secret"), b = new SharedRateLimiter(db as any, "synthetic-shared-secret");
    await a.initialize(); await b.initialize();
    const results = await Promise.all(Array.from({length:20}, (_,i) => (i % 2 ? a : b).consume("auth:account", "private-user", 7, 900)));
    assert.equal(results.filter(Boolean).length, 7);
    assert.equal(await a.consume("auth:account", "other-user", 7, 900), true);
    const rows = await db.query<any>("SELECT * FROM request_budgets");
    assert.equal(rows.rows.length, 2); assert.ok(!JSON.stringify(rows.rows).includes("private-user"));
    await db.exec("UPDATE request_budgets SET expires_at = now() - interval '1 second'");
    assert.equal(await b.consume("auth:account", "private-user", 7, 900), true);
    await a.prune();
    assert.equal((await db.query("SELECT * FROM request_budgets")).rows.length, 1);
  } finally { await db.close(); }
});
test("shared budget outages fail closed instead of silently using local state", async () => {
  const limiter = new SharedRateLimiter({query: async()=>{throw Error("private connection");}}, "secret");
  let status=0, body:any, continued=false;
  const response={setHeader(){},status(s:number){status=s;return this;},json(b:any){body=b;}};
  await (limiter.middleware() as any)({path:"/api/auth/login",ip:"source",body:{username:"user"}},response,()=>{continued=true;});
  assert.equal(status,503); assert.equal(continued,false); assert.ok(!JSON.stringify(body).includes("connection"));
});
test("origin policy rejects missing, null, sibling, cross-site and proxy-mismatch writes", () => {
  const check=(headers:Record<string,string>,protocol="https")=>{
    let allowed=false,status=0;
    sameOriginWrites({path:"/api/meals",method:"POST",protocol,get:(key:string)=>({host:"bloom.example",...headers})[key]} as any,
      {status(s:number){status=s;return this;},json(){}} as any,()=>{allowed=true;});
    return {allowed,status};
  };
  for (const headers of [{},{origin:"null"},{origin:"https://sibling.bloom.example"},{origin:"https://bloom.example", "sec-fetch-site":"cross-site"},{origin:"https://bloom.example","sec-fetch-site":"same-site"}]) assert.equal(check(headers).status,403);
  assert.equal(check({origin:"https://bloom.example"},"http").status,403);
  assert.equal(check({origin:"https://bloom.example"}).allowed,true);
  assert.equal(check({"sec-fetch-site":"same-origin"}).allowed,true);
  assert.equal(check({"x-forwarded-host":"evil.example", origin:"https://evil.example"}).status,403);
});
test("encryption rotation preserves legacy reads, binds key IDs and fails on tampering or lost keys", () => {
  const saved={legacy:process.env.PRECISION_DATA_KEY,ring:process.env.PRECISION_DATA_KEYRING,active:process.env.PRECISION_ACTIVE_KEY_ID};
  try {
    delete process.env.PRECISION_DATA_KEYRING;delete process.env.PRECISION_ACTIVE_KEY_ID;
    process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");
    const old=encryptPrecision({private:"old"},"a");
    const first=randomBytes(32).toString("base64"),second=randomBytes(32).toString("base64");
    process.env.PRECISION_DATA_KEYRING=JSON.stringify({first,second});process.env.PRECISION_ACTIVE_KEY_ID="first";
    const firstRecord=encryptPrecision({private:"first"},"a");
    process.env.PRECISION_ACTIVE_KEY_ID="second";const next=encryptPrecision({private:"next"},"a");
    assert.equal(next.version,2);assert.equal(next.keyId,"second");
    assert.deepEqual(decryptPrecision(old,"a"),{private:"old"});assert.deepEqual(decryptPrecision(firstRecord,"a"),{private:"first"});
    assert.throws(()=>decryptPrecision(next,"b"));assert.throws(()=>decryptPrecision({...next,keyId:"first"},"a"));
    assert.throws(()=>decryptPrecision({...next,ciphertext:Buffer.from("tampered").toString("base64")},"a"));
    process.env.PRECISION_DATA_KEYRING=JSON.stringify({first});assert.throws(()=>decryptPrecision(next,"a"));
    process.env.PRECISION_DATA_KEYRING=JSON.stringify({second:first});assert.throws(()=>decryptPrecision(next,"a"));
  } finally {
    for(const [key,value] of Object.entries({PRECISION_DATA_KEY:saved.legacy,PRECISION_DATA_KEYRING:saved.ring,PRECISION_ACTIVE_KEY_ID:saved.active})) value===undefined?delete process.env[key]:process.env[key]=value;
  }
});
test("structured input rejects deep JSON, huge row sets and unsupported binary content",()=>{
  let nested:any={organisms:["example"]};for(let i=0;i<40;i++)nested={data:nested};
  assert.throws(()=>parseStructuredReport(nested),/complex/);
  assert.throws(()=>parseStructuredReport({organisms:["example"],extra:Array(21000).fill(1)}),/complex/);
  assert.throws(()=>parseReportDocument("bacteria,abundance\n"+Array(1002).fill("Example,0").join("\n"),"csv"),/1,000/);
  assert.throws(()=>parseReportDocument('PK\u0003\u0004{"organisms":["example"]}',"json"));
});
test("multipart reports reject raw, oversized, invalid and excessive fields without invoking storage",async()=>{
  const app=express();let writes=0;
  registerReportRoutes(app, (req,_res,next)=>{req.session={userId:"synthetic"} as any;next();}, {insertMicrobiomeSample:async()=>{writes++;return {id:"sample"};},updateMicrobiomeSample:async()=>{},insertBacterialComposition:async()=>{},insertMlAnalysis:async()=>{}} as any);
  const server=app.listen(0,"127.0.0.1");await new Promise<void>(r=>server.once("listening",r));
  const base=`http://127.0.0.1:${(server.address() as any).port}`;
  try {
    for(const [filename,content] of [["input.fastq","@seq\nACGT"],["input.json","not json"],["input.csv","PK\u0003\u0004archive"],["large.json"," ".repeat(2*1024*1024+1)]]){
      const form=new FormData();form.append("file",new Blob([content]),filename);
      assert.equal((await fetch(base+"/api/microbiome/upload",{method:"POST",body:form})).status,400);
    }
    assert.equal(writes,0);
    const form=new FormData();form.append("file",new Blob(['{"organisms":["Example"]}']),"input.json");
    assert.equal((await fetch(base+"/api/microbiome/upload",{method:"POST",body:form})).status,200);assert.equal(writes,1);
  } finally {await new Promise<void>(r=>server.close(()=>r()));}
});
