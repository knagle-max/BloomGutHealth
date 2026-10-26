import test from'node:test';import assert from'node:assert/strict';import{possibleLabReimports}from'../shared/lab-reimport';import{parseLabPaste}from'../shared/lab-paste';
const base=parseLabPaste('LDL, 0.00, mmol/L','2026-10-01T12:00:00Z','Synthetic lab').valid[0].payload;
test('possible reimports use original source facts, retain zero and respect distinct known specimens without merging records',()=>{
 const prior={...base,id:'original'},incoming={...base};assert.equal(possibleLabReimports(incoming,[]).length,0);assert.deepEqual(possibleLabReimports(incoming,[prior]),[prior]);
 for(const change of [{value:1},{unit:'mg/dL'},{measuredAt:'2026-10-02T12:00:00Z'},{laboratory:'Other lab'},{method:'Other assay'},{fasting:'yes'},{referenceHigh:5}]){const changed={...base,...change} as typeof base;if(change.unit)changed.sourceInput={...base.sourceInput!,suppliedUnit:change.unit};assert.equal(possibleLabReimports(changed,[prior]).length,0);}
 const first={...prior,sourceReport:{importId:'fb001025-1025-4025-8025-000000000001',reportIdentifier:' exact report ',specimenIdentifier:' specimen-A '}};
 const next={...first,sourceReport:{...first.sourceReport,importId:'fb001025-1025-4025-8025-000000000002'}};assert.equal(possibleLabReimports(next,[first]).length,1);assert.equal(possibleLabReimports(first,[first]).length,0,'Same import receipt recovery is not a new import');
 assert.equal(possibleLabReimports({...next,sourceReport:{...next.sourceReport,specimenIdentifier:' specimen-B '}},[first]).length,0);assert.equal(possibleLabReimports({...next,sourceReport:{...next.sourceReport,reportIdentifier:'other report'}},[first]).length,0);assert.equal(possibleLabReimports(next,[prior]).length,1,'Unknown old identifiers remain advisory candidates, not fabricated matches');
 const pending=parseLabPaste('LDL, 120','2026-10-01T12:00:00Z').pending[0].payload;const confirmed={...pending,id:'confirmed',unit:'mg/dL',unitReview:{...pending.unitReview!,status:'confirmed' as const,confirmedAt:'2026-10-02T12:00:00Z',supersedes:'pending'}};assert.equal(possibleLabReimports(pending,[confirmed]).length,1,'Confirmation must not pretend the original report supplied a unit');assert.equal(possibleLabReimports({...pending,sourceInput:{...pending.sourceInput!,suppliedUnit:'mmol/L'}},[confirmed]).length,0);
});

test('raw source reimport review compares exact reported facts without clinical mapping, merges or threshold coercion',()=>{
 const raw=parseLabPaste('Unknown assay, <0.50, arbitrary-unit, <2.0','2026-10-01T12:00:00Z','Synthetic lab').sourceOnly[0].payload;
 const prior={...raw,id:'raw'};
 assert.deepEqual(possibleLabReimports(raw,[prior]),[prior]);
 for(const change of [{reportedAnalyte:'Other assay'},{reportedValue:'0.50'},{reportedValue:'<0.5'},{reportedUnit:null},{reportedReferenceInterval:'<3.0'},{measuredAt:'2026-10-02T12:00:00Z'},{laboratory:'Other lab'},{method:'Other assay'},{fasting:'yes'}])assert.equal(possibleLabReimports({...raw,...change} as typeof raw,[prior]).length,0);
 assert.equal(possibleLabReimports(raw,[{...base,id:'clinical'}]).length,0);
 assert.equal(possibleLabReimports(base,[prior]).length,0,'Source-only values never stand in for interpreted markers');
 const sourceReport={importId:'fb001025-1025-4025-8025-000000000001',specimenIdentifier:'specimen-A'};
 const incoming={...raw,sourceReport};
 assert.equal(possibleLabReimports(incoming,[{...prior,sourceReport}]).length,0,'Same import receipt is not another source');
 const previous={...prior,sourceReport:{...sourceReport,importId:'fb001025-1025-4025-8025-000000000002'}};
 assert.equal(possibleLabReimports(incoming,[previous]).length,1);
 assert.equal(possibleLabReimports(incoming,[{...previous,sourceReport:{...previous.sourceReport,specimenIdentifier:'specimen-B'}}]).length,0);
 const zero=parseLabPaste('Qualitative assay, 0','2026-10-01T12:00:00Z').sourceOnly[0].payload;
 assert.equal(possibleLabReimports(zero,[{...zero,id:'zero'}]).length,1);
 assert.equal(possibleLabReimports({...zero,reportedValue:'Negative'},[{...zero,id:'zero'}]).length,0);
});
