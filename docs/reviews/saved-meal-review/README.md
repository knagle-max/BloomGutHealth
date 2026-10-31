# Saved meals → canonical ingredient review

Matched 390×1000 Everyday light, synthetic encrypted template, en-CA / America/Regina, October26 12:00 local, same saved-source entry URL with a 2× multiplier. Before source:141a0caf357529d26ee288e6d45a167fa85f073d. Actual App/API/PGlite journey; not hosted-owner or physical-device acceptance. The old list's quick logging path remains available.

1. [Before source intake](source-before.png) → [loaded source, annotated](source-after-annotated.png): an owned saved recipe now loads its existing ingredient identities and scaled portions into the canonical food draft instead of opening an empty entry chooser. Source errors have an explicit retry.
2. [Ingredient review, annotated](review-annotated.png): adjust an amount and recalculate; confirmation remains unavailable while the review is dirty. Confirming creates one new journal entry; the original saved recipe retains its original quantities.

Unmarked originals: [loaded source](source-after.png), [ingredient review](review.png). List-only near-identical screenshots are intentionally omitted. Test `scripts/qa/saved-meal-review-journey.mjs` verifies failure/retry, 2× portion, correction, no row before confirmation, unchanged source, owner isolation and320px reflow. Nutrition remains sourced estimates, not an invented recalculation or inferred tolerance.
