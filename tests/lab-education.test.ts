import test from 'node:test';
import assert from 'node:assert/strict';
import {markerDefinitions,LAB_MARKER_EDUCATION_VERSION,buildPrecisionReport,contextSchema} from '../shared/precision-nutrition';
import {parseLabPaste} from '../shared/lab-paste';
import {labExplorerEntries} from '../shared/lab-explorer';
import {defaultPreferences} from '../shared/meal-intelligence';

test('expanded catalog retains original14 measurement identities, units and source verification while new descriptions remain drafts',()=>{
 assert.equal(LAB_MARKER_EDUCATION_VERSION,'biology-content-r4m1-2026-11-08.3+bloodwork-catalog-2026-11-09-v1');
 assert.deepEqual(markerDefinitions.slice(0,14).map(({id,units})=>[id,[...units]]),[
  ['ldl',['mmol/L','mg/dL']],['apob',['g/L','mg/dL']],['triglycerides',['mmol/L','mg/dL']],['hdl',['mmol/L','mg/dL']],['alt',['U/L']],['ast',['U/L']],['ggt',['U/L']],['glucose',['mmol/L','mg/dL']],['hba1c',['%','mmol/mol']],['b12',['pmol/L','pg/mL']],['vitamin_d',['nmol/L','ng/mL']],['ferritin',['ug/L','ng/mL']],['folate',['nmol/L','ng/mL']],['homocysteine',['umol/L']]]);
 for(const definition of markerDefinitions){
  assert.deepEqual(Object.keys(definition.education).sort(),['context','definition','sources']);
  assert.ok(definition.education.definition&&definition.education.context&&definition.education.sources.length);
  for(const source of definition.education.sources){const url=new URL(source.url);assert.equal(url.protocol,'https:');assert.ok(['medlineplus.gov','ods.od.nih.gov','pubmed.ncbi.nlm.nih.gov','pmc.ncbi.nlm.nih.gov','www.ncbi.nlm.nih.gov'].includes(url.hostname));assert.equal(url.search,'');assert.equal(source.accessedOn,markerDefinitions.indexOf(definition)<14?'2026-11-08':null);}
 }
 assert.match(markerDefinitions.find(entry=>entry.id==='vitamin_d')!.education.definition,/1,25-dihydroxy/);
 assert.match(markerDefinitions.find(entry=>entry.id==='apob')!.education.context,/does not identify an APOB gene variant/);
});
test('general education never identifies unsupported source assays or supplies a personal result, diagnosis or dose',()=>{
 const parsed=parseLabPaste('RBC folate\t800\tnmol/L\nActive vitamin D\t40\tpg/mL','2026-10-01T12:00:00Z','Synthetic lab');
 assert.equal(parsed.valid.length,0);assert.equal(parsed.pending.length,0);assert.equal(parsed.sourceOnly.length,2);
 const rows=parsed.sourceOnly.map((row,index)=>({id:'source-assay-'+index,kind:'lab',payload:row.payload}));
 const report=buildPrecisionReport(rows,contextSchema.parse({}),defaultPreferences,null);const snapshot=JSON.stringify(report),entries=labExplorerEntries(report);
 assert.equal(report.labs.length,0);assert.equal(report.trends.length,0);assert.equal(entries.length,2);
 for(const entry of entries){assert.equal(markerDefinitions.find(definition=>definition.id===entry.id),undefined);assert.deepEqual(entry.categories,['other']);assert.equal(entry.trend,undefined);}
 assert.deepEqual(entries.flatMap(entry=>entry.sourceOnly.map(row=>[row.reportedAnalyte,row.reportedValue,row.reportedUnit])),[['RBC folate','800','nmol/L'],['Active vitamin D','40','pg/mL']]);assert.equal(JSON.stringify(report),snapshot);
});
