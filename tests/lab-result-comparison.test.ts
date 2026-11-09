import test from 'node:test';import assert from 'node:assert/strict';import{compareRecordedLabResults,formatRecordedLabNumber}from'../shared/lab-history';
const a={id:'a',date:'2026-10-01T12:00:00Z',value:3.58,unit:'mmol/L',sourceValue:138.4,sourceUnit:'mg/dL'},b={id:'b',date:'2026-10-02T12:00:00Z',value:3.10,unit:'mmol/L',sourceValue:3.10,sourceUnit:'mmol/L'};
test('selected result comparison uses current own source IDs, preserves originals and computes only chronological same-unit arithmetic',()=>{
 const points=[a,b],snapshot=JSON.stringify(points),r=compareRecordedLabResults(points,'a','b');assert.equal(r.status,'recorded-difference');assert.ok(Math.abs(r.difference!+.48)<1e-12);assert.equal(formatRecordedLabNumber(r.difference!),'-0.48');assert.equal(r.first,a);assert.equal(r.second,b);assert.equal(JSON.stringify(points),snapshot);
 assert.equal(compareRecordedLabResults(points,'','b').status,'choose-two');assert.equal(compareRecordedLabResults(points,'foreign','b').status,'unavailable');assert.equal(compareRecordedLabResults(points,'a','a').status,'same-record');assert.equal(compareRecordedLabResults(points,'b','a').status,'reverse-time');assert.equal(compareRecordedLabResults([a,{...b,date:a.date}],'a','b').status,'same-time');assert.equal(compareRecordedLabResults([a,{...b,unit:'unknown'}],'a','b').status,'incompatible');assert.equal(compareRecordedLabResults([a,a,b],'a','b').status,'unavailable');assert.equal(compareRecordedLabResults([a,{...b,value:Infinity}],'a','b').difference,null);
});
test('zero difference, tiny nonzero difference and same-day separate times remain distinct from unavailable or overflow',()=>{
 assert.equal(compareRecordedLabResults([a,{...b,value:a.value}],'a','b').difference,0);assert.equal(formatRecordedLabNumber(-0),'0');const tiny=compareRecordedLabResults([{...a,value:0},{...b,value:.0000001}],'a','b');assert.equal(tiny.difference,.0000001);assert.equal(formatRecordedLabNumber(tiny.difference!),'0.0000001');assert.equal(compareRecordedLabResults([a,{...b,date:'2026-10-01T13:00:00Z'}],'a','b').status,'recorded-difference');assert.equal(compareRecordedLabResults([{...a,value:-1e308},{...b,value:1e308}],'a','b').difference,null);assert.equal(compareRecordedLabResults([a,{...b,date:'unknown'}],'a','b').status,'incompatible');
});

test('explicit source revisions retain selections while ambiguous successors and deleted records stay unavailable',()=>{
 const current={...a,id:'a3',supersededIds:['a','a2']};
 assert.equal(compareRecordedLabResults([current,b],'a','b').first,current);
 assert.equal(compareRecordedLabResults([current,b],'a','a2').status,'same-record');
 assert.equal(compareRecordedLabResults([current,{...current,id:'fork'},b],'a','b').status,'unavailable');
 assert.equal(compareRecordedLabResults([b],'a','b').status,'unavailable');
 assert.equal(compareRecordedLabResults([{...current,date:'2026-10-03T12:00:00Z'},b],'a','b').status,'reverse-time');
});
