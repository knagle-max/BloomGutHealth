# CHART-B02 Architect & Codex integration contract

**Scope:** Laboratory visualization only; do not change canonical tests, reference intervals, units or calculations. Preserve `LabTrend.tsx`, `LabRangeSelector`, `LabExplorer` and `LabSourceContext` existing source-aware actions. New CSS is additive, scoped to `.app-shell[data-bloom-visual="premium"] .bv-scientific-chart.bv-laboratory-biomarker`.

1. Resolve each observation against original laboratory source identity; require valid assay/method/unit/population/time applicability before drawing its reference interval. Ranges attach to records or scientifically justified comparable cohorts, never globally inferred from the selected observation.
2. For differing ranges/methods show record-scoped context and labels; where comparability fails split trend segments. Missing range must show 'Reference interval unavailable', not a blank green normal band.
3. **Lab reference interval** is different from **decision limit** and **published literature comparison**; render a source-reported band with solid borders, decision limit as long-dashed line, research comparison with stipple/dotted design and textual qualification. Published comparison is not a lab's recorded interval.
4. Selected observation panel must show exact original numeric value, original unit, collection timestamp/date provenance, source, lab, method, specific interval, comparisons/conversion and any reviewed corrections. Source withdrawn/revoked must be inaccessible, with the safe A06 state.
5. Actual x coordinate is proportional to original collection date/time; duplicate timestamps retain occurrence identity. No smoothing/inferred gaps/zero. No line between non-comparable cohorts. An outlier remains a regular observation (do not infer diagnosis or clinical concern from colors).
6. Chart screenreader description + exact-data table alternative, keyboard navigation, focus return after source drawer, 44px tap target. All states loading/empty/error/one-point/revoked defined by A06/A08.
7. **Sample SVGs contain fictional values, dates, reference spans and methods**; they are design previews only, NEVER install as live data plots or medical guidance.
8. Use 390 + 1440 four-theme acceptance, plus 320 + 768 risk checks and 200% zoom, forced colors and reduced motion. Compare live screenshots at same commit and fixture. Report test status; no Designer visual-pass until actual screens inspected.
9. A01–A08 and B01 style primitives may be reused; do not create a competing global palette or chart engine. Implement the data binding in the existing chart architecture.

## Expected per-variant verification

| Variant | Runtime requirement |
|---|---|
| Source interval | Measured interval applies to correct source and assay at observation date |
| Selected only | Do not suggest selected source interval applies to other historical points |
| Alternate method | Distinguish 2 different valid source intervals/methods |
| Published comparison | Citation and research context, no patient clinical conclusion |
| Non-comparable | Break observed line, label reason and source difference |
| Unavailable | Never show reference interval band or green-normal status |
| Decision threshold | Separate source-qualified clinical threshold from lab reference interval |
| Method-changing | Each source observation retains its corresponding context and units |
