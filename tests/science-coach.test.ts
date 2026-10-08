import test from "node:test";
import assert from "node:assert/strict";
import {
  coachRequestSchema,
  buildSciencePlan,
  applyAIRanking,
  evidenceSources,
  foodActions,
  goals,
  pathways,
} from "../shared/science-coach";
import {
  prepareSciencePlan,
  registerScienceRoutes,
} from "../server/science-coach";
import express from "express";

const request = (value: unknown) => coachRequestSchema.parse(value);
test("every pathway and food action has resolvable primary sources and supported links", () => {
  const sources = new Set(evidenceSources.map((source) => source.id));
  for (const source of evidenceSources) {
    assert.ok(source.doi);
    assert.ok(source.limitation);
    assert.equal(new URL(source.url).protocol, "https:");
  }
  for (const node of [...pathways, ...foodActions]) {
    assert.ok(node.sourceIds.length);
    assert.ok(node.sourceIds.every((id) => sources.has(id)));
  }
  for (const action of foodActions)
    assert.ok(pathways.some((path) => path.id === action.pathwayId));
  for (const goal of goals)
    assert.ok(
      goal.pathwayIds.every((id) => pathways.some((path) => path.id === id)),
    );
});
test("food-only baseline never becomes an inferred bacterial gap or metabolite score", () => {
  const plan = buildSciencePlan(request({ goals: ["butyrate"] }), [
    "150g chicken with onions",
  ]);
  assert.equal(
    plan.actions.find((action) => action.id === "fructan-alliums")
      ?.alreadyMentioned,
    true,
  );
  assert.equal(plan.baseline.loggedMeals, 1);
  assert.ok(!("healthScores" in plan));
  assert.ok(!("bacterialGaps" in plan));
  assert.match(plan.measurementStatus, /No validated/);
});
test("cohort research alone cannot generate a food intervention or matching score", () => {
  const plan = buildSciencePlan(request({ goals: ["athletic", "longevity"] }));
  assert.equal(plan.actions.length, 0);
  assert.equal(plan.pathways.length, 2);
  assert.match(plan.cohortStatus, /No cohort dataset/);
});
test("restrictions and sensitivity remove actions before AI receives them", () => {
  const plan = buildSciencePlan(
    request({
      goals: ["butyrate", "diversity"],
      exclusions: ["dairy"],
      sensitiveGut: true,
    }),
  );
  assert.deepEqual(
    plan.actions.map((action) => action.id),
    ["starch-potato"],
  );
  assert.equal(plan.withheldActions, 3);
});
test("AI cannot invent, duplicate, drop, or reintroduce excluded options", () => {
  const plan = buildSciencePlan(
    request({ goals: ["diversity"], exclusions: ["dairy"] }),
  );
  assert.throws(() => applyAIRanking(plan, ["fermented-yogurt"]));
  assert.throws(() => applyAIRanking(plan, []));
  assert.throws(() =>
    applyAIRanking(plan, ["fermented-vegetables", "fermented-vegetables"]),
  );
  const ranked = applyAIRanking(plan, ["fermented-vegetables"]);
  assert.equal(ranked.mode, "ai-ranked");
  assert.deepEqual(ranked.sources, plan.sources);
});
test("ranking without consent never calls a model; invalid model output falls back honestly", async () => {
  let calls = 0;
  const ranker = async () => {
    calls++;
    return ["made-up-probiotic"];
  };
  await prepareSciencePlan(request({ goals: ["butyrate"] }), [], ranker);
  assert.equal(calls, 0);
  const plan = await prepareSciencePlan(
    request({ goals: ["butyrate"], aiConsent: true }),
    [],
    ranker,
  );
  assert.equal(calls, 1);
  assert.equal(plan.mode, "evidence-rules");
  assert.match(plan.aiStatus, /failed evidence validation/);
});
test("no AI or unsupported cohorts return honest evidence plans", async () => {
  assert.match(
    (
      await prepareSciencePlan(
        request({ goals: ["butyrate"], aiConsent: true }),
        [],
      )
    ).aiStatus,
    /not configured/,
  );
  let calls = 0;
  const plan = await prepareSciencePlan(
    request({ goals: ["longevity"], aiConsent: true }),
    [],
    async () => {
      calls++;
      return [];
    },
  );
  assert.equal(calls, 0);
  assert.match(plan.aiStatus, /No eligible/);
});
test("malformed goals, unknown restrictions and oversized preferences are rejected", () => {
  assert.equal(coachRequestSchema.safeParse({ goals: [] }).success, false);
  assert.equal(
    coachRequestSchema.safeParse({ goals: ["cure-cancer"] }).success,
    false,
  );
  assert.equal(
    coachRequestSchema.safeParse({
      goals: ["butyrate"],
      exclusions: ["unknown"],
    }).success,
    false,
  );
  assert.equal(
    coachRequestSchema.safeParse({
      goals: ["butyrate"],
      preferences: "a".repeat(601),
    }).success,
    false,
  );
  assert.deepEqual(request({ goals: ["butyrate", "butyrate"] }).goals, [
    "butyrate",
  ]);
});
test("plan endpoint enforces auth, user scope, recent window, validation and request limit", async () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.session = { userId: req.header("x-test-user") } as any;
    next();
  });
  let requestedUser = "";
  registerScienceRoutes(app, {
    requireAuth: (req, res, next) =>
      req.session.userId
        ? next()
        : void res.status(401).json({ error: "Authentication required" }),
    getMeals: async (id) => {
      requestedUser = id;
      return [
        { mealText: "yogurt", loggedAt: new Date(Date.now() - 1000) },
        { mealText: "garlic", loggedAt: new Date(Date.now() - 30 * 86400000) },
        { mealText: "onions", loggedAt: new Date(Date.now() + 86400000) },
      ];
    },
  });
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.on("listening", resolve));
  const address = server.address() as { port: number };
  const url = `http://127.0.0.1:${address.port}/api/science/plan`;
  const post = (body: unknown, user?: string) =>
    fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(user ? { "x-test-user": user } : {}),
      },
      body: JSON.stringify(body),
    });
  try {
    assert.equal((await post({ goals: ["butyrate"] })).status, 401);
    const retired = await fetch(
      `http://127.0.0.1:${address.port}/api/health/analysis/current`,
      { headers: { "x-test-user": "current" } },
    );
    assert.equal(retired.status, 404); // Science routes no longer intercept existing health endpoints.
    assert.equal(
      (await post({ goals: ["butyrate"], userId: "other" }, "current")).status,
      400,
    );
    const response = await post({ goals: ["diversity"] }, "current");
    assert.equal(response.status, 200);
    const plan = await response.json();
    assert.equal(requestedUser, "current");
    assert.equal(plan.baseline.loggedMeals, 1);
    assert.equal(
      plan.actions.find((action: any) => action.id === "fermented-yogurt")
        .alreadyMentioned,
      true,
    );
    for (let i = 0; i < 5; i++)
      assert.equal(
        (await post({ goals: ["butyrate"] }, "current")).status,
        200,
      );
    assert.equal((await post({ goals: ["butyrate"] }, "current")).status, 429);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
