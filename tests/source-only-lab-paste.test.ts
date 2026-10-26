import test from'node:test';import assert from'node:assert/strict';import{parseLabPaste,labPasteCorrections}from'../shared/lab-paste';import{sourceOnlyLabSchema}from'../shared/precision-nutrition';
const date='2026-10-15T12:00:00Z';
test('unsupported explicit source columns offer exact source-only facts without changing default errors or interpreting thresholds',()=>{
 const text=' [ Unknown source group ] \nNovel assay, <0.50, arbitrary unit, < 2.0\nQualitative assay, Negative\nLDL, 3.20, mmol/L';const result=parseLabPaste(text,date);assert.equal(result.valid.length,1);assert.equal(result.valid[0].payload.value,3.2);assert.equal(result.errors.length,2);assert.equal(result.sourceOnly.length,2);const first=result.sourceOnly[0].payload;assert.equal(first.reportedAnalyte,'Novel assay');assert.equal(first.reportedValue,'<0.50');assert.equal(first.reportedUnit,'arbitrary unit');assert.equal(first.reportedReferenceInterval,'< 2.0');assert.equal(first.sourceInput.text,text.split('\n')[1]);assert.equal(first.sourceInput.reportedSection,' [ Unknown source group ] ');assert.equal(first.sourceInput.rowOrder,1);assert.deepEqual(sourceOnlyLabSchema.parse(first),first);assert.equal(result.sourceOnly[1].payload.reportedValue,'Negative');assert.equal(result.sourceOnly[1].payload.reportedUnit,null);assert.equal(Object.hasOwn(first,'unitReview'),false);
});
test('ambiguous, malformed and oversized rows stay correctable rather than becoming guessed source records',()=>{
 const text='not delimited\nUnknown,\n"Quoted, assay", 2, unit\nUnknown, 2, unit, ref, discarded\n['+'x'.repeat(1000)+']\nUnknown, 2, unit';const result=parseLabPaste(text,date);assert.equal(result.sourceOnly.length,0);assert.ok(result.errors.length>=6);assert.equal(parseLabPaste('Unknown, 2, unit','not-a-date').sourceOnly.length,0);
});
test('keeping source-only rows leaves only genuinely unresolved lines in a correction-only draft',()=>{
 const text='[ Source group ]\nALT, 20, U/L\nUnknown assay, 2.00, source-unit\nbad row';const result=parseLabPaste(text,date),kept=new Set(result.sourceOnly.map(row=>row.line));const remaining=result.errors.filter(error=>!kept.has(error.line));const correction=labPasteCorrections(text,remaining.map(error=>error.line));assert.equal(correction.split('\n').length,4);assert.ok(correction.includes('[ Source group ]'));assert.equal(correction.includes('ALT,'),false);assert.equal(correction.includes('Unknown assay,'),false);assert.ok(correction.includes('bad row'));assert.equal(result.sourceOnly[0].payload.reportedValue,'2.00');
});
test('source-only candidates respect the existing50-result bound without truncation or a marker/panel cap',()=>{
 const text=Array.from({length:50},(_,i)=>`[ Arbitrary source ${i} ]\nUnmapped assay ${i}, ${i}.00, original-unit`).join('\n');const result=parseLabPaste(text,date);assert.equal(result.sourceOnly.length,50);assert.equal(result.errors.length,50);assert.equal(result.sourceOnly[49].payload.sourceInput.rowOrder,99);assert.throws(()=>parseLabPaste(text+'\nAnother assay, 1, unit',date),/50 results/);assert.equal(parseLabPaste('LDL, 3.2, mmol/L\nLDL, 4.2, mmol/L',date).sourceOnly.length,1,'Repeated reported rows are offered as uninterpreted source data, never silently merged');
});

test('real source analytes beginning Test, Marker or Analyte are never silently discarded as column headings',()=>{
 const source='Analyte,Value,Unit\nTest assay, 0.00, original-unit\nMarker protein, Negative\nAnalyte, <0.50, arbitrary-unit';
 const parsed=parseLabPaste(source,date);
 assert.equal(parsed.sourceOnly.length,3);
 assert.deepEqual(parsed.sourceOnly.map(row=>row.payload.reportedAnalyte),['Test assay','Marker protein','Analyte']);
 assert.deepEqual(parsed.sourceOnly.map(row=>row.payload.sourceInput.rowOrder),[1,2,3]);
 assert.equal(parsed.sourceOnly[0].payload.reportedValue,'0.00');
 assert.equal(parsed.sourceOnly[1].payload.reportedUnit,null);
 assert.equal(parsed.sourceOnly[2].payload.reportedValue,'<0.50');
 assert.equal(parsed.errors.length,3);
 for(const header of ['Marker,Value,Unit','Test name\tResult\tUnits\tReference interval','marker value unit'])assert.equal(parseLabPaste(header+'\nALT, 20, U/L',date).valid.length,1);
 const many='Test,Value,Unit\n'+Array.from({length:50},(_,i)=>`Test assay ${i}, ${i}.00, original-unit`).join('\n');
 assert.equal(parseLabPaste(many,date).sourceOnly.length,50,'Structural headings do not consume the result limit; actual Test-prefixed rows do');
});

test('extra report columns are never silently discarded or promoted into an interpreted result',()=>{
 const parsed=parseLabPaste('Analyte,Value,Unit,Reference interval\nALT, 20, U/L, 10–30\nALT, 21, U/L, 10–30, unexplained',date);
 assert.equal(parsed.valid.length,0);
 assert.equal(parsed.errors.length,2);
 assert.equal(parsed.sourceOnly.length,1);
 assert.equal(parsed.sourceOnly[0].payload.reportedAnalyte,'ALT');
 assert.equal(parsed.sourceOnly[0].payload.reportedReferenceInterval,'10–30');
 assert.equal(parsed.sourceOnly[0].payload.sourceInput.rowOrder,1);
 assert.equal(parseLabPaste('ALT, 20, U/L,',date).valid.length,1,'An empty trailing column does not manufacture a range');
});
