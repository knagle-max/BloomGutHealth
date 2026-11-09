import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'vite';
import {experienceSettingsSchema} from '../../shared/experience.ts';
import {setAppTheme} from './set-app-theme.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');
const vite=await createServer({server:{host:'127.0.0.1',port:5219,strictPort:true}});await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:950}});page.setDefaultTimeout(12000);
const errors=[],writes=[];let owner='research-owner';
const samples=[{id:'research-a',testDate:'2026-11-06T12:00:00Z',processingStatus:'completed',testingCompany:'Synthetic research report',structuredData:{dataOrigin:'Synthetic fixture — not personal data'}},{id:'research-b',testDate:'2026-11-05T12:00:00Z',processingStatus:'completed',testingCompany:'Synthetic source without research'}];
const result=id=>({sample:samples.find(s=>s.id===id),analyses:[],bacterial_composition:(id==='research-a'?['Ruminococcus bromii','Other source organism','Ruminococcus bromii strain X','Veillonella atypica','Odoribacteraceae']:['Other source organism']).map((bacterialName,i)=>({id:id+'-'+i,bacterialName,abundance:i===0?0:null,taxonomyLevel:null}))});
page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{
 const req=route.request(),p=new URL(req.url()).pathname;if(req.method()!=='GET')writes.push(p);
 const json=p==='/api/auth/me'?{user:{id:owner,username:'Synthetic'}}:p==='/api/experience/settings'?experienceSettingsSchema.parse({}):p.startsWith('/api/microbiome/samples')?samples:p.startsWith('/api/microbiome/results')?result(p.endsWith('research-b')?'research-b':'research-a'):[];
 await route.fulfill({json});
});
try{
 await page.goto('http://127.0.0.1:5219/microbiome');await page.getByRole('button',{name:'Bacteria',exact:true}).click();
 assert.equal(await page.locator('.microbial-composition-row').count(),5);
 await page.getByText('Explore functions',{exact:true}).click();
 const group=page.getByRole('button',{name:'Resistant-starch research · 1 listed observation',exact:true});
 await group.focus();await page.keyboard.press('Enter');
 assert.equal(await group.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.microbial-composition-row').count(),1);
 await page.getByLabel('Find an organism',{exact:true}).fill('no match');await page.getByText('0 of 5 source observations shown',{exact:false}).waitFor();
 await page.getByRole('button',{name:'Clear search',exact:true}).click();
 const trigger=page.getByRole('button',{name:'Ruminococcus bromii, 0%',exact:false});await trigger.click();
 const sheet=page.getByRole('dialog');await sheet.getByText(/Researchers have studied this bacterium/).waitFor();
 await sheet.getByText('What research has studied',{exact:true}).click();await sheet.getByText(/Study setting: Human-derived bacterial cultures/).waitFor();
 await sheet.getByText('Nutrients & molecules',{exact:true}).click();await sheet.getByText(/Studied substrate: Resistant starch/).waitFor();
 await sheet.getByText('Sources & limitations',{exact:true}).click();
 assert.equal(await sheet.getByRole('link',{name:/Ruminococcus bromii is a keystone/}).getAttribute('href'),'https://www.nature.com/articles/ismej20124');
 await sheet.getByText('Your report',{exact:true}).click();await sheet.getByText('0%',{exact:true}).waitFor();
 for(const width of [320,390])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:950});
   // Theme uses the real app control before re-opening the focus-trapped sheet.
   await page.keyboard.press('Escape');await sheet.waitFor({state:'hidden'});await page.waitForFunction(()=>!history.state?.bloomMicrobialProfile);
   await setAppTheme(page,theme);await trigger.click();await sheet.waitFor();
   assert.equal(await sheet.evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
 }
 await page.keyboard.press('Escape');await sheet.waitFor({state:'hidden'});await page.waitForFunction(()=>!history.state?.bloomMicrobialProfile);
 await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')?.startsWith('Ruminococcus bromii, 0%'));
 assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
 await trigger.click();await page.goBack();await sheet.waitFor({state:'hidden'});
 await page.getByRole('button',{name:'See all organisms',exact:true}).click();assert.equal(await page.locator('.microbial-composition-row').count(),5);
 for(const [groupName,organism,measurement,sourceHref]of[
  ['Lactate research','Veillonella atypica','This record does not measure lactate consumption, propionate production or exercise performance effects in you.','https://pubmed.ncbi.nlm.nih.gov/31235964/'],
  ['Bile-acid research','Odoribacteraceae','This record does not identify the studied isolates, their genes, or bile-acid production, consumption or host concentrations in you.','https://pubmed.ncbi.nlm.nih.gov/34325466/']]){
  await page.getByRole('button',{name:groupName+' · 1 listed observation',exact:true}).click();assert.equal(await page.locator('.microbial-composition-row').count(),1);
  await page.getByRole('button',{name:organism+',',exact:false}).click();await sheet.getByText('Nutrients & molecules',{exact:true}).click();await sheet.getByText(measurement+' No producer–consumer interaction is inferred from the organisms listed together.',{exact:true}).waitFor();
  if(organism==='Odoribacteraceae')await sheet.getByText(/family name in your report does not identify those isolates/).waitFor();
  await sheet.getByText('Sources & limitations',{exact:true}).click();assert.equal(await sheet.locator('a').getAttribute('href'),sourceHref);
  await page.keyboard.press('Escape');await sheet.waitFor({state:'hidden'});await page.waitForFunction(()=>!history.state?.bloomMicrobialProfile);
  await page.getByRole('button',{name:'See all organisms',exact:true}).click();assert.equal(await page.locator('.microbial-composition-row').count(),5);
 }
 await page.getByLabel('Select report').selectOption('research-b');await page.getByText('1 of 1 source observations shown',{exact:false}).waitFor();
 assert.equal(await page.getByText('Explore functions',{exact:true}).count(),0);
 await page.getByLabel('Select report').selectOption('research-a');await page.getByText('5 of 5 source observations shown',{exact:false}).waitFor();
 await page.getByRole('button',{name:'Ruminococcus bromii strain X,',exact:false}).click();await sheet.getByText('The label “Ruminococcus bromii strain X” needs a resolved taxonomic identity before Bloom can describe its biology.',{exact:true}).waitFor();assert.equal(await sheet.getByText('Reviewed research profile not yet available.',{exact:false}).count(),0);
 await page.keyboard.press('Escape');await sheet.waitFor({state:'hidden'});await page.waitForFunction(()=>!history.state?.bloomMicrobialProfile);
 await trigger.click();
 await page.evaluate(async()=>{const {queryClient}=await import('/src/lib/queryClient.ts');queryClient.setQueryData(['/api/microbiome/results','research-a'],{sample:{id:'research-a'},bacterial_composition:[],analyses:[]});});
 await sheet.waitFor({state:'hidden'});assert.equal(await page.getByText('Explore functions',{exact:true}).count(),0);
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 console.log('PASS: actual Gut reports research filter, dynamic listed count/zero/search/all, cited profile/source detail, strain abstention, report switching/source withdrawal, Back/Escape/focus,320/390 light/dark, no writes. Synthetic reports; no personal activity or device acceptance inferred.');
}catch(error){console.error({errors,body:(await page.locator('body').innerText()).slice(0,3500)});throw error;}finally{await browser.close();await vite.close();}
