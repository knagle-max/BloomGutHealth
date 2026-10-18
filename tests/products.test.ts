import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import {
  ProductService,
  normalizeDSLD,
  normalizeOFF,
  lookupProductNutrition,
  registerProductRoutes,
} from "../server/products";
import {
  productIngredient,
  productRefSchema,
  type Product,
} from "../shared/products";
import { analyzeMeal, nutritionTotals } from "../server/meal-intelligence";
import { registerPlannerRoutes } from "../server/planner-routes";
import { mealNutritionSummary } from "../shared/nutrition-summary";
const row = (
  name: string,
  quantity: number,
  unit: string,
  servingSizeOrder = 1,
  servingSizeQuantity = 12,
) => ({
  name,
  quantity: [
    { quantity, unit, operator: "=", servingSizeOrder, servingSizeQuantity },
  ],
  nestedRows: [],
});
const label = {
  id: 321,
  fullName: "Synthetic brand fiber powder",
  brandName: "Example Brand",
  entryDate: "2026-01-01",
  offMarket: 0,
  servingSizes: [
    {
      order: 1,
      minQuantity: 12,
      maxQuantity: 12,
      unit: "Gram(s)",
      notes: "1 rounded tablespoon",
    },
    { order: 2, minQuantity: 2, maxQuantity: 2, unit: "Capsule(s)", notes: "" },
  ],
  ingredientRows: [
    row("Calories", 40, "{Calories}"),
    row("Total Carbohydrates", 12, "g"),
    row("Dietary Fiber", 3, "g"),
    row("Total Sugars", 8, "g"),
    row("Protein", 0, "g"),
    row("Vitamin D", 1000, "IU", 2, 2),
    row("Folate", 400, "mcg DFE", 2, 2),
    row("Vitamin A", 5000, "IU", 2, 2),
    row("Creatine", 5, "g", 2, 2),
  ],
};
const packaged = {
  code: "1234567890123",
  product_name: "Another brand cereal",
  brands: "Synthetic",
  serving_quantity: 30,
  serving_quantity_unit: "g",
  serving_size: "1 bowl (30 g)",
  nutriments: {
    "energy-kcal_100g": 400,
    proteins_100g: 10,
    carbohydrates_100g: 70,
    fat_100g: 8,
    fiber_100g: 5,
    sugars_100g: 0,
    sodium_100g: 0.2,
  },
};
const manual: Product = {
  source: "manual",
  id: "a1",
  name: "My local product",
  brand: "Private",
  servingDescription: "1 scoop (20 g)",
  servingGrams: 20,
  perServing: { calories: 70, protein_g: 14, fiber_g: 2 },
  retrievedAt: "2026-10-01",
  url: null,
  notes: [],
};
const mockStore = () => {
  const saved = new Map<string, Product[]>([["a", [manual]]]);
  return {
    getNutritionProducts: async (id: string) => saved.get(id) || [],
    insertNutritionProduct: async (id: string, p: any) => {
      const product = {
        ...p,
        source: "manual",
        id: "new" + (saved.get(id)?.length || 0),
        url: null,
        retrievedAt: new Date().toISOString(),
        notes: [],
      };
      saved.set(id, [...(saved.get(id) || []), product]);
      return product;
    },
    deleteNutritionProduct: async (id: string, key: string) => {
      const rows = saved.get(id) || [];
      saved.set(
        id,
        rows.filter((p) => p.id !== key),
      );
      return rows.some((p) => p.id === key);
    },
  };
};
const mockService = () =>
  new ProductService(async (url) => {
    if (url.includes("search-filter"))
      return {
        hits: [
          {
            _id: "321",
            _source: {
              fullName: label.fullName,
              brandName: label.brandName,
              entryDate: label.entryDate,
            },
          },
        ],
      };
    if (url.includes("/label/")) return label;
    if (url.includes("/product/")) return { product: packaged };
    return { products: [packaged] };
  });
