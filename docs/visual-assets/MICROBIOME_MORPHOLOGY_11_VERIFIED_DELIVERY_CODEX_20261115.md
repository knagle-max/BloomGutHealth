# Bloom — 11 Microbiome Morphology Assets: Verified Source Delivery and Two-Size Codex Integration
**Date:** 2026-11-15 (UTC sources dated 2026-11-16) | **Status:** 44/44 original/optimized image checks PASSED; registry and 94-entry source map present in GitHub; **app integration and hosted visual verification not established by this handoff**.
**Primary development task:** Existing microbiome page image upgrade, **not a new biology engine, parser, taxonomic family system, 94-image generation project or user-facing experiment**. Owner reviews combined integrated RC only; Codex develops and tests with relevant specialist standards in mind.

## 1. Exact verified shared Library sources — do not regenerate
All files genuinely retrieved and inspected from **`/Bloom gut health/Agent Handoffs/`**.

| Deliverable | Exact file | Shared Library file ID | SHA-256 | Bytes |
|---|---|---|---|---:|
| Production optimized images | `Bloom_Morphology_11_WebP_Production_2026-11-15.zip` | `file_00000000357881fd853d35cb5b99271f` | `d0e24fd0e26ca61b135056d651ba65aaa45861bcc3e8c834d57edec21f7b8d6b` | 2,667,125 |
| Preserved PNG originals | `Bloom_Morphology_11_Original_PNG_2026-11-15.zip` | `file_0000000022f481fdaeeddec849d06c29` | `aa6b3024c428d420cb26bf647e074ac7be8db9aa0ce416f72ff0cd9933dcca00` | 22,156,759 |
| Independent asset manifest | `Bloom_Morphology_11_Production_Manifest_2026-11-15.json` | `file_000000001c5881fd9d1edb94cb5b4c21` | `f33739f2bf0bf7562ec482d20b6e2933ef6c1d23a6e20366ea8f32d05a36fbd6` | 24,054 |
| Exact 94-report-entry mapping | `Bloom_Tester1_94_Organism_Artwork_Mapping.json` | `file_000000000eac81fdaebead5d26b9d81f` | `15494dcb3f4d5a555aec6813ccd66d7ed6cc04c2efd6823cc7ec09d3587e5dbe` | 41,103 |
| Biology specialist handoff | `Bloom_Shared_Microbe_Morphology_94_Artwork_Handoff_2026-11-15.md` | `file_00000000a5b881fdb86fcbab95d72cdd` | in original Library | 18,887 |

**Independently verified raw image files:** `33/33` optimized WebPs (eleven classes × **256×256 thumbnail**, **1024×1024 portrait**, **1536×1024 full-frame**), and `11/11` original 1536×1024 PNGs. All 44 image members match their individual manifest SHA-256 **and byte length and actual decoded dimensions**. Both archives also have their own README and manifest. **Do not import original 22MB PNG batch into public app bundle**; retain it in shared Library and import just the optimized WebPs needed by UI.

**Source availability statement:** Architect verified bytes in current shared Library environment. Codex must still obtain/copy the file in **its own** environment, using exact Library file IDs above or approved file transfer. Do not report GitHub or Render public image availability until Codex confirms actual runtime paths.

## 2. Mapping source already present in GitHub
- [Current master visual registry](visual-asset-registry.json) has **47 active BVA IDs**, including **BVA-0037 through BVA-0047**. At verification, all eleven are `Generated`, not `Integrated`.
- `shared/data/microbe-morphology-crosswalk-v1.json` is **already in current GitHub** with 11 style definitions and **94 source entries**. **Use this existing shared JSON as runtime mapping basis. Do NOT create a duplicate 94-row scientific database or map one artwork to each of 94 separate generated files.**
- Source 94-entry crosswalk is from `shared/data/biology-content-r4m1-v2.json` at fixture blob `ecb54d3aa4622a1c97bef07b34757693e1a29c47`. Independently counted 94 **unique source ordinals and reported names**, group breakdown **82 Bacterium / 7 Virus / 5 Eukaryote**, 11 recognized style keys and no missing key within this supplied mapping. **This does not prove the currently authenticated Tester1 report is identical**; test against actual owned data without disclosing identities in logs. The terms `Bacterium`, `Virus`, `Eukaryote` are provider report groups, not all bacteria.
- Artwork classes are **morphology archetypes**, not taxonomic families. An entry's provisional genus-level shape must not become a species/strain identification or measured microscopic observation; preserve report's original taxonomy, rank, value and date.

