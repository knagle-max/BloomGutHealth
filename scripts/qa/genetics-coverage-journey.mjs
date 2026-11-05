import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {genotypeAnnotations} from '../../shared/genotype-explanations.ts';

// Synthetic saved-source fixture, actual App and interpretation projection.
const entries=genotypeAnnotations.map(a=>({rsid:a.rsid,gene:a.gene,genotype:a.alleles}));
entries.find(e=>e.rsid==='rs7903146').genotype='GT';
entries.find(e=>e.rsid==='rs1801133').genotype='TT';
const record={id:'synthetic-coverage',kind:'genetics',createdAt:'2026-10-01T12:00:00Z',payload:{provider:'manual',consent:true,source:'Synthetic coverage fixture',strand:'forward',collectedAt:'2026-10-01T12:00:00Z',entries}};
const report={...buildPrecisionReport([record],contextSchema.parse({}),defaultPreferences,null),records:[record],availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[]}};
const vite=await createServer({server:{host:'127.0.0.1',port:5264,strictPort:true}});
await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});
page.setDefaultTimeout(12000);
const errors=[],writes=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;
  if(req.method()!=='GET')writes.push(path);
  let json=[];
  if(path==='/api/auth/me')json={user:{id:'synthetic-coverage',username:'Synthetic coverage'}};
  else if(path==='/api/precision')json=report;
  else if(path==='/api/preferences')json=defaultPreferences;
  else if(path==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
  await route.fulfill({json});
});
try{
  await page.goto('http://127.0.0.1:5264/precision?tab=genetics');
  const section=page.locator('#genotype-explanations');
  await section.getByText('29 of 29 saved SNP explanations',{exact:true}).waitFor();
  const outside=section.getByRole('article',{name:'Explanation rs7903146',exact:true});
  await outside.getByText('CALL OUTSIDE THIS EXPLANATION',{exact:true}).waitFor();
  assert.match(await outside.innerText(),/coverage gap, not proof of an import error/);
  assert.equal(await outside.getByText('YOUR RESULT NEEDS VERIFICATION',{exact:true}).count(),0);
  assert.equal(await outside.getByTestId('genotype-next-step-rs7903146').count(),0);
  await outside.getByText('Compare the other genotypes',{exact:true}).click();
  assert.equal(await outside.getByText('Your result',{exact:true}).count(),0);
  const incompatible=section.getByRole('article',{name:'Explanation rs1801133',exact:true});
  assert.match(await incompatible.innerText(),/Check the source rsID, build, assay and orientation/);
  const search=section.getByRole('textbox',{name:'Find a gene or SNP',exact:true});
  await search.focus();await page.keyboard.type('rs7903146');
  await section.getByText('1 of 29 saved SNP explanations',{exact:true}).waitFor();
  assert.equal(await section.getByRole('article').count(),1);
  for(const width of [320,390,768,1280]){
    await page.setViewportSize({width,height:1000});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.emulateMedia({colorScheme:'dark'});await page.evaluate(()=>document.documentElement.classList.add('dark'));
  assert.match(await outside.innerText(),/coverage gap/);
  await page.reload();await section.getByText('29 of 29 saved SNP explanations',{exact:true}).waitFor();
  assert.match(await outside.innerText(),/coverage gap/);
  assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
  console.log('PASS actual App: 29 saved calls, valid unstudied versus incompatible calls, no unsupported action/matching, search/keyboard, 320–1280px/dark/reload, no source writes. Local synthetic evidence; no physical VoiceOver or independent science review claimed.');
}finally{await browser.close();await vite.close();}
