import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {ExperienceStorage} from '../server/experience-storage';
import {trainingSessionSchema,actualSetsSchema} from '../shared/experience';
const base={title:'Manual strength session',startsAt:'2026-10-27T12:00:00Z',minutes:45,intensity:'moderate',discipline:'strength-power'};
const actualSets=actualSetsSchema.parse({version:1,sets:[{exercise:'Squat',reps:5,loadKg:40,completed:true},{exercise:'Plank',reps:null,loadKg:null,completed:false}]});
test('manual set readers distinguish absence, unknown, zero and explicitly completed observations',()=>{
 assert.equal(trainingSessionSchema.parse(base).actualSets,undefined);
 assert.equal(actualSets.sets[1].loadKg,null);assert.equal(actualSets.sets[1].completed,false);
 assert.equal(actualSetsSchema.parse({version:1,sets:[{exercise:'Bodyweight movement',reps:0,loadKg:0,completed:false}]}).sets[0].loadKg,0);
 assert.equal(actualSetsSchema.safeParse({version:1,sets:[{exercise:'Squat',reps:5,loadKg:40}]}).success,false,'Completion is explicit, never inferred from entered quantities');
 assert.equal(actualSetsSchema.safeParse({...actualSets,estimatedGrowth:1}).success,false);
});
test('encrypted owned sessions preserve set observations through unaware edits and support explicit clear',async()=>{
 const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");await pg.exec(readFileSync(new URL('../migrations/0004_experience.sql',import.meta.url),'utf8'));const store=new ExperienceStorage(drizzle(pg)as any);
 try{
  const saved=await store.createSession('a',trainingSessionSchema.parse({...base,actualSets}),randomUUID());assert.deepEqual(saved.payload.actualSets,actualSets);
  const edited=await store.updateExperienceRecord('a',saved.id,{kind:'session',payload:trainingSessionSchema.parse({...base,minutes:50})});assert.equal(edited?.kind,'session');assert.deepEqual((edited!.payload as any).actualSets,actualSets);assert.equal((edited!.payload as any).minutes,50);
  assert.equal(await store.updateExperienceRecord('b',saved.id,{kind:'session',payload:trainingSessionSchema.parse(base)}),null);assert.deepEqual(await store.getExperienceRecords('b','session'),[]);
  const raw=await pg.query('SELECT encrypted_payload FROM experience_records');assert.doesNotMatch(JSON.stringify(raw.rows),/Squat|Plank|actualSets/);
  const cleared=await store.updateExperienceRecord('a',saved.id,{kind:'session',payload:trainingSessionSchema.parse({...base,actualSets:{version:1,sets:[]}})});assert.deepEqual((cleared!.payload as any).actualSets,{version:1,sets:[]});
 }finally{await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
