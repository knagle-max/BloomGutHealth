# Bloom — BVA-0036 Complete Blood Count: Verified Delivery & Codex Integration
**Delivery time:** November 15, 2026 (manifest generated 2026-11-16 01:28 UTC) | **Verification:** source files inspected independently | **App integration status:** NOT VERIFIED

## Verified source
- Exact shared Library ZIP: `/Bloom gut health/Agent Handoffs/Bloom_BVA_0036_Complete_Blood_Count_2026-11-15.zip`
- **Library file ID:** `file_000000000c3081fdbd2985339d57ec44`
- ZIP size: **1,985,015 bytes**; SHA-256 `0388641a489c069dd05f21bf5a5e6d37707544b237b93cd80ae16e2a8e16cfa0`
- Independent manifest: `/Bloom gut health/Agent Handoffs/BVA_0036_Complete_Blood_Count_Manifest_2026-11-15.json`; Library file ID `file_000000001f8881fd8e65b75a35e9e4d0`
- Registry patch (already applied in current canonical JSON; **do not apply twice**): `/Bloom gut health/Agent Handoffs/BVA_0036_Complete_Blood_Count_Registry_Patch_2026-11-15.json`; Library file ID `file_0000000096a081fdaf0f94c2067edaac`
- Actual ZIP opened: README, delivery ledger, embedded manifest, original PNG and optimized WebP. **Both images pass byte count, SHA-256 and pixel geometry verification** against the manifest.

| Member | Format | Dimensions | Bytes | SHA-256 |
|---|---|---|---|---|
| `originals/BVA-0036-complete-blood-count.png` | PNG | 1254×1254 | 1,869,843 | `2cd43741460dcac4668a021d733dbc439769bbe18bf711d17d678df6ae770ef0` |
| `webp/BVA-0036-complete-blood-count.webp` | WebP | 1254×1254 | 112,558 | `e95b820fac2c9edcc7cbdf2c7e3f47f0a5da76b98d797eca8a7a7311f851d1fb` |

**Source type:** AI-generated conceptual editorial illustration (red cells, one white cell, platelet-like forms). It is NOT a real person's blood smear, lab result or diagnosis.

## Exact intended application use
- Stable requirement: `BVA-0036` **Complete Blood Count category thumbnail**, `/precision` → Bloodwork systems → Complete Blood Count.
- **Corrected distinctness:** Existing `BVA-0013` is for **Iron & Blood Nutrients** and must retain that asset. **Do not render the same BVA-0013 image for CBC**.
- Proposed first-party public path: `client/public/images/editorial/bloodwork/BVA-0036-complete-blood-count.webp`; resulting public URL `/images/editorial/bloodwork/BVA-0036-complete-blood-count.webp`. Proposed path until actual commit; avoid duplicate files and obey app's current editorial-media conventions.
- Actual Bloodwork Atlas category key and parent screen must be verified against current source; don't guess key or recreate category grouping. Preserve exact source rows, counts, original report navigation, accessible label/action and detailed bloodwork values.
- Image is decorative/educational; render its description and any lab values as DOM text, not text embedded in image. Preserve responsive crop/light/dark contrast, attractive failed-image fallback, keyboard/screen reader and 200% text scaling.

## One narrow Codex task and exit evidence
1. Inspect current GitHub/working-tree HEAD and deployed app, canonical [registry](visual-asset-registry.json) and [existing broad ready-assets handoff](REMAINING_READY_IMAGE_ASSETS_VERIFIED_DELIVERY_20261115.md). If BVA-0036 is already imported and verified at exact SHA, record **ALREADY VERIFIED** and skip. Never redo the full Bloodwork redesign.
2. Retrieve exact shared Library ZIP by file ID, confirm ZIP and WebP SHA, extract safely, and import the **112,558-byte optimized WebP** only (original PNG stays in shared Library unless needed for asset production). Do not regenerate or ask for new user assets.
3. Extend existing editorial-media mapping and Bloodwork Atlas category art lookup with **BVA-0036 for CBC** while retaining BVA-0013 for Iron & Blood Nutrients. Reuse the existing category UI, source/count logic, fallback and navigation.
4. Focused tests: confirm CBC and Iron thumbnails are distinct; actual WebP URL returns valid image; all category links, source-driven marker counts and original report drill-ins are unchanged; 320/390/768/1440 light/dark, keyboard/alt/fallback, 200% text.
5. Update registry `filePaths`/integration status only after actual code import; `Visually Verified` only after real screenshots at exact app/Render SHA. Update [delivery status ledger](../operations/V06_DELIVERY_STATUS_LEDGER_20261115.md) only with observed facts. No per-image owner approval; final owner review at integrated RC.

**Current result:** source bytes verified; registry contains 36 active BVA IDs including 0036 marked **Generated**; no assertion GitHub application binaries, UI integration or deployment completed.
