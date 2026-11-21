# Bloom Response Intelligence — Architect, Science & UX Review

**Date:** 2026-11-14  
**Disposition:** **APPROVE WITH TARGETED REVISIONS FOR v0.6 ARCHITECT CONSOLIDATION.** Approve an observational, source-faithful Stage 1 and carefully evidence-gated Stage 2; Stage 3 personal causal/individual response estimation stays research gated.  
**Reviewed:** `Bloom_Response_Intelligence_Science_Handoff_2026-11-14.md` (211-line specialist v1.0) and `Bloom_User_Testing_Response_Intelligence_Review_2026-11-14.md` (UT-BRI-5701–5716). GitHub source spot-check `client/src/components/RoutineLabTiming.tsx`, `client/src/pages/Progress.tsx`, `docs/architecture/V06_HANDOFF.md` on `enhance/bloom-experience`. No app build, deployment, screenshots or device test in this review.  
**Owner:** Chief Architect for crosswalk/approval; Codex for implementation; Biology for approved science content and test fixtures; Design and User Testing for actual visual/task acceptance.

## Executive decision

BRI asks: **What changed? Which recorded changes may be relevant? What is missing? What should I maintain, investigate, or discuss?** This is a valuable capability without a new top-level product, health score, causal attribution engine or compulsory tracking workflow. Create an integrated marker-level explanation from existing source-faithful labs and events. Preserve the scientific handoff's **five non-interchangeable layers**: measured biomarker, observed exposure, population evidence, personal association, and individually demonstrated causal effect. Routine quarterly observations normally justify only the first four at different strengths, not the fifth.

**Do not treat correlation or temporal adjacency as personal efficacy.** When walking, food pattern, weight, sleep and medication changed together, list documented, potentially relevant contributors together, not as a ranked fractional attribution. Unrecorded exposures are unknown, not unchanged. Exposures after the specimen collection may not explain an earlier observation; historical recollections must carry occurrence uncertainty and later recorded-at timestamps.

## Existing architecture reconciliation

The repo already includes `RoutineLabTiming.tsx`, a read-only experiment/lab chronological comparison that says timing is not causation; `Progress.tsx` exposes lab detail/trends and this timing component; the v0.6 Architect handoff has `V06-04`, `V06-13`, evidence review, lab provenance, and experiment work. Reuse existing canonical active lab observations, revisions/receipts, activity, Food, body measurement, supplement, experiment and source context. Add no duplicate lab ledger, independent research-citation authority, second recommendation-ranking service, or detached response dashboard. Map BIO-2026-109–115 to established work IDs and UT-BRI-5701–5716; treat status as specification, not implementation or clinical acceptance.

## Required revisions (binding for Architect and Codex)

