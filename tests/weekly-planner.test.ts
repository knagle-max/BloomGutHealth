import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {
  weeklyRequestSchema,
  buildWeeklyPlan,
  planningRecipes,
  recipeNutrients,
  eligiblePlanningRecipes,
} from "../shared/weekly-planner";
import {
  contextSchema,
  buildPrecisionReport,
  parse23andMe,
  variantCatalog,
  type PrecisionRecord,
} from "../shared/precision-nutrition";
import {
  preferenceSchema,
  parseExplicitIngredients,
} from "../shared/meal-intelligence";
import {
  lookupSnapshotNutrition,
  snapshotFoods,
} from "../shared/food-snapshot";
import { evidenceNetwork } from "../shared/evidence-network";
import { validateProposals } from "../server/recipe-generation";
import { registerPrecisionRoutes } from "../server/precision-routes";
const prefs = preferenceSchema.parse({});
const context = contextSchema.parse({
  ageGroup: "adult",
  pregnancy: "no",
  safetyReviewed: true,
});
const input = (extra: Record<string, unknown> = {}) =>
  weeklyRequestSchema.parse({
    days: 1,
    targets: {
      calories: 2200,
      protein: 100,
      fiber: 30,
      sodium: 2300,
      saturatedFat: 20,
    },
    ...extra,
  });
const report = (p = prefs, c = context) => buildPrecisionReport([], c, p, null);

