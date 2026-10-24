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
