import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const original={version:1,capture:'manual-checkin',fields:{weight:{value:'220.000',unit:'lb'},waist:{value:'36.00',unit:'in'},adherencePercent:{value:'0.0',unit:'%'}}};
const values={measuredAt:'2026-10-01T12:00:00Z',weightKg:220/2.2046226218487757,waistCm:36*2.54,bodyFatPercent:null,bloating:null,energy:null,adherencePercent:0,planId:null};
const records=[{id:'known-source',kind:'checkin',createdAt:values.measuredAt,payload:{...values,notes:'Known source record',entrySource:original}},{id:'legacy-source',kind:'checkin',createdAt:'2026-09-30T12:00:00Z',payload:{...values,measuredAt:'2026-09-30T12:00:00Z',notes:'Legacy source record'}}];
let actor='synthetic-a',mode='everyday',weightUnit='lb';
const vite=await createServer({server:{host:'127.0.0.1',port:5269,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);const errors=[],writes=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',route=>{const req=route.request(),p=new URL(req.url()).pathname;if(req.method()!=='GET')writes.push(p);let json=[];
 if(p==='/api/precision/records'&&req.method()==='POST'){
  const body=req.postDataJSON();assert.equal(body.kind,'checkin');
  records.unshift({id:`captured-${records.length}`,kind:'checkin',createdAt:new Date().toISOString(),payload:body.payload});
  return route.fulfill({status:201,json:{success:true}});
 }
 if(p==='/api/experience/settings'&&req.method()==='PATCH'){const body=req.postDataJSON();weightUnit=body.displayUnits?.bodyWeight??weightUnit;}

 if(p==='/api/auth/me')json={user:{id:actor,username:'Synthetic check-in source'}};
 else if(p==='/api/precision')json={...buildPrecisionReport(actor==='synthetic-a'?records:[],contextSchema.parse({}),defaultPreferences,null),availableReports:[],journalSymptoms:[],records:actor==='synthetic-a'?records:[],intake:{days:28,mealsLogged:0,nutrients:[]}};
 else if(p==='/api/profile')json={id:actor,heightCm:180,weightKg:70,age:30,sex:'female',activityLevel:'moderate'};
 else if(p==='/api/experience/settings')json={mode,onboarding:{status:'complete'},displayUnits:{height:'cm',bodyWeight:weightUnit,circumference:'in',hydration:'mL',temperature:'C',energy:'kcal',foodWeight:'g'}};
 else if(p==='/api/experience/review')json={entries:0,metrics:[],from:'2026-09-01',to:'2026-11-01',next:'Record a check-in',note:'Synthetic'};
 else if(p==='/api/preferences')json=defaultPreferences;
 else if(p==='/api/health-sources/observations')json={observations:[],returned:0,total:0,hasMore:false};
 return route.fulfill({json});});
try{
 await page.goto('http://127.0.0.1:5269/precision?tab=progress');
 const form=page.locator('form').filter({has:page.getByRole('heading',{name:'Record your response',exact:true})});
 await form.locator('[name=weightKg]').fill('220.000');
 await form.locator('[name=waistCm]').fill('36.00');
 await form.locator('[name=bloating]').fill('0');
 await form.locator('[name=energy]').fill('7');
 await form.locator('[name=adherencePercent]').fill('0.0');
 await form.locator('[name=notes]').fill('New captured entry');
 await page.getByRole('combobox',{name:'Biology progress weight unit'}).selectOption('kg');
 await page.waitForFunction(()=>document.querySelector('input[name=weightKg]')?.value!=='220.000');
 await form.getByRole('button',{name:'Save check-in',exact:true}).click();
 await page.waitForFunction(()=>document.body.textContent.includes('New captured entry'));
 assert.equal(records.length,3);const saved=records[0].payload;
 assert.deepEqual(saved.entrySource.fields,{weight:{value:'220.000',unit:'lb'},waist:{value:'36.00',unit:'in'},bloating:{value:'0',unit:'0-10'},energy:{value:'7',unit:'0-10'},adherencePercent:{value:'0.0',unit:'%'}});
 assert.equal(saved.weightKg,220/2.2046226218487757);assert.equal(saved.waistCm,36*2.54);assert.equal(saved.bloating,0);
 await page.reload();const detail=page.locator('#precision-observation-captured-2');await detail.waitFor();await detail.getByText('Entered values & units',{exact:true}).click();await detail.getByText('220.000 lb',{exact:true}).waitFor();await detail.getByText('0.0 %',{exact:true}).waitFor();
 await form.getByRole('button',{name:'Use saved Profile weight',exact:true}).click();
 await form.locator('[name=notes]').fill('Copied profile source unknown');await form.getByRole('button',{name:'Save check-in',exact:true}).click();
 await page.waitForFunction(()=>document.body.textContent.includes('Copied profile source unknown'));
 assert.equal(records.length,4);assert.equal(records[0].payload.entrySource,undefined);assert.equal(records[0].payload.weightKg,70);
 mode='athlete';await page.goto('http://127.0.0.1:5269/progress');await page.getByRole('tab',{name:'Biology',exact:true}).click();const row=page.locator('.progress-dated-observation').filter({hasText:'New captured entry'});await row.getByText('Entered values & units',{exact:true}).click();await row.getByText('220.000 lb',{exact:true}).waitFor();
 actor='synthetic-b';await page.reload();await page.getByRole('tab',{name:'Biology',exact:true}).click();await page.getByText('No dated body observations yet.',{exact:false}).waitFor();assert.equal(await page.getByText('220.000 lb',{exact:true}).count(),0);
 assert.equal(writes.filter(p=>p==='/api/precision/records').length,2);assert.deepEqual(errors,[]);
 console.log('PASS actual App check-in capture: typed lb/in precision, unit change before save, zero scalar tokens, reload/shared mode projection, copied Profile origin unknown, one record per save and other-owner isolation. Mock HTTP; encrypted actual HTTP/SQL separately tested.');
}finally{await browser.close();await vite.close();}
