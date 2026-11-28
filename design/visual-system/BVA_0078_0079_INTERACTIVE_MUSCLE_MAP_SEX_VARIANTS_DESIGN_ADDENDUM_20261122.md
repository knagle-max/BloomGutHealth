# BVA-0078 / BVA-0079 — Interactive muscle map: sex variants and SVG source requirement

**Owner direction 2026-11-22:** Work one artifact at a time. Do not use previously generated raster anatomy PNGs as the interactive lighting/highlight layer. Deliver actual editable and individually targetable SVG paths, with four anatomical views: male anterior (BVA-0078-M), female anterior (BVA-0078-F), male posterior (BVA-0079-M), female posterior (BVA-0079-F). These suffixes are design variants of the existing parent asset IDs, **not new independently approved registry entries**.

**Status:** OWNER REQUIREMENT RECORDED / GEOMETRY NOT DELIVERED / NOT SCIENTIFICALLY REVIEWED / NOT INTEGRATED. These instructions do not authorize Codex to preempt the active GI investigation baseline queue or override the infrastructure pause.

## Rationale

Previously generated anterior/posterior PNGs, if retained, are visual style references **only**, not shippable interactive diagrams, paths, masking layers or evidence of anatomy review. Users need true SVG <path> targets, not runtime raster recolouring, opaque region masks or a fake highlight over the whole figure.

## Selection and source contract

- Reuse existing authenticated user profile source. Repository `shared/schema.ts` currently supports optional `sex: 'male' | 'female' | null`; do not create an additional sex field or infer anatomy from height/weight/age.
- Profile sex may provide **only an initial default appearance**: `male` -> male set; `female` -> female set; missing/other/invalid -> neutral, accessible no-assumption fallback (e.g. text/list or neutral generic diagram when genuinely delivered).
- Add an accessible optional *diagram appearance override* where supported (Male illustration / Female illustration / Neutral or list). It is a display choice, never a change to sex/medical profile, workouts or physiological interpretation. Prefer existing presentation preferences; investigate app architecture before persisting anything.
- Switching appearance or anterior/posterior view must preserve selected canonical muscle group, workout records and current display data. Never create separate male/female exercise taxonomy or activity records.

## Artifact order

1. **BVA-0078-M: male anterior SVG** — first candidate for designer and anatomy review. Do not mark approved before inspection. Original vector source, not auto-trace-as-final.
2. BVA-0078-F: female anterior SVG, matched pose/camera/viewBox/coordinates where practicable.
3. BVA-0079-M: male posterior, with the same visual language.
4. BVA-0079-F: female posterior, matching all three peers.
5. Shared path mapping, interactive prototype, accessibility/testing receipt and agent delivery after component readiness. Do not call the four-view family complete until all four exist and are reviewed.

## Vector construction

- Each illustration full-body adult superficial anatomical view with arms gently offset and legs separated; accurate visible anterior/posterior anatomy, no organs/X-ray, no suggestive detail, neutral non-sexualised posing, natural realistic proportions and silhouette variation.
- **Distinct non-overlapping clickable shapes**, left/right where anatomically meaningful, for visible individual groups. Each target gets stable IDs such as `muscle--quads--left` with a **variant-independent canonical group ID** and side. Use the current reviewed 15-group exercise taxonomy, not a new artist-invented one; confirm exact taxonomy IDs before export.
- The stable *semantic* mapping must be separately machine-readable: `variant,view,pathId,canonicalMuscleGroupId,side,visible,selectionLabel`. Path IDs need only be unique in a rendered SVG. Any asymmetry, hidden muscle or ambiguous mapping must be disclosed rather than guessed.
- Include clean silhouette, neutral inactive regions, true SVG paths with no bitmap dependency, tokenized stroke/fill and hover/focus/selected/disabled states. Avoid inline hardcoded values on live elements; use canonical Athlete Blue theme tokens light/dark.
- Source files must be editable (SVG or vector authoring source) and rights-cleared. Do not assume vectorization automatically makes unreviewed anatomy accurate or licensed.

## Behaviour and science

- Highlight represents **exercise-to-muscle association from a confirmed, recorded workout** under the existing reviewed taxonomy. It does **not** measure EMG activation, muscle recruitment intensity, soreness, strength gain, hypertrophy, readiness, pain, diagnoses or recovery.
- Support selecting a group from the diagram and an equivalent accessible group list; both open the same source-qualified workout detail. Distinguish no records/unknown from zero.
- Mouse, touch, keyboard and screen reader support; 44×44 CSS-pixel touch target or an equivalent separate operable list for fine path geometry; visible focus; active and neutral contrast meeting WCAG AA; no colour-only meaning. Do not make SVG path tab order unmanageable: keyboard-accessible group controls with alternate list are acceptable if behaviour parity is preserved.
- Highlighting is instant or a subdued <=200 ms fill/opacity transition; suppress nonessential transitions under `prefers-reduced-motion: reduce`. Never make muscle pulse like real measured activation.

## Delivery and gates

For each **candidate**: source SVG, source designer file if any, path map JSON, preview demonstrating distinct selectable paths, readme with anatomy caveats, file SHA-256 and rights provenance. **Review gates:** anatomy expert checks visible/superficial boundaries, independent taxonomy mapping and front/back continuity, rights, actual 320/390 desktop/mobile light/dark and keyboard/touch/screen reader testing. Accept or reject each view separately.

**Integration:** existing `MuscleCoverageMap` candidate and workout model; no new data store, exercise ontology, source-of-truth or profile schema; respect AGENTS.md and NEXT_ACTIONS.md. Keep these design assets on hold for runtime integration until exercise scope eligible. No inferred activity or physiological outcomes.

## First bounded design task

Prepare **BVA-0078-M anterior original vector candidate** only and show it for owner/anatomy review before starting BVA-0078-F. Previously generated `stylized_full_body_muscle_anatomy_diagram.png` may inform aesthetics but MUST NOT be called source geometry or production interactive art. Record real file-level evidence rather than claiming an SVG was created because the brief exists.
