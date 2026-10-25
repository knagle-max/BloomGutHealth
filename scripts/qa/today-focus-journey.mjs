import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const {createServer}=await import('vite');
const vite=await createServer({server:{host:'127.0.0.1',port:5188,strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:375,height:1000},timezoneId:'America/Regina'});await page.clock.install({time:new Date('2026-10-23T18:00:00Z')});
page.setDefaultTimeout(10000);
let scenario='session';const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/**',async route=>{const p=new URL(route.request().url()).pathname;let json=[];
if(p==='/api/auth/me')json={user:{id:'synthetic',username:'Today fixture'}};
else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
else if(p==='/api/biology/registry')json={entities:[],relationships:[],summary:'Synthetic registry',version:'synthetic'};
else if(p.startsWith('/api/biology/foods/'))json=null;
else if(p.startsWith('/api/biology/catalogue'))json={foods:[],totalFoods:0};
else if(p==='/api/products/search')json={products:[],warnings:['USDA Branded Foods is not configured.'],attribution:'Synthetic disabled source'};
else if(p==='/api/precision')json={goals:[{id:'muscle',mapping:'Protein distribution',actions:['Include familiar protein foods.'],sourceIds:['goal-protein']}],sources:[{id:'goal-protein',title:'Synthetic source reference',url:'https://example.com',limitation:'No personal dose established.'}],context:{},safetyBlocks:[]};
else if(p.startsWith('/api/experience/records')){if(scenario==='error')return route.fulfill({status:503,json:{error:'Synthetic unavailable'}});json=scenario==='session'?[{id:'s',kind:'session',payload:{title:'Evening ride',startsAt:'2026-10-23T21:00:00Z',status:'planned'}}]:[];}
else if(p.startsWith('/api/meals'))json=[{id:'m',mealText:'Synthetic lunch',loggedAt:'2026-10-23T17:00:00Z',totalCalories:scenario==='partial'?null:400,protein:20,carbs:40,fat:12,nutritionalData:scenario==='partial'?{}:{calories:400,protein:20,carbs:40,fat:12}}];
await route.fulfill({json});});
try{for(const state of ['session','goal','partial','error']){scenario=state;await page.goto('http://127.0.0.1:5188/');const focus=page.locator('.today-focus');await focus.waitFor();
if(state==='session')await focus.getByRole('link',{name:'Review session fuel'}).waitFor();
if(state==='goal')await focus.getByText(/saved focus: Protein distribution/).waitFor();
if(state==='partial')await focus.getByRole('link',{name:'Review my meal estimates'}).waitFor();
if(state==='error')await focus.getByText(/Training schedule unavailable/).waitFor();
await focus.getByText('Why this?').click();await focus.getByRole('link',{name:'Synthetic source reference'}).waitFor();
}
await page.goto('http://127.0.0.1:5188/explore');await page.getByRole('textbox',{name:'Find a food',exact:true}).fill('Kit Kat');await page.getByRole('link',{name:'Find a packaged food or enter its label'}).click();await page.getByRole('textbox',{name:'Product name / barcode'}).waitFor();assert.equal(await page.getByRole('textbox',{name:'Product name / barcode'}).inputValue(),'Kit Kat');await page.getByText('USDA Branded Foods is not configured.',{exact:true}).waitFor();
assert.deepEqual(errors,[]);console.log('PASS: synthetic session/goal/partial/unavailable Today states and evidence disclosure; Explore→product query handoff');}catch(e){console.error(errors);console.error((await page.locator('body').innerText()).slice(0,3500));throw e;}finally{await browser.close();await vite.close();}
