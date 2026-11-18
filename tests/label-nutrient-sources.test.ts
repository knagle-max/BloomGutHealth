import test from 'node:test';
import assert from 'node:assert/strict';
import {readLabelNutrientSources,recordedLabelContributions} from '../shared/label-nutrient-sources';
import {scaleLabelAmount} from '../shared/label-portion';
import {lookupProductNutrition} from '../server/products';
import {productIngredient,type Product} from '../shared/products';
const label:Product={source:'manual',id:'synthetic-source',name:'Saved label',brand:'Synthetic',servingDescription:'1 scoop',servingGrams:null,perServing:{calories:210,protein_g:0,vitamin_a_ug:120,folate_ug:42},otherNutrients:[{name:'Magnesium citrate compound',amount:100,unit:'mg'},{name:'Declared extract',amount:0,unit:'mg'}],url:null,retrievedAt:'2026-11-01T14:15:00-06:00',notes:[]};
test('original label reader keeps native serving amounts and source zero independently of scaled meal estimates or mutable current labels',async()=>{
 const current=structuredClone(label),store:any={getNutritionProducts:async()=>[]},service:any={resolve:async()=>[current]};
 const result=await lookupProductNutrition([productIngredient(current,2)],store,'owner',service),saved=JSON.parse(JSON.stringify(result));
 current.perServing.calories=999;current.otherNutrients![0].amount=800;
 const source=readLabelNutrientSources(saved.productDetails);assert.equal(source.status,'available');assert.equal(saved.nutrients.find((n:any)=>n.key==='calories').amount,420);assert.equal(source.sources[0].fields.find(n=>n.key==='calories')?.amount,210);assert.equal(source.sources[0].fields.find(n=>n.key==='protein_g')?.amount,0);assert.equal(source.sources[0].fields.find(n=>n.key==='protein_g')?.sourceReportsZero,true);assert.equal(source.sources[0].fields.find(n=>n.key==='sodium_mg')?.amount,null);assert.equal(source.sources[0].fields.find(n=>n.key==='sodium_mg')?.sourceReportsZero,null);assert.equal(source.sources[0].servingGrams,null);assert.equal(source.sources[0].otherIngredients[0].amount,100);assert.equal(source.sources[0].otherIngredients[1].amount,0);assert.equal(source.sources[0].retrievedAt,label.retrievedAt);assert.match(source.sources[0].fields.find(n=>n.key==='vitamin_a_ug')!.name,/basis unconfirmed/);assert.match(source.sources[0].fields.find(n=>n.key==='folate_ug')!.name,/basis unconfirmed/);assert.deepEqual(saved.productDetails[0].labelSnapshot,label);
});

test('saved label portions reuse review scaling, preserve native zero/unknown/forms and stay owned without current lookup',async()=>{
 const current=structuredClone(label),service:any={resolve:async()=>[current]},store:any={getNutritionProducts:async()=>[]};
 const result=await lookupProductNutrition([productIngredient(current,0.5),productIngredient(current,2)],store,'a',service);
 const saved=JSON.parse(JSON.stringify(result)),meal={id:'saved-a',userId:'a',loggedAt:'2026-11-01T15:00:00-06:00'};
 current.perServing.calories=999;current.servingDescription='changed';
 const before=JSON.stringify(saved),view=recordedLabelContributions(saved.productDetails,meal,'a');
 assert.equal(view.status,'available');assert.equal(view.sources.length,2);
 assert.deepEqual(view.sources.map(row=>row.servings),[0.5,2]);
 const first=view.sources[0],energy=first.fields.find(row=>row.key==='calories')!;
 assert.equal(energy.nativeAmountPerServing,210);assert.equal(energy.amount,105);
 assert.equal(view.sources[1].fields.find(row=>row.key==='calories')!.amount,420);
 assert.equal(saved.nutrients.find((row:any)=>row.key==='calories').amount,525);
 assert.equal(first.occurredAt,'2026-11-01T21:00:00.000Z');assert.equal(first.dateBasis,'meal-record-time');
 assert.equal(first.fields.find(row=>row.key==='protein_g')!.amount,0);
 assert.equal(first.fields.find(row=>row.key==='protein_g')!.sourceReportsZero,true);
 assert.equal(first.fields.find(row=>row.key==='magnesium_mg')!.amount,null,'Compound weight never becomes elemental magnesium');
 assert.equal(first.fields.find(row=>row.key==='sodium_mg')!.amount,null);
 assert.ok(first.fields.every(row=>row.chemicalForm===null&&row.activityUnit===null&&!row.adequacyAssessment));
 assert.equal(JSON.stringify(saved),before);
 for(const actor of ['b',undefined])assert.deepEqual(recordedLabelContributions(saved.productDetails,meal,actor),{status:'scope-unavailable',sources:[]});
 const unknownTime=recordedLabelContributions(saved.productDetails,{...meal,loggedAt:'2026-11-01'},'a');assert.equal(unknownTime.sources[0].occurredAt,null);
});

test('legacy or mismatched portions abstain instead of parsing text, mass or a new label; invalid scaling never invents zero',()=>{
 const meal={id:'saved',userId:'a'},detail={name:label.name,source:label.source,labelSnapshot:label,serving:'2 × 1 scoop'};
 for(const changes of [{},{labelPortion:{version:'future',servings:2}},{labelPortion:{version:'label-portion-v1',servings:0}},{labelPortion:{version:'label-portion-v1',servings:2,untrusted:true}},{source:'dsld',labelPortion:{version:'label-portion-v1',servings:2}}]){
  const [source]=recordedLabelContributions([{...detail,...changes}],meal,'a').sources;
  assert.equal(source.servings,null);assert.equal(source.portionStatus,'not-confirmed');assert.ok(source.fields.every(row=>row.amount===null));
 }
 assert.equal(scaleLabelAmount(0,0.5),0);assert.equal(scaleLabelAmount(21.5,0.625),13.4375);
 for(const [amount,servings] of [[null,1],[-1,1],[Infinity,1],[1,0],[1,101],[1,NaN],['1',2],[Number.MAX_VALUE,100]])assert.equal(scaleLabelAmount(amount,servings),null);
});
test('legacy, invalid and mixed sources abstain independently without lookup, inferred units, equivalents or fake dates',()=>{
 assert.equal(readLabelNutrientSources(undefined).status,'not-captured');assert.equal(readLabelNutrientSources({}).status,'unsupported');
 const unknown={...label,retrievedAt:'',perServing:{...label.perServing,unmapped_form:0}},input=[{labelSnapshot:unknown},{name:'Legacy'},null,{labelSnapshot:{...label,url:'javascript:alert(1)'}},{labelSnapshot:{...label,perServing:{protein_g:-1}}}];
 const original=structuredClone(input),view=readLabelNutrientSources(input);assert.equal(view.status,'partial');assert.equal(view.missing,1);assert.equal(view.unsupported,3);assert.equal(view.sources.length,1);assert.equal(view.sources[0].retrievedAt,null);assert.deepEqual(view.sources[0].unmappedFields,[{key:'unmapped_form',amount:0,unit:null}]);assert.deepEqual(input,original);
});
