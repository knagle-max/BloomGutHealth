import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {experienceSettingsSchema} from '../../shared/experience.ts';
import {setAppTheme} from './set-app-theme.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const vite=await createServer({server:{host:'127.0.0.1',port:5212,strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage();const errors=[],writes=[];let fail=false,consent=true;
page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),p=new URL(req.url()).pathname;
 if(req.method()!=='GET'){writes.push({p,method:req.method(),confirm:req.headers()['x-bloom-confirm']});if(req.method()==='DELETE'&&p==='/api/health-sources/apple_health'){consent=false;return route.fulfill({json:{deleted:true}});}throw Error('Unexpected write '+p);}
 if(p==='/api/health-sources'&&fail)return route.fulfill({status:503,json:{error:'Synthetic private internal failure'}});
 const json=p==='/api/auth/me'?{user:{id:'synthetic-connections',username:'Synthetic'}}:p==='/api/experience/settings'?experienceSettingsSchema.parse({}):p==='/api/profile'?{}:p==='/api/preferences'?{exclusions:[],dislikes:[],goals:[],dietaryPattern:'omnivore'}:p==='/api/health-sources'?{connections:[{provider:'apple_health',state:'not_connected',consentRecorded:consent},{provider:'health_connect',state:'not_connected',consentRecorded:false}]}:[];
 return route.fulfill({json});
});
const state=async status=>page.evaluate(async status=>{const{queryClient}=await import('/src/lib/queryClient.ts');for(const q of queryClient.getQueryCache().findAll({queryKey:['/api/health-sources']}))q.setState({fetchStatus:status});},status);
try{
 await page.goto('http://127.0.0.1:5212/profile#connections');
 const hub=page.getByRole('region',{name:'Health source availability'});await hub.getByRole('heading',{name:'Apple Health',exact:true}).waitFor();
 assert.equal(await page.locator('#connections').evaluate(e=>e.open),true);
 assert.equal(await hub.getByText('Not connected',{exact:true}).count(),2);
 assert.equal(await hub.getByText('Not reported',{exact:true}).count(),2);
 await hub.getByText('Recorded in Bloom',{exact:true}).waitFor();
 assert.equal(await page.getByText('Stored health-source records',{exact:true}).count(),1);
 await state('paused');await hub.getByRole('status').filter({hasText:'paused'}).waitFor();assert.equal(await hub.getByText('Recorded in Bloom',{exact:true}).count(),0);await state('idle');
 fail=true;await page.evaluate(async()=>{const{queryClient}=await import('/src/lib/queryClient.ts');void queryClient.invalidateQueries({queryKey:['/api/health-sources']});});
 await hub.getByRole('alert').waitFor();assert.equal(await hub.getByText('Recorded in Bloom',{exact:true}).count(),0);assert.equal(await hub.getByText(/private internal/).count(),0);
 fail=false;await hub.getByRole('button',{name:'Retry source status'}).click();await hub.getByText('Recorded in Bloom',{exact:true}).waitFor();
 for(const width of [320,375,390,768,1440]){await page.setViewportSize({width,height:900});for(const theme of ['light','dark']){await setAppTheme(page,theme);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width} ${theme} overflow`);}}
 await hub.getByText('Stored health-source records',{exact:true}).click();
 const remove=hub.getByRole('button',{name:'Delete selected source data'});assert.equal(await remove.isEnabled(),false);
 await hub.getByRole('combobox',{name:'Delete data for a provider'}).selectOption('apple_health');
 await hub.getByRole('textbox',{name:/Type DELETE SOURCE/}).fill('DELETE SOURC');assert.equal(await remove.isEnabled(),false);
 await hub.getByRole('textbox',{name:/Type DELETE SOURCE/}).fill('DELETE SOURCE');await remove.click();
 await hub.getByRole('status').filter({hasText:'Stored source records deleted'}).waitFor();
 assert.equal(await hub.getByRole('textbox',{name:/Type DELETE SOURCE/}).inputValue(),'');
 assert.equal(await hub.getByText('None recorded in Bloom',{exact:true}).count(),2);
 assert.deepEqual(writes,[{p:'/api/health-sources/apple_health',method:'DELETE',confirm:'delete-health-source'}]);
 assert.deepEqual(errors,[]);console.log('PASS Connections: hash disclosure, truthful consent/permission/sync, paused/error source withdrawal and retry, canonical guarded deletion/refetch, five widths actual light/dark, no other writes. Synthetic browser HTTP fixture; not native/hosted proof.');
}finally{await browser.close();await vite.close();}
