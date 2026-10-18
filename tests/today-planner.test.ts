import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { buildTodayPlan, remainingSlots } from "../shared/today-planner";
import {
  contextSchema,
  buildPrecisionReport,
} from "../shared/precision-nutrition";
import {
  preferenceSchema,
  nutrientDefinitions,
  recommendMeals,
} from "../shared/meal-intelligence";
import { weeklyRequestSchema } from "../shared/weekly-planner";
import { parseLabPaste } from "../shared/lab-paste";
import { recipePreparation } from "../shared/recipe-preparation";
import { goalGuidance } from "../shared/goal-guidance";
import { analyzeMeal, nutritionTotals } from "../server/meal-intelligence";
import { mealNutritionSummary } from "../shared/nutrition-summary";
import { registerPrecisionRoutes } from "../server/precision-routes";
const prefs = preferenceSchema.parse({ cookingMinutes: 60 });
const context = contextSchema.parse({
  ageGroup: "adult",
  pregnancy: "no",
  safetyReviewed: true,
  goals: ["Fix NAFLD", "grow muscle", "longevity"],
});
const report = buildPrecisionReport([], context, prefs, null);
const request = weeklyRequestSchema.parse({
  days: 1,
  targets: {
    calories: 2200,
    protein: 100,
    fiber: 30,
    fiberMaximum: 45,
    sodium: 2300,
    saturatedFat: 20,
  },
  nutrientTargets: {
    carbohydrates_total_g: { min: 150, max: 300 },
    fat_total_g: { min: 30, max: 80 },
    vitamin_c_mg: { min: 75, max: 2000 },
  },
});
function logged(type: string, calories = 500) {
  return {
    mealType: type,
    mealText: "Synthetic meal",
    loggedAt: new Date(),
    intelligence: {
      nutrients: nutrientDefinitions.map(([key]) => ({
        key,
        amount:
          key === "calories"
            ? calories
            : key === "protein_g"
              ? 25
              : key === "carbohydrates_total_g"
                ? 50
                : key === "fat_total_g"
                  ? 15
                  : key === "fiber_g"
                    ? 8
                    : key === "sodium_mg"
                      ? 400
                      : key === "fat_saturated_g"
                        ? 3
                        : 10,
        coverage: 1,
      })),
    },
  };
}
test("remaining-day suggestions exclude completed/late slots and respect cumulative macro/micro maxima", () => {
  assert.deepEqual(remainingSlots(9, []), [
    "breakfast",
    "lunch",
    "dinner",
    "snack",
  ]);
  assert.deepEqual(remainingSlots(18, []), ["dinner", "snack"]);
  assert.deepEqual(
    remainingSlots(9, [{ mealType: "breakfast" }, { mealType: "lunch" }]),
    ["dinner", "snack"],
  );
  const result = buildTodayPlan(
    [logged("breakfast"), logged("lunch")],
    18,
    prefs,
    report,
    request,
  );
  assert.ok(result.meals.length);
  assert.ok(result.meals.every((m) => ["dinner", "snack"].includes(m.slot)));
  for (const c of result.checks) {
    assert.equal(c.complete, true);
    if (c.max !== null)
      assert.ok(c.projected! <= c.max + 1e-6, `${c.key} limit`);
  }
  assert.ok(result.checks.find((c) => c.key === "protein_g")!.projected! > 50);
  assert.ok(
    result.meals.some((m) => m.reasons.some((s) => s.includes("grow muscle"))),
  );
  assert.equal(
    result.meals.some((m) => (m as any).supplementDose),
    false,
  );
});
test("partial nutrition retains known intake and never reports complete checks; no forced meal over a limit", () => {
  const partial = buildTodayPlan(
    [
      logged("breakfast"),
      { mealType: "lunch", intelligence: { nutrients: [] } },
    ],
    18,
    prefs,
    report,
    request,
  );
  assert.equal(partial.consumed.calories, 500);
  assert.equal(
    partial.checks.find((c) => c.key === "calories")!.complete,
    false,
  );
  assert.ok(partial.warnings.some((s) => s.includes("provisional")));
  const over = buildTodayPlan(
    [logged("dinner", 3000)],
    21,
    prefs,
    report,
    request,
  );
  assert.equal(over.meals.length, 0);
  assert.equal(
    over.checks.find((c) => c.key === "calories")!.status,
    "Already above limit",
  );
  const missingMicro = buildTodayPlan(
    [
      {
        ...logged("lunch"),
        intelligence: {
          nutrients: [{ key: "calories", amount: 500, coverage: 1 }],
        },
      },
    ],
    18,
    prefs,
    report,
    request,
  );
  assert.equal(missingMicro.consumed.vitamin_c_mg, null);
  assert.equal(
    missingMicro.checks.find((c) => c.key === "vitamin_c_mg")!.status,
    "Incomplete data",
  );
});
test("allergies, dislikes, vegan pattern, cooking time and unsupported medical diets gate suggestions", () => {
  const vegan = preferenceSchema.parse({
    dietaryPattern: "vegan",
    dislikes: ["tofu"],
    exclusions: ["gluten"],
    cookingMinutes: 60,
  });
  const r = buildTodayPlan(
    [],
    18,
    vegan,
    buildPrecisionReport([], context, vegan, null),
    request,
  );
  assert.ok(r.meals.length);
  assert.ok(
    r.meals.every((m) =>
      m.recipe.ingredients.every(
        (i) =>
          !i.tags.some((t) =>
            ["meat", "seafood", "eggs", "dairy", "soy", "gluten"].includes(t),
          ),
      ),
    ),
  );
  for (const ctx of [
    { ...context, conditions: ["Chronic kidney disease"] },
    { ...context, allergies: ["unrecognized food"] },
    { ...context, ageGroup: "under18" },
    { ...context, pregnancy: "yes" },
  ])
    assert.equal(
      buildTodayPlan(
        [],
        18,
        prefs,
        buildPrecisionReport([], ctx as any, prefs, null),
        request,
      ).meals.length,
      0,
    );
  const quick = preferenceSchema.parse({ cookingMinutes: 5 });
  const q = buildTodayPlan(
    [],
    18,
    quick,
    buildPrecisionReport([], context, quick, null),
    request,
  );
  assert.ok(q.meals.every((m) => recipePreparation(m.recipe).minutes <= 5));
});
test("goals create bounded actions and meal matches; raw preparation is separate from nutrient weights", () => {
  assert.deepEqual(
    report.goals.map((g) => g.id),
    ["liver", "muscle", "aging"],
  );
  assert.ok(
    report.recommendations.some((m) =>
      m.reasons.some((s) => s.includes("grow muscle")),
    ),
  );
  assert.ok(
    report.goals.every(
      (g) => g.actions.length && g.tracking && g.sourceIds.length,
    ),
  );
  assert.match(
    goalGuidance("Fix NAFLD").actions.join(" "),
    /No automatic calorie deficit/,
  );
  const recipe = recommendMeals(prefs).find((m) => m.id === "potato-chicken")!;
  const prep = recipePreparation(recipe);
  assert.ok(prep.instructions.some((s) => s.includes("raw boneless chicken")));
  assert.ok(prep.instructions.some((s) => s.includes("74°C")));
  assert.ok(prep.shopping.find((s) => s.name.startsWith("Raw"))!.grams > 150);
  assert.equal(recipe.ingredients[0].grams, 150);
  assert.ok(prep.minutes >= 35);
});
test("lab paste accepts multiple supported units, requires units/date, and flags duplicates and unrecognized rows", () => {
  const r = parseLabPaste(
    "Test, Value, Unit\nLDL, 3.2, mmol/L\nHbA1c\t5.4\t%\nVitamin D 75 nmol/L\nB12, 350, pmol/L",
    "2026-10-01T12:00:00Z",
    "Synthetic",
  );
  assert.equal(r.valid.length, 4);
  assert.deepEqual(r.errors, []);
  assert.equal(r.valid[2].payload.marker, "vitamin_d");
  assert.equal(r.valid[0].payload.referenceLow, null);
  const bad = parseLabPaste(
    "LDL 3.2\nLDL 4 mg/dL\nLDL 5 mg/dL\nUnrecognized 7 U/L\nHbA1c 5 apples",
    "2026-10-01T12:00:00Z",
  );
  assert.equal(bad.valid.length, 1);
  assert.equal(bad.errors.length, 4);
  assert.equal(parseLabPaste("LDL 3.2 mmol/L", "invalid").valid.length, 0);
});
test("today endpoint uses only the authenticated account, validates dates/targets and never silently adopts example targets", async () => {
  const store: any = {
    getPrecisionContext: async () => context,
    getPrecisionRecords: async () => [],
    getUser: async () => ({ dietaryPreferences: prefs }),
    getUserSamples: async () => [],
    getMeals: async (id: string) => (id === "a" ? [logged("breakfast")] : []),
  };
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.session = { userId: req.header("x-user") } as any;
    next();
  });
  registerPrecisionRoutes(
    app,
    (req, res, next) =>
      req.session.userId ? next() : void res.sendStatus(401),
    store,
  );
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.on("listening", r));
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  const now = new Date(),
    date = now.toISOString().slice(0, 10),
    body = { date, timezoneOffset: 0, hour: 18 };
  const post = (data: any, user = "a") =>
    fetch(base + "/api/precision/today-plan", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(user ? { "x-user": user } : {}),
      },
      body: JSON.stringify(data),
    });
  try {
    assert.equal((await post(body, "")).status, 401);
    assert.equal((await post({ ...body, date: "2026-02-30" })).status, 400);
    assert.equal(
      (
        await post({
          ...body,
          plan: { ...request, targets: { ...request.targets, calories: 20 } },
        })
      ).status,
      400,
    );
    const example = await (await post(body)).json();
    assert.equal(example.meals.length, 0);
    assert.match(example.targetSource, /Example/);
    const own = await (await post({ ...body, plan: request })).json(),
      other = await (await post({ ...body, plan: request }, "b")).json();
    assert.equal(own.eatenMeals, 1);
    assert.equal(other.eatenMeals, 0);
    assert.equal(
      (await post({ ...body, plan: request, userId: "b" })).status,
      400,
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
