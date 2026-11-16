import test from 'node:test';import assert from 'node:assert/strict';
import {resolveCanadianReference,labRangeSchema,publishedLabRanges,type ProviderRangeContext} from '../shared/lab-provider-ranges';
// Explicitly synthetic applicability and rights fixtures; no real source is
// granted verified status or imported by these tests.
const context:ProviderRangeContext={provider:'Synthetic Canadian lab',province:'SK',markerId:'alt',specimen:'serum',assay:'Synthetic ALT assay',method:'Synthetic method',ageAtCollection:40,sexReferenceCategory:'F',fasting:'unknown',collectedOn:'2026-01-01',sourceUnit:'U/L',plotUnit:'U/L'};
const proof={performingLaboratoryConfirmed:true,collectionContextConfirmed:true,sourceMatches:true};
const row=labRangeSchema.parse({id:'synthetic-sk',provider:context.provider,province:'SK',markerId:'alt',specimen:'serum',assay:context.assay,method:context.method,ageMinYears:18,sexReferenceCategory:'all',fasting:'either',effectiveFrom:'2025-01-01',effectiveTo:'2026-12-31',kind:'reference_interval',high:45,highInclusive:false,unit:'U/L',sourceUrl:'https://example.invalid/synthetic-publication',sourceDocumentDate:'2025-01-01',scientificReviewStatus:'verified',rightsStatus:'verified-for-display',rightsSourceUrl:'https://example.invalid/synthetic-rights'});
test('Canadian source-class selection prioritizes exact lab, then verified harmonized context; no numeric provider rows are added',()=>{
 const national={...row,id:'synthetic-cscc',provider:'CSCC',province:'CA',referenceScope:'canadian-harmonized',high:60};
 const exact=resolveCanadianReference(context,[national,row],proof);assert.equal(exact.status,'laboratory');assert.equal(exact.selected?.high,45);
 const harmonized=resolveCanadianReference({...context,provider:'',province:''},[national,row],{...proof,performingLaboratoryConfirmed:false});assert.equal(harmonized.status,'harmonized');assert.equal(harmonized.selected?.high,60);assert.equal(harmonized.selected?.range.provider,'CSCC');
 assert.equal(publishedLabRanges.length,37);assert.ok(publishedLabRanges.every(range=>range.availability==='provisional'&&range.scientificReviewStatus==='pending'));
});
test('55 U/L never chooses an upper60 over upper45 to make a result look normal; ambiguous order and values do not resolve it',()=>{
 const alternatives=[row,{...row,id:'synthetic-sk-alternative',high:60}];
 const resolve=(value:number,rows=alternatives)=>resolveCanadianReference({...context,value}as ProviderRangeContext,rows,proof);
 for(const value of[0,40,55,100,1e6]){const found=resolve(value);assert.equal(found.status,'ambiguous');assert.equal(found.selected,null);assert.deepEqual(found.candidates.map(candidate=>candidate.high),[45,60]);assert.deepEqual(resolve(value,[...alternatives].reverse()),found);}
});
test('unknown/mismatched historical context, incompatible units, province, era or rights never become confirmed applicability',()=>{
 for(const patch of[{provider:'Other lab'},{province:'BC'},{province:''},{method:'unknown'},{assay:''},{specimen:''},{ageAtCollection:null},{ageAtCollection:10},{sourceUnit:'mg/dL'},{collectedOn:'2024-12-31'},{collectedOn:'2027-01-01'}])assert.equal(resolveCanadianReference({...context,...patch},[row],proof).selected,null,JSON.stringify(patch));
 for(const changed of[{...proof,performingLaboratoryConfirmed:false},{...proof,collectionContextConfirmed:false},{...proof,sourceMatches:false}])assert.equal(resolveCanadianReference(context,[row],changed).selected,null);
 for(const patch of[{rightsStatus:undefined},{rightsSourceUrl:undefined},{scientificReviewStatus:'pending'}])assert.equal(resolveCanadianReference(context,[{...row,...patch}],proof).selected,null);
 assert.equal(resolveCanadianReference({...context,sexReferenceCategory:null},[{...row,sexReferenceCategory:'F'}],proof).selected,null);
 assert.equal(resolveCanadianReference({...context,fasting:'unknown'},[{...row,fasting:'yes'}],proof).selected,null);
 const unscoped={...row,ageMinYears:undefined,ageMaxYears:undefined};assert.equal(resolveCanadianReference({...context,ageAtCollection:null},[unscoped],proof).selected,null,'Missing age constraints are not an assertion of all-age applicability');
 const allAges={...unscoped,ageApplicability:'all-ages'};assert.equal(resolveCanadianReference({...context,ageAtCollection:null},[allAges],proof).status,'laboratory','Only an explicit verified all-age scope permits an unknown collection age');
 assert.equal(labRangeSchema.safeParse({...row,ageApplicability:'all-ages'}).success,false);
});
test('owner-approved provincial provisional publications remain visible as suggestions, without inventing a performing lab or confirmation',()=>{
 const provisional={...row,availability:'provisional',scientificReviewStatus:'pending',rightsStatus:undefined,rightsSourceUrl:undefined};
 const contextProof={...proof,collectionContextConfirmed:false,sourceMatches:false};
 const found=resolveCanadianReference({...context,method:'unknown',specimen:'',assay:'',ageAtCollection:null,collectedOn:''},[provisional],contextProof);
 assert.equal(found.status,'provisional');assert.equal(found.selected,null);assert.equal(found.candidates[0].high,45);
 assert.equal(resolveCanadianReference(context,[provisional],{...contextProof,performingLaboratoryConfirmed:false}).candidates.length,0);
 assert.equal(resolveCanadianReference({...context,province:'ON'},[provisional],contextProof).candidates.length,0);
 const actual=resolveCanadianReference({...context,provider:'LifeLabs',province:'BC',markerId:'ferritin',sourceUnit:'ug/L',plotUnit:'ug/L',method:'unknown',ageAtCollection:null,sexReferenceCategory:null},publishedLabRanges,contextProof);assert.equal(actual.status,'ambiguous');assert.equal(actual.selected,null);assert.equal(actual.candidates.length,2);
});
test('one-sided limits and multiple decision thresholds retain their class and cannot make a two-sided normal band',()=>{
 const low={...row,id:'synthetic-low-limit',kind:'clinical_decision_limit',high:30},high={...row,id:'synthetic-high-limit',kind:'clinical_decision_limit',low:600,high:undefined};
 const found=resolveCanadianReference(context,[low,high],proof);assert.equal(found.status,'limits-only');assert.equal(found.selected,null);assert.equal(found.candidates.length,0);assert.equal(found.limits.length,2);assert.ok(found.limits.every(match=>match.low===null||match.high===null));
 assert.equal(labRangeSchema.safeParse({...row,kind:'treatment_target'}).success,false);
 assert.equal(labRangeSchema.safeParse({...row,low:null,high:null}).success,false);
});
