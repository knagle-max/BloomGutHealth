import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {experienceRecords} from '../shared/schema';
import {experienceEntrySchema,supplementReviewSchema} from '../shared/experience';
import {supplementIntakeSchema,supplementSourceContributions} from '../shared/supplement-intake';
import {ExperienceStorage} from '../server/experience-storage';
import {registerExperienceRoutes} from '../server/experience-routes';
import {encryptPrecision} from '../server/precision-crypto';
import {weeklyReview} from '../shared/practical-planner';

const original={takenAt:'2026-11-16T12:00:00Z',confirmedAt:'2026-11-16T13:00:00Z',confirmedTaken:true,
 servings:1,label:{source:'manual',id:'private-label',name:'Synthetic exact formulation',brand:'Synthetic',servingDescription:'1 tablet',servingGrams:null,
 perServing:{protein_g:0,iron_mg:10,magnesium_mg:200,zinc_mg:5,vitamin_c_mg:30,vitamin_a_ug:60},
 retrievedAt:'2026-11-15T11:00:00Z',url:null,notes:[],otherNutrients:[{name:'Magnesium citrate compound',amount:100,unit:'mg'}]},
 mineralBasis:{iron_mg:'elemental-label',magnesium_mg:'unknown',zinc_mg:'compound-weight'},formulation:{labelVersion:null,batch:null}};
const payload=()=>supplementIntakeSchema.parse({version:1,valueKind:'confirmed-supplement-consumption',intentId:'11111111-1111-4111-8111-111111111111',
 revision:'22222222-2222-4222-8222-222222222222',lifecycleId:'33333333-3333-4333-8333-333333333333',original,current:{...original,servings:2},
 corrections:[{revision:'22222222-2222-4222-8222-222222222222',changedAt:'2026-11-17T12:00:00Z',value:{...original,servings:2}}]});

test('only a confirmed current source contributes; original/corrected values, zero, unknown form and compound weight stay distinct',()=>{
 const record={id:'owned',userId:'a',payload:payload()},before=structuredClone(record);
 const view=supplementSourceContributions(record,'a');assert.equal(view.status,'available');assert.equal(view.observations.length,21);
 const amount=(key:string)=>view.observations.find(row=>row.nutrientKey===key)!;
 assert.equal(amount('vitamin_c_mg').amount,60,'Only current2 servings, not original1 plus current2');
 assert.equal(amount('iron_mg').amount,20);assert.equal(amount('iron_mg').mineralBasis,'elemental-label');
 assert.equal(amount('magnesium_mg').nativeAmountPerServing,200);assert.equal(amount('magnesium_mg').amount,null);
 assert.equal(amount('zinc_mg').nativeAmountPerServing,5);assert.equal(amount('zinc_mg').amount,null);
 assert.equal(amount('protein_g').amount,0);assert.equal(amount('protein_g').sourceReportsZero,true);
 assert.equal(amount('sodium_mg').amount,null);assert.equal(amount('sodium_mg').sourceReportsZero,null);
 assert.match(amount('vitamin_a_ug').name,/basis unconfirmed/);
 assert.ok(view.observations.every(row=>row.chemicalForm===null&&row.activityUnit===null&&!row.adequacyAssessment));
 assert.equal(amount('iron_mg').occurredAt,original.takenAt);assert.equal(amount('iron_mg').sourceRetrievedAt,original.label.retrievedAt);
 for(const actor of ['b',undefined])assert.deepEqual(supplementSourceContributions(record,actor),{status:'scope-unavailable',observations:[]});
 const futureValue={...record.payload.current,takenAt:'2026-11-20T12:00:00Z'};
 const scheduled={...record,payload:{...record.payload,current:futureValue,corrections:[{...record.payload.corrections[0],value:futureValue}]}};
 assert.equal(supplementSourceContributions(scheduled,'a').status,'confirmation-before-intake');
 const review=supplementReviewSchema.parse({name:'Synthetic review'});
 assert.equal(supplementSourceContributions({...record,payload:review},'a').status,'unsupported');
 assert.equal(supplementIntakeSchema.safeParse({...record.payload,current:{...record.payload.current,confirmedTaken:false}}).success,false);
 assert.equal(supplementIntakeSchema.safeParse({...record.payload,current:{...record.payload.current,label:{...original.label,source:'usda-local'}}}).success,false);
 assert.equal(supplementIntakeSchema.safeParse({...record.payload,corrections:[]}).success,false,'A correction cannot erase its original provenance');
 assert.equal(supplementIntakeSchema.safeParse({...record.payload,revision:record.payload.intentId}).success,false,'Current revision must identify the actual last correction');
 assert.equal(supplementIntakeSchema.safeParse({...record.payload,corrections:[record.payload.corrections[0],record.payload.corrections[0]]}).success,false);
 const missingServing={...record.payload.current,label:{...record.payload.current.label,servingDescription:''}};
 const uncertain=supplementSourceContributions({...record,payload:{...record.payload,current:missingServing,corrections:[{...record.payload.corrections[0],value:missingServing}]}},'a');
 assert.ok(uncertain.observations.every(row=>row.amount===null&&!row.portionBasisCaptured));
 assert.deepEqual(record,before);
});

