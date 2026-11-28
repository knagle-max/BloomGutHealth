import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {randomBytes,randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {ExperienceStorage} from '../server/experience-storage';
import {registerExperienceRoutes} from '../server/experience-routes';
import {symptomRegionChoices,symptomRegionSource} from '../shared/localized-symptoms';
import {exerciseCatalogue,exerciseCatalogueVersion} from '../shared/exercise-catalogue';
import {movementProgressionSafety,symptomMovementHeader,symptomMovementVersion,legacySymptomMovementView} from '../shared/symptom-movement';
const exercise={id:exerciseCatalogue[0].id,version:exerciseCatalogueVersion,match:'selected' as const,confirmed:true};
test('movement observations use owned encrypted canonical revisions, compatible readers/writers and non-resurrecting retries',async()=>{
 const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();let server:ReturnType<ReturnType<typeof express>['listen']>|undefined;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));const store=new ExperienceStorage(drizzle(pg)as any);
  const lifecycleId=await store.ensureExperienceLifecycle('a'),payload={version:1,lifecycleId,revision:randomUUID(),previousRevision:null,type:'pain',location:{source:symptomRegionSource,view:'front',regionId:symptomRegionChoices.front[0].id,laterality:'unspecified'},observedAt:'2026-11-28T10:00:00Z',timeZone:'UTC',onsetAt:null,severity:null,durationMinutes:null,ongoing:true,notes:'Synthetic movement observation',source:'user-reported',movement:{exercise,label:'Synthetic chosen movement',response:'worse',confirmedByUser:true}};
  const app=express();app.use(express.json());registerExperienceRoutes(app,((req:any,res:any,next:any)=>{req.session={userId:req.get('x-user')};return ['a','b'].includes(req.session.userId)?next():res.sendStatus(401);})as any,store as any,{}as any);server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server!.once('listening',r));const origin=`http://127.0.0.1:${(server.address()as any).port}/api/experience`;
  const request=async(path:string,method='GET',body?:unknown,user='a',aware=true)=>{const response=await fetch(origin+path,{method,headers:{'content-type':'application/json','x-user':user,...(aware?{[symptomMovementHeader]:symptomMovementVersion}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return{status:response.status,vary:response.headers.get('vary'),body:await response.json().catch(()=>null)as any};};
  const command={kind:'localized-symptom',payload};const first=await request('/records','POST',command);assert.equal(first.status,201);const id=first.body.id;assert.deepEqual(first.body.payload.movement,payload.movement);assert.equal((await request('/records','POST',command)).body.id,id);assert.equal((await store.getExperienceRecords('a','localized-symptom')).length,1);
  const legacy=await request('/records?kind=localized-symptom','GET',undefined,'a',false);assert.match(legacy.vary!,/X-Bloom-Symptom-Fields/i);assert.equal(legacy.body[0].payload.movement,undefined);assert.deepEqual((await request('/records?kind=localized-symptom')).body[0].payload.movement,payload.movement);
  assert.deepEqual((await request('/records?kind=localized-symptom','GET',undefined,'b')).body,[]);assert.equal((await request('/records/'+id,'PUT',command,'b')).status,404);
  assert.equal((await request('/records','POST',{...command,payload:{...payload,revision:randomUUID(),movement:{...payload.movement,exercise:{...exercise,id:'exercise.'+'0'.repeat(24)}}}})).status,400);
  assert.equal((await request('/records','POST',{...command,payload:{...payload,revision:randomUUID(),movement:{...payload.movement,confirmedByUser:false}}})).status,400);
  const foreignCustom=randomUUID();await store.putExperienceSettings('b',{exerciseCatalogue:{favourites:[],custom:[{id:foreignCustom,name:'Synthetic other-account movement',aliases:[],category:'Custom exercise',equipment:[]}]}});
  assert.equal((await request('/records','POST',{...command,payload:{...payload,revision:randomUUID(),movement:{...payload.movement,exercise:{...exercise,id:'custom.'+foreignCustom,version:'account-custom-v1'}}}})).status,400);
  const legacyEdit={kind:'localized-symptom',payload:{...legacy.body[0].payload,revision:randomUUID(),previousRevision:payload.revision,notes:'Synthetic legacy correction'}};const corrected=await request('/records/'+id,'PUT',legacyEdit,'a',false);assert.equal(corrected.status,200);assert.equal(corrected.body.payload.movement,undefined);assert.deepEqual((await store.getExperienceRecords('a','localized-symptom'))[0].payload.movement,payload.movement);assert.equal((await request('/records/'+id,'PUT',legacyEdit,'a',false)).status,200,'Unaware retry reuses its revision without dropping linkage');
  const evaluate=async()=>movementProgressionSafety(exercise,{ownerId:'a',available:true,records:await store.getExperienceRecords('a')},{actorId:'a',asOf:new Date().toISOString()});assert.equal((await evaluate()).state,'SAFETY_HOLD');
  const next={...payload,revision:randomUUID(),previousRevision:legacyEdit.payload.revision,movement:{...payload.movement,response:'better'}};assert.equal((await request('/records/'+id,'PUT',{kind:'localized-symptom',payload:next})).status,200);assert.equal((await evaluate()).state,'NO_REPORTED_HOLD');assert.equal((await request('/records','POST',command)).status,409,'Old replay never restores withdrawn worsening');
  const exported=await request('/export','GET',undefined,'a',false);assert.equal(exported.body.records[0].payload.movement.response,'better');const raw=await pg.query('SELECT encrypted_payload FROM experience_records');assert.doesNotMatch(JSON.stringify(raw.rows),/Synthetic chosen movement|Synthetic legacy correction|confirmedByUser/);
  const unchanged=JSON.stringify(exported.body);assert.equal(legacySymptomMovementView(exported.body),exported.body);assert.equal(JSON.stringify(exported.body),unchanged);
  assert.equal((await request('/records/'+id,'DELETE',undefined,'b')).status,404);assert.equal((await request('/records/'+id,'DELETE')).status,204);assert.equal((await evaluate()).state,'NO_REPORTED_HOLD');assert.equal((await request('/records','POST',command)).status,409);assert.equal((await store.getExperienceRecords('a','localized-symptom')).length,0);
 }finally{if(server){server.closeAllConnections();await new Promise<void>(r=>server!.close(()=>r()));}await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
