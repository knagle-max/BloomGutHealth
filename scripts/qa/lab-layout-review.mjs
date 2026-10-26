import {athleteProfileSourceKey,invalidateAthleteReview} from '../../shared/athlete-review.ts';
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
const {experienceSettingsSchema}=await import(root+'/shared/experience.ts');
const {buildAthleteDay}=await import(root+'/shared/athlete.ts');
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
else if(p==='/api/profile')json=profile;
else if(p==='/api/user/synthetic-editor/profile'){profile={...profile,...body};json={success:true};}
else if(p==='/api/preferences'){if(req.method()==='PUT')preferences=body;json=preferences;}
else if(p==='/api/precision')json={...buildPrecisionReport(records,safety,preferences,null),records,availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[]}};
else if(p==='/api/precision/records'&&req.method()==='POST'){json={id:'checkin-'+records.length,kind:body.kind,payload:body.payload,createdAt:new Date().toISOString()};records.push(json);}
else if(p==='/api/experience/athlete-day')json={profileSourceKey:athleteProfileSourceKey(settings.athlete),...buildAthleteDay(settings.athlete,[],[],[]),hydration:[]};
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
 records.length=0;await page.clock.install({time:new Date('2026-10-23T18:00:00Z')});
 const out=process.env.BLOOM_REVIEW_OUTPUT||path.join(root,'work/lab-layout-review'),stage=process.env.BLOOM_CAPTURE_STAGE||'after';await fs.mkdir(out,{recursive:true});
 for(const width of [375,1440]){
  await page.setViewportSize({width,height:1000});await go('/precision?tab=labs');
  const heading=page.getByRole('heading',{name:stage==='before'?'Add lab results together':'Add lab results',exact:true});await heading.waitFor();
  await page.getByLabel('Test date',{exact:true}).fill('2026-10-02');await page.getByLabel('Laboratory (optional)',{exact:true}).fill('Synthetic report source');await page.getByLabel('Results',{exact:true}).fill('LDL, 120\nALT, 73, U/L');await page.getByRole('button',{name:'Preview results',exact:true}).click();await page.getByText('Unit assumed — confirm',{exact:true}).waitFor();await page.waitForLoadState('networkidle');
  await page.addStyleTag({content:'.bloom-header,.bloom-bottom-nav,.skip-link{visibility:hidden!important}'});await page.evaluate(()=>document.activeElement?.blur());await heading.locator('..').screenshot({path:path.join(out,`${stage}-labs-${width}-light.png`)});
 }
 assert.deepEqual(errors,[]);await fs.writeFile(path.join(out,stage+'-manifest.json'),JSON.stringify({sourceSha:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),stage,widths:[375,1440],height:1000,theme:'light',locale:'en-CA',timezone:'America/Regina',clock:'2026-10-23T18:00:00Z',synthetic:true,fonts:'blocked',crop:'lab-entry component; floating shell chrome hidden equally for capture only',independentAcceptance:false},null,2));console.log(stage+': matched lab-entry capture passed');
}finally{await browser.close();await vite.close();}
