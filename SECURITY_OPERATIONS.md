# Security controls and open operational requirements — 18 October 2026

This is an implementation inventory and operating procedure, not an independent security assessment or signed risk acceptance. Baseline: enhance/bloom-experience at 550d549a31e513cb8a7556dd7e44aec2aa1cd800. Future requirements pass through the Chief Architect & Integration Lead.

## Current-source reconciliation — 2026-11-05

The October18 baseline below remains historical evidence, not the current account-lifecycle status. Current runtime27dbbeb adds no scientific-asset permission or external processing. `server/account-export.ts` and `server/account-erasure.ts` now implement private, bounded owner-only download and password-confirmed transactional active-application erasure with session revocation; Profile exposes both. Original observations are retained in export while restricted derived payloads are withheld. Routine source versions participate when their table is provisioned and cascade with source/account deletion. Optional health-source storage reports absent versus empty explicitly. Tests: account-export/account-erasure/account-download/health-source-routes/experiment-versions plus actual App journeys; current493 suite passes. This supersedes older “full account deletion unfinished” statements for active application records only. Backup, operational-log and independently held provider data remain outside this implementation; do not promise their deletion or blanket compliance.

Current privacy source boundaries: lab PNG/JPEG OCR runs locally in bounded browser workers with self-hosted assets and no image upload; consented external model execution stays behind existing capability, vendor and metering gates. `store:false` is a request option, not proof of vendor retention policy. The neutral first-party scientific SVG has no external resources or source/user/taxon request identifiers; specific scientific imagery remains independently gated.

The16 individually bounded identity/Athlete/Security rows in `docs/architect-r6/V05_FULL_BACKLOG_STATUS.csv` distinguish implemented/tested controls from unverified full criteria and independent/operational review. No all-route/job isolation, ASVS mapping, penetration test, managed KMS deployment, key rotation, backup restore, load study or signed risk acceptance is inferred from CI or Render. Existing legacy plaintext columns in the inventory remain explicit.

## Request policy and shared budgets

Cookie-authenticated API mutations (including login/logout/signup) require an exact Origin match. Without Origin, only `Sec-Fetch-Site: same-origin` is accepted. Cross-site and sibling-site metadata are denied even with a supplied Origin. The application never substitutes forwarded-host values for Host. Render uses one trusted proxy hop. Optional `APP_ORIGIN` pins the externally visible scheme/host/port; configure the exact origin without a trailing slash. Browser fetch and multipart uploads supply Origin normally. Non-browser mutation clients must supply the expected Origin; cookie possession does not bypass this policy. CORS is not an authorization mechanism.

All replicas use the PostgreSQL request_budgets table, an atomic upsert and database time. Authentication is limited to 60 attempts/source and 20/account per 15 minutes; resource actions to 120/source and 30/account per minute. Covered paths include upload/import, analysis, recipe/coach/planning/photo/transcription and exports. The source budget is checked first. Account and address keys are HMAC-SHA256 digests with the shared session secret; raw identities are not retained. Accounts share the login/signup budget to avoid alternate-route bypass. Local auth/resource guards remain additional controls. A shared-database failure returns 503, never a weaker per-instance fallback. Limits expire; denied requests do not extend windows. Bounded cleanup removes expired rows each minute; active identities keep one row per budget. Quantitative legitimate-user false-positive testing remains open.

Migration 0006 is additive and idempotent. Startup also ensures this table/index, matching the existing session-store startup pattern. CI tests schema creation and concurrent limiter objects with embedded PostgreSQL; production-app CI exercises the real PostgreSQL transport. Do not replace this with process memory when adding replicas. Rollback can retain the unused table.

## Upload/service boundary

Only JSON/CSV reports enter the Express importer. Multipart content is bounded to 2 MiB, one file, four small fields and five parts, held in bounded memory rather than staged on disk. UTF-8 decoding is strict; actual JSON/CSV structure and report schema must pass. JSON has depth/node limits; CSV has a 1,000-taxon row bound. Compressed formats are not accepted or decompressed. Malformed, oversized and raw-sequence inputs are rejected. This reduces the active attack surface; it is not malware quarantine or resource-isolated raw processing. Aggregate concurrent-upload memory/CPU testing is outstanding.

