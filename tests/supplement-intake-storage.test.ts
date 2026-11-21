import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {users,experienceRecords,experienceSettings} from '../shared/schema';
import {supplementDraftSchema} from '../shared/supplement-commands';
import {supplementSourceContributions} from '../shared/supplement-intake';
import {SupplementIntakeStorage,SupplementIntakeError,supplementReviewRevision} from '../server/supplement-intake-storage';
import {PrivateProductStorage} from '../server/private-product-storage';
import {ExperienceStorage} from '../server/experience-storage';
import {decryptPrecision,encryptPrecision} from '../server/precision-crypto';
const now=new Date('2026-11-18T12:00:00Z');

test('actual encrypted create replays once across source removal/outage, rejects changed intent/source, remains owned and requires a live account epoch',async()=>{
 const pg=new PGlite(),prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");
  for(const file of ['0003_nutrition_products.sql','0004_experience.sql'])await pg.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const database=drizzle(pg),store=new SupplementIntakeStorage(database as any,()=>now),labels=new PrivateProductStorage(database as any),experience=new ExperienceStorage(database as any);
  const label=await labels.insertNutritionProduct('a',{name:'Synthetic supplement label',brand:'Synthetic',servingDescription:'1 tablet',servingGrams:null,perServing:{vitamin_c_mg:30,magnesium_mg:200}});
  await database.insert(experienceSettings).values({userId:'a',encryptedPayload:encryptPrecision({mode:'everyday',futureClientField:{preserve:17}},'a')});
  const lifecycleId=await store.reviewScope('a');
  const[firstSettings]=await database.select().from(experienceSettings).where(eq(experienceSettings.userId,'a'));
  assert.deepEqual(decryptPrecision(firstSettings.encryptedPayload,'a'),{mode:'everyday',futureClientField:{preserve:17},lifecycleId});
  assert.equal(await store.reviewScope('a'),lifecycleId);
  const[unchangedSettings]=await database.select().from(experienceSettings).where(eq(experienceSettings.userId,'a'));assert.equal(+unchangedSettings.updatedAt,+firstSettings.updatedAt);
  await assert.rejects(experience.putExperienceSettings('a',{}),'Public empty settings patches remain invalid');
  const draft=supplementDraftSchema.parse({takenAt:'2026-11-18T10:00:00Z',servings:2,source:{kind:'label',product:{source:'manual',id:label.id}},
   mineralBasis:{iron_mg:'unknown',magnesium_mg:'elemental-label',zinc_mg:'unknown'},formulation:{labelVersion:null,batch:null}});
  const command={intentId:randomUUID(),lifecycleId,draft,confirmedTaken:true as const,reviewRevision:supplementReviewRevision('a',lifecycleId,draft,label)};
  const first=await store.create('a',command,label),replay=await store.recoverCreate('a',command);
  assert.equal(replay?.id,first.id);assert.equal(first.payload.revision,command.intentId);
  assert.equal(first.payload.current.confirmedAt,now.toISOString());assert.equal(first.payload.current.takenAt,draft.takenAt);
  assert.deepEqual(first.payload.original,first.payload.current);assert.deepEqual(first.payload.corrections,[]);
  assert.equal(supplementSourceContributions({id:first.id,userId:'a',payload:first.payload},'a').observations.find(row=>row.nutrientKey==='magnesium_mg')!.amount,400);
  assert.deepEqual(await experience.getExperienceRecords('a'),[]);
  assert.deepEqual(await experience.getExperienceRecords('b','supplement-intake'),[]);
  const changed=supplementDraftSchema.parse({...draft,servings:3});
  await assert.rejects(store.recoverCreate('a',{...command,draft:changed,reviewRevision:supplementReviewRevision('a',lifecycleId,changed,label)}),e=>e instanceof SupplementIntakeError&&e.status===409);
  await assert.rejects(store.create('a',{...command,intentId:randomUUID()},{...label,perServing:{...label.perServing,vitamin_c_mg:99}}),e=>e instanceof SupplementIntakeError&&e.status===409);
  const raceCommand={...command,intentId:randomUUID()};const concurrent=await Promise.all([store.create('a',raceCommand,label),store.create('a',raceCommand,label)]);
  assert.equal(concurrent[0].id,concurrent[1].id);assert.equal((await experience.getExperienceRecords('a','supplement-intake')).length,2);
  const raw=await database.select().from(experienceRecords);assert.doesNotMatch(JSON.stringify(raw),/Synthetic supplement label/);
  await labels.deleteNutritionProduct('a',label.id);
  assert.equal((await store.create('a',command,null)).id,first.id,'Committed retry does not need a current product/source');
  assert.equal((await store.create('a',{...command,intentId:command.intentId.toUpperCase()},null)).id,first.id,'UUID letter case cannot create a second intake');
  await assert.rejects(store.create('a',{...command,intentId:randomUUID()},label),e=>e instanceof SupplementIntakeError&&e.status===409);
  const otherLife=await store.reviewScope('b');
  await assert.rejects(store.create('b',{...command,intentId:randomUUID(),lifecycleId:otherLife,reviewRevision:supplementReviewRevision('b',otherLife,draft,label)},label),e=>e instanceof SupplementIntakeError&&e.status===409);
  await experience.clearExperienceData('a');assert.equal(await store.recoverCreate('a',command),null);
  await assert.rejects(store.create('a',command,label),e=>e instanceof SupplementIntakeError&&e.status===409);
  const nextLife=await store.reviewScope('a');assert.notEqual(nextLife,lifecycleId);
  await assert.rejects(store.create('a',command,label),e=>e instanceof SupplementIntakeError&&e.status===409,'A new settings epoch never validates an old queued request');
  assert.deepEqual(await experience.getExperienceRecords('a','supplement-intake'),[]);
 }finally{await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});

