import test from "node:test";
import assert from "node:assert/strict";
import { geneticsCatalogue, geneticsCatalogueCounts, geneticsDomains, searchGeneticsCatalogue, type CandidateIdentity } from "../shared/genetics-catalogue";
import { genotypeAnnotations, explainGenotypes } from "../shared/genotype-explanations";
import { parse23andMe } from "../shared/precision-nutrition";

test("one versioned catalogue includes each existing entry exactly once with reference identity and all 17 domains", () => {
  assert.equal(geneticsDomains.length, 17);
  assert.equal(new Set(geneticsDomains.map(d => d.id)).size, 17);
  assert.equal(new Set(geneticsCatalogue.map(c => c.id)).size, geneticsCatalogue.length);
  const existing = geneticsCatalogue.filter(c => c.content.status === "existing-education");
  assert.equal(existing.length, 29);
  assert.deepEqual(existing.flatMap(c => "rsid" in c.identity ? [c.identity.rsid] : []).sort(), genotypeAnnotations.map(a => a.rsid).sort());
  const rsids = geneticsCatalogue.flatMap(c => "rsid" in c.identity ? [c.identity.rsid] : []);
  assert.equal(new Set(rsids).size, rsids.length);
  for (const c of geneticsCatalogue) {
    assert.ok(c.domains.length);
    assert.ok(c.domains.every(id => geneticsDomains.some(d => d.id === id)));
    if (c.content.status === "existing-education") {
      assert.equal(c.identity.kind, "snv");
      assert.ok(c.identity.kind === "snv" && c.identity.placement?.strand === "forward");
    }
  }
});
test("named candidates retain complex types and pending review, while gene-only mentions never become invented SNPs", () => {
  for (const [query, kind] of [["rs4680", "snv"], ["rs72613567", "insertion"], ["NAT2", "haplotype"], ["ACE I/D", "deletion"], ["GSTM1", "copy-number"], ["GSTT1", "copy-number"], ["UGT1A1", "repeat"], ["HLA-DQ", "hla-typing"], ["KIV-2", "structural-repeat"]]) {
    const found = searchGeneticsCatalogue(query);
    assert.equal(found.length, 1, query);
    assert.equal(found[0].identity.kind, kind);
    assert.equal(found[0].content.status, "review-pending");
  }
  for (const gene of ["MBOAT7", "MTARC1", "GPAM", "SORT1", "CETP", "APOA5", "SLC30A8", "PPARG", "KCNJ11", "FADS2", "ELOVL2", "GC", "DHCR7", "ACTN3", "AMPD1"]) {
    const found = geneticsCatalogue.find(c => c.gene === gene)!;
    assert.deepEqual(found.identity, { kind: "gene" });
    assert.equal(found.content.status, "review-pending");
  }
  // Contract can represent phase/CNV-aware star alleles without inventing a
  // named gene/allele candidate or enabling an importer for it.
  const identity: CandidateIdentity = { kind: "star-allele", designation: "synthetic assay-only contract fixture" };
  assert.equal(identity.kind, "star-allele");
});
test("counts distinguish unique candidates, gene topics, saved calls, matching education and unmet review/coverage targets", () => {
  assert.deepEqual(geneticsCatalogueCounts([]), {
    candidates: 55, geneTopics: 15, existingExplanations: 29, pendingCandidates: 26,
    savedCalls: 0, matchedExplanations: 0, independentlyReviewedNewCandidates: 0,
    newPersonalActionRules: 0, targetMinimum: 150, targetMaximum: 250, shortfall: 95,
  });
  const source = explainGenotypes([{ rsid: "rs7903146", genotype: "GT" }, { rsid: "rs1801133", genotype: "AA" }, { rsid: "rs429358", genotype: "--" }], true);
  assert.equal(geneticsCatalogueCounts([...source, source[0]]).savedCalls, 3);
  assert.equal(geneticsCatalogueCounts(source).matchedExplanations, 1);
  assert.equal(geneticsCatalogueCounts([]).matchedExplanations, 0, "source withdrawal cannot retain a personal projection");
});
test("domain/gene/rsID search uses the same identities and sourced pending candidates without manufacturing measured results", () => {
  assert.equal(searchGeneticsCatalogue("", "bone")[0].gene,"COL1A1");
  assert.equal(searchGeneticsCatalogue("", "aging")[0].gene,"FOXO3");
  assert.ok([...searchGeneticsCatalogue("","bone"),...searchGeneticsCatalogue("","aging")].every(c=>c.content.status==="review-pending"));
  assert.equal(searchGeneticsCatalogue("  rs4680  ").length, 1);
  const shared = searchGeneticsCatalogue("rs58542926", "liver")[0];
  assert.equal(searchGeneticsCatalogue("rs58542926", "lipids")[0], shared);
  assert.equal(searchGeneticsCatalogue("NAT2", "pgx")[0].identity.kind, "haplotype");
  assert.deepEqual(searchGeneticsCatalogue("does-not-exist"), []);
});
test("candidate registration cannot expand raw retained SNPs, infer complex calls or produce sensitive interpretations", () => {
  const imported = parse23andMe("# 23andMe\n# build 37\nrs4680 22 19951271 AG\nrs72613567 4 88219913 --\nrs1801133 1 11856378 AG", "2026-10-01T00:00:00Z");
  assert.deepEqual(imported.calls.map(c => c.rsid), ["rs1801133"]);
  const apoe = geneticsCatalogue.filter(c => c.gene === "APOE");
  assert.equal(apoe.length, 2);
  assert.ok(apoe.every(c => c.sensitivity === "sensitive" && c.identity.kind === "snv"));
  assert.equal(geneticsCatalogueCounts([]).newPersonalActionRules, 0);
});

test("dated human bibliography registers17deduplicated pending identities without curated placement, clinical review or importer expansion",()=>{
 const added=geneticsCatalogue.filter(c=>c.requirementSource==="bibliographic-source-2026-11-05");assert.equal(added.length,17);
 for(const candidate of added){assert.equal(candidate.content.status,"review-pending");assert.ok(candidate.identity.kind==="snv"&&candidate.identity.placement===null);assert.ok(candidate.bibliography?.length);for(const source of candidate.bibliography!){assert.match(source.pmid,/^\d{6,9}$/);assert.equal(source.checkedOn,"2026-11-05");assert.equal(source.review,"pending");assert.ok(source.scope.length>0);}assert.match(candidate.assayRequirement,/does not retain/);}
 const ampd1=added.find(c=>c.gene==="AMPD1")!;assert.deepEqual(ampd1.bibliography!.map(s=>s.pmid),["24885427","32429460"]);assert.match(ampd1.bibliography![1].title,/Not Associated/);
 assert.match(added.find(c=>c.gene==="FOXO3")!.bibliography![0].scope,/null association/);
 // Synthetic unsupported coordinates, not source placements: registration cannot
 // make these IDs retained/assayed or reinterpret a source's genotype.
 const raw="# 23andMe\n# build 37\n"+added.map(c=>`${c.identity.kind==="snv"?c.identity.rsid:""} 1 1 AG`).join("\n");assert.throws(()=>parse23andMe(raw,"2026-10-01T00:00:00Z"));
 assert.deepEqual(parse23andMe(raw+"\nrs1801133 1 11856378 AG","2026-10-01T00:00:00Z").calls.map(c=>c.rsid),["rs1801133"]);
 assert.equal(geneticsCatalogueCounts([]).independentlyReviewedNewCandidates,0);assert.equal(geneticsCatalogueCounts([]).newPersonalActionRules,0);
});
