import {invalidateAthleteReview} from '../../shared/athlete-review.ts';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const root=process.env.BLOOM_CAPTURE_ROOT||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const {createServer}=await import(root+'/node_modules/vite/dist/node/index.js');
const {buildPrecisionReport,contextSchema}=await import(root+'/shared/precision-nutrition.ts');
const {defaultPreferences}=await import(root+'/shared/meal-intelligence.ts');
const {trainingSessionSchema,activitySchema,experienceSettingsSchema}=await import(root+'/shared/experience.ts');
const {parseLabPaste}=await import(root+'/shared/lab-paste.ts');
const vite=await createServer({configFile:root+'/vite.config.ts',server:{port:5187,host:'127.0.0.1',strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,...(process.env.BLOOM_CHROMIUM_EXECUTABLE?{executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}: {})});
const page=await browser.newPage({viewport:{width:375,height:1000},locale:'en-CA',timezoneId:'America/Regina'});page.setDefaultTimeout(12000);
let settings=experienceSettingsSchema.parse({}),failNextUnits=false;
let preferences=structuredClone(defaultPreferences);preferences.exclusions=["nuts"];
const safety=contextSchema.parse({allergies:["Synthetic sesame allergy"],safetyReviewed:false});
let profile={heightCm:182.88,weightKg:75,sex:'female',age:30,activityLevel:'moderate',dietaryPreferences:defaultPreferences};
const imported=parseLabPaste('LDL, 120\nALT, 73, U/L','2026-10-01T12:00:00Z','Synthetic lab');
const records=[...imported.valid,...imported.pending].map((r,i)=>({id:'lab-'+i,kind:'lab',payload:r.payload,createdAt:'2026-10-01T12:00:00Z'}));
const routineRecords=[{id:'manual-walk',kind:'activity',payload:activitySchema.parse({title:'Synthetic walk',startedAt:'2026-10-21T18:00:00Z',minutes:25})},...['planned','completed','cancelled'].map((status,i)=>({id:'session-'+i,kind:'session',payload:trainingSessionSchema.parse({title:'Synthetic '+status,startsAt:`2026-10-${20+i}T18:00:00Z`,minutes:30,discipline:'mixed',intensity:'easy',status})}))];
const sourceLabs=structuredClone(records),writes=[],errors=[],outcomes=[];
page.on('pageerror',e=>errors.push(e.stack));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),p=new URL(req.url()).pathname,body=req.method()==='GET'?{}:req.postDataJSON();let json=[];
if(req.method()!=='GET')writes.push({path:p,body});
if(p==='/api/auth/me')json={user:{id:'synthetic-editor',username:'Synthetic Editor'}};
else if(p==='/api/experience/settings'){
 if(req.method()==='PATCH'){
  if(failNextUnits){failNextUnits=false;return route.fulfill({status:503,json:{error:'Synthetic preference save failure'}});}
  {const previous=settings.athlete;const{athleteReviewFor,...values}=body;settings=experienceSettingsSchema.parse({...settings,...values});if(values.athlete)settings.athlete=invalidateAthleteReview(previous,settings.athlete,athleteReviewFor);}
 }
 json=settings;
}
else if(p==='/api/experience/records')json=new URL(req.url()).searchParams.has('kind')?[]:routineRecords;
else if(p==='/api/profile')json=profile;
else if(p==='/api/user/synthetic-editor/profile'){profile={...profile,...body};json={success:true};}
else if(p==='/api/preferences'){if(req.method()==='PUT')preferences=body;json=preferences;}
else if(p==='/api/precision')json={...buildPrecisionReport(records,safety,preferences,null),records,availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[]}};
else if(p==='/api/precision/records'&&req.method()==='POST'){json={id:'checkin-'+records.length,kind:body.kind,payload:body.payload,createdAt:new Date().toISOString()};records.push(json);}
else if(p==='/api/precision/today-plan')return route.fulfill({status:503,json:{error:'Synthetic empty planning state'}});
else if(p==='/api/meal-planner')json={note:'Synthetic planning fixture',recentMeals:0,suggestions:[],pathways:[],sources:[],cohorts:[]};
else if(p==='/api/meal-planner/progress')json={note:'Synthetic progress fixture',weeks:[],adherence:[]};
else if(p==='/api/precision/planning-recipes')json={recipes:[],unknownAllergies:[]};
else if(p==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
else if(p==='/api/health-sources')json={connections:[]};
else if(p==='/api/health-sources/observations')json={observations:[],returned:0,total:0,hasMore:false};
else if(p==='/api/experience/review')json={entries:0,metrics:[],from:'2026-10-16',to:'2026-10-23',next:'Record a check-in',note:'Synthetic fixture'};
await route.fulfill({json});});
const go=async p=>{await page.goto('http://127.0.0.1:5187'+p);await page.getByRole('main').waitFor();};
const near=(actual,expected,tolerance=0.00002)=>assert.ok(Math.abs(Number(actual)-expected)<tolerance,`${actual} differs from ${expected}`);
const input=key=>page.locator(`input[name="${key}"]`);
try{
 await page.clock.install({time:new Date('2026-10-23T18:00:00Z')});
 records.push({id:'dated-synthetic',kind:'checkin',payload:{measuredAt:'2026-10-21T18:00:00Z',weightKg:80,waistCm:91.44,bodyFatPercent:null,bloating:null,energy:6,adherencePercent:75,planId:null,notes:'Synthetic observation; changes do not establish a cause.'},createdAt:'2026-10-21T18:00:00Z'});
 const out=process.env.BLOOM_REVIEW_OUTPUT||path.join(root,'work/progress-layout-review'),stage=process.env.BLOOM_CAPTURE_STAGE||'after';await fs.mkdir(out,{recursive:true});
 for(const width of [320,375,390,430,1280]){await page.setViewportSize({width,height:1000});await go('/progress');await page.getByRole('heading',{name:'Recorded food over time',exact:true}).waitFor();await page.waitForLoadState('networkidle');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,`${stage}-progress-${width}-light.png`),fullPage:true});}
 const tabs=page.getByRole('tablist',{name:'Progress view'});
 assert.equal(await tabs.getByRole('tab',{name:'Nutrition',exact:true}).getAttribute('aria-selected'),'true');
 await tabs.getByRole('tab',{name:'Nutrition',exact:true}).focus();await page.keyboard.press('ArrowRight');
 await page.getByRole('heading',{name:'Recorded activity',exact:true}).waitFor();await page.getByRole('heading',{name:'Synthetic walk',exact:true}).waitFor();
 assert.equal(await page.getByRole('heading',{name:'Bloodwork over time',exact:true}).isVisible(),false);
 await page.keyboard.press('ArrowRight');await page.getByRole('heading',{name:'Bloodwork over time',exact:true}).waitFor();
 for(const width of [320,375,390,430,1280]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,`${stage}-biology-${width}-light.png`),fullPage:true});}
 await page.setViewportSize({width:390,height:1000});await page.evaluate(()=>document.documentElement.classList.add('dark'));await page.screenshot({path:path.join(out,`${stage}-biology-390-dark.png`),fullPage:true});
 await tabs.getByRole('tab',{name:'Nutrition',exact:true}).click();await page.screenshot({path:path.join(out,`${stage}-progress-390-dark.png`),fullPage:true});
 await page.setViewportSize({width:375,height:1000});await page.evaluate(()=>document.documentElement.classList.remove('dark'));await tabs.getByRole('tab',{name:'Nutrition',exact:true}).click();
 await page.evaluate(()=>{for(const [selector,number] of [['[role=tablist]',1],['#food-progress-heading',2]]){const target=document.querySelector(selector);target.style.position='relative';const marker=document.createElement('span');marker.textContent=String(number);marker.style.cssText='position:absolute;right:0;top:-8px;border:2px solid #172c26;background:#fff;color:#172c26;border-radius:50%;width:24px;height:24px;text-align:center;font:700 14px/20px sans-serif;z-index:50';marker.dataset.reviewAnnotation='true';target.append(marker);}});
 await page.screenshot({path:path.join(out,`${stage}-progress-375-annotated.png`),fullPage:true});await page.locator('[data-review-annotation]').evaluateAll(nodes=>nodes.forEach(n=>n.remove()));
 settings=experienceSettingsSchema.parse({...settings,mode:'athlete'});await go('/progress');await page.getByRole('heading',{name:'Recorded training',exact:true}).waitFor();assert.equal(await page.getByRole('tab',{name:'Training',exact:true}).getAttribute('aria-selected'),'true');for(const status of ['planned','completed','cancelled'])await page.getByRole('heading',{name:'Synthetic '+status,exact:true}).waitFor();await page.screenshot({path:path.join(out,`${stage}-training-375-light.png`),fullPage:true});
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(out,stage+'-manifest.json'),JSON.stringify({sourceSha:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),stage,widths:[320,375,390,430,1280],height:1000,themes:['light','390-dark'],keyboardTabs:true,athleteStatuses:['planned','completed','cancelled'],locale:'en-CA',timezone:'America/Regina',clock:'2026-10-23T18:00:00Z',synthetic:true,fonts:'blocked',independentAcceptance:false},null,2));console.log(stage+': matched Progress layout captures passed');
}finally{await browser.close();await vite.close();}
