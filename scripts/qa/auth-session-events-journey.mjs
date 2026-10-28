import assert from 'node:assert/strict';import{createRequire}from'node:module';import{createServer}from'vite';
const fixture=`import React from 'react';import{createRoot}from'react-dom/client';import{AuthProvider,useAuth}from'/src/lib/auth.tsx';import{apiRequest}from'/src/lib/queryClient.ts';import{useToast}from'/src/hooks/use-toast.ts';
function Notices(){const{toasts}=useToast();return React.createElement('div',{id:'notices'},toasts.map(t=>React.createElement('p',{key:t.id},t.description)))}
function PrivateDraft(){return React.createElement('label',null,'Private draft',React.createElement('input',{id:'draft',defaultValue:''}))}
function Harness(){const auth=useAuth();return React.createElement('div',null,React.createElement(Notices),React.createElement('p',{id:'identity'},auth.isLoading?'Checking account':auth.user?.id||'Signed out'),!auth.isLoading&&auth.user&&React.createElement('section',{id:'private',key:auth.user.id},React.createElement(PrivateDraft)),React.createElement('button',{onClick:()=>auth.login('owner-b','synthetic-only')},'Login B'),React.createElement('button',{onClick:()=>auth.logout()},'Logout'),React.createElement('button',{onClick:()=>apiRequest('GET','/api/precision')},'Probe owner'))}
createRoot(document.getElementById('fixture')).render(React.createElement(AuthProvider,null,React.createElement(Harness)));`;
const vite=await createServer({plugins:[{name:'auth-session-fixture',resolveId(id){if(id==='/qa-auth-session.js')return'\0auth-session-fixture';},load(id){if(id==='\0auth-session-fixture')return fixture;}}],server:{host:'127.0.0.1',port:5260,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const context=await browser.newContext();
if(process.env.BLOOM_AUTH_STORAGE_ONLY==='1')await context.addInitScript(()=>{window.BroadcastChannel=class{constructor(){throw Error('Synthetic unsupported channel');}};});
const first=await context.newPage(),second=await context.newPage(),errors=[],actors=[];for(const page of[first,second]){page.setDefaultTimeout(12000);page.on('pageerror',error=>errors.push(error.message));}
let session='owner-a',holdB=true,releaseB,failFirst=false;const gateB=new Promise(r=>{releaseB=r;});
await context.route('**/__auth-session',async route=>route.fulfill({contentType:'text/html',body:await vite.transformIndexHtml('/__auth-session','<div id="fixture"></div><script type="module" src="/qa-auth-session.js"></script>')}));
await context.route('**/api/**',async route=>{
 const request=route.request(),path=new URL(request.url()).pathname;
 if(path==='/api/auth/login'){assert.equal(request.headers()['x-bloom-actor'],undefined);session='owner-b';return route.fulfill({json:{success:true,user:{id:session,username:'Synthetic B'}}});}
 if(path==='/api/auth/logout'){session=null;return route.fulfill({json:{success:true}});}
 if(path==='/api/auth/me'){if(failFirst&&request.frame().page()===first){failFirst=false;return route.fulfill({status:503,json:{error:'Synthetic auth source unavailable'}});}const captured=session;if(holdB&&captured==='owner-b'&&request.frame().page()===first)await gateB;return route.fulfill({json:{user:captured?{id:captured,username:'Synthetic'}:null}});}
 actors.push(request.headers()['x-bloom-actor']);return route.fulfill({json:{ok:true}});
});
try{
 await first.goto('http://127.0.0.1:5260/__auth-session');await first.locator('#identity').filter({hasText:'owner-a'}).waitFor();await first.getByLabel('Private draft').fill('Synthetic private owner A draft');
 await first.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');queryClient.setQueryData(['private-a'],{private:'synthetic-only'});const{toast}=await import('/src/hooks/use-toast.ts');toast({description:'Synthetic private notice A'});});
 await first.locator('#notices').filter({hasText:'Synthetic private notice A'}).waitFor();
 await second.goto('http://127.0.0.1:5260/__auth-session');await second.locator('#identity').filter({hasText:'owner-a'}).waitFor();await second.getByRole('button',{name:'Login B',exact:true}).click();
 await first.locator('#identity').filter({hasText:'Checking account'}).waitFor();assert.equal(await first.locator('#private').count(),0);assert.equal(await first.locator('#notices').textContent(),'');
 assert.equal(await first.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');return queryClient.getQueryData(['private-a'])===undefined;}),true);
 holdB=false;releaseB();await first.locator('#identity').filter({hasText:'owner-b'}).waitFor();assert.equal(await first.getByLabel('Private draft').inputValue(),'');
 await Promise.all([first.waitForResponse(r=>new URL(r.url()).pathname==='/api/precision'),first.getByRole('button',{name:'Probe owner',exact:true}).click()]);assert.equal(actors.at(-1),'owner-b');
 await first.getByLabel('Private draft').fill('Synthetic private owner B draft');
 failFirst=true;await second.getByRole('button',{name:'Login B',exact:true}).click();await first.locator('#identity').filter({hasText:'Signed out'}).waitFor();assert.equal(await first.locator('#private').count(),0,'Failed session recheck cannot restore previous private UI');
 await first.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await first.locator('#identity').filter({hasText:'owner-b'}).waitFor();assert.equal(await first.getByLabel('Private draft').inputValue(),'');
 await first.getByLabel('Private draft').fill('Synthetic private owner B draft');
 await first.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));assert.equal(await first.locator('#private').count(),0);assert.equal(await first.locator('#identity').textContent(),'Checking account');
 session='owner-a';await first.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await first.locator('#identity').filter({hasText:'owner-a'}).waitFor();assert.equal(await first.getByLabel('Private draft').inputValue(),'');
 await second.getByRole('button',{name:'Logout',exact:true}).click();await first.locator('#identity').filter({hasText:'Signed out'}).waitFor();assert.equal(await first.locator('#private').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS actual AuthProvider: cross-tab login withdraws private draft/cache before held server recheck; no message-owned identity; current-actor request; failed recheck withdraws private UI; persisted lifecycle scrubs/rechecks; logout retracts other tab. Transport='+ (process.env.BLOOM_AUTH_STORAGE_ONLY==='1'?'nonce-only storage fallback':'BroadcastChannel')+'. Lifecycle events are injected; real-device BFCache acceptance remains separate.');
}finally{releaseB();await browser.close();await vite.close();}
