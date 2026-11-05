import test from "node:test";
import assert from "node:assert/strict";
import { GENETIC_CALL_NORMALIZATION, geneticCallSourceSchema } from "../shared/genetic-call-source";
import { manualGeneticEntrySchema, geneticImportSchema, parse23andMe, buildPrecisionReport, contextSchema } from "../shared/precision-nutrition";
import { defaultPreferences } from "../shared/meal-intelligence";

test("reader accepts only bounded matching original call tokens and a known normalization version", () => {
  for (const original of ["ga", "g/a", "g | a", "GA", "--"]) {
    const genotype = original === "--" ? "--" : "AG";
    const sourceCall = { original, normalization: GENETIC_CALL_NORMALIZATION };
    const value = manualGeneticEntrySchema.parse({ rsid: "rs1801133", genotype, sourceCall });
    assert.deepEqual(value.sourceCall, sourceCall);
    assert.equal(value.genotype, genotype);
  }
  for (const sourceCall of [
    { original: "AA", normalization: GENETIC_CALL_NORMALIZATION },
    { original: "g/a", normalization: "reverse-complement" },
    { original: "g/a", normalization: GENETIC_CALL_NORMALIZATION, filename: "not-allowed" },
    { original: "patient name AG", normalization: GENETIC_CALL_NORMALIZATION },
    { original: "AG\n", normalization: GENETIC_CALL_NORMALIZATION },
    { original: "a".repeat(1000), normalization: GENETIC_CALL_NORMALIZATION },
  ]) assert.equal(manualGeneticEntrySchema.safeParse({ rsid: "rs1801133", genotype: "AG", sourceCall }).success, false);
  assert.equal(geneticCallSourceSchema.safeParse({ original: "AG\nprivate", normalization: GENETIC_CALL_NORMALIZATION }).success, false);
});
test("legacy records remain readable without inventing original spelling, and metadata cannot alter interpretation", () => {
  const legacy = { rsid: "rs1801133", gene: "MTHFR", genotype: "AG" };
  assert.equal("sourceCall" in manualGeneticEntrySchema.parse(legacy), false);
  const sourceCall = { original: "g/a", normalization: GENETIC_CALL_NORMALIZATION };
  const project = (entries: unknown[]) => buildPrecisionReport([{ id: "synthetic", kind: "genetics", createdAt: "2026-10-01T00:00:00Z", payload: { consent: true, provider: "manual", source: "Synthetic original token", strand: "unknown", collectedAt: "2026-10-01T00:00:00Z", entries } }], contextSchema.parse({}), defaultPreferences, null).genetics;
  const before = project([legacy]), after = project([{ ...legacy, sourceCall }]);
  assert.equal(before.explanations[0].sourceCall, null);
  assert.deepEqual(after.explanations[0].sourceCall, sourceCall);
  assert.equal(after.explanations[0].status, "orientation-unconfirmed");
  assert.equal(after.explanations[0].resultAdvice, null);
  assert.deepEqual(after.findings, before.findings);
  assert.deepEqual(after.manual?.entries[0].sourceCall, sourceCall);
});
test("raw reader preserves optional source metadata without accepting coordinate, allele or transformation conflicts", () => {
  const legacy = parse23andMe("# 23andMe\n# build 37\nrs1801133 1 11856378 AG", "2026-10-01T00:00:00Z");
  assert.equal("sourceCall" in legacy.calls[0], false, "reader-first release does not yet produce metadata");
  const next = { ...legacy, calls: [{ ...legacy.calls[0], sourceCall: { original: "ga", normalization: GENETIC_CALL_NORMALIZATION } }] };
  assert.deepEqual(geneticImportSchema.parse(next), next);
  for (const call of [
    { ...next.calls[0], position: 11856379 },
    { ...next.calls[0], sourceCall: { original: "TT", normalization: GENETIC_CALL_NORMALIZATION } },
    { ...next.calls[0], genotype: "TT", sourceCall: { original: "TT", normalization: GENETIC_CALL_NORMALIZATION } },
  ]) assert.equal(geneticImportSchema.safeParse({ ...next, calls: [call] }).success, false);
});
