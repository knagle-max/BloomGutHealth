import test from 'node:test';
import assert from 'node:assert/strict';
import { readLabTextFile, LAB_TEXT_FILE_LIMIT } from '../shared/lab-text-file';
import { parseLabPaste } from '../shared/lab-paste';
test('local lab text accepts bounded CSV/TSV/TXT verbatim without inventing source identity or auto-importing', async () => {
 const text='Analyte,Value,Unit\r\n[ Exact source heading ]\r\nTest assay, <0.50, source-unit\r\nALT, 0.00, U/L';
 for(const name of ['source.CSV','source.tsv','source.txt'])assert.deepEqual(await readLabTextFile({name,size:Buffer.byteLength(text),text:async()=>text}),{name,text});
 const parsed=parseLabPaste(text,'2026-10-15T12:00:00Z');assert.equal(parsed.valid.length,1);assert.equal(parsed.sourceOnly.length,1);assert.equal(parsed.sourceOnly[0].payload.reportedAnalyte,'Test assay');assert.equal(parsed.sourceOnly[0].payload.sourceInput.reportedSection,'[ Exact source heading ]');assert.equal(parsed.sourceOnly[0].payload.sourceInput.rowOrder,2);assert.equal(parsed.valid[0].payload.value,0);assert.equal(parsed.valid[0].payload.sourceReport,undefined);
});
test('invalid files are rejected before reading where possible and never truncated or decoded as invented lab facts', async () => {
 let reads=0;const text=async()=>{reads++;return 'ALT, 20, U/L';};
 for(const file of [{name:'report.pdf',size:10},{name:'report.png',size:10},{name:'report.xlsx',size:10},{name:'report.csv',size:0},{name:'report.tsv',size:LAB_TEXT_FILE_LIMIT+1}])await assert.rejects(()=>readLabTextFile({...file,text}));
 assert.equal(reads,0);
 for(const value of ['   ','%PDF-1.7\npretend text','ALT, 20, U/L\u0000','\ufffd invalid','x'.repeat(LAB_TEXT_FILE_LIMIT+1)])await assert.rejects(()=>readLabTextFile({name:'source.txt',size:10,text:async()=>value}));
 await assert.rejects(()=>readLabTextFile({name:'source.csv',size:10,text:async()=>{throw Error('private device detail');}}),error=>error instanceof Error&&error.message.includes('could not be read')&&!error.message.includes('private device detail'));
});
