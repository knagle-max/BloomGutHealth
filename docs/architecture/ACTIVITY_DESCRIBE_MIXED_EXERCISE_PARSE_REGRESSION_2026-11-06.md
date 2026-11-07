# Bloom — P0 Activity Describe: Mixed Exercise Extraction Regression
**Date:** 2026-11-06 | **Owner report:** Real mobile Render screenshot of Describe Activity review, 7:23 PM (example source text below). **Decision:** P0 user-visible function defect, **Codex implementation required now**. Architect code diagnosis, not implementation or verified reproduction on hosted running build.

## Owner's exact failing example and expected parsed review
`Ran for 45 min then did 10 pushups, bench press for 3 sets of 10 reps for 225lbs, 20 bodyweight squats,`

Expected four distinct review rows, preserving original source and any unknowns:
1. **Running**, `45 min`; no invented distance/heart rate/calories.
2. **Push-ups**, `10 reported reps`, bodyweight; never invent weight or sets performed (a single described bout/set can be represented explicitly if canonical set schema permits, with completed=false until user confirms).
3. **Bench press**, `3 sets × 10 reps × 225 lb`; preserve unit lb, calculate kg only for canonical internal representation and correctly display lb; completion unconfirmed.
4. **Bodyweight squats**, `20 reported reps`; bodyweight explicitly reported, no invented load/duration/completion.

Current displayed result is one `Running 45 min` and one `Strength exercise — Duration not recorded`; this loses the three exercise identities and all reported counts/load. If ambiguous, offer per-exercise correction without silently collapsing all exercises or fabricating values. Trailing comma and colloquial `pushups` must not break extraction.

## Verified current-branch mechanism (GitHub `enhance/bloom-experience`)
- `client/src/pages/ActivityLog.tsx`: `describe()` calls `describeActivityParts(description)` **synchronously** with `interpretation:'rule-suggestion'`. The UI explicitly says `Local text matching; no AI or external provider`. Editing the `Original description` box during review intentionally **does not rerun** the parser; users must return to the composer to review a new description. A code fix should preserve source and reviewed rows and make reparse/review action discoverable if necessary.
- `shared/activity-capture.ts` lines 99–107: top-level separator recognizes `then`/semicolon and an `and`/comma **only if the next token is a number followed by `sets of` or `x`**. It does not segment `10 pushups, bench press for 3 sets...` or `, 20 bodyweight squats`, and ignores common conjunction plus exercise patterns.
- `shared/activity-capture.ts` lines 48–74: set parser requires `^(?:did )?(\\d+) (sets? of|x) ...`, so common name-first `bench press for 3 sets of 10 reps for 225lbs` is unsupported; current `activityChoices` has only generic `strength`, not individual movement identity, and status may incorrectly be `Suggested match` for a generic source chunk.
- `client/src/components/ActivityReview.tsx` faithfully displays parsed `ActivityDraftComponent[]` and editable `ActivitySetEditor`. Bug is primarily in **parser/extraction**, not a need to replace this review component or the canonical experience model.

## Binding fix scope, no new AI service or parallel data model
1. Implement a **deterministic, bounded exercise-span recognizer** in existing `shared/activity-capture.ts`, not merely a one-off regex for the failing sentence. Identify exercise phrase boundaries across sentence fragments and comma/semicolon/`then`/`and` clauses without splitting within quantities, parentheses, named movements or a comma-separated ordered load list. Support compound sentence that mixes duration cardio, simple number+exercise bodyweight reps, name-first and count-first set descriptions, `225lbs` with and without space, and trailing punctuation. Preserve unrecognized segments as **their own** reviewable original text; never drop/merge them into a misleading `Strength exercise`.
2. Normalize movement name aliases in a small, versionable catalogue (`pushups`/`push-ups`, `bench press`, `bodyweight squats`) **without losing full source name**. Distinguish recognized movement identity from guessed exercise type. A missing movement may remain source-named unknown rather than fabricated canonical exercise.
3. Parse `bench press for 3 sets of 10 reps for 225lbs` to 3 explicit `ActualSets` rows: 10 reps and 225 lb each with converted internal `loadKg` and recorded `loadUnit:'lb'` as applicable. An actual 10-pushups/20-squats input is **reps**, not minutes; represent explicitly without invented number of sets if model cannot support single bout, or use a clearly named single reported set with `completed:false` and visible assumption/review. `bodyweight` is not a claimed external 0-lb load measurement.
4. All four rows visible in **one Review description** action; source text retained, counts and units editable; no need to manually create three missing exercises. UI copy should clarify `Recognized from your description—confirm before saving` rather than simply `Suggested match` with missing details. Existing `ActivitySetEditor` expands each row. Respect existing original vs reviewed text semantics.
5. Preserve current save idempotency/atomicity, revision integrity, undo, source/amount provenance, reported vs completed state, unit conversions and activity history. No fabricated 45-minute strength duration, completed workout, calorie estimate, active workout timer, muscular fatigue or medical effects. No privacy exposure to external AI/provider.
6. Add explicit **reparse** affordance only if users are expected to edit the description and ask parser to update rows. Never silently replace reviewed manual corrections; show impact and confirm before replacement. The existing initial Describe flow must work without extra user interactions.

## Mandatory regression fixtures and acceptance
- The **exact quoted sentence**, including trailing comma, yields **four** rows with all specified quantities and the correct unit, with no extra phantom activity.
- `Ran for 45 min then did 10 pushups, bench press for 3 sets of 10 reps for 225lbs, 20 bodyweight squats` same.
- `bench press 3 sets of 10 reps at 225 lb`; `3 sets of 10 reps bench press at 225 lbs`; `did 10 push-ups and 20 squats`; `3x10 squat 100kg`; routine `ran 20 minutes then 10 pushups`.
- Comma-separated loads (e.g. `3 sets of 10 reps bench press (135, 155, 175 lb)`) should not be split into distinct exercises; preserve unsupported patterns for manual review without invented load.
- Sentence separators, quoted/punctuation names, no exercise recognized, >20 segments, repeated movements with different loads, number/weight text ambiguities and English colloquialisms. Never parse weight as reps or minutes, or 225lbs as person bodyweight.
- Real React review test and API save→reload/history correct four component rows and sets, no change/loss after editing a different row; duplicate save retry, correct lbs display, no source mutation. Mobile actual 390px/320px first viewport, scrolling/keyboard/VoiceOver, visible `Change` per row; correct source vs unknown/estimated statuses.
- Focused test and type/build, relevant full suite once at meaningful checkpoint, tested Git SHA/CI and exact deployed preview SHA plus owner reproduction; no claim of fix from parser-unit pass alone.

## Priority and autonomy
This is a **newly reproduced owner-facing regression**, not stale source/unit hardening. Insert near top of actual current `NEXT_ACTIONS.md` for immediate Codex implementation ahead of optional v0.6 features and UI polish, while keeping other genuine core P0 tasks on queue. Codex makes reasonable implementation decisions, tests/commits/pushes existing dev branch, and continues; **do not wait for interim specialist or Architect approval**. Follow Branding's meaning-first, clear editable capture→review→save, no jargon or redundant warnings.
