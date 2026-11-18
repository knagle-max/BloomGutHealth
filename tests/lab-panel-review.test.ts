import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPrecisionReport,contextSchema,labSchema,sourceOnlyLabSchema} from '../shared/precision-nutrition';
import {defaultPreferences} from '../shared/meal-intelligence';
import {recordedLabPanelReview} from '../shared/lab-panel-review';
import {parseLabPaste} from '../shared/lab-paste';
const dates=['2026-09-01T12:00:00Z','2026-10-01T12:00:00Z'];
const lab=(marker:string,value:number,time=1,patch:Record<string,unknown>={})=>({id:`${marker}-${time}`,kind:'lab',payload:labSchema.parse({marker,value,unit:marker==='apob'?'g/L':['ldl','triglycerides','glucose'].includes(marker)?'mmol/L':'U/L',measuredAt:dates[time],laboratory:'Synthetic laboratory',method:'Synthetic assay',fasting:'yes',referenceLow:null,referenceHigh:marker==='apob'?1.2:marker==='ldl'?3:marker==='triglycerides'?2:40,sourceReport:{importId:`00000000-0000-4000-8000-00000000000${time+1}`},...patch})});
const report=(rows:any[])=>buildPrecisionReport(rows,contextSchema.parse({}),defaultPreferences,null);
test('whole-panel review keeps non-TG cues, zero, all records and related measured markers without a magnitude leaderboard',()=>{
 const r=report([lab('alt',80),lab('ast',0),lab('triglycerides',1)]),before=JSON.stringify(r),review=recordedLabPanelReview(r);
 assert.equal(review.originalRecords,3);assert.deepEqual(review.selected.map(f=>f.id),['liver']);
 assert.equal(review.selected[0].members.find(row=>row.id==='ast')!.latest!.value,0);
 assert.equal(review.assessments.find(row=>row.id==='alt')!.state,'source-bound');
 assert.equal(review.assessments.find(row=>row.id==='triglycerides')!.state,'not-selected');
 assert.equal(review.clinicalSignificance,'not-assessed');assert.equal(review.personalAttribution,'not-assessed');assert.equal(JSON.stringify(r),before);
});
test('aligned lipid tradeoff requires paired compatible reports and preserves both LDL and ApoB cues',()=>{
 const rows=[lab('triglycerides',3,0),lab('triglycerides',1),lab('ldl',2,0),lab('ldl',4),lab('apob',1,0),lab('apob',1.5)];
 const review=recordedLabPanelReview(report(rows));assert.equal(review.lipidTradeoffs.length,2);assert.equal(review.originalRecords,6);
 for(const patch of [{method:'Different assay'},{laboratory:'Other lab'},{fasting:'unknown'},{sourceReport:{importId:'00000000-0000-4000-8000-000000000009'}}]){
  const changed=[...rows.slice(0,1),lab('triglycerides',1,1,patch),...rows.slice(2)];assert.equal(recordedLabPanelReview(report(changed)).lipidTradeoffs.length,0);
 }
});
test('same-time ambiguity and missing source bounds do not silently select a value or invent a normal interval',()=>{
 const duplicate={...lab('alt',20),id:'alt-duplicate'};
 const review=recordedLabPanelReview(report([lab('alt',80),duplicate,lab('ast',100,1,{referenceHigh:null})]));
 assert.equal(review.originalRecords,3);assert.equal(review.sourceReview[0].latest,null);
 assert.equal(review.assessments.find(r=>r.id==='ast')!.state,'not-selected');assert.equal(review.selected.length,0);
});
test('date-only report observations cannot be ordered by their different stored UTC timestamps',()=>{
 const a=lab('alt',80,1,{measuredAt:'2026-10-01T06:00:00Z',sourceReport:{importId:'00000000-0000-4000-8000-000000000001',enteredDate:'2026-10-01'}});
 const b={...lab('alt',20,1,{measuredAt:'2026-10-01T18:00:00Z',sourceReport:{importId:'00000000-0000-4000-8000-000000000002',enteredDate:'2026-10-01'}}),id:'second-date-only'};
 const review=recordedLabPanelReview(report([a,b]));assert.equal(review.originalRecords,2);assert.equal(review.sourceReview[0].latest,null);assert.equal(review.sourceReview[0].change,null);assert.equal(review.selected.length,0);
});
test('transition cue requires unchanged source bounds and comparable observations; deletes recompute without cached findings',()=>{
 const before=lab('alt',60,0),after=lab('alt',20);
 assert.equal(recordedLabPanelReview(report([before,after])).assessments[0].state,'source-bound-transition');
 assert.equal(recordedLabPanelReview(report([before,lab('alt',20,1,{referenceHigh:50})])).assessments[0].state,'not-selected');
 assert.equal(recordedLabPanelReview(report([after])).selected.length,0);assert.equal(recordedLabPanelReview(report([])).originalRecords,0);
});
test('source-only labels stay in coverage and require source review instead of gaining a clinical interpretation',()=>{
 const payload=sourceOnlyLabSchema.parse({sourceOnly:true,reportedAnalyte:'PSA',reportedValue:'0.5',reportedUnit:'ug/L',measuredAt:dates[1],laboratory:'Synthetic',method:'unknown',fasting:'unknown',sourceInput:{text:'PSA 0.5 ug/L',number:'0.5',suppliedUnit:'ug/L',capture:'manual-report'}});
 const review=recordedLabPanelReview(report([{id:'source-psa',kind:'lab',payload}]));
 assert.equal(review.originalRecords,1);assert.equal(review.sourceReview[0].latest,null);assert.equal(review.sourceReview[0].sourceId,'source-psa');assert.match(review.sourceReview[0].reason,/assay/);assert.equal(review.selected.length,0);
});
test('newest unresolved units suppress an older selected value, including tradeoff arithmetic',()=>{
 const pending=parseLabPaste('LDL,120',dates[1]).pending[0].payload;
 const review=recordedLabPanelReview(report([lab('ldl',4,0),{id:'pending-ldl',kind:'lab',payload:pending}]));
 const row=review.assessments[0];assert.equal(row.sourceId,'pending-ldl');assert.equal(row.latest,null);assert.equal(row.previous,null);assert.equal(row.change,null);assert.equal(row.position,null);assert.equal(row.comparable,false);assert.equal(row.state,'source-review');assert.equal(review.originalRecords,2);
});
test('one-sided exclusive source threshold includes equality, with no fabricated opposite bound',()=>{
 const at=lab('alt',40,1,{sourceInput:{text:'ALT,40,U/L,<40',number:'40',suppliedUnit:'U/L',capture:'pasted-report'}});
 const row=recordedLabPanelReview(report([at])).assessments[0];assert.equal(row.position,'above');assert.equal(row.state,'source-bound');
 assert.equal(recordedLabPanelReview(report([lab('alt',39,1,{sourceInput:at.payload.sourceInput})])).selected.length,0);
});

