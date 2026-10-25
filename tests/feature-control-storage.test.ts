import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { FeatureControlStorage, FeatureControlStorageError, postgresFeatureControlTransaction, type FeatureControlTransaction } from '../server/feature-control-storage';
const time = Date.parse('2026-10-25T00:00:00Z');
const binding = { serviceId: 'srv-syntheticreview', environment: 'isolated-synthetic', featureId: 'bloom.food.recommendations' };
const change = (revision = 1) => ({ binding: { ...binding }, actorId: 'PRIVATE_ADMIN', requestId: randomUUID(), expectedRevision: revision - 1, reason: 'PRIVATE_CHANGE_REASON', control: { ...binding, revision, state: 'paused', materialDigest: 'a'.repeat(64), reviewId: 'synthetic-reviewed-material', scope: { territories: ['CA'], populations: ['adult'], purposes: ['nutrition'] }, rolloutPercent: 0, cohortId: 'PRIVATE_COHORT', changedBy: 'PRIVATE_ADMIN', expiresAt: '2026-10-26T00:00:00Z' } });
async function setup() {
    process.env.PRECISION_DATA_KEY = Buffer.alloc(32, 7).toString('base64');
    delete process.env.PRECISION_DATA_KEYRING;
    delete process.env.PRECISION_ACTIVE_KEY_ID;
    const db = new PGlite(), migration = await readFile(new URL('../migrations/0012_feature_control_history.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(migration);
    const transaction: FeatureControlTransaction = work => db.transaction(async (tx) => { await tx.query('SELECT pg_advisory_xact_lock(142591, 1)'); return work(tx as any); });
    const left = new FeatureControlStorage(transaction, async () => true, () => time), right = new FeatureControlStorage(transaction, async () => true, () => time);
    return { db, transaction, left, right };
}
const code = (expected: string) => (error: unknown) => error instanceof FeatureControlStorageError && error.code === expected && !error.message.includes('PRIVATE');
test('default-denied storage accepts no public override; scope/revision/actor and immutable incident/research boundaries precede writes', async () => {
    const { db, transaction, left } = await setup();
    try {
        let reads = 0;
        const denied = new FeatureControlStorage(async (work) => { reads++; return transaction(work); });
        await assert.rejects(() => denied.append(change()), code('ACCESS_DENIED'));
        await assert.rejects(() => denied.get(binding, 'PRIVATE_ADMIN'), code('ACCESS_DENIED'));
        assert.equal(reads, 0);
        for (const patch of [{ approved: true }, { expectedRevision: 9 }, { actorId: 'other' }, { binding: { ...binding, environment: 'production' } }, { binding: { ...binding, featureId: 'unknown' } }, { control: { ...change().control, serviceId: 'srv-other' } }])
            await assert.rejects(() => left.append({ ...change(), ...patch }), code('INVALID_REQUEST'));
        for (const featureId of ['bloom.genetics.diet_rank', 'bloom.microbiome.flux']) {
            const request = change();
            request.binding.featureId = featureId;
            request.control.featureId = featureId;
            request.control.state = 'enabled';
            await assert.rejects(() => left.append(request), code('ACCESS_DENIED'));
        }
        const mutationAttempt = new FeatureControlStorage(transaction, async (access) => { if (access.operation === 'write')
            access.change.control.state = 'enabled'; return true; }, () => time);
        const incident = change();
        incident.binding.featureId = incident.control.featureId = 'bloom.genetics.diet_rank';
        await mutationAttempt.append(incident);
        assert.equal((await left.get(incident.binding, 'PRIVATE_ADMIN'))?.state, 'paused');
        assert.equal((await left.history(incident.binding,'PRIVATE_ADMIN'))[0].action,undefined,'Legacy events do not acquire an invented action label'); // callback cannot mutate the stored command
        const truthy = new FeatureControlStorage(transaction, async () => ({ approved: true }) as any);
        await assert.rejects(() => truthy.append(change()), code('ACCESS_DENIED'));
        assert.equal((await db.query('SELECT count(*)::int AS n FROM feature_control_audit')).rows[0].n, 1);
    }
    finally {
        await db.close();
    }
});
test('replicas serialize CAS and exactly-once retries; superseded replay is historical and deployments/accounts/requests cannot collide', async () => {
    const { db, left, right } = await setup();
    try {
        const first = change(), other = change();
        const results = await Promise.allSettled([left.append(first), right.append(other)]);
        assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
        assert.equal(results.filter(r => r.status === 'rejected' && code('CONFLICT')(r.reason)).length, 1);
        const winning = results[0].status === 'fulfilled' ? first : other;
        assert.equal((await right.append(winning)).replay, true);
        await assert.rejects(()=>right.append({...winning,action:'pause'}),code('CONFLICT'));
        const second = change(2);
        second.control.state = 'disabled';
        await right.append(second);
        const replay = await left.append(winning);
        assert.equal(replay.replay, true);
        assert.equal(replay.control.revision, 1);
        assert.equal(replay.currentRevision, 2);
        for (const patch of [{ reason: 'different' }, { actorId: 'OTHER_ADMIN', control: { ...winning.control, changedBy: 'OTHER_ADMIN' } }, { binding: { ...binding, featureId: 'bloom.profile.basics' }, control: { ...winning.control, featureId: 'bloom.profile.basics' } }])
            await assert.rejects(() => left.append({ ...winning, ...patch }), code('CONFLICT'));
        assert.equal((await left.get(binding, 'PRIVATE_ADMIN'))?.state, 'disabled');
        assert.equal((await left.get({ ...binding, serviceId: 'srv-other' }, 'PRIVATE_ADMIN')), null);
        const independent = structuredClone(winning);
        independent.binding.environment = independent.control.environment = 'development-review';
        await right.append(independent);
        assert.equal((await left.get(independent.binding, 'PRIVATE_ADMIN'))?.revision, 1);
        assert.deepEqual((await left.history(binding, 'PRIVATE_ADMIN')).map(r => r.control.revision), [2, 1]);
        assert.deepEqual((await left.history(binding, 'PRIVATE_ADMIN', 2)).map(r => r.control.revision), [1]);
        const raw = JSON.stringify({ state: (await db.query('SELECT * FROM feature_control_states')).rows, audit: (await db.query('SELECT * FROM feature_control_audit')).rows });
        assert.doesNotMatch(raw, /PRIVATE_ADMIN|PRIVATE_CHANGE_REASON|PRIVATE_COHORT/);
        assert.equal((await left.get(binding, 'PRIVATE_ADMIN'))?.rolloutPercent, 0);
    }
    finally {
        await db.close();
    }
});
test('state and encrypted audit commit atomically; append-only audit and deferred correspondence reject direct destructive/incomplete changes', async () => {
    const { db, transaction, left } = await setup();
    try {
        await db.exec('ALTER TABLE feature_control_states ALTER CONSTRAINT feature_control_state_audit NOT DEFERRABLE');
        await db.exec(await readFile(new URL('../migrations/0012_feature_control_history.sql', import.meta.url), 'utf8'));
        assert.equal((await db.query("SELECT condeferrable FROM pg_constraint WHERE conname='feature_control_state_audit'")).rows[0].condeferrable, true);
        await left.append(change());
        const beforeRepair=(await db.query('SELECT * FROM feature_control_audit')).rows;
        await db.exec('ALTER TABLE feature_control_audit DROP CONSTRAINT feature_control_audit_request');
        const repair=await readFile(new URL('../migrations/0013_feature_control_request_unique.sql',import.meta.url),'utf8');await db.exec(repair);await db.exec(repair);
        assert.deepEqual((await db.query('SELECT * FROM feature_control_audit')).rows,beforeRepair);
        await assert.rejects(()=>db.exec('INSERT INTO feature_control_audit SELECT service_id,environment,feature_id,revision+1,request_id,event_digest,encrypted_event,created_at FROM feature_control_audit'),/feature_control_audit_request/);
        const failed = new FeatureControlStorage(work => transaction(tx => work({ query: async (sql, values) => { if (sql.startsWith('INSERT INTO feature_control_audit'))
                throw Error('PRIVATE_SQL_SENTINEL'); return tx.query(sql, values); } })), async () => true, () => time);
        await assert.rejects(() => failed.append(change(2)), code('UNAVAILABLE'));
        assert.equal((await left.get(binding, 'PRIVATE_ADMIN'))?.revision, 1);
        assert.equal((await left.history(binding, 'PRIVATE_ADMIN')).length, 1);
        for (const sql of ['UPDATE feature_control_audit SET revision=revision', 'DELETE FROM feature_control_audit', 'TRUNCATE feature_control_audit CASCADE'])
            await assert.rejects(() => db.exec(sql), /append only/);
        await assert.rejects(() => db.exec('UPDATE feature_control_states SET revision=99'), /feature_control_state_audit/);
        assert.equal((await left.get(binding, 'PRIVATE_ADMIN'))?.revision, 1);
        await db.exec("UPDATE feature_control_states SET material_digest=repeat('b',64)");
        await assert.rejects(() => left.get(binding, 'PRIVATE_ADMIN'), code('UNAVAILABLE'));
        await assert.rejects(() => left.append(change(2)), code('UNAVAILABLE'));
    }
    finally {
        await db.close();
    }
});
test('revocation during a transaction, missing keys, invalid clocks and store failures never return or mutate control state', async () => {
    const { db, transaction, left } = await setup();
    try {
        let calls = 0;
        const revoked = new FeatureControlStorage(transaction, async () => ++calls === 1, () => time);
        await assert.rejects(() => revoked.append(change()), code('ACCESS_DENIED'));
        assert.equal((await db.query('SELECT * FROM feature_control_states')).rows.length, 0);
        let commitChecks = 0;
        const commitRevoked = new FeatureControlStorage(transaction, async () => ++commitChecks < 3, () => time);
        await assert.rejects(() => commitRevoked.append(change()), code('ACCESS_DENIED'));
        assert.equal((await db.query('SELECT * FROM feature_control_audit')).rows.length, 0);
        let releaseLate: ((value:boolean)=>void)|undefined, seenSignal:AbortSignal|undefined, hangChecks=0;
        const hung = new FeatureControlStorage(transaction, async (_access,signal) => {if(++hangChecks<3)return true;seenSignal=signal;return new Promise<boolean>(resolve=>{releaseLate=resolve;});},()=>time,1);
        await assert.rejects(()=>hung.append(change()),code('ACCESS_DENIED'));assert.equal(seenSignal?.aborted,true);releaseLate?.(true);await new Promise(resolve=>setTimeout(resolve,5));assert.equal((await db.query('SELECT * FROM feature_control_audit')).rows.length,0);
        const broken = new FeatureControlStorage(async () => { throw Error('PRIVATE_DATABASE_URL'); }, async () => true);
        await assert.rejects(() => broken.append(change()), code('UNAVAILABLE'));
        const noClock = new FeatureControlStorage(transaction, async () => true, () => NaN);
        await assert.rejects(() => noClock.append(change()), code('UNAVAILABLE'));
        await assert.rejects(() => noClock.get(binding, 'PRIVATE_ADMIN'), code('UNAVAILABLE'));
        await assert.rejects(() => noClock.history(binding, 'PRIVATE_ADMIN'), code('UNAVAILABLE'));
        const expired = change();
        expired.control.state = 'enabled';
        expired.control.expiresAt = '2026-10-24T00:00:00Z';
        await assert.rejects(() => left.append(expired), code('ACCESS_DENIED'));
        await left.append(change());
        calls = 0;
        await assert.rejects(() => revoked.get(binding, 'PRIVATE_ADMIN'), code('ACCESS_DENIED'));
        calls = 0;
        await assert.rejects(() => revoked.history(binding, 'PRIVATE_ADMIN'), code('ACCESS_DENIED'));
        delete process.env.PRECISION_DATA_KEY;
        await assert.rejects(() => left.get(binding, 'PRIVATE_ADMIN'), code('UNAVAILABLE'));
        await assert.rejects(() => left.append(change(2)), code('UNAVAILABLE'));
        assert.equal((await db.query('SELECT revision FROM feature_control_states')).rows[0].revision, 1);
    }
    finally {
        await db.close();
    }
});
test('history is bounded and purpose-bound encryption prevents moving state across environments; original named/legacy key versions remain recoverable', async () => {
    const { db, left } = await setup();
    try {
        const legacy = change();
        await left.append(legacy);
        process.env.PRECISION_DATA_KEYRING = JSON.stringify({ synthetic: Buffer.alloc(32, 8).toString('base64') });
        process.env.PRECISION_ACTIVE_KEY_ID = 'synthetic';
        assert.equal((await left.append(legacy)).replay, true);
        for (let i = 2; i <= 51; i++)
            await left.append(change(i));
        const page = await left.history(binding, 'PRIVATE_ADMIN');
        assert.equal(page.length, 50);
        assert.equal(page[0].control.revision, 51);
        assert.equal(page.at(-1)?.control.revision, 2);
        assert.equal((await left.history(binding, 'PRIVATE_ADMIN', 2))[0].control.revision, 1);
        const isolated = change();
        isolated.binding.environment = isolated.control.environment = 'development-review';
        await left.append(isolated);
        const cipher = (await db.query("SELECT encrypted_control FROM feature_control_states WHERE environment='development-review'")).rows[0].encrypted_control;
        await db.query("UPDATE feature_control_states SET encrypted_control=$1 WHERE environment='isolated-synthetic'", [JSON.stringify(cipher)]);
        await assert.rejects(() => left.get(binding, 'PRIVATE_ADMIN'), code('UNAVAILABLE'));
        assert.equal((await left.get(isolated.binding, 'PRIVATE_ADMIN'))?.revision, 1);
    }
    finally {
        await db.close();
    }
});
test('Postgres adapter bounds lock/statement time and releases connections after commit or rollback', async () => {
    for (const failure of [false, true]) {
        const calls: string[] = [];
        const transaction = postgresFeatureControlTransaction({ connect: async () => ({ query: async (sql: string) => { calls.push(sql); return { rows: [] }; }, release: () => calls.push('release') }) } as any);
        if (failure)
            await assert.rejects(() => transaction(async () => { throw Error('synthetic'); }), /synthetic/);
        else
            assert.equal(await transaction(async () => 42), 42);
        assert.deepEqual(calls, ['BEGIN', "SET LOCAL lock_timeout = '2s'", "SET LOCAL statement_timeout = '5s'", "SET LOCAL idle_in_transaction_session_timeout = '5s'", 'SELECT pg_advisory_xact_lock(142591, 1)', failure ? 'ROLLBACK' : 'COMMIT', 'release']);
    }
});
