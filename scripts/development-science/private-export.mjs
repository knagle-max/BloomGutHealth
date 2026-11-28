/** Local operator export, never an HTTP/LLM file-writing tool or public release.
 * Only completed fixed reference controls; no logs, Git writes or account reads.
 */
import { constants } from "node:fs";
import { lstat, mkdir, open, realpath } from "node:fs/promises";
import { dirname, isAbsolute, join, parse } from "node:path";
import { createHash, randomUUID } from "node:crypto";

const JOB = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export class PrivateExportUnavailable extends Error {
  constructor() { super("Private reference export is unavailable."); }
}
function refuse() { throw new PrivateExportUnavailable(); }
async function exists(path) {
  try { return await lstat(path); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
async function rejectRepository(path) {
  let current = path;
  for (;;) {
    const marker = await exists(join(current, ".git"));
    // An empty unrelated .git directory is not a repository. A gitfile,
    // symlink/unknown marker, or actual Git metadata fails closed.
    const gitMetadata = marker && (!marker.isDirectory()
      || await exists(join(current, ".git", "HEAD"))
      || await exists(join(current, ".git", "objects"))
      || await exists(join(current, ".git", "commondir")));
    if (parse(current).base === ".git" || gitMetadata
        || (await exists(join(current, "HEAD")) && await exists(join(current, "objects"))
            && await exists(join(current, "refs")))) refuse();
    const stat = await exists(current);
    if (stat?.isSymbolicLink()) refuse();
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
}

export async function exportPrivateReference(job, environment = process.env) {
  let handle;
  try {
    if (environment.BLOOM_RUNTIME_ENV !== "development" || environment.BLOOM_LOCAL_SCIENCE_ENABLED !== "true"
        || environment.NODE_ENV === "production" || process.env.NODE_ENV === "production"
        || process.env.BLOOM_RUNTIME_ENV === "production") refuse();
    if (!job || !JOB.test(job.id) || job.state !== "completed"
        || job.result?.version !== "micom-reference-control-v1"
        || !["baseline", "closed-medium"].includes(job.result.scenario)
        || job.result.scope !== "nonpersonal-engineering-control" || job.result.observedBiology !== false
        || job.result.clinicalValidation !== false || job.result.predictiveValidation !== false) refuse();
    const target = environment.BLOOM_DEV_PRIVATE_DIR;
    if (typeof target !== "string" || !isAbsolute(target) || target.split(/[\\/]/).includes("..")) refuse();
    // Check before mkdir as well as after resolving to prevent accidental writes
    // under a repository, including ignored paths and linked worktrees.
    await rejectRepository(target);
    const body = JSON.stringify({ version: "private-reference-export-v1", exportedAt: new Date().toISOString(), job }) + "\n";
    if (Buffer.byteLength(body) > 65536) refuse();
    await mkdir(target, { recursive: true, mode: 0o700 });
    const directory = await realpath(target);
    await rejectRepository(directory);
    const stat = await lstat(directory);
    if (!stat.isDirectory() || (stat.mode & 0o077) !== 0 || stat.uid !== process.getuid()) refuse();
    const path = join(directory, `reference-${job.id}-${randomUUID()}.json`);
    handle = await open(path, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    await handle.writeFile(body, "utf8");
    await handle.sync();
    await handle.close(); handle = null;
    return { path, bytes: Buffer.byteLength(body), sha256: createHash("sha256").update(body).digest("hex") };
  } catch { refuse(); }
  finally { if (handle) await handle.close(); }
}
