import {setAppTheme} from './set-app-theme.mjs';
import {openIngredientRow} from './lib/meal-flow.mjs';
import{reviewThenSave}from'./lib/meal-flow.mjs';
import assert from 'node:assert/strict';import{createRequire}from'node:module';import express from'express';import{createServer}from'vite';import{PGlite}from'@electric-sql/pglite';import{drizzle}from'drizzle-orm/pglite';import{eq}from'drizzle-orm';import{meals}from'../../shared/schema.ts';import{insertMealWithReceipt}from'../../server/meal-save.ts';import{registerPlannerRoutes}from'../../server/planner-routes.ts';
const pg=new PGlite();await pg.exec(`CREATE TABLE meals(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real);`);const database=drizzle(pg);
const store={getMeal:async id=>(await database.select().from(meals).where(eq(meals.id,id)))[0],getMeals:async id=>(await database.select().from(meals).where(eq(meals.userId,id))),insertMeal:(meal,receipt)=>insertMealWithReceipt(database,meal,receipt),updateMeal:async(id,updates)=>(await database.update(meals).set(updates).where(eq(meals.id,id)).returning())[0],getExperienceRecords:async()=>[],getNutritionProducts:async()=>[]};
const app=express();app.use(express.json());registerPlannerRoutes(app,(req,_res,next)=>{req.session={userId:'correction-fixture'};next();},store);const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const base=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5228,strictPort:true}});await vite.listen();const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);let lose=true,hold=true,release;const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),u=new URL(req.url());let json=[];
 if(u.pathname.startsWith('/api/meals')&&req.method()!=='GET'){
  const response=await fetch(base+u.pathname,{method:req.method(),headers:{'content-type':'application/json',...(req.headers()['if-match']?{'If-Match':req.headers()['if-match']}:{}),...(req.headers()['idempotency-key']?{'Idempotency-Key':req.headers()['idempotency-key']}:{})},body:req.postData()});
  const body=await response.text();if(req.method()==='PUT'){if(hold)await new Promise(r=>{release=r;});if(lose)return route.fulfill({status:503,json:{error:'Synthetic committed correction response lost'}});}
  return route.fulfill({status:response.status,contentType:'application/json',headers:{...(response.headers.get('x-bloom-meal-review')?{'x-bloom-meal-review':response.headers.get('x-bloom-meal-review')}:{})},body});
 }
 if(u.pathname==='/api/auth/me')json={user:{id:'correction-fixture',username:'Synthetic correction'}};
 else if(u.pathname==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(u.pathname==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
 else if(u.pathname==='/api/capabilities')json={eligible:false,experimentalEnabled:false};
 else if(u.pathname.startsWith('/api/meals'))json=await store.getMeals('correction-fixture');
 await route.fulfill({json});});

