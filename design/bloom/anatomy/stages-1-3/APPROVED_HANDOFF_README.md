# Bloom Anatomy — Approved design handoff (Stages 1–3)

**Design approval:** Owner approved consolidated visual design after Stage 1 (torso/back), Stage 2 (lower body), Stage 3 (arms/shoulders), and consolidated QA review. **This is design approval, not production authorization.**

## What to use

- `interactive-demo.html`: QA-verified design reference, sample presets and all-lit inspection. Not a drop-in production implementation.
- `assets/bloom-neutral-front.svg` and `assets/bloom-neutral-back.svg`: **approved, editable SVG muscle-region overlays** with interactive region IDs and accessibility semantics. Treat these masters as the source of truth for vector overlay geometry; avoid re-tracing paths from screenshot previews.
- `assets/body-front.png` and `assets/body-back.png`: **rendered body illustration layers** under SVG paths. This is a hybrid raster+vector design; do not represent it as entirely vector.
- `visual-groups-provisional.json`: 15 **provisional visual groups**, not verified Bloom canonical IDs.
- `browser-contact-athlete.png`, `browser-contact-everyday.png`: visual contact sheets, all-lit + sample Push/Pull/Legs.
- `qa-mobile-athlete-push.png`, `qa-mobile-everyday-push.png`: actual Chromium mobile viewport captures.
- `Bloom_Anatomy_Before_After.png` and `original-v1-four-view-reference.png`: history/visual context; **do not integrate V1**.
- `structure-audit.json` and `browser-qa.json`: source verification and browser smoke-test results.
- `QA_HANDOFF.md`: original read-only QA record and known open gates.

## Source & consistency

Keep one maintained geometry source for front/back SVGs and the component consuming them. The demo embeds the staged SVG masters; do not independently edit both the files and embedded copy. Maintain unique clipPath IDs, stable data-muscle-group and data-focus-owner attributes, ARIA roles and states, and tab/focus behavior.

## What passed

15 provisional visual groups across front/back; combined Stage 1–3 contours; JSON/SVG ID structural checks; Chromium Push/Pull/Legs/clear/all-lit interactions, theme and Explore switching, Enter/Space and focus retention, responsive 390px mobile smoke tests. QA record reports 35/35 browser checks passed.

## What remains gated

1. GI-01–GI-10 read-only baseline and explicit owner authorization before live integration.
2. Reconcile the 15 visual groups with authoritative canonical muscle taxonomy, including lower-legs front shin versus posterior calf and unknown/unmapped abstention.
3. Validate exercise-target metadata; highlighting represents *illustrative or catalog-provided target categories*, not measured activation, fatigue, growth, injury or recovery. Sample presets are not workout history.
4. VoiceOver/TalkBack, real-device touch and exhaustive WCAG audit are **not yet verified**.
5. Anatomical specialist validation of boundaries is still outstanding.

## Approval boundary

Approved: universal front/back visual, 3D body styling, blended interactive highlights, reviewed contours, Everyday/Athlete mode, visual hierarchy.

Not authorized: classification inference, new workout storage/models, codebase integration or taxonomy hardcoding. Current V10.1 remains prior technical baseline; this consolidated folder is the **approved visual handoff**.