test("weekly optimizer meets explicit daily constraints, scales shopping for households, and exposes provenance", () => {
  const p = buildWeeklyPlan(input({ householdServings: 2 }), prefs, report());
  assert.equal(p.status, "feasible");
  assert.equal(p.days.length, 1);
  assert.ok(p.days[0].checks.every((c) => c.passed));
  assert.equal(p.days[0].meals.length, 4);
  for (const item of p.shoppingList) {
    const expected = p.days
      .flatMap((d) => d.meals)
      .reduce(
        (n, m) =>
          n +
          m.recipe.foodIngredients
            .filter((i) => i.foodId === item.foodId)
            .reduce((a, i) => a + i.grams * m.portion * 2, 0),
        0,
      );
    assert.equal(item.grams, Math.round(expected));
    assert.match(item.sourceUrl, /fdc.nal.usda.gov/);
  }
  const m = p.days[0].meals[0];
  assert.equal(
    recipeNutrients(m.recipe, 2).calories!,
    recipeNutrients(m.recipe).calories! * 2,
  );
  assert.ok(
    p.days[0].meals.every((m) => m.pathways.every((p) => p.sourceIds.length)),
  );
});
test("vegan, fish allergy, free text category dislike and gluten exclusion apply before optimization", () => {
  const vegan = preferenceSchema.parse({
    dietaryPattern: "vegan",
    exclusions: ["gluten"],
    dislikes: ["seafood"],
  });
  const allowed = eligiblePlanningRecipes(vegan, ["fish"]);
  assert.ok(allowed.recipes.some((r) => r.mealType === "breakfast"));
  for (const r of allowed.recipes)
    assert.ok(
      r.ingredients.every(
        (i) =>
          !i.tags.some((t) =>
            ["gluten", "seafood", "meat", "eggs", "dairy"].includes(t),
          ),
      ),
    );
  assert.ok(
    eligiblePlanningRecipes(prefs, ["unknown-allergen"]).unknownAllergies
      .length,
  );
});
test("infeasible vitamin targets do not become a feasible or supplemented vegan plan", () => {
  const vegan = preferenceSchema.parse({
    dietaryPattern: "vegan",
    cookingMinutes: 60,
  });
  const p = buildWeeklyPlan(
    input({ nutrientTargets: { vitamin_b12_ug: { min: 2.4, max: null } } }),
    vegan,
    report(vegan),
  );
  assert.equal(p.checksPassed, false);
  assert.equal(p.status, "targets-unmet");
  assert.ok(
    p.days[0].checks.some((c) => c.key === "vitamin_b12_ug" && !c.passed),
  );
  assert.ok(!("supplements" in p));
});
test("locked swaps are recalculated and excluded or foreign meal IDs are rejected", () => {
  const first = buildWeeklyPlan(input(), prefs, report());
  const locked = Object.fromEntries(
    first.days[0].meals.map((m) => [
      `d0-${m.slot}`,
      { recipeId: m.recipeId, portion: m.portion },
    ]),
  );
  const next = buildWeeklyPlan(input({ locked }), prefs, report());
  assert.deepEqual(next.days[0].nutrients, first.days[0].nutrients);
  assert.throws(() =>
    buildWeeklyPlan(
      input({ locked: { "d0-dinner": { recipeId: "made-up", portion: 1 } } }),
      prefs,
      report(),
    ),
  );
  assert.throws(() =>
    buildWeeklyPlan(
      input({
        locked: {
          "d6-dinner": {
            recipeId: first.days[0].meals[2].recipeId,
            portion: 1,
          },
        },
      }),
      prefs,
      report(),
    ),
  );
});
test("review gates do not invent a plan for missing age, pregnancy, high-risk conditions or unknown allergens", () => {
  for (const c of [
    contextSchema.parse({}),
    { ...context, pregnancy: "yes" as const },
    { ...context, conditions: ["chronic kidney disease"] },
    { ...context, allergies: ["unknown-allergen"] },
  ]) {
    const p = buildWeeklyPlan(input(), prefs, report(prefs, c));
    assert.equal(p.status, "blocked");
    assert.equal(p.days.length, 0);
    assert.ok(p.blocks.length);
  }
});
test("USDA snapshot uses exact prepared matches and preserves unavailable ingredients", () => {
  const source = snapshotFoods.find((f) => f.id === "oats")!;
  const known = lookupSnapshotNutrition(
    parseExplicitIngredients(`100 g ${source.name}`),
  );
  assert.equal(known.nutrients.find((n) => n.key === "calories")?.amount, 379);
  assert.equal(known.foodMatches[0].fdcId, 173904);
  const unknown = lookupSnapshotNutrition(
    parseExplicitIngredients("100 g rice, 100 g unrecognized food"),
  );
  assert.equal(unknown.foodMatches.length, 0);
  assert.ok(unknown.nutrients.every((n) => n.amount === null));
  const partial = lookupSnapshotNutrition(
    parseExplicitIngredients(`100 g ${source.name}, 100 g unrecognized food`),
  );
  assert.equal(
    partial.nutrients.find((n) => n.key === "calories")?.coverage,
    0.5,
  );
});
test("evidence graph resolves all nodes and sources without joining genotype to invented microbial flux", () => {
  const n = evidenceNetwork(),
    nodes = new Set(n.nodes.map((x) => x.id)),
    sources = new Set(n.sources.map((x) => x.id));
  for (const e of n.edges) {
    assert.ok(nodes.has(e.from) && nodes.has(e.to));
    assert.ok(e.sourceIds.every((s) => sources.has(s)));
  }
  assert.ok(
    !n.edges.some(
      (e) => e.from.startsWith("rs") && e.to.startsWith("molecule:"),
    ),
  );
  const raw =
    "# 23andMe\n# reference human assembly build 37\nrs738409\t22\t44324727\tCG\nrs58542926\t19\t19379549\tCT\nrs1260326\t2\t27730940\tCT";
  assert.equal(parse23andMe(raw, new Date().toISOString()).calls.length, 3);
  assert.equal(variantCatalog.length, 7);
});
test("AI recipe proposals cannot smuggle excluded ingredients, new food IDs, duplicates or incomplete mains", () => {
  const vegan = preferenceSchema.parse({
    dietaryPattern: "vegan",
    cookingMinutes: 60,
  });
  const safe = {
    id: "example",
    mealType: "main" as const,
    technique: "bowl" as const,
    ingredients: [
      { foodId: "tofu", grams: 150 },
      { foodId: "rice", grams: 200 },
      { foodId: "broccoli", grams: 150 },
    ],
  };
  assert.equal(validateProposals([safe], vegan, []).length, 1);
  assert.throws(() =>
    validateProposals(
      [
        {
          ...safe,
          ingredients: [
            { foodId: "salmon", grams: 150 },
            ...safe.ingredients.slice(1),
          ],
        },
      ],
      vegan,
      [],
    ),
  );
  assert.throws(() =>
    validateProposals(
      [
        {
          ...safe,
          ingredients: [
            { foodId: "not-real", grams: 150 },
            ...safe.ingredients.slice(1),
          ],
        },
      ],
      vegan,
      [],
    ),
  );
  assert.throws(() => validateProposals([safe, safe], vegan, []));
  assert.throws(() =>
    validateProposals(
      [{ ...safe, ingredients: safe.ingredients.slice(1) }],
      vegan,
      [],
    ),
  );
});
test("weekly API recomputes saved plans, enforces auth and isolates saved snapshots", async () => {
  const byUser = new Map<string, PrecisionRecord[]>();
  const store: any = {
    getPrecisionContext: async () => context,
    getPrecisionRecords: async (id: string) => byUser.get(id) || [],
    getUser: async () => ({ dietaryPreferences: prefs }),
    getUserSamples: async () => [],
    getMeals: async () => [],
    getMetabolites: async () => [],
    insertPrecisionRecord: async (
      id: string,
      kind: string,
      payload: unknown,
    ) => {
      const r = {
        id: String(Math.random()),
        kind,
        payload,
        createdAt: new Date(),
      };
      byUser.set(id, [...(byUser.get(id) || []), r]);
      return r;
    },
  };
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
    store,
  );
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  try {
    assert.equal(
      (await fetch(base + "/api/precision/weekly-plans")).status,
      401,
    );
    const saved = await fetch(base + "/api/precision/weekly-plans/save", {
      method: "POST",
      headers: { "content-type": "application/json", "x-test-user": "a" },
      body: JSON.stringify(input()),
    });
    assert.equal(saved.status, 201);
    const row = await saved.json();
    assert.equal(row.payload.checksPassed, true);
    const own = await (
      await fetch(base + "/api/precision/weekly-plans", {
        headers: { "x-test-user": "a" },
      })
    ).json();
    assert.equal(own.length, 1);
    const other = await (
      await fetch(base + "/api/precision/weekly-plans", {
        headers: { "x-test-user": "b" },
      })
    ).json();
    assert.equal(other.length, 0);
    const tampered = await fetch(base + "/api/precision/weekly-plans/save", {
      method: "POST",
      headers: { "content-type": "application/json", "x-test-user": "a" },
      body: JSON.stringify({ ...input(), checksPassed: true }),
    });
    assert.equal(tampered.status, 400);
    const rejected = await fetch(base + "/api/precision/weekly-plans/save", {
      method: "POST",
      headers: { "content-type": "application/json", "x-test-user": "a" },
      body: JSON.stringify(
        input({ nutrientTargets: { vitamin_c_mg: { min: 10000, max: null } } }),
      ),
    });
    assert.equal(rejected.status, 422);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
