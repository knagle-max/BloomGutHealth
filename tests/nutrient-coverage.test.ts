import test from 'node:test';
import assert from 'node:assert/strict';
import {knownNutrientCoverage} from '../shared/nutrient-coverage';
import {recordedIntakeSources,recordedIntakeViewSchema,type IntakeSourceRow} from '../shared/recorded-intake-sources';
import {captureNutrientSource} from '../shared/nutrient-source-snapshot';
const actor='a',date='2026-11-18',timeZone='UTC',asOf='2026-11-18T12:00:00Z';
const snapshot=captureNutrientSource({sourceId:'fdc:999',sourceVersion:'Synthetic v1',sourceUrl:'https://fdc.nal.usda.gov/food-details/999/nutrients',ingredient:'Synthetic',grams:200,per100g:{'1003':10,'1093':0,'1089':2,'1106':20}});
const meal={id:'meal',userId:actor,revision:'r1',loggedAt:'2026-11-18T10:00:00Z',analysis:{nutrientSourceSnapshots:[snapshot]}};
const read=(foods:any[]=[meal])=>recordedIntakeSources({actor,date,timeZone,asOf,foods,supplements:[]});
test('canonical recorded source subtotal preserves true zero, unknown, source changes and absence without a grand total or adequacy claim',()=>{
 const view=read();const before=structuredClone(view);
 assert.equal(knownNutrientCoverage(view,actor,'iron_mg').groups[0].knownSubtotal,4);
 const zero=knownNutrientCoverage(view,actor,'sodium_mg').groups[0];assert.equal(zero.knownSubtotal,0);assert.equal(zero.zeroRows,1);
 const unknown=knownNutrientCoverage(view,actor,'magnesium_mg').groups[0];assert.equal(unknown.knownSubtotal,null);assert.equal(unknown.unknownRows,1);
 const empty=knownNutrientCoverage(read([]),actor,'iron_mg');assert.deepEqual(empty.groups,[]);assert.equal('total'in empty,false);assert.equal(empty.adequacyAssessment,false);assert.equal(empty.usualIntakeAssessment,false);
 const correction={...meal,revision:'r2',analysis:{nutrientSourceSnapshots:[{...snapshot,reviewedGrams:100}]}};assert.equal(knownNutrientCoverage(read([correction]),actor,'iron_mg').groups[0].knownSubtotal,2);
 assert.equal(knownNutrientCoverage(read([meal,correction]),actor,'iron_mg').excludedRecords,1);assert.deepEqual(view,before);
 assert.throws(()=>knownNutrientCoverage(view,'b','iron_mg'),/SCOPE/);
});
function withRows(key:string,changes:Partial<IntakeSourceRow>[]){const view=read(),event=view.events[0],base=event.rows.find(row=>row.nutrientKey===key)!;view.events=changes.map((change,index)=>{const kind=change.sourceKind==='supplement-label'?'supplement' as const:'food' as const,key=event.key+index,recordId=event.recordId+index;return{...event,key,recordId,kind,rows:[{...base,eventKey:key,recordId,eventKind:kind,sourceIndex:0,...change}]};});return recordedIntakeViewSchema.parse(view);}
test('estimated foods, labels and elemental supplements stay separate; unknown/compound/unconfirmed vitamin equivalents never acquire subtotals',()=>{
 const view=withRows('iron_mg',[{amount:4},{sourceKind:'supplement-label',amount:10,mineralBasis:'elemental-label'},{sourceKind:'supplement-label',amount:20,mineralBasis:'compound-weight'},{sourceKind:'food-label',amount:5}]);
 const coverage=knownNutrientCoverage(view,actor,'iron_mg');assert.deepEqual(coverage.groups.map(group=>group.knownSubtotal),[4,10,null,null]);assert.equal(coverage.groups[2].incompatibleRows,1);
 const vitamins=knownNutrientCoverage(withRows('vitamin_a_ug',[{amount:40},{sourceKind:'food-label',amount:60,activityUnit:null}]),actor,'vitamin_a_ug');assert.equal(vitamins.groups[0].knownSubtotal,40);assert.equal(vitamins.groups[0].activityUnit,'µg RAE');assert.equal(vitamins.groups[1].knownSubtotal,null);
 const mismatched=knownNutrientCoverage(withRows('iron_mg',[{amount:100,unit:'g'},{amount:2,state:'conflicting'},{amount:null}]),actor,'iron_mg');assert.ok(mismatched.groups.every(group=>group.knownSubtotal===null));
});
test('malformed duplicate/aliased projections abstain rather than double count, and unavailable events are not zero',()=>{
 const view=read();view.events.push(structuredClone(view.events[0]));assert.throws(()=>knownNutrientCoverage(view,actor,'iron_mg'),/DUPLICATE_INTAKE_EVENT/);
 const repeated=withRows('iron_mg',[{}]);repeated.events[0].rows.push(structuredClone(repeated.events[0].rows[0]));assert.throws(()=>knownNutrientCoverage(repeated,actor,'iron_mg'),/DUPLICATE_INTAKE_ROW/);
 const alias=withRows('iron_mg',[{recordId:'wrong'}]);assert.throws(()=>knownNutrientCoverage(alias,actor,'iron_mg'),/ROW_IDENTITY/);
 const missing=read();missing.events[0].rows=[];const result=knownNutrientCoverage(missing,actor,'iron_mg');assert.equal(result.unavailableEvents,1);assert.deepEqual(result.groups,[]);
});
