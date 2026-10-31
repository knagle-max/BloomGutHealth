import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {createServer} from 'vite';
import {ExperienceStorage} from '../../server/experience-storage.ts';
import {PrecisionStorage} from '../../server/precision-storage.ts';
import {registerPrecisionRoutes} from '../../server/precision-routes.ts';
import {registerExperienceRoutes} from '../../server/experience-routes.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {parseLabPaste} from '../../shared/lab-paste.ts';
const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('observed-qa');");for(const file of ['0002_precision_nutrition.sql','0004_experience.sql'])await pg.exec(readFileSync(new URL('../../migrations/'+file,import.meta.url),'utf8'));
const db=drizzle(pg),experience=new ExperienceStorage(db),precision=new PrecisionStorage(db);
for(const[day,value]of [['01',5.2],['07',4.9],['13',4.3],['19',3.9],['25',3.7]])await precision.insertPrecisionRecord('observed-qa','lab',parseLabPaste(`LDL, ${value}, mmol/L`,`2026-10-${day}T12:00:00Z`).valid[0].payload);
await precision.insertPrecisionRecord('observed-qa','lab',parseLabPaste('LDL, 999','2026-10-26T12:00:00Z').pending[0].payload);
const store={getUser:async()=>({id:'observed-qa',age:30,dietaryPreferences:defaultPreferences}),getUserSamples:async()=>[],getMeals:async()=>[],getPrecisionRecords:id=>precision.getPrecisionRecords(id),getPrecisionContext:id=>precision.getPrecisionContext(id),getExperienceRecords:(id,kind)=>experience.getExperienceRecords(id,kind)};
const app=express();app.use(express.json());const auth=(req,_res,next)=>{req.session={userId:'observed-qa'};next();};registerPrecisionRoutes(app,auth,store);registerExperienceRoutes(app,auth,store,{});const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const apiBase=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5251,strictPort:true}});await vite.listen();const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);let unavailable=false,writes=0;const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];if(req.method()!=='GET')writes++;
 if(p==='/api/auth/me')json={user:{id:'observed-qa',username:'Synthetic observations'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(p==='/api/profile')json={heightCm:null,weightKg:null};
 else if(p==='/api/health-sources/observations')json={observations:[],returned:0,hasMore:false,total:0,offset:0,limit:50};
 else if(p==='/api/experience/review')json={entries:0,from:'2026-10-20',to:'2026-10-26',metrics:[],next:'No comparison yet.'};
 else if(p==='/api/precision'||p==='/api/experience/records'){if(p==='/api/precision'&&unavailable)return route.fulfill({status:503,json:{error:'Synthetic source unavailable'}});const response=await fetch(apiBase+p+url.search);return route.fulfill({status:response.status,contentType:'application/json',body:await response.text()});}
 await route.fulfill({json});});
try{
 const report=await(await fetch(apiBase+'/api/precision')).json();assert.equal(report.trends.length,1);assert.equal(report.trends[0].points.length,5);assert.equal(report.trends[0].comparable,false);assert.equal(report.trends[0].change,null,'Clinical comparison eligibility is unchanged');
 await page.goto('http://127.0.0.1:5251/progress?view=biology');const trend=page.locator('.evidence-insight').filter({has:page.getByRole('heading',{name:'LDL cholesterol',exact:true})});await trend.getByText(/Recorded difference: -1.5 mmol\/L/).waitFor();await trend.getByText(/Measurement comparability is unverified; this is not a confirmed clinical change/).waitFor();assert.equal(await trend.locator('.lab-point-button').count(),5);assert.equal(await trend.locator('svg polyline').count(),0);
 await trend.getByText('Sources, method & recorded values',{exact:true}).click();await trend.getByRole('heading',{name:'Questions for your healthcare professional',exact:true}).waitFor();await trend.getByText(/What does LDL cholesterol measure/).waitFor();assert.equal(await trend.getByRole('row').count(),6,'Pending-unit value is not silently plotted or added to the source series');
 unavailable=true;await page.reload();await page.getByText(/Laboratory history could not be checked/).waitFor();assert.equal(await page.getByText(/Recorded difference: -1.5/).count(),0);unavailable=false;await page.getByRole('button',{name:'Retry Progress observations',exact:true}).click();await page.getByText(/Recorded difference: -1.5 mmol\/L/).waitFor();
 await page.setViewportSize({width:320,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(writes,0);assert.deepEqual(errors,[]);console.log('PASS actual App/API/encrypted five LDL records→neutral difference with unverified comparability→source table/professional questions→source outage/retry; pending excluded,no clinical change,read-only,320px');
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
