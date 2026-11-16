import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {createServer} from 'vite';
import {meals} from '../../shared/schema.ts';
import {contextSchema} from '../../shared/precision-nutrition.ts';
import {preferenceSchema} from '../../shared/meal-intelligence.ts';
import {snapshotFoods} from '../../shared/food-snapshot.ts';
import {analyzeMeal,nutritionTotals} from '../../server/meal-intelligence.ts';
import {PrecisionStorage} from '../../server/precision-storage.ts';
import {insertMealWithReceipt} from '../../server/meal-save.ts';
import {getOwnedMeal} from '../../server/meal-records.ts';
import {registerPrecisionRoutes} from '../../server/precision-routes.ts';
import {registerPlannerRoutes} from '../../server/planner-routes.ts';
import {openIngredientRow} from './lib/meal-flow.mjs';

const previousKey=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
const pg=new PGlite();await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('dinner-owner'),('other-owner');CREATE TABLE meals(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real)");
await pg.exec(readFileSync(new URL('../../migrations/0002_precision_nutrition.sql',import.meta.url),'utf8'));
const database=drizzle(pg),precision=new PrecisionStorage(database);
const prefs=preferenceSchema.parse({exclusions:['seafood'],goals:['grow muscle','longevity'],cookingMinutes:60});
const context=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true,goals:['grow muscle','longevity'],allergies:[]});
await precision.putPrecisionContext('dinner-owner',context);
const store={
 getUser:async id=>({id,age:35,dietaryPreferences:prefs}),getUserSamples:async()=>[],getNutritionProducts:async()=>[],getExperienceRecords:async()=>[],
 getPrecisionContext:id=>precision.getPrecisionContext(id),getPrecisionRecords:id=>precision.getPrecisionRecords(id),
 getMeal:(id,owner)=>getOwnedMeal(database,id,owner),getMeals:owner=>database.select().from(meals).where(eq(meals.userId,owner)),
 insertMeal:(meal,receipt)=>insertMealWithReceipt(database,meal,receipt),
};
const now=new Date(),day=now.toISOString().slice(0,10),dayStart=Date.parse(day+'T00:00:00Z');
for(const [mealType,text,earlier] of [['breakfast','100 g oats, 100 g banana',7200000],['lunch','150 g cooked chicken breast, 150 g cooked potato, 100 g broccoli',3600000]]){
 const analysis=await analyzeMeal(text,false);await store.insertMeal({userId:'dinner-owner',mealText:text,mealType,loggedAt:new Date(Math.max(dayStart,+now-earlier)),intelligence:analysis.intelligence,nutritionalData:analysis.nutritionalData,...nutritionTotals(analysis.nutritionalData)});
}
let actor='dinner-owner',lose=false,sourceUnavailable=false,planned;
const requests=[],errors=[];
const app=express();app.use(express.json());
const auth=(req,res,next)=>{const id=req.header('x-test-owner');if(!id)return res.sendStatus(401);req.session={userId:id};next();};
registerPrecisionRoutes(app,auth,store);registerPlannerRoutes(app,auth,store);
const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const base=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5257,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000},timezoneId:'UTC'});page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),url=new URL(req.url()),p=url.pathname;
 if(p==='/api/precision'||p==='/api/precision/today-plan'||p==='/api/meals'||p.startsWith('/api/meals/')){
  if(p==='/api/precision/today-plan'&&sourceUnavailable)return route.fulfill({status:503,json:{error:'Synthetic current intake unavailable'}});
  const response=await fetch(base+p+url.search,{method:req.method(),headers:{'content-type':'application/json','x-test-owner':actor,...(req.headers()['if-match']?{'if-match':req.headers()['if-match']}:{}),...(req.headers()['idempotency-key']?{'idempotency-key':req.headers()['idempotency-key']}:{})},...(req.postData()?{body:req.postData()}:{})});
  const body=await response.text();
  if(p==='/api/precision/today-plan'&&response.ok)planned=JSON.parse(body);
  if(p==='/api/meals/confirm'){requests.push({owner:actor,body:req.postData(),key:req.headers()['idempotency-key'],revision:req.headers()['if-match']});if(lose&&response.ok){lose=false;return route.fulfill({status:503,json:{error:'Synthetic dinner committed response lost'}});}}
  return route.fulfill({status:response.status,contentType:'application/json',body,headers:{...(response.headers.get('x-bloom-meal-review')?{'x-bloom-meal-review':response.headers.get('x-bloom-meal-review')}:{})}});
 }
 const json=p==='/api/auth/me'?{user:{id:actor,username:'Synthetic dinner fixture'}}:p==='/api/experience/settings'?{mode:'everyday',onboarding:{status:'complete'}}:p==='/api/preferences'?prefs:p==='/api/profile'?{}:p==='/api/analysis/status'?{ai:{configured:false},nutrition:{liveLookupConfigured:false}}:p==='/api/meal-planner'?{note:'Synthetic source',recentMeals:2,suggestions:[],pathways:[],sources:[],cohorts:[]}:p==='/api/precision/planning-recipes'?{recipes:[],unknownAllergies:[]}:p==='/api/meal-planner/progress'?{weeks:[],adherence:[]}:[];
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5257/meal-planner');const today=page.getByRole('tabpanel',{name:'Rest of today',exact:true});
 await today.getByText('2 meals logged today',{exact:true}).waitFor();assert.equal((await store.getMeals(actor)).length,2);
 await today.getByText('Review daily targets',{exact:true}).click();await today.getByLabel('Energy (kcal)',{exact:true}).fill('1500');
 const optional=today.getByText('Carbohydrate, fat & micronutrient targets',{exact:true});await optional.click();
 const extra=optional.locator('..').getByRole('spinbutton');for(const input of await extra.all())if(await input.inputValue())await input.fill('');
 await today.getByRole('button',{name:'Update suggestions with these targets',exact:true}).click();
 const dinner=today.locator('.meal-suggestion').filter({has:page.getByRole('heading',{name:/^dinner:/i})});await dinner.waitFor();
 const choice=planned.meals.find(meal=>meal.slot==='dinner');assert.ok(choice);assert.ok(choice.recipe.foodIngredients.length>=2);
 assert.equal(choice.recipe.ingredients.some(ingredient=>ingredient.tags.includes('seafood')),false);assert.equal((await store.getMeals(actor)).length,2,'Planning is not consumption');
 await dinner.getByText('Ingredients, recipe & evidence',{exact:true}).click();await dinner.getByText('Shopping & ingredients',{exact:true}).waitFor();
 const link=dinner.getByRole('link',{name:'Review and log this meal',exact:true}),target=new URL(await link.getAttribute('href'),'http://127.0.0.1:5257');
 const expected=choice.recipe.ingredients.map(ingredient=>ingredient.grams*choice.portion);
 assert.ok(expected.some(grams=>!Number.isInteger(grams)),'Dinner fixture must exercise fractional prepared portions');
 await link.click();const text=page.getByLabel('What did you eat?',{exact:true});await text.waitFor();assert.equal(await text.inputValue(),target.searchParams.get('description'));
 await page.getByRole('button',{name:'Review meal',exact:true}).click();await page.getByRole('heading',{name:'Review your meal',exact:true}).waitFor();assert.equal((await store.getMeals(actor)).length,2);
 for(let i=0;i<expected.length;i++)assert.equal(Number(await page.getByLabel(`Grams ${i+1}`,{exact:true}).inputValue()),expected[i],'Prepared portion must survive the planner→review transfer exactly');
 await openIngredientRow(page,1);const corrected=expected[0]+0.5;await page.getByLabel('Grams 1',{exact:true}).fill(String(corrected));
 await page.getByRole('button',{name:'Update meal review',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('[data-testid="button-save-meal"]').disabled);
 assert.equal((await store.getMeals(actor)).length,2);lose=true;await page.getByRole('button',{name:'Save meal',exact:true}).click();
 await page.getByText('Synthetic dinner committed response lost',{exact:false}).first().waitFor();assert.equal((await store.getMeals(actor)).length,3);
 await page.getByRole('button',{name:'Retry saving my meal',exact:true}).click();await page.getByRole('heading',{name:'Your meal is saved.',exact:true}).waitFor();assert.equal((await store.getMeals(actor)).length,3);assert.deepEqual(requests[0],requests[1]);
 const saved=(await store.getMeals(actor)).find(meal=>meal.mealType==='dinner');assert.ok(saved);assert.equal(saved.intelligence.ingredients[0].grams,corrected);
 assert.deepEqual(saved.intelligence.ingredients.map(i=>i.grams),[corrected,...expected.slice(1)],'Only the explicitly edited ingredient changes');
 const sourceIds=choice.recipe.foodIngredients.map(ingredient=>snapshotFoods.find(food=>food.id===ingredient.foodId).fdcId);
 assert.ok(sourceIds.every(id=>saved.intelligence.foodMatches.some(match=>match.fdcId===id)),'Original explicit USDA prepared food identities remain available after review and save');
 await page.reload();assert.equal((await store.getMeals(actor)).length,3);assert.equal((await store.getMeals('other-owner')).length,0);
 const denied=await fetch(base+'/api/meals/'+saved.id+'/composer',{headers:{'x-test-owner':'other-owner'}});assert.equal(denied.status,404);
 actor='other-owner';await page.goto('http://127.0.0.1:5257/meal-planner');await today.getByText('0 meals logged today',{exact:true}).waitFor();assert.equal((await store.getMeals(actor)).length,0);
 assert.deepEqual(errors,[]);console.log('PASS actual Today-plan HTTP/SQL: two logged meals+saved goals/exclusions→specific sourced dinner→exact prepared grams→independent correction→reviewed single consumed save with lost-response retry→reload/owner isolation. Synthetic non-patient data; no external model or provider.');
}catch(error){console.error({errors,planned:planned?{eatenMeals:planned.eatenMeals,meals:planned.meals?.map(meal=>({slot:meal.slot,id:meal.recipe.id,portion:meal.portion}))}:null,body:(await page.locator('body').innerText()).slice(-3500)});throw error;}
finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(resolve));await pg.close();if(previousKey===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previousKey;}
