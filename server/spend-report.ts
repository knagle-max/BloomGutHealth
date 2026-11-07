import type { Pool } from 'pg';
import type { SpendQuery } from './spend-ledger';

/** Operator-only aggregates. No account/request keys or provider payloads leave SQL. */
export interface SpendReportAlertPolicy {
    platformMonthlyMicroUsd: string;
    thresholdPercent: number;
    unresolvedAfterSeconds: number;
}
function amount(value: unknown): bigint {
    if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,29})$/.test(value)) throw Error('Invalid aggregate amount');
    return BigInt(value);
}
export function validReportPolicy(value: unknown): value is SpendReportAlertPolicy {
    if (!value || typeof value !== 'object') return false;
    const policy = value as SpendReportAlertPolicy;
    try {
        return Object.keys(policy).length === 3 && amount(policy.platformMonthlyMicroUsd) > BigInt(0) && amount(policy.platformMonthlyMicroUsd) <= BigInt(1000000000000) &&
            Number.isInteger(policy.thresholdPercent) && policy.thresholdPercent >= 1 && policy.thresholdPercent <= 100 &&
            Number.isSafeInteger(policy.unresolvedAfterSeconds) && policy.unresolvedAfterSeconds >= 1 && policy.unresolvedAfterSeconds <= 31536000;
    } catch { return false; }
}
function aggregate(row: Record<string, string>) {
    const actual = amount(row.actual), estimated = amount(row.estimated), unresolved = amount(row.unresolved);
    return {
        actualMicroUsd: actual.toString(), estimatedMicroUsd: estimated.toString(),
        unresolvedReservedMicroUsd: unresolved.toString(), accountedMicroUsd: (actual + estimated + unresolved).toString(),
        settledRequests: amount(row.settled_count).toString(), releasedRequests: amount(row.released_count).toString(),
        unresolvedRequests: amount(row.unresolved_count).toString(),
        // A ratio preserves exact integer money. These are metered AI users, not all app users.
        averageSettledCost: { numeratorMicroUsd: (actual + estimated).toString(), denominatorMeteredAccounts: amount(row.settled_accounts).toString() },
        oldestUnresolvedAgeSeconds: amount(row.oldest_seconds).toString(),
    };
}
export async function readSpendReport(db: SpendQuery, policy?: SpendReportAlertPolicy) {
    if (policy !== undefined && !validReportPolicy(policy)) throw Error('Invalid report alert policy');
    const monitoringPolicy = policy ? Object.freeze({ ...policy }) : undefined;
    const rows = (await db.query(`
WITH moment AS (SELECT transaction_timestamp() AS as_of), bounds AS (
 SELECT as_of,date_trunc('month',as_of AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS month_start FROM moment
), scoped AS (
 SELECT provider,feature,account_key,state,billing_basis,settled_micro_usd,reserved_micro_usd,created_at
 FROM ai_spend_requests CROSS JOIN bounds
 WHERE state='reserved' OR (state IN ('settled','released') AND settled_at>=month_start AND settled_at<=as_of)
)
SELECT GROUPING(provider)::text AS total,provider,feature,
 (SELECT as_of FROM bounds) AS as_of,(SELECT month_start FROM bounds) AS month_start,
 COALESCE(sum(settled_micro_usd) FILTER(WHERE state='settled' AND billing_basis='actual'),0)::text AS actual,
 COALESCE(sum(settled_micro_usd) FILTER(WHERE state='settled' AND billing_basis='estimated'),0)::text AS estimated,
 COALESCE(sum(reserved_micro_usd) FILTER(WHERE state='reserved'),0)::text AS unresolved,
 count(*) FILTER(WHERE state='settled')::text AS settled_count,
 count(*) FILTER(WHERE state='released')::text AS released_count,
 count(*) FILTER(WHERE state='reserved')::text AS unresolved_count,
 count(DISTINCT account_key) FILTER(WHERE state='settled')::text AS settled_accounts,
 GREATEST(COALESCE(floor(extract(epoch FROM (SELECT as_of FROM bounds)-min(created_at) FILTER(WHERE state='reserved'))),0),0)::text AS oldest_seconds
FROM scoped GROUP BY GROUPING SETS ((),(provider,feature)) ORDER BY GROUPING(provider) DESC,provider,feature`)).rows;
    const total = rows.find(row => row.total === '1');
    if (!total) throw Error('Aggregate snapshot unavailable');
    const totals = aggregate(total);
    const dimensions = rows.filter(row => row.total === '0').map(row => {
        if (![row.provider, row.feature].every(value => typeof value === 'string' && /^[A-Za-z0-9_.:/-]{1,120}$/.test(value))) throw Error('Invalid aggregate dimension');
        return { provider: row.provider as string, feature: row.feature as string, ...aggregate(row) };
    });
    const alerts: string[] = [];
    if (monitoringPolicy) {
        if (BigInt(totals.accountedMicroUsd) * BigInt(100) >= BigInt(monitoringPolicy.platformMonthlyMicroUsd) * BigInt(monitoringPolicy.thresholdPercent)) alerts.push('PLATFORM_BUDGET_THRESHOLD');
        if (BigInt(totals.unresolvedRequests) > BigInt(0) && BigInt(totals.oldestUnresolvedAgeSeconds) >= BigInt(monitoringPolicy.unresolvedAfterSeconds)) alerts.push('UNRESOLVED_PROVIDER_OUTCOME');
    }
    return {
        format: 'bloom-ai-spend-report-v1', currency: 'USD', moneyUnit: 'micro-USD',
        asOf: new Date(total.as_of).toISOString(), utcMonthStart: new Date(total.month_start).toISOString(),
        scope: 'Settlements this UTC month plus all outstanding reservations (in-flight or unknown) as of this snapshot; not an invoice or all-app-user metric.',
        totals, byProviderFeature: dimensions, monitoring: monitoringPolicy ? { configured: true, policy: monitoringPolicy, alerts } : { configured: false, alerts },
    };
}
/** No shared spend lock needed: one consistent, bounded, read-only snapshot. */
export async function operatorSpendReport(pool: Pick<Pool, 'connect'>, policy?: SpendReportAlertPolicy) {
    if (policy !== undefined && !validReportPolicy(policy)) throw Error('Invalid report alert policy');
    const client = await pool.connect();
    try {
        await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
        await client.query("SET LOCAL statement_timeout='5s'");
        const report = await readSpendReport(client, policy);
        await client.query('COMMIT');
        return report;
    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
    } finally { client.release(); }
}
