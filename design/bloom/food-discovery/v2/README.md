# Bloom premium food discovery imagery v2 — binary delivery staging

**The new images are created, optimized, individually named and exported.** Image bytes are packaged as `Bloom_Food_Discovery_Production_Assets_v2.zip` in the conversation download. This GitHub branch commit contains the **target path manifest and integration contract only** because the connector cannot read binary images from the local artifact container. **Do not claim they have been uploaded.**

The archive contains 4 garden stages (PNG + WebP), 32 individually named ingredient images (PNG, WebP and alpha-masked PNG), 2 full original illustration sheets, README and a SHA-256 inventory. Total 108 files. Per-food transparent crops use conservative background masks, not painstaking hand extraction; inspect pale foods and edges. Garden compositions are similar but separately generated and not pixel-aligned — do not crossfade them as identical geometry.

## Transfer once local ZIP is accessible to Codex
1. Unzip archive to `design/bloom/food-discovery/v2/assets/` in this design branch. This puts garden/ and foods/ under assets/. Omit duplicate reference sheets from app bundles, but preserve them as design originals.
2. Correct manifest paths if staging layout differs; record actual Git blob SHA for each image and verify image decodes.
3. Optimize by page context (use WebP for standard display, PNG alpha for necessary transparency). Keep source PNG originals.
4. Keep existing Discover source UI and food search/meal journal separate, and use canonical verified ingredient IDs; pictures must never be proof of ingredient identity or microbiome response.
5. Exclude allergy-restricted items and seafood suggestions. Handle mushroom as fungi and compounds such as oil/mixed grains according to ingredient provenance.

**Do not ship** unless image rights, provider terms and scientific claims are cleared through the existing release process. This is an artwork delivery, not deployed functionality.
