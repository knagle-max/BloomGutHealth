import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeMeal,estimateLoggedIngredients,resolveLoggedIngredient} from '../server/meal-intelligence';
import {ingredientSchema} from '../shared/meal-intelligence';

test('pizza slices retain a selectable source portion and scale nutrition without AI',async()=>{
  const one=await analyzeMeal('1 slice of pepperoni pizza');
  const two=await analyzeMeal('2 slices of pepperoni pizza');
  const a=one.intelligence.ingredients[0],b=two.intelligence.ingredients[0];
  assert.ok(a.grams!>0);assert.equal(b.grams,a.grams!*2);
  assert.equal(b.household?.quantity,2);assert.match(b.household!.selected!,/slice/);
  assert.ok(b.household!.measures.some(m=>/large pizza/.test(m.label)));
  assert.equal(two.intelligence.foodMatches.length,1);
  assert.ok(ingredientSchema.safeParse(b).success);
  const large=estimateLoggedIngredients('2 slices of large pepperoni pizza')[0];
  assert.match(large.household!.selected!,/, large pizza/);assert.equal(large.grams,248);
  for(const n of one.intelligence.nutrients.filter(n=>n.amount!==null&&n.amount>0)){
    const doubled=two.intelligence.nutrients.find(x=>x.key===n.key)!;
    assert.ok(Math.abs(doubled.amount!-2*n.amount!)<=Math.max(1,0.03*doubled.amount!));
  }
});
test('portion choice and quantity survive reviewed recalculation; mass remains available',async()=>{
  const ingredient=estimateLoggedIngredients('pepperoni pizza')[0];
  const h=ingredient.household!;
  const measure=h.measures.find(m=>/slice.*?, large pizza/.test(m.label))!;
  const edited={...ingredient,grams:measure.grams*2,household:{...h,selected:measure.label,quantity:2}};
  const result=await analyzeMeal('pepperoni pizza',false,[edited]);
  assert.equal(result.intelligence.ingredients[0].grams,measure.grams*2);
  assert.equal(result.intelligence.ingredients[0].household?.selected,measure.label);
  const grams=resolveLoggedIngredient({...edited,grams:180,household:{...h,selected:null,quantity:null}});
  assert.equal(grams.grams,180);assert.equal(grams.household?.selected,null);
});
test('source default servings are explicitly estimated; invalid or forged portions do not become nutrition',()=>{
  const serving=estimateLoggedIngredients('2 servings of pepperoni pizza')[0];
  assert.equal(serving.household?.quantity,2);assert.match(serving.household!.selected!,/estimated serving/);
  for(const text of ['0 slices of pepperoni pizza','-2 slices of pepperoni pizza','9999 slices of pepperoni pizza'])assert.equal(estimateLoggedIngredients(text)[0].grams,null);
  const item=estimateLoggedIngredients('2 slices of pepperoni pizza')[0];
  const massOverride=resolveLoggedIngredient({...item,grams:1});
  assert.equal(massOverride.grams,1);assert.equal(massOverride.household?.selected,null);
  assert.throws(()=>resolveLoggedIngredient({...item,household:{...item.household!,selected:'invented serving'}}),/portion/);
  assert.throws(()=>resolveLoggedIngredient({...item,name:'Unrelated food'}),/source/);
  const sanitized=resolveLoggedIngredient({...item,household:{...item.household!,measures:[{label:'Fake',grams:1}]}});
  assert.ok(sanitized.household!.measures.every(m=>m.label!=='Fake'));
  const unknown=estimateLoggedIngredients('2 slices of imaginary food xyz')[0];
  assert.equal(unknown.grams,null);assert.equal(unknown.household,undefined);
});

test('explicit whole-pizza counts and fractions select source whole size, while bare names retain an estimated serving',()=>{
  for(const text of ['half a large pepperoni pizza','1/2 large pepperoni pizza']){
    const item=estimateLoggedIngredients(text)[0];
    assert.match(item.household!.selected!,/^1 large pizza/);
    assert.equal(item.household?.quantity,0.5);assert.equal(item.grams,498);
  }
  const small=estimateLoggedIngredients('2 small pepperoni pizzas')[0];
  assert.match(small.household!.selected!,/^1 small pizza/);assert.equal(small.grams,1032);
  const slices=estimateLoggedIngredients('two slices of large pepperoni pizza')[0];
  assert.match(slices.household!.selected!,/slice.*?, large pizza/);assert.equal(slices.grams,248);
  const bare=estimateLoggedIngredients('pepperoni pizza')[0];
  assert.match(bare.household!.selected!,/estimated serving/);assert.equal(bare.grams,248);
  const grams=estimateLoggedIngredients('150 g pepperoni pizza')[0];
  assert.equal(grams.grams,150);assert.equal(grams.household?.selected,null);
});
