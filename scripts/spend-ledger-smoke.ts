import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { Pool } from 'pg';
import { SpendLedger, postgresSpendTransaction, type SpendLimits } from '../server/spend-ledger';
assert.equal(process.env.BLOOM_SMOKE_ISOLATED, 'true', 'Only the explicitly isolated PR database is authorized');
assert.ok(process.env.DATABASE_URL_UNPOOLED);
const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED, max: 4 }), secret = randomBytes(32).toString('hex');
const limits: SpendLimits = { accountDaily: 100, accountMonthly: 200, featureDaily: 100, providerMonthly: 1000, platformMonthly: 1000, accountConcurrency: 2, platformConcurrency: 4 };
const left = new SpendLedger(postgresSpendTransaction(pool), secret), right = new SpendLedger(postgresSpendTransaction(pool), secret);
const account = 'synthetic-spend-' + randomBytes(10).toString('hex'), feature = 'synthetic-smoke-' + randomBytes(8).toString('hex');
const input = (requestId: string) => ({ userId: account, requestId, feature, provider: 'synthetic', model: 'fixture', tariffReference: 'synthetic-no-real-tariff', maximumMicroUsd: 60 });
try {
    const result = await Promise.all([left.reserve(input('one'), limits), right.reserve(input('two'), limits)]);
    assert.equal(result.filter(r => r.allowed).length, 1);
    const winner = result[0].allowed ? 'one' : 'two';
    assert.equal(await left.settle(account, winner, 10, 'actual'), true);
    assert.equal(await right.settle(account, winner, 10, 'actual'), true);
    assert.equal(await right.settle('other-account', winner, 0, 'actual'), false);
    assert.equal((await left.reserve(input('three'), limits)).allowed, true);
    console.log('PASS: isolated Neon concurrent monetary reservation, idempotent settlement and account isolation; synthetic units only');
}
finally {
    await pool.query('DELETE FROM ai_spend_requests WHERE feature=$1', [feature]);
    await pool.end();
}