test('aligned opposing lipid directions stay visible without source bounds or a clinical worsening label',()=>{
 const rows=[lab('triglycerides',2.1,0,{referenceHigh:null}),lab('triglycerides',0.6,1,{referenceHigh:null}),lab('ldl',2,0,{referenceHigh:5}),lab('ldl',2.5,1,{referenceHigh:5})];
 const review=recordedLabPanelReview(report(rows));assert.equal(review.lipidTradeoffs.length,1);assert.equal(review.assessments.find(row=>row.id==='ldl')!.position,null);
 assert.match(review.lipidTradeoffs[0].text,/Triglycerides decreased while LDL cholesterol increased/);assert.doesNotMatch(review.lipidTradeoffs[0].text,/outside|worsened|improved|normal|optimal/);assert.deepEqual(review.lipidTradeoffs[0].sourceIds,['triglycerides-0','triglycerides-1','ldl-0','ldl-1']);
});

const glycemicRows=()=>[lab('hba1c',6.2,1,{unit:'%',referenceLow:4.5,referenceHigh:5.9}),lab('glucose',5,1,{referenceLow:3.3,referenceHigh:5.5})];
test('BIO-VALUE03: same-report source discrepancy explains different glycemic timescales with evidence and an original-result path, without clinical promotion',()=>{
 const rows=glycemicRows(),r=report(rows),before=JSON.stringify(r),finding=recordedLabPanelReview(r).glycemicDiscrepancy!;
 assert.ok(finding);assert.deepEqual(finding.sourceIds,['hba1c-1','glucose-1']);assert.match(finding.meaning,/does not cancel/);assert.match(finding.meaning,/two to three months/);assert.equal(finding.releaseState,'feature-eligible');assert.equal(finding.clinicalSignificance,'not-assessed');assert.ok(finding.citations.length>=2);assert.match(finding.action.href,/hba1c-1/);assert.equal(JSON.stringify(r),before);
});
test('BIO-VALUE01/06: normal noise, missing bounds/fasting, random glucose, different reports and unresolved units do not acquire glycemic discrepancy interpretation',()=>{
 const [a,g]=glycemicRows();
 for(const rows of [[a],[g],[{...a,payload:{...a.payload,value:5.8}},g],[a,{...g,payload:{...g.payload,referenceLow:null}}],[a,{...g,payload:{...g.payload,fasting:'unknown'}}],[a,{...g,payload:{...g.payload,fasting:'no'}}],[a,{...g,payload:{...g.payload,sourceReport:{importId:'00000000-0000-4000-8000-000000000009'}}}],[a,{...g,payload:{...g.payload,measuredAt:dates[0]}}],[a,{...g,payload:{...g.payload,value:8}}]])assert.equal(recordedLabPanelReview(report(rows)).glycemicDiscrepancy,null);
});
test('BIO-VALUE07/13: source corrections change the glycemic dependency token and removing or correcting the affected source retracts the finding',()=>{
 const [a,g]=glycemicRows(),initial=recordedLabPanelReview(report([a,g])).glycemicDiscrepancy!;
 const changed=recordedLabPanelReview(report([{...a,payload:{...a.payload,value:6.3}},g])).glycemicDiscrepancy!;
 assert.notEqual(initial.sourceEpoch,changed.sourceEpoch);assert.equal(recordedLabPanelReview(report([{...a,payload:{...a.payload,value:5.5}},g])).glycemicDiscrepancy,null);assert.equal(recordedLabPanelReview(report([g])).glycemicDiscrepancy,null);
});

