import test from'node:test';import assert from'node:assert/strict';
import{readLabImageFile,labImageDimensions,LabImageError,LAB_IMAGE_BYTE_LIMIT,LAB_IMAGE_TEXT_LIMIT}from'../shared/lab-image-file';
const png=(width=1400,height=400)=>{const bytes=new Uint8Array(33);bytes.set([137,80,78,71,13,10,26,10]);const view=new DataView(bytes.buffer);view.setUint32(8,13);bytes.set([73,72,68,82],12);view.setUint32(16,width);view.setUint32(20,height);return bytes;};
const jpeg=new Uint8Array([255,216,255,224,0,4,0,0,255,192,0,11,8,0,100,0,200,1,1,17,0,255,217]);
const file=(bytes=png(),name='source.png')=>({name,size:bytes.length,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)as ArrayBuffer});
const code=(expected:string)=>(error:unknown)=>error instanceof LabImageError&&error.code===expected&&!error.message.includes('PRIVATE');
test('image bounds and magic reject before decoding; source dimensions and literal text survive without filename identity',async()=>{
 let reads=0,extracts=0;const unread={name:'wrong.svg',size:1,arrayBuffer:async()=>{reads++;return new ArrayBuffer(1);}},extract=async()=>{extracts++;return'ALT, 0, U/L\nLDL, 3.20, mmol/L\n';};
 await assert.rejects(readLabImageFile(unread,extract),code('file'));await assert.rejects(readLabImageFile({...unread,name:'source.png',size:LAB_IMAGE_BYTE_LIMIT+1},extract),code('size'));assert.equal(reads,0);
 for(const bad of[file(png(0,100)),file(png(10001,1)),file(png(5000,5000))])await assert.rejects(readLabImageFile(bad,extract),code('pixels'));
 for(const bad of[file(new Uint8Array([60,115,118,103])),file(jpeg,'fake.png'),file(png(),'fake.jpg'),file(new Uint8Array([255,216,255,224,0,0]),'broken.jpg')])await assert.rejects(readLabImageFile(bad,extract),code('unreadable'));
 await assert.rejects(readLabImageFile({...file(),size:34},extract),code('size'));assert.equal(extracts,0);
 assert.deepEqual(labImageDimensions(jpeg,'jpeg'),{height:100,width:200});const original=file(png(),'NOT-A-REPORT-ID-2020-01-01.PNG');const result=await readLabImageFile(original,extract);assert.deepEqual(result,{name:original.name,text:'ALT, 0, U/L\nLDL, 3.20, mmol/L\n'});assert.equal('date'in result,false);assert.equal('reportIdentifier'in result,false);assert.equal(extracts,1);
});
test('image extraction rejects empty/oversized/control output and hides decoder details',async()=>{
 for(const[text,expected]of[[' \n','empty'],['x'.repeat(LAB_IMAGE_TEXT_LIMIT+1),'text'],['ALT\u0000','unreadable'],['\ufffd','unreadable']])await assert.rejects(readLabImageFile(file(),async()=>text),code(expected));
 await assert.rejects(readLabImageFile(file(),async()=>{throw Error('PRIVATE_SOURCE_DECODER_SENTINEL');}),code('unreadable'));
});
test('image cancellation and deadline settle before late reads/decoders can update a source draft',async()=>{
 let decode=0,finishRead!:(value:ArrayBuffer)=>void;const late={name:'late.png',size:33,arrayBuffer:()=>new Promise<ArrayBuffer>(resolve=>finishRead=resolve)};
 await assert.rejects(readLabImageFile(late,async()=>{decode++;return'ALT, 0, U/L';},undefined,5),code('timeout'));finishRead(png().buffer);await new Promise(r=>setTimeout(r,0));assert.equal(decode,0);
 const parent=new AbortController();let started!:()=>void,aborted=false;const ready=new Promise<void>(r=>started=r);const pending=readLabImageFile(file(),async(_bytes,_kind,signal)=>{signal.addEventListener('abort',()=>aborted=true);started();return new Promise<string>(()=>{});},parent.signal);await ready;parent.abort();await assert.rejects(pending,code('cancelled'));assert.equal(aborted,true);
 const already=new AbortController();already.abort();await assert.rejects(readLabImageFile({...file(),arrayBuffer:async()=>{throw Error('PRIVATE_MUST_NOT_READ');}},async()=>{decode++;return'';},already.signal),code('cancelled'));assert.equal(decode,0);
});
