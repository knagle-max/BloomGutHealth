import test from "node:test";
import assert from "node:assert/strict";
import { todayJournalAction } from "../shared/today-focus";

test("empty, complete and incomplete journals choose useful distinct next actions", () => {
  assert.equal(todayJournalAction({mealCount:0}).label, "Log my first meal");
  assert.equal(todayJournalAction({mealCount:2}).href, "/plan-day");
  const partial = todayJournalAction({mealCount:2,missingNutritionCount:1});
  assert.equal(partial.href, "/nutrition");
  assert.match(partial.reason, /1 logged meal/);
  assert.match(partial.reason, /missing values are not zero/);
});

test("loading and failed requests never imply the user has no logged food", () => {
  for (const input of [{mealCount:0,loading:true},{mealCount:0,unavailable:true},{mealCount:2,missingNutritionCount:1,unavailable:true}]) {
    const action = todayJournalAction(input);
    assert.equal(action.label, "Log a meal");
    assert.equal(action.href, "/log-meal");
    assert.doesNotMatch(action.reason, /first meal|1 logged meal/);
  }
});
