# Unitless parenthesized Exercise regression — local synthetic evidence

Historicale320e0c behavior. Owner later directed use of saved body-weight unit as an editable default; see ../exercise-load-unit-default-20261030/README.md. Parser-stage unknown units remain raw source facts; normal UI now defaults without extra confirmation.

Requirement: architect d166612, exact owner input `Ran 45 min then did 5 sets of 10 reps of bench press (50,50,55,55,60)`.

Before: actual App and HTTP handlers, with four browser source files pinned to d166612: shared/activity-capture.ts, ActivityLog.tsx, ActivityReview.tsx, ActivitySetEditor.tsx. Existing backend/other UI remains candidate source. This is an explicitly scoped source-family override, **not** a clean entire-repository historical build. Running45min and named bench Check sets with zero child rows reproduced; no activity created.

After: current candidate runtime, actual App/API/encrypted PGlite with synthetic owners,390px. Running45min, Bench press/five expanded10rep rows with50/50/55/55/60, all units unresolved. Full-width per-set Unit unknown controls remain readable on narrow screens. Annotated callout1=parent/five rows;2=explicit remaining-list confirmation;3=independent Set4 confirmation. Unmarked originals retained. Fixed navigation appears at the initial viewport seam in full-page captures.

Actual test: unresolved save sends no request; direct API bypass with draft-only numbers returns400. Edit only Set4 to9reps/60 before confirmation, Back and source-text editing preserve overrides. Confirm Set1kg, remaininglb without changing Set1; one encrypted activity saves with Running45 and bench duration unknown. Reload and real mode-settings changes preserve all child IDs, original source, reviewed text, per-set units and quantities. No completion/energy inferred, no duplicate session. Zero and optional clearing verified,320/390px overflow/light-dark PASS. Earlier explicit-lb five-set regression also passes.

Script: scripts/qa/exercise-unitless-set-journey.mjs, optional BLOOM_PARSER_SOURCE_REF for baseline; source hashes in source-receipt.json identify candidate runtime. Full462/462 tests PASS195570ms; final7 focused/type/build/source guards PASS. Test receipt is local synthetic, not hosted authenticated/physical/VoiceOver/real200% browser zoom or independent Branding/UT acceptance. Original v1.3 asset transfer remains separately open; no source SVG generated or misrepresented as imported.

Theme-evidence correction2026-10-30: this historical exercise harness used browser color preference alone; any dark-labelled capture from that path is not valid proof of the app dark theme. Retained as historical source evidence, not dark acceptance. Current regenerated exercise-compact-amendment-d-20261030 and exercise-shoulder-sets-20261030 packets use actual app theme controls and assert the theme class. Canonical parser/save results are separate from this capture defect.
