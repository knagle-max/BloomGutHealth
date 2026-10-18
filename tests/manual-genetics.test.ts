import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { parseGenotypeTable } from "../shared/manual-genetics";
import {
  manualGeneticImportSchema,
  classifyManualGenetics,
  precisionEntrySchema,
  buildPrecisionReport,
  contextSchema,
  parse23andMe,
} from "../shared/precision-nutrition";
import { defaultPreferences } from "../shared/meal-intelligence";
import { registerPrecisionRoutes } from "../server/precision-routes";
const date = "2026-10-01T00:00:00Z";
const table = `Gene SNP Your genotype
MTHFR rs1801133 AA
MTHFR rs1801131 TT
MTRR rs1801394 AG
MTR rs1805087 AA
CBS rs234706 AG
FUT2 rs601338 AG
FADS1 region rs174550 CT
BCMO1 rs12934922 AA
CYP2R1 rs10741657 AA
CYP27B1 rs10877012 GT
HFE rs1800562 GG
HFE rs1799945 CC
TMPRSS6 rs855791 AG
TCF7L2 rs7903146 GT
MTNR1B rs10830963 CC
SLC23A1 rs33972313 CC
LCT/MCM6 rs4988235 AA
FTO rs9939609 AT
MC4R region rs17782313 TT
FGF21 region rs838133 AG
SOD2 rs4880 AG
APOE rs429358 TT
GLUT2/SLC2A2 rs5400 GG
APOA2 rs5082 AG`;
const payload = (strand: "forward" | "unknown" = "forward") =>
  manualGeneticImportSchema.parse({
    consent: true,
    provider: "manual",
    source: "Synthetic example table",
    collectedAt: date,
    strand,
    entries: parseGenotypeTable(table),
  });
test("selected SNP parser reads the complete example, headers and delimiters without requiring a raw report", () => {
  assert.equal(parseGenotypeTable(table).length, 24);
  assert.deepEqual(
    parseGenotypeTable("Gene,SNP,Your genotype\nMTHFR,rs1801133,g/a"),
    [{ gene: "MTHFR", rsid: "rs1801133", genotype: "AG" }],
  );
  assert.deepEqual(parseGenotypeTable("rs1801133 --"), [
    { gene: "", rsid: "rs1801133", genotype: "--" },
  ]);
  for (const bad of [
    "",
    "MTHFR rs1801133 A",
    "MTHFR rs1801133 AX",
    "rs1801133 AG\nrs1801133 AA",
    "rs1801133 AG extra",
    "x".repeat(30001),
  ])
    assert.throws(() => parseGenotypeTable(bad));
});
test("manual genetics records unknowns, mismatches and unreviewed variants without inventing reviewed findings", () => {
  const p = payload();
  assert.equal(
    precisionEntrySchema.safeParse({ kind: "genetics", payload: p }).success,
    true,
  );
  const classified = classifyManualGenetics(p);
  assert.equal(classified.filter((c) => c.reviewed).length, 2);
  assert.match(
    classified.find((c) => c.rsid === "rs7903146")!.reason!,
    /alleles do not match/,
  );
  assert.match(
    classified.find((c) => c.rsid === "rs174550")!.reason!,
    /outside/,
  );
  assert.match(classified.find((c) => c.rsid === "rs429358")!.note!, /No APOE/);
  const r = buildPrecisionReport(
    [{ id: "manual1", kind: "genetics", payload: p, createdAt: date }],
    contextSchema.parse({}),
    defaultPreferences,
    null,
  );
  assert.equal(r.genetics.manual?.entries.length, 24);
  assert.equal(
    r.genetics.findings.find((f) => f.rsid === "rs1801133")?.status,
    "self-reported call",
  );
  assert.equal(
    r.genetics.findings.find((f) => f.rsid === "rs7903146")?.genotype,
    null,
  );
  assert.equal(
    r.genetics.findings.find((f) => f.rsid === "rs174547")?.genotype,
    null,
  );
  assert.equal(r.genetics.import?.provider, "manual");
  assert.equal(
    classifyManualGenetics(payload("unknown")).filter((e) => e.reviewed).length,
    0,
  );
});
test("manual schema requires consent, provenance, unique SNPs, valid dates and bounded input", () => {
  const p = payload();
  for (const bad of [
    { ...p, consent: false },
    { ...p, source: "" },
    { ...p, collectedAt: "2099-01-01T00:00:00Z" },
    { ...p, strand: "reverse" },
    { ...p, entries: [] },
    { ...p, entries: [p.entries[0], p.entries[0]] },
    { ...p, entries: Array(201).fill(p.entries[0]) },
    { ...p, rawFile: "private raw file" },
  ])
    assert.equal(manualGeneticImportSchema.safeParse(bad).success, false);
  const raw = parse23andMe(
    "# 23andMe\n# build 37\nrs1801133 1 11856378 AG",
    date,
  );
  const r = buildPrecisionReport(
    [{ id: "raw", kind: "genetics", payload: raw, createdAt: date }],
    contextSchema.parse({}),
    defaultPreferences,
    null,
  );
  assert.equal(r.genetics.manual, null);
  assert.equal(
    r.genetics.findings.find((f) => f.rsid === "rs1801133")?.status,
    "reported raw call",
  );
});
test("manual records use the authenticated precision API, preserve provenance and remain account scoped", async () => {
  const rows: any[] = [];
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.session = { userId: req.headers["x-test-user"] };
    next();
  });
  registerPrecisionRoutes(
    app,
    (req: any, res, next) => {
      if (!req.session.userId) return void res.sendStatus(401);
      next();
    },
    {
      getPrecisionRecords: async (id: string) =>
        rows.filter((r) => r.userId === id),
      insertPrecisionRecord: async (
        userId: string,
        kind: string,
        payload: unknown,
      ) => {
        const r = { id: "manual1", userId, kind, payload, createdAt: date };
        rows.push(r);
        return r;
      },
      getPrecisionContext: async () => undefined,
      getUser: async () => ({}),
      getUserSamples: async () => [],
      getMeals: async () => [],
    } as any,
  );
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${(server.address() as any).port}/api/precision`;
  const post = (user: string, p = payload()) =>
    fetch(base + "/records", {
      method: "POST",
      headers: { "content-type": "application/json", "x-test-user": user },
      body: JSON.stringify({ kind: "genetics", payload: p }),
    });
  try {
    assert.equal((await post("")).status, 401);
    assert.equal((await post("a")).status, 201);
    const a = await (
      await fetch(base, { headers: { "x-test-user": "a" } })
    ).json();
    assert.equal(a.genetics.manual.entries.length, 24);
    assert.equal(a.genetics.manual.source, "Synthetic example table");
    const b = await (
      await fetch(base, { headers: { "x-test-user": "b" } })
    ).json();
    assert.equal(b.genetics.import, null);
    assert.equal(
      (await post("a", { ...payload(), consent: false } as any)).status,
      400,
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
