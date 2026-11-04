import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {analyzeMeal,nutritionTotals} from '../server/meal-intelligence';
import {productIngredient,type Product} from '../shared/products';
import {ProductService} from '../server/products';
import {mealNutritionSummary} from '../shared/nutrition-summary';
import {recordedFoodDays} from '../shared/food-progress';
import {recordedNutritionPeriod} from '../server/nutrition-history';
import type {Ingredient} from '../shared/meal-intelligence';

type Source={id:string;kind:string;name:string;fdcId?:number;basisGrams:number;serving:string;version:string;url:string;reported:Record<string,number|string|null>};
type Case={id:string;items:{source:string;servings:number}[];expected:Record<string,number|null>;coverage:Record<string,number>};
const reference=JSON.parse(readFileSync(new URL('./fixtures/food-golden/references-v1.json',import.meta.url),'utf8')) as {version:string;catalogueSHA256:string;sources:Source[];cases:Case[]};
const fields:Record<string,string>={calories:'calories',protein_g:'protein',carbohydrates_total_g:'carbs',fat_total_g:'fat',fiber_g:'fiber',sugar_g:'sugar',sodium_mg:'sodium'};
const source=(id:string)=>{const row=reference.sources.find(s=>s.id===id);assert.ok(row,id);return row;};
const labels:Product[]=reference.sources.filter(s=>s.kind==='private-reference').map(s=>({source:'manual',id:s.id,name:s.name,brand:'Offline source reference',servingDescription:s.serving,servingGrams:s.basisGrams,perServing:Object.fromEntries(Object.entries(s.reported).filter(([,v])=>typeof v==='number')) as Record<string,number>,url:null,retrievedAt:'2026-11-04T00:00:00Z',notes:[],sourceNote:`${s.version}; ${s.url}; source-only: ${Object.entries(s.reported).filter(([,v])=>typeof v!=='number').map(([k,v])=>k+'='+String(v)).join(', ')}`}));
const store:any={getNutritionProducts:async(owner:string)=>owner==='golden-owner'?labels:[],getPrecisionContext:async()=>({})};
const service=new ProductService(async()=>{throw Error('Offline reference cannot call a provider');},()=>false,()=>undefined);
const ingredients=(entry:Case):Ingredient[]=>entry.items.map(item=>{const s=source(item.source);return s.kind==='catalogue'?{name:s.name,grams:s.basisGrams*item.servings,preparation:s.name,assumption:'Explicit source identity and edible mass',catalogue:{source:'usda-fndds',fdcId:s.fdcId!}}:productIngredient(labels.find(p=>p.id===s.id)!,item.servings);});
const analyze=(entry:Case)=>analyzeMeal('Offline reference '+entry.id,false,ingredients(entry),{store,userId:'golden-owner',service});
function assertReference(result:Awaited<ReturnType<typeof analyze>>,entry:Case){
 const saved=JSON.parse(JSON.stringify({...result,...nutritionTotals(result.nutritionalData),loggedAt:'2026-11-04T12:00:00Z'}));
 const summary=mealNutritionSummary([saved]),progress=recordedFoodDays([saved])[0],history=recordedNutritionPeriod([saved]);
 assert.equal(result.intelligence.ingredients.length,entry.items.length,entry.id);
 assert.equal(result.intelligence.nutritionCalculationVersion,'2026-11-04');
 for(const[key,expected]of Object.entries(entry.expected)){
  const nutrient=result.intelligence.nutrients.find(n=>n.key===key);assert.ok(nutrient,key);assert.equal(nutrient.amount,expected,entry.id+' '+key);assert.equal(nutrient.coverage,entry.coverage[key],entry.id+' '+key+' coverage');
  for(const view of[summary,progress,history])assert.equal(view.totals[fields[key]],expected,entry.id+' '+key+' consumer parity');
  assert.equal(summary.coverage[fields[key]].partial,entry.coverage[key]<1,entry.id+' '+key+' missingness');
 }
 for(const item of entry.items){const s=source(item.source);if(s.kind==='catalogue')assert.ok(result.intelligence.foodMatches.some(m=>m.fdcId===s.fdcId&&m.grams===s.basisGrams*item.servings),entry.id+' FDC identity');else{const detail=result.intelligence.productDetails?.find(d=>d.labelSnapshot?.id===s.id);assert.ok(detail,entry.id+' private source');assert.equal(detail.labelSnapshot?.sourceNote,labels.find(l=>l.id===s.id)!.sourceNote);assert.deepEqual(detail.labelSnapshot?.perServing,labels.find(l=>l.id===s.id)!.perServing);}}
 return saved;
}

test('51 frozen source-linked food cases preserve scaling, identity, missingness and canonical consumer totals',async()=>{
 assert.equal(reference.cases.length,51);assert.equal(new Set(reference.cases.map(c=>c.id)).size,51);
 assert.equal(createHash('sha256').update(readFileSync(new URL('../server/data/fndds-2021-2023.json.gz',import.meta.url))).digest('hex'),reference.catalogueSHA256);
 const snapshot=JSON.stringify(reference);
 for(const entry of reference.cases)assertReference(await analyze(entry),entry);
 assert.equal(JSON.stringify(reference),snapshot,'Reference facts and expected answers are immutable');
});

test('reference matrix detects tenfold portion errors and label substitution; private references remain account-scoped',async()=>{
 const entry=reference.cases.find(c=>c.id==='ca-kitkat-single-basis')!;
 const wrong=structuredClone(entry);wrong.items[0].servings=10;
 const inflated=await analyze(wrong);assert.throws(()=>assertReference(inflated,entry));
 const substituted={...entry,items:[{source:'ca-kitkat-fourpack',servings:1}]};
 const changed=await analyze(substituted);assert.throws(()=>assertReference(changed,entry));
 await assert.rejects(service.resolve({source:'manual',id:'ca-kitkat-single'},store,'other-owner'),/not found in your account/);
});
