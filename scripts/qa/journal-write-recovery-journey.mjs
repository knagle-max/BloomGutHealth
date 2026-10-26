import assert from 'node:assert/strict';import{createRequire}from'node:module';import{createServer}from'vite';
const vite=await createServer({server:{host:'127.0.0.1',port:5220,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);
await page.clock.install({time:new Date('2026-10-26T18:00:00Z')});let lose=true,hold=false,release;const meals=[],receipts=new Map(),requests=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
const nutrientKeys=['calories','protein','carbs','fat','fiber','sugar','sodium','potassium'];
await page.route('**/api/**',async route=>{const req=route.request(),p=new URL(req.url()).pathname;let json=[];
 if(p==='/api/auth/me')json={user:{id:'journal-write',username:'Synthetic journal write'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(p.startsWith('/api/nutrition/targets'))json=Object.fromEntries(nutrientKeys.map(k=>[k,2000]));
 else if(p.startsWith('/api/nutrition/daily'))json={meals,totals:Object.fromEntries(nutrientKeys.map(k=>[k,k==='calories'?meals.length*100:null])),nutritionCoverage:{},isPartial:true};
 else if(p==='/api/analysis/status')json={ai:{configured:false}};
 else if(p.startsWith('/api/meals')&&req.method()!=='GET'){
  const body=req.postDataJSON(),key=req.headers()['idempotency-key'],method=req.method();requests.push({key,body,method});
  if(method==='POST'){let meal=receipts.get(key);if(!meal){meal={id:'meal-'+meals.length,loggedAt:'2026-10-26T17:00:00Z',totalCalories:100,totalProtein:0,totalCarbs:null,totalFat:null,nutritionalData:[],...body};meals.push(meal);if(key)receipts.set(key,meal);}json=meal;}
  else if(method==='PUT'){json=Object.assign(meals.find(m=>p.endsWith('/'+m.id)),body);}
  else {meals.splice(meals.findIndex(m=>p.endsWith('/'+m.id)),1);json={success:true};}
  if(hold)await new Promise(r=>{release=r;});
  if(lose)return route.fulfill({status:503,json:{error:'Synthetic committed journal response lost'}});
 }
 else if(p.startsWith('/api/meals'))json=meals;
 await route.fulfill({json});});
const seed=()=>page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');queryClient.setQueryData(['/api/experience/athlete-day','inactive'],{synthetic:true});});
const invalidated=()=>page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');return queryClient.getQueryState(['/api/experience/athlete-day','inactive']).isInvalidated;});
try{
 await page.goto('http://127.0.0.1:5220/nutrition');await page.getByTestId('button-show-log-meal').click();await page.getByTestId('input-food-description').fill('100 g banana');await seed();await page.getByTestId('button-save-meal').click();await page.getByText('Synthetic committed journal response lost',{exact:true}).waitFor();
 assert.equal(await invalidated(),true,'Uncertain committed journal write must invalidate linked Athlete guidance');assert.equal(await page.getByTestId('input-food-description').inputValue(),'100 g banana');
 lose=false;await page.getByTestId('button-save-meal').click();await page.getByText('100 g banana',{exact:true}).first().waitFor();assert.equal(meals.length,1);assert.ok(requests[0].key);assert.equal(requests[0].key,requests[1].key);
 await page.getByTestId('button-edit-meal-0').click();await page.getByTestId('input-food-description').fill('200 g banana');await seed();lose=true;hold=true;await page.getByTestId('button-save-meal').click();await page.waitForFunction(()=>document.querySelector('[data-testid="input-food-description"]').matches(':disabled'));
 assert.equal(await page.getByTestId('button-cancel-log-meal').isDisabled(),true);assert.equal(await page.getByTestId('button-edit-meal-0').isDisabled(),true);hold=false;release();await page.getByText('Synthetic committed journal response lost',{exact:true}).last().waitFor();assert.equal(await invalidated(),true);assert.equal(await page.getByTestId('input-food-description').inputValue(),'200 g banana');
 lose=false;await page.getByTestId('button-save-meal').click();await page.getByText('200 g banana',{exact:true}).first().waitFor();assert.equal(meals.length,1);
 await seed();lose=true;await page.getByTestId('button-delete-meal-0').click();await page.getByRole('alertdialog').getByRole('button',{name:'Delete',exact:true}).click();await page.getByText('Synthetic committed journal response lost',{exact:true}).last().waitFor();assert.equal(await invalidated(),true);assert.equal(meals.length,0);assert.deepEqual(errors,[]);
 console.log('PASS: legacy journal create reuses receipt after committed-response loss; create/correct/delete recheck linked sources; drafts retained and pending editor frozen. Synthetic HTTP storage, canonical durable route contract covered separately.');
}catch(error){console.error({errors,requests});throw error;}finally{release?.();await browser.close();await vite.close();}
