import {catalogueFoods} from "../../server/food-catalog.ts";
import{analyzeMeal}from'../../server/meal-intelligence.ts';
import{reviewThenSave}from'./lib/meal-flow.mjs';import{mealReviewRevision}from'../../server/meal-review-source.ts';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const root=process.env.BLOOM_CAPTURE_ROOT||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const output='/tmp/bloom-ingredient-mass-reader';
const stage=process.env.BLOOM_CAPTURE_STAGE||'after';
const {chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const {createServer}=await import(root+'/node_modules/vite/dist/node/index.js');
const vite=await createServer({configFile:root+'/vite.config.ts',server:{port:5187,host:'127.0.0.1',strictPort:true}});
await fs.mkdir(output,{recursive:true});await vite.listen();
const browser=await chromium.launch({headless:true,...(process.env.BLOOM_CHROMIUM_EXECUTABLE?{executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']}: {})});
const page=await browser.newPage({viewport:{width:390,height:1000},locale:'en-CA',timezoneId:'America/Regina'});
page.setDefaultTimeout(12000);
await page.addInitScript(()=>localStorage.removeItem('theme'));
await page.clock.install({time:new Date('2026-10-23T18:00:00Z')});
const errors=[],writes=[],masses=[],captures=[];
let alternateAccount=false,journalState='complete',foodUnit='oz';
page.on('pageerror',e=>errors.push(e.message));
await page.route('https://fonts.**/**',r=>r.abort());
const meal={id:'synthetic-meal',userId:'synthetic',mealText:'Synthetic oats lunch',mealType:'lunch',loggedAt:'2026-10-23T17:00:00Z',totalCalories:500,totalProtein:20,totalCarbs:60,totalFat:20,nutritionalData:[{name:'Synthetic oats',calories:500,protein_g:20,carbohydrates_total_g:60,fat_total_g:20,fiber_g:8}],intelligence:null};
const selected=catalogueFoods.find(row=>/oat/i.test(row.description));const fixture=await analyzeMeal('',false,[{name:selected.description.slice(0,120),grams:113.3980925,preparation:selected.description.slice(0,120),assumption:'Synthetic manual portion',catalogue:{source:'usda-fndds',fdcId:selected.fdcId},massEntry:{version:1,capture:'manual-portion',value:'4.000',unit:'oz'}}]);Object.assign(meal,{intelligence:fixture.intelligence,nutritionalData:fixture.nutritionalData});
await page.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url()),p=url.pathname;
  let json=[];
  if(req.method()!=='GET')writes.push({path:p,body:req.postDataJSON()});
  if(p==='/api/auth/me')json={user:{id:alternateAccount?'synthetic-second':'synthetic',username:'Synthetic Gardener'}};
  else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'},displayUnits:alternateAccount?{energy:'kcal',foodWeight:'g'}:{energy:'kJ',foodWeight:foodUnit}};
  else if(p.startsWith('/api/meals')&&req.method()==='GET'&&journalState==='unavailable')return route.fulfill({status:503,json:{error:'Synthetic journal outage'}});
  else if(p.startsWith('/api/meals')&&req.method()==='GET'&&journalState==='partial')json=[{...meal,totalCalories:null,nutritionalData:[]}];
  else if(p==='/api/meals/review'){const input=req.postDataJSON(),analysis=await analyzeMeal('100 g banana',false);analysis.intelligence.ingredients=input.ingredients||analysis.intelligence.ingredients;return route.fulfill({json:analysis,headers:{'x-bloom-meal-review':mealReviewRevision('synthetic',analysis)}});}
  else if(p.startsWith('/api/meals'))json=req.method()==='POST'?meal:alternateAccount?[]:[meal];
  else if(p.startsWith('/api/nutrition/daily'))json={meals:alternateAccount?[]:[meal],totals:{calories:500,protein:20,carbs:60,fat:20,fiber:8,sugar:null,sodium:null,potassium:null}};
  else if(p.startsWith('/api/nutrition/targets'))json={calories:2000,protein:120,carbs:225,fat:67,fiber:30};
  else if(p==='/api/products/search')json={products:[],warnings:[],attribution:'Synthetic empty source',query:{original:'Synthetic oats',normalized:'Synthetic oats'}};
  else if(p==='/api/precision')json={goals:[],context:{},safetyBlocks:[]};
  else if(p==='/api/biology/registry')json={entities:[],relationships:[],sources:[]};
  else if(p.startsWith('/api/biology/foods/'))json={food:{label:'Synthetic oats'},decision:'No personal rule',conflicts:[],reasons:[],qualitativeNutrients:[],relationshipEffects:[],tracking:[],limits:[],observations:{labs:[],genetics:[]}};
  else if(p==='/api/biology/catalogue')json={foods:[{fdcId:123,description:'Synthetic oats'}],totalFoods:1};
  else if(p==='/api/biology/catalogue/123'){
    const grams=Number(url.searchParams.get('grams'));masses.push(grams);
    json={fdcId:123,description:'Synthetic oats',grams,portions:[['Source serving',100]],contributions:[{key:'calories',name:'Energy',amount:500,unit:'kcal'},{key:'protein_g',name:'Protein',amount:20,unit:'g'}],source:{title:'Synthetic composition fixture',url:'https://example.invalid/fixture'},limits:['Synthetic fixture; not a real food composition claim.']};
  }
  await route.fulfill({json});
});
const go=async route=>{await page.goto('http://127.0.0.1:5187'+route);await page.getByRole('main').waitFor();};

const openSource=async()=>{const card=page.getByTestId('card-meal-0');await card.waitFor();await card.getByTestId('button-expand-meal-0').click();await card.getByText('Nutrition & gut pathway explanation',{exact:true}).click();const row=card.getByRole('group',{name:'Ingredient 1',exact:true});await row.getByText('Portion entry source',{exact:true}).click();return row;};
try{
 await go('/nutrition');let row=await openSource();await row.getByText('Entered 4.000 oz.',{exact:false}).waitFor();
 foodUnit='g';await page.reload();row=await openSource();await row.getByText('Entered 4.000 oz.',{exact:false}).waitFor();
 await row.getByRole('spinbutton',{name:'Grams 1',exact:true}).fill('200');await row.getByText('Entered 200 g.',{exact:false}).waitFor();
 for(const width of[320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 meal.intelligence.ingredients[0].massEntry=undefined;await page.reload();row=await openSource();await row.getByText('Original portion text and unit were not retained.',{exact:false}).waitFor();
 alternateAccount=true;await page.reload();assert.equal(await page.getByText('Entered 4.000 oz.',{exact:false}).count(),0);assert.equal(await page.getByText('Portion entry source',{exact:true}).count(),0);
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);console.log('PASS actual App ingredient reader: original4.000oz survives display-unit change/reload; legacy unknown; local gram edit replaces stale original with actual new input;320–1440 reflow/other-owner fixture/no writes. Actual review-confirm/owned SQL/receipt persistence separately tested.');
}catch(error){console.error({errors,text:await page.locator('body').innerText()});throw error;}finally{await browser.close();await vite.close();}
