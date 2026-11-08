# Bloom lab category icon set — 10 assets

Status: **raster assets prepared and quality-reviewed, not yet uploaded to GitHub**. Source: user-provided reference composite; transparent 512x512 PNG and optimized WebP copies extracted from original tiles. Companion deliverable: `Bloom_Lab_Category_Icons_10.zip` (available in the source conversation, not on GitHub). Do **not** mark assets integrated until binaries are committed and inspected.

## Expected destination
`client/public/images/editorial/lab-categories/`

| Canonical basename | UI label |
|---|---|
| `bloom-lab-heart-cholesterol` | Heart & cholesterol |
| `bloom-lab-blood-sugar-insulin` | Blood sugar & insulin |
| `bloom-lab-liver-biliary` | Liver & biliary |
| `bloom-lab-iron-blood-nutrients` | Iron & blood nutrients |
| `bloom-lab-bone-micronutrients` | Bone & micronutrients |
| `bloom-lab-kidney-electrolytes` | Kidney & electrolytes |
| `bloom-lab-hormones-thyroid` | Hormones & thyroid |
| `bloom-lab-inflammation-immune` | Inflammation & immune |
| `bloom-lab-blood-count` | Blood count |
| `bloom-lab-other-uncategorized` | Other / uncategorized |

All file stems have both `.png` and `.webp` versions. Their source artwork is raster, not SVG; do not imply vector scalability. All icons have decorative ivory rounded tiles with transparent outer corners. Label text is not baked in and must appear in accessible HTML. Avoid fine details under 48 CSS pixels; prefer 64-96 CSS pixels.

## Integration acceptance
- Obtain ZIP from design owner or original conversation and compare internal manifest hashes.
- Commit all 20 image variants, README, and manifest.
- Map actual current lab category identifiers to basenames; never guess a category from image appearance.
- Use optimized WebP by default with PNG fallback.
- Check dark/light theme, reduced-size legibility, focused and selected states, retina scaling, and low vision/accessibility.
- If small-format clarity is insufficient, commission individual simpler vector-first redrawing rather than blindly enlarging raster artwork.
- Record actual GitHub asset commit and screenshots in the existing Premium R4 design issue #3.

This is a delivery record, not a claim of a successful binary upload or UI integration.
