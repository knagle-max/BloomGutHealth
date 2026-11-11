# Bloom v0.6 — Food Journal Editorial UI Handoff (implementation slice v1)

**Audience:** Brand Specialist → Chief Architect → UI Development Agent / Codex  
**Source:** `knagle-max/BloomGutHealth`, branch `enhance/bloom-experience`, inspected at exact commit `2f46108141369536eb9a777ae4edbf3a1bba567d`. **Do not apply blindly to a moved HEAD.**  
**Scope:** `client/src/pages/LogMeal.tsx`, `client/src/pages/NutritionHistory.tsx`, plus one new scoped stylesheet.  
**Status:** Source-referenced proposal with executable patcher and production-style CSS; **not installed, compiled, browser-tested or merged**.

## Decision

Adopt the proposed premium editorial direction but **do not replace the existing TSX with the shorter user-supplied versions**. In particular, the proposed NutritionHistory removes working features. This first integration slice is deliberately a **conservative additive change**. It upgrades the presentation while preserving the complete existing page bodies, hooks, data contracts, callbacks, validations and safeguards.

## Exactly what changes

- The two root pages receive scoped `bloom-food-editorial` identifiers.
- Both headers gain responsive, editorial typographic hierarchy.
- Composer, alternate input methods, reviewed drafts and saved confirmation receive shared tactile **theme-token-driven** surfaces, not hardcoded emerald/stone or always-dark editorial panels.
- Nutrition History daily/monthly/yearly panels use the same design language.
- Journal meal cards become a more open, editorial list (separator rows rather than isolated bordered dashboard cards).
- Focus-visible outlines, reduced-motion rules and a light/dark/Everyday/Athlete-compatible token system are included.

**No generated images, metrics, nutrient facts, inferred status labels or new functional promises are introduced.** Existing `EditorialMedia` remains unchanged.

## Current functionality that must remain present

1. **LogMeal:** edit and save flows; ingredient quantity and source identity; user-owned draft validation; USDA catalogue and mass handoff; saved/recent foods; optional barcode/search/photo capability gates; restaurant context; portion and symptom entry; optional AI consent; review revision; source conflict (`409`); idempotent save, ambiguous network save handling, same-key reconnect recovery, `reviewRejected` and `sourceDraftIncomplete` states; frozen inputs; all source disclaimers.
2. **NutritionHistory:** 20-entry incremental loading and **Show more**; meal edit, save-for-reuse and delete; logged meal time and symptom context; `MealAnalysis`; food-to-molecule research disclosure via `explainFoods`; ingredient details; full monthly **and yearly** trends; no misrepresentation of incomplete nutrition; source freshness and fallback; existing journal return-focus behavior.
3. **Data invariants:** unknown != zero; partial contributions != entire daily intake; no revised nutrient calculations; historical UTC day basis retained; provider/database provenance unchanged; no silently merged meal source IDs.

## Real code and exact application instructions

The ZIP contains:

- `scripts/apply_food_editorial.py` — exact-anchor, preflight-checked **code transformation** applied to the current existing TSX. It refuses unexpected markup rather than guessing and changing the wrong file. It is idempotent for already-patched anchors.
- `files/food-editorial.css` — fully authored production-style CSS, scoped to Food pages and inherited brand tokens.

From a **clean isolated worktree** at the pinned source commit (or after Architect reviews compatibility with newer HEAD):

```bash
# Copy the package's scripts/ and files/ into your worktree or invoke by absolute path.
python3 /path/to/handoff/scripts/apply_food_editorial.py

git diff -- client/src/pages/LogMeal.tsx client/src/pages/NutritionHistory.tsx
# Check that only class names / CSS imports changed in the original TSX.
# Run project-defined typechecks, unit/integration tests and actual browser visual QA.
```

The script adds `client/src/styles/food-editorial.css`. Since CSS is imported from both target pages, Vite will include it via the existing application bundler. No new runtime library is needed.

### Why not introduce `SurfaceCard` everywhere?

The proposed `primitives.tsx` is still a separate R4/M1 integration decision and may not exist in runtime. The current repository **does** contain `Card` and `.bloom-panel`. Replacing all those with a custom primitive before integration is unnecessary risk. These scoped class rules provide tactile treatment to current components while keeping their JSX structure and behavior. Architect may consolidate into `SurfaceCard` later only after prop/semantics/slot and theme parity are proven.

## Visual direction for Brand

Use warm paper, approachable editorial typography, natural photography, generous breathing room and clean measurements. Avoid turning meal entry into a sequence of dark gradient cards. In the journal, day groups and meals should read like a personal record, not a financial dashboard. Do not use decorative meal photographs to imply measured food identity. Build separate future proposals for intentional meal imagery, grouped-day navigation and a proper nutrition telemetry grid after this preservation gate.

## Required follow-on implementation (separate PR)

1. Extract an accessible `JournalMealRow` and `JournalNutritionSummary` only after validating existing behavior; eliminate duplicated style logic.
2. Review mobile disclosure affordances; preserve the existing semantic `aria-expanded`, labels and edit/delete interactions.
3. Verify `Show more`, yearly and monthly summaries, save meal reuse, scientific explanation and context details with actual data.
4. Improve multi-day date navigation and historical filters only after confirming existing data boundaries.
5. Optional `TelemetryMetric` extension: render known numeric, partial, null and source labels without inferring health states; no fake completion percentages.

## Acceptance tests and proof

- **Branch:** isolated feature branch; one owner integrates into v0.6; no direct concurrent writes to active integration branch.
- **Markup:** assert key selectors and original workflows are still present (`button-review-meal`, `button-save-meal`, `SaveMealButton`, `MealAnalysis`, `explainFoods`, `setHistoryLimit`, `EditorialMedia`, `recordedMealTime`).
- **Workflow:** new meal, edit, choose saved/recent meal, search/barcode capabilities, review, correct portion, save, ambiguous network save, retry, offline reconnect, source mismatch; delete and reuse saved meal; Show more 20→40+; recorded context and provenance; monthly/yearly history and partial missing values.
- **Presentation:** 320 / 390 / 768 / 1440px, 200% browser zoom; keyboard and touch; screen reader disclosure controls; light/dark and Everyday/Athlete themes; missing/empty/error/loading/partial/populated states.
- **QA:** same-SHA before/after screenshots, `git diff --check`, client typecheck, relevant automated tests, full existing CI and real Render preview check if deployed; report exact PASS / FAIL / NOT TESTED.
- **Scientific:** no simulated nutrition values, manufactured pathway or unsupported biological advice; preserve all limitations.

## Architect handoff disposition

**Approve as additive editorial CSS/TSX class-only trial**, not as full replacement. Escalate any change outside styling to the Architect, particularly hook/data-flow changes, first-party data handling, user-owned source validity or statistical interpretation. Merge only after actual test evidence. Continue substantive Food workflow simplification in a separate PR.