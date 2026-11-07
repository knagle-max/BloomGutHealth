import test from 'node:test';
import assert from 'node:assert/strict';
import * as paste from '../shared/lab-paste';
const date='2026-10-15T12:00:00Z';
test('pasted report keeps verbatim arbitrary headings, original row positions, source numbers and original unit text',()=>{
 const lines=['  [ LIPIDS & CARDIOVASCULAR ]  ','LDL, 3.20, mmol/L','','[ Unknown source taxonomy ]','  Ferritin, 20.0, µg/L  ','[ ENDOCRINE ]','Vitamin D, 75'];
 const result=paste.parseLabPaste(lines.join('\n'),date,'Synthetic lab');assert.deepEqual(result.errors,[]);assert.equal(result.valid.length,2);assert.equal(result.pending.length,1);
 assert.equal(result.valid[0].payload.sourceInput?.reportedSection,lines[0]);assert.equal(result.valid[0].payload.sourceInput?.rowOrder,1);assert.equal(result.valid[0].payload.sourceInput?.number,'3.20');
 const iron=result.valid[1].payload;assert.equal(iron.sourceInput?.reportedSection,lines[3]);assert.equal(iron.sourceInput?.rowOrder,4);assert.equal(iron.sourceInput?.text,lines[4]);assert.equal(iron.sourceInput?.suppliedUnit,'µg/L');assert.equal(iron.unit,'ug/L');assert.equal(iron.marker,'ferritin');
 assert.equal(result.pending[0].payload.sourceInput?.reportedSection,lines[5]);assert.equal(result.pending[0].payload.sourceInput?.rowOrder,6);assert.equal(result.pending[0].payload.unitReview?.status,'pending');assert.equal(result.pending[0].payload.unitReview?.originalValue,75);
});
test('correction-only draft retains heading and original line positions without repeating acknowledged rows',()=>{
 const text=['[ Original Group ]','LDL, 3.20, mmol/L','',' [ Unknown Group ] ','Bad analyte, 1.20, mmol/L','ALT, 20, U/L'].join('\n');const parsed=paste.parseLabPaste(text,date);assert.equal(parsed.errors.length,1);
 const correction=(paste as any).labPasteCorrections(text,parsed.errors.map(e=>e.line));assert.equal(correction.split('\n').length,text.split('\n').length);assert.equal(correction.includes('LDL,'),false);assert.equal(correction.includes('ALT,'),false);assert.ok(correction.includes(' [ Unknown Group ] '));
 const corrected=paste.parseLabPaste(correction.replace('Bad analyte','HDL'),date);assert.deepEqual(corrected.errors,[]);assert.equal(corrected.valid.length,1);assert.equal(corrected.valid[0].payload.sourceInput?.rowOrder,4);assert.equal(corrected.valid[0].payload.sourceInput?.reportedSection,' [ Unknown Group ] ');
});
test('headings do not consume result safety limit; oversized source metadata is explicit and never silently misattributes rows',()=>{
 const fifty=Array.from({length:50},(_,i)=>`[ Section ${i} ]\nLDL, 3.2, mmol/L`).join('\n');assert.doesNotThrow(()=>paste.parseLabPaste(fifty,date));assert.throws(()=>paste.parseLabPaste(fifty+'\nALT, 20, U/L',date),/50 results/);
 const tooLong='['+'x'.repeat(1000)+']';const result=paste.parseLabPaste(tooLong+'\nLDL, 3.2, mmol/L\n[ Good group ]\nALT, 20, U/L',date);assert.equal(result.valid.length,1);assert.equal(result.valid[0].payload.marker,'alt');assert.equal(result.valid[0].payload.sourceInput?.reportedSection,'[ Good group ]');assert.ok(result.errors.length>=2);
});
test('zero/one/many group labels and more than six separately dated imports remain data-driven without inferred categories',()=>{
 assert.equal(paste.parseLabPaste('',date).valid.length,0);const none=paste.parseLabPaste('LDL, 0.00, mmol/L',date);assert.equal(none.valid[0].payload.sourceInput?.reportedSection,undefined);assert.equal(none.valid[0].payload.sourceInput?.rowOrder,0);assert.equal(none.valid[0].payload.value,0);assert.equal(none.valid[0].payload.sourceInput?.number,'0.00');
 for(let i=1;i<=8;i++){const measuredAt=`2026-10-${String(i).padStart(2,'0')}T12:00:00Z`,heading=`[ Report-specific group ${i} ]`;const r=paste.parseLabPaste(heading+'\nLDL, 3.20, mmol/L',measuredAt);assert.equal(r.valid[0].payload.measuredAt,measuredAt);assert.equal(r.valid[0].payload.sourceInput?.reportedSection,heading);assert.equal(Object.hasOwn(r.valid[0].payload.sourceInput!,'category'),false);}
});
