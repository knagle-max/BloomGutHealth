import test from 'node:test';
import assert from 'node:assert/strict';
import {readLabelVitaminB6} from '../shared/label-vitamin-b6';
import {readLabelNutrientSources,recordedLabelContributions} from '../shared/label-nutrient-sources';
import {nutrientDefinitionDetails,recordedNutrientDefinitionDetails} from '../shared/nutrient-definitions';
import type {Product} from '../shared/products';
const base:Product={id:'synthetic-label',source:'manual',name:'Synthetic B6',brand:'Synthetic',servingDescription:'1 capsule',servingGrams:null,perServing:{},otherNutrients:[{name:'Vitamin B6',amount:10,unit:'mg'}],url:null,retrievedAt:'2026-11-18T10:00:00Z',notes:[]};
test('explicit native B6 mg label declaration uses the existing owned serving scaler; raw values, source zero and unknown portion stay distinct',()=>{
 const before=structuredClone(base);assert.deepEqual(readLabelVitaminB6(base),{amount:10,sourceReportsZero:false,state:'label-reported'});
 const detail={source:'manual',name:base.name,labelSnapshot:base,labelPortion:{version:'label-portion-v1',servings:2}},meal={id:'m1',userId:'a',loggedAt:'2026-11-18T10:01:00Z'};
 const field=recordedLabelContributions([detail],meal,'a').sources[0].fields.find(row=>row.key==='vitamin_b6_mg')!;assert.equal(field.amount,20);assert.equal(field.nativeAmountPerServing,10);assert.equal(field.unit,'mg');assert.equal(field.chemicalForm,null);
 assert.equal(recordedLabelContributions([{...detail,labelPortion:undefined}],meal,'a').sources[0].fields.find(row=>row.key==='vitamin_b6_mg')!.amount,null);assert.deepEqual(recordedLabelContributions([detail],meal,'b').sources,[]);
 assert.equal(readLabelVitaminB6({...base,otherNutrients:[{name:'Vitamin B6',amount:0,unit:'MG'}]})!.sourceReportsZero,true);
 assert.deepEqual(base,before);assert.equal(nutrientDefinitionDetails().length,21);assert.ok(Object.isFrozen(recordedNutrientDefinitionDetails().find(row=>row.key==='vitamin_b6_mg')!.sourceMappings));assert.equal(recordedNutrientDefinitionDetails().find(row=>row.key==='vitamin_b6_mg')!.sourceMappings.usda,null,'No unverified generic-food identity is assigned');
});
test('a single exact mirrored NIH declaration counts once; conflicting/duplicate/approximate/unsupported native facts abstain',()=>{
 const source={...base,source:'dsld' as const,labelDeclarations:[{name:'Vitamin B6',amount:10,unit:'mg',operator:'='}]};assert.equal(readLabelVitaminB6(source)!.amount,10);
 for(const label of [{...source,labelDeclarations:[{...source.labelDeclarations[0],amount:15}]},{...source,otherNutrients:[...base.otherNutrients!,...base.otherNutrients!]},{...source,perServing:{vitamin_b6_mg:100}}]){const result=readLabelVitaminB6(label)!;assert.equal(result.state,'conflicting');assert.equal(result.amount,null);}
 for(const label of [{...base,servingDescription:''},{...source,labelDeclarations:[{...source.labelDeclarations[0],operator:'<'}]},{...base,otherNutrients:[{name:'Vitamin B6',amount:10000,unit:'µg'}]},{...base,otherNutrients:[{name:'Pyridoxine hydrochloride',amount:100,unit:'mg'}]},{...base,otherNutrients:[{name:'Vitamin B6 (not present)',amount:10,unit:'mg'}]},{...base,source:'off' as const},{...base,otherNutrients:[],perServing:{vitamin_b6_mg:10}}])assert.equal(readLabelVitaminB6(label)!.amount,null,'No compound, unit, operator, provider or unversioned-key guess');
 assert.equal(readLabelVitaminB6({...base,otherNutrients:[{name:'Vitamin B12',amount:10,unit:'mg'}]}),null);
 const conflict=readLabelNutrientSources([{labelSnapshot:{...source,labelDeclarations:[{...source.labelDeclarations[0],amount:15}]}}]).sources[0].fields.find(row=>row.key==='vitamin_b6_mg')!;assert.equal(conflict.state,'conflicting');assert.equal(conflict.amount,null);
});
