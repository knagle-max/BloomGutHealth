import test from 'node:test';
import assert from 'node:assert/strict';
import {createViomePdfParser,type ViomePdfPage} from '../shared/viome-pdf';
const item=(text:string,x:number,y:number,width=text.length*6,height=12)=>({text,x,y,width,height});
const run=(pages:ViomePdfPage[])=>{const p=createViomePdfParser();pages.forEach(p.page);return p.finish();};
const header=(kind:'organisms'|'foods')=>[item('Viome',30,20),item(kind==='organisms'?'My Active Gut Microbes':'Health Scores & Food Recommendations',30,65)];
test('uneven organism column anchors preserve stacked singular classes, wrapped strain hyphens and fragmented words',()=>{
 const d=run([{page:1,width:640,height:900,items:[...header('organisms'),
 item('Synthet',30,130,42),item('icus alpha',72,130,60),item('Bacterium',30,145),
 item('Syntheticus beta VPI-',205,130),item('5482',205,144),item('Virus',205,159),
 item('[Syntheticus] gamma',430,130),item('Eukaryote',430,145),
 item('Syntheticus delta CACC 737 ',30,200),item('Bacterium',30,215),
 ]}]);
 assert.equal(d.extraction,undefined);assert.deepEqual(d.organisms.map(r=>[r.name,r.reportedGroup,r.position.column]),[
 ['Syntheticus alpha','Bacteria',1],['Syntheticus delta CACC 737','Bacteria',1],['Syntheticus beta VPI-5482','Viruses',2],['[Syntheticus] gamma','Eukaryotes',3]]);
 assert.ok(d.organisms.every(r=>r.reportedStatus==='reported_present'));
});
test('inline paired food columns and assessment categories exclude legends/prose and carry sections across pages',()=>{
 const d=run([{page:1,width:640,height:900,items:[...header('foods'),item('Health Scores',30,100),
 item('Maintain              Improve              Attention',30,130),
 item('Synthetic assessment A              Improve',30,180),item('A paragraph ends with Maintain',30,200),
 item('My Foods',30,250),item('Superfood          Enjoy           Minimize          Avoid',30,275),
 item('Almond Milk (Unsweetened)   Enjoy         Bone Broth (Poultry)   Superfood       Egg Whites (Chicken or Duck)   Avoid',30,320,550),
 ]},{page:2,width:640,height:900,items:[item('Viome',30,20),item('Synthetic food one   Minimize        Synthetic food two   Enjoy',30,150,510)]}]);
 assert.equal(d.extraction,undefined);assert.deepEqual(d.assessments.map(r=>[r.name,r.reportedCategory]),[['Synthetic assessment A','Improve']]);
 assert.deepEqual(d.foods.map(r=>[r.name,r.reportedCategory,r.position.page,r.position.column]),[
 ['Almond Milk (Unsweetened)','Enjoy',1,1],['Bone Broth (Poultry)','Superfood',1,2],['Egg Whites (Chicken or Duck)','Avoid',1,3],['Synthetic food one','Minimize',2,1],['Synthetic food two','Enjoy',2,2]]);
});
test('missing organism classification yields a bounded position-only review issue instead of fabricated class or lost reliable rows',()=>{
 const d=run([{page:1,width:640,height:900,items:[...header('organisms'),item('Syntheticus confirmed',30,120),item('Bacterium',30,135),item('Syntheticus uncertain',30,190)]}]);
 assert.equal(d.organisms.length,1);assert.equal(d.extraction?.status,'PARTIAL_REVIEW_REQUIRED');assert.deepEqual(d.extraction?.issues,[{kind:'organisms',position:{page:1,column:1,row:2},reason:'row_not_separated'}]);assert.equal(JSON.stringify(d).includes('Syntheticus uncertain'),false);
});
test('biological date conflicts and excess class columns fail closed; demographic canaries never become findings or dates',()=>{
 const base={page:1,width:640,height:900,items:[...header('organisms'),item('Syntheticus valid',30,120),item('Bacterium',30,135)]};
 for(const extra of [[item('Collected: 2026-01-01',30,80),item('Collected: 2026-01-02',30,100)],[item('Bacterium',80,300),item('Bacterium',180,300),item('Bacterium',280,300)]])assert.throws(()=>run([{...base,items:[...base.items,...extra]}]));
 const d=run([{...base,items:[...base.items,item('Name: PRIVATE_CANARY',30,180),item('DOB: 1900-01-01',30,200),item('Sample ID: PRIVATE_CANARY',30,230)]}]);assert.equal(JSON.stringify(d).includes('PRIVATE_CANARY'),false);assert.deepEqual(d.biologicalDates,{});
});

test('missing middle food category cannot merge two different columns into one invented label',()=>{
 const d=run([{page:1,width:640,height:900,items:[...header('foods'),item('My Foods',30,100),item('First food',30,150,60),item('Enjoy',100,150,30),item('Missing category food',205,150,120),item('Third food',430,150,60),item('Avoid',510,150,30)]}]);
 assert.deepEqual(d.foods.map(r=>r.name),['First food']);assert.equal(d.extraction?.issues.length,2);assert.ok(d.extraction?.issues.every(i=>i.kind==='foods'));assert.equal(JSON.stringify(d).includes('Missing category food'),false);
});
test('PDF.js fragments of legend prose mentioning Avoid or Maintain do not become findings or uncertainty rows',()=>{
 const d=run([{page:1,width:640,height:900,items:[...header('foods'),item('Health Scores',30,100),item('Synthetic assessment',30,150,130),item('Improve',200,150,45),item('A paragraph mentions',30,180,120),item('Maintain',155,180,48),item('as explanation.',208,180,90),item('My Foods',30,220),item('Legend explanation',30,250,120),item('Avoid',300,250,30),item('these foods as prose.',335,250,120),item('Synthetic food',30,300,90),item('Enjoy',150,300,30)]}]);
 assert.equal(d.extraction,undefined);assert.deepEqual(d.assessments.map(r=>r.name),['Synthetic assessment']);assert.deepEqual(d.foods.map(r=>r.name),['Synthetic food']);
});
