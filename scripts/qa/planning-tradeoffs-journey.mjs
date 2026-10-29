import{practicalChoices}from'../../shared/practical-planner.ts';
import{practicalPreferencesSchema}from'../../shared/experience.ts';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {buildTodayPlan} from '../../shared/today-planner.ts';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {weeklyRequestSchema} from '../../shared/weekly-planner.ts';
const request=weeklyRequestSchema.parse({days:1,targets:{calories:1200,protein:250,fiber:30,fiberMaximum:45,sodium:2300,saturatedFat:5}});
const report=buildPrecisionReport([],contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true}),defaultPreferences,null);
let failPractical=false;const practical=practicalChoices([{intelligence:{nutrients:[{key:'fat_saturated_g',amount:6,coverage:1}]}}],defaultPreferences,report,request,practicalPreferencesSchema.parse({minutes:60}),false,'dinner');
const original=structuredClone(request),plan=buildTodayPlan([],18,defaultPreferences,report,request);
const vite=await createServer({server:{host:'127.0.0.1',port:5254,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);
const errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;let json=[];
 if(path==='/api/auth/me')json={user:{id:'synthetic-tradeoffs',username:'Synthetic tradeoffs'}};
 else if(path==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(path==='/api/experience/day-choices'){if(failPractical)return route.fulfill({status:503,json:{error:'Synthetic choices unavailable'}});json={...practical,day:{status:'suggestions'}};}
 else if(path==='/api/preferences')json=defaultPreferences;
 else if(path==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
 else if(path==='/api/meal-planner/progress')json={weeks:[],adherence:[]};
 else if(path==='/api/meal-planner')json={recentMeals:0,suggestions:[],pathways:[],sources:[],cohorts:[]};
 else if(path==='/api/precision/planning-recipes')json={recipes:[],unknownAllergies:[]};
 else if(path==='/api/precision/today-plan'){if(req.postDataJSON()?.plan)writes.push(req.postDataJSON());json={...plan,targetSource:'Synthetic target fixture'};}
 else if(req.method()!=='GET')writes.push({path});
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5254/meal-planner');const section=page.getByRole('region',{name:'Planning trade-offs'});await section.getByRole('heading',{name:'Why gaps can remain'}).waitFor();
 for(const name of plan.tradeoffs.unmetMinimums)assert.ok((await section.innerText()).includes(name));
 for(const name of plan.tradeoffs.excludedByLimits)assert.ok((await section.innerText()).includes(name));
 await section.getByText(/Limits were kept in place/).waitFor();await section.getByText(/not proof that no other combination could fit/).waitFor();
 await page.goto('http://127.0.0.1:5254/plan-day');await page.getByRole('heading',{name:'No current meal choices',exact:true}).waitFor();await page.getByText('How your planning constraints affect choices',{exact:true}).click();await page.getByText(new RegExp('Saturated fat: '+practical.diagnostics.nutrientLimits.find(c=>c.key==='fat_saturated_g').exceeded+' exceeded')).waitFor();await page.getByText(/Protein preferences rank only options that pass/).waitFor();assert.equal(await page.locator('.practical-choice').count(),0);
 failPractical=true;await page.reload();await page.getByRole('button',{name:'Retry meal choices',exact:true}).waitFor();assert.equal(await page.getByText('How your planning constraints affect choices',{exact:true}).count(),0);failPractical=false;await page.getByRole('button',{name:'Retry meal choices',exact:true}).click();await page.getByText('How your planning constraints affect choices',{exact:true}).waitFor();
 assert.deepEqual(writes,[]);assert.deepEqual(request,original);
 for(const c of plan.checks)if(c.max!==null&&c.projected!==null)assert.ok(c.projected<=c.max+1e-6);
 await page.setViewportSize({width:320,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 console.log('PASS actual App + real bounded planner: minimum gaps, observed limit exclusions, truthful search scope, no target writes or relaxation,320px. Synthetic sources; no hosted acceptance claim.');
}catch(error){console.error({errors,body:(await page.locator('body').innerText()).slice(0,2200)});throw error;}finally{await browser.close();await vite.close();}
