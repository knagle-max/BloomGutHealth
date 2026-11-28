import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,extname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,randomUUID} from 'node:crypto';
import express from 'express';
import {chromium} from 'playwright-core';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {ExperienceStorage} from '../../server/experience-storage';
import {registerExperienceRoutes} from '../../server/experience-routes';
import {trainingSessionSchema,experienceSettingsSchema} from '../../shared/experience';
import {exerciseCatalogue,exerciseCatalogueVersion} from '../../shared/exercise-catalogue';
import {defaultPreferences} from '../../shared/meal-intelligence';
import {contextSchema,buildPrecisionReport} from '../../shared/precision-nutrition';
import {displayToKg} from '../../shared/display-units';

// Requires a local build and a local Chromium. All accounts/health-shaped values
// are synthetic; storage is disposable. No production service or account is used.
test('session date edits exclude the current source; actual owned HTTP writes correct/delete Previous without stale reuse',async()=>{
 const root=fileURLToPath(new URL('../../',import.meta.url)),publicRoot=resolve(root,'dist/public');
 const captures=await mkdtemp(join(tmpdir(),'bloom-history-lifecycle-'));
 const priorKey=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 const pg=new PGlite();let server:ReturnType<ReturnType<typeof express>['listen']>|undefined;
 let browser:Awaited<ReturnType<typeof chromium.launch>>|undefined;
 try{
  await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('synthetic-390'),('synthetic-1440'),('synthetic-outsider');");
  await pg.exec(readFileSync(resolve(root,'migrations/0004_experience.sql'),'utf8'));const store=new ExperienceStorage(drizzle(pg)as any);
  const app=express();app.use(express.json());
  // Fixture authentication only; production authorization is unchanged. The real
  // route validation, ownership lookup, encryption and storage writes run below.
  registerExperienceRoutes(app,((req:any,res:any,next:any)=>{const actor=req.get('x-fixture-user');if(!['synthetic-390','synthetic-1440','synthetic-outsider'].includes(actor))return res.sendStatus(401);req.session={userId:actor};next();})as any,store as any,{}as any);
  server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server!.once('listening',r));const api=`http://127.0.0.1:${(server.address()as any).port}`;
  browser=await chromium.launch({executablePath:process.env.BLOOM_BROWSER_EXECUTABLE||'/usr/bin/chromium',args:['--no-sandbox']});
  const ref={id:exerciseCatalogue.find(e=>e.name==='Barbell bench press')!.id,version:exerciseCatalogueVersion,match:'selected' as const,confirmed:true};
  const mime:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.json':'application/json'};
  for(const[width,height]of[[390,844],[1440,900]]){
   const actor=`synthetic-${width}`,make=(title:string,at:string,reps:number)=>trainingSessionSchema.parse({title,startsAt:at,minutes:30,intensity:'moderate',discipline:'strength-power',status:'completed',actualSets:{version:1,sets:[{id:randomUUID(),exercise:'Barbell bench press',catalogueRef:ref,reps,loadKg:displayToKg(135,'lb'),loadUnit:'lb',completed:true,loadContext:{version:1,convention:'barbell-total',equipmentKey:'Synthetic rack A',setRole:'working',effortRpe:7}}]}});
   const older=await store.createSession(actor,make('Synthetic prior workout','2026-11-20T12:00:00Z',12),randomUUID());
   const current=await store.createSession(actor,make('Synthetic current workout','2026-11-21T12:00:00Z',13),randomUUID());
   const page=await browser.newPage({viewport:{width,height},colorScheme:'dark'}),writes:string[]=[],errors:string[]=[];
   page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>localStorage.setItem('theme','dark'));
   await page.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());if(url.origin!=='https://bloom.test')return route.abort();
    if(url.pathname.startsWith('/api/experience/records')){
     if(request.method()!=='GET')writes.push(request.method());
     const response=await fetch(api+url.pathname+url.search,{method:request.method(),headers:{'content-type':'application/json','x-fixture-user':actor,'X-Bloom-Set-Fields':'load-context-v2'},...(request.postData()?{body:request.postData()!}:{})});
     return route.fulfill({status:response.status,headers:{'content-type':'application/json','cache-control':'no-store'},body:await response.text()});
    }
    if(url.pathname.startsWith('/api/')){
     let body:unknown,status=200;
     switch(url.pathname){
      case'/api/auth/me':body={user:{id:actor,username:actor}};break;
      case'/api/experience/settings':body=experienceSettingsSchema.parse({mode:'athlete',displayUnits:{bodyWeight:'lb'}});break;
      case'/api/profile':body={id:actor,age:null,birthYear:null,sex:null,heightCm:null,weightKg:null,activityLevel:'moderate',profileRevision:'a'.repeat(64)};break;
      case'/api/preferences':body=defaultPreferences;break;
      case'/api/precision':body={...buildPrecisionReport([],contextSchema.parse({}),defaultPreferences,null),availableReports:[],gutReportInventory:[]};break;
      case'/api/capabilities':body={eligible:false,experimentalEnabled:false,developmentFeatures:[],experimentalEntries:[],featureAdministration:{canRead:false}};break;
      case'/api/health-sources':body={connections:[]};break;
      default:status=503;body={error:'Synthetic ancillary source unavailable'};
     }
     return route.fulfill({status,contentType:'application/json',headers:{'X-Bloom-Settings-Revision':'a'.repeat(64),'X-Bloom-Preferences-Revision':'a'.repeat(64)},body:JSON.stringify(body)});
    }
    const path=url.pathname==='/athlete'?resolve(publicRoot,'index.html'):resolve(publicRoot,'.'+decodeURIComponent(url.pathname));assert.ok(path.startsWith(publicRoot+'/'));
    try{return route.fulfill({contentType:mime[extname(path)]||'application/octet-stream',body:await readFile(path)});}catch{return route.fulfill({status:404,body:'Missing build asset'});}
   });
   await page.goto('https://bloom.test/athlete');const card=page.locator('#athlete-session-'+current.id),priorCard=page.locator('#athlete-session-'+older.id);
   const openCurrent=async()=>{await card.getByText('Edit session & actual recovery observations',{exact:true}).click();const editor=card.locator('.training-sets-editor');await editor.locator(':scope > summary').click();await editor.locator('.activity-set-edit').first().click();return editor.getByRole('region',{name:'Previous and suggested set'});};
   let guidance=await openCurrent();await card.getByLabel('Updated start',{exact:true}).fill('2026-11-22T12:00');await guidance.getByText(/Previous:\s*12 reps/).waitFor();assert.equal(writes.length,0);
   const save=page.waitForResponse(r=>r.url().endsWith('/records/'+current.id)&&r.request().method()==='PUT');await card.getByRole('button',{name:'Save session changes',exact:true}).click();assert.equal((await save).status(),200);
   await card.getByText('Edit session & actual recovery observations',{exact:true}).waitFor();await page.waitForFunction(id=>{const details=document.querySelector(`#athlete-session-${id} details:has(form)`);return !!details&&!details.hasAttribute('open');},current.id);
   guidance=await openCurrent();await guidance.getByText(/Previous:\s*12 reps/).waitFor();
   await priorCard.getByText('Edit session & actual recovery observations',{exact:true}).click();const priorEditor=priorCard.locator('.training-sets-editor');await priorEditor.locator(':scope > summary').click();await priorEditor.locator('.activity-set-edit').first().click();await priorEditor.getByLabel('Reps 1',{exact:true}).fill('9');
   const correction=page.waitForResponse(r=>r.url().endsWith('/records/'+older.id)&&r.request().method()==='PUT');await priorCard.getByRole('button',{name:'Save session changes',exact:true}).click();assert.equal((await correction).status(),200);await guidance.getByText(/Previous:\s*9 reps/).waitFor();
   await guidance.evaluate(node=>{node.closest('fieldset')!.scrollIntoView({block:'start'});window.scrollBy(0,-100);});await page.screenshot({path:join(captures,`history-${width}-corrected.png`),animations:'disabled'});
   const removal=page.waitForResponse(r=>r.url().endsWith('/records/'+older.id)&&r.request().method()==='DELETE');await priorCard.getByRole('button',{name:'Remove',exact:true}).click();assert.equal((await removal).status(),204);await guidance.getByText(/No prior completed set/).waitFor();
   assert.deepEqual(writes,['PUT','PUT','DELETE']);assert.equal((await store.getExperienceRecords(actor,'session')).length,1);assert.equal(await store.deleteExperienceRecord('synthetic-outsider',current.id),false);assert.deepEqual(await store.getExperienceRecords('synthetic-outsider'),[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
   await guidance.evaluate(node=>{node.closest('fieldset')!.scrollIntoView({block:'start'});window.scrollBy(0,-100);});await page.screenshot({path:join(captures,`history-${width}-deleted.png`),animations:'disabled'});await page.close();
  }
  console.log('PASS: 390/1440 actual editor -> owned HTTP -> disposable encrypted storage; current-source exclusion and correction/deletion invalidation. Synthetic captures:',captures);
 }finally{await browser?.close();if(server){server.closeAllConnections();await new Promise<void>(r=>server!.close(()=>r()));}await pg.close();if(priorKey===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=priorKey;}
});
