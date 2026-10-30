# Exact owner five-set parser regression — local synthetic evidence

Source requirement: architect17af0e1/1bd3963, Amendment C v1.3. Exact input: `Ran then did 5 sets of 10 reps of bench press for 50,50,50,55,55 lbs`.

`before-390.png`: actual App/API with only shared/activity-capture.ts pinned to1af9a53 using the documented Vite source override. This is a component/parser-source comparison, **not** a clean entire-repository historical build. Two suggested parents, generic Strength exercise and no child sets, reproduced. No save.

`after-390.png` and dark variant: actual current App/real HTTP handlers/encrypted PGlite, synthetic account, local390px browser. Running unknown; named Bench press, five expanded rows10reps with50/50/50/55/55lb. `after-390-annotated.png` callout1 identifies corrected parent/count,2 identifies independently editable Set4. Originals are unmarked. A fixed navigation bar appears at the original viewport bottom in full-page screenshots.

Actual browser then changes only Set4 to9reps/60lb, edits review text, saves once, reloads and reads the same IDs/quantities in both modes. Original source stays exact, no completion/duration/distance/effort invented. Count mismatch opens named Check sets with empty editable rows and keyboard Add set; no silent list truncation/repetition.320/390px overflow and light/dark PASS. Script: scripts/qa/exercise-five-set-journey.mjs. Test and publication commit tracked in BACKLOG.md.

Not a hosted screenshot, physical-device, VoiceOver, real200% browser-zoom or independent acceptance result. Original v1.3 archive/exercise-review-per-set.svg is not accessible in the checked-out attachments or connected file tools; it has not been imported/recreated. Existing original v1.2 sources remain unchanged. Original transfer, actual hosted comparison and independent Branding/User Testing acceptance remain open; deterministic correctness repair does not depend on fabricating those artifacts.
