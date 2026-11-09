import test from 'node:test';
import assert from 'node:assert/strict';
import { journalIdentity } from '../shared/journal-identity';

test('journal identity follows recorded corrections and preserves source description and amounts', () => {
  const meal = { mealText: 'My original lunch', intelligence: { ingredients: [
    {name:'Corrected label', grams:null, preparation:'As labelled', assumption:'Label mass unknown', product:{source:'manual',id:'label',servings:2.5}},
    {name:'Banana', grams:150, preparation:'Raw', assumption:'User corrected'},
  ] } };
  const original = structuredClone(meal);
  const identity = journalIdentity(meal);
  assert.equal(identity.title, 'Corrected label, Banana');
  assert.equal(identity.foods?.[0].grams, null);
  assert.equal(identity.foods?.[0].product?.servings, 2.5);
  assert.deepEqual(meal, original);
});

test('legacy records fall back honestly; canonical empty foods do not resurrect original text', () => {
  assert.equal(journalIdentity({mealText:'Legacy lunch'}).title, 'Legacy lunch');
  assert.equal(journalIdentity({mealText:'Legacy lunch',intelligence:{ingredients:[{name:'Malformed'}]}}).foods, null);
  assert.equal(journalIdentity({mealText:'Removed lunch',intelligence:{ingredients:[]}}).title, 'No foods recorded');
});
