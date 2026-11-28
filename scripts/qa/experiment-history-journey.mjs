import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {createServer} from 'vite';
import {ExperienceStorage} from '../../server/experience-storage.ts';
import {registerExperienceRoutes} from '../../server/experience-routes.ts';
import {experimentSchema} from '../../shared/experience.ts';
import {setAppTheme} from './set-app-theme.mjs';

const baseline=process.env.BLOOM_EXPERIMENT_REF,output=process.env.BLOOM_REVIEW_OUTPUT;
const priorKey=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b');");
for(const file of['0004_experience.sql','0015_experiment_versions.sql'])await pg.exec(readFileSync(new URL('../../migrations/'+file,import.meta.url),'utf8'));
const store=new ExperienceStorage(drizzle(pg)),original=experimentSchema.parse({mode:'everyday',title:'Synthetic source-history focus',startsOn:'2026-10-10',endsOn:'2026-10-17',action:'One familiar food change',outcome:'Self-rated comfort',design:{baselineStartsOn:'2026-10-01',baselineEndsOn:'2026-10-07',metricUnit:'rating 0–10',measurementMethod:'Same source question each morning',expectedDirection:'observe',confoundersToTrack:'Sleep and medicines'},observations:[1,2,3].map(n=>({date:`2026-10-0${n}`,value:n-1,adherence:null,confounders:''})).concat([10,11,12].map(n=>({date:`2026-10-${n}`,value:n-9,adherence:100,confounders:'Original synthetic sleep note'})))});
const record=await store.insertExperienceRecord('a',{kind:'experiment',payload:original});
const otherRecord=await store.insertExperienceRecord('b',{kind:'experiment',payload:{...original,title:'Other account focus',observations:original.observations.map(value=>({...value,confounders:'Separate synthetic owner'}))}});
let actor='a',failHistory=false,holdHistory=false,releaseHistory;
const app=express();app.use(express.json());registerExperienceRoutes(app,(req,_res,next)=>{req.session={userId:actor};next();},store,{});
const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const apiBase=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({plugins:baseline?[{name:'experiment-history-baseline',enforce:'pre',load(id){const file='client/src/components/ExperimentObservations.tsx';if(id.split('?')[0]===path.resolve(file))return execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'});}}]:[],server:{host:'127.0.0.1',port:5268,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(15000);
const errors=[],writes=[];page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const request=route.request(),url=new URL(request.url());if(request.method()!=='GET')writes.push(url.pathname);
 if(url.pathname.startsWith('/api/experience/')){
  if(failHistory&&url.pathname.endsWith('/history'))return route.fulfill({status:503,json:{error:'Synthetic source-history failure'}});
  const response=await fetch(apiBase+url.pathname+url.search,{method:request.method(),headers:{'content-type':'application/json'},body:request.postData()}),body=await response.text();
  if(holdHistory&&url.pathname.endsWith('/history'))await new Promise(resolve=>releaseHistory=resolve);
  return route.fulfill({status:response.status,contentType:'application/json',body}).catch(()=>{});
 }
 return route.fulfill({json:url.pathname==='/api/auth/me'?{user:{id:actor,username:'Synthetic source-history review'}}:[]});
});
const card=page.getByRole('heading',{name:original.title,level:3,exact:true}).locator('..');
const capture=async()=>{if(!output)return;mkdirSync(output,{recursive:true});for(const width of[320,390])for(const theme of['light','dark']){await page.setViewportSize({width,height:3000});await setAppTheme(page,theme);const box=await card.boundingBox();await page.setViewportSize({width,height:Math.ceil(box.height)+250});await card.screenshot({path:`${output}/${baseline?'before':'after'}-${width}-${theme}.png`,animations:'disabled'});}};
try{
 await page.goto('http://127.0.0.1:5268/weekly-review');await card.getByText('Measurements & comparison',{exact:true}).click();await card.getByText('Add or correct an observation',{exact:true}).click();const form=card.locator('form').first();
 await form.getByLabel('Observation date',{exact:true}).fill('2026-10-10');await form.getByLabel('Value (rating 0–10)',{exact:true}).fill('0');await form.getByLabel('Followed the action (%) — optional',{exact:true}).fill('0');await form.getByLabel('Sleep, illness, training, medicines or other changes',{exact:true}).fill('Corrected synthetic source note');if(!output&&!baseline){
  await pg.exec('DROP TABLE experiment_versions');
  await form.getByRole('button',{name:'Save observation',exact:true}).click();
  await card.getByRole('alert').filter({hasText:'Your saved routine was not changed'}).waitFor();
  assert.equal(await form.getByLabel('Value (rating 0–10)',{exact:true}).inputValue(),'0','Failed correction retains the entered draft');
  assert.deepEqual((await store.getExperienceRecords('a'))[0].payload,original,'Missing history must preserve the saved source');
  assert.equal(await card.getByText('Observation saved.',{exact:true}).count(),0);
  await pg.exec(readFileSync(new URL('../../migrations/0015_experiment_versions.sql',import.meta.url),'utf8'));
 }
 await form.getByRole('button',{name:'Save observation',exact:true}).click();await card.getByText('Observation saved.',{exact:true}).waitFor();
 const current=(await store.getExperienceRecords('a'))[0];assert.equal(current.payload.observations.find(o=>o.date==='2026-10-10').value,0);assert.deepEqual(current.payload.observations.map(o=>o.date),original.observations.map(o=>o.date),'Correcting a dated observation preserves its position and the other source rows');assert.deepEqual((await store.getExperimentHistory('a',record.id)).versions[0].payload,original);assert.equal((await store.getExperienceRecords('b')).length,1);
 await card.getByText('Add or correct an observation',{exact:true}).click();
 if(baseline){assert.equal(await card.getByText('Previous saved versions',{exact:true}).count(),0);await capture();console.log('BEFORE pinned ExperimentObservations '+baseline+'; same actual UI correction/current source0, same App/styles/API/encrypted history fixture, previous versions not exposed.');}
 else{
  const history=card.locator('details').filter({has:page.locator(':scope > summary').filter({hasText:'Previous saved versions'})});await history.locator(':scope > summary').focus();await page.keyboard.press('Enter');await history.getByText('Showing 1 of 1 captured versions, most recent first.',{exact:true}).waitFor();await history.getByText(/^Saved through /).click();await history.getByText(/2026-10-10: 1.*Adherence: 100%.*Original synthetic sleep note/).waitFor();await history.getByText('Method: Same source question each morning. Unit: rating 0–10.',{exact:true}).waitFor();assert.equal(await history.locator('input,textarea,select').count(),0);await capture();
  if(!output){
   failHistory=true;await page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');await queryClient.invalidateQueries({predicate:q=>String(q.queryKey[0]).endsWith('/history')});});await history.getByRole('alert').waitFor();assert.equal(await history.getByText('Showing 1 of 1 captured versions, most recent first.',{exact:true}).count(),0);failHistory=false;await history.getByRole('button',{name:'Retry previous versions',exact:true}).click();await history.getByText('Showing 1 of 1 captured versions, most recent first.',{exact:true}).waitFor();
   await page.reload();await card.getByText('Measurements & comparison',{exact:true}).click();await card.getByText(/2026-10-10: 0.*Adherence: 0%/).waitFor();await card.getByText('Previous saved versions',{exact:true}).click();await card.getByText('Showing 1 of 1 captured versions, most recent first.',{exact:true}).waitFor();
   const exported=await(await fetch(apiBase+'/api/experience/export')).json();assert.equal(exported.history.versions[0].payload.observations.find(o=>o.date==='2026-10-10').value,1);assert.equal(exported.records[0].payload.observations.find(o=>o.date==='2026-10-10').value,0);assert.match(exported.note,/do not establish cause/);
   await card.getByText('Observation coverage & limits',{exact:true}).focus();await page.keyboard.press('Enter');await card.getByText(/Follow-up adherence: 3 days reported, 0 recorded days unknown, 1 explicitly zero/).waitFor();
   for(const width of[320,390,768,1440])for(const theme of['light','dark'])for(const scale of['100','text200','page200']){await page.setViewportSize({width,height:1000});await setAppTheme(page,theme);await page.evaluate(scale=>{document.documentElement.style.fontSize=scale==='text200'?'200%':'';document.documentElement.style.zoom=scale==='page200'?'2':'';},scale);const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2).slice(-18).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,90),right:e.getBoundingClientRect().right}))}));if(overflow.scroll>overflow.width+2)console.error(JSON.stringify(overflow));assert.equal(overflow.scroll<=overflow.width+2,true,`Outcome coverage overflow ${width}/${theme}/${scale}`);}
   await page.evaluate(()=>{document.documentElement.style.fontSize='';document.documentElement.style.zoom='';});await page.setViewportSize({width:390,height:1000});
   const futurePayload=experimentSchema.parse({...JSON.parse(JSON.stringify(original).replaceAll('2026-10','2099-10')),title:'Synthetic future observations'}),future=await store.insertExperienceRecord('a',{kind:'experiment',payload:futurePayload});
   await page.reload();const futureCard=page.getByRole('heading',{name:futurePayload.title,level:3,exact:true}).locator('..');await futureCard.getByText('Measurements & comparison',{exact:true}).click();await futureCard.getByText('Insufficient data',{exact:true}).waitFor();await futureCard.getByText('Observation coverage & limits',{exact:true}).click();await futureCard.getByText(/6 future-dated entries excluded/).waitFor();assert.equal(await futureCard.getByText(/Future-dated entry — excluded from comparison/).count(),6);assert.equal((await store.getExperienceRecords('a')).find(r=>r.id===future.id).payload.observations.length,6);await store.deleteExperienceRecord('a',future.id);
   await page.reload();await card.getByText('Measurements & comparison',{exact:true}).click();await card.getByText('Previous saved versions',{exact:true}).click();await card.getByText('Showing 1 of 1 captured versions, most recent first.',{exact:true}).waitFor();
   holdHistory=true;await page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');void queryClient.invalidateQueries({predicate:q=>String(q.queryKey[0]).endsWith('/history')});});for(let i=0;i<200&&!releaseHistory;i++)await new Promise(resolve=>setTimeout(resolve,20));assert.ok(releaseHistory);actor='b';await page.evaluate(()=>dispatchEvent(new StorageEvent('storage',{key:'bloom-session-change',newValue:'synthetic-history-owner-switch'})));await card.waitFor({state:'detached'});holdHistory=false;releaseHistory();assert.equal(await page.getByText('Original synthetic sleep note',{exact:false}).count(),0);assert.equal((await store.getExperienceRecords('b')).length,1);
   actor='a';await page.evaluate(()=>dispatchEvent(new StorageEvent('storage',{key:'bloom-session-change',newValue:'synthetic-history-return-owner'})));await card.waitFor();await card.getByText('Measurements & comparison',{exact:true}).click();await card.getByText('Delete this focus',{exact:true}).click();await card.getByRole('button',{name:'Delete focus and history',exact:true}).click();await card.waitFor({state:'detached'});assert.equal(await store.getExperimentHistory('a',record.id),null);assert.equal((await pg.query('SELECT * FROM experiment_versions')).rows.length,0);assert.equal((await store.getExperienceRecords('b'))[0].id,otherRecord.id);
  }
  console.log('PASS history-storage outage preserves source/draft, restored-storage retry; actual App/handlers/encrypted SQL correction0 vs prior1, source context/adherence/units retained, keyboard readonly history, failure withdrawal/retry/reload/export/owner switch, explicit parent deletion removes history without changing other owner, reflow; synthetic records, no clinical or device approval.');
 }
 assert.deepEqual(writes,output||baseline?[`/api/experience/records/${record.id}`]:[`/api/experience/records/${record.id}`,`/api/experience/records/${record.id}`,`/api/experience/records/${record.id}`]);assert.deepEqual(errors,[]);
}finally{releaseHistory?.();await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(priorKey===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=priorKey;}
