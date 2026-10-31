import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {inspectCapabilityCrosswalk} from '../scripts/lib/capability-crosswalk';
const registry={version:'synthetic',features:[{feature_id:'synthetic.a'}]};
const fixture=()=>({version:1,registryVersion:'synthetic',scope:'Synthetic source coverage only',entries:[{featureId:'synthetic.a',implementation:'MIXED_REQUIRES_REVIEW',surfaces:{ui:['client/src/fixture.tsx'],api:[],logicOrJobs:[],storedOrExported:[],cache:[]},observation:'Synthetic source; no approval asserted',authorizationReview:'REVIEW_REQUIRED'}]});
test('crosswalk checks exact registry coverage, keeps review pending and detects changed source without executing it',async()=>{
 let reads=0;const read=async()=>{reads++;return 'throw new Error("Never execute source");';};
 const first=await inspectCapabilityCrosswalk(fixture(),registry,read);assert.equal(first.unchanged,false);assert.equal(reads,1);
 const stored={...fixture(),sourceHashes:first.hashes};
 assert.equal((await inspectCapabilityCrosswalk(stored,registry,read)).unchanged,true);
 assert.equal((await inspectCapabilityCrosswalk(stored,registry,async()=>"changed source")).unchanged,false);
 for(const mutate of [(p:any)=>p.entries=[],(p:any)=>p.entries.push(p.entries[0]),(p:any)=>p.entries[0].featureId='unknown',(p:any)=>p.registryVersion='stale',(p:any)=>p.entries[0].authorizationReview='APPROVED',(p:any)=>p.entries[0].surfaces.ui=['server/../../private.ts']]){const input=fixture();mutate(input);await assert.rejects(()=>inspectCapabilityCrosswalk(input,registry,read));}
});
test('repository crosswalk covers every provisional feature and current referenced source; no source row promotes authorization',async()=>{
 const root=new URL('../',import.meta.url),registry=JSON.parse(await readFile(new URL('docs/architecture/LEGAL_PROVISIONAL_FEATURE_REGISTRY_2026-10-24.json',root),'utf8'));
 const input=JSON.parse(await readFile(new URL('docs/operations/CAPABILITY_EXPOSURE_MAP.json',root),'utf8'));
 const result=await inspectCapabilityCrosswalk(input,registry,path=>readFile(new URL(path,root),'utf8'));
 assert.equal(result.map.entries.length,registry.features.length);assert.equal(result.unchanged,true);
 assert.ok(result.map.entries.every(row=>row.authorizationReview==='REVIEW_REQUIRED'));
 assert.equal(result.map.entries.find(row=>row.featureId==='bloom.billing')?.implementation,'NOT_IMPLEMENTED');
 assert.ok(result.map.entries.find(row=>row.featureId==='bloom.optimizer.rules')?.surfaces.logicOrJobs.includes('server/weekly-worker.ts'));
});
