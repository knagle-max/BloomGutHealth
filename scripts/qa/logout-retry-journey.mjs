import assert from'node:assert/strict';import{createRequire}from'node:module';import{createServer}from'vite';import{experienceSettingsSchema}from'../../shared/experience.ts';import{preferenceSchema}from'../../shared/meal-intelligence.ts';
const vite=await createServer({server:{host:'127.0.0.1',port:5261,strictPort:true}});await vite.listen();const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const context=await browser.newContext(),page=await context.newPage();page.setDefaultTimeout(12000);await page.clock.install();
const errors=[],writes=[];let signedIn=true,attempts=0,releaseLost;const lost=new Promise(r=>{releaseLost=r;});page.on('pageerror',error=>errors.push(error.message));await context.route('https://fonts.**/**',r=>r.abort());
await context.route('**/api/**',async route=>{
 const req=route.request(),path=new URL(req.url()).pathname;if(req.method()!=='GET')writes.push(path);
 if(path==='/api/auth/logout'){
  attempts++;if(attempts===1)return route.fulfill({status:503,json:{error:'Synthetic private backend detail'}});
  if(attempts===2){await lost;signedIn=false;return route.fulfill({json:{success:true}}).catch(()=>{});}
  signedIn=false;return route.fulfill({json:{success:true}});
 }
 let json=[];
 if(path==='/api/auth/me')json={user:signedIn?{id:'synthetic-logout',username:'Synthetic logout'}:null};
 else if(path==='/api/profile')json={id:'synthetic-logout',username:'Synthetic logout',sex:'female',age:35,heightCm:170,weightKg:65,activityLevel:'moderate',dietaryPreferences:preferenceSchema.parse({})};
 else if(path==='/api/experience/settings')json=experienceSettingsSchema.parse({onboarding:{status:'complete'}});
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5261/profile');const logout=page.getByRole('button',{name:'Log out',exact:true}),error=page.getByRole('alert').filter({hasText:'Sign-out could not be confirmed'});await logout.click();await error.waitFor();assert.equal(attempts,1);assert.equal(await logout.isEnabled(),true);assert.equal(await page.getByTestId('avatar-user').count(),1);assert.doesNotMatch(await error.textContent(),/private backend/);
 await logout.click();const pending=page.getByRole('button',{name:'Logging out…',exact:true});await pending.waitFor();assert.equal(await pending.isDisabled(),true);await page.clock.runFor(15001);await error.waitFor();assert.equal(await logout.isEnabled(),true);assert.equal(attempts,2);assert.equal(await page.getByTestId('avatar-user').count(),1);
 // A timed-out request may have committed; retry the idempotent logout without claiming certainty.
 releaseLost();await logout.click();await page.waitForURL('**/login');await page.getByRole('heading',{name:'Welcome back'}).waitFor();assert.equal(attempts,3);assert.equal(await page.getByTestId('avatar-user').count(),0);assert.equal(await page.locator('body').innerText().then(text=>text.includes('Sign-out could not be confirmed')),false);assert.deepEqual(writes,['/api/auth/logout','/api/auth/logout','/api/auth/logout']);assert.deepEqual(errors,[]);
 console.log('PASS actual Profile/AuthProvider:503 feedback masks backend detail, pending disables duplicates,15s timeout permits explicit retry after unknown outcome, confirmed idempotent logout clears private UI, no health writes or unhandled rejection.');
}finally{releaseLost();await browser.close();await vite.close();}