test('BIO-VALUE01: an opposing in-range lipid change stays a detailed fact, without a default concern or invented overall benefit',()=>{
 const rows=[lab('triglycerides',1.5,0,{referenceHigh:2}),lab('triglycerides',1.49,1,{referenceHigh:2}),lab('ldl',2,0,{referenceHigh:3}),lab('ldl',2.01,1,{referenceHigh:3})],review=recordedLabPanelReview(report(rows));assert.equal(review.lipidTradeoffs.length,1);assert.equal(review.lipidSourceDiscrepancy,null);
 const noBounds=rows.map(row=>({...row,payload:{...row.payload,referenceHigh:null}}));assert.equal(recordedLabPanelReview(report(noBounds)).lipidSourceDiscrepancy,null);
});
test('BIO-VALUE02/03: source-bound lipid discrepancy explains why a triglyceride fall does not cancel other above-bound results, with original evidence and no risk score',()=>{
 const rows=[lab('triglycerides',3,0),lab('triglycerides',1),lab('ldl',2,0),lab('ldl',4),lab('apob',1,0),lab('apob',1.5)],review=recordedLabPanelReview(report(rows)),finding=review.lipidSourceDiscrepancy!;
 assert.ok(finding);assert.match(finding.finding,/LDL cholesterol and ApoB/);assert.match(finding.meaning,/different parts/);assert.ok(finding.citations.length>0);assert.equal(finding.clinicalSignificance,'not-assessed');assert.equal(finding.sourceIds.length,6);assert.match(finding.action.href,/ldl-1/);
 assert.equal(recordedLabPanelReview(report(rows.filter(row=>!['ldl','apob'].includes(row.payload.marker)))).lipidSourceDiscrepancy,null);
});
