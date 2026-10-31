import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { registerFeatureControlHttp, type FeatureControlHttpConfiguration } from '../server/feature-control-http';
import { SharedRateLimiter } from '../server/shared-rate-limit';
import { FeatureStepUpError } from '../server/feature-step-up';
const featureId = 'bloom.food.meal_logging', actor = 'PRIVATE_CONTROLLER', sessionId = 'private_session_123456789';
function body() { const binding = { featureId, serviceId: 'srv-syntheticreview', environment: 'isolated-synthetic' }; return { intent: { action: 'pause', change: { binding, actorId: actor, requestId: randomUUID(), expectedRevision: 0, reason: 'PRIVATE_REASON', control: { ...binding, revision: 1, state: 'paused', materialDigest: 'a'.repeat(64), reviewId: 'synthetic-review', scope: { territories: ['CA'], populations: ['adult'], purposes: ['wellness'] }, rolloutPercent: 0, cohortId: 'PRIVATE_COHORT', changedBy: actor, expiresAt: new Date(Date.now() + 3600000).toISOString() } } }, password: 'PRIVATE_PASSWORD' }; }
async function serve(configuration: FeatureControlHttpConfiguration, authenticated = true) {
    const app = express();
    app.use(express.json({ limit: '64kb' }));
    app.use((req, _res, next) => { req.session = { userId: authenticated ? actor : undefined } as any; req.sessionID = sessionId; next(); });
    registerFeatureControlHttp(app, (_req, _res, next) => next(), configuration);
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(resolve => server.once('listening', resolve));
    return { base: `http://127.0.0.1:${(server.address() as any).port}`, close: async () => { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); } };
}
const post = (base: string, path: string, data: unknown) => fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
const issuePath = `/api/admin/features/${featureId}/control/step-up`;
test('HTTP control boundary denies missing sessions and budget outages before credentials with private safe errors', async () => {
    let calls = 0;
    const configuration: FeatureControlHttpConfiguration = { budgets: { consume: async () => { throw Error('PRIVATE_DATABASE_URL'); } }, service: { issue: async () => { calls++; throw Error('unexpected'); }, apply: async () => { calls++; throw Error('unexpected'); } } };
    const unauth = await serve(configuration, false), auth = await serve(configuration);
    try {
        assert.equal((await post(unauth.base, issuePath, body())).status, 401);
        for (const path of [issuePath, issuePath.toUpperCase() + '/']) {
            const response = await post(auth.base, path, body());
            assert.equal(response.status, 503);
            assert.match(response.headers.get('cache-control') || '', /no-store/);
            assert.doesNotMatch(await response.text(), /PRIVATE_/);
        }
        assert.equal(calls, 0);
    }
    finally {
        await unauth.close();
        await auth.close();
    }
});
test('all accepted HTTP step-up paths share an atomic account budget across replicas before password verification', async () => {
    const db = new PGlite();
    const left = new SharedRateLimiter(db as any, 'synthetic-secret-for-controller-budget'), right = new SharedRateLimiter(db as any, 'synthetic-secret-for-controller-budget');
    await left.initialize();
    let credentials = 0;
    const service: FeatureControlHttpConfiguration['service'] = { issue: async (context) => { assert.deepEqual(context, { actorId: actor, sessionId }); credentials++; throw new FeatureStepUpError('DENIED'); }, apply: async () => { throw Error('unexpected'); } };
    const servers = await Promise.all([serve({ service, budgets: left }), serve({ service, budgets: right })]);
    try {
        for (let i = 0; i < 5; i++)
            assert.equal((await post(servers[i % 2].base, i % 2 ? issuePath.replace('/api/admin/features', '/API/ADMIN/FEATURES') + '/' : issuePath, body())).status, 403);
        const denied = await post(servers[1].base, issuePath, body());
        assert.equal(denied.status, 429);
        assert.equal(denied.headers.get('retry-after'), '900');
        assert.equal(credentials, 5);
        const raw = JSON.stringify((await db.query('SELECT * FROM request_budgets')).rows);
        assert.doesNotMatch(raw, /PRIVATE_|private_session/);
    }
    finally {
        await Promise.all(servers.map(server => server.close()));
        await db.close();
    }
});
test('HTTP control validates exact feature and payload, derives session identity and projects a minimal no-store result', async () => {
    let issued = 0, written = 0;
    const server = await serve({ budgets: { consume: async () => true }, service: { issue: async (context) => { assert.deepEqual(context, { actorId: actor, sessionId }); issued++; return { proof: 'synthetic-proof', expiresAt: new Date(Date.now() + 120000).toISOString(), purpose: 'reauthentication-only' }; }, apply: async (context, input: any) => { assert.deepEqual(context, { actorId: actor, sessionId }); written++; return { control: input.change.control, replay: false, currentRevision: 1 }; } } });
    try {
        for (const data of [{ ...body(), userId: 'forged' }, { ...body(), approval: true }])
            assert.equal((await post(server.base, issuePath, data)).status, 400);
        assert.equal((await post(server.base, issuePath.replace(featureId, 'unknown'), body())).status, 400);
        assert.equal(issued, 0);
        const issuedResponse = await post(server.base, issuePath, body());
        assert.equal(issuedResponse.status, 200);
        assert.equal(issued, 1);
        const { password, ...data } = body(), response = await post(server.base, issuePath.replace('/step-up', ''), { ...data, proof: 'synthetic-proof' });
        assert.equal(response.status, 200);
        assert.match(response.headers.get('cache-control') || '', /no-store/);
        assert.equal(written, 1);
        assert.deepEqual(await response.json(), { featureId, revision: 1, state: 'paused', replay: false, currentRevision: 1 });
    }
    finally {
        await server.close();
    }
});
test('unresponsive shared budgets time out without invoking password or control work', async () => {
    let calls = 0;
    const server = await serve({ budgets: { consume: async () => new Promise<boolean>(() => { }) }, service: { issue: async () => { calls++; throw Error('unexpected'); }, apply: async () => { calls++; throw Error('unexpected'); } } });
    try {
        const started = Date.now(), response = await post(server.base, issuePath, body());
        assert.equal(response.status, 503);
        assert.ok(Date.now() - started < 5000);
        assert.equal(calls, 0);
    }
    finally {
        await server.close();
    }
});
