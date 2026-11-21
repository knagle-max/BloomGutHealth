# Bloom — Scientific Computing Infrastructure: Consolidated Chief Architect Decision

**Date:** 2026-11-16  
**Architect disposition:** APPROVED WITH TARGETED REFINEMENTS — implementation contract, not proof of deployment  
**Owner request:** SCI-INFRA-01, SCI-INFRA-02, SCI-INFRA-03 — strengthen existing roadmap, preserve current stack  
**Source handoff:** `Bloom_Integration_Scientific_Computing_Infrastructure_Review_2026-11-16.md`, document `INT-SCI-INFRA-20261116-R1`, 106 lines, reviewed directly. Specialist read branch snapshot `65035f8b54c438a3ad1814f42a2ceda597d4a6c5`.  
**Authoritative execution policy:** `AGENTS.md` then `NEXT_ACTIONS.md`. This decision is an approved future/current-scope dependency refinement, **not** a competing task selector or authorization to stop active Core.  
**Related architecture:** `V06_HANDOFF.md` ENG-EVOL-05/06/08, V06-13/17/18, C0/C1/C2; `V06_CORE_ADVANCED_EXECUTION_CLASSIFICATION_20261114.md`; `BLOOM_GENERALIZED_BIOLOGICAL_INTELLIGENCE_ARCHITECT_DECISION_20261116.md`; `PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md`. Reuse current contracts and ownership; do not duplicate their execution authority.

## 1. Executive decision and preservation

**Approve all three SCI-INFRA requirements within existing modules.** Retain React, TypeScript, Express, Neon PostgreSQL, Render, Python/FastAPI and the existing modular monolith. Do not migrate technology, create another biological intelligence/evidence/consent/recommendation platform, or mandate Redis/Kubernetes/external broker/paid GPU/workers. Codex must inspect current HEAD, source paths, migrations, existing task/outbox/scheduler utilities and real Render instances **before** deciding what new objects are necessary. The shortest adequate solution is preferred.

- `SCI-INFRA-01` → existing `ENG-EVOL-06` failure isolation/recovery: introduce durable, owner/purpose-scoped, idempotent job execution only when required beyond existing proven facilities.
- `SCI-INFRA-02` → source revisions, source lifecycle, adaptive guidance, `BIO-ABD-01/03/04/06/08/14`, related `V06-13/17` and Food/Today #12/Response #15: dependency-aware event and publication authorization.
- `SCI-INFRA-03` → `ENG-EVOL-08` performance/cost envelopes and `ENG-EVOL-05` observability: cap and benchmark scientific workloads; isolate only as justified.

**Sequencing:** Continue current `NEXT_ACTIONS.md` execution first. Protect Core C0 data/consent/source correctness at any asynchronous publication boundary. Implement the minimum shared durable substrate at the first actual event-driven analysis requiring it; do not introduce a generic job platform before there is a source-driven integration path and test case. v0.7 generalized discovery uses this substrate after Core. Reference/synthetic Python scientific modeling may continue independently under existing restricted research decisions. No new owner approval checkpoint for routine safe engineering; actual new paid/production-sensitive activities retain existing gates.

## 2. Source audit, current capabilities and evidence limitations

The Integrations review and repository source inspection identify:

| Existing code | Observed behavior | What it does NOT prove |
|---|---|---|
| `server/weekly-worker.ts` | Node worker thread runs `buildWeeklyPlan` and returns success/error | No persistent queue, claim lease, recovery after process crash |
| `server/ml-service.ts` | Endpoint allowlist, restricted service URL, no browser auth/cookies forwarding, 30-second timeout, 5MB response cap | No persisted job, shared concurrency/fencing, request-body/cost guarantee |
| `server/metabolite-research.ts` | Configured research endpoint, 25-second timeout, 256KB response cap and `active < 2` in-process limit | Counter does not coordinate multiple processes; timeout need not terminate backend compute |
| `server/analysis-boundary.ts` | Withholds unsupported legacy personalized microbial metabolites/effects/advice | A future async writer could bypass this unless publication uses canonical scientific eligibility |
| Canonical source/evidence/action records | Existing source revisions and safety/claim foundations | A fully generalized transitive async dependency graph and publication gate remain unverified |

