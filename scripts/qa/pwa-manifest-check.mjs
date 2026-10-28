import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
const vite=await createServer({server:{host:'127.0.0.1',port:5264,strictPort:true}});
await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
try {
 const page=await browser.newPage();
 await page.route('https://fonts.**/**',r=>r.abort());
 await page.route('**/api/**',r=>r.fulfill({status:401,json:{error:'Authentication required'}}));
 await page.goto('http://127.0.0.1:5264/login');
 const session=await page.context().newCDPSession(page);
 const parsed=await session.send('Page.getAppManifest');
 assert.deepEqual(parsed.errors,[]);
 const manifest=JSON.parse(parsed.data);
 assert.equal(manifest.id,'/');assert.equal(manifest.scope,'/');assert.equal(manifest.start_url,'/');
 assert.equal(manifest.display,'standalone');assert.equal(manifest.name,'Bloom');
 for(const icon of manifest.icons){
  const response=await page.request.get('http://127.0.0.1:5264'+icon.src);assert.equal(response.status(),200);
  const bytes=await response.body();assert.deepEqual(bytes,readFileSync('client/public'+icon.src));
  assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`,icon.sizes);
 }
 assert.equal(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),0);
 console.log('PASS Chromium manifest parser, same-origin root/scope, actual approved icon bytes/dimensions; no service worker registered. OS installation and device acceptance are separate.');
} finally {await browser.close();await vite.close();}
