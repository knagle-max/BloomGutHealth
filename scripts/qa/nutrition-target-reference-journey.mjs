import assert from 'node:assert/strict';import express from 'express';import {createRequire} from 'node:module';import {registerNutritionTargetRoutes} from '../../server/nutrition-targets.ts';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),{createServer}=await import('vite');
let profile={},failed=false,energy='kcal';const errors=[];
const app=express();app.use((req,_res,next)=>{req.session={userId:'synthetic-reference'};next();});registerNutritionTargetRoutes(app,(_req,_res,next)=>next(),{getUser:async()=>{if(failed)throw Error('PRIVATE_PROFILE_SENTINEL');return profile;}});const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const apiBase=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5193,strictPort:true}});await vite.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const p=new URL(route.request().url()).pathname;let json=[];
 if(p.startsWith('/api/nutrition/targets/')){const response=await fetch(apiBase+p);return route.fulfill({status:response.status,body:await response.text(),contentType:'application/json'});}
 if(p==='/api/auth/me')json={user:{id:'synthetic-reference',username:'Synthetic reference'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',displayUnits:{energy},onboarding:{status:'complete'}};
 else if(p.startsWith('/api/nutrition/daily'))json={meals:[],totals:{calories:1000,protein:0,carbs:null,fat:null},nutritionCoverage:{},isPartial:true};
 else if(p.startsWith('/api/nutrition/monthly/'))json={daysWithMeals:1,dailyAverages:{calories:1000,protein:0,carbs:null,fat:null,fiber:null,sugar:null},nutritionCoverage:{}};
 await route.fulfill({json});
});
const refreshTargets=()=>page.evaluate(async()=>{const {queryClient}=await import('/src/lib/queryClient.ts');await queryClient.invalidateQueries({predicate:q=>String(q.queryKey[0]).startsWith('/api/nutrition/targets')});});
try{
 await page.goto('http://127.0.0.1:5193/nutrition');const summary=page.getByTestId('card-daily-summary');await summary.getByText(/Example references only; not calculated from your profile/).waitFor();assert.ok((await summary.innerText()).includes('2000'));assert.equal(await summary.getByRole('link',{name:'Review profile inputs',exact:true}).getAttribute('href'),'/profile#measurement-units');
 await page.getByText('Nutrition history & trends',{exact:true}).click();const monthly=page.getByTestId('card-monthly-averages');await monthly.getByText('Example reference: 2000 kcal',{exact:true}).waitFor();
 profile={age:30,sex:'female',heightCm:165,weightKg:65,activityLevel:'moderate'};await refreshTargets();await summary.getByText(/Adult energy and macro estimates use available profile fields/).waitFor();assert.ok((await summary.innerText()).includes('2124'));await monthly.getByText('Current estimate: 2124 kcal',{exact:true}).waitFor();assert.equal(await summary.getByRole('progressbar').count(),2);
 energy='kJ';await page.reload();await summary.getByText(/Adult energy and macro estimates/).waitFor();assert.ok((await summary.innerText()).includes('4184'));assert.ok((await summary.innerText()).includes('8887'));
 failed=true;await refreshTargets();await summary.getByText('Planning targets could not load. Recorded totals are shown without target comparisons.',{exact:true}).waitFor();assert.equal(await summary.getByRole('progressbar').count(),0);assert.ok(!(await summary.innerText()).includes('8887'));assert.ok(!(await summary.innerText()).includes('PRIVATE_PROFILE_SENTINEL'));
 failed=false;profile={};await summary.getByRole('button',{name:'Retry summary',exact:true}).click();await summary.getByText(/Example references only; not calculated from your profile/).waitFor();
 for(const width of [320,1280]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 assert.deepEqual(errors,[]);console.log('PASS actual target handlers: explicit examples, complete adult-profile estimate, unchanged canonical formula/kJ conversion, current history label, no stale or fabricated fallback on outage, retry and responsive layout. Synthetic profiles only.');
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));}
