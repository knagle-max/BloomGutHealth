import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from 'vite';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const phase=process.argv[2];assert.ok(['before','after'].includes(phase));
const root='docs/review/today-companion-20261025',out=root+'/'+phase;await mkdir(out,{recursive:true});
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const baseline='aa22265c415f3ee702b06f93f70314bacd29856c';
const sources=phase==='before'?new Map(['client/src/components/TodayFocus.tsx','client/src/pages/Dashboard.tsx','client/src/brand.css','shared/today-focus.ts'].map(file=>[path.resolve(file),execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'})])):new Map();
const vite=await createServer({plugins:phase==='before'?[{name:'matched-before-today-source',enforce:'pre',load(id){return sources.get(id.split('?')[0]);}}]:[],server:{host:'127.0.0.1',port:5204,strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:375,height:900},timezoneId:'America/Regina',reducedMotion:'reduce'});page.setDefaultTimeout(12000);
await page.clock.install({time:new Date('2026-10-25T18:00:00Z')});
let state='empty',releasePending,holdPrecision=false,failPrecision=false,releasePrecision,holdSessions=false,failSessions=false,releaseSessions,observedSleep=8;const errors=[],checks=[];page.on('pageerror',error=>errors.push(error.message));
await page.route('https://fonts.**/**',route=>route.abort());
const report=()=>({...buildPrecisionReport([],contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true,goals:['Build muscle']}),defaultPreferences,null),records:[],availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[],note:'Synthetic fixture'}});
const meal=()=>({id:'synthetic-companion-meal',mealText:'Synthetic lunch',mealType:'Lunch',loggedAt:'2026-10-25T17:00:00Z',totalCalories:state==='partial'?null:400,totalProtein:20,nutritionalData:state==='partial'?{}:{calories:400,protein:20,carbs:40,fat:12,fiber:4}});
await page.route('**/api/**',async route=>{const url=new URL(route.request().url()),path=url.pathname;let json=[];
 if(path==='/api/auth/me')json={user:{id:'synthetic-companion',username:'Today review'}};
 else if(path==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(path==='/api/preferences')json=defaultPreferences;
 else if(path==='/api/precision'){if(holdPrecision)await new Promise(resolve=>{releasePrecision=resolve;});if(failPrecision)return route.fulfill({status:503,json:{error:'Synthetic focus unavailable'}});json=report();}
 else if(path==='/api/biology/registry')json={entities:[],relationships:[],summary:'Synthetic',version:'synthetic'};
 else if(path==='/api/experience/records'){
  const kind=url.searchParams.get('kind');if(kind==='session'){if(holdSessions)await new Promise(resolve=>{releaseSessions=resolve;});if(failSessions)return route.fulfill({status:503,json:{error:'Synthetic calendar unavailable'}});}
  if(state==='error')return route.fulfill({status:503,json:{error:'Synthetic context unavailable'}});
  if(kind==='session')json=state==='recorded'?[{id:'synthetic-session',kind:'session',payload:{title:'Evening ride',startsAt:'2026-10-25T21:00:00Z',status:'planned',minutes:45,intensity:'easy',discipline:'endurance'}}]:[];
  else if(kind==='checkin')json=state==='no-session'?[{id:'synthetic-checkin',kind:'checkin',payload:{date:'2026-10-25',sleepHours:observedSleep,energy:6,mode:'everyday'}}]:[];
 }
 else if(path.startsWith('/api/meals')){
  if(state==='error')return route.fulfill({status:503,json:{error:'Synthetic journal unavailable'}});
  if(state==='delayed')await new Promise(resolve=>{releasePending=resolve;});
  json=['partial','recorded','no-session'].includes(state)?[meal()]:[];
 }
 await route.fulfill({json}).catch(()=>{});
});
try{
 for(const width of [320,375,390,1280])for(const scenario of ['empty','partial','recorded','no-session','delayed','error']){
  releasePending?.();state=scenario;await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:5204/');await page.locator('.today-focus').waitFor();
  await page.locator('.today-focus .hero-button').waitFor();
  if(state==='partial')await page.locator('.today-focus').getByRole('link',{name:'Review my meal estimates',exact:true}).waitFor();
  if(state==='recorded')await page.locator('.today-focus').getByRole('link',{name:phase==='before'?'Review my session fueling plan':'Review session fuel',exact:true}).waitFor();
  if(state==='error')await page.getByRole('button',{name:'Try again',exact:true}).waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const cta=await page.locator('.today-focus .hero-button').boundingBox();assert.ok(cta&&cta.height>=44&&cta.y+cta.height<830);
  if(phase==='after'){assert.equal(await page.locator('.today-status-strip').count(),1);assert.equal(await page.locator('main a.hero-button:visible').count(),1);if(state==='recorded')assert.equal(await page.locator('.meal-list .meal-row').count(),1);}
  await page.screenshot({path:`${out}/${state}-${width}.png`});
  if(width===375){await page.evaluate(()=>document.documentElement.classList.add('dark'));await page.clock.runFor(350);await page.screenshot({path:`${out}/${state}-dark-375.png`});await page.evaluate(()=>document.documentElement.classList.remove('dark'));await page.clock.runFor(350);}
  if(phase==='after'&&width===375&&state==='empty'){
   await page.evaluate(()=>{['.today-focus-heading','.today-status-strip','.today-focus-evidence'].forEach((selector,index)=>{const node=document.querySelector(selector),box=node.getBoundingClientRect();node.style.outline='2px solid #9b6b26';const badge=document.createElement('span');badge.dataset.reviewMarker='true';badge.textContent=String(index+1);Object.assign(badge.style,{position:'absolute',left:(box.left-7+scrollX)+'px',top:(box.top-9+scrollY)+'px',background:'#9b6b26',color:'white',borderRadius:'50%',width:'20px',height:'20px',font:'bold 12px sans-serif',display:'grid',placeItems:'center',zIndex:100,pointerEvents:'none'});document.body.append(badge);});});
   await page.screenshot({path:`${out}/empty-375-annotated.png`});await page.evaluate(()=>{document.querySelectorAll('[data-review-marker]').forEach(node=>node.remove());document.querySelectorAll('.today-focus-heading,.today-status-strip,.today-focus-evidence').forEach(node=>node.style.outline='');});
  }
  checks.push({width,state,primaryInViewport:true});releasePending?.();releasePending=undefined;
 }
 if(phase==='after'){
  for(const scenario of ['empty','partial','recorded','no-session','error']){state=scenario;await page.setViewportSize({width:320,height:500});await page.goto('http://127.0.0.1:5204/');await page.locator('.today-focus .hero-button').waitFor();if(state==='recorded')await page.locator('.today-focus').getByRole('link',{name:'Review session fuel',exact:true}).waitFor();const cta=await page.locator('.today-focus .hero-button').boundingBox(),nav=await page.locator('.bloom-bottom-nav').boundingBox();assert.ok(cta.y+cta.height<=nav.y,'Action must clear fixed navigation at zoom-equivalent320×500');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks.push({state,zoomEquivalent320x500:true,primaryClearOfNavigation:true});}
  const refresh=key=>page.evaluate(async(key)=>{const {queryClient}=await import('/src/lib/queryClient.ts');void queryClient.invalidateQueries({queryKey:key});},key);
  state='recorded';await page.setViewportSize({width:375,height:900});await page.goto('http://127.0.0.1:5204/');const focus=page.locator('.today-focus');await focus.getByRole('link',{name:'Review session fuel',exact:true}).waitFor();
  holdSessions=true;await refresh(['/api/experience/records','synthetic-companion','session']);await page.locator('.today-status-item').filter({hasText:'Move'}).getByText('Checking…',{exact:true}).waitFor();assert.equal(await focus.getByRole('link',{name:'Review session fuel',exact:true}).count(),0);
  failSessions=true;holdSessions=false;releaseSessions();await page.locator('.today-status-item').filter({hasText:'Move'}).getByText('Unavailable',{exact:true}).waitFor();assert.equal(await focus.getByRole('link',{name:'Review session fuel',exact:true}).count(),0);
  failSessions=false;await refresh(['/api/experience/records','synthetic-companion','session']);await focus.getByRole('link',{name:'Review session fuel',exact:true}).waitFor();
  state='no-session';await page.goto('http://127.0.0.1:5204/');const mapping=report().goals.find(goal=>goal.id!=='unmapped').mapping;await focus.getByText(new RegExp(mapping)).first().waitFor();
  holdPrecision=true;await refresh(['/api/precision']);await page.waitForFunction(mapping=>!document.querySelector('.today-focus').textContent.includes(mapping),mapping);
  failPrecision=true;holdPrecision=false;releasePrecision();await focus.getByText(/Your saved focus could not load/).waitFor();assert.ok(!(await focus.textContent()).includes(mapping));
  failPrecision=false;await refresh(['/api/precision']);await focus.getByText(new RegExp(mapping)).first().waitFor();
  observedSleep=0;await refresh(['/api/experience/records','synthetic-companion','checkin']);await page.locator('.today-status-item').filter({hasText:'Recover'}).getByText('0 h sleep',{exact:true}).waitFor();
  await focus.getByRole('link',{name:'Adjust',exact:true}).click();const goalInput=page.getByRole('textbox',{name:'Goals (comma separated)',exact:true});await goalInput.waitFor();assert.equal(await goalInput.evaluate(node=>document.activeElement===node),true);
  state='empty';await page.goto('http://127.0.0.1:5204/');const addFood=focus.getByRole('link',{name:'Add food',exact:true});await addFood.focus();await page.keyboard.press('Enter');await page.getByRole('heading',{name:'Add Food',exact:true}).waitFor();
  checks.push({cachedSessionRetractedDuringRefreshAndFailure:true,cachedGoalRetractedDuringRefreshAndFailure:true,explicitRetryRestores:true,recordedZeroSleepPreserved:true,canonicalGoalAdjustment:true,canonicalAddFood:true});
 }
 assert.deepEqual(errors,[]);await writeFile(`${out}/results.json`,JSON.stringify({synthetic:true,phase,baseline,checks,errors,nativeSafari:false,voiceOver:false,plannedRestContract:false},null,2));console.log(`PASS: actual ${phase} Today renders,6 source states ×4 widths, dark375, primary action/touch width/no overflow`);
}finally{releasePending?.();releasePrecision?.();releaseSessions?.();await browser.close();await vite.close();}
