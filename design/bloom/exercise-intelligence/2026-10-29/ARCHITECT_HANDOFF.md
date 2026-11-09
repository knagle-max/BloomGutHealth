# Bloom — Branding & UX Exercise Intelligence Review
Date: 2026-10-29 | Version: 1.2 | Proposed for Architect consolidation | Implementation not verified

## Decision
Conditionally endorse ML-ACT-1001–1008 and UT-EXAI-2701–2708. Enforce exact UX blueprint and supplied editable screens. The approved flagship art direction is the quality bar; these SVGs encode layout/flows for this feature, not final clinical content or production UI. Architect reconciles safety, source contracts and schedule; Developer must implement reviewed UX rather than reimagine screens.

## MKT-EXAI-2801 (P0) canonical, truthful display
One account-owned activity identity; recorded vs planned, measured vs estimated, unknown vs zero; no double-counted energy/food credit.
## MKT-EXAI-2802 (P1) three-route capture
Describe / Select / Repeat previous; fallback without AI/voice/device; one review+save, <=3 primary stages for simple selection.
## MKT-EXAI-2803 (P1) suggested activity review
Type/duration/date and known qualifiers shown, raw text accessible; missing details never inferred, correction immediate.
## MKT-EXAI-2804 (P1) Everyday presentation
Human duration/activity and optional active calories with source, no physiological score or Athlete signup.
## MKT-EXAI-2805 (P1) Athlete depth
Same underlying record; sets/reps/load, curated muscles, approved training detail; preserve on mode switch.
## MKT-EXAI-2806 (P1, P0 integrity) progress and source
Sourced activity trends; no punitive zeros or interpolated readiness; edit history and correction reflected across screens.
## MKT-EXAI-2807 (P1) premium visual and accessible states
Use accompanying SVG references and UX_BLUEPRINT.md: card hierarchy, concise copy, deep branded hero, interaction/motion contract, 320px and assistive tech.
## MKT-EXAI-2808 (P0 verification) sign-off
Exact SHA, end-to-end recorded real app demos, accessibility and independent science/UX/UT review. No silent redesign.

## Source basis and limits
Reviewed User Testing handoff 2026-10-29 and ML specialist handoff 2026-10-29. Prior adaptive training and everyday activity designs remain in effect; do not supersede. This is visual/UX review; not evidence of code or model performance.

## Handoff
The ZIP alongside this document includes editable screen SVGs (3 light + 1 dark), UX_BLUEPRINT, DEVELOPER_CONTRACT and this handoff. Architect must request design review for any UX deviation, integrate with existing backlog and supply Developer exact archive and manifest. Developer solely commits/deploys.


## Amendment A — Food Review–parity interaction (2026-10-29, supersedes conflicting review-layout directions)
**Design decision: mandatory, owner-requested.** The current Bloom Food Review screenshot supplied by the product owner is the **behavioral reference** for exercise review, not an instruction to copy its oversized spacing or science-inappropriate nutrient summary. Preserve the approved flagship art direction for visual finish. Do not create a separate exercise logging paradigm.

### MKT-EXAI-2809 — Reuse Food Review mental model (P1 UX, P0 truthfulness)
**Exactly:** User enters `Walked 30 minutes, then did 3 sets of bench press at 60 kg for 8 reps` → review header `Review your activity` + `2 activities recognized` → visible editable original description → compact rows `Walking · 30 min` and `Bench press · 3 × 8 × 60 kg` → each row has readable `Reported`/`Suggested match` status and **Change** → `Activity summary` showing only known walking 30 min and 3 strength sets → `Save activity` → same saved record updates Today, Athlete and Progress. Do not label parsed type as exact verified exercise identity without evidence. The example does **not** supply bench session duration, pace, heart rate, RPE, personal weight or kcal. Those stay unavailable; no guessed data.

### MKT-EXAI-2810 — Row editing, preservation and reversible correction (P1; P0 persistence)
Clicking **Change** expands only that row. Walking: type and duration; Bench: exercise identity, sets, reps, load, unit; date/time shared at session level and accessible without scrolling through long unrelated inputs. On edit, recompute only supported derived facts; preserve original description and user overrides. `Remove` removes that recognized component only; `Add another activity` is secondary; `Back` retains the unsaved draft. All capture methods use the same one review component and canonical save operation. Distinguish recognized values (reported text) vs proposed normalization (suggested exercise name).

### MKT-EXAI-2811 — Explicit screen hierarchy and feature differences (P1)
1. Header, subtitle recognized count; 2. original description in restrained surface; 3. vertical ingredient-like activity rows with compact status + Change; 4. collapsed `Review details & assumptions` for ambiguous source, activity classification, energy; 5. summary of **actual known** minutes and resistance sets, separately (never sum sets and minutes); 6. primary `Save activity` action sticky only if it doesn't obscure rows, keyboard or tab bar. Strength exercise row can expand into set-by-set editor in Athlete after user asks for detail; do not force that on Everyday. Show source and uncertainty in readable language. Missing energy can show `Calories not estimated` in details, not placeholder zero.

