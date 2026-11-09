import test from 'node:test';
import assert from 'node:assert/strict';
import {recordedGeneticsCatalogue,geneticsCatalogue} from '../shared/genetics-catalogue';
import {explainGenotypes} from '../shared/genotype-explanations';
import {captureGeneticCall} from '../shared/genetic-call-source';
import {classifyManualGenetics,manualGeneticImportSchema,buildPrecisionReport,contextSchema} from '../shared/precision-nutrition';
import {defaultPreferences} from '../shared/meal-intelligence';
const entries=[{rsid:'rs1801133',gene:'MTHFR',...captureGeneticCall('a/g')},{rsid:'rs4680',gene:'COMT',...captureGeneticCall('AG')},{rsid:'rs999999999',gene:'Submitted only',...captureGeneticCall('TT')},{rsid:'rs123456789',...captureGeneticCall('--')}];
test('recorded filtering follows actual saved rsIDs including unknown and no-call; catalogue/topic/education membership never creates a call',()=>{
 const source=explainGenotypes(entries,true),view=recordedGeneticsCatalogue([...source,source[0]]);
 assert.equal(view.length,4);assert.equal(view[0].calls.length,1);assert.equal(view[0].calls[0].sourceCall?.original,'a/g');assert.equal(view.find(v=>v.rsid==='rs123456789')?.hasReadableCall,false);assert.equal(source[3].status,'no-call');assert.equal(view.find(v=>v.rsid==='rs999999999')?.candidate,null);assert.ok(view.every(v=>v.candidate?.identity.kind!=='gene'));assert.ok(geneticsCatalogue.some(c=>c.identity.kind==='gene'));
 assert.equal(recordedGeneticsCatalogue(source,'a/g').length,1);assert.equal(recordedGeneticsCatalogue(source,'submitted only').length,1);assert.equal(recordedGeneticsCatalogue(source,'','one-carbon').length,2);assert.equal(recordedGeneticsCatalogue(source,'rs999999999','gut').length,0);assert.equal(recordedGeneticsCatalogue([]).length,0);
 const conflict=recordedGeneticsCatalogue([...source,...explainGenotypes([{rsid:'rs1801133',genotype:'GG'}],false)]);assert.equal(conflict[0].conflicting,true);assert.equal(conflict[0].calls.length,2);assert.equal(conflict[0].calls[1].genotype,'GG');
});
test('source selection, deletion and empty-owner projection withdraw recorded variants; sourced education remains separate from diet rules',()=>{
 const manual=manualGeneticImportSchema.parse({provider:'manual',consent:true,source:'Synthetic source',strand:'unknown',collectedAt:'2026-11-01T00:00:00Z',entries});const records=[{id:'source-a',kind:'genetics',createdAt:'2026-11-01T00:00:00Z',payload:manual},{id:'source-b',kind:'genetics',createdAt:'2026-11-02T00:00:00Z',payload:{...manual,entries:[entries[2]]}}];
 const report=(id:string|null,rows=records)=>buildPrecisionReport(rows,contextSchema.parse({geneticsSelection:{sourceId:id,revision:'00000000-0000-4000-8000-000000000000'}}),defaultPreferences,null);
 assert.equal(recordedGeneticsCatalogue(report('source-a').genetics.explanations).length,4);assert.equal(recordedGeneticsCatalogue(report('source-b').genetics.explanations).length,1);assert.equal(recordedGeneticsCatalogue(report('source-a',records.slice(1)).genetics.explanations).length,0);assert.equal(recordedGeneticsCatalogue(report(null).genetics.explanations).length,0);assert.equal(recordedGeneticsCatalogue(report('source-a',[]).genetics.explanations).length,0);
 const classified=classifyManualGenetics({...manual,entries:[{rsid:'rs174550',genotype:'CT'}]});assert.equal(classified[0].reviewed,false);assert.ok(classified[0].education?.sources.length);assert.ok(classified[0].education?.geneRole);assert.ok(classified[0].education?.variantMeaning);assert.doesNotMatch(classified[0].reason!,/Recorded only/);assert.equal(classifyManualGenetics(manual).find(e=>e.rsid==='rs999999999')?.education,null);
});
