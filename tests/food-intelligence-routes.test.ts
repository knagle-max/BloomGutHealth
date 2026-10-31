import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { registerExperienceRoutes } from "../server/experience-routes";
import { buildBiologicalRegistry } from "../shared/biological-model";
import { buildPrecisionReport, contextSchema } from "../shared/precision-nutrition";
import { preferenceSchema } from "../shared/meal-intelligence";
import { experienceSettingsSchema } from "../shared/experience";
import { weeklyRequestSchema } from "../shared/weekly-planner";

test("daily choices load one validated registry and degrade to nutrient-only suggestions when it fails", async () => {
  const preferences = preferenceSchema.parse({ cookingMinutes: 60 });
  const report = buildPrecisionReport([], contextSchema.parse({ ageGroup: "adult", pregnancy: "no", safetyReviewed: true }), preferences, null);
  const request = weeklyRequestSchema.parse({ days: 1, targets: { calories: 2200, protein: 100, fiber: 30, fiberMaximum: 45, sodium: 2300, saturatedFat: 20 } });
  const registry = { ...buildBiologicalRegistry(), version: "route-registry-fixture" };
  let calls = 0, unavailable = false;
  const checkAccount = (id: string) => { assert.equal(id, "synthetic-own-account"); };
  const store = {
    getExperienceSettings: async (id: string) => { checkAccount(id); return experienceSettingsSchema.parse({ practical: { minutes: 60 } }); },
    getUser: async (id: string) => { checkAccount(id); return { dietaryPreferences: preferences }; },
    getMeals: async (id: string) => { checkAccount(id); return []; },
    getBiologicalRegistry: async () => { calls++; if (unavailable) throw Error("Registry unavailable"); return registry; },
  };
  const precision = {
    reportFor: async (id: string) => { checkAccount(id); return report; },
    todayPlanFor: async (id: string) => { checkAccount(id); return { status: "suggestions", slots: ["dinner"], request }; },
  };
  const app = express(); app.use(express.json());
  registerExperienceRoutes(app, ((req: any, _res: any, next: any) => { req.session = { userId: "synthetic-own-account" }; next(); }) as any, store as any, precision as any);
  const server = app.listen(0, "127.0.0.1"); await new Promise<void>(resolve => server.on("listening", resolve));
  const root = `http://127.0.0.1:${(server.address() as any).port}`;
  const body = { date: "2026-10-18", timezoneOffset: 360, hour: 17 };
  const choices = () => fetch(root + "/api/experience/day-choices", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  try {
    const linked = await choices(); assert.equal(linked.status, 200);
    const result = await linked.json(); assert.equal(calls, 1); assert.equal(result.biologyAvailable, true);
    assert.ok(result.choices.length > 0); assert.ok(result.choices.every((choice: any) => choice.biologyVersion === registry.version));
    unavailable = true;
    const degraded = await choices(); assert.equal(degraded.status, 200);
    const fallback = await degraded.json(); assert.equal(calls, 2); assert.equal(fallback.biologyAvailable, false);
    assert.ok(fallback.choices.length > 0); assert.ok(fallback.choices.every((choice: any) => choice.biologyVersion === null && !choice.relationshipIds.length));
    assert.match(fallback.note, /temporarily unavailable/);
  } finally {
    server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
