# Athlete compact set editor — local source comparison

Implements remaining Athlete set presentation in MKT-FLAG-UX-2026-10-26-A1 §4 with Amendment D's shared completion/edit grammar. Uses existing session payload/storage/save/correction/reference contracts. No exercise prescription, inferred completion or change to nutrition targets.

Before: TrainingSetsEditor.tsx and ActivitySetEditor.tsx pinned at68d1c27ff2a4720810ef4b2ae23bf0c64a7d3007, current App/API/styles. Component-family comparison, not a clean whole historical build. After: this implementation commit. Both use same synthetic planned session, five Bench press sets,10reps,50/50/50/55/55lb; same earlier confirmed9rep40–44kg references, selected date, pending states, viewports320/390 and light/dark. Unmarked originals retained; annotated390 highlights real changes.

Visible changes:
1. One exercise heading and child-derived count/reps/load-range replace repeated expanded exercise fields.
2. Compact rows share separate44px completion/edit controls with Activity Review. Current values retain their saved lb unit even when body-weight preference is kg; individual unit selection converts the display without changing canonical mass.
3. Previous references remain sourced, dated and separate from current performance; source date/title on demand. Set fields open individually. New rows open/focus their exercise input; removal preserves unaffected IDs and returns focus to a neighbouring edit control.

Verification: training-compact-ui-journey actual App/HTTP/encrypted PGlite; independent completion1+2→2of5, Set2-only9×60lb, kg/lb display conversion, previous exact-name/ordinal/source date, add/remove/focus/stable IDs, save/reload and session remains planned. Legacy rows receive stable draft IDs without mutating source objects; explicit correction/delete/save preserves remaining IDs and values. No extra session created, other owner remains inaccessible. Five widths320/375/390/430/1280 light/dark no overflow;44px targets and keyboard completion tested. Existing training-sets journey reverified exact lost-response retry, saved correction, no auto-fill, dates/name/ordinal/self exclusion, unavailable history, timer pause/resume/reset/no writes and calendar statuses. Exact Activity Review journey reverified shared control parity.

Full464/464 Node milestone passes; focused source/history/parser tests, types/build/source guards checked separately after final edits. Original Amendment D SVG remains inaccessible; this is implementation against binding owner text/current committed flagship contract, not exact SVG or independent visual acceptance. Actual Apple VoiceOver/device/hosted screenshots and Design approval remain OPEN. Synthetic local Chromium evidence is labelled accordingly.

Reproduce: BLOOM_PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright BLOOM_CHROMIUM_EXECUTABLE=/usr/bin/chromium node --import tsx scripts/qa/training-compact-ui-journey.mjs. Optional BLOOM_TRAINING_UI_REF=68d1c27 selects the documented two-component source baseline; BLOOM_REVIEW_OUTPUT controls output directory.
