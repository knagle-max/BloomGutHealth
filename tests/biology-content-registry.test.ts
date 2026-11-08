import assert from "node:assert/strict";
import test from "node:test";
import registry from "../shared/data/bloom_biology_content_coverage_r4m1_2026-11-08.json";
import {labBiography,organismBiography,biologyContentCoverage} from "../shared/biology-content";

test("all 14 supported authored lab profiles are available for display without review-state gating",()=>{
 assert.equal(biologyContentCoverage.labProfiles,14);
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
 assert.equal(organismBiography("Anaerobutyricum soehngenii"),undefined);
 assert.ok(organismBiography("Anaerobutyricum hallii"));
 assert.equal(labBiography("source:unverified-analyte"),undefined);
 assert.equal(biologyContentCoverage.independentApproval,"DRAFT_NOT_INDEPENDENTLY_APPROVED");
});
