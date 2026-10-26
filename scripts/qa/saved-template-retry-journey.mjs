import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
const vite=await createServer({server:{host:'127.0.0.1',port:5219,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:900}});page.setDefaultTimeout(12000);
let lose=true,hold=true,release;const meals=new Map(),requests=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),p=new URL(req.url()).pathname;let json=[];
 if(p==='/api/auth/me')json={user:{id:'template-review',username:'Synthetic template review'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(p==='/api/experience/records')json=[{id:'template',kind:'meal-template',payload:{name:'Banana',mealText:'100 g banana',ingredients:[]}}];
 else if(p==='/api/meals')json=Array.from(meals.values());
 else if(p==='/api/experience/templates/template/log'){
  const key=req.headers()['idempotency-key'],body=req.postDataJSON();requests.push({key,body});
  assert.ok(key);if(!meals.has(key))meals.set(key,{id:key,totalCalories:100,...body});
  if(hold)await new Promise(r=>{release=r;});
  if(lose)return route.fulfill({status:503,json:{error:'Synthetic committed response lost. Retry the same save.'}});
  json=meals.get(key);
 }
 await route.fulfill({json});
});
const log=()=>page.getByRole('button',{name:'Log this saved meal',exact:true});
try{
 await page.goto('http://127.0.0.1:5219/saved-meals');await log().waitFor();
 await page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');await queryClient.fetchQuery({queryKey:['/api/meals']});});
 await page.getByLabel('Portion multiplier',{exact:true}).fill('2');await log().click();
 await page.waitForFunction(()=>document.querySelector('fieldset')?.disabled);
 assert.equal(await page.getByLabel('Portion multiplier',{exact:true}).isDisabled(),true);
 assert.equal(await page.getByRole('button',{name:'Remove saved meal',exact:true}).isDisabled(),true);
 hold=false;release();await page.getByRole('alert').filter({hasText:'Synthetic committed response lost'}).waitFor();
 assert.equal(await page.getByLabel('Portion multiplier',{exact:true}).inputValue(),'2');
 assert.equal(await page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');return queryClient.getQueryState(['/api/meals']).isInvalidated;}),true);
 lose=false;await log().click();await page.getByRole('status').filter({hasText:'Meal logged.'}).waitFor();
 assert.equal(meals.size,1);assert.equal(requests[0].key,requests[1].key);assert.deepEqual(requests[0].body,requests[1].body);
 await log().click();await page.waitForFunction(()=>Array.from(document.querySelectorAll('[role="status"]')).some(el=>el.textContent.startsWith('Meal logged.')));assert.equal(meals.size,2);assert.notEqual(requests[1].key,requests[2].key);
 assert.deepEqual(errors,[]);console.log('PASS: saved-template committed-response failure retains exact receipt and frozen source inputs; retry one meal, successful next intent separate, inactive meal totals invalidated. Synthetic HTTP storage; actual route/PostgreSQL receipt contract tested separately.');
}finally{release?.();await browser.close();await vite.close();}
