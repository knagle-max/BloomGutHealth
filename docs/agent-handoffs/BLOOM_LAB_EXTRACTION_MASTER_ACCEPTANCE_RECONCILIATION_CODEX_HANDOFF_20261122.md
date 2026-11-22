# Bloom — Architect → Codex: Laboratory Extraction Master Acceptance Reconciliation

**Date:** 2026-11-22  
**Repository / branch:** `knagle-max/BloomGutHealth` / `enhance/bloom-experience`  
**Status:** PUBLISHED HANDOFF; RECONCILIATION REQUEST, NOT ACTIVE IMPLEMENTATION AUTHORIZATION  
**Owner task precedence:** `AGENTS.md` → `NEXT_ACTIONS.md` → selected scoped contract.

## Decision and observed gap

The canonical proposed `shared/lab-extraction.ts` was not found on `enhance/bloom-experience` during architect review on 2026-11-22 (GitHub path lookup returned 404). This is a **confirmed artifact gap**, not by itself proof that all extraction behavior is absent. The 2026-11-21 lab extraction specification expressly describes the module as proposed work. Existing source-only lab records, single-record reviewed import, assay comparability, encrypted persistence and provenance/revision mechanisms are documented foundations; **current actual-HEAD implementation/test coverage still needs per-case reconciliation**.

**Do not classify every LAB item as missing or every LAB item as partial based solely on the missing filename.** Reconcile each requirement against running code and tests.

## Immediate execution priority — do not interrupt

As of 2026-11-22, `NEXT_ACTIONS.md` selects **only** the GI-01..GI-10 multifactor GI investigation *source inventory + authentic synthetic baseline*, followed by an **owner-review STOP before fixes**, except reproduced urgent P0 safety/privacy/source/data-loss defects. This handoff is an intake/acceptance-coverage record, **not a new task selector or permission to switch tasks**.

Keep the existing original artwork + Genesis/EE-01 work and P1 science queue intact. Any lab correction must separately become eligible under the single live execution queue. Documentation may record the gap without making lab extraction the active task.

## Authoritative sources

- `AGENTS.md` — current operating policy.
- `NEXT_ACTIONS.md` — single live task selector.
- `docs/architecture/BLOOM_LAB_DOCUMENT_EXTRACTION_VERBATIM_MAPPING_REVIEW_CONTRACT_20261121.md` — **LAB-X-01..LAB-X-14**, source of truth for stage contracts, schema fields, acceptance and privacy rules.
- Actual definitions of **master LAB-01..LAB-10** in the Master Acceptance catalog; do not assume they are equivalent to LAB-X numbering.
- Relevant installed code/tests at *current HEAD*, not historical SHA statements.

## Task A — source inventory when reconciliation is eligible

First inspect equivalent existing types and executable paths. Report exact **path:line**, branch HEAD SHA, tests/receipts for:
- `shared/precision-nutrition.ts`: `labSchema`, `sourceOnlyLabSchema`, `labSourceInputSchema`, `labSourceReportSchema`, correction rules and canonical normalization.
- `shared/lab-comparability.ts` and `shared/lab-assay-identity.ts`: analyte/method/specimen comparability.
- `server/precision-routes.ts`: `POST /api/precision/labs/import` with one reviewed payload, `Idempotency-Key`, duplicate review and authorization.
- `server/precision-storage.ts`: encrypted records, source revisions, corrections and import linkage.
- `server/biological-investigation-snapshot.ts`: source freshness and invalidation.
- `server/metered-ai.ts`: provider-purpose authorization and disabled/unapproved lab extraction.
- Other actual document ingestion, OCR, parsed candidates, user review, file retention, preview and batch coordination paths, if present.

**Integration nuance:** The existing reviewed route accepts a single `labSchema | sourceOnlyLabSchema` payload, not the proposed multirow `ConfirmedLabImportPayload.rows[]`. Do not POST the proposed batch format to the existing endpoint or bypass `insertReviewedLab`. If future multirow coordination cannot be atomic, use explicit retry-safe per-row status/receipts rather than hidden partial success.

## Task B — Master Acceptance reconciliation

Find the *existing* Master Acceptance reconciliation and update there; **do not create another task board**. For **each** LAB-01..LAB-10 and LAB-X-01..LAB-X-14, record:

| Required field | Value |
| --- | --- |
| ID and acceptance statement | Exact authoritative ID and required behavior |
| Status | `IMPLEMENTED` / `PARTIAL` / `MISSING` / `UNVERIFIED` |
| Implementation evidence | Exact `path:line`, module/function and HEAD SHA |
| Test evidence | Exact test path/name, executed PASS/FAIL or NOT_RUN |
| Gap | Specific unsupported behavior, not filename inference |
| Resolution | `REUSE` / `NARROW_CHANGE` / `DEFER` |
| Queue eligibility | Current P0 exception, later eligible source-integrity or deferred capability |
| Blocker | Rights, privacy, provider, independent review, original file, or other named limitation |