test('correction retains all source history, replays once, rejects stale and earlier edits; removal scrubs every health value and permanently spends the intent',async()=>{
 const pg=new PGlite(),prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");
  for(const file of ['0003_nutrition_products.sql','0004_experience.sql'])await pg.exec(readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));
  const database=drizzle(pg),store=new SupplementIntakeStorage(database as any,()=>now),experience=new ExperienceStorage(database as any),labels=new PrivateProductStorage(database as any);
  const label=await labels.insertNutritionProduct('a',{name:'Original private label',brand:'Synthetic',servingDescription:'1 capsule',servingGrams:null,perServing:{vitamin_c_mg:30,iron_mg:10}});
  const lifecycleId=await store.reviewScope('a');
  const draft=supplementDraftSchema.parse({takenAt:'2026-11-18T10:00:00Z',servings:2,source:{kind:'label',product:{source:'manual',id:label.id}},
   mineralBasis:{iron_mg:'elemental-label',magnesium_mg:'unknown',zinc_mg:'unknown'},formulation:{labelVersion:null,batch:null}});
  const create={intentId:randomUUID(),lifecycleId,draft,confirmedTaken:true as const,reviewRevision:supplementReviewRevision('a',lifecycleId,draft,label)};
  const first=await store.create('a',create,label);
  const corrected=supplementDraftSchema.parse({...draft,servings:1});
  const command={editId:randomUUID(),expectedRevision:first.payload.revision,lifecycleId,draft:corrected,confirmedTaken:true as const,
   reviewRevision:supplementReviewRevision('a',lifecycleId,corrected,label,{id:first.id,revision:first.payload.revision})};
  await labels.deleteNutritionProduct('a',label.id);
  const changed=await store.correct('a',first.id,command);
  assert.equal(changed.payload.current.servings,1);assert.equal(changed.payload.original.servings,2);assert.deepEqual(changed.payload.original.label,first.payload.original.label);
  assert.equal(changed.payload.corrections.length,1);assert.equal(supplementSourceContributions(changed,'a').observations.find(row=>row.nutrientKey==='iron_mg')!.amount,10);
  assert.equal((await store.correct('a',first.id,command)).payload.corrections.length,1);
  assert.equal((await store.recoverCreate('a',create))?.payload.current.servings,1,'Original save retry returns the correction without undoing it');
  await assert.rejects(store.correct('a',first.id,{...command,draft:{...corrected,servings:3}}),e=>e instanceof SupplementIntakeError&&e.status===409);
  await assert.rejects(store.correct('a',first.id,{...command,editId:randomUUID()}),e=>e instanceof SupplementIntakeError&&e.status===409);
  await assert.rejects(store.correct('b',first.id,command),e=>e instanceof SupplementIntakeError&&e.status===404);
  assert.equal(await store.get('b',first.id),null);assert.equal(await store.remove('b',first.id,{expectedRevision:changed.payload.revision}),false);
  const nextDraft=supplementDraftSchema.parse({...corrected,servings:0.5}),next={...command,editId:randomUUID(),expectedRevision:changed.payload.revision,draft:nextDraft,
   reviewRevision:supplementReviewRevision('a',lifecycleId,nextDraft,label,{id:first.id,revision:changed.payload.revision})};
  const latest=await store.correct('a',first.id,next);
  assert.equal(latest.payload.corrections.length,2);assert.equal(latest.payload.corrections[0].value.servings,1);assert.equal(latest.payload.current.servings,0.5);
  await assert.rejects(store.correct('a',first.id,command),e=>e instanceof SupplementIntakeError&&e.status===409,'An earlier edit never replays over an intervening correction');
  await assert.rejects(store.remove('a',first.id,{expectedRevision:changed.payload.revision}),e=>e instanceof SupplementIntakeError&&e.status===409);
  assert.equal(await store.remove('a',first.id,{expectedRevision:latest.payload.revision}),true);
  assert.equal(await store.remove('a',first.id,{expectedRevision:latest.payload.revision}),true);
  assert.equal(await store.get('a',first.id),null);assert.deepEqual(await experience.getExperienceRecords('a','supplement-intake'),[]);
  const[row]=await database.select().from(experienceRecords).where(eq(experienceRecords.id,first.id));
  assert.equal(row.kind,'supplement-intent');assert.deepEqual(decryptPrecision(row.encryptedPayload,'a'),{version:1,intentId:create.intentId,lifecycleId});
  assert.doesNotMatch(JSON.stringify(decryptPrecision(row.encryptedPayload,'a')),/private label|servings|takenAt|confirmedAt|perServing|corrections|reviewRevision/);
  await assert.rejects(store.create('a',create,null),e=>e instanceof SupplementIntakeError&&e.code==='SUPPLEMENT_INTAKE_DELETED');
  await assert.rejects(store.correct('a',first.id,next),e=>e instanceof SupplementIntakeError&&e.code==='SUPPLEMENT_INTAKE_DELETED');
  await experience.clearExperienceData('a');
  await assert.rejects(store.validateScope('a',lifecycleId),e=>e instanceof SupplementIntakeError&&e.status===409);
  await assert.rejects(store.create('a',create,null),e=>e instanceof SupplementIntakeError&&e.status===409);
  assert.deepEqual(await database.select().from(experienceRecords),[]);
 }finally{await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});

