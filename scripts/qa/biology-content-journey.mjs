import assert from 'node:assert/strict';
import{createRequire}from'node:module';import{readFileSync}from'node:fs';import{createServer,preview}from'vite';
import{experienceSettingsSchema}from'../../shared/experience.ts';import{organismBiography}from'../../shared/biology-content.ts';import{setAppTheme}from'./set-app-theme.mjs';
const registry=JSON.parse(readFileSync('shared/data/bloom_biology_content_coverage_r4m1_2026-11-08.json','utf8'));
const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright-core');
let owner='biology-owner',mode='everyday';const errors=[],writes=[];
const samples=[{id:'content-a',testDate:'2026-11-06T12:00:00Z',processingStatus:'completed',testingCompany:'Synthetic Biology fixture',structuredData:{dataOrigin:'Synthetic source observations for public registry names; not an actual report'}},{id:'content-b',testDate:'2026-11-05T12:00:00Z',processingStatus:'completed',testingCompany:'Separate synthetic report'}];
const taxa=registry.reportedFixtureOrganisms.map((entry,index)=>({id:'fixture-'+index,bacterialName:entry.reportedName,taxonomyLevel:null,abundance:index===0?0:null}));
taxa.push({id:'alias',bacterialName:'Eubacterium hallii',taxonomyLevel:'species',abundance:null},{id:'rank-mismatch',bacterialName:'Anaerobutyricum hallii',taxonomyLevel:'family',abundance:null},{id:'unknown',bacterialName:'Unresolved synthetic identity',taxonomyLevel:null,abundance:null},{id:'strain-context',bacterialName:'Ruminococcus gnavus ATCC 29149',taxonomyLevel:'strain',abundance:null});
const built=process.env.BLOOM_BIOLOGY_BUILT==='1';
const vite=built?await preview({preview:{host:'127.0.0.1',port:5233,strictPort:true}}):await createServer({server:{host:'127.0.0.1',port:5233,strictPort:true}});if(!built)await vite.listen();
const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:950}});page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const request=route.request(),p=new URL(request.url()).pathname;if(request.method()!=='GET')writes.push(p);const json=p==='/api/auth/me'?{user:{id:owner,username:'Synthetic Biology'}}:p==='/api/experience/settings'?experienceSettingsSchema.parse({mode,onboarding:{status:'complete'}}):p.startsWith('/api/microbiome/samples')?owner==='biology-owner'?samples:[]:p.startsWith('/api/microbiome/results')?{sample:samples.find(s=>p.endsWith(s.id)),analyses:[],bacterial_composition:p.endsWith('content-a')?taxa:[]}:[];await route.fulfill({json});});
const sheet=page.getByRole('dialog'),close=async()=>{await page.keyboard.press('Escape');await sheet.waitFor({state:'hidden'});await page.waitForFunction(()=>!history.state?.bloomMicrobialProfile);};
const row=name=>page.getByRole('button',{name:name+',',exact:false});
try{
 await page.goto('http://127.0.0.1:5233/microbiome');await page.getByRole('button',{name:'Bacteria',exact:true}).click();assert.equal(await page.locator('.microbial-composition-row').count(),98);
 for(const entry of registry.reportedFixtureOrganisms){
  await row(entry.reportedName).first().click();const profile=organismBiography(entry.reportedName);
  const intro=sheet.locator('.microbial-organism-intro');await intro.getByText(profile.firstLayer.meetThisOrganism,{exact:true}).waitFor();
  if(profile.presentation==='identity-context'){
   assert.equal(await intro.getByRole('heading',{name:'Why researchers study it',exact:true}).count(),0);
   assert.equal(await intro.getByText(profile.firstLayer.whyResearchersStudyIt,{exact:true}).count(),0);
   await sheet.getByText('Sources & limitations',{exact:true}).click();
   await sheet.locator('.microbial-profile-disclosures').getByText(profile.firstLayer.whyResearchersStudyIt,{exact:true}).waitFor();
   await sheet.locator('.microbial-profile-disclosures').getByText(profile.firstLayer.foodMetabolicConnections,{exact:true}).waitFor();
  }else{await intro.getByText(profile.firstLayer.whyResearchersStudyIt,{exact:true}).waitFor();await intro.getByText(profile.firstLayer.foodMetabolicConnections,{exact:true}).waitFor();}

  assert.doesNotMatch(await sheet.innerText(),/Research explanation not available yet|Reviewed research profile not yet available|Not reported · Reported observation/);
  await sheet.getByText('Your report',{exact:true}).click();await sheet.getByRole('definition').filter({hasText:'Synthetic Biology fixture'}).waitFor();await close();
 }
 await row('Eubacterium hallii').click();await sheet.locator('.microbial-organism-intro').getByText(organismBiography('Anaerobutyricum hallii').firstLayer.meetThisOrganism,{exact:true}).waitFor();await sheet.getByText('Sources & limitations',{exact:true}).click();assert.equal(await sheet.getByRole('link',{name:/Reclassification of Eubacterium hallii/}).getAttribute('href'),'https://pubmed.ncbi.nlm.nih.gov/30351260/');await close();
 await row('Anaerobutyricum hallii').nth(1).click();await sheet.getByText('The label “Anaerobutyricum hallii” needs a resolved taxonomic identity before Bloom can describe its biology.',{exact:true}).waitFor();assert.equal(await sheet.getByRole('heading',{name:'Why researchers study it',exact:true}).count(),0);await close();
 for(const testMode of ['everyday','athlete']){
  mode=testMode;await page.goto('http://127.0.0.1:5233/microbiome');await page.getByRole('button',{name:'Bacteria',exact:true}).click();
  for(const width of [320,390,768,1440])for(const theme of ['light','dark']){
   await page.setViewportSize({width,height:950});await setAppTheme(page,theme);
   for(const name of ['Eubacterium hallii','Abiotrophia defectiva','Ruminococcus gnavus ATCC 29149']){
    await row(name).click();const profile=organismBiography(name);
    for(const zoom of ['1','2']){await page.evaluate(z=>document.documentElement.style.zoom=z,zoom);assert.ok(await sheet.evaluate(el=>el.scrollWidth<=el.clientWidth+1),JSON.stringify({testMode,width,theme,zoom,name}));
     if(profile.presentation==='identity-context')assert.equal(await sheet.getByRole('heading',{name:'Why researchers study it',exact:true}).count(),0);else await sheet.getByRole('heading',{name:'Why researchers study it',exact:true}).waitFor();
    }
    await page.evaluate(()=>document.documentElement.style.zoom='1');await close();
   }
  }
 }
 await page.getByLabel('Find an organism',{exact:true}).fill('Unresolved synthetic identity');await row('Unresolved synthetic identity').click();assert.equal(await sheet.locator('.microbial-profile-disclosures details').count(),0);await sheet.getByText('Your report',{exact:true}).click();await sheet.getByRole('definition').getByText('Not reported',{exact:true}).first().waitFor();await close();
 await page.getByLabel('Select report').selectOption('content-b');assert.equal(await page.locator('.microbial-composition-row').count(),0);assert.equal(await page.getByRole('dialog').count(),0);
 owner='another-owner';await page.reload();assert.equal(await page.locator('.microbial-composition-row').count(),0);assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
 console.log((built?'COMPILED PRODUCTION BUILD ':'')+'PASS actual App: 94 supplied draft/limited/unresolved profiles visible with exact canonical sections; historical alias/verified citation, explicit rank mismatch abstention, short unknown state, source facts/absence/zero, sample+owner isolation, focus/Escape, 320/390/768/1440 × four themes × 100/200% text zoom for three representative research/identity/strain states; no writes or screenshots. Independent scientific approval NOT inferred.');
}finally{await browser.close();if(built)await new Promise((resolve,reject)=>vite.httpServer.close(error=>error?reject(error):resolve()));else await vite.close();}
