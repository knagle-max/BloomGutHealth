# Bloom — Biological Optimization Intelligence: Independent User Testing & Product Research Review

**Document ID:** UT-BOI-20261109-R1  
**Date:** 2026-11-09  
**To:** Chief Architect & Integration Lead; Branding & Visual Design; Structural UX; Nutrition/Biology; AI/ML; Integrations; Security/Legal; Codex  
**Disposition:** **APPROVE THE PRODUCT DIRECTION WITH TARGETED USER-EXPERIENCE REVISIONS; IMPLEMENTATION MAY PROCEED IN PARALLEL.** No application acceptance or runtime test is claimed.

## Source and evidence boundary

Reviewed the complete `Bloom_Biological_Optimization_Intelligence_Architecture_v06_2026-11-09.md` (BOI-001–018), `Bloom_ML_Biological_Optimization_Intelligence_Review_2026-11-09.md` (ML-BOI-2001–2006) and the current v0.6 Architect living handoff (`docs/architecture/V06_HANDOFF.md`). The BOI handoff references branch SHA `633f6835f356f65befd20a0c8a45ffb699afa6b8`; a separate GitHub branch check during this review found moving head `0e41e457c1c920202b23b330e02bf2bec95073ac`. This is a **specification review only**: no BOI build, real UI screenshots, participants, assays, model benchmark, physical devices or claims validation performed. External literature R01–R17 and ML reviewer source assessments are *source claims*, not independently validated by this User Testing review.

## 1. Executive decision / emotional reaction

**I feel encouraged by the practical intent and worried about the interface it could create.** The central question — *what can I realistically do, why, and did it help?* — is valuable. But the proposal can easily turn into a dashboard of biological systems, an expansive onboarding questionnaire and many competing 'optimization opportunities.' That would reproduce the institutional/clinical complexity the Product Owner has repeatedly rejected.

**Product decision:** Build BOI as **an intelligence capability woven into existing Today, Food, Biology, Progress, Explore and Athlete**, not a new top-level workspace, BOI score, laboratory portal, intake funnel or second notification engine. Approve the **deterministic practical guidance + action/outcome loop** immediately after the existing v0.5 release boundary; allow **synthetic molecular reference R&D in parallel** as ML recommends. Require claim-specific review only for activation of unvalidated personal models and high-risk interventions; do not use reviews as a generic engineering stop-work gate.

## 2. What the source gets right — preserve

1. **Three distinct layers:** released everyday actions; carefully described longitudinal response; separately marked research-only molecular simulation. They are not interchangeable and must not silently elevate a hypothesis to individual medical advice.
2. **No forced devices or omics:** a new user with only a goal, allergy and time constraint must get practical value.
3. **Immutable source truth:** original records, units, specimen/assay, missingness, compatible trends, revision and consent cannot be overwritten by an inferred score or model.
4. **One-to-three eligible choices, not maximization:** contraindication/exclusion, affordability, preparation/time, preference and feasibility checks precede ranking; user can skip/modify.
5. **No fake physiology:** a microbial species or genetic variant cannot prove personal metabolite production, GLP-1 secretion, pathway efficiency, diagnosis or individual treatment effect.
6. **Measured outcome and adherence separate:** selecting a suggestion does not mean food consumed, workout completed or outcome improved.
7. **TS authority plus bounded Python math:** numerical optimization is not clinical validation. No second canonical evidence database; no unsupported source upload to an external model.
8. **Molecular R&D not erased:** agree with ML that genuine reference-data gene→enzyme→reaction→metabolite modelling should proceed as a staged v0.6 R&D workstream alongside everyday guidance.

## 3. Required changes, prioritized for Architect

