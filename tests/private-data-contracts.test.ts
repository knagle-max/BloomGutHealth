import test from 'node:test';
import assert from 'node:assert/strict';
import {PRIVATE_DATA_PROTOCOL,selectDataExecutionTransport,type DataExecutionTransport} from '../shared/private-data-contracts';
import {createSyntheticPrivateTransport,type SyntheticPrivateAuthority} from '../server/private-data-prototype';
const context={actorId:'synthetic-a',purpose:'synthetic-reference' as const,sourceEpoch:'source-1',consentEpoch:'consent-1',policyRevision:'policy-1'};
const source=(ownerId='synthetic-a')=>({ownerId,id:'synthetic-lab',revision:'revision-1',kind:'lab',timeZone:null,
 provenance:{scope:'synthetic-reference',sourceId:'fixture-lab',sourceVersion:'fixture-v1'},
 payload:{marker:'ldl',value:0,unit:'mmol/L',measuredAt:'2026-11-18T12:00:00Z',laboratory:'Synthetic only',method:'unknown',fasting:'unknown',referenceLow:null,referenceHigh:null,notes:''}});
const request=()=>({version:PRIVATE_DATA_PROTOCOL,operation:'read-source' as const,context:{...context},sourceId:'synthetic-lab',sourceRevision:'revision-1'});
const cloud:DataExecutionTransport={mode:'bloom_cloud',execute:async()=>({version:PRIVATE_DATA_PROTOCOL,status:'unavailable'})};
test('default/off composition returns the exact existing cloud adapter and touches no prototype authority',async()=>{
 let reads=0;
 const local=createSyntheticPrivateTransport({fixtures:[{malformed:'not parsed while disabled'}],authority:async()=>{reads++;throw Error('must not read');}});
 assert.equal(selectDataExecutionTransport({cloud,localPrototype:local}),cloud);
 assert.equal(selectDataExecutionTransport({cloud,mode:'bloom_cloud',prototypeEnabled:true,localPrototype:local}),cloud);
 assert.throws(()=>selectDataExecutionTransport({cloud,mode:'local_private',localPrototype:local}));
 assert.throws(()=>selectDataExecutionTransport({cloud,mode:'customer_gateway',prototypeEnabled:true,localPrototype:local}));
 assert.equal((await local.execute(request())).status,'unavailable');assert.equal(reads,0);
});
test('explicit synthetic read preserves original zero/unknown provenance and cannot mutate stored fixtures',async()=>{
 const original=source();const local=createSyntheticPrivateTransport({enabled:true,fixtureContext:{...context},fixtures:[original],authority:async()=>({...context,permitted:true})});
 assert.equal(selectDataExecutionTransport({cloud,mode:'local_private',prototypeEnabled:true,localPrototype:local}),local);
 original.payload.value=99;
 const result=await local.execute(request());assert.equal(result.status,'available');
 if(result.status!=='available')throw Error('missing fixture');
 assert.equal(result.source.timeZone,null);assert.equal(result.source.payload.value,0);assert.equal(result.source.payload.referenceLow,null);assert.equal(result.externalTransferPermitted,false);
 result.source.payload.value=88;
 const reread=await local.execute(request());assert.equal(reread.status,'available');
 if(reread.status==='available')assert.equal(reread.source.payload.value,0);
});
test('owner, source revision, purpose, source/consent epoch and policy mismatch disclose no source payload',async()=>{
 const local=createSyntheticPrivateTransport({enabled:true,fixtureContext:{...context},fixtures:[source()],authority:async()=>({...context,permitted:true})});
 for(const change of [{actorId:'synthetic-b'},{sourceEpoch:'source-old'},{consentEpoch:'consent-old'},{policyRevision:'policy-old'},{purpose:'tracking'}]){
  const altered={...request(),context:{...context,...change}};
  assert.deepEqual(await local.execute(altered as any),{version:PRIVATE_DATA_PROTOCOL,status:'unavailable'});
 }
 assert.equal((await local.execute({...request(),sourceRevision:'old'})).status,'unavailable');
});
test('revocation or source/policy change during a delayed read withholds the already-built response',async()=>{
 for(const change of [{permitted:false},{sourceEpoch:'source-2'},{consentEpoch:'consent-2'},{policyRevision:'policy-2'},{actorId:'synthetic-b'}]){
  let calls=0;const local=createSyntheticPrivateTransport({enabled:true,fixtureContext:{...context},fixtures:[source()],authority:async()=>{
   calls++;return {...context,permitted:true,...(calls>1?change:{})} as SyntheticPrivateAuthority;
  }});
  assert.deepEqual(await local.execute(request()),{version:PRIVATE_DATA_PROTOCOL,status:'unavailable'});assert.equal(calls,2);
 }
});
test('strict bounded codec rejects URL/credential/code arguments, writes and duplicate or oversized fixture stores',async()=>{
 let reads=0;const local=createSyntheticPrivateTransport({enabled:true,fixtureContext:{...context},fixtures:[source()],authority:async()=>{reads++;return {...context,permitted:true};}});
 for(const extra of [{url:'https://example.invalid'},{DATABASE_URL:'synthetic-no-credentials'},{code:'print(1)'},{operation:'write-source'},{version:'unrecognized'}])
  assert.equal((await local.execute({...request(),...extra} as any)).status,'unavailable');
 assert.equal((await local.execute({...request(),extra:'x'.repeat(20000)} as any)).status,'unavailable');assert.equal(reads,0);
 assert.throws(()=>createSyntheticPrivateTransport({enabled:true,fixtureContext:{...context},fixtures:[source(),source()],authority:async()=>({...context,permitted:true})}));
 assert.throws(()=>createSyntheticPrivateTransport({enabled:true,fixtureContext:{...context},fixtures:Array(21).fill(source()),authority:async()=>({...context,permitted:true})}));
 const malformed=source();malformed.payload.unit='unsupported';
 assert.throws(()=>createSyntheticPrivateTransport({enabled:true,fixtureContext:{...context},fixtures:[malformed],authority:async()=>({...context,permitted:true})}));
});

