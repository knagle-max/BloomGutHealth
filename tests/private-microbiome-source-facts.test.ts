import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateMicrobiomeSourceFacts} from '../server/private-microbiome-source-facts';
import {collectPrivateInvestigationSnapshot} from '../server/biological-investigation-snapshot';
import {VIOME_FINDINGS_VERSION} from '../shared/viome-findings';
import {parseStructuredReport} from '../shared/structured-report';
import type {MicrobiomeSample} from '../shared/schema';
const now=new Date('2026-11-19T12:00:00Z');
function sample(structuredData:unknown,id='sample'):MicrobiomeSample{return{id,userId:'a',testDate:new Date('2026-11-18T00:00:00Z'),testingCompany:'Synthetic',testId:null,rawDataPath:null,structuredData,notes:'Private note excluded',processingStatus:'completed',diversityIndex:null,uploadedAt:new Date('2026-11-19T10:00:00Z')};}
const read=(samples:MicrobiomeSample[])=>privateMicrobiomeSourceFacts('a',samples,now);
test('qualitative reported presence and numeric-looking raw abundance remain unknown measurements, never zero or inferred function',()=>{
 const result=read([sample({organisms:[{name:'Synthetic organism',reported_status:'detected',abundance:'2.5 (unit unknown)'}]})]);
 assert.equal(result.facts.length,1);assert.equal(result.facts[0].amount,null);assert.equal(result.facts[0].unit,null);assert.equal(result.facts[0].measuredMetabolite,false);assert.equal(result.facts[0].measuredGeneFunction,false);assert.equal(result.facts[0].occurredAt,null);assert.equal(result.facts[0].dateBasis,'biological-date-unknown');assert.equal(result.facts[0].timeComparability,'not-established');assert.ok(!JSON.stringify(result).includes('Private note'));
});
test('canonical quantitative source preserves zero and exact percentages, without upgrading genus/name to measured pathway',()=>{
 const result=read([sample({bacteria_percentages:{'Synthetic zero':0,'Synthetic taxon':2.5}})]);
 assert.deepEqual(result.facts.map(f=>f.amount),[0,2.5]);assert.ok(result.facts.every(f=>f.unit==='%'&&f.valueKind==='reported-relative-abundance'));assert.equal(result.reports[0].quantifiedTaxa,2);assert.equal(result.reports[0].reportedOrganisms,0);
});
test('upload/test/collection roles remain distinct and date-only entered calendars are not fabricated UTC instants',()=>{
 const raw=parseStructuredReport({bacteria_percentages:{'Synthetic':1}});
 const uploaded=read([sample({...raw,importInfo:{dateSource:'import-date'}})]);assert.equal(uploaded.facts[0].occurredAt,null);assert.equal(uploaded.reports[0].dateContext.importedAt,'2026-11-19T10:00:00.000Z');
 const entered=read([sample({...raw,importInfo:{dateSource:'user-provided',testDateInput:'2026-11-17'}})]);assert.equal(entered.facts[0].occurredAt,'2026-11-17');assert.equal(entered.facts[0].dateBasis,'user-entered-test-date');assert.notEqual(entered.facts[0].dateBasis,'reported-collection-date');
});
test('qualitative and quantitative views of one report never duplicate a quantitative measurement',()=>{
 const result=read([sample({organisms:['Synthetic'],bacteria_percentages:{Synthetic:0}})]);assert.equal(result.facts.length,2);assert.equal(result.facts.filter(f=>f.amount!==null).length,1);assert.equal(result.reports[0].reportedOrganisms,1);assert.equal(result.reports[0].quantifiedTaxa,1);
});
test('foreign accounts, duplicate identities and over-budget feeds fail closed; unsupported/pending/future documents stay explicit',()=>{
 assert.throws(()=>read([{...sample({organisms:['Synthetic']}),userId:'b'}]),/SCOPE/);
 const a=sample({organisms:['Synthetic']});assert.throws(()=>read([a,a]),/SCOPE/);
 assert.throws(()=>read(Array.from({length:21},(_,i)=>sample({organisms:['Synthetic']},String(i)))),/SCOPE/);
 const unavailable=read([sample({unrecognized:'private'}),{...a,id:'pending',processingStatus:'pending'},{...a,id:'future',uploadedAt:new Date('2026-11-20T00:00:00Z')}]);assert.equal(unavailable.facts.length,0);assert.equal(unavailable.unavailable,2);assert.equal(unavailable.future,1);
});
test('actual private collector includes canonical sources only when explicitly requested, and source correction/deletion changes epoch',async()=>{
 let samples=[sample({organisms:['Synthetic']})];
 const store={getUser:async()=>({id:'a'}),getPrecisionContext:async()=>({}),getPrecisionRecords:async()=>[],getMeals:async()=>[],getExperienceRecords:async()=>[],getUserSamples:async()=>samples} as any;
 const input={actor:'a',purpose:'personal-wellness' as const,window:{date:'2026-11-19',timeZone:'UTC'},store,authorize:async()=>true,now:()=>now};
 const baseline=await collectPrivateInvestigationSnapshot(input);assert.equal(baseline.missing.microbiome,'not-collected');assert.equal(baseline.facts.length,0);
 const first=await collectPrivateInvestigationSnapshot({...input,includeMicrobiome:true});assert.equal(first.facts.length,1);assert.equal(first.microbiomeReports.length,1);assert.equal(first.missing.microbiome,'source-reports-included');
 samples=[sample({organisms:['Corrected synthetic organism']})];const corrected=await collectPrivateInvestigationSnapshot({...input,includeMicrobiome:true});assert.notEqual(corrected.sourceEpoch,first.sourceEpoch);
 samples=[];const removed=await collectPrivateInvestigationSnapshot({...input,includeMicrobiome:true});assert.equal(removed.facts.length,0);assert.equal(removed.missing.microbiome,'no-readable-source-reports');assert.notEqual(removed.sourceEpoch,corrected.sourceEpoch);
});

test('native qualitative reports keep collection/specimen provenance while absent collection date stays unknown',()=>{
 const native={schemaVersion:VIOME_FINDINGS_VERSION,provider:'Viome',documentKind:'active-gut-microbes',specimenType:'fecal',method:'qualitative RNA',biologicalDates:{collectedOn:'2026-09-01',receivedOn:'2026-09-02'},reviewConfirmed:true,organisms:[{name:'Syntheticus organism',reportedGroup:'Bacteria',reportedStatus:'reported_present',position:{page:2,column:1,row:1}}],assessments:[],foods:[]};
 const result=read([sample({sourceReport:native})]);assert.equal(result.facts.length,1);assert.equal(result.facts[0].amount,null);assert.equal(result.facts[0].occurredAt,'2026-09-01');assert.equal(result.facts[0].dateBasis,'reported-collection-date');assert.equal(result.reports[0].reportedMethod,'qualitative RNA');assert.equal(result.reports[0].specimenType,'fecal');assert.equal(result.reports[0].specimenEvent,null);
 const unknown=read([sample({sourceReport:{...native,biologicalDates:{receivedOn:'2026-09-02'}}})]);assert.equal(unknown.facts[0].occurredAt,null);assert.equal(unknown.facts[0].dateBasis,'biological-date-unknown');
});

test('a named taxon listed as not detected is never upgraded to a presence claim',()=>{
 const result=read([sample({organisms:[{name:'Synthetic organism',reported_status:'not_detected'}]})]);assert.equal(result.facts[0].valueKind,'report-listed-organism');assert.equal(result.facts[0].reportedStatus,'not_detected');assert.equal(result.facts[0].amount,null);
});
