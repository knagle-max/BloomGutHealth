import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {createServer} from 'vite';
import {ExperienceStorage} from '../../server/experience-storage.ts';
import {registerExperienceRoutes} from '../../server/experience-routes.ts';
import {experienceSettingsSchema} from '../../shared/experience.ts';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('training-qa'),('other');");await pg.exec(readFileSync(new URL('../../migrations/0004_experience.sql',import.meta.url),'utf8'));
const store=new ExperienceStorage(drizzle(pg)),settings=experienceSettingsSchema.parse({mode:'athlete',onboarding:{status:'complete'}}),context=contextSchema.parse({ageGroup:'adult'});
store.getExperienceSettings=async()=>settings;store.getMeals=async()=>[];store.getPrecisionContext=async()=>context;store.getUser=async()=>({id:'training-qa',age:30,dietaryPreferences:defaultPreferences});
const app=express();app.use(express.json());registerExperienceRoutes(app,(req,_res,next)=>{req.session={userId:'training-qa'};next();},store,{reportFor:async()=>buildPrecisionReport([],context,defaultPreferences,null)});
const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const apiBase=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5247,strictPort:true}});await vite.listen();const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:1000},timezoneId:'America/Regina'});page.setDefaultTimeout(12000);await page.clock.install({time:new Date('2026-10-27T18:00:00Z')});
let lose=true;const attempts=[],errors=[];page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];
 if(p==='/api/auth/me')json={user:{id:'training-qa',username:'Synthetic training'}};
 else if(p==='/api/profile')json={weightKg:null,heightCm:null};
 else if(p.startsWith('/api/experience/')){
  const isSave=req.method()==='POST'&&(p==='/api/experience/sessions'||p==='/api/experience/records'&&req.postDataJSON()?.kind==='session');
  if(isSave)attempts.push({body:req.postDataJSON(),key:req.headers()['idempotency-key']});
  const response=await fetch(apiBase+p+url.search,{method:req.method(),headers:{'content-type':'application/json','idempotency-key':req.headers()['idempotency-key']||''},...(req.postData()?{body:req.postData()}: {})}),text=await response.text();
  if(isSave&&response.ok&&lose){lose=false;return route.fulfill({status:503,json:{error:'Synthetic session response lost after commit'}});}
  return route.fulfill({status:response.status,contentType:'application/json',body:text});
 }
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5247/athlete?date=2026-10-27');await page.locator('.athlete-home-hero').getByRole('button',{name:'Plan a session',exact:true}).click();const form=page.locator('#athlete-add-session form');await form.locator('input[name="title"]').fill('Afternoon ride');await form.locator('input[name="startsAt"]').fill('2026-10-27T15:00');await form.locator('input[name="minutes"]').fill('90');await form.getByLabel('Session discipline',{exact:true}).selectOption('endurance');await form.getByLabel('Intensity',{exact:true}).selectOption('moderate');await form.getByRole('button',{name:'Save training session',exact:true}).click();await form.getByRole('alert').filter({hasText:'response lost after commit'}).waitFor();assert.equal((await store.getExperienceRecords('training-qa','session')).length,1);
 if(process.env.BLOOM_SESSION_SAVE_RED){await form.getByRole('button',{name:'Save training session',exact:true}).click();await page.getByText('Training session saved in your calendar.',{exact:true}).waitFor();assert.equal((await store.getExperienceRecords('training-qa','session')).length,2);console.log('RED reproduced: ordinary retry after a committed lost response creates two training sessions.');}
 else{
 assert.equal(await form.locator('input[name="title"]').isDisabled(),true);await form.getByRole('button',{name:'Retry saving session',exact:true}).click();await page.getByText('Training session saved in your calendar.',{exact:true}).waitFor();assert.deepEqual(attempts[0],attempts[1]);const rows=await store.getExperienceRecords('training-qa','session');assert.equal(rows.length,1);assert.equal(rows[0].payload.minutes,90);assert.equal(rows[0].payload.startsAt,'2026-10-27T21:00:00.000Z');
 const day=await(await fetch(apiBase+'/api/experience/athlete-day',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({date:'2026-10-27',timezoneOffset:360,hour:12})})).json();assert.equal(day.minutes,90);assert.equal(day.sessions,1);assert.equal(day.blocked,true,'Missing reviewed profile does not become numerical clearance');
 await page.locator('.athlete-home-hero').getByRole('button',{name:'View session',exact:true}).click();await page.waitForFunction(id=>document.activeElement?.id===id,'athlete-session-'+rows[0].id);assert.deepEqual(await store.getExperienceRecords('other','session'),[]);await page.setViewportSize({width:320,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);console.log('PASS actual encrypted training: save→lost response→exact retry→one calendar entry/90 minutes→source focus; source date preserved, owner isolated, eligibility gates retained,320px');
 }
}catch(error){console.error({errors,attempts,form:await page.locator('#athlete-add-session').innerText().catch(()=>''),body:(await page.locator('body').innerText()).slice(0,2800)});throw error;}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
