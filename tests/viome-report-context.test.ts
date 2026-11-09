import test from 'node:test';import assert from 'node:assert/strict';
import {createViomePdfParser} from '../shared/viome-pdf';
import {parseViomeFindings} from '../shared/viome-findings';
import {sameViomeBiologicalFacts,compatibleViomeCompanion,viomeImportContext,viomeSource} from '../shared/viome-report-context';
import {syntheticViomePages} from './fixtures/viome-pdf';
const source=(kind:'organisms'|'recommendations')=>{const parser=createViomePdfParser();syntheticViomePages(kind).forEach(parser.page);return parseViomeFindings({...parser.finish(),reviewConfirmed:true});};
test('companion compatibility requires different document kinds, no conflicting known collection dates and explicit separate relationship; never infer sample identity',()=>{
 const a=source('organisms'),b=source('recommendations');assert.equal(compatibleViomeCompanion(a,b),true);assert.equal(compatibleViomeCompanion(b,a),true);assert.equal(compatibleViomeCompanion(a,a),false);
 assert.equal(compatibleViomeCompanion({...a,biologicalDates:{}},b),true);assert.equal(compatibleViomeCompanion(a,{...b,biologicalDates:{collectedOn:'2026-09-02'}}),false);
 const context=viomeImportContext(a,[{id:'report_'+'a'.repeat(64),processingStatus:'completed',structuredData:{sourceReport:b}}]);assert.equal(context.companions.length,1);assert.equal(a.specimenEvent,undefined);assert.equal(b.specimenEvent,undefined);
 assert.equal(viomeSource({sourceReport:{...a,patientId:'not-allowed'}}),null);
});
test('semantic reimport equality is in-memory, order/layout independent and exact for biology/dates/categories/corrections; no raw-byte hash',()=>{
 const a=source('organisms'),copy=structuredClone(a);copy.organisms.reverse();copy.organisms[0].position.page=20;copy.specimenEvent={rootReportId:'report_'+'b'.repeat(64),confirmed:true};assert.equal(sameViomeBiologicalFacts(a,copy),true);
 copy.organisms[0].correctedName='Syntheticus different';assert.equal(sameViomeBiologicalFacts(a,copy),false);
 const b=source('recommendations'),changed=structuredClone(b);changed.foods[0].correctedCategory='Avoid';assert.equal(sameViomeBiologicalFacts(b,changed),false);
 assert.equal(sameViomeBiologicalFacts(a,{...a,biologicalDates:{collectedOn:'2026-09-02'}}),false);
 assert.equal(sameViomeBiologicalFacts(a,{...a,organisms:[...a.organisms,a.organisms[0]]}),false,'multiplicity is not silently deduplicated');
});
test('occupied events, uncompleted/untyped sources and quantitative history are not proposed as new companions; valid exact duplicates stay explicit',()=>{
 const a=source('organisms'),b=source('recommendations'),id='report_'+'a'.repeat(64),linked={...a,specimenEvent:{rootReportId:id,confirmed:true as const}};
 const rows=[{id,processingStatus:'completed',structuredData:{sourceReport:b}},{id:'report_'+'b'.repeat(64),processingStatus:'completed',structuredData:{sourceReport:linked}},{id:'legacy-quantified',processingStatus:'completed',structuredData:{bacteria_percentages:{Roseburia:100}}},{id:'unfinished',processingStatus:'pending',structuredData:{sourceReport:b}}];
 const result=viomeImportContext(a,rows);assert.equal(result.companions.length,0);assert.equal(result.duplicates.length,1);assert.equal(result.duplicates[0].source.organisms.length,94);
 assert.equal(parseViomeFindings({...a,specimenEvent:{rootReportId:id,confirmed:true}}).specimenEvent?.rootReportId,id);
 for(const specimenEvent of[{rootReportId:'provider-test-id',confirmed:true},{rootReportId:id,confirmed:false},{rootReportId:id,confirmed:true,sampleId:'not-allowed'}])assert.throws(()=>parseViomeFindings({...a,specimenEvent}));
});

test('unknown collection dates use upload context without auto-linking or inventing a biological date',()=>{const a={...source('organisms'),biologicalDates:{}},b={...source('recommendations'),biologicalDates:{}};assert.equal(compatibleViomeCompanion(a,b),true);const samples=[{id:'report_'+'a'.repeat(64),processingStatus:'completed',structuredData:{sourceReport:b},uploadedAt:'2026-10-01T09:00:00Z'}];const context=viomeImportContext(a,samples);assert.equal(context.companions.length,1);assert.equal(viomeSource(samples[0].structuredData)?.specimenEvent,undefined);assert.deepEqual(a.biologicalDates,{});assert.deepEqual(b.biologicalDates,{});});
