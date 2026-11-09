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
await store.createActivity('activity-qa',activitySchema.parse({title:'Morning walk',startedAt:'2026-10-27T14:00:00Z',minutes:15,timeZone:'America/Regina'}),randomUUID());await store.putExperienceSettings('activity-qa',{mode:'everyday',onboarding:{status:'complete'}});await store.createActivity('other',activitySchema.parse({title:'Other owner private activity',startedAt:'2026-10-27T14:00:00Z',minutes:10}),randomUUID());
const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const apiBase=`http://127.0.0.1:${api.address().port}`,baseline=process.env.BLOOM_ACTIVITY_BASELINE;
const uiRef=process.env.BLOOM_EXERCISE_UI_REF;const vite=await createServer({plugins:uiRef?[{name:'exercise-ui-baseline',enforce:'pre',load(id){if(id.split('?')[0]===path.resolve('client/src/pages/ActivityLog.tsx'))return execFileSync('git',['show',uiRef+':client/src/pages/ActivityLog.tsx'],{encoding:'utf8'});}}]:[],server:{host:'127.0.0.1',port:5246,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:1000},locale:'en-CA',timezoneId:'America/Regina'});page.setDefaultTimeout(12000);await page.clock.install({time:new Date('2026-10-27T18:00:00Z')});
let mode='everyday';let lose=false;const attempts=[],errors=[],output=process.env.BLOOM_REVIEW_OUTPUT||'/tmp/bloom-activity-log';mkdirSync(output,{recursive:true});page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];
 if(p==='/api/auth/me')json={user:{id:'activity-qa',username:'Synthetic activity'}};
 else if(p==='/api/profile')json={heightCm:null,weightKg:null};
 else if(p==='/api/precision')json={...buildPrecisionReport([],contextSchema.parse({}),defaultPreferences,null),availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[],note:'Synthetic empty intake'}};
 else if(p==='/api/health-sources/observations')json={observations:[],returned:0,hasMore:false,total:0,offset:0,limit:50,interpretation:'Synthetic empty source'};
 else if(p==='/api/experience/review')json={entries:0,from:'2026-10-20',to:'2026-10-26',metrics:[],next:'No comparison yet.',note:'Synthetic review'};
 else if(p.startsWith('/api/experience/')){
  if(p==='/api/experience/activities')attempts.push({body:req.postDataJSON(),key:req.headers()['idempotency-key']});
  const r=await fetch(apiBase+p+url.search,{method:req.method(),headers:{'content-type':'application/json','idempotency-key':req.headers()['idempotency-key']||'',...(req.headers()['if-match']?{'If-Match':req.headers()['if-match']}:{}),...(req.headers()['x-bloom-settings-fields']?{'X-Bloom-Settings-Fields':req.headers()['x-bloom-settings-fields']}:{})},...(req.postData()?{body:req.postData()}: {})}),text=await r.text();
  if(p==='/api/experience/activities'&&r.ok&&lose){lose=false;return route.fulfill({status:503,json:{error:'Synthetic activity response lost after commit'}});}
  return route.fulfill({status:r.status,contentType:'application/json',headers:r.headers.get('x-bloom-settings-revision')?{'X-Bloom-Settings-Revision':r.headers.get('x-bloom-settings-revision')}:{},body:text});
 }
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5246/activity');await page.getByRole('heading',{name:'Activity log',exact:true}).waitFor();await page.getByRole('heading',{name:'Morning walk',exact:true}).waitFor();
 for(const width of [390,1280]){await page.setViewportSize({width,height:1000});await page.screenshot({path:output+'/initial-'+width+'-light.png',fullPage:true,animations:'disabled'});}
 if(!uiRef){await page.setViewportSize({width:390,height:1000});await page.getByRole('button',{name:'Describe',exact:true}).click();await page.getByLabel('Describe your activity',{exact:true}).fill('Walked 30 minutes, then did 3 sets of bench press at 60 kg for 8 reps');await page.getByRole('button',{name:'Review description',exact:true}).click();await page.getByLabel('Load for set 2',{exact:true}).waitFor();
  for(const width of [320,390,1280]){await page.setViewportSize({width,height:1000});await page.screenshot({path:output+'/review-'+width+'-light.png',fullPage:true,animations:'disabled'});}
  await page.setViewportSize({width:390,height:1000});await page.evaluate(()=>{for(const [selector,n] of [['textarea[aria-label="Original description"]',1],['[data-activity-id] > summary',2],['[data-set-id]:nth-of-type(2)',3],['.activity-summary',4]]){const node=document.querySelector(selector);if(!node)continue;const target=node.tagName==='TEXTAREA'?node.closest('label'):node;target.style.position='relative';const badge=document.createElement('span');badge.dataset.reviewBadge='true';badge.textContent=String(n);badge.style.cssText='position:absolute;left:-6px;top:-6px;background:#fff;border:2px solid #172c26;color:#172c26;border-radius:50%;padding:0 6px;font:bold 14px/22px sans-serif;z-index:20';target.append(badge);}});await page.screenshot({path:output+'/review-390-annotated.png',fullPage:true,animations:'disabled'});await page.locator('[data-review-badge]').evaluateAll(nodes=>nodes.forEach(n=>n.remove()));
  await page.getByLabel('Load for set 2',{exact:true}).fill('55');await page.getByLabel('Reps for set 2',{exact:true}).fill('6');await page.getByText('22 reported reps',{exact:true}).waitFor();await page.screenshot({path:output+'/set2-edited-390.png',fullPage:true,animations:'disabled'});
  await page.evaluate(()=>document.documentElement.classList.add('dark'));await page.screenshot({path:output+'/review-390-dark.png',fullPage:true,animations:'disabled'});
 }
 const{writeFileSync}=await import('node:fs');writeFileSync(output+'/verification.json',JSON.stringify({sourceSha:uiRef||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),uiSourceDirty:!uiRef&&!!execFileSync('git',['status','--porcelain','--','client/src'],{encoding:'utf8'}).trim(),baselineMechanism:uiRef?'Pinned ActivityLog source override; other source is candidate':'Working candidate',backendSourceDirty:!!execFileSync('git',['status','--porcelain','--','server','shared'],{encoding:'utf8'}).trim(),synthetic:true,hosted:false,ownerRows:(await store.getExperienceRecords('activity-qa','activity')).length,attempts:attempts.length,errors,viewport:[320,390,1280],clock:'2026-10-27T18:00:00Z',timezone:'America/Regina',assets:'design/bloom/exercise-intelligence/2026-10-29',settledAnimations:true},null,2));assert.equal(attempts.length,0);assert.deepEqual(errors,[]);console.log('PASS matched synthetic Exercise v1.2 UI captures, no consumption write');
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
