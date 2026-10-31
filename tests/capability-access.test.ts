import test from 'node:test';import assert from 'node:assert/strict';import express from 'express';import {PGlite} from '@electric-sql/pglite';import {drizzle} from 'drizzle-orm/pglite';import {readFile} from 'node:fs/promises';
import {internalPreviewGrant,registerCapabilityAccess,CapabilityPreferenceStorage} from '../server/capability-access';
const grant={serviceId:'srv-syntheticreview',userId:'a',grantId:'review-1',expiresAt:'2026-12-01T00:00:00Z',territories:['CA'],reviewReference:'synthetic-review-reference',allowedCapabilities:['bloom.dev.preview']};
const env={RENDER_SERVICE_ID:'srv-syntheticreview',BLOOM_EXPERIMENTAL_ENVIRONMENT:'isolated-synthetic',BLOOM_PREVIEW_TERRITORY:'CA',BLOOM_INTERNAL_TESTERS:JSON.stringify([grant])};
test('internal preference grants require trusted environment, identity, territory, expiry and non-duplicated provisioning',()=>{
 const now=+new Date('2026-10-24T00:00:00Z');assert.ok(internalPreviewGrant('a',env,now));
 for(const candidate of [{...env,RENDER_SERVICE_ID:undefined},{...env,RENDER_SERVICE_ID:'srv-anotherreview'},{...env,BLOOM_INTERNAL_TESTERS:JSON.stringify([{...grant,serviceId:undefined}])},{...env,BLOOM_EXPERIMENTAL_ENVIRONMENT:'production'},{...env,BLOOM_PREVIEW_TERRITORY:'US'},{...env,BLOOM_EXPERIMENTAL_KILL_SWITCH:'true'},{...env,BLOOM_INTERNAL_TESTERS:'invalid'},{...env,BLOOM_INTERNAL_TESTERS:JSON.stringify([grant,grant])}])assert.equal(internalPreviewGrant('a',candidate,now),null);
 assert.equal(internalPreviewGrant('a',env,NaN),null);assert.equal(internalPreviewGrant('b',env,now),null);assert.equal(internalPreviewGrant('a',env,+new Date(grant.expiresAt)),null);
 assert.notEqual(internalPreviewGrant('a',env,now)?.fingerprint,internalPreviewGrant('a',{...env,BLOOM_INTERNAL_TESTERS:JSON.stringify([{...grant,grantId:'review-2'}])},now)?.fingerprint);
});
test('preference storage is account-scoped, additive and cascades on active account deletion',async()=>{
 const pg=new PGlite();try{await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");const migration=await readFile(new URL('../migrations/0008_capability_preferences.sql',import.meta.url),'utf8');await pg.exec(migration);await pg.exec(migration);const store=new CapabilityPreferenceStorage(drizzle(pg) as any);assert.equal(await store.get('a'),null);await store.put('a',true,'grant-a');assert.equal((await store.get('a'))?.enabled,true);assert.equal(await store.get('b'),null);await pg.exec("DELETE FROM users WHERE id='a'");assert.equal(await store.get('a'),null);}finally{await pg.close();}
});
test('preference API denies self-enrollment, ignores stale grants and rechecks revocation after save',async()=>{
 const rows=new Map<string,any>();let eligible=true,revokeDuringSave=false,loads=0;
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.headers['x-user']} as any;next();});
 registerCapabilityAccess(app,(req,res,next)=>req.session.userId?next():void res.sendStatus(401),{get:async id=>{loads++;return rows.get(id)||null;},put:async(id,enabled,grantFingerprint)=>{rows.set(id,{enabled,grantFingerprint});if(revokeDuringSave)eligible=false;}},id=>eligible&&id==='a'?{fingerprint:'grant-a'}:null);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.on('listening',r));const base='http://127.0.0.1:'+(server.address() as any).port+'/api/capabilities';
 const get=(user='a')=>fetch(base,{headers:{'x-user':user}});const patch=(body:any,user='a')=>fetch(base+'/experimental',{method:'PATCH',headers:{'x-user':user,'content-type':'application/json'},body:JSON.stringify(body)});
 try{assert.equal((await get('')).status,401);assert.equal((await (await get('b')).json()).eligible,false);assert.equal(loads,0);assert.equal((await patch({enabled:true},'b')).status,403);assert.equal((await patch({enabled:true,userId:'b',approved:true})).status,400);assert.equal((await (await get()).json()).experimentalEnabled,false);await patch({enabled:true});assert.equal((await (await get()).json()).experimentalEnabled,true);assert.deepEqual((await (await get()).json()).capabilities,[]);rows.set('a',{enabled:true,grantFingerprint:'old-grant'});assert.equal((await (await get()).json()).experimentalEnabled,false);revokeDuringSave=true;assert.equal((await patch({enabled:true})).status,403);assert.equal(rows.get('a').enabled,false);assert.equal((await (await get()).json()).eligible,false);}finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});

test('a supplemental tester grant preserves other grants and cannot override duplicate identities',()=>{
 const now=Date.parse('2026-10-24T00:00:00Z');
 const extra={...grant,userId:'tester1',grantId:'supplemental-1'};
 const scoped={...env,BLOOM_ADDITIONAL_INTERNAL_TESTER_GRANT:JSON.stringify(extra)};
 assert.ok(internalPreviewGrant('tester1',scoped,now));
 assert.ok(internalPreviewGrant('a',scoped,now));
 assert.equal(internalPreviewGrant('other',scoped,now),null);
 assert.equal(internalPreviewGrant('a',{...scoped,BLOOM_ADDITIONAL_INTERNAL_TESTER_GRANT:JSON.stringify(grant)},now),null);
});

test('malformed optional tester provisioning never revokes unrelated base access and never self-grants',()=>{
 const now=Date.parse('2026-10-24T00:00:00Z');for(const raw of ['invalid','null',JSON.stringify({...grant,userId:'other',unexpected:true})]){const scoped={...env,BLOOM_ADDITIONAL_INTERNAL_TESTER_GRANT:raw};assert.ok(internalPreviewGrant('a',scoped,now));assert.equal(internalPreviewGrant('other',scoped,now),null);}
 assert.equal(internalPreviewGrant('a',{...env,BLOOM_ADDITIONAL_INTERNAL_TESTER_GRANT:JSON.stringify({...grant,unexpected:true})},now),null);
});
