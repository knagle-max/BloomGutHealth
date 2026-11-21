import test from 'node:test';import assert from 'node:assert/strict';
import {labRangeSchema,displayProviderRanges,matchProviderRanges,providerComparisonCandidates,publishedLabRanges,providerRangeSourceLeads,publishedRangeText,providerContextMatchesSource,type ProviderRangeContext} from '../shared/lab-provider-ranges';
import {canShareSourceReference,sourceReferenceIntervalForPlot} from '../shared/lab-reference-interval';
// Explicitly synthetic verified fixtures exercise matching, not a provider import.
const range=labRangeSchema.parse({id:'synthetic-bc-ldl',provider:'LifeLabs',province:'BC',markerId:'ldl',specimen:'serum',assay:'Synthetic LDL assay',method:'Synthetic LDL method',ageMinYears:30,sexReferenceCategory:'all',fasting:'either',effectiveFrom:'2025-09-02',effectiveTo:'2026-09-01',kind:'reference_interval',low:1.5,high:3.4,unit:'mmol/L',sourceUrl:'https://example.invalid/synthetic-range',sourceDocumentDate:'2025-09-02',page:36,scientificReviewStatus:'verified'});
const context:ProviderRangeContext={provider:'LifeLabs',province:'BC',markerId:'ldl',specimen:'serum',assay:'Synthetic LDL assay',method:'Synthetic LDL method',ageAtCollection:40,sexReferenceCategory:'F',fasting:'yes',collectedOn:'2026-01-01',sourceUnit:'mg/dL',plotUnit:'mmol/L'};
test('collection details are requested only for an eligible verified comparison; eligibility alone never permits a plotted match',()=>{
 const missing={...context,ageAtCollection:null,specimen:'',assay:'',sexReferenceCategory:null};
 assert.equal(providerComparisonCandidates(missing,[range]).length,1);
 assert.equal(matchProviderRanges(missing,[range]).length,0,'The complete matcher still requires the actual collection facts');
 for(const patch of [{province:'SK'},{province:'ON'},{method:'unknown'},{collectedOn:''},{collectedOn:'2025-09-01'},{sourceUnit:'U/L'},{plotUnit:'g/L'},{unitReview:{status:'pending'}}])assert.equal(providerComparisonCandidates({...missing,...patch},[range]).length,0,JSON.stringify(patch));
 assert.equal(providerComparisonCandidates(missing,[{...range,scientificReviewStatus:'pending'}]).length,0);
 assert.equal(providerComparisonCandidates({...missing,fasting:'unknown'},[{...range,fasting:'yes'}]).length,0);
 assert.equal(providerComparisonCandidates(missing,[]).length,0,'An empty catalogue must not prompt unnecessary collection fields');
});
test('published provider references require exact region, source applicability, collection era and independent verification',()=>{
 assert.equal(matchProviderRanges(context,[range]).length,1);const original=structuredClone(context);
 for(const patch of [{province:'SK'},{province:'ON'},{provider:'Other lab'},{markerId:'b12'},{specimen:'plasma'},{assay:'Other assay'},{method:'Not supplied'},{ageAtCollection:null},{collectedOn:'2025-09-01'},{collectedOn:'2026-09-02'},{sourceUnit:'U/L'},{plotUnit:'g/L'},{unitReview:{status:'pending'}}])assert.equal(matchProviderRanges({...context,...patch} as ProviderRangeContext,[range]).length,0,JSON.stringify(patch));
 assert.equal(matchProviderRanges({...context,sexReferenceCategory:null,fasting:'unknown'},[range]).length,1,'Explicit all/either applicability does not invent missing personal context');
 assert.equal(matchProviderRanges(context,[{...range,scientificReviewStatus:'pending'}]).length,0);assert.equal(matchProviderRanges(context,[{...range,assay:undefined}]).length,0);assert.equal(matchProviderRanges(context,[{...range,method:undefined}]).length,0);assert.deepEqual(context,original);
 assert.equal(publishedLabRanges.length,37,'Owner-supplied reference values are available without review approval');assert.ok(publishedLabRanges.every(range=>range.scientificReviewStatus==='pending'&&range.availability==='provisional'));assert.ok(providerRangeSourceLeads.every(source=>source.status==='pending'));assert.equal(providerRangeSourceLeads.some(source=>source.province==='SK' as any),false);
});
test('age boundaries, sex categories and fasting/random forms resolve separately without guessing from values',()=>{
 const younger={...range,id:'synthetic-younger',ageMinYears:18,ageMaxYears:30,ageMaxInclusive:false,high:3};
 assert.equal(matchProviderRanges({...context,ageAtCollection:29.99},[younger,range])[0].range.id,younger.id);assert.equal(matchProviderRanges({...context,ageAtCollection:30},[younger,range])[0].range.id,range.id);
 const male={...range,id:'synthetic-male',markerId:'hdl',low:.99,high:undefined,lowInclusive:false,sexReferenceCategory:'M'},female={...male,id:'synthetic-female',low:1.19,sexReferenceCategory:'F'};
 const hdl={...context,markerId:'hdl'};assert.equal(matchProviderRanges(hdl,[male,female])[0].range.id,female.id);assert.equal(matchProviderRanges({...hdl,sexReferenceCategory:'M'},[male,female])[0].low,.99);assert.equal(matchProviderRanges({...hdl,sexReferenceCategory:null},[male,female]).length,0);
 const fasting={...range,id:'synthetic-fasting',markerId:'glucose',low:3.3,high:5.5,fasting:'yes'},random={...fasting,id:'synthetic-random',high:11,fasting:'no'};
 assert.equal(matchProviderRanges({...context,markerId:'glucose',sourceUnit:'mmol/L'},[fasting,random])[0].range.id,fasting.id);assert.equal(matchProviderRanges({...context,markerId:'glucose',sourceUnit:'mmol/L',fasting:'no'},[fasting,random])[0].range.id,random.id);assert.equal(matchProviderRanges({...context,markerId:'glucose',sourceUnit:'mmol/L',fasting:'unknown'},[fasting,random]).length,0);
});
test('one-sided operators and clinical decision limits retain their kind and never become a normal interval or a treatment target',()=>{
 const low={...range,id:'synthetic-on-b12-low',province:'ON',markerId:'b12',low:undefined,high:150,highInclusive:false,unit:'pmol/L',kind:'clinical_decision_limit'};
 const b12={...context,province:'ON',markerId:'b12',sourceUnit:'pmol/L',plotUnit:'pmol/L'};
 const matched=matchProviderRanges(b12,[low])[0];assert.equal(matched.low,null);assert.equal(matched.high,150);assert.equal(matched.range.kind,'clinical_decision_limit');assert.match(publishedRangeText(matched),/^<150 pmol\/L; lower limit not supplied$/);
 const ferritin=[{...range,id:'synthetic-on-ferritin-low',province:'ON',markerId:'ferritin',low:undefined,high:30,highInclusive:false,unit:'ug/L',kind:'clinical_decision_limit'},{...range,id:'synthetic-on-ferritin-high',province:'ON',markerId:'ferritin',low:600,high:undefined,lowInclusive:true,unit:'ug/L',kind:'clinical_decision_limit'}];
 const limits=matchProviderRanges({...context,province:'ON',markerId:'ferritin',sourceUnit:'ug/L',plotUnit:'ug/L'},ferritin);assert.equal(limits.length,2);assert.ok(limits.every(limit=>limit.range.kind==='clinical_decision_limit'&&(limit.low===null||limit.high===null)));assert.match(publishedRangeText(limits[1]),/^≥600/);
 const native=matchProviderRanges({...context,province:'ON',markerId:'ferritin',sourceUnit:'µg/L',plotUnit:'ug/L'},[{...ferritin[0],unit:'µg/L'}])[0];assert.equal(native.high,30);assert.equal(native.range.unit,'µg/L','Provider-native notation stays intact while conversion uses the canonical unit');
 assert.equal(labRangeSchema.safeParse({...range,kind:'treatment_target'}).success,false);
});
test('vitamin-D identity and physical conversion are explicit; original source intervals remain separate',()=>{
 const vitamin={...range,markerId:'vitamin_d',assay:'25(OH)D',method:'25(OH)D',unit:'ng/mL',low:20,high:50};
 const vitaminContext={...context,markerId:'vitamin_d',assay:'25(OH)D',method:'25(OH)D',sourceUnit:'ng/mL',plotUnit:'nmol/L'};
 const match=matchProviderRanges(vitaminContext,[vitamin])[0];assert.equal(match.low,50);assert.equal(match.high,125);
 for(const source of ['1,25-(OH)2','calcitriol','1,25-dihydroxy vitamin D'])assert.equal(matchProviderRanges({...vitaminContext,sourceInput:{text:source,number:'20',suppliedUnit:'ng/mL',capture:'pasted-report'}},[vitamin]).length,0);
 const point={sourceValue:100,sourceUnit:'mg/dL',unit:'mmol/L',referenceLow:90,referenceHigh:140,method:'Synthetic LDL method'};const snapshot=structuredClone(point);const original=sourceReferenceIntervalForPlot('ldl',point)!;assert.equal(original.sourceLow,90);assert.equal(original.sourceHigh,140);assert.notEqual(original.low,range.low);assert.deepEqual(point,snapshot);
});
test('equal source numbers cannot paint a shared band across different laboratories, assays, fasting contexts or ranges',()=>{
 const point={laboratory:'Synthetic lab',method:'Synthetic assay',fasting:'yes',sourceValue:2,sourceUnit:'mmol/L',unit:'mmol/L',referenceLow:1,referenceHigh:3};const interval=sourceReferenceIntervalForPlot('ldl',point)!;
 assert.equal(canShareSourceReference([point,point],[interval,interval]),true);
 for(const patch of [{laboratory:'Other lab'},{method:'Other assay'},{fasting:'no'},{sourceUnit:'mg/dL'}])assert.equal(canShareSourceReference([point,{...point,...patch}],[interval,interval]),false);
 assert.equal(canShareSourceReference([point,point],[interval,{...interval,high:4}]),false);assert.equal(canShareSourceReference([{...point,method:'Not supplied'},point],[interval,interval]),false);
});

