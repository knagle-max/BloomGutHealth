# Athlete nutrition and hydration display regression

ARC-UNIT-001: daily team energy target, known intake, meal-option energy, prepared shopping weights and sweat-loss estimates now honor independent saved energy, food-mass and hydration units. Daily body-mass/profile entry was already converted; this closes display gaps. Scientific carbohydrate/protein units, original recipe instructions, source calculations, clinical gates and canonical review links are preserved.

Run `node scripts/qa/athlete-nutrition-units.mjs` with Playwright installed, or set `BLOOM_PLAYWRIGHT_MODULE` and `BLOOM_CHROMIUM_EXECUTABLE` to installed locations. Optional `BLOOM_REVIEW_OUTPUT` selects results output. This uses the actual screen/providers/styles in an isolated harness, mocked synthetic APIs, a fixed clock, en-CA locale and America/Regina timezone.

Assertions cover overview/fueling at 390 and 1440px, light/dark, kJ/ounce/US-fluid-ounce preferences, fresh kcal/gram/litre preferences, unavailable energy, invalid hydration estimates, unchanged canonical meal-review links and horizontal reflow. [Results](results.json) identify the source SHA and dirty candidate state truthfully. Full app build and API/database regression tests run separately. No routine before/after gallery is added, following the 2026-10-23 selective visual-evidence clarification.

Validation: TypeScript, synthetic Chromium checks, all 180 Node tests and production build passed locally. CI/deployed SHA must be checked after push. Independent device, accessibility, scientific and Branding acceptance remains pending; no measured effect or real device connection is claimed.
