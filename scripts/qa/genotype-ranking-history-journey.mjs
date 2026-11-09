import assert from 'node:assert/strict';

import {createRequire} from 'node:module';
import {buildWeeklyPlan,weeklyRequestSchema} from '../../shared/weekly-planner.ts';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {historicalPlanRecord} from '../../server/plan-history.ts';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),{createServer}=await import('vite');


const request=weeklyRequestSchema.parse({name:'Synthetic saved week',days:1,targets:{calories:2200,protein:100,fiber:30,sodium:2300,saturatedFat:20}});
const healthy=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true});
const saved=buildWeeklyPlan(request,defaultPreferences,buildPrecisionReport([],healthy,defaultPreferences,null));assert.equal(saved.checksPassed,true);
const renal=buildPrecisionReport([],contextSchema.parse({...healthy,conditions:['renal disease']}),defaultPreferences,null);
saved.days[0].meals[0].reasons.push('Folate-containing ingredients are relevant to recorded MTHFR context; historical synthetic fixture.');
const source=structuredClone(saved);
const record=historicalPlanRecord({id:'synthetic-plan',kind:'plan',createdAt:'2026-10-20T12:00:00Z',payload:saved});
const vite=await createServer({server:{host:'127.0.0.1',port:5190,strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);const errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;let json=[];
 if(path==='/api/auth/me')json={user:{id:'synthetic-review',username:'Synthetic review'}};
 else if(path==='/api/experience/settings')json={mode:'everyday',displayUnits:{energy:'kcal'},onboarding:{status:'complete'}};
 else if(path==='/api/preferences')json=defaultPreferences;
 else if(path==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
 else if(path==='/api/meal-planner/progress')json={weeks:[],adherence:[]};
 else if(path==='/api/meal-planner')json={note:'Synthetic review',recentMeals:0,suggestions:[],pathways:[],sources:[],cohorts:[]};
 else if(path==='/api/precision/weekly-plans')json=[record];
 else if(path==='/api/precision/planning-recipes')json={recipes:[],unknownAllergies:[]};
 else if(path==='/api/precision/weekly-plans/preview'){writes.push(req.postDataJSON());json=buildWeeklyPlan(req.postDataJSON(),defaultPreferences,renal);}
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5190/meal-planner');await page.getByRole('tab',{name:'Weekly plan',exact:true}).click();await page.getByRole('button',{name:'Open saved plan',exact:true}).click();
 const heading=page.getByRole('heading',{name:'Synthetic saved week',exact:true});await heading.waitFor();
 const panel=heading.locator('..');await panel.evaluate(el=>el.scrollIntoView({block:'start'}));
 const rebuild=page.getByRole('button',{name:'Rebuild with current inputs',exact:true});await rebuild.waitFor();
 await page.getByText('4 historical meal suggestions are withheld.',{exact:false}).waitFor();
 await page.getByRole('heading',{name:'Recorded source context',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'Save this checked plan',exact:true}).isEnabled(),false);
 assert.equal(await page.getByText('Folate-containing ingredients are relevant to recorded MTHFR context;', {exact:false}).count(),0);
 assert.deepEqual(saved,source);
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.emulateMedia({colorScheme:'dark'});await page.evaluate(()=>document.documentElement.classList.add('dark'));
 await rebuild.focus();await page.keyboard.press('Enter');await page.getByText('Your profile needs review before automated planning.',{exact:true}).waitFor();assert.deepEqual(writes,[request]);
 assert.deepEqual(saved,source);
 assert.deepEqual(errors,[]);console.log('PASS affected historical selections withheld, original source preserved, explicit current-context rebuild blocked for renal context; mobile/dark/keyboard passed.');
}finally{await browser.close();await vite.close();}
