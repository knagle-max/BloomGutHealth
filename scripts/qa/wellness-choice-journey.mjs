import {reviewThenSave,openIngredientRow} from "./lib/meal-flow.mjs";
import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {randomBytes,randomUUID} from 'node:crypto';import {readFileSync} from 'node:fs';import {mkdir} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import path from 'node:path';
import express from 'express';import {createServer} from 'vite';import {PGlite} from '@electric-sql/pglite';import {drizzle} from 'drizzle-orm/pglite';import {eq} from 'drizzle-orm';
import {users,meals} from '../../shared/schema.ts';import {PrecisionStorage} from '../../server/precision-storage.ts';import {ExperienceStorage} from '../../server/experience-storage.ts';import {registerPrecisionRoutes} from '../../server/precision-routes.ts';import {registerExperienceRoutes} from '../../server/experience-routes.ts';import {registerPlannerRoutes} from '../../server/planner-routes.ts';import {insertMealWithReceipt} from '../../server/meal-save.ts';import {contextSchema} from '../../shared/precision-nutrition.ts';import {experienceSettingsSchema} from '../../shared/experience.ts';import {preferenceSchema} from '../../shared/meal-intelligence.ts';import {encryptPrecision} from '../../server/precision-crypto.ts';import {setAppTheme} from './set-app-theme.mjs';
process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();
await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,username text,password text,sex text,age integer,height_cm real,weight_kg real,activity_level text,dietary_preferences jsonb);INSERT INTO users(id,username,sex,age,height_cm,weight_kg,activity_level) VALUES('choice-a','Synthetic A','female',30,170,65,'moderate'),('choice-b','Synthetic B','male',35,175,75,'moderate');CREATE TABLE meals(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real);");
await pg.exec(readFileSync(new URL('../../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8'));await pg.exec(readFileSync(new URL('../../migrations/0004_experience.sql',import.meta.url),'utf8'));
const db=drizzle(pg),precision=new PrecisionStorage(db),experience=new ExperienceStorage(db),prefs=preferenceSchema.parse({goals:['general health']});
await pg.query('UPDATE users SET dietary_preferences=$1',[prefs]);const health=contextSchema.parse({goals:['general health'],ageGroup:'adult',pregnancy:'no',safetyReviewed:true,allergies:[],conditions:[],medications:[]});
await precision.putPrecisionContext('choice-a',health);await precision.putPrecisionContext('choice-b',{...health,goals:['digestive comfort']});
for(const actor of ['choice-a','choice-b'])await pg.query('INSERT INTO experience_settings(user_id,encrypted_payload) VALUES($1,$2)',[actor,encryptPrecision(experienceSettingsSchema.parse({onboarding:{status:'complete'}}),actor)]);
let owner='choice-a',lose=false,hold=false,release,holdDelete=false,releaseDelete;const choiceBodies=[],errors=[],requests=[];
const delegates={getUser:async id=>(await db.select().from(users).where(eq(users.id,id)))[0],getUserSamples:async()=>[],getMeals:async id=>db.select().from(meals).where(eq(meals.userId,id)),getMeal:async id=>(await db.select().from(meals).where(eq(meals.id,id)))[0],insertMeal:(meal,receipt)=>insertMealWithReceipt(db,meal,receipt),getNutritionProducts:async()=>[],getMicrobiomeFood:async()=>null};
for(const instance of [precision,experience])for(const key of Object.getOwnPropertyNames(Object.getPrototypeOf(instance)))if(key!=='constructor'&&typeof instance[key]==='function')delegates[key]=instance[key].bind(instance);
// This fixture contains no assay sources; the optional provider ranking explicitly abstains.
delegates.getUserSamples=async()=>[];delegates.getMicrobiomeFood=async()=>null;
const app=express();app.use(express.json());const auth=(req,res,next)=>{if(req.get('X-Bloom-Actor')&&req.get('X-Bloom-Actor')!==owner)return res.status(409).json({error:'The signed-in account changed.'});req.session={userId:owner};next();};
registerPrecisionRoutes(app,auth,delegates);registerExperienceRoutes(app,auth,delegates);registerPlannerRoutes(app,auth,delegates);
const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const apiBase='http://127.0.0.1:'+api.address().port;
const baseline=process.env.BLOOM_WELLNESS_VISUAL_REF,capture=process.env.BLOOM_WELLNESS_CAPTURE;
const vite=await createServer({plugins:baseline?[{name:'wellness-controlled-before',enforce:'pre',load(id){const file='client/src/components/TodayFocus.tsx';if(id.split('?')[0]===path.resolve(file))return execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'});}}]:[],server:{host:'127.0.0.1',port:5231,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:950},timezoneId:'UTC'});page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.stack));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),u=new URL(req.url());requests.push(u.pathname);const actor=owner;
 if(u.pathname.startsWith('/api/experience/')||u.pathname.startsWith('/api/precision')||u.pathname.startsWith('/api/meal-planner')||u.pathname.startsWith('/api/meals')&&req.method()!=='GET'){
  if(u.pathname==='/api/experience/wellness-choices'&&req.method()==='POST'){choiceBodies.push(req.postDataJSON());if(hold)await new Promise(r=>{release=r;});}
  if(u.pathname==='/api/experience/wellness-choices'&&req.method()==='DELETE'&&holdDelete)await new Promise(r=>{releaseDelete=r;});
  const response=await fetch(apiBase+u.pathname+u.search,{method:req.method(),headers:{'content-type':'application/json',...(req.headers()['x-bloom-actor']?{'X-Bloom-Actor':req.headers()['x-bloom-actor']}:{}),...(req.headers()['if-match']?{'If-Match':req.headers()['if-match']}:{}),...(req.headers()['idempotency-key']?{'Idempotency-Key':req.headers()['idempotency-key']}:{}),...(req.headers()['x-bloom-confirm']?{'X-Bloom-Confirm':req.headers()['x-bloom-confirm']}:{}),...(req.headers()['x-bloom-settings-fields']?{'X-Bloom-Settings-Fields':req.headers()['x-bloom-settings-fields']}:{})},...(req.postData()?{body:req.postData()}:{})});
  const body=await response.text();if(u.pathname==='/api/experience/wellness-choices'&&req.method()==='POST'&&response.ok&&lose)return route.fulfill({status:503,json:{error:'Synthetic committed choice response lost'}});
  return route.fulfill({status:response.status,contentType:'application/json',headers:{...(response.headers.get('x-bloom-settings-revision')?{'x-bloom-settings-revision':response.headers.get('x-bloom-settings-revision')}:{}) ,...(response.headers.get('x-bloom-meal-review')?{'x-bloom-meal-review':response.headers.get('x-bloom-meal-review')}:{})},body});
 }
 let json=[];
 if(u.pathname==='/api/auth/me')json={user:{id:actor,username:'Synthetic '+actor}};
 else if(u.pathname==='/api/preferences')json=prefs;
 else if(u.pathname.startsWith('/api/meals'))json=await delegates.getMeals(actor);
 else if(u.pathname==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
 else if(u.pathname==='/api/capabilities')json={eligible:false,experimentalEnabled:false};
 await route.fulfill({json});
});
const focus=()=>page.locator('.today-focus');const choices=()=>experience.getExperienceRecords(owner,'wellness-choice');
const clock=()=>({date:new Date().toISOString().slice(0,10),timezoneOffset:0});
const refresh=()=>page.evaluate(async()=>{const{invalidatePlanningInputs}=await import('/src/lib/planning-cache.ts');await invalidatePlanningInputs();});
const waitSaved=()=>focus().getByText(/Saved for later for /).first().waitFor();
try{
 await page.goto('http://127.0.0.1:5231/');
 if(capture){
  await focus().getByRole('heading',{name:baseline?'Start with a meal':'Choose a balanced meal',level:2,exact:true}).waitFor();await mkdir(capture,{recursive:true});
  for(const [width,theme]of [[320,'light'],[390,'light'],[390,'dark']]){await page.setViewportSize({width,height:950});await setAppTheme(page,theme);await page.screenshot({path:`${capture}/${baseline?'before':'after'}-${width}-${theme}.png`});}
  console.log('Captured controlled '+(baseline?'before '+baseline:'after')+' Today with the same owned synthetic goal/profile, no assays, no intentions yet.');
 }else{
  await focus().getByRole('heading',{name:'Choose a balanced meal',level:2,exact:true}).waitFor();
  await page.setViewportSize({width:320,height:500});
  const primary=focus().getByRole('button',{name:'Try this',exact:true});
  await primary.focus();assert.equal(await primary.evaluate(el=>el===document.activeElement),true);
  assert.equal(await primary.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<innerHeight-56;}),true,'Primary action clears persistent navigation at 320×500');
  await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
  assert.equal(await primary.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}),true,'Primary action fits at 200%');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.evaluate(()=>{document.documentElement.style.fontSize='';});
  await page.setViewportSize({width:390,height:950});
  assert.equal((await experience.getExperienceSettings(owner)).lifecycleId,undefined,'Read path must not create an epoch');
  await focus().getByRole('button',{name:'Save for later',exact:true}).click();await waitSaved();assert.equal((await choices()).length,1);assert.ok((await experience.getExperienceSettings(owner)).lifecycleId,'Explicit choice initializes lifecycle through normal settings write');
  lose=true;await focus().getByRole('button',{name:'Not relevant',exact:true}).click();await focus().getByRole('button',{name:'Retry saving this choice',exact:true}).waitFor();assert.equal((await choices()).length,2);
  lose=false;await focus().getByRole('button',{name:'Retry saving this choice',exact:true}).click();await focus().getByRole('heading',{name:'Make room for familiar movement',level:2,exact:true}).waitFor();assert.deepEqual(choiceBodies[1],choiceBodies[2]);assert.equal((await choices()).length,2);
  lose=true;await focus().getByRole('button',{name:'Save for later',exact:true}).click();await focus().getByRole('button',{name:'Retry saving this choice',exact:true}).waitFor();assert.equal((await choices()).length,3);
  lose=false;const posts=choiceBodies.length;await page.reload();await waitSaved();assert.equal(await focus().getByRole('button',{name:'Retry saving this choice',exact:true}).count(),0);assert.equal(choiceBodies.length,posts,'Reload resolves committed source without a duplicate POST');
  hold=true;await focus().getByRole('button',{name:'Clear current choice',exact:true}).click();await page.waitForFunction(()=>!!history.state?.bloomWellnessPendingV1);
  await precision.putPrecisionContext(owner,{...health,goals:['digestive comfort']});await refresh();hold=false;release();
  await focus().getByRole('button',{name:'Review current suggestion',exact:true}).waitFor();assert.equal((await choices()).length,3);await focus().getByRole('button',{name:'Review current suggestion',exact:true}).click();
  await focus().getByText('Other options & saved choices',{exact:true}).click();await focus().getByRole('button',{name:'Delete these 3 saved choices',exact:true}).waitFor();
  holdDelete=true;page.once('dialog',dialog=>dialog.accept());await focus().getByRole('button',{name:'Delete these 3 saved choices',exact:true}).click();
  while(!releaseDelete)await new Promise(r=>setTimeout(r,10));
  const view=await experience.getWellnessActionView(owner,clock()),target=view.actions.find(a=>a.action.id==='record-usual-meal');
  await experience.createWellnessChoice(owner,{...view.day,intentId:randomUUID(),actionId:target.action.id,choice:'try',lifecycleId:view.lifecycleId,requestRevision:target.requestRevision});
  holdDelete=false;releaseDelete();await focus().getByText('Selected choice history deleted.',{exact:true}).waitFor();assert.equal((await choices()).length,1,'A later arrival survives the captured deletion');
  hold=true;await focus().getByRole('button',{name:'Save for later',exact:true}).click();await page.waitForFunction(()=>!!history.state?.bloomWellnessPendingV1);
  owner='choice-b';await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));hold=false;release();
  await focus().getByRole('heading',{level:2}).waitFor();await page.waitForFunction(()=>!history.state?.bloomWellnessPendingV1);
  await focus().getByRole('button',{name:'Save for later',exact:true}).click();await waitSaved();assert.equal((await choices()).length,1);assert.equal((await experience.getExperienceRecords('choice-a','wellness-choice')).length,1);
  for(const width of [320,390])for(const theme of ['light','dark']){await page.setViewportSize({width,height:950});await setAppTheme(page,theme);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
  assert.equal((await delegates.getMeals(owner)).length,0);assert.equal((await experience.getExperienceRecords(owner,'activity')).length,0,'Intention does not create an activity');
  await focus().getByText('Other options & saved choices',{exact:true}).click();await focus().getByRole('button',{name:'Try choose a balanced meal',exact:true}).click();
  await page.waitForURL('**/meal-planner?view=recipes');await page.getByRole('tab',{name:'Recipe library',exact:true}).waitFor();assert.equal(await page.getByRole('tab',{name:'Recipe library',exact:true}).getAttribute('aria-selected'),'true');
  assert.equal((await experience.getExperienceRecords(owner,'wellness-choice')).length,2);
  await page.getByRole('link',{name:'Use this meal in my journal',exact:true}).first().click();
  await page.waitForURL('**/log-meal?recipe=*');
  await page.getByRole('button',{name:'Review meal',exact:true}).click();await page.getByRole('heading',{name:'Review your meal',exact:true}).waitFor();
  await openIngredientRow(page,1);const grams=page.getByLabel('Grams 1',{exact:true}),original=Number(await grams.inputValue());assert.ok(original>0);
  await grams.fill(String(original/2));await page.getByRole('button',{name:'Update meal review',exact:true}).click();
  await page.getByRole('button',{name:'Save meal',exact:true}).click();await page.getByRole('heading',{name:'Your meal is saved.',exact:true}).waitFor();
  const logged=await delegates.getMeals(owner);assert.equal(logged.length,1);assert.equal(logged[0].intelligence.ingredients[0].grams,original/2);
  await page.goto('http://127.0.0.1:5231/');
  await focus().getByRole('heading',{name:logged[0].totalCalories===null?'A clearer food picture':'Choose a balanced meal',level:2,exact:true}).waitFor();
  await focus().getByText(logged[0].totalCalories===null?'Saved choices':'Other options & saved choices',{exact:true}).click();
  await focus().getByRole('heading',{name:'Saved choices for '+clock().date,exact:true}).waitFor();
  assert.equal((await delegates.getMeals(owner)).length,1);
  assert.equal((await experience.getExperienceRecords(owner,'activity')).length,0);
  assert.deepEqual(errors,[]);
  console.log('PASS: actual Today→source-scoped APIs→encrypted SQL; lifecycle bootstrap, later/try/not-relevant, exact lost-response retry, reload recovery, stale-source refusal, targeted deletion preserves later event, late actor rejection, owned choice histories and Recipe library→review→individual ingredient edit→explicit meal save/reload; intentions never auto-create food/activity;320/390 light/dark. Synthetic accounts.');
 }
}catch(error){console.error({errors,body:(await page.locator('body').innerText()).slice(0,4500)});throw error;}finally{release?.();releaseDelete?.();await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));await pg.close();}
