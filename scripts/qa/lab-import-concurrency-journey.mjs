import assert from 'node:assert/strict';
import express from 'express';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { readFileSync } from 'node:fs';
import { randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import { PrecisionStorage } from '../../server/precision-storage.ts';
import { registerPrecisionRoutes } from '../../server/precision-routes.ts';
import { buildPrecisionReport, contextSchema } from '../../shared/precision-nutrition.ts';
import { defaultPreferences } from '../../shared/meal-intelligence.ts';
import { parseLabPaste } from '../../shared/lab-paste.ts';
import { possibleLabReimports } from '../../shared/lab-reimport.ts';

const priorKey = process.env.PRECISION_DATA_KEY;
process.env.PRECISION_DATA_KEY = randomBytes(32).toString('base64');
const pg = new PGlite();
await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('atomic-qa'),('other');");
await pg.exec(readFileSync(new URL('../../migrations/0002_precision_nutrition.sql', import.meta.url), 'utf8'));
const store = new PrecisionStorage(drizzle(pg)), app = express(), context = contextSchema.parse({});
app.use(express.json());
registerPrecisionRoutes(app, (req, _res, next) => { req.session = { userId: 'atomic-qa' }; next(); }, store);
const api = app.listen(0, '127.0.0.1');
await new Promise(resolve => api.once('listening', resolve));
const apiBase = `http://127.0.0.1:${api.address().port}`;
const vite = await createServer({ server: { host: '127.0.0.1', port: 5241, strictPort: true } });
await vite.listen();
const { chromium } = createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 1000 }, timezoneId: 'America/New_York', locale: 'en-CA' });
page.setDefaultTimeout(12000);
const errors = [], attempts = [];
let corruptReceipt = false, navigateAfterCommit = false;
const own = () => store.getPrecisionRecords('atomic-qa');
const report = async () => {
  const records = await own();
  return { ...buildPrecisionReport(records, context, defaultPreferences, null), records, availableReports: [], intake: { days: 28, mealsLogged: 0, nutrients: [] } };
};
page.on('pageerror', error => errors.push(error.message));
await page.route('https://fonts.**/**', route => route.abort());
await page.route('**/api/**', async route => {
  const request = route.request(), path = new URL(request.url()).pathname;
  if (request.method() !== 'GET' && path.startsWith('/api/precision/')) {
    const body = request.postDataJSON();
    if (path === '/api/precision/labs/import') attempts.push({ key: request.headers()['idempotency-key'], body });
    const response = await fetch(apiBase + path, { method: request.method(), headers: { 'content-type': 'application/json', 'idempotency-key': request.headers()['idempotency-key'] || '' }, body: request.postData() });
    const text = await response.text();
    if (response.ok && path === '/api/precision/labs/import') {
      if (corruptReceipt) { corruptReceipt = false; return route.fulfill({ status: 201, json: { success: true } }); }
      if (navigateAfterCommit) {
        navigateAfterCommit = false;
        await page.evaluate(() => { history.pushState({}, '', '/qa/import-paused'); dispatchEvent(new PopStateEvent('popstate')); });
        await page.getByRole('heading', { name: 'Add lab results', exact: true }).waitFor({ state: 'detached' });
      }
    }
    return route.fulfill({ status: response.status, contentType: 'application/json', body: text });
  }
  let json = [];
  if (path === '/api/auth/me') json = { user: { id: 'atomic-qa', username: 'Synthetic atomic import' } };
  else if (path === '/api/precision') json = await report();
  else if (path === '/api/experience/settings') json = { mode: 'everyday', onboarding: { status: 'complete' } };
  await route.fulfill({ json });
});
const externalImport = async payload => {
  const current = await report();
  const matches = possibleLabReimports(payload, [...current.labHistory, ...current.pendingLabs, ...current.sourceOnlyLabs]).map(row => row.id);
  const response = await fetch(apiBase + '/api/precision/labs/import', { method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': randomUUID() }, body: JSON.stringify({ payload, reviewedMatchIds: matches }) });
  assert.equal(response.status, 201);
  return response.json();
};
try {
  await page.goto('http://127.0.0.1:5241/precision?tab=labs');
  const entry = page.locator('section[aria-labelledby="add-labs-title"]');
  await entry.getByRole('heading', { name: 'Add lab results', exact: true }).waitFor();
  await entry.getByLabel('Test date', { exact: true }).fill('2026-10-20');
  await entry.getByLabel('Laboratory (optional)', { exact: true }).fill('Concurrent source lab');
  await entry.getByLabel('Results', { exact: true }).fill('ALT, 30, U/L\nFerritin, 31, ug/L');
  await entry.getByRole('button', { name: 'Preview results', exact: true }).click();
  const instant = await page.evaluate(() => new Date('2026-10-20T12:00:00').toISOString());
  const externalPayload = () => ({ ...parseLabPaste('Ferritin, 31, ug/L', instant, 'Concurrent source lab').valid[0].payload, sourceReport: { importId: randomUUID(), enteredDate: '2026-10-20' } });
  const firstExternal = await externalImport(externalPayload());
  await entry.getByRole('button', { name: 'Save 2 result(s) after review', exact: true }).click();
  await entry.getByRole('alert').filter({ hasText: 'Recorded source matches changed' }).waitFor();
  await entry.getByText('1 result(s) saved.', { exact: false }).waitFor();
  await page.waitForFunction(()=>document.activeElement?.textContent==='These results may already be recorded');
  assert.equal((await own()).filter(row => row.payload.marker === 'alt' && row.payload.value === 30).length, 1);
  const retry = entry.getByRole('button', { name: 'Retry remaining results', exact: true });
  assert.equal(await retry.isDisabled(), true);
  await entry.getByText('Line 2: Ferritin · 1 recorded match(es)', { exact: true }).waitFor();
  await entry.getByRole('checkbox', { name: 'I reviewed the matches; these are separate results to record.', exact: true }).check();
  corruptReceipt = true;
  await retry.click();
  await entry.getByRole('alert').filter({ hasText: 'We could not confirm all results' }).waitFor();
  assert.equal((await own()).filter(row => row.payload.marker === 'ferritin').length, 2, 'A malformed committed receipt cannot acknowledge or duplicate the row');
  await externalImport(externalPayload());
  await retry.click();
  await entry.getByText('2 result(s) saved.', { exact: false }).waitFor();
  await page.waitForFunction(()=>document.activeElement?.textContent==='Start another import');
  const ferritinAttempts = attempts.filter(attempt => attempt.body.payload.marker === 'ferritin');
  assert.equal(ferritinAttempts.length, 3);
  assert.equal(new Set(ferritinAttempts.map(attempt => attempt.key)).size, 1);
  assert.deepEqual(ferritinAttempts[0].body.reviewedMatchIds, []);
  assert.deepEqual(ferritinAttempts[1].body.reviewedMatchIds, [firstExternal.id]);
  assert.deepEqual(ferritinAttempts[1], ferritinAttempts[2], 'Unknown outcome retries the frozen review snapshot even after another client adds a match');
  const importId = ferritinAttempts[0].body.payload.sourceReport.importId;
  assert.equal((await own()).filter(row => row.payload.sourceReport?.importId === importId).length, 2);
  console.log('PASS actual encrypted App/API partial import: new source match409, acknowledgment retained, renewed explicit review, malformed committed receipt and exact frozen retry despite another match; no duplicate/merge.');

  await entry.getByRole('button', { name: 'Start another import', exact: true }).click();
  await entry.getByLabel('Laboratory (optional)', { exact: true }).fill('Navigation source lab');
  await entry.getByLabel('Results', { exact: true }).fill('ALT, 40, U/L\nAST, 41, U/L');
  await entry.getByRole('button', { name: 'Preview results', exact: true }).click();
  navigateAfterCommit = true;
  const responseWait = page.waitForResponse(response => new URL(response.url()).pathname === '/api/precision/labs/import');
  await entry.getByRole('button', { name: 'Save 2 result(s) after review', exact: true }).click();
  await (await responseWait).finished();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(attempts.filter(attempt => attempt.body.payload.laboratory === 'Navigation source lab').length, 1);
  assert.equal((await own()).filter(row => row.payload.laboratory === 'Navigation source lab').length, 1);
  assert.equal((await store.getPrecisionRecords('other')).length, 0);
  assert.deepEqual(errors, []);
  console.log('PASS navigation unmount stops remaining source requests after the first committed response; other account remains empty.');
} finally {
  await browser.close();
  await vite.close();
  api.closeAllConnections();
  await new Promise(resolve => api.close(resolve));
  await pg.close();
  if (priorKey === undefined) delete process.env.PRECISION_DATA_KEY; else process.env.PRECISION_DATA_KEY = priorKey;
}
