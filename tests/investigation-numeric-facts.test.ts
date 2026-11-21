import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyInvestigationNumericClaims as verify,type InvestigationLabNumericFact} from '../shared/investigation-numeric-facts';
import {groundInvestigationCandidate} from '../shared/biological-investigation';
const fact=(id:string,amount:number,occurredAt:string):InvestigationLabNumericFact=>({id,domain:'lab',sourceId:'synthetic-'+id,revision:'synthetic-source-revision',marker:'ldl',amount,unit:'mmol/L',occurredAt,laboratory:'Synthetic lab',method:'Synthetic assay',fasting:'unknown',computationEligible:true});
const facts=()=>[fact('old',0.1,'2026-10-01T00:00:00Z'),fact('new',0.3,'2026-11-01T00:00:00Z')];
const value={id:'source-number',operation:'source-value' as const,observationIds:['old'],value:0.1,unit:'mmol/L'};
const delta={id:'recorded-change',operation:'recorded-difference' as const,observationIds:['old','new'],value:0.2,unit:'mmol/L'};
const ids=['old','new'];
test('source value and binary-roundoff difference reuse canonical numbers without clinical significance',()=>{
 const rows=facts(),before=structuredClone(rows);assert.equal(verify([value,delta],rows,ids),true);assert.deepEqual(rows,before);
 rows[0].amount=0;assert.equal(verify([{...value,value:0}],rows,ids),true);
 assert.equal(verify([{...delta,value:-0.1}],facts().map((row,i)=>i?{...row,amount:0}:row),ids),true);
});
test('fabricated amount, rounding, unit, source ID, duplicate claim and unsupported operations fail closed',()=>{
 for(const claim of [{...value,value:0},{...delta,value:0.21},{...value,unit:'mg/dL'},{...value,observationIds:['foreign']},{...delta,observationIds:['old','old']},{...delta,operation:'eval',code:'arbitrary'},{...value,value:Infinity},{...value,value:NaN}])assert.equal(verify([claim] as any,facts(),ids),false);
 assert.equal(verify([value,value],facts(),ids),false);assert.equal(verify([value],facts(),['new']),false);
});
test('missing facts, duplicate IDs, unsupported units, pending review, unknown identity and malformed date remain unavailable',()=>{
 assert.equal(verify([value],undefined,ids),false);
 for(const changes of [{computationEligible:false},{unit:'unknown'},{marker:'unknown'},{marker:'bilirubin'},{amount:NaN},{occurredAt:'2026-02-30T00:00:00Z'},{revision:''}]){const rows=facts();Object.assign(rows[0],changes);assert.equal(verify([value],rows,ids),false);}
 assert.equal(verify([value],[...facts(),facts()[0]],ids),false);assert.equal(verify([],undefined,[]),true);
});
test('chronology and source compatibility reuse existing assay/lab/unit/fasting guards',()=>{
 for(const changes of [{laboratory:'Other synthetic lab'},{laboratory:'unknown'},{method:'Other assay'},{method:'unknown'},{unit:'mg/dL'},{marker:'hdl'},{occurredAt:'2026-10-01T00:00:00Z'},{occurredAt:'2026-09-01T00:00:00Z'},{fasting:'yes'}]){const rows=facts();Object.assign(rows[1],changes);assert.equal(verify([delta],rows,ids),false);}
 const glucose=facts().map(row=>({...row,marker:'glucose'}));assert.equal(verify([delta],glucose,ids),false,'Unknown fasting must not become a verified glucose comparison');
});
test('25-OH and1,25 vitamin D stay distinct even if a caller labels the source computationally eligible',()=>{
 const rows=facts().map(row=>({...row,marker:'vitamin_d',unit:'nmol/L',method:'25-OH vitamin D'}));
 const claim={...value,unit:'nmol/L'};assert.equal(verify([claim],rows,ids),true);
 rows[0].sourceInput={text:'1,25-dihydroxy vitamin D'};assert.equal(verify([claim],rows,ids),false);
});
test('grounding requires current source arithmetic, never model self-certification or expression execution',()=>{
 const current={accountScope:'synthetic-a',purpose:'personal-wellness' as const,permitted:true,snapshotId:'snapshot',sourceEpoch:'epoch',evidenceVersion:'evidence',observationIds:ids,eligibleEvidenceIds:[],numericFacts:facts()};
 const candidate={snapshotId:'snapshot',sourceEpoch:'epoch',evidenceVersion:'evidence',hypotheses:[],numericClaims:[value,delta],synthesis:{finding:'No biological interpretation is established by these numeric checks.',hypothesisIds:[],abstention:true,limits:['Only the structured source arithmetic is checked.']}};
 assert.equal(groundInvestigationCandidate(candidate,'synthetic-a',current).state,'research-only-unverified');
 for(const changed of [{...candidate,numericClaims:[{...value,value:99}]},{...candidate,numericClaims:[{...value,verified:true}]},{...candidate,numericClaims:[{...value,expression:'process.exit()'}]}])assert.equal(groundInvestigationCandidate(changed,'synthetic-a',current).state,'abstain');
 assert.equal(groundInvestigationCandidate(candidate,'synthetic-a',{...current,numericFacts:undefined}).state,'abstain');
 assert.equal(groundInvestigationCandidate(candidate,'synthetic-b',current).state,'abstain');
});

test('tiny nonzero observations and differences never acquire a fake zero or rounding floor',()=>{
 const rows=facts();rows[0].amount=1e-20;rows[1].amount=2e-20;
 assert.equal(verify([{...value,value:1e-20}],rows,ids),true);
 assert.equal(verify([{...value,value:0}],rows,ids),false);
 assert.equal(verify([{...delta,value:1e-20}],rows,ids),true);
 assert.equal(verify([{...delta,value:0}],rows,ids),false);
 assert.equal(verify([{...value,value:1e-20+1e-35}],rows,ids),false,'Source values are exact, not derived tolerances');
 for(const claims of [null,undefined,{},'arbitrary',Array(13).fill(value)])assert.equal(verify(claims,rows,ids),false);
});

test('a source calendar day without a collection time never establishes an intraday order',()=>{
 const report={importId:'00000000-0000-4000-8000-000000000001',enteredDate:'2026-10-01'};
 const rows=facts().map((row,index)=>({...row,occurredAt:index?'2026-10-01T12:00:00Z':'2026-10-01T00:00:00Z',sourceReport:{...report}}));
 assert.equal(verify([delta],rows,ids),false);
 Object.assign(rows[0].sourceReport,{enteredTime:'00:00'});Object.assign(rows[1].sourceReport,{enteredTime:'12:00'});
 assert.equal(verify([delta],rows,ids),true);
});
