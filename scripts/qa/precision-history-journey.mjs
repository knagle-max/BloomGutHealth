import assert from 'node:assert/strict';import express from 'express';import {createRequire} from 'node:module';import {registerPrecisionRoutes} from '../../server/precision-routes.ts';import {contextSchema} from '../../shared/precision-nutrition.ts';import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),{createServer}=await import('vite');const errors=[],writes=[];
const legacy={id:'synthetic-old',kind:'plan',createdAt:'2026-10-01',payload:{name:'Synthetic affected recommendation',version:'precision-r6',goals:['heart'],recommendations:[{name:'FORBIDDEN_GENOTYPE_SELECTION',reasons:['MTHFR provides secondary folate-pathway context, not a measured deficiency.']}]}};
const safe={id:'synthetic-safe',kind:'plan',createdAt:'2026-10-01',payload:{name:'Synthetic safe recommendation',version:'precision-r6',recommendations:[{id:'safe',name:'Recorded whole foods',reasons:['Matches saved goals.']}]}};const originals=structuredClone([legacy,safe]);
const source=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true});
const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:'synthetic-minor'};next();});registerPrecisionRoutes(app,(_req,_res,next)=>next(),{getPrecisionContext:async()=>source,getPrecisionRecords:async()=>[legacy,safe],getUser:async()=>({age:17,dietaryPreferences:defaultPreferences}),getUserSamples:async()=>[],getMeals:async()=>[],getMetabolites:async()=>[],insertPrecisionRecord:async()=>{writes.push('unexpected');throw Error('No new adult plan should be saved');}});
const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const apiBase=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5194,strictPort:true}});await vite.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];
 if(p.startsWith('/api/precision')){const response=await fetch(apiBase+p+url.search,{method:req.method(),headers:{'content-type':'application/json'},...(req.postData()?{body:req.postData()}: {})});return route.fulfill({status:response.status,body:await response.text(),contentType:'application/json'});}
 if(p==='/api/auth/me')json={user:{id:'synthetic-minor',username:'Synthetic source conflict'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',displayUnits:{energy:'kcal'},onboarding:{status:'complete'}};
 else if(p==='/api/preferences')json=defaultPreferences;
 else if(p==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
 else if(p==='/api/meal-planner/progress')json={weeks:[],adherence:[]};
 else if(p==='/api/meal-planner')json={note:'Synthetic fixture',recentMeals:0,suggestions:[],pathways:[],sources:[],cohorts:[]};
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5194/precision?tab=progress');await page.getByRole('heading',{name:'Saved plans & observations',exact:true}).waitFor();
 await page.getByText('Synthetic affected recommendation ·',{exact:false}).click();
 await page.getByText('Historical genotype-influenced food recommendations are withheld.',{exact:false}).waitFor();assert.equal(await page.getByText('FORBIDDEN_GENOTYPE_SELECTION',{exact:true}).count(),0);
 await page.getByText('Synthetic safe recommendation ·',{exact:false}).click();await page.getByText('Recorded whole foods',{exact:true}).waitFor();await page.getByText('Recorded recommendations describe the plan at save time.',{exact:false}).waitFor();
 for(const width of [320,390,1280]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await page.emulateMedia({colorScheme:'dark'});await page.evaluate(()=>document.documentElement.classList.add('dark'));assert.deepEqual([legacy,safe],originals);assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 console.log('PASS actual precision history handler/UI: exact legacy genotype suggestions withheld, safe source history visibly qualified, original records untouched, mobile/dark passed.');
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));}
