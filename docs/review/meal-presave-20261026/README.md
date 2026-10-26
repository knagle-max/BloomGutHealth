# Meal review before journal confirmation

Matched 390 × 1000 light-theme synthetic account, fixed October 26 noon America/Regina, `100 g banana, 20 g oats`, first primary submit. Baseline `c2df959`; after is this implementation. Actual React app, planner API and embedded PostgreSQL; no external nutrition or real user data. Original PNGs retained alongside annotated copies.

1. **Before:** the first submit already persisted the meal and displayed “Your meal is saved.” **After:** “Review before saving” explicitly says it is not in the journal; SQL row count is zero.
2. **Before:** portions were editable only below the saved result. **After:** the unsaved review presents foods and source amounts directly, with portion guidance on demand.
3. **After:** source estimates and missing-value limits remain visible; deeper nutrition sources and science are disclosed below the food review. Explicit confirmation is still required after corrections.

The journey also verifies dirty-review withdrawal, no writes during recalculation, source-change rejection, unaware-server refusal, pending input freeze, lost-response receipt recovery and 320/390/1280 reflow. This is functional workflow evidence; independent design, clinical, native and real Tester1 acceptance remain pending. Newly referenced editable Food Review design sources are not verified in this checkout.

Reproduce with `scripts/qa/meal-presave-review-journey.mjs`; set `BLOOM_REVIEW_BASELINE=c2df959` for before and `BLOOM_REVIEW_EVIDENCE=/tmp/meal-review-evidence` for capture.
