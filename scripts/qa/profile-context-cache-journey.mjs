import assert from 'node:assert/strict';import express from 'express';import {createRequire} from 'node:module';import {registerPrecisionRoutes} from '../../server/precision-routes.ts';import {contextSchema} from '../../shared/precision-nutrition.ts';import {defaultPreferences} from '../../shared/meal-intelligence.ts';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),{createServer}=await import('vite');const errors=[],writes=[];
let age=30;let precisionReads=0;
const source=contextSchema.parse({ageGroup:'adult',pregnancy:'no',safetyReviewed:true});
const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:'synthetic-minor'};next();});registerPrecisionRoutes(app,(_req,_res,next)=>next(),{getPrecisionContext:async()=>source,getPrecisionRecords:async()=>[],getUser:async()=>({age,dietaryPreferences:defaultPreferences}),getUserSamples:async()=>[],getMeals:async()=>[],getMetabolites:async()=>[],insertPrecisionRecord:async()=>{writes.push('unexpected');throw Error('No new adult plan should be saved');}});
const api=app.listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));const apiBase=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5193,strictPort:true}});await vite.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),url=new URL(req.url()),p=url.pathname;let json=[];
 if(p.startsWith('/api/precision')){if(p==='/api/precision')precisionReads++;const response=await fetch(apiBase+p+url.search,{method:req.method(),headers:{'content-type':'application/json'},...(req.postData()?{body:req.postData()}: {})});return route.fulfill({status:response.status,body:await response.text(),contentType:'application/json'});}
 if(p==='/api/profile')json={age,sex:'female',heightCm:170,weightKg:65,activityLevel:'moderate'};
 else if(p==='/api/user/synthetic-minor/profile'){age=req.postDataJSON().age;writes.push(age);json={success:true};}
 else if(p==='/api/auth/me')json={user:{id:'synthetic-minor',username:'Synthetic source conflict'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',displayUnits:{energy:'kcal'},onboarding:{status:'complete'}};
 else if(p==='/api/preferences')json=defaultPreferences;
 else if(p==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
 else if(p==='/api/meal-planner/progress')json={weeks:[],adherence:[]};
 else if(p==='/api/meal-planner')json={note:'Synthetic fixture',recentMeals:0,suggestions:[],pathways:[],sources:[],cohorts:[]};
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5193/profile');await page.getByLabel('Age',{exact:true}).waitFor();
 const cached=await page.evaluate(async()=>{const {queryClient}=await import('/src/lib/queryClient.ts');return await queryClient.fetchQuery({queryKey:['/api/precision']});});
 assert.equal(cached.context.ageGroup,'adult');assert.equal(precisionReads,1);
 await page.evaluate(async()=>{const {queryClient}=await import('/src/lib/queryClient.ts');for(const key of [['/api/precision','sample-a'],['/api/precision/today-plan','2026-10-25',12],['/api/precision/weekly-plans'],['/api/nutrition/history/month','2026-10'],['/api/biology/foods','synthetic-minor','spinach'],['/api/biology/catalogue',42],['/api/precision-unrelated']])queryClient.setQueryData(key,{synthetic:true});});
 await page.getByLabel('Age',{exact:true}).fill('17');await page.getByRole('button',{name:'Save nutrition profile',exact:true}).click();
 await page.waitForResponse(r=>r.url().endsWith('/api/profile')&&r.request().method()==='GET');assert.equal(age,17);
 const current=await page.evaluate(async()=>{const {queryClient}=await import('/src/lib/queryClient.ts');return await queryClient.fetchQuery({queryKey:['/api/precision']});});
 const states=await page.evaluate(async()=>{const {queryClient}=await import('/src/lib/queryClient.ts');return queryClient.getQueryCache().getAll().filter(q=>q.state.data?.synthetic===true).map(q=>({key:q.queryKey[0],invalidated:q.state.isInvalidated}));});
 for(const state of states)assert.equal(state.invalidated,!['/api/biology/catalogue','/api/precision-unrelated'].includes(state.key),JSON.stringify(state));assert.equal(states.length,7);
 assert.equal(current.context.ageGroup,'under18');assert.equal(precisionReads,2);assert.deepEqual(writes,[17]);assert.equal(source.ageGroup,'adult');assert.deepEqual(errors,[]);
 console.log('PASS actual profile save invalidates previously cached adult precision context; next read uses actual minor guard without modifying recorded source context.');
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(r=>api.close(r));}