| ID | Priority | Finding / source crosswalk | Required product correction and executable acceptance |
|---|---|---|---|
| **UT-BOI-5401** | P0 v0.6 UX | BOI-003 / §3.2 lists many domains, despite optional wording. | **Progressive intake, never a completion checklist.** Ask for at most one context datum when it changes a currently eligible decision, show why, and allow Skip/Not sure. Existing safe activity and food suggestions work without genetics, labs, microbiome, supplements, CGM or device. Measure first-value time and abandonment in a fresh account. |
| **UT-BOI-5402** | P0 | BOI-006/008 and ML action proposals. | **One action at a time on Today.** Show one relevant action, reason, effort, and primary `Try / Save plan` versus `Not for me`. An optional 2–3-choice view cannot create three equally weighted hero cards. No implied medical promise or compulsory logging. |
| **UT-BOI-5403** | P0 | BOI-008/009/011 and §5.1 adherence. | **Separate suggestion → chosen plan → performed action → observed outcome.** Never pre-mark a proposed meal as eaten, proposed workout as complete, or unobserved outcome as achieved. Receipt-backed save and independent review state; edits, cancellation, pause and adverse effects visible. |
| **UT-BOI-5404** | P0 | BOI-002/007/013, ML-BOI-2001–05. | **Four visible evidence statuses** with accessible explanations: *your measured/recorded result*, *provider-reported assessment*, *general research association*, *hypothetical/modelled scenario*; plus clear *not available*. Actual and theoretical diagrams must never look like the same personal telemetry. |
| **UT-BOI-5405** | P1 | BOI-007, §7.2 systems map; prior LabExplorer/MicrobialProfile. | **Preserve interactive biology explorers.** A new Systems overview must complement, not bury, click-to-open bloodwork marker groups and organism profiles. `My Biology → Bloodwork → marker` and `Gut Reports → organism` remain discoverable on first screen, mobile and desktop, with back/focus return. |
| **UT-BOI-5406** | P0 quality | BOI-007/008; premium R4/visual directives. | **Bland/SaaS Alert check:** reject nested white/grey system cards and new optimization scoreboards. Surface layer warm, distinct, editorial, uncluttered; deep layer precise and inspectable, with chart/table only where meaningful. Minimum 16px, preferred 20–24px content padding. Visual Designer, not User Testing or Structural UX, owns paint. Real screenshot comparisons mandatory to claim visual acceptance. |
| **UT-BOI-5407** | P0 device parity | BOI-018 & §7.1–7.4. | **Mobile is a first-class design, not responsive residue.** Capture/test 320, 390, 768, 1440px; light/dark Everyday/Athlete, keyboard/VoiceOver or screen-reader where available, 200% zoom, reduced motion, 44px targets, safe-area CTAs, optional art collision and scroll length. All critical paths have parity. |
| **UT-BOI-5408** | P1 | BOI-009/011 response learning. | **Avoid turning Bloom into daily homework.** Check-in optional, 1–2 easy taps where appropriate; contextual frequency matched to observable outcome, not endless 'How did you feel?' prompts. User can stop tracking without guilt; actions may remain useful without a control cohort. |
| **UT-BOI-5409** | P0 science comprehension | BOI-007/013/014; ML-BOI-2003/05. | **Expert Depth without pseudo-personalization.** The path `observation → source/assay → evidence → mechanism → uncertainty → alternative` stays reachable. Label theoretical production and consumption, model assumptions, absent species/functions, no measured flux and no direct personal efficacy. Actual hormone measurements require exact method/source. |
| **UT-BOI-5410** | P1 | BOI-006/008/012 ranking. | **Transparent user priority and override.** Explain why an action outranks others using source-backed relevance, cost/time/preference; allow change goal or food exclusion without recalculating an invented biological opportunity percentage. Display 'no suitable change identified' when appropriate. |
| **UT-BOI-5411** | P0 data lifecycle | BOI-016/017, §8. | **Correction/revocation propagation is user-visible.** A withdrawn source retracts or refreshes only dependent conclusions and proposed actions; historical outcomes remain faithfully marked. Logged-out, cross-account, offline, stale and 409 conflict journeys must not render last owner's conclusions. |
| **UT-BOI-5412** | P1 | BOI-003/004/005/010. | **Missing integration ≠ user failure.** Connection statuses distinguish unsupported, disconnected, denied, stale, failed and not measured. Manual/text/CSV fallback; no banners urging Apple Health if no native bridge exists. |
| **UT-BOI-5413** | P0 safety | BOI-006/012/014 and ML-BOI-2005. | **Safe abstention and no false precision.** Contraindication gates and clinically consequential claims remain outside ordinary ranker; no personal GLP-1, disease risk, microbiome capacity, 'deficiency', unverified wearable readiness or personalized molecule output. Unknown stays null. Explain why advice is unavailable while offering an eligible general alternative. |
| **UT-BOI-5414** | P1 usability | BOI-004/007 and current Food editor. | **No second food editor.** BOI opportunities link to the canonical food composer, reuse/edit and household portion review. The model never writes eaten food, planned supplements or nutrient totals; corrections remain reversible and source-labelled. |
| **UT-BOI-5415** | P1 validation | BOI-018, BOI-012, ML-BOI-2006. | **Three separate proof points:** (i) useful everyday user task vs strong deterministic baseline, (ii) reproducible synthetic reference biochemical scenario, (iii) only later, prospective personal-response prediction with credible calibration. One green Python check cannot certify all three. |
| **UT-BOI-5416** | P1 onboarding/trust | BOI-003/016. | **Consent without burden or dark patterns.** Separate optional data-use purposes, explicit decline and revocation. No surprise research opt-in, no training implication, no irreversible prompt disguised as a recommendation. Compare no-data vs rich-data paths. |

## 4. Novice / expert / visual acceptance tests

**Novice 3-second test:** On 390px mobile and 1440px desktop first-use Today, an uncoached participant should identify what can be done *today*, why it is proposed and how to skip; ask them within 3 seconds and capture exact words. On Biology, ask whether a proposed pathway statement is about *their measurement* or general biology. Do not call this passed from static code or developer test receipts.

**Expert Depth test:** From a food or biological recommendation the user must inspect actual observation/date/source/method; approved study evidence and limitations; which part is hypothetical; alternate action and why; how improvement would be observed. A real meal correction must use the canonical editor, not a fresh BOI-specific food tool.

