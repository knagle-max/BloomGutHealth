import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceReferenceIntervalForPlot,labPlotExtent,referenceIntervalText} from '../shared/lab-reference-interval';
const point={sourceValue:120,sourceUnit:'mg/dL',unit:'mmol/L',referenceLow:80,referenceHigh:130,method:'reported assay'};
test('source reference bounds use the same marker-specific conversion as points without changing original units or values',()=>{
 const before=structuredClone(point),range=sourceReferenceIntervalForPlot('ldl',point)!;
 assert.equal(range.low,80/38.67);assert.equal(range.high,130/38.67);assert.equal(range.sourceLow,80);assert.equal(range.sourceHigh,130);assert.equal(range.sourceUnit,'mg/dL');assert.deepEqual(point,before);
 const affine=sourceReferenceIntervalForPlot('hba1c',{...point,sourceUnit:'mmol/mol',unit:'%',referenceLow:20,referenceHigh:42})!;
 assert.equal(affine.low,20*.09148+2.152);assert.equal(affine.high,42*.09148+2.152);
 const vitamin=sourceReferenceIntervalForPlot('vitamin_d',{...point,method:'25(OH)D',sourceUnit:'ng/mL',unit:'nmol/L',referenceLow:20,referenceHigh:50})!;
 assert.equal(vitamin.low,50);assert.equal(vitamin.high,125);
});
test('unknown/invalid units, source values, bounds and unsupported assay identity never create a normal range',()=>{
 for(const patch of [{referenceLow:null,referenceHigh:null},{referenceLow:'' as any},{referenceLow:-1},{referenceHigh:Infinity},{referenceLow:130},{referenceLow:150},{sourceUnit:''},{sourceUnit:'U/L'},{unit:'g/L'},{sourceValue:NaN},{unitReview:{status:'pending'}}])assert.equal(sourceReferenceIntervalForPlot('ldl',{...point,...patch}),null,JSON.stringify(patch));
 for(const method of ['','calcitriol','1,25-(OH)2','dihydroxy','25OH uncertain'])assert.equal(sourceReferenceIntervalForPlot('vitamin_d',{...point,method,sourceUnit:'ng/mL',unit:'nmol/L'}),null,method);
 assert.equal(sourceReferenceIntervalForPlot('unidentified',point),null);
});
test('one-sided bounds and a genuine zero remain distinct from absent limits',()=>{
 const range=sourceReferenceIntervalForPlot('alt',{sourceValue:0,sourceUnit:'U/L',unit:'U/L',referenceLow:null,referenceHigh:40})!;
 assert.equal(range.low,null);assert.equal(range.high,40);assert.match(referenceIntervalText(range.low,range.high,range.unit),/lower limit not supplied/);
 const lower=sourceReferenceIntervalForPlot('alt',{sourceValue:0,sourceUnit:'U/L',unit:'U/L',referenceLow:0,referenceHigh:null})!;
 assert.equal(lower.low,0);assert.equal(lower.high,null);assert.match(referenceIntervalText(0,null,'U/L'),/lower limit 0 U\/L; upper limit not supplied/);
});
test('plot axes include actual reference limits and stay finite even for extreme source bounds',()=>{
 const range=sourceReferenceIntervalForPlot('alt',{sourceValue:1,sourceUnit:'U/L',unit:'U/L',referenceLow:0,referenceHigh:100})!;
 const domain=labPlotExtent([1,2],[range]);assert.equal(domain.min,0);assert.ok(domain.max>100);
 for(const extent of [labPlotExtent([0],[]),labPlotExtent([1],[{...range,high:Number.MAX_VALUE}]),labPlotExtent([Number.MAX_VALUE],[])])assert.ok(Number.isFinite(extent.min)&&Number.isFinite(extent.max)&&extent.max>extent.min);
});
test('explicit one-sided source operators survive display conversion without inventing missing endpoints',()=>{
 for(const [text,operator,inclusive]of [['<130','<',false],['≤130','≤',true]]as const){
  const range=sourceReferenceIntervalForPlot('ldl',{...point,referenceLow:null,referenceHigh:130,sourceInput:{text:`LDL, 120, mg/dL, ${text}`,number:'120',suppliedUnit:'mg/dL',capture:'pasted-report'}})!;
  assert.equal(range.low,null);assert.equal(range.highInclusive,inclusive);assert.ok(referenceIntervalText(range.low,range.high,range.unit,range).startsWith(operator));
 }
 const lower=sourceReferenceIntervalForPlot('hdl',{...point,referenceLow:1,referenceHigh:null,sourceUnit:'mmol/L',unit:'mmol/L',sourceInput:{text:'HDL, 1.2, mmol/L, >1',number:'1.2',suppliedUnit:'mmol/L',capture:'pasted-report'}})!;assert.equal(lower.lowInclusive,false);assert.equal(lower.high,null);assert.match(referenceIntervalText(lower.low,lower.high,lower.unit,lower),/^>1 mmol\/L/);
 const corrected=sourceReferenceIntervalForPlot('ldl',{...point,referenceLow:null,referenceHigh:140,sourceInput:{text:'LDL, 120, mg/dL, <130',number:'120',suppliedUnit:'mg/dL',capture:'pasted-report'}})!;assert.equal(corrected.highInclusive,undefined,'Old raw operator cannot silently qualify an edited bound');
});
