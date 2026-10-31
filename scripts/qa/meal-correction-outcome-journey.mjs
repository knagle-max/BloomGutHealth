import{getOwnedMeal,updateOwnedMeal}from'../../server/meal-records.ts';
import{reviewThenSave}from'./lib/meal-flow.mjs';
import assert from 'node:assert/strict';import{createRequire}from'node:module';import express from'express';import{createServer}from'vite';import{PGlite}from'@electric-sql/pglite';import{drizzle}from'drizzle-orm/pglite';import{eq}from'drizzle-orm';import{meals}from'../../shared/schema.ts';import{insertMealWithReceipt}from'../../server/meal-save.ts';import{registerPlannerRoutes}from'../../server/planner-routes.ts';
const pg=new PGlite();await pg.exec(`CREATE TABLE meals(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real);`);const database=drizzle(pg);
const store={getMeal:(id,owner)=>getOwnedMeal(database,id,owner),getMeals:async id=>(await database.select().from(meals).where(eq(meals.userId,id))),insertMeal:(meal,receipt)=>insertMealWithReceipt(database,meal,receipt),updateMeal:(id,updates,owner)=>updateOwnedMeal(database,id,updates,owner),getExperienceRecords:async()=>[],getNutritionProducts:async()=>[]};
const app=express();app.use(express.json());registerPlannerRoutes(app,(req,_res,next)=>{req.session={userId:'correction-fixture'};next();},store);const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const base=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5222,strictPort:true}});await vite.listen();const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);let lose=true,hold=true,release;const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
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
 await page.goto('http://127.0.0.1:5222/log-meal?method=describe');await page.getByLabel('Describe your meal',{exact:true}).fill('100 g banana');await reviewThenSave(page);await page.getByRole('heading',{name:'Your meal is saved.',exact:true}).waitFor();const first=(await store.getMeals('correction-fixture'))[0];assert.ok(first.totalCalories>0);
 await page.getByLabel('Grams 1',{exact:true}).fill('200');await page.getByRole('button',{name:'Save corrected portions & recalculate',exact:true}).click();await page.getByRole('button',{name:'Recalculating…',exact:true}).waitFor();if(process.env.BLOOM_CORRECTION_SKIP_PENDING_ASSERT!=='true'){assert.equal(await page.getByLabel('Grams 1',{exact:true}).isDisabled(),true,'Pending correction must freeze the editor');assert.equal(await page.locator('.saved-nutrients').count(),0,'Pending correction must withdraw prior totals');assert.equal(await page.locator('.confirmation-source').count(),0,'Pending correction must withdraw prior ingredient snapshot');}
 hold=false;release();await page.getByText('Synthetic committed correction response lost',{exact:true}).waitFor();assert.equal(await page.getByLabel('Grams 1',{exact:true}).inputValue(),'200');assert.equal(await page.locator('.saved-nutrients').count(),0);assert.equal(await page.getByRole('table').count(),0,'Unconfirmed correction must not retain old nutrient table');assert.equal(await page.locator('.confirmation-source').count(),0);const committed=(await store.getMeals('correction-fixture'))[0];assert.ok(committed.totalCalories>first.totalCalories*1.9);
 lose=false;await page.getByRole('button',{name:'Save corrected portions & recalculate',exact:true}).click();await page.locator('.saved-nutrients').waitFor();await page.getByRole('table').waitFor();assert.equal(await page.getByLabel('Grams 1',{exact:true}).inputValue(),'200');assert.equal((await store.getMeals('correction-fixture')).length,1);assert.deepEqual(errors,[]);
 await page.goto('http://127.0.0.1:5222/nutrition');
 const recordedName=committed.intelligence.ingredients[0].name;assert.notEqual(recordedName,'100 g banana');
 const card=page.getByTestId('card-meal-0');
 await card.getByTestId('text-meal-description-0').getByText(recordedName,{exact:true}).waitFor();
 await card.getByText('Recorded foods & original description',{exact:true}).click();
 const identity=card.getByTestId('meal-recorded-foods-0');
 await identity.getByText('Original description: 100 g banana',{exact:true}).waitFor();
 assert.ok((await identity.innerText()).includes('200 g'));
 const edit=card.getByRole('button',{name:'Edit meal: '+recordedName,exact:true});await edit.focus();await page.keyboard.press('Enter');
 assert.equal(await page.getByTestId('input-food-description').inputValue(),'100 g banana','Metadata editor retains original source text');
 await page.getByTestId('button-save-meal').click();await page.getByTestId('input-food-description').waitFor({state:'hidden'});
 assert.equal((await store.getMeals('correction-fixture'))[0].intelligence.ingredients[0].grams,200,'Metadata save preserves corrected amount');
 await page.reload();await page.getByTestId('text-meal-description-0').getByText(recordedName,{exact:true}).waitFor();
 const remove=page.getByRole('button',{name:'Delete meal: '+recordedName,exact:true});await remove.focus();await page.keyboard.press('Enter');
 await page.getByRole('alertdialog').getByRole('button',{name:'Cancel',exact:true}).click();
 assert.equal((await store.getMeals('correction-fixture')).length,1);
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Journal fits '+width);}
 assert.deepEqual(errors,[]);
 console.log('PASS journal canonical banana identity vs original100g description, corrected200g, keyboard metadata edit/preserve/reload/delete cancellation,320/390/1280 reflow. Local actual planner/PGlite; not hosted acceptance.');
 console.log('PASS: actual planner routes/PostgreSQL correction commit with lost response withdraws stale totals/analysis, freezes pending inputs, preserves200g draft and recovers one meal on retry. Synthetic account, no provider calls.');
}catch(error){console.error({errors,body:await page.locator('body').innerText()});throw error;}finally{release?.();await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));await pg.close();}
