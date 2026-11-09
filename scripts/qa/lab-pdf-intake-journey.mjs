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
let vite;
if(process.env.BLOOM_PDF_PRODUCTION==='1'){
 const frontend=express();frontend.use(express.static(new URL('../../dist/public/',import.meta.url).pathname));frontend.use((_req,res)=>res.sendFile(new URL('../../dist/public/index.html',import.meta.url).pathname));
 const frontendServer=frontend.listen(5259,'127.0.0.1');await new Promise(resolve=>frontendServer.once('listening',resolve));
 vite={close:async()=>{frontendServer.closeAllConnections();await new Promise(resolve=>frontendServer.close(resolve));}};
}else{vite=await createServer({server:{host:'127.0.0.1',port:5259,strictPort:true}});await vite.listen();}
const { chromium } = createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.BLOOM_CHROMIUM_EXECUTABLE, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 1000 }, timezoneId: 'America/New_York', locale: 'en-CA' });
page.setDefaultTimeout(12000);
await page.addInitScript(()=>{const NativeWorker=window.Worker;window.__labWorkers=new Set();window.Worker=class extends NativeWorker{constructor(...args){super(...args);window.__labWorkers.add(this);}postMessage(...args){if(window.__stallPdfWorker&&args[0]?.action==='GetDocRequest'){window.__pdfWorkerStalled=true;return;}return super.postMessage(...args);}terminate(){window.__labWorkers.delete(this);return super.terminate();}};});
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
    const response = await fetch(apiBase + path, { method: request.method(), headers: { 'content-type': 'application/json', 'idempotency-key': request.headers()['idempotency-key'] || '' }, body: request.postData() });
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
function pdfFixture(lines,pages=1){
 const objects=['<< /Type /Catalog /Pages 2 0 R >>',''];const font=3+pages*2;
 for(let p=0;p<pages;p++){
  const page=3+p*2,content=page+1;
  const stream='BT /F1 12 Tf 40 750 Td 18 TL '+lines.map(line=>'('+line.replaceAll('\\','\\\\').replaceAll('(','\\(').replaceAll(')','\\)')+') Tj T*').join(' ')+' ET';
  objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${content} 0 R >>`,`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
 }
 objects[1]=`<< /Type /Pages /Count ${pages} /Kids [${Array.from({length:pages},(_,i)=>`${3+i*2} 0 R`).join(' ')}] >>`;
 objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');let text='%PDF-1.7\n';const offsets=[0];
 objects.forEach((object,i)=>{offsets.push(Buffer.byteLength(text));text+=`${i+1} 0 obj\n${object}\nendobj\n`;});const xref=Buffer.byteLength(text);
 text+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(offset=>String(offset).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return Buffer.from(text);
}
try{
 await page.goto('http://127.0.0.1:5259/precision?tab=labs');
 const entry=page.locator('section[aria-labelledby="add-labs-title"]'),fileInput=()=>entry.getByLabel('Load report text (PDF, CSV, TSV or TXT)',{exact:true});
 const choose=buffer=>fileInput().setInputFiles({name:'private-report.pdf',mimeType:'application/pdf',buffer});
 await entry.getByLabel('Results',{exact:true}).fill('ALT, 9, U/L');await entry.getByLabel('Test date',{exact:true}).fill('2026-10-19');
 await page.evaluate(()=>{const original=File.prototype.arrayBuffer;window.__originalPdfRead=original;File.prototype.arrayBuffer=async function(){if(this.name==='late.pdf'){window.__latePdfStarted=true;await new Promise(resolve=>{window.__releaseLatePdf=resolve;});}return original.call(this);};});
 await fileInput().setInputFiles({name:'late.pdf',mimeType:'application/pdf',buffer:pdfFixture(['ALT, 99, U/L'])});
 await page.waitForFunction(()=>window.__latePdfStarted===true);
 await fileInput().setInputFiles({name:'newer.csv',mimeType:'text/csv',buffer:Buffer.from('ALT, 9, U/L')});await entry.getByRole('status').filter({hasText:'Text loaded from newer.csv'}).waitFor();
 await page.evaluate(()=>{File.prototype.arrayBuffer=window.__originalPdfRead;window.__releaseLatePdf();});
 assert.equal(await entry.getByLabel('Results',{exact:true}).inputValue(),'ALT, 9, U/L');assert.equal(await page.evaluate(()=>window.__labWorkers.size),0);
 await page.evaluate(()=>{window.__stallPdfWorker=true;window.__pdfWorkerStalled=false;});
 await choose(pdfFixture(['ALT, 99, U/L']));await page.waitForFunction(()=>window.__pdfWorkerStalled===true);assert.equal(await page.evaluate(()=>window.__labWorkers.size),1);
 await fileInput().setInputFiles({name:'worker-replacement.csv',mimeType:'text/csv',buffer:Buffer.from('ALT, 9, U/L')});await entry.getByRole('status').filter({hasText:'Text loaded from worker-replacement.csv'}).waitFor();await page.waitForFunction(()=>window.__labWorkers.size===0);await page.evaluate(()=>{window.__stallPdfWorker=false;});
 if(process.env.BLOOM_PDF_PRODUCTION!=='1'){
  await page.evaluate(async raw=>{window.__stallPdfWorker=true;window.__pdfWorkerStalled=false;window.__codecAbort=new AbortController();const{extractLabPdfText}=await import('/src/lib/lab-pdf-reader.ts');window.__codecResult=extractLabPdfText(new Uint8Array(raw),window.__codecAbort.signal).then(()=> 'unexpected-success',error=>error.code);},Array.from(pdfFixture(['ALT, 99, U/L'])));
  await page.waitForFunction(()=>window.__pdfWorkerStalled===true);
  const cancelled=await page.evaluate(async()=>{window.__codecAbort.abort();return window.__codecResult;});assert.equal(cancelled,'cancelled');assert.equal(await page.evaluate(()=>window.__labWorkers.size),0);await page.evaluate(()=>{window.__stallPdfWorker=false;});
 }
 await choose(pdfFixture([]));await entry.getByRole('alert').filter({hasText:'No readable text was found'}).waitFor();assert.equal(await entry.getByLabel('Results',{exact:true}).inputValue(),'ALT, 9, U/L');
 await choose(pdfFixture(['ALT, 0, U/L'],6));await entry.getByRole('alert').filter({hasText:'up to 5 pages'}).waitFor();assert.equal(await entry.getByLabel('Results',{exact:true}).inputValue(),'ALT, 9, U/L');
 await choose(pdfFixture(['[ ORIGINAL SOURCE ]','Test assay,<0.50,source-unit,<2.0','ALT,0.00,U/L']));
 await entry.getByRole('status').filter({hasText:'Text loaded from private-report.pdf'}).waitFor();
 const extracted=await entry.getByLabel('Results',{exact:true}).inputValue();assert.match(extracted,/ALT,0\.00,U\/L/);assert.match(extracted,/Test assay,<0\.50,source-unit,<2\.0/);
 assert.equal(await entry.getByLabel('Test date',{exact:true}).inputValue(),'');assert.equal((await own()).length,0);assert.equal(attempts.length,0);
 await entry.getByLabel('Test date',{exact:true}).fill('2026-10-20');await entry.getByRole('button',{name:'Preview results',exact:true}).click();
 await entry.getByRole('button',{name:'Keep 1 source-only row(s)',exact:true}).click();assert.equal(attempts.length,0);
 await entry.getByRole('button',{name:'Save 2 result(s) after review',exact:true}).click();await entry.getByText('2 result(s) saved.',{exact:false}).waitFor();
 const saved=await own(),canonical=await report();assert.equal(saved.length,2);assert.equal(canonical.labHistory[0].value,0);assert.equal(canonical.sourceOnlyLabs[0].reportedValue,'<0.50');assert.equal(JSON.stringify(saved).includes('private-report.pdf'),false);
 await page.waitForFunction(()=>window.__labWorkers.size===0);
 assert.equal(saved.every(row=>row.payload.sourceReport.enteredDate==='2026-10-20'),true);assert.equal(saved.every(row=>!row.payload.sourceReport.reportIdentifier),true);
 await page.setViewportSize({width:320,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.deepEqual(errors,[]);
 console.log('PASS local actual PDF worker/App/source review/encrypted save: late PDF read cannot replace newer CSV; stalled native worker replacement/cancellation settles and cleans up; blank and page limits retain draft; editable exact source numbers; no write before manual date/review; clinical zero/source-only threshold retained; filename never identity;320px.');
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(priorKey===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=priorKey;}
