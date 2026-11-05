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
    candidates: 38, geneTopics: 15, existingExplanations: 29, pendingCandidates: 9,
    savedCalls: 0, matchedExplanations: 0, independentlyReviewedNewCandidates: 0,
    newPersonalActionRules: 0, targetMinimum: 150, targetMaximum: 250, shortfall: 112,
  });
  const source = explainGenotypes([{ rsid: "rs7903146", genotype: "GT" }, { rsid: "rs1801133", genotype: "AA" }, { rsid: "rs429358", genotype: "--" }], true);
  assert.equal(geneticsCatalogueCounts([...source, source[0]]).savedCalls, 3);
  assert.equal(geneticsCatalogueCounts(source).matchedExplanations, 1);
  assert.equal(geneticsCatalogueCounts([]).matchedExplanations, 0, "source withdrawal cannot retain a personal projection");
});
test("domain/gene/rsID search uses the same identities without manufacturing results in empty domains", () => {
  assert.deepEqual(searchGeneticsCatalogue("", "bone"), []);
  assert.deepEqual(searchGeneticsCatalogue("", "aging"), []);
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
