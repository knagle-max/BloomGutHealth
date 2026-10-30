import {reportedLabSections} from '../shared/lab-history';
import test from'node:test';import assert from'node:assert/strict';import{groupLabHistory,labDateText}from'../shared/lab-history';import{parseLabPaste}from'../shared/lab-paste';
const base=parseLabPaste('[ Unknown exact heading ]\nLDL, 0.00, mmol/L','2026-10-01T12:00:00Z').valid[0].payload;
test('source history groups exact import/specimen identity, preserves report order, and never invents associations for old records',()=>{
 assert.deepEqual(groupLabHistory([]),{imports:[],unlinked:[]});
 for(const count of[1,2,6,8,12]){const rows=Array.from({length:count},(_,i)=>({...base,id:'row-'+i,measuredAt:`2026-10-${String(i+1).padStart(2,'0')}T12:00:00Z`,sourceReport:{importId:`fb001025-1025-4025-8025-${String(i+1).padStart(12,'0')}`,reportIdentifier:' Same printed report ',specimenIdentifier:' specimen '+i}}));const result=groupLabHistory(rows);assert.equal(result.imports.length,count);assert.equal(result.imports.flatMap(group=>group.rows).length,count);assert.equal(result.unlinked.length,0);assert.equal(result.imports[0].rows[0].value,0);}
 const sourceReport={importId:'fb001025-1025-4025-8025-000000000001',reportIdentifier:' Exact report ',specimenIdentifier:' specimen-A '};const row={...base,id:'late',sourceReport,sourceInput:{...base.sourceInput!,rowOrder:10}};const first={...row,id:'first',sourceInput:{...row.sourceInput,rowOrder:1}};const sameDateSpecimen={...row,id:'other',sourceReport:{...sourceReport,specimenIdentifier:' specimen-B '}};const legacy={...base,id:'legacy'};const input=[row,legacy,sameDateSpecimen,first],before=structuredClone(input),result=groupLabHistory(input);assert.equal(result.imports.length,2);assert.deepEqual(result.imports[0].rows.map(row=>row.id),['first','late']);assert.equal(result.imports[0].source.reportIdentifier,' Exact report ');assert.equal(result.imports[0].rows[0].sourceInput?.reportedSection,'[ Unknown exact heading ]');assert.deepEqual(result.unlinked,[legacy]);assert.deepEqual(input,before);
});

test('date labels prefer explicitly entered text without reconstructing legacy timezone or changing timestamps',()=>{
 const timestamp='2026-10-14T22:00:00Z';assert.equal(labDateText(timestamp,{importId:'fb001025-1025-4025-8025-000000000001',enteredDate:'2026-10-15'}),'2026-10-15');assert.equal(labDateText(timestamp),'2026-10-14');assert.equal(timestamp,'2026-10-14T22:00:00Z');
});

test('source date view preserves exact entered calendars, pending values, unrelated specimen identities and input order',async()=>{
 const {labHistoryDates,labHistoryOnDate}=await import('../shared/lab-history');
 const report={importId:'fb001025-1025-4025-8025-000000000001',enteredDate:'2026-10-15'};
 const a={...base,id:'a',measuredAt:'2026-10-14T22:00:00Z',sourceReport:report};
 const b={...a,id:'b',sourceReport:{...report,importId:'fb001025-1025-4025-8025-000000000002'}};
 const legacy={...base,id:'legacy',measuredAt:'2026-10-14T22:00:00Z'};
 const pending={...parseLabPaste('LDL, 120','2026-10-15T12:00:00Z').pending[0].payload,id:'pending'};
 const raw={...parseLabPaste('Unknown assay, detected, custom-unit','2026-10-15T12:00:00Z').sourceOnly[0].payload,id:'raw'};
 const rows=[a,legacy,b,pending,raw],original=structuredClone(rows);
 assert.deepEqual(labHistoryDates(rows),['2026-10-15','2026-10-14']);
 assert.deepEqual(labHistoryOnDate(rows,'2026-10-15').map(row=>row.id),['a','b','pending','raw']);
 assert.equal(groupLabHistory(labHistoryOnDate(rows,'2026-10-15')).imports.length,2);
 assert.equal(labHistoryOnDate(rows,'missing').length,0);
 assert.deepEqual(labHistoryOnDate(rows,''),rows);assert.deepEqual(rows,original);
});

test('reported section navigation retains contiguous original order, repeated headings and absent source headings',()=>{
 const base=parseLabPaste('[ First ]\nLDL, 1, mmol/L\n[ Second ]\nALT, 2, U/L','2026-10-01T12:00:00Z').valid;
 const rows=[{...base[0].payload,id:'a'},{...base[0].payload,id:'b'},{...base[1].payload,id:'c'},{...base[0].payload,id:'d'},{...base[0].payload,id:'e',sourceInput:undefined}];
 const snapshot=structuredClone(rows),sections=reportedLabSections(rows);
 assert.deepEqual(sections.map(section=>[section.firstId,section.reportedSection,section.rows.map(row=>row.id)]),[['a','[ First ]',['a','b']],['c','[ Second ]',['c']],['d','[ First ]',['d']],['e',undefined,['e']]]);assert.deepEqual(rows,snapshot);assert.deepEqual(reportedLabSections([]),[]);
});
