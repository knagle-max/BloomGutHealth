import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadLocalEnv } from "../server/env";

test("Neon environment files load with host settings first, local override second and base file fallback", () => {
  const directory = mkdtempSync(join(tmpdir(), "bloom-env-"));
  const keys = [
    "BLOOM_ENV_TEST_HOST",
    "BLOOM_ENV_TEST_LOCAL",
    "BLOOM_ENV_TEST_FALLBACK",
  ];
  const previous = keys.map((key) => process.env[key]);
  try {
    writeFileSync(
      join(directory, ".env.local"),
      "BLOOM_ENV_TEST_HOST=local\nBLOOM_ENV_TEST_LOCAL=local\n",
    );
    writeFileSync(
      join(directory, ".env"),
      "BLOOM_ENV_TEST_HOST=base\nBLOOM_ENV_TEST_LOCAL=base\nBLOOM_ENV_TEST_FALLBACK=base\n",
    );
    process.env.BLOOM_ENV_TEST_HOST = "host";
    delete process.env.BLOOM_ENV_TEST_LOCAL;
    delete process.env.BLOOM_ENV_TEST_FALLBACK;
    loadLocalEnv(directory);
    assert.equal(process.env.BLOOM_ENV_TEST_HOST, "host");
    assert.equal(process.env.BLOOM_ENV_TEST_LOCAL, "local");
    assert.equal(process.env.BLOOM_ENV_TEST_FALLBACK, "base");
  } finally {
    rmSync(directory, { recursive: true, force: true });
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
  }
});
