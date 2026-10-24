import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { SpendLedger, type SpendLimits, type SpendRequest, type SpendTransaction } from '../server/spend-ledger';
const limits: SpendLimits = { accountDaily: 100, accountMonthly: 200, featureDaily: 100, providerMonthly: 300, platformMonthly: 400, accountConcurrency: 5, platformConcurrency: 10 };
const request = (userId: string, requestId: string, maximumMicroUsd = 60): SpendRequest => ({ userId, requestId, maximumMicroUsd, feature: 'synthetic.parser', provider: 'synthetic-provider', model: 'fixture', tariffReference: 'synthetic-test-tariff-v1' });
async function setup() {
    const db = new PGlite();
    const migration = await readFile(new URL('../migrations/0009_ai_spend_ledger.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(await readFile(new URL('../migrations/0010_ai_usage_receipts.sql', import.meta.url), 'utf8'));
    await db.exec(migration);
    const transaction: SpendTransaction = work => db.transaction(async (tx) => { await tx.query('SELECT pg_advisory_xact_lock(142590, 1)'); return work(tx as any); });
    const a = new SpendLedger(transaction, 'synthetic-identity-secret-long-enough'), b = new SpendLedger(transaction, 'synthetic-identity-secret-long-enough');
    return { db, a, b };
}
test('parallel ledger consumers cannot reserve beyond account, feature, provider or platform budgets; identity is not persisted', async () => {
    const { db, a, b } = await setup();
    try {
        const answers = await Promise.all([a.reserve(request('private-user-a', 'one'), limits), b.reserve(request('private-user-a', 'two'), limits)]);
        assert.equal(answers.filter(r => r.allowed).length, 1);
        assert.equal((await b.reserve(request('private-user-b', 'one'), limits)).allowed, true);
        assert.equal((await a.reserve(request('private-user-c', 'one', 190), { ...limits, accountDaily: 250, featureDaily: 250, accountMonthly: 250 })).allowed, false); // provider ceiling
        assert.equal((await a.reserve(request('private-user-c', 'two', 80), { ...limits, platformMonthly: 150 })).allowed, false);
        assert.equal((await a.reserve({ ...request('private-user-b', 'other', 50), feature: 'other' }, limits)).allowed, false); // account daily across features
        const raw = JSON.stringify((await db.query('SELECT * FROM ai_spend_requests')).rows);
        assert.ok(!raw.includes('private-user'));
        assert.ok(!raw.includes('"one"'));
        assert.ok(!raw.includes('"two"'));
    }
    finally {
        await db.close();
    }
});
test('idempotent retries and settlements reconcile once, preserve actual overage and reject account/conflicting writes', async () => {
    const { db, a, b } = await setup();
    try {
        assert.deepEqual(await a.reserve(request('a', 'one'), limits), { allowed: true, state: 'reserved', replay: false });
        assert.deepEqual(await b.reserve(request('a', 'one'), limits), { allowed: true, state: 'reserved', replay: true });
        assert.deepEqual(await b.reserve({ ...request('a', 'one'), model: 'other' }, limits), { allowed: false, reason: 'request-conflict' });
        assert.equal(await b.settle('other', 'one', 10, 'actual'), false);
        assert.equal(await a.settle('a', 'one', 20, 'actual'), true);
        assert.equal(await b.settle('a', 'one', 20, 'actual'), true);
        await assert.rejects(() => b.settle('a', 'one', 10, 'actual'), /conflict/);
        await assert.rejects(() => b.releaseBeforeExecution('a', 'one'), /conflict/);
        assert.equal((await a.reserve(request('a', 'two', 80), limits)).allowed, true);
        assert.equal(await a.settle('a', 'two', 150, 'estimated'), true);
        assert.equal((await b.reserve(request('a', 'three', 1), limits)).allowed, false);
        const rows = (await db.query('SELECT settled_micro_usd,billing_basis FROM ai_spend_requests ORDER BY settled_micro_usd')).rows;
        assert.deepEqual(rows.map(r => [Number(r.settled_micro_usd), r.billing_basis]), [[20, 'actual'], [150, 'estimated']]);
    }
    finally {
        await db.close();
    }
});
test('unknown outcomes retain liability across calendar boundaries; known pre-execution release frees concurrency', async () => {
    const { db, a, b } = await setup();
    try {
        await a.reserve(request('a', 'one'), { ...limits, accountConcurrency: 1 });
        assert.equal((await b.reserve(request('a', 'two', 1), { ...limits, accountConcurrency: 1 })).allowed, false);
        await db.exec("UPDATE ai_spend_requests SET created_at='2020-01-01T00:00:00Z'");
        assert.equal((await b.reserve(request('a', 'three', 50), limits)).allowed, false); // old unresolved reservation not forgiven
        assert.equal(await a.releaseBeforeExecution('a', 'one'), true);
        assert.equal(await b.releaseBeforeExecution('a', 'one'), true);
        assert.equal((await b.reserve(request('a', 'two', 100), limits)).allowed, true);
        await a.settle('a', 'two', 100, 'actual');
        await db.exec("UPDATE ai_spend_requests SET created_at='2020-01-01T00:00:00Z' WHERE state='settled'");
        assert.equal((await b.reserve(request('a', 'four', 1), limits)).allowed, false); // late reconciliation uses settlement window
        await db.exec("UPDATE ai_spend_requests SET settled_at='2020-01-02T00:00:00Z' WHERE state='settled'");
        assert.equal((await b.reserve(request('a', 'five', 100), limits)).allowed, true);
    }
    finally {
        await db.close();
    }
});
test('unconfigured/invalid allowances, wrong identity and database failures cannot silently permit spend', async () => {
    const { db, a } = await setup();
    try {
        assert.deepEqual(await a.reserve(request('a', 'one')), { allowed: false, reason: 'unconfigured' });
        assert.deepEqual(await a.reserve(request('a', 'one'), {} as any), { allowed: false, reason: 'unconfigured' });
        assert.deepEqual(await a.reserve(request('a', 'one'), { ...limits, accountDaily: NaN }), { allowed: false, reason: 'unconfigured' });
        await assert.rejects(() => a.reserve({ ...request('a', 'one'), maximumMicroUsd: 0 }, limits));
        await assert.rejects(() => a.reserve({ ...request('a', 'one'), feature: 'user private text' }, limits));
        assert.throws(() => new SpendLedger(async () => { throw Error('unused'); }, 'short'));
        const broken = new SpendLedger(async () => { throw Error('database unavailable'); }, 'synthetic-identity-secret-long-enough');
        await assert.rejects(() => broken.reserve(request('a', 'one'), limits), /database unavailable/);
        assert.equal((await db.query('SELECT * FROM ai_spend_requests')).rows.length, 0);
    }
    finally {
        await db.close();
    }
});
test('UTC daily reset preserves monthly charges, per-feature limits and global concurrency under a non-UTC session', async () => {
    const { db, a, b } = await setup();
    try {
        await db.exec("SET TIME ZONE 'Pacific/Auckland'");
        assert.equal((await a.reserve(request('a', 'feature', 60), { ...limits, featureDaily: 50 })).allowed, false);
        await a.reserve(request('a', 'yesterday', 100), limits);
        await a.settle('a', 'yesterday', 100, 'actual');
        await db.exec("UPDATE ai_spend_requests SET created_at=(date_trunc('day',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')-interval '1 second',settled_at=(date_trunc('day',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')-interval '1 second'");
        // Unless this is the first UTC day of the month, yesterday still belongs to this month's budget.
        const today = (await db.query("SELECT extract(day FROM clock_timestamp() AT TIME ZONE 'UTC') AS day")).rows[0].day;
        assert.equal((await b.reserve(request('a', 'today', 100), limits)).allowed, true);
        await b.settle('a', 'today', 100, 'actual');
        assert.equal((await b.reserve(request('a', 'monthly', 1), { ...limits, accountDaily: 300, featureDaily: 300 })).allowed, Number(today) === 1);
        const first = await a.reserve(request('b', 'global-one', 1), { ...limits, platformConcurrency: 1 });
        assert.equal(first.allowed, Number(today) !== 1); // a remaining reservation occupies the slot only on month boundary
        if (Number(today) !== 1)
            assert.equal((await b.reserve(request('c', 'global-two', 1), { ...limits, platformConcurrency: 1 })).allowed, false);
    }
    finally {
        await db.close();
    }
});
test('usage receipts are atomic, idempotent and retain only token counts plus a hashed provider identifier', async () => { const { db, a } = await setup(); try {
    await a.reserve(request('synthetic-a', 'receipt', 60), limits);
    const usage = { providerResponseId: 'resp_private_synthetic', inputTokens: 10, cachedInputTokens: 0, outputTokens: 1 };
    assert.equal(await a.settle('synthetic-a', 'receipt', 28, 'actual', usage), true);
    assert.equal(await a.settle('synthetic-a', 'receipt', 28, 'actual', usage), true);
    const row = (await db.query('SELECT provider_usage FROM ai_spend_requests')).rows[0];
    assert.equal(row.provider_usage.inputTokens, 10);
    assert.equal(row.provider_usage.cachedInputTokens, 0);
    assert.match(row.provider_usage.providerResponseHash, /^[a-f0-9]{64}$/);
    assert.ok(!JSON.stringify(row).includes('resp_private_synthetic'));
    await assert.rejects(() => a.settle('synthetic-a', 'receipt', 28, 'actual', { ...usage, inputTokens: 11 }), /conflict/);
    await assert.rejects(() => a.settle('synthetic-a', 'receipt', 28, 'actual', { ...usage, cachedInputTokens: 20 }), /Invalid provider usage/);
}
finally {
    await db.close();
} });