| ID | Priority | Requirement and exit criterion |
|---|---|---|
| BRI-R01 | P0 | **First-release scope:** marker-specific **descriptive** comparison plus dated contextual events; no purported individualized causes, calibrated causal percentages, or new global biological score. |
| BRI-R02 | P0 | **Safe comparability:** original value, original/canonical unit, source, specimen date/time, method if known, fasting state, correction revision, analyte identity. Normalize only with approved analyte-specific conversions. If method comparison invalid, do not show percent change or significance. |
| BRI-R03 | P0 | **No invented RCV:** expected variation only with approved analyte/assay/population conditions, method and cited threshold/version; otherwise state not assessed. Numerical change, laboratory reference range, RCV and clinical importance are separate outputs. |
| BRI-R04 | P0 | **Bitemporal events:** effective occurrence date or uncertain interval, date learned/recorded, origin, manual/device/source, retrospective self-report label; revisions and source unlinking are auditable. Future events excluded from earlier-result explanation. |
| BRI-R05 | P0 | **Tradeoffs:** TG improvement cannot be classified as overall cardiometabolic improvement when LDL-C, apoB, liver tests, symptoms or relevant safety outcomes are contradictory, unknown or worsening. Show each measured outcome independently. |
| BRI-R06 | P0 | **Claim and safety review:** clinically important/critical values require vetted marker/jurisdiction-specific workflow. Until available, show non-diagnostic information and appropriate clinician-discussion prompts, not an invented treatment or diagnosis. No suggestion to discontinue prescribed therapy. |
| BRI-R07 | P0 | **Derived data lifecycle:** every explanation references exact owner-bound lab revisions and event/evidence versions; delete/correction/consent revocation invalidates dependent active conclusions and private cache. Preserve historical audit under authorized policy without resurfacing withdrawn content. |
| BRI-R08 | P1 | **Human-first summary:** one observed comparison, 0–3 documented plausible contributors, one concise uncertainty statement, and one eligible next action; deeper scientific sources and counterevidence under disclosure. If no exposures, no fabricated contributors. |
| BRI-R09 | P1 | **One question at a time:** only decision-relevant unknown, with `Unknown`, `Not tracked`, `Prefer not to answer`, `Skip`; avoid compulsory broad health-history questionnaires, completeness percentages and recurring nagging. |
| BRI-R10 | P1 | **Pre-lab snapshot:** user-scheduled or consented reminder only, normally a 30–60 second optional review of existing events; do not presume ongoing adherence or initiate unrequested notifications. |
| BRI-R11 | P1 | **Versioned hypothesis:** preserve what the explanation said when created, when it was recalculated, input/evidence versions, alternative explanations and lack of attribution. A correction must not silently overwrite the old reason or mutate immutable originals. |
| BRI-R12 | P1 | **Progressive response science:** Stage 3 demands suitable prespecified outcome, reproducible repeated measures, intervention safety, washout/carryover review, negative outcomes, uncertainty and prospective evaluation. A persuasive Stage 2 narrative does not validate Stage 3. |
| BRI-R13 | P1 | **No new top-level section:** discover response details from selected named bloodwork marker and Progress comparison; new-result Today invitation only when appropriate. Preserve existing marker profile and scroll/focus return. |
| BRI-R14 | P1 | **Desktop and mobile parity:** actual 320/390/768/1440px layouts, all four Everyday/Athlete Light/Dark combinations, 200% zoom, visible focus, 44px controls, bottom-nav/safe-area, screen-reader/keyboard and source-readability testing. |
| BRI-R15 | P1 | **Source/evidence governance:** citations are reviewed population evidence with study methods/population/limitations; contradictory/null findings accessible. LLM may explain approved structured inputs only, never invent source exposures, dates, references, personal likelihoods or metabolite flux. |
| BRI-R16 | P1 | **Abstention:** incongruent assays, missing record, multiple simultaneous changes, unreviewed evidence or unavailable inference engine must degrade gracefully to a useful measured comparison and context questions, not a blank page or false certainty. |

## IA and screen contract

### Entry and headline
From **Biology → Bloodwork → selected named marker** or a comparison in Progress, open **What changed since your last test?** with a source-faithful before/after display. Show date, original units and comparability inline. Do not call a mathematical decrease "improvement" absent clinical context and related outcomes.

### Concise core
1. **Your recorded change:** data-backed numerical comparison or explicit `Not directly comparable` with reason; chronological plot only where appropriate.
2. **What changed around that time?** observed dated changes from consented records; visually separate `You recorded` from `Research has found` and `Possible contributor`.
3. **What else might matter?** brief grouped confounders and alternative explanations, never faux percentages; distinguish retrospective memory and not tracked.
4. **A next step:** only one primary action: Review changes, Record context, Monitor, Discuss with clinician, or eligible maintenance of an already safe habit.
5. **See the evidence:** expandable source records, assay/method/fasting, source and evidence citations, contradictory findings, uncertainty and revision provenance.

### Mobile (320, 390)
Use a compact vertical value comparison; one clear action; an expandable annotated timeline with readable event dates; no six-card stack or elongated hero artwork that buries the marker. Evidence behind disclosure. Respect bottom navigation, keyboard open, safe-area and focus restoration. A user's chosen retrospective event can be edited from the comparison without navigating through unrelated menus.

### Tablet/desktop (768, 1440)
Use a data-anchored comparison beside or above an editorial event timeline and explanation panel; preserve appropriate reading widths and affordances. Avoid dashboard-like equivalent-weight cards and unused full-width chart space. Exactly the same data labels, controls and source-depth as mobile.

### Modes and status semantics
Everyday Light/Dark and Athlete Light/Dark must preserve meaning and contrast; status must be written, not encoded solely by green/red/blue. Labels include `Measured result`, `You recorded`, `Provider-reported`, `Population research`, `Possible explanation`, `Cannot determine`, `Added from memory`, `Not comparable` and `Unknown` as appropriate. Do not present the same source-based evidence as a personal prediction.

