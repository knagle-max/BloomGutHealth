import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

import {mkdir,writeFile} from 'node:fs/promises';

import {createServer} from 'vite';
import {buildPrecisionReport,contextSchema,labSchema,sourceOnlyLabSchema,markerDefinitions} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {labCategories,labExplorerEntries} from '../../shared/lab-explorer.ts';
import {experienceSettingsSchema} from '../../shared/experience.ts';
import {setAppTheme} from './set-app-theme.mjs';

const out='/tmp/bloom-panel-review';await mkdir(out,{recursive:true});
const health=contextSchema.parse({});
const dated=(marker,value,time=1)=>({id:`panel-${marker}-${time}`,kind:'lab',payload:labSchema.parse({marker,value,unit:marker==='apob'?'g/L':marker==='hba1c'?'%':['ldl','triglycerides','glucose'].includes(marker)?'mmol/L':'U/L',measuredAt:`2026-${time?'10':'09'}-01T12:00:00Z`,laboratory:'Synthetic panel laboratory',method:'Synthetic panel assay',fasting:'yes',referenceLow:null,referenceHigh:marker==='apob'?1.2:marker==='ldl'?3:marker==='triglycerides'?2:40,sourceReport:{importId:`00000000-0000-4000-8000-00000000000${time+1}`}})});
let records=[dated('triglycerides',3,0),dated('triglycerides',1),dated('ldl',2,0),dated('ldl',4),dated('apob',1,0),dated('apob',1.5),dated('alt',80),dated('ast',0),{...dated('hba1c',6.2),payload:labSchema.parse({...dated('hba1c',6.2).payload,unit:'%',referenceLow:4.5,referenceHigh:5.9})},{...dated('glucose',5),payload:labSchema.parse({...dated('glucose',5).payload,unit:'mmol/L',referenceLow:3.3,referenceHigh:5.5})}];
for(const marker of markerDefinitions.filter(m=>!records.some(r=>r.payload.marker===m.id)).slice(0,24))records.push({id:'panel-'+marker.id,kind:'lab',payload:labSchema.parse({marker:marker.id,value:1,unit:marker.units[0],measuredAt:'2026-10-01T12:00:00Z',laboratory:'Synthetic panel laboratory',method:'unknown',fasting:'unknown',referenceLow:null,referenceHigh:null})});
assert.equal(records.length,34);
let actor='atlas-owner-a',mode='everyday',available=true;const current=()=>({...buildPrecisionReport(actor==='atlas-owner-a'?records:[],health,defaultPreferences,null),records:actor==='atlas-owner-a'?records:[],availableReports:[],journalSymptoms:[],intake:{days:28,mealsLogged:0,nutrients:[]}});
const vite=await createServer({server:{host:'127.0.0.1',port:5299,strictPort:true}});await vite.listen();
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000},timezoneId:'UTC'});page.setDefaultTimeout(12000);
const errors=[],writes=[],evidence=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),p=new URL(req.url()).pathname;let json=[];
 if(!['GET','HEAD','OPTIONS'].includes(req.method())){writes.push(p);return route.fulfill({status:403,json:{error:'Read-only synthetic atlas fixture'}});}
 if(p==='/api/auth/me')json={user:{id:actor,username:'Synthetic atlas review'}};
 else if(p==='/api/experience/settings')json=experienceSettingsSchema.parse({mode,onboarding:{status:'complete'}});
 else if(p==='/api/precision'){if(!available)return route.fulfill({status:503,json:{error:'Synthetic source unavailable'}});json=current();}else if(p==='/api/precision/context')json=health;
 else if(p==='/api/preferences')json=defaultPreferences;
 else if(p==='/api/profile')json={heightCm:null,weightKg:null};
 else if(p==='/api/health-sources')json={connections:[]};
 else if(p==='/api/health-sources/observations')json={observations:[],returned:0,total:0,hasMore:false};
 else if(p==='/api/experience/review')json={entries:0,metrics:[],from:'2026-10-01',to:'2026-10-06',next:'No check-ins',note:'Synthetic atlas fixture'};
 await route.fulfill({json});
});
try{
 for(const modeValue of ['everyday','athlete'])for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
  mode=modeValue;await page.setViewportSize({width:390,height:1000});await page.goto('http://127.0.0.1:5299/precision?tab=labs');await setAppTheme(page,theme);await page.setViewportSize({width,height:1000});
  const review=page.getByRole('region',{name:'Your panel, together',exact:true});await review.waitFor();await review.getByText('34 recorded results across 31 markers or source labels reviewed.',{exact:true}).waitFor();
  await review.getByText(/Triglycerides decreased while LDL cholesterol and ApoB increased/).waitFor();
  const glycemic=review.locator('.lab-panel-review-family').filter({has:page.locator('summary').filter({hasText:'Glucose & HbA1c'})});await glycemic.locator('summary').first().click();await glycemic.getByRole('heading',{name:'Why these results can differ',exact:true}).waitFor();await glycemic.getByText(/This glucose result does not cancel/).waitFor();assert.equal(await glycemic.getByRole('link',{name:'Review original HbA1c result',exact:true}).getAttribute('href'),'/precision?tab=labs&labResult=panel-hba1c-1');
  const liver=review.locator('.lab-panel-review-family').filter({has:page.locator('summary').filter({hasText:'Liver markers together'})});await liver.locator('summary').first().click();
  await liver.getByText(/latest observation is outside the upper/).waitFor();
  await review.getByText('How each marker was reviewed',{exact:true}).click();assert.equal(await review.locator('details').last().locator('.lab-panel-review-observation').count(),31);
  for(const zoom of ['100%','200%']){await page.evaluate(value=>document.documentElement.style.fontSize=value,zoom);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${mode}/${width}/${theme}/${zoom}`);}
  await page.evaluate(()=>document.documentElement.style.fontSize='');evidence.push({mode,width,theme,zoom200:true});
 }
 const review=page.getByRole('region',{name:'Your panel, together',exact:true});
 const original=structuredClone(records);for(const patch of [{fasting:'unknown'},{referenceLow:null},{value:8}]){records=original.map(row=>row.payload.marker==='glucose'?{...row,payload:{...row.payload,...patch}}:row);await page.reload();await review.waitFor();assert.equal(await review.getByRole('heading',{name:'Why these results can differ',exact:true}).count(),0);}records=original;await page.reload();await review.waitFor();await review.locator('.lab-panel-review-family').filter({has:page.locator('summary').filter({hasText:'Liver markers together'})}).locator('summary').first().click();
 const alt=review.getByRole('button',{name:'Explore ALT & original records',exact:true}).first();await alt.focus();await page.keyboard.press('Enter');await page.getByRole('region',{name:'ALT recorded detail',exact:true}).waitFor();assert.equal(new URL(page.url()).searchParams.get('marker'),'alt');
 // The same mounted route recomputes from refreshed source data, without a second ledger.
 records=records.filter(r=>!['ldl','apob','alt'].includes(r.payload.marker));await page.reload();await review.waitFor();assert.equal(await review.locator('.lab-panel-review-tradeoff').count(),0);assert.equal(await review.getByText(/Liver markers together/).count(),0);
 actor='atlas-owner-b';await page.reload();await page.getByText('Add laboratory results to browse your recorded markers. Missing measurements are not treated as zero.',{exact:true}).waitFor();assert.equal(await page.getByRole('region',{name:'Your panel, together',exact:true}).count(),0);
 actor='atlas-owner-a';available=false;await page.reload();await page.getByRole('heading',{name:'Bloodwork',exact:true}).waitFor();assert.equal(await page.getByRole('region',{name:'Your panel, together',exact:true}).count(),0);
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);await writeFile(`${out}/evidence.json`,JSON.stringify({states:evidence,originalRows:34,markers:31,sourceRemoval:true,ownerWithdrawal:true,sourceUnavailable:true,writes,errors},null,2));console.log('PASS panel review:34 rows/31 markers, non-TG family cues, aligned lipid discordance, canonical drilldown,16 responsive states/200% zoom, source removal, owner/source withdrawal and no writes.');
}finally{await browser.close();await vite.close();}
