# Bloom Branding & UX — Review of updated User Testing Visual Motivation roadmap
Date: 2026-10-24 (America/Regina)
Owner: Branding & UX Specialist
Source: `Bloom_User_Testing_Visual_Motivation_Five_Phase_Roadmap_Review_2026-10-24.md`, UT-VIS-1301–1308.
Decision: APPROVE WITH CONDITIONS for Chief Architect consolidation. Phase 2 and Phase 3 design can proceed concurrently; phases 4–5 remain validation/release gated. No application implementation, participant study, or clinical effectiveness claim.

## Review disposition by source ID
- UT-VIS-1301 P0: Approved. Every indicator opens original observation(s), date, origin, rule, correction history, and incompleteness where applicable. Reuse existing evidence/provenance disclosure.
- UT-VIS-1302 P1/P0: Approved. Max one or two primary indicators on Today; visual replaces redundant paragraph, not supplements it. Test copy length and task comprehension.
- UT-VIS-1303 P0: Approved. Planned rest, illness, skipped logs and injury never mean failure. 'Not recorded' differs from zero activity; nutrition progress never encourages unsafe underfueling.
- UT-VIS-1304 P1: Approved. New compact quiet/balanced/celebratory control with a clear Off option for recaps and optional celebration; no cumbersome onboarding.
- UT-VIS-1305 P0/P1: Approved. New trend concept explicitly identifies data dates/method, missingness, comparable units, and describes co-movement as association, not cause.
- UT-VIS-1306 P0: Approved. Text alternatives, keyboard focus, reduced motion, touch targets and responsive reflow. Reuse Everyday/Athlete/Coach workspaces appropriately.
- UT-VIS-1307 P1/P0: Approved as prospective study design only. Candidate thresholds not achieved. Include negative pressure and subgroup harms, not just retention.
- UT-VIS-1308 P1: Approved. Versioned phase ledger and release gates, Codex sole engineer; visual completion does not enable forecasting.

## New design requirements
**MKT-VIS-1601 — P1: Goal-linked trend view.** First viewport: named goal, 1–2 important measurements, short trend label and period. Chart opens dated source observations, method changes and missing data. No inferred causal claim. Acceptance: a person can distinguish two variables changing together from one causing the other; changed device/units clearly flagged.
**MKT-VIS-1602 — P1: Compact motivation preference.** Choose Quiet / Balanced / Celebratory from canonical preference editor; separate independent on/off choices for optional recaps and animations; no forced setup. Acceptance: Quiet suppresses motivational extras without suppressing critical alerts; preferences persist and respect reduced motion.
**MKT-VIS-1603 — P0: Meaningful incomplete states.** Rest planned, record missing, partial provider sync, unknown nutrient, correction pending. Do not zero-fill or celebrate on ambiguous data; accessible plain language without color alone.
**MKT-VIS-1604 — P1: Anti-clutter placement.** No separate motivation dashboard, rings gallery, streak scores or animated layer atop lengthy existing text. Replace relevant copy in Today/Progress/Athlete, preserve single primary CTA and layout breathing room at 320px.
**MKT-VIS-1605 — P0 before prediction release: Prediction gate.** Phases 4/5 visuals only after corresponding independent scientific, model, legal, security and testing approvals; no fabricated readiness, lipid, muscle, injury or microbiome outcome figures.

## Package assets
- `phase2_progress.svg`: editable mobile schematic, explicitly synthetic dated observations, method-change note and trend ≠ causation.
- `phase3_motivation.svg`: editable compact preferences and a restful status.
- `prototype.html`: local interactive static prototype toggling motivation style and data disclosure; synthetic data only.

## Cross-agent dependencies
Architect deduplicates into living v0.6 handoff, sequences design and release. Codex owns code and deployment. Biology/ML determine safe trigger criteria, truth classes and what counts as comparable. Security/Legal review coaching/research scope and notifications; Integrations source timestamps/duplicates; User Testing comparative evaluation and harms. Reuse existing Phase 1 visual kit, Scientific Insights kit, and copy-density/padding fixes. Screenshot-confirmed mobile collision defects remain P0 and are not resolved by this package.

## Verification
Source handoff reviewed. Assets are editable conceptual references only. No source-code changes, Render validation, usability study or release sign-off. Existing Visual Intelligence assets remain valid; this addendum supplements rather than supersedes the Phase 1 kit.