test('observed revocation or epoch change cannot be undone by replaying old authority on an immutable fixture snapshot',async()=>{
 let current:SyntheticPrivateAuthority={...context,permitted:true};
 const local=createSyntheticPrivateTransport({enabled:true,fixtureContext:{...context},fixtures:[source()],authority:async()=>current});
 assert.equal((await local.execute(request())).status,'available');
 current={...current,sourceEpoch:'source-2'};
 assert.equal((await local.execute(request())).status,'unavailable');
 assert.equal((await local.execute({...request(),context:{...context,sourceEpoch:'source-2'}})).status,'unavailable');
 current={...context,permitted:true};
 assert.equal((await local.execute(request())).status,'unavailable');
 assert.throws(()=>createSyntheticPrivateTransport({enabled:true,fixtureContext:{...context},fixtures:[source('synthetic-b')],authority:async()=>current}));
});

test('concurrent observed revocation suppresses an older read even if its authority callback later returns an old epoch',async()=>{
 let current:SyntheticPrivateAuthority={...context,permitted:true},calls=0;
 let release:(()=>void)|undefined;
 const local=createSyntheticPrivateTransport({enabled:true,fixtureContext:{...context},fixtures:[source()],authority:async()=>{
  calls++;if(calls===2)await new Promise<void>(resolve=>{release=resolve;});return {...current};
 }});
 const pending=local.execute(request());
 await new Promise<void>(resolve=>setImmediate(resolve));
 assert.ok(release,'first read is paused at its final authority recheck');
 current={...current,sourceEpoch:'source-2'};
 assert.equal((await local.execute(request())).status,'unavailable');
 current={...context,permitted:true};release();
 assert.equal((await pending).status,'unavailable');
});
