import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {createServer} from 'vite';
import {microbiomeSamples,bacterialComposition,mlAnalyses} from '../../shared/schema.ts';
import {registerReportRoutes} from '../../server/report-routes.ts';
import {importStructuredReportWithReceipt,deleteOwnedViomeReport} from '../../server/structured-report-storage.ts';
import {getOwnedSample,getOwnedComposition,getOwnedAnalyses,updateOwnedSample,insertOwnedComposition,insertOwnedAnalysis} from '../../server/report-records.ts';
import {publicSample} from '../../server/analysis-boundary.ts';
import {parseStructuredReport} from '../../shared/structured-report.ts';
import {syntheticViomePdf,VIOME_PDF_CANARY} from '../../tests/fixtures/viome-pdf.ts';

// Isolated in-memory synthetic SQL; never an environment/Render database.
const pg=new PGlite();await pg.exec(`CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('synthetic-pair-a'),('synthetic-pair-b');
CREATE TABLE microbiome_samples(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL REFERENCES users(id),test_date timestamp NOT NULL,testing_company text,test_id text,raw_data_path text,structured_data jsonb,notes text,processing_status text NOT NULL DEFAULT 'pending',diversity_index real,uploaded_at timestamp NOT NULL DEFAULT now());
CREATE TABLE bacterial_composition(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),sample_id varchar NOT NULL REFERENCES microbiome_samples(id),bacterial_name text NOT NULL,taxonomy_level text NOT NULL,abundance real NOT NULL,genome_data jsonb);
CREATE TABLE ml_analyses(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),sample_id varchar NOT NULL REFERENCES microbiome_samples(id),analysis_type text NOT NULL,model_version text NOT NULL,results jsonb NOT NULL,confidence real,explainability jsonb,compared_cohorts text[],analyzed_at timestamp NOT NULL DEFAULT now());`);
const db=drizzle(pg),store={insertMicrobiomeSample:async data=>(await db.insert(microbiomeSamples).values(data).returning())[0],updateMicrobiomeSample:(id,updates,owner)=>updateOwnedSample(db,id,updates,owner),insertBacterialComposition:(data,owner)=>insertOwnedComposition(db,data,owner),insertMlAnalysis:(data,owner)=>insertOwnedAnalysis(db,data,owner),importStructuredReport:(owner,report,fields,filename,key,reuse)=>importStructuredReportWithReceipt(db,owner,report,fields,filename,key,reuse),deleteViomeReport:(owner,id)=>deleteOwnedViomeReport(db,owner,id)};
const b=await store.importStructuredReport('synthetic-pair-b',parseStructuredReport({testing_company:'Synthetic quantified source',bacteria_percentages:{Roseburia:100}}),{},null,randomUUID());
const app=express();app.use(express.json({limit:'2mb'}));app.use((req,_res,next)=>{req.session={userId:req.get('x-synthetic-user')};next();});
const auth=(req,res,next)=>req.session.userId?next():res.sendStatus(401);registerReportRoutes(app,auth,store);
app.get('/api/microbiome/samples/:owner',auth,async(req,res)=>{if(req.params.owner!==req.session.userId)return res.sendStatus(404);res.json((await db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,req.session.userId))).map(publicSample));});
app.get('/api/microbiome/results/:id',auth,async(req,res)=>{const sample=await getOwnedSample(db,req.params.id,req.session.userId);if(!sample)return res.sendStatus(404);res.json({sample:publicSample(sample),bacterial_composition:await getOwnedComposition(db,sample.id,req.session.userId),analyses:await getOwnedAnalyses(db,sample.id,req.session.userId)});});
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const backend=`http://127.0.0.1:${server.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5273,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(20000);let owner='synthetic-pair-a';const errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;
 if(path.startsWith('/api/microbiome/')){if(req.method()!=='GET'){writes.push({path,method:req.method(),body:req.postData()});assert.equal((req.postData()||'').includes(VIOME_PDF_CANARY),false);}
  const response=await fetch(backend+path,{method:req.method(),headers:{'content-type':'application/json','x-synthetic-user':owner,...(req.headers()['idempotency-key']?{'Idempotency-Key':req.headers()['idempotency-key']}:{}),...(req.headers()['x-bloom-report-actor']?{'X-Bloom-Report-Actor':req.headers()['x-bloom-report-actor']}:{})},...(req.method()!=='GET'?{body:req.postData()}:{} )});return route.fulfill({status:response.status,contentType:'application/json',body:await response.text()});
 }
 return route.fulfill({json:path==='/api/auth/me'?{user:{id:owner,username:'Synthetic report pairing'}}:path==='/api/experience/settings'?{mode:'everyday',onboarding:{status:'complete'}}:[]});
});
const ownRows=()=>db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,'synthetic-pair-a'));
async function load(kind){await page.goto('http://127.0.0.1:5273/upload');await page.getByTestId('input-file').setInputFiles({name:VIOME_PDF_CANARY+'.pdf',mimeType:'application/pdf',buffer:Buffer.from(syntheticViomePdf(kind))});await page.getByRole('button',{name:'Review report',exact:true}).click();await page.getByRole('heading',{name:'Review your Viome report',exact:true}).waitFor();await page.getByText('Existing reports & specimen',{exact:true}).waitFor();}
async function confirm(){await page.getByRole('checkbox',{name:'I reviewed the biological rows and categories against my source. They contain no personal identifiers.',exact:true}).check();await page.getByRole('button',{name:'Save report',exact:true}).click();await page.waitForURL(/\/microbiome\?sample=report_/);await page.getByRole('region',{name:'Viome source relationship',exact:true}).waitFor();}
try{
 await load('organisms');await confirm();assert.equal((await ownRows()).length,1);const root=(await ownRows())[0];
 await load('recommendations');await page.getByText('Link a companion report (optional)',{exact:true}).click();await page.getByRole('combobox',{name:'Companion report',exact:true}).selectOption(root.id);
 const review=page.getByRole('checkbox',{name:'I reviewed the biological rows and categories against my source. They contain no personal identifiers.',exact:true});await review.check();assert.equal(await page.getByRole('button',{name:'Save report',exact:true}).isDisabled(),true);
 await page.getByRole('checkbox',{name:'I confirm these reports came from the same specimen. No provider test or sample ID will be stored.',exact:true}).check();await confirm();let rows=await ownRows();assert.equal(rows.length,2);const child=rows.find(row=>row.id!==root.id);assert.equal(child.structuredData.sourceReport.specimenEvent.rootReportId,root.id);
 await page.getByRole('button',{name:'Open companion report',exact:true}).click();await page.waitForURL(new RegExp(root.id));await page.reload();await page.getByRole('button',{name:'Open companion report',exact:true}).waitFor();
 await load('recommendations');await page.getByText('Matching biological findings are already saved. A different filename or header does not make a new biological result.',{exact:true}).waitFor();await review.check();assert.equal(await page.getByRole('button',{name:'Save report',exact:true}).isDisabled(),true);
 await page.getByRole('radio',{name:'Use an existing report; do not create another observation.',exact:true}).check();await page.getByRole('combobox',{name:'Existing report',exact:true}).selectOption(child.id);await confirm();assert.equal((await ownRows()).length,2);assert.equal(new URL(page.url()).searchParams.get('sample'),child.id);
 await page.getByRole('button',{name:'Open companion report',exact:true}).click();await page.waitForURL(new RegExp(root.id));await page.getByText('Delete this Viome source',{exact:true}).click();await page.getByRole('checkbox',{name:'Delete this report from my account.',exact:true}).check();await page.getByRole('button',{name:'Delete confirmed report',exact:true}).click();
 await page.getByRole('region',{name:'Viome source relationship',exact:true}).getByText('This is a standalone source. Matching dates do not establish a shared specimen.',{exact:true}).waitFor();rows=await ownRows();assert.equal(rows.length,1);assert.equal(rows[0].id,child.id);assert.equal(rows[0].structuredData.sourceReport.specimenEvent,undefined);assert.equal(rows[0].structuredData.foods.length,299);await page.reload();await page.getByRole('region',{name:'Viome source relationship',exact:true}).waitFor();
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 owner='synthetic-pair-b';await page.reload();assert.equal((await db.select().from(microbiomeSamples).where(eq(microbiomeSamples.id,b.sampleId))).length,1);assert.equal(await page.getByRole('region',{name:'Viome source relationship',exact:true}).count(),0);assert.equal((await page.locator('body').innerText()).includes('Synthetic food 298'),false);
 assert.deepEqual(errors,[]);assert.equal(writes.filter(w=>w.method==='POST').length,3);assert.equal(writes.filter(w=>w.method==='DELETE').length,1);assert.equal(JSON.stringify(await db.select().from(microbiomeSamples)).includes(VIOME_PDF_CANARY),false);
 console.log('PASS actual App/native PDF→real HTTP→PGlite: explicit compatible pairing, no save before specimen confirmation, fresh reimport selects/keeps existing source without rows, parent navigation/reload, owned deletion unlinks surviving299foods, source caches refresh, other owner quantified history preserved, 3203901280 and no canary/page errors. Synthetic auth fixture, not hosted/private-layout/device acceptance.');
}finally{await browser.close();await vite.close();server.closeAllConnections();await new Promise(resolve=>server.close(()=>resolve()));await pg.close();}
