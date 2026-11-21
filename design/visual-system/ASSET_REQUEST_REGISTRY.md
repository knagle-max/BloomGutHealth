# Bloom — Visual Asset Request Registry

**Registry purpose:** Pending visual-asset requirements for the Designer and Architect. This is **not** the deployed asset manifest, an assertion that files exist, or permission to substitute mock images for functional UI.
**Intake:** 2026-11-21; source `docs/agent-handoffs/Bloom_User_Review_Onboarding_Handoff_2026-11-21.md`, commit `6386a85cf16ad4859d59b274a5af5e070024bcd5` (UT-ONB-2026-001).
**Relationship to existing records:** `design/bloom/asset-manifest.json` is an archived staging/source-pack manifest, not pending design requests; `client/src/content/editorial-media.ts` controls shipped imagery, `PremiumIcon.tsx` maps existing branded route glyphs, and the R4/M1 media ledger tracks delivered artwork. Do not add proposed files to any runtime manifest until delivered, reviewed and installed.
**Default ownership:** Branding/Graphic Designer provides editable source and assets; Structural UX approves interaction; Architect integrates and resolves reuse; Codex owns implementation; Biology/Security review scientific/privacy meaning.

## Queue and definitions

**States:** REQUESTED → DESIGN IN PROGRESS → DESIGN REVIEW → DELIVERED → INTEGRATED → VERIFIED. All rows below are **REQUESTED**, not delivered.

| ID | Priority | Asset / component | Production decision | Main surface | Deliverable |
|---|---|---|---|---|---|
| ONB-A01 | P1 | Gut health goal icon | Design dedicated family member or approve existing icon after visual comparison | Goals | Editable SVG |
| ONB-A02 | P1 | Longevity goal icon | Dedicated consistent glyph | Goals | Editable SVG |
| ONB-A03 | P1 | General health goal icon | Dedicated consistent glyph | Goals | Editable SVG |
| ONB-A04 | P1 | Metabolic health goal icon | Dedicated consistent glyph | Goals | Editable SVG |
| ONB-A05 | P1 | Weight management goal icon | Dedicated consistent glyph | Goals | Editable SVG |
| ONB-A06 | P1 | Athletic performance goal icon | Reuse Athlete identity only if matching family, else dedicated glyph | Goals | Editable SVG |
| ONB-A07 | P0 design specification | Goal choice tile state library | Dynamic component, **not a static image** | Goals | Editable Figma/component spec |
| ONB-A08 | P0 design specification | Three-step progress and navigation states | Dynamic accessible UI, **not an image** | All onboarding steps | Editable components/tokens |
| ONB-A09 | P1 | Health-context section icon quartet | Four matched icons; decorative only | Health context | Four editable SVGs |
| ONB-A10 | P1 design specification | Expandable context, field and provenance state kit | Dynamic fields and state icons; reuse existing controls | About you / Health | Editable components/tokens |
| ONB-A11 | P2 conditional | First-use dashboard botanical empty-state vignette | **Only if** existing approved media cannot serve | Post-setup dashboard | SVG + optional 1x/2x WebP |
| ONB-A12 | P0 design specification | Fully responsive complete screen compositions | Design references, **not runtime screens** | All 3 steps + empty dashboard | Figma frames, handoff redlines |

## Approved photographic goal-card media — 2026-11-21

**Owner approval:** All six photorealistic card media selections approved on 2026-11-21. **This approval covers the images only**, not separate editable SVG goal icons, interactive selection tiles, responsive implementation or scientific meaning. Original ONB-A01–A06 SVG requests remain REQUESTED pending reuse review and actual vector delivery. These approved editorial raster media are supplemental card artwork and must not be mistaken for six completed SVG glyphs.

- **Package:** Shared Library `/Bloom gut health/Agent Handoffs/Bloom_ONB_Six_Goals_Approved_2026-11-21.zip` (six 1536×1024 original PNGs plus 384/768/1536 WebP exports).
- **Manifest:** `/Bloom gut health/Agent Handoffs/Bloom_ONB_Six_Goals_Manifest_2026-11-21.json` (file-by-file hashes and variant names).
- **Readme:** `/Bloom gut health/Agent Handoffs/Bloom_ONB_Six_Goals_README_2026-11-21.md`.
- **Detailed production crosswalk:** [Approved onboarding photography delivery](onboarding-v1/APPROVED_GOAL_PHOTOGRAPHY_DELIVERY_20261121.md).
- **Status:** Owner-approved assets delivered to Shared Library; **not installed**, not user-interface accepted, not sign-off for scientific representation, not deployed.

