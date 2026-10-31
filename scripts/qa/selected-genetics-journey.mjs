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
const errors = [], commands = [];
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
    commands.push({path,body});
    const response = await fetch(apiBase + path, { method: request.method(), headers: { 'content-type': 'application/json', ...(request.headers()['idempotency-key']?{'idempotency-key':request.headers()['idempotency-key']}:{}) }, body: request.postData() });
    const text = await response.text();
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
  const rawPanel=page.locator('section').filter({has:page.getByRole('heading',{name:'Import 23andMe raw data',exact:true})});
  await rawPanel.getByLabel('DNA sample date',{exact:true}).fill('2026-10-02T12:30');
  await rawPanel.getByLabel('Raw data text file',{exact:true}).setInputFiles({name:'synthetic-selected-source.txt',mimeType:'text/plain',buffer:Buffer.from('# 23andMe\n# build 37\nrs1801133 1 11856378 AG\nrs4988235 2 136608646 GG\nrs429358 19 45411941 CT\nrs7412 19 45412079 CC\nrs99999 3 100 TT')});
  await rawPanel.getByText('Scanned 5 rows. 4 supported calls found; 2 selected for saving.',{exact:true}).waitFor();assert.equal((await own()).length,1);
  const rawSave=rawPanel.getByRole('button',{name:'Save supported calls',exact:true});assert.equal(await rawSave.isDisabled(),true);
  const consent=rawPanel.getByRole('checkbox',{name:/I consent to saving these selected genetic calls/});await consent.check();await rawPanel.getByRole('checkbox',{name:'Include rs1801133',exact:true}).uncheck();assert.equal(await consent.isChecked(),false);assert.equal(await rawSave.isDisabled(),true);await rawPanel.getByText('Review sensitive APOE markers (optional)',{exact:true}).click();const sensitive=rawPanel.getByRole('checkbox',{name:'Include APOE rs429358',exact:true});assert.equal(await sensitive.isChecked(),false);await sensitive.check();await consent.check();await sensitive.uncheck();assert.equal(await consent.isChecked(),false);
 await rawPanel.getByLabel('DNA sample date',{exact:true}).fill('2026-10-03T12:30');assert.equal(await rawPanel.getByLabel('Raw data text file',{exact:true}).inputValue(),'');assert.equal(await rawSave.isDisabled(),true);assert.equal((await own()).length,1);
 await rawPanel.getByLabel('Raw data text file',{exact:true}).setInputFiles({name:'synthetic-selected-source.txt',mimeType:'text/plain',buffer:Buffer.from('# 23andMe\n# build 37\nrs1801133 1 11856378 AG\nrs4988235 2 136608646 GG\nrs429358 19 45411941 CT\nrs7412 19 45412079 CC\nrs99999 3 100 TT')});await rawPanel.getByText('Scanned 5 rows. 4 supported calls found; 2 selected for saving.',{exact:true}).waitFor();assert.equal(await consent.isChecked(),false);await rawPanel.getByRole('checkbox',{name:'Include rs1801133',exact:true}).uncheck();await consent.check();await rawSave.click();
  await page.getByText('Active import: 2026-10-03',{exact:true}).waitFor();
  assert.equal(commands.length,2);assert.equal(JSON.stringify(commands[1].body).includes('rs99999'),false);assert.equal(JSON.stringify(commands[1].body).includes('# 23andMe'),false);const imports=await own();assert.equal(imports.length,2);const raw=imports.find(row=>row.payload.provider==='23andMe');assert.equal(raw.payload.calls.length,1);assert.equal(raw.payload.calls[0].rsid,'rs4988235');assert.equal(raw.payload.scannedVariants,5);assert.equal(JSON.stringify(commands[1].body).includes('rs429358'),false);assert.equal(JSON.stringify(commands[1].body).includes('rs7412'),false);assert.equal(raw.payload.calls.some(row=>row.rsid==='rs99999'),false);assert.equal('rawText' in raw.payload,false);assert.equal(imports.some(row=>row.payload.source==='Synthetic selected source'),true);assert.equal((await store.getPrecisionRecords('other')).length,0);
  await page.reload();await page.getByText('Active import: 2026-10-03',{exact:true}).waitFor();
  await page.setViewportSize({width:320,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.deepEqual(errors,[]);
  console.log('PASS actual App/HTTP/encrypted PGlite selected SNP preview/no write before consent/save/reload/unknown strand/source/owner/320px; selected file calls/sensitive defaults/fresh consent/date change/minimized POST/reload/prior source; corrected educational copy.');

} catch(error) { console.error({errors,alerts:await page.getByRole('alert').allTextContents(),records:(await own()).length});throw error; } finally {
  await browser.close();
  await vite.close();
  api.closeAllConnections();
  await new Promise(resolve => api.close(resolve));
  await pg.close();
  if (priorKey === undefined) delete process.env.PRECISION_DATA_KEY; else process.env.PRECISION_DATA_KEY = priorKey;
}
