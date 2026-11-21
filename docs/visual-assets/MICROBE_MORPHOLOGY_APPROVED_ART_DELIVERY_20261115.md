# Bloom — Morphology 10 + U00 Approved Visual Selections: Delivery to Chief Architect

**Date:** 2026-11-15  
**Visual designer disposition:** Owner-selected artwork delivered for technical integration and multi-discipline review; **NOT a claim of scientific validation or deployed-UI acceptance**.  
**Repository:** knagle-max/BloomGutHealth, branch `enhance/bloom-experience`

## Where the files are published

**Shared Library:** `Bloom gut health / Agent Handoffs /`

- `Bloom_Morphology_11_WebP_Production_2026-11-15.zip` — small delivery package with 33 individual WebPs: 11 styles × thumbnail 256×256, portrait 1024×1024, and full 1536×1024.
- `Bloom_Morphology_11_Original_PNG_2026-11-15.zip` — exact 11 individually generated original PNGs, without alteration.
- `Bloom_Morphology_11_Production_Manifest_2026-11-15.json` — SHA-256 for every file, crop coordinates, dimensions, IDs, review caveats and intended slots.

**Source-of-truth GitHub:**
- `docs/visual-assets/visual-asset-registry.json` — BVA-0037 to BVA-0047 now point to the exact published individual files and real hashes.
- `shared/data/microbe-morphology-crosswalk-v1.json` — preserves exact 94 fixture entry mapping to 10 morphological art styles and U00, now linked to the published images.
- `shared/data/scientific-visual-assets.json` — the old 20 named-organism SVG portraits are flagged for retirement but still serve the existing app. Do not delete until a validated cutover.

## Asset family mapping

| Style | BVA ID | Fixture entries | Description |
|---|---|---:|---|
| C01 | BVA-0037 | 10 | Cocci in chains/pairs |
| C02 | BVA-0038 | 6 | Round or oval cocci |
| C03 | BVA-0039 | 35 | Short/oval rods |
| C04 | BVA-0040 | 21 | Elongated rods |
| C05 | BVA-0041 | 1 | Branched/irregular rods |
| F01 | BVA-0042 | 2 | Budding yeast-like fungi |
| F02 | BVA-0043 | 3 | Filamentous fungi |
| V01 | BVA-0044 | 4 | Rigid helical plant virus rods |
| V02 | BVA-0045 | 2 | Head-and-tail phages |
| V03 | BVA-0046 | 1 | Spherical enveloped virus |
| U00 | BVA-0047 | 9 | Green biological atmospheric backdrop without any organism depiction |

**Owner selection fidelity:** V02 is the original first bacteriophage image; V03 is the first spherical image with cyan-blue spikes, not the later all-purple variant; V01 is the later correct rigid helical rod; U00 is the final organism-free green backdrop. Rejected V01 and U00 candidates are **excluded** from both delivery archives.

## Integration contract for Codex

1. Import the distinct files to a fixed first-party `client/public/science/morphology-v1/` directory. Verify SHA-256 against both manifest and registry; return the verified commit path and SHA. Neither source science data nor current report identities should be changed.
2. Centralize resolution of organism source-scoped identity or observation ID to C01–V03/U00. Do not infer a species shape or match via substring/LLM. Map the same style ID to `OrganismPortrait.tsx` in thumbnail and portrait modes. Display the original reported name in DOM text separately.
3. Maintain correct scientific label: **“Illustration of a broad microbial form, not an image of this organism or strain.”** For U00: **“Shape not verified for this report entry.”** Never call these *taxonomic families*; they are broad visual morphology classes.
4. Thumbnail must read distinctly at actual **36–48px** and sheet portrait at **160–200px**. Validate mobile widths 320/390/768, desktop 1440 and 200% zoom, light/dark, object-fit crop, accessible alt behavior and loading failure. U00 image fallback returns current neutral inline symbol safely.
5. Preserve source provenance, original organism names, uncertainty and true quantitative missingness. No claim that the current authenticated Tester1 database was queried: the audited mapping covers the 94-report **fixture** entries only.
6. Independently review morphology fidelity with Science, rights/attribution with Legal, preview UX behavior with UX and actual screenshots with Designer/owner. The selected art is synthetic editorial 3D illustration, not real microscopy or the user's sample.
7. Once all ten art styles plus U00 are integrated and accepted, retire the 20 legacy named SVG portraits. Keep rollback hashes until Architect releases the rollback period.

## Visual QA note

The Designer inspected 96px and 40px thumbnail simulations of all 11 crops. Styles are sufficiently distinguishable as an initial production candidate, but this visual preview does **not** replace screenshots of the actual running application or expert scientific review. The F02 depiction includes reproductive structures and is a morphological archetype, not a proven image of any listed fungus.

**Release status:** Artwork and registries available to Architect/Codex. Runtime implementation, live source mapping, production QA and scientific/rights approval outstanding.
