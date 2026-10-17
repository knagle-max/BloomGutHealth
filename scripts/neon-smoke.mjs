import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { Pool } from "pg";

// Intentionally mutating: run only on the schema-only PR database, never production.
assert.equal(
  process.env.BLOOM_SMOKE_ISOLATED,
  "true",
  "Live tests require an explicitly isolated test database.",
);
assert.ok(
  process.env.DATABASE_URL && process.env.DATABASE_URL_UNPOOLED,
  "Neon pooled and direct URLs must be injected.",
);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED,
  max: 1,
});
const port = 4173;
const base = `http://127.0.0.1:${port}`;
const password = randomBytes(24).toString("base64url");
const users = [];
let processOutput = "";
const app = spawn(process.execPath, ["dist/index.js"], {
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
    RENDER: "true",
    SESSION_SECRET: randomBytes(48).toString("base64url"),
    PRECISION_DATA_KEY: randomBytes(32).toString("base64"),
    OPENAI_API_KEY: "",
    USDA_FDC_API_KEY: "",
    API_NINJAS_KEY: "",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
for (const stream of [app.stdout, app.stderr])
  stream.on("data", (chunk) => {
    processOutput = (processOutput + chunk).slice(-20000);
  });
let cookie = "";
async function request(path, method = "GET", body, expected = 200) {
  const response = await fetch(base + path, {
    method,
    headers: {
      "content-type": "application/json",
      "x-forwarded-proto": "https",
      ...(cookie ? { cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(30000),
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    assert.match(
      setCookie,
      /; Secure/i,
      "Production session cookie must remain secure behind the proxy.",
    );
    cookie = setCookie.split(";")[0];
  }
  // Never include bodies, credentials or URLs in failures/log output.
  assert.equal(
    response.status,
    expected,
    `${method} ${path} returned HTTP ${response.status}`,
  );
  return response.status === 204 ? null : response.json();
}
async function addUser() {
  cookie = "";
  const username = `neon-smoke-${randomBytes(8).toString("hex")}`;
  const { user } = await request("/api/auth/signup", "POST", {
    username,
    password,
  });
  users.push(user.id);
  assert.ok(cookie, "Production signup must set a session cookie.");
  assert.equal((await request("/api/auth/me")).user.id, user.id);
  return { ...user, cookie };
}
try {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (app.exitCode !== null)
      throw Error("Built app exited before becoming ready.");
    try {
      await fetch(base + "/api/auth/me", { signal: AbortSignal.timeout(1000) });
      break;
    } catch {
      if (attempt === 59)
        throw Error("Built app did not become ready within 30 seconds.");
      await delay(500);
    }
  }
  assert.equal(
    (await pool.query("SELECT 1 AS connected")).rows[0].connected,
    1,
  );
  console.log(
    "PASS: live Neon direct database connection and production app startup",
  );
  const first = await addUser();
  console.log(
    "PASS: signup, secure proxy cookie and PostgreSQL-backed session persistence",
  );
  const preferences = {
    dietaryPattern: "vegan",
    exclusions: ["seafood", "nuts"],
    dislikes: ["tofu"],
    goals: ["butyrate", "diversity"],
  };
  await request("/api/preferences", "PUT", preferences);
  assert.deepEqual((await request("/api/preferences")).dislikes, ["tofu"]);
  const meal = await request("/api/meals", "POST", {
    mealText: "45 g oats and 80 g blueberries",
    mealType: "breakfast",
    aiConsent: false,
    mealContext: {
      symptoms: { bloating: 0, energy: null, comfort: null, clarity: null },
    },
  });
  assert.equal(meal.totalCalories, null);
  assert.equal(
    (await request(`/api/meals/${first.id}`)).some((m) => m.id === meal.id),
    true,
  );
  await request(`/api/meals/${meal.id}`, "PUT", {
    mealText: "50 g oats and 80 g blueberries",
    mealType: "breakfast",
    aiConsent: false,
  });
  console.log(
    "PASS: saved preferences, meal create/read/update and unavailable nutrition",
  );
  const imported = await request("/api/microbiome/import", "POST", {
    bacteria_percentages: { "Ruminococcus bromii": 2, Bifidobacterium: 5 },
    testingCompany: "Synthetic CI lab",
    testDate: new Date().toISOString(),
  });
  assert.ok(imported.sampleId);
  await request("/api/precision/context", "PUT", {
    ageGroup: "adult",
    pregnancy: "no",
    safetyReviewed: true,
    goals: ["Lower ApoB"],
  });
  const now = new Date().toISOString();
  const genetic = await request(
    "/api/precision/records",
    "POST",
    {
      kind: "genetics",
      payload: {
        consent: true,
        provider: "23andMe",
        build: "GRCh37",
        strand: "+",
        collectedAt: now,
        calls: [
          {
            rsid: "rs1801133",
            chromosome: "1",
            position: 11856378,
            genotype: "AG",
          },
        ],
        scannedVariants: 1,
      },
    },
    201,
  );
  const lab = await request(
    "/api/precision/records",
    "POST",
    {
      kind: "lab",
      payload: {
        marker: "apob",
        value: 1.2,
        unit: "g/L",
        measuredAt: now,
        laboratory: "Synthetic CI lab",
        method: "CI assay",
        fasting: "yes",
        referenceLow: 0.3,
        referenceHigh: 1,
        notes: "Synthetic test only",
      },
    },
    201,
  );
  const measured = await request(
    "/api/precision/records",
    "POST",
    {
      kind: "metabolite",
      payload: {
        name: "butyrate",
        value: 5,
        unit: "mmol/kg",
        specimen: "stool",
        measuredAt: now,
        laboratory: "Synthetic CI lab",
        method: "CI assay",
      },
    },
    201,
  );
  const report = await request("/api/precision");
  assert.equal(
    report.genetics.findings.find((f) => f.rsid === "rs1801133").genotype,
    "AG",
  );
  assert.equal(report.labs[0].flag, "above reported range");
  assert.equal(report.microbiome.report.id, imported.sampleId);
  assert.equal(report.microbiome.measuredMetabolites[0].id, measured.id);
  assert.ok(report.recommendations.length && report.foods.length);
  assert.ok(
    report.recommendations.every((m) =>
      m.ingredients.every(
        (i) =>
          !i.tags.some((t) =>
            ["meat", "dairy", "eggs", "seafood", "nuts"].includes(t),
          ),
      ),
    ),
  );
  const encrypted = (
    await pool.query(
      "SELECT encrypted_payload FROM precision_records WHERE id = $1",
      [genetic.id],
    )
  ).rows[0].encrypted_payload;
  assert.equal(encrypted.version, 1);
  assert.equal(Object.hasOwn(encrypted, "calls"), false);
  assert.equal(JSON.stringify(encrypted).includes("rs1801133"), false);
  console.log(
    "PASS: live report import, encrypted genetics/labs/metabolites and personalized eligible foods/meals",
  );
  const plan = await request(
    "/api/precision/plans",
    "POST",
    { name: "Synthetic CI plan" },
    201,
  );
  await request(
    "/api/precision/records",
    "POST",
    {
      kind: "checkin",
      payload: {
        measuredAt: now,
        weightKg: 90,
        bodyFatPercent: null,
        waistCm: null,
        bloating: 0,
        energy: null,
        adherencePercent: 80,
        planId: plan.id,
        notes: "Synthetic CI check-in",
      },
    },
    201,
  );
  assert.equal((await request("/api/precision")).checkins[0].bloating, 0);
  const second = await addUser();
  assert.equal((await request("/api/precision")).labs.length, 0);
  await request(`/api/precision/records/${lab.id}`, "DELETE", undefined, 404);
  cookie = first.cookie;
  await request(`/api/precision/records/${lab.id}`, "DELETE", undefined, 204);
  assert.equal((await request("/api/precision")).plans.length, 0);
  await request(`/api/meals/${meal.id}`, "DELETE", {});
  await request("/api/auth/logout", "POST", {});
  cookie = "";
  await request("/api/precision", "GET", undefined, 401);
  await request("/api/auth/login", "POST", {
    username: first.username,
    password,
  });
  assert.equal((await request("/api/auth/me")).user.id, first.id);
  assert.notEqual(first.id, second.id);
  console.log(
    "PASS: plan/check-in persistence, account isolation, transactional source deletion and logout/login",
  );
} catch (error) {
  // Keep captured application output private: it can contain signed cookies or URLs.
  console.error("FAIL:", error.message);
  process.exitCode = 1;
} finally {
  app.kill("SIGTERM");
  await new Promise((resolve) => {
    if (app.exitCode !== null) resolve();
    else {
      app.once("exit", resolve);
      setTimeout(() => {
        app.kill("SIGKILL");
        resolve();
      }, 3000).unref();
    }
  });
  try {
    for (const id of users) {
      await pool.query("BEGIN");
      try {
        await pool.query("DELETE FROM session WHERE sess->>'userId' = $1", [
          id,
        ]);
        await pool.query(
          "DELETE FROM recommendations WHERE sample_id IN (SELECT id FROM microbiome_samples WHERE user_id=$1)",
          [id],
        );
        await pool.query(
          "DELETE FROM health_impacts WHERE metabolite_id IN (SELECT id FROM metabolites WHERE sample_id IN (SELECT id FROM microbiome_samples WHERE user_id=$1))",
          [id],
        );
        for (const table of [
          "metabolites",
          "bacterial_composition",
          "ml_analyses",
        ])
          await pool.query(
            `DELETE FROM ${table} WHERE sample_id IN (SELECT id FROM microbiome_samples WHERE user_id=$1)`,
            [id],
          );
        for (const table of [
          "precision_records",
          "precision_profiles",
          "meals",
          "microbiome_samples",
        ])
          await pool.query(`DELETE FROM ${table} WHERE user_id=$1`, [id]);
        await pool.query("DELETE FROM users WHERE id=$1", [id]);
        await pool.query("COMMIT");
      } catch {
        await pool.query("ROLLBACK");
        throw Error("Synthetic test-data cleanup failed.");
      }
    }
    if (users.length)
      console.log("PASS: synthetic test accounts and records cleaned up");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
  await pool.end();
}
