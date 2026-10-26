import {execFileSync} from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
const baseline=process.env.BLOOM_TODAY_CLOCK_BASELINE;
const originals=new Set(['client/src/pages/Dashboard.tsx','client/src/components/TodayFocus.tsx'].map(file=>path.resolve(file)));
const vite=await createServer({plugins:baseline?[{name:'today-clock-baseline',enforce:'pre',load(id){const file=id.split('?')[0];if(originals.has(file))return execFileSync('git',['show',baseline+':'+path.relative(process.cwd(),file)],{encoding:'utf8'});}}]:[],server:{host:'127.0.0.1',port:5243,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000},timezoneId:'America/Regina',locale:'en-CA'});page.setDefaultTimeout(12000);
await page.clock.install({time:new Date('2026-10-24T05:59:50Z')});
let phase='old',held;let mealReads=0;const errors=[];
const meal=(id,text,time,energy)=>({id,mealText:text,mealType:'meal',loggedAt:time,totalCalories:energy,totalProtein:20,nutritionalData:{calories:energy,protein:20,carbs:40,fat:12}});
const yesterday=meal('old','Late supper','2026-10-24T05:55:00Z',400),today=meal('new','New-day breakfast','2026-10-24T06:00:01Z',500),resumed=meal('resumed','Resumed-day lunch','2026-10-25T07:00:00Z',600);
const rows=()=>phase==='old'?[yesterday]:phase==='resumed'?[yesterday,today,resumed]:[yesterday,today];
page.on('pageerror',error=>errors.push(error.message));
await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const path=new URL(route.request().url()).pathname;let json=[];
 if(path==='/api/auth/me')json={user:{id:'clock-qa',username:'Synthetic clock'}};
 else if(path==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(path==='/api/precision')json={goals:[],sources:[],context:{},safetyBlocks:[]};
 else if(path.startsWith('/api/experience/records'))json=[{id:'night-session',kind:'session',payload:{title:'Short night ride',startsAt:'2026-10-24T06:00:30Z',status:'planned'}}];
 else if(path.startsWith('/api/meals')){mealReads++;if(phase==='hold'){held=route;return;}if(phase==='error')return route.fulfill({status:503,json:{error:'Synthetic journal outage'}});json=rows();}
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5243/');
 await page.getByRole('heading',{name:'Late supper',exact:true}).waitFor();
 assert.match(await page.locator('.date-pill').innerText(),/October 23/);
 const initialReads=mealReads;
 await page.waitForLoadState('networkidle');
 if(baseline){phase='new';await page.clock.runFor(20000);assert.match(await page.locator('.date-pill').innerText(),/October 23/);assert.equal(mealReads,initialReads);console.log('RED reproduced: old Today keeps the prior calendar date and cached source after midnight.');}
 else{
 phase='hold';await page.clock.runFor(20000);
 await page.locator('.today-focus').getByText('Your journal is loading. You can still add a meal.',{exact:true}).waitFor();
 assert.match(await page.locator('.date-pill').innerText(),/October 24/);
 assert.equal(await page.locator('.daily-card .stat-value').count(),0,'Previously loaded totals are not presented as current while the new day is checked');
 assert.ok(held);assert.equal(mealReads,initialReads+1);
 phase='new';await held.fulfill({json:rows()});
 await page.getByRole('heading',{name:'New-day breakfast',exact:true}).waitFor();
 assert.equal(await page.getByRole('heading',{name:'Late supper',exact:true}).count(),0);
 await page.locator('.today-focus').getByRole('link',{name:'Review session fuel',exact:true}).waitFor();
 const checkedReads=mealReads;
 await page.clock.runFor(70000);
 await page.locator('.today-focus').getByRole('link',{name:'Choose my next meal',exact:true}).waitFor();
 assert.equal(mealReads,checkedReads,'Clock ticks do not poll the complete journal');
 phase='error';await page.evaluate(()=>dispatchEvent(new Event('focus')));
 await page.getByText("Your meal journal couldn't load.",{exact:false}).waitFor();
 assert.equal(await page.locator('.meal-row').count(),0,'A failed refresh does not expose old meals as a current source');
 phase='new';await page.getByRole('button',{name:'Try again',exact:true}).click();
 await page.getByRole('heading',{name:'New-day breakfast',exact:true}).waitFor();
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>window.clockVisibility||'visible'});window.clockVisibility='hidden';document.dispatchEvent(new Event('visibilitychange'));});
 const beforeHidden=mealReads;
 await page.clock.setSystemTime(new Date('2026-10-25T08:00:00Z'));
 assert.equal(mealReads,beforeHidden);
 phase='resumed';await page.evaluate(()=>{window.clockVisibility='visible';document.dispatchEvent(new Event('visibilitychange'));});
 await page.getByRole('heading',{name:'Resumed-day lunch',exact:true}).waitFor();
 assert.match(await page.locator('.date-pill').innerText(),/October 25/);
 assert.equal(await page.getByRole('heading',{name:'New-day breakfast',exact:true}).count(),0);
 assert.ok(mealReads<=beforeHidden+2,'Resume/day change coalesces fresh source checks rather than starting an interval');
 await page.evaluate(()=>{history.pushState({},'','/qa/clock-paused');dispatchEvent(new PopStateEvent('popstate'));});
 await page.getByRole('heading',{name:'Today',exact:true}).waitFor({state:'detached'});
 const beforeUnmount=mealReads;await page.clock.runFor(120000);assert.equal(mealReads,beforeUnmount);
 assert.deepEqual(errors,[]);
 console.log('PASS actual Today clock: local midnight/date/history source refresh, stale totals withheld, planned-session expiry, no minute polling, focus failure/retry, hidden overnight resume and timer cleanup; synthetic fixtures.');
}
}finally{await browser.close();await vite.close();}