This is a **source-based assessment only**. The reviewer did **not** inspect actual Neon job tables or verify Render worker deployment, distributed race tests, Python stress benchmarks, or completed SCI-INFRA functionality. Do not claim an absent table/service just because inspected modules did not show one. Codex must first inventory. New requirement status: `ARCHITECT_ACCEPTED`, `NOT_VERIFIED_IMPLEMENTED`, `NOT_VERIFIED_HOSTED`, `NOT_INDEPENDENTLY_APPROVED`.

## 3. SCI-INFRA-01 — Durable analytical execution

### Required behavior
- Server derives account, purpose, access and consent from authenticated context; no caller-supplied owner is trusted.
- Source change and necessary trigger are committed atomically, preferably same DB transaction; otherwise use durable transactional outbox with revision reconciliation; never rely on fire-and-forget in-memory callbacks.
- Jobs are idempotent across retry, duplicate import, concurrent enqueue and request restarts. At-least-once compute is acceptable; **one effective visible receipt** per permitted current revision.
- Claim atomically with `FOR UPDATE SKIP LOCKED` or equivalent PostgreSQL compare-and-set; lease token/fencing generation prevents old worker publishing after a lease expires. Heartbeat and reclaim are bounded.
- State: queued, leased/running, succeeded, retryable failure, terminal failure, superseded, cancelled. Persist versioned method/analysis type, trigger reason, bounded attempt count, next due time, lease expiry, evidence/source snapshot digest and minimized result reference—not original private PDFs or health fields.
- Backoff/retry classified transient failures only; permanent validation/consent/unsupported methods terminate. Failure state is explainable and safe; no sensitive exception text in public API/logs.
- Source deletion, consent revocation, account erasure or scientific evidence withdrawal prohibit further worker read/publish and invalidate accessible derived results subject to approved data retention.

**Implementation decision:** Extend existing canonical scheduler/outbox/ledger if sufficient; only if absent or inadequate, introduce one narrow Postgres job/outbox mechanism with tested additive migration on an authorized isolated database, no extra external infrastructure.

### Illustrative TypeScript job contract (adapt to existing schemas, not a competing record store)
```ts
type ScientificJobState =
  | "queued" | "leased" | "succeeded"
  | "failed_retryable" | "failed_terminal"
  | "superseded" | "cancelled";

type ScientificJobEnvelope = {
  jobId: string;                    // server generated
  ownerScope: string;               // server derived; never caller trusted
  purpose: string;                  // permitted analytical use
  analysisType: string;
  methodVersion: string;
  triggerKind: string;
  sourceRevisionDigest: string;     // not a substitute for authoritative dependencies
  evidenceRevision: string;
  consentEpoch: string;
  payloadRef: string | null;        // private minimized reference, not raw health upload
  state: ScientificJobState;
  attempts: number;
  maxAttempts: number;
  nextRunAt: string | null;
  leaseToken: string | null;
  leaseExpiresAt: string | null;
  idempotencyKey: string;            // owner+purpose+revisions+method+evidence
  resultRef: string | null;
  errorClass: string | null;
  createdAt: string;
  updatedAt: string;
};
```
Client API must never expose `ownerScope`, token, lease, sensitive references, or internal diagnostic data as public selectable authorities.

## 4. SCI-INFRA-02 — Source-dependent automatic reevaluation

- Use canonical observations, evidence claims, goal/consent/restriction versions and derived source receipts to track **precise** dependencies `source → feature → finding → approved action/recommendation projection`. Do not create another health ledger, knowledge graph or evidence-approval system.
- On import, correction, deletion, consent change, evidence withdrawal or model/rule supersession, mark only dependent current derivations stale and queue eligible recomputations; unaffected findings retain their stable receipt.
- Invalidation is urgent; recomputation may be coalesced/debounced/budgeted where allowed. Never delay permission revocation to wait for compute.
- No new point automatically authorizes a statistical run. Use method preflight, sufficient independent information, quality and resource limits from the v0.7 discovery contract.
- **Publication race condition:** Recheck current owner/purpose consent epoch, exact source/evidence revision dependency set, method release tier, allowed action/evidence status and current lease fencing token **inside the transactional publication gate**. A stale worker must lose; a successful response outside this transaction is not sufficient authorization.
- Read APIs, caches, exports, notifications and Today priority selection also filter current stale/retracted/unauthorized findings. Never let a delayed worker revive an erased or withdrawn finding.
- Historical source history and permissible old decision receipts remain versioned, but withdrawn information is not ordinary active personal guidance. User choices are not proof that an action was performed; performed actions are not causal proof of outcome.