| Registry concept | Approved photograph | File basename (without size suffix) |
| --- | --- | --- |
| ONB-A01 — Gut health | Macro green bacteria illustration | `ONB-A01-gut-health` |
| ONB-A02 — Longevity | Translucent green/gold DNA helix | `ONB-A02-longevity` |
| ONB-A03 — General health | Translucent human whole-body wellness visual | `ONB-A03-general-health` |
| ONB-A04 — Metabolic health | Golden mitochondrion on forest-green background | `ONB-A04-metabolic-health` |
| ONB-A05 — Weight management | Golden adipose-cell artwork (symbolic, not diagnostic) | `ONB-A05-weight-management` |
| ONB-A06 — Athletic performance | **Revised** running athlete with green and athlete-blue accents | `ONB-A06-athletic-performance` |

**Implementation note:** Keep the exact approved six primary goal titles and working radio selection. Raster media are decorative; labels, selection state, focus and 44px touch geometry are DOM UI. Check per-card crops at 320/390/768/1440 and four themes, 200% text. Do not imply literal medical imaging, measured biology, proven longevity or weight-loss outcome. Do not use the rejected A06 muscle-only original.

## Owner-approved onboarding component delivery — 2026-11-21

**Owner approvals:** ONB-A07 selectable goal-card design; ONB-A08 three-step navigation design; ONB-A09a–A09d all four section SVG icons; ONB-A10 interactive expandable forms and consent-state **design**; ONB-A12 integrated responsive onboarding and empty-dashboard **design**. These are approved DESIGN DELIVERABLES, not deployed application features. Designs passed ZIP integrity checks; live screen, accessibility, data persistence and consent correctness are **NOT VERIFIED**.

**One canonical package:** Shared Library `/Bloom gut health/Agent Handoffs/Bloom_ONB_Approved_Design_Handoff_2026-11-21.zip` (contains all six original source-package ZIPs, original goal photography, a delivery index with SHA-256 and README). Individual approved photo package and individual A07–A12 packages remain available inside the combined ZIP.

**Manifest:** `/Bloom gut health/Agent Handoffs/Bloom_ONB_A07_A12_Approved_Delivery_Index_2026-11-21.json`.

**Developer/Architect handoff:** [Approved onboarding components, extraction and acceptance](onboarding-v1/APPROVED_COMPONENTS_A07_A12_DELIVERY_20261121.md).

| ID | Approved deliverable | Design lifecycle | Runtime lifecycle | Source archive inside combined delivery |
| --- | --- | --- | --- | --- |
| ONB-A07 | Selectable goal cards, selected/hover/focus/disabled/error | DELIVERED — owner approved | NOT INTEGRATED | `Bloom_ONB_A07_Goal_Cards_Review.zip` |
| ONB-A08 | Exactly three-step progress, back/continue/skip/resume/save states | DELIVERED — owner approved | NOT INTEGRATED | `Bloom_ONB_A08_Progress_Navigation_Review.zip` |
| ONB-A09 | Four approved source-editable SVG icons (conditions, medications/supplements, allergies/intolerances, dietary preferences) | DELIVERED — owner approved | NOT INTEGRATED | `Bloom_ONB_A09_Four_Approved_Icons_2026-11-21.zip` |
| ONB-A10 | Health-context accordion, chips, unknown/none/skip, illustrative consent and errors | DELIVERED — owner approved | NOT INTEGRATED | `Bloom_ONB_A10_Expandable_Forms_Review_2026-11-21.zip` |
| ONB-A12 | Goals, About you, four-section optional Health context, zero-data dashboard responsive compositions | DELIVERED — owner approved | NOT INTEGRATED | `Bloom_ONB_A12_Responsive_Compositions_Review_2026-11-21.zip` |

**Still outstanding:** six original ONB-A01–A06 SVG goal-icon requests remain REQUESTED (the six separately approved photographic card media do not complete these vector requests); ONB-A11 remains CONDITIONAL/NOT PRODUCED. Architect may approve reuse of existing glyphs instead of commissioning redundant artwork. The third step contains FOUR optional health-context sections—not six data-import tiles—and has a distinct Skip action. Dashboard is **not** a fourth wizard step.

