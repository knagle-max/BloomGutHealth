# Bloom — Architect review: two approved morphology artwork deliveries

**Reviewed:** 2026-11-23. **Disposition:** ACCEPT owner-approved **visual sources**, subject to independent science/rights and real app acceptance. **No runtime integration or source-taxonomy validation authorized.** Governing task selector: `AGENTS.md` / `NEXT_ACTIONS.md`; GI-01..GI-10 baseline and owner STOP remain first.

## Exact owner-uploaded package receipts

| Package | Exact SHA-256 | Contents and integrity |
|---|---|---|
| `Bloom_Bacterial_Morphology_Approved_Set_v2(1).zip` | `55711772bc84f1692e333b8eab0437209521eea70562d546ce18b7415c7850cc` | 22,996,774 bytes, **16 members**, ZIP CRC passed. 11 approved original PNG illustrations, `MANIFEST.csv`, `HANDOFF.md`, `README.md`, contact sheet. Six numbered BVA-0091..0096 primary families plus five new style codes C07..C11. |
| `Bloom_BVA_0091_0096_Approved_Morphology_Artwork_v1(1).zip` | `69cb7139550fbacb1bdb9129634549b64e2bfa9bb02a0e174ebd3957b833a5c0` | 30,631,681 bytes, **42 members**, ZIP CRC passed. 13 original PNG variants, 13 × 1024px portrait WebPs, 13 × 256px thumbnail WebPs, SHA/size/dimensions manifest, README, contact sheet. Independently validated **all 39 original/derivative SHA-256, dimensions and byte counts** against the manifest. |

**Visual inspection:** Both contact sheets display the approved Bloom macro illustration system—lilac/purple organisms, green undulating substrate/bokeh, square compositions, cinematic lighting. The 13-image kit includes 2 curved-rod variations M01/M02, 4 budding-yeast Y01–Y04, 4 archaeal A01–A04, and one each protist P01–P03. The broader v2 set adds 5 bacterial shapes C07–C11. Contact sheets are QA references, not deployable visual assets.

## Reuse and overlap reconciliation

The six v2 **primary** images for C06/F03/A01/P01/P02/P03 are **byte-identical** to specific originals in the 13-image v1 kit:
- C06 primary = `M02` (S-shaped rod)
- F03 primary = `Y04` (single prominent yeast bud)
- A01 primary = `A04` (compact coccoid archaeal aggregate)
- P01 = `P01`
- P02 = `P02`
- P03 = `P03`

Thus the two archives do **not** contain 24 independent approved family assets; they contain **18 unique original PNG artworks**: 13 within existing six BVA families plus five new C07–C11 illustrations. The v1 kit is the authoritative **optimized export package for BVA-0091–0096**; the v2 set is the primary-selection and five-family extension manifest. Do not regenerate any of these, treat duplicates as extra variants, or falsely claim that six full families now require fresh image creation.

## Repository and morphology handoff reconciliation

**Actual current source:** `docs/visual-assets/visual-asset-registry.json` already contains **BVA-0091–0096** as `Briefed` / old `NOT_GENERATED` claims. The original 11 style BVA-0037..0047 (including U00 neutral fallback) are preserved. The existing `microbeMorphologyProgram.coverageRevision20261122` refers to the same 190-entry source `Bloom_Full_190_Microorganism_Morphology_Crosswalk_v2_2026-11-22.json` (read from Shared Library, 190 rows; source remains **PROVISIONAL_MORPHOLOGY_CLASSIFICATION_REQUIRES_FINAL_REVIEW**). Verified its style counts: C06=2, F03=4, A01=4, P01=1, P02=1, P03=1; **zero current entries map to C07, C08, C09, C10 or C11**. The 190 organism entries are a seed/research catalog, **not validated live Tester1 data**. Art delivery does not validate any of the 190 species assignments or justify switching the active resolver.

