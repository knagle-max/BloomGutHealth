import {captureGeneticCall} from '../shared/genetic-call-source';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateGeneticSourceFacts} from '../server/private-genetic-source-facts';
import {geneticSourceRevision} from '../server/genetic-source-version';
import {collectPrivateInvestigationSnapshot} from '../server/biological-investigation-snapshot';
import {precisionEntrySchema,type PrecisionRecord} from '../shared/precision-nutrition';
const now=new Date('2026-11-19T12:00:00Z');
function record(id='dataset'):PrecisionRecord{return{id,kind:'genetics',createdAt:'2026-11-18T12:00:00Z',payload:precisionEntrySchema.parse({kind:'genetics',payload:{consent:true,provider:'manual',source:'Synthetic only',strand:'unknown',collectedAt:'2026-11-17T12:00:00Z',entries:[{rsid:'rs1801133',gene:'MTHFR',genotype:'CT'},{rsid:'rs1801394',gene:'MTRR',genotype:'--'},{rsid:'rs429358',gene:'APOE',genotype:'CT'},{rsid:'rs7412',gene:'APOE',genotype:'CC'}]}}).payload};}
function selection(rows:PrecisionRecord[],activeId:string|null=rows[0]?.id??null){return{selectionRevision:'b'.repeat(64),activeId,state:activeId?'active':'none',sources:rows.map(row=>({id:row.id,revision:geneticSourceRevision('a',row),provider:'manual',createdAt:row.createdAt,collectedAt:'2026-11-17T12:00:00Z',callCount:4,readable:true,active:row.id===activeId}))};}
test('source revision is byte-for-byte compatible with the existing canonical source manager',()=>{
 const row:PrecisionRecord={id:'golden',kind:'genetics',createdAt:'2026-11-18T12:00:00Z',payload:{fixture:'legacy-unreadable'}};assert.equal(geneticSourceRevision('a',row),'54219129d1a9eeec38c405af114b0814eaf108dc209573d341423b77d66f367f');
});
test('only active source facts survive; unknown orientation/build and no-call stay unknown, with no genotype effect inference',()=>{
 const row=record(),result=privateGeneticSourceFacts('a',[row],selection([row]),now);
 assert.equal(result.facts.length,2);assert.equal(result.facts[0].genotype,'CT');assert.equal(result.facts[0].original,null);assert.equal(result.facts[0].build,null);assert.equal(result.facts[0].strand,'unknown');assert.equal(result.facts[0].phase,'not-established');assert.equal(result.facts[0].clinicalEffect,'not-assessed');assert.equal(result.facts[0].measuredGeneExpression,false);assert.equal(result.facts[1].valueKind,'source-no-call');assert.ok(!JSON.stringify(result).includes('APOE'));assert.ok(!JSON.stringify(result).includes('rs429358'));assert.ok(!JSON.stringify(result).includes('rs7412'));
});
test('explicit none and unavailable selections never fall back to a historical genetic dataset',()=>{
 const row=record();assert.equal(privateGeneticSourceFacts('a',[row],selection([row],null),now).facts.length,0);
 assert.equal(privateGeneticSourceFacts('a',[row],{selectionRevision:'a'.repeat(64),state:'unavailable',activeId:null,sources:[]},now).facts.length,0);
});
test('wrong account revision, changed source, missing selected record and duplicate records fail closed',()=>{
 const row=record(),control=selection([row]);assert.throws(()=>privateGeneticSourceFacts('b',[row],control,now),/CHANGED/);
 const edited=structuredClone(row);(edited.payload as any).entries[0].genotype='TT';assert.throws(()=>privateGeneticSourceFacts('a',[edited],control,now),/CHANGED/);
 assert.throws(()=>privateGeneticSourceFacts('a',[],control,now),/CHANGED/);assert.throws(()=>privateGeneticSourceFacts('a',[row,row],control,now),/CHANGED/);
});
test('source creation and collected times cannot be used before they are available at as-of time',()=>{
 const row=record();assert.throws(()=>privateGeneticSourceFacts('a',[row],selection([row]),new Date('2026-11-17T13:00:00Z')),/UNAVAILABLE/);
 const early=record();early.createdAt='2026-11-16T12:00:00Z';assert.throws(()=>privateGeneticSourceFacts('a',[early],selection([early]),new Date('2026-11-16T13:00:00Z')),/UNAVAILABLE/);
});
test('canonical private collector includes genetics only explicitly and changes epoch when active selection is revoked',async()=>{
 const rows=[record()];let control=selection(rows);
 const store={getUser:async()=>({id:'a'}),getPrecisionContext:async()=>({}),getPrecisionRecords:async()=>rows,getMeals:async()=>[],getExperienceRecords:async()=>[],getGeneticSources:async()=>control} as any;
 const input={actor:'a',purpose:'personal-wellness' as const,window:{date:'2026-11-19',timeZone:'UTC'},store,authorize:async()=>true,now:()=>now};
 const absent=await collectPrivateInvestigationSnapshot(input);assert.equal(absent.missing.genetics,'not-collected');assert.equal(absent.facts.length,0);
 const active=await collectPrivateInvestigationSnapshot({...input,includeGenetics:true});assert.equal(active.facts.length,2);assert.equal(active.geneticSource?.state,'active');
 control=selection(rows,null);const none=await collectPrivateInvestigationSnapshot({...input,includeGenetics:true});assert.equal(none.facts.length,0);assert.equal(none.missing.genetics,'none');assert.notEqual(none.sourceEpoch,active.sourceEpoch);
});

test('captured lexical allele order is retained without guessing a new strand or phase',()=>{
 const row=record();(row.payload as any).entries[0]={...(row.payload as any).entries[0],...captureGeneticCall('t/c')};
 const result=privateGeneticSourceFacts('a',[row],selection([row]),now);assert.equal(result.facts[0].genotype,'CT');assert.equal(result.facts[0].original,'t/c');assert.equal(result.facts[0].strand,'unknown');assert.equal(result.facts[0].phase,'not-established');
});