**Implementation guards:** save/resume/account scope; explicit revocable consent separate from Finish; medications distinct from supplements; allergies distinct from intolerances; unknown/skip/none distinct; existing-account bypass; accurate sex-for-reference, optional units; 320/390/768/1440 in all four themes, 200% zoom, keyboard, screen reader, focus, 44px controls and same-SHA actual app screenshots. Do not claim integrated/verified until Codex and independent UX complete their checks.

## Production-ready art direction

### ONB-A01 — Gut health / botanical intestinal loop
**Visual concept:** A single elegant flowing intestinal-loop silhouette, recognizable as the gut without a clinical anatomy illustration, with a small integrated sage leaf terminal. Two interlocking continuous curves rather than an aggressive digestive-organ icon. Avoid rendering microorganisms as if measured. **Style:** gentle organic line geometry, 2px equivalent round stroke, intentional negative space, no cartoon face, no medical symptom cue. **Color:** primary forest-green ink on pale sage; Athlete alternative may switch to blue/navy brand tokens. **Use:** 24–32px displayed in the Goals card. **States:** neutral, selected, hover, focus, disabled/high-contrast; selection must also be conveyed by border/check and text. **Reuse candidate:** review current biology route icon but do not confuse gut with generic Biology.

### ONB-A02 — Longevity / growth-ring sprout
**Visual concept:** Two open, asymmetric concentric tree-growth arcs around a single emerging sprout. Communicates continuity, resilience and growth **without** clocks, immortality, DNA promises or biomedical outcomes. Round-stroke, equal weight/optical size with A01; limited overlapping lines. Text supplies meaning. Favor warm botanical sage/clay tint.

### ONB-A03 — General health / balanced leaf-and-sun
**Visual concept:** Simple three-leaf radial rosette with a small central sun/dot, botanical, inclusive, neutral. It should communicate general wellbeing instead of suggesting verified heart rhythm or medical status. Avoid diagnostic cross and stethoscope. Use same visual weight and transparent background.

### ONB-A04 — Metabolic health / energy cycle
**Visual concept:** Two incomplete offset orbit arcs enclosing a single small seed or energy drop, implying exchange and balance without a clinical claim of optimized mitochondria, glucose or metabolic rate. Avoid flame, lightning and fake molecular bond. Open arcs must remain legible at 24px. No numeric status graphics.

### ONB-A05 — Weight management / balanced trajectory
**Visual concept:** Delicate horizon/trail rising gently toward a leaf marker, or a simple balanced two-plate form with botanical treatment. **Do not** use a weighing-scale needle, thin-waist silhouette, body measurements, gendered torso or before/after body depiction; no shame/guilt. Goal signifies supported behavior and progress, not a predicted result.

### ONB-A06 — Athletic performance / motion ribbon
**Visual concept:** Three short forward-leaning motion arcs and a grounded path/track oval, or adapt `/brand/visual-v2/batch-1-original/icon-athlete.svg` after optical-fit review. Non-gendered, not sports-exclusive and not a literal performance claim. Athlete-mode blue is a theme treatment, not a separate icon meaning.

### ONB-A07 — Selectable goal tile design system
**Not a raster asset.** Deliver Figma component with: title; SVG slot; entire 44px+ clickable surface; one primary-choice semantic selection; checkmark independent of hue; default/hover/focus/selected/disabled/error; 320px stacked or 2 columns only when legible; 390px and 768/1440 layouts; 200% zoom. Recommended treatment: cream/ivory paper, almost invisible stroke, restrained botanical icon panel, selected thin forest outline and check in top-right, *no* full-card bright green fill; Athlete uses cool off-white / navy-blue selection. Selection has radiogroup semantics, not visual card-only state.

### ONB-A08 — Step progress/navigation
**Not a fixed graphic.** A horizontal `1 Goals — 2 About you — 3 Health context` progress stepper, short labels on desktop and numbered compact state on narrow mobile. Current step visually clear without colored-only meaning. Show complete/current/upcoming and optional resumed state. Mobile text, focus and screen-reader step names must remain intact; never imply an extra fourth required stage.

### ONB-A09 — Health context pictogram quartet
**Four icons with the six-goal family grammar:**
- Conditions: open branching leaf/record sheet (not red cross, pill or clinical severity).
- Medications/supplements: neutral capsule beside a leaf, but the data entry UI **must still store medication and supplement records separately**.
- Food allergies/intolerances: grain/leaf + small shield outline; not a blanket no-risk symbol.
- Dietary preferences: plate with simple leaf/fork geometry, not an enforced diet.
24px and 32px usage; strokes and gaps survive small rendering; transparent background; same theme variants and no implicit medical status.

