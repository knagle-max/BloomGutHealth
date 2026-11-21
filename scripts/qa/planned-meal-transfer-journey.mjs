import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {experienceSettingsSchema} from '../../shared/experience.ts';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {preferenceSchema} from '../../shared/meal-intelligence.ts';
import {weeklyRequestSchema} from '../../shared/weekly-planner.ts';
import {practicalChoices} from '../../shared/practical-planner.ts';
import {analyzeMeal,nutritionTotals} from '../../server/meal-intelligence.ts';
import {buildAthleteDay} from '../../shared/athlete.ts';
import {athleteProfileSourceKey} from '../../shared/athlete-review.ts';
const preferences=preferenceSchema.parse({cookingMinutes:60}),health=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true});
const settings=experienceSettingsSchema.parse({onboarding:{status:'complete'},practical:{minutes:60},athlete:{sport:'Synthetic transfer fixture',weightKg:70,adult:true,pregnancyNo:true,healthReviewed:true,targetsConfirmed:true,energyKcal:2500}});
const meals=[];for(const mealText of ['100 g oats,100 g banana','150 g cooked chicken breast,150 g cooked potato,100 g broccoli']){const analysis=await analyzeMeal(mealText,false);meals.push({mealText,intelligence:analysis.intelligence,nutritionalData:analysis.nutritionalData,...nutritionTotals(analysis.nutritionalData)});}
const report=buildPrecisionReport([],health,preferences,null),request=weeklyRequestSchema.parse({days:1,targets:{calories:1300,protein:100,fiber:30,fiberMaximum:45,sodium:2300,saturatedFat:20}});
const choices=practicalChoices(meals,preferences,report,request,settings.practical);assert.ok(choices.choices.length);assert.ok(choices.choices[0].recipe.ingredients.some(i=>!Number.isInteger(i.grams*choices.choices[0].portion)),'Actual sourced fixture includes fractional prepared grams');
const athlete={...buildAthleteDay(settings.athlete,[],meals,[]),hydration:[],profileSourceKey:athleteProfileSourceKey(settings.athlete),mealChoices:choices};
let mode='everyday';const errors=[],writes=[];
const vite=await createServer({server:{host:'127.0.0.1',port:5293,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(15000);page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(req.method()!=='GET'&&!['/api/experience/day-choices','/api/experience/athlete-day','/api/precision/today-plan'].includes(path))writes.push(path);const json=path==='/api/auth/me'?{user:{id:'synthetic-portion-source',username:'Synthetic transfer'}}:path==='/api/experience/settings'?{...settings,mode}:path==='/api/experience/day-choices'?{...choices,day:{slots:['dinner']}}:path==='/api/experience/athlete-day'?athlete:path==='/api/profile'?{}:path==='/api/preferences'?preferences:[];return route.fulfill({json});});
try{
 for(const [path,name] of [['/plan-day','Review & log this choice'],['/athlete/fueling','Review & log this training meal']]){mode=path.startsWith('/athlete')?'athlete':'everyday';await page.goto('http://127.0.0.1:5293'+path);const links=page.getByRole('link',{name,exact:true});await links.first().waitFor();assert.equal(await links.count(),choices.choices.length);
  for(let index=0;index<choices.choices.length;index++){const link=links.nth(index),url=new URL(await link.getAttribute('href'),'http://local'),choice=choices.choices[index];const expected=choice.recipe.ingredients.map(i=>`${i.grams*choice.portion} g ${i.name.replaceAll(',',' ')}`).join(', ');assert.equal(url.pathname,'/log-meal');assert.equal(url.searchParams.get('type'),'dinner');assert.equal(url.searchParams.get('description'),expected,'All prepared masses survive '+path);}
  const href=await links.first().getAttribute('href');await links.first().click();await page.getByLabel('What did you eat?',{exact:true}).waitFor();assert.equal(await page.getByLabel('What did you eat?',{exact:true}).inputValue(),new URL(href,'http://local').searchParams.get('description'));
 }
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);console.log('PASS actual App practical/Athlete: canonical source recipes, fractional112.5g portions, every review link and composer input retain exact prepared amounts; planning does not log consumption. Synthetic fixture, no provider or private-account access.');
}finally{await browser.close();await vite.close();}
