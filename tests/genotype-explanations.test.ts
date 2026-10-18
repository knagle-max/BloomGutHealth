import test from "node:test";
import assert from "node:assert/strict";
import {
  genotypeAnnotations,
  explainGenotypes,
} from "../shared/genotype-explanations";
import reference from "../shared/data/genotype-reference.json";
import { additionalEntryShortcuts } from "../shared/manual-genetics";
import {
  variantCatalog,
  buildPrecisionReport,
  contextSchema,
  manualGeneticImportSchema,
  parse23andMe,
} from "../shared/precision-nutrition";
import { defaultPreferences } from "../shared/meal-intelligence";
const one = (rsid: string, genotype: string, forward = true) =>
  explainGenotypes([{ rsid, genotype }], forward)[0];
test("all entry shortcuts have sourced educational comparisons consistent with forward references without expanding diet ranking", () => {
  assert.equal(genotypeAnnotations.length, 29);
  assert.equal(variantCatalog.length, 7);
  assert.equal(new Set(genotypeAnnotations.map((a) => a.rsid)).size, 29);
  for (const rsid of [
    ...variantCatalog.map((v) => v.rsid),
    ...additionalEntryShortcuts.map((v) => v[1]),
  ])
    assert.ok(
      genotypeAnnotations.some((v) => v.rsid === rsid),
      rsid,
    );
  for (const a of genotypeAnnotations) {
    const ref = reference.variants.find((r) => r.rsid === a.rsid)!;
    assert.ok(ref);
    assert.equal(ref.mappings[0].strand, 1);
    assert.ok(
      a.alleles
        .split("")
        .every((v) => ref.mappings[0].alleles.split("/").includes(v)),
    );
    const [x, y] = a.alleles;
    assert.deepEqual(
      Object.keys(a.comparisons).sort(),
      [x + x, x + y, y + y].sort(),
    );
    assert.ok(a.sources.every((s) => new URL(s.url).protocol === "https:"));
    for (const call of Object.keys(a.comparisons)) {
      const e = one(a.rsid, call);
      assert.equal(e.status, "matched");
      assert.equal(e.comparisons.filter((c) => c.isYours).length, 1);
      assert.equal(e.personalMeaning, a.comparisons[call]);
    }
  }
});
test("unknown orientation, no-calls, alleles outside the studied pair and unknown loci cannot acquire a matching interpretation", () => {
  for (const e of [
    one("rs1801133", "AA", false),
    one("rs1801133", "--"),
    one("rs7903146", "GT"),
  ]) {
    assert.ok(e.status !== "matched");
    assert.equal(
      e.comparisons.some((c) => c.isYours),
      false,
    );
  }
  assert.equal(one("rs7903146", "GT").status, "outside-studied-pair");
  const unknown = explainGenotypes(
    [{ rsid: "rs999999", gene: "MTHFR", genotype: "AA" }],
    true,
  )[0];
  assert.equal(unknown.status, "not-curated");
  assert.equal(unknown.comparisons.length, 0);
  assert.equal(unknown.gene, "Gene identity not curated");
  const alias = explainGenotypes(
    [{ rsid: "rs174550", gene: "MTHFR", genotype: "CT" }],
    true,
  )[0];
  assert.equal(alias.gene, "FADS1 region");
});
test("comparisons preserve strand mappings, dominance and uncertainty rather than creating universal good/bad or intermediate effects", () => {
  assert.match(one("rs1801133", "AA").variantMeaning!, /A corresponds to 677T/);
  assert.match(one("rs4988235", "AG").personalMeaning, /generally sufficient/);
  assert.match(one("rs601338", "AG").personalMeaning, /preserves secretor/);
  assert.match(one("rs5082", "AG").personalMeaning, /grouped with TT/);
  assert.match(one("rs5082", "GG").personalMeaning, /Gene-oriented CC/);
  assert.match(one("rs174550", "CT").personalMeaning, /not established/);
  assert.match(
    one("rs234706", "AG").personalMeaning,
    /not evidence of an overactive/,
  );
  assert.match(one("rs1800562", "AA").personalMeaning, /clinical confirmation/);
});
test("both manual and raw uploads receive explanations, and educational annotations do not promote additional diet findings or APOE typing", () => {
  const payload = manualGeneticImportSchema.parse({
    consent: true,
    provider: "manual",
    source: "Test fixture",
    strand: "forward",
    collectedAt: "2026-10-01T00:00:00Z",
    entries: [
      { rsid: "rs1801133", gene: "MTHFR", genotype: "AA" },
      { rsid: "rs601338", gene: "FUT2", genotype: "AG" },
      { rsid: "rs429358", gene: "APOE", genotype: "CT" },
      { rsid: "rs7412", gene: "APOE", genotype: "CT" },
    ],
  });
  const r = buildPrecisionReport(
    [
      {
        id: "g1",
        kind: "genetics",
        payload,
        createdAt: "2026-10-01T00:00:00Z",
      },
    ],
    contextSchema.parse({}),
    defaultPreferences,
    null,
  );
  assert.equal(r.genetics.explanations.length, 4);
  assert.equal(r.genetics.findings.filter((f) => f.genotype).length, 1);
  for (const e of r.genetics.explanations.filter((e) => e.gene === "APOE")) {
    assert.match(e.limitations!, /No APOE haplotype/);
    assert.ok(!("haplotype" in e));
  }
  const raw = parse23andMe(
    "# 23andMe\n# build 37\nrs1801133 1 11856378 AG",
    "2026-10-01T00:00:00Z",
  );
  const rawReport = buildPrecisionReport(
    [
      {
        id: "g2",
        kind: "genetics",
        payload: raw,
        createdAt: "2026-10-01T00:00:00Z",
      },
    ],
    contextSchema.parse({}),
    defaultPreferences,
    null,
  );
  assert.equal(rawReport.genetics.explanations[0].status, "matched");
  assert.equal(rawReport.genetics.explanations[0].genotype, "AG");
});

test("raw import retains only explanation-catalogue markers and cannot promote rare alleles outside the diet-reviewed pair", () => {
  const raw = parse23andMe(
    "# 23andMe\n# build 37\nrs601338 19 49206674 AG\nrs7903146 10 114758349 GT\nrs99999 3 100 AA",
    "2026-10-01T00:00:00Z",
  );
  assert.equal(raw.calls.length, 2);
  assert.ok(!raw.calls.some((c) => c.rsid === "rs99999"));
  const r = buildPrecisionReport(
    [
      {
        id: "raw-extra",
        kind: "genetics",
        payload: raw,
        createdAt: "2026-10-01T00:00:00Z",
      },
    ],
    contextSchema.parse({}),
    defaultPreferences,
    null,
  );
  assert.equal(r.genetics.explanations.length, 2);
  assert.equal(
    r.genetics.explanations.find((e) => e.rsid === "rs7903146")?.status,
    "outside-studied-pair",
  );
  assert.equal(
    r.genetics.findings.find((f) => f.rsid === "rs7903146")?.genotype,
    null,
  );
  assert.throws(() =>
    parse23andMe(
      "# 23andMe\n# build 37\nrs601338 19 49206675 AG",
      "2026-10-01T00:00:00Z",
    ),
  );
});
