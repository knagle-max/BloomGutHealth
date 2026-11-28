import test from 'node:test';import assert from 'node:assert/strict';
import {canonicalLab} from '../shared/precision-nutrition';
import {assessLabComparability} from '../shared/lab-comparability';
import {classifyLabDisplayPair,labDisplaySequence,labSegmentStyleForAssessment,type LabSegmentObservation} from '../shared/lab-display-segments';
const point=(id:string,date:string,patch:Partial<LabSegmentObservation>={}):LabSegmentObservation=>({id,date,sourceValue:10,sourceUnit:'U/L',value:10,unit:'U/L',laboratory:'Synthetic lab',method:'Synthetic assay',fasting:'unknown',...patch});
const a=point('a','2026-01-01T12:00:00Z'),b=point('b','2026-02-01T12:00:00Z');
test('pairwise solid/dashed presentation preserves authoritative scientific comparability',()=>{
 assert.deepEqual(classifyLabDisplayPair('alt',a,b),{style:'solid',reasons:[]});
 for(const patch of[{method:''},{method:'Other assay'},{laboratory:'Not supplied'},{laboratory:'Different lab'},{fasting:'yes'as const}]){const right={...b,...patch},before=assessLabComparability('alt',[a,right]);assert.equal(classifyLabDisplayPair('alt',a,right).style,'dashed');assert.equal(before.comparable,false);assert.deepEqual(assessLabComparability('alt',[a,right]),before);}
 for(const marker of['glucose','triglycerides']){const p={...a,sourceUnit:'mmol/L',unit:'mmol/L'},q={...b,sourceUnit:'mmol/L',unit:'mmol/L'};assert.equal(classifyLabDisplayPair(marker,p,q).style,'dashed');assert.ok(classifyLabDisplayPair(marker,p,q).reasons.includes('fasting-unknown'));}
});
test('verified canonical conversions may connect, but wrong projections, analytes, dates and inactive sources disconnect',()=>{
 const left={...a,sourceValue:100,sourceUnit:'mg/dL',...canonicalLab({marker:'ldl',value:100,unit:'mg/dL',method:a.method})},right={...b,sourceValue:3,sourceUnit:'mmol/L',unit:'mmol/L',value:3};
 assert.equal(classifyLabDisplayPair('ldl',left,right).style,'solid');
 for(const patch of[{value:NaN},{sourceValue:-1},{value:-1},{date:'not-a-date'},{date:'2026-02-30T12:00:00Z'},{date:a.date},{date:'2025-01-01T12:00:00Z'},{unit:'mg/dL'},{sourceUnit:'unverified unit'},{value:99},{sourceState:'withdrawn'as const},{sourceState:'superseded'as const},{unitReview:{status:'pending'}}])assert.equal(classifyLabDisplayPair('ldl',left,{...right,...patch}).style,'disconnected',JSON.stringify(patch));
 for(const marker of['bilirubin','vitamin_d','psa_total','testosterone_total']){const source=marker==='vitamin_d'?'1,25-dihydroxy vitamin D':marker==='psa_total'?'Free PSA':marker==='testosterone_total'?'Free testosterone':'Bilirubin';assert.equal(classifyLabDisplayPair(marker,{...a,sourceInput:{text:source,number:'10',suppliedUnit:'U/L',capture:'pasted-report'}},b).style,'disconnected');}
 for(const [marker,unit,method,text] of [['vitamin_d','nmol/L','25(OH)D','1,25-dihydroxy vitamin D'],['psa_total','ng/mL','Total PSA','Free PSA'],['testosterone_total','nmol/L','Total testosterone','Free testosterone']]){const first={...a,unit,sourceUnit:unit,method},second={...b,unit,sourceUnit:unit,method,sourceInput:{text,number:'10',suppliedUnit:unit,capture:'pasted-report' as const}};assert.equal(classifyLabDisplayPair(marker,first,second).style,'disconnected');assert.ok(classifyLabDisplayPair(marker,first,second).reasons.includes('assay-identity'));}
 assert.equal(labSegmentStyleForAssessment({comparable:false,reasons:['future-unclassified-source-reason']}),'disconnected');assert.equal(labSegmentStyleForAssessment({comparable:false,reasons:[]}),'disconnected');assert.equal(labSegmentStyleForAssessment({comparable:true,reasons:['method-unknown']}),'disconnected');
});
test('sorted display copy classifies adjacent pairs independently and never bridges an invalid occurrence',()=>{
 const input=[a,b,point('c','2026-03-01T12:00:00Z',{laboratory:'Unknown'}),point('d','2026-04-01T12:00:00Z',{sourceState:'withdrawn'}),point('e','2026-05-01T12:00:00Z'),point('f','2026-12-01T12:00:00Z')],reordered=[input[5],input[2],input[0],input[4],input[1],input[3]],before=structuredClone(reordered);
 const display=labDisplaySequence('alt',reordered);assert.deepEqual(display.points.map(row=>row.id),['a','b','c','d','e','f']);assert.deepEqual(display.segments.map(row=>row.style),['solid','dashed','disconnected','disconnected','solid']);assert.deepEqual(display.plottable.map(row=>row.id),['a','b','c','e','f']);assert.deepEqual(reordered,before);assert.equal(display.segments.some(row=>row.left.id==='c'&&row.right.id==='e'),false);
});
test('duplicate timestamps, unordered collection days and invalid dates remain selectable barriers',()=>{
 const same=point('same',b.date),duplicates=labDisplaySequence('alt',[a,b,same,point('last','2026-03-01T12:00:00Z')]);assert.ok(duplicates.segments.every(row=>row.style==='disconnected'));assert.equal(duplicates.plottable.length,4);
 const sourceReport={enteredDate:'2026-02-01'},day=labDisplaySequence('alt',[a,{...b,sourceReport},point('later','2026-02-01T18:00:00Z',{sourceReport}),point('last','2026-03-01T12:00:00Z')]);assert.ok(day.segments.every(row=>row.style==='disconnected'));
 const missing=labDisplaySequence('alt',[a,point('unknown','not-a-date'),b]);assert.ok(missing.segments.every(row=>row.style==='disconnected'));assert.equal(missing.plottable.length,2);assert.ok(missing.segments.every(row=>row.reasons.includes('sequence-date-unknown')));
 const corrected=labDisplaySequence('alt',[a,{...b,supersededIds:['a']}]);assert.equal(corrected.plottable.length,1);assert.equal(corrected.segments[0].style,'disconnected');
});
test('1/2/4/12 irregular observations and true zero keep exact timestamps, values and source objects',()=>{
 for(const count of[1,2,4,12]){const input=Array.from({length:count},(_,i)=>point('point-'+i,new Date(Date.UTC(2025,0,1+i*i*3)).toISOString(),{sourceValue:i,value:i})),copy=structuredClone(input),display=labDisplaySequence('alt',input);assert.equal(display.segments.length,Math.max(0,count-1));assert.equal(display.plottable[0].value,0);assert.deepEqual(input,copy);assert.ok(display.segments.every(row=>row.style==='solid'));}
});
