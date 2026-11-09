# Progress and shared food preferences — UT-RED-203/204

Visible changes:
1. Recent dated body measurements and response ratings lead Progress, with dates and an action to record a dated observation. Missing values are not displayed as zero.
2. The undated Profile snapshot and shared unit settings move into a secondary disclosure. Weekly response/experiment forms are secondary to the observation and laboratory views.
3. Profile and My Biology replace duplicate full food-preference forms with summaries showing exclusions and separate allergy context. Both link to the existing planner editor and shared store.

| Matched synthetic Progress view | Before (`2081821`) | After (this commit) |
| --- | --- | --- |
| 375px, light | [Original](before-progress-375-light.png) | [Candidate](after-progress-375-light.png) |
| 1440px, light | [Original](before-progress-1440-light.png) | [Candidate](after-progress-1440-light.png) |

Unmarked originals are retained. The numbered callouts above identify the visible differences; this is a layout comparison, not participant evidence. Capture manifests identify the immutable baseline and dirty candidate truthfully. All records are synthetic; same viewport, locale, timezone, date, theme and blocked fonts. Reproduce with `node --import tsx scripts/qa/progress-layout-review.mjs`, optionally `BLOOM_CAPTURE_ROOT`, `BLOOM_CAPTURE_STAGE`, `BLOOM_REVIEW_OUTPUT`, `BLOOM_PLAYWRIGHT_MODULE`, `BLOOM_CHROMIUM_EXECUTABLE`.

TypeScript, 182 Node tests and production build passed. The [cross-workspace regression](../unit-editors-20261023/results.json) verifies propagation from the single food editor, visible safety context, a direct dated-check-in destination, canonical values, nulls, responsive/keyboard behavior and error recovery. APIs are intercepted; remote CI/deployment and independent specialist/device/accessibility acceptance are separate. No new medical interpretation, clinical target or provider processing is enabled.
