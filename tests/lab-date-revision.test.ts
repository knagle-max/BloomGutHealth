import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PrecisionStorage } from '../server/precision-storage';
import { encryptPrecision } from '../server/precision-crypto';
import { precisionRecords } from '../shared/schema';
import { registerPrecisionRoutes } from '../server/precision-routes';
import { buildPrecisionReport, contextSchema, labSchema, sourceOnlyLabSchema } from '../shared/precision-nutrition';
import { defaultPreferences } from '../shared/meal-intelligence';
import { parseLabPaste } from '../shared/lab-paste';
import { labDateText } from '../shared/lab-history';
const originalTime = '2026-10-15T12:00:00Z', nextTime = '2026-10-16T12:00:00Z';
const audit = (supersedes: string) => ({ version: 1 as const, supersedes, previousMeasuredAt: originalTime, enteredDate: '2026-10-16', correctedAt: '2026-10-26T12:00:00Z', reason: 'Corrected against the source report', requestFingerprint: 'a'.repeat(64) });
const known = parseLabPaste('ALT, 0, U/L', originalTime).valid[0].payload;
test('date revision reader validates explicit calendar context without inventing legacy precision or report identity', () => {
  const corrected = labSchema.parse({ ...known, measuredAt: nextTime, dateCorrection: audit('old') });
  assert.equal(corrected.sourceReport, undefined);
  assert.equal(corrected.dateCorrection?.previousEnteredDate, undefined);
  assert.equal(labDateText(corrected.measuredAt, corrected.sourceReport, corrected.dateCorrection), '2026-10-16');
  for (const change of [{ enteredDate: '2026-02-30' }, { enteredTime: '24:00' }, { previousEnteredTime: '12:00' }, { supersedes: '' }, { requestFingerprint: 'invalid' }, { reason: ' ' }])
    assert.equal(labSchema.safeParse({ ...corrected, dateCorrection: { ...audit('old'), ...change } }).success, false);
  assert.equal(labSchema.safeParse({ ...corrected, measuredAt: '2026-10-20T12:00:00Z' }).success, false);
  assert.equal(labSchema.safeParse({ ...corrected, sourceReport: { importId: 'fb001025-1025-4025-8025-000000000001', enteredDate: '2026-10-15' } }).success, false);
});

test('immutable date revisions share canonical active IDs, reject forged imports and stale unit confirmation, and delete full lineage', async () => {
  const previous = process.env.PRECISION_DATA_KEY;
  process.env.PRECISION_DATA_KEY = randomBytes(32).toString('base64');
  const pg = new PGlite();
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('a'),('b');");
  await pg.exec(readFileSync(new URL('../migrations/0002_precision_nutrition.sql', import.meta.url), 'utf8'));
  const db = drizzle(pg), store = new PrecisionStorage(db as any), app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.session = { userId: req.get('x-user') } as any; next(); });
  registerPrecisionRoutes(app, ((req: any, res: any, next: any) => req.session.userId ? next() : res.sendStatus(401)) as any, store as any);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as any).port}/api/precision`;
  const post = (path: string, body: unknown, user = 'a') => fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-user': user }, body: JSON.stringify(body) });
  const context = contextSchema.parse({}), report = async () => buildPrecisionReport(await store.getPrecisionRecords('a'), context, defaultPreferences, null);
  const seed = async (id: string, payload: unknown) => {
    // Reader-first fixture: no ordinary writer is authorized to forge revision metadata.
    await db.insert(precisionRecords).values({ id, userId: 'a', kind: 'lab', encryptedPayload: encryptPrecision(payload, 'a') });
  };
  try {
    await store.putPrecisionContext('a', context);
    const original = await store.insertPrecisionRecord('a', 'lab', known);
    const corrected = labSchema.parse({ ...known, measuredAt: nextTime, dateCorrection: audit(original.id) });
    assert.equal((await post('/records', { kind: 'lab', payload: corrected })).status, 400);
    await seed('corrected', corrected);
    assert.equal((await report()).labHistory.length, 1);
    assert.equal((await report()).labHistory[0].id, 'corrected');
    assert.equal((await report()).trends[0].points.length, 1);
    assert.equal((await report()).trends[0].points[0].dateCorrection?.previousMeasuredAt, originalTime);
    assert.deepEqual((await store.getPrecisionRecords('a')).find(row => row.id === original.id)?.payload, known, 'Original encrypted source stays unchanged');
    const plan = { type: 'weekly-plan', inputGuard: { context, preferences: defaultPreferences, sourceRecordIds: ['corrected'] } };
    await store.insertPrecisionRecord('a', 'plan', plan);
    await assert.rejects(() => store.insertPrecisionRecord('a', 'plan', { ...plan, inputGuard: { ...plan.inputGuard, sourceRecordIds: [original.id] } }), /PRECISION_INPUTS_CHANGED/);
    await assert.rejects(() => store.deleteLabEntry('a', original.id), /LAB_SOURCE_CHANGED/);
    await store.deleteLabEntry('b', 'corrected');
    assert.equal((await report()).labHistory.length, 1);
    await store.deleteLabEntry('a', 'corrected');
    assert.equal((await store.getPrecisionRecords('a')).length, 0);
    const pendingPayload = parseLabPaste('LDL, 120', originalTime).pending[0].payload;
    const pending = await store.insertPrecisionRecord('a', 'lab', pendingPayload);
    const revisedPending = labSchema.parse({ ...pendingPayload, measuredAt: nextTime, dateCorrection: audit(pending.id) });
    await seed('pending-corrected', revisedPending);
    assert.equal((await post(`/labs/${pending.id}/confirm-unit`, { unit: 'mg/dL' })).status, 409);
    const confirmation = await post('/labs/pending-corrected/confirm-unit', { unit: 'mg/dL' });
    assert.equal(confirmation.status, 201);
    const confirmed = await confirmation.json();
    assert.equal((await report()).pendingLabs.length, 0);
    assert.deepEqual((await report()).labHistory.map(row => row.id), [confirmed.id]);
    assert.deepEqual(confirmed.payload.dateCorrection, revisedPending.dateCorrection);
    assert.equal((await post('/labs/pending-corrected/confirm-unit', { unit: 'mg/dL' })).status, 200);
    await store.deleteLabEntry('a', confirmed.id);
    assert.equal((await store.getPrecisionRecords('a')).length, 0, 'Date and unit revisions form one logical deletion component');
    const rawPayload = parseLabPaste('Unknown assay, <0.50', originalTime).sourceOnly[0].payload;
    const raw = await store.insertPrecisionRecord('a', 'lab', rawPayload);
    const revisedRaw = sourceOnlyLabSchema.parse({ ...rawPayload, measuredAt: nextTime, dateCorrection: audit(raw.id) });
    await seed('raw-corrected', revisedRaw);
    assert.equal((await post('/records', { kind: 'lab', payload: revisedRaw })).status, 400);
    assert.deepEqual((await report()).sourceOnlyLabs.map(row => row.id), ['raw-corrected']);
    assert.equal((await report()).labHistory.length, 0);
    const saved = await store.insertPrecisionRecord('a', 'plan', { type: 'synthetic-plan' });
    await store.deleteLabEntry('a', 'raw-corrected');
    assert.deepEqual((await store.getPrecisionRecords('a')).map(row => row.id), [saved.id]);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    await pg.close();
    if (previous === undefined) delete process.env.PRECISION_DATA_KEY; else process.env.PRECISION_DATA_KEY = previous;
  }
});
