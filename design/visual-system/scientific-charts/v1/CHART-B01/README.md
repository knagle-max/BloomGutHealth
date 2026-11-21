# Bloom CHART-B01 — Longitudinal Trend Compositions (Design v1)

Status: DESIGN CANDIDATE — editable SVG compositions, semantic CSS, contract, no live app integration and no scientific/UX/browser signoff.

This is a **chart composition family**, NOT a screen mockup accepted as an app screenshot. The 56 responsive/design variants are built from CHART-A01's actual theme roles and A02–A08 conventions. Every numeric series is fictional, labeled as illustrative in the composition.

- 48 matrix specimens: 4 modes × 390/1440px × 6 scenarios (one, two, four, twelve points, explicitly disconnected interval, observed outlier)
- 8 extra specimens: 4 themes × 320/768px for the difficult disconnected interval case
- 8 source editable master SVGs (4 themes × 390/1440). These duplicates support design iteration, separate from the 56 acceptance matrix.
- CSS only scopes to `.app-shell[data-bloom-visual="premium"] .bv-scientific-chart[data-bv-family="longitudinal"]`.
- JSON contains design contract and fictional fixture data. No fabricated user clinical readings should be transferred into runtime.

**Critical:** The reference stripe in specimen is explicitly an *example interval*, NOT a clinical healthy range. Codex must bind source-specific interval only if method/population/date context supports it. The source card is fictional and must be bound to canonical observation metadata.

**Primary code:** `client/src/components/LabTrend.tsx`; secondary: Progress longitudinal trend widgets. Do not replace functional selection, lab method comparability, source correction history, exact date and units, accessible tables or lab range selectors. Chart SVG must be generated from runtime data, not these design specimen polylines.

All 8 foundational design kits A01–A08 must remain authoritative for semantic marker, gap, reference, and source status meanings.