### MKT-EXAI-2812 — Design-fidelity acceptance, required demo (P0 acceptance)
Developer must demonstrate (a) the exact description above produces two rows with correct reported fields; (b) Change Walking modifies duration without changing bench sets; (c) Change Bench load modifies only its record and unit; (d) original text persists; (e) no fabricated kcal/HR/bench duration; (f) save then reload and cross-mode projections retain detail; (g) original source/date and partial/unknown states; (h) 320px + 390px, 200% zoom, VoiceOver, keyboard, light/dark; (i) app screenshot compared side by side with `05-food-parity-activity-review.svg`. Show real deployed Render and exact SHA. No acceptance based on SVG alone.

**Architect directive:** Record this amendment as superseding any earlier recommendation that exercises use an unrelated card-stack or a mandatory Athlete metrics form. Preserve ML-ACT-1001–1008 and UT-EXAI-2701–2708 constraints. No independent visual redesign without Branding review. **Developer directive:** import all package contents into branch, preserve editable SVG + docs, implement existing canonical record services and shared component pattern. Correctness and safety gates remain ahead of aesthetics. No implementation or Architect acceptance claimed.

## Transfer
Full revised asset archive: Bloom_Exercise_Intelligence_UX_Assets_v1.1_2026-10-29.zip. Commit editable source files and contracts to `design/bloom/exercise-intelligence/2026-10-29/`; archive alone is insufficient.


## Amendment B — Per-set editing (supersedes conflicting Athlete-only editor wording)
# Amendment B — Per-set editing is mandatory (2026-10-29)

**MKT-EXAI-2813 — Exercise parent with individually addressable sets (P1 UX; P0 correctness).** Replace flattened `Bench press · 3 × 8 × 60 kg` as the only editable object with parent exercise `Bench press` and three explicit child rows `Set 1`, `Set 2`, `Set 3`, prefilled `8 reps / 60 kg` **because those values were reported in the text**. Per-set identity must be stable across edit/save/reload and mode switch. Group header may show `3 sets`, never conceal child editor behind an unrelated Athlete page. The Food Review–like review defaults to parent expanded for first-time strength recognition, and remembers accessible collapse only per current draft. Walking remains a compact sibling activity.

**MKT-EXAI-2814 — Atomic set editor behavior (P1; P0 data).** Each row independently edits reps, load and unit, with Done or inline commit, plus Add set, Duplicate set, Remove set, and optional complete-state control only when user actually performs/confirms a set. No inferred completed status from text describing sets; distinguish *described/performed*, *planned*, and *completion not confirmed*. Modifying Set 2 from 60 kg × 8 to 55 kg × 6 leaves Sets 1/3 unchanged. Removing Set 2 leaves two sets and reorders display labels while preserving stable internal IDs. Add set must not silently infer volume/load unless user explicitly duplicates or enters values. Batch defaults are shown as source-derived initial values, not false verified measurements.

**MKT-EXAI-2815 — Inline summary, states and source truth (P0).** Parent summary derives set count from actual child records; e.g. after changing Set 2 `Bench press · 3 sets` with `8×60 kg, 6×55 kg, 8×60 kg` in detail; show total reps (22) if all reported and comparable, but never fabricate duration, calories, RPE or muscle damage. Validation for empty/invalid/negative loads, missing rep count, unilateral side, different units and canceled sets; allow explicitly partial drafts with truthful labels. Same component in Everyday and Athlete, with Athlete able to expose more columns (warm-up, RPE, rest) on explicit disclosure; no separate store or Athlete gate.

**UX acceptance:** `Walked 30 minutes, then did 3 sets of bench press at 60 kg for 8 reps` → two activity parents, bench expanded with 3 sets each showing 8 reps / 60 kg. Edit only set 2 to 6 reps / 55 kg; save; reload; switch modes; all three independently persisted, walking unchanged. Delete set 1; append set 4; test stable identities and summary count. Preserve raw description, confidence labels, original/date/source and canonical idempotent save. Test small-screen 320px, 200% zoom, VoiceOver, keyboard, dark mode; no false green completed checks. Require exact-commit browser evidence and Branding fidelity approval.

**Architect:** Supersede earlier text in MKT-EXAI-2811 implying that set editor appears only in Athlete. The **set-level editor belongs in shared Review** when strength is recognized; it may be collapsed on later visits but must be readily available in Everyday. Resolve any schema capability concerns without changing this approved UX silently.

**Developer:** Follow `06-exercise-parent-per-set-review.svg` as the authoritative structure reference. Reuse existing exercise-set schemas where compatible; do not persist a flattened aggregate without the child sets. Maintain the established flagship palette and original Food Review mental model. All safety, source and licensing approvals still apply.
