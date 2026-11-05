# Bloom — Developer Execution Order and Dependency Gates
**Date:** 2026-10-23 | **Owner:** Chief Architect | **Status:** Prioritized instruction for sequencing; no new scope or implementation claim.

## Binding priority order for Codex
1. **Finish v0.5 first.** `docs/architecture/CURRENT_V05_REQUIREMENTS.md` is authoritative for current engineering. Address safety/data correctness, user-visible broken workflows, P0 original-brand integration, unit control redundancy and completeness, then remaining P1 work, tests, and protected Render preview. Keep autonomous routine Git commits/pushes. Do not pause v0.5 to begin v0.6. Verify latest implementation before treating any historical finding as outstanding.
2. **v0.6 technical foundation after v0.5:** reuse existing account-scoped profile, goals, food logs, Athlete workouts, lab records, evidence registry and approved components; define minimal typed observation/provenance/consent, goal/constraint, reviewed-action, intervention and outcome/version contracts. Safety, permissions, licensing and test harness are critical-path dependencies, not optional end-stage polish.
3. **Working unified planner (first v0.6 value milestone):** multi-goal prioritization, conflicts and hard contraindication rules; one user-friendly Eat–Move–Recover daily/weekly plan with editable alternatives and evidence labels. Offer meaningful guideline-backed guidance without genetics, microbiome, wearables or coach. Include a manual capture/feedback path.
4. **Working training guidance:** implement V06-TRAIN-01 (three explainable states plus honest insufficient-data fallback) and V06-TRAIN-02 (completed-session verbal effort, contributing inputs, tentative recovery/next workout and weekly training context), backed by measured/manual data and validated sport-sensitive principles. No generic numeric readiness score, invented injury risk or recovery clock. Make UI depend on real algorithms and provenance, not synthetic example props. Import the supplied editable design package from shared Library into version-controlled source before implementation, subject to source/content review.
5. **Response learning and adjustments:** dated goal-specific outcomes, quality/comparability, adherence/confounders, reversible reviewed adjustments with pinned evidence, transparent no-change and abstention behavior. Do not assert causality from ordinary before/after observations.
6. **Biology-informed precision:** truthful genotype and microbial assay interpretation with quality/capability classifier and relevance-to-action rules. Curated human outcome evidence must justify any personalized change; theoretical pathways and simulated flux stay educational/research-only. Include optional information-value evaluation, not assay upselling.
7. **Living research updates and governance:** free-first centralized intake/review, verified identities/licensing, contradictory/null evidence and retraction handling, approved rule versions with rollback and user-facing change notices. The minimal approved evidence contract is part of step 2 and enables step 3; full automated surveillance can mature after the planner, but must never directly publish unreviewed advice.
8. **Optional Coach platform:** only after athlete-owned permission and record/derived-data protections, templates and assigned versioned plans; then roster, reviews and multidisciplinary collaboration; AI drafts require human approval and validated safeguards.
9. **Advanced model research:** evaluate learned response models, microbial network/flux simulators, predictive personalization and optional scoring against transparent baselines in independently valid studies. Never block a working conventional plan on experimental ML.

## Parallelism and gates
- P0 safety/clinical/privacy/permission requirements for a feature are prerequisites to **enabling that feature**, not a reason to prevent safe unrelated work and Git pushes.
- Manual/no-device paths work before optional external integrations. Actual HealthKit and Health Connect need supported native clients; browser-only preview cannot pretend a native device connection.
- Sequence dependencies within each milestone: evidence/data contracts → functioning behavior → UX integration → tests → specialist verification. Simultaneous independent slices may proceed where contracts are stable.
- P0 vs P1 specialist labels express risk and relevance **within a workstream**; they do not mean all P0 future Coach/ML work precedes the currently useful v0.6 planner. Research-only P0 signifies mandatory boundaries before claims, not a command to build a simulation first.
- Visual before/after images only for substantial visible transformations. Annotate real differences and preserve originals; do not create identical screenshot comparisons for backend or minor changes.
- Codex supplies real branch/commit, test status, protected preview/build and exceptions after substantive slices, without waiting for routine owner approval. No unverified claim of implementation.

