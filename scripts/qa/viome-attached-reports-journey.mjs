import{reportDerivedTablesSql}from"../../tests/fixtures/report-derived-tables.ts";
/** Private local acceptance: no PDF, hash, expected manifest, screenshots or
 * biological values are written to Git, disk, console or an external service.
 * Pass BLOOM_VIOME_ORGANISMS_PDF and BLOOM_VIOME_FOODS_PDF explicitly. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {createServer,preview} from 'vite';
import {microbiomeSamples} from '../../shared/schema.ts';
import {registerReportRoutes} from '../../server/report-routes.ts';
import {importStructuredReportWithReceipt,deleteOwnedMicrobiomeReport} from '../../server/structured-report-storage.ts';
import {getOwnedSample,getOwnedComposition,getOwnedAnalyses} from '../../server/report-records.ts';
import {publicSample} from '../../server/analysis-boundary.ts';
const paths=[process.env.BLOOM_VIOME_ORGANISMS_PDF,process.env.BLOOM_VIOME_FOODS_PDF];
assert.ok(paths.every(Boolean),'Set both private attachment paths; this script never downloads source documents.');
// Independent MuPDF oracle: row labels/classifications in the supplied source,
// rather than parser output or a total-count-only expectation. Child stdout is
// captured in memory and never forwarded, even when comparison fails.
const oracle=String.raw`import fitz,json,sys,re
out=[]
for kind,path in zip(['organisms','foods'],sys.argv[1:]):
 d=fitz.open(path);result={'organisms':[],'assessments':[],'foods':[],'pages':len(d)}
 for n,p in enumerate(d):
  spans=[s for b in p.get_text('dict')['blocks'] if 'lines' in b for l in b['lines'] for s in l['spans'] if s['text'].strip()]
  classes=[s for s in spans if s['text'] in ['Bacterium','Virus','Eukaryote']]
  xs=sorted(set(round(s['bbox'][0],1) for s in classes))
  if kind=='organisms':
   for s in classes:
    previous=sorted([v for v in spans if abs(v['bbox'][0]-s['bbox'][0])<1 and 0<s['origin'][1]-v['origin'][1]<30],key=lambda v:v['origin'][1])
    if not previous:continue
    name=''
    for v in previous:name+=(('' if name.endswith('-') else ' ') if name else '')+v['text'].strip()
    if len(name)>150:continue
    result['organisms'].append([name,{'Bacterium':'Bacteria','Virus':'Viruses','Eukaryote':'Eukaryotes'}[s['text']],n+1,xs.index(round(s['bbox'][0],1))+1])
  else:
   for s in spans:
    cells=re.split(r'\s{2,}',s['text'].strip())
    if len(cells)==2 and cells[-1] in ['Improve','Maintain','Attention'] and re.match(r'^[A-Z]',cells[0]) and len(cells[0])<=150:
     result['assessments'].append([cells[0],cells[-1],n+1,1])
    if len(cells)>=4 and sum(c in ['Enjoy','Superfood','Minimize','Avoid'] for c in cells)>=2:
     col=0
     for i,c in enumerate(cells):
      if c in ['Enjoy','Superfood','Minimize','Avoid'] and i and cells[i-1] not in ['Enjoy','Superfood','Minimize','Avoid']:
       col+=1;result['foods'].append([cells[i-1],c,n+1,col])
 out.append(result)
print(json.dumps(out))`;
const expected=JSON.parse(execFileSync('python3',['-c',oracle,...paths],{maxBuffer:3e6}));
for(const report of expected)for(const kind of ['organisms','assessments','foods']){const rows=new Map();for(const row of report[kind]){const bucket=row[2]+':'+row[3],ordinal=(rows.get(bucket)||0)+1;rows.set(bucket,ordinal);row.push(ordinal);}}
assert.ok(expected[0].organisms.length>0&&expected[1].assessments.length>0&&expected[1].foods.length>0,'Independent source oracle must find each table.');
const key=rows=>rows.map(row=>JSON.stringify(row)).sort().join('\n');
function exact(source,index){for(const kind of ['organisms','assessments','foods']){const actual=source[kind].map(row=>[row.name,row.reportedGroup||row.reportedCategory,row.position.page,row.position.column,row.position.row]);assert.ok(key(actual)===key(expected[index][kind]),`Exact ${kind} name/category/page/column/row comparison failed; values withheld.`);assert.equal(new Set(source[kind].map(r=>JSON.stringify(r.position))).size,source[kind].length,'Unique row references required.');}}
const pg=new PGlite();await pg.exec(`CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('private-local-a'),('private-local-b');
CREATE TABLE microbiome_samples(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL REFERENCES users(id),test_date timestamp NOT NULL,testing_company text,test_id text,raw_data_path text,structured_data jsonb,notes text,processing_status text NOT NULL DEFAULT 'pending',diversity_index real,uploaded_at timestamp NOT NULL DEFAULT now());
CREATE TABLE bacterial_composition(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),sample_id varchar NOT NULL REFERENCES microbiome_samples(id),bacterial_name text NOT NULL,taxonomy_level text NOT NULL,abundance real NOT NULL,genome_data jsonb);
CREATE TABLE ml_analyses(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),sample_id varchar NOT NULL REFERENCES microbiome_samples(id),analysis_type text NOT NULL,model_version text NOT NULL,results jsonb NOT NULL,confidence real,explainability jsonb,compared_cohorts text[],analyzed_at timestamp NOT NULL DEFAULT now());`);
await pg.exec(reportDerivedTablesSql);const db=drizzle(pg),store={importStructuredReport:(owner,report,fields,filename,id,reuse)=>importStructuredReportWithReceipt(db,owner,report,fields,filename,id,reuse),deleteMicrobiomeReport:(owner,id,revision)=>deleteOwnedMicrobiomeReport(db,owner,id,revision)};
const app=express();app.use(express.json({limit:'2mb'}));app.use((req,_res,next)=>{req.session={userId:req.get('x-local-user')};next();});const auth=(req,res,next)=>req.session.userId?next():res.sendStatus(401);registerReportRoutes(app,auth,store);
app.get('/api/microbiome/samples/:owner',auth,async(req,res)=>{if(req.params.owner!==req.session.userId)return res.sendStatus(404);res.json((await db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,req.session.userId))).map(publicSample));});
app.get('/api/microbiome/results/:id',auth,async(req,res)=>{const sample=await getOwnedSample(db,req.params.id,req.session.userId);if(!sample)return res.sendStatus(404);res.json({sample:publicSample(sample),bacterial_composition:await getOwnedComposition(db,sample.id,req.session.userId),analyses:await getOwnedAnalyses(db,sample.id,req.session.userId)});});
const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const backend=`http://127.0.0.1:${server.address().port}`;
const built=process.env.BLOOM_VIOME_BUILT==='1';
const vite=built?await preview({preview:{host:'127.0.0.1',port:5274,strictPort:true}}):await createServer({server:{host:'127.0.0.1',port:5274,strictPort:true}});if(!built)await vite.listen();
const closeVite=()=>built?new Promise(resolve=>{vite.httpServer.closeAllConnections?.();vite.httpServer.close(resolve);}):vite.close();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(20000);
let owner='private-local-a',posts=0,index=0,stage='setup',workerCount=0;page.on('worker',()=>workerCount++);const errors=[],messages=[],requests=[];page.on('pageerror',()=>errors.push('pageerror'));page.on('console',m=>messages.push(m.text()));
await page.route('https://fonts.**/**',r=>r.abort());
page.on('request',request=>{const url=new URL(request.url());requests.push({host:url.hostname,method:request.method(),pdfWorker:url.pathname.startsWith('/assets/pdf.worker')});});
await page.route('**/api/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;
 if(path.startsWith('/api/microbiome/')){
  if(req.method()==='POST'){posts++;const body=req.postDataJSON();assert.ok(Object.keys(body).every(k=>['report','reuseExistingReportId'].includes(k)),'Only reviewed findings and optional internal reuse reference may leave browser.');exact(body.report,index);assert.ok(!(req.postData()||'').includes('%PDF-'),'No raw PDF request');}
  const response=await fetch(backend+path,{method:req.method(),headers:{'content-type':'application/json','x-local-user':owner,...(req.headers()['idempotency-key']?{'Idempotency-Key':req.headers()['idempotency-key']}:{}),...(req.headers()['x-bloom-report-actor']?{'X-Bloom-Report-Actor':req.headers()['x-bloom-report-actor']}:{}),...(req.headers()['x-bloom-confirm']?{'X-Bloom-Confirm':req.headers()['x-bloom-confirm']}:{}),...(req.headers()['if-match']?{'If-Match':req.headers()['if-match']}:{})},...(req.method()!=='GET'?{body:req.postData()}:{} )});return route.fulfill({status:response.status,contentType:'application/json',body:await response.text()});
 }
 return route.fulfill({json:path==='/api/auth/me'?{user:{id:owner,username:'Local private acceptance'}}:path==='/api/experience/settings'?{mode:'everyday',onboarding:{status:'complete'}}:[]});
});
const ownRows=()=>db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,'private-local-a'));
async function upload(i){index=i;stage='upload-'+i;await page.goto('http://127.0.0.1:5274/upload');await page.getByTestId('input-file').setInputFiles({name:'local-report.pdf',mimeType:'application/pdf',buffer:await readFile(paths[i])});await page.getByRole('button',{name:'Review report',exact:true}).click();stage='preview-'+i;await page.getByRole('heading',{name:'Review your Viome report',exact:true}).waitFor();stage='preview-issues-'+i;assert.equal(await page.getByRole('group',{name:'Resolve uncertain extraction',exact:true}).count(),0,'Complete source tables should not require invented rows.');assert.equal(await page.getByTestId('input-file').inputValue(),'');assert.equal(await page.getByRole('button',{name:'Save report',exact:true}).isDisabled(),true);}
async function save(){stage='save-'+index;await page.getByRole('checkbox',{name:'I reviewed the biological rows and categories against my source. They contain no personal identifiers.',exact:true}).check();await page.getByRole('button',{name:'Save report',exact:true}).click();await page.waitForURL(/\/microbiome\?sample=report_/);}
try{
 for(let i=0;i<2;i++){
  const count=posts;await upload(i);assert.equal(posts,count,'Preview must not save');
  stage='edit-'+i;await page.getByRole('button',{name:/^Edit /}).first().click();assert.equal(await page.getByRole('button',{name:'Save report',exact:true}).isDisabled(),true);await page.getByRole('button',{name:'Apply row correction',exact:true}).click();
  stage='reflow-'+i;for(const[width,dark]of[[320,false],[390,true]]){stage='reflow-'+i+'-'+width;await page.setViewportSize({width,height:1000});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
  stage='zoom-'+i;await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.evaluate(()=>document.documentElement.style.zoom='');
  stage='keyboard-'+i;await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.activeElement!==document.body));
  await save();stage='reload-'+i;await page.reload();const rows=await ownRows();assert.equal(rows.length,i+1);const row=rows.find(r=>r.structuredData.sourceReport.documentKind===(i===0?'active-gut-microbes':'health-scores-foods'));exact(row.structuredData.sourceReport,i);assert.equal(row.testId,null);assert.equal(row.rawDataPath,null);assert.equal(row.structuredData.bacteria_percentages,undefined);
 }
 const first=(await ownRows()).find(r=>r.structuredData.sourceReport.documentKind==='active-gut-microbes');
 await upload(1);stage='reimport';await page.getByRole('radio',{name:'Use an existing report; do not create another observation.',exact:true}).check();const child=(await ownRows()).find(r=>r.id!==first.id);await page.getByRole('combobox',{name:'Existing report',exact:true}).selectOption(child.id);await save();assert.equal((await ownRows()).length,2);
 stage='delete';await page.goto('http://127.0.0.1:5274/microbiome?sample='+first.id);await page.getByRole('button',{name:'Delete report',exact:true}).click();await page.getByRole('checkbox',{name:'Delete this report from my account.',exact:true}).check();const deletion=page.waitForResponse(response=>response.request().method()==='DELETE'&&new URL(response.url()).pathname==='/api/microbiome/reports/'+first.id);await page.getByRole('button',{name:'Delete confirmed report',exact:true}).click();const deleted=await deletion;stage='delete-response-'+deleted.status();assert.equal(deleted.status(),200);stage='delete-persistence';assert.equal((await ownRows()).length,1);stage='delete-survivor-source';exact((await ownRows())[0].structuredData.sourceReport,1);
 stage='other-owner';owner='private-local-b';await page.reload();assert.equal(await page.getByRole('region',{name:'Viome source relationship',exact:true}).count(),0);assert.equal((await db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,owner))).length,0);
 stage='pdf-worker';if(built){assert.ok(workerCount>0&&requests.some(request=>request.pdfWorker),'Bundled PDF worker must actually start');assert.ok(!messages.some(message=>/setting up fake worker|fake worker failed/i.test(message)),'Compiled PDF parsing must not rely on a fake worker');}
 assert.equal(posts,3);assert.deepEqual(errors,[]);assert.ok(requests.every(r=>['127.0.0.1','localhost','fonts.googleapis.com','fonts.gstatic.com'].includes(r.host)),'No external processor');
 const allLabels=expected.flatMap(e=>['organisms','assessments','foods'].flatMap(k=>e[k].map(r=>r[0])));assert.ok(!messages.some(m=>allLabels.some(n=>n.length>10&&m.includes(n))),'No source findings in browser console');
 console.log(JSON.stringify({result:'PASS',source:'two attached deidentified/reconstructed reports; not original private PDFs',oracleVersion:'mupdf-row-oracle-2026-11-06.1',oracle:'independent MuPDF spans; exact names/categories/page/column/row positions, values withheld',counts:expected.map(e=>({pages:e.pages,organisms:e.organisms.length,assessments:e.assessments.length,foods:e.foods.length})),build:built?'compiled-production-assets':'development-server',bundledPdfWorker:built?'PASS':'NOT_CHECKED',journey:'actual native PDF.js browser upload; review-before-save; row editor; HTTP/in-memory PGlite persistence/reload; idempotent reimport; owned deletion/other account;320390dark200%/keyboard',externalUpload:false,privateSourceArtifactsWritten:false,hosted:'NOT_RUN',independentSecurity:'NOT_GRANTED'}));
}catch(error){throw Error(`Attached-report journey failed at ${stage} (${error.name}); private source values and detailed browser diagnostics withheld.`);}

finally{await browser.close();await closeVite();server.closeAllConnections();await new Promise(resolve=>server.close(()=>resolve()));await pg.close();}
