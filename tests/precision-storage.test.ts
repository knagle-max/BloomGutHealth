import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { PrecisionStorage } from "../server/precision-storage";
import { contextSchema } from "../shared/precision-nutrition";
import { defaultPreferences } from "../shared/meal-intelligence";

test("PostgreSQL migration and encrypted precision persistence enforce ownership and transactional deletion", async () => {
  const client = new PGlite();
  const previousKey = process.env.PRECISION_DATA_KEY;
  process.env.PRECISION_DATA_KEY = randomBytes(32).toString("base64");
  try {
    await client.exec(
      "CREATE TABLE users (id varchar PRIMARY KEY, dietary_preferences jsonb); INSERT INTO users(id) VALUES ('a'),('b');",
    );
    const migration = readFileSync(
      new URL("../migrations/0002_precision_nutrition.sql", import.meta.url),
      "utf8",
    );
    await client.exec(migration);
    await client.exec(migration); // Safe to apply again to an existing database.
    const store = new PrecisionStorage(drizzle(client) as any);
    const context = contextSchema.parse({ ageGroup: "adult", pregnancy: "no" });
    await store.putPrecisionContext("a", context);
    assert.deepEqual(await store.getPrecisionContext("a"), context);
    assert.equal(await store.getPrecisionContext("b"), undefined);
    await store.putPrecisionContext("a", { ...context, goals: ["ApoB"] });
    assert.deepEqual(((await store.getPrecisionContext("a")) as any).goals, [
      "ApoB",
    ]);
    const lab = await store.insertPrecisionRecord("a", "lab", {
      marker: "ldl",
      value: 4,
    });
    const plan1 = await store.insertPrecisionRecord("a", "plan", {
      name: "One",
    });
    const plan2 = await store.insertPrecisionRecord("a", "plan", {
      name: "Two",
    });
    await store.insertPrecisionRecord("b", "lab", { marker: "ldl", value: 2 });
    assert.equal((await store.getPrecisionRecords("a")).length, 3);
    const weekly = {
      type: "weekly-plan",
      inputGuard: {
        context: { ...context, goals: ["ApoB"] },
        preferences: defaultPreferences,
        sourceRecordIds: [lab.id],
      },
    };
    const savedWeekly = await store.insertPrecisionRecord("a", "plan", weekly);
    await store.putPrecisionContext("a", {
      ...context,
      goals: ["Changed while calculating"],
    });
    await assert.rejects(
      () => store.insertPrecisionRecord("a", "plan", weekly),
      /PRECISION_INPUTS_CHANGED/,
    );
    await store.deletePrecisionRecord("a", savedWeekly.id);
    assert.equal(await store.deletePrecisionRecord("b", lab.id), false);
    const rows = await client.query(
      "SELECT encrypted_payload FROM precision_records",
    );
    assert.ok(rows.rows.every((r) => !JSON.stringify(r).includes("marker")));
    await store.deletePrecisionRecord("a", plan1.id);
    assert.ok(
      (await store.getPrecisionRecords("a")).some((r) => r.id === plan2.id),
    );
    await store.deletePrecisionRecord("a", lab.id);
    assert.equal((await store.getPrecisionRecords("a")).length, 0);
    await store.insertPrecisionRecord("a", "checkin", { weightKg: 90 });
    await store.clearPrecisionData("a");
    await assert.rejects(
      () => store.insertPrecisionRecord("a", "plan", weekly),
      /PRECISION_INPUTS_CHANGED/,
    );
    assert.equal(await store.getPrecisionContext("a"), undefined);
    assert.equal((await store.getPrecisionRecords("b")).length, 1);
    await assert.rejects(() =>
      store.insertPrecisionRecord("a", "invalid-kind", {}),
    );
  } finally {
    await client.close();
    if (previousKey === undefined) delete process.env.PRECISION_DATA_KEY;
    else process.env.PRECISION_DATA_KEY = previousKey;
  }
});
