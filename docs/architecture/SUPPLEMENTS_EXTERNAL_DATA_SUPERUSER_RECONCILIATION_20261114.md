# Bloom — November 14 Supplement Exposure + External Data Architect Reconciliation
**Date:** 2026-11-14 | **Status:** ARCHITECT APPROVED FOR SCOPED v0.6 IMPLEMENTATION; NOT implemented, independently validated, production activated, or public-release cleared
**Repository:** knagle-max/BloomGutHealth | **Engineering:** Codex only | **Branch for active development:** enhance/bloom-experience (recheck current HEAD; do not overwrite concurrent work)

## Source provenance and limitation
- Read Nutrition & Biology specialist `Bloom_Medication_Supplement_Exposure_Intelligence_Science_Addendum_2026-11-14.md`, requirements **BIO-2026-116–123**.
- Read AI/ML `Bloom_ML_External_Data_Scientific_Coverage_Acquisition_Review_2026-11-14.md` (**ML-DATA-2101–2108**, preserved N01–N07/L01–L04/A01/R01–R05/G01–G07/M01–M11, D01–D06 and original 15 acceptance cases, added P16–P22).
- Read Integration `Bloom_Integration_External_Data_Scientific_Coverage_Acquisition_Review_2026-11-14.md` (**INT-DATA-20261114-R1**; targeted 35-source dispositions).
- Existing authoritative repo: `NEXT_ACTIONS.md`, `docs/architecture/V06_HANDOFF.md`, `docs/architecture/RESPONSE_INTELLIGENCE_V06_ARCHITECT_RECONCILIATION_20261114.md`, `docs/architecture/CROSS_DOMAIN_PRIORITY_INTELLIGENCE_V06_ARCHITECT_ADDENDUM_20261114.md`, `docs/architecture/MICRONUTRIENT_INTELLIGENCE_SCIENTIFIC_ARCHITECT_DECISION_2026-11-06.md`, `docs/operations/V06_DEPENDENCY_BACKLOG.md`, `AGENTS.md`.
- **Provenance caveat:** AI/ML report states original owner-authored “BLOOM — External Data, Scientific Coverage & Acquisition Architecture Handoff” was supplied in another commissioning conversation and remains controlling; its verbatim original was not available in this review. Codex must prefer its exact source instructions over any derivative summary where they differ. Do not block safe work while archival provenance is resolved.

## Architecture decision A: supplement and medication exposures — APPROVE WITH REUSE
Treat **BIO-2026-116–120** as P1 functional extensions to existing canonical owned products, ingredients, Food, Biology, lab histories, source revision and Response Intelligence; **121** as a scoped safety gate; **122–123** as later interoperability/evaluation, not a separate scheduler or second supplement totals database.
1. Product/form/ingredient/strength/route/quantity and provenance; user-verifiable barcode, label photo or manual entry. No unverified photo claim becomes authoritative identity.
2. Effective-dated, timezone-aware regimen revisions including weekly injections, cycles, as-needed and changed/paused routines; distinguish ordered, planned, obtained, explicitly taken, recalled-period use, explicitly skipped, discontinued and unknown.
3. Minimal burden default changes-only/weekly retrospective check; optional grouped one-tap confirmed dose, item exception, undo/correction and optional opt-in reminders. Never infer actual doses from planned schedule, ignored notification, refill or missing log.
4. Bi-temporal occurredAt/effectiveAt versus recordedAt and confidence. Period recall stays ordinal/window-based, never synthetic dose events; correct/delete invalidates dependent findings and preserves historic version receipts.
5. Prelab reconciliation of changed regimen at ~7–14d if lab scheduled, and postlab time-window exposure summaries per relevant analyte. Ingredient-level exposure must separate confirmed, reported, planned and unknown; never claim individual causal contribution.
6. Elemental versus compound quantities, formulation, overlapping food/supplement source and unknown composition are explicit. Food totals include only confirmed taken supplements with defensible identities and units, not planned dose.
7. Medication interactions, cumulative UL and lab interference use qualified versioned curated rules; no auto medication cessation, catch-up dosing, personal prescribing or unreviewed risk flag.

**Implementation ownership:** Codex should perform code-derived duplicate reconciliation first, preserve existing canonical event/review/input architecture, then build one functional product→regimen→low-friction exposure→prelab reconciliation→lab view vertical slice. Tests must include the specialist's 18 adversarial scenarios, especially no-dose unknown, PRN, weekly, DST, later-entered earlier event, multinutrient overlap, correction/deletion, and cross-account isolation.

## Architecture decision B: external reference data — APPROVE WITH TARGETED AMENDMENTS
Preserve **all 35 IDs**, original D01–D06, T0–T3 dependency tiers, 15 original cases and P16–P22; accept ML-DATA-2101–2108 and Integration amendments as refinements to existing source/evidence registry, not a new graph, data warehouse, acquisition AI or food/lab engine.
- Three orthogonal dimensions: **material state** (metadata only/downloaded/validated), **scientific suitability** (identity/comparability/claim-scoped validation), **rights/use permission** (local research, commercial execution, redistributing, images/models). Also track implementation/CI/hosted/human review separately.
- Priority source pilots: N02 CNF 2026 relational snapshot/join tests, N03 Canadian DRI forms/life stage, L02 LOINC 2.83 curated subset/errata, L03 UCUM conversion review. N01 USDA source snapshots remain pinned; no historic meal rewrite, missing→0, inferred product SKUs or guessed lab methods.
- Practical P0 value stays ahead of speculative ingestion: existing Issue #12 specific editable dinner based on true earlier meals and goals; Issue #15 full 30+ marker history with researched useful action across marker families, not TG-only. Source outage/rights delay should not blank valid general action.
- Public research metadata acquisition may run without sending user genotypes, microbiome files or lab records to provider APIs. References and claims are versioned; reviewed/null/retracted/conflicting findings control explain/rank/simulate roles independently.
- Parallel Track B: permitted Rhea/ChEBI/taxonomy and **source-specific** small producer-consumer benchmark in existing Python research path. Synthetic/reference/calibrated/measured statuses remain distinct; tests of mass balance, constraints, version, false strain matches, negative controls, uncertainty and rights. Never populate user metabolite measurement or mainstream nutrition totals from theoretical flux.
- Do not certify CNF install, LOINC import, AGORA2 rights, API live connection, deployment, clinical review or modelling efficacy from public webpages or source-code adapter existence. Record real ingestion receipts, joins, denominators, source versions and rights.

