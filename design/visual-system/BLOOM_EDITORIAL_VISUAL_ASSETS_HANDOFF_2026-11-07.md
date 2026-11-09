# Bloom — Editorial Visual Assets Handoff (13 images)
Date: 2026-11-07  
Status: **Design delivery / proposed for architect review; NOT implemented or approved**  
Parent: [Premium Production R4 integration #3](https://github.com/knagle-max/BloomGutHealth/issues/3)

## Delivery and integrity
The companion package **Bloom_Editorial_Visual_Assets_2026-11-07.zip** contains 13 original PNGs, 1 machine-readable MANIFEST.json with per-file SHA-256 hashes and a README. ZIP SHA-256: `0016df22322a25de3cc3c3554c4ad96b3c5d484e4d061bf1549dde8aada90418` (22,113,464 bytes). The ZIP is currently attached to the originating ChatGPT conversation as a downloadable artifact; **it is not committed to GitHub**. The implementing agent must obtain the archive from the project owner, verify the hash and import the PNGs. Do not claim these assets are accessible from the repo until imported.

## Canonical asset register
| File in bundle | Intended usage | Resolution | Type |
|---|---|---|---|
| `cutouts/bloom-blueberry-sprig.png` | Botanical accent in Explore, Today, food detail | 1254×1254 | RGBA |
| `cutouts/bloom-echinacea-flower.png` | Today/wellness editorial accent | 1254×1254 | RGBA |
| `cutouts/bloom-three-leaf-sprig.png` | Small organic section flourish or empty state | 1254×1254 | RGBA |
| `cutouts/bloom-oatmeal-bowl-primary.png` | Food meal imagery; primary oatmeal asset | 1254×1254 | RGBA |
| `cutouts/bloom-oatmeal-bowl-alternate.png` | Food alternative oatmeal visual; do not silently duplicate | 1024×1024 | RGBA |
| `cutouts/bloom-yogurt-honey-blueberries.png` | Food meal illustration | 1254×1254 | RGBA |
| `cutouts/bloom-raspberry-smoothie.png` | Food snack/beverage image | 1254×1254 | RGBA |
| `heroes/bloom-food-oatmeal-linen.png` | Food hero: bowl right, text left | 1942×809 | RGB |
| `heroes/bloom-explore-blueberry-macro.png` | Explore hero: blueberries right, blur left | 1942×809 | RGB |
| `heroes/bloom-today-meadow.png` | Today hero: flowers right, meadow light left | 1944×809 | RGB |
| `heroes/bloom-athlete-mountains.png` | Athlete hero: mountain ridge right, spacious sky left | 1944×809 | RGB |
| `heroes/bloom-biology-rods.png` | Biology hero: abstract rod-like microbial forms | 1944×809 | RGB |
| `heroes/bloom-biology-abstract-cells.png` | Biology alternate: floating abstract spherical and curved forms | 1944×809 | RGB |

## Visual direction
- Premium warm editorial / nature photography and soft scientific abstraction, never generic SaaS/clinical UI.
- Wide compositions target ~12:5 and retain quieter left-side negative space for independently rendered headings/CTAs, **never bake in text**.
- Photographic palettes: Today meadow/ivory/sage/lilac; Food warm ivory/linen/berry blue; Explore sage/forest/blueberry; Athlete deep blue-grey/navy (design anchors #0F1B2E, #182B45, pale accent #81BEFF); Biology soft lilac #C9BDE3, sage #D9E7D5, ivory #F8F9F3.
- Biology images are **deliberately stylized conceptual illustrations**: no implication of identified species, observed patient microbiota, microscopy, concentrations or treatment effects.
- Cutouts should be presented on native Bloom surfaces, with no extra cards/frames added solely to hold illustrations. Keep image semantics: informative photos get meaningful alt text; purely decorative accents use empty alt.
- Ensure the generated art remains supplemental to actual captured/modeled nutrition and biology data.

## Integration contract for Developer via Architect
1. Route to Chief Architect & Integration Lead for alignment with full R4 visual master, canonical stylesheet and approved design tokens. R4 specifications and original designer assets take precedence when conflicting; do not independently replace existing design system.
2. Import originals into a reviewable repo path such as `client/public/images/editorial/` (subject to architect's actual asset structure), retain original PNG hashes and register source→destination mapping in the existing R4 asset ledger. Do not optimize in-place; derive WebP/AVIF variants while retaining source PNGs.
3. Implement a shared responsive editorial hero supporting heading/CTA overlay, focal point and accessible contrast under both themes, mobile crop fallback and reduced-motion preferences (static images only).
4. Source-aware content: food images are representative editorial photography, **not proof of logged meals**, nutrient composition, portion size or estimates. Biology artwork is explicitly illustrative and distinct from sourced charts/assay data.
5. Validate hero layouts at 320/390/768/1440 widths, 200% zoom, mobile focal crop, dark/light themes, text readability and keyboard/forced-colors contrast. Avoid visual text overlap and LCP regressions; deliver appropriately sized images and preload only current hero.
6. Confirm the RGBA images genuinely composite cleanly across light/cream/navy backgrounds; inspect alpha-edge halos, feathering, silhouette margins, glass transparency and visual artifacts. Repair or request regeneration where needed; do not assume polished edges from RGBA alone.
7. Review final placements/screenshots with the Design specialist and architect; capture status/commit/test evidence in #3 before calling assets implemented.

## Suggested initial placements
- Today: `bloom-today-meadow.png`, occasional `bloom-echinacea-flower.png`.
- Food: `bloom-food-oatmeal-linen.png`; product food cutouts for examples/recipes (not fabricated user diary entries).
- Explore: `bloom-explore-blueberry-macro.png`; blueberry sprig as restrained accent.
- Biology: `bloom-biology-rods.png` or `bloom-biology-abstract-cells.png` as **one** primary hero, not both stacked. Decorative, never clinical.
- Athlete: `bloom-athlete-mountains.png`; do not force a bright wellness treatment onto Athlete's dark palette.
- Progress: no dedicated hero in this batch; preserve visual telemetry and evidence fidelity.

## Acceptance checklist
- [ ] Architect reviews scope/precedence and assigns integration.
- [ ] Full ZIP retrieved from originating owner conversation and SHA-256 verified.
- [ ] All 13 source PNGs version-controlled or an explicitly approved equivalent asset distribution.
- [ ] Per-file SHA-256 matches manifest; source/destination ledger updated.
- [ ] Asset optimization, alpha cleanup, responsive focal crops, light/dark contrast and accessibility tested.
- [ ] Each relevant screen has verified actual screenshots, no invented observations or headings baked in.
- [ ] Designer/architect sign-off recorded; do not merge solely on this handoff.
