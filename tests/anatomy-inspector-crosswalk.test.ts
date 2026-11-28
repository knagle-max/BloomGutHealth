import test from 'node:test';
import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{ANATOMY_INSPECTOR_REVISION,muscleInspectorCrosswalk,symptomInspectorCrosswalk}from'../client/src/lib/anatomy-inspector-crosswalk';
const all=[...muscleInspectorCrosswalk,...symptomInspectorCrosswalk];
test('all44 muscle paths and49 symptom paths retain unique source identity and versioned provenance',()=>{
 assert.equal(muscleInspectorCrosswalk.length,44);assert.equal(symptomInspectorCrosswalk.length,49);assert.equal(new Set(muscleInspectorCrosswalk.map(r=>r.svgRegionId)).size,44);assert.equal(new Set(symptomInspectorCrosswalk.map(r=>r.view+':'+r.visualKey)).size,49);
 for(const row of all){assert.equal(row.mappingRevision,ANATOMY_INSPECTOR_REVISION);if('allowWorkoutAttribution'in row){assert.equal(row.allowWorkoutAttribution,false);assert.match(row.reviewStatus,/source-checked/);assert.ok(row.anatomicalContext);assert.match(row.anatomyReference,/^https:\/\/openstax.org\//);}else assert.equal(row.canonicalId,null);assert.ok(row.evidence);assert.equal(createHash('sha256').update(readFileSync(row.sourcePath)).digest('hex'),row.sourceSha256);}
});
test('existing exercise candidates do not turn15 visual groups into15 accepted canonical identities',()=>{
 assert.equal(new Set(muscleInspectorCrosswalk.map(r=>r.visualKey)).size,15);
 for(const r of muscleInspectorCrosswalk){assert.equal(r.allowWorkoutAttribution,false);if(r.visualKey==='shoulders'||r.visualKey==='core'||r.visualKey==='hips'||r.visualKey==='forearms'||r.visualKey==='lower-legs'&&r.view==='front')assert.equal(r.canonicalId,null);assert.equal(r.laterality,null);if(r.visualKey==='hips'||r.visualKey==='lower-legs'&&r.view==='front')assert.deepEqual(r.candidateCanonicalIds,[]);if(r.visualKey==='shoulders')assert.equal(r.candidateCanonicalIds.length,3);}
});
test('original front side fields are attributed to source; posterior side stays explicitly unknown',()=>{
 for(const r of symptomInspectorCrosswalk){if(r.view==='back'){assert.equal(r.laterality,null);assert.doesNotMatch(r.displayLabel,/anatomical (left|right)/);assert.match(r.lateralityEvidence,/no typed side/);}else assert.ok(['left','right','midline'].includes(r.laterality!));assert.deepEqual(r.candidateCanonicalIds,[]);assert.equal(r.candidateTransferStatus,'ORIGINAL_V1_CROSSWALK_NOT_IN_CHECKOUT');}
});
test('the existing six V1 review conflicts stay flagged, without manufacturing the unavailable58 edges',()=>{
 assert.deepEqual(symptomInspectorCrosswalk.filter(r=>r.reviewStatus==='flagged-conflict').map(r=>r.view+':'+r.visualKey).sort(),['front:pelvis','back:upper_back_left','back:upper_back_right','back:lower_back_left','back:lower_back_right','back:sacrum'].sort());
});

test('supported label associations are completed without forcing mixed areas into one muscle identity',()=>{
 for(const r of muscleInspectorCrosswalk){if(['biceps','triceps','glutes','hamstrings'].includes(r.visualKey))assert.equal(r.canonicalId,r.visualKey);if(r.visualKey==='lower-legs')assert.equal(r.canonicalId,r.view==='back'?'calves':null);assert.equal(r.associationScope,'descriptive-label-only-not-geometry-or-exercise-attribution');}
});
