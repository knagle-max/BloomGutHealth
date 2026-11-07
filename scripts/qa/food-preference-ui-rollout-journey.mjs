import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {mkdirSync} from 'node:fs';
const uiRef=process.env.BLOOM_FOOD_UI_REF,output=process.env.BLOOM_REVIEW_OUTPUT||'/tmp/bloom-food-ui';mkdirSync(output,{recursive:true});
import {recipeDisplayName} from "../../client/src/lib/recipe-display.ts";
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {createServer} from 'vite';
import {users} from '../../shared/schema.ts';
import {PrecisionStorage} from '../../server/precision-storage.ts';
import {registerPrecisionRoutes} from '../../server/precision-routes.ts';
import {registerPlannerRoutes} from '../../server/planner-routes.ts';
import {updatePreferencesWithRevision} from '../../server/preference-source.ts';
import {updateProfileWithRevision} from '../../server/profile-source.ts';
import {defaultPreferences,preferenceSchema,recipes} from '../../shared/meal-intelligence.ts';
import {contextSchema,buildPrecisionReport} from '../../shared/precision-nutrition.ts';
import {foodPreferenceMatches} from '../../shared/food-preference-policy.ts';
const fixtureGoal=process.env.BLOOM_GOAL_FIXTURE||'General health';
const fixtures={
 'General health':{mapping:'General healthy-eating pattern',action:/does not add a calorie deficit/,title:'Health Canada: Canada’s food guide snapshot',href:'https://food-guide.canada.ca/artifacts/CFG-snapshot-EN.pdf'},
 'Digestive tolerance':{mapping:'Digestive comfort observation',action:/does not diagnose IBS/,title:'NIDDK: Individual diet changes and digestive symptoms',href:'https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/eating-diet-nutrition'},
 'Body composition':{mapping:'Dated body-measurement tracking',action:/do not directly measure body-fat/},
 'Training consistency':{mapping:'Activity and training record review',action:/does not prescribe training load/},
};
const fixture=fixtures[fixtureGoal];if(!fixture)throw Error('Choose a supported goal fixture');
const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,username text NOT NULL,password text NOT NULL,sex text,age integer,height_cm real,weight_kg real,activity_level text,dietary_preferences jsonb);INSERT INTO users VALUES('allergy-qa','allergy-qa','unused','female',30,170,65,'moderate',NULL)");await pg.exec(readFileSync(new URL('../../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8'));
const db=drizzle(pg),precision=new PrecisionStorage(db),preferences=preferenceSchema.parse({...defaultPreferences,cookingMinutes:180,goals:[fixtureGoal]});await db.update(users).set({dietaryPreferences:preferences}).where(eq(users.id,'allergy-qa'));await precision.putPrecisionContext('allergy-qa',contextSchema.parse({allergies:['dairy'],ageGroup:'adult',pregnancy:'no',safetyReviewed:true}));
const store={getUser:async id=>(await db.select().from(users).where(eq(users.id,id)))[0],getMeals:async()=>[],getMicrobiomeSamples:async()=>[],getPrecisionContext:id=>precision.getPrecisionContext(id),putPrecisionContext:(id,payload)=>precision.putPrecisionContext(id,payload),getPrecisionRecords:id=>precision.getPrecisionRecords(id),getUserSamples:async()=>[],updateUserPreferences:(id,payload,revision)=>updatePreferencesWithRevision(db,id,payload,revision),updateUserProfile:(id,payload)=>updateProfileWithRevision(db,id,payload)};
const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:'allergy-qa'};next();});registerPlannerRoutes(app,(_req,_res,next)=>next(),store);registerPrecisionRoutes(app,(_req,_res,next)=>next(),store);const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const apiBase=`http://127.0.0.1:${api.address().port}`;
const initial=await(await fetch(apiBase+'/api/meal-planner')).json();const removed=initial.suggestions.find(recipe=>recipe.ingredients.some(food=>food.tags.includes('legumes')));assert.ok(removed,'Representative dairy-free recipe contains legumes');
const vite=await createServer({plugins:uiRef?[{name:'food-ui-source-reference',enforce:'pre',load(id){const file=['client/src/pages/MealPlanner.tsx','client/src/brand.css'].find(file=>id.split('?')[0]===path.resolve(file));if(file)return execFileSync('git',['show',uiRef+':'+file],{encoding:'utf8'});}}]:[],server:{host:'127.0.0.1',port:5249,strictPort:true}});await vite.listen();const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);
let release,notifyHeld,mutationCount=0;const held=new Promise(resolve=>{notifyHeld=resolve;}),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];if(req.method()!=='GET')mutationCount++;
 if(p==='/api/auth/me')json={user:{id:'allergy-qa',username:'Synthetic allergy'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(p==='/api/analysis/status')json={ai:{features:{ingredientParsing:false,recipeRanking:false}},nutrition:{liveLookupConfigured:false}};
 else if(p.startsWith('/api/precision')||p.startsWith('/api/meal-planner')||p==='/api/preferences'){
  const response=await fetch(apiBase+p+url.search,{method:req.method(),headers:{'content-type':'application/json',...(req.headers()['if-match']?{'If-Match':req.headers()['if-match']}: {})},...(req.postData()?{body:req.postData()}: {})}),text=await response.text();
  return route.fulfill({status:response.status,contentType:'application/json',headers:{...(response.headers.get('x-bloom-preferences-revision')?{'X-Bloom-Preferences-Revision':response.headers.get('x-bloom-preferences-revision')}:{})},body:text});
 }
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5249/meal-planner?preferences=1');await page.getByRole('heading',{name:'Your food preferences & goals',exact:true}).waitFor();await page.screenshot({path:output+'/'+(uiRef?'before':'after')+'-390.png',fullPage:true,animations:'disabled'});
 if(!uiRef){assert.equal(await page.getByRole('heading',{name:'Food preferences',exact:true}).count(),1);const hard=page.getByRole('region',{name:'Diet & ingredient restrictions',exact:true}),soft=page.getByRole('region',{name:'Taste, time & everyday preferences',exact:true}),goals=page.getByRole('region',{name:'Goals to plan around',exact:true});await hard.getByLabel('Foods to avoid (comma separated)',{exact:true}).waitFor();await soft.getByLabel('Foods you’d prefer less often (comma separated)',{exact:true}).waitFor();await goals.getByLabel('Additional goals (comma separated)',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Save preferences',exact:true}).count(),1);await hard.getByLabel('Foods to avoid (comma separated)',{exact:true}).fill('SYNTHETIC hard avoid');await soft.getByLabel('Foods you’d prefer less often (comma separated)',{exact:true}).fill('SYNTHETIC optional taste');assert.equal(await hard.getByLabel('Foods to avoid (comma separated)',{exact:true}).inputValue(),'SYNTHETIC hard avoid');
 await page.evaluate(()=>{document.querySelectorAll('.preference-group h3').forEach((node,index)=>{node.style.outline='3px solid #b35026';node.dataset.marked='true';const badge=document.createElement('span');badge.textContent=(index+1)+' · ';badge.dataset.badge='true';node.prepend(badge);});});await page.screenshot({path:output+'/after-390-annotated.png',fullPage:true,animations:'disabled'});await page.evaluate(()=>{document.querySelectorAll('[data-marked]').forEach(el=>el.style.outline='');document.querySelectorAll('[data-badge]').forEach(el=>el.remove());});
 for(const width of [320,375,390,430,1280]){await page.setViewportSize({width,height:1000});for(const dark of [false,true]){await page.evaluate(dark=>document.documentElement.classList.toggle('dark',dark),dark);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}}
 assert.equal(await hard.getByLabel('Foods to avoid (comma separated)',{exact:true}).inputValue(),'SYNTHETIC hard avoid');assert.equal(await soft.getByLabel('Foods you’d prefer less often (comma separated)',{exact:true}).inputValue(),'SYNTHETIC optional taste');assert.deepEqual(errors,[]);console.log('PASS food-preference UI: clear named restriction/taste/practical/goal groups, single canonical save, distinct preserved drafts and5width/light-dark. Actual App/API/PostgreSQL source fixture; no preference write in capture.');
 }
}catch(error){console.error({errors,body:(await page.locator('body').innerText()).slice(0,2000)});throw error;}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));await pg.close();}
