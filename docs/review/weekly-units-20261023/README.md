# Weekly planning display units — synthetic review

Advances ARC-UNIT-001 and ARC-UT-03/07. Baseline: immutable `fe3d3377194ec54908c7f94990d842184c4f69db`. Candidate: the commit containing this package (capture manifests accurately record an uncommitted candidate).

Visible differences: (1) day/meal energy and energy-check bounds use kJ; (2) prepared recipe amounts use ounces; (3) the shopping list uses ounces while the labelled canonical target editor stays in kcal. Unmarked originals are retained.

Weekly day/meal energy, energy check values and bounds, nutrient detail rows, prepared ingredient quantities, shopping/print quantities and recipe-library shopping masses now consume the existing independent account preferences. Target-entry fields explicitly retain canonical kcal/source units. Saved requests, safety/check decisions, logging payloads, lab values and original source preparation instructions retain their existing meaning.

| Viewport / theme | Before | After |
| --- | --- | --- |
| 390 × 1000, light | [Baseline](before-weekly-390-light.png) | [Candidate](after-weekly-390-light.png) |
| 390 × 1000, dark | [Baseline](before-weekly-390-dark.png) | [Candidate](after-weekly-390-dark.png) |
| 1440 × 1000, light | [Baseline](before-weekly-1440-light.png) | [Candidate](after-weekly-1440-light.png) |
| 1440 × 1000, dark | [Baseline](before-weekly-1440-dark.png) | [Candidate](after-weekly-1440-dark.png) |

Screens show an intentionally incomplete synthetic plan; saving stays disabled. Separate complete synthetic fixtures verify that save requests retain canonical targets and logging retains canonical grams. Browser assertions also cover conversion of target bounds, unknown fiber versus zero sodium, the recipe library, a fresh kcal/gram preference, and horizontal reflow. This isolated screen harness loads the real components/providers/styles and intercepts API calls; it does not establish database, provider, physical-device or specialist acceptance.

Reproduce from the repository with `node scripts/qa/weekly-display-units.mjs`. Supply `BLOOM_PLAYWRIGHT_MODULE` and `BLOOM_CHROMIUM_EXECUTABLE` if Playwright/Chromium are outside the default module/browser location. Optional `BLOOM_REVIEW_OUTPUT`, `BLOOM_CAPTURE_ROOT` and `BLOOM_CAPTURE_STAGE=before` select the output directory and immutable baseline checkout. Link/install the pinned dependencies in that checkout. Locale en-CA; timezone America/Regina; fixed synthetic clock; fonts blocked equally across captures. Full production bundling remains a separate check; the isolated harness never uses the camera decoder.

Validation: TypeScript, 180 Node tests and production build passed locally. Browser results are in [before-results.json](before-results.json) and [after-results.json](after-results.json). Remote CI and Render must be checked against the pushed SHA separately. Independent Branding, science, accessibility and real-device reviews remain pending; v0.5 is incomplete.
