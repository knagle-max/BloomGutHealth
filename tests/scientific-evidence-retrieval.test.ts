import {test} from 'node:test';
import assert from 'node:assert/strict';
import {biologicalRegistrySchema,type BiologicalRegistry} from '../shared/biological-model';
import {retrieveReviewedScientificEvidence,scientificRegistryBinding,scientificExcerptDigest,type ScientificRetrievalReview,type ScientificWithdrawals} from '../server/scientific-evidence-retrieval';
// Synthetic review records test mechanics only, never authorize real science.
function fixture(){
 const registry=biologicalRegistrySchema.parse({version:'synthetic-v1',summary:'Synthetic retrieval fixture',entities:[{id:'a',label:'A',kind:'molecule',summary:'Test',metadata:{}},{id:'b',label:'B',kind:'endpoint',summary:'Test',metadata:{}}],relationships:['positive','negative'].map((id,index)=>({id,from:'a',to:'b',claim:'Synthetic study-specific finding '+index,evidence:'human-intervention',confidence:'limited-human',humanRelevance:'Synthetic population',direction:'source-reported',context:'Synthetic assay',limitation:'Not clinical evidence',contradictionStatus:'limitations-recorded',contradictions:[],rule:'context-only',sourceIds:['paper-'+index]})),sources:[0,1].map(i=>({id:'paper-'+i,title:'Synthetic paper '+i,url:'https://example.org/paper-'+i,design:'Synthetic trial',population:'Synthetic adults',limitation:'Not a real source'}))});
 const reviews:ScientificRetrievalReview[]=registry.relationships.map((relationship,i)=>{
 const excerpt='Synthetic source excerpt '+i+' is a test fixture, not a published finding.';
 return{id:'review-'+i,relationshipId:relationship.id,sourceId:'paper-'+i,registryBinding:scientificRegistryBinding(registry,relationship,'paper-'+i),sourceVersion:'test-v1',contentDigest:'a'.repeat(64),locator:'Synthetic table 1',excerpt,excerptDigest:scientificExcerptDigest(excerpt),findingDirection:i?'null':'supporting',studyDesign:'Synthetic trial',population:'Synthetic adults',measurementContext:'Synthetic assay',applicabilityLimits:['Not a real published source'],review:{id:'decision-'+i,reviewerId:'fixture-reviewer',disposition:'independently-source-verified',scope:'nonpersonal-scientific-retrieval',validUntil:'2027-01-01T00:00:00Z'},rights:{id:'rights-'+i,revision:'v1',license:'Synthetic fixture only',sourceUrl:'https://example.org/paper-'+i,retrievalEligible:true,modelTrainingEligible:false,validUntil:'2027-01-01T00:00:00Z'}};
 });
 const withdrawals:ScientificWithdrawals={relationshipIds:new Set(),sourceIds:new Set(),reviewIds:new Set(),rightsIds:new Set()};
 const read=(changes:Partial<Parameters<typeof retrieveReviewedScientificEvidence>[0]>={})=>retrieveReviewedScientificEvidence({registry,reviews,withdrawals,query:{entityIds:['a']},now:Date.parse('2026-11-19T12:00:00Z'),...changes});
 return{registry,reviews,withdrawals,read};
}
test('retrieval preserves supportive AND null findings; never grants clinical or training authority',()=>{
 const f=fixture(),result=f.read();assert.equal(result.cards.length,2);assert.equal(result.opposingEvidenceStatus,'included');assert.equal(result.withheld,0);assert.equal(result.clinicalReleasePermitted,false);assert.equal(result.modelTrainingPermitted,false);
 result.cards[0].relationship.claim='changed';assert.notEqual(f.registry.relationships[1].claim,'changed');
});
test('metadata and graph membership alone never constitute source review or eligible research',()=>{
 const f=fixture(),result=f.read({reviews:[]});assert.equal(result.cards.length,0);assert.equal(result.withheld,2);assert.equal(result.opposingEvidenceStatus,'not-established');assert.equal(result.studyFamilyCount,null);
 const invalid=structuredClone(f.reviews);(invalid[0].review as any).disposition='model-agreement';assert.equal(f.read({reviews:invalid}).cards.length,1);
});
test('registry claim edit or excerpt corruption invalidates its bound review',()=>{
 const f=fixture();f.registry.relationships[0].claim='An unsupported new conclusion';assert.equal(f.read().cards.length,1);
 const g=fixture();g.reviews[1].excerpt='An injected replacement excerpt';assert.equal(g.read().cards.length,1);
});
test('current withdrawal survives old registry/review rollback and leaves unrelated evidence',()=>{
 const f=fixture(),before=f.read(),saved=structuredClone({registry:f.registry,reviews:f.reviews});
 (f.withdrawals.sourceIds as Set<string>).add('paper-0');
 const withdrawn=f.read({...saved});assert.equal(withdrawn.cards.length,1);assert.equal(withdrawn.cards[0].source.id,'paper-1');assert.notEqual(before.evidenceVersion,withdrawn.evidenceVersion);
});
test('expired rights, revoked review and ambiguous records abstain without arbitrary version selection',()=>{
 const f=fixture();f.reviews[0].rights.validUntil='2026-11-18T00:00:00Z';assert.equal(f.read().cards.length,1);
 const g=fixture();(g.withdrawals.reviewIds as Set<string>).add('review-1');assert.equal(g.read().cards.length,1);
 const h=fixture();h.reviews.push(structuredClone(h.reviews[0]));assert.equal(h.read().cards.length,1);
});
test('unknown/private query fields and ambiguous source identity are rejected',()=>{
 const f=fixture();assert.throws(()=>f.read({query:{entityIds:['a'],privateLabs:'sensitive'}}));assert.throws(()=>f.read({query:{entityIds:['unknown']}}));
 f.registry.sources.push({...f.registry.sources[0]});assert.throws(()=>f.read(),/AMBIGUOUS/);
});
test('duplicate DOI/case variants remain one publication while positive and null outcomes are both retained',()=>{
 const f=fixture();for(const review of f.reviews)review.publication={doi:'10.5555/SYNTHETIC',studyFamilyId:'synthetic-cohort'};
 const result=f.read();assert.equal(result.cards.length,2);assert.equal(result.publicationGroups.length,1);assert.equal(result.studyFamilyCount,1);assert.equal(result.opposingEvidenceStatus,'included');assert.equal(result.independence,'not-established-by-publication-count');assert.equal(result.publicationGroups[0].reviewIds.length,2);
 f.reviews[1].publication!.doi='10.5555/synthetic';assert.equal(f.read().studyFamilyCount,1);
});
test('different papers from the same reviewed cohort are not counted as independent studies; unknown identity stays unknown',()=>{
 const f=fixture();assert.equal(f.read().studyFamilyCount,null);assert.equal(f.read().unidentifiedPublications,2);
 f.reviews.forEach((review,i)=>{review.publication={doi:'10.5555/paper-'+i,studyFamilyId:'same-synthetic-cohort'};});
 const shared=f.read();assert.equal(shared.publicationGroups.length,2);assert.equal(shared.studyFamilyCount,1);
 f.reviews[1].publication!.studyFamilyId='different-cohort';assert.equal(f.read().studyFamilyCount,2);
});
test('conflicting study-family assignments to one DOI are refused, not resolved by order or majority',()=>{
 const f=fixture();f.reviews.forEach((review,i)=>{review.publication={doi:'10.5555/same-paper',studyFamilyId:'cohort-'+i};});
 assert.throws(()=>f.read(),/STUDY_IDENTITY_CONFLICT/);
});

