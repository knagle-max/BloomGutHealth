# Private reference results, maintenance and recovery

Development only. No personal records or clinical outputs are accepted. There is
no service deployment, scheduled job, launchd installation or automatic restart.
Autostart is not intended during this validation phase. The production app must
continue working with every Mac component stopped.

## Saving a completed reference control

The supervisor holds at most sixteen ephemeral jobs in memory. Restart loses job
status/results; it does not restore experiments. A completed result already carries
the fixed model digest, library/solver versions, implementation file digests,
scenario, medium bounds, numerical checks and limitations. These identify the
executed control; they do not establish biological/predictive validity.

`exportPrivateReference(completedJob, environment)` is a local operator helper,
not an HTTP endpoint or LLM file tool. It requires explicit development identity
and local-science opt-in; actual production identity cannot be overridden.
Configure `BLOOM_DEV_PRIVATE_DIR` to an absolute private directory outside **any**
Git repository, for example `$HOME/bloom-science/private-results` on the Mac.
Do not place it under the checkout, even in an ignored folder. This variable
contains a directory path, never a credential or model-generated filename.

The helper creates missing directories with mode 0700, refuses a permissive or
wrong-owner existing directory, and never changes existing directory permissions.
Git/worktree/bare repository paths and symlinks are rejected. New bounded JSON
files use unpredictable names, exclusive creation and mode 0600. Each export
returns a byte count and SHA256 receipt for the exact file; it never prints the
record, credentials or model output and does not overwrite previous exports.

Example inside trusted development code, after a separately approved synthetic
network test or an offline reference job:

```js
import { exportPrivateReference } from './scripts/development-science/private-export.mjs';
const receipt = await exportPrivateReference(completedJob, process.env);
// Keep receipt and result private. Do not console.log records or upload artifacts.
```

This is owner-only filesystem storage, **not encryption or E2EE**. No private
health processing permission follows from a scope label, receipt or file digest.
Do not add exports to Git, GitHub issues/PRs, CI logs/artifacts or telemetry.

## Backup and recovery

- Keep the exported file and its checksum receipt together in private storage.
  Use an owner-approved encrypted backup destination. Verify encryption/access
  settings; the helper does not enable FileVault, Time Machine or a cloud service.
- Restore a copy outside Git, retaining restrictive ownership/permissions.
  Recompute SHA256 locally and compare with the trusted saved receipt before
  using it. A mismatch is corruption/tampering or the wrong file, not a reason to
  silently replace the expected checksum. Never paste results/checksums into CI.
- An export is a historical research snapshot. It does not recreate an active
  job, update a Bloom account, install a model, satisfy scientific review or
  promote a claim into the shared knowledge graph. Reruns need their recorded
  model/code/library versions and source-qualified conditions; preserve failures
  and unknowns rather than substituting zeros.
- If the parent restarts before export, state is lost. Submit a new explicitly
  authorized synthetic control; do not claim the old job resumed. Gateway HTTP
  timeout does not prove Ollama stopped computation or released GPU memory.

## Maintaining the isolated environments

Keep the owner's working `.venv312` unchanged while testing dependency updates in
a disposable sibling environment. Check installation, solver status, reference
hash, repeated objective/residual bounds and negative controls before adoption.
Keep model/data/software licences and local-only Ollama configuration separately
verified. Do not auto-pull models or change the allowlist after a failed request.

Back up required reviewed source/model/version metadata separately from secrets.
Keep credentials in the existing private secret mechanism, rotate/revoke only
with appropriate authorization, and verify restore permissions without printing
their contents. No paid storage or production security changes are made here.

Actual Apple Silicon, VPN identity, TLS rejection, network outage/recovery,
Ollama cloud-disable/cancellation and independent scientific validation remain
separate unperformed checks. Before any commit/push, repeat stable staged/history
privacy checks and obtain the explicit approval required by the owner.
