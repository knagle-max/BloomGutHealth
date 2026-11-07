# Bloom — V06-TRAIN-02 Editable Asset & UX Handoff
**Date:** 2026-10-23 · **Owner:** Branding & UX · **Status:** Asset pack delivered; requirement proposed for Architect consolidation. Not deployed or tested.
**Architecture reference:** V06-TRAIN-02 — Post-Workout Intensity, Load & Recovery Guidance. This package is specific to post-workout analysis, not a re-release of the earlier three-state workout-guidance icons.

## Included editable sources
- `icons/*.svg`: 11 scalable editable outline glyphs, using `currentColor`.
- `components/TrainingGuidance.tsx`: five independently reusable React/TypeScript presentation components with typed props. **No algorithm or wearable integration included.**
- `components/training-guidance.css`: responsive light/dark Athlete styling and semantic effort tokens.
- `examples/Usage.example.tsx`: synthetic fixture only; not used for actual clinical or training conclusions.

## Requirements, priorities and acceptance
**MKT-TRAIN-401 / P0 — Effort Summary.** Easy, Moderate, Hard, Very hard are session *effort classifications* separate from recovery status. Show classification basis, data-source recency, observed vs self-report. Missing inputs never become zero; insufficient input -> unclassified. Biology approves cutoffs/eligibility. Component: `WorkoutEffortSummary`.
**MKT-TRAIN-402 / P0 — Explainable demanding factors.** Expand inputs actually considered (individualized HR zones, duration, RPE, history, strength set/reps/load where applicable); unavailable or not-used factors visibly identified. Do not show metrics that were not provided. Component: `DemandingFactors`.
**MKT-TRAIN-403 / P0 — Recovery & Next Workout.** Distinguish session intensity from present readiness. Give conditional activity alternatives and safety-oriented context, not “fully recovered in 26 hours.” Avoid diagnosis. P0 symptoms and urgent flags require Biology/Legal escalation copy, not broad UI rules. Component: `RecoveryNextWorkout`.
**MKT-TRAIN-404 / P1 — Weekly Training Load.** Week of easy/moderate/hard/recovery sessions and actual source-compatible effort/load. No invented numeric training load, no comparing incompatible measures, no imputation for rest/unknown. Each graph has equivalent accessible text. Component: `WeeklyTrainingLoad`. Example bar heights are synthetic arbitrary display values; real scaling requires approved units, comparable data and domain logic.
**MKT-TRAIN-405 / P0 — Link to three-state upcoming training guidance.** Show the independently computed Train as planned / Consider modifying / Recovery or assessment advised / insufficient information status. The effort category is not an automatic map to readiness. Component: `TrainingGuidanceLink`.
**MKT-TRAIN-406 / P0 — Design continuity and accessible responsive states.** Athlete-blue chrome around non-diagnostic semantic effort colours; same Bloom tokens; 320px and 200% zoom, keyboard, screen readers, dark mode; 44px targets as design default; WCAG 2.2 AA independent audit. Coach sharing not automatic.

## Review and dependencies
Biology owns intensity interpretation, relevant symptoms, readiness/safety thresholds. AI/ML owns validated inference, honest abstention and provenance; Security owns permission, source data and coach exposure; Integrations owns wearable fields, dates and deduplication; User Testing runs real task/visual comprehension tests. Architect deduplicates with V06-TRAIN-02 and previous MKT-WORKOUT-301–305. Codex exclusively implements. No GitHub changes.

## Explicit limitations
The example `158 bpm` cannot classify effort without individualized context; `7/10` self-reported RPE does not establish recovery. The synthetic example's *hard* label is only illustrative. In production, the model must not infer readiness directly from effort, fabricate sleep/HRV signals, prescribe a recovery countdown or claim clinical clearance.