test('review DOI conflicting with the exact source DOI resolver URL is withheld',()=>{
 const f=fixture(),review=f.reviews[0],source=f.registry.sources[0],claim=f.registry.relationships[0];
 source.url='https://doi.org/10.5555/synthetic-original';
 review.rights.sourceUrl=source.url;
 review.registryBinding=scientificRegistryBinding(f.registry,claim,source.id);
 review.publication={doi:'10.5555/different-paper',studyFamilyId:'synthetic-cohort'};
 const result=f.read();
 assert.equal(result.cards.length,1);assert.equal(result.withheld,1);
 assert.equal(result.cards[0].source.id,'paper-1');assert.equal(result.studyFamilyCount,null);
});

test('matching DOI resolver spelling preserves evidence without inventing unknown publication identity',()=>{
 for(const url of ['https://doi.org/10.5555/SYNTHETIC','https://dx.doi.org/10.5555%2Fsynthetic']){
  const f=fixture(),review=f.reviews[0],source=f.registry.sources[0];
  source.url=url;review.rights.sourceUrl=url;
  review.registryBinding=scientificRegistryBinding(f.registry,f.registry.relationships[0],source.id);
  review.publication={doi:'10.5555/synthetic',studyFamilyId:'synthetic-cohort'};
  assert.equal(f.read().cards.length,2);
  delete review.publication;
  const unknown=f.read();assert.equal(unknown.cards.length,2);assert.equal(unknown.studyFamilyCount,null);
 }
});
