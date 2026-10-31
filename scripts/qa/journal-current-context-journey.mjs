import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),{createServer}=await import('vite');
const vite=await createServer({server:{host:'127.0.0.1',port:5221,strictPort:true}});await vite.listen();const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(6000);await page.clock.install({time:new Date('2026-10-25T12:00:00Z')});let failure='none';const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
const meal={id:'synthetic-meal',mealText:'Synthetic recorded lunch',mealType:'lunch',loggedAt:'2026-10-25T11:00:00Z',totalCalories:100,totalProtein:0,totalCarbs:null,totalFat:null,nutritionalData:[]};
await page.route('**/api/**',async route=>{const p=new URL(route.request().url()).pathname;let json=[];
 if(p===`/api/nutrition/${failure}/synthetic-failure`||failure==='meals'&&p==='/api/meals/synthetic-failure')return route.fulfill({status:503,json:{error:'PRIVATE_UPSTREAM_SENTINEL'}});
 if(p==='/api/auth/me')json={user:{id:'synthetic-failure',username:'Synthetic failure'}};
 else if(p==='/api/experience/settings')json={mode:'everyday',displayUnits:{energy:'kcal'},onboarding:{status:'complete'}};
 else if(p.startsWith('/api/nutrition/targets'))json={calories:2000,protein:100,carbs:200,fat:70,fiber:30,sugar:50,sodium:2300,potassium:3500};
 else if(p.startsWith('/api/nutrition/daily'))json={meals:[meal],totals:{calories:100,protein:0,carbs:null,fat:null,fiber:null,sugar:null,sodium:null,potassium:null},nutritionCoverage:{},isPartial:true};
 else if(p==='/api/meals/synthetic-failure')json=[meal,{...meal,id:'synthetic-older',mealText:'Synthetic older history',loggedAt:'2026-10-01T11:00:00Z'}];
 else if(p==='/api/analysis/status')json={ai:{configured:false}};
 await route.fulfill({json});
});

const state=async(root,fetchStatus)=>page.evaluate(async({root,fetchStatus})=>{const{queryClient}=await import('/src/lib/queryClient.ts');for(const q of queryClient.getQueryCache().getAll())if(q.queryKey[0]===root)q.setState({fetchStatus});},{root,fetchStatus});
try{
 await page.goto('http://127.0.0.1:5221/nutrition');const summary=page.getByTestId('card-daily-summary');await summary.getByRole('progressbar').first().waitFor();
 await page.getByTestId('button-show-log-meal').click();await page.getByTestId('input-food-description').fill('Keep this journal draft');
 await state('/api/nutrition/daily','paused');assert.equal(await summary.getByRole('progressbar').count(),0,'Paused daily data must withdraw cached target comparisons');await summary.getByText('Checking current recorded totals…',{exact:true}).waitFor();assert.equal(await page.getByTestId('input-food-description').inputValue(),'Keep this journal draft');
 await state('/api/nutrition/daily','idle');await summary.getByRole('progressbar').first().waitFor();
 await state('/api/nutrition/targets','paused');await summary.getByText('Checking current planning targets. Recorded totals are shown without target comparisons.',{exact:true}).waitFor();assert.equal(await summary.getByRole('progressbar').count(),0);assert.ok((await summary.innerText()).includes('100 kcal'));assert.ok((await summary.innerText()).includes('0 g'));
 await state('/api/nutrition/targets','idle');await summary.getByRole('progressbar').first().waitFor();
 await state('/api/meals','paused');assert.equal(await page.getByText('Synthetic older history',{exact:true}).count(),0);await page.getByText('Checking current journal history. Only current available entries for today are shown.',{exact:true}).waitFor();await page.getByText('Synthetic recorded lunch',{exact:true}).waitFor();
 await state('/api/nutrition/daily','paused');assert.equal(await page.getByText('Synthetic recorded lunch',{exact:true}).count(),0);await page.getByText('Current journal entries are unavailable.',{exact:true}).waitFor();assert.equal(await page.getByText('No meals in the available journal.',{exact:true}).count(),0);assert.equal(await page.getByTestId('input-food-description').inputValue(),'Keep this journal draft');await state('/api/meals','idle');await state('/api/nutrition/daily','idle');await page.getByText('Synthetic older history',{exact:true}).waitFor();
 assert.deepEqual(errors,[]);console.log('PASS: journal paused daily/target/history sources retract dependent cached values, preserve known zero/current fallback and manual draft; idle restoration. Synthetic HTTP storage and explicit query lifecycle states.');
}finally{await browser.close();await vite.close();}
