# Bloom R4 Mobile Visual & Media Build Specification — M1 Designer Review

Date: 2026-11-07  
Disposition: **ACCEPT M1 FOR IMPLEMENTATION WITH THE FOLLOWING DESIGNER-OWNED CORRECTIONS**. This is a design handoff, not live browser visual acceptance.

## 1. Source status corrections

The M1 document correctly recorded the absence of D3-R WebPs at the time of its own inspection; that status is now superseded by the delivered and Shared-Library-published `Bloom_R4_Editorial_Raster_Production_13_Originals_26_WebP_2026-11-07.zip` and associated standalone raster manifest. The package preserves 13 original PNGs and 26 WebP exports (1x and 2x). Seven original cutouts passed programmatic alpha-channel checks. Published asset bytes do **not** establish repository import, public HTTP 200, live responsive crop, licensed commercial rights, visual quality acceptance, or production deployment. The 2x wide assets were upscaled from supplied originals; file-size exceptions are recorded. All M1 references stating `D3-R NOT DELIVERED`, `still-pending`, `future import`, `unproduced WebP`, or `TO COMPLETE — Designer` for production of assets should be replaced by `DELIVERED TO SHARED LIBRARY / REPO IMPORT AND BROWSER QA PENDING`. Retain original M1 verified-repo chronology as historical evidence; record this as a dated superseding amendment, not a rewrite of its observations.

## 2. Canonical media ownership and target path

- One canonical scoped Designer stylesheet: `client/src/styles/bloom-visual-scoped.css`, under `.app-shell[data-bloom-visual="premium"]`; no separate global visual skin.
- Developer/Architect must select **one** repository target for editorial raster files. Designer preference is `client/public/images/editorial/` consistent with the committed `design/visual-system/BLOOM_EDITORIAL_VISUAL_ASSETS_HANDOFF_2026-11-07.md`; if Architect elects `client/public/brand/visual-v3-media/`, remap URLs in one manifest and avoid duplication. Real paths and returned HTTP status must be checked at pinned commit.
- Keep original 13 PNGs, 26 WebPs, and production manifest in traceable packaging; preserve per-file hashes and source-to-destination mapping.

## 3. Media-slot and responsive visual paint — no guessing

The following rules specify intended compositions, not an assertion that active TSX selectors or screenshots were inspected.

| Route/slot | Preferred image | Mobile 320–390 | Tablet 768 | Desktop 1440 | Safety rule |
|---|---|---|---|---|---|
| Today/CompanionHero | `bloom-blueberry-sprig` cutout, optional separate coneflower; meadow only if banner composition demonstrably better | 96–140px cutout, contain, align toward free edge, never opacity 0.07; may hide at 320 if CTA conflicts | 120–170px contain | 170–230px contain | One primary composition, CTA on opaque surface |
| Food/introduction | `bloom-food-oatmeal-linen` banner; bowl cutout for secondary editorial examples | 120–160px height, image-only band, object-position ~70% 50%, text in separate block | 180–230px, focal right | 12:5, no text on uncontrolled photo | Never suggest editorial food was logged |
| Biology/educational hero | `bloom-biology-rods` OR `bloom-biology-abstract-cells` | 112–156px image-only band, right-weighted crop; explicit visible caption beneath | 160–210px with caption | 12:5, caption outside image | Visible `Illustrative, not your data`, never microbiome species portrait |
| Explore/featured | `bloom-explore-blueberry-macro` | 120–150px band, object-position ~75% 50%; title below photo | 170–220px | Right subject/quiet left only when actual contrast passes | Research caveat/source never over image |
| Progress/intro | `bloom-three-leaf-sprig` optional cutout | Hide at 320; 56–88px at 390 only if there is space | 72–112px | ≤140px peripheral motif | Never cover charts, units, dates or source |
| Athlete/header | `bloom-athlete-mountains` | 112–156px image-only navy band, object-position ~75% 50%; 72px or hide at 320 if necessary | 170–220px band | 12:5 with navy solid text panel | Never mask sets, fueling, session state or consent |
| Profile/intro | `bloom-three-leaf-sprig` optional | Hidden near settings/privacy/edit controls; max 56–80px where safe | ≤100px | ≤120px decorative | Never cover unsaved/revoke/destructive states |
| State illustration | Existing R4 87-SVG library | 80–120px where actual empty state; omit if dense | ≤140px | ≤180px | No celebratory image for unconfirmed save |

Use existing approved colors/tokens: canvas #F8F9F3; paper #F5F3EB; porcelain #FFFEFA; forest #173E32; brand #246B50; sage #D9E7D5; mist #EDF3EC; clay #D4A37C; lilac #C9BDE3; secondary #52685C; Athlete navy #0F1B2E/surface #182B45/accent #81BEFF. R4 typography remains authoritative; surface radius 26px, hero radius 28px, editorial radius 32px, controls 14px; no new glass UI palette. Natural photo pixels need not equal UI token hex values. Avoid image-dependent text contrast; use solid readable text panel. No overlays or masks in SVG fallback that obscure critical content. One primary image per slot, optional decorations only when visually safe.

## 4. Developer implementation amendments to M1

1. Change M7 from "integrate when produced" to "import delivered D3-R WebPs and originals; verify hashes; wire progressive per-slot integration". This does not block M1–M6.
2. `EditorialMedia` must switch to SVG fallback when WebP **loads unsuccessfully**, not merely when WebP format is unsupported. Use a stateful `onError` fallback or equivalent, with no broken image icon; test missing 1x and 2x separately.
3. Match width and height or reserved `aspect-ratio` to the **actual** asset. Use `srcSet`/`sizes` appropriate to layout. The top-of-page true LCP image alone may use eager/high; below-fold and mobile-hidden images lazy. Do not eagerly load both SVG and WebP candidates.
4. If conceptual image is visible, render separately accessible literal text `Illustrative, not your data`; retain it on fallback and mobile. Never bake text into imagery.
5. Keep decorative image `alt=""` and screen-reader-hidden, preserve existing DOM and focus order, 44px actions, state copy and data provenance.
6. In forced-colors/high-contrast and reduced-transparency, suppress decoration if necessary and use solid approved surfaces; no image-dependent action visibility.
7. Motion uses the existing canonical scoped rules and reduced-motion behavior; images should not independently animate.

## 5. Final visual acceptance — pending implementation

No Designer PASS without actual current-branch captures. Test 320/390/768/1440 widths and 200% zoom, Everyday light/dark and Athlete as appropriate, 404/offline fallback, forced-colors, reduced-transparency and reduced-motion. Compare actual component rectangles for media and primary CTA/status/source collision. Verify contrast: ≥4.5:1 normal text and ≥3:1 large text, sampled against worst-case photographic pixel wherever any image-adjacent overlay is used. Capture pinned SHA, image URL/hash, screenshot and breakpoint. Approve 7 route compositions individually after Code/Architect/UX review. No mandatory interim owner stop/go: final user review prior to `main`.

## 6. Disposition

M1 STRUCTURAL UX: ACCEPT.  
DESIGNER ASSET PRODUCTION: COMPLETE FOR R4 D3-R PACKAGING, LIVE QA PENDING.  
DESIGNER MOBILE PAINT CONTRACT: SUPPLIED HERE, SUBJECT TO REAL IMPLEMENTATION PIXEL QA.  
R4 APPLICATION VISUAL ACCEPTANCE: NOT TESTED / NOT APPROVED.  
Implementation must continue without a product-wide stop-work gate.