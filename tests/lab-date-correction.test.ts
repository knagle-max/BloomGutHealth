import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PrecisionStorage } from '../server/precision-storage';
import { registerPrecisionRoutes } from '../server/precision-routes';
import { contextSchema, buildPrecisionReport } from '../shared/precision-nutrition';
import { defaultPreferences } from '../shared/meal-intelligence';
import { parseLabPaste } from '../shared/lab-paste';
import { applyLabDateChange, labDateChangeFromLocal, labDateChangeSchema, localLabDateInstants } from '../shared/lab-date-correction';
const request = labDateChangeSchema.parse({ enteredDate: '2026-10-16', measuredAt: '2026-10-16T12:00:00Z', reason: 'Reviewed source transcription error', reviewed: true });
const known = parseLabPaste('ALT, 0, U/L', '2026-10-15T12:00:00Z').valid[0].payload;

test('date-only successor preserves every non-date fact and unknown precision; local clock rejects DST gaps and travel no-ops', () => {
  const changed = applyLabDateChange(known, 'original', request, 'a'.repeat(64), '2026-10-26T12:00:00Z');
  assert.equal(changed.sourceReport, undefined);
  assert.equal(changed.dateCorrection?.previousEnteredDate, undefined);
  assert.deepEqual(changed.sourceInput, known.sourceInput);
  const { measuredAt, dateCorrection, ...facts } = changed;
  const { measuredAt: _previous, ...originalFacts } = known;
  assert.deepEqual(facts, originalFacts);
  assert.equal(dateCorrection?.enteredTime, undefined);
  assert.throws(() => applyLabDateChange(changed, 'next', request, 'b'.repeat(64), '2026-10-26T12:00:00Z'), /LAB_DATE_UNCHANGED/);
  assert.throws(() => applyLabDateChange(known, 'original', { ...request, enteredDate: '2026-10-20' }, 'a'.repeat(64), '2026-10-26T12:00:00Z'));
  const previousTZ = process.env.TZ;
  try {
    process.env.TZ = 'America/New_York';
    assert.throws(() => labDateChangeFromLocal('2026-03-08', '02:30', 'Source checked'), /does not exist/);
    assert.equal(labDateChangeFromLocal('2026-03-08', '03:30', 'Source checked').measuredAt, '2026-03-08T07:30:00.000Z');
    assert.equal(labDateChangeFromLocal('2026-10-15', '00:00', 'Source checked').measuredAt, '2026-10-15T04:00:00.000Z');
    process.env.TZ = 'Pacific/Kiritimati';
    const plus14 = labDateChangeFromLocal('2026-10-15', '', 'Source checked');
    assert.equal(plus14.measuredAt, '2026-10-14T22:00:00.000Z');
    assert.equal(plus14.enteredTime, undefined);
    process.env.TZ = 'Etc/GMT+12';
    assert.equal(labDateChangeFromLocal('2026-10-15', '', 'Source checked').measuredAt, '2026-10-16T00:00:00.000Z');
  } finally { if (previousTZ === undefined) delete process.env.TZ; else process.env.TZ = previousTZ; }
});