test('encrypted explicit reader/export stays owned, generic consumers cannot count it, and every generic producer is denied',async()=>{
 const pg=new PGlite(),prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 let server:ReturnType<ReturnType<typeof express>['listen']>|undefined;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");
  await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
  const database=drizzle(pg),store=new ExperienceStorage(database as any),entry=experienceEntrySchema.parse({kind:'supplement-intake',payload:payload()});
  await database.insert(experienceRecords).values({id:'actual-intake',userId:'a',kind:entry.kind,encryptedPayload:encryptPrecision(entry.payload,'a')});
  await database.insert(experienceRecords).values({id:'spent-intent',userId:'a',kind:'supplement-intent',encryptedPayload:encryptPrecision({spent:true},'a')});
  assert.deepEqual(await store.getExperienceRecords('a'),[]);assert.deepEqual(await store.getExperienceRecords('b','supplement-intake'),[]);
  const [saved]=await store.getExperienceRecords('a','supplement-intake');assert.equal(saved.kind,'supplement-intake');assert.deepEqual(saved.payload,entry.payload);
  assert.equal(weeklyReview([saved],'everyday','2026-11-16').entries,0,'Intake is not an activity or wellbeing outcome');
  const exported=await store.exportExperience('a');assert.deepEqual(exported.records.map(row=>row.id),['actual-intake']);
  assert.equal(JSON.stringify((await pg.query('SELECT encrypted_payload FROM experience_records')).rows).includes(original.label.name),false);
  await assert.rejects(store.insertExperienceRecord('a',entry),/SUPPLEMENT_INTAKE_ACTION_REQUIRED/);
  await assert.rejects(store.updateExperienceRecord('a',saved.id,entry),/SUPPLEMENT_INTAKE_ACTION_REQUIRED/);
  await assert.rejects(store.deleteExperienceRecord('a',saved.id),/SUPPLEMENT_INTAKE_ACTION_REQUIRED/);
  await assert.rejects(store.deleteExperienceRecord('a','spent-intent'),/SUPPLEMENT_INTAKE_ACTION_REQUIRED/);
  assert.equal(await store.deleteExperienceRecord('b',saved.id),false);
  const app=express();app.use(express.json());
  const bound=new Proxy(store,{get(target,key){const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});
  registerExperienceRoutes(app,((req:any,res:any,next:any)=>{const actor=req.get('x-synthetic-owner');if(!['a','b'].includes(actor))return res.sendStatus(401);req.session={userId:actor};next();})as any,bound as any,undefined as any);
  server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server!.once('listening',r));const root=`http://127.0.0.1:${(server.address()as any).port}/api/experience/records`;
  assert.equal((await fetch(root+'?kind=supplement-intake')).status,401);
  const headers={'x-synthetic-owner':'a','content-type':'application/json'};
  const read=await fetch(root+'?kind=supplement-intake',{headers});assert.equal(read.status,200);assert.equal(read.headers.get('cache-control'),'no-store');assert.equal((await read.json()).length,1);
  assert.deepEqual(await(await fetch(root+'?kind=supplement-intake',{headers:{'x-synthetic-owner':'b'}})).json(),[]);
  for(const method of ['POST','PUT','DELETE']){
   const response=await fetch(root+(method==='POST'?'':'/actual-intake'),{method,headers,...(method!=='DELETE'?{body:JSON.stringify(entry)}:{})});assert.equal(response.status,400);
  }
  assert.equal((await new ExperienceStorage(database as any).getExperienceRecords('a','supplement-intake')).length,1);
  await store.clearExperienceData('a');assert.deepEqual(await store.getExperienceRecords('a','supplement-intake'),[]);
 }finally{server?.closeAllConnections();if(server)await new Promise<void>(r=>server!.close(()=>r()));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
