import {encryptPrecision,decryptPrecision} from '../../server/precision-crypto.ts';
import {recalledLabResponseContextSchema} from '../../shared/lab-response-context.ts';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
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
import {labReviewRevision} from '../../shared/lab-source-review.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {experienceSettingsSchema} from '../../shared/experience.ts';
import {setAppTheme} from './set-app-theme.mjs';
const nativeNow=Date.now;let budgetClockOffset=0;Date.now=()=>nativeNow()+budgetClockOffset;
const previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,dietary_preferences jsonb);INSERT INTO users(id) VALUES('a'),('b');");
for(const migration of ['0002_precision_nutrition.sql','0004_experience.sql'])await pg.exec(readFileSync('migrations/'+migration,'utf8'));
const db=drizzle(pg),storage=new PrecisionStorage(db),context=new LabResponseContextStorage(db,()=>new Date('2026-11-16T12:00:00Z'));
Object.assign(storage,{getUser:async id=>({id,age:40,dietaryPreferences:defaultPreferences}),getUserSamples:async()=>[],getMeals:async()=>[],getMetabolites:async()=>[]});
for(const [month,value] of [['09',400],['10',600]])await storage.insertPrecisionRecord('a','lab',labSchema.parse({marker:'b12',value,unit:'pmol/L',measuredAt:`2026-${month}-01T12:00:00Z`,laboratory:'Synthetic context laboratory',method:'Synthetic assay',fasting:'yes',referenceLow:null,referenceHigh:500,sourceReport:{importId:randomUUID(),enteredDate:`2026-${month}-01`}}));
const originals=await storage.getPrecisionRecords('a'),app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('X-Synthetic-User')};next();});
const auth=(req,res,next)=>req.session?.userId?next():res.sendStatus(401);storage.labResponseContext=context;const precisionService=registerPrecisionRoutes(app,auth,storage);registerExperienceRoutes(app,auth,storage,precisionService);
const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const backend=`http://127.0.0.1:${api.address().port}`;
// The actual mounted App, controller and encrypted service; no source injection.
const vite=await createServer({cacheDir:'/tmp/bloom-question-reader/vite-cache',server:{host:'127.0.0.1',port:5302,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000},timezoneId:'UTC'});page.setDefaultTimeout(15000);
let actor='a',mode='everyday',loseSave=false;const errors=[],attempts=[],states=[],out='/tmp/bloom-question-reader';mkdirSync(out,{recursive:true});page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',route=>route.abort());
let futureTarget=false;
await page.route('**/api/**',async route=>{
 const request=route.request(),url=new URL(request.url()),p=url.pathname;
 if(p==='/api/precision'||p.startsWith('/api/experience/lab-response-context')){
  const response=await fetch(backend+p+url.search,{method:request.method(),headers:{'content-type':'application/json','X-Synthetic-User':actor,...(request.headers()['x-bloom-lab-question-protocol']?{'X-Bloom-Lab-Question-Protocol':request.headers()['x-bloom-lab-question-protocol']}:{}),...(request.headers()['x-bloom-confirm']?{'X-Bloom-Confirm':request.headers()['x-bloom-confirm']}:{})},...(request.postData()?{body:request.postData()}:{} )});
  if(p.endsWith('/save')){attempts.push({intentId:request.postDataJSON().intentId,status:response.status});if(loseSave){loseSave=false;return route.abort('failed');}}
  const body=Buffer.from(await response.arrayBuffer());
  if(futureTarget&&response.ok&&['/view','/prepare'].some(suffix=>p.endsWith(suffix))){const view=JSON.parse(body.toString());view.questionId='b12-products';return route.fulfill({status:response.status,json:view});}
  return route.fulfill({status:response.status,headers:{'content-type':'application/json','cache-control':'no-store'},body});
 }
 const json=p==='/api/auth/me'?{user:{id:actor,username:'Synthetic context review'}}:p==='/api/experience/settings'?experienceSettingsSchema.parse({mode,onboarding:{status:'complete'}}):p==='/api/preferences'?defaultPreferences:p==='/api/profile'?{heightCm:null,weightKg:null}:p==='/api/health-sources'?{connections:[]}:p==='/api/health-sources/observations'?{observations:[],returned:0,total:0,hasMore:false}:[];return route.fulfill({json});
});
const open=async()=>{await page.getByRole('heading',{name:'Bloodwork',exact:true}).waitFor();const family=page.locator('.lab-panel-review-family').filter({has:page.locator('summary').filter({hasText:'Iron, nutrients & blood counts'})});await family.locator(':scope > summary').click();const memory=family.getByRole('region',{name:'Remembered context',exact:true});await memory.getByRole('button',{name:'Review remembered context',exact:true}).click();await memory.getByText('Saved context loaded.',{exact:true}).waitFor();return memory;};
try{
 const sourceReferences=await Promise.all(originals.map(async row=>({id:row.id,revision:await labReviewRevision(row.payload)}))),selection={family:'iron-cbc',sourceIds:originals.map(row=>row.id)},prepare={family:'iron-cbc',sourceReferences};
 const prepared=await context.prepare('a',prepare),legacy=await context.save('a',{...prepare,intentId:randomUUID(),generationId:prepared.generationId,expectedCurrentId:null,answer:'no',eventWindow:null,datePrecision:'not-applicable',notes:'Synthetic iron answer'});
 const futureIntent=randomUUID(),futureId=createHash('sha256').update(JSON.stringify(['lab-context-answer-v1','a',futureIntent])).digest('hex'),future=recalledLabResponseContextSchema.parse({...legacy.record.payload,intentId:futureIntent,question:'b12-products',answer:'yes',eventWindow:{from:'2026-09-15',to:'2026-09-15',precision:'day'},datePrecision:'day',supersedes:legacy.record.id,notes:'Synthetic B12 answer'});
 // A future-schema immutable row is seeded only in this local synthetic DB.
 // Current app writers remain legacy; no production producer is activated.
 await pg.query('INSERT INTO experience_records(id,user_id,kind,encrypted_payload) VALUES($1,$2,$3,$4)',[futureId,'a','lab-response-context',encryptPrecision(future,'a')]);
 const snapshot=JSON.stringify((await pg.query('SELECT id,encrypted_payload FROM precision_records ORDER BY id')).rows);
 const old=await fetch(backend+'/api/experience/lab-response-context/view',{method:'POST',headers:{'content-type':'application/json','X-Synthetic-User':'a'},body:JSON.stringify(selection)});assert.equal(old.status,409);assert.doesNotMatch(await old.text(),/Synthetic B12 answer/);
 await page.goto('http://127.0.0.1:5302/precision?tab=labs');let memory=await open();await memory.getByText('Question changed · recollection needs review',{exact:true}).waitFor();await memory.getByText('Saved question: Were vitamin B12-containing products changed before this collection?',{exact:true}).waitFor();await memory.getByText('Synthetic B12 answer',{exact:true}).waitFor();
 for(const visualMode of['everyday','athlete']){mode=visualMode;await page.reload();memory=await open();for(const theme of['light','dark']){await setAppTheme(page,theme);for(const width of[320,390,768,1440])for(const scale of[{font:'',zoom:'1'},{font:'200%',zoom:'1'},{font:'',zoom:'2'}]){await page.setViewportSize({width,height:1100});await page.evaluate(({font,zoom})=>{document.documentElement.style.fontSize=font;document.documentElement.style.zoom=zoom;},scale);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),true,JSON.stringify({visualMode,theme,width,scale}));}}}
 await page.evaluate(()=>{document.documentElement.style.fontSize='';document.documentElement.style.zoom='1';});await page.setViewportSize({width:390,height:1100});budgetClockOffset+=65000;
 await memory.getByRole('button',{name:'Review or update answer',exact:true}).click();await memory.getByLabel('Your answer',{exact:true}).waitFor();assert.equal(await memory.getByLabel('Your answer',{exact:true}).inputValue(),'','A B12 yes is never prefilled into the iron-product question');assert.equal(await memory.getByLabel('Optional context',{exact:true}).inputValue(),'');await memory.getByLabel('Your answer',{exact:true}).selectOption('no');await memory.getByLabel('Optional context',{exact:true}).fill('Synthetic unfinished iron draft');
 futureTarget=true;await memory.getByRole('button',{name:'Reload saved context',exact:true}).click();await memory.getByRole('button',{name:'Review sources for this draft',exact:true}).waitFor();assert.equal(await memory.getByLabel('Your answer',{exact:true}).inputValue(),'no');assert.equal(await memory.getByRole('button',{name:'Save remembered context',exact:true}).isDisabled(),true,'Changed target cannot silently relabel the held draft');
 await memory.getByRole('button',{name:'Review sources for this draft',exact:true}).click();await page.waitForFunction(()=>{const el=document.querySelector('select[aria-label="Your answer"]');return el?.value==='yes'&&!el.disabled;});assert.equal(await memory.getByLabel('Your answer',{exact:true}).inputValue(),'yes','A matching saved B12 answer may be restored only after the question is reviewed');assert.equal(await memory.getByLabel('Optional context',{exact:true}).inputValue(),'Synthetic B12 answer');await memory.getByRole('button',{name:'Save remembered context',exact:true}).click();await memory.getByRole('alert').waitFor();assert.equal((await context.view('a',selection)).historyCount,2,'The legacy writer rejects a future question instead of relabelling it');
 futureTarget=false;await memory.getByRole('button',{name:'Reload saved context',exact:true}).click();await memory.getByRole('button',{name:'Review sources for this draft',exact:true}).click();await page.waitForFunction(()=>{const el=document.querySelector('select[aria-label="Your answer"]');return el?.value===''&&!el.disabled;});assert.equal(await memory.getByLabel('Your answer',{exact:true}).inputValue(),'');await memory.getByLabel('Your answer',{exact:true}).selectOption('no');await memory.getByRole('button',{name:'Save remembered context',exact:true}).click();await memory.getByText('Remembered context saved. It does not establish what caused a result.',{exact:true}).waitFor();
 const latest=await context.view('a',selection);assert.equal(latest.latest.record.payload.question,'iron-products');assert.equal(latest.latest.record.payload.answer,'no');assert.equal(latest.historyCount,3);
 const stored=(await pg.query('SELECT encrypted_payload FROM experience_records WHERE id=$1',[futureId])).rows[0];assert.deepEqual(decryptPrecision(stored.encrypted_payload,'a'),future,'The earlier B12 question/answer/source bytes remain intact');assert.equal(JSON.stringify((await pg.query('SELECT id,encrypted_payload FROM precision_records ORDER BY id')).rows),snapshot);
 actor='b';await page.reload();assert.equal(await page.getByRole('region',{name:'Remembered context',exact:true}).count(),0);assert.equal(await page.getByText('Synthetic B12 answer',{exact:true}).count(),0);assert.deepEqual(errors,[]);
 console.log('PASS compatible question reader: actual App/authenticated HTTP/encrypted SQL future B12 row, immutable stored question meaning, legacy-client reload guard,48 responsive/mode/theme/zoom/text states, no cross-question prefill, draft-question pinning across a future target DTO, current producer rejects premature new questions, original lab ciphertext and earlier answers unchanged, account withdrawal. Future DTO/row are local synthetic fixtures; adaptive producers remain inactive.');
}catch(error){console.error({errors,body:(await page.locator('body').innerText()).slice(-6500)});throw error;}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();Date.now=nativeNow;if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
