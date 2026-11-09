import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
const source=process.env.BLOOM_CAPTURE_ROOT||process.cwd();
const stage=process.env.BLOOM_CAPTURE_STAGE||'after';
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8'}).trim();
if(process.env.BLOOM_CAPTURE_SHA)assert.equal(sourceCommit,process.env.BLOOM_CAPTURE_SHA);
const trackedDirty=!!execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:source,encoding:'utf8'}).trim();
const output=resolve('docs/review/gut-import-comparison-20261028');mkdirSync(output,{recursive:true});
const vite=await createServer({configFile:resolve(source,'vite.config.ts'),server:{host:'127.0.0.1',port:5265,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const writes=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:390,height:1000},locale:'en-CA',timezoneId:'America/Regina'});page.setDefaultTimeout(12000);
 page.on('pageerror',error=>errors.push(error.message));await page.route('https://fonts.**/**',r=>r.abort());
 await page.route('**/api/**',r=>{const p=new URL(r.request().url()).pathname;if(r.request().method()!=='GET')writes.push(p);return r.fulfill({json:p==='/api/auth/me'?{user:{id:'synthetic-visual-review',username:'Synthetic visual review'}}:p==='/api/experience/settings'?{mode:'everyday',onboarding:{status:'complete'}}:[]});});
 await page.goto('http://127.0.0.1:5265/upload');await page.getByRole('button',{name:'Paste JSON data',exact:true}).click();await page.getByLabel('Paste Your Data',{exact:true}).fill(JSON.stringify({bacteria_percentages:{'Synthetic organism':100}},null,2));
 if(stage==='after'){
  await page.getByRole('button',{name:'Review report',exact:true}).click();await page.getByRole('heading',{name:'Review report before saving',exact:true}).waitFor();await page.getByText('Recognized data & missing measurements',{exact:true}).click();await page.getByRole('region',{name:'Reported relative abundance',exact:true}).getByText('100%',{exact:true}).waitFor();
 }else{assert.equal(stage,'before');await page.getByRole('button',{name:'Save report',exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:'Review report before saving',exact:true}).count(),0);}
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 await page.screenshot({path:resolve(output,stage+'-390.png'),fullPage:false});writeFileSync(resolve(output,stage+'.json'),JSON.stringify({stage,sourceCommit,trackedDirty,viewport:{width:390,height:1000},fixture:'Synthetic organism100% JSON; mocked auth/settings; no import write',writes,errors},null,2)+'\n');console.log('PASS pinned '+stage+' gut import visual comparison, synthetic input, no writes.');
}finally{await browser.close();await vite.close();}
