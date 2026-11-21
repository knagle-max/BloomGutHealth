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
const webBase=process.env.BLOOM_BIOLOGY_BASE_URL||'http://127.0.0.1:5274';assert.ok(['http://127.0.0.1:5274','https://bloomguthealth.onrender.com'].includes(webBase));
const vite=webBase==='http://127.0.0.1:5274'?await createServer({server:{host:'127.0.0.1',port:5274,strictPort:true}}):null;if(vite)await vite.listen();
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:1000}});page.setDefaultTimeout(15000);const writes=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;if(req.method()!=='GET')writes.push(path);
 if(path==='/api/precision'){const response=await fetch(apiBase+path);return route.fulfill({status:response.status,contentType:'application/json',body:await response.text()});}
 return route.fulfill({json:path==='/api/auth/me'?{user:{id:'synthetic-biology-landing',username:'Synthetic landing review'}}:path==='/api/experience/settings'?{mode,onboarding:{status:'complete'}}:path==='/api/preferences'?defaultPreferences:[]});});
const dir=new URL(process.env.BLOOM_BIOLOGY_REVIEW||'../../docs/review/biology-landing-20261106/',import.meta.url);if(capture)await mkdir(dir,{recursive:true});
const go=async()=>{await page.goto(webBase+'/precision');await page.getByRole('region',{name:'Your health information',exact:true}).waitFor();};
const bannerEvidence=[];
async function verifyBanner(row){
 const result=await row.evaluate(async element=>{
  const image=element.querySelector('img');await image.decode();const raw=new Image();raw.src=image.currentSrc;await raw.decode();
  const box=image.getBoundingClientRect(),canvas=document.createElement('canvas');canvas.width=Math.ceil(box.width);canvas.height=Math.ceil(box.height);const context=canvas.getContext('2d');
  const style=getComputedStyle(image),position=style.objectPosition.split(' ').map(value=>parseFloat(value)/100);
  const scale=Math.max(box.width/raw.naturalWidth,box.height/raw.naturalHeight),width=raw.naturalWidth*scale,height=raw.naturalHeight*scale;
  context.fillStyle=getComputedStyle(element).backgroundColor;context.fillRect(0,0,box.width,box.height);context.globalAlpha=Number(style.opacity)*Number(getComputedStyle(image.parentElement).opacity);context.filter=style.filter;
  context.drawImage(raw,-(width-box.width)*position[0],-(height-box.height)*position[1],width,height);context.globalAlpha=1;context.filter='none';
  const gradient=context.createLinearGradient(0,0,box.width,0),css=getComputedStyle(element,'::before').backgroundImage;
  if(!css.startsWith('linear-gradient(90deg,'))throw Error('Unsupported banner contrast overlay; inspect the actual rendered background');
  const parts=[];let depth=0,start=0;const body=css.slice(css.indexOf('(')+1,-1);
  for(let i=0;i<body.length;i++){if(body[i]==='(')depth++;else if(body[i]===')')depth--;else if(body[i]===','&&depth===0){parts.push(body.slice(start,i));start=i+1;}}parts.push(body.slice(start));
  for(const part of parts.slice(1)){const stop=/^\s*(.+)\s+([\d.]+)%\s*$/.exec(part);if(!stop)throw Error('Unsupported banner contrast color stop');gradient.addColorStop(Number(stop[2])/100,stop[1]);}context.fillStyle=gradient;context.fillRect(0,0,box.width,box.height);
  const backing=element.querySelector('.biology-home-source-copy'),backingBox=backing.getBoundingClientRect();context.fillStyle=getComputedStyle(backing).backgroundColor;context.fillRect(backingBox.left-box.left,backingBox.top-box.top,backingBox.width,backingBox.height);
  const luminance=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  let contrast=Infinity;
  for(const text of element.querySelectorAll('strong,small')){
   const foreground=luminance(getComputedStyle(text).color.match(/[\d.]+/g).slice(0,3).map(Number));
   const range=document.createRange();range.selectNodeContents(text);
   for(const rect of range.getClientRects())for(const fx of [.05,.25,.5,.75,.95])for(const fy of [.3,.7]){
    const x=Math.max(0,Math.min(canvas.width-1,Math.floor(rect.left-box.left+rect.width*fx))),y=Math.max(0,Math.min(canvas.height-1,Math.floor(rect.top-box.top+rect.height*fy)));
    const back=luminance(Array.from(context.getImageData(x,y,1,1).data).slice(0,3));contrast=Math.min(contrast,(Math.max(foreground,back)+.05)/(Math.min(foreground,back)+.05));
   }
  }
  return{contrast,width:raw.naturalWidth,height:raw.naturalHeight,source:raw.src};
 });
 assert.ok([1086,2172].includes(result.width)&&result.width===3*result.height,JSON.stringify(result));
 assert.ok(result.contrast>=4.5,'Rendered image/text composite contrast '+JSON.stringify(result));
 bannerEvidence.push(result);
 return result;
}
try{
 await go();
 for(mode of ['everyday','athlete']){await go();for(const width of [320,390,768,1440])for(const dark of [false,true]){
  await page.setViewportSize({width,height:1000});await page.emulateMedia({colorScheme:dark?'dark':'light'});await page.evaluate(d=>document.documentElement.classList.toggle('dark',d),dark);
  const sources=page.locator('.biology-home-sources');
  if(!before){assert.deepEqual(await sources.locator('[data-bloom-asset-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.bloomAssetId)),['BVA-0032','BVA-0033','BVA-0034','BVA-0035']);assert.equal(await sources.locator('img').count(),4,'All four supplied banners are bound');assert.ok(await sources.locator('figure').evaluateAll(nodes=>nodes.every(node=>node.getAttribute('aria-hidden')==='true')));}
  for(const fontSize of ['100%','200%']){
   await page.evaluate(value=>document.documentElement.style.fontSize=value,fontSize);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${mode}/${width}/${dark}/${fontSize}`);
   for(const row of await sources.locator('.biology-home-source').all()){await row.focus();assert.ok(await row.evaluate(element=>getComputedStyle(element).outlineStyle!=='none'&&element===document.activeElement&&element.getBoundingClientRect().height>=44));if(!before)await verifyBanner(row);}
  }
  await page.evaluate(()=>{document.documentElement.style.fontSize='';window.scrollTo(0,0);});if(capture&&width<=390){await page.screenshot({path:new URL(`${before?'before':'after'}-${mode}-${width}-${dark?'dark':'light'}.png`,dir).pathname});if(width===390)await sources.screenshot({path:new URL(`four-banners-${mode}-${dark?'dark':'light'}.png`,dir).pathname});}
 }}
 mode='everyday';await go();
 if(!before){
  const region=page.getByRole('region',{name:'Your health information',exact:true});
  const display=await page.context().newCDPSession(page);await display.send('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:3,mobile:false});await go();
  for(const row of await region.locator('.biology-home-source').all()){await row.focus();const image=await verifyBanner(row);assert.equal(image.width,2172);assert.match(image.source,/@2x\.webp$/);}
  await display.send('Emulation.clearDeviceMetricsOverride');await display.detach();await page.setViewportSize({width:390,height:1000});await go();
  safetyReviewed=false;await go();const goalDetails=page.locator('.biology-context');assert.equal(await goalDetails.getAttribute('open'),null);await goalDetails.locator('summary').focus();await page.keyboard.press('Enter');await page.getByText('Health context has not been reviewed. Personal guidance may be unavailable.',{exact:true}).waitFor();const goals=page.locator('input[name="goals"]');await goals.fill('Synthetic unsaved biology goal');await goalDetails.locator('summary').click();await goalDetails.locator('summary').click();assert.equal(await goals.inputValue(),'Synthetic unsaved biology goal');
  const tools=page.getByText('Explore biology tools',{exact:true});assert.ok((await tools.boundingBox()).y>(await region.boundingBox()).y);await tools.focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:'Overview',exact:true}).waitFor();await tools.click();assert.equal(await page.getByRole('link',{name:'Manage reports',exact:true}).getAttribute('href'),'/biology/reports');safetyReviewed=true;await go();

  assert.deepEqual(await region.locator('.biology-home-source strong').allTextContents(),['Bloodwork','Gut reports','Genetics','Measurements']);
  assert.equal(await page.getByRole('button',{name:'View bloodwork',exact:true}).count(),0);await region.getByRole('link',{name:/Gut reports/}).getByText('1 saved report',{exact:true}).waitFor();
  const actual=await(await fetch(apiBase+'/api/precision')).json();assert.equal(actual.microbiome.report,null);assert.deepEqual(actual.availableReports,[]);assert.equal(actual.gutReportInventory.saved,1);
  assert.equal(await region.getByRole('link',{name:/Gut reports/}).getAttribute('href'),'/microbiome');
  await region.getByRole('button',{name:/^Bloodwork/}).click();await page.getByRole('heading',{name:'Add lab results',exact:true}).waitFor();await page.waitForFunction(()=>document.getElementById('bloodwork-atlas-title')===document.activeElement);
  await go();await region.getByRole('button',{name:/^Genetics/}).click();await page.getByRole('region',{name:'Your genetics',exact:true}).waitFor();
  await go();await region.getByRole('button',{name:/^Measurements/}).click();await page.getByRole('heading',{name:'Record your response',exact:true}).waitFor();
  scenario='empty';await go();await region.getByRole('link',{name:/Gut reports/}).getByText('Add your first report',{exact:true}).waitFor();
  scenario='pending';await go();await region.getByRole('button',{name:/^Bloodwork/}).getByText(/unit.*confirm/).waitFor();await region.getByRole('button',{name:/^Bloodwork/}).focus();await page.keyboard.press('Enter');await page.getByText(/Confirm source unit/).first().waitFor();
  scenario='qualitative';await go();await region.getByRole('button',{name:/^Bloodwork/}).focus();await page.keyboard.press('Tab');assert.match(await page.evaluate(()=>document.activeElement?.textContent),/Gut reports/);
  await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  mode='athlete';await page.reload();await region.getByRole('link',{name:/Gut reports/}).getByText('1 saved report',{exact:true}).waitFor();assert.deepEqual(await region.locator('.biology-home-source strong').allTextContents(),['Bloodwork','Gut reports','Genetics','Measurements']);
  await page.emulateMedia({reducedMotion:'reduce'});const frameHeights=await region.locator('.biology-home-source').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height));
  await page.route('**/images/editorial/biology/**',route=>route.abort());await page.reload();await region.waitFor();await page.waitForFunction(()=>document.querySelectorAll('.biology-home-sources [data-media-source="failed"]').length===4);
  assert.equal(await region.locator('img').count(),0);assert.deepEqual(await region.locator('.biology-home-source').evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().height)),frameHeights,'Image outage never changes source navigation geometry');
  assert.equal(await region.getByRole('link',{name:/Gut reports/}).getAttribute('href'),'/microbiome');
  await page.unroute('**/images/editorial/biology/**');await page.reload();await region.waitFor();for(const row of await region.locator('.biology-home-source').all()){await row.focus();await verifyBanner(row);}
  failed=true;await page.reload();await page.getByRole('heading',{name:'Biology inputs could not be checked',exact:true}).waitFor();assert.equal(await region.count(),0);assert.equal(await page.getByRole('link',{name:'Manage reports',exact:true}).getAttribute('href'),'/biology/reports','report recovery stays available without current biology inputs');assert.equal((await page.locator('body').innerText()).includes('PRIVATE_INVENTORY_DRIVER'),false);
  assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
  if(capture)await writeFile(new URL('results.json',dir),JSON.stringify({synthetic:true,webBase,imageVerification:{samples:bannerEvidence.length,minimumTextContrast:Math.min(...bannerEvidence.map(item=>item.contrast)),servedSources:Array.from(new Set(bannerEvidence.map(item=>item.source))),highDpi2xChecked:true,offlineGeometryAndRecovery:true},checks:['actual App→precision HTTP qualitative-only inventory','four ordered destinations without forced hero','quantitative report/selector stay null/empty','empty/pending-units/unavailable states','existing lab drilldown focus/genetics/measurements','keyboard/320390lightdark/200% desktop zoom and Athlete source parity','no writes or hidden source error details'],physicalVoiceOver:'NOT_RUN',independentDesign:'NOT_GRANTED'},null,2)+'\n');
 }
 console.log(before?'Captured6a4fca6 Biology landing baseline with saved qualitative source.':'PASS actual App/HTTP Biology landing: four destinations, qualitative source saved state without quantitative inference, existing drilldown/navigation, empty/pending/failed source, focus/keyboard/reflow/zoom and no writes.');
}finally{await browser.close();await vite?.close();api.closeAllConnections();await new Promise(resolve=>api.close(()=>resolve()));}
