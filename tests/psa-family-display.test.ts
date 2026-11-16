import test from 'node:test';
import assert from 'node:assert/strict';
import {labSourceAnalyteFamily,additionalLabSourceIdentity} from '../shared/lab-source-identity';
import {parseLabPaste} from '../shared/lab-paste';
import {buildPrecisionReport,contextSchema,canonicalLab} from '../shared/precision-nutrition';
import {defaultPreferences} from '../shared/meal-intelligence';
import {labExplorerEntries} from '../shared/lab-explorer';
import {hasConfirmedLabIdentity} from '../shared/lab-assay-identity';
const date='2026-08-09T12:00:00Z';
test('generic PSA has a known family and an unconfirmed assay without rewriting0.5ug/L, source identity, dates or history',()=>{
 for(const label of ['PSA','Prostate Specific Antigen','Prostate-specific antigen (PSA)']){
  const parsed=parseLabPaste(`${label}, 0.5, ug/L`,date);assert.equal(parsed.valid.length,0);assert.equal(parsed.sourceOnly.length,1);
  const source=parsed.sourceOnly[0].payload,report=buildPrecisionReport([{id:'psa-source',kind:'lab',payload:source,createdAt:date}],contextSchema.parse({}),defaultPreferences,null),original=JSON.stringify(report);
  const entry=labExplorerEntries(report)[0];assert.equal(entry.name,'Prostate-specific antigen (PSA)');assert.equal(entry.familyIdentity?.analyteFamily,'prostate-specific-antigen');assert.equal(entry.familyIdentity?.confirmedMarkerId,null);assert.equal(entry.familyIdentity?.assaySubtype,'unspecified');assert.equal(entry.familyIdentity?.status,'Total/free assay type not confirmed');assert.equal(entry.trend,undefined);assert.equal(entry.recordCount,1);assert.deepEqual(entry.categories,['other']);assert.equal(entry.sourceOnly[0].reportedValue,'0.5');assert.equal(entry.sourceOnly[0].reportedUnit,'ug/L');assert.equal(entry.sourceOnly[0].measuredAt,date);assert.equal(report.trends.length,0);assert.equal(JSON.stringify(report),original);
 }
 assert.ok(additionalLabSourceIdentity('PSA','ug/L').ambiguous);assert.equal(additionalLabSourceIdentity('PSA','ug/L').id,undefined);
});
test('reported total/free/ratio labels and conflicting method remain separate; unsupported units never establish a subtype',()=>{
 for(const label of ['Total PSA','PSA total','Total prostate-specific antigen (PSA)']){const p=parseLabPaste(`${label}, 0.5, ug/L`,date);assert.equal(p.valid[0].payload.marker,'psa_total');assert.equal(canonicalLab(p.valid[0].payload).value,0.5);assert.equal(canonicalLab(p.valid[0].payload).unit,'ng/mL');assert.equal(labSourceAnalyteFamily(label)?.assaySubtype,'total');}
 for(const [label,subtype] of [['Free PSA','free'],['fPSA','free'],['PSA ratio','ratio'],['% free PSA','ratio'],['Free-to-total PSA ratio','ratio']]as const){const p=parseLabPaste(`${label}, 0.5, %`,date);assert.equal(p.valid.length,0);assert.equal(p.sourceOnly.length,1);assert.equal(labSourceAnalyteFamily(label)?.assaySubtype,subtype);assert.equal(labSourceAnalyteFamily(label)?.confirmedMarkerId,null);assert.equal(hasConfirmedLabIdentity('psa_total',{sourceInput:{text:`${label}, 0.5, %`}}),false);}
 for(const method of ['Free PSA CMIA','fPSA','FreePSA CMIA','PSA ratio','Free-to-total PSA ratio'])assert.equal(hasConfirmedLabIdentity('psa_total',{sourceInput:{text:'Total PSA, 0.5, ug/L'},method}),false);
 assert.equal(labSourceAnalyteFamily('Total PSA','Free PSA CMIA')?.assaySubtype,'conflicting');assert.equal(hasConfirmedLabIdentity('psa_total',{sourceInput:{text:'Total PSA, 0.5, ug/L'},method:'Free PSA CMIA'}),false);
 for(const unit of ['%', 'not supplied', 'unrecognized-unit']){const p=parseLabPaste(`PSA, 0.5, ${unit}`,date);assert.equal(p.valid.length,0);assert.equal(p.sourceOnly.length,1);assert.equal(labSourceAnalyteFamily(p.sourceOnly[0].payload.reportedAnalyte)?.assaySubtype,'unspecified');}
 for(const label of ['PSA velocity','PSA-like synthetic marker','PSAT','Unknown source analyte','Vitamin D','Bilirubin'])assert.equal(labSourceAnalyteFamily(label),null);
});
test('multiple original PSA source rows stay grouped by exact original labels with stable IDs and no canonical equivalence',()=>{
 const source=parseLabPaste('PSA, 0.5, ug/L',date).sourceOnly[0].payload;
 const report=buildPrecisionReport([{id:'first',kind:'lab',payload:source,createdAt:date},{id:'second',kind:'lab',payload:parseLabPaste('PSA, 0, ug/L','2026-09-09T12:00:00Z').sourceOnly[0].payload,createdAt:'2026-09-09T12:00:00Z'}],contextSchema.parse({}),defaultPreferences,null);
 const entry=labExplorerEntries(report)[0];assert.equal(entry.id,'source:first');assert.equal(entry.recordCount,2);assert.deepEqual(entry.sourceOnly.map(row=>row.id).sort(),['first','second']);assert.deepEqual(entry.sourceOnly,report.sourceOnlyLabs);assert.equal(entry.trend,undefined);assert.equal(entry.familyIdentity?.confirmedMarkerId,null);
 assert.equal(labExplorerEntries(buildPrecisionReport([],contextSchema.parse({}),defaultPreferences,null)).length,0);
});
