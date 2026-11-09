import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {PGlite} from '@electric-sql/pglite';
import {validateAIConfiguration,composeMeteredAI} from '../server/ai-configuration';
import {AIExecutionUnavailable} from '../server/metered-ai';
import type {SpendTransaction} from '../server/spend-ledger';
const time=Date.parse('2026-10-24T12:00:00Z');
const fixture=()=>({version:'bloom-metered-ai-policy-v1',reviewReference:'synthetic-review',model:'synthetic-model',effectiveFrom:'2026-10-01T00:00:00Z',expiresAt:'2026-11-01T00:00:00Z',limits:{accountDaily:1000,accountMonthly:2000,featureDaily:500,providerMonthly:5000,platformMonthly:10000,accountConcurrency:2,platformConcurrency:4},policies:{'ingredient-parsing':{maximumRequestBytes:20000,maximumInputTokens:100,maximumOutputTokens:20,boundsReviewReference:'synthetic-bounds',tariff:{reference:'synthetic-tariff',provider:'openai',model:'synthetic-model',effectiveFrom:'2026-01-01T00:00:00Z',expiresAt:'2027-01-01T00:00:00Z',inputMicroUsdPerMillion:1000000,cachedInputMicroUsdPerMillion:500000,outputMicroUsdPerMillion:2000000}}},circuits:{'platform:ai':{maximumFailures:5,cooldownSeconds:60,probeLeaseSeconds:30},'provider:openai':{maximumFailures:2,cooldownSeconds:60,probeLeaseSeconds:30}},grants:[{userId:'synthetic-reviewer-a',features:['ingredient-parsing'],expiresAt:'2026-10-25T00:00:00Z',reviewReference:'synthetic-grant'}]});
test('configuration validates a complete pinned policy but rejects stale/mismatched/ambiguous/over-budget scope without exposing inputs',()=>{
 assert.equal(validateAIConfiguration(fixture(),time).model,'synthetic-model');
 const mutate=[(p:any)=>p.expiresAt='2026-10-24T12:00:00Z',(p:any)=>p.effectiveFrom='2026-10-26T00:00:00Z',(p:any)=>p.model='other-model',(p:any)=>p.limits.platformMonthly=1,(p:any)=>p.limits.accountConcurrency=5,(p:any)=>p.policies['ingredient-parsing'].tariff.expiresAt='2026-10-28T00:00:00Z',(p:any)=>p.policies['ingredient-parsing'].boundsReviewReference='',(p:any)=>p.policies['ingredient-parsing'].maximumOutputTokens=999999,(p:any)=>p.circuits['provider:openai'].probeLeaseSeconds=25,(p:any)=>p.grants.push(p.grants[0]),(p:any)=>p.grants[0].features.push('recipe-generation'),(p:any)=>p.grants[0].features.push('ingredient-parsing'),(p:any)=>p.grants[0].expiresAt='2026-12-01T00:00:00Z',(p:any)=>p.identitySecret='private-must-never-echo'];
 for(const change of mutate){const input=fixture();change(input);assert.throws(()=>validateAIConfiguration(input,time),error=>error instanceof Error&&error.message==='AI configuration unavailable');}
});
test('a structurally valid configuration cannot self-approve a provisional capability or inherit a UI reviewer role',async()=>{
 let queries=0,calls=0;const executor=composeMeteredAI(fixture(),{transaction:async()=>{queries++;throw Error('Must not query');},identitySecret:'synthetic-stable-identity-secret-long-enough',runtimeAllowed:()=>true,now:()=>time});
 assert.equal(executor.available('ingredient-parsing','synthetic-reviewer-a','synthetic-model'),false);
 await assert.rejects(()=>executor.execute('ingredient-parsing',{userId:'synthetic-reviewer-a',requestId:'denied',consent:true},{model:'synthetic-model',input:'synthetic'},async()=>{calls++;return {};}),AIExecutionUnavailable);
 assert.equal(calls,0);assert.equal(queries,0);
 assert.throws(()=>composeMeteredAI(fixture(),{transaction:async()=>{throw Error('Unused');},identitySecret:'short',runtimeAllowed:()=>true,now:()=>time}),/AI configuration unavailable/);
});
test('explicit synthetic composition enforces immutable account/feature/expiry/runtime scope through the actual shared ledger and circuits',async()=>{
 const db=new PGlite();
 try{
  for(const file of ['0009_ai_spend_ledger.sql','0010_ai_usage_receipts.sql','0011_provider_circuits.sql'])await db.exec(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const transaction:SpendTransaction=work=>db.transaction(async tx=>{await tx.query('SELECT pg_advisory_xact_lock(142590,1)');return work(tx as any);});
  const input=fixture();let now=time,enabled=true,calls=0;
  const executor=composeMeteredAI(input,{transaction,identitySecret:'synthetic-stable-identity-secret-long-enough',runtimeAllowed:()=>enabled,featureCleared:()=>true,now:()=>now});
  input.grants[0].features.push('recipe-generation');input.grants.push({...input.grants[0],userId:'synthetic-reviewer-b'});input.policies['ingredient-parsing'].tariff.model='mutated-after-composition';
  const request={model:'synthetic-model',input:'Synthetic food data only'};
  const result=await executor.execute('ingredient-parsing',{userId:'synthetic-reviewer-a',requestId:'one',consent:true},request,async()=>{calls++;return {id:'synthetic-response',model:'synthetic-model',usage:{input_tokens:10,input_tokens_details:{cached_tokens:0},output_tokens:1,total_tokens:11}};});
  assert.equal(result.id,'synthetic-response');assert.equal(calls,1);
  const rows=(await db.query('SELECT state,settled_micro_usd FROM ai_spend_requests')).rows;assert.equal(rows.length,1);assert.equal(rows[0].state,'settled');assert.equal(Number(rows[0].settled_micro_usd),12);
  assert.equal(executor.available('recipe-generation','synthetic-reviewer-a','synthetic-model'),false);
  assert.equal(executor.available('ingredient-parsing','synthetic-reviewer-b','synthetic-model'),false);
  enabled=false;assert.equal(executor.available('ingredient-parsing','synthetic-reviewer-a','synthetic-model'),false);
  enabled=true;now=Date.parse('2026-10-25T00:00:00Z');assert.equal(executor.available('ingredient-parsing','synthetic-reviewer-a','synthetic-model'),false);
  await assert.rejects(()=>executor.execute('ingredient-parsing',{userId:'synthetic-reviewer-a',requestId:'expired',consent:true},request,async()=>{calls++;return {};}),AIExecutionUnavailable);
  assert.equal(calls,1);assert.equal((await db.query('SELECT count(*)::int AS n FROM ai_spend_requests')).rows[0].n,1);
 }finally{await db.close();}
});
test('offline CLI accepts only current policy shape and never installs, queries databases, prints identities or echoes invalid secrets',async()=>{
 const run=(input:unknown)=>new Promise<{code:number;stdout:string;stderr:string}>(resolve=>{const child=execFile(process.execPath,['--import','tsx','scripts/check-ai-policy.ts'],{env:{...process.env,DATABASE_URL:'private-database-secret',OPENAI_API_KEY:'private-provider-secret'}},(error,stdout,stderr)=>resolve({code:Number((error as any)?.code||0),stdout,stderr}));child.stdin!.end(JSON.stringify(input));});
 const current=fixture(),at=Date.now(),iso=(hours:number)=>new Date(at+hours*3600000).toISOString();
 current.effectiveFrom=iso(-24);current.expiresAt=iso(24);current.grants[0].expiresAt=iso(12);current.policies['ingredient-parsing'].tariff.effectiveFrom=iso(-48);current.policies['ingredient-parsing'].tariff.expiresAt=iso(48);
 const result=await run(current);assert.equal(result.code,0);assert.deepEqual(JSON.parse(result.stdout),{configuration:'STRUCTURALLY_VALID_AND_CURRENT',approval:'NOT_VERIFIED',executorInstalled:false,providerCalls:0});assert.doesNotMatch(result.stdout+result.stderr,/synthetic-reviewer|private-/);
 const invalid=await run({...fixture(),secret:'private-input-secret'});assert.equal(invalid.code,1);assert.equal(invalid.stdout,'');assert.doesNotMatch(invalid.stderr,/private-input-secret|private-database-secret|private-provider-secret/);
});

test('science ranking is an explicit independently bounded feature, never inherited from recipe grants',()=>{
 const input:any=fixture();input.policies['science-ranking']=structuredClone(input.policies['ingredient-parsing']);
 input.grants[0].features=['science-ranking'];
 assert.deepEqual(validateAIConfiguration(input,time).grants[0].features,['science-ranking']);
 delete input.policies['science-ranking'];assert.throws(()=>validateAIConfiguration(input,time));
});
