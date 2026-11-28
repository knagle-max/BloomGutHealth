import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {labEditorialProfiles,labEditorialFor,labEditorialSources} from '../shared/biology-labs';
import {sourceIntervalPosition} from '../shared/biology-lab-observation';
import {markerDefinitions} from '../shared/precision-nutrition';

test('all original and added supported analytes share meaningful, bounded editorial profiles and resolved evidence',()=>{
 assert.equal(labEditorialProfiles.length,markerDefinitions.length);
 assert.equal(new Set(labEditorialProfiles.map(profile=>profile.id)).size,markerDefinitions.length);
 for(const definition of markerDefinitions){
  const profile=labEditorialFor(definition.id)!;assert.ok(profile);
  assert.equal(definition.education.definition,profile.whatItDoes);assert.equal(definition.education.context,profile.whyItMatters);
  const text=[profile.whatItDoes,profile.higher,profile.lower,profile.whyItMatters,profile.whatToDiscuss].filter(Boolean).join(' '),words=text.split(/\s+/).length;
  assert.ok(words>=100&&words<=170,`${profile.id}: ${words} words`);
  assert.doesNotMatch(text,/Interpretation not yet reviewed|Research explanation not available yet|Reviewed research profile not yet available/);
  const sources=labEditorialSources(profile);assert.equal(sources.length,profile.citationIds.length);assert.ok(sources.length);assert.ok(sources.every(source=>source.design&&source.scopeLimit&&(source.verification==='citation-not-retrieved'?source.verifiedOn===null:!!source.verifiedOn)));
 }
 assert.equal(labEditorialFor('source:unknown'),undefined);
 assert.equal(labEditorialFor('rbc-folate'),undefined);
 assert.equal(labEditorialFor('vitamin_d')!.assayIdentityRequired,true);
 for(const id of ['ldl','apob','triglycerides','ggt','homocysteine'])assert.equal(labEditorialFor(id)!.lower,null);
 const ui=readFileSync('client/src/components/LabExplorer.tsx','utf8');assert.doesNotMatch(ui,/Interpretation not yet reviewed|Marker-specific reviewed influence evidence is not available/);
});
test('source interval comparison retains zero and abstains on absent units, invalid bounds or ambiguous inputs',()=>{
 const point={sourceValue:0,sourceUnit:'U/L',referenceLow:1,referenceHigh:5};const before=JSON.stringify(point);
 assert.equal(sourceIntervalPosition(point),'below');assert.equal(JSON.stringify(point),before);
 assert.equal(sourceIntervalPosition({...point,sourceValue:6}),'above');assert.equal(sourceIntervalPosition({...point,sourceValue:3}),'within');
 for(const invalid of [undefined,{...point,sourceValue:NaN},{...point,sourceUnit:''},{...point,referenceLow:6},{...point,referenceHigh:Infinity},{...point,referenceLow:null,referenceHigh:null}])assert.equal(sourceIntervalPosition(invalid),'unknown');
 assert.equal(sourceIntervalPosition({...point,referenceLow:null}),'unknown');
 assert.equal(sourceIntervalPosition({...point,sourceValue:6,referenceLow:null}),'above');
});
