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

import { todayContextAction } from "../shared/today-focus";
test("Today routes upcoming local-day planned training without inventing nutrition targets", () => {
  const now = new Date("2026-10-23T12:00:00Z");
  const sessions = [
    {title:"Cancelled",startsAt:"2026-10-23T13:00:00Z",status:"cancelled"},
    {title:"Done",startsAt:"2026-10-23T14:00:00Z",status:"completed"},
    {title:"Later",startsAt:"2026-10-23T18:00:00Z",status:"planned"},
    {title:"Next",startsAt:"2026-10-23T15:00:00Z",status:"planned"},
    {title:"Tomorrow",startsAt:"2026-10-24T15:00:00Z",status:"planned"},
    {title:"Invalid",startsAt:"invalid",status:"planned"},
  ];
  const action = todayContextAction({mealCount:2,now,sessions});
  assert.equal(action.href,"/athlete/fueling");
  assert.match(action.reason,/Next/);
  assert.match(action.reason,/does not establish an energy requirement/);
  for (const state of [{mealCount:0},{mealCount:2,loading:true},{mealCount:2,unavailable:true},{mealCount:2,missingNutritionCount:1}]) {
    assert.notEqual(todayContextAction({...state,now,sessions}).href,"/athlete/fueling");
  }
});
test("only sourced goals enrich complete journals; missing schedules remain a useful meal action", () => {
  const goal = {mapping:"Protein distribution",sourceIds:["goal-protein"]};
  assert.match(todayContextAction({mealCount:1,goal}).reason,/Protein distribution/);
  assert.match(todayContextAction({mealCount:1,goal}).reason,/not evidence of deficiency/);
  assert.equal(todayContextAction({mealCount:1,goal:{...goal,sourceIds:[]}}).reason,todayJournalAction({mealCount:1}).reason);
  assert.equal(todayContextAction({mealCount:1,sessions:[]}).href,"/plan-day");
});
