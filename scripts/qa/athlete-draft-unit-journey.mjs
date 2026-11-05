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
let settings=experienceSettingsSchema.parse({mode:"athlete",displayUnits:{hydration:"L"}}),failNextUnits=false;
let preferences=structuredClone(defaultPreferences);preferences.exclusions=["nuts"];
const safety=contextSchema.parse({allergies:["Synthetic sesame allergy"],safetyReviewed:false});
let profile={heightCm:182.88,weightKg:75,sex:'female',age:30,activityLevel:'moderate',dietaryPreferences:defaultPreferences};
const imported=parseLabPaste('LDL, 120\nALT, 73, U/L','2026-10-01T12:00:00Z','Synthetic lab');
const records=[...imported.valid,...imported.pending].map((r,i)=>({id:'lab-'+i,kind:'lab',payload:r.payload,createdAt:'2026-10-01T12:00:00Z'}));
const sourceLabs=structuredClone(records),writes=[],errors=[],outcomes=[];const sessions=[{id:"known-session",kind:"session",createdAt:new Date().toISOString(),updatedAt:"2026-11-01T12:00:00Z",payload:{title:"Known precise fluid",startsAt:new Date().toISOString(),minutes:60,intensity:"easy",discipline:"endurance",climate:"temperate",status:"completed",rpe:null,carbsG:null,fluidMl:1200.0001,gutComfort:null,performance:"",notes:""}}];
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

const refreshUnits=async units=>{settings={...settings,displayUnits:{...settings.displayUnits,...units}};await page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');await queryClient.invalidateQueries({predicate:q=>q.queryKey[0]==='/api/experience/settings'});});};
try{
 await go('/athlete');await page.getByText('Add a training session',{exact:true}).click();const form=page.locator('#athlete-add-session form');
 await form.locator('input[name=title]').fill('Typed fluid draft');await form.getByText('Completed-session observations (optional)',{exact:true}).click();await form.locator('input[name=fluidMl]').fill('1.500');
 await refreshUnits({hydration:'mL',bodyWeight:'lb'});await form.getByText('This draft keeps its original entry units.',{exact:false}).waitFor();await form.getByLabel('Fluid consumed during session (L)',{exact:true}).waitFor();assert.equal(await form.locator('input[name=fluidMl]').inputValue(),'1.500');
 await form.getByRole('button',{name:'Save training session',exact:true}).click();await page.getByText('Training session saved in your calendar.',{exact:true}).waitFor();assert.equal(sessions.at(-1).payload.fluidMl,1500);assert.equal(sessions.length,2);
 await page.getByText('Add a training session',{exact:true}).click();if(!await form.getByText('Completed-session observations (optional)',{exact:true}).evaluate(el=>el.parentElement.open))await form.getByText('Completed-session observations (optional)',{exact:true}).click();await form.getByLabel('Fluid consumed during session (mL)',{exact:true}).waitFor();assert.equal(await form.locator('input[name=fluidMl]').inputValue(),'');
 const card=page.locator('#athlete-training-calendar article').filter({hasText:'Known precise fluid'});await card.getByText('Edit session & actual recovery observations',{exact:true}).click();const edit=card.locator('form');await edit.locator('textarea[name=notes]').fill('Only notes edited');
 await refreshUnits({hydration:'L'});await edit.getByLabel('Fluid consumed (mL)',{exact:true}).waitFor();const editedResponse=page.waitForResponse(response=>response.url().endsWith('/api/experience/records/known-session')&&response.request().method()==='PUT');await edit.getByRole('button',{name:'Save session changes',exact:true}).click();await editedResponse;assert.equal(sessions[0].payload.fluidMl,1200.0001,'rounded display must not overwrite untouched canonical fluid');
 await refreshUnits({bodyWeight:'kg',hydration:'L'});await go('/athlete/fueling');await page.getByText('Estimate sweat loss from a training session',{exact:true}).click();const hydration=page.locator('form').filter({has:page.getByRole('button',{name:'Save hydration observation',exact:true})});
 await hydration.locator('input[name=preKg]').fill('70.000');await hydration.locator('input[name=postKg]').fill('69.00');await hydration.locator('input[name=drankMl]').fill('1.25');await hydration.locator('input[name=urineMl]').fill('0');
 await refreshUnits({bodyWeight:'lb',hydration:'mL'});await hydration.getByLabel('Pre-session mass (kg)',{exact:true}).waitFor();await hydration.getByLabel('Fluid consumed (L)',{exact:true}).waitFor();await hydration.getByRole('button',{name:'Save hydration observation',exact:true}).click();await hydration.getByText('Hydration observation saved.',{exact:true}).waitFor();const saved=writes.filter(row=>row.path==='/api/experience/records').at(-1).body.payload;assert.equal(saved.preKg,70);assert.equal(saved.postKg,69);assert.equal(saved.drankMl,1250);assert.equal(saved.urineMl,0);
 await hydration.getByRole('button',{name:'Clear hydration draft',exact:true}).click();await hydration.getByLabel('Pre-session mass (lb)',{exact:true}).waitFor();await hydration.getByLabel('Fluid consumed (mL)',{exact:true}).waitFor();assert.equal(await hydration.locator('input[name=preKg]').inputValue(),'');
 for(const width of[320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 assert.deepEqual(errors,[]);console.log('PASS actual App draft units: shared preference refresh preserves typed session/hydration unit labels and canonical values; successful session reset/new draft adopts latest units; explicit hydration clear adopts latest units; unrelated session edit preserves precise canonical fluid despite rounded display;320–1440 reflow/no extra save. Mock HTTP fixture.');
}catch(error){console.error({errors,text:await page.locator('body').innerText()});throw error;}finally{await browser.close();await vite.close();}
