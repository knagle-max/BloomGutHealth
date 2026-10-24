import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {buildPrecisionReport,contextSchema,labSchema} from '../../shared/precision-nutrition.ts';
import {defaultPreferences} from '../../shared/meal-intelligence.ts';
import {experienceSettingsSchema} from '../../shared/experience.ts';
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const vite=await createServer({server:{port:5201,host:'127.0.0.1',strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox','--single-process','--no-zygote']});
const page=await browser.newPage({viewport:{width:375,height:900},timezoneId:'America/Regina'});page.setDefaultTimeout(12000);
const errors=[],writes=[];let scenario='duplicate';
const lab=labSchema.parse({marker:'glucose',value:0,unit:'mg/dL',measuredAt:'2026-09-30T23:30:00Z',laboratory:'Synthetic source lab',method:'Synthetic assay',fasting:'yes',referenceLow:0,referenceHigh:100});
function fixture(){const records=scenario==='empty'?[]:[{id:'source-zero',kind:'lab',createdAt:lab.measuredAt,payload:lab},...(scenario==='single'?[]:[{id:'source-offset',kind:'lab',createdAt:lab.measuredAt,payload:{...lab,value:100,measuredAt:scenario==='compatible'?'2026-10-02T01:30:00+02:00':'2026-10-01T01:30:00+02:00',referenceLow:null,referenceHigh:null}}])];return {...buildPrecisionReport(records,contextSchema.parse({}),defaultPreferences,null,Date.parse('2026-10-24T12:00:00Z')),records,availableReports:[],intake:{days:28,mealsLogged:0,nutrients:[]}};}
page.on('pageerror',error=>errors.push(error.message));
await page.route('https://fonts.**/**',route=>route.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),pathname=new URL(req.url()).pathname;
 if(req.method()!=='GET'){writes.push(pathname);return route.fulfill({status:403,json:{error:'No writes in this synthetic observation journey'}});}
 let json=[];
 if(pathname==='/api/auth/me')json={user:{id:'synthetic-lab-reviewer',username:'Synthetic reviewer'}};
 else if(pathname==='/api/precision')json=fixture();
 else if(pathname==='/api/experience/settings')json=experienceSettingsSchema.parse({});
 else if(pathname==='/api/profile')json={heightCm:null,weightKg:null};
 else if(pathname==='/api/health-sources')json={connections:[]};
 else if(pathname==='/api/health-sources/observations')json={observations:[],returned:0,total:0,hasMore:false};
 else if(pathname==='/api/experience/review')json={entries:0,metrics:[],from:'2026-10-01',to:'2026-10-24',next:'Record a check-in',note:'Synthetic'};
 else if(pathname==='/api/capabilities')json={eligible:false,experimentalEnabled:false};
 await route.fulfill({json});
});
const go=async()=>{await page.goto('http://127.0.0.1:5201/progress');await page.getByRole('heading',{name:'Bloodwork over time',exact:true}).waitFor();};
try{
 await go();const card=page.locator('.evidence-insight').filter({has:page.getByRole('heading',{name:'Glucose',exact:true})});
 await card.getByText('Not enough comparable data for a change.',{exact:true}).waitFor();
 assert.equal(await card.locator('polyline').count(),0);
 await card.getByText('Sources, method & recorded values',{exact:true}).click();
 const region=card.getByRole('region',{name:'Glucose recorded source details'});
 await region.getByRole('table').waitFor();
 assert.equal(await region.getByRole('row').count(),3);
 await region.getByText('2026-10-01T01:30:00+02:00',{exact:true}).waitFor();
 await region.getByText('0–100 mg/dL',{exact:true}).waitFor();
 await region.getByText('Converted: 0 mmol/L',{exact:true}).waitFor();
 await region.getByRole('cell',{name:'Not supplied',exact:true}).waitFor();
 assert.equal(await region.locator('time').first().getAttribute('datetime'),lab.measuredAt);
 await region.focus();assert.equal(await region.evaluate(node=>node===document.activeElement),true);
 for(const width of [320,375,390,1280]){await page.setViewportSize({width,height:width===320?500:900});for(const dark of [false,true]){await page.evaluate(value=>document.documentElement.classList.toggle('dark',value),dark);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Page reflow ${width}/${dark}`);}}
 scenario='compatible';await go();await card.getByText(/^Observed change:/).waitFor();assert.equal(await card.locator('polyline').count(),1);
 scenario='single';await go();await card.getByText('Not enough comparable data for a change.',{exact:true}).waitFor();assert.equal(await card.locator('circle').count(),1);assert.equal(await card.locator('polyline').count(),0);
 scenario='empty';await go();await page.getByText('No dated laboratory results yet.',{exact:false}).waitFor();assert.equal(await page.locator('.lab-chart').count(),0);
 assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 console.log('PASS: real rendered synthetic lab history keeps original offset/zero/unit/reference/fasting, withholds same-instant change, permits distinct dates, single/empty states and keyboard/mobile reflow; no writes or real clinical review');
}finally{await browser.close();await vite.close();}
