import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createServer} from 'vite';
import path from 'node:path';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const baseline=process.env.BLOOM_MOVEMENT_BASELINE;
const file=path.resolve('client/src/components/TodayStatus.tsx');
const vite=await createServer({plugins:baseline?[{name:'movement-baseline',enforce:'pre',load(id){if(id.split('?')[0]===file)return execFileSync('git',['show',baseline+':client/src/components/TodayStatus.tsx'],{encoding:'utf8'});}}]:[],server:{host:'127.0.0.1',port:5218,strictPort:true}});
await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:900},timezoneId:'America/Regina',reducedMotion:'reduce'});
await page.clock.install({time:new Date('2026-10-26T18:00:00Z')});page.setDefaultTimeout(12000);
let actor='a',hold=false,release,fail=false,rows=[];const writes=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),u=new URL(req.url());let json=[];
 if(req.method()!=='GET')writes.push(u.pathname);
 if(u.pathname==='/api/auth/me')json={user:{id:actor,username:'Movement fixture '+actor}};
 else if(u.pathname==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
 else if(u.pathname==='/api/preferences')json=defaultPreferences;
 else if(u.pathname==='/api/precision')json={...buildPrecisionReport([],contextSchema.parse({}),defaultPreferences,null),availableReports:[],intake:{days:28,mealsLogged:0,nutrients:[]},journalSymptoms:[]};
 else if(u.pathname==='/api/profile')json={weightKg:null,heightCm:null};
 else if(u.pathname==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
 else if(u.pathname==='/api/capabilities')json={eligible:false,experimentalEnabled:false};
 else if(u.pathname==='/api/experience/records'&&u.searchParams.get('kind')==='session'){
  if(hold)await new Promise(r=>{release=r;});
  if(fail)return route.fulfill({status:503,json:{error:'Synthetic source unavailable'}});
  json=actor==='a'?rows:[];
 }
 await route.fulfill({json});
});
const session=(id,status,startsAt='2026-10-26T17:00:00Z')=>({id,kind:'session',payload:{title:'Source '+id,startsAt,status,minutes:30,intensity:'easy',discipline:'mixed'}});
const capture=async(selectors)=>{
 const output=process.env.BLOOM_MOVEMENT_EVIDENCE;if(!output)return;
 await mkdir(output,{recursive:true});const phase=baseline?'before':'after';
 await page.screenshot({path:output+'/'+phase+'.png'});
 await page.evaluate(selectors=>selectors.forEach((selector,index)=>{const el=document.querySelector(selector);if(!el)return;el.style.outline='3px solid #b35026';const badge=document.createElement('span');badge.textContent=String(index+1);badge.style.cssText='background:#b35026;color:white;padding:3px 8px;border-radius:50%;margin-right:6px';el.prepend(badge);}),selectors);
 await page.screenshot({path:output+'/'+phase+'-annotated.png'});
 await page.evaluate(selectors=>selectors.forEach(selector=>{const el=document.querySelector(selector);if(el){el.style.outline='';el.firstElementChild?.tagName==='SPAN'&&el.firstElementChild.remove();}}),selectors);
};
const move=()=>page.locator('.today-status-item').filter({hasText:'Move'});
const refresh=()=>page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');void queryClient.invalidateQueries({queryKey:['/api/experience/records','a','session']});});
try{
 rows=[session('done','completed'),session('later','planned','2026-10-27T02:00:00Z'),session('cancel','cancelled'),session('yesterday','completed','2026-10-26T05:00:00Z')];
 await page.goto('http://127.0.0.1:5218/');await move().getByText('1 completed',{exact:true}).waitFor();
 await move().focus();await page.keyboard.press('Enter');
 if(baseline){await page.getByRole('button',{name:'Switch to athlete mode',exact:true}).waitFor();await capture(['h1','main button']);console.log('REPRODUCED: Everyday Move opens Athlete mode switch instead of its dated source.');}
 else {
  assert.equal(new URL(page.url()).pathname,'/');
  const source=page.getByRole('group',{name:"Today’s movement records",exact:true});
  await source.getByText('Source done',{exact:true}).waitFor();
  for(const name of ['later','cancel'])assert.equal(await source.getByText('Source '+name,{exact:true}).isVisible(),true);
  assert.equal(await source.getByText('Source yesterday',{exact:true}).count(),0);
  assert.equal(await page.getByRole('button',{name:'Switch to athlete mode',exact:true}).count(),0);
  await source.scrollIntoViewIfNeeded();await capture(['#today-movement-source summary','#today-movement-source ul']);
  hold=true;await refresh();await move().getByText('Checking…',{exact:true}).waitFor();assert.equal(await source.getByText('Source done',{exact:true}).count(),0);
  fail=true;hold=false;release();await move().getByText('Unavailable',{exact:true}).waitFor();assert.equal(await source.getByText('Source done',{exact:true}).count(),0);
  fail=false;await source.getByRole('button',{name:'Retry movement records',exact:true}).click();await source.getByText('Source done',{exact:true}).waitFor();
  rows=[session('cancel','cancelled')];await refresh();await move().getByText('1 cancelled',{exact:true}).waitFor();
  rows=[];await refresh();await move().getByText('Not recorded',{exact:true}).waitFor();await source.getByText('No session recorded for this date.',{exact:true}).waitFor();
  for(const width of [320,390,1280]){await page.setViewportSize({width,height:700});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.ok((await move().boundingBox()).height>=44);}
  actor='b';await page.reload();await move().getByText('Not recorded',{exact:true}).waitFor();await move().click();assert.equal(await page.getByText('Source done',{exact:true}).count(),0);
  assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
  console.log('PASS: Everyday Move opens canonical dated source without mode change; planned/completed/cancelled, timezone, unknown, pending/error/retry, keyboard/mobile and separate-account read-only cases. Synthetic HTTP storage; no native or study acceptance.');
 }
}catch(error){console.error({errors,body:await page.locator('body').innerText()});throw error;}finally{release?.();await browser.close();await vite.close();}