### Illustrative dependency and publication contract
```ts
type AnalysisDependency = {
  kind: "observation" | "feature" | "evidence-claim" | "goal"
      | "restriction" | "consent" | "method-release";
  id: string;
  revision: string;
};

type CandidateAnalysisReceipt = {
  jobId: string;
  methodId: string;
  methodVersion: string;
  dependencies: AnalysisDependency[];
  outputClass: "descriptive" | "exploratory" | "research-only";
  limitations: string[];
  resultRef: string | null;
};

async function publishOnlyIfCurrent(
  authenticatedServerScope: AuthenticatedScope,
  claim: ScientificJobClaim,
  candidate: CandidateAnalysisReceipt
) {
  // Illustrative only; implement using existing transaction, source, evidence,
  // action, account/permission and lease/fencing services.
  return transaction(async tx => {
    await assertCurrentLeaseAndOwner(tx, authenticatedServerScope, claim);
    await assertCurrentSourceAndEvidenceRevisions(tx, candidate.dependencies);
    await assertConsentAndPurposeCurrent(tx, authenticatedServerScope);
    await assertScientificOutputEligibility(tx, candidate);
    // Guarded compare-and-set/unique visible receipt in this same transaction:
    return publishIdempotentEligibleResult(tx, candidate);
  });
}
```

### Dependency invalidation acceptance
- Correct source timestamp so prior exposure becomes post-outcome: retraction/abstention, not reverse-causal attribution.
- Delete or revoke observation after a job was dispatched, before completion: old candidate denied.
- Change one source for finding A, not B: A invalidated/recomputed; B unchanged.
- Update evidence claim during compute: withdrawn action cannot remain active.
- Duplicate source event/repeated revisions: no duplicated visible insight or unbounded compute.

## 5. SCI-INFRA-03 — Scientific workload isolation and performance

Keep Express authoritative for authentication, authorization, source/canonical data, evidence/action eligibility, safe publication and user-facing response. Python/FastAPI is a bounded statistical/optimization/molecular **compute** executor only. Public research/source APIs are not personal medical data processors by default.

- Choose execution venue by benchmark: small bounded Node calculation/worker thread; heavier Python behind private authenticated service; independent worker process/Render deployment only when proven necessary. **Do not assume a synchronous 25/30-second HTTP timeout equals a durable job.**
- Per method define input dimension/numeric ceilings, bytes, CPU/memory targets, timeout, concurrency per account/overall, queue cap, retry budget, cost budget and cancellation semantics. Choose thresholds from reproducible realistic synthetic/reference benchmarks, not invented SLAs.
- Do not forward cookies, full genome or medical PDFs, or unnecessary sensitive context to Python/external providers. Python should not have broad Neon credentials; use minimized, authenticated payloads and private transport.
- A transport timeout does not guarantee backend work stopped. Lease fencing and output authorization still determine whether a late result can be published; bound backend costs separately.
- Measure p50/p95 interactive Food, Today and Labs latency under 0/1/N analysis jobs, worker memory peak/RSS, CPU time, queue age, job duration, succeeded/retried/terminal/superseded counts, per-user fairness, source/evidence eligibility misses, request/response sizes and attributable compute cost.
- Preserve safe deterministic Food, Today, Bloodwork and simple Progress when the Python/ML/LLM service is slow, down, unauthorized or too expensive. Do not promise user-visible continuous background tracking until triggered execution is demonstrated.

## 6. End-to-end event path — conceptual, not existing code

```ts
async function onCanonicalSourceRevision(
  actor: AuthenticatedScope,
  change: SourceRevision
) {
  await withOwnerScopedTransaction(actor, async tx => {
    await commitCanonicalSourceRevision(tx, change);
    await invalidateDependentCurrentReceipts(tx, change);
    await enqueueOrOutboxEligibleReevaluation(tx, {
      owner: actor,                 // authority is server derived
      sourceRevision: change,
      purpose: "own-account-guidance"
    });
  });
  // Workers claim durable work separately; no open HTTP response waits for models.
}

async function executeLeasedAnalysis(claim: LeasedScientificJob) {
  const current = await loadMinimizedAuthorizedCurrentInputs(claim);
  if (!current.eligible) return supersedeOrAbstain(claim, current.reason);
  const output = await runBudgetedRegisteredAnalysis(current);
  return publishOnlyIfCurrent(current.actor, claim, output);
}
```

Functions are architectural boundaries, **not instructions to introduce duplicate engines/services**. Map to existing storage, routes, source revisions, worker adapters and authorization before creating code.