**ID correction:** the v2 `MANIFEST.csv` uses `BVA-C07`, `BVA-C08`, etc. These are **not valid permanent registry IDs** under the canonical numeric `BVA-0001` sequential-ID policy. The five additional approved visual families are registered below as **BVA-0097–0101**, mapping C07–C11 respectively (source manifest's BVA-C## remains a *noncanonical source alias*). This does **not** invent organism mappings or authorize runtime usage. The original C06–C11 codes are visual morphology style IDs only, not scientific/taxonomic families.

| Canonical BVA | Style | Approved visual family | 190-entry catalog mappings now |
|---|---|---|---:|
| BVA-0091 | C06 | Curved/comma and sigmoid bacterial rods | 2 |
| BVA-0092 | F03 | General budding yeasts | 4 |
| BVA-0093 | A01 | Methanogenic archaea conceptual visual variants | 4 |
| BVA-0094 | P01 | Vacuolated intestinal protist | 1 |
| BVA-0095 | P02 | Amoeboid intestinal protist | 1 |
| BVA-0096 | P03 | Pear-shaped flagellated intestinal protist | 1 |
| BVA-0097 | C07 | Helical and spiral bacteria | **0 — extra design only** |
| BVA-0098 | C08 | Thin flexible spirochetes | **0 — extra design only** |
| BVA-0099 | C09 | Segmented filamentous bacteria | **0 — extra design only** |
| BVA-0100 | C10 | Pleomorphic bacteria | **0 — extra design only** |
| BVA-0101 | C11 | Fusiform/spindle-shaped bacteria | **0 — extra design only** |

## Science and source-fidelity blockers

1. **Owner visual approval ≠ microbiology validation.** Illustrated forms are not verified specimens, microscopy, strain/type portraits, species diagnostic images, colonization levels, pathogenesis, expression, health effect, or a sample finding. Source mapping remains reviewed per organism with specific authoritative evidence and version. User-facing disclosure should say **“Illustration of a broad microbial form, not an image of this organism or strain.”**
2. **A01 scientific ambiguity:** Four visually divergent archaeal renderings (lobed, elongated chain, coccoid cluster) may not be consistent with source-identified methanogens. Exact species and cell-envelope/morphology suitability require Biology review; don't apply a lobed cluster simply because an art manifest says A01. **P03 flagellation** likewise requires review for actual mapped taxa. C07–C11 represent conceptual morphotypes and may overlap C06/other styles; no new taxon mapping follows from art being available.
3. **Source/rights:** ZIPs are attachments available to this Architect, but not yet validated to be in Codex's GitHub checkout. Generated artwork permission and provenance for commercial app use, image alt text, original/derivative consistency and U00 fallback remain gates. Do not embed original high-resolution PNGs everywhere when optimized variants exist.
4. **Status interpretation:** Existing BVA-0091..0096 `NOT_GENERATED` is now factually superseded **at source-delivery level only**; use `Generated` lifecycle only if it unambiguously means owner-supplied source existence, not integrated/accepted imagery. To avoid overstating scientific readiness, preserve existing `Briefed` lifecycle and record explicit `OWNER_APPROVED_VISUAL_SOURCE_RECEIVED_NOT_INTEGRATED` production state. Newly listed BVA-0097..0101 use the same conservative evidence status.
5. **Deferred constraints:** BVA-0053–0077 conditional single-organism candidate portraits remain separate and are not automatically generated by these family-level assets. Do **not** reactivate EE-04/ASSET-EE-08/09 microbial Easter eggs, which remain explicitly deferred. No separate organism art resolver, duplicated asset registry, speculative biological score or current task activation.

## Design/engineering readiness receipts when eligible

When the owner selects a future narrowly scoped asset-import task: obtain exact approved ZIP bytes, verify the SHA hashes and 39 optimized exports; review license/source and Biology mapping by taxon; verify portrait/thumbnail browser appearance at 36px/180px across everyday/athlete light/dark, proper alternative text, U00 fallback, source identity, inactive/withdrawn/revised source statuses and no user-specific biology conclusion. Use existing `shared/data/microbe-morphology-crosswalk-v1.json` and source/provenance controls; only migrate the 190-entry candidate crosswalk if independently qualified. Keep runtime replacement rollback and legacy assets available until actual app tests pass. Record separate Design / Biology / Rights / Runtime / Hosted / Consumer receipts.

**Decision:** ACCEPT owner-approved visual source packages (six families + five optional unmapped extensions), with all further mappings/science/accessibility/rights/implementation **pending**. **Current GI-01..10 evidence baseline + STOP for owner review remains sole Codex assignment.**
