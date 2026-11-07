# Bloom — Product Owner Directive: Risk-Based, Change-Scoped Test Execution

**Date:** 2026-11-06  
**Authority:** Product Owner. Binding on all Codex engineering in `enhance/bloom-experience` and existing Render review preview.  
**Status:** Implementation/test operating policy; not proof of tests run, CI success or deployed SHA.

## Decision

**Optimize testing overhead without reducing coverage or reliability.** Use the smallest *sufficient* test set for each change, expand according to actual risk and dependency reach, and keep a full-suite checkpoint at major integrations, release candidates and high-risk changes. Do not remove, skip, mute, loosen, delete or silently rewrite existing tests merely to save runtime, CI usage, tokens or developer attention. No bypass of mandatory CI/security/contract checks.

### Validation matrix

| Change class | Required local validation | Escalation |
|---|---|---|
| **Level 1 — Ordinary isolated feature**: local screen, layout, narrow parser, component copy or domain-contained behavior | Relevant **focused unit/component tests**, **TypeScript checks**, and **applicable integration/actual workflow tests** for changed behavior; run build when appropriate for changed surface. Test source/unknown/error/correction/persistence where relevant. | Add broader subsystem tests when dependency analysis reveals shared callers or an unexpected failure. No automatic unchanged full regression just for isolated change. |
| **Level 2 — Shared boundary / cross-domain feature**: shared parser/schema/API/AI output, common food/activity source, multiple consumers, major UI composition or state/caching linkage | Level 1 **plus subsystem/integration tests for all affected producers and consumers**, source/version/negative/account cases, relevant build and actual UI/API→save→reload. | If impact spans core shared infrastructure, data ownership or auth, treat as Level 3; if a full suite was just completed on identical code/config, reuse that receipt rather than rerun for no reason. |
| **Level 3 — High risk or major integration checkpoint**: authentication, permissions, consent, privacy/account isolation, ownership, encryption/source deletion, migrations/schema, common infrastructure/CI, material dependencies; complete integrated milestones, release candidate | **Complete regression suite** (and applicable security/integration checks), plus focused and TypeScript/build validation. Run before RC and whenever new high-risk changes warrant it. | Fail closed for actual security/integrity regressions. Investigate exact failure, fix, then targeted rerun and full suite on changed code when necessary to establish green checkpoint. |

**Risk overrides size:** A one-line change to auth, migration, source deletion or shared validation can be Level 3. A large documentation-only change with no executable impact should not require broad runtime revalidation. The change classification is a brief developer judgment with concrete impacted paths, not a new committee.

### Effective coverage without repeated identical computation

- Maintain **every existing test** and ensure scheduled/checkpoint CI continues to execute all eligible cases. Never `skip`, `only`, `todo`, alter assertions, reduce fixture diversity or suppress known failures merely for speed. A test not executed in the current narrow run is still a maintained test and remains covered at required broad checkpoints.
- Once a **complete regression receipt for the exact code commit / equivalent tree + dependency lock / test configuration / environment** is recorded, do not repeat that unchanged suite without a known failure, nondeterministic investigation, materially changed environment/configuration or an explicit required new checkpoint. A new commit with an executable code or infrastructure change is not an unchanged commit.
- Test **affected behavior**, not only files. Shared schema and API changes require dependent consumer contract tests; auth/source ownership, report deletion and migrations justify full regression even if the diff appears small. Continue security/tenant/privacy adversarial checks where applicable.
- Keep short structured receipts: scope and risk level, tested SHA/tree/config, focused test names/counts/results, TS/build status, subsystem/full suite counts and elapsed time, environment (unit/browser/SQL/hosted/physical), material failures and exact CI/Render preview status. Use successful run evidence from existing CI where valid rather than duplicating local work automatically.
- On **success**, capture summary counts, elapsed time and meaningful differences; use concise reporter or shell summary and avoid dumping every passing case/log. On **failure**, read the specific failing case, assertion and relevant diagnostics; isolate and fix, rerun focused affected tests, then broaden only as required. Never repeatedly ingest or rerun whole unchanged logs to hunt a narrow failure.
- For flaky/nondeterministic behavior, identify the failing test and attempt history; do deliberate focused repeated runs with a reproducibility hypothesis, then appropriate broader confirmation, not arbitrary unbounded full-suite repeats.
- Practical optimization may include existing CI caching, test sharding or incremental TypeScript where **the required check remains equivalent**. Do not weaken TypeScript strictness, security coverage, database correctness, provider safety or browser workflow acceptance to reduce runtime.
- **No branch shortcut:** Remain on `enhance/bloom-experience`, preserve PR review and the existing Render development preview. Do not merge main, use live production databases, or suppress preview/CI checks to make testing cheaper. Publish one exact intended preview SHA when appropriate and avoid repeated polling of identical results.
- **Do not stop for a status report:** After a task passes its applicable evidence gate, commit/push and update the existing short task ledger, then immediately select the next approved task. Specialist agents review at the final integrated release gate; ordinary development doesn't wait for them.

### Examples

- Mobile spacing refinement in the Activity review panel: focused component + relevant accessible interaction checks, TypeScript; no unchanged 600+ full-suite rerun.
- Activity free-text parser that changes shared draft schema or save/interpretation boundaries: focused parsing corpus + Activity review/persistence/units, affected consumers, TS/build; if it changes shared source ownership, escalate full.
- Viome PDF coordinate parser change: focused exact layout manifests and upload→review→save→reload, related microbiome adapter/source integrity; full suite at major importer integration or source/storage boundary changes.
- Genetic consent, owner-bound deletion, authentication, migrations or cross-account data access changes: full regression and applicable adversarial/security tests.
- Release candidate or approved major v0.6 cross-domain ML integration: complete regression and relevant device/real-app/security checks at checkpoint, even when narrow local validation already passed.

## Conflict/supersession and enforcement

This directive reinforces `CODEX_ANTI_LOOP_EXECUTION_POLICY_2026-11-05.md`, `PRODUCT_ENGINEERING_RIGHT_FIRST_TIME_STANDARD_2026-11-06.md` and autonomous execution/final-gate rules. It **supersedes** any stale historical language requiring a complete suite after every ordinary commit or repeatedly rereading the same giant test output. It does **not** supersede explicitly mandatory CI/release/security tests or actual technical acceptance, and is not permission to mark unexecuted requirements as passing.

**Codex next:** Decide the risk class for the currently active code change, run the appropriate tests, capture concise receipts, commit/push existing development branch, verify the relevant CI/Render state and continue directly to the next approved task. No new owner approval or process-only sprint required.
