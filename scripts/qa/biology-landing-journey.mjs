import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import express from 'express';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {registerPrecisionRoutes} from '../../server/precision-routes.ts';
import {contextSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {parseLabPaste} from '../../shared/lab-paste.ts';
import {parseStructuredReport} from '../../shared/structured-report.ts';
import {createViomePdfParser} from '../../shared/viome-pdf.ts';
import {syntheticViomePages} from '../../tests/fixtures/viome-pdf.ts';
const before=process.argv.includes('--before'),capture=process.env.BLOOM_CAPTURE_VISUALS==='1';let scenario='qualitative',failed=false,mode='everyday',safetyReviewed=true;
const parser=createViomePdfParser();syntheticViomePages('organisms').forEach(parser.page);const native=parseStructuredReport({...parser.finish(),reviewConfirmed:true});
const pending=parseLabPaste('LDL, 120','2026-11-01T12:00:00Z','Synthetic pending source').pending.map((entry,index)=>({id:'synthetic-pending-'+index,kind:'lab',payload:entry.payload,createdAt:'2026-11-01T12:00:00Z'}));
const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:'synthetic-biology-landing'};next();});
registerPrecisionRoutes(app,(_req,_res,next)=>next(),{getPrecisionContext:async()=>contextSchema.parse({safetyReviewed}),getPrecisionRecords:async()=>scenario==='pending'?pending:[],getUser:async()=>({age:35,dietaryPreferences:defaultPreferences}),getUserSamples:async owner=>{assert.equal(owner,'synthetic-biology-landing');if(failed)throw Error('PRIVATE_INVENTORY_DRIVER');return scenario==='qualitative'?[{id:'report_'+'a'.repeat(64),userId:owner,processingStatus:'completed',testDate:new Date('2026-09-01'),structuredData:native}]:[];},getMeals:async()=>[],getMetabolites:async()=>[]});
const api=app.listen(0,'127.0.0.1');await new Promise(resolve=>api.once('listening',resolve));const apiBase=`http://127.0.0.1:${api.address().port}`;
const vite=await createServer({server:{host:'127.0.0.1',port:5274,strictPort:true}});await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(15000);const writes=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(req.method()!=='GET')writes.push(path);
 if(path==='/api/precision'){const response=await fetch(apiBase+path);return route.fulfill({status:response.status,contentType:'application/json',body:await response.text()});}
 return route.fulfill({json:path==='/api/auth/me'?{user:{id:'synthetic-biology-landing',username:'Synthetic landing review'}}:path==='/api/experience/settings'?{mode,onboarding:{status:'complete'}}:path==='/api/preferences'?defaultPreferences:[]});});
