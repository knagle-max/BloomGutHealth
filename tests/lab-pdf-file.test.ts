import test from 'node:test';import assert from 'node:assert/strict';
import{readLabPdfFile,LabPdfError,LAB_PDF_BYTE_LIMIT,LAB_PDF_TEXT_LIMIT}from'../shared/lab-pdf-file';
const bytes=new TextEncoder().encode('%PDF-1.7\nfixture');
const file=(name='source.pdf',size=bytes.length)=>({name,size,arrayBuffer:async()=>bytes.slice().buffer});
const code=(expected:string)=>(error:unknown)=>error instanceof LabPdfError&&error.code===expected;
test('PDF bounds reject before file access and magic/actual length before decoder',async()=>{
 let reads=0,decodes=0;const guarded={...file(),arrayBuffer:async()=>{reads++;return bytes.slice().buffer;}},extract=async()=>{decodes++;return{text:'ALT, 0.00, U/L',pages:1};};
 for(const candidate of [{...guarded,name:'source.xlsx'},{...guarded,size:0},{...guarded,size:LAB_PDF_BYTE_LIMIT+1}])await assert.rejects(readLabPdfFile(candidate,extract));
 assert.equal(reads,0);assert.equal(decodes,0);
 await assert.rejects(readLabPdfFile({...guarded,size:1},extract),code('size'));
 const bad=new TextEncoder().encode('not PDF');await assert.rejects(readLabPdfFile({...file(),size:bad.length,arrayBuffer:async()=>bad.buffer},extract),code('unreadable'));assert.equal(decodes,0);
 const text='[ Source ]\nTest assay, <0.50, units\nALT, 0.00, U/L';assert.deepEqual(await readLabPdfFile(guarded,async()=>({text,pages:1})),{name:'source.pdf',text});
});
test('PDF page/text/empty/binary results fail without truncation and parser details never escape',async()=>{
 for(const [result,expected]of [[{text:'ALT, 0, U/L',pages:6},'pages'],[{text:'x'.repeat(LAB_PDF_TEXT_LIMIT+1),pages:1},'text'],[{text:' \n',pages:1},'empty'],[{text:'private\u0000',pages:1},'unreadable']]as const)await assert.rejects(readLabPdfFile(file(),async()=>result),code(expected));
 await assert.rejects(readLabPdfFile(file(),async()=>{throw Error('sensitive source content');}),error=>code('unreadable')(error)&&!(error as Error).message.includes('sensitive'));
});
test('PDF cancellation and deadline settle safely and late file reads never start decoding',async()=>{
 const controller=new AbortController();let readStarted!:(b:ArrayBuffer)=>void,decodeCount=0;
 const pending=readLabPdfFile({...file(),arrayBuffer:()=>new Promise<ArrayBuffer>(r=>{readStarted=r;})},async()=>{decodeCount++;return{text:'ALT, 0, U/L',pages:1};},controller.signal);controller.abort();await assert.rejects(pending,code('cancelled'));readStarted(bytes.slice().buffer);await Promise.resolve();assert.equal(decodeCount,0);
 let decoderSignal:AbortSignal|undefined;await assert.rejects(readLabPdfFile(file(),async(_bytes,signal)=>{decoderSignal=signal;return new Promise(()=>{});},undefined,10),code('timeout'));assert.equal(decoderSignal?.aborted,true);
 const already=new AbortController();already.abort();await assert.rejects(readLabPdfFile(file(),async()=>{throw Error('must not decode');},already.signal),code('cancelled'));
});
