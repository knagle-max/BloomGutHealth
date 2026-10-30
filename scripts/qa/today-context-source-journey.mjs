import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const {createServer}=await import('vite');
const vite=await createServer({server:{host:'127.0.0.1',port:5188,strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:375,height:1000},timezoneId:'America/Regina'});await page.clock.install({time:new Date('2026-10-23T18:00:00Z')});
page.setDefaultTimeout(10000);
let scenario='session',writes=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/**',async route=>{const p=new URL(route.request().url()).pathname;let json=[];if(route.request().method()!=='GET')writes++;
if(p==='/api/auth/me')json={user:{id:'synthetic',username:'Today fixture'}};
else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
else if(p==='/api/biology/registry')json={entities:[],relationships:[],summary:'Synthetic registry',version:'synthetic'};
else if(p.startsWith('/api/biology/foods/'))json=null;
else if(p.startsWith('/api/biology/catalogue'))json={foods:[],totalFoods:0};
else if(p==='/api/products/search')json={products:[],warnings:['USDA Branded Foods is not configured.'],attribution:'Synthetic disabled source'};
else if(p==='/api/precision')json={...buildPrecisionReport([],contextSchema.parse({}),defaultPreferences,null),goals:[{id:'muscle',mapping:'Protein distribution',actions:['Include familiar protein foods.'],sourceIds:['goal-protein']}],sources:[{id:'goal-protein',title:'Synthetic source reference',url:'https://example.com',limitation:'No personal dose established.'}],context:{},safetyBlocks:[]};
else if(p.startsWith('/api/experience/records')){if(scenario==='error')return route.fulfill({status:503,json:{error:'Synthetic unavailable'}});json=scenario==='session'?[{id:'s',kind:'session',payload:{title:'Evening ride',startsAt:'2026-10-23T21:00:00Z',status:'planned'}}]:[];}
else if(p.startsWith('/api/meals'))json=[{id:'m',mealText:'Synthetic lunch',loggedAt:'2026-10-23T17:00:00Z',totalCalories:scenario==='partial'?null:400,protein:20,carbs:40,fat:12,nutritionalData:scenario==='partial'?{}:{calories:400,protein:20,carbs:40,fat:12}}];
await route.fulfill({json});});
try{
 for(const selected of ['session','goal']){
  scenario=selected;await page.goto('http://127.0.0.1:5188/');const focus=page.locator('.today-focus');if(selected==='session')await focus.getByRole('link',{name:'Review session fuel',exact:true}).waitFor();else await focus.getByText(/saved focus: Protein distribution/).waitFor();
  await page.evaluate(async selected=>{const{queryClient}=await import('/src/lib/queryClient.ts');for(const query of queryClient.getQueryCache().findAll({predicate:q=>q.queryKey[0]===(selected==='session'?'/api/experience/records':'/api/precision')}))query.setState({isInvalidated:true,fetchStatus:'idle'});},selected);await page.clock.runFor(100);
  const staleVisible=selected==='session'?await focus.getByRole('link',{name:'Review session fuel',exact:true}).count()>0:(await focus.innerText()).includes('saved focus: Protein distribution');
  if(process.env.BLOOM_EXPECT_STALE==='true'){assert.equal(staleVisible,true);console.log('REPRODUCED stale-idle '+selected+' context remains visible after invalidation');continue;}
  assert.equal(staleVisible,false,'Invalidated cached '+selected+' must not drive a current action');await focus.getByRole('link',{name:'Add food',exact:true}).waitFor();
  if(selected==='goal'){await focus.getByText('Why this?',{exact:true}).click();assert.equal(await focus.getByRole('link',{name:'Synthetic source reference',exact:true}).count(),0);assert.equal((await focus.innerText()).includes('Include familiar protein foods.'),false);}
  await page.evaluate(async selected=>{const{queryClient}=await import('/src/lib/queryClient.ts');for(const query of queryClient.getQueryCache().findAll({predicate:q=>q.queryKey[0]===(selected==='session'?'/api/experience/records':'/api/precision')}))query.setState({isInvalidated:false,fetchStatus:'idle'});},selected);await page.clock.runFor(100);
  if(selected==='session')await focus.getByRole('link',{name:'Review session fuel',exact:true}).waitFor();else await focus.getByText(/saved focus: Protein distribution/).waitFor();
 }
 assert.equal(writes,0);assert.deepEqual(errors,[]);console.log(process.env.BLOOM_EXPECT_STALE==='true'?'REPRODUCED stale-idle source regression without writes':'PASS Today current-source browser: invalidated idle schedule/focus withdraw, general food action preserved, evidence retracts and current-source restores; no writes.');
}catch(error){console.error({errors,body:(await page.locator('body').innerText()).slice(0,2000)});throw error;}finally{await browser.close();await vite.close();}
