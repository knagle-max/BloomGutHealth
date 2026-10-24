import { SharedProviderCircuit } from "../server/provider-circuit";
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
const circuitKey = 'provider:synthetic-' + randomBytes(8).toString('hex');
const circuitPolicy = { [circuitKey]: { maximumFailures: 1, cooldownSeconds: 60, probeLeaseSeconds: 30 } };
const firstCircuit = new SharedProviderCircuit(postgresSpendTransaction(pool), circuitPolicy), secondCircuit = new SharedProviderCircuit(postgresSpendTransaction(pool), circuitPolicy);
const input = (requestId: string) => ({ userId: account, requestId, feature, provider: 'synthetic', model: 'fixture', tariffReference: 'synthetic-no-real-tariff', maximumMicroUsd: 60 });
try {
    const result = await Promise.all([left.reserve(input('one'), limits), right.reserve(input('two'), limits)]);
    assert.equal(result.filter(r => r.allowed).length, 1);
    const winner = result[0].allowed ? 'one' : 'two';
    const usage = { providerResponseId: 'synthetic-provider-receipt', inputTokens: 5, cachedInputTokens: 0, outputTokens: 0 };
    assert.equal(await left.settle(account, winner, 10, 'actual', usage), true);
    assert.equal(await right.settle(account, winner, 10, 'actual', usage), true);
    const stored = (await pool.query('SELECT provider_usage FROM ai_spend_requests WHERE feature=$1 AND state=$2', [feature, 'settled'])).rows[0].provider_usage;
    assert.equal(stored.inputTokens, 5);
    assert.match(stored.providerResponseHash, /^[a-f0-9]{64}$/);
    assert.ok(!JSON.stringify(stored).includes(usage.providerResponseId));
    assert.equal(await right.settle('other-account', winner, 0, 'actual'), false);
    assert.equal((await left.reserve(input('three'), limits)).allowed, true);
    const firstClaim = await firstCircuit.admit([circuitKey]);
    assert.ok(firstClaim);
    await firstCircuit.failure(firstClaim, true);
    assert.equal(await secondCircuit.admit([circuitKey]), null);
    await pool.query("UPDATE provider_circuits SET open_until=clock_timestamp()-interval '1 second' WHERE circuit_key=$1", [circuitKey]);
    const probes = await Promise.all([firstCircuit.admit([circuitKey]), secondCircuit.admit([circuitKey])]);
    assert.equal(probes.filter(Boolean).length, 1);
    await firstCircuit.success(probes.find(Boolean)!);
    assert.ok(await secondCircuit.admit([circuitKey]));
    console.log('PASS: isolated Neon concurrent monetary reservation, private receipt, single provider recovery probe and account isolation; synthetic units only');
}
finally {
    await pool.query('DELETE FROM provider_circuits WHERE circuit_key=$1', [circuitKey]);
    await pool.query('DELETE FROM ai_spend_requests WHERE feature=$1', [feature]);
    await pool.end();
}
