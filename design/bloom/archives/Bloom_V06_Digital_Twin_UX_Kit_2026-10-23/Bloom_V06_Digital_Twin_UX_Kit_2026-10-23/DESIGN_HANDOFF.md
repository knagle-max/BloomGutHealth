# Bloom v0.6 — Digital Twin & Scenario Comparison Branding/UX Handoff
**Date:** 2026-10-23 (America/Regina)  
**Owner:** Branding & UX Specialist  
**Review disposition:** APPROVE WITH CONDITIONS for Chief Architect consolidation. No model validation, clinical approval, implementation or participant testing claimed.  
**Sources reviewed:** `Bloom_V06_Biological_Digital_Twin_Handoff_2026-10-23.md` (BIO-TWIN-601–608); `Bloom_ML_Digital_Twin_Cross_Specialist_Review_2026-10-23.md` (ML-TWIN-701–706); `Bloom_User_Testing_Digital_Twin_Cross_Specialist_Review_2026-10-23.md` (UT-TWIN-1001–1007). Their recommendations are proposals, not evidence of implemented accuracy.  
**Boundary:** v0.6 research and design only; Codex exclusively implements, tests, commits and deploys. Do not interrupt v0.5.

## Central recommendation
Do not build a stand-alone universal “Digital Twin” dashboard, an animated body, a readiness score, or a molecular forecast game. Present **evidence-based scenario comparisons** inside the existing plan/progress experience. Users should answer “Which feasible next action fits my goals and constraints?” before seeing source evidence, model assumptions and uncertainty. Label early modules **Personal progress** or **Compare approaches**; reserve **Digital twin** for a module with independently validated updates and predictive/simulation accuracy for a declared endpoint, population and horizon. No user-facing percent effect without validation.

## Asset manifest
- `components/ScenarioComparison.tsx`: portable typed, presentational React component. Three information classes: guideline comparison, validated forecast, experimental model. It requires explicit user-facing claim and supports abstention.
- `components/ScenarioComparison.css`: light/dark, Everyday green/Athlete blue/Coach indigo hooks; shared spacing and accessible semantic text. Codex may map fallback tokens to canonical app design tokens.
- `assets/scenario-comparison-mobile.svg`: mobile editable comparison wireframe.
- `assets/model-abstention-mobile.svg`: honest insufficient-information screen.
- `assets/plan-change-mobile.svg`: change history and review wireframe.
- `assets/scenario-comparison-desktop.svg`: desktop comparison wireframe.
- `examples/EXAMPLE_DATA.ts`: illustrative static examples, not clinical prescriptions or validated outcomes.

## New / incremental design requirements
**MKT-TWIN-1101 P0 — Claims and vocabulary.** Default wording “Compare approaches” and “Personal progress”; avoid “Your digital twin predicts” until validation. Every result must label observation, guideline comparison, calibrated conditional forecast, experimental research simulation, or unavailable. **Acceptance:** users can distinguish the five categories and no simulated/metabolic values are represented as observations. Crosswalk BIO-TWIN-602/608, ML-TWIN-703, UT-TWIN-1001/1003.

**MKT-TWIN-1102 P1 with P0 safety — Decision-first comparisons.** Show two or three feasible actions, time, effort, goal tradeoffs, limitations and next measurement. Uncertain predicted outcomes MUST be omitted rather than replaced by zero. No separate unit editor, diary or additional progress dashboard. **Acceptance:** no-data user can compare guideline-based choices; alternatives can be reviewed without falsely claiming individual superiority. Crosswalk BIO-TWIN-603, ML-TWIN-705, UT-TWIN-1002, UT-SIMPLE-901/910.

**MKT-TWIN-1103 P0 — Visible limits and abstention.** A forecast, when permitted, needs named outcome/horizon, actually used observations and observation dates, model/version, eligible population, uncertainty and limitations; otherwise display “A reliable personal forecast isn't available” with the baseline plan and what could help. Never present a numerical interval unless calibrated against approved evidence. **Acceptance:** 16S-only, sparse labs, hidden food oil, changed device and unit incompatibility scenarios block precise individual outputs. Crosswalk BIO-TWIN-601/603/606, ML-TWIN-703/704/705, UT-TWIN-1003/1007.

**MKT-TWIN-1104 P1 with P0 clinical safety — Reviewable plan changes.** When approved evidence/measurement changes guidance, show before/after action, which **actual** inputs changed, reason, effective date and evidence/model version; retain prior plan snapshot. No automatic attribution of change to diet or training. **Acceptance:** improvement, null, worsening, contradictory, correction and reverted-model scenarios supported without silent overwrite. Crosswalk BIO-TWIN-604, ML-TWIN-706, UT-TWIN-1004.

**MKT-TWIN-1105 P0 — Consent and limited access.** Never infer a Coach may view labs, genetics, microbiome or raw modeled inputs from a permitted training summary. Research opt-in separate from personal guidance. **Acceptance:** public/coach/research views render only sanctioned scopes; revoke updates future access and labels transparently. Crosswalk BIO-TWIN-607, UT-TWIN-1005, Security/Legal.

**MKT-TWIN-1106 P1 — Accessibility and cross-mode identity.** Reuse Bloom Scientific Insights typography, rounded cards, provenance labels and text-based evidence hierarchy. Accent differs (Everyday green, Athlete blue, Coach indigo) but semantics never change. Provide keyboard-focusable details, table alternative for any future forecast trends, real date data, 320px / 200% zoom and dark mode. **Acceptance:** screen reader names option and forecast type; uncertainty never conveyed by colour alone. Crosswalk UT-TWIN-1001–1007, UX-OPT-07, MKT-BRAND-301.

## Example user journey
An Everyday user selects muscle strength and lipid-health goals. Bloom presents Plan A and Plan B with objective qualitative tradeoffs, habit/time impact, and future measures. It does **not** fabricate their 3-month LDL or muscle gain. The user selects an option and logs activity/nutrition; follow-up shows dated results and missing/confounded data. A separate nonintrusive panel may explain that validated personalized simulation is not currently available. If a future validated module becomes available, its endpoint, horizon, validation population, actual input dates and uncertainty must be surfaced before any forecast, with explicit user review before changing a plan.

## Required states and boundary cases
- No data: guideline comparison available without registration for tests or devices.
- One dated measurement: show observation; no person-specific trend forecast.
- Incompatible laboratory units: require review; no fusion.
- Two independent model outputs sharing uncertain meal-photo intake: don't double-count or offer false combined precision.
- A 16S microbiome report: no enzyme expression or SCFA production prediction.
- Performance metric missing after device switch: discontinuity explained, not hidden.
- Coach with authorized training summary only: no genetic/lab detail in explanations.
- Unreviewed paper/model version update: recommendation not silently changed.
- Concerning symptoms/labs: relevant reviewed safety information visible, no simulation-based reassurance.

## Feasibility, dependencies and verification
**Design assets:** low/medium cost and no external design-data licensing. **Model-dependent experience:** high research and validation burden. Biology owns clinical applicability, evidence and safe thresholds. ML owns typed forecast validity, calibration, uncertainty and abstention. Integrations owns provenance and compatibility. Security/Legal own permission and clinical claims. User Testing evaluates comprehension and usefulness against a simple guidance baseline. Architect resolves versioning, module eligibility and overlap in `docs/architecture/V06_HANDOFF.md`. Codex owns application code and release. **No app repo files were changed for this design handoff.**

**Workflow:** Received → Source reviewed → Design assets delivered → Awaiting Architect consolidation → Not implemented / Not independently tested → Specialist runtime review pending.