## Scientific reference check (independent limited verification, 2026-11-14)

- The cited **2026 ACC/AHA multisociety dyslipidemia guideline** is real, DOI `10.1016/j.jacc.2025.11.016`, and gives population-level triglyceride diet, exercise, alcohol and risk-context recommendations. It does not validate BRI individual causal attribution.
- The cited **International Atherosclerosis Society hypertriglyceridemia consensus** at `https://www.nature.com/articles/s41569-026-01358-9` is real, **published 2026-11-12**, and discusses secondary causes, nonfasting screening, fasting follow-up in specified contexts and broader cardiovascular risk. Its application to user-specific recommendation logic remains governed by Science/Legal and regional context.
- The proposed RCV implementation lacks analyte/method/population-specific parameter tables or validated decision rules; don't populate numerical thresholds without appropriate citable source and test methods.
- The scientific handoff supplies no validation of a particular BRI response prediction algorithm. Its conceptual guardrails are valuable but not performance evidence.

## Golden test matrix

1. TG 2.1→0.6 and four co-occurring changes: candidates grouped, never apportion causality.
2. Same outcome without exposure history: descriptive result, one optional question, no invented explanation.
3. Different fasting methods and missing fasting: caveat and no false comparability.
4. Source collection precedes event: event cannot explain earlier result even if entered into the app sooner.
5. Corrected lab timestamp/unit: exact revision-dependent explanation invalidation; historical provenance retained.
6. Assay mismatch or analyte mismatch: abstain from numerical comparison where invalid.
7. Outlier/ordinary variation: do not infer personal benefit, RCV only if appropriately sourced.
8. High-risk value or medication-associated change: validated referral branch; no discontinuation instructions.
9. TG falls, apoB/LDL increases: no global congratulations or unsound maintain recommendation.
10. Genetics or Viome-only data: no inferred enzyme flux, SCFA output or causal ranking.
11. Sparse later reversal or plateau: descriptive longitudinal comparison with uncertainty; old versions inspectable.
12. Source deleted, revoked, other account, stale network response: no leakage or retained active derived finding.
13. Suggested versus performed action: proposed habit cannot be presented as recorded exposure.
14. No prior measurement: ordinary marker history/education, not fabricated response.
15. Inference layer offline: measured comparison remains usable, hypothesis abstains.
16. Mobile/desktop + theme/zoom/motion/keyboard/screen reader: same functionality, accessible copy, no content collision.

Each test result needs exact code SHA, source fixture, test mode, date, expected vs observed, PASS/FAIL/NOT TESTED, screenshots for substantial UI changes, and CI/deploy/permission scope. No human or rendered pass from source inspection.

## Sequence and handoff authority

**Slice A — BRI descriptive foundation:** read-only measurement comparison + compatible source and selected recorded events; focus, permission and source-lifecycle tests. Useful with no wearables, genomics, microbiome or AI.  
**Slice B — editable event context:** bitemporal manual annotations, low-friction targeted context questions, pre-lab optional workflow; reuse source records rather than duplicating.
**Slice C — reviewed population-evidence hypotheses:** evidence versions, alternatives, abstention, vetted marker-specific safety and tradeoffs.  
**Slice D — synthetic and prospective research:** prespecified N-of-1 protocols and measured validation; no automated causal personalization without approved evidence.

**Architect:** crosswalk BIO-2026-109–115 and UT-BRI-5701–5716 into canonical v0.6; reconcile V06-04/V06-13 and existing lab/experiment sources, one evidence registry.  
**Codex:** implement on v0.6 authorized workflow, feature-scope independent changes, show migration/tenant/invalidation tests and deployed exact-SHA view.  
**Biology:** publish narrowly selected analyte evidence and validated lab comparability/clinical hazard rules, not global medical declarations.  
**Design/UX:** make both mobile and desktop compositions, one primary action and accessible deep evidence.  
**Security/Legal:** approve relevant claims, sensitive-source purpose/consent/erasure, external model processing and clinician escalation semantics.  
**User Testing:** separate first-glance clarity, meaningful everyday task, scientific comprehension, expert source drilldown, and visual appeal.

**Bottom line:** BRI is strategically right and scientifically careful. **Approve an observational first release and staged evidence-linked hypotheses; reserve personal efficacy/causality claims for research-backed validation.** No new separate dashboard or data source-of-truth. Do not claim implementation or clinical readiness based solely on this handoff.