## Source-of-truth precedence
- While v0.5 active: `AGENTS.md` + `docs/architecture/CURRENT_V05_REQUIREMENTS.md` govern current coding.
- For v0.6 planning and subsequent execution: `docs/architecture/V06_HANDOFF.md` defines requirements and science boundaries, **this file defines dependency-led sequence**, `docs/architecture/POST_V05_ROADMAP.md` is historical supporting context if its order conflicts.
- Review current head before work. Latest source specialist handoffs and their reviewed SHA may be older than implemented code.
- Both training packages are v0.6 deliverables. In particular `Bloom_V06_TRAIN_02_Editable_Component_Package_2026-10-23.zip` resides in shared Library, not verified committed to the application repository, so Codex must have a repository copy prior to relying on source paths.

## Milestone demonstrations
- **M0** v0.5 complete and tested, feature gaps known.
- **M1** baseline-only user sets 2+ goals, receives safe explained Eat–Move–Recover plan, adjusts/logs it.
- **M2** manually logged or source-verified run and strength session receive honest intensity/next-session guidance; unknown fallback and weekly view work.
- **M3** longitudinal observation causes a justified maintain/modify/abstain decision, with version history and no unsupported personal causal effect.
- **M4** actionable vs unproven genotype and microbiome cases demonstrate safe different/no-change outcomes; optional labs/assays never needed for baseline.
- **M5** retracted/contradictory research goes through approval and version rollback with no autopublish.
- **M6** Coach/advanced research only on separate secure, validated opt-in gates.

**This ordering does not assert any feature is already built or clinically validated.**

## Priority integration policy — all future specialist handoffs (2026-10-23)

**Standing Product Owner instruction:** Whenever a specialist submits a new handoff, Chief Architect must **automatically review, deduplicate, prioritize, assign a dependency position and update this execution order and the v0.6 requirements** without waiting for an additional prioritization request. Priority must consider (a) user value and completion of usable outcomes; (b) safety, privacy, legal and claim integrity gates; (c) prerequisites/reuse of working components; (d) implementation cost and complexity; and (e) validation maturity. Give each recommendation a phase, risk priority, overlap and verifiable acceptance criteria. Source priority labels alone do not dictate calendar order.

### Intake disposition — latest Biology and AI research (2026-10-23)
- **Early mandatory foundation, not extra user features:** LAB-TRANS-01, relevant LAB-TRANS-04/05 safeguards, ML-FRONTIER-01, FREE-BIO-01/06. Approved claims, precise scope-of-use, canonical provenance and licensing/consent constraints belong in the safe data/evidence foundation.
- **Concurrent measurement/evaluation design:** LAB-TRANS-02/03 and ML-FRONTIER-04 inform baseline comparisons and safety tests early; do **not** postpone the practical first working planner for unperformed independent trials of hypothetical genomic features.
- **After integrated plan and response loop:** LAB-TRANS-06/07/08 and small FREE-BIO-02/03 / ML-FRONTIER-06 curated graph, only as necessary to make incremental actionability or version provenance useful.
- **Research-only late lane:** ML-FRONTIER-02/03, FREE-BIO-04/05 protein/genomic foundation models and MICOM metabolic simulation. Benchmarks, dataset/model commercial rights, compute feasibility and clinically meaningful incremental value required before any promotion. No paid inference service or GPU dependency for the baseline product.
- **Science operating model:** `Discover → Replicate → Predict → Intervene → Validate → Review → Controlled Release → Monitor`. A proposed research stage, approved advice rule and public clinical/regulatory release have different gates.

**Traceability:** Full deduplicated source-ID map and acceptance conditions are in `V06_HANDOFF.md` §19. The newest reviewed handoffs are not verified as implemented. **v0.5 remains the only active Codex development priority.**


## Future research compatibility — no research-network launch (2026-10-23)

**Product Owner scope decision:** The Participant-Controlled Research Network is **not a v0.6 launch feature**. It is **deferred P2** with independent P0 gates before any research-specific processing, recruitment, investigator access, interventions, AI research training, return of findings or external transfer.

