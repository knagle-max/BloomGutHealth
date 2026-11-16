import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'vite';
import {buildPrecisionReport,contextSchema,labSchema,sourceOnlyLabSchema,markerDefinitions} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {labCategories,labExplorerEntries} from '../../shared/lab-explorer.ts';
import {experienceSettingsSchema} from '../../shared/experience.ts';
import {setAppTheme} from './set-app-theme.mjs';

const baseline=process.env.BLOOM_ATLAS_BASELINE,out=process.env.BLOOM_ATLAS_REVIEW||'/tmp/bloom-bloodwork-atlas-after';await mkdir(out,{recursive:true});
const health=contextSchema.parse({}),records=markerDefinitions.map((marker,index)=>({id:`atlas-${marker.id}`,kind:'lab',createdAt:'2026-10-01T12:00:00Z',payload:labSchema.parse({marker:marker.id,value:index===0?0:1,unit:marker.units[0],measuredAt:'2026-10-01T12:00:00Z',laboratory:'Synthetic atlas laboratory',method:'Synthetic assay',fasting:'unknown',referenceLow:null,referenceHigh:null,sourceInput:{text:`Synthetic original ${marker.name}`,number:index===0?'0':'1',suppliedUnit:marker.units[0],capture:'manual-report',reportedSection:'Synthetic original section'}})}));
records.push({id:'atlas-source-only',kind:'lab',createdAt:'2026-10-01T12:00:00Z',payload:sourceOnlyLabSchema.parse({sourceOnly:true,reportedAnalyte:'Synthetic unmapped source label',reportedValue:'trace',reportedUnit:null,measuredAt:'2026-10-01T12:00:00Z',laboratory:'Synthetic atlas laboratory',method:'unknown',fasting:'unknown',sourceInput:{text:'Synthetic unmapped source label: trace',number:'trace',suppliedUnit:null,capture:'manual-report'}})});
let actor='atlas-owner-a',mode='everyday';const current=()=>({...buildPrecisionReport(actor==='atlas-owner-a'?records:[],health,defaultPreferences,null),records:actor==='atlas-owner-a'?records:[],availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[]}});
const historical=baseline?new Map(['client/src/pages/PrecisionNutrition.tsx','client/src/components/EditorialMedia.tsx','client/src/content/editorial-media.ts'].map(file=>[path.resolve(file),execFileSync('git',['show',`${baseline}:${file}`],{encoding:'utf8'})])):new Map();
const vite=await createServer({plugins:baseline?[{name:'controlled-atlas-source-baseline',enforce:'pre',load(id){return historical.get(id.split('?')[0]);}}]:[],server:{host:'127.0.0.1',port:5286,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000},timezoneId:'UTC'});page.setDefaultTimeout(12000);
const errors=[],writes=[],evidence=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),p=new URL(req.url()).pathname;let json=[];
 if(!['GET','HEAD','OPTIONS'].includes(req.method())){writes.push(p);return route.fulfill({status:403,json:{error:'Read-only synthetic atlas fixture'}});}
 if(p==='/api/auth/me')json={user:{id:actor,username:'Synthetic atlas review'}};
 else if(p==='/api/experience/settings')json=experienceSettingsSchema.parse({mode,onboarding:{status:'complete'}});
 else if(p==='/api/precision')json=current();else if(p==='/api/precision/context')json=health;
 else if(p==='/api/preferences')json=defaultPreferences;
 else if(p==='/api/profile')json={heightCm:null,weightKg:null};
 else if(p==='/api/health-sources')json={connections:[]};
 else if(p==='/api/health-sources/observations')json={observations:[],returned:0,total:0,hasMore:false};
 else if(p==='/api/experience/review')json={entries:0,metrics:[],from:'2026-10-01',to:'2026-10-06',next:'No check-ins',note:'Synthetic atlas fixture'};
 await route.fulfill({json});
});
try{
 for(mode of ['everyday','athlete']){
  await page.goto('http://127.0.0.1:5286/precision?tab=labs');await page.getByRole('heading',{name:'Browse your bloodwork',exact:true}).waitFor();
  assert.equal(await page.locator('.bloodwork-atlas').count(),baseline?0:1,'Requested source version rendered');
  const original=page.locator('#bloodwork-source-overview');assert.equal(await original.locator('.bv-marker-trigger').count(),records.length);
  await writeFile(`${out}/source-${mode}.txt`,await original.innerText());
  if(!baseline){const nav=page.getByRole('navigation',{name:'Bloodwork systems',exact:true}),entries=labExplorerEntries(current());
   assert.equal(await nav.getByRole('link').count(),labCategories.filter(c=>entries.some(e=>e.categories.includes(c.id))).length);
   const ids=await page.locator('.bloodwork-atlas [data-bloom-asset-id]').evaluateAll(nodes=>Array.from(new Set(nodes.map(node=>node.dataset.bloomAssetId))).sort());assert.deepEqual(ids,['BVA-0009','BVA-0010','BVA-0011','BVA-0012','BVA-0013','BVA-0014','BVA-0029','BVA-0030','BVA-0031']);assert.equal(await page.locator('.bloodwork-atlas img').count(),0,'Unavailable originals reserve slots without broken or substituted images');assert.ok(await page.locator('.bloodwork-atlas figure').evaluateAll(nodes=>nodes.every(node=>node.getAttribute('aria-hidden')==='true')),'Decorative reserved frames do not add empty screen-reader figures');
  }
  for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:1000});await setAppTheme(page,theme);
   if(!baseline){const add=page.getByRole('link',{name:'Add lab results',exact:true});await add.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.ok(await add.evaluate(el=>el===document.activeElement&&getComputedStyle(el).outlineStyle!=='none'),'Visible primary-action focus');const ratio=await add.evaluate(el=>{const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number),lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0),style=getComputedStyle(el),a=lum(rgb(style.color)),b=lum(rgb(style.backgroundColor));return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);});assert.ok(ratio>=4.5,'Primary-action contrast '+ratio);}
   for(const textSize of ['100%','200%']){await page.evaluate(value=>document.documentElement.style.fontSize=value,textSize);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${mode}/${width}/${theme}/${textSize}`);}
   await page.evaluate(()=>document.documentElement.style.fontSize='');await page.evaluate(()=>scrollTo(0,0));
   if(!baseline){const frame=await page.locator('.bloodwork-atlas-hero').evaluate(el=>({left:el.getBoundingClientRect().left,scrollLeft:el.scrollLeft,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,titleLeft:el.querySelector('h1').getBoundingClientRect().left}));assert.equal(frame.scrollLeft,0,JSON.stringify({mode,width,theme,frame}));assert.ok(frame.titleLeft>=frame.left,JSON.stringify(frame));}
   if(width===320||width===390)await page.screenshot({path:`${out}/atlas-${mode}-${width}-${theme}.png`,animations:'disabled'});evidence.push({mode,width,theme,text200:true});
  }
 }
 if(!baseline){
  mode='everyday';await page.goto('http://127.0.0.1:5286/precision?tab=labs');await page.getByRole('navigation',{name:'Bloodwork systems',exact:true}).waitFor();
  for(const category of labCategories){const link=page.locator('.bloodwork-system-link').filter({has:page.getByText(category.name,{exact:true})});if(!await link.count())continue;await link.focus();await page.keyboard.press('Enter');await page.waitForURL(url=>url.pathname==='/progress'&&url.searchParams.get('group')===category.id);await page.locator('.lab-explorer-category[open]').locator('summary').filter({hasText:category.name}).waitFor();assert.ok(await page.locator('.lab-explorer-category[open] [data-marker-toggle]').count()>0);await page.goBack();await page.getByRole('navigation',{name:'Bloodwork systems',exact:true}).waitFor();}
  const source=page.locator('#bloodwork-source-overview .bv-marker-trigger').filter({hasText:markerDefinitions[0].name}).first();await source.click();await page.locator(`#lab-source-row-atlas-${markerDefinitions[0].id}`).waitFor();assert.match(await page.locator(`#lab-source-row-atlas-${markerDefinitions[0].id}`).innerText(),/^.*0 /s);await page.getByRole('button',{name:'Back to results',exact:true}).click();assert.equal(await source.evaluate(el=>el===document.activeElement),true);
  await page.getByRole('link',{name:'Add lab results',exact:true}).click();await page.waitForFunction(()=>document.activeElement?.id==='add-labs-title');
  actor='atlas-owner-b';await page.reload();await page.getByText('Add laboratory results to browse your recorded markers. Missing measurements are not treated as zero.',{exact:true}).waitFor();assert.equal(await page.getByRole('navigation',{name:'Bloodwork systems',exact:true}).count(),0);assert.equal(await page.getByText('Synthetic unmapped source label',{exact:true}).count(),0);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);await writeFile(`${out}/evidence.json`,JSON.stringify({baseline:baseline||null,states:evidence,originalRows:records.length,writes,errors},null,2));console.log(baseline?'PASS controlled baseline:50 original source rows and16 mode/theme/width states plus200% text captured.':'PASS atlas: original source rows/zero/unknown unchanged,16 mode/theme/width states plus200% text,9 reserved art IDs,all existing system drill-ins,original source detail/focus,Add action and second-owner withdrawal; read-only synthetic API.');
}finally{await browser.close();await vite.close();}
