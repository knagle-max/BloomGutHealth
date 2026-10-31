import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { featureControllerAdapters } from '../server/feature-controller-auth';
import type { StepUpIntent } from '../server/feature-step-up';
const binding = { serviceId: 'srv-syntheticreview', environment: 'isolated-synthetic' as const, featureId: 'bloom.food.recommendations' };
const context = { actorId: 'synthetic-admin', sessionId: 'synthetic_session_12345' };
function setupGrant() { return { userId: context.actorId, role: 'feature-controller', scopes: ['features:control'], grantId: 'synthetic-grant', reviewReference: 'synthetic-review', serviceId: binding.serviceId, environment: binding.environment, featureIds: [binding.featureId], actions: ['pause'], expiresAt: new Date(Date.now() + 3600000).toISOString() }; }
function request(): StepUpIntent { return { action: 'pause', change: { binding, actorId: context.actorId, requestId: randomUUID(), expectedRevision: 0, reason: 'synthetic reason', control: { ...binding, revision: 1, state: 'paused', materialDigest: 'a'.repeat(64), reviewId: 'synthetic-review', scope: { territories: ['CA'], populations: ['adult'], purposes: ['nutrition'] }, rolloutPercent: 0, cohortId: 'synthetic', changedBy: context.actorId, expiresAt: new Date(Date.now() + 3600000).toISOString() } } }; }
test('controller adapter requires separate explicit deployment scope and actual current account password', async () => {
    const account = { id: context.actorId, password: await bcrypt.hash('synthetic-password', 10) };
    const env: Record<string, string | undefined> = { RENDER_SERVICE_ID: binding.serviceId, BLOOM_FEATURE_CONTROL_ENVIRONMENT: binding.environment, BLOOM_FEATURE_CONTROL_KILL_SWITCH: 'false', BLOOM_FEATURE_CONTROLLERS: JSON.stringify([setupGrant()]) };
    const adapter = featureControllerAdapters({ getUser: async () => account }, () => env), signal = new AbortController().signal, intent = request();
    assert.equal(await adapter.reauthenticate(context, intent, 'wrong', signal), null);
    const grant = await adapter.reauthenticate(context, intent, 'synthetic-password', signal);
    assert.ok(grant);
    assert.match(grant.credentialVersion, /^[a-f0-9]{64}$/);
    assert.ok(!JSON.stringify(grant).includes(account.password));
    const original = grant.credentialVersion;
    account.password = await bcrypt.hash('different-password', 10);
    assert.notEqual((await adapter.current(context, intent, signal))?.credentialVersion, original);
    assert.equal(await adapter.reauthenticate(context, intent, 'synthetic-password', signal), null);
    for (const patch of [{ BLOOM_FEATURE_CONTROL_KILL_SWITCH: undefined }, { RENDER_SERVICE_ID: 'srv-other' }, { BLOOM_FEATURE_CONTROLLERS: JSON.stringify([{ ...setupGrant(), role: 'feature-admin', scopes: ['features:read'] }]) }, { BLOOM_FEATURE_CONTROLLERS: JSON.stringify([setupGrant(), setupGrant()]) }, { BLOOM_FEATURE_CONTROLLERS: 'malformed' }]) {
        assert.equal(await featureControllerAdapters({ getUser: async () => account }, () => ({ ...env, ...patch })).current(context, intent, signal), null);
    }
    assert.equal(await featureControllerAdapters({ getUser: async () => undefined }, () => env).current(context, intent, signal), null);
    const abort = new AbortController();
    abort.abort();
    assert.equal(await adapter.current(context, intent, abort.signal), null);
});
test('controller adapter reload after password comparison denies a revoked scope or removed account', async () => {
    const account = { id: context.actorId, password: await bcrypt.hash('synthetic-password', 10) };
    let reads = 0;
    const env = { RENDER_SERVICE_ID: binding.serviceId, BLOOM_FEATURE_CONTROL_ENVIRONMENT: binding.environment, BLOOM_FEATURE_CONTROL_KILL_SWITCH: 'false', BLOOM_FEATURE_CONTROLLERS: JSON.stringify([setupGrant()]) };
    const adapter = featureControllerAdapters({ getUser: async () => ++reads >= 3 ? undefined : account }, () => env);
    assert.equal(await adapter.reauthenticate(context, request(), 'synthetic-password', new AbortController().signal), null);
    assert.equal(reads, 3);
});
