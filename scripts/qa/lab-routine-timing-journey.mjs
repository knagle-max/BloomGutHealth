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
import {PrecisionStorage} from '../../server/precision-storage.ts';
import {registerExperienceRoutes} from '../../server/experience-routes.ts';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {parseLabPaste} from '../../shared/lab-paste.ts';
const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('timing-qa'),('other');");
for(const file of ['0002_precision_nutrition.sql','0004_experience.sql'])await pg.exec(readFileSync(new URL('../../migrations/'+file,import.meta.url),'utf8'));
const db=drizzle(pg),store=new ExperienceStorage(db),precision=new PrecisionStorage(db),app=express();app.use(express.json());registerExperienceRoutes(app,(req,_res,next)=>{req.session={userId:'timing-qa'};next();},store,{});
const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const apiBase=`http://127.0.0.1:${api.address().port}`;
const routine={mode:'everyday',title:'Regular breakfast trial',startsOn:'2026-10-10',endsOn:'2026-10-20',action:'Eat a familiar breakfast',outcome:'Daily energy',status:'planned',design:{baselineStartsOn:'2026-10-01',baselineEndsOn:'2026-10-07',metricUnit:'rating',measurementMethod:'Same daily scale',expectedDirection:'observe',confoundersToTrack:'Sleep and illness'}};
const ownTrial=await store.insertExperienceRecord('timing-qa',{kind:'experiment',payload:routine});await store.insertExperienceRecord('other',{kind:'experiment',payload:{...routine,title:'Other owner private trial'}});await store.insertExperienceRecord('timing-qa',{kind:'experiment',payload:{...routine,mode:'athlete',title:'Athlete only trial'}});
for(const day of ['2026-10-01','2026-10-12','2026-10-25']){
 const payload=parseLabPaste('ALT, 0, U/L',day+'T12:00:00Z').valid[0].payload;
 await precision.insertPrecisionRecord('timing-qa','lab',{...payload,laboratory:'Synthetic lab',method:'Same synthetic assay',...(day==='2026-10-25'?{}:{sourceReport:{importId:randomUUID(),enteredDate:day}})});
}
const pending=parseLabPaste('LDL, 0', '2026-10-12T12:00:00Z').pending[0].payload;await precision.insertPrecisionRecord('timing-qa','lab',pending);
const report=()=>precision.getPrecisionRecords('timing-qa').then(records=>({...buildPrecisionReport(records,contextSchema.parse({}),defaultPreferences,null),records,availableReports:[],intake:{days:28,mealsLogged:0,nutrients:[]}}));
const baseline=process.env.BLOOM_TIMING_BASELINE;
const vite=await createServer({plugins:baseline?[{name:'timing-baseline',enforce:'pre',load(id){if(id.split('?')[0]===path.resolve('client/src/pages/Progress.tsx'))return execFileSync('git',['show','3760580:client/src/pages/Progress.tsx'],{encoding:'utf8'});}}]:[],server:{host:'127.0.0.1',port:5245,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:1000},timezoneId:'America/Regina'});page.setDefaultTimeout(12000);
let unavailable=false,writes=0;const errors=[],output=process.env.BLOOM_REVIEW_OUTPUT||'/tmp/bloom-lab-routine-timing';mkdirSync(output,{recursive:true});page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];if(req.method()!=='GET')writes++;
 if(p==='/api/auth/me')json={user:{id:'timing-qa',username:'Synthetic timing'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(p==='/api/profile')json={heightCm:null,weightKg:null};
 else if(p==='/api/health-sources/observations')json={observations:[],returned:0,hasMore:false,total:0,offset:0,limit:50,interpretation:'Synthetic empty source'};
 else if(p==='/api/precision')json=await report();
 else if(p==='/api/experience/review')json={entries:0,from:'2026-10-20',to:'2026-10-26',metrics:[],next:'No comparison yet.',note:'Synthetic review'};
 else if(p.startsWith('/api/experience/')){
  if(p==='/api/experience/records'&&unavailable)return route.fulfill({status:503,json:{error:'Synthetic routines unavailable'}});
  const r=await fetch(apiBase+p+url.search);return route.fulfill({status:r.status,contentType:'application/json',body:await r.text()});
 }
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5245/progress');await page.getByRole('heading',{name:'Bloodwork over time',exact:true}).waitFor();
 const blood=page.locator('section').filter({has:page.getByRole('heading',{name:'Bloodwork over time',exact:true})});
 const frame=()=>blood.locator('.evidence-insight').last().evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().bottom+scrollY-120));
 if(baseline){await frame();await page.screenshot({path:output+'/before.png'});console.log('PASS: matched Progress timing baseline captured');}
 else{
 const disclosure=page.getByText('Compare recorded dates with a routine trial',{exact:true});await disclosure.click();const select=page.getByLabel('Saved Everyday trial',{exact:true});await select.selectOption(ownTrial.id);
 const table=page.getByRole('region',{name:'Routine trial and bloodwork calendar context',exact:true});await table.getByText('Within stated baseline dates',{exact:true}).waitFor();await table.getByText('Within stated trial dates',{exact:true}).waitFor();await table.getByText('Original calendar context unavailable',{exact:true}).waitFor();assert.equal(await table.locator('tbody tr').count(),3);assert.doesNotMatch(await select.innerText(),/Other owner private|Athlete only/);assert.equal((await report()).pendingLabs.length,1);assert.doesNotMatch(await table.innerText(),/LDL/);
 await frame();await page.screenshot({path:output+'/after.png'});
 unavailable=true;await page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');await queryClient.invalidateQueries({queryKey:['/api/experience/records']});});await page.getByText('Routine trial dates could not be checked.',{exact:true}).waitFor();assert.equal(await table.count(),0,'Stale combined timing is withdrawn after source error');
 unavailable=false;await page.getByRole('button',{name:'Retry routine dates',exact:true}).click();await disclosure.click();await page.getByLabel('Saved Everyday trial',{exact:true}).selectOption(ownTrial.id);await table.waitFor();
 await page.setViewportSize({width:320,height:900});await table.focus();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(writes,0);assert.deepEqual(errors,[]);console.log('PASS: actual encrypted records and rendered trial calendar, unknown legacy date, pending exclusion, owner/mode isolation, source outage/recovery, keyboard320px and no mutation');
 }
}catch(error){console.error(errors);console.error((await page.locator("body").innerText()).slice(0,2400));throw error;}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
