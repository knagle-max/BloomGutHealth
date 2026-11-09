import assert from 'node:assert/strict';
import express from 'express';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import { requireActiveAccount } from '../../server/account-auth.ts';
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
let sessionActor='atomic-qa';
app.use((req,_res,next)=>{req.session={userId:sessionActor};next();});
const requireAccount=requireActiveAccount(async id=>['atomic-qa','other'].includes(id));
registerPrecisionRoutes(app,requireAccount,store);
let exportReads=0;
app.get('/api/qa/export',requireAccount,async(req,res)=>{exportReads++;res.json(await store.getPrecisionRecords(req.session.userId));});
const api = app.listen(0, '127.0.0.1');
await new Promise(resolve => api.once('listening', resolve));
const apiBase = `http://127.0.0.1:${api.address().port}`;
const vite = await createServer({ server: { host: '127.0.0.1', port: 5257, strictPort: true } });
await vite.listen();
const { chromium } = createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 1000 }, timezoneId: 'America/New_York', locale: 'en-CA' });
page.setDefaultTimeout(12000);
const errors = [], attempts = [];
const own = () => store.getPrecisionRecords(sessionActor);
const report = async () => {
  const records = await own();
  return { ...buildPrecisionReport(records, context, defaultPreferences, null), records, availableReports: [], intake: { days: 28, mealsLogged: 0, nutrients: [] } };
};
page.on('pageerror', error => errors.push(error.message));
await page.route('https://fonts.**/**', route => route.abort());
await page.route('**/api/**', async route => {
  const request = route.request(), path = new URL(request.url()).pathname;
  if ((request.method() !== 'GET' && path.startsWith('/api/precision')) || path==='/api/qa/export') {
    const body = request.postData() ? request.postDataJSON() : null;
    if (path === '/api/precision/labs/import') attempts.push({ key: request.headers()['idempotency-key'], body });
    const response = await fetch(apiBase + path, { method: request.method(), headers: { 'content-type': 'application/json', 'idempotency-key': request.headers()['idempotency-key'] || '', 'x-bloom-actor':request.headers()['x-bloom-actor'] || '', 'x-bloom-confirm':request.headers()['x-bloom-confirm'] || '' }, body: request.postData() });
    const text = await response.text();
    return route.fulfill({ status: response.status, contentType: 'application/json', body: text });
  }
  let json = [];
  if (path === '/api/auth/me') json = { user: { id: sessionActor, username: 'Synthetic atomic import' } };
  else if (path === '/api/precision') json = await report();
  else if (path === '/api/experience/settings') json = { mode: 'everyday', onboarding: { status: 'complete' } };
  await route.fulfill({ json });
});
try {
 await page.goto('http://127.0.0.1:5257/precision?tab=labs');
 const entry=page.locator('section[aria-labelledby="add-labs-title"]');
 await entry.getByLabel('Results',{exact:true}).fill('ALT, 0, U/L');
 await entry.getByLabel('Test date',{exact:true}).fill('2026-10-20');
 await entry.getByRole('button',{name:'Preview results',exact:true}).click();
 sessionActor='other';
 await entry.getByRole('button',{name:'Save 1 result(s) after review',exact:true}).click();
 await entry.getByRole('alert').filter({hasText:'The signed-in account changed'}).waitFor();
 assert.equal((await store.getPrecisionRecords('atomic-qa')).length,0);
 assert.equal((await store.getPrecisionRecords('other')).length,0);
 assert.equal(attempts.length,1);
 await page.reload();
 await entry.getByLabel('Results',{exact:true}).waitFor();
 assert.equal(await entry.getByLabel('Results',{exact:true}).inputValue(),'');
 await entry.getByLabel('Results',{exact:true}).fill('ALT, 0, U/L');
 await entry.getByLabel('Test date',{exact:true}).fill('2026-10-20');
 await entry.getByRole('button',{name:'Preview results',exact:true}).click();
 await entry.getByRole('button',{name:'Save 1 result(s) after review',exact:true}).click();
 await entry.getByText('1 result(s) saved.',{exact:false}).waitFor();
 assert.equal((await store.getPrecisionRecords('other')).length,1);
 assert.equal((await store.getPrecisionRecords('atomic-qa')).length,0);
 // Direct transport exercise uses the actual production middleware and owned encrypted store.
 const [download]=await Promise.all([page.waitForEvent('download'),page.evaluate(async()=>{
  const {downloadAccountFile}=await import('/src/lib/account-download.ts');await downloadAccountFile('/api/qa/export','synthetic-owned.json');
 })]);
 assert.equal(download.suggestedFilename(),'synthetic-owned.json');const downloaded=JSON.parse(readFileSync(await download.path(),'utf8'));assert.equal(downloaded.length,1);assert.equal(downloaded[0].payload.value,0);await download.delete();
 sessionActor='atomic-qa';
 const staleExport=await page.evaluate(async()=>{try{const {downloadAccountFile}=await import('/src/lib/account-download.ts');await downloadAccountFile('/api/qa/export','denied.json');return null;}catch(error){return error.message;}});
 assert.match(staleExport,/signed-in account changed/);assert.equal(exportReads,1,'Mismatch denied before reading private export records');
 const denied=await page.evaluate(async()=>{
  const {accountFetch}=await import('/src/lib/request-actor.ts');
  const res=await accountFetch('/api/precision',{method:'DELETE',headers:{'X-Bloom-Confirm':'delete-precision-data'}});
  return {status:res.status,body:await res.json()};
 });
 // The stale tab must not erase either owner after a session switch.
 assert.equal(denied.status,409);assert.equal(denied.body.code,'ACCOUNT_CONTEXT_CHANGED');assert.equal((await store.getPrecisionRecords('other')).length,1);
 assert.deepEqual(errors,[]);
 console.log('PASS: actual App/actor transport/production guard/encrypted owner store rejects stale lab draft; reload resets draft and matching owner saves zero-valued result; private download preserves owner/zero and stale export is denied before storage.');
} finally {
 await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();
 if(priorKey===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=priorKey;
}
