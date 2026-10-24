import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const {createServer}=await import('vite');const vite=await createServer({server:{host:'127.0.0.1',port:5189,strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:375,height:1000},acceptDownloads:true});page.setDefaultTimeout(12000);
let unavailable=false,calls=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/api/**',async route=>{const p=new URL(route.request().url()).pathname;let json=[];
if(p==='/api/auth/me')json={user:{id:'synthetic-export',username:'Export fixture'}};
else if(p==='/api/preferences')json={exclusions:[],dislikes:[],goals:[],dietaryPattern:'omnivore'};
else if(p==='/api/precision')json={context:{allergies:[]},goals:[]};
else if(p==='/api/health-sources')json={connections:[]};
else if(p==='/api/profile')json={};
else if(p==='/api/experience/settings')json={mode:'everyday',onboarding:{status:'complete'}};
else if(p==='/api/account/export'){calls++;if(unavailable)return route.fulfill({status:503,json:{error:'Account records could not be exported. No partial download was produced.'}});json={format:'bloom-account-records-v1',profile:{id:'synthetic-export'},journal:[{totalCalories:0,nutritionalData:{protein:null}}],limits:['Synthetic browser fixture only']};}
await route.fulfill({json});});
try {
 await page.goto('http://127.0.0.1:5189/profile');
 const button=page.getByRole('button',{name:'Download my account records',exact:true});await button.waitFor();assert.equal(await button.isDisabled(),true);assert.equal(calls,0);
 await page.getByRole('checkbox',{name:/I understand this file contains sensitive health/}).check();
 const downloadPromise=page.waitForEvent('download');await button.click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'bloom-account-records.json');const data=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(data.profile.id,'synthetic-export');assert.equal(data.journal[0].totalCalories,0);assert.equal(data.journal[0].nutritionalData.protein,null);
 unavailable=true;await button.click();await page.getByRole('alert').filter({hasText:'No partial download'}).waitFor();assert.equal(calls,2);
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 assert.deepEqual(errors,[]);console.log('PASS: synthetic Profile export acknowledgement, JSON download, failure/retry and 320–1440px reflow');
}catch(e){console.error(errors);throw e;}finally{await browser.close();await vite.close();}
