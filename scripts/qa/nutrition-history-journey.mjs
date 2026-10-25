import assert from 'node:assert/strict';import express from 'express';import {createRequire} from 'node:module';
import {registerNutritionHistoryRoutes} from '../../server/nutrition-history.ts';import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),{createServer}=await import('vite');
let knownEnergy=false,failed=false,energy='kcal',writes=0;const errors=[];
const app=express();app.use((req,_res,next)=>{req.session={userId:'synthetic-history'};next();});
registerNutritionHistoryRoutes(app,(_req,_res,next)=>next(),{getMeals:async()=>{if(failed)throw Error('PRIVATE_SQL_SENTINEL');return [{loggedAt:'2026-10-01T12:00:00Z',totalCalories:knownEnergy?100:null,totalProtein:0,intelligence:{nutrients:[{key:'fiber_g',amount:4,coverage:0.5}]}},{loggedAt:'2026-10-01T13:00:00Z',totalCalories:null,totalProtein:null}];}});
const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const apiBase=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5196,strictPort:true}});await vite.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const url=new URL(route.request().url()),p=url.pathname;let json=[];
 if(/^\/api\/nutrition\/(monthly|yearly)\//.test(p)){const response=await fetch(apiBase+p+url.search);return route.fulfill({status:response.status,body:await response.text(),contentType:'application/json'});}
 if(p==='/api/meals'&&route.request().method()==='POST'){writes++;knownEnergy=true;return route.fulfill({json:{id:'synthetic-write',mealText:route.request().postDataJSON().mealText}});}
 if(p==='/api/auth/me')json={user:{id:'synthetic-history',username:'Synthetic history'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',displayUnits:{energy},onboarding:{status:'complete'}};
 else if(p==='/api/preferences')json=defaultPreferences;
 else if(p.startsWith('/api/nutrition/targets'))json={calories:2000,protein:100,carbs:200,fat:70,fiber:30,sugar:50,sodium:2300,potassium:3500};
 else if(p.startsWith('/api/nutrition/daily'))json={meals:[],totals:{calories:0,protein:0,carbs:0,fat:0},nutritionCoverage:{},isPartial:false};
 else if(p==='/api/analysis/status')json={ai:{configured:false}};
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5196/nutrition');await page.getByText('Nutrition history & trends',{exact:true}).click();const monthly=page.getByTestId('card-monthly-averages');await monthly.waitFor();await monthly.getByText('4 g · partial',{exact:true}).waitFor();await monthly.getByText('0 g · partial',{exact:true}).waitFor();assert.ok((await monthly.innerText()).includes('Unavailable'));assert.equal(await monthly.locator('.text-red-600,.text-green-600').count(),0);
 const history=page.getByRole('heading',{name:'Historical Trends'}).locator('..');assert.ok((await history.innerText()).includes('not measured zeros'));
 await page.getByTestId('button-show-log-meal').click();await page.getByTestId('input-food-description').fill('Synthetic history refresh');await page.getByTestId('button-save-meal').click();await monthly.getByText('100 kcal · partial',{exact:true}).waitFor();assert.equal(writes,1);
 energy='kJ';await page.reload();await page.getByText('Nutrition history & trends',{exact:true}).click();await monthly.getByText('418 kJ · partial',{exact:true}).waitFor();await monthly.getByText('0 g · partial',{exact:true}).waitFor();
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.evaluate(()=>document.documentElement.classList.add('dark'));assert.ok((await monthly.innerText()).includes('partial'));
 failed=true;await page.reload();await page.getByText('Nutrition history & trends',{exact:true}).click();await page.getByRole('alert').filter({hasText:'Some nutrition history could not load.'}).waitFor();assert.equal(await monthly.count(),0);assert.ok(!(await page.locator('body').innerText()).includes('PRIVATE_SQL_SENTINEL'));assert.deepEqual(errors,[]);
 console.log('PASS: actual history handlers preserve missing/zero/partial values, kJ display only, neutral status, calendar note, no partial-as-adequate claim, mobile/dark and private outage state. Synthetic data; no provider calls.');
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));}
