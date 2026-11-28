# Developer and Architect integration

1. Place this kit beside CHART-A01..A08 and B01/B02. CSS import once in scoped premium chart system.
2. `LabTrend.tsx` first; integrate with existing `LabRangeSelector`, `LabExplorer`, `LabSourceContext` and source comparability utilities. Progress later.
3. Use original values/units and assay identities; existing canonical conversion and comparable-pair decisions are authoritative. Do not infer comparability from common units alone.
4. If pair non-comparable, do not calculate change. Show both observed values with methods and explicit unavailability of comparison.
5. Percent change may be displayed only if denominator nonzero, finite and valid; do not silently divide by zero.
6. Render source-specific references only if recorded and applicable; support hide/show from the existing reference selector, with source provenance.
7. Source withdrawn means full redaction; never render cached original value in chart, tooltip or exact table.
8. Validate keyboard/touch 44 CSS-px actions, exact-value table, dynamic text, 200% zoom, 320/390/768/1440, four themes, forced-colors and reduced-motion. Screen assets are design references, not app screenshots.
9. Treat date spacing and individual source records as actual timestamps, not evenly spaced fictional specimens. Do not infer causality from an observed delta.
