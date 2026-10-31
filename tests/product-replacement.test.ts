import test from 'node:test';
import assert from 'node:assert/strict';
import {replacementLabelAmount} from '../shared/products';
test('food identity replacement converts recorded mass to the new label serving without changing canonical grams',()=>{
 for(const [mass,basis] of [[100,40],[120,40],[0.5,100],[113.3980925,40]]){const result=replacementLabelAmount(basis,mass);assert.equal(result.requiresReview,false);assert.ok(Math.abs(result.servings*basis-mass)<1e-10);}
 assert.deepEqual(replacementLabelAmount(40,100),{servings:2.5,requiresReview:false});
 assert.deepEqual(replacementLabelAmount(40),{servings:1,requiresReview:false});
});
test('unknown or unsupported replacement amounts require explicit review instead of guessed mass conversion or clamping',()=>{
 for(const [basis,mass] of [[null,100],[40,null],[0,100],[NaN,100],[1,3000],[40,-1],[40,Infinity]] as Array<[number|null,number|null]>)assert.deepEqual(replacementLabelAmount(basis,mass),{servings:1,requiresReview:true});
});