const dir=new URL('../../docs/review/biology-landing-20261106/',import.meta.url);if(capture)await mkdir(dir,{recursive:true});
const go=async()=>{await page.goto('http://127.0.0.1:5274/precision');await page.getByRole('region',{name:'Your health information',exact:true}).waitFor();};
try{
 await go();
 for(const[width,dark]of[[320,false],[390,false],[390,true]]){await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:dark?'dark':'light'});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);await page.evaluate(()=>window.scrollTo(0,0));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(capture)await page.screenshot({path:new URL(`${before?'before':'after'}-${width}-${dark?'dark':'light'}.png`,dir).pathname});}
 if(!before){
  const region=page.getByRole('region',{name:'Your health information',exact:true});
  safetyReviewed=false;await go();const goalDetails=page.locator('.biology-context');assert.equal(await goalDetails.getAttribute('open'),null);await goalDetails.locator('summary').focus();await page.keyboard.press('Enter');await page.getByText('Health context has not been reviewed. Personal guidance may be unavailable.',{exact:true}).waitFor();const goals=page.locator('input[name="goals"]');await goals.fill('Synthetic unsaved biology goal');await goalDetails.locator('summary').click();await goalDetails.locator('summary').click();assert.equal(await goals.inputValue(),'Synthetic unsaved biology goal');
  const tools=page.getByText('Explore biology tools',{exact:true});assert.ok((await tools.boundingBox()).y>(await region.boundingBox()).y);await tools.focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:'Overview',exact:true}).waitFor();await tools.click();assert.equal(await page.getByRole('link',{name:'Manage reports',exact:true}).getAttribute('href'),'/biology/reports');safetyReviewed=true;await go();

  assert.deepEqual(await region.locator('.biology-home-source strong').allTextContents(),['Bloodwork','Gut reports','Genetics','Measurements']);
  assert.equal(await page.getByRole('button',{name:'View bloodwork',exact:true}).count(),0);await region.getByRole('link',{name:/Gut reports/}).getByText('1 saved report',{exact:true}).waitFor();
  const actual=await(await fetch(apiBase+'/api/precision')).json();assert.equal(actual.microbiome.report,null);assert.deepEqual(actual.availableReports,[]);assert.equal(actual.gutReportInventory.saved,1);
  assert.equal(await region.getByRole('link',{name:/Gut reports/}).getAttribute('href'),'/microbiome');
  await region.getByRole('button',{name:/^Bloodwork/}).click();await page.getByRole('heading',{name:'Add lab results',exact:true}).waitFor();assert.equal(await page.locator('#add-labs-title').evaluate(el=>el===document.activeElement),true);
  await go();await region.getByRole('button',{name:/^Genetics/}).click();await page.getByRole('region',{name:'Your genetics',exact:true}).waitFor();
  await go();await region.getByRole('button',{name:/^Measurements/}).click();await page.getByRole('heading',{name:'Record your response',exact:true}).waitFor();
  scenario='empty';await go();await region.getByRole('link',{name:/Gut reports/}).getByText('Add your first report',{exact:true}).waitFor();
  scenario='pending';await go();await region.getByRole('button',{name:/^Bloodwork/}).getByText(/source unit.*review/).waitFor();await region.getByRole('button',{name:/^Bloodwork/}).focus();await page.keyboard.press('Enter');await page.getByText(/Confirm source unit/).first().waitFor();
  scenario='qualitative';await go();await region.getByRole('button',{name:/^Bloodwork/}).focus();await page.keyboard.press('Tab');assert.match(await page.evaluate(()=>document.activeElement?.textContent),/Gut reports/);
  await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  mode='athlete';await page.reload();await region.getByRole('link',{name:/Gut reports/}).getByText('1 saved report',{exact:true}).waitFor();assert.deepEqual(await region.locator('.biology-home-source strong').allTextContents(),['Bloodwork','Gut reports','Genetics','Measurements']);
  failed=true;await page.reload();await page.getByRole('heading',{name:'Biology inputs could not be checked',exact:true}).waitFor();assert.equal(await region.count(),0);assert.equal(await page.getByRole('link',{name:'Manage reports',exact:true}).getAttribute('href'),'/biology/reports','report recovery stays available without current biology inputs');assert.equal((await page.locator('body').innerText()).includes('PRIVATE_INVENTORY_DRIVER'),false);
  assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
  if(capture)await writeFile(new URL('results.json',dir),JSON.stringify({synthetic:true,checks:['actual App→precision HTTP qualitative-only inventory','four ordered destinations without forced hero','quantitative report/selector stay null/empty','empty/pending-units/unavailable states','existing lab drilldown focus/genetics/measurements','keyboard/320390lightdark/200% desktop zoom and Athlete source parity','no writes or hidden source error details'],physicalVoiceOver:'NOT_RUN',independentDesign:'NOT_GRANTED'},null,2)+'\n');
 }
 console.log(before?'Captured6a4fca6 Biology landing baseline with saved qualitative source.':'PASS actual App/HTTP Biology landing: four destinations, qualitative source saved state without quantitative inference, existing drilldown/navigation, empty/pending/failed source, focus/keyboard/reflow/zoom and no writes.');
}finally{await browser.close();await vite.close();api.closeAllConnections();await new Promise(resolve=>api.close(()=>resolve()));}