The Python upload path is disabled in authenticated middleware before multipart parsing; no raw-file processor is activated. Analysis refuses server paths and only handles structured reported percentages. Express sends only the required taxa/percentages and nonidentifying processing placeholders, not account identifiers, notes or whole report content. Bearer authentication remains mandatory. Private-network placement/token rotation verification is still an operational release requirement. Historical raw-file paths are withheld from sample APIs but are not erased from storage by this change.

## Encryption/key rotation

Legacy version-1 records remain readable using PRECISION_DATA_KEY. No existing key is changed in this release. To prepare rotation, put base64 32-byte keys in the hosting secret store as a JSON map in PRECISION_DATA_KEYRING and select a safe identifier using PRECISION_ACTIVE_KEY_ID. Version-2 envelopes record the identifier and bind version, key ID and user ID in GCM AAD. Missing, wrong, malformed or tampered keys/envelopes fail closed. Never commit or print either configuration.

Rotation procedure: verify a protected backup and restore in isolation; provision old/new keys through a managed secret store; stage the ring and active ID together; test legacy and new reads; re-encrypt records in an independently reviewed, resumable transaction/batch migration; verify counts and decryption after restore; retain prior keys until old ciphertext and protected backups expire. This pass supplies format support and tests, not the production re-encryption job, managed KMS deployment, actual key rotation or backup drill.

## Restricted-data/storage inventory

| Store/location | Data | Current application protection | Export/delete coverage and gap |
| --- | --- | --- | --- |
| users | Login hash, profile, preferences | bcrypt password; other fields not application-encrypted; authenticated profile routes | Complete account lifecycle unfinished |
| session | Login identity/session state | Secret-signed secure/HttpOnly/SameSite cookies, PostgreSQL store, regenerated IDs | Logout revokes session; full account deletion unfinished |
| meals | Food text, totals, ingredients, symptoms/context | Account route/storage checks; legacy columns not application-encrypted | Individual meal deletion exists; all-account export/delete unfinished |
| microbiome_samples, bacterial_composition | Original report JSON, taxa, metadata, optional historical raw path | Ownership guards; raw paths withheld at API; legacy fields not application-encrypted | Full erasure/original retention unfinished |
| ml_analyses, metabolites, health_impacts, recommendations | Derived/historical outputs | Owner check through sample; unsupported outputs withheld | Retention and deletion inventory unfinished |
| precision_profiles, precision_records | Genetics, labs, health context, plans/check-ins | User-bound AES-256-GCM; account-specific queries | Precision export/clear exists; backups/vendor coverage unverified |
| nutrition_products | Private labels/barcodes | User-bound encrypted payload | Full account lifecycle unverified |
| experience_settings, experience_records | Training, recovery, saved meals, experiments, supplements | User-bound encrypted payload; account-specific queries | Experience export/clear exists; backup retention open |
| biology_* and public reference tables | Curated public research and food composition | Version fingerprint; no personal records intended | Reference-data lifecycle only |
| request_budgets | HMAC identity digest, count, expiry | No health payload/raw identity; bounded expiry cleanup | Short-lived abuse metadata, not included in user export |
| Express upload memory | Report bytes during request | Bounded format/structure; no new disk originals | Request-lifetime only; concurrent-load validation outstanding |
| AI provider | Consented images, minimized recipe/coach context | Structured prompts, store:false, request-specific image consent | Vendor terms/residency/retention and consent revision history require review |
| Optional ML host, legacy files, logs, backups | Historical originals and derived records | Token auth and sanitized application logs | Hosting encryption, firewall, backup retention/restore not independently verified |

Database-provider encryption and TLS are infrastructure controls; they do not replace column/application encryption or prove all environments are correctly configured. No production personal data is copied to tests.

## Authorization/release evidence matrix

