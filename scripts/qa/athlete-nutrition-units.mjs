import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const root=process.env.BLOOM_CAPTURE_ROOT||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const stage=process.env.BLOOM_CAPTURE_STAGE||'after';
const out=process.env.BLOOM_REVIEW_OUTPUT||path.join(root,'work/athlete-units-review');
const scratch=path.join(root,'work/athlete-units-browser');await fs.mkdir(scratch,{recursive:true});
const {build}=await import(path.join(root,'node_modules/esbuild/lib/main.js'));
const source=path.join(root,'client/src');
const entry=`import React from 'react';import {createRoot} from 'react-dom/client';import {QueryClientProvider} from '@tanstack/react-query';import {queryClient} from '${source}/lib/queryClient';import {AuthProvider} from '${source}/lib/auth';import {ExperienceProvider} from '${source}/lib/experience';import AthleteWorkspace from '${source}/pages/AthleteWorkspace';import '${source}/index.css';import '${source}/workspace.css';import '${source}/brand-tokens.css';import '${source}/brand.css';createRoot(document.getElementById('root')).render(<QueryClientProvider client={queryClient}><AuthProvider><ExperienceProvider><div className="app-shell athlete-mode min-h-screen bg-background"><AthleteWorkspace/></div></ExperienceProvider></AuthProvider></QueryClientProvider>);`;
await fs.writeFile(path.join(scratch,'entry.tsx'),entry);
// This isolated screen harness never requests the lazy camera decoder. Full production bundling remains a separate required check.
await build({absWorkingDir:root,entryPoints:[path.join(scratch,'entry.tsx')],bundle:true,jsx:'automatic',platform:'browser',format:'esm',outfile:path.join(scratch,'app.js'),alias:{'@':source,'@shared':path.join(root,'shared')},external:['@zxing/browser','@zxing/library']});
const postcss=require(path.join(root,'node_modules/postcss')),tailwind=require(path.join(root,'node_modules/tailwindcss')),autoprefixer=require(path.join(root,'node_modules/autoprefixer'));
const css=path.join(scratch,'app.css');await fs.writeFile(css,(await postcss([tailwind({config:path.join(root,'tailwind.config.ts')}),autoprefixer]).process(await fs.readFile(css,'utf8'),{from:css})).css);
await fs.writeFile(path.join(scratch,'index.html'),'<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');

