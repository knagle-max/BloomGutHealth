# Bloom — CHART-A01 to CHART-A08 verified delivery for Architect + Codex

**Date:** 2026-11-15  
**Branch:** `enhance/bloom-experience`  
**Status:** All eight standalone archives **verified in Shared Library**. All eight registered in `docs/visual-assets/scientific-chart-asset-registry.json`. This is a delivery verification **not** a claim of GitHub-binary installation, app integration, scientific signoff, or rendered-browser visual acceptance.

## Canonical binary source and convenient all-in-one download
Shared Library folder: **`Bloom gut health / Agent Handoffs /`**

**One archive containing the eight original kit ZIPs and four editable SVG + four PNG design examples:** `Bloom_CHART_A01_A08_All_Assets_And_Examples_2026-11-15.zip` (1,284,419 bytes). It includes `DELIVERY_INDEX.json` with complete SHA-256 hashes for each original archive and file count; do not unzip and repackage originals before comparing archive hashes. The same `Bloom_CHART_A01_A08_DELIVERY_INDEX_2026-11-15.json` is separately available in Shared Library.

| Asset | Description | Shared Library ZIP |
|---|---|---|
| CHART-A01 | Four-theme scientific chart tokens | `Bloom_CHART_A01_Four_Theme_Tokens_2026-11-15.zip` |
| CHART-A02 | Observation marker symbols | `Bloom_CHART_A02_Observation_Markers_2026-11-15.zip` |
| CHART-A03 | Observed / provisional line strokes and gradients | `Bloom_CHART_A03_Strokes_Gradients_2026-11-15.zip` |
| CHART-A04 | Scientific axes, grid, units and responsive labels | `Bloom_CHART_A04_Axes_Grids_Labels_2026-11-15.zip` |
| CHART-A05 | Source intervals and decision thresholds | `Bloom_CHART_A05_Reference_Intervals_Thresholds_2026-11-15.zip` |
| CHART-A06 | Missingness, partial coverage and uncertainty | `Bloom_CHART_A06_Missingness_Uncertainty_2026-11-15.zip` |
| CHART-A07 | Source-linked crosshairs, tooltips and inspection | `Bloom_CHART_A07_Source_Inspection_2026-11-15.zip` |
| CHART-A08 | Legends, chart states and restrained motion | `Bloom_CHART_A08_Legends_Annotations_States_Motion_2026-11-15.zip` |

## What the visual example demonstrates
Editable sample SVGs for **390px Everyday Light/Dark mobile** and **1180px Athlete Light/Dark desktop**. Examples use A01 actual palette values and conform to A02–A08 visual specifications. They show a soft source interval, measured segments, a deliberate disconnected April gap, selected point crosshair, legend and source summary below plot/on the desktop side. Every value/date/interval is **fictional sample data**, never a patient's record. SVG specimens are not after-screenshots of the application.

## Codex extraction / integration contract
1. Obtain the all-in-one archive or each individual kit from Shared Library, extract the kit archives and verify all checksums in `DELIVERY_INDEX.json` and each kit's `manifest.json`. If a binary archive is inaccessible from Codex runtime, treat as **blocker**, not as permission to recreate styling from memory.
2. Place source assets under `design/visual-system/scientific-charts/v1/` or the Architect-approved equivalent. Preserve individual kit source directories, IDs, and editability.
3. Import CSS **once**, scoped to `.app-shell[data-bloom-visual="premium"] .bv-scientific-chart`. Do not create competing global CSS or replace Bloom's brand tokens. Reconcile actual selector precedence before implementation.
4. Keep all existing data, dates, units, method comparability, source corrections, reference intervals, lab-range selection and original source inspection. Do not flatten plots into images: chart geometry and labels come dynamically from canonical source data.
5. Implement on `LabTrend.tsx` first (B01/B02/B03 pending), then FoodProgress/NutritionHistory. Existing behavior and navigation preserved. All sample geometry is for reference only.
6. Source scientific acceptance: true reference ranges, uncertainty/source permissions; review via Biology and Architect. UX approves source-disclosure continuity, focus and tap behavior. Developer documents screenshot captures 320/390/768/1440 for four theme combinations and 200% zoom. Designer reviews actual same-SHA screens.
7. Do not consider A01–A08 **Integrated** or **Visually Verified** until the above passes.

## Delivery audit
- All 8 archive filenames were individually observed in Shared Library under the same folder.
- All 8 GitHub registry IDs were fetched and confirmed, lifecycle `Generated`.
- All 8 local archive ZIPs passed `testzip()`, each includes a manifest; 4 example SVGs passed XML parse, plus their rendered PNG variants.
- No image-generation service was used to fabricate charts: example is editable vector source produced from A01 values.
- **Remaining:** Source binaries are not confirmed committed inside GitHub. Codex import and application acceptance remain open.
