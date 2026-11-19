import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {PrecisionStorage} from '../server/precision-storage';
import {collectPrivateInvestigationSnapshot} from '../server/biological-investigation-snapshot';
import {microbiomeSamples,precisionRecords} from '../shared/schema';

test('private collector reads encrypted selected genetics and owned microbiome SQL, then invalidates on source revocation/deletion',async()=>{
 const previous=process.env.PRECISION_DATA_KEY;
 process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 const pg=new PGlite();
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users VALUES('synthetic-a','{}'),('synthetic-b','{}');");
  await pg.exec(readFileSync(new URL('../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8'));
  await pg.exec(`CREATE TABLE microbiome_samples(id varchar PRIMARY KEY,user_id varchar NOT NULL REFERENCES users(id),
   test_date timestamp NOT NULL,testing_company text,test_id text,raw_data_path text,structured_data jsonb,
   notes text,processing_status text NOT NULL,diversity_index real,uploaded_at timestamp NOT NULL);`);
  const db=drizzle(pg),precision=new PrecisionStorage(db as any);
  const geneticPayload={provider:'manual',consent:true,source:'Synthetic source only',strand:'unknown',
   collectedAt:'2026-10-01T00:00:00Z',entries:[{rsid:'rs1801133',gene:'MTHFR',genotype:'CT'}]};
  const source=await precision.insertPrecisionRecord('synthetic-a','genetics',geneticPayload);
  await precision.insertPrecisionRecord('synthetic-b','genetics',geneticPayload);
  const encrypted=await db.select().from(precisionRecords);
  assert.ok(encrypted.every(row=>!JSON.stringify(row.encryptedPayload).includes('rs1801133')));
  for(const actor of ['synthetic-a','synthetic-b'])await db.insert(microbiomeSamples).values({
   id:actor+'-report',userId:actor,testDate:new Date('2026-10-01T00:00:00Z'),
   uploadedAt:new Date('2026-10-02T00:00:00Z'),processingStatus:'completed',
   structuredData:{organisms:[{name:actor+' synthetic organism',reported_status:'detected'}]},notes:'Synthetic private note excluded',
  });
  const store={getUser:async(actor:string)=>({id:actor}),getPrecisionContext:precision.getPrecisionContext.bind(precision),
   getPrecisionRecords:precision.getPrecisionRecords.bind(precision),getGeneticSources:precision.getGeneticSources.bind(precision),
   getMeals:async()=>[],getExperienceRecords:async()=>[],
   getUserSamples:async(actor:string)=>db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,actor))} as any;
  const input={actor:'synthetic-a',purpose:'personal-wellness' as const,window:{date:'2026-11-19',timeZone:'UTC'},
   store,includeMicrobiome:true,includeGenetics:true,authorize:async()=>true,
   now:()=>new Date(Math.max(Date.now()+1000,Date.parse('2026-11-19T12:00:00Z')))};
  const selected=await collectPrivateInvestigationSnapshot(input);
  assert.equal(selected.facts.filter(f=>f.domain==='genetics').length,1);
  assert.equal(selected.facts.filter(f=>f.domain==='microbiome').length,1);
  const serialized=JSON.stringify(selected);
  assert.equal(serialized.includes('synthetic-b'),false);
  assert.equal(serialized.includes('Synthetic private note'),false);
  assert.equal(selected.externalTransferPermitted,false);
  const control=await precision.getGeneticSources('synthetic-a');
  await precision.changeGeneticSource('synthetic-a',{action:'activate',sourceId:null,sourceRevision:null,
   selectionRevision:control.selectionRevision,confirmed:true});
  const revoked=await collectPrivateInvestigationSnapshot(input);
  assert.notEqual(revoked.sourceEpoch,selected.sourceEpoch);
  assert.equal(revoked.facts.some(f=>f.domain==='genetics'),false);
  assert.equal((await precision.getPrecisionRecords('synthetic-a')).some(row=>row.id===source.id),true);
  await db.delete(microbiomeSamples).where(eq(microbiomeSamples.userId,'synthetic-a'));
  const deleted=await collectPrivateInvestigationSnapshot(input);
  assert.notEqual(deleted.sourceEpoch,revoked.sourceEpoch);
  assert.equal(deleted.facts.length,0);
  const foreign=await collectPrivateInvestigationSnapshot({...input,actor:'synthetic-b'});
  assert.equal(foreign.facts.length,2);
  await assert.rejects(collectPrivateInvestigationSnapshot({...input,authorize:async()=>false}));
 }finally{
  await pg.close();
  if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;
 }
});
