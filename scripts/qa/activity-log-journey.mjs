import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {createRequire} from 'node:module';
import {readFileSync,mkdirSync} from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {createServer} from 'vite';
import {ExperienceStorage} from '../../server/experience-storage.ts';
import {registerExperienceRoutes} from '../../server/experience-routes.ts';
import {activitySchema} from '../../shared/experience.ts';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('activity-qa'),('other');");await pg.exec(readFileSync(new URL('../../migrations/0004_experience.sql',import.meta.url),'utf8'));
const store=new ExperienceStorage(drizzle(pg)),app=express();app.use(express.json());registerExperienceRoutes(app,(req,_res,next)=>{req.session={userId:'activity-qa'};next();},store,{});
await store.createActivity('activity-qa',activitySchema.parse({title:'Morning walk',startedAt:'2026-10-27T14:00:00Z',minutes:15,timeZone:'America/Regina'}),randomUUID());await store.createActivity('other',activitySchema.parse({title:'Other owner private activity',startedAt:'2026-10-27T14:00:00Z',minutes:10}),randomUUID());
const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const apiBase=`http://127.0.0.1:${api.address().port}`,baseline=process.env.BLOOM_ACTIVITY_BASELINE;
const vite=await createServer({plugins:baseline?[{name:'activity-baseline',enforce:'pre',load(id){if(id.split('?')[0]===path.resolve('client/src/components/TodayStatus.tsx'))return execFileSync('git',['show','2042b61:client/src/components/TodayStatus.tsx'],{encoding:'utf8'});}}]:[],server:{host:'127.0.0.1',port:5246,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:1000},locale:'en-CA',timezoneId:'America/Regina'});page.setDefaultTimeout(12000);await page.clock.install({time:new Date('2026-10-27T18:00:00Z')});
let lose=false;const attempts=[],errors=[],output=process.env.BLOOM_REVIEW_OUTPUT||'/tmp/bloom-activity-log';mkdirSync(output,{recursive:true});page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];
 if(p==='/api/auth/me')json={user:{id:'activity-qa',username:'Synthetic activity'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(p==='/api/profile')json={heightCm:null,weightKg:null};
 else if(p==='/api/precision')json={...buildPrecisionReport([],contextSchema.parse({}),defaultPreferences,null),availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[],note:'Synthetic empty intake'}};
 else if(p==='/api/health-sources/observations')json={observations:[],returned:0,hasMore:false,total:0,offset:0,limit:50,interpretation:'Synthetic empty source'};
 else if(p==='/api/experience/review')json={entries:0,from:'2026-10-20',to:'2026-10-26',metrics:[],next:'No comparison yet.',note:'Synthetic review'};
 else if(p.startsWith('/api/experience/')){
  if(p==='/api/experience/activities')attempts.push({body:req.postDataJSON(),key:req.headers()['idempotency-key']});
  const r=await fetch(apiBase+p+url.search,{method:req.method(),headers:{'content-type':'application/json','idempotency-key':req.headers()['idempotency-key']||''},...(req.postData()?{body:req.postData()}: {})}),text=await r.text();
  if(p==='/api/experience/activities'&&r.ok&&lose){lose=false;return route.fulfill({status:503,json:{error:'Synthetic activity response lost after commit'}});}
  return route.fulfill({status:r.status,contentType:'application/json',body:text});
 }
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5246/');await page.locator('.today-status-strip button').click();const movement=page.locator('#today-movement-source');await movement.waitFor();
 await movement.evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-100));
 if(baseline){await movement.getByText('Basic Everyday activity entry is not available yet.',{exact:false}).waitFor();await page.screenshot({path:output+'/before.png'});console.log('PASS: matched Today Move baseline with the same encrypted activity fixture');}
 else{
 await movement.getByText('Morning walk',{exact:true}).waitFor();await page.screenshot({path:output+'/after.png'});await movement.getByRole('link',{name:'Log activity',exact:true}).click();
 await page.getByRole('heading',{name:'Activity log',exact:true}).waitFor();await page.getByRole('button',{name:'Other activity',exact:true}).click();await page.locator('[data-activity-id]').first().locator(':scope > summary').click();await page.getByLabel('Activity name 1',{exact:true}).fill('Lunch walk');await page.getByLabel('When did you start?',{exact:true}).fill('2026-10-27T10:00');await page.getByLabel('Duration for activity 1',{exact:true}).fill('25');await page.getByText('Review details & assumptions',{exact:true}).click();await page.getByLabel('How did it feel?',{exact:true}).selectOption('easy');
 lose=true;await page.getByRole('button',{name:'Save activity',exact:true}).click();await page.getByRole('alert').filter({hasText:'response lost after commit'}).waitFor();assert.equal((await store.getExperienceRecords('activity-qa','activity')).length,2);assert.equal(await page.getByLabel('Activity name 1',{exact:true}).isDisabled(),true);
 await page.getByRole('button',{name:'Retry same activity',exact:true}).click();await page.getByText('Activity saved.',{exact:true}).waitFor();assert.deepEqual(attempts[0],attempts[1]);assert.equal((await store.getExperienceRecords('activity-qa','activity')).length,2);
 const lunch=page.locator('article').filter({has:page.getByRole('heading',{name:'Lunch walk',exact:true})});await lunch.getByRole('button',{name:'Correct activity',exact:true}).click();await page.locator('[data-activity-id]').first().locator(':scope > summary').click();await page.getByLabel('Duration for activity 1',{exact:true}).fill('30');await page.getByRole('button',{name:'Save activity correction',exact:true}).click();await page.getByText('Activity updated.',{exact:true}).waitFor();await lunch.getByText('30 minutes',{exact:false}).first().waitFor();
 const saved=(await store.getExperienceRecords('activity-qa','activity')).find(row=>row.payload.title==='Lunch walk');assert.equal(saved.payload.startedAt,'2026-10-27T16:00:00.000Z');assert.equal(saved.payload.timeZone,'America/Regina');assert.equal(saved.payload.minutes,30);assert.deepEqual(await store.getExperienceRecords('activity-qa','session'),[]);
 await page.screenshot({path:output+'/activity-screen.png'});await page.getByRole('link',{name:'Back to Today',exact:true}).click();await page.locator('.today-status-strip button').getByText('2 activity entries',{exact:true}).waitFor();await page.locator('.today-status-strip button').click();await movement.getByText('Lunch walk',{exact:true}).waitFor();await movement.getByText('30 minutes',{exact:false}).waitFor();
 await page.getByRole('link',{name:'Progress',exact:true}).last().click();await page.getByRole('tab',{name:'Activity',exact:true}).click();await page.getByRole('heading',{name:'Lunch walk',exact:true}).waitFor();await page.getByRole('link',{name:'Log or correct activity',exact:true}).click();await lunch.getByRole('button',{name:'Delete',exact:true}).click();await lunch.getByRole('button',{name:'Delete activity',exact:true}).click();await page.getByText('Activity deleted.',{exact:true}).waitFor();await page.getByRole('heading',{name:'Lunch walk',exact:true}).waitFor({state:'detached'});assert.equal((await store.getExperienceRecords('activity-qa','activity')).length,1);
 await page.setViewportSize({width:320,height:900});await page.getByRole('button',{name:'Other activity',exact:true}).click();await page.locator('[data-activity-id]').first().locator(':scope > summary').click();await page.getByLabel('Activity name 1',{exact:true}).focus();await page.keyboard.press('Tab');assert.equal(await page.getByLabel('Duration for activity 1',{exact:true}).evaluate(el=>el===document.activeElement),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.doesNotMatch(await page.locator('body').innerText(),/Other owner private activity/);assert.deepEqual(errors,[]);console.log('PASS actual encrypted activity: Today→log→lost response exact retry→history→correction→Today→Progress→delete; owner isolation, no training inference and keyboard320px');
 }
}catch(error){console.error({errors,body:(await page.locator('body').innerText()).slice(0,3000)});throw error;}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