## Architecture decision C: SUPER-USER SCIENTIFIC VISIBILITY — BINDING OWNER REQUIREMENT
**Default rule:** Scientific review required for a public/clinical claim is **not** a blanket prohibition on an authorized super-user viewing reasonably trustworthy source-backed data, educational research, hypotheses or reproducible synthetic/reference results. Separate *inspect* from *apply*.

Extend the **existing** Profile → Account → Show development features capability registry and experimental/research viewer; do not create a parallel admin switch or new dashboard. Actual authorized account, purpose, environment, expiry, jurisdiction, consent and server release flags must be checked for each access; the existing `Tester1` grant/working toggle are **not presumed verified**.

Three independent permissions:
- **COMPUTE_SHADOW:** permitted nonpersonal reference research/synthetic simulation or separately consented purpose-specific personal computation.
- **VIEW_RESTRICTED:** actual server-authorized, purpose-limited super-user can see reviewed or pending-review source records, claim dossiers, known-conflict/null evidence, lineage and sufficiently qualified reference/synthetic outputs with detailed uncertainty.
- **APPLY_TO_USER:** separate eligibility for ordinary personal recommendation, notification, clinical interpretation or treatment advice; **never inferred** from ability to compute/view.

An item is *eligible for internal display* when (a) source identity, version and applicable rights for this purpose are known, (b) input provenance and computation are sufficiently checkable, (c) no known material defect makes it misleading, (d) personal-data consent and account isolation match the purpose, and (e) it is conspicuously labelled **Measured / Reported / Estimated / Educational / Hypothesis / Synthetic model / Reference simulation / Pending scientific review**, with evidence strength, uncertainty, missingness, assumptions and limitations. “Relatively sure data is accurate” means the underlying identity/values and reproducible method are reliable enough for an explicitly bounded display, **not** that the hypothesis is proved or the clinical interpretation validated. An inaccurate, corrupt, unlicensed-for-this-use or incident-disabled output is withheld even from normal super-user viewer; use isolated lawful research harness where appropriate.

**Presentation:** Place research details at their intended Biology, Food, genetics, Progress and model positions in normal super-user UI; no fictitious readings, no blending to measured clinical history, no automatic rank/personal treatment. Show underlying source/date/version/assay or model inputs, contradictory literature, sample/strain limits, review status and scoped role; a clear ability to report/correct invalid data. Toggling OFF unmounts research-only UI without navigation gaps. Private records never show across accounts; consent revocation, deletion, corrected lab/source, expired role and claim withdrawal revoke access or invalidate dependent output. Public users get only legitimately available general evidence and ordinary safe actions, not scary internal blocking jargon.

**Test matrix:** ordinary/toggled-off/expired/revoked/foreign-user API denial; real permitted super-user ON/OFF at Render SHA; source correction and claim retraction; no production action writes from VIEW_RESTRICTED; reference vs personal research boundary; licence and role negative cases; responsive and screen-reader; no raw personal data sent to remote reference APIs.

## Implementation sequence / Codex instructions
1. **Inspect actual moving HEAD and existing issues #12/#15 and optional existing research capability/medication/food source contracts.** Produce short duplicate crosswalk and new status proof (not historical checklist).
2. P0 usable dinner/full-panel response and independent provenance/test evidence continue; **do not interrupt ongoing engineering** merely to rewrite plans.
3. P1 exposure product/regimen/changed-use/report timeline vertical slice; source snapshot CNF/LOINC/DRI narrow pilots; capability × source × use/coverage derived view. Interoperate with current Food intake and Response Intelligence.
4. Parallel small Track B nonpersonal scientifically inspectable reference demo and **authorized super-user viewer** in existing positions.
5. Run specialist acceptance fixtures (18 exposure + 15 original external + 7 additional), targeted DB/API/CI/browser/Render, actual real-device/human test tracked separately. Do not label independently validated without such review.
6. Codex report `Existing code/issue | Delta | Status | SHA | tests | hosted verified | specialist/rights dependencies`; keep main unchanged and never activate regulated/public data processing, spend, licenced rights, destructive migrations or unauthorized external transfer.

## Delivery requirements outstanding
- Produce one **35-source external dependency register** with version, exact acquisition, scientific identity, permitted use, current observed acquisition/QA state and fallback.
- Produce a **capability × source × scientific coverage** matrix (include explain/rank/simulate and per-marker/nutrient unknowns).
- Maintain a **source-rights decision log**, including local research vs commercial caching/redistribution/media.
- Produce minimal per-module Codex delta assignments and real source coverage report with denominators and separate status ladder: specified → acquired → rights-cleared for purpose → scientific-reviewed → implemented → tested → deployed → real-user-validated.
- Preserve owner original external handoff archival wording when available; this architect document does **not** attest original transcript is fully audited.
