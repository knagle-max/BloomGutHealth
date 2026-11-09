import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
const vite=await createServer({server:{host:'127.0.0.1',port:5241,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage();
const network=[];page.on('request',request=>network.push(request.url()));
await page.route('**/description-prototype-fixture',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Synthetic validation worker fixture</title><main>Internal source-validation prototype; no model inference.</main>'}));
try{
 await page.goto('http://127.0.0.1:5241/description-prototype-fixture');
 const result=await page.evaluate(async()=>{
  const api=await import('/src/lib/description-intelligence.ts');
  const input='2 slices of pepperoni pizza',source=(quote)=>{const start=input.indexOf(quote);return{start,end:start+quote.length,quote};};
  const draft={version:'description-draft-v1',domain:'food',items:[{source:source(input),name:{value:'pepperoni pizza',source:source('pepperoni pizza')},portion:{value:2,unit:'slice',source:source('2'),unitSource:source('slices')},preparation:null,intent:'uncertain',intentSource:null}]};
  const json=JSON.stringify(draft),context={sourceRevision:'synthetic-source-v1',isCurrent:()=>true,locale:'en'};
  const capabilities=api.descriptionCapabilities();
  const unavailable=await api.InterpretDescription(input,'food',context,new AbortController().signal);
  const revoked=await api.InterpretDescription(input,'food',{...context,isCurrent:()=>{throw Error('Synthetic actor revoked');}},new AbortController().signal);
  const valid=await api.validateCandidateInWorker(input,'food',json,context,new AbortController().signal);
  const invalid=structuredClone(draft);invalid.items[0].portion.value=124;
  const rejected=await api.validateCandidateInWorker(input,'food',JSON.stringify(invalid),context,new AbortController().signal);
  const cancelledController=new AbortController();const pending=api.validateCandidateInWorker(input,'food',json,context,cancelledController.signal);cancelledController.abort();const cancelled=await pending;
  let current=true;const stalePromise=api.validateCandidateInWorker(input,'food',json,{...context,isCurrent:()=>current},new AbortController().signal);current=false;const stale=await stalePromise;
  const first=api.validateCandidateInWorker(input,'food',json,context,new AbortController().signal);
  const next=api.validateCandidateInWorker(input,'food',json,context,new AbortController().signal);const displaced=await first;const latest=await next;
  const originalWorker=globalThis.Worker;globalThis.Worker=undefined;const absent=await api.validateCandidateInWorker(input,'food',json,context,new AbortController().signal);globalThis.Worker=originalWorker;
  const malformed=await api.validateCandidateInWorker(input,'food','{',context,new AbortController().signal);
  let terminated=0;globalThis.Worker=class{postMessage(){}terminate(){terminated++;}};const timeout=await api.validateCandidateInWorker(input,'food',json,context,new AbortController().signal,5);globalThis.Worker=class{constructor(){throw Error('Synthetic worker initialization failure');}};const failed=await api.validateCandidateInWorker(input,'food',json,context,new AbortController().signal);globalThis.Worker=originalWorker;
  return{capabilities,unavailable,revoked,valid:valid.status,rejected:rejected.status,cancelled,stale,displaced,latest:latest.status,absent,malformed:malformed.status,timeout,failed,terminated};
 });
 assert.equal(result.capabilities.modelAvailable,false);assert.equal(result.unavailable.reason,'model-not-available');assert.equal(result.revoked.reason,'source-changed');
 assert.equal(result.valid,'source-grounded-draft');assert.equal(result.rejected,'needs-review');assert.equal(result.cancelled.reason,'cancelled');assert.equal(result.stale.reason,'source-changed');assert.equal(result.displaced.reason,'cancelled');assert.equal(result.latest,'source-grounded-draft');assert.equal(result.absent.reason,'worker-unavailable');assert.equal(result.malformed,'needs-review');assert.equal(result.timeout.reason,'timeout');assert.equal(result.terminated,1);assert.equal(result.failed.reason,'runtime-failed');
 assert.ok(network.every(url=>new URL(url).origin==='http://127.0.0.1:5241'),'No description/model/provider traffic to external origins');
 assert.ok(!network.some(url=>new URL(url).pathname.startsWith('/api/')),'Prototype never invokes canonical/server APIs');
 console.log('PASS: real browser dedicated-worker source validation, invalid quantity refusal, cancellation, source epoch withdrawal, one-job displacement, missing Worker, malformed candidate, injected timeout/init faults with termination and explicit model-unavailable fallback; no API/provider/model request or canonical writes. Not inference or a physical-device benchmark.');
}finally{await browser.close();await vite.close();}