A schema alone is not end-to-end verification. Historical receipts are not actual-HEAD test results. If behavior cannot be established, use `UNVERIFIED`, not an invented pass/fail.

## Stage boundaries and safety invariants

**A — verbatim source candidate (untrusted).** Preserve precisely printed analyte/value/operator, unit, date, specimen, issued date, reference interval, method, page/row/crop provenance, flags and uncertainties; never treat OCR/model confidence as acceptance. Report absent bounding boxes as absent; do not fabricate citations.

**B — deterministic mapping.** Check source report/specimen identity, actual collection chronology/precision, assay and calculation method, reviewed analyte identity, unit conversion/version and applicability. Keep raw text unchanged. Preserve unknown/ambiguous mapping; incompatible assays must not be merged simply because their labels resemble one another.

**C — explicit human review + authorized commit.** Every row confirmed, corrected, excluded or saved source-only. Correction of printed candidate forces re-mapping. Server rechecks ownership, document/source revision, match decisions and idempotency; reuses existing authorized encrypted storage. Unreviewed OCR/VLM rows never become clinical measurements.

Critical negatives:
- `<0.60`, `>90`, `<=5` are **censored thresholds**, not measured values for charts, ratios, changes or biological conclusions.
- `Negative`, `Trace`, `Reactive` are qualitative, **not numeric 0**.
- Calculated versus direct LDL, total versus free PSA, vitamin D isoforms and incompatible specimen/method identity remain distinct for comparison.
- Report issue date ≠ specimen collection date; never manufacture collection time, midnight, reference bounds or units.
- Fake 0.99 confidence cannot skip review, and incorrect decimal/unit/crop requires human correction.
- Account-scoped preview/import/superseding must never cross users.
- Corrected/amended records retain source/audit history and avoid duplicate active measurements.
- No silent partial multirow save, idempotency replay double-import, or stale reviewed-match acceptance.
- Originals/private crops are account-protected with truthful TTL/deletion/backup residuals; no sensitive thumbnails/logs/cache leakage.
- Unknown OCR input, prompt injection, malformed files and decompression/time/page hazards fail safely.
- Cloud extraction remains OFF without separately reviewed purpose, redaction/privacy/provider/terms/rights/billing authorization. `store:false` alone is insufficient. Never transmit user lab reports externally on the authority of this handoff.

## Whether to add `shared/lab-extraction.ts`

Look for equivalent runtime Zod/TypeScript boundaries for `LabSourceDocumentRecord`, `RawLabRowCandidate`, `MappedLabRowCandidate`, `ConfirmedLabImportPayload`, `LabExtractionMethod`, `LabResultKind` and `LabAnomalyFlag`. The lab architecture specifies these names and versions. **Only implement** a shared contract when an evidenced missing cross-layer safety/validation behavior makes that the smallest eligible fix, and when `NEXT_ACTIONS.md` allows correction. Reuse existing contracts otherwise. Do not duplicate storage, reviewed import, OCR system, lab registry or provider integration.

## Verification when separately authorized

Use **LAB-X-01..LAB-X-14** exactly as written in the authoritative contract. Preserve separate statuses: `SPECIFIED`, `CODED`, `SYNTHETIC_TEST_PASS`, `LOCAL_FILE_TEST_PASS`, `PROVIDER_POLICY_APPROVED`, `HOSTED_PRIVACY_VERIFIED`, `INDEPENDENT_SECURITY_REVIEWED`, `CONSUMER_ENABLED`.

Mock/synthetic OCR passing does not establish actual OCR accuracy; a successful engineering test is neither clinical validation nor consumer enablement. Blind LAB-X-14 data and answer keys must remain truly unseen until implementation is frozen; do not train or tune on revealed cases.

## Required reconciliation receipt

Report (1) actual HEAD SHA, (2) existing file:line inventory, (3) 24-row ID-specific coverage matrix, (4) confirmed missing behavior vs reusable foundations vs unverified integration, (5) smallest **proposed**, not automatically executed, corrective slice, (6) tests actually run and not run, (7) queue disposition/blockers and next authorized step.

**Stop before implementation** if current GI baseline/owner review is pending or other higher-priority queue requirements forbid it. A reproduced urgent P0 safety/privacy/source/data-loss defect can be escalated under the current queue.

**Protection:** No protected Render↔Mac, Tailscale, Serve, production database/network change, external personal-health data transfer, new paid provider, `main` merge or consumer activation. For any authorized nonpersonal source commit during the pause, follow `AGENTS.md` commit conventions, including `[skip render] [skip ci]`.

## Definition of done for this handoff

A trustworthy gap/coverage register that does not erase or duplicate existing infrastructure, does not displace the GI baseline and does not mistake a specification for implemented/independently verified functionality.
