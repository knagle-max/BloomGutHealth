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