### ONB-A10 — Context field/state visuals
**Components rather than new artwork.** Define expandable row (collapsed/open/error), real add/edit/delete actions, selected chip, unknown/not sure/not provided/explicit none labels, inline source and privacy notice, unit switch, date/year entry, height/weight optional controls, activity-level choice, successful-save receipt, failed save/retry, consent refused/accepted. Use readable wording and icons already present in the app wherever viable. Unknown must never look like a green success. Fields must have real underlying controls and stable focus.

### ONB-A11 — Conditional empty-state scene
A restrained small botanical still life: a seed and two delicate emerging leaves, warm ivory ground, subtle clay and sage shadows, purposeful open composition with space for dynamic headline and three genuine quick actions. **No** fabricated score, lab trace, DNA/organism particles, personalized body shape, or health improvement illustration. Use existing Today/first-use imagery if it serves the same composition; only commission custom artwork after the Designer demonstrates a unique gap. Must not bury Log food. Export SVG with alt as decorative where relevant, optional optimized WebP at 1x/2x, and a no-media fallback.

### ONB-A12 — Editable screen composition package
Deliver 4 screens (Goals, About you, Health context, zero-data dashboard), each 320/390/768/1440px in Everyday Light/Dark and Athlete Light/Dark **where applicable**. Show normal, partial, invalid, back navigation, save failure, interrupted/resumed and skipped optional context; owner-requested sequence and exact titles preserved. First viewport makes one primary action obvious; mobile need not copy desktop columns. Optional accordion content does not turn Step 3 into a mandatory 20-field questionnaire. Avoid decorative card stacks, overlarge hero art, or content pushed below safe area.

## Global asset requirements

- **Style:** premium botanical editorial instrument; match existing approved R4/M1 identities, forest/sage/cream/clay for Everyday and deep-navy/precision blue for Athlete; restrained shadows, ample whitespace. Do not copy unrelated chat UI visual styling or diverge from active Bloom navigation.
- **Editable source:** Figma master or equivalent vector source; individual SVG icon exports with `viewBox="0 0 48 48"`, transparent backgrounds, theme-aware `currentColor` wherever appropriate. No embedded text or hardcoded data in art. PNG only as preview; never substitute image screenshots for functional forms.
- **Asset packaging:** `design/visual-system/onboarding-v1/source/` for editable source links/notes and `design/visual-system/onboarding-v1/svg/` for approved exported icons; Codex decides final runtime path after Architect integration. Use naming `onb-goal-gut.svg` etc., stable IDs above, version, license/provenance, SHA-256, intended slot and alt/aria usage.
- **Contrast/accessibility:** WCAG AA against actual themes, noncolor selected/focus indicators, keyboard/screen-reader focus, text reflow at 200% zoom, touch 44px minimum and reduced-motion alternatives. Avoid tiny decorative details indistinguishable at 24px.
- **No fabricated science or implied medical claims:** no “healthy gut” status, diagnosis, score, verified cellular effect or actual body/biological measurement in decorative imagery.
- **Data and interaction:** Assets do not govern state; all form controls, persistence, consent and goal priority operate through canonical models. Proposed assets have no entitlement to private health data.
- **Acceptance:** Designer supplies editable files, 4-theme preview sheet, 24/32px test montage, 320/390/768/1440 compositions, export checksum/manifest and documented reuse decisions. Architect checks state/data invariants; Codex tests rendering and functional journeys; User Review independently assesses real screens. **No pending asset becomes "DELIVERED" from a mockup alone.**

## Asset request reconciliation

Existing `PremiumIcon.tsx` routes include Biology, Athlete, Progress, Profile; `client/src/content/editorial-media.ts` supplies approved contextual media. **Reuse and optical-check before redrawing.** The R4/M1 archive and `asset-manifest.json` already hold older design files, but those do not satisfy all six distinct selectable goal identities or the new three-step flow by themselves. New design is justified for consistency of the six-card family; new art is *not* required for each form control, privacy message or save state.

**Non-asset blockers for Architect/Codex:** At the cited review baseline `shared/experience.ts` has onboarding states `not-started|skipped|complete`, and `EverydayStart.tsx` routes the completed food-first introduction to `/log-meal`. The new `in-progress`, versioned status/resume, canonical profile/health capture, independent consent and post-completion dashboard require implementation. The asset delivery neither solves nor gates those contracts.
