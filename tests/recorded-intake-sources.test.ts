import test from 'node:test';
import assert from 'node:assert/strict';
import {captureNutrientSource} from '../shared/nutrient-source-snapshot';
import {recordedIntakeSources,intakeCalendarDate} from '../shared/recorded-intake-sources';
import {supplementIntakeSchema} from '../shared/supplement-intake';
const actor='a',date='2026-11-17',timeZone='America/Regina',asOf='2026-11-18T00:00:00Z';
const label={source:'manual',id:'saved-label',name:'Reported label',brand:'Synthetic',servingDescription:'1 capsule',servingGrams:null,perServing:{iron_mg:10,magnesium_mg:200,protein_g:0,vitamin_a_ug:60},retrievedAt:'2026-11-16T12:00:00Z',url:null,notes:[]};
const base={takenAt:'2026-11-17T12:00:00Z',confirmedAt:'2026-11-17T12:01:00Z',confirmedTaken:true,servings:1,label,mineralBasis:{iron_mg:'elemental-label',magnesium_mg:'compound-weight',zinc_mg:'unknown'},formulation:{labelVersion:'Synthetic v1',batch:null}};
function supplement(id='a',intent='11111111-1111-4111-8111-111111111111'){
 const payload=supplementIntakeSchema.parse({version:1,valueKind:'confirmed-supplement-consumption',intentId:intent,revision:intent,lifecycleId:'33333333-3333-4333-8333-333333333333',original:base,current:base,corrections:[]});
 return{id:id.repeat(64),userId:actor,kind:'supplement-intake',payload,createdAt:base.confirmedAt,updatedAt:base.confirmedAt};
}
const snapshot=captureNutrientSource({sourceId:'fdc:999',sourceVersion:'Synthetic',sourceUrl:'https://fdc.nal.usda.gov/food-details/999/nutrients',ingredient:'Reported food',grams:200,per100g:{'1003':10,'1093':0,'1106':20}});
const food={id:'food',userId:actor,revision:'food-r1',loggedAt:'2026-11-17T12:00:00Z',analysis:{nutrientSourceSnapshots:[snapshot],productDetails:[{name:label.name,source:label.source,serving:'1 capsule',otherNutrients:[],labelSnapshot:label,labelPortion:{version:'label-portion-v1' as const,servings:1}}]}};
const read=(foods:any[]=[],supplements:any[]=[])=>recordedIntakeSources({actor,date,timeZone,asOf,foods,supplements});
test('one current owned event per identity composes existing food and confirmed supplement source readers without a second sum or form conversion',()=>{
 const first=supplement(),second=supplement('b','22222222-2222-4222-8222-222222222222'),input=structuredClone([food,first,second]);
 const result=read([food,structuredClone(food)],[first,structuredClone(first),second]);
 assert.equal(result.events.length,3);assert.equal(result.events.filter(event=>event.kind==='supplement').length,2);
 const foodRows=result.events.find(event=>event.kind==='food')!.rows;
 assert.equal(foodRows.filter(row=>row.sourceKind==='generic-food').length,21);assert.equal(foodRows.filter(row=>row.sourceKind==='food-label').length,21);
 assert.equal(foodRows.find(row=>row.sourceKind==='generic-food'&&row.nutrientKey==='protein_g')!.amount,20);
 const source=foodRows.find(row=>row.sourceKind==='food-label'&&row.nutrientKey==='iron_mg')!;assert.equal(source.amount,10);assert.equal(source.source.id,label.id);assert.equal(source.source.version,null);assert.equal(source.source.retrievedAt,label.retrievedAt);
 assert.equal(result.events[1].rows.find(row=>row.nutrientKey==='iron_mg')!.amount,10);assert.equal(result.events[1].rows.find(row=>row.nutrientKey==='magnesium_mg')!.amount,null);
 assert.equal(result.events[1].rows.find(row=>row.nutrientKey==='protein_g')!.amount,0);assert.equal(result.events[1].rows.find(row=>row.nutrientKey==='sodium_mg')!.amount,null);
 const genericA=foodRows.find(row=>row.sourceKind==='generic-food'&&row.nutrientKey==='vitamin_a_ug')!,labelA=foodRows.find(row=>row.sourceKind==='food-label'&&row.nutrientKey==='vitamin_a_ug')!;
 assert.equal(genericA.activityUnit,'µg RAE');assert.equal(labelA.activityUnit,null);assert.match(labelA.name,/basis unconfirmed/);assert.equal('totals'in result,false,'Incompatible native/form bases are not silently added');
 assert.equal(result.adequacyAssessment,false);assert.equal(result.usualIntakeAssessment,false);assert.deepEqual([food,first,second],input);
});
test('correction contributes only current once; deletion, conflicting revisions, unavailable source and foreign scope stay explicit',()=>{
 const first=supplement(),corrected=structuredClone(first),revision='44444444-4444-4444-8444-444444444444';
 corrected.payload=supplementIntakeSchema.parse({...first.payload,revision,current:{...base,servings:2},corrections:[{revision,changedAt:'2026-11-17T13:00:00Z',value:{...base,servings:2}}]});
 assert.equal(read([],[corrected]).events[0].rows.find(row=>row.nutrientKey==='iron_mg')!.amount,20);
 assert.equal(read([],[first,corrected]).conflictingEvents,1);assert.equal(read([],[first,corrected]).events.length,0);
 assert.equal(read([food,{...food,revision:'food-r2',loggedAt:'2026-11-19T12:00:00Z'}]).events.length,0,'A moved-to-another-day correction cannot leave an old copy in this day');
 assert.equal(read([],[corrected]).events.length,1);assert.equal(read([],[first,{...first,id:'c'.repeat(64)}]).events.length,0,'The same canonical intent cannot become two intakes through a record alias');assert.equal(read([],[]).events.length,0);
 const unlabelled=structuredClone(first);unlabelled.payload=supplementIntakeSchema.parse({...first.payload,original:{...base,label:null,servings:null,unlabelled:{name:'Unknown composition',servingDescription:null},mineralBasis:{iron_mg:'unknown',magnesium_mg:'unknown',zinc_mg:'unknown'}},current:{...base,label:null,servings:null,unlabelled:{name:'Unknown composition',servingDescription:null},mineralBasis:{iron_mg:'unknown',magnesium_mg:'unknown',zinc_mg:'unknown'}}});
 const unknown=read([],[unlabelled]).events[0];assert.equal(unknown.sourceStatus,'unavailable');assert.deepEqual(unknown.rows,[]);
 assert.throws(()=>read([{...food,userId:'b'}]),/SCOPE/);assert.throws(()=>read([],[{...first,userId:'b'}]),/SCOPE/);
 assert.equal(read([],[{kind:'supplement-review',userId:actor}]).events.length,0);
});
test('selected historical local date uses named-zone DST and source times; undated or future records never turn into actual daily ingestion',()=>{
 assert.equal(intakeCalendarDate('2026-03-08T07:30:00Z','America/Toronto'),'2026-03-08');assert.equal(intakeCalendarDate('2026-03-08T04:30:00Z','America/Toronto'),'2026-03-07');
 assert.equal(read([{...food,loggedAt:'2026-11-18T05:59:59Z'}]).futureEvents,1);
 assert.equal(recordedIntakeSources({actor,date,timeZone,asOf:'2026-11-18T06:30:00Z',foods:[{...food,loggedAt:'2026-11-18T05:59:59Z'}],supplements:[]}).events.length,1);
 assert.equal(read([{...food,loggedAt:'2026-11-18T06:00:00Z'}]).events.length,0);
 const notYetConfirmed=supplement();notYetConfirmed.payload.original.confirmedAt='2026-11-19T00:00:00Z';notYetConfirmed.payload.current.confirmedAt='2026-11-19T00:00:00Z';assert.equal(read([],[notYetConfirmed]).events.length,0);assert.equal(read([],[notYetConfirmed]).futureEvents,1);
 assert.equal(read([{...food,loggedAt:null}]).undatedEvents,1);assert.equal(read([{...food,loggedAt:null}]).events.length,0);
 for(const invalid of [{date:'2026-02-30'}, {timeZone:'invented'}, {asOf:'not-a-date'}])assert.throws(()=>recordedIntakeSources({actor,date,timeZone,asOf,foods:[],supplements:[],...invalid}),/WINDOW/);
});