test('owned date action serializes immutable corrections, exact receipts and source/unit/deletion races without broadening clinical scope', async () => {
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
  const post = async (id: string, body: unknown = request, key = 'date-correction-001', user = 'a', confirmation = 'correct-lab-date') => {
    const response = await fetch(`${base}/labs/${id}/correct-date`, { method: 'POST', headers: { 'content-type': 'application/json', ...(user ? { 'x-user': user } : {}), ...(key ? { 'idempotency-key': key } : {}), 'x-bloom-confirm': confirmation }, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json().catch(()=>null) as any };
  };
  const context = contextSchema.parse({}), report = async () => buildPrecisionReport(await store.getPrecisionRecords('a'), context, defaultPreferences, null);
  try {
    const original = await store.insertPrecisionRecord('a', 'lab', known);
    const other = await store.insertPrecisionRecord('a', 'lab', parseLabPaste('Ferritin, 20, ug/L', known.measuredAt).valid[0].payload);
    const saved = await store.insertPrecisionRecord('a', 'plan', { type: 'synthetic-plan' });
    assert.equal((await post(original.id, request, '', '')).status, 401);
    assert.equal((await post(original.id, request, '')).status, 400);
    assert.equal((await post(original.id, request, 'date-missing-confirm', 'a', '')).status, 400);
    assert.equal((await post(original.id, { ...request, reviewed: false })).status, 400);
    assert.equal((await post(original.id, { ...request, value: 99 })).status, 400);
    assert.equal((await post(original.id, { ...request, enteredDate: '2026-02-30' })).status, 400);
    assert.equal((await post(original.id, request, 'foreign-date-key', 'b')).status, 404);
    assert.equal((await store.getPrecisionRecords('a')).length, 3);
    const concurrent = await Promise.all([post(original.id, request, 'parallel-date-a'), post(original.id, { ...request, enteredDate: '2026-10-17', measuredAt: '2026-10-17T12:00:00Z' }, 'parallel-date-b')]);
    assert.deepEqual(concurrent.map(row => row.status).sort(), [201, 409]);
    const winningIndex = concurrent.findIndex(row => row.status === 201), winner = concurrent[winningIndex].body;
    const winningRequest = winningIndex === 0 ? request : { ...request, enteredDate: '2026-10-17', measuredAt: '2026-10-17T12:00:00Z' };
    const winningKey = winningIndex === 0 ? 'parallel-date-a' : 'parallel-date-b';
    assert.equal((await store.getPrecisionRecords('a')).some(row => row.id === saved.id), false);
    assert.deepEqual((await store.getPrecisionRecords('a')).find(row => row.id === original.id)?.payload, known);
    assert.equal((await post(original.id, winningRequest, winningKey)).body.id, winner.id, 'Committed response loss returns the exact successor');
    assert.equal((await post(original.id, { ...winningRequest, reason: 'Different reason' }, winningKey)).status, 409);
    assert.equal((await post(winner.id, winningRequest, 'no-op-reference')).status, 400);
    const second = await post(winner.id, { ...request, enteredDate: '2026-10-18', measuredAt: '2026-10-18T12:00:00Z' }, 'second-date-key');
    assert.equal(second.status, 201);
    assert.equal((await post(original.id, winningRequest, winningKey)).body.id, winner.id, 'An older receipt cannot replace the latest canonical successor');
    assert.ok((await report()).labHistory.some(row => row.id === second.body.id));
    assert.equal((await report()).labHistory.some(row => [original.id, winner.id].includes(row.id)), false);
    await store.deleteLabEntry('a', second.body.id);
    assert.equal((await post(original.id, winningRequest, winningKey)).status, 404, 'Deletion cannot be undone by an old correction retry');
    assert.deepEqual((await store.getPrecisionRecords('a')).map(row => row.id), [other.id]);
    const pending = await store.insertPrecisionRecord('a', 'lab', parseLabPaste('LDL, 120', known.measuredAt).pending[0].payload);
    const general = await store.insertPrecisionRecord('a', 'plan', { type: 'synthetic-plan' });
    const correctedPending = await post(pending.id, request, 'pending-date-key');
    assert.equal(correctedPending.status, 201);
    assert.ok((await store.getPrecisionRecords('a')).some(row => row.id === general.id));
    const confirm = await fetch(`${base}/labs/${correctedPending.body.id}/confirm-unit`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-user': 'a' }, body: JSON.stringify({ unit: 'mg/dL' }) });
    assert.equal(confirm.status, 201);
    const confirmed = await confirm.json() as any;
    const correctedConfirmed = await post(confirmed.id, { ...request, enteredDate: '2026-10-19', measuredAt: '2026-10-19T12:00:00Z' }, 'confirmed-date-key');
    assert.equal(correctedConfirmed.status, 201);
    assert.equal(correctedConfirmed.body.payload.unit, 'mg/dL');
    assert.equal(correctedConfirmed.body.payload.value, 120);
    await store.deleteLabEntry('a', correctedConfirmed.body.id);
    assert.equal((await report()).pendingLabs.length, 0);
    const raw = await store.insertPrecisionRecord('a', 'lab', parseLabPaste('Unknown assay, <0.50, source-unit', known.measuredAt).sourceOnly[0].payload);
    const rawPlan = await store.insertPrecisionRecord('a', 'plan', { type: 'synthetic-plan' });
    const correctedRaw = await post(raw.id, request, 'raw-date-correction');
    assert.equal(correctedRaw.status, 201);
    assert.equal(correctedRaw.body.payload.reportedValue, '<0.50');
    assert.equal(correctedRaw.body.payload.sourceReport, undefined);
    assert.equal(correctedRaw.body.payload.dateCorrection.previousEnteredDate, undefined);
    assert.ok((await store.getPrecisionRecords('a')).some(row => row.id === rawPlan.id));
    assert.equal((await report()).sourceOnlyLabs.length, 1);
    assert.equal((await report()).sourceOnlyLabs[0].id, correctedRaw.body.id);
    assert.equal((await store.getPrecisionRecords('b')).length, 0);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
    await pg.close();
    if (previous === undefined) delete process.env.PRECISION_DATA_KEY; else process.env.PRECISION_DATA_KEY = previous;
  }
});

test('repeated local collection times require an explicit valid occurrence, including half-hour DST changes',()=>{
 const previousTZ=process.env.TZ;
 try{
  process.env.TZ='America/New_York';
  assert.deepEqual(localLabDateInstants('2025-11-02','01:30').map(choice=>choice.measuredAt),['2025-11-02T05:30:00.000Z','2025-11-02T06:30:00.000Z']);
  assert.throws(()=>labDateChangeFromLocal('2025-11-02','01:30','Checked source'),/occurs twice/);
  for(const instant of ['2025-11-02T05:30:00.000Z','2025-11-02T06:30:00.000Z'])assert.equal(labDateChangeFromLocal('2025-11-02','01:30','Checked source',instant).measuredAt,instant);
  assert.throws(()=>labDateChangeFromLocal('2025-11-02','01:30','Checked source','2025-11-02T07:30:00.000Z'),/selected UTC offset/);
  assert.equal(labDateChangeFromLocal('2025-11-02','','Checked source').enteredTime,undefined);
  process.env.TZ='Australia/Lord_Howe';
  assert.deepEqual(localLabDateInstants('2026-04-05','01:45').map(choice=>choice.measuredAt),['2026-04-04T14:45:00.000Z','2026-04-04T15:15:00.000Z']);
  assert.throws(()=>labDateChangeFromLocal('2026-04-05','01:45','Checked source'),/occurs twice/);
 }finally{if(previousTZ===undefined)delete process.env.TZ;else process.env.TZ=previousTZ;}
});
