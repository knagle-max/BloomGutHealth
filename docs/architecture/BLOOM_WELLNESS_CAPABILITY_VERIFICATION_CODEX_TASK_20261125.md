# Bloom — Codex follow-up: General Wellness Capability Verification

**Date:** 2026-11-25  
**Owner instruction:** Perform this bounded follow-up **after the current authorized GI remediation slice reaches its genuine checkpoint**, subject to the single active `NEXT_ACTIONS.md` queue. Do not interrupt present GI source/chronology/privacy fixes or overwrite their in-progress evidence.  
**Source contract:** [Architect wellness-first reconciliation](../agent-handoffs/BLOOM_GENERAL_WELLNESS_ROLLOUT_AND_CLINICAL_RESEARCH_PRESERVATION_REVIEW_20261125.md)  
**Task classification:** Bounded source inspection + local synthetic engineering verification + minimal defect corrections only where they are necessary for existing authorized wellness functionality and consistent with current implementation permissions. **Not** public rollout authorization or a command to build planned maps/timelines.

## Objective

Establish whether Bloom already supports **General Wellness & Personal Pattern Exploration** independently of any unqualified clinical AI runtime, while retaining its dormant/default-deny private clinical/research capabilities and all applicable source/privacy/security safeguards.

## Required implementation method

1. **Inspect actual HEAD, not handoff claims.** Inventory `server/capability-policy.ts`, `server/capability-access.ts`, existing effective authorization and development feature grants, `GET /api/capabilities`, source-purpose/consent guards, account-cache invalidation, private investigation and action admission. Identify existing mode/feature gates and how they work server-side. **Do not introduce a new entitlement table, standalone `clinicalResearchEnabled` switch or second capability store** merely to match the product terms used in the handoff.
2. **Inventory actual wellness functionality** in Today/Food/Biology/Explore/Progress/Athlete and existing symptom, nutrition, supplemental and sleep/activities read/record UI. Distinguish `IMPLEMENTED`, `IMPLEMENTED_BUT_NOT_ACTIVATED`, `PARTIAL`, `DESIGN_ONLY`, `ABSENT` and `SOURCE_UNAVAILABLE`. Specifically BVA-0087–0089 source assets and reconciliation are **not** approved canonical mapping or integrated route; BVA-0090 is an editable design source, not an installed nutrient engine; any multi-lane event timeline requires a separately eligible current product contract. Never invent them in this audit.
3. **Check or locally exercise descriptive outputs** using bounded synthetic account-owned records where actual code path exists: exact recorded amounts and dates, chronology, qualified comparison of co-occurring logged circumstances, competing recorded context, uncertainty/sample size and missingness. `missing ≠ zero`, no-log ≠ symptom-free, planned ≠ taken, temporal proximity ≠ cause, `source` provenance/revision and correct subject/view/consent scope. If no working summary path, report `NOT_IMPLEMENTED` rather than invent mock `PASS` or use clinical AI in disguise.
4. **Check optional clarifying question** in existing INPUT/VOI/consumer decision pathway: zero or one genuinely material non-safety user question, not automatic nagging. Verify that no need for a question is a valid outcome and that revocation/correction removes stale dependencies. Where absent, record exact existing contract seam rather than build a new question engine.
5. **Verify default-deny clinical/research action boundary** server side for unqualified accounts/environments on action endpoints, jobs, model routes and derived-output publication, not only hiding buttons. Confirm diagnosis, speculative SIBO/IMO attribution, drug/supplement recommendations and clinical-risk scoring remain withheld, and safety notices are not accidentally suppressed by the wellness classification. Preserve existing research runner, evidence review/retraction, private/nonpersonal knowledge isolation and fresh independent holdout hooks.
6. **Run focused synthetic privacy/failure tests** for at least two isolated users, account switch, wrong-user/expired/revoked grants, cache/queued-job and corrected/deleted input invalidation, provider unavailable, incomplete diaries, known zero versus missing, a historical high symptom value, and a benign co-occurrence without causal inference. Use real existing request/permission sources; no outside provider, personal record exposure or fake diagnosis.
7. **Produce one small artifact** with `path:line` inventory, effective default-on/off policy, feature-specific classifications, exact command/test outputs and failures, and a ranked `REUSE | NARROW_FIX | BLOCKED | DEFER` decision. If a reproducible narrow defect in already eligible wellness behavior is found, correct it in the existing component/authorization seam with appropriate tests; if it requires new scope/clinical action/public deployment, leave a documented blocker rather than expanding task. Report `ENGINEERING_TESTED` distinct from independent security/scientific/consumer review.

## Future clinical/research unlock — preservation only

Document existing frozen source/evidence rights and revision controls, population/claim scope, permissions, server policy and kill switches, independent custodian-held unseen holdout requirements, legal/regulatory/professional qualification, security/account isolation, correction/withdrawal, hosted readiness and release acceptance. **No single flag alone authorizes regulated or clinical functions.** Dormant functionality need not be bundled or reachable in public wellness builds.

## Boundaries and acceptance

- **No new engine, store, schema, user profile, visual system, feature catalogue, invented clinical policy, treatment protocol, fabricated science pass or asset ID.**
- **No new paid service/provider, external personal data transfer, protected Render/Mac/network change, live production migration, public deployment or `main` merge**; honor current owner operational pause.
- Do not use handoff references as evidence that a user-visible feature exists. Do not re-create the GI baseline, redo existing current verified GI remediation, expose GI holdout answers or change GI action safety.
- Follow `NEXT_ACTIONS.md` as the single task selector. The direct Nov 25 GI remediation authorization supersedes the old baseline-only STOP; this follow-up begins after its relevant authorized checkpoint, not ahead of it.
- **Completion:** source-grounded, minimal verified wellness capability/readiness matrix, limited synthetic tests, and explicit clinical/public rollout gating; no new product surface required.

**Codex return:** current source commit; exact files:lines; what works without a clinical model; what fails or remains unbuilt; test results and limitations; minimal follow-up fixes and readiness gates; no claim friends/public launch authorized.
