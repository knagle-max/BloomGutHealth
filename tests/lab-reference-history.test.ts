import test from 'node:test';import assert from 'node:assert/strict';
import {originalReferenceHistory,publishedReferenceHistory} from '../shared/lab-reference-history';
import {labRangeSchema,type PublishedMatch} from '../shared/lab-provider-ranges';
const point=(id:string,month:number,patch:Record<string,unknown>={})=>({id,date:`2026-${String(month).padStart(2,'0')}-01T12:00:00Z`,value:50,sourceValue:50,sourceUnit:'U/L',unit:'U/L',laboratory:'Synthetic lab',method:'Synthetic assay',fasting:'unknown' as const,referenceLow:null,referenceHigh:65,sourceReport:{enteredDate:`2026-${String(month).padStart(2,'0')}-01`},...patch});
test('each original source can establish one full-history interval across separate dated reports without changing sources or mathematical comparison',()=>{
 const points=[point('a',1),point('b',2),point('c',3)],before=structuredClone(points),scope=originalReferenceHistory('ggt',points);
 assert.equal(scope.scope,'full-history');assert.equal(scope.shared!.high,65);assert.equal(scope.shared!.low,null);assert.deepEqual(points,before);
 const cbc=points.map(p=>({...p,value:150,sourceValue:150,sourceUnit:'g/L',unit:'g/L',referenceLow:135,referenceHigh:170}));assert.equal(originalReferenceHistory('hemoglobin',cbc).scope,'full-history');
});
test('unknown labs/methods, unconfirmed assays, invalid units and unsupported chronology cannot acquire a historical band',()=>{
 const a=point('a',1),b=point('b',2);
 for(const patch of [{laboratory:'Different lab'},{laboratory:'Not supplied'},{method:'Unknown'},{method:'Different assay'},{sourceUnit:'unverified-unit'},{referenceHigh:null},{date:'not-a-date'},{sourceState:'withdrawn'}])assert.notEqual(originalReferenceHistory('ggt',[a,{...b,...patch}]).scope,'full-history',JSON.stringify(patch));
 const vitamin=[a,b].map(p=>({...p,unit:'nmol/L',sourceUnit:'nmol/L',method:'1,25-dihydroxy vitamin D'}));assert.equal(originalReferenceHistory('vitamin_d',vitamin).shared,null);
 const glucose=[a,b].map(p=>({...p,unit:'mmol/L',sourceUnit:'mmol/L',referenceHigh:5.5}));assert.equal(originalReferenceHistory('glucose',glucose).shared,null);
});
test('contiguous independently supported source periods leave changes, missing facts and unordered occurrences uncovered',()=>{
 const points=[point('a',1),point('b',2),point('gap',3,{referenceHigh:null}),point('c',4,{laboratory:'Other lab',referenceHigh:70}),point('d',5,{laboratory:'Other lab',referenceHigh:70})];
 const scope=originalReferenceHistory('ggt',points);assert.equal(scope.scope,'periods');assert.deepEqual(scope.periods.map(p=>p.sourceIds),[['a','b'],['c','d']]);assert.deepEqual(scope.periods.map(p=>p.interval.high),[65,70]);
 const duplicate={...point('dup',2),referenceHigh:70};const split=originalReferenceHistory('ggt',[point('a',1),point('b',2),duplicate,point('c',3,{referenceHigh:70})]);assert.equal(split.periods.length,0);
 const unknown=originalReferenceHistory('ggt',[...points,point('unknown',6,{date:'unknown'})]);assert.equal(unknown.periods.length,0);
});
test('provisional or unreviewed published matches remain selected-only; independently reviewed matching versions may share',()=>{
 const points=[point('a',1),point('b',2)],range=labRangeSchema.parse({id:'synthetic-published',provider:'Synthetic lab',province:'BC',markerId:'ggt',specimen:'serum',assay:'Synthetic assay',method:'Synthetic assay',ageApplicability:'all-ages',sexReferenceCategory:'all',fasting:'either',effectiveFrom:'2025-01-01',kind:'reference_interval',high:65,unit:'U/L',sourceUrl:'https://example.invalid/synthetic',sourceDocumentDate:'2025-01-01',scientificReviewStatus:'verified',rightsStatus:'verified-for-display',rightsSourceUrl:'https://example.invalid/rights'}),match:PublishedMatch={range,low:null,high:65,unit:'U/L'};
 const map=new Map(points.map(p=>[p.id,{match,sourceReviewed:true}]));assert.equal(publishedReferenceHistory('ggt',points,map).scope,'full-history');
 for(const change of [{availability:'provisional'},{scientificReviewStatus:'pending'},{rightsStatus:'pending'},{markerId:'alt'}]){const modified=new Map(points.map(p=>[p.id,{match:{...match,range:{...range,...change}} as PublishedMatch,sourceReviewed:true}]));assert.equal(publishedReferenceHistory('ggt',points,modified).scope,'selected-only');}
 map.set('b',{match,sourceReviewed:false});assert.equal(publishedReferenceHistory('ggt',points,map).shared,null);
});

test('a current per-fact correction prevents original bounds being extended across that fact even when another result is selected',()=>{
 const points=[point('a',1),point('corrected',2),point('b',3)],original=structuredClone(points);
 assert.equal(originalReferenceHistory('ggt',points).scope,'full-history');
 const scope=originalReferenceHistory('ggt',points,new Set(['corrected']));assert.equal(scope.shared,null);assert.deepEqual(scope.periods,[]);assert.deepEqual(points,original);
 assert.equal(originalReferenceHistory('ggt',points,new Set()).scope,'full-history','Removing a correction restores source-original applicability');
});
