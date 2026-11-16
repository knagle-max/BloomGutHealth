# Bloom — Morphology Artwork Replacement, Ten-Style Registry & UI Mapping

**2026-11-15 — Designer implementation handoff to Chief Architect, Biology, UX, Codex.**

## Status and owner instruction
The user requested **no asset production yet**; the user will provide the ten images individually. Ten morphology visual types are **registered** (BVA-0037 to BVA-0046), but their image files do not exist, are not integrated and must not be claimed as accepted. The current 20 named-organism SVG portraits in `shared/data/scientific-visual-assets.json` are marked **deprecated pending replacement**, not deleted or disconnected. Keep rollback until approved visual replacements ship.

## Exact source and data contract
Source: Biology specialist `Bloom_Shared_Microbe_Morphology_94_Artwork_Handoff_2026-11-15.md`, and the matching 94-row `Bloom_Tester1_94_Organism_Artwork_Mapping.csv`.
Verified `shared/data/biology-content-r4m1-v2.json` fixture `reportedFixtureOrganisms` contains 94 matching names, groups and source ordinals: 82 Bacterium, 7 Virus and 5 Eukaryote. This is **fixture coverage, not an authenticated live Tester1 report audit**. Crosswalk committed at `shared/data/microbe-morphology-crosswalk-v1.json`; 94 original names/ordinals, evidence flags and valid IDs are preserved.

**Never call these taxonomic families.** These ten IDs are broad morphology ARTWORK STYLES, not taxonomic families, organism photos, microscope images, species/strain identification, microbial activities, abundance or health outcomes. Preserve source-reported identity, source dates, evidence, amount and uncertainty independently from the art style. Unknown/ambiguous/new entries resolve to U00.

## Reserved visual asset IDs
| Style | Master visual registry ID | Mapped source entries | Visual basis |
|---|---|---:|---|
| C01 | BVA-0037 | 10 | Cocci in short chains or pairs |
| C02 | BVA-0038 | 6 | Round / oval cocci |
| C03 | BVA-0039 | 35 | Short / oval bacterial rods |
| C04 | BVA-0040 | 21 | Elongated bacterial rods |
| C05 | BVA-0041 | 1 | Branched / irregular rods |
| F01 | BVA-0042 | 2 | Dark yeast-like fungi |
| F02 | BVA-0043 | 3 | Filamentous fungi |
| V01 | BVA-0044 | 4 | Rigid rod-shaped plant viruses |
| V02 | BVA-0045 | 2 | Head-and-tail phages |
| V03 | BVA-0046 | 1 | Enveloped spherical virus |
| U00 | existing bloom-neutral-microorganism-v1 | 9 | Shape not verified |

### Visible example mappings from the supplied screenshots
- `Abiotrophia defectiva` → C01
- `Alistipes communis` → C03
- `Amedibacterium intestinale` → U00
- `Adlercreutzia sp. 8CFCBH1` → U00
- `Alistipes dispar` → C03
- `Anaerobutyricum hallii` → C04
- `Akkermansia muciniphila` → C03
- `Alistipes indistinctus` → C03

## Art production acceptance for each user-supplied image
1. **One independent image per ID**, not a sheet, screen mockup or duplicate. Premium organic scientific editorial treatment, visually distinct silhouettes grounded in the Biology morphology contract; rich but not clinical.
2. Deliver original plus optimized 1x/2x output when warranted; 1:1 safe crop for both 36–48px list art and 160–200px portrait. Dedicated crops may be used if a single wide image loses legibility.
3. Do **not** overlay organism labels, pseudo-scale bars, fake microscopy marks, sample-specific data, health effects, unverified cell structures, flagella, organelles, spores or visual false claims. No forced palette color coding that implies quantified status.
4. Record source and commercial rights, review evidence, SHA-256, dimensions, aspect ratio, source original, optimized output, responsive crop and fallback; keep every asset ID stable.
5. Both thumbnail and detail use **one centrally resolved style ID**; do not separately map the same organism twice, do not guess from genus or partial names, and do not load a unique image per organism.
6. On the detail sheet show: “Illustration of a broad microbial form, not an image of this organism or strain.” U00: “Shape not verified for this report entry.” No organism-specific photo or measured abundance implied.
7. Protect science source provenance and the list/detail overlay. The user screenshots expose right-column clipping and tiny repeated art, which must be addressed through UX-approved responsive fit/scroll and better optical sizing; not through content deletion or false values.
8. Match Bloom mobile and desktop: 320/390/768/1440 widths, 200% zoom, light/dark, reduced motion, failed image fallback. Native image aspect ratio must not create layout shift or block touch/copy/dismiss actions.

## Implementation and retirement sequence
1. User supplies **each of ten finished assets individually**. Designer validates each; Science validates morphology semantics and limitations; Architect coordinates review.
2. Codex records original/optimized files, SHA-256, image URL and review lifecycle in `docs/visual-assets/visual-asset-registry.json`. Source observation mapping stays in `shared/data/microbe-morphology-crosswalk-v1.json`.
3. Codex implements a **single source-scoped resolver** in `shared/microbe-artwork-groups.ts` (or agreed equivalent): use source-observation ID first, exact source-scoped name+ordinal only when unambiguous, otherwise U00. No LLM morphology mapping at render time.
4. Update `OrganismPortrait.tsx` list and detail mode to consume identical style key. Remove the existing species/slug-based public SVG routing only after new images are live and tested.
5. Run 94 fixture crosswalk tests, actual current user report reconciliation with authorized access, source-fidelity/adversarial tests, failure/withdrawal fallback and 320–1440px visual screenshot matrix.
6. At successful replacement acceptance, promote ten registry entries to **Integrated** and then **Visually Verified** based on evidence, mark old named SVGs **Retired**, and delete/unreference files only after an Architect-approved rollback window.
7. Never retire U00: neutral fallback remains required, also on missing or withdrawn source art.

## Architecture constraints and status
**Already updated:** `docs/visual-assets/visual-asset-registry.json` (ten new slots and legacy retirement plan); `shared/data/microbe-morphology-crosswalk-v1.json` (exact 94 entries and categories); `shared/data/scientific-visual-assets.json` (20 prior named portraits marked deprecated for future direction without runtime impact).

**NOT done:** User has not supplied any of the ten new art files; no new art generated; no new resolver wired; no old image deleted; no production visual acceptance. One old portrait remains visible in the supplied screenshot because retirement is currently a registry/migration designation, not an active release change.

The Chief Architect should approve the crosswalk basis and retirement state together with Biology/UX before Codex changes runtime mapping. No owner interim art production request is triggered by this handoff.
