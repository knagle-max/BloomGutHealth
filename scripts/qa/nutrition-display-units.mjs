import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const root=process.env.BLOOM_CAPTURE_ROOT||path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const output=process.env.BLOOM_REVIEW_OUTPUT||path.resolve(root,'work/nutrition-units');
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
let alternateAccount=false;
page.on('pageerror',e=>errors.push(e.message));
await page.route('https://fonts.**/**',r=>r.abort());
const meal={id:'synthetic-meal',userId:'synthetic',mealText:'Synthetic oats lunch',mealType:'lunch',loggedAt:'2026-10-23T17:00:00Z',totalCalories:500,totalProtein:20,totalCarbs:60,totalFat:20,nutritionalData:[{name:'Synthetic oats',calories:500,protein_g:20,carbohydrates_total_g:60,fat_total_g:20,fiber_g:8}],intelligence:null};
await page.route('**/api/**',async route=>{
  const req=route.request(),url=new URL(req.url()),p=url.pathname;
  let json=[];
  if(req.method()!=='GET')writes.push({path:p,body:req.postDataJSON()});
  if(p==='/api/auth/me')json={user:{id:alternateAccount?'synthetic-second':'synthetic',username:'Synthetic Gardener'}};
  else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'},displayUnits:alternateAccount?{energy:'kcal',foodWeight:'g'}:{energy:'kJ',foodWeight:'oz'}};
  else if(p.startsWith('/api/meals'))json=req.method()==='POST'?meal:[alternateAccount?{...meal,id:'second-meal',userId:'synthetic-second',mealText:'Second account lunch'}:meal];
  else if(p.startsWith('/api/nutrition/daily'))json={meals:[meal],totals:{calories:500,protein:20,carbs:60,fat:20,fiber:8,sugar:null,sodium:null,potassium:null}};
  else if(p.startsWith('/api/nutrition/targets'))json={calories:2000,protein:120,carbs:225,fat:67,fiber:30};
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
const capture=async(name,width,theme)=>{
  assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('dark')),theme==='dark');
  const filename=`${stage}-${name}-${width}-${theme}.png`;
  await page.screenshot({path:path.join(output,filename),fullPage:true});
  captures.push({filename,route:new URL(page.url()).pathname,width,height:1000,theme});
};
try{
  for(const width of [390,1440])for(const theme of ['light','dark']){
    await page.setViewportSize({width,height:1000});
    await page.emulateMedia({colorScheme:theme});
    for(const [route,name] of [['/','today'],['/nutrition','nutrition']]){
      await go(route);await page.getByText('Synthetic oats lunch',{exact:true}).first().waitFor();
      if(stage==='after')assert.ok((await page.locator('main').innerText()).includes('2092'));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${route} ${width}`);
      await capture(name,width,theme);
    }
    await go('/explore');await page.getByLabel('Find a food').fill('oats');await page.getByRole('button',{name:'Search foods',exact:true}).click();
    await page.getByRole('button',{name:'Synthetic oats',exact:true}).click();
    const amount=page.getByLabel(stage==='after'?'Amount eaten (oz)':'Portion in grams');
    await amount.fill(stage==='after'?'4':'113.3980925');
    await page.getByRole('heading',{name:/Synthetic oats ·/}).waitFor();
    if(stage==='after')assert.equal(masses.at(-1),113.3980925);
    await capture('explore-portion',width,theme);
  }
  if(stage==='after'){
    const amount=page.getByLabel('Amount eaten (oz)');
    await amount.fill('4.');await page.getByRole('alert').filter({hasText:'Finish decimals'}).waitFor();
    assert.equal(await page.getByRole('link',{name:'Review & log this food'}).count(),0);
    await amount.fill('4');await page.getByRole('link',{name:'Review & log this food'}).click();
    await page.getByText(/4 oz Synthetic oats/).waitFor();
    await page.getByRole('button',{name:'Save to my journal',exact:true}).click();
    await page.getByRole('heading',{name:'Your meal is saved.',exact:true}).waitFor();
    assert.ok((await page.locator('.saved-nutrients').innerText()).includes('2092'));
    const saved=writes.find(w=>w.path==='/api/meals').body;
    assert.equal(saved.ingredients[0].grams,113.3980925);
    assert.equal(saved.ingredients[0].catalogue.fdcId,123);
    assert.equal(saved.mealText,'113.3980925 g Synthetic oats');
    assert.equal(writes.filter(w=>w.path==='/api/meals').length,1);
    alternateAccount=true;await go('/');
    await page.getByText('Second account lunch',{exact:true}).first().waitFor();
    assert.equal(await page.getByText('Synthetic oats lunch',{exact:true}).count(),0);
    assert.ok((await page.locator('.meal-calories').innerText()).includes('500 kcal'));
    assert.equal((await page.locator('main').innerText()).includes('2092'),false);
  }
  assert.deepEqual(errors,[]);
  const evidence={stage,sha:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),dirty:!!execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim(),fixtureTime:'2026-10-23T18:00:00Z',locale:'en-CA',timezone:'America/Regina',synthetic:true,providerCalls:'Intercepted; none external',captures,errors};
  await fs.writeFile(path.join(output,`${stage}-manifest.json`),JSON.stringify(evidence,null,2));
  console.log(JSON.stringify(evidence,null,2));
}catch(error){console.error({errors,body:await page.locator('body').innerText()});throw error;}finally{await browser.close();await vite.close();}
