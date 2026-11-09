import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'vite';
import {syntheticViomePdf,VIOME_PDF_CANARY} from '../../tests/fixtures/viome-pdf.ts';
import {parseStructuredReport,reportImportIdentity} from '../../shared/structured-report.ts';
const before=process.argv.includes('--before'),capture=process.env.BLOOM_CAPTURE_VISUALS==='1';
const owner='synthetic-native-pdf-owner',posts=[],errors=[],outbound=[],messages=[];let saved=null;
const vite=await createServer({...(process.env.BLOOM_QA_BASELINE_ROOT?{configFile:process.env.BLOOM_QA_BASELINE_ROOT+'/vite.config.ts'}:{}),server:{host:'127.0.0.1',port:5272,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>messages.push(msg.text()));
page.on('request',request=>{if(!new URL(request.url()).hostname.match(/^(localhost|127\.0\.0\.1)$/))outbound.push(request.url());if(request.method()!=='GET')assert.equal((request.postData()||'').includes(VIOME_PDF_CANARY),false);});
await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',route=>{const req=route.request(),path=new URL(req.url()).pathname;
 if(req.method()==='POST'&&path==='/api/microbiome/import'){
  const body=req.postDataJSON();posts.push(body);assert.deepEqual(Object.keys(body),['report']);assert.equal(JSON.stringify(body).includes(VIOME_PDF_CANARY),false);assert.equal(JSON.stringify(body).includes('%PDF-'),false);
  const report=parseStructuredReport(body.report),id='report_'+createHash('sha256').update(reportImportIdentity(owner,req.headers()['idempotency-key'])).digest('hex');
  saved={id,userId:owner,testingCompany:'Viome',testDate:'2026-09-01',processingStatus:'completed',structuredData:report};
  return route.fulfill({json:{success:true,sampleId:id,preview:{kind:report.kind,scores:report.scores.length,reportedOrganisms:report.organisms.length,quantifiedTaxa:0,dateSource:'report-provided',missingData:report.missingData}}});
 }
 const json=path==='/api/auth/me'?{user:{id:owner,username:'Synthetic PDF review'}}:path==='/api/experience/settings'?{mode:'everyday',onboarding:{status:'complete'}}:path.startsWith('/api/microbiome/samples')?(saved?[saved]:[]):saved&&path==='/api/microbiome/results/'+saved.id?{sample:saved,bacterial_composition:[],analyses:[]}:[];
 return route.fulfill({json});
});
const dir=new URL('../../docs/review/viome-native-pdf-20261105/',import.meta.url);if(capture)await mkdir(dir,{recursive:true});
async function screenshots(){for(const[width,dark]of[[320,false],[390,false],[390,true]]){await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:dark?'dark':'light'});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);await page.evaluate(()=>window.scrollTo(0,0));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(capture)await page.screenshot({path:new URL(`${before?'before':'after'}-${width}-${dark?'dark':'light'}.png`,dir).pathname});}}
try{
 await page.goto('http://127.0.0.1:5272/upload');
 await page.getByTestId('input-file').setInputFiles({name:VIOME_PDF_CANARY+'.pdf',mimeType:'application/pdf',buffer:Buffer.from(syntheticViomePdf('organisms'))});
 if(before){await page.getByText('Choose JSON or CSV format.',{exact:true}).waitFor();await screenshots();console.log('Captured native PDF rejection baseline.');}
 else{
  assert.equal((await page.locator('body').innerText()).includes(VIOME_PDF_CANARY),false);
  await page.getByRole('button',{name:'Review report',exact:true}).click();await page.getByRole('heading',{name:'Review your Viome report',exact:true}).waitFor();
  await page.getByText('0 provider assessments · 94 reported organisms · 0 quantified taxa',{exact:true}).waitFor();assert.equal(posts.length,0);assert.equal(await page.getByTestId('input-file').inputValue(),'');
  assert.equal(await page.getByRole('button',{name:'Save report',exact:true}).isDisabled(),true);
  await screenshots();
  await page.getByRole('button',{name:'Edit Syntheticus bacterium FIX-0',exact:true}).click();assert.equal(await page.getByRole('checkbox',{name:'I reviewed the biological rows and categories against my source. They contain no personal identifiers.',exact:true}).isDisabled(),true);await page.getByRole('textbox',{name:'Corrected biological label',exact:true}).fill('Syntheticus corrected FIX-0');await page.getByRole('button',{name:'Apply row correction',exact:true}).click();
  await page.getByText('Original biological label: Syntheticus bacterium FIX-0',{exact:true}).waitFor();
  await page.getByRole('checkbox',{name:'I reviewed the biological rows and categories against my source. They contain no personal identifiers.',exact:true}).check();await page.getByRole('button',{name:'Save report',exact:true}).click();
  await page.waitForURL(/\/microbiome\?sample=report_/);await page.reload();await page.getByRole('region',{name:'Imported report details',exact:true}).getByText('Syntheticus corrected FIX-0',{exact:true}).waitFor();assert.equal(posts.length,1);
  assert.equal(posts[0].report.organisms[0].name,'Syntheticus bacterium FIX-0');assert.equal(posts[0].report.organisms[0].correctedName,'Syntheticus corrected FIX-0');
  await page.goto('http://127.0.0.1:5272/upload');await page.getByTestId('input-file').setInputFiles({name:VIOME_PDF_CANARY+'.pdf',mimeType:'application/pdf',buffer:Buffer.from(syntheticViomePdf('recommendations'))});await page.getByRole('button',{name:'Review report',exact:true}).click();await page.getByRole('heading',{name:'Review your Viome report',exact:true}).waitFor();
  await page.getByText('22 provider assessments · 0 reported organisms · 0 quantified taxa · 299 provider food suggestions',{exact:true}).waitFor();
  await page.getByRole('combobox',{name:'Record type',exact:true}).selectOption('foods');await page.getByRole('searchbox',{name:'Search source rows',exact:true}).fill('Synthetic food 298');await page.getByRole('button',{name:'Edit Synthetic food 298',exact:true}).click();await page.getByRole('combobox',{name:'Corrected provider category',exact:true}).selectOption('Minimize');await page.getByRole('button',{name:'Apply row correction',exact:true}).click();await page.getByText('Original category: Avoid',{exact:true}).waitFor();
  assert.equal(posts.length,1);
  await page.goto('http://127.0.0.1:5272/upload');
  const partialPages=[{page:1,width:612,height:792,items:[{text:'Viome',x:30,y:20,width:40,height:10},{text:'My Active Gut Microbes',x:30,y:65,width:170,height:10},{text:'Syntheticus confirmed',x:30,y:120,width:140,height:10},{text:'Bacterium',x:30,y:135,width:60,height:10},{text:'Syntheticus uncertain',x:30,y:190,width:140,height:10}]}];
  await page.getByTestId('input-file').setInputFiles({name:'synthetic-partial.pdf',mimeType:'application/pdf',buffer:Buffer.from(syntheticViomePdf('organisms',partialPages))});await page.getByRole('button',{name:'Review report',exact:true}).click();await page.getByRole('group',{name:'Resolve uncertain extraction',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Save report',exact:true}).isDisabled(),true);assert.equal(await page.getByRole('checkbox',{name:'I reviewed the biological rows and categories against my source. They contain no personal identifiers.',exact:true}).isDisabled(),true);
  await page.getByRole('textbox',{name:'Biological label at uncertain position',exact:true}).fill('Syntheticus reviewed');await page.getByRole('combobox',{name:'Provider classification at uncertain position',exact:true}).selectOption('Bacteria');await page.getByRole('button',{name:'Resolve source position',exact:true}).click();assert.equal(await page.getByRole('group',{name:'Resolve uncertain extraction',exact:true}).count(),0);await page.getByText('0 provider assessments · 2 reported organisms · 0 quantified taxa',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Save report',exact:true}).isDisabled(),true);assert.equal(posts.length,1);
  await page.goto('http://127.0.0.1:5272/upload');await page.getByTestId('input-file').setInputFiles({name:'synthetic-rotated.pdf',mimeType:'application/pdf',buffer:Buffer.from(syntheticViomePdf('organisms',undefined,90))});await page.getByRole('button',{name:'Review report',exact:true}).click();await page.getByText('0 provider assessments · 94 reported organisms · 0 quantified taxa',{exact:true}).waitFor();assert.equal(await page.getByRole('group',{name:'Resolve uncertain extraction',exact:true}).count(),0);assert.equal(posts.length,1);await page.goto('http://127.0.0.1:5272/upload');
  const blank=new TextDecoder().decode(syntheticViomePdf('organisms')).replace(/BT[\s\S]*?ET/g,match=>' '.repeat(match.length));
  await page.getByTestId('input-file').setInputFiles({name:VIOME_PDF_CANARY+'.pdf',mimeType:'application/pdf',buffer:Buffer.from(blank)});await page.getByRole('button',{name:'Review report',exact:true}).click();await page.getByRole('alert').filter({hasText:'No readable text was found.'}).waitFor();assert.equal(await page.getByTestId('input-file').inputValue(),'');
  await page.getByTestId('input-file').setInputFiles({name:VIOME_PDF_CANARY+'.pdf',mimeType:'application/pdf',buffer:Buffer.from('not a PDF '+VIOME_PDF_CANARY)});await page.getByRole('button',{name:'Review report',exact:true}).click();await page.getByRole('alert').filter({hasText:'This PDF could not be read.'}).waitFor();assert.equal(posts.length,1);
  assert.equal((await page.locator('body').innerText()).includes(VIOME_PDF_CANARY),false);assert.equal(await page.evaluate(c=>JSON.stringify({...localStorage,...sessionStorage}).includes(c),VIOME_PDF_CANARY),false);assert.ok(!messages.some(m=>m.includes(VIOME_PDF_CANARY)));assert.deepEqual(errors,[]);
  assert.ok(outbound.every(url=>url.startsWith('https://fonts.')),'no document/external processor request');
  if(capture)await writeFile(new URL('results.json',dir),JSON.stringify({syntheticOnly:true,checks:['actual native PDF.js worker7and13pages','94organisms82/7/5','22qualitative/299foods','raw filename/header/metadata/hidden canary excluded from DOM/save/browser storage/console','review before any POST','biological correction preserves original/position','one minimized save and reload','food-category correction keeps original','320390lightdark reflow'],genuine7PageFidelity:'NOT_RUN',genuine13PageFidelity:'NOT_RUN',securityAudit:'NOT_GRANTED',physicalVoiceOver:'NOT_RUN'},null,2)+'\n');
  console.log('PASS actual App native PDF.js7/13page synthetic extraction,94organisms/22assessments/299foods, minimized biological preview/corrections, review-before-one-save/reload, position-only uncertain extraction blocks Save until manual resolution and fresh review; rotated page metadata; no raw/PII canary payload/storage/console/external processor. Mock API; genuine layouts and independent privacy/device acceptance remain open.');
 }
}finally{await browser.close();await vite.close();}
