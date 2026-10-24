import { createHmac } from 'node:crypto';
import type { Pool } from 'pg';
export interface SpendQuery {
    query(sql: string, values?: any[]): Promise<{
        rows: any[];
    }>;
}
export type SpendTransaction = <T>(work: (db: SpendQuery) => Promise<T>) => Promise<T>;
/** One modest global lock deliberately favors correctness over speculative throughput.
 * Every reserve/settle uses the same transaction-scoped lock on every replica. */
export function postgresSpendTransaction(pool: Pick<Pool, 'connect'>): SpendTransaction {
    return async (work) => { const client = await pool.connect(); try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(142590, 1)');
        const value = await work(client);
        await client.query('COMMIT');
        return value;
    }
    catch (error) {
        await client.query('ROLLBACK').catch(() => { });
        throw error;
    }
    finally {
        client.release();
    } };
}
export interface SpendLimits {
    accountDaily: number;
    accountMonthly: number;
    featureDaily: number;
    providerMonthly: number;
    platformMonthly: number;
    accountConcurrency: number;
    platformConcurrency: number;
}
export interface SpendRequest {
    userId: string;
    requestId: string;
    feature: string;
    provider: string;
    model: string;
    tariffReference: string;
    maximumMicroUsd: number;
}
export type SpendReservation = {
    allowed: true;
    state: 'reserved' | 'settled' | 'released';
    replay: boolean;
} | {
    allowed: false;
    reason: 'unconfigured' | 'limit' | 'request-conflict';
};
const money = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= 1000000000000;
const identifier = (value: string) => /^[A-Za-z0-9_.:/-]{1,120}$/.test(value);
/** Amounts are integer millionths of USD. Callers must supply reviewed current tariffs
 * and a defensible upper reservation. No defaults or client budgets are accepted.
 * Foundation only: not wired to a provider until provider-unit accounting is verified. */
