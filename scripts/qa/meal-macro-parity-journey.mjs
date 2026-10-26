import assert from 'node:assert/strict';import{createRequire}from'node:module';import express from'express';import{createServer}from'vite';import{PGlite}from'@electric-sql/pglite';import{drizzle}from'drizzle-orm/pglite';import{eq}from'drizzle-orm';import{meals}from'../../shared/schema.ts';import{insertMealWithReceipt}from'../../server/meal-save.ts';import{registerPlannerRoutes}from'../../server/planner-routes.ts';
const pg=new PGlite();await pg.exec(`CREATE TABLE meals(id varchar PRIMARY KEY DEFAULT gen_random_uuid(),user_id varchar NOT NULL,meal_text text NOT NULL,meal_type text,logged_at timestamp NOT NULL DEFAULT now(),nutritional_data jsonb,meal_context jsonb,intelligence jsonb,total_calories real,total_protein real,total_carbs real,total_fat real);`);const database=drizzle(pg);
const store={getMeal:async id=>(await database.select().from(meals).where(eq(meals.id,id)))[0],getMeals:async id=>(await database.select().from(meals).where(eq(meals.userId,id))),insertMeal:(meal,receipt)=>insertMealWithReceipt(database,meal,receipt),updateMeal:async(id,updates)=>(await database.update(meals).set(updates).where(eq(meals.id,id)).returning())[0],getExperienceRecords:async()=>[],getNutritionProducts:async()=>[]};
const app=express();app.use(express.json());registerPlannerRoutes(app,(req,_res,next)=>{req.session={userId:'correction-fixture'};next();},store);const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const base=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5224,strictPort:true}});await vite.listen();const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);let lose=true,hold=true,release;const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),u=new URL(req.url());let json=[];
 if(u.pathname.startsWith('/api/meals')&&req.method()!=='GET'){
  const response=await fetch(base+u.pathname,{method:req.method(),headers:{'content-type':'application/json',...(req.headers()['idempotency-key']?{'Idempotency-Key':req.headers()['idempotency-key']}:{})},body:req.postData()});
  const body=await response.text();if(req.method()==='PUT'){if(hold)await new Promise(r=>{release=r;});if(lose)return route.fulfill({status:503,json:{error:'Synthetic committed correction response lost'}});}
  return route.fulfill({status:response.status,contentType:'application/json',body});
 }
 if(u.pathname==='/api/auth/me')json={user:{id:'correction-fixture',username:'Synthetic correction'}};
 else if(u.pathname==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(u.pathname==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
 else if(u.pathname==='/api/capabilities')json={eligible:false,experimentalEnabled:false};
 else if(u.pathname.startsWith('/api/meals'))json=await store.getMeals('correction-fixture');
 await route.fulfill({json});});

try{
 await page.goto('http://127.0.0.1:5224/log-meal?method=describe');await page.getByLabel('Describe your meal',{exact:true}).fill('0.5 g almonds');await page.getByRole('button',{name:'Save to my journal',exact:true}).click();await page.getByRole('heading',{name:'Your meal is saved.',exact:true}).waitFor();
 const original=(await store.getMeals('correction-fixture'))[0];
 for(const [label,field] of [['protein','totalProtein'],['carbs','totalCarbs'],['fat','totalFat']]){
  assert.ok(original[field]>0&&original[field]<0.5);
  const metric=page.locator('.saved-nutrients > span').filter({hasText:new RegExp(label+'$')});
  assert.equal(await metric.count(),1,'Overview must contain '+label);
  assert.equal(parseFloat(await metric.innerText()),original[field],label+' overview must retain the actual small positive saved amount');
 }
 const table=page.getByRole('table');await table.waitFor();assert.equal(await table.getByRole('cell',{name:'0.11 g',exact:true}).count(),2);await table.getByRole('cell',{name:'0.26 g',exact:true}).waitFor();
 hold=false;lose=false;await page.getByLabel('Grams 1',{exact:true}).fill('1');await page.getByRole('button',{name:'Save corrected portions & recalculate',exact:true}).click();await page.waitForFunction(()=>Array.from(document.querySelectorAll('.saved-nutrients > span')).some(el=>el.textContent.includes('0.21')&&el.textContent.includes('protein')));
 const corrected=(await store.getMeals('correction-fixture'))[0];assert.equal(corrected.id,original.id);assert.ok(corrected.totalProtein>original.totalProtein);assert.equal((await store.getMeals('correction-fixture')).length,1);
 await page.goto('http://127.0.0.1:5224/nutrition');await page.getByTestId('card-meal-0').waitFor();const meal=page.getByTestId('card-meal-0');for(const [prefix,field] of [['P','totalProtein'],['C','totalCarbs'],['F','totalFat']])assert.ok((await meal.innerText()).includes(prefix+': '+corrected[field]+'g'));
 assert.deepEqual(errors,[]);console.log('PASS: actual local food/HTTP/PostgreSQL small positive P/C/F remain identical across saved overview/details/correction/reloaded journal; one meal, unmodified canonical floats. Controlled synthetic meal, not captured owner case.');
}catch(error){console.error({errors,body:await page.locator('body').innerText()});throw error;}finally{release?.();await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));await pg.close();}
