# Bloom — Background Scientific Method & Research-to-Product Boundary
**Date:** 2026-11-14 | **Status:** Architect-approved implementation refinement; engineering and external research activation remain separate
**Controlling user direction:** Monitor longitudinal exposures/outcomes, independently test hypotheses and refine knowledge scientifically, but **scientific infrastructure must NOT dictate or complicate ordinary Bloom UI/UX**. Research operates behind the scenes. When supported results are published/available and independently assessed, worthwhile findings may improve the ordinary app through its existing scientific evidence and action system.

## 1. Product versus research experience — strict separation
**Everyday / Athlete users:** Keep existing Today, Food, Biology, Explore and Progress workflows, editorial wellness design and one useful, feasible recommendation. Source accuracy, relevant uncertainty, outcome chronology and clear corrections remain accessible where they help the user understand their own records. Do not add a research dashboard, trial management interface, cohort eligibility screens, participant recruitment, hypothesis boards, scientific-review queues, statistical notation, science confidence score, research protocol requirements or burdensome new daily data entry. Do not automatically enroll users in studies or solicit research consent in the currently approved app.
**Internal research:** Hypothesis generation, evidence searches, metadata acquisition, predeclared study questions, statistical testing, validity checks, alternate explanations, null results, model comparisons, causality sensitivity analysis, evidence/version reviews and scientific reports live behind existing trusted server jobs, source/evidence registries and restricted authorized research tools. This is NOT a second recommendation service or product navigation destination.
**Restricted super-user development view:** Existing role+purpose+consent-gated `VIEW_RESTRICTED` may expose clearly designated synthetic, reference and experimental results and validation details; super-user settings do not authorize any production research enrolment or cross-account access. Ordinary users never encounter these screens by default.

## 2. Scientific method requirement
Maintain a repeatable **Observe → Hypothesize → Specify comparison → Evaluate → Challenge → Replicate → Governed publication/evidence review → Applicable guidance** lifecycle, using existing canonical records, evidence/claims IDs and private Python research route. AI may synthesize and critically review literature and generate testable hypotheses; deterministic scientific-quality checks determine eligibility for exact claims. Research analysis distinguishes:
- **Observed measurement** with source method, timing, units, quality, coverage, recorded vs occurred time.
- **Temporal association**, with multiple competing diet/activity/weight/medication/supplement/illness/testing factors, not individualized causation.
- **Repeated personal pattern**, only when sufficiently comparable measurements and interventions exist, with carryover, adherence, missingness and uncertainty limitations.
- **Comparative observational population evidence**, only later in legitimately consented cohort research with prespecified estimands, selection/confounder and missing-data controls, participant-held-out testing, negative controls and sensitivity analyses.
- **Causal/clinical efficacy**, only when suitable study designs and applicable qualified validation support it; a biomarker moving after an intervention does not prove the intervention drove it or improved health.

Do not infer microbial metabolism from qualitative Viome taxa, individual health benefits from pathway simulations, or clinical significance from unrelated lab methods. High-risk medication changes and clinical claims remain gated.

## 3. Research results returning to the user
No direct research → personalized recommendation promotion. Instead:
`approved nonpersonal source/study or authorized research result → versioned findings dossier with positive/null/harms and independent critical challenge → existing AI-led risk-tier scientific review → legal/rights and population/applicability checks → existing approved claim/action IDs → deterministic safety/goal/feasibility ranking → normal Bloom guidance/education`.
- **Publication is not proof:** A published paper or an internally generated report may become a candidate only. Verify study quality, independent replication where necessary, contradictions, populations, effect size/uncertainty and intended use. Unpublished internal findings remain internal/restricted; do not expose personal claims solely because a report exists.
- Existing reports can improve **what the app knows** and **how it ranks approved choices** without changing primary navigation or requiring users to learn research terminology.
- Research reports must identify methods, study population/denominator, collection methods, intervention and comparator, time zero, endpoints and protocol/analysis version, actual missingness and confounders, uncertainty, negative/failed hypotheses, sensitivity, source/data rights, funding/conflicts, release scope, reviewer decision and model version. Support reproducible machine-readable summaries plus human-auditable methodology.
- Reevaluate findings as newer source releases, contradictions or prospective evidence arrive; upgrade or downgrade only exact eligible claim scopes, invalidate affected cached guidance, preserve safe local fallback.

## 4. Preserve private-learning now, population research later
- Current **Track A**: account-contained, consented personalized longitudinal observations and actual chosen/performed/outcome feedback; user-facing explanations are simple, not causally overconfident. No new daily questionnaires solely for research.
- Later **Track B**: opt-in purpose-separated population research, commercially sponsored controlled analysis and academic studies (Canada/US first, Europe future), with ethics/Legal/Security review, privacy-minimizing access, strict consent and controlled results disclosure. Existing `V06_HANDOFF.md` §20 ban on active research networks, cross-user data use, recruitment and uncontrolled model training remains; **this refinement does not activate Track B**.
- Collect accurate current consumer-product data with source/provenance, correction and standards-aware future export compatibility, **not** speculative sensitive fields/retention intended only for research.
- Ordinary people must not need to interact with trial enrolment to access useful Bloom functionality. Future independently approved participation features belong in optional separate flows, never the Today default.

## 5. Codex implementation and acceptance, no new planning loop
1. Reuse existing `shared/lab-history.ts`, Food/activity/medication exposure, source revisions, Today/Progress, evidence network, `shared/scientific-contracts.ts`, reviewed actions and private Python research; no new lab ledger, research graph, evidence database, cohort system or AI stack.
2. P0: Issue #12 concrete food→editable dinner and Issue #15 **all-marker** Response with source-correct E0/E1 event timelines, plausible grouped contributing events and one applicable next step; **no automatic causes or new research UI**. Keep normal user task completion and source details.
3. P1: Within-account repeat-outcome assessment and exposure alignment with pre-specified question metadata where user chooses a harmless experiment. Research reports/AI evidence review generated behind the scenes, not a user protocol form.
4. P2, only later authorized: purpose-consented cohort study design (target-trial emulation/prospective controlled studies), regulatory-readiness receipts, independent validation and governed publication/promotion. No live pooling now.
5. Test at exact SHA: a general user sees **no research portal, new required consent, trial scheduling, internal scientific states or extra work**; Today and Food remain useful with research jobs down. Super-user API and page are purpose/role restricted. An experimental paper cannot directly alter personal guidance. Valid published independently reviewed evidence can improve existing eligible action explanation/ranking without UI redesign; retraction downgrades only dependent action. Account isolation/consent/correction/deletion are enforced. No two-point causal claim; parallel diet+exercise+weight+med changes remain competing explanations. Report engineering PASS separately from qualified scientific validation or live hosted acceptance.
6. FDA/ICH study-method principles guide future suitably designed protocols; Bloom's observational record by itself is **not** FDA-submission-ready. Use latest applicable regulatory requirements only for actual approved studies.

## Source-of-truth links
- `docs/architecture/AI_SCIENTIFIC_GOVERNANCE_MODEL_REGISTRY_ARCHITECT_DECISION_20261114.md`
- `docs/architecture/PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md`
- `docs/architecture/RESEARCH_READY_MULTIJURISDICTION_DATA_FOUNDATION_20261114.md`
- `docs/architecture/V06_HANDOFF.md` §20 research network deferred
- Original `docs/architecture/external-data/Bloom_External_Data_Scientific_Readiness_Architect_Handoff_2026-11-14.md`
