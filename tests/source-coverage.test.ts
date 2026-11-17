import test from 'node:test';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {foodSourceCoverage} from '../shared/source-coverage';
import {nutrientDefinitionDetails} from '../shared/nutrient-definitions';
import {snapshotFoods,loggingFoods,type SnapshotFood} from '../shared/food-snapshot';
const row=(patch:Partial<SnapshotFood>={}):SnapshotFood=>({id:'synthetic-public-source',name:'Synthetic source',tags:[],group:'fixture',fdcId:123,description:'Nonpatient fixture',dataType:'Synthetic test source',url:'https://fdc.nal.usda.gov/food-details/123/nutrients',retrievedAt:'2026-10-17',per100g:{1008:10,1003:0},...patch});
test('coverage separates actual source zero, positive, missing and invalid fields without producing intake or adequacy',()=>{
 const definitions=nutrientDefinitionDetails(),foods=[row(),row({per100g:{1008:-1,1003:NaN}})],before=structuredClone(foods);
 const result=foodSourceCoverage({fixture:foods},definitions),energy=result.fields.find(field=>field.key==='calories')!,protein=result.fields.find(field=>field.key==='protein_g')!;
 assert.deepEqual([energy.positive,energy.sourceReportedZero,energy.invalid,energy.missing],[1,0,1,0]);
 assert.deepEqual([protein.positive,protein.sourceReportedZero,protein.invalid,protein.missing],[0,1,1,0]);
 assert.equal(result.fields.find(field=>field.key==='iodine_ug')?.positive,undefined,'Unmapped nutrients are not fabricated');
 for(const field of result.fields)assert.equal(field.positive+field.sourceReportedZero+field.missing+field.invalid,field.sourceRows);
 assert.equal(result.cnfMappedFields,0);assert.equal('adequacy' in result,false);assert.deepEqual(foods,before);
});
test('duplicate public source identities do not become unique foods and invalid provenance cannot count as usable',()=>{
 const result=foodSourceCoverage({a:[row()],b:[row(),row({fdcId:0,retrievedAt:'2026-02-30',dataType:'',url:'https://example.invalid'})]},nutrientDefinitionDetails());
 assert.equal(result.sourceRows,3);assert.equal(result.uniqueVersionedSourceIdentities,1);
 assert.equal(result.sourceMetadataIssues.length,1);assert.equal(result.sourceMetadataIssues[0].issues.length,4);
 assert.equal(result.fields.find(field=>field.key==='calories')!.numericWithValidSourceMetadata,2);
});
test('actual adapters and definitions are inventoried with explicit local denominators, original units and no CNF/source approval invention',()=>{
 const result=foodSourceCoverage({planning:snapshotFoods,logging:loggingFoods},nutrientDefinitionDetails());
 assert.equal(result.sourceRows,snapshotFoods.length+loggingFoods.length);assert.equal(result.appSupportedNutrientFields,21);
 assert.deepEqual(result.sourceMetadataIssues,[]);assert.equal(result.cnfMappedFields,0);assert.equal(result.scope,'checked-in-public-food-adapters');
 assert.ok(result.fields.every(field=>field.numericWithValidSourceMetadata<=field.sourceRows&&field.usdaNutrientId>0));
 assert.deepEqual(foodSourceCoverage({},nutrientDefinitionDetails()).fields.map(field=>field.sourceRows),Array(21).fill(0));
});

test('real developer CLI verifies current adapter lookups with exact hashes and no private runtime inputs',()=>{
 const result=JSON.parse(execFileSync(process.execPath,['--import','tsx','scripts/source-coverage.ts','--verify'],{encoding:'utf8'}));
 assert.equal(result.adapterProbe.requestedRows,33);assert.equal(result.adapterProbe.exactSourceMatches,33);assert.deepEqual(result.adapterProbe.unmatchedSourceIndexes,[]);assert.deepEqual(result.adapterProbe.capturedFieldCounts,[21]);
 assert.match(result.repositoryHead,/^[a-f0-9]{40}$/);assert.equal(Object.keys(result.sourceHashes).length,10);assert.ok(Object.values(result.sourceHashes).every(value=>/^[a-f0-9]{64}$/.test(String(value))));
 assert.equal(result.fndds.sourceRows,5431);assert.equal(result.fndds.manifest.catalogueDigestMatches,true);assert.equal(result.fndds.manifest.foodCountMatches,true);assert.equal(result.fndds.manifest.sourceArchiveReverified,false);assert.equal(result.fndds.adapterProbe.requestedRows,4);assert.equal(result.fndds.adapterProbe.exactSourceMatches,4);assert.deepEqual(result.fndds.sourceMetadataIssues,[]);assert.deepEqual(result.fndds.adapterProbe.capturedFieldCounts,[21]);
 assert.equal('users' in result,false);assert.equal('credentials' in result,false);assert.equal('clinicalApproval' in result,false);
});
