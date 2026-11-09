import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {schemaContracts,schemaReadinessAudit,schemaReadinessQuery} from '../server/schema-readiness';

test('catalog audit detects absent core storage, missing columns and optional storage without reading records',async()=>{
 const db=new PGlite();
 const pool={query:async(config:{text:string;query_timeout:number})=>{assert.equal(config.query_timeout,5000);assert.equal(config.text,schemaReadinessQuery);return db.query<Record<string,unknown>>(config.text);}};
 try {
  const absent=await schemaReadinessAudit(pool);
  assert.equal(absent.status,'incomplete');
  assert.ok('storage' in absent&&absent.storage.every(table=>table.status==='missing-table'));
  for(const table of schemaContracts.filter(t=>t.required))await db.exec(`CREATE TABLE "${table.name}" (${table.columns.map(column=>`"${column}" text`).join(',')})`);
  await db.exec("INSERT INTO users (id) VALUES ('PRIVATE_HEALTH_SENTINEL')");
  const ready=await schemaReadinessAudit(pool);
  assert.equal(ready.status,'catalog-ready');
  assert.ok('storage' in ready&&ready.storage.filter(t=>!t.required).every(t=>t.status==='missing-table'));
  assert.ok(!JSON.stringify(ready).includes('PRIVATE_HEALTH_SENTINEL'));
  await db.exec('DROP TABLE session');
  assert.equal((await schemaReadinessAudit(pool)).status,'incomplete','Runtime requires session storage');
  assert.equal((await schemaReadinessAudit(pool,'before-app-start')).status,'pre-bootstrap-catalog-ready','Lazy session creation must be verified after live app bootstrap');
  await db.exec('CREATE TABLE session (sid text,sess text,expire text)');
  await db.exec('ALTER TABLE meals DROP COLUMN nutritional_data');
  const incomplete=await schemaReadinessAudit(pool);
  assert.equal(incomplete.status,'incomplete');
  assert.deepEqual('storage' in incomplete&&incomplete.storage.find(t=>t.table==='meals')?.missingColumns,['nutritional_data']);
  await db.exec('CREATE ROLE restricted; GRANT USAGE ON SCHEMA public TO restricted; GRANT SELECT ON ALL TABLES IN SCHEMA public TO restricted; SET ROLE restricted');
  await db.exec('RESET ROLE; GRANT INSERT ON experiment_versions TO restricted; SET ROLE restricted');
  const restricted=await schemaReadinessAudit(pool);
  assert.equal(restricted.status,'incomplete');
  assert.ok('storage' in restricted&&restricted.storage.find(t=>t.table==='biology_entities')?.status==='available','Reference registry requires read access, not runtime mutation rights');
  assert.ok('storage' in restricted&&restricted.storage.find(t=>t.table==='experiment_versions')?.status==='available','Immutable prior sources require SELECT/INSERT only; UPDATE/DELETE must not be required');
  assert.ok('storage' in restricted&&restricted.storage.find(t=>t.table==='users')?.status==='insufficient-access');
 } finally {await db.close();}
});
test('missing catalog observations and driver failures cannot claim readiness or leak raw errors',async()=>{
 assert.equal((await schemaReadinessAudit({query:async()=>({rows:[]})})).status,'incomplete');
 const failed=await schemaReadinessAudit({query:async()=>{throw Object.assign(Error('PRIVATE_SQL_AND_PASSWORD'),{code:'42P01'});}});
 assert.deepEqual(failed,{event:'application-schema-readiness',status:'unavailable',errorCode:'42P01'});
 const unsafe=await schemaReadinessAudit({query:async()=>{throw {code:'PRIVATE_ERROR'};}});
 assert.equal(unsafe.errorCode,'unclassified');
});
