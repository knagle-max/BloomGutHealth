import test from 'node:test';
import assert from 'node:assert/strict';
import {mealContextSchema} from '../shared/meal-intelligence';

test('meal time provenance accepts an explicit recognized source zone without inventing it for legacy entries',()=>{
 const legacy=mealContextSchema.parse({eatenAt:'2026-10-27T18:00:00Z',portion:'specified'});
 assert.equal('timeZone' in legacy,false);
 const current=mealContextSchema.parse({...legacy,timeZone:'America/Regina'});
 assert.equal(current.timeZone,'America/Regina');assert.equal(current.eatenAt,legacy.eatenAt);
 assert.equal(mealContextSchema.safeParse({...legacy,timeZone:'not/a-zone'}).success,false);
 assert.equal(mealContextSchema.safeParse({...legacy,timeZone:'x'.repeat(101)}).success,false);
});

test('unaware corrections preserve time provenance only for the same instant; explicit corrections and legacy unknown remain authoritative',async()=>{
 const {preserveMealTimeZone,recordedMealTime}=await import('../shared/meal-time');
 const instant='2026-10-27T18:00:00Z',source={timeZone:'America/Regina'};
 assert.equal(preserveMealTimeZone(source,{},instant).timeZone,'America/Regina');
 assert.equal(preserveMealTimeZone(source,{eatenAt:'2026-10-27T12:00:00-06:00'},instant).timeZone,'America/Regina');
 assert.equal(preserveMealTimeZone(source,{eatenAt:'2026-10-28T18:00:00Z'},instant).timeZone,undefined);
 assert.equal(preserveMealTimeZone(source,{timeZone:null},instant).timeZone,null);
 assert.equal(preserveMealTimeZone({}, {eatenAt:instant},instant).timeZone,undefined);
 assert.equal(recordedMealTime(instant,{}),null);assert.equal(recordedMealTime('invalid',source),null);
 assert.match(recordedMealTime(instant,source)!,/America\/Regina/);assert.deepEqual(source,{timeZone:'America/Regina'});
});
