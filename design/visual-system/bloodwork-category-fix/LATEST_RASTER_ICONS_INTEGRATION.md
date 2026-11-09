# Bloom R4/M1 — Latest lab category icon review and raster-vs-SVG decision

**Owner-supplied latest artwork:** `Bloom_Lab_Icons_FIXED_All_10(1).zip`. Exact SHA256 `74b63adbdc038f4ddf47275356064e5a5ab70254fc8b3b009c71dffae7e208c6`. ZIP CRC passed. `MANIFEST.json` reports ten 512×512 original raster compositions, each exported as PNG and WebP; **20/20 image bytes/hashes and dimensions verified**. The separate `README.md` expressly calls these **raster-derived, not editable SVG**, with ivory rounded-square background inside a transparent exterior and suggested **64–96px+** use, plus inspect at 32/48/64/96 CSS px. They are different from earlier **24×24 flat line-vector** `lab-{category}.svg` artwork.

**Shared-Library original ZIP (exact):** `/Bloom gut health/Agent Handoffs/Bloom_Lab_Icons_FIXED_All_10_2026-11-07.zip`. The source ZIP was uploaded there for other agents; **not yet present as binary files in this GitHub tree**. Codex must retrieve original bytes through an authorized file transfer, not invent or trace graphics from these notes. Until imported, use already committed ten SVGs as actual functional fallback. Once exact raster files are imported, use the new imagery for approved category locations where legible, without removing fallback or inventing values.

**Existing verified Designer handoff:** `/Bloom gut health/Agent Handoffs/BLOOM_R4_M1_BLOODWORK_VISUAL_FIX_HANDOFF_2026-11-07.md` and corresponding `Bloom_R4_M1_Bloodwork_Category_Visual_Fix_2026-11-07.zip`; also checked into GitHub as `design/visual-system/bloodwork-category-fix/IMPLEMENTATION_HANDOFF.md`. Older package is ten 24px original **currentColor** SVGs, inline React icon implementation and scoped compact-row CSS. It establishes mobile/desktop density, source-preserving `LabExplorer` UX, and final R4/M1 visual QA. Latest raster replaces **the preferred category artwork where safe**, but **does not** supersede the compact category-navigation interaction, biology source accuracy, or photo-contrast/accessibility and theme requirements.

## 10 category IDs and latest names
| Stable category ID | New WebP source filename | PNG fallback |
|---|---|---|
| `blood-count` | `bloom-lab-blood-count.webp` | `bloom-lab-blood-count.png` |
| `sugar` | `bloom-lab-blood-sugar-insulin.webp` | `bloom-lab-blood-sugar-insulin.png` |
| `bone` | `bloom-lab-bone-micronutrients.webp` | `bloom-lab-bone-micronutrients.png` |
| `heart` | `bloom-lab-heart-cholesterol.webp` | `bloom-lab-heart-cholesterol.png` |
| `hormones` | `bloom-lab-hormones-thyroid.webp` | `bloom-lab-hormones-thyroid.png` |
| `inflammation` | `bloom-lab-inflammation-immune.webp` | `bloom-lab-inflammation-immune.png` |
| `nutrients` | `bloom-lab-iron-blood-nutrients.webp` | `bloom-lab-iron-blood-nutrients.png` |
| `kidney` | `bloom-lab-kidney-electrolytes.webp` | `bloom-lab-kidney-electrolytes.png` |
| `liver` | `bloom-lab-liver-biliary.webp` | `bloom-lab-liver-biliary.png` |
| `other` | `bloom-lab-other-uncategorized.webp` | `bloom-lab-other-uncategorized.png` |

**Canonical target:** `client/public/images/editorial/lab-categories/` as README specifies, distinct from the existing vector paths `client/public/brand/visual-v2/lab-categories/`. File names are exact; don't rename without manifest remap. Match original ZIP `MANIFEST.json` byte counts and hashes, 10 PNG + 10 WebP. Use WebP with PNG failure recovery and SVG fallback when neither raster loads. Keep stable square aspect ratios and avoid shifting the category row during load. Never use a remote unverified image URL.

## Implementation decision and responsive reconciliation
1. **Conflict to resolve in the running UI, not by discarding either source:** Older row contract is 76–92px mobile with 40–42px 24px vector tiles. New 512px raster art recommends rendered size **64–96px+**; the detailed texture and ivory tile may be too small at 40px. Test a real 48px, 56px, 64px square thumbnail and available 76–92px row with two-line title and source-count metadata at 320/390. If a satisfactory raster cannot be shown while preserving readable compact rows, keep the 24px SVG on compact mobile navigation and show the 64–96px latest raster in an expanded category detail/desktop feature region. Do not expand every row to 130–150px or sacrifice scan density to fit raster artwork. Record selected presentation per viewport and image optical-fit findings.
2. These rasters have **built-in ivory background**. On dark/Athlete modes treat it as an intentional ivory illustration tile, not a transparent line icon; avoid extra ivory-on-ivory layers, clashing high-contrast outlines, overlapping chevrons, or forced re-colorization that distorts the editorial image. Follow R4 Athlete **light and dark** theme distinction, do not force all Athlete into dark navy.
3. Never classify marker results or health status from pictorial category icons; category labels and marker counts remain real DOM text. Keep correct current account, source facts, unit review, focus, native `details/summary`, name-click-to-detail, keyboard navigation and source-state handling.
4. New raster is meaningful category-navigation accompaniment but not an actual measurement; adjacent HTML name supplies the real category semantics. Image `alt=""` when redundant with adjacent category label; loaded categories and chart data do not depend on icon rendering.
5. Test mobile **320/390**, tablet 768, desktop **1440**, 200% zoom, focus, light/dark Everyday and Athlete, open/closed details, long names, no-result and pending unit review, forced colors, reduced motion, failed image loads and network/performance. Use actual pixel sizes and browser checks, not reference boards. No interim owner screenshots or signoff; one final R4/M1 RC.

## Source verification and release
- Previous SVG files are already in GitHub (10).
- New raster ZIP original and its PNG/WebP derivatives **have been verified but require actual import into GitHub and deployment**. Do not call `IMPORTED`, `DEPLOYED`, `PASS` or completed until exact production files can be fetched from deployed app and layout/contrast is tested.
- The latest ZIP README does not document copyright/licensing provenance, creator prompts or explicit commercial-use terms; record as unknown rather than inventing. Use the previously-approved SVGs pending appropriate clearance if needed for public release.
- Do not introduce separate CSS skin or unrelated scientific behaviour. Complete R4/M1 all seven views, desktop and mobile coequal, then final RC for owner review before `main`.

**Original handoff links:** `design/visual-system/bloodwork-category-fix/IMPLEMENTATION_HANDOFF.md`, `docs/architecture/PREMIUM_R4_M1_MOBILE_MEDIA_BUILD_CONTRACT.md`, Issue #3.