## 3. Exact category-to-BVA mapping, filenames and counts
| Style ID | Permanent asset ID | Artwork | Fixture entries | ZIP source prefix |
|---|---|---|---:|---|
| C01 | BVA-0037 | Cocci in chains or pairs | 10 | `C01-BVA-0037` |
| C02 | BVA-0038 | Round or oval cocci | 6 | `C02-BVA-0038` |
| C03 | BVA-0039 | Short/oval bacterial rods | 35 | `C03-BVA-0039` |
| C04 | BVA-0040 | Elongated bacterial rods | 21 | `C04-BVA-0040` |
| C05 | BVA-0041 | Branched/irregular rods | 1 | `C05-BVA-0041` |
| F01 | BVA-0042 | Dark yeast-like fungi | 2 | `F01-BVA-0042` |
| F02 | BVA-0043 | Filamentous fungi | 3 | `F02-BVA-0043` |
| V01 | BVA-0044 | Rigid rod-shaped plant viruses | 4 | `V01-BVA-0044` |
| V02 | BVA-0045 | Head-and-tail bacteriophages | 2 | `V02-BVA-0045` |
| V03 | BVA-0046 | Enveloped spherical virus | 1 | `V03-BVA-0046` |
| U00 | BVA-0047 | Neutral shape-unverified background | 9 | **`U00-U00` in actual ZIP, `U00-BVA-0047` as canonical published filename** |

**Exact optimized ZIP member conventions** for every style `X`, ID `BVA-YYYY`:
- Gut Reports **small list tile**: `webp/thumbnail/X-BVA-YYYY-thumbnail.webp` (**256×256**) → propose `client/public/science/morphology-v1/x/X-BVA-YYYY-thumbnail.webp`.
- **Individual named-organism detail**: `webp/portrait/X-BVA-YYYY-portrait.webp` (**1024×1024**) → propose `client/public/science/morphology-v1/x/X-BVA-YYYY-portrait.webp`.
- Optional wide supporting/education art: `webp/full/X-BVA-YYYY-full.webp` (**1536×1024**) → only if an actual approved component needs it; do not gratuitously create a third UI mode.
- For **U00** only, original members are `webp/{thumbnail,portrait,full}/U00-U00-{variant}.webp` and master registry ID is **BVA-0047**; source ZIP and original manifest do not use `U00-BVA-0047`. At **import output**, rename to canonical `U00-BVA-0047-{variant}.webp` **without changing bytes/hashes**. The master BVA registry `delivery.*.path` and source crosswalk style member paths were corrected on 2026-11-15 to use the actual ZIP names. This prevents 404s/double IDs. Confirm current HEAD before applying a second patch.

## 4. Existing active presentation, no-regression
`client/src/pages/Microbiome.tsx` already uses `OrganismPortrait` in Gut Reports' `Bacteria` area, with source-aware `reportedTaxa`, source selector and a detail overlay. `client/src/components/OrganismPortrait.tsx` already has `size:'thumbnail'|'portrait'` (nominal 36px / 180px), graceful error fallback and captions, but `organismIllustration` in `shared/scientific-visuals.ts` currently uses legacy exact-name SVGs in `shared/data/scientific-visual-assets.json`. **Extend the existing resolver** using `microbe-morphology-crosswalk-v1.json` and the new first-party WebPs. Avoid a second portrait component, router or source/taxonomy resolver.

**Binding matching policy:** Exact current source-scoped name/observation identity as already supplied, with additional reviewed alias/ordinal rules where necessary. NO substring/LLM/case-guessing or inferred morphology for new named taxa. For any unmatched, ambiguous or absent mapping, resolve **U00**. Retain existing SVG fallback until new artwork passes actual browser QA; fallbacks also on image load error.

