import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {buildWeeklyPlan,weeklyRequestSchema} from '../../shared/weekly-planner.ts';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {historicalPlanRecord} from '../../server/plan-history.ts';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),{createServer}=await import('vite');
const baseline=process.env.BLOOM_WEEKLY_BASELINE?await readFile(process.env.BLOOM_WEEKLY_BASELINE,'utf8'):null;
const output='docs/review/plan-history-20261025';await mkdir(output,{recursive:true});
const request=weeklyRequestSchema.parse({name:'Synthetic saved week',days:1,targets:{calories:2200,protein:100,fiber:30,sodium:2300,saturatedFat:20}});
const healthy=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true});
const saved=buildWeeklyPlan(request,defaultPreferences,buildPrecisionReport([],healthy,defaultPreferences,null));assert.equal(saved.checksPassed,true);
const renal=buildPrecisionReport([],contextSchema.parse({...healthy,conditions:['renal disease']}),defaultPreferences,null);
const record=historicalPlanRecord({id:'synthetic-plan',kind:'plan',createdAt:'2026-10-20T12:00:00Z',payload:saved});
const vite=await createServer({plugins:baseline?[{name:'historical-baseline',enforce:'pre',load(id){if(id.endsWith('/client/src/components/WeeklyPlanner.tsx'))return baseline;}}]:[],server:{host:'127.0.0.1',port:5197,strictPort:true}});await vite.listen();
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
 await page.goto('http://127.0.0.1:5197/meal-planner');await page.getByRole('tab',{name:'Weekly plan',exact:true}).click();await page.getByRole('button',{name:'Open saved plan',exact:true}).click();
 const heading=page.getByRole('heading',{name:'Synthetic saved week',exact:true});await heading.waitFor();
 const panel=heading.locator('..');await panel.evaluate(el=>el.scrollIntoView({block:'start'}));
 if(baseline){await page.getByText('All planned days meet your specified nutrient checks.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Save this checked plan',exact:true}).isEnabled(),true);await page.screenshot({path:`${output}/before.png`});}
 else{
  const rebuild=page.getByRole('button',{name:'Rebuild with current inputs',exact:true});await rebuild.waitFor();
  assert.equal(await page.getByRole('button',{name:'Save this checked plan',exact:true}).isEnabled(),false);
  assert.equal(await page.getByText('All planned days meet your specified nutrient checks.',{exact:true}).count(),0);
  await page.getByRole('heading',{name:'Recorded reasoning at save time',exact:true}).waitFor();
  await page.screenshot({path:`${output}/after.png`});
  await page.evaluate(()=>{for(const [i,text] of ['Recorded estimates and checks only.','Save this checked plan'].entries()){const el=[...document.querySelectorAll('p,button')].find(el=>el.textContent?.startsWith(text));if(!el)continue;const b=el.getBoundingClientRect();const mark=document.createElement('span');mark.textContent=String(i+1);Object.assign(mark.style,{position:'absolute',top:`${b.top+scrollY}px`,left:`${Math.max(0,b.left-15)}px`,background:'#173d35',color:'white',borderRadius:'50%',width:'20px',height:'20px',textAlign:'center',fontWeight:'bold',zIndex:10000});document.body.append(mark);}});
  await page.screenshot({path:`${output}/after-annotated.png`});
  await rebuild.focus();await page.keyboard.press('Enter');await page.getByText('Your profile needs review before automated planning.',{exact:true}).waitFor();assert.deepEqual(writes,[request]);assert.equal(await page.getByRole('button',{name:'Rebuild with current inputs',exact:true}).count(),0);
  await page.getByRole('button',{name:'Open saved plan',exact:true}).click();await rebuild.waitFor();
  for(const width of [320,390,1280]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
  await page.emulateMedia({colorScheme:'dark'});await page.evaluate(()=>document.documentElement.classList.add('dark'));assert.equal(await rebuild.isEnabled(),true);
  await page.setViewportSize({width:390,height:1000});await page.evaluate(()=>document.documentElement.style.fontSize='200%');const overflow=await page.evaluate(()=>[...document.querySelectorAll('button,input,select,table,section,div')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(-12).map(el=>({tag:el.tagName,class:el.className,text:el.textContent?.slice(0,65)})));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),JSON.stringify(overflow));
 }
 assert.deepEqual(errors,[]);console.log(baseline?'PASS baseline reproduction: saved plan appears currently checked and save is enabled; matched synthetic snapshot captured.':'PASS candidate: historical checks qualified, save disabled until explicit current-input rebuild, renal planning blocked, canonical request preserved; responsive/dark/zoom passed.');
}finally{await browser.close();await vite.close();}
