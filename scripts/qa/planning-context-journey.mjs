import assert from 'node:assert/strict';import express from 'express';import {createRequire} from 'node:module';import {registerPrecisionRoutes} from '../../server/precision-routes.ts';import {contextSchema} from '../../shared/precision-nutrition.ts';import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),{createServer}=await import('vite');const errors=[],writes=[];
const source=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true});
const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:'synthetic-minor'};next();});registerPrecisionRoutes(app,(_req,_res,next)=>next(),{getPrecisionContext:async()=>source,getPrecisionRecords:async()=>[],getUser:async()=>({age:17,dietaryPreferences:defaultPreferences}),getUserSamples:async()=>[],getMeals:async()=>[],getMetabolites:async()=>[],insertPrecisionRecord:async()=>{writes.push('unexpected');throw Error('No new adult plan should be saved');}});
const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const apiBase=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5192,strictPort:true}});await vite.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];
 if(p.startsWith('/api/precision')){const response=await fetch(apiBase+p+url.search,{method:req.method(),headers:{'content-type':'application/json'},...(req.postData()?{body:req.postData()}: {})});return route.fulfill({status:response.status,body:await response.text(),contentType:'application/json'});}
 if(p==='/api/auth/me')json={user:{id:'synthetic-minor',username:'Synthetic source conflict'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',displayUnits:{energy:'kcal'},onboarding:{status:'complete'}};
 else if(p==='/api/preferences')json=defaultPreferences;
 else if(p==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
 else if(p==='/api/meal-planner/progress')json={weeks:[],adherence:[]};
 else if(p==='/api/meal-planner')json={note:'Synthetic fixture',recentMeals:0,suggestions:[],pathways:[],sources:[],cohorts:[]};
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5192/meal-planner');await page.getByText('Adult nutrition planning is unavailable for a profile under 18. Review the recorded Profile and health context.',{exact:true}).first().waitFor();
 await page.getByText('Targets: Example targets — review and confirm to personalize.',{exact:true}).waitFor();assert.equal(await page.locator('.meal-suggestion').count(),0);
 await page.getByRole('tab',{name:'Weekly plan',exact:true}).click();await page.getByRole('button',{name:'Generate a weekly plan',exact:true}).click();await page.getByText('Adult nutrition planning is unavailable for a profile under 18. Review the recorded Profile and health context.',{exact:true}).last().waitFor();assert.equal(await page.getByRole('button',{name:'Save this checked plan',exact:true}).isEnabled(),false);
 for(const width of [320,1280]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.goto('http://127.0.0.1:5192/log-meal?description=100%20g%20banana');await page.getByLabel('Describe your meal',{exact:true}).waitFor();assert.equal(await page.getByLabel('Describe your meal',{exact:true}).inputValue(),'100 g banana');assert.equal(source.ageGroup,'adult');assert.equal(source.safetyReviewed,true);assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 console.log('PASS actual current handlers: known Profile minor cannot use adult context in Today/weekly plans, no save, source remains intact, mobile reflow and manual food draft remain available. No age verification or release approval claimed.');
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));}