**Visual & Cognitive Friction:** At 320/390/768/1440 in light/dark and Everyday/Athlete, rate premium warmth, originality, hierarchy, source signal-to-noise and scientific detail discoverability separately. Screen should not become a medical portal, flat admin dashboard or number of equally important bordered cards. Rich research graphs may use precise/tinted telemetry without implying the model is a personal test result.

**Measured practical targets (proposed, not observed):** ≥90% first-action completion among qualified users; ≥80% can distinguish measured personal result versus research hypothesis; zero serious contraindication or fabricated-measurement misunderstandings in tested critical scenarios; record median/P90 time, taps, errors, corrections, opt-out and perceived burden. Samples must be defined prior to declaring metrics achieved. A numerical '3 seconds' test requires actual timed participants.

## 5. Twelve executable cross-context journeys for Codex and independent testing

1. **Only goal + exclusion:** meaningful safe next step, no forced omics, no fake 'missing data' score.
2. **No need to optimize:** user with adequate recorded routines sees truthful maintained progress or 'no identified improvement', not gratuitous deficiency.
3. **Partial food:** known nutrient contribution retained, unknown not zero, no fabricated unmet target; correct in existing editor.
4. **Allergy/avoidance/cost:** candidate rejected before ranking; user can inspect why and choose affordable alternative.
5. **Chosen vs completed:** choose lunch idea, no consumed entry until genuine save; skip and change do not fake adherence.
6. **Supplement plan vs intake:** optional planned zinc remains unconsumed until user confirms, supported form/UL warnings as appropriate.
7. **Raw genomic + qualitative Viome only:** no personal function/SCFA/GLP-1 interpretation; mechanisms educational with method/rank/source evidence.
8. **Marker and organism discovery:** 390px and 1440px from My Biology reach named lab and organism detail in obvious steps, back/focus preserved.
9. **Longitudinal observation:** one baseline and one post-record show descriptive, contextual change and uncertainty, not causal achieved effect.
10. **Research model scenario:** fully synthetic source-linked substrate perturbation with clear 'reference simulation' and no transfer into personal action ranking; no unsupported quantity.
11. **Deletion/consent/account switch:** dependent personalization withdrawn, history correctly labelled, other account hidden, no stale cache.
12. **Python unavailable/slow:** baseline non-ML action survives, no spinning/dead-end, no fabricated result; mobile, dark, keyboard and 200% zoom usable.

Every run: frozen SHA + deployed build, fixture/tenant, device/browser, source snapshots, steps, expected/observed result, screenshot/log, severity, `PASS/FAIL/NOT RUN`, retry and independent versus developer evidence.

## 6. Ownership and implementation ordering — avoid gate proliferation

- **Architect:** add BOI refinements to canonical `V06-01/04/09/12/13/14/17` (and relevant ML IDs), crosswalk existing BOI-001–018 and ML-BOI-2001–06. One registry, one authorization framework. This review **does not establish a new parallel epic**.
- **Structural UX:** actionable Today/Opportunities flow, empty-data and preference controls, reusable detail/return pattern, genuine mobile and desktop compositions, typed interfaces. No competing aesthetic palette.
- **Branding/Designer:** own editorial visual language and low-burden, human copy; design two distinct presentations for personal observed outcomes versus hypothetical research. Review *real* screenshots, not references alone.
- **Biology + ML:** review claim semantics, method constraints, permitted personalization and planned synthetic reference pathway. Compare baseline vs optimizer and report observed versus simulated outputs distinctly.
- **Integrations:** re-use existing sources, permission status and provenance; review external licensing, native feasibility, dedup and source corrections.
- **Security/Legal:** claim- and purpose-specific gates, no surprise data sharing or clinical activation; do not freeze independent safe engineering.
- **Codex:** implement after integrated Architect work order. First deliver a small real end-to-end practical action (no optional biology), then a mobile/desktop visual slice, with scientific deep links; in parallel build isolated *synthetic* molecular reference R&D. Keep old v0.5 RC isolated from v0.6 changes. Do not fabricate acceptance or start paid provider integration.
- **User Testing:** independently judge usefulness, emotional reaction, 3-second clarity, Expert Depth, Bland/SaaS alert, mobile/desktop parity, avoidance of questionnaire overload, exact source states. No presumed visual/human PASS before actual tests.

**Do not impose a new owner go/no-go at each intermediate screen, and do not make documentation a stop-work gate.** Correct local failures in parallel. Production activation for high-risk/regulated claims remains a distinct evidence decision; the practical feature work should not stall on a future clinical model.

## 7. Verdict and next handoff actions

**Product/UX verdict: APPROVE WITH TARGETED REVISIONS**. This is an acceptance of the *direction/specification*, **not** independent functional, visual, human, device, medical or scientific validation of an implemented BOI product. No current BOI screen or model was tested. The Architect should accept the BOI architecture, incorporate UT-BOI-5401–5416 as crosswalked acceptance refinements, and request actionable design/engineering output rather than another conceptual strategy report. Prioritize minimal onboarding, one meaningful action, simple adherence/feedback, exact source honesty, accessible mobile+desktop biology depth and explicit model-vs-measurement separation. Keep ML's concurrent molecular R&D recommendation.