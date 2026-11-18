import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {buildPrecisionReport,contextSchema,labSchema,checkinSchema,type PrecisionReport} from '../shared/precision-nutrition';
import {defaultPreferences} from '../shared/meal-intelligence';
import {recordedLabPanelReview} from '../shared/lab-panel-review';
import {labWeightContext,labWeightDiscussion} from '../shared/lab-response-events';
const now=Date.parse('2026-11-18T12:00:00Z');
function pair(marker='triglycerides'){
 const records=['2026-09-01','2026-10-01'].map((date,index)=>({id:'lab-'+index,kind:'lab',payload:labSchema.parse({marker,value:index?0.6:2.1,unit:'mmol/L',measuredAt:date+'T12:00:00Z',laboratory:'Synthetic lab',method:'Synthetic assay',fasting:'yes',referenceLow:null,referenceHigh:null,sourceReport:{importId:randomUUID(),enteredDate:date}})}));
 return recordedLabPanelReview(buildPrecisionReport(records,contextSchema.parse({}),defaultPreferences,null)).assessments[0];
}
function observation(id:string,date='2026-09-10',patch:Record<string,unknown>={}):PrecisionReport['checkins'][number]{return{id,...checkinSchema.parse({measuredAt:date+'T12:00:00Z',weightKg:75,bodyFatPercent:null,waistCm:null,bloating:null,energy:null,adherencePercent:null,planId:null,...patch})};}
test('weight context preserves original lb token and legacy canonical kg, strict source dates and unknown methodology without a derived change',()=>{
 const records=[observation('legacy'),observation('native','2026-09-20',{weightKg:150/2.2046226218487757,entrySource:{version:1,capture:'manual-checkin',fields:{weight:{value:'150.000',unit:'lb'}}}}),observation('same-day','2026-10-01'),observation('before','2026-08-31'),observation('other-field','2026-09-15',{weightKg:null,energy:0})],before=structuredClone(records);
 const view=labWeightContext(pair(),records,now);assert.equal(view.status,'available');assert.deepEqual(view.sourceIds,['lab-0','lab-1']);assert.deepEqual(view.observations.map(row=>[row.id,row.weight]),[['legacy',{value:75,unit:'kg',basis:'stored-canonical'}],['native',{value:'150.000',unit:'lb',basis:'original-entry'}]]);assert.equal(view.coverage,'unknown');assert.equal(view.attribution,'not-established');assert.equal('change' in view,false);assert.deepEqual(records,before);
});
test('invalid/duplicate measurement identity or altered original weight withdraw context; missing weight never becomes zero',()=>{
 const p=pair(),record=observation('one');assert.equal(labWeightContext(p,[record,record],now).status,'source-review');
 const invalid={...record,entrySource:{version:1,capture:'manual-checkin',fields:{weight:{value:'1',unit:'lb'}}}} as typeof record;assert.equal(labWeightContext(p,[invalid],now).status,'source-review');
 assert.deepEqual(labWeightContext(p,[observation('unknown','2026-09-10',{weightKg:null,energy:0})],now).observations,[]);
 assert.equal(labWeightContext({...p,comparable:false},[record],now).status,'source-review');assert.equal(labWeightContext({...p,latest:{...p.latest!,sourceReport:undefined}},[record],now).status,'source-review');
});
test('weight discussion uses exact current lipid sources without a personal weight status, causal attribution or borrowed analyte claim',()=>{
 for(const marker of ['triglycerides','ldl']){const p=pair(marker),view=labWeightContext(p,[observation('one')],now),discussion=labWeightDiscussion(p,view)!;assert.ok(discussion);assert.deepEqual(discussion.observationIds,['one']);assert.deepEqual(discussion.sourceIds,['lab-0','lab-1']);assert.equal(discussion.attribution,'not-established');assert.match(discussion.generalContext,/do not establish weight status, a consistent change/);assert.equal(discussion.evidence.url,`https://medlineplus.gov/lab-tests/${marker==='ldl'?'cholesterol-levels':'triglycerides-test'}/`);assert.equal(labWeightDiscussion(p,{...view,sourceIds:['other','lab-1']}),null);assert.equal(labWeightDiscussion({...p,comparable:false},view),null);assert.match(labWeightDiscussion(p,labWeightContext(p,[],now))!.nextStep,/Unrecorded weight history remains unknown/);}
 const p=pair(),view=labWeightContext(p,[],now);assert.equal(labWeightDiscussion({...p,id:'apob'},view),null);
 const revised={...p,latest:{...p.latest!,sourceReport:{...p.latest!.sourceReport!,enteredDate:'2026-09-05'}}};assert.equal(labWeightDiscussion(revised,view),null);assert.deepEqual(labWeightContext(revised,[observation('one')],now).observations,[]);
});
