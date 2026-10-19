import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import express from "express";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import { meals } from "../shared/schema";
import { insertMealWithReceipt } from "../server/meal-save";
import { registerPlannerRoutes } from "../server/planner-routes";

test("meal retry recovers a committed save, rejects changed payloads and isolates accounts", async () => {
  const pg = new PGlite();
  await pg.exec(`CREATE TABLE meals (id varchar PRIMARY KEY DEFAULT gen_random_uuid(), user_id varchar NOT NULL,
    meal_text text NOT NULL, meal_type text, logged_at timestamp NOT NULL DEFAULT now(), nutritional_data jsonb,
    meal_context jsonb, intelligence jsonb, total_calories real, total_protein real, total_carbs real, total_fat real);`);
  const database = drizzle(pg);
  let analyses = 0;
  const store = {
    getMeal: async (id: string) => (await database.select().from(meals).where(eq(meals.id, id)))[0],
    insertMeal: (meal: any, receipt: any) => insertMealWithReceipt(database as any, meal, receipt),
    updateMeal: async (id: string, updates: any) => (await database.update(meals).set(updates).where(eq(meals.id, id)).returning())[0],
  };
  const app = express(); app.use(express.json());
  registerPlannerRoutes(app, ((req: any, res: any, next: any) => {
    req.session = { userId: req.get("x-user") };
    if (!req.session.userId) return res.sendStatus(401); next();
  }) as any, store as any, (async () => { analyses++; return { intelligence: {}, nutritionalData: [] }; }) as any);
  const server = app.listen(0, "127.0.0.1"); await new Promise<void>(r => server.on("listening", r));
  const root = `http://127.0.0.1:${(server.address() as any).port}`;
  const request = async (key: string | undefined, body: any, user = "a", path = "/api/meals", method = "POST") => {
    const response = await fetch(root + path, { method, headers: { "content-type": "application/json", "x-user": user, ...(key ? { "Idempotency-Key": key } : {}) }, body: JSON.stringify(body) });
    return { status: response.status, data: await response.json().catch(() => null) };
  };
  const body = { mealText: "Synthetic meal", mealType: "lunch", mealContext: { eatenAt: "2026-10-18T18:00:00.000Z", portion: "specified" } };
  try {
    const key = randomUUID();
    assert.equal((await request(key, body, "")).status, 401);
    assert.equal((await request("invalid", body)).status, 400);
    // Simulate the UI never receiving this successful response, then retry.
    const first = await request(key, body);
    assert.equal(first.status, 200);
    const replay = await request(key, body);
    assert.equal(replay.data.id, first.data.id); assert.equal(analyses, 1);
    assert.equal((await request(key, { ...body, mealText: "Changed meal" })).status, 409);
    const other = await request(key, body, "b");
    assert.equal(other.status, 200); assert.notEqual(other.data.id, first.data.id);
    assert.equal(other.data.userId, "b");
    // A correction preserves the original receipt and can never be overwritten by retry.
    const corrected = await request(undefined, { ...body, mealText: "Corrected meal" }, "a", `/api/meals/${first.data.id}`, "PUT");
    assert.equal(corrected.status, 200);
    assert.equal((await request(key, body)).data.mealText, "Corrected meal");
    const concurrentKey = randomUUID();
    const pair = await Promise.all([request(concurrentKey, body), request(concurrentKey, body)]);
    assert.ok(pair.every(r => r.status === 200)); assert.equal(pair[0].data.id, pair[1].data.id);
    assert.equal((await database.select().from(meals)).length, 3);
    // Clients without save references retain the existing distinct-entry behavior.
    const oldA = await request(undefined, body), oldB = await request(undefined, body);
    assert.notEqual(oldA.data.id, oldB.data.id);
  } finally {
    server.closeAllConnections(); await new Promise<void>(r => server.close(() => r())); await pg.close();
  }
});
