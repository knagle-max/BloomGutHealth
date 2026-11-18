import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {createServer} from 'vite';
import {PrecisionStorage} from '../../server/precision-storage.ts';
import {LabResponseContextStorage} from '../../server/lab-response-context-storage.ts';
import {registerExperienceRoutes} from '../../server/experience-routes.ts';
import {registerPrecisionRoutes} from '../../server/precision-routes.ts';
import {labSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {experienceSettingsSchema} from '../../shared/experience.ts';
const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('a'),('b');");
for(const migration of ['0002_precision_nutrition.sql','0004_experience.sql'])await pg.exec(readFileSync('migrations/'+migration,'utf8'));
const db=drizzle(pg),storage=new PrecisionStorage(db),context=new LabResponseContextStorage(db,()=>new Date('2026-11-16T12:00:00Z'));
Object.assign(storage,{getUser:async id=>({id,age:40,dietaryPreferences:defaultPreferences}),getUserSamples:async()=>[],getMeals:async()=>[],getMetabolites:async()=>[]});
const reportId=randomUUID();
const source=(marker,value,unit,low,high)=>labSchema.parse({marker,value,unit,measuredAt:'2026-10-01T12:00:00Z',laboratory:'Synthetic glycemic laboratory',method:'Synthetic source assay',fasting:'yes',referenceLow:low,referenceHigh:high,sourceReport:{importId:reportId,enteredDate:'2026-10-01',enteredTime:'12:00'}});
let a1c=await storage.insertPrecisionRecord('a','lab',source('hba1c',6.2,'%',4.5,5.9));
const glucose=await storage.insertPrecisionRecord('a','lab',source('glucose',5,'mmol/L',3.3,5.5));
const originals=await storage.getPrecisionRecords('a'),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('X-Synthetic-User')};next();});
const auth=(req,res,next)=>req.session?.userId?next():res.sendStatus(401);storage.labResponseContext=context;const precisionService=registerPrecisionRoutes(app,auth,storage);registerExperienceRoutes(app,auth,storage,precisionService);
const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const backend=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5305,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000},timezoneId:'UTC'});page.setDefaultTimeout(15000);
let actor='a',unavailable=false;const errors=[],writes=[];page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const request=route.request(),url=new URL(request.url()),p=url.pathname;
 if(request.method()!=='GET'){writes.push(p);return route.fulfill({status:403,json:{error:'Read-only synthetic fixture'}});}
 if(p==='/api/precision'){
  if(unavailable)return route.fulfill({status:503,json:{error:'Synthetic source outage'}});
  const response=await fetch(backend+p+url.search,{headers:{'X-Synthetic-User':actor}});return route.fulfill({status:response.status,headers:{'content-type':'application/json','cache-control':'no-store'},body:Buffer.from(await response.arrayBuffer())});
 }
 const json=p==='/api/auth/me'?{user:{id:actor,username:'Synthetic glycemic review'}}:p==='/api/experience/settings'?experienceSettingsSchema.parse({mode:'everyday',onboarding:{status:'complete'}}):p==='/api/preferences'?defaultPreferences:p==='/api/profile'?{heightCm:null,weightKg:null}:p==='/api/health-sources'?{connections:[]}:p==='/api/health-sources/observations'?{observations:[],returned:0,total:0,hasMore:false}:[];return route.fulfill({json});
});
const go=async()=>{await page.goto('http://127.0.0.1:5305/precision?tab=labs');await page.getByRole('heading',{name:'Bloodwork',exact:true}).waitFor();};
const open=async()=>{const family=page.locator('.lab-panel-review-family').filter({has:page.locator('summary').filter({hasText:'Glucose & HbA1c'})});await family.locator('summary').first().click();return family;};
try{
 await go();let family=await open();await family.getByRole('heading',{name:'Why these results can differ',exact:true}).waitFor();await family.getByText(/This glucose result does not cancel/).waitFor();
 assert.deepEqual(await storage.getPrecisionRecords('a'),originals,'Reading interpretation does not rewrite observations');
 const link=family.getByRole('link',{name:'Review original HbA1c result',exact:true});assert.equal(await link.getAttribute('href'),'/precision?tab=labs&labResult='+a1c.id);await link.focus();await page.keyboard.press('Enter');const originalRow=page.locator('[id="lab-source-row-'+a1c.id+'"]');await originalRow.waitFor();await page.waitForFunction(id=>document.activeElement?.id==='lab-source-row-'+id,a1c.id);assert.match(await originalRow.innerText(),/HbA1c/);
 await go();family=await open();await family.getByRole('heading',{name:'Why these results can differ',exact:true}).waitFor();
 await storage.deleteLabEntry('a',a1c.id);await go();assert.equal(await page.getByRole('heading',{name:'Why these results can differ',exact:true}).count(),0);
 a1c=await storage.insertPrecisionRecord('a','lab',source('hba1c',5.5,'%',4.5,5.9));await go();assert.equal(await page.getByRole('heading',{name:'Why these results can differ',exact:true}).count(),0);
 await storage.deleteLabEntry('a',a1c.id);a1c=await storage.insertPrecisionRecord('a','lab',source('hba1c',6.2,'%',4.5,5.9));await go();family=await open();await family.getByRole('heading',{name:'Why these results can differ',exact:true}).waitFor();
 unavailable=true;await go();assert.equal(await page.getByRole('heading',{name:'Why these results can differ',exact:true}).count(),0);unavailable=false;await go();family=await open();await family.getByRole('heading',{name:'Why these results can differ',exact:true}).waitFor();
 actor='b';await go();await page.getByText('Add laboratory results to browse your recorded markers. Missing measurements are not treated as zero.',{exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'Why these results can differ',exact:true}).count(),0);assert.equal((await storage.getPrecisionRecords('b')).length,0);
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);console.log('PASS real App/owned HTTP/encrypted SQL glycemic source discrepancy: original source preservation, keyboard exact HbA1c drilldown, reload, deletion, changed value suppression/restoration, source503 withdrawal/recovery, account isolation and no browser writes.');
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
