import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const {createServer}=await import('vite');
const vite=await createServer({server:{host:'127.0.0.1',port:5188,strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:375,height:1000},timezoneId:'America/Regina'});await page.clock.install({time:new Date('2026-10-23T18:00:00Z')});
let scenario='session';const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/**',async route=>{const p=new URL(route.request().url()).pathname;let json=[];
if(p==='/api/auth/me')json={user:{id:'synthetic',username:'Today fixture'}};
else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
else if(p==='/api/precision')json={goals:[{id:'muscle',mapping:'Protein distribution',actions:['Include familiar protein foods.'],sourceIds:['goal-protein']}],sources:[{id:'goal-protein',title:'Synthetic source reference',url:'https://example.com',limitation:'No personal dose established.'}],context:{},safetyBlocks:[]};
else if(p.startsWith('/api/experience/records')){if(scenario==='error')return route.fulfill({status:503,json:{error:'Synthetic unavailable'}});json=scenario==='session'?[{id:'s',kind:'session',payload:{title:'Evening ride',startsAt:'2026-10-23T21:00:00Z',status:'planned'}}]:[];}
else if(p.startsWith('/api/meals'))json=[{id:'m',mealText:'Synthetic lunch',loggedAt:'2026-10-23T17:00:00Z',totalCalories:scenario==='partial'?null:400,protein:20,carbs:40,fat:12,nutritionalData:scenario==='partial'?{}:{calories:400,protein:20,carbs:40,fat:12}}];
await route.fulfill({json});});
try{for(const state of ['session','goal','partial','error']){scenario=state;await page.goto('http://127.0.0.1:5188/');const focus=page.locator('.today-focus');await focus.waitFor();
if(state==='session')await focus.getByRole('link',{name:'Review my session fueling plan'}).waitFor();
if(state==='goal')await focus.getByText(/saved focus: Protein distribution/).waitFor();
if(state==='partial')await focus.getByRole('link',{name:'Review my meal estimates'}).waitFor();
if(state==='error')await focus.getByText(/Training schedule unavailable/).waitFor();
await focus.getByText('Your focus & next steps').click();await focus.getByRole('link',{name:'Synthetic source reference'}).waitFor();
}assert.deepEqual(errors,[]);console.log('PASS: synthetic session/goal/partial/unavailable Today states and evidence disclosure');}finally{await browser.close();await vite.close();}
