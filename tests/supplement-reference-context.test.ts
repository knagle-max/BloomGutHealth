import test from 'node:test';
import assert from 'node:assert/strict';
import {vitaminB6ReferenceContext,vitaminB6ReferenceEntrySchema,hasVitaminB6Declaration} from '../shared/supplement-reference-context';
test('B6 authority/year/unit/scope remain distinct; a product warning and proposal cannot become a universal UL',()=>{
 const entries=vitaminB6ReferenceContext.entries;assert.equal(entries.length,4);const limits=entries.filter(row=>row.kind==='reference_ul');assert.deepEqual(limits.map(row=>[row.referenceEdition,row.amount,row.unit,row.ageMinYears]),[['1998',100,'mg/day',19],['2023',12,'mg/day',18]]);
 const warning=entries.find(row=>row.kind==='health_product_warning')!;assert.equal(warning.amount,10);assert.equal(warning.sourcePublishedOn,'2026-06');assert.equal(warning.sourceDatePrecision,'month');
 const proposal=entries.find(row=>row.kind==='regulatory_proposal')!;assert.equal(proposal.kind,'regulatory_proposal');if(proposal.kind==='regulatory_proposal'){assert.equal(proposal.unit,'mg/serving');assert.equal(proposal.cautionAbove,2);assert.equal(proposal.status,'proposal');assert.equal(proposal.effectiveFrom,null);}
 for(const patch of [{kind:'reference_ul'},{unit:'mg/day'},{status:'in-force'},{effectiveFrom:'2026-10-22'}])assert.equal(vitaminB6ReferenceEntrySchema.safeParse({...proposal,...patch}).success,false);
 for(const patch of [{sourcePublishedOn:'2026-06-01'},{sourceUrl:'javascript:alert(1)'},{sourceUrl:'ftp://www.canada.ca/source'},{sourceUrl:'not a URL'}])assert.equal(vitaminB6ReferenceEntrySchema.safeParse({...warning,...patch}).success,false);
 assert.ok(entries.every(row=>Object.isFrozen(row)));assert.equal(vitaminB6ReferenceContext.sourceOriginalBytesAcquired,false);
});
test('10–15,50,100mg source declarations get context without dose conversion, daily exposure, safe status or toxicity classification',()=>{
 for(const amount of [0,10,12,15,50,100]){const product={perServing:{},otherNutrients:[{name:'Vitamin B6',amount,unit:'mg'}]},before=structuredClone(product);assert.equal(hasVitaminB6Declaration(product),true);assert.deepEqual(product,before);assert.equal('safe'in product,false);assert.equal('dailyDose'in product,false);}
 for(const name of ['Vitamin B-6','Vitamin B6 (as pyridoxine hydrochloride)','pyridoxine hydrochloride','pyridoxal 5-phosphate','pyridoxal 5′-phosphate','pyridoxine 5-phosphate','pyridoxamine 5-phosphate','pyridoxine HCl'])assert.equal(hasVitaminB6Declaration({perServing:{},labelDeclarations:[{name,amount:100,unit:'unknown',operator:'~'}]}),true,'Presence does not establish chemical-equivalent mass or daily intake');
 for(const name of ['Bromelain','Not Vitamin B6','pyridoxine-binding protein','B6-free product'])assert.equal(hasVitaminB6Declaration({perServing:{},otherNutrients:[{name,amount:10,unit:'mg'}]}),false);
 assert.equal(hasVitaminB6Declaration(null),false);assert.equal(hasVitaminB6Declaration({perServing:{protein_g:1}}),false);
 assert.equal('adequacyAssessment'in vitaminB6ReferenceContext,false);assert.equal('treatmentTarget'in vitaminB6ReferenceContext,false);
});
