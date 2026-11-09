import assert from 'node:assert/strict';import{createRequire}from'node:module';import{mkdir,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';import{execFileSync}from'node:child_process';import{createServer}from'vite';import path from'node:path';
import{setAppTheme}from'./set-app-theme.mjs';import{experienceSettingsSchema}from'../../shared/experience.ts';import{contextSchema,buildPrecisionReport}from'../../shared/precision-nutrition.ts';import{preferenceSchema}from'../../shared/meal-intelligence.ts';import{buildBiologicalRegistry}from'../../shared/biological-model.ts';import{buildWellnessContext}from'../../server/wellness-context.ts';import{buildWellnessActionView}from'../../server/wellness-actions.ts';import{buildAthleteDay}from'../../shared/athlete.ts';import{athleteProfileSourceKey}from'../../shared/athlete-review.ts';
const base=process.env.BLOOM_M1_BASE_URL||'http://127.0.0.1:5244';
assert.ok(['http://127.0.0.1:5244','http://127.0.0.1:5290','https://bloomguthealth.onrender.com'].includes(base));
const remote=base!=='http://127.0.0.1:5244';
const m1=process.env.BLOOM_M1==='1';
const r4=process.env.BLOOM_R4!=='0';
const overhaul=process.env.BLOOM_UI_OVERHAUL==='1',stylesheet=overhaul?'visual-overhaul.css':'visual-materials.css';
const out=process.env.BLOOM_MATERIAL_REVIEW||(overhaul?'/tmp/bloom-ui-overhaul-20261107':'/tmp/bloom-materials-20261107');await mkdir(out,{recursive:true});const now=new Date('2026-11-07T12:00:00Z'),prefs=preferenceSchema.parse({goals:['general health']}),health=contextSchema.parse({}),user={id:'synthetic-material-review',username:'Synthetic review',age:30,dietaryPreferences:prefs};
const report=buildPrecisionReport([],health,prefs,null,+now),registry=buildBiologicalRegistry(),context=buildWellnessContext(user.id,health,user,now);let athlete=false;
const settings=()=>experienceSettingsSchema.parse({mode:athlete?'athlete':'everyday',onboarding:{status:'complete'}});
const layoutBaseline=process.env.BLOOM_UI_LAYOUT_BASELINE;
const historicalFiles=layoutBaseline?new Map(['client/src/components/AthleteHome.tsx','client/src/pages/PrecisionNutrition.tsx'].map(file=>[path.resolve(file),execFileSync('git',['show',layoutBaseline+':'+file],{encoding:'utf8'})])):new Map();
const vite=remote?null:await createServer({plugins:layoutBaseline?[{name:'controlled-ui-source-baseline',enforce:'pre',load(id){return historicalFiles.get(id.split('?')[0]);}}]:[],server:{host:'127.0.0.1',port:5244,strictPort:true}});if(vite)await vite.listen();const{chromium}=createRequire(import.meta.url)(process.env.BLOOM_PLAYWRIGHT_MODULE||'playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.BLOOM_CHROMIUM_EXECUTABLE,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:1000},timezoneId:'UTC'});await page.clock.setFixedTime(now);page.setDefaultTimeout(12000);const errors=[],evidence=[],mutations=[],interceptedComputations=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.**/**',r=>r.abort());
await page.route('**/api/**',async route=>{const u=new URL(route.request().url()),p=u.pathname;let json=[];if(route.request().method()==='POST'&&p==='/api/experience/athlete-day')interceptedComputations.push(p);else if(!['GET','HEAD','OPTIONS'].includes(route.request().method())){mutations.push(p);return route.fulfill({status:403,json:{error:'Read-only synthetic browser fixture'}});}
 if(p==='/api/auth/me')json={user};else if(p==='/api/experience/settings')json=settings();else if(p==='/api/preferences')json=prefs;else if(process.env.BLOOM_P0_VISUAL==='1'&&p.startsWith('/api/meals'))json=[{id:'synthetic-complete-meal',mealText:'Synthetic lunch',loggedAt:now.toISOString(),totalCalories:400,protein:20,carbs:40,fat:12,nutritionalData:{calories:400,protein:20,carbs:40,fat:12}}];
 else if(p==='/api/precision')json={...report,availableReports:[],intake:{days:28,mealsLogged:0,nutrients:[]},records:[]};else if(p==='/api/precision/context')json=health;else if(p==='/api/precision/wellness-context')json=context;
 else if(p==='/api/experience/wellness-actions')json=buildWellnessActionView({context,settings:settings(),day:{date:'2026-11-07',timezoneOffset:0},sessions:[],activities:[],choices:[],now});
 else if(p==='/api/biology/registry')json=registry;else if(p==='/api/profile')json=user;
 else if(p==='/api/experience/athlete-day')json={profileSourceKey:athleteProfileSourceKey(settings().athlete),...buildAthleteDay(settings().athlete,[],[],[]),hydration:[]};
 else if(p==='/api/experience/review')json={checkins:[],experiments:[],observations:[],messages:[],summary:[],notices:[],signals:[],experimentSummaries:[],metrics:[],entries:0,from:'2026-11-01',to:'2026-11-07',next:'Record a check-in',note:'Synthetic fixture'};
 else if(p.includes('/nutrition/targets'))json={calories:null,protein:null,fiber:null};else if(p==='/api/health-sources')json={connections:[]};else if(p==='/api/health-sources/observations')json={observations:[],returned:0,total:0,offset:0,limit:50,hasMore:false};else if(p==='/api/capabilities')json={eligible:false,experimentalEnabled:false};else if(p==='/api/analysis/status')json={ai:{configured:false},nutrition:{liveLookupConfigured:false}};
 if(process.env.BLOOM_P0_VISUAL==='1'&&p==='/api/experience/wellness-actions')json={...json,actions:[],primaryActionId:null};await route.fulfill({json});
});
const paint=enabled=>r4?page.locator('.app-shell').evaluate((el,on)=>{if(on)el.dataset.bloomVisual='premium';else delete el.dataset.bloomVisual;},enabled):page.evaluate(({on,stylesheet})=>{const style=document.querySelector(`style[data-vite-dev-id$="/${stylesheet}"]`);if(!style?.sheet)throw Error('Material stylesheet not loaded');style.sheet.disabled=!on;},{on:enabled,stylesheet});
const structure=()=>page.evaluate(()=>Array.from(document.querySelectorAll('.app-shell a,.app-shell button,.app-shell input,.app-shell select,.app-shell textarea,.app-shell summary,.app-shell h1,.app-shell h2,.app-shell h3')).flatMap(el=>{const r=el.getBoundingClientRect();if(!r.width||!r.height||!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))return[];return[{tag:el.tagName,text:(el.getAttribute('aria-label')||el.textContent||'').trim(),href:el.getAttribute('href'),role:el.getAttribute('role'),x:r.x,y:r.y,width:r.width,height:r.height,font:getComputedStyle(el).fontFamily}];}));
// Intended material text pairs on both ambient extrema; not a whole-app audit.
const contrast=()=>page.evaluate(()=>{
 const rgb=value=>{const numbers=value.match(/[\d.]+/g).map(Number);return[numbers[0],numbers[1],numbers[2],numbers[3]??1];};
 const blend=(top,bottom)=>top.slice(0,3).map((n,i)=>n*top[3]+bottom[i]*(1-top[3]));
 const luminance=color=>color.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 const probe=document.createElement('span');probe.style.cssText='position:fixed;visibility:hidden;background:var(--bloom-material-surface);color:hsl(var(--foreground))';document.body.append(probe);
 const material=rgb(getComputedStyle(probe).backgroundColor),foreground=rgb(getComputedStyle(probe).color);probe.style.color='hsl(var(--muted-foreground))';const muted=rgb(getComputedStyle(probe).color);probe.style.color='hsl(var(--primary))';const primary=rgb(getComputedStyle(probe).color);probe.remove();
 const base=rgb(getComputedStyle(document.querySelector('.app-shell')).backgroundColor),dark=document.documentElement.classList.contains('dark'),athlete=document.documentElement.dataset.experience==='athlete';
 const ambient=dark?(athlete?[129,190,255,.07]:[...primary.slice(0,3),.06]):athlete?[129,190,255,.17]:[217,231,213,.5];
 const backgrounds=[base,blend(ambient,base)].map(canvas=>blend(material,canvas));
 return{foreground:Math.min(...backgrounds.map(bg=>ratio(foreground,bg))),muted:Math.min(...backgrounds.map(bg=>ratio(muted,bg)))};
});
try{
 for(const[name,path]of[['today','/'],['food','/log-meal'],['biology','/precision'],['explore','/explore'],['progress','/progress'],['athlete','/athlete'],...(r4?[['profile','/profile']]:[]),...(m1?[['journal','/nutrition'],['gut','/microbiome']]:[])].filter(([name])=>!process.env.BLOOM_MATERIAL_ONLY||process.env.BLOOM_MATERIAL_ONLY.split(',').includes(name))){
  athlete=name==='athlete'||process.env.BLOOM_M1_ATHLETE_ALL==='1';await page.goto(base+path);await page.waitForLoadState('networkidle');await page.locator('main').first().waitFor();if(name==='food'){await page.getByText('Add food another way',{exact:true}).click();await page.getByRole('button',{name:'Change method / add another item',exact:true}).click();}
  for(const width of (process.env.BLOOM_M1_ZOOM_ONLY==='1'?[390]:[320,390,768,1440])){await page.setViewportSize({width,height:1000});for(const theme of ['light','dark']){await setAppTheme(page,theme);await page.keyboard.press('Escape');await page.waitForTimeout(220);
   await paint(false);const before=await structure(),beforeOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);const capture=process.env.BLOOM_CAPTURE_VISUALS==='1'&&(width===390&&theme==='light'||name==='athlete'&&width===390&&theme==='dark'||name==='today'&&width===320&&theme==='light');
   if(capture)await page.screenshot({path:`${out}/${name}-${width}-${theme}-before.png`,animations:'disabled'});
   await paint(true);const after=await structure();if(!r4)assert.deepEqual(after,before,`${name} ${width} ${theme}: paint must preserve typography, DOM reading order and action coordinates`);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(!r4)assert.equal(overflow,beforeOverflow);assert.equal(overflow,false,`${name} ${width} ${theme} overflow`);
   if(r4){
    const semantic=rows=>rows.map(({tag,text,href,role})=>({tag,text,href,role}));
    assert.deepEqual(semantic(after),semantic(before),`${name}: presentation preserves visible reading/action order`);
    const palette=await page.locator('.app-shell').evaluate(el=>{
     const style=getComputedStyle(el),probe=document.createElement('span');el.append(probe);
     const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number);
     const luminance=color=>color.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
     const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
     const color=token=>{probe.style.color=`var(--bv-${token})`;return rgb(getComputedStyle(probe).color);};
     const card=color('porcelain'),canvas=color('canvas'),ink=color('forest'),muted=color('secondary'),brand=color('brand');probe.remove();
     return{background:style.backgroundColor,font:getComputedStyle(el.querySelector('h1')).fontFamily,ratios:[contrast(ink,card),contrast(muted,card),contrast(muted,canvas),contrast(canvas,brand)]};
    });
    assert.equal(palette.background,athlete&&theme==='dark'?'rgb(15, 27, 46)':theme==='dark'?'rgb(16, 28, 23)':'rgb(248, 249, 243)');
    assert.match(palette.font,/Georgia|Iowan|Baskerville|Palatino/);
    assert.ok(palette.ratios.every(value=>value>=4.5),`${name} ${theme}: authored text/action contrast ${palette.ratios}`);
   }
   if(process.env.BLOOM_P0_VISUAL==='1'&&name==='today'){
    const hero=page.locator('.today-focus').first();
    for(const label of['Choose my next meal','Adjust']){
     const link=hero.getByRole('link',{name:label,exact:true});await link.waitFor();
     for(const state of['normal','hover','focus','active']){
      await page.mouse.move(0,0);if(state==='hover')await link.hover();if(state==='focus')await link.focus();if(state==='active'){await link.hover();await page.mouse.down();}
      const contrast=await link.evaluate(el=>{const c=getComputedStyle(el),hero=el.closest('.today-focus'),h=getComputedStyle(hero);const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);const lum=c=>c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);const text=lum(rgb(c.color));const stops=h.backgroundImage.match(/rgba?\([^)]+\)/g)||[h.backgroundColor];return Math.min(...stops.map(v=>{const b=lum(rgb(v));return(Math.max(text,b)+.05)/(Math.min(text,b)+.05);}));});
      assert.ok(contrast>=4.5,`${label} ${theme} ${state}: contrast ${contrast}`);
      if(state==='active'){await page.mouse.move(0,0);await page.mouse.up();}
     }
     assert.ok((await link.boundingBox()).height>=44,label+' touch target');
    }
   }
   if(m1){
    const slot={today:'today',food:'food',biology:'biology',explore:'explore',progress:'progress',profile:'profile',athlete:'athlete',journal:'food',gut:'biology'}[name];
    const media=page.locator(`.bv-media[data-slot="${slot}"]`).first();
    await media.waitFor({state:'attached'});
    if(['profile','progress'].includes(name)&&width<768)assert.equal(await media.isVisible(),false,`${name} mobile ornament suppressed`);
    else{
     await media.scrollIntoViewIfNeeded();const img=media.locator('img');await page.waitForFunction(el=>el.complete&&el.naturalWidth>0,await img.elementHandle());
     const box=await img.boundingBox(),expected=width<360?{today:96,food:112,biology:100,explore:104,athlete:112}:width<768?{today:120,food:144,biology:128,explore:132,athlete:144}:width<1440?{today:156,food:180,biology:160,explore:168,athlete:180}:{today:176,food:220,biology:200,explore:200,athlete:220};
     assert.equal(Math.round(box.height),expected[slot]??(width>=1440?120:96),`${name} ${width}: exact M1-D image height`);
     assert.equal(await img.getAttribute('alt'),'');assert.equal(await img.getAttribute('aria-hidden'),'true');
     const collision=await media.evaluate(el=>{const image=el.querySelector('img').getBoundingClientRect();return Array.from(document.querySelectorAll('main h1,main h2,main button,main input,main select,main textarea,main [role="alert"],main .today-focus-reason,main .hero-button')).filter(node=>node.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})).some(node=>{const r=node.getBoundingClientRect();return r.width&&r.height&&image.left<r.right-1&&image.right>r.left+1&&image.top<r.bottom-1&&image.bottom>r.top+1;});});
     assert.equal(collision,false,`${name}: media must not overlap title/action/status/form`);
     assert.equal(await img.evaluate(el=>getComputedStyle(el).opacity),'1');
     if(slot==='biology')await media.getByText('Illustrative, not your data',{exact:true}).waitFor();
    }
   }
   if(capture)await page.screenshot({path:`${out}/${name}-${width}-${theme}-after.png`,animations:'disabled'});
   const materialContrast=r4?null:await contrast();if(!r4)assert.ok(materialContrast.foreground>=4.5&&materialContrast.muted>=4.5,`${name} ${theme} intended material text contrast`);
   evidence.push({name,width,theme,geometryAndOrder:r4?'R4 responsive presentation':'identical',overflow:false,materialContrast,structureSha256:createHash('sha256').update(JSON.stringify(after)).digest('hex')});
  }}
  await page.setViewportSize({width:390,height:1000});await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.waitForTimeout(220);await paint(false);const zoomBefore=await structure(),zoomBeforeOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);await paint(true);if(!r4)assert.deepEqual(await structure(),zoomBefore,name+' 200% text structure');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+' 200% text overflow');if(m1){const overlap=await page.evaluate(()=>Array.from(document.querySelectorAll('.bv-media img')).filter(el=>el.checkVisibility()).some(el=>{const b=el.getBoundingClientRect();return Array.from(document.querySelectorAll('main h1,main h2,main button,main input,main select,main textarea,main [role=alert]')).filter(node=>node.checkVisibility()).some(node=>{const r=node.getBoundingClientRect();return r.width&&r.height&&b.left<r.right-1&&b.right>r.left+1&&b.top<r.bottom-1&&b.bottom>r.top+1;});}));assert.equal(overlap,false,name+' 200% media/critical content collision');}await page.evaluate(()=>document.documentElement.style.fontSize='');
 }
 if(process.env.BLOOM_UI_SHELL_TARGETS==='1')await page.evaluate(()=>{window.bloomShellKeys=[];document.addEventListener('keydown',event=>{window.bloomShellKeys.push({key:event.key,prevented:event.defaultPrevented,target:event.target.tagName});});});
 if(process.env.BLOOM_UI_SHELL_TARGETS==='1')for(const width of[320,390])for(const theme of['light','dark']){
  await page.setViewportSize({width,height:1000});await setAppTheme(page,theme);const trigger=page.getByRole('button',{name:'Open navigation',exact:true});await trigger.focus();await page.keyboard.press('Enter');const menu=page.getByRole('dialog',{name:'Explore Bloom',exact:true});await menu.waitFor();await page.waitForFunction(()=>document.querySelector('.mobile-navigation-sheet')?.contains(document.activeElement));await menu.evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));const close=menu.getByRole('button',{name:'Close',exact:true}),box=await close.boundingBox(),title=await menu.getByRole('heading',{name:'Explore Bloom',exact:true}).boundingBox();assert.ok(box.width>=44&&box.height>=44);assert.ok(title.x+title.width<=box.x,'drawer title reserves close target');await close.focus();await page.keyboard.press('Enter');await page.locator('.mobile-navigation-sheet').waitFor({state:'detached'});assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Enter');await menu.waitFor();await page.waitForFunction(()=>document.querySelector('.mobile-navigation-sheet')?.contains(document.activeElement));await menu.evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));await page.keyboard.press('Escape');await page.locator('.mobile-navigation-sheet').waitFor({state:'detached'});assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
 }
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
 assert.deepEqual(errors,[]);assert.deepEqual(mutations,[]);await writeFile(out+'/parity.json',JSON.stringify({baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),comparison:r4?"Same app/API fixture; canonical premium opt-in absent versus present; responsive and semantic checks, no historical parity claim":`Same app/API fixture, ${stylesheet} disabled versus enabled; not historical hosted screenshots`,layoutBaseline:layoutBaseline??null,sourceOverrides:[...historicalFiles.keys()],target:base,mutations,interceptedComputations,fixtures:'Read-only intercepted synthetic API responses; actual served app/JS/CSS/art, no account creation or private API call; fonts blocked',cases:evidence.length,evidence,errors,physicalDevices:'NOT_RUN',independentReview:'NOT_GRANTED'},null,2));
 console.log(`PASS ${r4?'R4 responsive skin':stylesheet}: ${evidence.length} states across ${new Set(evidence.map(row=>row.name)).size} routes × ${new Set(evidence.map(row=>row.width)).size} widths × two themes, ${r4?'canonical opt-in presentation':'exact DOM/action geometry/type parity'}, 200% text, no overflow, reduced-motion preference; text receipt in ${out}; image capture is opt-in only.`);
}catch(error){console.error({mutations,body:(await page.locator('main').first().innerText()).slice(0,1800)});console.error(await page.evaluate(()=>({viewport:innerWidth,overflow:document.documentElement.scrollWidth,shellKeys:window.bloomShellKeys,focused:document.activeElement?.tagName,dialogs:Array.from(document.querySelectorAll('[role=dialog]')).map(el=>({state:el.dataset.state,hidden:el.getAttribute('aria-hidden')})),culprits:Array.from(document.querySelectorAll('main *')).filter(el=>{const r=el.getBoundingClientRect();return el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})&&r.right>innerWidth+1;}).slice(0,15).map(el=>({tag:el.tagName,cls:el.className,text:el.textContent?.slice(0,90),rect:{x:el.getBoundingClientRect().x,width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right}}))})));throw error;}finally{await browser.close();await vite?.close();}
