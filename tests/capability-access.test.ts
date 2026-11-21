import test from 'node:test';import assert from 'node:assert/strict';import express from 'express';import {PGlite} from '@electric-sql/pglite';import {drizzle} from 'drizzle-orm/pglite';import {readFile} from 'node:fs/promises';
import {internalPreviewGrant,registerCapabilityAccess,CapabilityPreferenceStorage} from '../server/capability-access';
import {createHash} from 'node:crypto';
const grant={serviceId:'srv-syntheticreview',userId:'a',grantId:'review-1',expiresAt:'2026-12-01T00:00:00Z',territories:['CA'],reviewReference:'synthetic-review-reference',allowedCapabilities:['bloom.dev.preview']};
const env={RENDER_SERVICE_ID:'srv-syntheticreview',BLOOM_EXPERIMENTAL_ENVIRONMENT:'isolated-synthetic',BLOOM_PREVIEW_TERRITORY:'CA',BLOOM_INTERNAL_TESTERS:JSON.stringify([grant])};
test('explicit standing internal access survives dates while temporary fingerprints and expiry remain unchanged',()=>{
 const {expiresAt,...scope}=grant,standing={...scope,grantType:'standing-internal'};
 const scoped={...env,BLOOM_INTERNAL_TESTERS:JSON.stringify([standing])};
 for(const date of ['2026-11-15T00:00:00Z','2026-11-22T15:06:15Z','2035-01-01T00:00:00Z'])assert.ok(internalPreviewGrant('a',scoped,Date.parse(date)));
 assert.equal(internalPreviewGrant('a',env,Date.parse('2026-11-15T00:00:00Z'))?.fingerprint,createHash('sha256').update(JSON.stringify(grant)).digest('hex'),'Legacy serialized scope remains byte-identical');
 assert.equal(internalPreviewGrant('a',env,Date.parse(expiresAt)),null);
 for(const invalid of [scope,{...standing,grantType:'standing'},{...standing,expiresAt:'2035-01-01T00:00:00Z'},{...scope,expiresAt:null},{...standing,userId:undefined},{...standing,allowedCapabilities:[]}])assert.equal(internalPreviewGrant('a',{...env,BLOOM_INTERNAL_TESTERS:JSON.stringify([invalid])},Date.parse('2026-11-15T00:00:00Z')),null);
});
test('standing eligibility retains scope, duplicates and immediate kill/revocation guards',()=>{
 const {expiresAt,...scope}=grant,standing={...scope,grantType:'standing-internal',uiPreview:{purpose:'synthetic-ui-review',dataset:'synthetic-only',features:['bloom.food.photo_ai']},allowedCapabilities:['bloom.dev.preview','bloom.food.photo_ai']};
 const scoped={...env,BLOOM_INTERNAL_TESTERS:JSON.stringify([standing])},now=Date.parse('2035-01-01T00:00:00Z');
 assert.deepEqual(internalPreviewGrant('a',scoped,now)?.uiFeatures,['bloom.food.photo_ai']);
 for(const candidate of [{...scoped,RENDER_SERVICE_ID:'srv-other'},{...scoped,BLOOM_PREVIEW_TERRITORY:'US'},{...scoped,BLOOM_EXPERIMENTAL_ENVIRONMENT:'production'},{...scoped,BLOOM_EXPERIMENTAL_KILL_SWITCH:'true'},{...scoped,BLOOM_INTERNAL_TESTERS:'[]'},{...scoped,BLOOM_ADDITIONAL_INTERNAL_TESTER_GRANT:JSON.stringify(standing)}])assert.equal(internalPreviewGrant('a',candidate,now),null);
 assert.equal(internalPreviewGrant('b',scoped,now),null);
 assert.notEqual(internalPreviewGrant('a',scoped,now)?.fingerprint,internalPreviewGrant('a',{...scoped,BLOOM_INTERNAL_TESTERS:JSON.stringify([{...standing,allowedCapabilities:['bloom.dev.preview']}])},now)?.fingerprint);
});
test('standing preference transition stays scoped and compare-and-set; HTTP checks continue beyond expiry',async()=>{
 const pg=new PGlite();let revoked=false;
 const {expiresAt,...scope}=grant,standing={...scope,grantType:'standing-internal'},now=Date.parse('2035-01-01T00:00:00Z');
 const scoped={...env,BLOOM_INTERNAL_TESTERS:JSON.stringify([standing])};
 const oldFingerprint=internalPreviewGrant('a',env,Date.parse('2026-11-15T00:00:00Z'))!.fingerprint,newFingerprint=internalPreviewGrant('a',scoped,now)!.fingerprint;
 await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");
 await pg.exec(await readFile(new URL('../migrations/0008_capability_preferences.sql',import.meta.url),'utf8'));
 const store=new CapabilityPreferenceStorage(drizzle(pg) as any);await store.put('a',true,oldFingerprint);await store.put('b',false,'other-account-fingerprint');const otherBefore=await store.get('b');
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.headers['x-user']} as any;next();});
 registerCapabilityAccess(app,(req,res,next)=>req.session.userId?next():void res.sendStatus(401),store,id=>revoked?null:internalPreviewGrant(id,scoped,now));
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base='http://127.0.0.1:'+(server.address() as any).port+'/api/capabilities';
 const get=(id='a')=>fetch(base,{headers:{'x-user':id}}),patch=(enabled:boolean)=>fetch(base+'/experimental',{method:'PATCH',headers:{'x-user':'a','content-type':'application/json'},body:JSON.stringify({enabled})});
 try{
  const response=await get();assert.equal(response.headers.get('cache-control'),'no-store');const before=await response.json();assert.equal(before.eligible,true);assert.equal(before.experimentalEnabled,false,'Changing raw grant never automatically re-enables a stale preference');
  const rebind=()=>pg.query('UPDATE capability_preferences SET grant_fingerprint=$1 WHERE user_id=$2 AND grant_fingerprint=$3 RETURNING enabled',[newFingerprint,'a',oldFingerprint]);
  assert.equal((await rebind()).rows.length,1);assert.equal((await rebind()).rows.length,0,'Stale transition cannot overwrite a newer preference');
  assert.equal((await(await get()).json()).experimentalEnabled,true);assert.deepEqual((await(await get()).json()).capabilities,[]);
  assert.deepEqual(await store.get('b'),otherBefore);assert.equal((await(await get('b')).json()).eligible,false);
  assert.equal((await patch(false)).status,200);assert.equal((await(await get()).json()).experimentalEnabled,false);
  assert.equal((await patch(true)).status,200);assert.equal((await(await get()).json()).experimentalEnabled,true);
  revoked=true;assert.equal((await patch(true)).status,403);assert.equal((await(await get()).json()).eligible,false);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();}
});
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
