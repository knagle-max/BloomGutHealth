import test from 'node:test';import assert from 'node:assert/strict';import {randomBytes} from 'node:crypto';import {readFile} from 'node:fs/promises';import {PGlite} from '@electric-sql/pglite';import {drizzle} from 'drizzle-orm/pglite';
import {PrecisionStorage} from '../server/precision-storage';import {contextSchema,labSchema} from '../shared/precision-nutrition';import {decryptPrecision} from '../server/precision-crypto';
test('isolated synthetic snapshot restore preserves encrypted source records, requires every historical key and exposes deletion replay risk',async()=>{
 const names=['PRECISION_DATA_KEY','PRECISION_DATA_KEYRING','PRECISION_ACTIVE_KEY_ID'] as const;const saved=Object.fromEntries(names.map(name=>[name,process.env[name]]));
 const keys={older:randomBytes(32).toString('base64'),current:randomBytes(32).toString('base64')};process.env.PRECISION_DATA_KEYRING=JSON.stringify(keys);process.env.PRECISION_ACTIVE_KEY_ID='older';delete process.env.PRECISION_DATA_KEY;
 let source:PGlite|undefined,restored:PGlite|undefined;
 try{
  source=new PGlite();await source.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('synthetic-restore-a'),('synthetic-restore-b');");
  const migration=await readFile(new URL('../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8');await source.exec(migration);
  const original=new PrecisionStorage(drizzle(source) as any);await original.putPrecisionContext('synthetic-restore-a',contextSchema.parse({goals:['Synthetic restore check']}));
  const first=await original.insertPrecisionRecord('synthetic-restore-a','lab',labSchema.parse({marker:'ldl',value:0,unit:'mg/dL',measuredAt:'2026-10-01T00:00:00Z',laboratory:'Synthetic restore lab',method:'fixture assay',fasting:'unknown',referenceLow:null,referenceHigh:null,notes:'Synthetic only'}));
  process.env.PRECISION_ACTIVE_KEY_ID='current';await original.insertPrecisionRecord('synthetic-restore-a','lab',labSchema.parse({marker:'apob',value:1.2,unit:'g/L',measuredAt:'2026-10-02T00:00:00Z',laboratory:'Synthetic restore lab',method:'fixture assay',fasting:'unknown',referenceLow:null,referenceHigh:null,notes:'Synthetic only'}));
  const snapshot=await source.dumpDataDir('gzip');assert.ok(snapshot.size>0);
  // A snapshot predating a later user deletion must not be activated without separate erasure reconciliation.
  await original.clearPrecisionData('synthetic-restore-a');assert.equal((await original.getPrecisionRecords('synthetic-restore-a')).length,0);await source.close();source=undefined;
  const start=performance.now();restored=new PGlite({loadDataDir:snapshot});await restored.waitReady;await restored.exec(migration); // additive/idempotent schema survives recovery
  const recovered=new PrecisionStorage(drizzle(restored) as any),records=await recovered.getPrecisionRecords('synthetic-restore-a');assert.equal(records.length,2);assert.equal((records.find(r=>r.id===first.id)?.payload as any).value,0);assert.equal((records.find(r=>r.id===first.id)?.payload as any).unit,'mg/dL');assert.equal((records.find(r=>r.id===first.id)?.payload as any).referenceLow,null);assert.equal((await recovered.getPrecisionRecords('synthetic-restore-b')).length,0);
  const raw=await restored.query<{encrypted_payload:any}>('SELECT encrypted_payload FROM precision_records');assert.deepEqual(new Set(raw.rows.map(r=>r.encrypted_payload.keyId)),new Set(['older','current']));for(const row of raw.rows)assert.throws(()=>decryptPrecision(row.encrypted_payload,'synthetic-restore-b'));
  process.env.PRECISION_DATA_KEYRING=JSON.stringify({current:keys.current});await assert.rejects(()=>recovered.getPrecisionRecords('synthetic-restore-a'));
  process.env.PRECISION_DATA_KEYRING=JSON.stringify({older:randomBytes(32).toString('base64'),current:keys.current});await assert.rejects(()=>recovered.getPrecisionRecords('synthetic-restore-a'));
  delete process.env.PRECISION_DATA_KEYRING;await assert.rejects(()=>recovered.getPrecisionRecords('synthetic-restore-a'));
  process.env.PRECISION_DATA_KEYRING=JSON.stringify(keys);assert.equal((await recovered.getPrecisionRecords('synthetic-restore-a')).length,2);
  const deletedDataReappeared=records.length>0;assert.equal(deletedDataReappeared,true);
  console.info(`Synthetic recovery drill: snapshotBytes=${snapshot.size}; restoreCheckMs=${Math.round(performance.now()-start)}; historicalKeys=2; managedRestoreVerified=false; deletionReplayRequired=true`);
 }finally{await source?.close();await restored?.close();for(const name of names){if(saved[name]===undefined)delete process.env[name];else process.env[name]=saved[name];}}
});
