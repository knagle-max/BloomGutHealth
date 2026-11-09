import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PGlite } from '@electric-sql/pglite';
import { operatorSpendReport, readSpendReport, validReportPolicy } from '../server/spend-report';

test('private cost report uses exact money, late UTC settlements and all unresolved liabilities without per-account outputs', async () => {
    const db = new PGlite();
    try {
        await db.exec(await readFile(new URL('../migrations/0009_ai_spend_ledger.sql', import.meta.url), 'utf8'));
        await db.exec(await readFile(new URL('../migrations/0010_ai_usage_receipts.sql', import.meta.url), 'utf8'));
        await db.transaction(async tx => {
            // SQL fixtures deliberately include a historical bigint beyond JS safe precision.
            await tx.exec(`INSERT INTO ai_spend_requests
             (request_key,account_key,provider,feature,model,tariff_reference,reserved_micro_usd,settled_micro_usd,state,billing_basis,created_at,settled_at,provider_usage) VALUES
             ('private-request-1','private-account-a','fixture','parse','model','tariff',100,9007199254740993,'settled','actual',transaction_timestamp(),transaction_timestamp(),'{"private-provider-response":"must-never-appear"}'),
             ('private-request-2','private-account-a','fixture','rank','model','tariff',100,20,'settled','estimated','2000-01-01',transaction_timestamp(),NULL),
             ('private-request-3','private-account-b','fixture','parse','model','tariff',100,0,'settled','actual',transaction_timestamp(),transaction_timestamp(),NULL),
             ('private-request-4','private-account-a','fixture','parse','model','tariff',50,NULL,'reserved',NULL,'2000-01-01',NULL,NULL),
             ('private-request-5','private-account-z','fixture','parse','model','tariff',100,999,'settled','actual','2000-01-01','2000-01-02',NULL),
             ('private-request-6','private-account-z','fixture','parse','model','tariff',100,0,'released',NULL,'2000-01-01',transaction_timestamp(),NULL),
             ('private-request-7','private-account-future','fixture','parse','model','tariff',999,NULL,'reserved',NULL,transaction_timestamp()+interval '1 day',NULL,NULL)`);
            const sql: string[] = [];
            const report = await readSpendReport({query: async (query, values) => {sql.push(query);return tx.query(query,values);}}, {platformMonthlyMicroUsd:'100',thresholdPercent:100,unresolvedAfterSeconds:1});
            assert.equal(report.totals.actualMicroUsd,'9007199254740993');
            assert.equal(report.totals.estimatedMicroUsd,'20');
            assert.equal(report.totals.unresolvedReservedMicroUsd,'1049');
            assert.equal(report.totals.accountedMicroUsd,'9007199254742062');
            assert.equal(report.totals.settledRequests,'3');
            assert.equal(report.totals.releasedRequests,'1');
            assert.equal(report.totals.unresolvedRequests,'2');
            assert.deepEqual(report.totals.averageSettledCost,{numeratorMicroUsd:'9007199254741013',denominatorMeteredAccounts:'2'});
            assert.equal(report.byProviderFeature.length,2);
            assert.deepEqual(report.monitoring.alerts,['PLATFORM_BUDGET_THRESHOLD','UNRESOLVED_PROVIDER_OUTCOME']);
            assert.match(report.utcMonthStart,/^\d{4}-\d{2}-01T00:00:00.000Z$/);
            assert.ok(BigInt(report.totals.oldestUnresolvedAgeSeconds)>100000n);
            assert.doesNotMatch(JSON.stringify(report),/private-account|private-request|must-never-appear|private-provider-response|providerResponseHash|model|tariff/);
            assert.doesNotMatch(sql.join(' '),/SELECT\s+\*|request_key|provider_usage/);
            assert.equal((await readSpendReport(tx)).monitoring.configured,false);
            // Even a future-dated reservation (clock skew) remains a liability.
            // Reporting cannot settle, expire or release old unknown billing.
            assert.equal((await tx.query("SELECT state FROM ai_spend_requests WHERE request_key='private-request-4'")).rows[0].state,'reserved');
        });
    } finally { await db.close(); }
});

