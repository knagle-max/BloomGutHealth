import assert from 'node:assert/strict';
import express from 'express';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import { PrecisionStorage } from '../../server/precision-storage.ts';
import { registerPrecisionRoutes } from '../../server/precision-routes.ts';
import { buildPrecisionReport, contextSchema } from '../../shared/precision-nutrition.ts';
import { defaultPreferences } from '../../shared/meal-intelligence.ts';

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
const vite = await createServer({ server: { host: '127.0.0.1', port: 5263, strictPort: true } });
await vite.listen();
const { chromium } = createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 1000 }, timezoneId: 'America/New_York', locale: 'en-CA' });
page.setDefaultTimeout(12000);
const errors = [], attempts = [];
let loseReceipt = false;
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
    const response = await fetch(apiBase + path, { method: request.method(), headers: { 'content-type': 'application/json', ...(request.headers()['idempotency-key']?{'idempotency-key':request.headers()['idempotency-key']}:{}) }, body: request.postData() });
    const text = await response.text();
    if (response.ok && path === '/api/precision/labs/import') {
      if (loseReceipt) { loseReceipt=false;return route.fulfill({status:503,json:{error:'Synthetic committed response lost'}}); }
    }
    return route.fulfill({ status: response.status, contentType: 'application/json', body: text });
  }
  let json = [];
  if (path === '/api/auth/me') json = { user: { id: 'atomic-qa', username: 'Synthetic atomic import' } };
  else if (path === '/api/precision') json = await report();
  else if (path === '/api/experience/settings') json = { mode: 'everyday', onboarding: { status: 'complete' } };
  await route.fulfill({ json });
});
try {
  await page.goto('http://127.0.0.1:5263/precision?tab=genetics');
  const form=page.getByRole('region',{name:'Enter individual SNPs'});
  await form.getByLabel('Genotype rs1801133',{exact:true}).fill('ZZ');await form.getByRole('button',{name:'Preview selected SNPs',exact:true}).click();await form.getByRole('alert').waitFor();assert.equal((await own()).length,0);await form.getByLabel('Genotype rs1801133',{exact:true}).fill('AG');
  await form.getByLabel('Genotype source',{exact:true}).fill('Synthetic selected source');
  await form.getByRole('button',{name:'Preview selected SNPs',exact:true}).click();
  await form.getByText('1 selected SNPs. Only the rows below will be saved.',{exact:true}).waitFor();
  assert.equal((await own()).length,0);
  const save=form.getByRole('button',{name:'Save selected SNPs',exact:true});assert.equal(await save.isDisabled(),true);
  await form.getByRole('checkbox',{name:/I consent to saving these selected genetic entries/}).check();await save.click();
  await page.getByText('Selected SNPs saved as your active genetic dataset. Unreviewed or unconfirmed entries remain recorded without interpretation.',{exact:true}).waitFor();
  const records=await own();assert.equal(records.length,1);assert.equal(records[0].payload.entries[0].genotype,'AG');assert.equal(records[0].payload.strand,'unknown');assert.equal(records[0].payload.source,'Synthetic selected source');assert.equal((await store.getPrecisionRecords('other')).length,0);
  await page.reload();await form.getByLabel('Genotype rs1801133',{exact:true}).waitFor();assert.equal(await form.getByLabel('Genotype rs1801133',{exact:true}).inputValue(),'AG');assert.equal(await form.getByLabel('Genotype source',{exact:true}).inputValue(),'Synthetic selected source');
  await page.getByText('Supported calls provide educational context; they do not set nutrition targets or add food-ranking priority.',{exact:false}).waitFor();
  await page.setViewportSize({width:320,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.deepEqual(errors,[]);
  console.log('PASS actual App/HTTP/encrypted PGlite selected SNP preview/no write before consent/save/reload/unknown strand/source/owner/320px; corrected educational copy.');

} catch(error) { console.error({errors,alerts:await page.getByRole('alert').allTextContents(),records:(await own()).length});throw error; } finally {
  await browser.close();
  await vite.close();
  api.closeAllConnections();
  await new Promise(resolve => api.close(resolve));
  await pg.close();
  if (priorKey === undefined) delete process.env.PRECISION_DATA_KEY; else process.env.PRECISION_DATA_KEY = priorKey;
}
