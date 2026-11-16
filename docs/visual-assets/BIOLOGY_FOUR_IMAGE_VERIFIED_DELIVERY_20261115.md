# Biology four text-safe assets — verified source delivery and Codex import handoff
**Date:** 2026-11-15. **Status:** SOURCE BYTES VERIFIED / INTEGRATION AND DEPLOYMENT NOT VERIFIED.
**Target:** `knagle-max/BloomGutHealth`, branch `enhance/bloom-experience`. **No regeneration or owner per-image review**; preserve pre-existing approved design and eventual integrated release-candidate review.

## Accessible source-of-truth — shared Bloom Library
All files verified from the real shared library; do not confuse these with an inaccessible example filename.
- **Recommended for integration:** `/Bloom gut health/Agent Handoffs/Bloom_Biology_4_TextSafe_WebP_Only_2026-11-15.zip`
  - Library file ID: `file_000000001cbc81fd98ef8d87d494dcc2`
  - Actual archive SHA-256: `9fca7fc0286f1ce6944bc9925be008948eae8506ba8be2675b58950f76e6da45`; 615,425 bytes.
- **Originals and optimized variants:** `/Bloom gut health/Agent Handoffs/Bloom_Biology_4_TextSafe_Editorial_Assets_2026-11-15.zip`
  - Library file ID: `file_00000000bc0c81fdbee35839a0cc3f70`
  - Actual archive SHA-256: `83b32dd71c6e87fc2b6d858988dc91c3ca9629cc894f7772d682c221c227d39d`; 7,913,099 bytes.
- **Independent manifest:** `/Bloom gut health/Agent Handoffs/Bloom_Biology_4_TextSafe_Manifest_2026-11-15.json`
  - Library file ID: `file_00000000b35481fd89eb2a396b4321f5`
  - SHA-256 `60e9ddc4e3d0003922b97544789666145561d8c5178901550167ee237f0ab0ed`; 6,874 bytes.
- A second duplicate of both ZIPs also lives at `/Bloom gut health/` root. **Prefer the named Agent Handoffs copies above.**

**Direct inspection receipt:** Both ZIPs opened; the complete archive contains 4 original PNG + 8 WebP variants, the lightweight one contains 8 WebP variants, and both embed `manifest.json` and `README.md`. All **12 individual image byte sizes and SHA-256s match** the independent manifest. This receipt establishes the files' integrity and access in the Architect's current Library environment; it **does not prove Codex's separate execution environment has already fetched them, or that GitHub/Render hosts the image URLs**. Codex should use its allowed Library/Project Files access, materialize the WebP ZIP by the exact file ID, extract with safe path validation, and verify this checksum. If Codex cannot access the shared Library bytes, state this exact capability blocker and obtain an authorized transfer from the existing shared source, **not** new art generation or another owner-approval cycle.

## Verified asset-to-UI mapping
| Registry ID | Existing Biology overview navigation row | File for 1× responsive image | File for 2× responsive image | Expected final app public URL |
|---|---|---|---|---|
| **BVA-0032** | Bloodwork | `webp/BVA-0032-biology-bloodwork-vial-text-safe.webp` | `webp/BVA-0032-biology-bloodwork-vial-text-safe@2x.webp` | `/images/editorial/biology/BVA-0032-biology-bloodwork-vial-text-safe.webp` |
| **BVA-0033** | Gut reports | `webp/BVA-0033-biology-gut-reports-text-safe.webp` | `webp/BVA-0033-biology-gut-reports-text-safe@2x.webp` | `/images/editorial/biology/BVA-0033-biology-gut-reports-text-safe.webp` |
| **BVA-0034** | Genetics | `webp/BVA-0034-biology-genetics-text-safe.webp` | `webp/BVA-0034-biology-genetics-text-safe@2x.webp` | `/images/editorial/biology/BVA-0034-biology-genetics-text-safe.webp` |
| **BVA-0035** | Measurements | `webp/BVA-0035-biology-measurements-text-safe.webp` | `webp/BVA-0035-biology-measurements-text-safe@2x.webp` | `/images/editorial/biology/BVA-0035-biology-measurements-text-safe.webp` |

1× image geometry is **1086×362**; 2× and PNG are **2172×724**, all exactly **3:1**, wide/editorial and intended for DOM text overlay over left ~45–55% negative space. Optimize web image priority/sizes and verify legibility against real backgrounds; use accessible hidden decorative image when live DOM text conveys navigation. The manifest's source explicitly labels artwork as **AI-generated illustration, not actual patient medical data**, and notes real contrast/screen, scientific and commercial provenance QA still pending.

## Actual developer actions — one bounded integration slice
1. Check `client/src/components/BiologyHome.tsx` and `client/src/pages/PrecisionNutrition.tsx` at current HEAD; the four original navigation entries/actions/source counts already exist. **Do not replace their data/route logic.**
2. Materialize/unzip the **recommended shared WebP ZIP** via the exact Library ID; verify archive digest and member hashes with its embedded manifest. Only use the complete package if originals are materially needed for correct responsive derived variants; otherwise keep the smaller optimized WebP files. Do not commit large original PNGs into app delivery unnecessarily.
3. Put 1× and @2× files in `client/public/images/editorial/biology/`, preserving manifest expected basenames; wire the existing editorial media adapter (or justified minimal pattern) and stable BVA IDs. Avoid arbitrary external prototype URLs or dead image sources.
4. Style existing four BiologyHome navigation surfaces as image-backed premium editorial panels. Render **headings, descriptions, dynamic counts and chevrons as app text over artwork**, with gradient/text-safe contrast and readable mobile crop. Keep full click and keyboard activation, original destinations, no lost access to sources/records, correct Everyday green, other mode palette behavior if relevant.
5. Test network loads and fallback at 320/390/768/1440, light/dark, high text scale and reduced motion; test keyboard/VoiceOver and existing four click destinations, counts, data/source fidelity, app bundle size and failure/offline. Verify exact branch SHA with deployed Render screenshots; don't infer production status from local file existence.
6. Update `docs/visual-assets/visual-asset-registry.json` **BVA-0032–0035 only** with actual first-party paths, hashes and appropriate truthful `Integrated`/ `Visually Verified` stages **after** validation. Update `docs/operations/V06_DELIVERY_STATUS_LEDGER_20261115.md` with implementation/release evidence. Keep public release/RC review distinct.

**Lifecycle:** Source library access + all image SHA matches = **VERIFIED DELIVERED**. At writing: **not committed to GitHub app image paths by this handoff**, and **not verified displayed on the app**. Do not mark otherwise.
