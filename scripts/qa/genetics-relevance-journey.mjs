import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {selectGeneticHighlights} from '../../shared/genetics-relevance.ts';
const before=process.argv.includes('--before');
const record={id:'synthetic-relevance-source',kind:'genetics',createdAt:'2026-11-01T12:00:00Z',payload:{provider:'manual',consent:true,source:'Synthetic source for UI review',strand:'forward',collectedAt:'2026-11-01T12:00:00Z',entries:[{rsid:'rs1801133',gene:'MTHFR',genotype:'AG'},{rsid:'rs7903146',gene:'TCF7L2',genotype:'GT'},{rsid:'rs174547',gene:'FADS1',genotype:'--'}]}};
let records=[record],syntheticProjection=null;
const report=()=>{const built=buildPrecisionReport(records,contextSchema.parse({}),defaultPreferences,null);return{...built,genetics:{...built.genetics,...(syntheticProjection?{personalHighlights:syntheticProjection}:{})},records,availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[]}};};
const vite=await createServer({server:{host:'127.0.0.1',port:5271,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);
const errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const request=route.request(),path=new URL(request.url()).pathname;let json=[];
 if(request.method()!=='GET')writes.push(path);
 if(path==='/api/auth/me')json={user:{id:'synthetic-relevance-owner',username:'Synthetic genetics review'}};
 else if(path==='/api/precision')json=report();
 else if(path==='/api/preferences')json=defaultPreferences;
 else if(path==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 await route.fulfill({json});});
const dir=new URL('../../docs/review/genetics-relevance-20261105/',import.meta.url);await mkdir(dir,{recursive:true});
try{
 await page.goto('http://127.0.0.1:5271/precision?tab=genetics');await page.getByRole('heading',{name:'Import 23andMe raw data',exact:true}).waitFor();
 for(const[width,dark]of[[320,false],[390,false],[390,true]]){
  await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:dark?'dark':'light'});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:new URL(`${before?'before':'after'}-${width}-${dark?'dark':'light'}.png`,dir).pathname});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 if(!before){
  const region=page.getByRole('region',{name:'Relevant findings for you',exact:true});
  await region.getByText('No eligible personal highlights yet.',{exact:true}).waitFor();
  assert.match(await region.innerText(),/2 measured calls/);await region.getByText('How highlights are selected',{exact:true}).click();assert.match(await region.innerText(),/1 matched educational explanation/);
  assert.match(await region.innerText(),/0 reviewed highlight claims/);assert.match(await region.innerText(),/0 personally eligible/);
  await region.getByRole('link',{name:'See all saved results',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='genotype-explanations');
  await page.getByRole('article',{name:'Explanation rs7903146',exact:true}).getByText(/coverage gap/).first().waitFor();
  await region.getByRole('link',{name:'Explore genes',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='genetics-catalogue');
  assert.equal(await page.getByRole('combobox',{name:'Scientific domain',exact:true}).locator('option').count(),18);
  assert.match(await region.innerText(),/Evidence credibility/);
  await region.getByRole('link',{name:'Explore genes',exact:true}).focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.tagName),'SUMMARY');
  await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  records=[];await page.reload();await region.getByText('No genetic source is selected.',{exact:true}).waitFor();assert.match(await region.innerText(),/0 measured calls/);assert.equal(await page.getByRole('article',{name:'Explanation rs1801133',exact:true}).count(),0);
  // Explicit synthetic API fixture for future approved-card presentation only.
  // These are not real scientific reviews, production claims or assay proofs.
  const claims=Array.from({length:7},(_,i)=>({id:`synthetic-ui-${i}`,version:'synthetic-only',rsid:`rs${100000+i}`,gene:`SYNTHETIC ${i}`,phenotype:'Synthetic educational fixture',meaning:'Synthetic display check; no real biological claim.',scope:'education',review:{state:'approved',reference:'synthetic-not-real-review',reviewedOn:'2026-11-05'},placement:{build:'GRCh37',chromosome:'1',position:i+1,strand:'+'},genotypes:['AG'],assays:['synthetic-assay'],contrast:{effectAllele:'A',otherAllele:'G',orientation:'forward'},population:{description:'Synthetic test population',transportability:'reviewed-general',allowedFitIds:[]},evidence:{credibility:'supported',design:'Synthetic fixture',direction:'Synthetic direction',effectSize:null,confidenceInterval:null,replication:'Synthetic only',contradictions:'Synthetic only',limitations:'Not approved science.',citations:[{title:'Synthetic source',url:'https://example.invalid/synthetic'}]},independence:{group:`synthetic-${i}`,status:'unknown',reference:null},relevance:{goals:i===6?['training']:[],measuredContexts:[]}}));
  records=[record];syntheticProjection=selectGeneticHighlights({claims,registryVersion:'synthetic-ui-only',source:{id:record.id,revision:'synthetic-only',consent:true,calls:claims.map(c=>({rsid:c.rsid,genotype:'AG',build:'GRCh37',chromosome:'1',position:c.placement.position,strand:'+',assay:'synthetic-assay',assayVerified:true,normalizationVerified:true,populationFitId:null}))},context:{goals:['training'],measuredContexts:[]},catalogued:55,matchedEducation:1});
  await page.reload();await region.getByText('Showing 5 of 7 eligible educational claims. Related findings may be grouped.',{exact:true}).waitFor();
  assert.equal(await region.getByRole('article').count(),5);assert.match(await region.getByRole('article').first().innerText(),/SYNTHETIC 6/);
  await region.getByRole('article').first().getByText('Why this is shown',{exact:true}).click();assert.match(await region.getByRole('article').first().innerText(),/goal you recorded/);
  await region.getByRole('article').first().getByText('Evidence, source & limitations',{exact:true}).click();assert.match(await region.getByRole('article').first().innerText(),/Effect size: Unknown/);
  assert.equal(await region.getByRole('article').first().getByRole('link',{name:'Synthetic source'}).getAttribute('referrerpolicy'),'no-referrer');
  await region.getByRole('button',{name:'See all eligible findings',exact:true}).click();assert.equal(await region.getByRole('article').count(),7);
  await region.getByRole('combobox',{name:'Sort eligible findings',exact:true}).selectOption('gene');assert.match(await region.getByRole('article').first().innerText(),/SYNTHETIC 0/);
  await region.getByRole('combobox',{name:'Sort eligible findings',exact:true}).selectOption('relevance');assert.match(await region.getByRole('article').first().innerText(),/SYNTHETIC 6/);
  syntheticProjection=null;records=[];await page.reload();await region.getByText('No genetic source is selected.',{exact:true}).waitFor();assert.equal(await region.getByRole('article').count(),0);
  assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
  await writeFile(new URL('results.json',dir),JSON.stringify({synthetic:true,checks:['actual App source and no-source states','separate measured/matched/reviewed/eligible counts','unsupported reference call retained, not highlighted','all source results and 17-domain explorer keyboard links','320/390px light-dark reflow','200% desktop zoom surrogate','source withdrawal reload','synthetic API-only seven-eligible/five-highlight presentation, why/source/unknown values, show all/sorts and withdrawal','no writes, no page errors'],physicalVoiceOver:'NOT_RUN',independentReview:'NOT_RUN'},null,2)+'\n');
 }
 console.log(before?'Captured matched source baseline.':'PASS actual App: source/unknown/no-source, separate counts, no invented highlights, preserved source explanation/explorer, focused anchor links, keyboard/320/390/dark/200%, reload withdrawal, no writes/errors.');
}finally{await browser.close();await vite.close();}
