import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {internalPreviewGrant,registerCapabilityAccess,CapabilityPreferenceStorage} from '../server/capability-access';
import {experimentalWorkspace} from '../server/experimental-workspace';
import {activeExperimentalEntries,experimentalDisplayIds,experimentalWorkspaceVersion,experimentalEntrySchema} from '../shared/development-features';
const grant={serviceId:'srv-test',userId:'synthetic-a',grantId:'synthetic-workspace',expiresAt:'2035-01-01T00:00:00Z',territories:['CA'],reviewReference:'synthetic-local-validation',allowedCapabilities:['bloom.dev.preview']};
const now=Date.parse('2026-11-20T00:00:00Z');
const environment=(value:unknown)=>({RENDER_SERVICE_ID:'srv-test',BLOOM_EXPERIMENTAL_ENVIRONMENT:'isolated-synthetic',BLOOM_PREVIEW_TERRITORY:'CA',BLOOM_INTERNAL_TESTERS:JSON.stringify([value])});
const metadataPreview={purpose:'development-status-review',features:[...experimentalDisplayIds]};
const uiPreview={purpose:'synthetic-ui-review',dataset:'synthetic-only',features:['bloom.food.photo_ai']};
const preview={id:'bloom.food.photo_ai',readiness:'IN_DEVELOPMENT',category:'HIDDEN_PENDING_APPROVAL',approval:'PROPOSED',label:'In development',outputClass:'synthetic-ui-only'} as const;
const snapshot=(entries:unknown,legacy:boolean=false)=>({eligible:true,experimentalEnabled:true,experimentalWorkspaceVersion,experimentalEntries:entries,developmentFeatures:legacy?[preview]:[]} as any);

