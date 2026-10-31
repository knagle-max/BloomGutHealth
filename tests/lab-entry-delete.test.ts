import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PrecisionStorage } from '../server/precision-storage';
import { registerPrecisionRoutes } from '../server/precision-routes';
import { buildPrecisionReport, contextSchema } from '../shared/precision-nutrition';
import { defaultPreferences } from '../shared/meal-intelligence';
import { parseLabPaste } from '../shared/lab-paste';

test('explicit logical lab deletion is atomic, owned, idempotent and cannot resurrect unit revisions', async () => {
  const previous = process.env.PRECISION_DATA_KEY;
  process.env.PRECISION_DATA_KEY = randomBytes(32).toString('base64');
  const pg = new PGlite();
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('a'),('b');");
  await pg.exec(readFileSync(new URL('../migrations/0002_precision_nutrition.sql', import.meta.url), 'utf8'));
  const store = new PrecisionStorage(drizzle(pg) as any), app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.session = { userId: req.get('x-user') } as any; next(); });
  registerPrecisionRoutes(app, ((req: any, res: any, next: any) => req.session.userId ? next() : res.sendStatus(401)) as any, store as any);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as any).port}/api/precision`;
  const del = (id: string, user = 'a', confirm = 'delete-lab-entry-and-revisions') => fetch(`${base}/labs/${id}/entry`, { method: 'DELETE', headers: { ...(user ? { 'x-user': user } : {}), 'x-bloom-confirm': confirm } });
  const pending = parseLabPaste('LDL, 120', '2026-10-15T12:00:00Z').pending[0].payload;
  const report = async () => buildPrecisionReport(await store.getPrecisionRecords('a'), contextSchema.parse({}), defaultPreferences, null);
  const pair = async () => {
    const original = await store.insertPrecisionRecord('a', 'lab', pending);
    const confirmed = await store.insertPrecisionRecord('a', 'lab', { ...pending, unit: 'mg/dL', unitReview: { ...pending.unitReview!, status: 'confirmed', confirmedAt: '2026-10-16T12:00:00Z', supersedes: original.id } });
    return { original, confirmed };
  };
  try {
    // Demonstrate the old row-only behavior; the new API must not repeat it.
    const legacy = await pair();
    await store.deletePrecisionRecord('a', legacy.confirmed.id);
    assert.equal((await report()).pendingLabs.some(row => row.id === legacy.original.id), true);
    await store.deleteLabEntry('a', legacy.original.id);
    const { original, confirmed } = await pair();
    const other = await store.insertPrecisionRecord('a', 'lab', parseLabPaste('ALT, 20, U/L', '2026-10-15T12:00:00Z').valid[0].payload);
    const foreign = await store.insertPrecisionRecord('b', 'lab', pending);
    const plan = await store.insertPrecisionRecord('a', 'plan', { type: 'synthetic-plan' });
    assert.equal((await del(confirmed.id, '')).status, 401);
    assert.equal((await del(confirmed.id, 'a', '')).status, 400);
    assert.equal((await del(confirmed.id, 'a', 'delete-precision-data')).status, 400);
    assert.equal((await del(confirmed.id, 'b')).status, 204);
    assert.equal((await del(original.id)).status, 409, 'Stale pending target cannot erase a newly confirmed result');
    assert.equal((await store.getPrecisionRecords('a')).length, 4);
    assert.equal((await del(confirmed.id)).status, 204);
    assert.equal((await del(confirmed.id)).status, 204, 'Lost-response retry is harmless');
    const remaining = await store.getPrecisionRecords('a');
    assert.deepEqual(remaining.map(row => row.id), [other.id]);
    assert.equal(remaining.some(row => row.id === plan.id), false);
    assert.equal((await report()).pendingLabs.length, 0, 'Original pending source cannot reappear');
    assert.deepEqual((await store.getPrecisionRecords('b')).map(row => row.id), [foreign.id]);
    const saved = await store.insertPrecisionRecord('a', 'plan', { type: 'synthetic-plan' });
    const pendingOnly = await store.insertPrecisionRecord('a', 'lab', pending);
    await store.deleteLabEntry('a', pendingOnly.id);
    const raw = await store.insertPrecisionRecord('a', 'lab', { sourceOnly: true, reportedAnalyte: 'Unknown assay', reportedValue: '<0.6', reportedUnit: null, measuredAt: '2026-10-15T12:00:00Z', laboratory: 'Unknown', method: 'Unknown', fasting: 'unknown', sourceInput: { text: 'Unknown assay, <0.6', number: '<0.6', suppliedUnit: null, capture: 'pasted-report' } });
    await store.deleteLabEntry('a', raw.id);
    assert.ok((await store.getPrecisionRecords('a')).some(row => row.id === saved.id), 'Nonclinical source deletion preserves plans');
    const malformed = await store.insertPrecisionRecord('a', 'lab', { unrecognized: true });
    assert.equal((await del(other.id)).status, 409);
    assert.equal((await store.getPrecisionRecords('a')).length, 3, 'Unclassified lineage causes no partial deletion');
    await store.deletePrecisionRecord('a', malformed.id);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    await pg.close();
    if (previous === undefined) delete process.env.PRECISION_DATA_KEY; else process.env.PRECISION_DATA_KEY = previous;
  }
});
