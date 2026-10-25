import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {featureAdminReadGrant,featureReviewManifest,registerFeatureAdministration} from '../server/feature-administration';
import {capabilityRecords,restrictedCapabilityAllowed} from '../server/capability-policy';
const now=Date.parse('2026-10-25T00:00:00Z');
const grant={userId:'synthetic-admin',grantId:'synthetic-review',role:'feature-admin',scopes:['features:read'],serviceId:'srv-syntheticreview',environment:'isolated-synthetic',purpose:'feature-metadata-review',reviewReference:'synthetic-role-review',expiresAt:'2026-10-25T01:00:00Z'};
const env=()=>({BLOOM_FEATURE_ADMIN_ENVIRONMENT:'isolated-synthetic',RENDER_SERVICE_ID:grant.serviceId,BLOOM_FEATURE_ADMINS:JSON.stringify([grant])});
test('admin review role is independently provisioned, expiring and deployment-bound; tester flags and malformed scopes never grant it',()=>{
 assert.equal(featureAdminReadGrant(grant.userId,env(),now),true);
 for(const patch of [{BLOOM_FEATURE_ADMINS:'[]'},{BLOOM_FEATURE_ADMINS:'invalid'},{BLOOM_FEATURE_ADMINS:JSON.stringify([grant,grant])},{BLOOM_FEATURE_ADMINS:JSON.stringify([{...grant,scopes:['features:read','features:write']}])},{BLOOM_FEATURE_ADMINS:JSON.stringify([{...grant,approved:true}])},{BLOOM_FEATURE_ADMIN_ENVIRONMENT:'production'},{RENDER_SERVICE_ID:'srv-other'},{BLOOM_FEATURE_ADMIN_KILL_SWITCH:'true'},{BLOOM_FEATURE_ADMIN_KILL_SWITCH:'FALSE'}])assert.equal(featureAdminReadGrant(grant.userId,{...env(),...patch},now),false);
 assert.equal(featureAdminReadGrant('other',env(),now),false);
 assert.equal(featureAdminReadGrant(grant.userId,env(),Date.parse(grant.expiresAt)),false);
 assert.equal(featureAdminReadGrant(grant.userId,{BLOOM_INTERNAL_TESTERS:JSON.stringify([grant]),BLOOM_EXPERIMENTAL_ENVIRONMENT:'isolated-synthetic'},now),false);
});
test('review manifest separates source flags from readiness, deployed status, scoped approval and activation even for an approved source row',()=>{
 const records=capabilityRecords();const source=structuredClone(records[0]);
 source.approval_status='APPROVED';source.public_enabled=true;(source as any).privateCredential='never-expose';
 const manifest=featureReviewManifest({RENDER_GIT_COMMIT:'a'.repeat(40)},[source]);
 assert.equal(manifest.mode,'READ_ONLY');assert.equal(manifest.buildRevision,'a'.repeat(40));
 assert.equal(manifest.entries[0].status,'Verification pending');assert.equal(manifest.entries[0].implementationReadiness,null);assert.equal(manifest.entries[0].deploymentAvailability,'UNVERIFIED');
 assert.deepEqual(manifest.entries[0].review.approvedScopes,[]);assert.equal(manifest.entries[0].activation.state,'UNCONFIGURED');assert.equal(manifest.entries[0].activation.rolloutPercent,null);
 assert.doesNotMatch(JSON.stringify(manifest),/never-expose|privateCredential/);
 assert.equal(featureReviewManifest({}).entries.length,52);
 for(const category of ['DISABLED_INCIDENT','INTERNAL_RESEARCH_ONLY']){const record={...source,release_category:category};const row=featureReviewManifest({},[record]).entries[0];assert.ok(row.blockers.some(message=>message.includes(category==='DISABLED_INCIDENT'?'Incident-disabled':'Research isolation')));}
 assert.equal(restrictedCapabilityAllowed(source.feature_id),false); // source clone did not grant execution
});
test('actual admin endpoints deny public/tester/non-admin reads and all writes, ignore forged role/approval flags and recheck revoked reads',async()=>{
 let enabled=true,revokeDuringRead=false,reads=0;const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')} as any;next();});
 registerFeatureAdministration(app,(req,res,next)=>req.session.userId?next():void res.sendStatus(401),id=>enabled&&featureAdminReadGrant(id,env(),now),()=>{reads++;if(revokeDuringRead)enabled=false;return featureReviewManifest({});});
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.on('listening',resolve));const base=`http://127.0.0.1:${(server.address() as any).port}`;
 const get=(user:string,path='/api/admin/features')=>fetch(base+path,{headers:{'x-user':user,'x-role':'admin','x-bloom-development':'true'}});
 try{
  assert.equal((await get('')).status,401);
  for(const user of ['ordinary','synthetic-tester']){const response=await get(user);assert.equal(response.status,403);assert.equal(response.headers.get('cache-control'),'no-store');assert.doesNotMatch(await response.text(),/feature_id|registryVersion|reviewedCommit/);}
  assert.equal(reads,0);
  const response=await get(grant.userId);assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal((await response.json()).entries.length,52);
  assert.equal((await get(grant.userId,'/api/admin/features?approved=true&userId=other')).status,400);
  for(const user of ['ordinary',grant.userId]){const write=await fetch(base+'/api/admin/features/bloom.metabolite.scores/control',{method:'POST',headers:{'content-type':'application/json','x-user':user},body:JSON.stringify({enabled:true,approved:true,category:'GENERAL_RELEASE',percent:100})});assert.equal(write.status,403);}
  assert.equal((await get(grant.userId,'/api/admin/unknown')).status,404);
  revokeDuringRead=true;const revoked=await get(grant.userId);assert.equal(revoked.status,403);assert.doesNotMatch(await revoked.text(),/registryVersion|entries/);
  assert.equal((await get(grant.userId)).status,403);assert.equal(restrictedCapabilityAllowed('bloom.metabolite.scores'),false);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
