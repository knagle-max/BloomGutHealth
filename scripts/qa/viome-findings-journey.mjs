import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {createServer} from 'vite';
import {VIOME_FINDINGS_VERSION} from '../../shared/viome-findings.ts';
import {parseStructuredReport,reportImportIdentity} from '../../shared/structured-report.ts';
const source={schemaVersion:VIOME_FINDINGS_VERSION,provider:'Viome',documentKind:'active-gut-microbes',specimenType:'fecal',method:'qualitative RNA',biologicalDates:{collectedOn:'2026-09-01',receivedOn:'2026-09-02',reportedOn:'2026-09-05'},reviewConfirmed:true,organisms:[{name:'Bacteroides fragilis 638R',reportedGroup:'Bacteria',reportedStatus:'reported_present',position:{page:2,column:1,row:1}}],assessments:[],foods:[]};
const owner='synthetic-viome',canary='PrivateCanaryValue',normalized=parseStructuredReport(source),posts=[],errors=[];
let saved=null;
const vite=await createServer({server:{host:'127.0.0.1',port:5267,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',route=>{const req=route.request(),p=new URL(req.url()).pathname;
 if(req.method()==='POST'&&p==='/api/microbiome/import'){
  const body=req.postDataJSON();posts.push(body);assert.deepEqual(Object.keys(body),['report']);assert.deepEqual(body.report,source);assert.equal(req.postData().includes(canary),false);
  const id='report_'+createHash('sha256').update(reportImportIdentity(owner,req.headers()['idempotency-key'])).digest('hex');
  saved={id,userId:owner,testingCompany:'Viome',testDate:'2026-09-01',processingStatus:'completed',structuredData:normalized};
  return route.fulfill({json:{success:true,sampleId:id,preview:{kind:'functional-report',scores:0,reportedOrganisms:1,quantifiedTaxa:0,dateSource:'report-provided',missingData:normalized.missingData}}});
 }
 const json=p==='/api/auth/me'?{user:{id:owner,username:'Synthetic findings'}}:p==='/api/experience/settings'?{mode:'everyday',onboarding:{status:'complete'}}:p.startsWith('/api/microbiome/samples')?(saved?[saved]:[]):saved&&p==='/api/microbiome/results/'+saved.id?{sample:saved,bacterial_composition:[],analyses:[]}:[];
 return route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5267/upload');
 const file=page.getByTestId('input-file');
 await file.setInputFiles({name:canary+'.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...source,PatientCanaryKey:canary}))});
 await page.getByRole('button',{name:'Review report',exact:true}).click();await page.getByRole('alert').filter({hasText:'Viome findings contain unsupported fields'}).waitFor();
 assert.equal(await file.inputValue(),'');assert.equal((await page.locator('body').innerText()).includes(canary),false);assert.equal(posts.length,0);
 await page.getByText('Report details (optional)',{exact:true}).click();await page.getByLabel('Test ID (Optional)',{exact:true}).fill(canary);await page.getByLabel('Notes (Optional)',{exact:true}).fill(canary);
 const wrapper={...normalized,sourceLabel:canary,dataOrigin:canary,rawText:canary};
 await file.setInputFiles({name:canary+'.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(wrapper))});
 await page.getByRole('button',{name:'Review report',exact:true}).click();await page.getByRole('heading',{name:'Review report before saving',exact:true}).waitFor();
 await page.getByText('This record keeps the reviewed finding fields. Optional identifiers, notes and the original filename are omitted.',{exact:true}).waitFor();
 assert.equal(await file.inputValue(),'');assert.equal(await page.getByLabel('Test ID (Optional)',{exact:true}).inputValue(),'');assert.equal(await page.getByLabel('Notes (Optional)',{exact:true}).inputValue(),'');
 assert.equal((await page.locator('body').innerText()).includes(canary),false);assert.equal(await page.evaluate(c=>JSON.stringify({...localStorage,...sessionStorage}).includes(c),canary),false);
 assert.equal(posts.length,0);await page.getByRole('button',{name:'Save report',exact:true}).click();
 await page.waitForURL(/\/microbiome\?sample=report_/);await page.getByRole('region',{name:'Imported report details',exact:true}).getByText('Bacteroides fragilis 638R',{exact:true}).waitFor();
 await page.reload();await page.getByRole('region',{name:'Imported report details',exact:true}).getByText('Bacteroides fragilis 638R',{exact:true}).waitFor();
 assert.equal(posts.length,1);assert.equal((await page.locator('body').innerText()).includes(canary),false);assert.deepEqual(errors,[]);
 console.log('PASS actual App optional reviewed-findings JSON: invalid identity field rejected locally, fixed safe error, file/identifier/draft clearing, sanitized preview, one minimized POST, existing receipt/save/reload flow. Mocked API; separate actual HTTP/SQL tests prove persistence. No PDF extraction or full PII-exclusion certification claimed.');
}finally{await browser.close();await vite.close();}
