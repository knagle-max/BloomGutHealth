import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'vite';
import {analyzeMeal,nutritionTotals} from '../../server/meal-intelligence.ts';
import {recordedNutritionPeriod} from '../../server/nutrition-history.ts';
import {mealNutritionSummary} from '../../shared/nutrition-summary.ts';
import {setAppTheme} from './set-app-theme.mjs';

// Read-only synthetic records. Saved writes/retries are exercised separately by
// unified-meal-editor-journey against the real planner handlers and isolated SQL.
const now=new Date('2026-11-15T12:00:00Z'),owner='synthetic-editorial-journal';
const analysis=await analyzeMeal('2 slices pepperoni pizza',false);
const rows=Array.from({length:42},(_,index)=>({id:`editorial-${index}`,userId:owner,
 mealText:index===0?'Synthetic measured zero':index===1?'Synthetic unknown nutrients':'2 slices pepperoni pizza',
 mealType:'lunch',loggedAt:new Date(+now-index*3600000).toISOString(),
 nutritionalData:index<2?[]:analysis.nutritionalData,intelligence:index<2?null:analysis.intelligence,
 ...(index<2?{totalCalories:index===0?0:null,totalProtein:index===0?0:null,totalCarbs:null,totalFat:null}:nutritionTotals(analysis.nutritionalData)),
 mealContext:{timeZone:'UTC',symptoms:{bloating:0,energy:null}},
}));
const daily=rows.filter(row=>row.loggedAt.startsWith('2026-11-15'));
const period=recordedNutritionPeriod(rows),monthly={...period,year:2026,month:10,totalDays:30};
const yearly={...period,year:2026,monthlyBreakdown:[{month:10,monthName:'November',mealsLogged:42,daysWithMeals:period.daysWithMeals,avgCalories:period.dailyAverages.calories,avgProtein:period.dailyAverages.protein}]};
const baseline=process.env.BLOOM_FOOD_LAYOUT_BASELINE;
const historicalFiles=baseline?new Map(['client/src/pages/LogMeal.tsx','client/src/pages/NutritionHistory.tsx'].map(file=>[path.resolve(file),execFileSync('git',['show',`${baseline}:${file}`],{encoding:'utf8'})])):new Map();
const out=process.env.BLOOM_FOOD_EDITORIAL_REVIEW||'/tmp/bloom-food-editorial-after';await mkdir(out,{recursive:true});
const vite=await createServer({plugins:baseline?[{name:'food-controlled-source-baseline',enforce:'pre',load(id){return historicalFiles.get(id.split('?')[0]);}}]:[],server:{host:'127.0.0.1',port:5278,strictPort:true}});
await vite.listen();const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000},timezoneId:'UTC'});await page.clock.setFixedTime(now);page.setDefaultTimeout(12000);
let mode='everyday';const errors=[],writes=[],evidence=[],baselineOverflows=[];page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];
 if(!['GET','HEAD','OPTIONS'].includes(req.method())){writes.push(p);return route.fulfill({status:403,json:{error:'Read-only synthetic fixture'}});}
 if(p==='/api/auth/me')json={user:{id:owner,username:'Synthetic journal review'}};
 else if(p==='/api/experience/settings')json={mode,displayUnits:{energy:'kcal'},onboarding:{status:'complete'}};
 else if(p.startsWith('/api/nutrition/daily/'))json={meals:daily,...mealNutritionSummary(daily),nutritionCoverage:mealNutritionSummary(daily).coverage};
 else if(p.startsWith('/api/nutrition/targets/'))json={calories:2000,protein:100,carbs:200,fat:70,fiber:30,basis:{kind:'example-reference'}};
 else if(p.startsWith('/api/nutrition/monthly/'))json=monthly;
 else if(p.startsWith('/api/nutrition/yearly/'))json=yearly;
 else if(p===`/api/meals/${owner}`)json=rows;
 else if(p==='/api/analysis/status')json={ai:{configured:false}};
 await route.fulfill({json});
});
const cards=()=>page.locator('[data-testid^="card-meal-"]');
const noOverflow=async label=>{
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 if(overflow){
  if(baseline){baselineOverflows.push(label);return;}
  console.log(label,await page.locator('main').evaluate(root=>Array.from(root.querySelectorAll('*')).flatMap(el=>{const r=el.getBoundingClientRect();return r.right>innerWidth+1?[{tag:el.tagName,class:el.className,text:el.textContent?.slice(0,65),width:r.width,right:r.right}]:[]}).slice(0,14)));await page.screenshot({path:`${out}/overflow.png`});
 }
 assert.equal(overflow,false,label);
};
try{
 for(mode of ['everyday','athlete']){
  await page.goto('http://127.0.0.1:5278/nutrition');await page.getByTestId('card-meal-19').waitFor();assert.equal(await cards().count(),20);
  assert.equal(await page.locator('main.bloom-food-editorial').count(),baseline?0:1,'Controlled source override must actually select the requested presentation');
  assert.match(await page.getByTestId('badge-meal-calories-0').innerText(),/^0 kcal$/);
  assert.match(await page.getByTestId('badge-meal-calories-1').innerText(),/Unavailable/);
  await page.getByRole('button',{name:'Show more journal entries (22 remaining)',exact:true}).click();assert.equal(await cards().count(),40);
  await page.getByRole('button',{name:'Show more journal entries (2 remaining)',exact:true}).click();assert.equal(await cards().count(),42);
  assert.equal(await page.getByRole('button',{name:/Show more journal entries/}).count(),0);
  const source=page.getByTestId('meal-recorded-foods-2');await source.locator('summary').click();assert.match(await source.innerText(),/Original description: 2 slices pepperoni pizza/);
  await page.getByTestId('button-expand-meal-2').focus();await page.keyboard.press('Enter');await page.getByTestId('meal-items-2').waitFor();
  const explanation=page.getByTestId('card-meal-2').locator('details').filter({has:page.locator('summary',{hasText:'Nutrition & gut pathway explanation'})});
  await explanation.locator('summary').click();await explanation.getByRole('heading',{name:'Nutrition & gut pathways',exact:true}).waitFor();
  await page.getByText('Nutrition history & trends',{exact:true}).click();const month=page.getByTestId('card-monthly-averages'),year=page.getByTestId('card-yearly-overview');await month.waitFor();await year.waitFor();
  assert.match(await month.innerText(),/partial/);assert.match(await year.innerText(),/42/);
  // Browser evidence retains the source actions and original numeric/unknown labels.
  const semantics=await page.locator('main').evaluate(el=>Array.from(el.querySelectorAll('button,a,summary,h1,h2,h3')).map(node=>({tag:node.tagName,text:(node.getAttribute('aria-label')||node.textContent||'').trim(),href:node.getAttribute('href')})));
  for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:1000});await setAppTheme(page,theme);await noOverflow(`${mode}/${width}/${theme}`);
   for(const index of [0,2,41])for(const action of ['edit','delete']){const box=await page.getByTestId(`button-${action}-meal-${index}`).boundingBox();if(!baseline)assert.ok(box.width>=44&&box.height>=44,`${action} target ${mode}/${width}`);}
   await page.getByTestId('button-edit-meal-2').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
   assert.ok(await page.getByTestId('button-edit-meal-2').evaluate(el=>el===document.activeElement&&el.matches(':focus-visible')&&(getComputedStyle(el).outlineStyle!=='none'||getComputedStyle(el).boxShadow!=='none')),'Visible keyboard focus');
   await page.evaluate(()=>document.documentElement.style.fontSize='200%');await noOverflow(`${mode}/${width}/${theme}/200%`);await page.evaluate(()=>document.documentElement.style.fontSize='');
   evidence.push({mode,width,theme,zoom200:true,entries:42});
   if(width===320||width===390){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/journal-${mode}-${width}-${theme}.png`,animations:'disabled'});}
  }
  await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});
  if(!baseline)assert.ok(await page.getByTestId('card-meal-2').evaluate(el=>getComputedStyle(el).transitionProperty==='none'||getComputedStyle(el).transitionDuration.split(',').every(value=>parseFloat(value)<=0.00001)),'Reduced-motion journal rows do not visibly animate');
  await page.getByTestId('button-edit-meal-2').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.ok(await page.getByTestId('button-edit-meal-2').evaluate(el=>el===document.activeElement&&el.matches(':focus-visible')),'Keyboard action remains reachable with forced colors');
  await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'none'});
  await writeFile(`${out}/semantics-${mode}.json`,JSON.stringify(semantics,null,2));
  await page.goto('http://127.0.0.1:5278/log-meal');const description=page.getByLabel('What did you eat?',{exact:true});await description.waitFor();await description.fill('2 slices of pepperoni pizza');
  for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:1000});await setAppTheme(page,theme);await noOverflow(`composer/${mode}/${width}/${theme}`);
   await description.focus();await page.keyboard.press('Tab');await page.getByRole('button',{name:'Review meal',exact:true}).waitFor();assert.equal(await description.inputValue(),'2 slices of pepperoni pizza');
   await page.evaluate(()=>document.documentElement.style.fontSize='200%');await noOverflow(`composer/${mode}/${width}/${theme}/200%`);await page.evaluate(()=>document.documentElement.style.fontSize='');
   evidence.push({screen:'composer',mode,width,theme,zoom200:true});
   if(width===320||width===390){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${out}/composer-${mode}-${width}-${theme}.png`,animations:'disabled'});}
  }
 }
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);await writeFile(`${out}/evidence.json`,JSON.stringify({baseline:baseline||null,states:evidence,baselineOverflows,writes,errors},null,2));
 console.log(baseline?`PASS controlled baseline captured; ${baselineOverflows.length} pre-existing overflow states recorded.`:'PASS Food journal/composer: 42 original entries, 20→40→42 pagination, known zero/unknown distinction, source/nutrient/pathway details, monthly/yearly recorded averages, keyboard focus/44px edits, 32 mode/theme/viewport states plus 200% text; no writes.');
}finally{await browser.close();await vite.close();}
