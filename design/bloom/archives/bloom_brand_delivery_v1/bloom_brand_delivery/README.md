# Bloom Brand & Product Experience — Delivery v1.0
**Date:** 2026-10-18  
**Owner:** Marketing & Design Specialist  
**Status:** Proposed — awaiting Developer triage; not implemented  
**Baseline:** `knagle-max/BloomGutHealth`, `enhance/bloom-experience` at `550d549a31e513cb8a7556dd7e44aec2aa1cd800`, open PR #1.  
**Authority:** Developer Agent exclusively owns implementation, architecture, tests, GitHub, release.

## Contents
- `assets/bloom-icon-everyday.svg`, `bloom-icon-athlete.svg`, `bloom-icon-monochrome.svg`: original scalable symbolic leaf logos, with raster PNG exports where available.
- `assets/bloom-wordmark-dark.svg`, `bloom-wordmark-light.svg`: adaptable vector wordmarks. Font outlines intentionally **not** embedded; application should use approved licensed font/fallback. Check final glyph rendering before launch.
- `assets/empty-journal-illustration.svg`: gentle visual for missing journal data.
- `assets/design-tokens.json`: proposed palette, typography, density, sizing, and motion tokens.
- `previews/brand-concept-reference.png`: **exploratory art direction only**. This generated composite may contain inconsistent text, color labels, and icons; DO NOT extract production artwork, UI copy, metrics, or colors from this visual. The individual vector assets and documented tokens are source-of-truth candidates.
- `specs/HANDOFF.md`: actionable prioritized backlog and review/acceptance checklist.
- `specs/SCREEN_BLUEPRINTS.md`: UX composition and states.
- `specs/CONTENT_AND_SCIENCE.md`: claims and trust language rules.

## Brand proposition
**Bloom:** Precision nutrition made practical.  
**Brand character:** scientifically grounded, warm, calm, capable, respectful of uncertainty.  
**Suggested supporting line (approval pending):** “Understand your biology. Nourish your potential.”  
**Everyday:** warm evergreen and quiet cream, for ongoing free everyday wellness.  
**Athlete:** deep midnight/navy and clear electric blue, for optional premium performance workflows.  
One master logo and one design language; do not imply that switching modes changes clinical validity or subscription entitlement.

## Production notes
- No app repository files changed by this specialist.
- SVGs are newly authored design assets, not extracted from the conceptual image. Developer must evaluate on-screen rendering, accessibility, contrast, legal/trademark review, and usage rights before release.
- Theme mappings should flow through existing CSS custom properties; do not overwrite scientific/semantic status meaning with brand colors.
- Do not create fictional performance stats, microbiome effects, gut scores, or before/after claims in UI, screenshots, or marketing.
- Before adoption, confirm trademark/domain clearance for “Bloom”, accessibility contrast at rendered size, and brand approval.
