# CHART-B02 — Laboratory biomarker visualization

**Status:** Designer production candidate, not integrated in Bloom, pending Architect / UX / Science / actual screenshot acceptance.

Includes eight laboratory-reference scenarios, eight editable 390/1440 master SVGs, 64 full-matrix responsive SVG specimens, 24 narrower tablet/mobile adaptation specimens, a pure graphical reference-symbol library, CSS component styles, semantic JSON, fictional-only fixture data, QA and implementation notes.

The 390/1440 SVGs demonstrate precise visual treatment, NOT clinical thresholds or any person's laboratory records. Source-specific/decision/published comparisons are differently encoded and visually labelled.

**Files:** `tokens/`, `editable/`, `responsive/320|390|768|1440/`, `svg/`, `fixtures/`, `previews/`, `handoff/`, `accessibility/`, `manifest.json`.

**Critical:** Only code-driven chart paths, ranges and tick values may be live. Source references need assessment of assay and collection method, not labels alone. Original values/units/source information must remain inspectable. A single selected source interval must not be stretched across history.
