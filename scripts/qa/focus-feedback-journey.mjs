import {execFileSync} from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {readFileSync,mkdirSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {ExperienceStorage} from '../../server/experience-storage.ts';
import {registerExperienceRoutes} from '../../server/experience-routes.ts';
import {checkinSchema} from '../../shared/experience.ts';
const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('feedback-qa'),('other');");await pg.exec(readFileSync(new URL('../../migrations/0004_experience.sql',import.meta.url),'utf8'));
const store=new ExperienceStorage(drizzle(pg)),app=express();app.use(express.json());registerExperienceRoutes(app,(req,_res,next)=>{req.session={userId:'feedback-qa'};next();},store,{});
const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const apiBase=`http://127.0.0.1:${api.address().port}`;
const base=checkinSchema.parse({date:'2026-10-20',mode:'everyday',energy:5,hunger:5,digestion:5,sleepHours:7,adherence:3,focus:'Regular breakfast'}),entry=await store.insertExperienceRecord('feedback-qa',{kind:'checkin',payload:base});
const baseline=process.env.BLOOM_FEEDBACK_BASELINE;
const vite=await createServer({plugins:baseline?[{name:'feedback-baseline',enforce:'pre',load(id){if(id.split('?')[0]===path.resolve('client/src/components/WeeklyReview.tsx'))return execFileSync('git',['show','a625c32:client/src/components/WeeklyReview.tsx'],{encoding:'utf8'});}}]:[],server:{host:'127.0.0.1',port:5244,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);
const errors=[],attempts=[];let lose=false,corrupt=false,readFailure=false;const output=process.env.BLOOM_REVIEW_OUTPUT||'/tmp/bloom-focus-feedback';mkdirSync(output,{recursive:true});
page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),url=new URL(req.url()),path=url.pathname;let json=[];
 if(path==='/api/auth/me')json={user:{id:'feedback-qa',username:'Synthetic feedback'}};
 else if(path==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(path==='/api/experience/review')json={entries:1,from:'2026-10-20',to:'2026-10-26',metrics:[],next:'Keep a manageable routine.',note:'Synthetic review'};
 else if(path.startsWith('/api/experience/')){
  if(path.endsWith('/feedback')&&req.method()==='GET'&&readFailure)return route.fulfill({status:503,json:{error:'Synthetic focus source unavailable'}});
  if(req.method()==='POST')attempts.push({body:req.postDataJSON(),key:req.headers()['idempotency-key']});
  const response=await fetch(apiBase+path+url.search,{method:req.method(),headers:{'content-type':'application/json','idempotency-key':req.headers()['idempotency-key']||''},...(req.postData()?{body:req.postData()}: {})});
  const text=await response.text();if(req.method()==='POST'&&response.ok&&corrupt){corrupt=false;return route.fulfill({json:{success:true}});}if(req.method()==='POST'&&response.ok&&lose){lose=false;return route.fulfill({status:503,json:{error:'Synthetic response lost after commit'}});}
  return route.fulfill({status:response.status,contentType:'application/json',body:text});
 }
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5244/weekly-review');await page.getByRole('heading',{name:'Your weekly check-in',exact:true}).waitFor();
 const review=page.getByRole('heading',{name:'What changed this week?',exact:true});await review.waitFor();
 const frame=()=>page.evaluate(()=>{const section=document.querySelector('main.science-page section');window.scrollTo(0,section.getBoundingClientRect().bottom+scrollY-100);});await frame();
 if(process.env.BLOOM_FEEDBACK_BASELINE){await page.screenshot({path:output+'/before.png'});console.log('PASS: matched synthetic Weekly Review baseline captured');}
 else{
 await page.getByText('Review responses to saved focuses',{exact:true}).click();await page.getByLabel('Saved check-in',{exact:true}).selectOption(entry.id);
 const choice=page.getByLabel('How was this focus for you?',{exact:true});await choice.waitFor();await frame();await page.screenshot({path:output+'/after.png'});assert.equal(await choice.inputValue(),'');
 await choice.selectOption('helped');lose=true;await page.getByRole('button',{name:'Save response',exact:true}).click();await page.getByRole('alert').filter({hasText:'Synthetic response lost'}).waitFor();assert.equal(await choice.inputValue(),'helped');assert.equal(await choice.isDisabled(),true);
 await page.getByRole('button',{name:'Retry same response',exact:true}).click();await page.getByText('Response saved.',{exact:true}).waitFor();assert.deepEqual(attempts[0],attempts[1]);
 await choice.selectOption('disliked');corrupt=true;await page.getByRole('button',{name:'Save response',exact:true}).click();await page.getByRole('alert').filter({hasText:'could not be verified'}).waitFor();await page.getByRole('button',{name:'Retry same response',exact:true}).click();await page.getByText('Response saved.',{exact:true}).waitFor();assert.deepEqual(attempts[2],attempts[3]);
 const record=(await store.getExperienceRecords('feedback-qa','checkin'))[0];assert.equal(record.payload.focusFeedback.response,'disliked');
 await store.updateExperienceRecord('feedback-qa',entry.id,{kind:'checkin',payload:{...base,energy:9,notes:'Current notes retained',focus:'New focus elsewhere'}});
 await choice.selectOption('liked');await page.getByRole('button',{name:'Save response',exact:true}).click();await page.getByRole('alert').filter({hasText:'focus or response changed'}).waitFor();assert.equal(await page.getByRole('button',{name:'Retry same response',exact:true}).count(),0);
 await page.getByRole('button',{name:'Review current focus',exact:true}).click();await page.getByText('2026-10-20 · Everyday · New focus elsewhere',{exact:true}).waitFor();await page.getByText('For “Regular breakfast”',{exact:false}).waitFor();
 assert.equal(await choice.inputValue(),'');await choice.selectOption('no-benefit');await page.getByRole('button',{name:'Save response',exact:true}).click();await page.getByText('Response saved.',{exact:true}).waitFor();
 const saved=(await store.getExperienceRecords('feedback-qa','checkin'))[0];assert.equal(saved.payload.energy,9);assert.equal(saved.payload.notes,'Current notes retained');assert.equal(saved.payload.focusFeedback.focus,'New focus elsewhere');
 await page.getByRole('button',{name:'Clear response',exact:true}).click();await page.getByText('Response cleared.',{exact:true}).waitFor();await page.getByText('Previous response cleared',{exact:false}).waitFor();
 readFailure=true;await page.getByText('Review responses to saved focuses',{exact:true}).click();await page.getByText('Review responses to saved focuses',{exact:true}).click();await page.getByRole('alert').filter({hasText:'Synthetic focus source unavailable'}).waitFor();assert.equal(await choice.count(),0);readFailure=false;await page.getByRole('button',{name:'Review current focus',exact:true}).click();await choice.waitFor();
 await page.setViewportSize({width:320,height:900});await choice.focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'Save response');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.getByText('Review responses to saved focuses',{exact:true}).scrollIntoViewIfNeeded();
 assert.equal((await store.getExperienceRecords('other')).length,0);assert.deepEqual(errors,[]);console.log('PASS: rendered encrypted feedback selection, lost-response exact retry, stale-context review, ratings preservation, clear and 320px keyboard flow');
 }
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