**Integrate now, without disrupting v0.5 or building a network:**
1. **At v0.6 data foundation:** preserve trustworthy canonical original observations, units/time zone, provenance, assay/device method and confidence, correction/version trail and purpose/account scope; no missing-value invention. RNET-DATA-01 P0 and RNET-DATA-03 P1.
2. **At goal/action/learning-loop phases:** record goal-to-intervention timelines, planned/actual nutrition/training, adherence, dated outcomes, relevant optional confounders, missingness and changes. Reuse existing food and Athlete logs; no research surveys. RNET-DATA-02 P1.
3. **At permissions/evidence foundations:** architect separate research-purpose grants for *future* use but keep all research access disabled, unenrolled and unconsented now. Existing user data cannot be silently redirected into research. Preserve evidence claims approval firewall. RNET-DATA-04/05 P0.
4. **Deferred postlaunch independent initiative:** study registry, protocol/recruitment, REB/IRB/ethics process, fine-grained research consent/withdrawals, controlled researcher workbench, cohort exports, returns, randomized studies and commercial access. RNET-DATA-06 P2, with feature-specific P0 Legal/Security/Biology/User Testing activation gates. Do **not** add research UX to Today/Athlete onboarding.

**Priority principle:** Future compatibility is worthwhile only where it enhances reliable, consented core product records today. No indefinite raw biological data hoarding for hypothetical science. Deduplication and full IDs in `V06_HANDOFF.md` §20. Codex current top priority remains completing v0.5.


## AI-ready data contracts: foundation before optimizer, not a network launch (2026-10-23)

**Binding priority clarification:** Future research compatibility and all Bloom AI systems depend on reliable and permissioned **source → event → canonical record → derived feature → recommendation → measured outcome** lineage. Treat this as a shared product data contract, not as a separate AI database or early research network build.

1. **Foundation P0, before v0.6 planner:** DATA-AI-01/02/03/04/09: minimal stable event IDs/relationships, provenance and dual timestamps, valid/missing distinctions, purpose-specific permission boundaries, safe deduplication/corrections, and recommendation input/evidence lineage. Reuse existing working APIs and records, migrate incrementally.
2. **Before longitudinal adaptive engine or any trained AI:** DATA-AI-05/06: reproducible point-in-time feature derivation, training/serving parity, leakage checks, authorized datasets only, evaluation snapshots and baseline comparators.
3. **As supported modalities/connectors expand:** DATA-AI-07/08/10: quality coverage, standard identifiers/units/assay data, versioned interoperability adapters, minimal necessary retention and efficient storage. Avoid collecting unused sensitive fields merely because a future research study might need them.
4. **Explicitly deferred:** study enrollment, consent UI, university access, cohort downloads, human-subject research or research-specific AI training. No research functionality in initial launch. Distinct permissions required before future real uses.

**Acceptance:** Reconstruct with synthetic data a traceable food+workout+laboratory timeline (sources, changes, interventions, outcomes, gaps and AI decisions), prove cross-account isolation, as-of prediction cutoff, revocation and loss-aware export. Record gaps and implementation SHA, not a blanket “research-ready” claim. See V06_HANDOFF.md §21. Finish current v0.5 first.

## Active v0.5 P0 incident — branded packaged foods (2026-10-23)

**Immediate current-release priority:** UT-FOOD-501/502/503/505 (see `CURRENT_V05_REQUIREMENTS.md` latest addendum) cover the tester's failed `kit kit bar` and Michelina's searches, exact-versus-generic catalogue coverage, typo/alias matching, no-result-to-successful-log, and deployment/licence investigation. Reproduce with real preview configuration; do not claim OFF is enabled, or activate unapproved external lookup. UT-FOOD-504 Canadian bilingual/variant coverage is P1 after the basic reliable flow. Preserve raw food log and source provenance for future nutrition AI and research. This supersedes any implied ordering that would place v0.6 roadmap work before fixing current food logging. Codex owns implementation and independent tests remain pending.


## P0 architecture audit and modularity gate before v0.6 feature growth (2026-10-23)

