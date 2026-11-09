import test from 'node:test';
import assert from 'node:assert/strict';
import {readLabelNutrientSources} from '../shared/label-nutrient-sources';
import {lookupProductNutrition} from '../server/products';
import {productIngredient,type Product} from '../shared/products';
const label:Product={source:'manual',id:'synthetic-source',name:'Saved label',brand:'Synthetic',servingDescription:'1 scoop',servingGrams:null,perServing:{calories:210,protein_g:0,vitamin_a_ug:120,folate_ug:42},otherNutrients:[{name:'Magnesium citrate compound',amount:100,unit:'mg'},{name:'Declared extract',amount:0,unit:'mg'}],url:null,retrievedAt:'2026-11-01T14:15:00-06:00',notes:[]};
test('original label reader keeps native serving amounts and source zero independently of scaled meal estimates or mutable current labels',async()=>{
 const current=structuredClone(label),store:any={getNutritionProducts:async()=>[]},service:any={resolve:async()=>[current]};
 const result=await lookupProductNutrition([productIngredient(current,2)],store,'owner',service),saved=JSON.parse(JSON.stringify(result));
 current.perServing.calories=999;current.otherNutrients![0].amount=800;
 const source=readLabelNutrientSources(saved.productDetails);assert.equal(source.status,'available');assert.equal(saved.nutrients.find((n:any)=>n.key==='calories').amount,420);assert.equal(source.sources[0].fields.find(n=>n.key==='calories')?.amount,210);assert.equal(source.sources[0].fields.find(n=>n.key==='protein_g')?.amount,0);assert.equal(source.sources[0].fields.find(n=>n.key==='protein_g')?.sourceReportsZero,true);assert.equal(source.sources[0].fields.find(n=>n.key==='sodium_mg')?.amount,null);assert.equal(source.sources[0].fields.find(n=>n.key==='sodium_mg')?.sourceReportsZero,null);assert.equal(source.sources[0].servingGrams,null);assert.equal(source.sources[0].otherIngredients[0].amount,100);assert.equal(source.sources[0].otherIngredients[1].amount,0);assert.equal(source.sources[0].retrievedAt,label.retrievedAt);assert.match(source.sources[0].fields.find(n=>n.key==='vitamin_a_ug')!.name,/basis unconfirmed/);assert.match(source.sources[0].fields.find(n=>n.key==='folate_ug')!.name,/basis unconfirmed/);assert.deepEqual(saved.productDetails[0].labelSnapshot,label);
});
test('legacy, invalid and mixed sources abstain independently without lookup, inferred units, equivalents or fake dates',()=>{
 assert.equal(readLabelNutrientSources(undefined).status,'not-captured');assert.equal(readLabelNutrientSources({}).status,'unsupported');
 const unknown={...label,retrievedAt:'',perServing:{...label.perServing,unmapped_form:0}},input=[{labelSnapshot:unknown},{name:'Legacy'},null,{labelSnapshot:{...label,url:'javascript:alert(1)'}},{labelSnapshot:{...label,perServing:{protein_g:-1}}}];
 const original=structuredClone(input),view=readLabelNutrientSources(input);assert.equal(view.status,'partial');assert.equal(view.missing,1);assert.equal(view.unsupported,3);assert.equal(view.sources.length,1);assert.equal(view.sources[0].retrievedAt,null);assert.deepEqual(view.sources[0].unmappedFields,[{key:'unmapped_form',amount:0,unit:null}]);assert.deepEqual(input,original);
});
