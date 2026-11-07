import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const original={version:1,capture:'manual-checkin',fields:{weight:{value:'220.000',unit:'lb'},waist:{value:'36.00',unit:'in'},adherencePercent:{value:'0.0',unit:'%'}}};
const values={measuredAt:'2026-10-01T12:00:00Z',weightKg:220/2.2046226218487757,waistCm:36*2.54,bodyFatPercent:null,bloating:null,energy:null,adherencePercent:0,planId:null};
const records=[{id:'known-source',kind:'checkin',createdAt:values.measuredAt,payload:{...values,notes:'Known source record',entrySource:original}},{id:'legacy-source',kind:'checkin',createdAt:'2026-09-30T12:00:00Z',payload:{...values,measuredAt:'2026-09-30T12:00:00Z',notes:'Legacy source record'}}];
let actor='synthetic-a',mode='everyday',weightUnit='kg';
const vite=await createServer({server:{host:'127.0.0.1',port:5269,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);const errors=[],writes=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',route=>{const req=route.request(),p=new URL(req.url()).pathname;if(req.method()!=='GET')writes.push(p);let json=[];
 if(p==='/api/auth/me')json={user:{id:actor,username:'Synthetic check-in source'}};
 else if(p==='/api/precision')json={...buildPrecisionReport(actor==='synthetic-a'?records:[],contextSchema.parse({}),defaultPreferences,null),availableReports:[],journalSymptoms:[],records:actor==='synthetic-a'?records:[],intake:{days:28,mealsLogged:0,nutrients:[]}};
 else if(p==='/api/profile')json={id:actor,heightCm:180,weightKg:70,age:30,sex:'female',activityLevel:'moderate'};
 else if(p==='/api/experience/settings')json={mode,onboarding:{status:'complete'},displayUnits:{height:'cm',bodyWeight:weightUnit,circumference:'in',hydration:'mL',temperature:'C',energy:'kcal',foodWeight:'g'}};
 else if(p==='/api/experience/review')json={entries:0,metrics:[],from:'2026-09-01',to:'2026-11-01',next:'Record a check-in',note:'Synthetic'};
 else if(p==='/api/preferences')json=defaultPreferences;
 else if(p==='/api/health-sources/observations')json={observations:[],returned:0,total:0,hasMore:false};
 return route.fulfill({json});});
try{
 await page.goto('http://127.0.0.1:5269/progress');
 await page.getByRole('tab',{name:'Biology',exact:true}).click();
 const known=page.locator('.progress-dated-observation').filter({hasText:'Known source record'}),legacy=page.locator('.progress-dated-observation').filter({hasText:'Legacy source record'});
 await known.waitFor();await known.getByText('Entered values & units',{exact:true}).click();await known.getByText('220.000 lb',{exact:true}).waitFor();await known.getByText('36.00 in',{exact:true}).waitFor();await known.getByText('0.0 %',{exact:true}).waitFor();
 await legacy.getByText('Entered values & units',{exact:true}).click();await legacy.getByText('Original entered text and units were not retained for this record. The saved canonical values remain available; their original entry cannot be reconstructed.',{exact:true}).waitFor();
 for(const width of[320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 mode='athlete';weightUnit='lb';await page.reload();await page.getByRole('tab',{name:'Biology',exact:true}).click();await known.getByText('Entered values & units',{exact:true}).click();await known.getByText('220.000 lb',{exact:true}).waitFor();
 await page.goto('http://127.0.0.1:5269/precision?tab=progress&observation=known-source');
 const detail=page.locator('#precision-observation-known-source');await detail.waitFor();await detail.getByText('Entered values & units',{exact:true}).click();await detail.getByText('220.000 lb',{exact:true}).waitFor();
 actor='synthetic-b';await page.goto('http://127.0.0.1:5269/progress');await page.getByRole('tab',{name:'Biology',exact:true}).click();await page.getByText('No dated body observations yet.',{exact:false}).waitFor();assert.equal(await page.getByText('220.000 lb',{exact:true}).count(),0);
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 console.log('PASS actual App source reader: original lb/in lexical precision versus display preferences, zero adherence, legacy unknown, shared Progress/Biology disclosure, both modes,320–1440px/reload/other owner/no writes. Synthetic fixture; actual HTTP/encrypted SQL persistence tested separately.');
}finally{await browser.close();await vite.close();}