**Accepted Integration Agent recommendation:** MOD-ARCH-01–05 in `V06_HANDOFF.md` §22. **Immediately after finishing v0.5, before major v0.6 modules**, Codex must generate an *actual-code* dependency diagram and an enumerated violation/coupling audit, including import cycles, inappropriate cross-domain data flow and provider-specific DTO leakage. Supply tool/command and baseline SHA. Define enforceable direction-of-dependency rules and typed provider/domain contracts; prioritize identified P0 blockers with bounded incremental refactors. Test provider swap and graceful failure (e.g., changing the USDA adapter must not require changes to exercise, lab, or scientific evidence engines); add architecture boundary checks to CI. Use the existing modular monolith unless concrete evidence justifies more infrastructure. This gate should run concurrently with the shared AI data contract foundation, not become an unbounded rewrite. v0.5 remains active; no code implementation or audit is claimed by this documentation change.


## Safe evolution and unintended-consequence prevention — P0 engineering gate (2026-10-23)

**Architect integration:** V06_HANDOFF.md §23 `ENG-EVOL-01–10` extends MOD-ARCH-01–05. After v0.5, **audit existing CI, schema migrations, tests, flags, logging and backups** alongside code-derived dependency graph. Add missing *high-risk* safeguards incrementally before dependent v0.6 feature rollouts: versioned contracts + boundary and regression checks; safe additive schema migrations and restore rehearsal; scoped feature flags and kill switches; privacy-safe observability; external-provider fault tolerance; verifiable rollback. P1: ADRs, performance/cost and dependency maintenance. Prioritize first useful Eat–Move–Recover experience; don't create a platform rewrite or gold-plated infrastructure. For each substantive change, document affected modules, tests, SHA, data compatibility, fallback, rollback and exceptions.

## Photo-assisted meal capture sequencing (2026-10-23)

Source-consensused v0.6 design in `V06_HANDOFF.md` §24 (`PHOTO-ARCH-01–07`, mapped ML-PHOTO/INT-PHOTO/UT-PHOTO/MKT-PHOTO). **Keep active v0.5 food logging, KitKat/Michelina's exact-source search and manual fallbacks as the immediate focus.** Photo recognition is **P1 after the working unified Eat–Move–Recover planner**, not a prerequisite to planner launch. Use one shared canonical meal editor, nutrition calculator and save record, with interchangeable consent-gated vision adapters. P0 activation gates are source/portion truth, privacy/permissions, provider/data licensing, deterministic manual parity, idempotency and real usability evidence. Benchmark end-to-end correction+save against manual/barcode/recent meals before paying for or endorsing image inference. Advanced uncalibrated volume estimation stays P2 research. Design wireframes exist, but no vision model, commercial licence, cost/accuracy benchmark, specialist final signoff or deployed photo-AI integration is established.


## Digital twin handoff sequencing (2026-10-23)

Four specialist reviews (BIO-TWIN-601–608, ML-TWIN-701–706, UT-TWIN-1001–1007, MKT-TWIN-1101–1106) are consolidated under `V06_HANDOFF.md` §28 `TWIN-ARCH-01–08`. **No universal simulation platform or “digital twin” branding during early v0.6.** Reuse existing P0 DATA-AI provenance/consent contracts; after the functional planner add user-value **Compare approaches** using simple guideline tradeoffs, followed by versioned Personal progress and single-domain measurable-response modelling only if it outperforms simple baselines. P0 claims/clinical gates: independent horizon-specific uncertainty and validation, abstention, no false causal effects, coach/research permission isolation, and correlated uncertainty checks. Source-derived Branding assets `Bloom_V06_Digital_Twin_UX_Kit_2026-10-23.zip` are reusable presentational references only. Host–microbe flux and joined physiology simulations remain P2 research. Neither this planning nor the supplied UI assets justify interrupting incomplete v0.5 development.


## Digital twin specialist intake (2026-10-23)