test('legacy grant fingerprint remains exact; metadata authority is explicit and independently scoped',()=>{
 assert.equal(internalPreviewGrant(grant.userId,environment(grant),now)?.fingerprint,createHash('sha256').update(JSON.stringify(grant)).digest('hex'));
 const {expiresAt,...standingScope}=grant;const standing={...standingScope,grantType:'standing-internal',expiresAt:null};
 assert.equal(internalPreviewGrant(grant.userId,environment(standing),now)?.fingerprint,createHash('sha256').update(JSON.stringify(standing)).digest('hex'),'Legacy standing scope remains byte-identical');
 const scoped=internalPreviewGrant(grant.userId,environment({...grant,metadataPreview}),now)!;
 assert.deepEqual(scoped.metadataFeatures,experimentalDisplayIds);assert.equal(scoped.uiFeatures,undefined);
 assert.equal(experimentalWorkspace(scoped.metadataFeatures).length,6,'Incident-disabled genetics stays hidden');
 assert.ok(experimentalWorkspace(scoped.metadataFeatures).every(row=>!row.actionAllowed&&!row.route));
 assert.notEqual(scoped.fingerprint,internalPreviewGrant(grant.userId,environment(grant),now)?.fingerprint);
});
test('unknown, duplicate or malformed metadata and widened UI grants fail closed',()=>{
 for(const metadata of [{...metadataPreview,features:['unknown']},{...metadataPreview,features:['bloom.healthkit','bloom.healthkit']},{...metadataPreview,purpose:'execute'},{...metadataPreview,features:[]},{...metadataPreview,privateEvidence:'not permitted'}])assert.equal(internalPreviewGrant(grant.userId,environment({...grant,metadataPreview:metadata}),now),null);
 assert.equal(internalPreviewGrant(grant.userId,environment({...grant,uiPreview:{...uiPreview,features:['bloom.microbiome.flux']}}),now),null);
 for(const changes of [{RENDER_SERVICE_ID:'srv-other'},{BLOOM_PREVIEW_TERRITORY:'US'},{BLOOM_EXPERIMENTAL_ENVIRONMENT:'production'},{BLOOM_EXPERIMENTAL_KILL_SWITCH:'true'}])assert.equal(internalPreviewGrant(grant.userId,{...environment({...grant,metadataPreview}),...changes},now),null);
 assert.equal(internalPreviewGrant('synthetic-b',environment({...grant,metadataPreview}),now),null);
 assert.equal(internalPreviewGrant(grant.userId,environment({...grant,metadataPreview}),Date.parse(grant.expiresAt)),null);
});
test('only legacy-scoped photo preview receives a route; source restrictions stay explicit',()=>{
 assert.deepEqual(experimentalWorkspace(['unknown']),[]);
 const rows=experimentalWorkspace(experimentalDisplayIds,[preview]);
 assert.equal(rows.length,6);assert.equal(rows.filter(row=>row.actionAllowed).length,1);
 const photo=rows.find(row=>row.id===preview.id)!;assert.equal(photo.route,'/log-meal?method=photo');assert.equal(photo.sourceClass,'SYNTHETIC_ONLY');
 const research=rows.find(row=>row.id==='bloom.microbiome.flux')!;assert.equal(research.visibilityStatus,'RESTRICTED');assert.equal(research.interaction,'INFO_ONLY');
 assert.equal(activeExperimentalEntries(snapshot(rows)).some(row=>row.actionAllowed),false);
 assert.equal(activeExperimentalEntries(snapshot(rows,true)).length,6);
});
test('unrecognized version, unsafe routes, inconsistent actions and duplicates never render as executable',()=>{
 const rows=experimentalWorkspace(['bloom.healthkit'],[preview]);
 for(const value of [{...snapshot(rows,true),experimentalEnabled:false},{...snapshot(rows,true),eligible:false},{...snapshot(rows,true),eligible:'true'},{...snapshot(rows,true),experimentalWorkspaceVersion:'future'},snapshot([...rows,rows[0]],true),snapshot([{...rows[0],route:'https://example.invalid'}],true),snapshot([{...rows[0],id:'unknown'}],true)])assert.deepEqual(activeExperimentalEntries(value),[]);
 for(const changes of [{route:'//example.invalid'},{route:'javascript:alert(1)'},{actionAllowed:false},{sourceClass:'ACTUAL_AUTHORIZED'},{visibilityStatus:'AVAILABLE_FOR_TESTING'}])assert.equal(experimentalEntrySchema.safeParse({...rows[0],...changes}).success,false);
 const info=rows.find(row=>!row.actionAllowed)!;assert.equal(experimentalEntrySchema.safeParse({...info,visibilityStatus:'PLANNED',readiness:'PLANNED'}).success,true);
});
test('actual authenticated HTTP and SQL store keep metadata preference scoped, default OFF and revocable',async()=>{
 const pg=new PGlite();const env=environment({...grant,metadataPreview});let revokeDuringRead=false;
 await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('synthetic-a'),('synthetic-b');");
 await pg.exec(await readFile(new URL('../migrations/0008_capability_preferences.sql',import.meta.url),'utf8'));
 const store=new CapabilityPreferenceStorage(drizzle(pg) as any),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.header('x-synthetic-actor')} as any;next();});
 registerCapabilityAccess(app,(req,res,next)=>req.session.userId?next():void res.sendStatus(401),{get:async id=>{const value=await store.get(id);if(revokeDuringRead)env.BLOOM_EXPERIMENTAL_KILL_SWITCH='true';return value;},put:store.put.bind(store)},id=>internalPreviewGrant(id,env,now),()=>false);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base='http://127.0.0.1:'+(server.address() as any).port+'/api/capabilities';
 const get=(actor=grant.userId)=>fetch(base,{headers:{'x-synthetic-actor':actor}}),patch=(body:unknown)=>fetch(base+'/experimental',{method:'PATCH',headers:{'x-synthetic-actor':grant.userId,'content-type':'application/json'},body:JSON.stringify(body)});
 try{
  assert.equal((await get('')).status,401);assert.deepEqual((await(await get()).json()).experimentalEntries,[]);
  assert.equal((await patch({enabled:true,metadataPreview})).status,400);assert.equal((await patch({enabled:true})).status,200);
  const response=await get();assert.equal(response.headers.get('cache-control'),'no-store');const enabled=await response.json();assert.equal(enabled.experimentalEntries.length,6);assert.deepEqual(enabled.developmentFeatures,[]);assert.deepEqual(enabled.capabilities,[]);
  assert.ok(enabled.experimentalEntries.every((row:any)=>!row.actionAllowed));assert.equal((await(await get('synthetic-b')).json()).eligible,false);assert.equal(await store.get('synthetic-b'),null);
  env.BLOOM_INTERNAL_TESTERS=JSON.stringify([{...grant,metadataPreview,uiPreview,allowedCapabilities:[...grant.allowedCapabilities,'bloom.food.photo_ai']}]);
  assert.equal((await(await get()).json()).experimentalEnabled,false,'Changed grant cannot revive a stale saved preference');
  await patch({enabled:true});const previewState=await(await get()).json();assert.equal(activeExperimentalEntries(previewState).filter(row=>row.actionAllowed).length,1);
  await patch({enabled:false});assert.deepEqual((await(await get()).json()).experimentalEntries,[]);
  await patch({enabled:true});revokeDuringRead=true;assert.deepEqual((await(await get()).json()).experimentalEntries,[]);assert.equal((await patch({enabled:true})).status,403);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));await pg.close();}
});