| Boundary | Automated evidence | Remaining gap |
| --- | --- | --- |
| Authentication/session rotation/logout | security.test.ts, built-app Neon smoke | Independent reverse-proxy/session security audit |
| Precision read/write/export/delete/plan | precision-storage.test.ts, precision-nutrition.test.ts, weekly-planner.test.ts | Full endpoint/job matrix and operational async audit |
| Experience read/write/export/delete | experience-api.test.ts, experience-storage.test.ts | Complete account retention/consent coverage |
| Catalog/product/source logging | catalogue-selection.test.ts, products.test.ts, food-intelligence-routes.test.ts | Full fuzz and concurrency audit |
| Microbiome | structured-report.test.ts, analysis-boundary.test.ts, specialist-security.test.ts | End-to-end all-route two-account audit still incomplete |
| ML boundary | test_service_auth.py, test_analysis_evidence.py, test_analysis_guard.py, ml-service.test.ts | Deployed private-network and token rotation checks |
| Shared budgets/origin/upload/key envelopes | specialist-security.test.ts | Independent load/false-positive and penetration tests |

Application tests cover portions of ASVS authentication, session, access-control, validation, cryptography, communications and logging concerns. A numbered ASVS 5.0 mapping, independent penetration test, incident exercise, complete backup restore and signed risk register are outstanding; this document is not ASVS compliance.

## 2026-11-21 — SEC-01–SEC-08 bounded read-only audit and Chief Architect five-gate triage (CURRENT AUDIT SPEC)

**Status: AUDIT SPECIFIED, NOT EXECUTED.** Existing implementation inventory above contains historical status rows and a later 2026-11-05 reconciliation. Neither is current release authorization. This **one-time, risk-scoped read-only audit** is a verification technique inside the current `AGENTS.md` / `NEXT_ACTIONS.md` queue; it does not authorize new infrastructure, a second task board or a clinical/security certification.

### Purpose and safe execution

On the authorized `enhance/bloom-experience` worktree, examine existing authenticated health-data routes, private source/history stores, outputs, background/caches, and *proposed* `VOI-I..M` optional Yes→canonical-detail interaction. Separate (a) actual implemented mechanisms, (b) verified unit/CI/hosted evidence, (c) unavailable target-environment configuration and (d) pre-activation controls for **unimplemented** features. Use exact file/line or function/route/symbol, test/receipt and commit SHA. When coverage is incomplete, mark it unverified rather than imply app-wide assurance.

**STRICT READ-ONLY:** no file edits or commits during the audit; no branch creation, resets, deployments, migrations, DB wipes/restores, private-user queries/exports, secret/key display, runtime configuration/network/Render/Mac/Tailscale/Serve changes, external AI/provider calls or tests that mutate persistent state. Inspect code and already-existing receipts. No production/config access beyond authorization. If another engineer's worktree might contain unpublished changes, identify it and its SHA read-only; do not alter. Do not infer that a dev test proves target production TLS/key/backups/logging/provider posture. No request to independently defeat privacy protections or expose sensitive material.

### Control matrix — eight independent controls, no duplicate security stack

