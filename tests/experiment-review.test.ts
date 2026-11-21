import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewExperiment} from '../shared/experiment-review';
const focus={mode:'everyday',title:'Familiar routine',startsOn:'2026-11-05',endsOn:'2026-11-12',action:'One familiar action',outcome:'Recorded comfort',design:{baselineStartsOn:'2026-11-01',baselineEndsOn:'2026-11-03',metricUnit:'rating 0–10',measurementMethod:'Same question each evening',expectedDirection:'increase',confoundersToTrack:'Sleep and other changes'},observations:[1,2,3,5,6,7].map((day,index)=>({date:`2026-11-0${day}`,value:[0,1,2,0,4,8][index],adherence:index===3?0:index===4?100:null,confounders:index===4?'Less sleep':''}))};
test('only source dates through the requested day contribute; future records stay saved and do not manufacture a baseline or change',()=>{
 const original=structuredClone(focus),before=reviewExperiment(focus,'2026-10-31');
 assert.equal(before.status,'insufficient-data');assert.equal(before.change,null);assert.equal(before.coverage?.futureEntries,6);assert.equal(before.coverage?.baseline.elapsedDays,0);
 const partial=reviewExperiment(focus,'2026-11-06');assert.equal(partial.change,null);assert.equal(partial.coverage?.followup.recordedDays,2);assert.equal(partial.coverage?.futureEntries,1);
 const elapsed=reviewExperiment(focus,'2026-11-07');assert.equal(elapsed.change,3);assert.equal(elapsed.baseline,1);assert.equal(elapsed.followup,4);assert.deepEqual(focus,original);
 assert.equal(reviewExperiment(focus,'not-a-date').coverage,null);assert.equal(reviewExperiment(focus,'2026-02-30').change,null);
});
test('coverage distinguishes missing days, explicit zero adherence, absent context notes and descriptive spread without inferring completed actions or effect',()=>{
 const r=reviewExperiment(focus,'2026-11-10');assert.deepEqual(r.coverage?.baseline,{recordedDays:3,elapsedDays:3,missingDays:0,low:0,high:2});assert.deepEqual(r.coverage?.followup,{recordedDays:3,elapsedDays:6,missingDays:3,low:0,high:8});assert.deepEqual(r.coverage?.adherence,{reportedDays:2,missingDays:1,zeroDays:1});assert.equal(r.coverage?.contextNotesDays,1);assert.match(r.note,/adherence is incomplete/);assert.match(r.caveat,/cannot establish cause/);
 const zero=reviewExperiment({...focus,observations:focus.observations.map(o=>({...o,value:0,adherence:0,confounders:'No other change reported'}))},'2026-11-20');assert.equal(zero.change,0);assert.equal(zero.coverage?.followup.low,0);assert.equal(zero.coverage?.followup.elapsedDays,8);assert.equal(zero.coverage?.adherence.zeroDays,3);
 const direction=reviewExperiment({...focus,design:{...focus.design,expectedDirection:'decrease'}},'2026-11-10');assert.equal(direction.change,r.change,'Expected direction never rewrites observed values or implies benefit');
 assert.equal(reviewExperiment({...focus,design:null},'2026-11-10').change,null);assert.equal(reviewExperiment({...focus,observations:[focus.observations[0],focus.observations[0]]},'2026-11-10').coverage,null);
});