const server=createServer(async(req,res)=>{try{let file=!path.extname(req.url)?'index.html':req.url.slice(1);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(await fs.readFile(path.join(scratch,file)));}catch{res.statusCode=404;res.end();}});await new Promise(r=>server.listen(5190,'127.0.0.1',r));
const browser=await chromium.launch({...(process.env.BLOOM_CHROMIUM_EXECUTABLE?{executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox'],headless:true});
const page=await browser.newPage({viewport:{width:390,height:1000},locale:'en-CA',timezoneId:'America/Regina'});const errors=[],writes=[];let metric=false,unknown=false;
page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());await page.clock.install({time:new Date('2026-10-23T18:00:00Z')});
const recipe={id:'synthetic-oats',name:'Synthetic oats',ingredients:[{name:'Synthetic oats',grams:100}]};
const day={minutes:60,recordedLoad:0,loadEntries:0,targets:{carbohydratesG:[300,450],proteinG:120,energyKcal:2500},notices:[],consumed:{calories:500,carbs:60,protein:20},remaining:{proteinG:100,carbohydratesG:[240,390]},methodology:'Synthetic fixture, not a measured personal requirement.',fueling:[],mealChoices:{note:'Synthetic meal option for display testing.',choices:[{recipe,portion:1.5,nutrients:{calories:500,carbohydrates_total_g:60,protein_g:20},prep:{minutes:10,shopping:[{name:'Synthetic oats',grams:100,estimated:false}],instructions:['Prepare the synthetic fixture.'],note:'Source recipe instructions remain unchanged.'},contributions:[]}]},hydration:[{id:'synthetic-sweat',valid:true,litresHour:0.5,litres:1,sodiumLossMgHour:500,note:'Synthetic sweat estimate; not a replacement dose.'},{id:'synthetic-invalid',valid:false,litresHour:null,litres:null,sodiumLossMgHour:null,note:'Invalid estimate stays unavailable.'}]};
await page.route('**/api/**',async route=>{const req=route.request(),p=new URL(req.url()).pathname;let json;
if(req.method()!=='GET')writes.push({path:p,body:req.postDataJSON()});
if(p==='/api/auth/me')json={user:{id:'synthetic-athlete',username:'Synthetic Athlete'}};
else if(p==='/api/experience/settings')json={mode:'athlete',athlete:{sport:'Synthetic cycling',adult:true,pregnancyNo:true,healthReviewed:true,targetsConfirmed:true,energyKcal:2500},displayUnits:metric?{energy:'kcal',foodWeight:'g',hydration:'L',bodyWeight:'kg'}:{energy:'kJ',foodWeight:'oz',hydration:'US-fl-oz',bodyWeight:'lb'}};
else if(p==='/api/experience/athlete-day'){json=structuredClone(day);if(unknown){json.consumed.calories=null;json.mealChoices.choices[0].nutrients.calories=null;json.targets.energyKcal=null;}}
else if(p.startsWith('/api/experience/records'))json=[];
else return route.fulfill({status:503,json:{error:'Not used by athlete fixture'}});
await route.fulfill({json});});
try{
await fs.mkdir(out,{recursive:true});
for(const width of [390,1440])for(const theme of ['light','dark'])for(const section of ['overview','fueling']){
await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:theme});await page.goto('http://127.0.0.1:5190/athlete/'+section);await page.waitForLoadState('networkidle');await page.evaluate(t=>{document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.dataset.experience='athlete';},theme);
await page.getByRole('heading',{name:section==='overview'?'Your training day':'Fueling & hydration',exact:true}).waitFor();
if(section==='fueling')await page.locator('details').filter({has:page.locator('summary').filter({hasText:'Ingredients, preparation & target contributions'})}).evaluateAll(ds=>ds.forEach(d=>d.open=true));
const text=await page.locator('main').innerText();
if(stage==='after'){if(section==='overview'){assert.ok(text.includes('10460'));assert.ok(text.includes('kJ/day'));}else{assert.ok(text.includes('Known intake: 2092 kJ'));assert.ok(text.includes('5.29 oz Synthetic oats'));assert.ok(text.includes('16.91 US-fl-oz/hour · 33.81 US-fl-oz'));assert.ok(text.includes('Measurements need review'));const link=await page.getByRole('link',{name:'Review & log this training meal',exact:true}).getAttribute('href');assert.equal(new URL(link,'http://fixture').searchParams.get('description'),'150 g Synthetic oats');}}
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
// Routine unit-display changes use assertions and code evidence, per the visual-evidence clarification.
}
if(stage==='after'){
unknown=true;await page.reload();await page.waitForLoadState('networkidle');let text=await page.locator('main').innerText();assert.ok(text.includes('Known intake: Unavailable kJ'));assert.equal(text.includes('NaN'),false);unknown=false;metric=true;await page.reload();await page.waitForLoadState('networkidle');text=await page.locator('main').innerText();assert.ok(text.includes('Known intake: 500 kcal'));assert.ok(text.includes('0.5 L/hour · 1 L'));await page.locator('details').filter({has:page.locator('summary').filter({hasText:'Ingredients, preparation & target contributions'})}).evaluateAll(ds=>ds.forEach(d=>d.open=true));await page.getByText('150 g Synthetic oats',{exact:false}).waitFor();}
assert.deepEqual(errors,[]);
await fs.writeFile(path.join(out,stage+'-results.json'),JSON.stringify({stage,source:{sha:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim()},synthetic:true,widths:[390,1440],themes:['light','dark'],errors,writes},null,2));
console.log(stage+': athlete unit display, canonical review links, null handling and reflow checks passed');
}finally{await browser.close();server.close();}