## 7. Mandatory verification matrix — preserve specialist 12 cases

| ID | Test | Required proof |
|---|---|---|
| SCI-T01 | Save new source; close HTTP; eligible job dispatched automatically | Atomic event/job receipt and current result or reason-coded abstention |
| SCI-T02 | Crash after claim; worker restarts | Lease reclamation, bounded attempts, single effective visible receipt |
| SCI-T03 | Two simultaneous claimants + forced old worker completion | Only one current lease/fence may publish |
| SCI-T04 | Source corrected/deleted/revoked mid-computation | No stale API/UI/cache/notification output |
| SCI-T05 | Unrelated source branch changed | Unaffected finding revision/receipt unchanged |
| SCI-T06 | Two accounts; consent revoked/account erased during queue/job | No cross-user read/calculate/emit/log/notify |
| SCI-T07 | Study/evidence retracted while worker active | Current evidence revision denies old result/action |
| SCI-T08 | Python unavailable/expensive workload | Bounded service behavior, measured Food/Today/Labs latency + fallback |
| SCI-T09 | Duplicate import and three rapid revisions | Coalescing/idempotency and bounded queue size |
| SCI-T10 | Unsupported assay/missing data/research-only outputs | Honest abstention; no personalized claim/action bypass |
| SCI-T11 | Historical source reprocessed under new version | New versioned result, no silently rewritten old receipt |
| SCI-T12 | Source commit succeeds but dispatcher dies | Durable outbox/reconciliation repairs missed trigger |

**Extra integration checks:** method preflight/negative tests from `BIO-ABD A–V`; job payload minimization; corrupted/mismatched source digest; operator-visible sanitized failure; data purge/retention behavior; self-cancel and stale lease; queue fairness across users; no false success due to response HTTP200 alone. Use nonpersonal/synthetic fixtures, isolated authenticated accounts and appropriate authorized review environment. CI passing tests is not equivalent to independent science/security acceptance.

## 8. Ownership, sequencing and proof/status

| Area | Owner | Evidence |
|---|---|---|
| Architecture and integration deduplication | Chief Architect | This decision + existing backlog crosswalk |
| Minimal implementation, migration, tests, preview | Codex | Actual changed paths, migration, SHA, CI, synthetic hosted QA, limits |
| Source identity/version and outbox | Integrations | Revision join and transaction failure tests |
| Tenant/consent/job/erase audit | Security/Privacy | Cross-account, revocation race, sanitization |
| Eligible statistical output | Biology/ML | Method scientific validation, abstention, claim/evidence restrictions |
| Intended use/provider rights | Legal/Regulatory | Conditional review only for activated scope |
| Usability/fallback | UX/User Testing | Honest progress, error, stale, unsupported, meaningful no-model flow |

Release accounting must report these **independently**:
`specified`, `code-present`, `engineering-tested`, `hosted-verified`, `science-reviewed`, `security-reviewed`, `rights/clinical-authorized`, `publicly released`. Current decision grants only specification-level architecture acceptance. Existing source-audit primitives are not proof of new durable job deployment.

### Smallest acceptable rollout
1. **Inventory** actual job mechanisms, schema, routes, Python/Render topology; don't duplicate existing job infrastructure. Preserve current C0–C2 and operator source processing.
2. **First practical async scenario**: prove source version committed → durable event → eligible bounded run/abstain → guarded current version publish; test race/withdrawal/replay. May be built as v0.6 groundwork in a narrow affected path; ordinary Core flows continue independent.
3. **Generalized discovery v0.7**: register methods and precise dependencies, integrate evidence/recommendation lifecycle and held-out algorithm benchmarks. Do not present all correlations as medicine.
4. **Measured compute isolation**: benchmark first, then adapt existing worker placement only if needed. Model research is separate, source/licence/purpose-gated; no paid stack by default.

## 9. Implementation-policy inheritance

- Codex follows `AGENTS.md` and `NEXT_ACTIONS.md`; do not prepend a competing active task queue or start new migration solely because this decision is published.
- Preserve existing source/algorithm/asset work, schemas, application journeys and design standards.
- Preserve all useful specialist type examples/test cases rather than silently dropping them; this document includes revised illustrative executable contracts and pseudocode.
- Publish architect instructions on authorized GitHub development branch; link commit and verify remote content.
- No merge to `main`, production database writes, new paid provider, raw personal research transfer, medical claims or cross-user learning authorized by this document.
