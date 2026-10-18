import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import express from "express";
import {
  buildBiologicalRegistry,
  validateRegistry,
  assessFood,
} from "../shared/biological-model";
import { BiologyStorage, registryFingerprint } from "../server/biology-storage";
import {
  buildPrecisionReport,
  contextSchema,
  labSchema,
} from "../shared/precision-nutrition";
import { preferenceSchema } from "../shared/meal-intelligence";
import { registerBiologyRoutes } from "../server/biology-routes";
const registry = validateRegistry(buildBiologicalRegistry()),
  prefs = preferenceSchema.parse({}),
  context = contextSchema.parse({
    ageGroup: "adult",
    pregnancy: "no",
    safetyReviewed: true,
  });
const date = new Date(Date.now() - 86400000).toISOString();
const highLdl = {
  id: "private-lab",
  kind: "lab",
  createdAt: date,
  payload: labSchema.parse({
    marker: "ldl",
    value: 4,
    unit: "mmol/L",
    measuredAt: date,
    laboratory: "Synthetic lab",
    method: "assay",
    fasting: "yes",
    referenceLow: 0,
    referenceHigh: 3,
  }),
};
test("central registry resolves references and separates composition, mechanisms, human trials and contradiction review", () => {
  assert.ok(
    registry.entities.some((e) => e.kind === "food") &&
      registry.entities.some((e) => e.kind === "biomarker") &&
      registry.entities.some((e) => e.kind === "host-variant"),
  );
  assert.equal(
    registry.relationships.find((e) => e.id === "viscosity:ldl")?.evidence,
    "human-intervention",
  );
  assert.equal(
    registry.relationships.find((e) => e.id === "oats:beta-glucan")?.evidence,
    "composition",
  );
  assert.ok(
    registry.relationships.find((e) => e.id === "viscosity:ldl")!.contradictions
      .length > 0,
  );
  assert.ok(
    registry.relationships
      .filter((e) => e.from.startsWith("organism:"))
      .every((e) => e.rule === "context-only"),
  );
  assert.throws(() =>
    validateRegistry({ ...registry, entities: registry.entities.slice(1) }),
  );
});
test("food explanations report actual rule participation, distinguish observations, and abstain for missing context or excluded food", () => {
  const report = buildPrecisionReport([highLdl], context, prefs, null),
    oats = assessFood(registry, "food:oats", report, prefs)!;
  assert.equal(oats.observations.labs[0].marker, "ldl");
  assert.ok(
    oats.relationshipEffects.find((e) => e.id === "food:oats:cardio")
      ?.affectsRecommendation,
  );
  assert.equal(
    oats.relationshipEffects.find((e) => e.id === "viscosity:ldl")
      ?.affectsRecommendation,
    false,
  );
  assert.equal(
    oats.relationshipEffects.find((e) => e.id.startsWith("organism:"))
      ?.affectsRecommendation,
    false,
  );
  const excluded = assessFood(
    registry,
    "food:oats",
    report,
    preferenceSchema.parse({ exclusions: ["gluten"] }),
  )!;
  assert.ok(excluded.conflicts.length);
  assert.ok(
    excluded.relationshipEffects.every((e) => !e.affectsRecommendation),
  );
  for (const extra of [
    { conditions: ["kidney disease"] },
    { allergies: ["unrecognized allergy"] },
    { allergies: ["wheat"] },
  ]) {
    const restricted = assessFood(
      registry,
      "food:oats",
      buildPrecisionReport(
        [highLdl],
        contextSchema.parse({ ...context, ...extra }),
        prefs,
        null,
      ),
      prefs,
    )!;
    assert.ok(
      restricted.relationshipEffects.every((r) => !r.affectsRecommendation),
    );
  }
  const unknown = assessFood(
    registry,
    "food:oats",
    buildPrecisionReport([highLdl], contextSchema.parse({}), prefs, null),
    prefs,
  )!;
  assert.match(unknown.decision, /Review/);
  assert.ok(unknown.relationshipEffects.every((e) => !e.affectsRecommendation));
  assert.equal(assessFood(registry, "food:unreviewed", report, prefs), null);
});
test("normalized PostgreSQL registry is idempotent, has constrained references, and detects altered published evidence", async () => {
  const pg = new PGlite();
  try {
    const migration = readFileSync(
      new URL("../migrations/0005_biological_registry.sql", import.meta.url),
      "utf8",
    );
    await pg.exec(migration);
    await pg.exec(migration);
    const store = new BiologyStorage(drizzle(pg) as any),
      saved = await store.getBiologicalRegistry();
    assert.equal(registryFingerprint(saved), registryFingerprint(registry));
    assert.equal(saved.relationships.length, registry.relationships.length);
    await assert.rejects(
      pg.exec(
        "INSERT INTO biology_relationship_sources VALUES('biology-2026-10-18.1','missing','missing')",
      ),
    );
    await pg.exec(
      "UPDATE biology_sources SET title='Altered reference' WHERE id='oat-viscosity-trial'",
    );
    await assert.rejects(
      new BiologyStorage(drizzle(pg) as any).getBiologicalRegistry(),
      /fingerprint/,
    );
  } finally {
    await pg.close();
  }
});
test("biology endpoints require authentication and never accept another account's personalization selector", async () => {
  const ownReport = buildPrecisionReport([highLdl], context, prefs, null),
    otherReport = buildPrecisionReport([], context, prefs, null),
    called: string[] = [];
  const app = express();
  app.use((req, _res, next) => {
    req.session = { userId: req.headers["x-user"] as string } as any;
    next();
  });
  registerBiologyRoutes(
    app,
    ((req: any, res: any, next: any) =>
      req.session.userId
        ? next()
        : res.status(401).json({ error: "Sign in" })) as any,
    {
      getBiologicalRegistry: async () => registry,
      getUser: async () => ({ dietaryPreferences: prefs }),
    } as any,
    {
      reportFor: async (id: string) => {
        called.push(id);
        return id === "a" ? ownReport : otherReport;
      },
    } as any,
  );
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.on("listening", r));
  const root = `http://127.0.0.1:${(server.address() as any).port}/api/biology`;
  try {
    assert.equal((await fetch(root + "/registry")).status, 401);
    let response = await fetch(root + "/foods/food:oats", {
      headers: { "x-user": "b" },
    });
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal((await response.json()).observations.labs.length, 0);
    assert.deepEqual(called, ["b"]);
    assert.equal(
      (
        await fetch(root + "/foods/food:oats?userId=a", {
          headers: { "x-user": "b" },
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await fetch(root + "/foods/food:unreviewed", {
          headers: { "x-user": "a" },
        })
      ).status,
      404,
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
