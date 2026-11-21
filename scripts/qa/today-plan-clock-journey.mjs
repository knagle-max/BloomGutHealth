import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {createServer} from 'vite';
import {buildTodayPlan} from '../../shared/today-planner.ts';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';

const baseline=process.env.BLOOM_TODAY_PLAN_CLOCK_BASELINE;
const file='client/src/components/TodayPlanner.tsx';
const vite=await createServer({plugins:baseline?[{name:'plan-clock-baseline',enforce:'pre',load(id){if(id.split('?')[0]===path.resolve(file))return execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'});}}]:[],server:{host:'127.0.0.1',port:5254,strictPort:true}});
await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000},timezoneId:'America/Regina'});page.setDefaultTimeout(12000);
await page.clock.install({time:new Date('2026-11-15T05:59:50Z')});
const request={name:'Synthetic day',days:1,householdServings:1,targets:{calories:2000,protein:100,fiber:30,fiberMaximum:45,sodium:2300,saturatedFat:20},customRecipes:[],nutrientTargets:{},locked:{}};
const report=buildPrecisionReport([],contextSchema.parse({}),defaultPreferences,null);
const reads=[],errors=[];let heldUpdate,heldDay,fail=false;
const updateCaptured=Promise.withResolvers(),dayCaptured=Promise.withResolvers();
const captured=promise=>new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Expected planner request did not reach the source fixture')),12000);promise.then(value=>{clearTimeout(timeout);resolve(value);},error=>{clearTimeout(timeout);reject(error);});});
const response=body=>({...buildTodayPlan([],body.hour,defaultPreferences,report,body.plan||request),targetSource:`Synthetic current source ${body.date} hour ${body.hour}`});
page.on('pageerror',error=>errors.push(error.message));
await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),p=new URL(req.url()).pathname;let json=[];
 if(p==='/api/auth/me')json={user:{id:'synthetic-plan-clock',username:'Plan clock fixture'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(p==='/api/preferences')json=defaultPreferences;
 else if(p==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
 else if(p==='/api/meal-planner')json={note:'Synthetic fixture',recentMeals:0,suggestions:[],pathways:[],sources:[],cohorts:[]};
 else if(p==='/api/precision/planning-recipes')json={recipes:[],unknownAllergies:[]};
 else if(p==='/api/meal-planner/progress')json={weeks:[],adherence:[]};
 else if(p==='/api/precision/today-plan'){
  const body=req.postDataJSON();reads.push(body);
  if(body.plan&&!heldUpdate){heldUpdate={route,body};updateCaptured.resolve(heldUpdate);return;}
  if(body.date==='2026-11-15'&&!heldDay){heldDay={route,body};dayCaptured.resolve(heldDay);return;}
  if(fail)return route.fulfill({status:503,json:{error:'Synthetic current-day source unavailable'}});
  json=response(body);
 }
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5254/meal-planner');
 const today=page.getByRole('tabpanel',{name:'Rest of today',exact:true});
 await today.getByText('Targets: Synthetic current source 2026-11-14 hour 23.',{exact:true}).waitFor();
 if(baseline){const count=reads.length;await page.clock.runFor(20000);assert.equal(reads.length,count);await today.getByText('Targets: Synthetic current source 2026-11-14 hour 23.',{exact:true}).waitFor();console.log('RED reproduced: mounted remaining-day planner retains prior-day suggestions after midnight.');}
 else{
  await today.getByText('Review daily targets',{exact:true}).click();
  await today.getByLabel('Energy (kcal)',{exact:true}).fill('2200');
  await today.getByRole('button',{name:'Update suggestions with these targets',exact:true}).click();
  await today.getByText('Checking today’s intake and current context…',{exact:true}).waitFor();await captured(updateCaptured.promise);assert.ok(heldUpdate);
  await page.clock.runFor(20000);await captured(dayCaptured.promise);
  assert.ok(heldDay,'New calendar day requests a fresh source even while previous update is pending');
  assert.equal(heldDay.body.timezoneOffset,360);assert.equal(heldDay.body.hour,0);
  assert.equal(heldDay.body.plan.targets.calories,2200,'Edited targets survive rollover');
  await heldDay.route.fulfill({json:response(heldDay.body)});
  await heldUpdate.route.fulfill({json:response(heldUpdate.body)});
  await today.getByText('Targets: Synthetic current source 2026-11-15 hour 0.',{exact:true}).waitFor();
  assert.equal(await today.getByText(/Targets: Synthetic current source 2026-11-14/).count(),0,'Late prior-day mutation cannot replace the new day');
  const currentReads=reads.length;await page.clock.runFor(60000);assert.equal(reads.length,currentReads,'Minute clock ticks do not poll unchanged hour/day');
  fail=true;await page.clock.setSystemTime(new Date('2026-11-15T07:00:00Z'));await page.evaluate(()=>dispatchEvent(new Event('focus')));
  await today.getByText('Synthetic current-day source unavailable',{exact:true}).waitFor();assert.equal(await today.getByText(/Targets: Synthetic current source/).count(),0);
  fail=false;await today.getByRole('button',{name:'Retry suggestions',exact:true}).click();
  await today.getByText('Targets: Synthetic current source 2026-11-15 hour 1.',{exact:true}).waitFor();
  assert.equal(await today.getByLabel('Energy (kcal)',{exact:true}).inputValue(),'2200');
  await page.setViewportSize({width:320,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(errors,[]);console.log('PASS remaining-day planner midnight rollover, local offset, preserved target draft, late prior-day mutation rejection, no minute polling, new-hour source outage/retry and320px. Synthetic HTTP source fixtures; no real account or meal writes.');
 }
}finally{await browser.close();await vite.close();}
