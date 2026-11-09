import test from 'node:test';import assert from 'node:assert/strict';
import {parse23andMe,buildPrecisionReport,contextSchema} from '../shared/precision-nutrition';
import {defaultPreferences} from '../shared/meal-intelligence';
import {defaultGeneticSelection,selectedGeneticImport} from '../shared/genetic-selection';
const text='# 23andMe\n# build 37\nrs1801133 1 11856378 AG\nrs4988235 2 136608646 GG\nrs429358 19 45411941 CT\nrs7412 19 45412079 CC\nrs99999 3 100 TT';
test('whole-file selection excludes APOE by default and retains only chosen original calls and source metadata',()=>{
 const preview=parse23andMe(text,'2026-10-02T12:30:00Z'),original=structuredClone(preview);
 assert.deepEqual(defaultGeneticSelection(preview),['rs1801133','rs4988235']);
 const chosen=selectedGeneticImport(preview,['rs4988235']);assert.deepEqual(chosen.calls,[preview.calls[1]]);assert.equal(chosen.scannedVariants,5);assert.equal(chosen.collectedAt,preview.collectedAt);assert.equal(chosen.build,'GRCh37');assert.deepEqual(preview,original);
 const report=buildPrecisionReport([{id:'old',kind:'genetics',createdAt:'2026-10-01T00:00:00Z',payload:preview},{id:'new',kind:'genetics',createdAt:'2026-10-02T00:00:00Z',payload:chosen}],contextSchema.parse({}),defaultPreferences,null);assert.equal(report.genetics.explanations.some(call=>call.rsid==='rs429358'||call.rsid==='rs7412'),false);assert.equal(report.genetics.findings.find(call=>call.rsid==='rs1801133')?.genotype,null);
 const explicit=selectedGeneticImport(preview,['rs429358']);assert.deepEqual(explicit.calls,[preview.calls[2]]);assert.equal('interpretation' in explicit,false);
});
test('empty, duplicated and non-source selections cannot produce a save payload',()=>{
 const preview=parse23andMe(text,'2026-10-02T12:30:00Z');for(const ids of[[],['rs99999'],['rs1801133','rs1801133']])assert.throws(()=>selectedGeneticImport(preview,ids));
});
