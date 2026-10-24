import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createServer} from 'vite';
import {experienceSettingsSchema} from '../../shared/experience.ts';
import {reportedAbundanceAnalysis,historicalAnalysisMetadata} from '../../server/analysis-boundary.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'docs/review/reported-cohort-20261024');await mkdir(out,{recursive:true});
const baseline=execFileSync('git',['show','67cce8f:client/src/pages/Microbiome.tsx'],{cwd:root,encoding:'utf8'});
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
let browser;
const errors=[],writes=[];let outage=false;
const sample={id:'synthetic-source',userId:'synthetic',testDate:'2026-10-01T12:00:00Z',testingCompany:'Synthetic source report',processingStatus:'completed',diversityIndex:0,notes:'Synthetic report only',structuredData:{bacteria_percentages:{Roseburia:0,'Reported taxon':25}}};
const analysis=reportedAbundanceAnalysis(sample.id,sample.structuredData.bacteria_percentages);
const result={sample,bacterial_composition:analysis.bacterial_composition.map((row,index)=>({id:'taxon-'+index,bacterialName:row.bacterial_name,abundance:row.abundance,taxonomyLevel:row.taxonomy_level,genomeData:null})),metabolites:[],recommendations:[],analyses:historicalAnalysisMetadata([{id:'summary',sampleId:sample.id,analysisType:'reported-composition',modelVersion:analysis.model_version,createdAt:sample.testDate}]),interpretationStatus:'unvalidated_model_outputs_withheld'};
try{
 for(const before of [true,false]){
  const vite=await createServer({configFile:path.join(root,'vite.config.ts'),plugins:before?[{name:'historical-cohort-view-only',enforce:'pre',load(id){if(id===path.join(root,'client/src/pages/Microbiome.tsx'))return baseline;}}]:[],server:{port:5202,host:'127.0.0.1',strictPort:true}});await vite.listen();
  browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox','--single-process','--no-zygote']});
  const page=await browser.newPage({viewport:{width:375,height:900},timezoneId:'America/Regina'});page.setDefaultTimeout(12000);page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://fonts.**/**',route=>route.abort());
  await page.route('**/api/**',async route=>{
   const request=route.request(),p=new URL(request.url()).pathname;if(request.method()!=='GET'){writes.push(p);return route.fulfill({status:403,json:{error:'No unsupported action in this synthetic review'}});}
   let json=[];
   if(p==='/api/auth/me')json={user:{id:'synthetic',username:'Synthetic reviewer'}};
   else if(p==='/api/experience/settings')json=experienceSettingsSchema.parse({});
   else if(p==='/api/capabilities')json={eligible:false,experimentalEnabled:false};
   else if(p.startsWith('/api/microbiome/samples/'))json=[sample];
   else if(p.startsWith('/api/microbiome/results/')){if(outage)return route.fulfill({status:503,json:{error:'Synthetic result outage'}});json=result;}
   await route.fulfill({json});
  });
  try{
   await page.goto('http://127.0.0.1:5202/microbiome');await page.getByRole('heading',{name:'Selected report',exact:true}).waitFor();
   if(!before){await page.getByText('Unsupported historical molecule estimates and recommendations are withheld.',{exact:false}).waitFor();assert.equal(await page.getByText(/Stored molecule estimates:/).count(),0);await page.getByText('Descriptive summary of supplied relative abundance; no biological prediction.',{exact:false}).waitFor();}
   const nav=page.getByRole('navigation',{name:'Microbiome sections'});await nav.getByRole('button',{name:'Cohorts',exact:true}).click();
   if(before){await page.getByText('Original experimental cohort comparison',{exact:true}).click();await page.getByRole('button',{name:'Run experimental report model',exact:true}).waitFor();}
   else{await page.getByRole('heading',{name:'Research populations',exact:true}).waitFor();assert.equal(await page.getByText('Original experimental cohort comparison',{exact:true}).count(),0);assert.equal(await page.getByRole('checkbox').count(),0);assert.equal(await page.getByRole('button',{name:'Run experimental report model',exact:true}).count(),0);assert.ok(await page.getByRole('link',{name:'Primary study',exact:true}).count()>0);}
   await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});await page.screenshot({path:path.join(out,before?'before-mobile.png':'after-mobile.png'),fullPage:true});
   if(!before){
    const swatch=await nav.getByRole('button',{name:'Cohorts',exact:true}).evaluate(node=>({color:getComputedStyle(node).color,background:getComputedStyle(node).backgroundColor}));console.log('Selected cohort navigation colors',swatch);
    await page.getByRole('heading',{name:'Research populations',exact:true}).evaluate(node=>{node.style.outline='2px solid #bd843b';node.textContent='1 · '+node.textContent;});await page.getByText('General research summaries. Personal cohort comparisons are unavailable without validated reference data.',{exact:true}).evaluate(node=>{node.style.outline='2px solid #bd843b';node.textContent='2 · '+node.textContent;});await page.screenshot({path:path.join(out,'after-mobile-annotated.png'),fullPage:true});
    for(const width of [320,375,390,1280]){await page.setViewportSize({width,height:width===320?500:900});for(const dark of [false,true]){await page.evaluate(value=>document.documentElement.classList.toggle('dark',value),dark);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Reflow ${width}/${dark}`);}}
    await nav.getByRole('button',{name:'Bacteria',exact:true}).click();const row=page.getByRole('row').filter({hasText:'Roseburia'});await row.waitFor();assert.match(await row.innerText(),/0\.00%/);
    await nav.getByRole('button',{name:'Cohorts',exact:true}).click();const study=page.getByRole('link',{name:'Primary study',exact:true}).last();await study.focus();assert.equal(await study.evaluate(node=>node===document.activeElement),true);
    outage=true;await page.reload();await page.getByRole('alert').filter({hasText:'Results could not load.'}).waitFor();outage=false;await page.getByRole('button',{name:'Retry',exact:true}).click();await page.getByRole('heading',{name:'Selected report',exact:true}).waitFor();
   }
  }finally{await page.close().catch(()=>{});await browser.close().catch(()=>{});await vite.close();}
 }
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 await writeFile(path.join(out,'results.json'),JSON.stringify({synthetic:true,baseline:'67cce8f actual Microbiome source with unchanged shared runtime',checks:['Unsupported cohort chooser/execution absent','Real study links retained','Withheld history distinct from empty records','Original zero abundance retained','320/375/390/1280 light/dark/zoom reflow','Keyboard study link and result outage/retry'],providerCalls:0,writes,errors},null,2));
 console.log('PASS: real rendered synthetic source cohort/zero/withholding/reflow/keyboard/outage journey; no model or writes');
}finally{await browser?.close().catch(()=>{});}
