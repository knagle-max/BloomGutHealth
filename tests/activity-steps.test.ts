import test from 'node:test';
import assert from 'node:assert/strict';
import {activitySchema,activityComponentSchema} from '../shared/experience';
import {activityParts,activityProjection,activityAmountText,repeatActivityParts} from '../shared/activity-capture';
import {randomUUID} from 'node:crypto';

const base={title:'Walking pad',startedAt:'2026-11-09T12:00:00Z',minutes:null};
test('actual steps need explicit scope and preserve zero, unknown and original counts without duration inference',()=>{
 for(const steps of [-1,1.5,Infinity,NaN])assert.equal(activitySchema.safeParse({...base,steps,stepScope:'session'}).success,false);
 assert.equal(activitySchema.safeParse({...base,steps:12400}).success,false);
 const recorded=activitySchema.parse({...base,steps:12400,stepScope:'session'});
 assert.equal(recorded.minutes,null);assert.match(activityAmountText(recorded),/12,400 steps \(session, manual\)/);
 assert.equal(activityParts(recorded)[0].steps,12400);
 const zero=activitySchema.parse({...base,steps:0,stepScope:'whole-day'});
 assert.match(activityAmountText(zero),/0 steps \(whole day, manual\)/);
 assert.match(activityAmountText(activitySchema.parse({...base,steps:null,stepScope:'session'})),/Step count not recorded/);
 assert.doesNotMatch(activityAmountText(activitySchema.parse(base)),/steps/i);
});
test('overlapping whole-day and session observations stay separate; repeat withdraws actual counts and completion',()=>{
 const pad=activityComponentSchema.parse({id:randomUUID(),title:'Walking pad',activityId:'walk',match:'reported',minutes:null,distanceM:null,steps:12400,stepScope:'session'});
 const day={...pad,id:randomUUID(),title:'Whole-day count',steps:14100,stepScope:'whole-day' as const};
 const projection=activityProjection([pad,day]);assert.equal(projection.steps,null);assert.equal(projection.stepScope,null);
 const saved=activitySchema.parse({...base,...projection,components:{version:1,items:[pad,day]}});
 const text=activityAmountText(saved);assert.match(text,/12,400/);assert.match(text,/14,100/);assert.doesNotMatch(text,/26,500/);
 assert.deepEqual(repeatActivityParts(saved).map(part=>part.steps),[null,null]);
 assert.deepEqual(saved.components?.items.map(part=>part.steps),[12400,14100]);
 const single=activityProjection([pad]);assert.equal(single.steps,12400);assert.equal(single.stepScope,'session');
});
