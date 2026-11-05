import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const before=process.argv.includes('--before');
const report={...buildPrecisionReport([],contextSchema.parse({}),defaultPreferences,null),records:[],availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[]}};
const vite=await createServer({server:{host:'127.0.0.1',port:5265,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);
const errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;let json=[];
 if(req.method()!=='GET')writes.push(path);
 if(path==='/api/auth/me')json={user:{id:'synthetic-no-dna',username:'Synthetic no-DNA review'}};
 else if(path==='/api/precision')json=report;
 else if(path==='/api/preferences')json=defaultPreferences;
 else if(path==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 await route.fulfill({json});});
const dir=new URL('../../docs/review/genetics-catalogue-20261105/',import.meta.url);await mkdir(dir,{recursive:true});
try{
 await page.goto('http://127.0.0.1:5265/precision?tab=genetics');
 await page.getByRole('heading',{name:'Import 23andMe raw data',exact:true}).waitFor();
 if(!before){
  const section=page.getByRole('region',{name:'Explore genetics',exact:true});
  const domain=section.getByRole('combobox',{name:'Scientific domain',exact:true});
  assert.equal(await domain.locator('option').count(),18);
  const search=section.getByRole('searchbox',{name:'Search catalogue',exact:true});
  await section.getByRole('button',{name:'Show all 53 entries (8 shown)',exact:true}).click();
  await search.fill('rs4680');await section.getByText('1 result',{exact:true}).waitFor();
  await section.getByText('COMT · rs4680',{exact:true}).click();
  await section.getByText('Evidence review pending. No genotype interpretation, health prediction or personal recommendation is available for this entry.',{exact:true}).waitFor();
  assert.match(await section.innerText(),/No saved call/);
  await search.fill('NAT2');await section.getByText('NAT2 acetylator haplotype',{exact:true}).click();
  await section.getByText('Assay, sources & limitations',{exact:true}).click();
  assert.match(await section.innerText(),/phase-aware/);
  await search.fill('');
  for(const value of await domain.locator('option').evaluateAll(options=>options.map(o=>o.value))){
   await domain.selectOption(value);
   assert.ok(await section.getByRole('status').count());
  }
  await domain.selectOption('bone');await section.getByText('No sourced entries in this domain yet.',{exact:true}).waitFor();
  await domain.selectOption('all');await search.fill('nothing-matches');
  await section.getByText('No matching entries. Try another gene, rsID or domain.',{exact:true}).waitFor();
  await search.fill('');await domain.focus();await page.keyboard.press('Tab');
  assert.equal(await search.evaluate(el=>el===document.activeElement),true);
 }
 for(const [width,dark] of [[320,false],[390,false],[390,true]]){
  await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:dark?'dark':'light'});
  await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:new URL(`${before?'before':'after'}-${width}-${dark?'dark':'light'}.png`,dir).pathname});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 if(!before){
  await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.reload();await page.getByRole('region',{name:'Explore genetics',exact:true}).waitFor();
 }
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 console.log(before?'Captured matched no-DNA baseline at 3a4fc93.':'PASS actual App: no-DNA catalogue, 17 domains/search/empty states, named SNV and complex pending candidates, no personal claims or writes, keyboard, 320/390/dark/200%/reload.');
}finally{await browser.close();await vite.close();}
