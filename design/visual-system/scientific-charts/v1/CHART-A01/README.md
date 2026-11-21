# Bloom — CHART-A01 Four-Theme Scientific Chart Tokens v1

**Created:** 2026-11-15  
**Asset ID:** CHART-A01  
**Scope:** Four-theme, opt-in, editable, non-data chart token system  
**Status:** Designer candidate — pending Architect, Science, UX, and deployed visual acceptance

## Files
- `tokens/scientific-chart-tokens.json`: machine-readable four-mode tokens and semantic usage definitions.
- `tokens/scientific-chart-tokens.css`: opt-in chart-scoped `--bvc-*` variables; no global overrides.
- `editable/CHART-A01-four-theme-token-map.svg`: editable vector swatch reference, no measurement data.
- `accessibility/contrast-matrix.json`: calculated contrast checks by theme and role.
- `accessibility/contrast-matrix.md`: readable table plus limitations.
- `handoff/integration-contract.md`: exact integration gates for Codex/Architect.
- `manifest.json`: file hashes and delivery inventory.

## Design decisions
- Everyday light draws from Bloom's canvas, forest, porcelain, sage and brand tones. Everyday dark uses Bloom's specified evergreen dark paint. Athlete dark uses the approved navy/cyan palette; Athlete light follows **actual app-wide Athlete light** from `brand-tokens.css` rather than treating Athlete as permanently dark.
- Additional categorical line hues are **accessible tonal derivatives of the established Bloom clay/lilac/blue families**. These chart-only derivatives are proposals that require Brand/Architect approval; they do not modify the master palette.
- Missingness, provenance and uncertainty cannot be conveyed by color alone. A02–A08 will supply distinct markers, labels, strokes and patterns.
- No chart data, thresholds, source values, user names, diagnosis or example measurements are baked into any exported file.

**Not supplied:** a proprietary Figma `.fig` file. The SVG and JSON/CSS are editable equivalent source files. No runtime app changes made.
