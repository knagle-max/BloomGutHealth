import test from "node:test";
import assert from "node:assert/strict";
import { chmod, lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { exportPrivateReference, PrivateExportUnavailable } from "./private-export.mjs";

const DEV = { BLOOM_RUNTIME_ENV: "development", BLOOM_LOCAL_SCIENCE_ENABLED: "true" };
const JOB = { id: "12345678-1234-4123-8123-123456789012", state: "completed",
  result: { version: "micom-reference-control-v1", scenario: "baseline", scope: "nonpersonal-engineering-control",
    observedBiology: false, clinicalValidation: false, predictiveValidation: false,
    status: "optimal", limitations: ["Synthetic test receipt; no numerical individual simulation output."] } };

async function temporary(t) {
  const root = await mkdtemp(join(tmpdir(), "bloom-private-export-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

test("completed reference exports only to private files with a digest and no overwrite", async t => {
  const root = await temporary(t), target = join(root, "private");
  const env = { ...DEV, BLOOM_DEV_PRIVATE_DIR: target };
  const first = await exportPrivateReference(JOB, env), second = await exportPrivateReference(JOB, env);
  assert.notEqual(first.path, second.path);
  assert.equal((await lstat(target)).mode & 0o777, 0o700);
  assert.equal((await lstat(first.path)).mode & 0o777, 0o600);
  const bytes = await readFile(first.path);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), first.sha256);
  assert.equal(bytes.length, first.bytes);
  assert.deepEqual(JSON.parse(bytes).job, JOB);
});

test("default/production, personal, incomplete and oversized records reject before creating directories", async t => {
  const root = await temporary(t), target = join(root, "never-created");
  for (const [job, env] of [[JOB, {}], [JOB, { ...DEV, NODE_ENV: "production" }],
    [{ ...JOB, state: "running" }, DEV], [{ ...JOB, result: { ...JOB.result, scope: "personal" } }, DEV],
    [{ ...JOB, result: { ...JOB.result, clinicalValidation: true } }, DEV],
    [{ ...JOB, result: { ...JOB.result, notes: "x".repeat(65536) } }, DEV]]) {
    await assert.rejects(exportPrivateReference(job, { ...env, BLOOM_DEV_PRIVATE_DIR: target }), PrivateExportUnavailable);
  }
  assert.deepEqual(await readdir(root), []);
});

test("repository roots, ignored subpaths and linked worktrees reject before writing", async t => {
  const root = await temporary(t);
  for (const kind of ["directory", "worktree-file", "bare"]) {
    const repo = join(root, kind); await mkdir(repo);
    if (kind === "directory") { await mkdir(join(repo, ".git")); await writeFile(join(repo, ".git", "HEAD"), "synthetic-only"); }
    if (kind === "worktree-file") await writeFile(join(repo, ".git"), "gitdir: synthetic-only\n");
    if (kind === "bare") { await writeFile(join(repo, "HEAD"), "synthetic-only"); await mkdir(join(repo, "objects")); await mkdir(join(repo, "refs")); }
    const target = join(repo, "ignored-private-folder");
    await assert.rejects(exportPrivateReference(JOB, { ...DEV, BLOOM_DEV_PRIVATE_DIR: target }), PrivateExportUnavailable);
    assert.equal((await readdir(repo)).includes("ignored-private-folder"), false);
  }
});

test("symlinks and permissive existing directories are refused without permission changes", async t => {
  const root = await temporary(t), target = join(root, "public");
  await mkdir(target); await chmod(target, 0o755);
  await assert.rejects(exportPrivateReference(JOB, { ...DEV, BLOOM_DEV_PRIVATE_DIR: target }), PrivateExportUnavailable);
  assert.equal((await lstat(target)).mode & 0o777, 0o755);
  const link = join(root, "link"); await symlink(target, link);
  await assert.rejects(exportPrivateReference(JOB, { ...DEV, BLOOM_DEV_PRIVATE_DIR: link }), PrivateExportUnavailable);
  assert.deepEqual(await readdir(target), []);
});

test("actual production environment cannot be bypassed with a passed development config", async t => {
  const root = await temporary(t), previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    await assert.rejects(exportPrivateReference(JOB, { ...DEV, BLOOM_DEV_PRIVATE_DIR: join(root, "private") }), PrivateExportUnavailable);
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
  assert.deepEqual(await readdir(root), []);
});
