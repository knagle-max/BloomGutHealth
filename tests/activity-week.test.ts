import test from 'node:test';
import assert from 'node:assert/strict';
import {activitySchema} from '../shared/experience';
import {describeActivityParts,activityProjection,recordedActivityWeek} from '../shared/activity-capture';
const now=new Date(2026,9,30,12),stamp=(day:number,hour=10)=>new Date(2026,9,day,hour).toISOString();
test('activity week counts distinct recorded days and separate bouts, retaining partial/unknown duration and excluding future/outside-window entries',()=>{
 const parts=describeActivityParts('Walked 30 minutes, then did 3 sets of bench press at 60 kg for 8 reps');
 const compound=activitySchema.parse({...activityProjection(parts),components:{version:1,items:parts},startedAt:stamp(29)});
 const rows=[{payload:compound},{payload:activitySchema.parse({title:'Other bout',minutes:null,startedAt:stamp(29,11)})},{payload:activitySchema.parse({title:'Earlier walk',minutes:15,startedAt:stamp(24)})},{payload:activitySchema.parse({title:'Too early',minutes:120,startedAt:stamp(23)})},{payload:activitySchema.parse({title:'Future',minutes:120,startedAt:stamp(30,13)})}];
 const before=structuredClone(rows),week=recordedActivityWeek(rows,now);
 assert.equal(week.entries,3);assert.equal(week.recordedDays,2);assert.equal(week.knownMinutes,45);assert.equal(week.missingDurations,2);assert.deepEqual(week.labels,['Walking','Strength exercise','Not classified']);assert.deepEqual(rows,before);
 const unknown=recordedActivityWeek([rows[1]],now);assert.equal(unknown.knownMinutes,null);assert.equal(unknown.missingDurations,1);
 const empty=recordedActivityWeek([],now);assert.equal(empty.entries,0);assert.equal(empty.knownMinutes,null);assert.equal(empty.recordedDays,0);
});