BIO-TWIN-601–608, ML-TWIN-701–706, UT-TWIN-1001–1007 and MKT-TWIN-1101–1106 are consolidated in `V06_HANDOFF.md` §28 as TWIN-ARCH-01–08. **No v0.5 interruption or universal twin dashboard.** Reuse DATA-AI and LEARN contracts. After the initial functional v0.6 planner, offer **Compare approaches** (evidence-based qualitative choices) and source-aware **Personal progress**. Personalized quantitative forecasts require independent context-specific validation, calibrated uncertainty, simple-baseline comparison and safety/permission gates. Host–microbe flux stays P2 research. Branding’s `Bloom_V06_Digital_Twin_UX_Kit_2026-10-23.zip` is presentational only, not validated model logic. Reserve “digital twin” for scientifically validated context-specific simulation.

## 2026-11-01 Architect integration checkpoint

Architecture owns specialist intake, duplicate/contradiction resolution and this ordered handoff; Codex owns implementation and verification. This checkpoint clarifies existing scope, not an instruction to stop active engineering.

**Current v0.5 immediate dependency:** reproduce and resolve the canonical bloom-report-v2 structured report reimport field-loss documented in NEXT_ACTIONS.md, while retaining exact reported zero/unknown/qualitative data, original source metadata and ownership. Follow with source/capability isolation regression, then criterion-by-criterion v0.5 acceptance reconciliation and remaining demonstrated UI/source gaps. Do not recycle old superseded biology findings or treat 207 historical backlog rows as 207 proven live defects.

**Biology intake mapping:** BIO-2026-101/102 evidence provenance/claims review = P0 only before new personal effects, ongoing P1 coverage; BIO-104/105/106/108 existing outcome/nutrition/Athlete/N-of-1 expansion = staged P1 and independent science validation; BIO-103 incremental typed reaction model = v0.6 P1 after minimal contracts/planner; BIO-107 microbial flux = research P2, no launch prerequisite. Negative/conflicting findings and abstention are required for any released personalized rule.

**Sequence preserved:** finish actionable v0.5 first, then existing v0.6 contract → baseline useful planner → training → longitudinal outcomes → cautiously evidence-gated biology → research governance → optional Coach and advanced ML. v0.5 browser/PWA-first native decision is settled; preserve no-fake-sync rule. Independent device, brand, science, security, licensing and managed recovery acceptance remain distinct gates, never blanket reasons to stop unrelated safe branch work. Avoid paid infrastructure and duplicate prediction systems.

## Scientific imagery omission recovery — 2026-11-04

October 30 owner-approved microbial portraits, representative microscopy gates and chemically accurate biological diagrams are **explicit architecture scope**, not optional decoration. See CURRENT_V05_REQUIREMENTS.md SCI-VIS-01–04 and V06_HANDOFF.md V06-SCIART-01–03.

**Dependency order:** During v0.5, keep current critical source-integrity and safety fixes first; reconcile existing 20 microbial list/profile identities, asset inventory and per-entry portrait/neutral fallback behavior, implement any missing safe fallback without inventing scientific specificity, and document exact source, review and rights coverage. During v0.6, implement individually mapped reviewed portraits and molecule/pathway diagrams through current biology/evidence UI contracts. Do not enable unverified micrographs or molecular structures. Test 36px thumbnail/160–200px hero, narrow/mobile/200% zoom/light/dark, keyboard/screen reader, taxon source and return-focus, unavailable/withdrawn/offline assets and malicious SVG controls.

**Crosswalk and completeness:** Map the October 30 iconography, Biology, Branding, User Testing (UT-SCIART-3001–3016), Integration and relevant Security assets to approved requirement IDs, current code and live release statuses. No blanket closure based on 20 SVGs or generic brand asset import. Distinguish design approval from scientific, chemistry, licensing and actual deployed acceptance. Continue other approved work without waiting for artwork rights decisions.

## Binding source integration index — Architect 2026-11-04

The Chief Architect has already performed cross-specialist workstream decisions and placed them in `docs/architecture/ARCHITECT_SPECIALIST_RECONCILIATION_2026-11-04.md`. Use its table/acceptance requirements for the October 30–November 1 scientific imagery, organism profiles, Biology/ML living microbiome, Research-to-You, optional food discovery, feature preservation, Legal/Security and rights crosswalk. This **replaces** any instruction for Codex to determine how unprioritized specialist proposals should be approved. Codex owns implementation/status verification and flags real discrepancies, while Architect owns future approval and priority changes.

