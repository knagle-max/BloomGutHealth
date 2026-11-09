import test from 'node:test';
import assert from 'node:assert/strict';
import {vitaminDAssayIdentity,supportsVitaminDStatus} from '../shared/lab-assay-identity';
import {supportedSourceIntervalPosition} from '../shared/biology-lab-observation';
import {parseLabPaste} from '../shared/lab-paste';
const date='2026-11-08T12:00:00Z';
const unsupported=['1,25-dihydroxyvitamin D','1,25-(OH)2 vitamin D','calcitriol','dihydroxy','25OH / calcitriol','1,25 OH','1,25OH','1,25(OH)2D','1,25–dihydroxyvitamin D'];
test('only explicit supported vitamin D identity permits source-interval context',()=>{
 for(const method of ['25(OH)D','25OH','25-OH vitamin D','25-hydroxyvitamin D','25 hydroxy vitamin D']){
  assert.equal(vitaminDAssayIdentity(method),'25-hydroxy',method);
  assert.equal(supportedSourceIntervalPosition('vitamin_d',['ng/mL'],{method,sourceValue:10,sourceUnit:'ng/mL',referenceLow:20,referenceHigh:50}),'below',method);
 }
 for(const method of [...unsupported,'','Vitamin D','25OH uncertain','25OH?','125OH','25 hydroxylase']){
  assert.equal(supportsVitaminDStatus({method}),false,method);
  assert.equal(supportedSourceIntervalPosition('vitamin_d',['ng/mL'],{method,sourceValue:10,sourceUnit:'ng/mL',referenceLow:20,referenceHigh:50}),'unknown',method);
 }
 assert.equal(supportsVitaminDStatus({method:'25OH',sourceInput:{text:'calcitriol, 10, ng/mL'}}),false);
});
test('uncertain units and invalid source intervals abstain without mutating observations',()=>{
 const base={method:'25OH',sourceValue:0,sourceUnit:'ng/mL',referenceLow:20,referenceHigh:50};
 assert.equal(supportedSourceIntervalPosition('vitamin_d',['ng/mL'],base),'below');
 for(const patch of [{referenceLow:-1},{referenceLow:50},{referenceLow:60},{referenceHigh:Infinity},{sourceUnit:'pg/mL'},{unitReview:{status:'pending'}},{sourceValue:NaN}]){
  const point={...base,...patch},copy=structuredClone(point);
  assert.equal(supportedSourceIntervalPosition('vitamin_d',['ng/mL'],point),'unknown');assert.deepEqual(point,copy);
 }
 assert.equal(supportedSourceIntervalPosition('ldl',['mmol/L'],{sourceValue:4,sourceUnit:'mmol/L',referenceLow:0,referenceHigh:3}),'above');
});
test('incompatible pasted assays retain exact source-only evidence instead of canonical vitamin D',()=>{
 for(const name of unsupported){
  const raw=`${name}, 30, ng/mL`,result=parseLabPaste(raw,date);
  assert.equal(result.valid.length,0,raw);assert.equal(result.pending.length,0,raw);
  assert.equal(result.sourceOnly.length,1,raw);
  const point=result.sourceOnly[0].payload;
  assert.equal(point.reportedAnalyte,name);assert.equal(point.reportedValue,'30');assert.equal(point.reportedUnit,'ng/mL');assert.equal(point.sourceInput.text,raw);
 }
 for(const name of ['25(OH)D','25OH','25-hydroxyvitamin D'])assert.equal(parseLabPaste(`${name}, 30, ng/mL`,date).valid.length,1,name);
});