test('empty snapshot and threshold boundaries remain explicit; invalid monitoring policy never queries the database', async () => {
    const db = new PGlite();
    try {
        await db.exec(await readFile(new URL('../migrations/0009_ai_spend_ledger.sql', import.meta.url), 'utf8'));
        const empty = await readSpendReport(db);
        assert.deepEqual(empty.totals.averageSettledCost,{numeratorMicroUsd:'0',denominatorMeteredAccounts:'0'});
        assert.deepEqual(empty.byProviderFeature,[]);
        assert.equal(empty.monitoring.configured,false);
        assert.deepEqual((await readSpendReport(db,{platformMonthlyMicroUsd:'1',thresholdPercent:1,unresolvedAfterSeconds:1})).monitoring.alerts,[]);
        const policy = {platformMonthlyMicroUsd:'100',thresholdPercent:80,unresolvedAfterSeconds:1};
        const fake = (cost:string) => ({query:async()=>({rows:[{total:'1',as_of:new Date(),month_start:new Date(),actual:cost,estimated:'0',unresolved:'0',settled_count:'1',released_count:'0',unresolved_count:'0',settled_accounts:'1',oldest_seconds:'0'}]})});
        assert.deepEqual((await readSpendReport(fake('79'),policy)).monitoring.alerts,[]);
        assert.deepEqual((await readSpendReport(fake('80'),policy)).monitoring.alerts,['PLATFORM_BUDGET_THRESHOLD']);
        for (const invalid of [null,{}, {...policy,platformMonthlyMicroUsd:'0'}, {...policy,platformMonthlyMicroUsd:'1e2'}, {...policy,thresholdPercent:0}, {...policy,thresholdPercent:101}, {...policy,unresolvedAfterSeconds:0}, {...policy,extra:'bad'}]) {
            assert.equal(validReportPolicy(invalid),false);
            await assert.rejects(()=>readSpendReport({query:async()=>{throw Error('Must not query');}},invalid as any),/Invalid report alert policy/);
        }
    } finally { await db.close(); }
});

test('operator report enforces read-only bounded snapshot and always rolls back/releases on failure', async () => {
    const calls: string[] = [];
    const pool = {connect:async()=>({query:async(sql:string)=>{calls.push(sql);if(sql.startsWith('\nWITH'))throw Error('synthetic schema unavailable');return {rows:[]};},release:()=>calls.push('release')})};
    await assert.rejects(()=>operatorSpendReport(pool as any),/synthetic schema unavailable/);
    assert.equal(calls[0],'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    assert.equal(calls[1],"SET LOCAL statement_timeout='5s'");
    assert.deepEqual(calls.slice(-2),['ROLLBACK','release']);
    assert.ok(!calls.includes('COMMIT'));
    calls.length = 0;
    const empty = {total:'1',as_of:new Date(),month_start:new Date(),actual:'0',estimated:'0',unresolved:'0',settled_count:'0',released_count:'0',unresolved_count:'0',settled_accounts:'0',oldest_seconds:'0'};
    const success = {connect:async()=>({query:async(sql:string)=>{calls.push(sql);return {rows:sql.startsWith('\nWITH')?[empty]:[]};},release:()=>calls.push('release')})};
    await operatorSpendReport(success as any);
    assert.deepEqual(calls.slice(-2),['COMMIT','release']);
    assert.ok(!calls.includes('ROLLBACK'));
});

test('operator CLI has no application credential fallback and emits fixed errors without secrets', async () => {
    const run=promisify(execFile);
    const env={...process.env,DATABASE_URL:'postgres://private-app-credential',BLOOM_SPEND_REPORT_DATABASE_URL:'',BLOOM_SPEND_REPORT_ALERT_POLICY:''};
    const help=await run(process.execPath,['--import','tsx','scripts/ai-spend-report.ts','--help'],{env});
    assert.match(help.stderr,/dedicated|authorized read-only/);
    try {await run(process.execPath,['--import','tsx','scripts/ai-spend-report.ts'],{env});assert.fail('Unconfigured command must fail');}
    catch(error:any){assert.equal(error.code,1);assert.equal(error.stdout,'');assert.match(error.stderr,/Spend report unavailable/);assert.doesNotMatch(error.stderr,/private-app-credential|postgres:\/\//);}
});
