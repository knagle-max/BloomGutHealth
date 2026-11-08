import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeMeal} from '../server/meal-intelligence';
import {findFoodCandidates,splitMealDescription} from '../server/food-catalog';
import {mealNutritionSummary} from '../shared/nutrition-summary';

test('unspecified animal foods use a generic source; explicit cooking, parts and dishes retain their identity',async()=>{
 const breakfast=await analyzeMeal('2 eggs and 2 slices of toast',false);
 const [eggs,toast]=breakfast.intelligence.ingredients;
 assert.match(eggs.name,/Egg, whole, cooked, NS as to cooking method/);assert.equal(eggs.grams,100);assert.equal(eggs.household?.quantity,2);
 assert.match(toast.name,/toasted/i);assert.equal(toast.household?.quantity,2);
 for(const query of ['chicken','beef','pork'])assert.match(findFoodCandidates(query)[0].description,/\bNFS\b|NS as to/i,query);
 assert.match(findFoodCandidates('chicken back')[0].description,/back/i);
 for(const [query,identity,mass] of [['3 boiled eggs',/boiled|poached/i,150],['2 creamed eggs',/creamed/i,290],['2 raw eggs',/raw/i,100],['2 egg whites',/white/i,72],['1 egg Benedict',/Benedict/i,155]] as const){
  const item=(await analyzeMeal(query,false)).intelligence.ingredients[0];assert.match(item.name,identity,query);assert.equal(item.grams,mass,query);
 }
});

test('attached exclusions cannot disappear into a whole sandwich or a generic substitute; other foods retain partial contributions',async()=>{
 const description='two burgers without buns, chicken skewers and salad';
 const result=await analyzeMeal(description,false),[burger,chicken,salad]=result.intelligence.ingredients;
 assert.equal(result.intelligence.ingredients.length,3);assert.match(burger.name,/2 burgers without buns/i);assert.equal(burger.grams,null);assert.equal(burger.household,undefined);
 assert.ok(chicken.grams!>0&&salad.grams!>0);assert.ok(!result.intelligence.foodMatches.some(row=>/bun|bread|cheeseburger|burger king/i.test(row.description)));
 const summary=mealNutritionSummary([result]);assert.equal(summary.isPartial,true);assert.ok(summary.totals.calories!>0,'Known foods remain known contributions; the unresolved burger is not zero');
 assert.match(findFoodCandidates('2 veggie burger patties without buns')[0].description,/veggie.*no bun/i,'An explicitly requested vegetarian source remains eligible');
 for(const text of ['salad without dressing and croutons, 100 g chicken','salad without chicken, 1 tablespoon olive oil','2 hamburgers without buns and cheese with 100 g chicken']){
  const parsed=splitMealDescription(text);assert.equal(parsed.length,2,text);assert.match(parsed[0].name,/without/);
  const meal=await analyzeMeal(text,false);assert.equal(meal.intelligence.ingredients.length,2,text);assert.equal(meal.intelligence.ingredients[0].grams,null,text);assert.ok(meal.intelligence.ingredients[1].grams!>0,text);
  assert.ok(!meal.intelligence.foodMatches.some(row=>/crouton|dressing|cheese|burger/i.test(row.description)),text);
 }
 const explicitOmission=await analyzeMeal('salad without dressing, 1 tablespoon olive oil',false);assert.match(explicitOmission.intelligence.ingredients[0].name,/no dressing/i);assert.ok(explicitOmission.intelligence.ingredients[0].grams!>0,'An actual source explicitly omitting dressing remains usable');

});
