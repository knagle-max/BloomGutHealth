import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {reviewRuntimeAudit} from '../server/review-runtime-audit';
const env={DATABASE_URL:'postgresql://PRIVATE_USER:PRIVATE_PASSWORD@ep-synthetic-pooler.c-4.us-west-2.aws.neon.tech/PRIVATE_DATABASE?secret=PRIVATE_QUERY',RENDER_SERVICE_ID:'srv-syntheticreview',RENDER_GIT_COMMIT:'a'.repeat(40),BLOOM_INTERNAL_TESTERS:'PRIVATE_USER_GRANT',BLOOM_ADDITIONAL_FEATURE_ADMIN_GRANT:'PRIVATE_ADMIN_GRANT',BLOOM_EXPERIMENTAL_ENVIRONMENT:'isolated-synthetic'};
test('runtime audit reads only catalog metadata and projects non-secret binding/schema facts, never grants or dataset approval',async()=>{
 let reads=0;const result=await reviewRuntimeAudit({query:async config=>{reads++;assert.equal(config.query_timeout,5000);assert.match(config.text,/^SELECT current_database/);assert.ok(!/FROM users|\b(?:DELETE|INSERT|UPDATE|CREATE|ALTER)\b/i.test(config.text));return {rows:[{database_name:'PRIVATE_DATABASE',preferences_table_present:false,preferences_columns_present:false}]};}},env);
 assert.equal(reads,1);assert.equal(result.configuredNeonEndpoint,'ep-synthetic');assert.equal(result.databaseNameHash,createHash('sha256').update('PRIVATE_DATABASE').digest('hex'));assert.equal(result.preferenceStorage,'missing-table');assert.equal(result.configuration.supplementalAdminConfigurationPresent,true);assert.ok(!JSON.stringify(result).includes('PRIVATE_'));assert.match(result.note,/not verified account identity/);
});
test('runtime audit distinguishes present columns from missing columns and hides invalid bindings and raw driver errors',async()=>{
 for(const ready of [true,false]){const result=await reviewRuntimeAudit({query:async()=>({rows:[{database_name:'synthetic',preferences_table_present:true,preferences_columns_present:ready}]})},env);assert.equal(result.preferenceStorage,ready?'columns-present':'missing-columns');}
 const result=await reviewRuntimeAudit({query:async()=>{throw Object.assign(Error('PRIVATE_SQL_AND_CONNECTION'),{code:'42P01'});}}, {...env,DATABASE_URL:'PRIVATE_INVALID_URL',RENDER_SERVICE_ID:'PRIVATE_ID',RENDER_GIT_COMMIT:'PRIVATE_COMMIT'});assert.equal(result.preferenceStorage,'unavailable');assert.equal(result.errorCode,'42P01');assert.equal(result.configuredNeonEndpoint,'unavailable');assert.ok(!JSON.stringify(result).includes('PRIVATE_'));
});

test('actual PostgreSQL catalog distinguishes absent, incomplete and migrated preference storage without account reads',async()=>{
 const {PGlite}=await import('@electric-sql/pglite');const {readFile}=await import('node:fs/promises');const db=new PGlite();
 try{const pool={query:async(config:{text:string})=>db.query<Record<string,unknown>>(config.text)};
 assert.equal((await reviewRuntimeAudit(pool,env)).preferenceStorage,'missing-table');
 await db.exec('CREATE TABLE capability_preferences (user_id varchar PRIMARY KEY)');
 assert.equal((await reviewRuntimeAudit(pool,env)).preferenceStorage,'missing-columns');
 await db.exec('DROP TABLE capability_preferences; CREATE TABLE users(id varchar PRIMARY KEY)');await db.exec(await readFile(new URL('../migrations/0008_capability_preferences.sql',import.meta.url),'utf8'));
 assert.equal((await reviewRuntimeAudit(pool,env)).preferenceStorage,'columns-present');assert.equal((await db.query('SELECT count(*)::int AS n FROM users')).rows[0].n,0);
 }finally{await db.close();}
});
