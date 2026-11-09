import { Pool } from 'pg';
import { operatorSpendReport, validReportPolicy, type SpendReportAlertPolicy } from '../server/spend-report';

// Explicit dedicated credential only. Never falls back to application/production DB settings.
if (process.argv.length !== 2) {
    console.error('Usage: node --import tsx scripts/ai-spend-report.ts\nSet BLOOM_SPEND_REPORT_DATABASE_URL to an authorized read-only ledger credential. Optional BLOOM_SPEND_REPORT_ALERT_POLICY is JSON with platformMonthlyMicroUsd (integer string), thresholdPercent and unresolvedAfterSeconds. No defaults; no provider calls or settlement writes. Exit 2 means an alert, 1 means failure.');
    process.exitCode = process.argv.length === 3 && process.argv[2] === '--help' ? 0 : 1;
} else {
    let pool: Pool | undefined;
    try {
        if (!process.env.BLOOM_SPEND_REPORT_DATABASE_URL) throw Error('Not configured');
        let policy: SpendReportAlertPolicy | undefined;
        if (process.env.BLOOM_SPEND_REPORT_ALERT_POLICY !== undefined) {
            const parsed: unknown = JSON.parse(process.env.BLOOM_SPEND_REPORT_ALERT_POLICY);
            if (!validReportPolicy(parsed)) throw Error('Invalid policy');
            policy = parsed;
        }
        pool = new Pool({ connectionString: process.env.BLOOM_SPEND_REPORT_DATABASE_URL, max: 1, connectionTimeoutMillis: 5000 });
        const report = await operatorSpendReport(pool, policy);
        console.log(JSON.stringify(report, null, 2));
        if (report.monitoring.alerts.length) process.exitCode = 2;
    } catch {
        // Database/provider errors may include hosts, SQL, credentials or connection strings.
        console.error('Spend report unavailable. Verify the dedicated read-only credential, ledger schema and explicit alert policy privately.');
        process.exitCode = 1;
    } finally { await pool?.end().catch(() => {}); }
}
