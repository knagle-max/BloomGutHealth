# Bloom — Adaptive Health Guidance: Architect Reconciliation & Natural-Life Learning
**Date:** 2026-11-14 | **Decision:** APPROVED WITH TARGETED INTEGRATION | **Code/deployment:** not verified.

**Primary source documents (Nutrition & Biology Specialist, 2026-11-14):** `Bloom_Adaptive_Health_Guidance_Science_Correction_2026-11-14.md` (AGH-01–08, 8 acceptance cases), `Bloom_Adaptive_Health_Guidance_Five_Principles_Implementation_Addendum_2026-11-14.md` (AHG-GATE-01–07, 16 acceptance cases). Originals are controlling and must be preserved; this document is a source-to-code reconciliation, not a substitute.

## Controlling intent and newest owner clarification
**People naturally make decisions and changes to diet, exercise, sleep, supplement routines, medications, habits and other lifestyle factors. Bloom should make those ordinary changes useful for the person by capturing voluntary source-grounded records, evaluating subsequent outcomes, showing uncertainty, and learning progressively. It should not engineer interventions on users in order to test hypotheses.**

Five non-negotiable product principles:
1. **Avoid harm:** risk-specific evidence, exclusions and contraindications before suggestion. Never promise zero risk.
2. **Protect competing goals:** an improved LDL value is not global success if nutrition, functioning, strength, symptoms or another protected goal worsens.
3. **No manipulative experiments:** no forced A/B assignment, withdrawal of helpful behaviour, medication/supplement cessation, washout, deliberate worsening or medically unnecessary repeated testing.
4. **Learn from normal life:** prefer existing Food, activity, lab, microbiome and user-authorized information with lightweight optional “what changed?” and recall; avoid collecting data only to support research.
5. **User agency:** user chooses, changes, declines or ignores suggestions; proposed ≠ chosen ≠ performed ≠ observed, and unknown is not a missed dose or negative adherence.

**Naming:** Use “Adaptive Health Guidance” as internal working term, subject to Brand/UX consideration for consumer phrasing; retire “Personalized Biological Experimentation” as ordinary-user direction. No new general-user experiment/research dashboard or navigation; existing Today/Food/Biology/Progress/Athlete remain primary. Behind-scenes hypothesis/statistical/research work may continue in scope; authorized super-user research visibility stays separate and gated.

## Source ID reconciliation (not duplicate services)
| Source | Priority | Binding implementation delta | Existing owner |
|---|---|---|---|
| AHG-GATE-01 / AGH-01 | P0 | Risk-proportionate context sufficiency: relevant known/unknown/stale/method-qualified facts; one high-value question only if decision-changing, else general option or abstain | Existing owned context + eligibility |
| AHG-GATE-02 / AGH-03 | P0 | Evidence version/population/intended outcome/limits/rights/action permission; AI words cannot bypass approved action | Existing scientific governance + action registry |
| AHG-GATE-03 / AGH-01 | P0 | Harm/contraindication veto before scoring or publication; age, pregnancy, renal, allergy, symptoms, medication/supplement concern where applicable; no unaudited clinical triage | Existing deterministic safety/eligibility |
| AHG-GATE-04 / AGH-02/06 | P0 eligibility, P1 explanation | Protect protein/energy, allergens, health constraints, strength/performance and other selected goals; distinguish measured, estimated, incomplete and unknown intake | Existing goals + meal intelligence + cross-domain rank |
| AHG-GATE-05 / AGH-03/07 | P0 safety, P1 UX | One primary suitable option + up to three nonredundant alternatives, or no-change; user controls selection/decline, no autonomous medication/test order | Existing Today + decisions/receipts |
| AHG-GATE-06 / AGH-04/05 | P0 integrity, P1 observational feedback | Event time vs entered time, planned vs actually performed, versioned exposure, low-burden optional context, routine measurements and method comparability, no lab over-testing | Existing Activity/Food/medication/Response/Progress |
| AHG-GATE-07 / AGH-05/06 | P0 interpretation, P1 evaluation | Observed timing does NOT prove individual causality; assess confounders, lab noise, dosage/period, other protected and adverse outcomes, uncertainty | Existing full-panel Response Intelligence |
| AGH-08 | P0 tests | Run all eight specialist examples and all sixteen AHG-gate adversarial fixtures; no model/chat/notification/API bypass | Existing CI/API/DB/browser tests |