test('display comparison fields cannot override source method, fasting or original collection calendar',()=>{
 const point={date:'2026-01-01T01:00:00+10:00',method:context.method,fasting:'yes',sourceReport:{enteredDate:'2026-01-01'}};
 assert.equal(providerContextMatchesSource(point,context),true);
 for(const change of [{method:'Other method'},{fasting:'no'},{collectedOn:'2025-12-31'}])assert.equal(providerContextMatchesSource(point,{...context,...change}as ProviderRangeContext),false);
 assert.equal(providerContextMatchesSource({...point,sourceReport:undefined},context),false,'A legacy timestamp alone cannot establish a source collection-era date');
 assert.equal(providerContextMatchesSource({...point,method:'Not supplied'},context),false);
 assert.equal(providerContextMatchesSource({...point,dateCorrection:{enteredDate:'2026-01-02'}},context),false);
 assert.equal(providerContextMatchesSource({...point,fasting:'unknown'},{...context,fasting:'yes'}),false,'A display selector does not fill unknown source fasting');
});

test('owner-supplied provisional values display without source confirmation, method, specimen or collection date; review remains pending',()=>{
 const missing={...context,markerId:'ast',sourceUnit:'U/L',plotUnit:'U/L',method:'Not supplied',specimen:'',assay:'',ageAtCollection:null,sexReferenceCategory:null,collectedOn:'',fasting:'unknown' as const};
 const result=displayProviderRanges(missing,publishedLabRanges,false,false);assert.equal(result.length,1);assert.equal(result[0].high,36);assert.equal(result[0].low,null);assert.equal(result[0].range.scientificReviewStatus,'pending');assert.match(publishedRangeText(result[0]),/^<36 U\/L/);
 assert.equal(displayProviderRanges({...missing,province:'SK'},publishedLabRanges,false,false).length,0);
 assert.equal(displayProviderRanges({...missing,sourceUnit:'mg/dL'},publishedLabRanges,false,false).length,0);
 const ferritin={...missing,markerId:'ferritin',sourceUnit:'ug/L',plotUnit:'ug/L'};
 assert.equal(displayProviderRanges(ferritin,publishedLabRanges,false,false).length,2,'Unknown sex shows both labelled alternatives, never silently assumes one');
 const male=displayProviderRanges({...ferritin,sexReferenceCategory:'M'},publishedLabRanges,false,false);assert.equal(male.length,1);assert.equal(male[0].low,24);assert.equal(male[0].high,444);
 const limits=displayProviderRanges({...ferritin,province:'ON'},publishedLabRanges,false,false);assert.equal(limits.length,2);assert.ok(limits.every(match=>match.range.kind==='clinical_decision_limit'));
 assert.equal(displayProviderRanges({...missing,markerId:'vitamin_d',method:'calcitriol',sourceUnit:'ng/mL',plotUnit:'nmol/L'},publishedLabRanges,false,false).length,0);
 const glucose={...missing,markerId:'glucose',sourceUnit:'mmol/L',plotUnit:'mmol/L'};assert.equal(displayProviderRanges(glucose,publishedLabRanges,false,false).length,2);const fasting=displayProviderRanges({...glucose,comparisonFasting:'yes'},publishedLabRanges,false,false);assert.equal(fasting.length,1);assert.equal(fasting[0].high,5.5);assert.equal(glucose.fasting,'unknown','A reference-category selection never changes source fasting');
 assert.equal(publishedLabRanges.some(range=>range.label?.includes('Free testosterone')&&range.markerId==='testosterone_total'),false);
});