test('unlabelled/null quantity remains an actual assertion with no invented contribution; future claims and erased accounts cannot create',async()=>{
 const pg=new PGlite(),prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a');");
  await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
  const database=drizzle(pg),store=new SupplementIntakeStorage(database as any,()=>now),lifecycleId=await store.reviewScope('a');
  const draft=supplementDraftSchema.parse({takenAt:'2026-11-18T11:00:00Z',servings:null,source:{kind:'unlabelled',description:{name:'Reported supplement',servingDescription:null}},
   mineralBasis:{iron_mg:'unknown',magnesium_mg:'unknown',zinc_mg:'unknown'},formulation:{labelVersion:null,batch:null}});
  const command={intentId:randomUUID(),lifecycleId,draft,confirmedTaken:true as const,reviewRevision:supplementReviewRevision('a',lifecycleId,draft,null)};
  const saved=await store.create('a',command,null);assert.equal(saved.payload.current.servings,null);assert.equal(saved.payload.current.label,null);
  assert.equal(supplementSourceContributions({id:saved.id,userId:'a',payload:saved.payload},'a').status,'source-unavailable');
  const future={...draft,takenAt:'2026-11-19T12:00:00Z'};
  await assert.rejects(store.create('a',{...command,intentId:randomUUID(),draft:future,reviewRevision:supplementReviewRevision('a',lifecycleId,future,null)},null),e=>e instanceof SupplementIntakeError&&e.status===400);
  await assert.rejects(store.create('a',{...command,confirmedTaken:false},null));
  assert.equal((await database.select().from(experienceRecords)).length,1);
  await database.delete(users).where(eq(users.id,'a'));
  await assert.rejects(store.create('a',command,null),e=>e instanceof SupplementIntakeError&&e.status===401);
  assert.deepEqual(await database.select().from(experienceRecords),[]);
 }finally{await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});

test('concurrent corrections authorize only one current revision and a racing old save cannot defeat removal',async()=>{
 const pg=new PGlite(),prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));
  const database=drizzle(pg),store=new SupplementIntakeStorage(database as any,()=>now),lifecycleId=await store.reviewScope('a');
  const draft=supplementDraftSchema.parse({takenAt:'2026-11-18T10:00:00Z',servings:2,source:{kind:'unlabelled',description:{name:'Reported supplement',servingDescription:'1 capsule'}},
   mineralBasis:{iron_mg:'unknown',magnesium_mg:'unknown',zinc_mg:'unknown'},formulation:{labelVersion:null,batch:null}});
  const command={intentId:randomUUID(),lifecycleId,draft,confirmedTaken:true as const,reviewRevision:supplementReviewRevision('a',lifecycleId,draft,null)},first=await store.create('a',command,null);
  const changes=[1,3].map(servings=>{const changed={...draft,servings};return{editId:randomUUID(),expectedRevision:first.payload.revision,lifecycleId,draft:changed,confirmedTaken:true as const,
   reviewRevision:supplementReviewRevision('a',lifecycleId,changed,null,{id:first.id,revision:first.payload.revision})};});
  const results=await Promise.allSettled(changes.map(change=>store.correct('a',first.id,change)));
  assert.equal(results.filter(result=>result.status==='fulfilled').length,1);assert.equal(results.filter(result=>result.status==='rejected'&&result.reason instanceof SupplementIntakeError&&result.reason.status===409).length,1);
  const latest=(await store.get('a',first.id))!;assert.equal(latest.payload.corrections.length,1);assert.equal(latest.payload.original.servings,2);
  await Promise.allSettled([store.create('a',command,null),store.remove('a',first.id,{expectedRevision:latest.payload.revision})]);
  assert.equal(await store.get('a',first.id),null);await assert.rejects(store.create('a',command,null),e=>e instanceof SupplementIntakeError&&e.code==='SUPPLEMENT_INTAKE_DELETED');
 }finally{await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
