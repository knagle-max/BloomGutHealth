import {sweatEstimate} from "../../shared/athlete.ts";
import {athleteProfileSourceKey,invalidateAthleteReview} from '../../shared/athlete-review.ts';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const {createServer}=await import(root+'/node_modules/vite/dist/node/index.js');
const {buildPrecisionReport,contextSchema}=await import(root+'/shared/precision-nutrition.ts');
const {defaultPreferences}=await import(root+'/shared/meal-intelligence.ts');
const {experienceSettingsSchema}=await import(root+'/shared/experience.ts');
const {buildAthleteDay}=await import(root+'/shared/athlete.ts');
const {parseLabPaste}=await import(root+'/shared/lab-paste.ts');
const vite=await createServer({configFile:root+'/vite.config.ts',server:{port:5187,host:'127.0.0.1',strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,...(process.env.BLOOM_CHROMIUM_EXECUTABLE?{executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}: {})});
const page=await browser.newPage({viewport:{width:375,height:1000},locale:'en-CA',timezoneId:'America/Regina'});page.setDefaultTimeout(12000);
let settings=experienceSettingsSchema.parse({mode:"athlete",displayUnits:{hydration:"L"},athlete:{sport:"Synthetic ride",weightKg:70,energyKcal:2500,entrySource:{version:1,capture:"athlete-reference",fields:{weightKg:{value:"70.000",unit:"kg"},energyKcal:{value:"10460.00",unit:"kJ"}}}}}),failNextUnits=false;
let preferences=structuredClone(defaultPreferences);preferences.exclusions=["nuts"];
const safety=contextSchema.parse({allergies:["Synthetic sesame allergy"],safetyReviewed:false});
let profile={heightCm:182.88,weightKg:75,sex:'female',age:30,activityLevel:'moderate',dietaryPreferences:defaultPreferences};
const imported=parseLabPaste('LDL, 120\nALT, 73, U/L','2026-10-01T12:00:00Z','Synthetic lab');
const records=[...imported.valid,...imported.pending].map((r,i)=>({id:'lab-'+i,kind:'lab',payload:r.payload,createdAt:'2026-10-01T12:00:00Z'}));
const sourceLabs=structuredClone(records),writes=[],errors=[],outcomes=[];const sessions=[{id:"known-session",kind:"session",createdAt:new Date().toISOString(),updatedAt:"2026-11-01T12:00:00Z",payload:{title:"Known precise fluid",startsAt:new Date().toISOString(),minutes:60,intensity:"easy",discipline:"endurance",climate:"temperate",status:"completed",rpe:null,carbsG:null,fluidMl:1200.0001,gutComfort:null,performance:"",notes:""}}];
sessions[0].payload.entrySource={version:1,capture:'manual-session',fields:{fluidMl:{value:'1.2000001',unit:'L'}}};
sessions.push({...structuredClone(sessions[0]),id:'legacy-session',payload:{...sessions[0].payload,title:'Legacy unknown source',entrySource:undefined}});
sessions.push({id:'known-hydration',kind:'hydration',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),payload:{date:'2026-11-05',minutes:60,preKg:70,postKg:69,drankMl:1250,urineMl:0,climate:'temperate',sweatSodiumMgL:null,testSource:'Synthetic',entrySource:{version:1,capture:'manual-hydration',fields:{preKg:{value:'70.000',unit:'kg'},postKg:{value:'69.00',unit:'kg'},drankMl:{value:'1.25',unit:'L'},urineMl:{value:'0.0',unit:'mL'}}}}});
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
else if(p==='/api/experience/records'&&req.method()==='GET')json=sessions;
else if(p==='/api/experience/sessions'&&req.method()==='POST'){json={id:'session_'+'a'.repeat(64),kind:'session',payload:body,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};sessions.push(json);}
else if(p.startsWith('/api/experience/records/')&&req.method()==='PUT'){const row=sessions.find(row=>row.id===p.split('/').at(-1));Object.assign(row,body,{updatedAt:new Date().toISOString()});json=row;}
else if(p==='/api/experience/records'&&req.method()==='POST'){json={id:'hydration-'+writes.length,...body,createdAt:new Date().toISOString()};}
else if(p==='/api/experience/athlete-day')json={profileSourceKey:athleteProfileSourceKey(settings.athlete),...buildAthleteDay(settings.athlete,[],[],[]),hydration:sessions.filter(row=>row.kind==="hydration").map(row=>({id:row.id,...sweatEstimate(row.payload)}))};
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
 await go('/athlete');const profileDetails=page.locator('#athlete-profile');await profileDetails.getByText('Entered values & units',{exact:true}).click();await profileDetails.getByText('10460.00 kJ',{exact:true}).waitFor();await profileDetails.getByText('70.000 kg',{exact:true}).waitFor();
 const known=page.locator('#athlete-training-calendar article').filter({hasText:'Known precise fluid'}),legacy=page.locator('#athlete-training-calendar article').filter({hasText:'Legacy unknown source'});await known.getByText('Entered values & units',{exact:true}).click();await known.getByText('1.2000001 L',{exact:true}).waitFor();await legacy.getByText('Entered values & units',{exact:true}).click();await legacy.getByText('Original entry text and units were not retained.',{exact:false}).waitFor();
 settings={...settings,displayUnits:{...settings.displayUnits,hydration:'mL',bodyWeight:'lb',energy:'kcal'}};await page.reload();await profileDetails.getByText('Entered values & units',{exact:true}).click();await profileDetails.getByText('10460.00 kJ',{exact:true}).waitFor();await known.getByText('Entered values & units',{exact:true}).click();await known.getByText('1.2000001 L',{exact:true}).waitFor();
 await go('/athlete/fueling');const observation=page.locator('section').filter({has:page.getByRole('heading',{name:'Recorded sweat-loss estimate',exact:true})});await observation.getByText('Entered values & units',{exact:true}).click();await observation.getByText('70.000 kg',{exact:true}).waitFor();await observation.getByText('1.25 L',{exact:true}).waitFor();await observation.getByText('0.0 mL',{exact:true}).waitFor();
 for(const width of[320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 assert.equal(writes.filter(row=>row.path!=='/api/experience/athlete-day').length,0);assert.deepEqual(errors,[]);console.log('PASS actual App reader: original Athlete kg/kJ/session L/hydration kg/L/zero precision stays separate from current display units; legacy unknown, reload and320–1440px; no source writes or clinical activation. Encrypted SQL round-trip tested separately.');
}catch(error){console.error({errors,text:await page.locator('body').innerText()});throw error;}finally{await browser.close();await vite.close();}