Sequence: (1) existing v0.5 P0 source and permission fixes, (2) 20-organism clickable/profile image-or-labeled-fallback acceptance and core UI preservation, (3) v0.5 criterion and independent acceptance closure, (4) v0.6 baseline practical reviewed nutrition/training/recovery planning, (5) observed feedback and optional honest culinary plant diversity, (6) reviewed taxon portrait/molecule/pathway intelligence with per-asset gating, (7) living evidence governance and optional research. Do not begin optional deep biology before core user-facing value. No fake model effects or unapproved image distribution.

## Owner pragmatic artwork authorization — 2026-11-04

Interpret the v4 112-asset register with its latest “Owner-directed proportionality amendment”: owner asserts AI-assisted creation for Bloom; **first-party art may enter an access-controlled internal preview without expensive individual legal opinions**, after inexpensive source/built safety and author-origin checks. Exact 112-source-blob Security screening already passed; do not rerun equivalent manual source vetting. Codex integrates a small safe visual slice into existing microbial profiles, with scientifically honest labels and neutral fallback, and collects actual UI/security evidence. Do **not** publicly serve unreleased assets through unauthenticated static folders, or call 15 concept-pass images species-diagnostic. Biology/chemistry and real-app UX review govern public scientific display, with public allowlist strictly gated to individually/batch-cleared final SHA entries. This interpretation supersedes blanket “do not integrate any art at all” wording, but not fail-closed public distribution.

## Direct owner public-image instruction — 2026-11-05

The owner explicitly supersedes the immediately preceding private-preview/public-image gate: **“Public activation should not be gated for the images.”** Bloom-generated images therefore enter the normal application without preview flags, reviewer roles or image-approval lookups. Continue the existing v0.5/v0.6 order. Preserve exact artwork, original report truth, representative/generic captions, accessible fallback and inexpensive SVG/build/delivery checks. Scientific accuracy claims and user-data permissions are separate from public artwork availability; do not invent qualified review or use the old image-publication gate to stall integration.

## Chief Architect approved calculated biomarkers implementation order — 2026-11-04

Canonical architectural decision: `docs/architecture/CALCULATED_BIOMARKERS_ARCHITECT_DECISION_2026-11-04.md`. This resolves the Biology and User Testing November 4 proposals; Codex must not independently choose to display all 36 candidates or clinical thresholds. After active v0.5 source/authorization work and actionable release closure, implement one lab-derived contract with source/panel/revision/formula version and tests; initial neutral NLR, non-HDL, TG/HDL and TSAT; conditional HOMA1/FIB-4/urine ACR arithmetic; one Calculated Insights surface, correction/trends/export; then selective P1 expansion. Research-only/specialist indices remain advanced/deferred, and Free T4/TSH ratio is explicitly excluded. Clinical staging/risk colours require separate exact metric/age/cohort/assay guideline, qualified clinical, Legal and UX approval; no fabricated universal NLR or HOMA target. Preserve primary lab result prominence and no-omics baseline. No new paid API.

## Binding owner-authorized Genetics Expansion in v0.5 — 2026-11-04

Use `docs/architecture/GENETICS_EXPANSION_ARCHITECT_DECISION_2026-11-04.md`. This **changes the phase**, not the scientific approval gate: (1) active v0.5 P0 source/privacy/functional defects; (2) actual 29-row genetics catalogue audit and `outside studied pair` normalization bug reproduction/correction; (3) one typed canonical domain/allele/consent/source registry; (4) **17 domain** accessible navigation and **all Biology §5A named variants/types**, plus 150–250 reviewed **catalogue** entry target with disclosed shortfall; (5) independent no-inference, import and privacy acceptance. These are v0.5 deliverables; do not silently push to v0.6 or treat 200 entries as 200 measured personal insights. New education defaults review-pending/research-only, complex variants need assay ability, APOE sensitive consent. v0.6 extends living evidence and genuinely approved new interpretations.
