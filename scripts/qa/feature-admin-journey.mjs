import assert from 'node:assert/strict';
import express from 'express';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
import {featureAdminReadGrant,featureReviewManifest,registerFeatureAdministration} from '../../server/feature-administration.ts';
import {registerCapabilityAccess} from '../../server/capability-access.ts';
import {experienceSettingsSchema} from '../../shared/experience.ts';
const evidence=process.env.BLOOM_ADMIN_EVIDENCE!=='false';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=path.join(root,'docs/review/feature-admin-20261025');if(evidence)await mkdir(out,{recursive:true});
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const nativeFetch=globalThis.fetch;
let actor='synthetic-admin',adminGranted=true,forceClientRole=false,delayAdmin=false,releaseDelay;
let metadataReads=0,adminRequests=0,aborted=0,abortedSignals=0;const errors=[],writes=[];
const grant={userId:'synthetic-admin',grantId:'synthetic-read-review',role:'feature-admin',scopes:['features:read'],serviceId:'srv-syntheticreview',environment:'isolated-synthetic',purpose:'feature-metadata-review',reviewReference:'synthetic-role-review',expiresAt:new Date(Date.now()+3600000).toISOString()};
const env={BLOOM_FEATURE_ADMIN_ENVIRONMENT:grant.environment,RENDER_SERVICE_ID:grant.serviceId,BLOOM_FEATURE_ADMINS:JSON.stringify([grant]),RENDER_GIT_COMMIT:'b'.repeat(40)};
const adminFor=id=>adminGranted&&featureAdminReadGrant(id,env);
const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:actor};next();});
const auth=(req,res,next)=>req.session.userId?next():res.sendStatus(401);
registerFeatureAdministration(app,auth,adminFor,()=>{metadataReads++;return featureReviewManifest(env);});
registerCapabilityAccess(app,auth,{get:async()=>null,put:async()=>{}},id=>id==='synthetic-tester'?{fingerprint:'synthetic-preview'}:null,adminFor);
const backend=app.listen(0,'127.0.0.1');await new Promise(resolve=>backend.on('listening',resolve));const api=`http://127.0.0.1:${backend.address().port}`;
let browser;
try{
 for(const before of (evidence?[true,false]:[false])){
  const sources=before?new Map(['client/src/App.tsx','client/src/components/AppNavigation.tsx'].map(file=>[path.join(root,file),execFileSync('git',['show','f3dce55:'+file],{cwd:root,encoding:'utf8'})])):new Map();
  const vite=await createServer({configFile:path.join(root,'vite.config.ts'),plugins:before?[{name:'actual-pre-admin-source',enforce:'pre',load(id){return sources.get(id);}}]:[],server:{port:5203,host:'127.0.0.1',strictPort:true}});await vite.listen();
  browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox','--single-process','--no-zygote']});
  const page=await browser.newPage({viewport:{width:375,height:900}});page.setDefaultTimeout(12000);page.on('pageerror',error=>errors.push(error.message));page.on('requestfailed',request=>{if(new URL(request.url()).pathname==='/api/admin/features')aborted++;});
  await page.addInitScript(()=>{const original=window.fetch;window.__adminFetchAborts=0;window.fetch=function(input,options){if(String(input).includes('/api/admin/features'))options?.signal?.addEventListener('abort',()=>{window.__adminFetchAborts++;},{once:true});return original.call(this,input,options);};});
  await page.route('https://fonts.**/**',route=>route.abort());
  await page.route('**/api/**',async route=>{
   const request=route.request(),p=new URL(request.url()).pathname;
   if(request.method()!=='GET'){writes.push(p);return route.fulfill({status:403,json:{error:'No writes from read-only review UI'}});}
   if(p==='/api/auth/me')return route.fulfill({json:{user:actor?{id:actor,username:'Synthetic reviewer'}:null}});
   if(p==='/api/experience/settings')return route.fulfill({json:experienceSettingsSchema.parse({})});
   if(p==='/api/capabilities'||p.startsWith('/api/admin/')){
    if(p.startsWith('/api/admin/'))adminRequests++;
    const response=await nativeFetch(api+p),body=await response.json();
    if(p==='/api/capabilities'&&forceClientRole)body.featureAdministration={canRead:true,canChange:false};
    if(p==='/api/admin/features'&&delayAdmin)await new Promise(resolve=>{releaseDelay=resolve;});
    return route.fulfill({status:response.status,json:body}).catch(error=>{if(adminGranted)throw error;});
   }
   return route.fulfill({json:[]});
  });
  const go=async()=>{await page.goto('http://127.0.0.1:5203/admin/features');};
  try{
   if(before){await go();await page.getByText(/404/).first().waitFor();if(evidence)await page.screenshot({path:path.join(out,'before-mobile.png')});continue;}
   for(const user of ['ordinary','synthetic-tester']){actor=user;await go();await page.getByRole('heading',{name:'Administrator access unavailable',exact:true}).waitFor();assert.equal(await page.getByRole('link',{name:'Feature management',exact:true}).count(),0);assert.equal(await page.getByRole('searchbox',{name:'Search capabilities'}).count(),0);}
   assert.equal(adminRequests,0);
   actor='ordinary';forceClientRole=true;await go();await page.getByRole('alert').filter({hasText:'Feature review could not load'}).waitFor();assert.equal(metadataReads,0);assert.equal(await page.locator('main details.bloom-panel').count(),0);forceClientRole=false;
   actor='synthetic-admin';await go();const search=page.getByRole('searchbox',{name:'Search capabilities',exact:true});await search.waitFor();await page.getByText('52 of 52 capabilities',{exact:false}).waitFor();assert.equal(await page.locator('main details.bloom-panel').count(),52);
   await search.fill('bloom.metabolite.scores');const card=page.locator('main details.bloom-panel');assert.equal(await card.count(),1);await card.locator(':scope > summary').click();await card.getByText('Incident-disabled capabilities cannot be enabled by an administrator.',{exact:true}).waitFor();
   for(const button of await card.getByRole('button').all())assert.equal(await button.isDisabled(),true);
   await card.getByText('Source and required review',{exact:true}).click();await card.getByText('Not independently verified',{exact:true}).waitFor();await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});if(evidence)await page.screenshot({path:path.join(out,'after-mobile.png'),fullPage:true});
   if(evidence){await page.getByRole('heading',{name:'Review source metadata',exact:true}).evaluate(node=>{node.style.outline='2px solid #bd843b';node.textContent='1 · '+node.textContent;});await page.locator('#feature-change-unavailable').evaluate(node=>{node.style.outline='2px solid #bd843b';node.textContent='2 · '+node.textContent;});if(evidence)await page.screenshot({path:path.join(out,'after-mobile-annotated.png'),fullPage:true});}
   for(const width of [320,375,390,1280]){await page.setViewportSize({width,height:width===320?500:900});for(const dark of [false,true]){await page.evaluate(value=>document.documentElement.classList.toggle('dark',value),dark);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Admin reflow ${width}/${dark}`);}}
   await search.fill('');await page.getByRole('combobox',{name:'Review status',exact:true}).selectOption('Incident disabled');assert.equal(await page.locator('main details.bloom-panel').count(),2);await page.getByRole('combobox',{name:'Review status',exact:true}).selectOption('Live');await page.getByText('No capabilities match these filters.',{exact:false}).waitFor();await page.getByRole('combobox',{name:'Review status',exact:true}).selectOption('all');await search.focus();assert.equal(await search.evaluate(node=>node===document.activeElement),true);
   await page.getByRole('link',{name:'Feature management',exact:true}).waitFor();
   delayAdmin=true;await page.evaluate(()=>{void import('/src/lib/queryClient.ts').then(({queryClient})=>queryClient.invalidateQueries({queryKey:['/api/admin/features']}));});
   for(let i=0;i<40&&!releaseDelay;i++)await new Promise(resolve=>setTimeout(resolve,50));assert.ok(releaseDelay,'Actual metadata fetch must be in flight');
   adminGranted=false;await page.getByRole('heading',{name:'Administrator access unavailable',exact:true}).waitFor({timeout:15000});assert.equal(await page.locator('main details.bloom-panel').count(),0);assert.equal(await page.getByRole('link',{name:'Feature management',exact:true}).count(),0);
   assert.ok(aborted>0,'Revocation must abort the actual in-flight metadata request');
   abortedSignals=await page.evaluate(()=>window.__adminFetchAborts);assert.ok(abortedSignals>0,'Revocation must abort the signal passed to the actual browser fetch');
   assert.equal(await page.evaluate(async()=>{const {queryClient}=await import('/src/lib/queryClient.ts');return queryClient.getQueryCache().findAll({predicate:query=>query.meta?.restrictedAdmin===true}).every(query=>query.state.data===undefined);}),true);
   releaseDelay();releaseDelay=undefined;
  }finally{releaseDelay?.();releaseDelay=undefined;await page.close().catch(()=>{});await browser.close().catch(()=>{});await vite.close();}
 }
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 if(evidence)await writeFile(path.join(out,'results.json'),JSON.stringify({synthetic:true,backend:'actual admin/capability handlers; in-memory tester preference and explicit synthetic read-only deployment-bound role',baseline:'actual f3dce55 App/navigation source without admin route',checks:['Ordinary/tester absence and denial','Forged client eligibility cannot obtain backend metadata','52 source entries and independent review dimensions','Search/status filters/disabled changes','320–1280 light/dark/zoom and keyboard','Role poll removes navigation/data and aborts actual in-flight request'],metadataReads,aborted,abortedSignals,writes,errors,realAdminProvisioned:false,activationMutationsImplemented:false},null,2));
 console.log('PASS: actual-handler synthetic admin read review, public/tester/fake-role denial, metadata filtering, no changes and role/cache/network revocation');
}finally{releaseDelay?.();await browser?.close().catch(()=>{});backend.closeAllConnections();await new Promise(resolve=>backend.close(resolve));}