Both locations must resolve the **same style key**:
1. **Gut Reports list (small):** source observation → verified crosswalk style → `thumbnail` variant; good 36–48px crop and stable click target, no change to source count/amount/tag or sort.
2. **Within organism detail (large):** **same style key** from same source observation → `portrait` variant, actual visual size appropriate to 180px+ responsive panel, caption clearly conceptual and not user's sample; no false species photo, actual abundance, metabolism or diagnosis.
3. Distinguish virus/fungus/bacterium category where provider source supports it; e.g. plant-associated viral entries are **not** gut bacterial species or proof of human infection. Avoid the UI term `bacterial` for a count/list containing non-bacteria unless existing source label demands it (do not change actual data just for artwork).

**Disclosure:** For mapped entries show `Illustration of a broad microbial form, not an image of this organism or strain.`; for U00 use `Shape not verified for this report entry.` Art is conceptual even where morphology class is `reviewed_group`; report identity does not visually verify morphology.

## 5. Actual Codex implementation sequence
1. Confirm latest HEAD and existing real app/CI/Render state. If these exact assets/crosswalk are already imported and verified, record **ALREADY_VERIFIED** and skip duplicates.
2. Use exact shared Library WebP ZIP file ID and manifest, verify archive digest and every member; import necessary optimized files into **first-party app static paths** (canonical BVA-0047 output naming). Preserve original PNG ZIP separately; no new image generation or manual sourcing needed.
3. Update existing shared resolver and `OrganismPortrait` with one source-scoped explicit style mapping, not live speculative classification. Keep stable thumbnail/portrait resolution **for the same observation**, strict fallback and legacy art rollback.
4. Render on existing Gut Reports list and detail overlay without changing source taxon IDs, quantities, status, grouping, corrections, cards or user privileges. Preserve keyboard/open-close/focus behavior; any old SVG removal is a later cleanup **after** actual acceptance.
5. Tests: crosswalk 94 ordinals/unique names, 82/7/5 groups, 11 keys; exact source fixture vs current authenticated report difference and no sensitive logs; unknown/duplicate/rank/case/strain/provisional fallback; all 11 image URLs, 256/1024 raster decode, 36/180px crop, 320/390/768/1440 light/dark/200% text, account isolation, proper science disclaimer and baseline no-change to taxa data; running app's actual source counts and detail navigation. Preserve integrity check against manifest and library file hashes.
6. Update [master registry](visual-asset-registry.json) only with **actual imported public paths** and verified integration state; update [delivery status ledger](../operations/V06_DELIVERY_STATUS_LEDGER_20261115.md) and concise active queue/verification receipt at exact code/hosted SHA. `Generated` ≠ `Imported` ≠ `Visually Verified`.

**Developer availability:** The actual ZIPs, mapping, manifest and science handoff are in the shared Library and verified accessible to Architect; the exact file IDs and digests above allow Codex/agent to fetch them. Their existence **does not prove Codex separately fetched them** or that GitHub binary files are imported. If Codex cannot access the shared raw files, state that exact transfer blocker; continue working on authorized safe code/fixtures, **do not regenerate**.

## 6. Timing, reviews and release
This is a bounded existing v0.6 visual-delivery and source-identity correction, not an expansion of the scientific interpretation engine. Codex develops without intermediate owner or specialist approval gates, applying Biology/Integrations/Security/UX standards while coding. Full integrated agent audits and owner's one RC review happen before `main` merge. Independently restricted real-user data/research/clinical execution remains protected. No assumptions that supplied concepts represent verified strain shape.

**Completion criterion:** All 11 class images are genuinely available to app with correct public hashes, existing Gut Reports thumbnail and organism-detail portrait show corresponding style from the **same source-matched observation**, unknown defaults to neutral BVA-0047, source records unchanged, accessible UI and exact Render/CI screenshots verified. Nothing is complete merely because the manifest says generated.
