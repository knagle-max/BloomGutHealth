import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { FeatureStepUp, FeatureStepUpReceipts, FeatureStepUpError, type StepUpController, type StepUpIntent } from '../server/feature-step-up';
const binding = { serviceId: 'srv-syntheticreview', environment: 'isolated-synthetic' as const };
const context = { actorId: 'private-admin', sessionId: 'private_session_123456789' };
function intent(): StepUpIntent { return { action: 'pause', change: { binding: { ...binding, featureId: 'bloom.food.recommendations' }, actorId: context.actorId, requestId: randomUUID(), expectedRevision: 0, reason: 'private-reason', control: { ...binding, featureId: 'bloom.food.recommendations', revision: 1, state: 'paused', materialDigest: 'a'.repeat(64), reviewId: 'synthetic-review', scope: { territories: ['CA'], populations: ['adult'], purposes: ['nutrition'] }, rolloutPercent: 0, cohortId: 'private-cohort', changedBy: context.actorId, expiresAt: new Date(Date.now() + 3600000).toISOString() } } }; }
const code = (expected: string) => (error: unknown) => error instanceof FeatureStepUpError && error.code === expected;
async function setup() {
    const db = new PGlite();
    const sql = await readFile(new URL('../migrations/0014_feature_control_step_up_receipts.sql', import.meta.url), 'utf8');
    await db.exec(sql);
    await db.exec(sql);
    let grant: StepUpController | null = { ...binding, userId: context.actorId, role: 'feature-controller', scopes: ['features:control'], grantId: 'synthetic-grant', reviewReference: 'synthetic-review', featureIds: ['bloom.food.recommendations'], actions: ['pause'], credentialVersion: 'b'.repeat(64), expiresAt: new Date(Date.now() + 3600000).toISOString() };
    const receipts = new FeatureStepUpReceipts(db as any);
    let now = Date.now();
    const adapters = { reauthenticate: async (_c: unknown, _i: unknown, password: string) => password === 'synthetic-password' ? grant : null, current: async () => grant };
    const create = () => new FeatureStepUp(binding, 'synthetic-secret-'.repeat(4), receipts, adapters, () => now);
    return { db, receipts, create, setGrant: (value: StepUpController | null) => { grant = value; }, getGrant: () => structuredClone(grant!), setNow: (value: number) => { now = value; } };
}
test('step-up defaults deny and metadata readers, incorrect passwords and immutable activation cannot issue receipts', async () => {
    const f = await setup();
    try {
        const request = intent();
        await assert.rejects(() => new FeatureStepUp(binding, 'x'.repeat(32), f.receipts).issue(context, request, 'password'), code('DENIED'));
        await assert.rejects(() => f.create().issue(context, request, 'wrong'), code('DENIED'));
        await assert.rejects(() => f.create().issue(context, request, 'x'.repeat(73)), code('INVALID_REQUEST'));
        f.setGrant({ ...f.getGrant(), role: 'feature-reader' } as any);
        await assert.rejects(() => f.create().issue(context, request, 'synthetic-password'), code('DENIED'));
        request.action = 'enable';
        request.change.control.state = 'enabled';
        request.change.binding.featureId = request.change.control.featureId = 'bloom.genetics.diet_rank';
        await assert.rejects(() => f.create().issue(context, request, 'synthetic-password'), code('DENIED'));
        assert.equal((await f.db.query('SELECT count(*)::int AS n FROM feature_control_step_up_receipts')).rows[0].n, 0);
    }
    finally {
        await f.db.close();
    }
});
test('step-up binds exact session and intent without consuming on mismatch; replicas consume once and lease rechecks revocation', async () => {
    const f = await setup();
    try {
        const request = intent(), left = f.create(), right = f.create(), issued = await left.issue(context, request, 'synthetic-password');
        for (const [c, i] of [[{ ...context, sessionId: 'different_session_123456' }, request], [context, { ...request, change: { ...request.change, reason: 'changed-reason' } }], [context, { ...request, change: { ...request.change, requestId: randomUUID() } }]] as const)
            await assert.rejects(() => right.consume(c, i, issued.proof), code('INVALID_PROOF'));
        const results = await Promise.allSettled([left.consume(context, request, issued.proof), right.consume(context, request, issued.proof)]);
        assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
        assert.equal(results.filter(r => r.status === 'rejected' && code('INVALID_PROOF')(r.reason)).length, 1);
        const lease = results.find(r => r.status === 'fulfilled')!;
        if (lease.status !== 'fulfilled')
            throw Error('missing lease');
        const access = { operation: 'write' as const, change: request.change };
        for (let i = 0; i < 3; i++)
            assert.equal(await lease.value.authorize(access, new AbortController().signal), true);
        assert.equal(await lease.value.authorize({ ...access, change: { ...request.change, reason: 'different' } }, new AbortController().signal), false);
        const raw = JSON.stringify((await f.db.query('SELECT * FROM feature_control_step_up_receipts')).rows);
        for (const privateValue of [context.actorId, context.sessionId, 'private-reason', 'synthetic-password', 'private-cohort'])
            assert.ok(!raw.includes(privateValue));
        f.setGrant(null);
        assert.equal(await lease.value.authorize(access, new AbortController().signal), false);
    }
    finally {
        await f.db.close();
    }
});
test('step-up rejects credential changes, tampering, expired proofs and unavailable shared storage', async () => {
    const f = await setup();
    try {
        const request = intent(), service = f.create(), issued = await service.issue(context, request, 'synthetic-password'), original = f.getGrant();
        f.setGrant({ ...original, credentialVersion: 'c'.repeat(64) });
        await assert.rejects(() => service.consume(context, request, issued.proof), code('INVALID_PROOF'));
        f.setGrant(original);
        await assert.rejects(() => service.consume(context, request, issued.proof.slice(0, -1) + (issued.proof.endsWith('a') ? 'b' : 'a')), code('INVALID_PROOF'));
        await assert.rejects(() => service.consume(context, request, 'x'.repeat(1025)), code('INVALID_PROOF'));
        f.setNow(Date.parse(issued.expiresAt));
        await assert.rejects(() => service.consume(context, request, issued.proof), code('INVALID_PROOF'));
        const unavailable = new FeatureStepUp(binding, 'x'.repeat(32), new FeatureStepUpReceipts({ query: async () => { throw Error('private-url'); } } as any), { reauthenticate: async () => original, current: async () => original });
        await assert.rejects(() => unavailable.issue(context, request, 'synthetic-password'), code('UNAVAILABLE'));
    }
    finally {
        await f.db.close();
    }
});
test('consumed proof composes with all transactional storage checks and aborts or database expiry deny', async () => {
    const f = await setup();
    try {
        process.env.PRECISION_DATA_KEY = Buffer.alloc(32, 7).toString('base64');
        delete process.env.PRECISION_DATA_KEYRING;
        delete process.env.PRECISION_ACTIVE_KEY_ID;
        await f.db.exec(await readFile(new URL('../migrations/0012_feature_control_history.sql', import.meta.url), 'utf8'));
        const { FeatureControlStorage } = await import('../server/feature-control-storage');
        const request = intent(), service = f.create(), issued = await service.issue(context, request, 'synthetic-password');
        const lease = await service.consume(context, request, issued.proof);
        const storage = new FeatureControlStorage(work => f.db.transaction(tx => work(tx as any)), lease.authorize);
        assert.equal((await storage.append(request.change)).control.revision, 1);
        const aborted = new AbortController();
        aborted.abort();
        assert.equal(await lease.authorize({ operation: 'write', change: request.change }, aborted.signal), false);
        const another = await service.issue(context, request, 'synthetic-password');
        await f.db.exec("WITH clock AS (SELECT clock_timestamp() AS at) UPDATE feature_control_step_up_receipts SET created_at=at-interval '3 minutes', expires_at=at-interval '1 minute' FROM clock WHERE consumed_at IS NULL");
        await assert.rejects(() => service.consume(context, request, another.proof), code('INVALID_PROOF'));
        assert.equal(await f.receipts.prune(), 1);
    }
    finally {
        await f.db.close();
    }
});