try{
 hold=false;lose=false;
 await page.goto('http://127.0.0.1:5228/log-meal?method=describe');
 const whole=process.env.BLOOM_PORTION_WHOLE==='1',description=whole?'half a large pepperoni pizza':'2 slices of pepperoni pizza';
 await page.getByLabel('Describe your meal',{exact:true}).fill(description);
 await page.getByRole('button',{name:'Review meal',exact:true}).click();
 await page.getByRole('heading',{name:'Review your meal',exact:true}).waitFor();
 await page.getByText('Nutrition sources & science',{exact:true}).click();
 const forms=page.getByText('Nutrient forms & units',{exact:true});await forms.focus();await page.keyboard.press('Enter');
 await page.getByText('Matched USDA nutrient fields use these definitions when a value is available. The definitions do not fill a missing amount or identify every chemical form.',{exact:true}).waitFor();
 assert.ok((await page.locator('body').innerText()).includes('not dietary folate equivalents (DFE)'));
 assert.equal(await forms.evaluate(el=>el.getBoundingClientRect().height>=44),true);
 await page.getByRole('heading',{name:'Original generic source values',exact:true}).waitFor();assert.equal(await page.getByText('Per100g source amount',{exact:true}).count(),1);assert.equal(await page.getByRole('link',{name:/^Original food source for /}).evaluate(el=>el.getBoundingClientRect().height>=44),true);
 await openIngredientRow(page,1);
 assert.match(await page.getByLabel('Portion unit 1',{exact:true}).inputValue(),whole?/^1 large pizza/:/slice/);
 assert.equal(await page.getByLabel('Portion quantity 1',{exact:true}).inputValue(),whole?'0.5':'2');
 const select=page.getByLabel('Portion unit 1',{exact:true});
 const large=await select.locator('option').evaluateAll(options=>options.find(o=>/slice.*?, large pizza/.test(o.value)).value);
 await select.selectOption(large);
 await page.getByLabel('Portion quantity 1',{exact:true}).fill('');
 assert.equal(await page.getByRole('button',{name:'Update meal review',exact:true}).isDisabled(),true);
 await page.getByLabel('Portion quantity 1',{exact:true}).fill('3');
 await select.focus();await page.keyboard.press('Tab');
 assert.equal(await page.getByLabel('Portion quantity 1',{exact:true}).evaluate(el=>el===document.activeElement),true);
 for(const width of [320,390]){
   await page.setViewportSize({width,height:950});
   for(const theme of ['light','dark']){
     await setAppTheme(page,theme);
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
     assert.equal(await page.getByLabel('Portion quantity 1',{exact:true}).isVisible(),true);
   }
 }
 await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
 for(const label of ['Portion unit 1','Portion quantity 1'])assert.equal(await page.getByLabel(label,{exact:true}).evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}),true);
 await page.evaluate(()=>{document.documentElement.style.fontSize='';});
 await page.getByRole('button',{name:'Update meal review',exact:true}).click();
 await page.getByRole('button',{name:'Save meal',exact:true}).click();
 await page.getByRole('heading',{name:'Your meal is saved.',exact:true}).waitFor();
 const saved=(await store.getMeals('correction-fixture'))[0];
 assert.equal(saved.mealText,description);
 assert.equal(saved.intelligence.ingredients[0].household.quantity,3);
 assert.equal(saved.intelligence.ingredients[0].household.selected,large);
 assert.equal(saved.intelligence.ingredients[0].grams,372);
 assert.ok(saved.intelligence.nutrientSourceSnapshots.length>0);assert.equal(saved.intelligence.nutrientSourceSnapshots[0].reviewedGrams,372);assert.equal(saved.intelligence.nutrientSourceSnapshots[0].values.length,21);
 for(const width of [320,390]){
  await page.setViewportSize({width,height:950});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 }
 await page.reload();
 await page.getByText('Review a recent meal',{exact:true}).click();
 await page.getByRole('button',{name:'Review this recent meal',exact:true}).click();
 await page.getByRole('button',{name:'Review meal',exact:true}).click();
 await page.getByRole('heading',{name:'Review your meal',exact:true}).waitFor();
 await openIngredientRow(page,1);
 assert.equal(await page.getByLabel('Portion quantity 1',{exact:true}).inputValue(),'3');
 assert.equal(await page.getByLabel('Portion unit 1',{exact:true}).inputValue(),large);
 await page.getByLabel('Portion unit 1',{exact:true}).selectOption('grams');
 await page.getByLabel('Grams 1',{exact:true}).fill('200');
 await page.getByRole('button',{name:'Update meal review',exact:true}).click();
 await page.getByLabel('Grams 1',{exact:true}).waitFor();
 assert.equal(await page.getByLabel('Grams 1',{exact:true}).inputValue(),'200');

 const mealsResponse=await store.getMeals('correction-fixture');
 assert.equal(mealsResponse.length,1);
 assert.equal(mealsResponse[0].intelligence.ingredients[0].household.quantity,3);
 assert.deepEqual(errors,[]);
 console.log('PASS: actual App → review API → save → isolated PostgreSQL retains original description, edited3 large slices/372g, source choices, counts, reload/reuse and switching back to grams;320/390px no overflow.');
}catch(error){console.error({errors,body:await page.locator('body').innerText()});throw error;}finally{release?.();await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));await pg.close();}
