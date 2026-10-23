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
const {parseLabPaste}=await import(root+'/shared/lab-paste.ts');
const vite=await createServer({configFile:root+'/vite.config.ts',server:{port:5187,host:'127.0.0.1',strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,...(process.env.BLOOM_CHROMIUM_EXECUTABLE?{executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}: {})});
const page=await browser.newPage({viewport:{width:375,height:1000},locale:'en-CA',timezoneId:'America/Regina'});page.setDefaultTimeout(12000);
let settings=experienceSettingsSchema.parse({}),failNextUnits=false;
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
  settings=experienceSettingsSchema.parse({...settings,...body});
 }
 json=settings;
}
else if(p==='/api/profile')json=profile;
else if(p==='/api/user/synthetic-editor/profile'){profile={...profile,...body};json={success:true};}
else if(p==='/api/preferences')json=defaultPreferences;
else if(p==='/api/precision')json={...buildPrecisionReport(records,contextSchema.parse({}),defaultPreferences,null),records,availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[]}};
else if(p==='/api/precision/records'&&req.method()==='POST'){json={id:'checkin-'+records.length,kind:body.kind,payload:body.payload,createdAt:new Date().toISOString()};records.push(json);}
else if(p==='/api/health-sources')json={connections:[]};
else if(p==='/api/health-sources/observations')json={observations:[],returned:0,total:0,hasMore:false};
else if(p==='/api/experience/review')json={entries:0,metrics:[],from:'2026-10-16',to:'2026-10-23',next:'Record a check-in',note:'Synthetic fixture'};
await route.fulfill({json});});
const go=async p=>{await page.goto('http://127.0.0.1:5187'+p);await page.getByRole('main').waitFor();};
const near=(actual,expected,tolerance=0.00002)=>assert.ok(Math.abs(Number(actual)-expected)<tolerance,`${actual} differs from ${expected}`);
const input=key=>page.locator(`input[name="${key}"]`);
try{
await go('/profile');await page.getByLabel('Body weight unit',{exact:true}).waitFor();
assert.equal(await page.getByRole('combobox',{name:/Height unit/}).count(),1);
assert.equal(await page.getByRole('combobox',{name:/Body weight unit|Weight unit/}).count(),1);
await page.getByLabel('Body weight',{exact:true}).fill('80');await page.getByLabel('Height',{exact:true}).fill('180.34');
failNextUnits=true;await page.getByLabel('Body weight unit',{exact:true}).selectOption('lb');await page.getByRole('alert').filter({hasText:'Could not save measurement units'}).waitFor();
assert.equal(await page.getByLabel('Body weight',{exact:true}).inputValue(),'80');assert.equal(await page.getByLabel('Body weight unit',{exact:true}).inputValue(),'kg');
await page.getByLabel('Body weight unit',{exact:true}).selectOption('lb');await page.waitForFunction(()=>document.querySelector('input[aria-label="Body weight"]').value==='176.36981');
for(const unit of ['kg','lb','kg']){await page.getByLabel('Body weight unit',{exact:true}).selectOption(unit);await page.waitForFunction(u=>document.querySelector('select[aria-label="Body weight unit"]').value===u&&!document.querySelector('select[aria-label="Body weight unit"]').disabled,unit);near(await page.getByLabel('Body weight',{exact:true}).inputValue(),unit==='kg'?80:176.36981);}
await page.getByLabel('Height unit',{exact:true}).selectOption('ft-in');await page.getByLabel('Height inches',{exact:true}).waitFor();near(await page.getByLabel('Height feet',{exact:true}).inputValue(),5);near(await page.getByLabel('Height inches',{exact:true}).inputValue(),11);
await page.getByLabel('Height inches',{exact:true}).fill('.');const count=writes.length;await page.getByLabel('Height unit',{exact:true}).selectOption('cm');await page.getByRole('alert').filter({hasText:'Finish or clear the height'}).waitFor();assert.equal(writes.length,count);assert.equal(await page.getByRole('button',{name:'Save nutrition profile',exact:true}).isDisabled(),true);
await page.getByLabel('Height inches',{exact:true}).fill('11');await page.getByLabel('Height unit',{exact:true}).selectOption('cm');await page.getByLabel('Height',{exact:true}).waitFor();near(await page.getByLabel('Height',{exact:true}).inputValue(),180.34);
await page.getByRole('button',{name:'Save nutrition profile',exact:true}).click();await page.getByText('Profile saved.',{exact:true}).waitFor();near(profile.weightKg,80);near(profile.heightCm,180.34);
outcomes.push('Single Profile editors; unsaved values survive failed saves, repeated conversions, feet/inches validation and canonical submission.');
await go('/precision');await page.getByRole('button',{name:'Progress',exact:true}).click();await page.getByLabel('Biology progress weight unit',{exact:true}).waitFor();
assert.equal(await page.getByRole('combobox',{name:'Biology progress weight unit',exact:true}).count(),1);
assert.equal(await page.getByRole('combobox',{name:'Biology progress waist unit',exact:true}).count(),1);
assert.equal(await page.getByRole('combobox',{name:'Unit for check-in weight',exact:true}).count(),0);
await input('weightKg').fill('100');await input('waistCm').fill('91.44');
await page.getByLabel('Biology progress weight unit',{exact:true}).selectOption('lb');await page.waitForFunction(()=>document.querySelector('input[name="weightKg"]').value==='220.46226');
await page.getByLabel('Biology progress waist unit',{exact:true}).selectOption('in');await page.waitForFunction(()=>document.querySelector('input[name="waistCm"]').value==='36');
failNextUnits=true;await page.getByLabel('Biology progress weight unit',{exact:true}).selectOption('kg');await page.getByRole('alert').filter({hasText:'Synthetic preference save failure'}).waitFor();near(await input('weightKg').inputValue(),220.46226);
await input('weightKg').fill('220.');const before=writes.length;await page.getByLabel('Biology progress weight unit',{exact:true}).selectOption('kg');await page.getByText('Finish or clear the measurement before switching units.',{exact:true}).waitFor();assert.equal(writes.length,before);assert.equal(await page.getByRole('button',{name:'Save check-in',exact:true}).isDisabled(),true);
await input('weightKg').fill('220.46226218487757');await page.getByLabel('Biology progress weight unit',{exact:true}).selectOption('kg');await page.waitForFunction(()=>document.querySelector('input[name="weightKg"]').value==='100');
await page.getByRole('button',{name:'Save check-in',exact:true}).click();await page.waitForFunction(()=>document.querySelector('main')?.textContent?.includes('Saved'));
const checkin=writes.find(w=>w.path==='/api/precision/records').body.payload;near(checkin.weightKg,100);near(checkin.waistCm,91.44);assert.equal(checkin.bodyFatPercent,null);
assert.deepEqual(records.filter(r=>r.kind==='lab'),sourceLabs);const report=buildPrecisionReport(records,contextSchema.parse({}),defaultPreferences,null);assert.equal(report.pendingLabs.length,1);assert.equal(report.labs.length,1);assert.equal(report.labs[0].value,73);assert.equal(report.labs[0].unit,'U/L');
outcomes.push('Single Biology editors; drafts convert once after success, failed/unfinished switches preserve meaning, canonical check-ins and untouched lab provenance.');
for(const width of [320,375,768,1440]){await page.setViewportSize({width,height:1000});for(const route of ['/profile','/progress','/precision']){await go(route);if(route==='/precision')await page.getByRole('button',{name:'Progress',exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} ${width}`);}}
await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.getByLabel('Biology progress weight unit',{exact:true}).focus();assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Biology progress weight unit');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Biology progress waist unit');
outcomes.push('320/375/768/1440 reflow, keyboard order and 200% CSS-zoom surrogate; physical devices/screen readers not claimed.');
assert.deepEqual(errors,[]);const output=process.env.BLOOM_REVIEW_OUTPUT||path.join(root,'work/unit-editor-regression');await fs.mkdir(output,{recursive:true});await fs.writeFile(path.join(output,'results.json'),JSON.stringify({outcomes,errors,synthetic:true,independentAcceptance:false},null,2));console.log(JSON.stringify({outcomes,errors},null,2));
}catch(e){console.error(JSON.stringify({errors,text:await page.locator("body").innerText()},null,2));throw e;}finally{await browser.close();await vite.close();}
