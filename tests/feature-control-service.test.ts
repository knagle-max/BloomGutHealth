import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import bcrypt from 'bcrypt';
import { PGlite } from '@electric-sql/pglite';
import { FeatureStepUp, FeatureStepUpReceipts, type StepUpIntent } from '../server/feature-step-up';
import { featureControllerAdapters } from '../server/feature-controller-auth';
import { FeatureControlService, type FeatureControlReviewAdapter } from '../server/feature-control-service';
import { FeatureControlStorageError } from '../server/feature-control-storage';
import { effectiveCapabilityDecision } from '../server/effective-capability';
async function setup() {
    process.env.PRECISION_DATA_KEY = Buffer.alloc(32, 7).toString('base64');
    delete process.env.PRECISION_DATA_KEYRING;
    delete process.env.PRECISION_ACTIVE_KEY_ID;
    const db = new PGlite();
    for (const name of ['0012_feature_control_history.sql', '0014_feature_control_step_up_receipts.sql'])
        await db.exec(await readFile(new URL('../migrations/' + name, import.meta.url), 'utf8'));
    const now = Date.now(), expiresAt = new Date(now + 3600000).toISOString(), validFrom = new Date(now - 3600000).toISOString(), featureId = 'bloom.food.meal_logging', binding = { serviceId: 'srv-syntheticreview', environment: 'isolated-synthetic' as const, featureId }, context = { actorId: 'synthetic-controller', sessionId: 'synthetic_session_123456' };
    const scope = { territories: ['CA'], populations: ['adult'], purposes: ['wellness'] }, materialDigest = 'a'.repeat(64);
    const request = (revision = 1): StepUpIntent => ({ action: 'enable', change: { binding, actorId: context.actorId, requestId: randomUUID(), expectedRevision: revision - 1, reason: 'Synthetic control integration', control: { ...binding, revision, state: 'enabled', materialDigest, reviewId: 'synthetic-review', scope, rolloutPercent: 100, cohortId: 'synthetic-cohort', changedBy: context.actorId, expiresAt } } });
    const grant = { userId: context.actorId, role: 'feature-controller', scopes: ['features:control'], grantId: 'synthetic-grant', reviewReference: 'synthetic-controller-review', serviceId: binding.serviceId, environment: binding.environment, featureIds: [featureId], actions: ['enable', 'pause', 'emergency-disable', 'rollback'], expiresAt };
    let account: {
        id: string;
        password: string;
    } | undefined = { id: context.actorId, password: await bcrypt.hash('synthetic-password', 10) };
    const env = { RENDER_SERVICE_ID: binding.serviceId, BLOOM_FEATURE_CONTROL_ENVIRONMENT: binding.environment, BLOOM_FEATURE_CONTROL_KILL_SWITCH: 'false', BLOOM_FEATURE_CONTROLLERS: JSON.stringify([grant]) };
    const stepUp = new FeatureStepUp({ serviceId: binding.serviceId, environment: binding.environment }, 'synthetic-secret-'.repeat(4), new FeatureStepUpReceipts(db as any), featureControllerAdapters({ getUser: async () => account }, () => env));
    const facts = { deployment: { serviceId: binding.serviceId, environment: binding.environment, materialDigest, requiredReviews: ['LEGAL', 'SECURITY'] as ('LEGAL' | 'SECURITY')[], highConsequence: false, requireDistinctReviewers: true, consentPurpose: 'optional-ai' }, implementation: { readiness: 'VERIFIED' as const, materialDigest, verificationReference: 'synthetic-test' }, review: { id: 'synthetic-review', featureId, status: 'APPROVED' as const, serviceId: binding.serviceId, environment: binding.environment, materialDigest, validFrom, expiresAt, scope, maximumRolloutPercent: 100, rolloutKeyId: 'synthetic-key', cohorts: [{ id: 'synthetic-cohort', accountIds: null }], evidence: ['LEGAL', 'SECURITY'].map(role => ({ role: role as 'LEGAL' | 'SECURITY', reviewerId: 'synthetic-' + role, reference: 'synthetic-evidence-' + role, status: 'APPROVED' as const, materialDigest, validFrom, expiresAt })) } };
    const source = { id: featureId, category: 'GENERAL_RELEASE', approval: 'APPROVED', publicEnabled: true };
    const reviews: FeatureControlReviewAdapter = { current: async () => structuredClone(facts), source: () => source };
    const transaction: any = (work: any) => db.transaction(tx => work(tx));
    return { db, request, context, facts, source, reviews, stepUp, transaction, revoke: () => { account = undefined; }, service: (adapter = reviews) => new FeatureControlService(transaction, stepUp, adapter) };
}
const denied = (error: unknown) => error instanceof FeatureControlStorageError && error.code === 'ACCESS_DENIED';
test('controller service combines actual password proof, independent current review and encrypted atomic audit without granting personal execution', async () => {
    const f = await setup();
    try {
        const service = f.service(), request = f.request(), proof = await service.issue(f.context, request, 'synthetic-password');
        const result = await service.apply(f.context, request, proof.proof);
        assert.equal(result.control.state, 'enabled');
        const {FeatureControlStorage}=await import('../server/feature-control-storage');
        const history=await new FeatureControlStorage(f.transaction,async()=>true).history(request.change.binding,f.context.actorId);
        assert.equal(history[0].action,'enable');
        assert.equal((await f.db.query('SELECT count(*)::int AS n FROM feature_control_audit')).rows[0].n, 1);
        assert.equal(effectiveCapabilityDecision({ ...f.facts, featureId: request.change.binding.featureId, control: result.control, now: Date.now() }, () => f.source).allowed, false, 'A control record never substitutes for subject consent and rollout checks');
        await assert.rejects(() => service.apply(f.context, request, proof.proof));
        const raw = JSON.stringify((await f.db.query('SELECT * FROM feature_control_audit')).rows);
        assert.ok(!raw.includes('Synthetic control integration'));
        assert.ok(!raw.includes(f.context.actorId));
    }
    finally {
        await f.db.close();
    }
});
test('controller service denies unconfigured promotions and rolls back when review or account is revoked during transactional checks', async () => {
    const f = await setup();
    try {
        let request = f.request(), service = new FeatureControlService(f.transaction, f.stepUp), proof = await service.issue(f.context, request, 'synthetic-password');
        await assert.rejects(() => service.apply(f.context, request, proof.proof), denied);
        let checks = 0;
        service = f.service({ ...f.reviews, current: async () => ++checks >= 3 ? null : structuredClone(f.facts) });
        request = f.request();
        proof = await service.issue(f.context, request, 'synthetic-password');
        await assert.rejects(() => service.apply(f.context, request, proof.proof), denied);
        assert.equal(checks, 3);
        assert.equal((await f.db.query('SELECT count(*)::int AS n FROM feature_control_audit')).rows[0].n, 0);
        checks = 0;
        service = f.service({ ...f.reviews, current: async () => { if (++checks >= 3) f.revoke(); return structuredClone(f.facts); } });
        request = f.request();
        proof = await service.issue(f.context, request, 'synthetic-password');
        await assert.rejects(() => service.apply(f.context, request, proof.proof), denied);
        assert.equal((await f.db.query('SELECT count(*)::int AS n FROM feature_control_audit')).rows[0].n, 0);
    }
    finally {
        await f.db.close();
    }
});
test('authorized emergency disable works without promotion approvals; unbound rollback remains denied', async () => {
    const f = await setup();
    try {
        const service = new FeatureControlService(f.transaction, f.stepUp), request = f.request();
        request.action = 'emergency-disable';
        request.change.control.state = 'incident-disabled';
        request.change.control.rolloutPercent = 0;
        const proof = await service.issue(f.context, request, 'synthetic-password');
        assert.equal((await service.apply(f.context, request, proof.proof)).control.state, 'incident-disabled');
        const rollback = f.request(2);
        rollback.action = 'rollback';
        await assert.rejects(() => service.issue(f.context, rollback, 'synthetic-password'), denied);
    }
    finally {
        await f.db.close();
    }
});

test('controller audit refuses conflicting action labels before issuing authentication receipts',async()=>{
 const f=await setup();try{const request=f.request();request.change.action='pause';
 await assert.rejects(()=>f.service().issue(f.context,request,'synthetic-password'),error=>error instanceof FeatureControlStorageError&&error.code==='INVALID_REQUEST');
 assert.equal((await f.db.query('SELECT count(*)::int AS n FROM feature_control_step_up_receipts')).rows[0].n,0);
 }finally{await f.db.close();}
});
