# CHART-A02 — Observation marker implementation contract

**Design source:** CHART-A01 (existing tokens), Biology scientific data visualization handoff, November 15, 2026.
**State:** finished editable asset kit, **not installed/accepted in live app**. No data-bearing paths.

## 30 markers
There are 3 shapes (circle = observed; ring = comparison; precision-dot = high-density display) × 10 states (ordinary, hover, selected, keyboard-focus, single-point, partial, provisional, incompatible, source-unknown, source-withdrawn). No additional palette introduced. SVG icons are 24 × 24 (shape usually 6–12px); semantic focus and state affordance extend 20–24px. Every 24px glyph has a separate **44 × 44 CSS pixel** interactive hit target.

## Meaning and non-color semantics
- **Ordinary:** original observed point, only if actual measurement exists.
- **Hover:** visual hover halo, desktop only; does not imply change to data.
- **Selected:** double outlined point, persists while source inspection open.
- **Keyboard-focus:** rectangular outline; keyboard focus must also use native :focus-visible target outline.
- **Single-point:** dotted outside circle, emphasizes legitimate one-point plot, no fake trend.
- **Partial:** cut/dashed diagonal indicates incomplete source coverage; is not evidence of zero.
- **Provisional:** open corner brackets; scientific provisional/published research, not measured value without labeling.
- **Incompatible:** slash-through, never connect incompatible assay series.
- **Source-unknown:** plus-like corner mark; explicitly label source/method unknown, not zero.
- **Source-withdrawn:** broken outer ring + slash, not a usable observation; no personal value exposed from revoked source.

The icon alone **never** supplies its meaning. Add explicit text and source status via tooltip, legend, table, and accessible name. Marker state is driven from canonical data state, not inferred from CSS, chart position, or sign of value.

## Cross-mode appearance
Same source SVGs in Everyday Light/Dark and Athlete Light/Dark via A01 --bvc-* colors. The SVG contains fallback colors solely for standalone inspection; for actual runtime palette switch, **inline the SVG markup** or apply colored external SVG via CSS mask. An `<img src="...svg">` won't inherit outer CSS variables/currentColor. Do not rely on its internal fixed fallback for theme correctness.

## Suggested DOM
```tsx
<button type="button" className="bvc-marker-target" data-series={series} aria-label={`${record.dateText}, ${record.displayValue} ${record.unit}. ${record.sourceLabel}. ${record.stateLabel}`} aria-pressed={selected} onClick={selectRecord} style={{left:x,top:y}}>
  <svg className="bvc-marker-glyph" viewBox="0 0 24 24" aria-hidden="true">...inline selected symbol geometry...</svg>
</button>
```
Positioning is illustrative; actual x/y from code must be validated and clipped within chart container without clipping 44px hit targets. Keyboard focus order follows chronological/source order, not the pixel x coordinate. If focus target collides or obscures, UX approves alternate list control. When no source data or source revoked, do not mount interactive point.

## Exports and responsive checks
- 30 independent SVG files, each editable and sized 24 × 24.
- `editable/CHART-A02-symbols.svg` contains 30 reusable symbols.
- `editable/CHART-A02-four-theme-specimen.svg` visual sample only; NO data values or fake axes.
- `tokens/CHART-A02-markers.css` only app-shell-premium opt-in selectors, no global selectors.
- At 320, 390, 768, 1440, pointer targets stay ≥44 px, selected/focus remain identifiable, and tooltip/source panel never clips. Inspect 200% zoom, forced-colors, reduced motion and actual Light/Dark/Athlete browsers.
- Longitudinal gaps: do not bridge missing/no data with line or create extra points from marker symbols. Exact-value HTML table alternative required.

## Later work
A03 owns path/series styling; A06 owns full missingness/uncertainty legend semantics; A07 owns linked crosshair/tooltips. These marker symbols do NOT define scoring or new source fields.
