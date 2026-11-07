import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
const fixture="import React from 'react';import{createRoot}from'react-dom/client';import{AuthProvider,useAuth}from'/src/lib/auth.tsx';import{apiRequest,queryClient}from'/src/lib/queryClient.ts';\nfunction Harness(){const auth=useAuth();return React.createElement('div',null,React.createElement('p',{id:'identity'},auth.user?.id||'none'),React.createElement('button',{onClick:()=>auth.login('synthetic','synthetic-only')},'Explicit login'),React.createElement('button',{onClick:()=>apiRequest('GET','/api/precision')},'Probe owner'))}\nqueryClient.setQueryData(['old-private-cache'],{private:'old'});createRoot(document.getElementById('fixture')).render(React.createElement(AuthProvider,null,React.createElement(Harness)));";
const vite=await createServer({plugins:[{name:'auth-race-fixture',resolveId(id){if(id==='/qa-auth-race.js')return '\0auth-race-fixture';},load(id){if(id==='\0auth-race-fixture')return fixture;}}],server:{host:'127.0.0.1',port:5258,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage();page.setDefaultTimeout(12000);
let releaseBootstrap;const bootstrapGate=new Promise(r=>{releaseBootstrap=r;});let bootstrapSeen;const seen=new Promise(r=>{bootstrapSeen=r;});const actors=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/__auth-race',async r=>r.fulfill({contentType:'text/html',body:await vite.transformIndexHtml('/__auth-race','<div id="fixture"></div><script type="module" src="/qa-auth-race.js"></script>')}));
await page.route('**/api/**',async route=>{
 const path=new URL(route.request().url()).pathname;
 if(path==='/api/auth/me'){bootstrapSeen();await bootstrapGate;return route.fulfill({json:{user:{id:'old',username:'Old bootstrap'}}});}
 if(path==='/api/auth/login'){assert.equal(route.request().headers()['x-bloom-actor'],undefined);return route.fulfill({json:{success:true,user:{id:'current',username:'Explicit login'}}});}
 actors.push(route.request().headers()['x-bloom-actor']);return route.fulfill({json:{ok:true}});
});
try{
 await page.goto('http://127.0.0.1:5258/__auth-race');
 await page.getByRole('button',{name:'Explicit login',exact:true}).waitFor();assert.deepEqual(errors,[]);await seen;await page.getByRole('button',{name:'Explicit login',exact:true}).click();await page.locator('#identity').filter({hasText:'current'}).waitFor();
 assert.equal(await page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');return queryClient.getQueryData(['old-private-cache'])===undefined;}),true);
 await Promise.all([page.waitForResponse(r=>new URL(r.url()).pathname==='/api/auth/me'),Promise.resolve().then(()=>releaseBootstrap())]);
 await Promise.all([page.waitForResponse(r=>new URL(r.url()).pathname==='/api/precision'),page.getByRole('button',{name:'Probe owner',exact:true}).click()]);
 assert.equal(await page.locator('#identity').textContent(),'current');assert.deepEqual(actors,['current']);assert.deepEqual(errors,[]);
 console.log('PASS: delayed bootstrap cannot overwrite explicit login; canonical cache cleared and transport retains adopted account.');
}finally{releaseBootstrap();await browser.close();await vite.close();}
