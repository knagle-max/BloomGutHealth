import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {buildBiologicalRegistry,validateRegistry} from '../../shared/biological-model.ts';
const before=process.argv.includes('--before');
if(before){assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),'6cea2fe564eae1ffc7c7d8f958c36bc9e647e39f');execFileSync('git',['diff','--quiet']);}
const registry=validateRegistry(buildBiologicalRegistry());
const vite=await createServer({server:{host:'127.0.0.1',port:5268,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(12000);
const errors=[],writes=[],images=[];let imageFailure=false;
page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',route=>{const req=route.request(),p=new URL(req.url()).pathname;if(req.method()!=='GET')writes.push(p);const json=p==='/api/auth/me'?{user:{id:'synthetic-molecule',username:'Synthetic molecule review'}}:p==='/api/experience/settings'?{mode:'everyday',onboarding:{status:'complete'}}:p==='/api/biology/registry'?registry:[];return route.fulfill({json});});
await page.route('**/science/structures-v4/**',route=>{images.push({url:route.request().url(),referer:route.request().headers().referer});return imageFailure?route.abort():route.continue();});
const output=new URL('../../docs/review/molecular-artwork-20261105/',import.meta.url);await mkdir(output,{recursive:true});
const open=async label=>{await page.goto('http://127.0.0.1:5268/explore?node='+encodeURIComponent('molecule:'+label.toLowerCase()));await page.getByRole('heading',{name:label,exact:true}).waitFor();};
try{
 await open('Butyrate');
 if(!before){
  for(const label of ['Acetate','Propionate','Butyrate','Lactate']){
   await open(label);const figure=page.getByRole('figure',{name:'Molecular illustration for '+label,exact:true});await figure.waitFor();
   assert.equal(await figure.locator('img').evaluate(img=>img.decode().then(()=>img.naturalWidth>0).catch(()=>false)),true);
   await figure.getByRole('link',{name:'View full illustration',exact:true}).waitFor();
   assert.match(await figure.innerText(),/chemistry review pending/);
   const map=page.locator('svg.relationship-map');await map.waitFor({state:'attached'});assert.match(await map.getAttribute('aria-label'),new RegExp('Nearby research connections for '+label));
  }
  await open('Butyrate');
 }
 for(const[width,dark]of[[320,false],[390,false],[390,true]]){
  await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:dark?'dark':'light'});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);
  await page.getByRole('heading',{name:'Butyrate',exact:true}).evaluate(el=>el.parentElement.scrollIntoView({block:'start'}));
  await page.screenshot({path:new URL(`${before?'before':'after'}-${width}-${dark?'dark':'light'}.png`,output).pathname});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 if(!before){
  const figure=page.getByRole('figure',{name:'Molecular illustration for Butyrate',exact:true});await figure.getByRole('link',{name:'View full illustration',exact:true}).focus();assert.equal(await figure.locator('a').evaluate(a=>a===document.activeElement),true);
  await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
  const overflow=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,offenders:Array.from(document.querySelectorAll('main *')).filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(el=>({tag:el.tagName,class:el.className?.baseVal??el.className,width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right}))}));
  if(overflow.scroll>overflow.viewport+1)console.log(JSON.stringify(overflow));assert.ok(overflow.scroll<=overflow.viewport+1);
  imageFailure=true;await page.reload();await page.getByText('Illustration unavailable. Research connections remain available below.',{exact:true}).waitFor();
  await page.locator('svg.relationship-map').waitFor({state:'visible'});
  await page.goto('http://127.0.0.1:5268/explore?node='+encodeURIComponent('molecule:acetate (cross-feeding co-substrate)'));await page.getByRole('heading',{name:'Acetate (cross-feeding co-substrate)',exact:true}).waitFor();assert.equal(await page.getByRole('figure',{name:/Molecular illustration for/}).count(),0,'No unreviewed chemical identity aliasing');
  assert.ok(images.length>=4);assert.ok(images.every(i=>!i.referer));
 }
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 console.log(before?'Captured matched original Explore baseline6cea2fe.':'PASS actual App: four exact molecular identities decode with source captions/full-view keyboard link, original research map retained, 320/390/dark/200%, missing-image fallback, no aliasing/referrer/writes. Local synthetic app evidence, no independent chemistry/Design/VoiceOver approval claimed.');
}finally{await browser.close();await vite.close();}
