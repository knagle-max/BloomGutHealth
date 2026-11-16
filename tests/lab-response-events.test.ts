import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {buildPrecisionReport,contextSchema,labSchema} from '../shared/precision-nutrition';
import {defaultPreferences} from '../shared/meal-intelligence';
import {recordedLabPanelReview} from '../shared/lab-panel-review';
import {activitySchema,activityRoutinePlanSchema,type ExperienceRecord} from '../shared/experience';
import {labActivityContext} from '../shared/lab-response-events';

const now=Date.parse('2026-11-16T12:00:00Z');
function pair(marker='triglycerides'){
 const records=['2026-09-01','2026-10-01'].map((date,index)=>({id:'lab-'+index,kind:'lab',payload:labSchema.parse({marker,value:marker==='triglycerides'?(index?0.6:2.1):(index?20:10),unit:marker==='triglycerides'?'mmol/L':'U/L',measuredAt:date+'T12:00:00Z',laboratory:'Synthetic lab',method:'Synthetic assay',fasting:'yes',referenceLow:null,referenceHigh:null,sourceReport:{importId:randomUUID(),enteredDate:date}})}));
 return recordedLabPanelReview(buildPrecisionReport(records,contextSchema.parse({}),defaultPreferences,null)).assessments[0];
}
function activity(id:string,date='2026-09-10',patch:Record<string,unknown>={}):ExperienceRecord{
 return{id,kind:'activity',createdAt:'2026-11-01T12:00:00Z',updatedAt:'2026-11-01T12:00:00Z',payload:activitySchema.parse({title:'Walk',startedAt:date+'T12:00:00Z',minutes:null,notes:'',capture:{version:1,method:'select',description:'Walk',activityId:'walk',interpretation:'user-selected'},...patch})};
}
test('source-calendar context preserves unknown duration and later recorded-at without claiming more walking or pre-collection exposure',()=>{
 const p=pair(),events=[activity('walk'),activity('before','2026-08-31'),activity('same-day','2026-10-01'),activity('after','2026-10-02')],original=structuredClone(events);
 const view=labActivityContext(p,events,now);
 assert.deepEqual(view.sourceIds,['lab-0','lab-1']);assert.deepEqual(view.window,{from:'2026-09-01',to:'2026-10-01',basis:'recorded-calendar-dates'});
 assert.deepEqual(view.observations,[{id:'walk',date:'2026-09-10',recordedAt:'2026-11-01T12:00:00Z',kind:'walking',minutes:null,timing:'calendar-window-only'}]);
 assert.equal(view.coverage,'unknown');assert.deepEqual(events,original);
});
test('unconfirmed source dates, incompatible assays and a revised collection window withdraw the chronology',()=>{
 const p=pair(),event=activity('walk');
 assert.equal(labActivityContext({...p,comparable:false},[event],now).status,'source-review');
 assert.equal(labActivityContext({...p,latest:{...p.latest!,sourceReport:undefined}},[event],now).status,'source-review');
 const revised={...p,latest:{...p.latest!,date:'2026-09-05T12:00:00Z',sourceReport:{...p.latest!.sourceReport!,enteredDate:'2026-09-05'}}};
 assert.deepEqual(labActivityContext(revised,[event],now).observations,[]);
});
test('NLP suggestions and titles never prove walking; future and invalid rows are excluded',()=>{
 const suggestion=activity('suggested','2026-09-10',{capture:{version:1,method:'describe',description:'Walk',activityId:'walk',interpretation:'rule-suggestion'}});
 const future={...activity('future'),createdAt:'2027-01-01T12:00:00Z'};
 const invalid={...activity('invalid'),payload:{title:'Walk'}} as ExperienceRecord;
 const view=labActivityContext(pair(),[suggestion,future,invalid],now);
 assert.equal(view.observations.length,1);assert.equal(view.observations[0].kind,'activity');
 assert.deepEqual(labActivityContext(pair(),[],now).observations,[]);
});
test('confirmed routine uses occurrence calendar date, not delayed logging timestamp; plans never become activity',()=>{
 const plan=activityRoutinePlanSchema.parse({version:1,revision:randomUUID(),name:'Walking',components:{version:1,items:[{id:randomUUID(),title:'Walk',activityId:'walk',match:'suggested',minutes:null,distanceM:null}]},weekdays:[1],timeZone:'UTC',effectiveFrom:'2026-01-01',effectiveTo:null,preferredTime:null,paused:false,stepTarget:null});
 const row=activity('routine','2026-11-01',{capture:undefined,routineSource:{routineId:'routine-plan',revision:plan.revision,localDate:'2026-09-15',scheduledDate:'2026-09-15',occurrenceRevision:null,timeZone:'UTC',confirmedPerformed:true,timestampBasis:'log-time',planSnapshot:plan}});
 const planned={id:'plan',kind:'activity-routine',createdAt:row.createdAt,updatedAt:row.updatedAt,payload:{}} as ExperienceRecord;
 const view=labActivityContext(pair(),[row,planned],now);
 assert.equal(view.observations.length,1);assert.equal(view.observations[0].date,'2026-09-15');assert.equal(view.observations[0].kind,'walking');
});

test('calendar projection uses the selected non-TG marker window without transferring a lipid explanation',()=>{
 const view=labActivityContext(pair('alt'),[activity('walk')],now);
 assert.equal(view.status,'available');assert.equal(view.observations[0].kind,'walking');assert.equal(view.observations[0].timing,'calendar-window-only');
});
test('mixed activities never relabel the entire recorded duration as walking',()=>{
 const row=activity('mixed','2026-09-10',{minutes:30,components:{version:1,items:[{id:randomUUID(),title:'Walk',activityId:'walk',match:'reported',minutes:10,distanceM:null},{id:randomUUID(),title:'Run',activityId:'run',match:'reported',minutes:20,distanceM:null}]}});
 const view=labActivityContext(pair(),[row],now);
 assert.equal(view.observations[0].kind,'activity');assert.equal(view.observations[0].minutes,30);
});
