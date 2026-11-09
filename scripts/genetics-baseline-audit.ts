import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import reference from "../shared/data/genotype-reference.json";
import catalogue from "../shared/data/genotype-explanations.json";
import { genotypeAnnotations, explainGenotypes, genotypeReferenceCompatibility } from "../shared/genotype-explanations";

// Static catalogue audit only. Never accepts a user's genetic file or calls.
const mode = process.argv[2];
if (!["--write", "--check"].includes(mode)) throw Error("Use --write or --check");
assert.equal(genotypeAnnotations.length, 29);
assert.equal(new Set(genotypeAnnotations.map(v => v.rsid)).size, 29);
const rows = genotypeAnnotations.map(annotation => {
  const ref = reference.variants.find(r => r.rsid === annotation.rsid);
  assert.ok(ref);
  assert.equal(ref.mappings.length, 1);
  const mapping = ref.mappings[0];
  assert.equal(mapping.strand, 1);
  const calls = Object.keys(annotation.comparisons).sort();
  assert.equal(calls.length, 3);
  for (const call of calls) {
    assert.equal(genotypeReferenceCompatibility(annotation.rsid, call), "compatible");
    const result = explainGenotypes([{ rsid: annotation.rsid, genotype: call }], true)[0];
    assert.equal(result.status, "matched");
    assert.equal(result.resultAdvice, annotation.resultAdvice[call]);
  }
  return {
    rsid: annotation.rsid, gene: annotation.gene, variantClass: "SNV",
    assembly: reference.assembly, chromosome: mapping.chromosome,
    position: mapping.position, strand: "genomic-forward",
    referenceAlleles: mapping.alleles.split("/"), studiedPair: annotation.alleles,
    effectAllele: null,
    effectAlleleLimitation: "No single universal effect allele inferred from the study pair; per-genotype comparison text is retained.",
    commonCalls: calls.map(genotype => ({ genotype, status: "matched" })),
    evidence: annotation.evidence, sources: annotation.sources,
    referenceSource: ref.sourceUrl,
    sourceRecordedReviewDate: catalogue.reviewedAt,
    independentCurrentReview: "not established by this software audit",
    sensitivity: ["rs429358", "rs7412"].includes(annotation.rsid) ? "APOE-sensitive; no isoform inferred" : "genetic data",
  };
});
const sourceHashes = Object.fromEntries(await Promise.all([
  "shared/data/genotype-explanations.json", "shared/data/genotype-reference.json",
].map(async path => [path, createHash("sha256").update(await readFile(new URL(`../${path}`, import.meta.url))).digest("hex")])));
const audit = {
  version: "genetics-baseline-audit-2026-11-05.1", sourceHashes,
  explanationVersion: catalogue.version, referenceRetrievedAt: reference.retrievedAt,
  counts: { uniqueEntries: rows.length, commonCallsTested: rows.reduce((n, r) => n + r.commonCalls.length, 0), falseCommonPairWarningsReproduced: 0 },
  limitation: "Static source consistency and software behavior only; not independent scientific validation, assay verification, clinical clearance or a personal genotype report.",
  outsidePairCase: {
    rsid: "rs7903146", genotype: "GT", referenceCompatibility: genotypeReferenceCompatibility("rs7903146", "GT"),
    status: explainGenotypes([{ rsid: "rs7903146", genotype: "GT" }], true)[0].status,
    conclusion: "Reference-supported letters outside the curated C/T study contrast; no forced interpretation or allele flip.",
  }, rows,
};
const text = JSON.stringify(audit, null, 2) + "\n";
const target = new URL("../docs/verification/GENETICS_BASELINE_AUDIT_20261105.json", import.meta.url);
if (mode === "--write") await writeFile(target, text);
else assert.equal(await readFile(target, "utf8"), text, "Regenerate the audited ledger after reviewing source changes");
console.log(`Static genetics audit: ${rows.length} unique entries; 87 common calls matched; no common-pair mismatch reproduced. Scientific review remains separate.`);
