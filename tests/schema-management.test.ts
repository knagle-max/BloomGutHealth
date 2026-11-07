import test from 'node:test';
import assert from 'node:assert/strict';
import {getTableName,is} from 'drizzle-orm';
import {PgTable} from 'drizzle-orm/pg-core';
import {generateDrizzleJson} from 'drizzle-kit/api';
import * as complete from '../shared/schema';
import * as application from '../shared/application-schema';
import {isMigrationManagedTable} from '../shared/schema-management';
// The CI guard is JavaScript so it can execute before application compilation.
import {assertSchemaPushResult} from '../scripts/lib/schema-push-output.mjs';
test('actual Drizzle serialization excludes SQL-owned audit tables while every application table remains represented',()=>{
 const names=(values:Record<string,unknown>)=>Object.values(values).filter(value=>is(value,PgTable)).map(value=>getTableName(value as PgTable)).sort();
 const all=names(complete),app=names(application),owned=all.filter(isMigrationManagedTable);
 assert.deepEqual(owned,['biology_entities','biology_relationship_sources','biology_relationships','biology_sources','biology_versions','experiment_versions','feature_control_audit','feature_control_states','feature_control_step_up_receipts']);assert.deepEqual(app,all.filter(name=>!isMigrationManagedTable(name)));
 const generated=generateDrizzleJson(application),tables=Object.values(generated.tables).map(table=>table.name).sort();assert.deepEqual(tables,app);assert.ok(!tables.some(isMigrationManagedTable));
 const full=generateDrizzleJson(complete);assert.ok(Object.values(full.tables).some(table=>table.name==='feature_control_audit'));
});
test('schema reconciliation rejects logged errors despite zero exit, missing success, interactive decisions and terminated children',()=>{
 for(const result of [{status:0,stdout:'error: PRIVATE_DATABASE_FAILURE\nChanges applied'},{status:0,stderr:'TypeError: private'},{status:0,stdout:'Interactive prompts require a TTY'},{status:0,stdout:'All changes were aborted'},{status:1,stdout:'Changes applied'},{status:0,signal:'SIGTERM',stdout:'No changes detected'}])assert.throws(()=>assertSchemaPushResult(result),error=>error instanceof Error&&error.message==='Schema reconciliation did not complete successfully.');
 for(const stdout of ['[✓] Changes applied','[i] No changes detected'])assert.doesNotThrow(()=>assertSchemaPushResult({status:0,stdout}));
});

test('schema failure diagnostics identify actionable categories without exposing raw database output',()=>{
 for(const [result,reason]of[
  [{status:0,stdout:'Is profile_measurement_sources table created or renamed from another table?'},'interactive-decision'],
  [{status:0,stdout:'error: PRIVATE_SQL_SENTINEL'},'logged-error'],
  [{status:1,stderr:'postgres://PRIVATE_CONNECTION_SENTINEL'},'nonzero-exit'],
  [{status:0,signal:'SIGTERM',stdout:'PRIVATE_QUERY_SENTINEL'},'terminated'],
  [{status:0,stdout:'PRIVATE_UNKNOWN_SENTINEL'},'missing-success'],
 ]as const)assert.throws(()=>assertSchemaPushResult(result),error=>error instanceof Error&&(error as any).reason===reason&&!/PRIVATE/.test(JSON.stringify(error))&&!/PRIVATE/.test(error.message));
});
