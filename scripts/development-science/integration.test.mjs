import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { Response } from "node-fetch";
import { createDevelopmentScienceClient, DevelopmentTransportUnavailable } from "./client.mjs";

test("existing Node caller -> authenticated ASGI -> real spawned MICOM -> validated result without sockets", {
  skip: !process.env.BLOOM_DEV_TEST_PYTHON,
  timeout: 60000,
}, async () => {
  const child = spawn(process.env.BLOOM_DEV_TEST_PYTHON,
    [fileURLToPath(new URL("./test-asgi-bridge.py", import.meta.url))], {
      env: { PATH: process.env.PATH, PYTHONNOUSERSITE: "1",
        ...(process.env.XDG_CACHE_HOME ? { XDG_CACHE_HOME: process.env.XDG_CACHE_HOME } : {}) },
      stdio: ["pipe", "pipe", "ignore"],
    });
  const waiting = [];
  const reader = createInterface({ input: child.stdout });
  reader.on("line", line => {
    const pending = waiting.shift();
    if (!pending) return;
    try { pending.resolve(JSON.parse(line)); } catch { pending.reject(Error("Invalid synthetic ASGI bridge response")); }
  });
  child.on("exit", () => { for (const pending of waiting.splice(0)) pending.reject(Error("Synthetic ASGI bridge unavailable")); });
  child.on("error", () => { for (const pending of waiting.splice(0)) pending.reject(Error("Synthetic ASGI bridge unavailable")); });
  child.stdin.on("error", () => { for (const pending of waiting.splice(0)) pending.reject(Error("Synthetic ASGI bridge unavailable")); });
  let calls = 0;
  async function transport(url, options) {
    calls++;
    const response = await new Promise((resolve, reject) => {
      waiting.push({ resolve, reject });
      child.stdin.write(JSON.stringify({ method: options.method, path: new URL(url).pathname,
        headers: options.headers, body: options.body ?? "" }) + "\n");
    });
    return new Response(response.body, { status: response.status, headers: { "content-type": "application/json" } });
  }
  const env = { BLOOM_RUNTIME_ENV: "development", BLOOM_LOCAL_SCIENCE_ENABLED: "true",
    BLOOM_DEV_MAC_CALLER_ENABLED: "true", BLOOM_DEV_MAC_URL: "https://synthetic-node.synthetic-tailnet.ts.net",
    BLOOM_DEV_TAILSCALE_PROXY_URL: "http://127.0.0.1:1055",
    ML_SERVICE_TOKEN: "synthetic-cross-language-ml-token-1234567890",
    BLOOM_DEV_SCIENCE_TOKEN: "synthetic-cross-language-science-token-1234567890" };
  const client = createDevelopmentScienceClient({ environment: env, transport });
  try {
    const before = calls;
    await assert.rejects(client.submitReference("unsupported"), DevelopmentTransportUnavailable);
    assert.equal(calls, before);
    const wrong = createDevelopmentScienceClient({ environment: { ...env,
      BLOOM_DEV_SCIENCE_TOKEN: "synthetic-wrong-science-token-1234567890" }, transport });
    await assert.rejects(wrong.submitReference("baseline"), DevelopmentTransportUnavailable);
    for (const scenario of ["baseline", "closed-medium"]) {
      const submitted = await client.submitReference(scenario);
      let terminal;
      const end = performance.now() + 25000;
      do {
        terminal = await client.referenceStatus(submitted.id);
        if (!["running", "cancelling"].includes(terminal.state)) break;
        // Each status uses a challenge plus the operation: respect the real
        // 60-request/minute authentication limit, never relax it for this test.
        await new Promise(resolve => setTimeout(resolve, 1000));
      } while (performance.now() < end);
      assert.equal(terminal.state, "completed");
      assert.equal(terminal.result.status, scenario === "baseline" ? "optimal" : "infeasible");
      assert.equal(terminal.result.personalUsePermitted, false);
      assert.equal(terminal.result.observedBiology, false);
      if (scenario === "baseline") assert.ok(terminal.result.tradeoffGrowthError <= 1e-5);
      else assert.equal(terminal.result.growthRate, null);
    }
  } finally {
    child.stdin.end();
    await new Promise(resolve => {
      if (child.exitCode !== null) { resolve(); return; }
      const timer = setTimeout(() => { child.kill("SIGKILL"); resolve(); }, 5000);
      child.once("exit", () => { clearTimeout(timer); resolve(); });
    });
    reader.close();
  }
});
