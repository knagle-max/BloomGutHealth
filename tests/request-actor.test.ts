import test from 'node:test';
import assert from 'node:assert/strict';
import { accountFetch, bindRequestActor, AccountContextChangedError } from '../client/src/lib/request-actor';

test('tab actor narrows only owned API requests and preserves raw conflicts, headers and cancellation', async () => {
 const original=globalThis.fetch; const calls:Array<{url:string;init:RequestInit}>=[];
 globalThis.fetch=(async(url,init)=>{calls.push({url:String(url),init:init!});return new Response(JSON.stringify({code:'LAB_REIMPORT_REVIEW_REQUIRED'}),{status:409});}) as typeof fetch;
 try {
  bindRequestActor('a'); const signal=new AbortController().signal;
  const response=await accountFetch('/api/precision/labs/import',{method:'POST',headers:{'X-Bloom-Actor':'forged','Idempotency-Key':'frozen-key','Content-Type':'application/json'},body:'{}',credentials:'include',signal});
  assert.equal(response.status,409); assert.equal((await response.json()).code,'LAB_REIMPORT_REVIEW_REQUIRED');
  const sent=calls[0].init, headers=new Headers(sent.headers); assert.equal(headers.get('X-Bloom-Actor'),'a');assert.equal(headers.get('Idempotency-Key'),'frozen-key');assert.equal(sent.body,'{}');assert.equal(sent.signal,signal);assert.equal(sent.credentials,'include');
  for(const url of ['/api/auth/login','/api/auth/me','https://foreign.invalid/api/precision','//foreign.invalid/api/precision','/assets/api/file']){
   await accountFetch(url,{headers:{'X-Bloom-Actor':'forged'}});assert.equal(new Headers(calls.at(-1)!.init.headers).has('X-Bloom-Actor'),false,url);
  }
  bindRequestActor(null);await accountFetch('/api/precision');assert.equal(new Headers(calls.at(-1)!.init.headers).has('X-Bloom-Actor'),false);
 }finally{globalThis.fetch=original;bindRequestActor(null);}
});

test('late responses are discarded across account switches including A-B-A and bootstrap adoption',async()=>{
 const original=globalThis.fetch;let resolve!:(r:Response)=>void;
 globalThis.fetch=(()=>new Promise<Response>(r=>{resolve=r;})) as typeof fetch;
 try{
  for(const [initial,changes]of [['a',['b']],['a',['b','a']],[null,['a']]] as const){
   bindRequestActor(initial);const pending=accountFetch('/api/precision');for(const next of changes)bindRequestActor(next);resolve(new Response('private response'));await assert.rejects(pending,AccountContextChangedError);
  }
  bindRequestActor('a');const stable=accountFetch('/api/precision');bindRequestActor('a');resolve(new Response('same account'));assert.equal(await(await stable).text(),'same account');
 }finally{globalThis.fetch=original;bindRequestActor(null);}
});


test('late body completion and cloned error bodies cannot return data after identity changes',async()=>{
 const original=globalThis.fetch;let complete!:()=>void;
 globalThis.fetch=(async()=>new Response(new ReadableStream({start(controller){complete=()=>{controller.enqueue(new TextEncoder().encode(JSON.stringify({private:'synthetic-only'})));controller.close();};}}),{status:409,headers:{'content-type':'application/json'}}))as typeof fetch;
 try{
  bindRequestActor('a');const response=await accountFetch('/api/precision');assert.ok(response instanceof Response);assert.equal(response.status,409);assert.equal(response.headers.get('content-type'),'application/json');
  const cloned=response.clone(),body=cloned.json();bindRequestActor('b');complete();await assert.rejects(body,AccountContextChangedError);await assert.rejects(response.text(),AccountContextChangedError);
 }finally{globalThis.fetch=original;bindRequestActor(null);}
});
