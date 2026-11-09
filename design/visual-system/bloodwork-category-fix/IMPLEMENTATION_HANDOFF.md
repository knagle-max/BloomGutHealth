# Bloom R4 / M1 — Bloodwork Category Visual Repair (Designer handoff)

**Date:** 2026-11-07
**Source package:** `Bloom_R4_M1_Bloodwork_Category_Visual_Fix_2026-11-07(1).zip`, provided by the product owner.
**Source ZIP SHA-256:** `474d6ee3d40be3bb8e896f7d4697110b32cef49474cc5a49124695227b3c9554`.
**Original archive validation:** ZIP CRC PASS; manifest 13/13 payload hashes PASS. Contains 10 SVGs, supplied TSX component, scoped CSS, Designer handoff and manifest.
**Source inspected by Designer:** branch tree `5a523f5d145bca3f1f1c4a2850bdd2abdbb1f152`. Recheck moving HEAD.
**Status:** Assets produced; live rendered visual acceptance NOT VERIFIED.

## Reported problem
The owner-supplied iPhone Safari dark view of Progress → Biology → Bloodwork category list had approximately 130–150px tall repetitive dark cards, low scan density, generic/inconsistent icons, oversized serif category headings and too many nearly identical surfaces. This is a **visual-quality correction**, not a new health interpretation.

## Exact category-to-asset mapping
| Registry ID | Source label | Original SVG |
|---|---|---|
| heart | Heart & cholesterol | `lab-heart.svg` |
| sugar | Blood sugar & insulin | `lab-sugar.svg` |
| liver | Liver & biliary | `lab-liver.svg` |
| kidney | Kidney & electrolytes | `lab-kidney.svg` |
| blood-count | Complete blood count | `lab-blood-count.svg` |
| nutrients | Iron & blood nutrients | `lab-nutrients.svg` |
| hormones | Hormones & thyroid | `lab-hormones.svg` |
| inflammation | Inflammation & immunity | `lab-inflammation.svg` |
| bone | Bone & micronutrients | `lab-bone.svg` |
| other | Other / needs identification | `lab-other.svg` |

These ten original icons are transparent, 24×24, `currentColor`, 1.75px rounded strokes, with no scripts, text or clinical status claims.

## Exact supplied assets (now in the repository)
- **All 10 original SVG assets** are under `client/public/brand/visual-v2/lab-categories/`, with original manifest SHA-256 values copied to the current source ledger. These are source design artwork; they may be used inline by the drop-in component without 10 separate network fetches.
- **Designer-supplied inline TSX implementation:** `design/visual-system/bloodwork-category-fix/LabCategoryIcon.designer.tsx`. Integrate into `client/src/components/LabCategoryIcon.tsx` after checking latest branch for conflicts. Keep existing aria-hidden and source category IDs, fallback to `other` for unknown IDs; no fabricated diagnoses. The shipped source included an unused `useState` import; avoid unused imports when integrating.
- **Designer-supplied CSS:** `design/visual-system/bloodwork-category-fix/lab-categories-premium.designer.css`. **Merge the necessary scoped rules into the existing** `client/src/styles/bloom-visual-scoped.css` after its category rules. DO NOT import as a second theme and do not apply a global body/root skin. Review the Athlete override against the newer owner requirement that Athlete light AND Athlete dark work as distinct themes.
- **Original Designer manifest:** `design/visual-system/bloodwork-category-fix/manifest.json`.

## Implementer requirements, no new workflow or science engine
1. Keep existing `client/src/components/LabExplorer.tsx` native `details/summary` behaviour, URL state, selection callback, marker counts and the source/unknown semantics. Don't replace with independent button click handlers or extra decorative headings. Category icons are symbolic navigation, not interpretations of a user's lab results.
2. **Mobile:** 76–92px category rows, 40–42px icon squares, readable 15px/20px sans category titles, 12px/17px metadata, chevron and wrapping on two lines without truncation; touch target ≥44px.
3. **Desktop/tablet:** compact same semantic structure, no arbitrary 150px min height; page/editorial heading retains serif but category names use sans. Avoid many nested cards or scientific-detail suppression.
4. **Themes:** light porcelain/forest; dark green with readable metadata; Athlete uses its own navy treatment **with distinct light/dark**, not an unconditional dark palette.
5. Preserve keyboard, focus, expanded details, marker selection and original measurements/provenance; never replace value with icons, inferred panel classifications or visually implied results.
6. Validate 320, 390, 768, 1440 CSS px and 200% zoom in Everyday light/dark and Athlete light/dark (when relevant), plus open/closed states, long labels, pending unit-review, no matches, loading/error, 0/unknown, forced colors and reduced motion. Aim for five headers visible at 390px in comparable content where available, but **measure**, don't claim pass without actual browser evidence.
7. Record exact image SHA and actual application checks in compact text QA ledger. The owner's latest preference overrides older requirements for screenshot/image **deliverables** and interim reviews; genuine visual inspection remains required.

**Authority and phase:** This uploaded Designer correction is ADDITIVE to final R4/M1 and the Biology detail-discovery restoration handoff. No unrelated v0.6 work. Complete all desktop/mobile UI and present ONE integrated release candidate before `main`; no interim owner gating.
