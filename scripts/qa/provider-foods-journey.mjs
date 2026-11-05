import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {execFileSync} from 'node:child_process';
import {parseStructuredReport} from '../../shared/structured-report.ts';
const before=process.argv.includes('--before');
if(before){assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),'50ebea94de93723bdeb230fdd7efc371929c10a8');execFileSync('git',['diff','--quiet']);}
// Deliberately synthetic labels/counts, NOT the missing original Viome fixture.
const fixture={testing_company:'Synthetic provider',data_origin:'Synthetic qualitative software fixture; not an original Viome report',scores:Array.from({length:22},(_,i)=>({name:`Synthetic assessment ${i+1}`,status:i<15?'Improve':i<19?'Attention':'Maintain'})),foods:Array.from({length:299},(_,i)=>({name:`Synthetic food ${String(i+1).padStart(3,'0')}`,reportedCategory:i<240?'Enjoy':i<268?'Superfood':i<290?'Minimize':'Avoid',sourcePage:8+Math.floor(i/60),sourceColumn:1+i%3}))};
const vite=await createServer({server:{host:'127.0.0.1',port:5266,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);
const errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));
let actor='synthetic-foods',withdrawn=false;
const saved={id:'synthetic-food-report',userId:'synthetic-foods',testDate:'2026-10-01',processingStatus:'completed',structuredData:JSON.parse(JSON.stringify(parseStructuredReport(fixture)))};
await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',route=>{const req=route.request(),p=new URL(req.url()).pathname;if(req.method()!=='GET')writes.push(p);
 if(p.startsWith('/api/microbiome/results/')&&withdrawn)return route.fulfill({status:403,json:{error:'Synthetic unavailable source'}});
 const json=p==='/api/auth/me'?{user:{id:actor,username:'Synthetic foods'}}:p==='/api/experience/settings'?{mode:'everyday',onboarding:{status:'complete'}}:(p==='/api/microbiome/samples'||p==='/api/microbiome/samples/'+actor)?(actor==='synthetic-foods'?[saved]:[]):p==='/api/microbiome/results/synthetic-food-report'?{sample:saved,bacterial_composition:[],analyses:[]}:[];
 return route.fulfill({json});});
const dir=new URL('../../docs/review/provider-foods-20261105/',import.meta.url);await mkdir(dir,{recursive:true});
try{
 await page.goto('http://127.0.0.1:5266/upload');await page.getByRole('button',{name:'Paste JSON data',exact:true}).click();
 await page.getByLabel('Paste Your Data',{exact:true}).fill(JSON.stringify(fixture));
 await page.getByRole('button',{name:'Review report',exact:true}).click();
 await page.getByRole('heading',{name:'Review report before saving',exact:true}).waitFor();
 await page.getByText('Recognized data & missing measurements',{exact:true}).click();
 const report=page.getByRole('region',{name:'Imported report details',exact:true});
 const search=report.locator('input');await search.fill('Synthetic food');
 if(!before){
  const foods=report.getByRole('region',{name:'Provider food suggestions',exact:true});
  await foods.getByText('10 shown of 299 matching rows · 299 total source rows',{exact:true}).waitFor();
  await foods.getByRole('button',{name:'Show all 299 matching food rows',exact:true}).click();
  assert.equal(await foods.getByRole('listitem').count(),299);
  const category=foods.getByRole('combobox',{name:'Provider food category',exact:true});
  for(const [label,n]of [['Enjoy',240],['Superfood',28],['Minimize',22],['Avoid',9]]){await category.selectOption(`category:${label}`);assert.equal(await foods.getByRole('listitem').count(),Math.min(10,n));}
  await category.selectOption('category:Avoid');await foods.getByText('Synthetic food 299',{exact:true}).waitFor();
  await foods.getByText('Source details',{exact:true}).first().click();assert.match(await foods.innerText(),/page 12/);
  await category.selectOption('all');await search.fill('  Synthetic food 001 ');assert.equal(await foods.getByRole('listitem').count(),1);
  await search.fill('No matching canary');await report.getByText('No matching organism, assessment or food in this report.',{exact:true}).waitFor();
  await search.fill('Synthetic food');
 }
 for(const[width,dark]of[[320,false],[390,false],[390,true]]){
  await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:dark?'dark':'light'});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);
  await report.evaluate(el=>el.scrollIntoView({block:'start'}));await page.screenshot({path:new URL(`${before?'before':'after'}-${width}-${dark?'dark':'light'}.png`,dir).pathname});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 if(!before){
  await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await search.fill('');await report.getByRole('heading',{name:'Provider assessments',exact:true}).waitFor();assert.equal(await report.getByText('Unavailable',{exact:true}).count(),0,'A qualitative category is displayed rather than a missing numerical value');
  await page.goto('http://127.0.0.1:5266/microbiome?sample=synthetic-food-report');
  await report.getByRole('region',{name:'Provider food suggestions',exact:true}).getByText('10 shown of 299 matching rows · 299 total source rows',{exact:true}).waitFor();
  await report.locator('input').fill('Synthetic food 299');await report.getByText('Synthetic food 299',{exact:true}).waitFor();
  await page.reload();await report.getByRole('region',{name:'Provider food suggestions',exact:true}).getByText('10 shown of 299 matching rows · 299 total source rows',{exact:true}).waitFor();
  const originalFoods=saved.structuredData.foods;delete saved.structuredData.foods;
  await page.reload();await report.getByRole('region',{name:'Provider food suggestions',exact:true}).getByText('10 shown of 299 matching rows · 299 total source rows',{exact:true}).waitFor();
  saved.structuredData.foods=[];await page.reload();await report.getByRole('heading',{name:'What your provider reported',exact:true}).waitFor();assert.equal(await report.getByRole('region',{name:'Provider food suggestions',exact:true}).count(),0,'Canonical empty does not resurrect original food rows');
  saved.structuredData.foods=originalFoods;
  withdrawn=true;await page.reload();await page.getByRole('alert').filter({hasText:'Results could not load.'}).waitFor();assert.equal(await report.count(),0,'Denied source does not retain food results');
  actor='synthetic-other';withdrawn=false;await page.reload();await page.getByRole('heading',{name:'No gut report saved',exact:true}).waitFor();assert.equal(await report.count(),0,'Another source owner sees none of the prior findings');
 }
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 console.log(before?'Captured baseline50ebea9: source foods preserved in JSON but not browsable.':'PASS actual App: synthetic22 categorical assessments/299 foods, 240/28/22/9 groups, exact names/provenance/search/filter/Show all/unknown state, saved-source projection/reload/denial/other-owner, no numeric invention or writes, 320/390/dark/200%. Not original PDF or native extraction evidence.');
}finally{await browser.close();await vite.close();}