test("supplement adapter handles arbitrary brands and serving types without inferring missing macros or ambiguous vitamin units", () => {
  const variants = normalizeDSLD(label);
  assert.equal(variants.length, 2);
  assert.equal(variants[0].servingGrams, 12);
  assert.equal(variants[0].perServing.calories, 40);
  assert.equal(variants[0].perServing.fat_total_g, undefined);
  assert.equal(variants[0].perServing.protein_g, 0);
  assert.equal(variants[1].servingGrams, null);
  assert.equal(variants[1].perServing.vitamin_d_ug, 25);
  assert.equal(variants[1].perServing.folate_ug, undefined);
  assert.equal(variants[1].perServing.vitamin_a_ug, undefined);
  assert.ok(
    variants[1].otherNutrients?.some(
      (n) => n.name === "Creatine" && n.amount === 5,
    ),
  );
  const ranged = normalizeDSLD({
    ...label,
    servingSizes: [{ ...label.servingSizes[0], maxQuantity: 24 }],
  });
  assert.equal(ranged.length, 1);
  assert.equal(ranged[0].servingGrams, 12); // Uses only an explicitly quantified serving, not the end of a range.
});
test("packaged-food adapter scales declared servings, converts sodium and preserves declared zero without fabricated micros", () => {
  const p = normalizeOFF(packaged);
  assert.equal(p.perServing.calories, 120);
  assert.equal(p.perServing.sodium_mg, 60);
  assert.equal(p.perServing.sugar_g, 0);
  assert.equal(p.perServing.vitamin_d_ug, undefined);
  const unknownServing = normalizeOFF({
    ...packaged,
    serving_quantity: undefined,
  });
  assert.equal(unknownServing.servingDescription, "100 g (choose grams eaten)");
  assert.equal(unknownServing.perServing.calories, 400);
});
test("search exposes live candidates, caches only public source data and isolates private saved labels", async () => {
  const service = mockService(),
    store = mockStore();
  const a = await service.search("local product", "all", store, "a"),
    b = await service.search("local product", "all", store, "b");
  assert.ok(a.products.some((p) => p.source === "manual"));
  assert.equal(
    b.products.some((p) => p.source === "manual"),
    false,
  );
  assert.ok(a.products.some((p) => p.source === "off"));
  assert.ok(a.products.some((p) => p.source === "dsld"));
  assert.equal(
    (await service.resolve({ source: "dsld", id: "321:1" }, store, "a"))[0]
      .perServing.vitamin_d_ug,
    25,
  );
  await assert.rejects(() =>
    service.resolve({ source: "manual", id: "a1" }, store, "b"),
  );
  await assert.rejects(() =>
    service.resolve({ source: "off", id: "https://private-host" }, store, "a"),
  );
  const fail = new ProductService(async () => {
    throw Error("Provider error with sensitive details");
  });
  const result = await fail.search(
    "unknown supplement",
    "supplement",
    store,
    "a",
  );
  assert.equal(result.products.length, 0);
  assert.equal(result.warnings.length, 1);
  assert.equal(JSON.stringify(result).includes("sensitive details"), false);
});
test("product nutrition scales capsule/scoop servings alongside other food and never double counts unknown ingredients", async () => {
  const store = mockStore(),
    service = mockService();
  const item = productIngredient(normalizeDSLD(label)[1], 2);
  const n = await lookupProductNutrition([item], store, "a", service);
  assert.equal(n.nutrients.find((n) => n.key === "vitamin_d_ug")!.amount, 50);
  assert.equal(n.nutrients.find((n) => n.key === "calories")!.amount, null);
  assert.ok(
    n.productDetails[0].otherNutrients.some(
      (n) => n.name === "Creatine" && n.amount === 10,
    ),
  );
  const ingredient = productIngredient(manual, 1.5);
  const result = await analyzeMeal("", false, [ingredient], {
    userId: "a",
    store,
  });
  assert.equal(nutritionTotals(result.nutritionalData).totalCalories, 105);
  assert.equal(nutritionTotals(result.nutritionalData).totalProtein, 21);
  assert.equal(nutritionTotals(result.nutritionalData).totalFat, null);
  const partial = await analyzeMeal(
    "",
    false,
    [
      ingredient,
      {
        name: "mystery xyz",
        grams: null,
        preparation: "Unknown",
        assumption: "Unknown",
      },
    ],
    { userId: "a", store },
  );
  assert.equal(nutritionTotals(partial.nutritionalData).totalCalories, null);
  assert.equal(
    mealNutritionSummary([{ intelligence: partial.intelligence }]).totals
      .calories,
    105,
  );
  const foreign = await analyzeMeal("", false, [ingredient], {
    userId: "b",
    store,
  });
  assert.equal(foreign.intelligence.foodMatches.length, 0);
  assert.equal(
    foreign.intelligence.nutrients.find((n) => n.key === "calories")!.amount,
    null,
  );
});
test("authenticated product API supports any valid label, reuses it in meals, validates units and rejects cross-account access", async () => {
  const products = mockStore(),
    meals: any[] = [];
  const store: any = {
    ...products,
    getUser: async () => ({}),
    getMeals: async () => meals,
    insertMeal: async (m: any) => {
      const row = { ...m, id: "meal", loggedAt: new Date() };
      meals.push(row);
      return row;
    },
  };
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.session = { userId: req.header("x-user") } as any;
    next();
  });
  const auth: any = (req: any, res: any, next: any) =>
    req.session.userId ? next() : res.sendStatus(401);
  registerProductRoutes(app, auth, store, mockService());
  registerPlannerRoutes(app, auth, store);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((r) => server.on("listening", r));
  const base = `http://127.0.0.1:${(server.address() as any).port}`;
  const req = async (
    path: string,
    user = "a",
    body?: any,
    method = body ? "POST" : "GET",
  ) =>
    fetch(base + path, {
      method,
      headers: {
        "content-type": "application/json",
        ...(user ? { "x-user": user } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  try {
    assert.equal((await req("/api/products/saved", "")).status, 401);
    assert.equal((await req("/api/products/manual/a1", "b")).status, 404);
    const labelBody = {
      name: "Any new brand",
      brand: "Synthetic",
      servingDescription: "1 scoop",
      servingGrams: 20,
      perServing: { calories: 80, protein_g: 15, sodium_mg: 0 },
    };
    const created = await req("/api/products", "b", labelBody);
    assert.equal(created.status, 201);
    const p = await created.json();
    assert.equal(
      (await (await req("/api/products/saved", "b")).json()).length,
      1,
    );
    assert.equal(
      (await (await req("/api/products/saved", "a")).json()).some(
        (v: any) => v.id === p.id,
      ),
      false,
    );
    assert.equal(
      (
        await req("/api/products", "b", {
          ...labelBody,
          perServing: { fake_nutrient: 1 },
        })
      ).status,
      400,
    );
    const meal = await req("/api/meals", "b", {
      mealText: "",
      products: [productIngredient(p, 2)],
      mealType: "snack",
    });
    assert.equal(meal.status, 200);
    const saved = await meal.json();
    assert.equal(saved.totalCalories, 160);
    assert.equal(saved.totalProtein, 30);
    assert.equal(saved.totalFat, null);
    assert.ok(saved.intelligence.ingredients[0].product);
    const active = await req("/api/products", "b", {
      ...labelBody,
      perServing: {},
      otherNutrients: [{ name: "Creatine", amount: 5, unit: "g" }],
    });
    assert.equal(active.status, 201);
    assert.equal(
      (await req("/api/products/" + p.id, "a", undefined, "DELETE")).status,
      404,
    );
    assert.equal(
      (await req("/api/products/" + p.id, "b", undefined, "DELETE")).status,
      204,
    );
  } finally {
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
  }
});
