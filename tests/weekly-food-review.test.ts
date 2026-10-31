import test from 'node:test';import assert from 'node:assert/strict';
import {weeklyFoodReview} from '../shared/weekly-food-review';
const meal=(loggedAt:string,ingredients?:unknown)=>({loggedAt,intelligence:{ingredients}});
test('weekly food review uses recorded ingredient names once per meal and keeps missing entries/amounts explicit',()=>{
 const rows=[meal('2026-10-27T18:00:00Z',[{name:'Oats',grams:30},{name:' oats ',grams:10},{name:'Milk',grams:null}]),meal('2026-10-26T18:00:00Z',[{name:'Oats',grams:20}]),meal('2026-10-26T18:00:00Z'),meal('invalid',[{name:'Excluded'}]),meal('2026-10-20T18:00:00Z',[{name:'Earlier week'}])],before=structuredClone(rows);
 const review=weeklyFoodReview(rows,'2026-10-27','America/Regina');
 assert.equal(review.from,'2026-10-21');assert.equal(review.entries,3);assert.equal(review.withIngredients,2);assert.equal(review.withoutIngredients,1);
 assert.deepEqual(review.foods,[{name:'Oats',loggedMeals:2,portionUnknown:false},{name:'Milk',loggedMeals:1,portionUnknown:true}]);assert.deepEqual(rows,before);
 assert.equal('score' in review,false);assert.equal('species' in review,false);
});
test('weekly food membership follows the explicit viewer calendar across midnight and DST without inferring a source zone',()=>{
 const rows=[meal('2026-10-28T05:59:00Z',[{name:'Late meal',grams:1}]),meal('2026-10-28T06:00:00Z',[{name:'Next day',grams:1}])];
 assert.equal(weeklyFoodReview(rows,'2026-10-27','America/Regina').entries,1);assert.equal(weeklyFoodReview(rows,'2026-10-27','UTC').entries,0);
 const fold=[meal('2026-11-01T05:30:00Z',[{name:'First occurrence',grams:1}]),meal('2026-11-01T06:30:00Z',[{name:'Second occurrence',grams:1}])];assert.equal(weeklyFoodReview(fold,'2026-11-01','America/New_York').entries,2);
 for(const date of ['2026-02-30','invalid','2026-10-27extra'])assert.throws(()=>weeklyFoodReview([],date,'UTC'));
 assert.throws(()=>weeklyFoodReview([],'2026-10-27','invented-zone'));assert.equal(weeklyFoodReview([],'2026-10-27','UTC').entries,0);
});
