# Architect and Codex integration contract

1. Extract CHART-A01–A08 from the consolidated approved (delivery, not runtime-approved) archive. Compare these sample tokens to the exact A01 JSON in the repository or verified Shared Library. B01 adds only component-local geometry/layout; no new global palette.
2. Keep the existing source-aware LabTrend implementation, `LabRangeSelector`, and original values/dates/units/corrections. Apply CSS + actual data-driven SVG geometry without rerouting or removing existing actions.
3. X must use numeric chronological time, with actual date and timezone policy. Repeated identical collection times need occurrence/source identity and potentially offset purely for hit access—never change the time value. Axis ticks localize at runtime; synthetic specimen labels are never data.
4. Separate the path where **actual source evidence** makes values non-comparable, withdrawn, or explicitly absent. Do not assume an unobserved day is an observation of zero and do not disconnect solely because 140 days elapsed.
5. Two observations: show measured difference only if method comparability assessed, with no causal claims. One observation: show one dot, no connecting line. Outliers retain original symbol and neutral observed color, no implicit diagnosis.
6. Selected point maps by stable observation ID to source drawer. Bind timestamp, original unit/value/provider/assay, conversions, correction lineage and reference interval applicability. Withdrawn source must be inaccessible rather than partially visible through cached source tooltips.
7. Plot caption, exact values table and raw source remain keyboard/screenreader accessible. 44x44 mobile touch hit targets, focus visibly clear, source drawer dismiss restores focus.
8. All four themes, 320/390/768/1440 and 200% zoom, forced colors and reduced motion. Capture same-SHA before/after with identical fixture; Developer records engineering pass only, Designer and UX review actual screenshots.
9. Specimen SVGs are editorial reference only, not data assets to import as chart output. No full redesign claim until implementation, QA and Architect acceptance.

## Per-scenario test contract

- 1 observation: no polyline; visible point; source inspectable
- 2: chronologically positioned two points and appropriately qualified comparison
- 4: nonuniform date distances; full selection/source metadata
- 12: density test of label/point interaction without suppressing records
- gap: only sourced non-comparability breaks the line; no interpolated bridge
- outlier: outlier kept on scale, still selected/inspectable, no clinical alarm encoding
- no data, loading, error, source withdrawn, multiple method intervals: **reuse A05/A06/A08 states, test in runtime**; not all depicted as B01 specimens