export class SpendLedger {
    constructor(private readonly transaction: SpendTransaction, private readonly secret: string) { if (secret.length < 32)
        throw Error('Spend identity secret is required'); }
    private keys(userId: string, requestId: string) { if (!userId || userId.length > 200 || !requestId || requestId.length > 200)
        throw Error('Invalid spend identity'); const hash = (scope: string, value: string) => createHmac('sha256', this.secret).update(scope).update('\0').update(value).digest('hex'); return { account: hash('account', userId), request: hash('request', userId + '\0' + requestId) }; }
    async reserve(input: SpendRequest, limits?: SpendLimits): Promise<SpendReservation> {
        if (!limits || !(['accountDaily', 'accountMonthly', 'featureDaily', 'providerMonthly', 'platformMonthly', 'accountConcurrency', 'platformConcurrency'] as const).every(key => money(limits[key])))
            return { allowed: false, reason: 'unconfigured' };
        if (!money(input.maximumMicroUsd) || ![input.feature, input.provider, input.model, input.tariffReference].every(identifier))
            throw Error('Invalid spend reservation');
        const keys = this.keys(input.userId, input.requestId);
        return this.transaction(async (db) => {
            const prior = (await db.query('SELECT * FROM ai_spend_requests WHERE request_key=$1', [keys.request])).rows[0];
            if (prior) {
                const same = prior.account_key === keys.account && prior.feature === input.feature && prior.provider === input.provider && prior.model === input.model && prior.tariff_reference === input.tariffReference && Number(prior.reserved_micro_usd) === input.maximumMicroUsd;
                return same ? { allowed: true, state: prior.state, replay: true } : { allowed: false, reason: 'request-conflict' };
            }
            // The database clock defines all UTC calendar windows. Outstanding reservations
            // from earlier windows remain liabilities until explicitly reconciled.
            const usage = (await db.query(`SELECT
    COALESCE(sum(CASE WHEN account_key=$1 AND (state='reserved' OR COALESCE(settled_at,created_at)>=date_trunc('day',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') THEN COALESCE(settled_micro_usd,reserved_micro_usd) ELSE 0 END),0)::text AS account_day,
    COALESCE(sum(CASE WHEN account_key=$1 AND (state='reserved' OR COALESCE(settled_at,created_at)>=date_trunc('month',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') THEN COALESCE(settled_micro_usd,reserved_micro_usd) ELSE 0 END),0)::text AS account_month,
    COALESCE(sum(CASE WHEN account_key=$1 AND feature=$2 AND (state='reserved' OR COALESCE(settled_at,created_at)>=date_trunc('day',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') THEN COALESCE(settled_micro_usd,reserved_micro_usd) ELSE 0 END),0)::text AS feature_day,
    COALESCE(sum(CASE WHEN provider=$3 AND (state='reserved' OR COALESCE(settled_at,created_at)>=date_trunc('month',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') THEN COALESCE(settled_micro_usd,reserved_micro_usd) ELSE 0 END),0)::text AS provider_month,
    COALESCE(sum(CASE WHEN state='reserved' OR COALESCE(settled_at,created_at)>=date_trunc('month',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' THEN COALESCE(settled_micro_usd,reserved_micro_usd) ELSE 0 END),0)::text AS platform_month,
    count(*) FILTER(WHERE state='reserved' AND account_key=$1)::text AS account_active,
    count(*) FILTER(WHERE state='reserved')::text AS platform_active
    FROM ai_spend_requests WHERE state!='released'`, [keys.account, input.feature, input.provider])).rows[0];
            const pairs = [['account_day', limits.accountDaily], ['account_month', limits.accountMonthly], ['feature_day', limits.featureDaily], ['provider_month', limits.providerMonthly], ['platform_month', limits.platformMonthly]] as const;
            if (pairs.some(([key, max]) => BigInt(usage[key]) + BigInt(input.maximumMicroUsd) > BigInt(max)) || BigInt(usage.account_active) >= BigInt(limits.accountConcurrency) || BigInt(usage.platform_active) >= BigInt(limits.platformConcurrency))
                return { allowed: false, reason: 'limit' };
            await db.query(`INSERT INTO ai_spend_requests(request_key,account_key,feature,provider,model,tariff_reference,reserved_micro_usd,state) VALUES($1,$2,$3,$4,$5,$6,$7,'reserved')`, [keys.request, keys.account, input.feature, input.provider, input.model, input.tariffReference, input.maximumMicroUsd]);
            return { allowed: true, state: 'reserved', replay: false };
        });
    }
    async settle(userId: string, requestId: string, amountMicroUsd: number, basis: 'actual' | 'estimated') {
        if (!Number.isSafeInteger(amountMicroUsd) || amountMicroUsd < 0 || amountMicroUsd > 1000000000000 || !['actual', 'estimated'].includes(basis))
            throw Error('Invalid spend settlement');
        return this.finish(userId, requestId, 'settled', amountMicroUsd, basis);
    }
    /** Only when the caller knows no provider operation began. Unknown outcome stays reserved. */
    async releaseBeforeExecution(userId: string, requestId: string) { return this.finish(userId, requestId, 'released', 0, null); }
    private async finish(userId: string, requestId: string, state: 'settled' | 'released', amount: number, basis: 'actual' | 'estimated' | null) {
        const keys = this.keys(userId, requestId);
        return this.transaction(async (db) => {
            const row = (await db.query('SELECT * FROM ai_spend_requests WHERE request_key=$1 AND account_key=$2', [keys.request, keys.account])).rows[0];
            if (!row)
                return false;
            if (row.state !== 'reserved') {
                if (row.state === state && Number(row.settled_micro_usd) === amount && row.billing_basis === basis)
                    return true;
                throw Error('Spend settlement conflict');
            }
            // Record real overage instead of hiding it; subsequent reserves see the full charge.
            await db.query('UPDATE ai_spend_requests SET state=$2,settled_micro_usd=$3,billing_basis=$4,settled_at=clock_timestamp() WHERE request_key=$1', [keys.request, state, amount, basis]);
            return true;
        });
    }
}
