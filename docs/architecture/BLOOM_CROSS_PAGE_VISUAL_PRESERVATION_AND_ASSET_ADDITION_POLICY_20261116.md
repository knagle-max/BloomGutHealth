# Bloom — Cross-Page Visual Preservation, Reference Fidelity & Additive Asset Policy

**Date:** 2026-11-16 (owner clarification; consolidated revision 2026-11-16)  
**Status:** Architect-approved standing execution rule for substantial UI/page work, including bloodwork marker detail.  
**Authority:** Latest direct owner instruction, interpreted alongside `AGENTS.md`, `NEXT_ACTIONS.md`, existing design system, scientific/source constraints, and feature handoffs.  
**Scope:** Every existing or new page, screen, panel, modal, feature surface, responsive variant and asset-led redesign across Everyday, Food, Biology, Bloodwork, Explore, Progress, Athlete, Coach and later experiences.

## November 17 interpretation — protect assets and behavior, not inadequate page composition

Read the later [application-wide visual DNA and selective preservation decision](BLOOM_APPLICATION_WIDE_VISUAL_DNA_AND_SELECTIVE_PRESERVATION_20261117.md). The approved LDL mockup defines Bloom's **shared premium design DNA**, not a copied page template. Existing meaningful artwork, scientific visuals, chart mechanics, source provenance, functionality and canonical tokens remain protected, **but layout order, typography, spacing, materials, contextual disclosures and page compositions may be substantially improved** where owner feedback or rendered visual review demonstrates shortcomings. Biology, Bloodwork and Microbiome are valued reference experiences, not unchangeable layouts. Other pages have broader composition freedom **within the same visual identity**. Preserve successful work; avoid unnecessary rework. Require separate rendered **brand coherence** and **purpose-specific experience quality** acceptance, in addition to functional/scientific/security/asset checks. This clarifies the older “do not casually refactor” language below; it does not authorize asset replacement or a second UI system.

---

## Image-delivery requirement for visual references (2026-11-17)

An owner-provided mockup/screenshot is a required *real-file* input to visual design QA. Commit original or losslessly converted bytes under `docs/design-references/<feature>/` (or another persistent Codex-readable approved location), with stable filename, upload date, dimensions and content SHA. Add direct file link to the relevant page/design handoff, verify the binary exists at the exact branch/path and can be opened as an image, and compare real rendered app screenshots with that actual reference. Descriptions, proposed paths and user-conversation pointers are **not** a delivered image; until bytes are verified mark comparison `NOT_TESTED`. Approved LDL path and delivery status: [Bloodwork design-reference manifest](../design-references/bloodwork/README.md). Do not insert reference screenshot into the runtime UI or treat depicted illustration as licensed production artwork.

## 1. Existing work is the starting point, not disposable material

Before substantial UI changes Codex must inventory the current page/component, chart implementations, original asset bytes and paths, registry IDs, accessibility semantics, scientific/clinical meaning, state, actions, data workflows and relevant passed tests. **Keep already completed meaningful work and assets**: do not replace, remove, redraw, rename, regenerate, reimport, or casually refactor an existing hero, image, chart, icon, illustration, media slot, navigation, or functional interaction merely to resemble a fresh design example. Preserve category/parent layouts unless the owner explicitly includes them in scope.

If the owner explicitly asks for replacement, a reproduced defect requires a scoped corrective change, or a safety/accessibility issue demands a correction, record exact change and rationale. Existing work may be *repositioned or restyled around* without substituting its media or functionality. An existing asset must not be duplicated under a new ID.

## 2. User-provided design references are binding design direction within scope

Use owner-provided screenshots/design examples as the principal target for composition, hierarchy, visual quality, density, spacing, color/material, typography, art placement and intuitive workflow **as applicable to the requested surface**. Respect the explicit boundaries: a reference for an expanded child panel does not authorize redesign of its parent navigation or already-completed chart assets. Translate the example into real Bloom components and accessible responsive states; do not paste a screenshot into the app, hardcode its demonstration values, or copy unlicensed depicted art. Preserve existing source truth and safety; explain any deliberate difference that is required for correctness or available assets.

## 3. Additive asset policy: preserve originals, enable new work where useful

**Existing assets:** Do not replace, alter the source bytes, change registry identity or remove established fallback behavior without explicit owner direction or a scoped necessary defect correction.

**Large/signature assets** (hero/editorial art, detailed biomedical illustration, complex diagrams, page feature artwork, high-production imagery): if the reference calls for new art and suitable reviewed art does not exist, create an intentional reserved media slot/placeholder with correct footprint and graceful fallback, and add an **additive requested/planned** asset entry to the existing canonical registry. Specify purpose, placement, semantic subject, aspect ratio/dimensions, variants/themes, accessibility/alt/decorative semantics, conceptual/not-personal label where relevant, scientific approval need, rights/licence, provenance and future checksum (only once an actual file exists). Do not invent an image path, hash, delivered or approved status. Do not hold functional/UI completion until artwork arrives.

**Small/supporting assets** (icons, small context illustrations, stat/source-unit/history/metadata symbols, dividers, motifs): Codex may create suitable **high-quality, semantically accurate, accessible, tasteful** vector/CSS/SVG assets, preferably reusing established icon primitives and tokens. Register new independent media assets within the canonical registry where applicable; ordinary CSS decoration and approved existing icon-library uses do not require a fictitious binary asset entry. New art must be additive, relevant and Bloom-quality, not generic clipart or excessive decoration. Science-sensitive biomedical illustrations require appropriate scientific/content review before they imply factual anatomy, biomarker state or a person's pathology.

Asset creation is **not** a license to replace existing art; optional new imagery can occupy previously unfilled placements such as explanatory thumbnails next to “What is it?” and “Why does it matter?” where meaningful.

## 4. Charts and functional visualization

Preserve current chart code, underlying source projection, reference/assay/units logic, axes, samples, tooltips, selections, keyboard access and correction/invalidations. Small non-destructive built-in presentation settings may be adjusted (e.g., stroke, spacing, straight/curved link option) where backed by existing chart technology and scientifically valid; **do not replace chart engines or chart assets** to match reference styling. Unknown/incompatible observations must not become connected trends because a smooth spline is visually appealing. Do not fabricate interpolation, causal meaning, risk categories or reference ranges.

## 5. Readability, real-state fidelity and fallback

Use Bloom's canonical theme/design tokens across light/dark and the correct workspace accent; preserve actual workflows and source controls. Content-first defaults, editorial atmosphere and tactile detail must coexist with useful hierarchy, accessible contrast, 320/390/mobile/desktop, zoom, reduced motion and forced colors. New-image failure must never hide substantive text or cause broken URL, incorrect size, layout jump or inaccessible actions. Preserve privacy and authorization across accounts and rendering states.

## 6. Execution and evidence

For each significant page update record:
- What existing components/charts/assets were preserved (and why).
- How the owner-provided reference was implemented and what differences were necessary.
- Which new large asset slots were registered as requested (without claiming files delivered).
- Which new small assets Codex created with source/rights/review details.
- Evidence from current source, exact SHA tests, responsive screenshots and relevant real application interactions.
- Reproducible regression evidence for existing chart, source, permissions, routes, asset paths and hashes; report exceptions honestly.

This is an **execution standard**, not a new backlog, approval loop or instruction to displace the current `NEXT_ACTIONS.md` priorities. Apply when work touches the relevant page; publish architect handoffs to the authorized development branch and link the exact commit.