| ID | Inspect current code/available evidence and narrowly identify what remains | Primary source leads, to verify rather than assume |
| --- | --- | --- |
| **SEC-01 — Auth, tenant isolation and sessions** | Authenticated actor-derived identity; ownership/IDOR denial on lab, specimen, context, meal, activity, check-in, account exports and jobs; session rotation/revocation and no nondev bypass | `server/account-routes.ts`, `server/account-erasure.ts`, auth middleware/routes, source-specific storage and `security.test.ts` |
| **SEC-02 — Assertion integrity and privilege** | Explicitly separate confirmed facts, proposed/unknown context, source revisions, user “Yes/No/Not sure/Skip” vs actual event and reviewed science; stale/fraudulent claims cannot self-promote; pre-activation only for unbuilt VOI | `shared/scientific-contracts.ts`, `server/investigation-candidate-admission.ts`, `server/biological-investigation-snapshot.ts`, canonical `INPUT-01` domains |
| **SEC-03 — Encryption and key hygiene** | Existing AES-GCM/encryption boundaries, secrets and key rotation; deployed TLS/at-rest/backups only if actual target verified; no secrets embedded in client or sample configs | `server/precision-crypto.ts`, this document's key-rotation and inventory sections, deployment evidence if *already* available |
| **SEC-04 — Logs, telemetry, client visibility** | Health/genetic values, medication/hormone history, assertion choices, errors/URLs/analytics/client caches and related display settings; “Gentle mode” is presentation, **not** confidentiality | Existing logging/error/tracing handlers, browser fetch/cache, `server/account-export.ts`, `VOI` design and privacy source contracts |
| **SEC-05 — Deletion, corrections and non-resurrection** | Owned primary/derived removal; revision invalidation, stale async jobs, queues, caches, uploads, account export, backups, scheduled expiry and vendor-held retention; restoration must not resurrect withdrawn private sources | `server/account-erasure.ts`, `server/account-routes.ts`, `server/account-export.ts`, health-source/precision/experience storage and source history. Existing deletion response intentionally only claims **active application records**: external logs/backups/providers not proven deleted |
| **SEC-06 — Outbound processing and investigator isolation** | Minimal provider requests, nonpersonal public research vs private observations, allowlist/consent/purpose, source epoch, rejection/timeout and provider retention; mock success ≠ permitted live personal-data transfer | `server/private-investigation-runner.ts`, `server/scientific-evidence-retrieval.ts`, provider adapters and existing P1 privacy/routing receipt |
| **SEC-07 — Actual target-environment readiness** | Which exact environment/capabilities were inspected? TLS, secrets, live access, network egress, logs, backup policy and key lifecycle. Current operational pause means unavailable evidence is **UNVERIFIED (PAUSE)**, not passed or failed | Existing `SECURITY_OPERATIONS.md`, safe prior environment receipts/config (no runtime access or secret reads) |
| **SEC-08 — Durable nonpersonal science and test isolation** | Classify public sources, independently reviewed shared releases, provisional hypotheses, personal source facts and synthetic fixtures. Can an independently versioned, rights-reviewed scientific release survive user DB reset without preserving private sources? Do test runs/LLMs ever promote fixture-specific or account-derived claims to shared science? Do withdrawals/tombstones survive restoring older science? | `docs/architecture/BLOOM_PERSISTENT_SCIENTIFIC_LEARNING_LLM_INTEGRATION_ARCHITECT_DECISION_20261118.md`, `shared/evidence-network.ts`, `shared/biological-model.ts`, `server/scientific-evidence-retrieval.ts`, `server/biological-investigation-snapshot.ts`, account erasure, review/promote/version/restore code and existing synthetic receipts |

**SEC-08 distinction:** Individual account erasure, a disposable **development DB reset**, and a privacy-driven expiry/deletion/backup restore have different semantics. Scientific knowledge need not reside in a separate physical database; an **independent immutable reviewed nonpersonal release + tested clean restore and account-free promotion/withdrawal controls** can meet the boundary. “Deidentified” does **not** automatically mean nonpersonal and approved for redistribution, and a synthetic test's successful prediction is **not** permission to promote its result. Shared knowledge must survive an ordinary test-account wipe **if and only if** it is properly independent, reviewed, rights-eligible, reproducibly backed up/restorable and not withdrawn. **Do not implement a shared knowledge system solely to pass the audit**; report current gaps. No test-specific data, source samples, private prompts or derived user conclusions in shared releases; a restored older release cannot undo newer scientific withdrawals.

### Scoring and evidence — per path rather than exaggerated whole-app status

