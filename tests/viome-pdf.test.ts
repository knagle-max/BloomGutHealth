import test from 'node:test';import assert from 'node:assert/strict';
import {createViomePdfParser,readViomePdf,VIOME_PDF_LIMITS,ViomePdfError} from '../shared/viome-pdf';
import {parseStructuredReport} from '../shared/structured-report';
import {syntheticViomePages,VIOME_PDF_CANARY,syntheticViomePdf} from './fixtures/viome-pdf';
const extract=(kind:'organisms'|'recommendations')=>async(_bytes:Uint8Array,_signal:AbortSignal,onPage:any)=>{const pages=syntheticViomePages(kind);pages.forEach(onPage);return pages.length;};
const file=()=>{const bytes=syntheticViomePdf('organisms');return{name:VIOME_PDF_CANARY+'.pdf',size:bytes.length,arrayBuffer:async()=>bytes.slice().buffer};};
test('synthetic seven/13page layouts preserve94qualitative organisms and22assessments/299foods with source positions, never quantities/identity',async()=>{
 for(const kind of ['organisms','recommendations']as const){const draft=await readViomePdf(file(),extract(kind));assert.equal('reviewConfirmed'in draft,false);assert.equal(JSON.stringify(draft).includes(VIOME_PDF_CANARY),false);assert.equal(JSON.stringify(draft).includes('1900-01-01'),false);assert.equal(draft.biologicalDates.collectedOn,'2026-09-01');
  const report=parseStructuredReport({...draft,reviewConfirmed:true});assert.equal(report.bacteria_percentages,undefined);
  if(kind==='organisms'){assert.equal(report.organisms.length,94);assert.equal(draft.organisms.filter(r=>r.reportedGroup==='Bacteria').length,82);assert.equal(draft.organisms.filter(r=>r.reportedGroup==='Viruses').length,7);assert.equal(draft.organisms.filter(r=>r.reportedGroup==='Eukaryotes').length,5);assert.ok(report.organisms.every(r=>r.reportedAbundance===null));}
  else{assert.equal(report.scores.length,22);assert.equal(report.foods!.length,299);for(const[category,count]of Object.entries({Improve:15,Attention:4,Maintain:3}))assert.equal(draft.assessments.filter(r=>r.reportedCategory===category).length,count);for(const[category,count]of Object.entries({Enjoy:240,Superfood:28,Minimize:22,Avoid:9}))assert.equal(draft.foods.filter(r=>r.reportedCategory===category).length,count);assert.ok(report.scores.every(r=>r.score===null));}
 }
});
test('unsupported, ambiguous/control/oversized/interrupted source fails closed with fixed errors and wrapping stays on the same source column',()=>{
 const pages=syntheticViomePages('organisms');pages[0].items.push({text:'VPI-5482',x:12,y:135,width:60,height:10});const parser=createViomePdfParser();pages.forEach(parser.page);assert.match(parser.finish().organisms[0].name,/VPI-5482$/);
 const cases=[{...pages[0],items:pages[0].items.map(i=>({...i,text:i.text.replace('My Active Gut Microbes','Unrecognized template')}))},{...pages[0],items:[...pages[0].items,{text:'bad\u0000',x:12,y:140,width:60,height:10}]}];
 for(const input of cases){const p=createViomePdfParser();assert.throws(()=>{p.page(input);p.finish();},error=>error instanceof ViomePdfError&&!error.message.includes(VIOME_PDF_CANARY));}
 const uncertain=createViomePdfParser();uncertain.page({...pages[0],items:[...pages[0].items,{text:"unseparated biological rows",x:12,y:139,width:80,height:10}]});const partial=uncertain.finish();assert.equal(partial.extraction?.status,"PARTIAL_REVIEW_REQUIRED");assert.ok(partial.extraction!.issues.length>0);assert.equal(JSON.stringify(partial).includes("unseparated biological rows"),false);
 const empty=createViomePdfParser();empty.page({page:1,width:612,height:792,items:[]});assert.throws(()=>empty.finish(),error=>error instanceof ViomePdfError&&error.code==='empty');
});
test('review corrections retain exact biological originals and position through canonical roundtrip',async()=>{
 const draft=await readViomePdf(file(),extract('organisms'));const original=draft.organisms[0].name;draft.organisms[0].correctedName='Syntheticus corrected FIX-0';const canonical=parseStructuredReport({...draft,reviewConfirmed:true});assert.equal(canonical.organisms[0].name,'Syntheticus corrected FIX-0');assert.equal((canonical.sourceReport as any).organisms[0].name,original);assert.deepEqual(parseStructuredReport(canonical),canonical);
});
test('resource validation, cancellation, deadline, bad magic and decoder failures never disclose raw input or start late extraction',async()=>{
 let calls=0;const decoder=async()=>{calls++;throw Error(VIOME_PDF_CANARY);};for(const candidate of[{...file(),name:'private.txt'},{...file(),size:VIOME_PDF_LIMITS.bytes+1}])await assert.rejects(readViomePdf(candidate,decoder));assert.equal(calls,0);
 await assert.rejects(readViomePdf(file(),decoder),e=>e instanceof ViomePdfError&&!e.message.includes(VIOME_PDF_CANARY));
 const controller=new AbortController();let release!:(v:ArrayBuffer)=>void;const pending=readViomePdf({...file(),arrayBuffer:()=>new Promise<ArrayBuffer>(r=>{release=r;})},decoder,controller.signal);controller.abort();await assert.rejects(pending,e=>e instanceof ViomePdfError&&e.code==='cancelled');release(syntheticViomePdf('organisms').buffer);await Promise.resolve();assert.equal(calls,1);
 let decoderSignal:AbortSignal|undefined;await assert.rejects(readViomePdf(file(),async(_b,s)=>{decoderSignal=s;return new Promise(()=>{});},undefined,10),e=>e instanceof ViomePdfError&&e.code==='timeout');assert.equal(decoderSignal?.aborted,true);
});
