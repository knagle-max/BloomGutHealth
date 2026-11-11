import {markerDefinitions} from '../shared/precision-nutrition';
import assert from "node:assert/strict";
import test from "node:test";
import registry from "../shared/data/bloom_biology_content_coverage_r4m1_2026-11-08.json";
import {labBiography,organismBiography,biologyContentCoverage} from "../shared/biology-content";

test("all 14 supported authored lab profiles are available for display without review-state gating",()=>{
 assert.equal(biologyContentCoverage.labProfiles,markerDefinitions.length);
 for(const lab of registry.labMarkerDefinitions){
  const found=labBiography(lab.id);
  assert.ok(found,lab.id);
  for(const field of ["whatItDoes","whyLowHigh","whyItMatters","whatToDiscuss"] as const){
   assert.ok(found.firstLayer[field].length>20,`${lab.id} ${field}`);
  }
  assert.equal(found.reviewStatus,lab.reviewStatus);
  assert.ok(found.citations.length>0,`citation missing for ${lab.id}`);
 }
});
test("all 94 available fixture organism entries resolve to their exact draft or limited description",()=>{
 assert.equal(biologyContentCoverage.listedOrganisms,94);
 const names = new Set<string>();
 for(const organism of registry.reportedFixtureOrganisms){
  const name=organism.reportedName.trim().toLowerCase();
  assert.ok(!names.has(name),`duplicate: ${name}`);
  names.add(name);
  const found=organismBiography(organism.reportedName);
  assert.ok(found,organism.reportedName);
  assert.equal(found.reportedName,organism.reportedName);
  assert.equal(found.coverageStatus,organism.coverageStatus);
  assert.ok(found.firstLayer.meetThisOrganism.length>20);
  assert.ok(found.firstLayer.whyResearchersStudyIt.length>20);
  assert.ok(found.firstLayer.foodMetabolicConnections.length>20);
 }
});
test("unknown organism names do not acquire unrelated species content or invented review",()=>{
 assert.equal(organismBiography("Unrecognized example organism"),undefined);
 assert.notEqual(organismBiography("Anaerobutyricum soehngenii")?.id,organismBiography("Anaerobutyricum hallii")?.id);
 assert.ok(organismBiography("Anaerobutyricum hallii"));
 assert.equal(labBiography("source:unverified-analyte"),undefined);
 assert.equal(biologyContentCoverage.independentApproval,"DRAFT_NOT_INDEPENDENTLY_APPROVED");
});

test('canonical previews and profiles share content while explicit taxonomic rank wins over inventory guesses',async()=>{
 const{explainOrganism}=await import('../shared/report-explanations');
 for(const entry of registry.reportedFixtureOrganisms){
  const profile=organismBiography(entry.reportedName)!;const preview=explainOrganism(entry.reportedName);
  assert.equal(preview.meaning,profile.firstLayer.meetThisOrganism);assert.equal(preview.why,profile.firstLayer.whyResearchersStudyIt);assert.equal(preview.takeaway,profile.firstLayer.foodMetabolicConnections);
  assert.equal(profile.coverageStatus,entry.coverageStatus);assert.equal(profile.reviewStatus,entry.reviewStatus);
 }
 assert.equal(organismBiography('Eubacterium hallii','species')?.id,organismBiography('Anaerobutyricum hallii','species')?.id);
 for(const rank of ['genus','family','order','phylum'])assert.equal(organismBiography('Anaerobutyricum hallii',rank),undefined);
 assert.equal(organismBiography('Akkermansia muciniphila strain unverified'),undefined);
 assert.notEqual(organismBiography('Anaerobutyricum soehngenii')?.id,organismBiography('Anaerobutyricum hallii')?.id);
});

test('original supplied registry is immutable and draft approval is not upgraded by editorial revision',async()=>{
 const{readFileSync}=await import('node:fs');const{createHash}=await import('node:crypto');
 const original=readFileSync('shared/data/bloom_biology_content_coverage_r4m1_2026-11-08.json');
 assert.ok(original.equals(readFileSync('docs/biology/bloom_biology_content_coverage_r4m1_2026-11-08.json')));
 assert.equal(createHash('sha1').update(Buffer.from(`blob ${original.length}\0`)).update(original).digest('hex'),'8b21c7c330a076db9d90887a2cc725c5897cdb78');
 const active=JSON.parse(readFileSync('shared/data/biology-content-r4m1-v2.json','utf8'));
 assert.equal(active.scientificApproval,registry.scientificApproval);
 for(const entry of registry.labMarkerDefinitions){const current=active.labMarkerDefinitions.find((x:any)=>x.id===entry.id);assert.equal(current.reviewStatus,entry.reviewStatus);assert.equal(current.coverageStatus,entry.coverageStatus);}
});