Report for **each SEC-01..08** a row (or path-level subrows where risk differs) with:
1. `Status`: `VERIFIED` (supported for explicitly named code paths and tests), `PARTIAL` (some relevant paths controlled but others incomplete), `MISSING` (control truly absent on an inspected **implemented** path), `NOT TESTED` (present/claimed but required evidence lacking), or `NOT APPLICABLE` (planned feature not implemented; preserve pre-activation requirements).
2. `Evidence scope`: `CODE_INSPECTED`, `LOCAL_TEST`, `CI`, `HOSTED_CONFIG`, `INDEPENDENT_REVIEW`, or `NONE`; allow more than one, **do not merge code and hosted into a broad VERIFIED**.
3. Exact `path:line` and route/symbol, test/receipt name and actual source/commit SHA, affected accounts/data flows, gap/risk/consequence, and **minimum reuse-based remediation**, if demonstrated.
4. Explicit `NOT_VERIFIED (PAUSE)` where production/provider/TLS/backup evidence is inaccessible under the deployment pause. Absence of access is not a demonstrated vulnerability.
5. No claim of comprehensive coverage from one successful route; no claim of success based on one prior test at a different SHA. Note which stores/paths/jobs/caches and which requested environment were *not* inspected.

### Capability- and environment-specific readiness gates (existing release policy, not a new review bureaucracy)

| Gate | What evidence establishes | Distinguish separately |
| --- | --- | --- |
| **G1 — Functional** | Current canonical feature behaviour and exact applicable source/correction/retry fixtures | Implemented application versus **future VOI-I..M** |
| **G2 — Security integration** | Authentication/owner IDOR, invalidation/erasure, no unintended exposure, fail-closed error tests on actual touched paths | Dev/CI synthetic versus target-environment execution |
| **G3 — Infrastructure** | Verified TLS, key controls, deployed access/log/backup/outbound and actual provider settings for **specified target environment** | `UNVERIFIED (PAUSE)` where protected access unavailable |
| **G4 — Independent review** | Risk-proportionate independent security/privacy review and disposition of material findings | Do not invent required blanket third-party certification for routine safe coding |
| **G5 — Authorized real-data use** | Explicit permitted actor/purpose/environment/capability plus satisfied applicable prior gates | No blanket approval for public launch, clinical advice, Coach sharing or external AI |

For each gate give `PASS / PARTIAL / BLOCKED / NOT TESTED` in **two columns**: presently implemented application **for declared capability/environment** and planned `VOI-I..M` **as future feature** (clearly mark not applicable/not implemented instead of calling missing VOI endpoints existing vulnerabilities). If real-data use is unapproved, do not infer that all synthetic engineering must stop; feature-specific protection and current queue continue.

### Chief Architect triage and one-time exit

Organize actual results into **five buckets**:
1. **Demonstrated critical vulnerability/missing safeguard** → existing **P0 only when reproduced**, smallest existing-control repair, exact affected path and proof; serious credible suspected risk escalates for targeted verification without falsely claiming exploitation.
2. **Existing control requiring verification** → exact test/config/evidence missing, no duplicate implementation.
3. **Pre-activation controls for unimplemented `VOI-I..M`** → attach to existing P3 feature acceptance only when scientifically/product-eligible; `NOT APPLICABLE — NOT IMPLEMENTED` until then.
4. **Protected target-environment question** → `UNVERIFIED (PAUSE)`; no forbidden runtime inspection.
5. **Optional hardening** → `DEFER` unless supported risk requires changing priority.

**Final review template:** record audited branch+SHA, current operational pause respected, exact environment and capability scope; SEC-01..08 control matrix; G1..G5 two-column readiness; bucketed findings with path:line, source/test/SHA, narrow remediation, owner and disposition; state whether current P1/P2 work can continue safely and which **specific** operation or real-data use must remain blocked. “Real data authorized” is **NO unless independently established for this actual capability/environment**; don't revoke unrelated existing permission by hypothetical test failure. One report, one Chief Architect review, evidence-driven source of truth—**not** an evergreen security bureaucracy, mandatory audit before every edit, or second backlog.

**Execution order:** This report is a **bounded read-only subtask only when selected by `NEXT_ACTIONS.md` or needed to resolve a specific P0/P1 privacy dependency**. It does not preempt the current unblocked INV-04 investigation or trigger infrastructure access; Codex may run the read-only inspection as its next eligible P3 security verification slice when appropriate. **Audit status remains NOT EXECUTED** until actual exact-SHA findings exist.
