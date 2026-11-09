import test from 'node:test';
import assert from 'node:assert/strict';
import {previousTrainingSets} from '../shared/training-set-history';
import {trainingSessionSchema, type ActualSets} from '../shared/experience';
const set=(exercise:string,reps:number|null=5,loadKg:number|null=40,completed=true):ActualSets['sets'][number]=>({exercise,reps,loadKg,completed});
const session=(startsAt:string,sets:ActualSets['sets'],status='completed')=>trainingSessionSchema.parse({title:startsAt,startsAt,minutes:30,intensity:'moderate',discipline:'strength-power',status,actualSets:{version:1,sets}});
test('previous set references require completed earlier same-name/ordinal observations, not later, planned or cancelled sets',()=>{
 const history=[session('2026-10-20T12:00:00Z',[set(' Squat ',5,40),set('Squat',6,45)]),session('2026-10-21T12:00:00Z',[set('squat',7,50),set('Squat',8,55,false)]),session('2026-10-22T12:00:00Z',[set('Squat',9,60)],'planned'),session('2026-10-23T12:00:00Z',[{...set('Squat'),state:'cancelled',completed:false}]),session('2026-10-25T12:00:00Z',[set('Squat',10,70)])];
 const snapshot=structuredClone(history),draft=[set('SQUAT',null,null,false),set(' squat ',null,null,false),set('Front squat'),set('')];
 const result=previousTrainingSets(draft,history,'2026-10-24T12:00:00Z',Date.parse('2026-10-24T15:00:00Z'));
 assert.equal(result[0]?.set.loadKg,50);assert.equal(result[1]?.set.loadKg,45,'An incomplete ordinal2 does not fall back to ordinal1');assert.equal(result[1]?.position,2);assert.equal(result[2],undefined);assert.equal(result[3],undefined);
 assert.deepEqual(history,snapshot);assert.equal(draft[0].loadKg,null);assert.equal(draft[0].completed,false);
 assert.equal(previousTrainingSets(draft,history,'invalid')[0],undefined);
 assert.equal(previousTrainingSets(draft,history,'2026-10-30T12:00:00Z',Date.parse('2026-10-21T12:00:00Z'))[0]?.set.loadKg,40,'Future and equal timestamps excluded');
});
test('previous actual zero, missing values and reported units stay distinct; no alias/substring matching',()=>{
 const history=[session('2026-10-20T12:00:00Z',[{...set('Bench   press',0,0),loadUnit:'lb'},set('Plank',null,null)])];
 const result=previousTrainingSets([set('bench press'),set('Plank'),set('Bench')],history,'2026-10-21T12:00:00Z',Date.parse('2026-10-22T12:00:00Z'));
 assert.equal(result[0]?.set.reps,0);assert.equal(result[0]?.set.loadKg,0);assert.equal(result[0]?.set.loadUnit,'lb');assert.equal(result[1]?.set.reps,null);assert.equal(result[1]?.set.loadKg,null);assert.equal(result[2],undefined);
});
