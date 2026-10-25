import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { FeatureControlStorage, FeatureControlStorageError, postgresFeatureControlTransaction } from '../server/feature-control-storage';
// Dedicated CI invocation; no fallback to a Render or local application URL.
assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Run only in the schema-only PR workflow');
assert.equal(process.env.GITHUB_EVENT_NAME, 'pull_request', 'Run only in the schema-only PR workflow');
assert.equal(process.env.BLOOM_SMOKE_ISOLATED, 'true', 'Only an explicitly isolated PR database is authorized');
assert.ok(process.env.DATABASE_URL_UNPOOLED, 'An isolated direct database URL must be injected');
process.env.PRECISION_DATA_KEY = randomBytes(32).toString('base64');
delete process.env.PRECISION_DATA_KEYRING;
delete process.env.PRECISION_ACTIVE_KEY_ID;
const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED, max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 5000 });
const binding = { serviceId: 'srv-' + randomBytes(12).toString('hex'), environment: 'isolated-synthetic' as const, featureId: 'bloom.food.recommendations' };
const request = (revision = 1) => ({ binding, actorId: 'synthetic-ci-operator', requestId: randomUUID(), expectedRevision: revision - 1, reason: 'Synthetic schema-only control history test', control: { ...binding, revision, state: 'paused' as const, materialDigest: 'a'.repeat(64), reviewId: 'synthetic-no-release-approval', scope: { territories: ['CA'], populations: ['adult'], purposes: ['synthetic-ci'] }, rolloutPercent: 0, cohortId: 'synthetic-ci', changedBy: 'synthetic-ci-operator', expiresAt: new Date(Date.now() + 3600000).toISOString() } });
let stage = 'migration';
try {
    for(const file of ['0012_feature_control_history.sql','0013_feature_control_request_unique.sql'])await pool.query(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8'));
    assert.equal((await pool.query("SELECT count(*)::int AS n FROM pg_constraint WHERE conrelid='feature_control_audit'::regclass AND conname='feature_control_audit_request' AND contype='u'")).rows[0].n,1);
    const transaction = postgresFeatureControlTransaction(pool), left = new FeatureControlStorage(transaction, async () => true), right = new FeatureControlStorage(transaction, async () => true);
    stage = 'default-deny';
    await assert.rejects(() => new FeatureControlStorage(transaction).append(request()), error => error instanceof FeatureControlStorageError && error.code === 'ACCESS_DENIED');
    stage = 'concurrent-cas';
    const candidates = [request(), request()], results = await Promise.allSettled([left.append(candidates[0]), right.append(candidates[1])]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    assert.equal(results.filter(r => r.status === 'rejected' && r.reason instanceof FeatureControlStorageError && r.reason.code === 'CONFLICT').length, 1);
    const winner = results[0].status === 'fulfilled' ? candidates[0] : candidates[1];
    stage = 'idempotency';
    assert.equal((await right.append(winner)).replay, true);
    await right.append(request(2));
    const old = await left.append(winner);
    assert.equal(old.control.revision, 1);
    assert.equal(old.currentRevision, 2);
    stage = 'encrypted-history';
    const history = await right.history(binding, 'synthetic-ci-operator');
    assert.deepEqual(history.map(r => r.control.revision), [2, 1]);
    assert.equal((await left.get(binding, 'synthetic-ci-operator'))?.rolloutPercent, 0);
    const raw = JSON.stringify((await pool.query('SELECT * FROM feature_control_audit WHERE service_id=$1', [binding.serviceId])).rows);
    assert.ok(!raw.includes('synthetic-ci-operator'));
    assert.ok(!raw.includes('Synthetic schema-only control history test'));
    stage = 'immutable-audit';
    await assert.rejects(() => pool.query('UPDATE feature_control_audit SET revision=revision WHERE service_id=$1', [binding.serviceId]), error => typeof error === 'object' && error !== null && 'code' in error && error.code === '55000');
    assert.equal((await right.history(binding, 'synthetic-ci-operator')).length, 2);
    console.log('PASS: isolated Neon control-history default denial, real concurrent CAS, encrypted audit, historical replay and immutable SQL guard; no runtime activation');
}
catch {
    console.error(`FAIL: isolated feature control database smoke; stage=${stage}`);
    process.exitCode = 1;
}
finally {
    // Retain the append-only synthetic audit in this disposable PR branch. Its
    // transient encryption key and synthetic operator are never used by the app.
    await pool.end().catch(() => { });
}
