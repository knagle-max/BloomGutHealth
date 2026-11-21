# CHART-A01 — Developer/Architect integration contract

**Status:** Ready for design review; not integrated. No charts are generated as bitmaps. This package supplies token roles, CSS, editable SVG swatches and automated static contrast evidence only.

1. Integrate **once** after `client/src/brand-tokens.css` and `client/src/styles/bloom-visual-scoped.css` in the existing stylesheet chain. Do **not** import or recreate a competing global CSS file, and do not modify the existing `--bv-*` tokens.
2. Only `<chart-root class="bv-scientific-chart">` inside `.app-shell[data-bloom-visual="premium"]` receives `--bvc-*` variables. The actual chart root should use its own existing element; pseudocode is not new markup authorization. UX/Architect approve any markup/class changes.
3. The mode selectors use `html.dark` and `html[data-experience="athlete"]`, matching `brand-tokens.css`. Athlete light is intentionally **not** a navy dark palette; real production tokens follow the current dedicated Athlete light brand mode. Confirm these DOM attributes are true in the deployed app.
4. Bind series value to the respective semantic token; never use hue as health classification. Data points, interpolation, source-specific bands and labels stay in React/SVG/Recharts and original source utilities. Keep source inspection, keyboard selection and missing-data semantics as-is until A02–A08 are approved.
5. Suggested rollout: `LabTrend.tsx` first, `FoodProgress.tsx` second, `NutritionHistory.tsx` third. `components/ui/chart.tsx` is only one of several chart implementations.
6. Test with premium flag disabled (unchanged screenshots). Test light/dark and everyday/athlete; 320, 390, 768, 1440 px plus 200% zoom, forced-colors and reduced motion. Capture before/after app screenshots at same data fixture and Git SHA. Do not mark visually verified until Designer/owner review.
7. On opaque fills, inspect text contrast in situ. Grid and references should remain subtle. The color checks cover solid chart surfaces only; all UI states and translucent layers require actual browser verification.

**Science/UX sign-off required:** acceptable distinctions among observation/comparison/research/modelled; display labels and non-color coding; source-interval language. Do not treat A01 as approval for A05/A06 behavior.
