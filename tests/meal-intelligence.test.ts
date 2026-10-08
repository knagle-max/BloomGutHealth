import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {
  preferenceSchema,
  recommendMeals,
  recipes,
  parseExplicitIngredients,
  scaleDatabaseNutrients,
  explainFoods,
  filterLegacyFoods,
} from "../shared/meal-intelligence";
import { parseReportText, abundanceSchema } from "../shared/report-import";
import {
  lookupDatabaseNutrition,
  nutritionTotals,
} from "../server/meal-intelligence";
import { registerPlannerRoutes } from "../server/planner-routes";
import { pathways } from "../shared/science-coach";
test("saved food restrictions, dislikes, vegan pattern and time apply before recipes are recommended", () => {
  const preferences = preferenceSchema.parse({
    goals: ["butyrate", "diversity"],
    dietaryPattern: "vegan",
    exclusions: ["seafood", "nuts", "alliums"],
    dislikes: ["tofu"],
    cookingMinutes: 20,
  });
  const meals = recommendMeals(preferences);
  assert.ok(meals.length);
  for (const r of meals)
    for (const i of r.ingredients) {
      assert.ok(
        !i.tags.some((t) =>
          ["meat", "dairy", "eggs", "seafood", "nuts", "alliums"].includes(t),
        ),
      );
      assert.doesNotMatch(i.name, /tofu/i);
    }
  assert.ok(meals.every((r) => r.minutes <= 20));
  assert.deepEqual(
    filterLegacyFoods(
      [{ food: "Fatty fish (salmon, sardines)" }, { food: "Beans" }],
      preferences,
    ),
    [{ food: "Beans" }],
  );
});
test("cohort research cannot masquerade as a proven meal intervention", () => {
  assert.equal(
    recommendMeals(preferenceSchema.parse({ goals: ["athletic", "longevity"] }))
      .length,
    0,
  );
});
test("each complete recipe resolves its biological pathways", () => {
  assert.equal(recipes.length, 15);
  for (const r of recipes) {
    assert.ok(r.ingredients.length && r.steps.length);
    assert.ok(r.pathwayIds.every((id) => pathways.some((p) => p.id === id)));
  }
});
test("quantities without explicit mass stay unknown; provided kg converts correctly", () => {
  const ingredients = parseExplicitIngredients(
    "0.15 kg chicken, a bowl of rice and 80 g broccoli",
  );
  assert.deepEqual(
    ingredients.map((i) => i.grams),
    [150, null, 80],
  );
  assert.equal(parseExplicitIngredients("999999 g oats")[0].grams, null);
});
test("missing vitamins remain unknown and partial coverage never becomes a complete meal total", () => {
  const data = scaleDatabaseNutrients(
    [
      {
        grams: 150,
        foodNutrients: [
          { nutrient: { id: 1003 }, amount: 20 },
          { nutrient: { id: 1093 }, amount: 0 },
        ],
      },
    ],
    2,
  );
  assert.equal(data.find((n) => n.key === "protein_g")?.amount, 30);
  assert.equal(data.find((n) => n.key === "protein_g")?.coverage, 0.5);
  assert.equal(data.find((n) => n.key === "sodium_mg")?.amount, 0);
  assert.equal(data.find((n) => n.key === "vitamin_d_ug")?.amount, null);
  assert.equal(nutritionTotals([]).totalCalories, null);
});
test("USDA lookup uses database records and exposes automatic matching provenance", async () => {
  const result = await lookupDatabaseNutrition(
    [
      {
        name: "Cooked chicken",
        grams: 150,
        preparation: "cooked",
        assumption: "user mass",
      },
    ],
    async (url) =>
      url.includes("search")
        ? { foods: [{ fdcId: 123, description: "Chicken cooked" }] }
        : {
            description: "Chicken cooked",
            foodNutrients: [{ nutrient: { id: 1003 }, amount: 20 }],
          },
    "test-key",
  );
  assert.equal(result.nutrients.find((n) => n.key === "protein_g")?.amount, 30);
  assert.equal(result.foodMatches[0].needsConfirmation, true);
  assert.equal(result.foodMatches[0].fdcId, 123);
});
test("provider failure preserves unknowns, not generated values", async () => {
  const result = await lookupDatabaseNutrition(
    [
      {
        name: "Chicken",
        grams: 150,
        preparation: "cooked",
        assumption: "user mass",
      },
    ],
    async () => {
      throw Error("offline");
    },
    "test-key",
  );
  assert.equal(result.foodMatches.length, 0);
  assert.ok(result.nutrients.every((n) => n.amount === null));
  assert.match(result.warnings[0], /unavailable/);
});
test("food explanations provide sources and no abundance or concentration numbers", () => {
  const result = explainFoods("oats with yogurt and walnuts");
  assert.ok(result.pathways.length >= 3);
  assert.ok(result.sources.length);
  assert.ok(!("concentration" in result));
});
test("CSV/JSON reports reject mixed totals, nonfinite values and duplicate taxa", () => {
  assert.deepEqual(
    parseReportText(
      "bacteria,abundance\nRoseburia,3.2\nBifidobacterium,5",
      "csv",
    ),
    { Roseburia: 3.2, Bifidobacterium: 5 },
  );
  assert.throws(() =>
    parseReportText("bacteria,abundance\nRoseburia,3\nRoseburia,4", "csv"),
  );
  assert.equal(abundanceSchema.safeParse({ a: 60, b: 60 }).success, false);
  assert.equal(abundanceSchema.safeParse({ a: NaN }).success, false);
  assert.throws(() =>
    parseReportText('{"bacteria_percentages":{"a":-3}}', "json"),
  );
});
test("planner routes save per-account preferences and meal context, enforce ownership, and tolerate unknown nutrition", async () => {
  const users = new Map<string, any>([
    ["current", { id: "current" }],
    ["other", { id: "other" }],
  ]);
  const meals = new Map<string, any>();
  const storage: any = {
    getUser: async (id: string) => users.get(id),
    updateUserProfile: async (id: string, updates: any) =>
      Object.assign(users.get(id), updates),
    getMeals: async (id: string) =>
      Array.from(meals.values()).filter((m) => m.userId === id),
    getMeal: async (id: string) => meals.get(id),
    insertMeal: async (data: any) => {
      const meal = { id: "meal-1", loggedAt: new Date(), ...data };
      meals.set(meal.id, meal);
      return meal;
    },
    updateMeal: async (id: string, data: any) => {
      Object.assign(meals.get(id), data);
      return meals.get(id);
    },
  };
  let analyzedConsent = false;
  const analyzer: any = async (_text: string, consent: boolean) => {
    analyzedConsent = consent;
    return { intelligence: { status: "unavailable" }, nutritionalData: [] };
  };
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.session = { userId: req.header("x-user") } as any;
    next();
  });
  registerPlannerRoutes(
    app,
    (req, res, next) =>
      req.session.userId
        ? next()
        : void res.status(401).json({ error: "Authentication required" }),
    storage,
    analyzer,
  );
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.on("listening", resolve));
  const address = server.address() as { port: number };
  const send = (path: string, method = "GET", body?: any, user = "current") =>
    fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(user ? { "x-user": user } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  try {
    assert.equal(
      (await send("/api/preferences", "GET", undefined, "")).status,
      401,
    );
    const preferences = preferenceSchema.parse({
      dislikes: ["tofu"],
      exclusions: ["seafood"],
      goals: ["butyrate"],
    });
    assert.equal(
      (await send("/api/preferences", "PUT", preferences)).status,
      200,
    );
    assert.deepEqual((await (await send("/api/preferences")).json()).dislikes, [
      "tofu",
    ]);
    assert.deepEqual(
      (await (await send("/api/preferences", "GET", undefined, "other")).json())
        .dislikes,
      [],
    );
    const context = {
      eatenAt: "2026-10-08T06:00:00Z",
      portion: "small",
      symptoms: { bloating: 3, energy: null, comfort: 8, clarity: null },
    };
    const response = await send("/api/meals", "POST", {
      mealText: "a bowl of oats",
      mealType: "breakfast",
      mealContext: context,
      aiConsent: true,
    });
    assert.equal(response.status, 200);
    const saved = await response.json();
    assert.equal(saved.totalCalories, null);
    assert.deepEqual(saved.mealContext, context);
    assert.equal(saved.userId, "current");
    assert.equal(analyzedConsent, true);
    assert.equal(
      (await send("/api/meals/meal-1", "PUT", { mealText: "changed" }, "other"))
        .status,
      403,
    );
    assert.equal(
      (await send("/api/meals", "POST", { mealText: "meal", userId: "other" }))
        .status,
      400,
    );
    assert.equal(
      (
        await send("/api/meals", "POST", {
          mealText: "meal",
          mealContext: { symptoms: { bloating: 11 } },
        })
      ).status,
      400,
    );
    assert.equal(
      (await send("/api/meals/meal-1", "PUT", { mealText: "150 g oats" }))
        .status,
      200,
    );
    assert.deepEqual(meals.get("meal-1").mealContext, context);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("AI recipe ranking cannot add, omit or duplicate a restricted recipe", async () => {
  const { validateRecipeRanking, prioritizeRecipes } =
    await import("../server/recipe-ranking");
  const eligible = recipes.slice(0, 2);
  assert.throws(() =>
    validateRecipeRanking(eligible, [eligible[0].id, eligible[0].id]),
  );
  assert.throws(() =>
    validateRecipeRanking(eligible, ["unapproved", eligible[0].id]),
  );
  assert.throws(() => validateRecipeRanking(eligible, []));
  assert.deepEqual(
    validateRecipeRanking(eligible, [eligible[1].id, eligible[0].id]),
    [eligible[1], eligible[0]],
  );
  const result = await prioritizeRecipes(
    eligible,
    preferenceSchema.parse({}),
    false,
  );
  assert.match(result.aiStatus, /off/);
});
