import test from 'node:test';
import assert from 'node:assert/strict';
import {observeB6Identity} from '../scripts/qa/b6-food-identity-probe.mjs';
const row={nutrient:{id:1175,name:'Vitamin B-6',unitName:'MG',number:'415'}};
test('public identity observation derives metadata from the exact official witness, not a guessed ID, food amount or private credential',()=>{
 const original={fdcId:171688,foodNutrients:[row]},before=structuredClone(original);assert.deepEqual(observeB6Identity(original).identities,[row.nutrient]);assert.deepEqual(original,before);assert.equal(observeB6Identity({...original,foodNutrients:[row,row]}).status,'identity-observed');
 for(const value of [{...original,fdcId:999},{fdcId:171688}, {...original,foodNutrients:[]},{...original,foodNutrients:[{nutrient:{...row.nutrient,unitName:'UG'}}]},{...original,foodNutrients:[{nutrient:{...row.nutrient,id:1003}}]},{...original,foodNutrients:[row,{nutrient:{...row.nutrient,id:999999}}]}])assert.equal(observeB6Identity(value).status,'unverified-contract');
});
