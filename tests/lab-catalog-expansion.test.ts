import test from 'node:test';import assert from 'node:assert/strict';
import {parseLabPaste} from '../shared/lab-paste';
import {markerDefinitions,canonicalLab,buildPrecisionReport,contextSchema} from '../shared/precision-nutrition';
import {defaultPreferences} from '../shared/meal-intelligence';
import {additionalLabMarkers} from '../shared/additional-lab-markers';
import {labExplorerEntries} from '../shared/lab-explorer';
const date='2026-11-07T12:00:00Z';
const examples=[
 ['ALP','74','U/L','alp'],['Bilirubin','9','umol/L','bilirubin'],['Bilirubin, total','9','umol/L','bilirubin_total'],['Direct bilirubin','2','umol/L','bilirubin_direct'],
 ['Hemoglobin','145','g/L','hemoglobin'],['Hematocrit','42','%','hematocrit'],['RBC','4.8','10^12/L','rbc'],['WBC','6','10^9/L','wbc'],['Platelets','250','10^9/L','platelets'],
 ['Neutrophils','3','10^9/L','neutrophils'],['Lymphocytes','2','10^9/L','lymphocytes'],['Eosinophils','0','10^9/L','eosinophils'],['Basophils','0','10^9/L','basophils'],
 ['MCV','90','fL','mcv'],['MCHC','340','g/L','mchc'],['RDW','13','%','rdw_cv'],['MPV','10','fL','mpv'],
 ['Iron','15','umol/L','iron'],['TIBC','60','umol/L','tibc'],['Transferrin','2.5','g/L','transferrin'],['Non-HDL cholesterol','3.2','mmol/L','non_hdl'],['Total testosterone','15','nmol/L','testosterone_total']
]as const;
test('every owner-identified common test imports as an explicit supported measurement, retaining its source zero and unit',()=>{
 for(const[name,value,unit,id]of examples){
  const raw=`${name}, ${value}, ${unit}`,result=parseLabPaste(raw,date);
  assert.equal(result.valid.length,1,raw);assert.equal(result.errors.length,0,raw);
  const lab=result.valid[0].payload;assert.equal(lab.marker,id);assert.equal(lab.value,Number(value));assert.equal(lab.sourceInput?.text,raw);assert.equal(lab.sourceInput?.number,value);assert.equal(lab.sourceInput?.suppliedUnit,unit);
 }
 assert.equal(markerDefinitions.length,49);assert.equal(new Set(markerDefinitions.map(m=>m.id)).size,49);
});
test('differential percentages and absolute counts, RDW forms and hormone/fraction identity cannot be conflated',()=>{
 const result=parseLabPaste('Neutrophils, 55, %\nNeutrophils, 3, 10^9/L\nRDW, 13, %\nRDW, 42, fL',date);
 assert.deepEqual(result.valid.map(r=>r.payload.marker),['neutrophils_percent','neutrophils','rdw_cv','rdw_sd']);
 for(const raw of ['Neutrophils, 55','RDW, 13','Free testosterone, 5, ng/dL']){const r=parseLabPaste(raw,date);assert.equal(r.valid.length,0,raw);assert.equal(r.sourceOnly.length,1,raw);}
 const bilirubin=parseLabPaste('Bilirubin, 0, umol/L',date).valid[0].payload;
 const report=buildPrecisionReport([{id:'unfractionated',kind:'lab',payload:bilirubin,createdAt:date}],contextSchema.parse({}),defaultPreferences,null);
 assert.equal(report.labs[0].flag,'fraction unconfirmed');assert.equal(report.trends[0].comparable,false);assert.equal(report.trends[0].points[0].sourceValue,0);
});
test('physical unit conversions preserve native measurements and do not infer units from magnitude',()=>{
 const cases=[['Hemoglobin','14.5','g/dL',145,'g/L'],['Hematocrit','42','%',.42,'L/L'],['RBC','4.8','10^6/uL',4.8,'10^12/L'],['Platelets','250','K/uL',250,'10^9/L'],['MCHC','34','g/dL',340,'g/L'],['Transferrin','250','mg/dL',2.5,'g/L'],['Non HDL','120','mg/dL',120/38.67,'mmol/L'],['Iron','100','ug/dL',1000/55.845,'umol/L'],['Total testosterone','400','ng/dL',4000/288.42,'nmol/L']]as const;
 for(const[name,value,unit,expected,canonicalUnit]of cases){const p=parseLabPaste(`${name}, ${value}, ${unit}`,date).valid[0]?.payload;assert.ok(p,`${name} ${unit}`);const before=structuredClone(p),canonical=canonicalLab(p);assert.ok(Math.abs(canonical.value-expected)<1e-10);assert.equal(canonical.unit,canonicalUnit);assert.deepEqual(p,before);assert.equal(p.sourceInput?.suppliedUnit,unit);}
 const lowPercent=parseLabPaste('Hematocrit, 0.42, %',date).valid[0].payload;assert.equal(canonicalLab(lowPercent).value,.0042);
 assert.equal(parseLabPaste('Hemoglobin, 145',date).pending.length,1);
});
test('quoted or explicitly qualified CSV, attached percent and source ranges survive review parsing without invented limits',()=>{
 const raw='"Bilirubin, total", "0.5", "mg/dL", "0.2–1.2"';
 const result=parseLabPaste(raw,date);assert.equal(result.valid.length,1);assert.equal(result.valid[0].payload.marker,'bilirubin_total');assert.equal(result.valid[0].payload.referenceLow,.2);assert.equal(result.valid[0].payload.referenceHigh,1.2);assert.equal(result.valid[0].payload.sourceInput?.text,raw);
 assert.equal(parseLabPaste('Neutrophils, 55%',date).valid[0].payload.marker,'neutrophils_percent');
 const upper=parseLabPaste('ALP, 74, U/L, <130',date).valid[0].payload;assert.equal(upper.referenceLow,null);assert.equal(upper.referenceHigh,130);
 const blank=parseLabPaste('Basophils, , 10^9/L',date);assert.equal(blank.valid.length,0);assert.equal(blank.pending.length,0);assert.ok(blank.errors.length);
 for(const raw of ['ALP, 74, U/L, 130-40','ALP, 74, U/L, optimal <80','"ALP, 74, U/L'])assert.equal(parseLabPaste(raw,date).valid.length,0,raw);
});
test('all added measurements resolve in canonical category navigation; no new clinical action or duplicate source store is created',()=>{
 const rows=additionalLabMarkers.map((m,index)=>({id:'expanded-'+index,kind:'lab',createdAt:date,payload:parseLabPaste(`${m.name}, 0, ${m.units[0]}`,date).valid[0]?.payload}));
 assert.ok(rows.every(row=>row.payload),rows.filter(row=>!row.payload).map(r=>r.id).join(','));
 const view=buildPrecisionReport(rows,contextSchema.parse({}),defaultPreferences,null),entries=labExplorerEntries(view);
 assert.equal(entries.length,additionalLabMarkers.length);
 for(const marker of additionalLabMarkers)assert.deepEqual(entries.find(e=>e.id===marker.id)?.categories,marker.categories);
 assert.equal(view.supplements.length,0);
});
