import test from 'node:test';
import assert from 'node:assert/strict';
import {geneticHighlightClaims,geneticHighlightClaimSchema,selectGeneticHighlights,selectObservedGeneticEducation,type GeneticHighlightClaim,type GeneticHighlightSource} from '../shared/genetics-relevance';
import {explainGenotypes} from '../shared/genotype-explanations';
import {buildPrecisionReport,contextSchema,parse23andMe,precisionEntrySchema} from '../shared/precision-nutrition';
import {defaultPreferences} from '../shared/meal-intelligence';

// Entirely synthetic review/provenance fixtures, never production approvals or
// biological effect claims. Fake publication/review refs deliberately .invalid.
const claim=(index=1):GeneticHighlightClaim=>({
 id:`synthetic-claim-${index}`,version:'synthetic-v1',rsid:`rs${100000+index}`,gene:`SYNTHETIC${index}`,phenotype:'Synthetic educational outcome',meaning:'Synthetic association, not a personal intervention.',scope:'education',
 review:{state:'approved',reference:'synthetic-review-not-real-approval',reviewedOn:'2026-11-05'},placement:{build:'GRCh37',chromosome:'1',position:index,strand:'+'},genotypes:['AG'],assays:['synthetic-verified-assay'],
 contrast:{effectAllele:'A',otherAllele:'G',orientation:'forward'},
 population:{description:'Synthetic test population',transportability:'reviewed-general',allowedFitIds:[]},
 evidence:{credibility:'supported',design:'Synthetic human association fixture',direction:'Synthetic direction',effectSize:null,confidenceInterval:null,replication:'Synthetic replication fixture',contradictions:'Synthetic null-study accounting',limitations:'Not real scientific evidence.',citations:[{title:'Synthetic source',url:'https://example.invalid/synthetic'}]},
 independence:{group:`synthetic-group-${index}`,status:'unknown',reference:null},relevance:{goals:[],measuredContexts:[]},
});
const call=(c=claim()):GeneticHighlightSource['calls'][number]=>({rsid:c.rsid,genotype:'AG',build:'GRCh37',chromosome:'1',position:c.placement.position,strand:'+',assay:'synthetic-verified-assay',assayVerified:true,normalizationVerified:true,populationFitId:null});
const source=(calls=[call()]):GeneticHighlightSource=>({id:'synthetic-owned-source',revision:'synthetic-revision-1',consent:true,calls});
const project=(claims=[claim()],inputSource:GeneticHighlightSource|null=source(),context={goals:[] as string[],measuredContexts:[] as string[]})=>selectGeneticHighlights({claims,registryVersion:'synthetic-registry-1',source:inputSource,context,catalogued:200,matchedEducation:55});
test('200 catalogue /70 measured /55 reviewed /3 eligible gives exactly3 highlights, not padding or hidden count conflation',()=>{
 const claims=Array.from({length:55},(_,i)=>claim(i+1));
 const calls=Array.from({length:70},(_,i)=>({...call(claim(i+1)),assayVerified:i<3}));
 const result=project(claims,source(calls));
 assert.deepEqual(result.counts,{catalogued:200,measured:70,matchedEducation:55,interpretable:3,reviewedExplanations:55,personalEligible:3,selected:3});
 assert.equal(result.highlights.length,3);assert.equal(result.exclusions.length,52);
 assert.ok(result.highlights.every(h=>h.sourceRevision==='synthetic-revision-1'&&h.why.length===2));
 assert.deepEqual(geneticHighlightClaims,[],'no synthetic approval or legacy marker silently enters production registry');
});
test('eligibility precedes ordering: source, consent, exact review, scope, observed call, orientation, build, placement and assay fail independently',()=>{
 assert.equal(project([claim()],null).exclusions[0].reason,'source-unavailable');
 assert.equal(project([claim()],{...source(),consent:false}).exclusions[0].reason,'consent-required');
 const cases:Array<[Partial<GeneticHighlightClaim>,Partial<ReturnType<typeof call>>|null,string]>=[
  [{review:{state:'pending',reference:null,reviewedOn:null}},null,'claim-review-pending'],
  [{review:{state:'withdrawn',reference:'synthetic',reviewedOn:'2026-11-05'}},null,'claim-withdrawn'],
  [{scope:'clinical'},null,'restricted-scope'],[{scope:'pharmacogenetic'},null,'restricted-scope'],[{scope:'research-only'},null,'restricted-scope'],
  [{}, {genotype:'--'},'no-readable-call'],[{}, {genotype:'GA'},'normalization-unverified'],[{}, {normalizationVerified:false},'normalization-unverified'],
  [{}, {build:'unknown'},'placement-incompatible'],[{}, {position:2},'placement-incompatible'],[{}, {strand:'-'},'placement-incompatible'],
  [{}, {assayVerified:false},'assay-unverified'],[{}, {assay:'unsupported'},'assay-unverified'],[{}, {genotype:'AA'},'genotype-not-covered'],
 ];
 for(const[change,callChange,reason]of cases){const result=project([{...claim(),...change}],source([{...call(),...callChange}]));assert.equal(result.highlights.length,0);assert.equal(result.exclusions[0].reason,reason);}
 assert.equal(project([claim()],source([])).exclusions[0].reason,'not-measured');
 assert.equal(project([claim()],source([call(),call()])).exclusions[0].reason,'ambiguous-source');
});
test('population fit and missing science abstain; effect sizes and intervals can honestly remain unknown',()=>{
 const base=claim();
 for(const transportability of ['unknown','explicit-fit-required']as const){
  const specific={...base,population:{...base.population,transportability,allowedFitIds:['reviewed-test-fit']}};
  assert.equal(project([specific]).exclusions[0].reason,'population-unverified');
  if(transportability==='explicit-fit-required')assert.equal(project([specific],source([{...call(),populationFitId:'reviewed-test-fit'}])).highlights.length,1);
 }
 for(const evidence of [{...base.evidence,credibility:'unknown' as const},{...base.evidence,direction:null},{...base.evidence,replication:null},{...base.evidence,contradictions:null}])assert.equal(project([{...base,evidence}]).exclusions[0].reason,'evidence-incomplete');
 assert.equal(project([{...base,contrast:{...base.contrast,effectAllele:null}}]).exclusions[0].reason,'evidence-incomplete');
 assert.equal(project([{...base,genotypes:['GT']}],source([{...call(),genotype:'GT'}])).exclusions[0].reason,'genotype-not-covered','a measured reference-compatible call outside the study contrast remains measured, not protected');
 assert.equal(project().highlights[0].claim.evidence.effectSize,null);assert.equal(project().highlights[0].claim.evidence.confidenceInterval,null);
});
test('evidence-first ordinal relevance is stable across input order, context and missingness without a rarity or numeric risk score',()=>{
 const c1=claim(1),c2={...claim(2),relevance:{goals:['training'],measuredContexts:['measured-vitamin-d']}},c3={...claim(3),evidence:{...claim(3).evidence,credibility:'replicated' as const}};
 const inputSource=source([call(c1),call(c2),call(c3)]),claims=[c1,c2,c3];
 const missing=project(claims,inputSource),goal=project(claims,inputSource,{goals:['training'],measuredContexts:[]});
 assert.deepEqual(missing.highlights.map(h=>h.claim.id),[c3.id,c1.id,c2.id]);
 assert.deepEqual(goal.highlights.map(h=>h.claim.id),[c3.id,c2.id,c1.id]);
 assert.deepEqual(project([...claims].reverse(),inputSource,{goals:['training'],measuredContexts:[]}),goal);
 assert.ok(goal.highlights[1].why.some(w=>w.includes('goal you recorded')));
 assert.ok(!JSON.stringify(goal).includes('riskScore'));assert.deepEqual(c2.evidence,goal.highlights[1].claim.evidence);
 assert.ok(!missing.highlights.some(h=>h.why.some(w=>w.includes('measurement adds context'))));
 const measured=project(claims,inputSource,{goals:[],measuredContexts:['measured-vitamin-d']});assert.ok(measured.highlights[1].why.some(w=>w.includes('separately recorded measurement')));
});
test('FADS linked claims collapse without deleting raw calls; no independent effect approval is invented',()=>{
 const claims=['rs174547','rs174550','rs174576'].map((rsid,i)=>({...claim(i+1),rsid}));const inputSource=source(claims.map(c=>call(c)));
 const before=JSON.stringify(inputSource),result=project(claims,inputSource);
 assert.equal(result.counts.personalEligible,3);assert.equal(result.highlights.length,1);assert.equal(result.eligible.length,3);assert.equal(JSON.stringify(inputSource),before);
 const distinct=claims.map(c=>({...c,independence:{...c.independence,status:'reviewed-distinct' as const,reference:'synthetic-explicit-independent-effects-review'}}));
 assert.equal(project(distinct,inputSource).highlights.length,3);
 assert.equal(project(distinct.map(c=>({...c,independence:{...c.independence,reference:null}})),inputSource).highlights.length,1);
 const duplicate=[claim(),{...claim(),id:'another-synthetic-claim'}];assert.equal(project(duplicate).highlights.length,1);
});
test('APOE one/both markers never unlock isoform/ordinary highlights; no-call, missing LPA tag or GC call cannot invent a measurement or protection',()=>{
 const apoe=['rs429358','rs7412'].map((rsid,i)=>({...claim(i+1),rsid}));
 assert.equal(project(apoe,source(apoe.map(c=>call(c)))).highlights.length,0);
 const base=claim(),missing=project([base],source([]),{goals:[],measuredContexts:['measured-lpa']});
 assert.equal(missing.counts.personalEligible,0);assert.equal(missing.exclusions[0].reason,'not-measured');assert.ok(!JSON.stringify(missing).includes('normal risk'));
 assert.equal(project([base],source([{...call(),genotype:'--'}])).counts.measured,0);
});
test('fresh projection withdraws highlights on delete/revoke/correction/retraction; no prior projection cache or cross-source mutation survives',()=>{
 const base=claim(),inputSource=source(),old=project([base],inputSource);
 assert.equal(old.highlights.length,1);
 for(const next of [project([base],null),project([base],{...inputSource,consent:false}),project([base],source([{...call(),normalizationVerified:false}])),project([{...base,review:{...base.review,state:'retracted'}}])])assert.equal(next.highlights.length,0);
 const foreign=project([base],{...inputSource,id:'synthetic-other-owner-source',revision:'synthetic-revision-2'});
 assert.equal(foreign.highlights[0].sourceId,'synthetic-other-owner-source');assert.equal(old.highlights[0].sourceId,'synthetic-owned-source');
 assert.equal(old.highlights[0].claim.review.state,'approved');assert.equal(base.review.state,'approved');
});
test('strict versioned registry bounds reject unknown fields, unnormalised calls and duplicate claim IDs; top selection has a five-card ceiling',()=>{
 assert.equal(geneticHighlightClaimSchema.safeParse({...claim(),automaticDose:'invented'}).success,false);
 assert.equal(geneticHighlightClaimSchema.safeParse({...claim(),genotypes:['GA']}).success,false);
 assert.throws(()=>project([claim(),claim()]),/Duplicate genetic claim identity/);
 const claims=Array.from({length:12},(_,i)=>claim(i+1));const result=project(claims,source(claims.map(c=>call(c))));assert.equal(result.highlights.length,5);assert.equal(result.eligible.length,12);
});
test('real report adapter preserves raw/legacy education without claiming verified assay or accepting client review/context overrides',()=>{
 const date='2026-11-01T12:00:00Z',payload=parse23andMe('# 23andMe\n# build 37\nrs1801133 1 11856378 AG',date);
 const report=buildPrecisionReport([{id:'synthetic-real-adapter',kind:'genetics',createdAt:date,payload}],contextSchema.parse({goals:['training']}),defaultPreferences,null);
 assert.equal(report.genetics.explanations[0].status,'matched');assert.equal(report.genetics.personalHighlights.counts.matchedEducation,1);
 assert.equal(report.genetics.personalHighlights.counts.measured,1);assert.equal(report.genetics.personalHighlights.counts.interpretable,0);assert.equal(report.genetics.personalHighlights.counts.personalEligible,0);
 assert.equal(precisionEntrySchema.safeParse({kind:'genetics',payload:{...payload,highlightClaims:[claim()],assayVerified:true}}).success,false);
 assert.equal(report.genetics.personalHighlights.counts.reviewedExplanations,0);
 const erased=buildPrecisionReport([],contextSchema.parse({}),defaultPreferences,null);assert.equal(erased.genetics.personalHighlights.counts.measured,0);assert.deepEqual(erased.genetics.personalHighlights.highlights,[]);
});
test('source-observed education remains useful without claim approval: exact ordinary calls, uncertain study comparison, no-call/strand/sensitive/duplicate safeguards',()=>{
 const entries=explainGenotypes([{rsid:'rs1801133',genotype:'AG'},{rsid:'rs7903146',genotype:'GT'},{rsid:'rs174547',genotype:'--'},{rsid:'rs429358',genotype:'CC'},{rsid:'rs1800562',genotype:'AA'}],true);
 const before=JSON.stringify(entries),education=selectObservedGeneticEducation(entries);
 assert.deepEqual(education.selected.map(e=>e.rsid),['rs1801133','rs7903146']);assert.equal(geneticHighlightClaims.length,0);
 assert.equal(education.selected[1].status,'outside-studied-pair');assert.equal(education.selected[1].genotype,'GT');assert.ok(education.selected.every(e=>e.sources.length&&e.geneRole));
 assert.deepEqual(selectObservedGeneticEducation(explainGenotypes([{rsid:'rs1801133',genotype:'AG'}],false)).selected,[]);
 assert.deepEqual(selectObservedGeneticEducation([entries[0],{...entries[0],genotype:'--',status:'no-call'}]).selected,[]);
 assert.equal(JSON.stringify(entries),before);assert.deepEqual(selectObservedGeneticEducation([]),{all:[],selected:[]});
});
