import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import express from 'express';
import {createServer} from 'vite';
import {registerExperienceRoutes} from '../../server/experience-routes.ts';
import {experienceSettingsSchema,trainingSessionSchema} from '../../shared/experience.ts';
import {buildPrecisionReport,contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const id='synthetic-athlete',settings=experienceSettingsSchema.parse({mode:'athlete',onboarding:{status:'complete'},athlete:{weightKg:70,adult:true,pregnancyNo:true,healthReviewed:true,targetsConfirmed:true,energyKcal:2500}}),health=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true});
const session={id:'synthetic-session',kind:'session',payload:trainingSessionSchema.parse({title:'Synthetic reviewed session',startsAt:'2026-10-25T21:00:00Z',minutes:90,intensity:'hard',discipline:'endurance'})};
let hold=false,fail=false,release,age=30,reads=0;const errors=[],writes=[];
const owned=actor=>assert.equal(actor,id);
const store={getExperienceSettings:async actor=>{owned(actor);return settings;},getExperienceRecords:async actor=>{owned(actor);return [session];},getPrecisionContext:async actor=>{owned(actor);return health;},getUser:async actor=>{owned(actor);return {id,age,dietaryPreferences:defaultPreferences};},getMeals:async actor=>{owned(actor);reads++;if(hold)await new Promise(resolve=>{release=resolve;});if(fail)throw Error('PRIVATE_DRIVER_SENTINEL');return [];}};
const backend=express();backend.use(express.json());backend.use((req,_res,next)=>{req.session={userId:id};next();});
registerExperienceRoutes(backend,(_req,_res,next)=>next(),store,{reportFor:async()=>buildPrecisionReport([],health,defaultPreferences,null)});
const server=backend.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const base=`http://127.0.0.1:${server.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5205,strictPort:true}});await vite.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:375,height:900},timezoneId:'America/Regina'});page.setDefaultTimeout(12000);await page.clock.install({time:new Date('2026-10-25T18:00:00Z')});page.on('pageerror',error=>errors.push(error.message));
await page.route('https://fonts.**/**',route=>route.abort());await page.route('**/api/**',async route=>{const req=route.request(),url=new URL(req.url());let json=[];
 if(url.pathname.startsWith('/api/experience/')){if(req.method()!=='GET'&&url.pathname!=='/api/experience/athlete-day')writes.push(url.pathname);const response=await fetch(base+url.pathname+url.search,{method:req.method(),headers:{'content-type':'application/json'},...(req.postData()?{body:req.postData()}: {})});return route.fulfill({status:response.status,contentType:'application/json',body:await response.text()});}
 if(req.method()!=='GET')writes.push(url.pathname);
 if(url.pathname==='/api/auth/me')json={user:{id,username:'Synthetic athlete'}};else if(url.pathname==='/api/profile')json={weightKg:70};
 await route.fulfill({json});});
const refresh=()=>page.evaluate(async()=>{const {queryClient}=await import('/src/lib/queryClient.ts');void queryClient.invalidateQueries({predicate:q=>q.queryKey[0]==='/api/experience/athlete-day'});});
try{
 await page.goto('http://127.0.0.1:5205/athlete');await page.getByText('Reference targets & recorded effort',{exact:true}).click();await page.locator('.athlete-metrics').waitFor();assert.match(await page.locator('.athlete-metrics').innerText(),/2500/);
 await page.getByText('Athlete setup & reviewed targets',{exact:true}).click();const draft=page.locator('textarea[name="teamPlanNotes"]');await draft.fill('PRIVATE_UNSAVED_PROFILE');
 await page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');for(const query of queryClient.getQueryCache().findAll({predicate:q=>q.queryKey[0]==='/api/experience/athlete-day'}))query.setState({fetchStatus:'paused'});});await page.clock.runFor(50);assert.equal(await page.locator('.athlete-metrics').count(),0,'Paused revalidation is not current context');
 await page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');for(const query of queryClient.getQueryCache().findAll({predicate:q=>q.queryKey[0]==='/api/experience/athlete-day'}))query.setState({fetchStatus:'idle'});});await page.locator('.athlete-metrics').waitFor();
 hold=true;await refresh();await page.clock.runFor(50);assert.equal(await page.locator('.athlete-metrics').count(),0,'Pending context must retract cached numerical targets');
 fail=true;hold=false;release();await page.getByRole('button',{name:'Retry athlete day',exact:true}).waitFor();assert.equal(await page.locator('.athlete-metrics').count(),0);assert.equal(await draft.inputValue(),'PRIVATE_UNSAVED_PROFILE');assert.ok(!(await page.getByRole('main').innerText()).includes('PRIVATE_DRIVER_SENTINEL'));
 age=17;fail=false;await page.getByRole('button',{name:'Retry athlete day',exact:true}).click();await page.locator('.athlete-metrics').waitFor();assert.doesNotMatch(await page.locator('.athlete-metrics').innerText(),/2500/);assert.match(await page.locator('.athlete-metrics').innerText(),/Not set/);assert.equal(await draft.inputValue(),'PRIVATE_UNSAVED_PROFILE');
 age=30;await refresh();await page.waitForFunction(()=>document.querySelector('.athlete-metrics')?.textContent.includes('2500'));
 await page.getByRole('link',{name:'Fueling',exact:true}).click();await page.getByRole('heading',{name:'Daily fuel alongside training',exact:true}).waitFor();
 const sourceForm=page.locator('form').filter({has:page.locator('input[name="preKg"]')});await sourceForm.evaluate(form=>{const details=form.closest('details');if(details)details.open=true;});await sourceForm.locator('input[name="preKg"]').fill('71');
 hold=true;await refresh();await page.waitForFunction(()=>!document.querySelector('main').textContent.includes('Daily fuel alongside training'));assert.equal(await page.getByRole('heading',{name:'Training-day meal options',exact:true}).count(),0);
 fail=true;hold=false;release();await page.getByRole('button',{name:'Retry athlete day',exact:true}).waitFor();assert.equal(await sourceForm.locator('input[name="preKg"]').inputValue(),'71');
 fail=false;await page.getByRole('button',{name:'Retry athlete day',exact:true}).click();await page.getByRole('heading',{name:'Daily fuel alongside training',exact:true}).waitFor();assert.equal(await sourceForm.locator('input[name="preKg"]').inputValue(),'71');assert.ok(reads>=6);assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);console.log('PASS: actual athlete-day handlers, cached-target retraction, current minor gate, retry and unsaved profile/hydration preservation');
}finally{release?.();await browser.close();await vite.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
