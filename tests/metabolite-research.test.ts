import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { buildWeeklyPlan, weeklyRequestSchema } from "../shared/weekly-planner";
import {
  contextSchema,
  buildPrecisionReport,
} from "../shared/precision-nutrition";
import { preferenceSchema } from "../shared/meal-intelligence";
import {
  RESEARCH_VERSION,
  researchScenario,
  researchMetabolites,
  validateResearchResult,
} from "../shared/metabolite-research";
import {
  prepareResearch,
  simulateResearch,
} from "../server/metabolite-research";
import { registerPrecisionRoutes } from "../server/precision-routes";
const context = contextSchema.parse({
  ageGroup: "adult",
  pregnancy: "no",
  safetyReviewed: true,
});
const prefs = preferenceSchema.parse({});
const plan = buildWeeklyPlan(
  weeklyRequestSchema.parse({
    days: 1,
    householdServings: 3,
    targets: {
      calories: 2200,
      protein: 100,
      fiber: 30,
      sodium: 2300,
      saturatedFat: 20,
    },
  }),
  prefs,
  buildPrecisionReport([], context, prefs, null),
);
const report = {
  id: "private-record-id",
  date: "2026-10-01T00:00:00.000Z",
  taxa: [{ name: "Example organism", abundance: 100 }],
  predictions: [{ name: "unverified-legacy-prediction", value: 10 }],
};
function fixture(hash: string): any {
  return {
    version: RESEARCH_VERSION,
    inputHash: hash,
    status: "simulated",
    blockers: [],
    model: {
      engine: "TEST FIXTURE ONLY",
      version: "test-1",
      databaseVersion: "synthetic-test",
      substrateMappingVersion: "synthetic-test",
      solver: "mock",
      uncertaintyMethod: "parameter-sensitivity",
      assumptions: ["Synthetic fixture; not biological evidence."],
      citations: ["https://example.org/test-fixture"],
    },
    coverage: {
      matchedAbundanceFraction: 1,
      unmappedTaxa: [],
      unmappedFoodIds: [],
    },
    units: "mmol/gDW/h",
    estimates: researchMetabolites.map((metabolite) => ({
      day: 1,
      metabolite,
      value: 0.5,
      lower: -1,
      upper: 1,
    })),
  };
}
test("research manifest uses personal portions, excludes legacy predictions and identifiers, and never infers substrates", () => {
  const s = researchScenario(plan, report);
  const ingredient = s.days[0].foods[0];
  const expected = plan.days[0].meals
    .flatMap((m) =>
      m.recipe.foodIngredients.map((i) => ({
        ...i,
        grams: i.grams * m.portion,
      })),
    )
    .filter((i) => i.foodId === ingredient.foodId)
    .reduce((n, i) => n + i.grams, 0);
  assert.equal(ingredient.grams, expected);
  assert.equal(JSON.stringify(s).includes("private-record-id"), false);
  assert.equal(
    JSON.stringify(s).includes("unverified-legacy-prediction"),
    false,
  );
  assert.equal("medium" in s, false);
  assert.equal(s.microbiome?.functionalActivityVerified, false);
});
test("strict simulation results reject mismatched input, impossible ranges, missing metabolites and unmapped food", () => {
  const hash = "a".repeat(64);
  assert.equal(
    validateResearchResult(fixture(hash), hash, [1]).estimates.length,
    3,
  );
  for (const mutate of [
    (r: any) => (r.inputHash = "b".repeat(64)),
    (r: any) => (r.estimates[0].lower = 4),
    (r: any) => r.estimates.pop(),
    (r: any) => r.estimates.push(r.estimates[0]),
    (r: any) => (r.estimates[0].day = 2),
    (r: any) => r.coverage.unmappedFoodIds.push("missing"),
    (r: any) => (r.coverage.matchedAbundanceFraction = 0),
    (r: any) => (r.model = null),
    (r: any) => (r.units = "blood concentration"),
  ]) {
    const r = fixture(hash);
    mutate(r);
    assert.throws(() => validateResearchResult(r, hash, [1]));
  }
  const blocked = {
    ...fixture(hash),
    status: "blocked",
    blockers: ["No curated mapping"],
    estimates: [],
    model: null,
  };
  assert.equal(validateResearchResult(blocked, hash, [1]).status, "blocked");
});
test("research adapter abstains when disconnected, validates remote output and limits response size", async () => {
  const oldUrl = process.env.METABOLITE_RESEARCH_URL,
    oldToken = process.env.METABOLITE_RESEARCH_TOKEN;
  try {
    delete process.env.METABOLITE_RESEARCH_URL;
    delete process.env.METABOLITE_RESEARCH_TOKEN;
    const missing = prepareResearch(plan, null);
    assert.ok(missing.blockers.length >= 2);
    let calls = 0;
    const blocked = await simulateResearch(missing, async () => {
      calls++;
      throw Error("must not call");
    });
    assert.equal(calls, 0);
    assert.equal(blocked.result, null);
    process.env.METABOLITE_RESEARCH_URL = "https://example.org/simulate";
    process.env.METABOLITE_RESEARCH_TOKEN = "test-only-token";
    const p = prepareResearch(plan, report);
    assert.equal(p.blockers.length, 0);
    const result = await simulateResearch(p, async (_url, options) => {
      assert.equal(options?.redirect, "error");
      assert.equal(JSON.parse(String(options?.body)).inputHash, p.inputHash);
      return new Response(JSON.stringify(fixture(p.inputHash)));
    });
    assert.equal(result.result?.status, "simulated");
    await assert.rejects(
      simulateResearch(p, async () => new Response("x".repeat(256001))),
    );
    await assert.rejects(
      simulateResearch(
        p,
        async () => new Response(JSON.stringify(fixture("b".repeat(64)))),
      ),
    );
    process.env.METABOLITE_RESEARCH_URL = "http://example.org/simulate";
    await assert.rejects(simulateResearch(p));
  } finally {
    if (oldUrl === undefined) delete process.env.METABOLITE_RESEARCH_URL;
    else process.env.METABOLITE_RESEARCH_URL = oldUrl;
    if (oldToken === undefined) delete process.env.METABOLITE_RESEARCH_TOKEN;
    else process.env.METABOLITE_RESEARCH_TOKEN = oldToken;
  }
});
test("research route enforces authentication, plan ownership, consent, no-store and per-account run limit", async () => {
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
        id === "owner" ? [{ id: "plan1", kind: "plan", payload: plan }] : [],
      getPrecisionContext: async () => context,
      getUser: async () => ({ dietaryPreferences: prefs }),
      getUserSamples: async () => [],
      getMeals: async () => [],
    } as any,
  );
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.once("listening", r));
  const url = `http://127.0.0.1:${(server.address() as any).port}/api/precision/metabolite-research`;
  const post = (user: string, extra = {}) =>
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-test-user": user },
      body: JSON.stringify({ planId: "plan1", ...extra }),
    });
  try {
    assert.equal((await post("")).status, 401);
    assert.equal((await post("other")).status,403);
    for(const extra of [{},{run:true},{run:true,researchConsent:true},{run:true,researchConsent:true,experimental:true}]) {
      const response=await post("owner",extra);assert.equal(response.status,403);
      assert.equal(response.headers.get("cache-control"),"no-store");assert.equal((await response.json()).code,"CAPABILITY_UNAVAILABLE");
    }
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
