# Bloom — Completed owner-authorized baseline-44 anatomical domain registry and 553-exercise mapping

**Date:** 2026-11-26  
**Scope:** Wellness education only · **Dataset:** 553 staged exercises · **Geometry:** original 24 front + 20 back SVG paths.  
**Directive:** Owner requested completion without a separate Architect approval loop. This package is a completed **domain staging specification**, not a claim that the Architect independently signed it or that production code/Render was modified.

## Completed outputs

1. `canonical_anatomy_registry.json` — permanent, side-specific, newly minted `anat.*` IDs for **44 canonical-active selectable surface regions**, plus 19 nonselectable aggregation parents and 16 deferred anatomical descriptors. No SVG names used as canonical domain IDs.
2. `canonical_to_svg_crosswalk.json` — 44 unique geometry bindings plus an explicit disposition for **all 53 exercise muscle descriptors**.
3. `bloom_exercise_db_staging_canonical_mapped.json/.csv` — **553 records** whose muscle associations now reference the constructed anatomical domain registry where defensible, or explicit null/deferred entries elsewhere. All 553 retain `review_status=unreviewed` because anatomical map success is not evidence of individual biomechanics sign-off.
4. `anatomy_muscle_53_resolution.csv` and `canonical_anatomy_validation_report.json` — deterministic audit and exception list.

## Quantified resolution

- Original geometry: **44/44 path IDs** preserved, 24 anterior, 20 posterior.
- Permanent baseline IDs: **44/44 unique**, with explicit laterality and no invented V4.3.3/V4.3.4 IDs.
- Muscle descriptors: **37** assigned coarse-surface visual anchors, **16** correctly left deferred; original raw source inventory had 47 name-hint candidates and 6 unmatched, but this review **does not promote all 47 mechanically**.
- Original exercise-muscle-role associations: **3102**. Generated visual projection bindings: **8312** canonical-surface links; **629** deferred role associations. These expanded projection counts **must not be summed as exercise/muscle activity counts**.
- Staging exercise count: **553**, all unreviewed.

## Core anatomical decisions

- **Laterality:** On the front view, the person's right is the illustration's left. On the back view, the person's left is the illustration's left. IDs ending `-01`/`-02` are interpreted by side using exact frozen path geometry, not arbitrary name suffixes.
- **44 baseline regions are surface composites**, not claims that 44 separate muscles are individually isolated. Upper/middle/lower anterior abdominal paired sectors correspond to core 01–06, lateral/oblique paired sectors to 07–08.
- **Multiple descriptors may map to one surface region** (biceps and brachialis; gluteal group; quadriceps). Their distinct biomechanical roles remain independent in the exercise record; never invent muscle recruitment percentages.
- **Multiple surface anchor IDs for one muscle** (e.g. both sides or broad front/back shoulder) represent a single muscle label, **not additive independent observations**. UI/rollup must deduplicate stable underlying exercise/observation IDs.
- **Deep/no-fitting-surface structures stay deferred** rather than misrepresented; notably rotator cuff, supraspinatus, transversus abdominis, lower trapezius, and other groups explicitly listed in the crosswalk.
- **Separate symptom domain:** This registry is for educational exercise-muscle surface mapping; do not replace the independent canonical 47-region symptom taxonomy or BVA-0087–0089 mapping.

## Release gates and frozen state

No source SVG edits, runtime/GitHub file writes, database migrations, server deployments or Render modifications were performed. The data specification and staging export are complete. Codex may consume this package only under the project's active authorizations and release constraints. Real-render positional/screen-reader QA and independent per-exercise scientific review remain **not executed**, not falsely shown as complete.

## Installation instructions for Codex

Reuse existing exercise and map modules. Place two domain JSON files under a single architecture-approved location (do not create a new parallel registry if an authoritative existing registry is discovered). Import `bloom_exercise_db_staging_canonical_mapped.json` only to an isolated staging table; never overwrite approved exercise data or existing symptom-region observations. Preserve original source revision IDs, all existing statuses and manual user edits; if the live repo has different 44-map source checksums, block the import and reconcile the diffs. Only promote exercise rows to `reviewed` with recorded exercise-specific science acceptance; nothing in this package constitutes that acceptance.

## Tests supplied / still required

Deterministic static tests pass for schema, 44 path integrity, sides, unique IDs, the 53-muscle decision table, no unknown map references, 553 unchanged exercise titles and statuses. Visual device/AT checks, component integration, user-data protection, side-specific highlight behavior and independent scientific validation cannot pass without executing the relevant app and review protocols.
