import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Pool} from 'pg';
import {assertSchemaPushResult} from './lib/schema-push-output.mjs';
assert.equal(process.env.GITHUB_ACTIONS,'true','Schema reconciliation is CI-only');
assert.equal(process.env.GITHUB_EVENT_NAME,'pull_request','Schema reconciliation is PR-only');
assert.equal(process.env.BLOOM_SMOKE_ISOLATED,'true','Only the explicitly isolated PR database is authorized');
assert.ok(process.env.DATABASE_URL_UNPOOLED,'An isolated direct database URL must be injected');
const pool=new Pool({connectionString:process.env.DATABASE_URL_UNPOOLED,max:1,connectionTimeoutMillis:10000,statement_timeout:5000});
async function protectedSnapshot(){
 const client=await pool.connect();try{
 await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 const tables={};
 for(const name of ['feature_control_states','feature_control_audit']){
  const rows=(await client.query(`SELECT row_to_json(t)::text AS value FROM public.${name} t ORDER BY service_id,environment,feature_id,revision LIMIT 100001`)).rows;
  assert.ok(rows.length<=100000,'Protected snapshot is too large for the CI guard');
  tables[name]=createHash('sha256').update(JSON.stringify(rows)).digest('hex');
 }
 const constraints=(await client.query(`SELECT c.conrelid::text AS relation_id,r.relname,c.conname,c.contype,c.condeferrable,c.condeferred,pg_get_constraintdef(c.oid) AS definition
  FROM pg_constraint c JOIN pg_class r ON r.oid=c.conrelid WHERE c.conrelid IN ('public.feature_control_states'::regclass,'public.feature_control_audit'::regclass) ORDER BY r.relname,c.conname`)).rows;
 const triggers=(await client.query(`SELECT tgname,tgenabled,pg_get_triggerdef(oid) AS definition FROM pg_trigger
  WHERE tgrelid='public.feature_control_audit'::regclass AND NOT tgisinternal ORDER BY tgname`)).rows;
 assert.ok(constraints.some(c=>c.conname==='feature_control_audit_request'&&c.contype==='u'),'The unique request constraint is required');
 assert.ok(constraints.some(c=>c.conname==='feature_control_state_audit'&&c.condeferrable&&c.condeferred),'The deferred state/audit FK is required');
 assert.ok(triggers.some(t=>t.tgname==='feature_control_audit_immutable'&&t.tgenabled==='O'),'The immutable audit guard is required');
 await client.query('COMMIT');return {tables,constraints,triggers};
 }catch(error){await client.query('ROLLBACK').catch(()=>{});throw error;}finally{client.release();}
}
let stage='protected-baseline',sqlState='none';
try{
 const before=await protectedSnapshot();stage='schema-reconciliation';
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('../node_modules/drizzle-kit/bin.cjs',import.meta.url)),'push','--force'],{cwd:fileURLToPath(new URL('..',import.meta.url)),env:process.env,encoding:'utf8',timeout:120000,maxBuffer:5*1024*1024});
 sqlState=(result.stdout+'\n'+result.stderr).match(/\bcode:\s*['"]([A-Z0-9]{5})['"]/)?.[1]??'none';
 assertSchemaPushResult(result);stage='protected-verification';
 assert.deepEqual(await protectedSnapshot(),before,'Schema push must preserve control snapshots, audit rows, constraints and triggers');
 console.log('PASS: isolated schema reconciliation preserved protected control data, constraints and immutable audit guard.');
}catch{
 console.error(`FAIL: isolated schema reconciliation; stage=${stage}; sqlstate=${sqlState}`);process.exitCode=1;
}finally{await pool.end().catch(()=>{});}
