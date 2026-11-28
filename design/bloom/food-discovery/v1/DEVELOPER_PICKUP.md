# Bloom Food Discovery — implementation pickup
**Design branch:** `design/biology-visuals-2026-10-30`
**Status:** reusable design sources committed; not deployed or science/licence approved for public release.

## Deliverables
- 4 original `garden/stage-{1..4}.svg` planting-bed scenes.
- 12 original individual `food-icons/*.svg` covering sample ingredient identities.
- `components/BloomDiscover.tsx` and `components/discover.css` as reusable UI **reference source**; adapt to the real app's canonical route/design system.
- `ASSET_MANIFEST.json` with paths/statuses and guardrails.

## Required actual data behavior (owned by Codex)
- Count unique **verified culinary plant-food identities** from real food source/ingredient identity mapping, not serving count, photo guesses or displayed SVG.
- Mushrooms are fungi, not botanical plants; herbs/spices trace quantities are separately documented. Unknown recipe compositions add no confirmed identities.
- Recipe ingredients and changes require stable source IDs, timestamps/timezone, corrections and retraction.
- Exactly one optional Discover area; no five Today cards and no compulsory gamification.
- Garden stage is a **decorative representation** of confirmed variety, and must not set a normative health grade or universal “30 plants” target. Four artwork states are illustrative stages only; no clinical range or threshold implied.
- Food of the week, weekly focus and optional research cards require source-led approved claims, safety filters, swap/skip, no seafood if excluded, and no medical promises.
- Preserve journal, ingredients, macro/micro partials, search/corrections and source metadata.
- Food search uses intent-aware routing and relevant verified results, not noisy supplement mixing.
- Never show the template's placeholder data as a real personal observation.
- Labels and research content must remain meaningful with images disabled; reduced motion, dark mode and keyboard / screen-reader support.

## Rights and review
Artwork constructed as editable native SVG; exact creator/tool provenance and security audit remain separate gates. Use SVGs as local static assets with no remote image references. No celebrity/trademark/third-party photography embedded. No independent science/licensing approval claimed.

## Product completeness
This is an asset and reusable UI **implementation kit**, not a functioning Discover feature. Calendar-week identity counting, personalization, science content and durable persistence remain Developer work.
