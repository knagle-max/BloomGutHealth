import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { SharedProviderCircuit, immediateProviderFailure } from '../server/provider-circuit';
import type { SpendTransaction } from '../server/spend-ledger';
const policies = { 'platform:ai': { maximumFailures: 5, cooldownSeconds: 60, probeLeaseSeconds: 30 }, 'provider:openai': { maximumFailures: 2, cooldownSeconds: 60, probeLeaseSeconds: 30 }, 'provider:synthetic-other': { maximumFailures: 2, cooldownSeconds: 60, probeLeaseSeconds: 30 } };
const keys = ['platform:ai', 'provider:openai'];
async function setup() { const db = new PGlite(), sql = await readFile(new URL('../migrations/0011_provider_circuits.sql', import.meta.url), 'utf8'); await db.exec(sql); await db.exec(sql); const transaction: SpendTransaction = work => db.transaction(async (tx) => { await tx.query('SELECT pg_advisory_xact_lock(142590, 1)'); return work(tx as any); }); return { db, left: new SharedProviderCircuit(transaction, policies), right: new SharedProviderCircuit(transaction, policies) }; }
test('replicas share provider cooldown, preserve other providers and fence a slow old success', async () => { const { db, left, right } = await setup(); try {
    const old = await left.admit(keys), first = await right.admit(keys);
    assert.ok(old && first);
    await left.failure(first);
    const second = await right.admit(keys);
    assert.ok(second);
    await right.failure(second);
    assert.equal(await left.admit(keys), null);
    await left.success(old);
    assert.equal(await right.admit(keys), null);
    assert.ok(await right.admit(['platform:ai', 'provider:synthetic-other']));
    const rows = (await db.query('SELECT * FROM provider_circuits')).rows;
    assert.ok(rows.every(row => !('user_id' in row) && !('prompt' in row)));
}
finally {
    await db.close();
} });
test('cooldown admits one recovery probe, failed probe reopens and success restores normal calls', async () => { const { db, left, right } = await setup(); try {
    const first = await left.admit(keys);
    await left.failure(first!, true);
    assert.equal(await right.admit(keys), null);
    await db.exec("UPDATE provider_circuits SET open_until=clock_timestamp()-interval '1 second' WHERE circuit_key='provider:openai'");
    const attempts = await Promise.all([left.admit(keys), right.admit(keys)]);
    assert.equal(attempts.filter(Boolean).length, 1);
    await left.failure(attempts.find(Boolean)!);
    assert.equal(await right.admit(keys), null);
    await db.exec("UPDATE provider_circuits SET open_until=clock_timestamp()-interval '1 second' WHERE circuit_key='provider:openai'");
    const probe = await right.admit(keys);
    assert.ok(probe);
    await right.success(probe);
    assert.ok(await left.admit(keys));
    assert.ok(await right.admit(keys));
}
finally {
    await db.close();
} });
test('expired probe leases can be reclaimed, and cancelled or stale probes cannot close newer outage state', async () => { const { db, left, right } = await setup(); try {
    await left.failure((await left.admit(keys))!, true);
    await db.exec("UPDATE provider_circuits SET open_until=clock_timestamp()-interval '1 second' WHERE circuit_key='provider:openai'");
    const expired = await left.admit(keys);
    await db.exec("UPDATE provider_circuits SET probe_expires_at=clock_timestamp()-interval '1 second' WHERE circuit_key='provider:openai'");
    const replacement = await right.admit(keys);
    assert.ok(expired && replacement);
    await left.success(expired);
    assert.equal(await left.admit(keys), null);
    await right.cancelBeforeExecution(replacement);
    const retry = await left.admit(keys);
    assert.ok(retry);
    await right.failure(replacement, true);
    await left.success(retry);
    assert.ok(await right.admit(keys));
}
finally {
    await db.close();
} });
test('platform failures across providers stop all paid AI scopes without stranding a probe on partial denial', async () => { const { db, left } = await setup(); try {
    for (let i = 0; i < 5; i++)
        await left.failure((await left.admit(['platform:ai']))!);
    assert.equal(await left.admit(keys), null);
    assert.equal(await left.admit(['platform:ai', 'provider:synthetic-other']), null);
    await db.exec("UPDATE provider_circuits SET open_until=clock_timestamp()-interval '1 second' WHERE circuit_key='platform:ai'");
    const providerOnly = await left.admit(['provider:openai']);
    await left.failure(providerOnly!, true);
    assert.equal(await left.admit(keys), null);
    const row = (await db.query("SELECT * FROM provider_circuits WHERE circuit_key='platform:ai'")).rows[0];
    assert.equal(row.probe_token, null);
}
finally {
    await db.close();
} });
test('missing policy, invalid keys and storage failures never permit an operation; error classification ignores raw text', async () => { const { db, left } = await setup(); try {
    assert.equal(left.supports(['provider:unknown']), false);
    await assert.rejects(() => left.admit(['provider:unknown']));
    assert.throws(() => new SharedProviderCircuit(async () => { throw Error('unused'); }, { 'provider:openai': { maximumFailures: 0, cooldownSeconds: 60, probeLeaseSeconds: 30 } }));
    const broken = new SharedProviderCircuit(async () => { throw Error('synthetic storage outage'); }, policies);
    await assert.rejects(() => broken.admit(keys), /storage outage/);
    assert.equal(immediateProviderFailure({ status: 429, message: 'PRIVATE_SENTINEL' }), true);
    assert.equal(immediateProviderFailure({ message: 'insufficient_quota' }), false);
    assert.equal(immediateProviderFailure({ code: 'insufficient_quota' }), true);
    assert.equal(immediateProviderFailure({ status: 503 }), false);
}
finally {
    await db.close();
} });
