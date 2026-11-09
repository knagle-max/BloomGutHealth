import test from'node:test';import assert from'node:assert/strict';import{inventoryBiologyFixture}from'../scripts/lib/biology-content-audit';
import{readFileSync}from'node:fs';import{organismBiography,organismBiographies}from'../shared/biology-content';

test('public fixture discovery preserves source spelling and explicit rank and does not turn food names into taxa',()=>{
 const input=`const food={name:'Pepperoni pizza'};const sample={organisms:[{name:' Exact source label ',taxonomyLevel:null},'Another source label']};const row={bacterialName:'Anaerobutyricum hallii',taxonomyLevel:'family'};const raw={reportedAnalyte:'RBC folate'};`;
 const result=inventoryBiologyFixture('tests/fixture.ts',input);
 assert.equal(result.mentions.some(x=>x.spelling==='Pepperoni pizza'),false);
 assert.ok(result.mentions.some(x=>x.spelling===' Exact source label '));
 assert.ok(result.mentions.some(x=>x.spelling==='Another source label'));
 assert.ok(result.mentions.some(x=>x.spelling==='Anaerobutyricum hallii'&&x.rank==='family'));
 assert.ok(result.mentions.some(x=>x.kind==='source-only-analyte'&&x.spelling==='RBC folate'));
 assert.equal(input.includes('taxonomyLevel:null'),true);
});
test('dynamic source names remain explicit gaps and pathway prose is inventoried separately',()=>{
 const result=inventoryBiologyFixture('shared/science-coach.ts',`const p={organisms:['Some community-specific organisms']};const row={bacterialName:incoming.name};`);
 assert.equal(result.mentions.length,0);assert.equal(result.unexpanded.length,1);
 const pool=inventoryBiologyFixture('scripts/qa/example.mjs',`(a?['First source name']:['Second source name']).map(bacterialName=>({bacterialName}));`);
 assert.deepEqual(pool.mentions.map(x=>x.spelling),['First source name','Second source name']);
});
test('developer audit separates the supplied 94 cohort, synthetic labels, unsupported assays and source-aligned lab review',()=>{
 const audit=JSON.parse(readFileSync('docs/verification/biology-content-coverage.json','utf8'));
 assert.deepEqual(audit.originalCohort,{total:94,reviewedDraft:16,limited:61,unresolvedIdentity:17,independentlyApproved:0});
 assert.equal(audit.counts.supportedMarkers,14);assert.equal(audit.counts.registryTaxa,organismBiographies.length);
 assert.equal(audit.entries.filter((x:any)=>x.kind==='supported-marker'&&x.coverageStatus==='reviewed').length,14);
 const fake=audit.entries.filter((x:any)=>x.kind==='taxon'&&/^Syntheticus (bacterium|phage|eukaryote) FIX-/.test(x.sourceSpellings[0]));assert.equal(fake.length,94);assert.ok(fake.every((x:any)=>x.profileRegistryId===null&&x.coverageStatus==='unresolved identity'));
 assert.equal(new Set(audit.entries.map((x:any)=>x.uniqueId)).size,audit.entries.length);
 assert.equal(audit.qualityLint.recognizedPrimaryPlaceholders.length,0);assert.equal(audit.qualityLint.manualScientificReview,'NOT_RUN');
 for(const entry of audit.entries.filter((x:any)=>x.kind==='source-only-analyte'))assert.equal(entry.profileRegistryId,null);
 assert.equal(audit.scientificApproval,'DRAFT_NOT_INDEPENDENTLY_APPROVED');
});
test('all 20 existing organism UI fixtures have canonical bounded context, without transferring a genus or strain study',()=>{
 const source=readFileSync('scripts/qa/microbial-profile-journey.mjs','utf8');
 const names=[...new Set(inventoryBiologyFixture('scripts/qa/microbial-profile-journey.mjs',source).mentions.filter(x=>x.method==='named public organism fixture pool').map(x=>x.spelling))];assert.equal(names.length,20);
 for(const name of names){const profile=organismBiography(name);assert.ok(profile,name);assert.ok(profile.citations.length,name);assert.ok(profile.firstLayer.meetThisOrganism&&profile.firstLayer.whyResearchersStudyIt&&profile.firstLayer.foodMetabolicConnections,name);const words=Object.values(profile.firstLayer).join(' ').split(/\s+/).length;assert.ok(words>=90&&words<=160,`${name}: ${words} words`);}
 assert.notEqual(organismBiography('Anaerobutyricum soehngenii')?.id,organismBiography('Anaerobutyricum hallii')?.id);
 assert.equal(organismBiography('Roseburia','species'),undefined);
 assert.equal(organismBiography('Ruminococcus bromii strain invented'),undefined);
});

test('specialist-flagged taxon cards cite their own strain/species context and retain draft status',()=>{
 const active=JSON.parse(readFileSync('shared/data/biology-content-r4m1-v2.json','utf8'));
 const cases=[['Parabacteroides distasonis ATCC 8503','17579514'],['Odoribacter splanchnicus DSM 20712','21677857'],['Bacteroides fragilis 638R','20829291'],['Bacteroides fragilis YCH46','15466707'],['Veillonella parvula','21304678']];
 for(const[name,pmid]of cases){const profile=organismBiography(name)!;assert.ok(profile.citations.some(c=>c.pmid===pmid),name);assert.ok(!profile.citations.some(c=>c.url.includes('39647502')||c.url.includes('31235964')),name);assert.ok(active.reportedFixtureOrganisms.find((x:any)=>x.reportedName===name).editorialRevisionNotes);assert.notEqual(profile.coverageStatus,'reviewed');}
 assert.equal(organismBiography('Veillonella parvula')!.functionalResearch,undefined);
});
