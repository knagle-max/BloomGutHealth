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
import {registerPlannerRoutes} from '../../server/planner-routes.ts';
import {updatePreferencesWithRevision} from '../../server/preference-source.ts';
import {updateProfileWithRevision} from '../../server/profile-source.ts';
import {defaultPreferences,preferenceSchema,recipes} from '../../shared/meal-intelligence.ts';
import {contextSchema,buildPrecisionReport} from '../../shared/precision-nutrition.ts';
import {foodPreferenceMatches} from '../../shared/food-preference-policy.ts';
const prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY,username text NOT NULL,password text NOT NULL,sex text,age integer,height_cm real,weight_kg real,activity_level text,dietary_preferences jsonb);INSERT INTO users VALUES('allergy-qa','allergy-qa','unused','female',30,170,65,'moderate',NULL)");await pg.exec(readFileSync(new URL('../../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8'));
const db=drizzle(pg),precision=new PrecisionStorage(db),preferences=preferenceSchema.parse({...defaultPreferences,cookingMinutes:180,goals:[...new Set(recipes.flatMap(recipe=>recipe.goals))].slice(0,20)});await db.update(users).set({dietaryPreferences:preferences}).where(eq(users.id,'allergy-qa'));await precision.putPrecisionContext('allergy-qa',contextSchema.parse({allergies:['dairy'],ageGroup:'adult',pregnancy:'no',safetyReviewed:true}));
const store={getUser:async id=>(await db.select().from(users).where(eq(users.id,id)))[0],getMeals:async()=>[],getMicrobiomeSamples:async()=>[],getPrecisionContext:id=>precision.getPrecisionContext(id),updateUserPreferences:(id,payload,revision)=>updatePreferencesWithRevision(db,id,payload,revision),updateUserProfile:(id,payload)=>updateProfileWithRevision(db,id,payload)};
const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:'allergy-qa'};next();});registerPlannerRoutes(app,(_req,_res,next)=>next(),store);const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const apiBase=`http://127.0.0.1:${api.address().port}`;
const initial=await(await fetch(apiBase+'/api/meal-planner')).json();const removed=initial.suggestions.find(recipe=>recipe.ingredients.some(food=>food.tags.includes('legumes')));assert.ok(removed,'Representative dairy-free recipe contains legumes');
const vite=await createServer({server:{host:'127.0.0.1',port:5248,strictPort:true}});await vite.listen();const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}),page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);
let release,notifyHeld;const held=new Promise(resolve=>{notifyHeld=resolve;}),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];
 if(p==='/api/auth/me')json={user:{id:'allergy-qa',username:'Synthetic allergy'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(p==='/api/precision')json={...buildPrecisionReport([],contextSchema.parse(await precision.getPrecisionContext('allergy-qa')),preferences,null),availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[],note:'Synthetic empty intake'}};
 else if(p==='/api/analysis/status')json={ai:{features:{ingredientParsing:false,recipeRanking:false}},nutrition:{liveLookupConfigured:false}};
 else if(p.startsWith('/api/meal-planner')||p==='/api/preferences'){
  const response=await fetch(apiBase+p+url.search,{method:req.method(),headers:{'content-type':'application/json',...(req.headers()['if-match']?{'If-Match':req.headers()['if-match']}: {})},...(req.postData()?{body:req.postData()}: {})}),text=await response.text();
  if(p==='/api/meal-planner/prioritize'){notifyHeld();await new Promise(resolve=>{release=resolve;});}
  return route.fulfill({status:response.status,contentType:'application/json',headers:{...(response.headers.get('x-bloom-preferences-revision')?{'X-Bloom-Preferences-Revision':response.headers.get('x-bloom-preferences-revision')}:{})},body:text});
 }
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5248/meal-planner?preferences=1');await page.getByRole('tab',{name:'Recipe library',exact:true}).click();await page.getByRole('heading',{name:recipeDisplayName(removed.name),exact:true}).waitFor();
 for(const recipe of recipes.filter(recipe=>foodPreferenceMatches(recipe.ingredients,['dairy']).length))assert.equal(await page.getByRole('heading',{name:recipeDisplayName(recipe.name),exact:true}).count(),0);
 await page.getByRole('button',{name:'Prioritize meals for my preferences',exact:true}).click();await held;await page.getByRole('checkbox',{name:'legumes',exact:true}).check();await page.getByRole('button',{name:'Save preferences',exact:true}).click();await page.getByText('Preferences saved to your account.',{exact:true}).waitFor();await page.getByRole('heading',{name:recipeDisplayName(removed.name),exact:true}).waitFor({state:'detached'});
 const done=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/meal-planner/prioritize');release();await done;await page.waitForLoadState('networkidle');assert.equal(await page.getByRole('heading',{name:recipeDisplayName(removed.name),exact:true}).count(),0,'Late prioritization cannot restore a food removed by fresh restrictions');
 const current=await(await fetch(apiBase+'/api/meal-planner')).json();assert.ok(current.suggestions.length);assert.ok(current.suggestions.every(recipe=>!foodPreferenceMatches(recipe.ingredients,['dairy']).length&&!recipe.ingredients.some(food=>food.tags.includes('legumes'))));const stored=await store.getUser('allergy-qa');assert.deepEqual(stored.dietaryPreferences.exclusions,['legumes']);assert.deepEqual(stored.dietaryPreferences.dislikes,[],'Encrypted allergy is not copied into ordinary taste data');
 await page.setViewportSize({width:320,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);console.log('PASS actual encrypted allergy source→recipe library/priority→save hard restriction→refetch→late result rejected; preferences unpolluted,320px');
}catch(error){console.error({errors,headings:await page.locator("h1,h2,h3").allTextContents(),body:(await page.locator('body').innerText()).slice(0,3000)});throw error;}finally{release?.();await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
