import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordedFoodDays } from '../shared/food-progress';

test('recorded food days retain zero, unknown and partial contributions without inventing missing days', () => {
  const day = new Date(2026, 9, 28, 12).toISOString();
  const rows = [{loggedAt: day, totalCalories: 420, totalProtein: 0}, {loggedAt: day, totalCalories: null, totalProtein: null}, {loggedAt: new Date(2026, 9, 26, 12), totalCalories: null, totalProtein: null}];
  const result = recordedFoodDays(rows);
  assert.deepEqual(result.map(r => r.day), ['2026-10-28', '2026-10-26']);
  assert.equal(result[0].totals.calories, 420);
  assert.equal(result[0].totals.protein, 0);
  assert.equal(result[0].coverage.calories.partial, true);
  assert.equal(result[1].totals.calories, null);
  assert.equal(result[0].meals, 2);
  assert.equal(rows[0].totalCalories, 420);
});

test('food progress uses current local day boundaries, latest seven and no synthetic empty history', () => {
  const rows = Array.from({length: 10}, (_, i) => ({loggedAt: new Date(2026, 9, i + 1, 0, 1), totalCalories: i}));
  const result = recordedFoodDays(rows);
  assert.equal(result.length, 7);
  assert.equal(result[0].day, '2026-10-10');
  assert.equal(result[6].day, '2026-10-04');
  assert.deepEqual(recordedFoodDays([]), []);
  assert.deepEqual(recordedFoodDays([{loggedAt: 'invalid'}]), []);
});
