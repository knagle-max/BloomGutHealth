import assert from 'node:assert/strict';import express from 'express';import {createRequire} from 'node:module';import {registerPrecisionRoutes} from '../../server/precision-routes.ts';import {contextSchema} from '../../shared/precision-nutrition.ts';import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),{createServer}=await import('vite');const errors=[],writes=[];
let failToday=false,failBiology=false;const todayWrites=[];
const source=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true});
const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:'synthetic-minor'};next();});registerPrecisionRoutes(app,(_req,_res,next)=>next(),{getPrecisionContext:async()=>source,getPrecisionRecords:async()=>[],getUser:async()=>({age:30,sex:'female',heightCm:170,weightKg:65,activityLevel:'moderate',dietaryPreferences:defaultPreferences}),getUserSamples:async()=>[],getMeals:async()=>[],getMetabolites:async()=>[],insertPrecisionRecord:async()=>{writes.push('unexpected');throw Error('No new adult plan should be saved');}});
const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const apiBase=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5195,strictPort:true}});await vite.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];
 if(p==='/api/precision/today-plan'){todayWrites.push(req.postDataJSON());if(failToday)return route.fulfill({status:503,json:{error:'Synthetic current-plan check unavailable'}});}
 if(p==='/api/precision'&&failBiology)return route.fulfill({status:503,json:{error:'Synthetic current-context check unavailable'}});
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
 await page.goto('http://127.0.0.1:5195/meal-planner');await page.locator('.meal-suggestion').first().waitFor();
 await page.getByText('Review daily targets',{exact:true}).click();await page.getByRole('tabpanel',{name:'Rest of today',exact:true}).getByLabel('Energy (kcal)',{exact:true}).fill('2100');failToday=true;
 await page.getByRole('button',{name:'Update suggestions with these targets',exact:true}).click();await page.getByRole('alert').filter({hasText:'Synthetic current-plan check unavailable'}).waitFor();
 assert.equal(await page.locator('.meal-suggestion').count(),0,'failed refresh must not fall back to the previous suggestions');
 failToday=false;await page.getByRole('button',{name:'Retry suggestions',exact:true}).click();await page.locator('.meal-suggestion').first().waitFor();assert.equal(todayWrites.at(-1).plan.targets.calories,2100);
 failToday=true;await page.evaluate(async()=>{const {queryClient}=await import('/src/lib/queryClient.ts');await queryClient.invalidateQueries({predicate:q=>q.queryKey[0]==='/api/precision/today-plan'});});assert.equal(await page.locator('.meal-suggestion').count(),0);
 failToday=false;await page.getByRole('button',{name:'Retry suggestions',exact:true}).click();await page.locator('.meal-suggestion').first().waitFor();assert.equal(todayWrites.at(-1).plan.targets.calories,2100);assert.equal(todayWrites.length,5);
 await page.getByRole('link',{name:'Profile',exact:true}).first().click();await page.getByText('No allergies recorded; this does not certify allergen safety.',{exact:false}).waitFor();
 failBiology=true;await page.evaluate(async()=>{const {queryClient}=await import('/src/lib/queryClient.ts');await queryClient.invalidateQueries({queryKey:['/api/precision']});});
 await page.getByText('Allergy context could not load.',{exact:false}).waitFor();assert.equal(await page.getByText('No allergies recorded; this does not certify allergen safety.',{exact:false}).count(),0);
 failBiology=false;await page.getByRole('button',{name:'Retry allergy context',exact:true}).click();await page.getByText('No allergies recorded; this does not certify allergen safety.',{exact:false}).waitFor();
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);console.log('PASS failed plan/context refresh retracts previous guidance; explicit retry recovers and preserves edited canonical targets; no source mutation.');
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));}