## Natural-change capture: practical behavior without burden
- **Known-source signal:** Food meal actually consumed, activity truly performed, supplement confirmed taken, recorded weight, symptom or lab measurement may contribute to a private *observational* timeline when compatible with existing intended purpose and user permissions. A scheduled entry, suggested meal, reminder or unopened app does not establish the behavior occurred.
- **Optional lightweight context:** When Bloom sees a meaningful new habit pattern or an outcome changes, optionally ask **one** non-leading question like “Did anything else change around then?” with choices including “Not sure”, “Prefer not”, and “Dismiss”; preserve whether an answer was recalled later. Do not prompt continuously or infer a medication adjustment without report.
- **Observed pattern / uncertainty:** Detect repeated actual user-controlled changes, timing and follow-up results; compare source/method/assay/food coverage and known biological response windows; consider weight, illness, diet, medications and exercise as *co-occurring possible contributors*, not partitioned causal percentages. Small/noisy changes and missing data stay inconclusive. Review benefit and *protected* outcomes jointly.
- **Private learning:** Safely adapt preference, feasibility and *qualified descriptive* response insights in the same user's account. Corrected/deleted/revoked sources must invalidate dependent profiles and recommendations. Keep deterministic safety and reviewed evidence authority independent of user observations.
- **Scientific research:** AI may use permitted public evidence and synthetic/reference model R&D behind the scenes; do not enroll ordinary users in clinical experiments. Live cross-user aggregation and shared training remain forbidden under `V06_HANDOFF.md` §20 until separate strategic authorization, opt-in, legal/security/ethics review. Future research can capitalize on accurate data without any new consumer burden now.
- **No more measurements solely for Bloom:** User's scheduled clinician-appropriate tests may later permit interpretation; absent tests aren't a prompt to order more. Personal meaningful changes do not imply clinical endpoint efficacy.

## Codex immediate integration order
1. Inspect moving code HEAD for `shared/wellness-actions.ts`, `shared/goal-guidance.ts`, `shared/meal-intelligence.ts`, `shared/today-focus.ts`, Today, Progress, `shared/lab-history.ts`, source/consent, activity and regimen action records. Implement **delta** in shared action eligibility and provenance, no new lab/event/ranking/research engine.
2. Prioritize P0 Food #12: specific source-supported dinner plus protected goals/allergy/energy/protein hard veto, one-tap editable review and actual consumption confirmation.
3. P0 full **report-wide** Response #15: all source-faithful lab rows, evidence-guided relevant marker family, grouped *possible* recorded contributors, co-changes, impact on other goals and conditional useful choice; no personal causal or medication cessation claim.
4. P1 optional change capture and passive longitudinal personal learning: use existing logs first, user-selected/recalled temporal events second, protected-goal checking, adjustment and continuing safe guidance, no research questionnaire.
5. Enforce same authority across API, chat/AI, notifications, Food, Today, Athlete, Biology, Progress and export; deleted/changed source, revoked consent and evidence changes invalidate affected output.
6. Measure actual user burden, missed/incorrect exposure claims, contraindication failures, whole-panel and protected-outcome accuracy; preserve no-logging goals-only fallback. Run original **8 AGH scenarios and 16 AHG cases**, plus medication/food changes, simultaneous habit changes, differing lab assay, source correction, two-account isolation, no unnecessary test nudges, unknown exposure, no deliberate washout and AI bypass. Report PASS/FAIL/NOT TESTED and exact SHA.

**Reference architecture:** `docs/architecture/CROSS_DOMAIN_PRIORITY_INTELLIGENCE_V06_ARCHITECT_ADDENDUM_20261114.md`, `docs/architecture/RESPONSE_INTELLIGENCE_V06_ARCHITECT_RECONCILIATION_20261114.md`, `docs/architecture/AI_SCIENTIFIC_GOVERNANCE_MODEL_REGISTRY_ARCHITECT_DECISION_20261114.md`, `docs/architecture/SCIENTIFIC_METHOD_BACKGROUND_RESEARCH_PRODUCT_BOUNDARY_20261114.md`, `docs/architecture/PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md`, `V06_HANDOFF.md` §20.

**Completion:** This architect integration is approved for scoped engineering, not evidence that developer code, clinical validity, published study results or real-world learning are already deployed. No unnecessary owner gate.
