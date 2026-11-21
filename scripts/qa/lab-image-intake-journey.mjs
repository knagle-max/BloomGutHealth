import path from'node:path';import{execFileSync}from'node:child_process';import{mkdirSync}from'node:fs';import{setAppTheme}from'./set-app-theme.mjs';
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

let actor='atomic-qa';
const baseline=process.env.BLOOM_IMAGE_REF,captureOnly=process.env.BLOOM_IMAGE_CAPTURE==='1'||!!baseline,output=process.env.BLOOM_REVIEW_OUTPUT;
const priorKey = process.env.PRECISION_DATA_KEY;
process.env.PRECISION_DATA_KEY = randomBytes(32).toString('base64');
const pg = new PGlite();
await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('atomic-qa'),('other');");
await pg.exec(readFileSync(new URL('../../migrations/0002_precision_nutrition.sql', import.meta.url), 'utf8'));
const store = new PrecisionStorage(drizzle(pg)), app = express(), context = contextSchema.parse({});
app.use(express.json());
registerPrecisionRoutes(app, (req, _res, next) => { req.session = { userId: actor }; next(); }, store);
const api = app.listen(0, '127.0.0.1');
await new Promise(resolve => api.once('listening', resolve));
const apiBase = `http://127.0.0.1:${api.address().port}`;
let vite;
if(process.env.BLOOM_IMAGE_PRODUCTION==='1'){
 const frontend=express();frontend.use(express.static(new URL('../../dist/public/',import.meta.url).pathname));frontend.use((_req,res)=>res.sendFile(new URL('../../dist/public/index.html',import.meta.url).pathname));
 const frontendServer=frontend.listen(5260,'127.0.0.1');await new Promise(resolve=>frontendServer.once('listening',resolve));
 vite={close:async()=>{frontendServer.closeAllConnections();await new Promise(resolve=>frontendServer.close(resolve));}};
}else{vite=await createServer({plugins:baseline?[{name:'local-image-baseline',enforce:'pre',load(id){if(id.split('?')[0]===path.resolve('client/src/components/QuickLabEntry.tsx'))return execFileSync('git',['show',baseline+':client/src/components/QuickLabEntry.tsx'],{encoding:'utf8'});}}]:[],server:{host:'127.0.0.1',port:5260,strictPort:true}});await vite.listen();}
const { chromium } = createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 1000 }, timezoneId: 'America/New_York', locale: 'en-CA' });
page.setDefaultTimeout(20000);
await page.clock.install({time:new Date('2026-11-04T12:00:00Z')});
await page.addInitScript(()=>{const NativeWorker=window.Worker;window.__labWorkers=new Set();window.Worker=class extends NativeWorker{constructor(...args){super(...args);window.__labWorkers.add(this);}postMessage(...args){if(window.__stallImageWorker&&args[0]?.bytes){window.__imageWorkerStalled=true;return;}return super.postMessage(...args);}terminate(){window.__labWorkers.delete(this);return super.terminate();}};const create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);window.__imageUrls=new Set();URL.createObjectURL=blob=>{const url=create(blob);window.__imageUrls.add(url);return url;};URL.revokeObjectURL=url=>{window.__imageUrls.delete(url);return revoke(url);};});
const errors = [], attempts = [];
let loseReceipt = false;
const own = () => store.getPrecisionRecords(actor);
const report = async () => {
  const records = await own();
  return { ...buildPrecisionReport(records, context, defaultPreferences, null), records, availableReports: [], journalSymptoms:[], intake: { days: 28, mealsLogged: 0, nutrients: [] } };
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
      if (loseReceipt) { loseReceipt=false;return route.fulfill({status:503,json:{error:'Synthetic committed response lost'}}); }
    }
    return route.fulfill({ status: response.status, contentType: 'application/json', body: text });
  }
  let json = [];
  if (path === '/api/auth/me') json = { user: { id: actor, username: 'Synthetic atomic import' } };
  else if (path === '/api/precision') json = await report();
  else if (path === '/api/experience/settings') json = { mode: 'everyday', onboarding: { status: 'complete' } };
  await route.fulfill({ json });
});
const cdp=await page.context().newCDPSession(page);
const noOcrWorkers=async()=>{for(let i=0;i<100;i++){const{targetInfos}=await cdp.send('Target.getTargets');if(!targetInfos.some(t=>t.type==='worker'&&(/lab-image-worker/.test(t.url)||t.url.includes('/ocr/v1/worker.min.js'))))return;await new Promise(r=>setTimeout(r,20));}const{targetInfos}=await cdp.send('Target.getTargets');assert.fail('Local OCR worker or child remained alive: '+targetInfos.filter(t=>t.type==='worker').map(t=>t.url).join(', '));};
let holdLanguage=false,releaseLanguage,languageHeld;
await page.context().route('**/ocr/v1/language/eng.traineddata.gz',async route=>{if(holdLanguage){languageHeld=true;await new Promise(resolve=>releaseLanguage=resolve);}try{await route.continue();}catch{}});
const external=[],ocrRequests=[];
page.context().on('request',request=>{const url=new URL(request.url());if(url.pathname.startsWith('/ocr/'))ocrRequests.push({method:request.method(),body:request.postData()});if(!['http:','https:'].includes(url.protocol))return;if(url.origin!=='http://127.0.0.1:5260'&&!url.hostname.startsWith('fonts.'))external.push(url.origin);});
const capture=async(entry)=>{assert.ok(output,'Capture output directory required');mkdirSync(output,{recursive:true});for(const width of[320,390])for(const theme of['light','dark']){await page.setViewportSize({width,height:2400});await setAppTheme(page,theme);const box=await entry.boundingBox();await page.setViewportSize({width,height:Math.ceil(box.height)+250});await entry.evaluate(el=>el.scrollIntoView({block:'center'}));await entry.screenshot({path:output+'/'+(baseline?'before':'after')+'-'+width+'-'+theme+'.png',animations:'disabled'});}};
try{await(async()=>{
 await page.goto('http://127.0.0.1:5260/precision?tab=labs');
 const entry=page.locator('section[aria-labelledby="add-labs-title"]'),text=entry.getByLabel('Results',{exact:true}),image=entry.getByLabel('PNG/JPEG report image',{exact:true}),csv=entry.getByLabel('Load report text (PDF, CSV, TSV or TXT)',{exact:true});
 const imageBuffer=async(blank=false,mime='image/png')=>Buffer.from(await page.evaluate(async([blank,mime])=>{const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=400;const c=canvas.getContext('2d');c.fillStyle='white';c.fillRect(0,0,1400,400);if(!blank){c.fillStyle='black';c.font='48px monospace';c.fillText('ALT, 0, U/L',50,100);c.fillText('LDL, 3.20, mmol/L',50,200);c.fillText('Test assay, <0.50, source-unit, <2.0',50,300);}return Array.from(new Uint8Array(await(await new Promise(resolve=>canvas.toBlob(resolve,mime,.95))).arrayBuffer()));},[blank,mime]));
 const png=await imageBuffer(),choose=(name='synthetic-report-2020-02-02.png',buffer=png)=>image.setInputFiles({name,mimeType:'image/png',buffer});
 await text.fill('ALT, 9, U/L');await entry.getByLabel('Test date',{exact:true}).fill('2026-10-19');
 if(baseline){await csv.setInputFiles({name:'synthetic-report-2020-02-02.png',mimeType:'image/png',buffer:png});await entry.getByRole('alert').waitFor();await capture(entry);assert.equal(attempts.length,0);console.log('BEFORE scoped QuickLabEntry '+baseline+'; same synthetic image requested, old supported text-file route retains prior draft, current App/API/styles; no writes.');return;}
 await entry.getByText('Read text from a report image',{exact:true}).click();
 await choose();await entry.getByRole('status').filter({hasText:'Text loaded from synthetic-report-2020-02-02.png'}).waitFor();
 assert.match(await text.inputValue(),/ALT, 0, U\/L/);assert.match(await text.inputValue(),/LDL, 3\.20, mmol\/L/);assert.equal(await entry.getByLabel('Test date',{exact:true}).inputValue(),'');assert.equal(attempts.length,0);assert.equal((await own()).length,0);
 await entry.getByText('Compare with selected image',{exact:true}).click();assert.ok((await entry.getByAltText('Selected report image; compare its values with the editable transcription.',{exact:true}).getAttribute('src')).startsWith('blob:'));assert.equal(await page.evaluate(()=>window.__imageUrls.size),1);await noOcrWorkers();if(captureOnly){await capture(entry);assert.equal(attempts.length,0);assert.deepEqual(errors,[]);console.log('AFTER actual local image-to-editable-source review; synthetic PNG0/3.20/raw threshold, no date guessed/no write, current App/API/styles.');return;}
 // A replaced pending file cannot overwrite newer canonical source text or retain its image URL.
 await page.evaluate(()=>{const original=File.prototype.arrayBuffer;window.__originalImageRead=original;File.prototype.arrayBuffer=async function(){if(this.name==='late.png'){window.__lateImageStarted=true;await new Promise(resolve=>window.__releaseLateImage=resolve);}return original.call(this);};});
 await choose('late.png');await page.waitForFunction(()=>window.__lateImageStarted===true);await csv.setInputFiles({name:'newer.csv',mimeType:'text/csv',buffer:Buffer.from('ALT, 9, U/L')});await entry.getByRole('status').filter({hasText:'Text loaded from newer.csv'}).waitFor();await page.evaluate(()=>{File.prototype.arrayBuffer=window.__originalImageRead;window.__releaseLateImage();});assert.equal(await text.inputValue(),'ALT, 9, U/L');assert.equal(await page.evaluate(()=>window.__imageUrls.size),0);assert.equal(attempts.length,0);
 await choose('blank.png',await imageBuffer(true));await entry.getByRole('alert').filter({hasText:'No readable text was found'}).waitFor();assert.equal(await text.inputValue(),'ALT, 9, U/L');await noOcrWorkers();
 // Cancel while the actual child worker waits for its self-hosted language data.
 holdLanguage=true;languageHeld=false;await choose('cancel.png');for(let i=0;i<200&&!languageHeld;i++)await new Promise(r=>setTimeout(r,20));assert.equal(languageHeld,true,'Actual OCR initialization requested its local model');await entry.getByRole('button',{name:'Cancel reading',exact:true}).click();await entry.getByRole('alert').filter({hasText:'Image reading was cancelled'}).waitFor();await noOcrWorkers();holdLanguage=false;releaseLanguage();assert.equal(await text.inputValue(),'ALT, 9, U/L');
 await page.evaluate(()=>{window.__stallImageWorker=true;window.__imageWorkerStalled=false;});await choose('stalled.png');await page.waitForFunction(()=>window.__imageWorkerStalled===true);await page.clock.runFor(60010);await entry.getByRole('alert').filter({hasText:'Image reading took too long'}).waitFor();await noOcrWorkers();await page.evaluate(()=>{window.__stallImageWorker=false;});assert.equal(await text.inputValue(),'ALT, 9, U/L');
 // A navigation during actual initialization terminates both worker levels.
 holdLanguage=true;languageHeld=false;await choose('leaving.png');for(let i=0;i<200&&!languageHeld;i++)await new Promise(r=>setTimeout(r,20));assert.equal(languageHeld,true);await page.evaluate(()=>{history.pushState({},'', '/qa/image-reader-left');dispatchEvent(new PopStateEvent('popstate'));});await entry.waitFor({state:'detached'});await noOcrWorkers();holdLanguage=false;releaseLanguage();assert.equal((await own()).length,0);
 await page.goto('http://127.0.0.1:5260/precision?tab=labs');await entry.getByText('Read text from a report image',{exact:true}).click();await image.setInputFiles({name:'synthetic-jpeg-report.jpg',mimeType:'image/jpeg',buffer:await imageBuffer(false,'image/jpeg')});await entry.getByRole('status').filter({hasText:'Text loaded from synthetic-jpeg-report.jpg'}).waitFor();assert.match(await text.inputValue(),/LDL, 3\.20, mmol\/L/);assert.match(await text.inputValue(),/<0\.50/);assert.equal(attempts.length,0);await entry.getByLabel('Test date',{exact:true}).fill('2026-10-20');await entry.getByRole('button',{name:'Preview results',exact:true}).click();assert.equal(attempts.length,0);await entry.getByRole('checkbox',{name:/^Include /}).first().waitFor();assert.equal(await entry.getByRole('checkbox',{name:/^Include /}).count(),1);for(const sourceRow of await entry.getByRole('checkbox',{name:/^Include /}).all())assert.equal(await sourceRow.isChecked(),true,'Source-only rows are included by default');await entry.getByRole('button',{name:'Save 3 result(s) after review',exact:true}).click();await entry.getByText('3 result(s) saved.',{exact:false}).waitFor();
 const saved=await own();assert.equal(saved.length,3);assert.equal(saved.find(r=>r.payload.sourceOnly).payload.reportedValue,'<0.50');assert.ok(saved.find(r=>r.payload.sourceOnly).payload.sourceInput.text.includes('<2.0'));const projected=await report();assert.equal(projected.sourceOnlyLabs.length,1);assert.equal(projected.trends.length,2);assert.equal(saved.find(r=>r.payload.marker==='alt').payload.value,0);assert.equal(saved.find(r=>r.payload.marker==='ldl').payload.sourceInput.number,'3.20');assert.equal(saved.every(r=>r.payload.sourceReport.enteredDate==='2026-10-20'&&!r.payload.sourceReport.reportIdentifier),true);assert.equal(/synthetic-report-2020|synthetic-jpeg-report/.test(JSON.stringify(saved)),false);assert.equal((await store.getPrecisionRecords('other')).length,0);
 await page.setViewportSize({width:320,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await noOcrWorkers();assert.ok((await image.boundingBox()).height>=44);await entry.getByRole('button',{name:'Start another import',exact:true}).click();holdLanguage=true;languageHeld=false;await choose('switching-owner.png');for(let i=0;i<200&&!languageHeld;i++)await new Promise(r=>setTimeout(r,20));assert.equal(languageHeld,true);actor='other';await page.evaluate(()=>{window.dispatchEvent(new StorageEvent('storage',{key:'bloom-session-change',newValue:'synthetic-session-change'}));});await entry.getByLabel('Results',{exact:true}).waitFor();assert.equal(await text.inputValue(),'');await noOcrWorkers();holdLanguage=false;releaseLanguage();assert.equal(await page.evaluate(()=>window.__imageUrls.size),0);assert.equal((await store.getPrecisionRecords('atomic-qa')).length,3);assert.equal((await store.getPrecisionRecords('other')).length,0);assert.deepEqual(external,[]);assert.ok(ocrRequests.length>0);assert.ok(ocrRequests.every(r=>r.method==='GET'&&r.body===null));assert.deepEqual(errors,[]);
 console.log('PASS actual local English image OCR/App/encrypted save: PNG/JPEG zero/trailing decimals/raw threshold, editable/manual date/review before write; file replacement revokes preview; blank/cancel/model initialization timeout/unmount terminate worker and child; self-hosted asset GETs only/no provider upload; original filename not identity, pending owner switch clears source/preview and child worker,320px/44px target. Synthetic image, not clinical or physical-device OCR validation.');
})();}finally{if(releaseLanguage)releaseLanguage();await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(priorKey===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=priorKey;}
