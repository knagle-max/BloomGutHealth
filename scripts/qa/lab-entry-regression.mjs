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
const grouped=process.env.BLOOM_LAB_SOURCE_GROUPS==='true';
let settings=experienceSettingsSchema.parse({}),failNextUnits=false;
let preferences=structuredClone(defaultPreferences);preferences.exclusions=["nuts"];
const safety=contextSchema.parse({allergies:["Synthetic sesame allergy"],safetyReviewed:false});
let profile={heightCm:182.88,weightKg:75,sex:'female',age:30,activityLevel:'moderate',dietaryPreferences:defaultPreferences};
const imported=parseLabPaste('LDL, 120\nALT, 73, U/L','2026-10-01T12:00:00Z','Synthetic lab');
const records=[...imported.valid,...imported.pending].map((r,i)=>({id:'lab-'+i,kind:'lab',payload:r.payload,createdAt:'2026-10-01T12:00:00Z'}));
const sourceLabs=structuredClone(records),writes=[],errors=[],outcomes=[];const receipts=new Map(),attempts=[];let loseFirstLab=true;
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
else if(p==='/api/precision/records'&&req.method()==='POST'){
 const key=req.headers()['idempotency-key'];assert.ok(key);attempts.push({key,body});
 if(!receipts.has(key)){json={id:'lab-'+records.length,kind:body.kind,payload:body.payload,createdAt:new Date().toISOString()};receipts.set(key,json);records.push(json);}else json=receipts.get(key);
 if(loseFirstLab){loseFirstLab=false;return route.abort('failed');}
}
else if(p.endsWith('/confirm-unit')){const source=records.find(r=>r.id===p.split('/')[4]);json={id:'confirmed-'+records.length,kind:'lab',payload:{...source.payload,unit:body.unit,unitReview:{...source.payload.unitReview,status:'confirmed',confirmedAt:new Date().toISOString(),supersedes:source.id}},createdAt:new Date().toISOString()};records.push(json);}
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
const input=key=>page.locator(`input[name="${key}"]`);try{
records.length=0;
await go('/precision?tab=labs');await page.getByRole('heading',{name:'Add lab results',exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'Add a dated laboratory result',exact:true}).count(),0);
await page.getByLabel('Test date',{exact:true}).fill('2026-10-02');await page.getByLabel('Laboratory (optional)',{exact:true}).fill('Synthetic shared source');await page.getByLabel('Method / assay (optional)',{exact:true}).fill('Assay-A');await page.getByLabel('Fasting',{exact:true}).selectOption('yes');await page.getByLabel('Collection time (optional)',{exact:true}).fill('09:15');
await page.getByRole('button',{name:'Enter one',exact:true}).click();assert.equal(await page.getByLabel('Test date',{exact:true}).inputValue(),'2026-10-02');await page.getByLabel('Source value',{exact:true}).fill('120');await page.getByRole('button',{name:'Paste several',exact:true}).click();assert.equal(await page.getByLabel('Method / assay (optional)',{exact:true}).inputValue(),'Assay-A');
await page.getByText('Report & specimen identifiers (optional)',{exact:true}).click();await page.getByLabel('Report identifier (optional)',{exact:true}).fill('  Report / Source-A  ');await page.getByLabel('Specimen identifier (optional)',{exact:true}).fill('  Specimen # 2  ');
await page.getByLabel('Results',{exact:true}).fill(grouped?'  [ LIVER & BILIARY ]  \nALT, 73, U/L\n\n [ UNKNOWN REPORTED GROUP ] \nUnknown marker, 8':'ALT, 73, U/L\nUnknown marker, 8');await page.getByRole('button',{name:'Preview results',exact:true}).click();await page.getByRole('button',{name:'Save 1 result(s) after review',exact:true}).click();await page.getByRole('alert').filter({hasText:'We could not confirm all results'}).waitFor();assert.equal(await page.getByLabel('Results',{exact:true}).isDisabled(),true);assert.equal(records.length,1);
await page.getByRole('button',{name:'Retry remaining results',exact:true}).click();await page.getByText('1 result(s) saved.',{exact:false}).waitFor();assert.equal(records.length,1);assert.match(attempts[0].body.payload.sourceReport.importId,/^[a-f0-9-]{36}$/);assert.equal(attempts[0].body.payload.sourceReport.reportIdentifier,'  Report / Source-A  ');assert.equal(attempts[0].body.payload.sourceReport.specimenIdentifier,'  Specimen # 2  ');assert.equal(attempts[0].key,attempts[1].key);assert.deepEqual(attempts[0].body,attempts[1].body);
await page.getByRole('button',{name:'Correct unrecognized rows',exact:true}).click();const correction=await page.getByLabel('Results',{exact:true}).inputValue();assert.equal(correction,grouped?'  [ LIVER & BILIARY ]  \n\n\n [ UNKNOWN REPORTED GROUP ] \nUnknown marker, 8':'\nUnknown marker, 8');await page.getByLabel('Results',{exact:true}).fill(correction.replace('Unknown marker, 8','AST, 30, U/L'));await page.getByRole('button',{name:'Preview results',exact:true}).click();await page.getByRole('button',{name:'Save 1 result(s) after review',exact:true}).click();await page.getByText('1 result(s) saved.',{exact:false}).waitFor();assert.equal(records.length,2);assert.deepEqual(records[1].payload.sourceReport,records[0].payload.sourceReport);assert.notEqual(attempts[1].key,attempts[2].key);assert.equal(records[1].payload.sourceInput.rowOrder,grouped?4:1);if(grouped){assert.equal(records[0].payload.sourceInput.reportedSection,'  [ LIVER & BILIARY ]  ');assert.equal(records[1].payload.sourceInput.reportedSection,' [ UNKNOWN REPORTED GROUP ] ');assert.equal(records[0].payload.marker,'alt');assert.equal(records[1].payload.marker,'ast');}
await page.getByRole('button',{name:'Start another import',exact:true}).click();assert.equal(await page.getByLabel('Report identifier (optional)',{exact:true}).inputValue(),'');assert.equal(await page.getByLabel('Specimen identifier (optional)',{exact:true}).inputValue(),'');await page.getByLabel('Specimen identifier (optional)',{exact:true}).fill('Different specimen, same date');await page.getByRole('button',{name:'Enter one',exact:true}).click();assert.equal(await page.getByLabel('Test date',{exact:true}).inputValue(),'2026-10-02');await page.getByLabel('Source value',{exact:true}).fill('120');await page.getByLabel('Report reference high (optional)',{exact:true}).fill('130');await page.getByRole('button',{name:'Preview results',exact:true}).click();await page.getByText('Unit assumed — confirm',{exact:true}).waitFor();await page.getByRole('button',{name:'Save 1 result(s) for review',exact:true}).click();await page.getByRole('heading',{name:'1 result(s) need unit confirmation',exact:true}).waitFor();assert.equal(records.length,3);assert.notEqual(records[2].payload.sourceReport.importId,records[0].payload.sourceReport.importId);assert.equal(records[2].payload.sourceReport.reportIdentifier,undefined);assert.equal(records[2].payload.sourceReport.specimenIdentifier,'Different specimen, same date');
for(const row of records){assert.equal(row.payload.laboratory,'Synthetic shared source');assert.equal(row.payload.method,'Assay-A');assert.equal(row.payload.fasting,'yes');assert.equal(row.payload.measuredAt,'2026-10-02T15:15:00.000Z');}
const provisional=records.find(r=>r.payload.marker==='ldl');assert.equal(provisional.payload.sourceInput.capture,'manual-report');assert.equal(provisional.payload.sourceInput.suppliedUnit,null);assert.equal(buildPrecisionReport(records,safety,preferences,null).labs.length,2);
await page.getByLabel('Source unit for LDL cholesterol',{exact:true}).selectOption('mg/dL');await page.getByRole('checkbox',{name:'I checked this number and unit against my report.',exact:true}).check();await page.getByRole('button',{name:'Confirm source unit',exact:true}).click();await page.getByText('Source unit confirmed.',{exact:true}).waitFor();const report=buildPrecisionReport(records,safety,preferences,null);assert.equal(report.pendingLabs.length,0);near(report.labs.find(l=>l.marker==='ldl').canonical.value,120/38.67);assert.equal(provisional.payload.value,120);assert.equal(provisional.payload.unitReview.originalUnit,null);assert.deepEqual(report.labs.find(l=>l.marker==='ldl').sourceReport,provisional.payload.sourceReport);
for(const width of [320,375,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
assert.deepEqual(errors,[]);const output=process.env.BLOOM_REVIEW_OUTPUT||path.join(root,'work/lab-entry-review');await fs.mkdir(output,{recursive:true});const result={synthetic:true,independentAcceptance:false,outcomes:['One lab entry with shared report context and two submodes','Lost-response retry reuses its key and frozen payload; acknowledged rows are not duplicated','Correct only unrecognized rows, preserving context','Manual missing-unit result stays provisional until explicit source-unit confirmation','Original value/unit provenance and canonical normalization preserved','320/375/768/1440 reflow'],errors};await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}catch(e){console.error(JSON.stringify({errors,text:await page.locator('body').innerText()},null,2));throw e;}finally{await browser.close();await vite.close();}
