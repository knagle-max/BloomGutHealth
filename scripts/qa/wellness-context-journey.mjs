import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {randomBytes} from 'node:crypto';
import express from 'express';import {createServer} from 'vite';import {PGlite} from '@electric-sql/pglite';import {drizzle} from 'drizzle-orm/pglite';
import {PrecisionStorage} from '../../server/precision-storage.ts';import {registerPrecisionRoutes} from '../../server/precision-routes.ts';import {contextSchema} from '../../shared/precision-nutrition.ts';import {experienceSettingsSchema} from '../../shared/experience.ts';import {setAppTheme} from './set-app-theme.mjs';
process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
const pg=new PGlite();await pg.exec('CREATE TABLE precision_profiles(user_id varchar PRIMARY KEY,encrypted_context jsonb NOT NULL,updated_at timestamp DEFAULT now());');
const precision=new PrecisionStorage(drizzle(pg));let owner='context-a';const reads=[];
const initial=contextSchema.parse({goals:['general health'],allergies:[],ageGroup:'adult',pregnancy:'no',safetyReviewed:true});
await precision.putPrecisionContext(owner,initial);
await precision.putPrecisionContext('context-b',contextSchema.parse({goals:['digestive comfort']}));
const store=new Proxy({getPrecisionContext:async id=>{reads.push('context:'+id);return precision.getPrecisionContext(id);},putPrecisionContext:(id,value)=>precision.putPrecisionContext(id,value),getUser:async id=>{reads.push('user:'+id);return{id,age:30};}},{get(target,key){if(key in target)return target[key];return()=>{throw Error('Unexpected optional source read: '+String(key));};}});
const app=express();app.use(express.json());registerPrecisionRoutes(app,(req,_res,next)=>{req.session={userId:owner};next();},store);
const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const apiBase='http://127.0.0.1:'+api.address().port;
const vite=await createServer({server:{host:'127.0.0.1',port:5227,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:950}});page.setDefaultTimeout(12000);const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),u=new URL(req.url());requests.push(u.pathname);
 if(u.pathname==='/api/precision/wellness-context'||u.pathname==='/api/precision/context'){
  const response=await fetch(apiBase+u.pathname,{method:req.method(),headers:{'content-type':'application/json'},...(req.postData()?{body:req.postData()}:{})});return route.fulfill({status:response.status,contentType:'application/json',body:await response.text()});
 }
 const json=u.pathname==='/api/auth/me'?{user:{id:owner,username:'Synthetic context'}}:u.pathname.startsWith('/api/experience/settings')?experienceSettingsSchema.parse({onboarding:{status:'complete'}}):[];
 return route.fulfill({json});
});
const why=()=>page.locator('.today-focus-evidence');
const showWhy=async()=>{if(!await why().evaluate(el=>el.open))await why().locator('summary').click();};
const refresh=()=>page.evaluate(async()=>{const{invalidatePlanningInputs}=await import('/src/lib/planning-cache.ts');await invalidatePlanningInputs();});
try{
 await page.goto('http://127.0.0.1:5227/');await showWhy();await why().getByRole('heading',{name:'General healthy-eating pattern',exact:true}).waitFor();
 const first=await(await fetch(apiBase+'/api/precision/wellness-context')).json();
 assert.equal(first.accountScope,'context-a');assert.ok(first.inputSources.every(s=>s.observedAt===null));
 assert.equal(requests.includes('/api/precision'),false,'Today explanation must not fetch the full biological report');
 const correction=await fetch(apiBase+'/api/precision/context',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({...initial,goals:['cholesterol']})});assert.equal(correction.status,200);
 await refresh();await why().getByRole('heading',{name:'Cardiometabolic dietary pattern',exact:true}).waitFor();
 const corrected=await(await fetch(apiBase+'/api/precision/wellness-context')).json();assert.notEqual(corrected.revision,first.revision);
 await page.reload();await showWhy();await why().getByRole('heading',{name:'Cardiometabolic dietary pattern',exact:true}).waitFor();
 for(const width of [320,390])for(const theme of ['light','dark']){await page.setViewportSize({width,height:950});await setAppTheme(page,theme);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
 await pg.query('DELETE FROM precision_profiles WHERE user_id=$1',['context-a']);await refresh();await why().getByRole('heading',{name:'Cardiometabolic dietary pattern',exact:true}).waitFor({state:'hidden'});
 const removed=await(await fetch(apiBase+'/api/precision/wellness-context')).json();assert.deepEqual(removed.goals,[]);assert.equal(removed.constraints.allergies,null);
 owner='context-b';await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await showWhy();await why().getByRole('heading',{name:'Digestive comfort observation',exact:true}).waitFor();
 assert.equal(await why().getByText('Cardiometabolic dietary pattern',{exact:true}).count(),0);
 assert.ok(reads.every(read=>read.startsWith('context:')||read.startsWith('user:')));assert.deepEqual(errors,[]);
 console.log('PASS: actual Today→read-only context API→encrypted PostgreSQL; goals-only cited Why, persisted correction/reload and source erasure withdraw prior guidance, account switch isolation,320/390 light/dark; optional assay/model adapters never read. Synthetic accounts, no independent or clinical acceptance.');
}catch(error){console.error({errors,body:(await page.locator('body').innerText()).slice(0,3000)});throw error;}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));await pg.close();}
