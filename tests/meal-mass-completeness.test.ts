import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeMeal} from '../server/meal-intelligence';
import {productIngredient,type Product} from '../shared/products';
test('canonical aggregate mass stays unknown when any selected label lacks mass, without losing known nutrients or zero',async()=>{
 const capsule:Product={source:'manual',id:'capsule',name:'Synthetic capsule',brand:'Fixture',servingDescription:'1 capsule',servingGrams:null,perServing:{calories:5,protein_g:0},notes:[],url:null,retrievedAt:'2026-10-26T00:00:00Z'};
 const bar:Product={...capsule,id:'bar',name:'Synthetic bar',servingDescription:'1 bar (40 g)',servingGrams:40,perServing:{calories:200,protein_g:2}};
 const labels=[capsule,bar];const options:any={store:{getNutritionProducts:async()=>labels},userId:'owner',service:{resolve:async(ref:any)=>labels.filter(p=>p.id===ref.id)}};
 const only=await analyzeMeal('',false,[productIngredient(capsule)],options);
 assert.equal(only.nutritionalData[0].serving_size_g,null);assert.equal(only.nutritionalData[0].protein_g,0);assert.equal(only.nutritionalData[0].calories,5);
 const mixed=await analyzeMeal('',false,[productIngredient(capsule),productIngredient(bar,2)],options);
 assert.equal(mixed.nutritionalData[0].serving_size_g,null,'Known partial80g must not become complete meal mass');assert.equal(mixed.nutritionalData[0].calories,405);assert.equal(mixed.intelligence.ingredients[0].grams,null);assert.equal(mixed.intelligence.ingredients[1].grams,80);
 const known=await analyzeMeal('',false,[productIngredient(bar,2)],options);assert.equal(known.nutritionalData[0].serving_size_g,80);assert.equal(known.nutritionalData[0].calories,400);
 assert.equal(JSON.parse(JSON.stringify(mixed)).nutritionalData[0].serving_size_g,null,'Stored JSON preserves unknown instead of a fabricated zero');
});
