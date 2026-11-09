# Bloom v0.5 Full RC — Graphic Designer final review (source-evidence disposition)

Review date: 2026-11-08. Repository: `knagle-max/BloomGutHealth`; PR #1; examined branch HEAD `f077da1aade3da240180c5bdccc5981702603205`. Exact whole-RC application fingerprint recorded in `docs/verification/V05_FULL_RELEASE_CANDIDATE_20261108.json`: `d20e384b9223bef553f6a0def273f0d697028846`. Preview URL reported: `https://bloomguthealth.onrender.com/`. This document is *not* a claim of an authenticated live-browser inspection or independent visual PASS.

## Disposition
**DESIGNER FINAL VISUAL PASS: NOT GRANTED — LIVE SCREEN EVIDENCE NOT INSPECTED.**

The engineering candidate and earlier R4/M1 acceptance packages report 672 passing tests, build, hosted browser and isolated-database validation. Those are development evidence, not proof of finished optical layout, photography crop, theme parity or appearance. The owner's prior Progress > Biology > Bloodwork mobile screenshot was explicitly rejected for oversized repetitive category cards and generic illustration art; code changes address density, but the user later also requested the richer icon artwork.

## Source verified at current HEAD
- `client/src/components/LabExplorer.tsx` retains category `details/summary`, counts, search and marker behaviors.
- `client/src/components/LabCategoryIcon.tsx` now draws ten consistent 24x24 inline line icons, not the separately documented preferred ten raster illustrations.
- `client/src/styles/bloom-visual-scoped.css` has compact category row rules: mobile ~76px minimum, icon container 40px, title 15/20, metadata 12/17; desktop minimum 78px. Existing state and theme rules also present.
- The repository tree contains the 87 SVG collection, 26 editorial WebPs in `client/public/images/editorial/`, `EditorialMedia.tsx`, and ten SVG lab symbols. Richer ten raster category images referenced in `docs/architecture/PREMIUM_R4_M1_MOBILE_MEDIA_BUILD_CONTRACT.md` are not visible in the checked public lab-category image path. Do not substitute a collage or imply they are imported.
- The current PR body says full RC ready for owner review and describes the 672-test result. The immutable engineering validation document names application commit `d20e384...`, rather than the PR's later documentation HEAD `f077da1...`; confirm exact deployment revision and artifact fingerprint before claiming equivalence.

## Design release considerations
1. **P1 — preferred category illustration fidelity:** Identify whether `Bloom_Lab_Icons_FIXED_All_10(1).zip` has actually been imported, and inspect its ten individual assets at 40px and ≥64px; retain accessible inline SVG fallback where detailed raster is muddy. Preserve compact category rows. Never replace the icons with a gallery PNG.
2. **P1 — fresh final desktop/mobile captures:** Require actual current authenticated browser output for all seven destinations at 390 and 1440 and critical 320/768, Everyday light/dark and Athlete light/dark, including 200% zoom and representative empty, partial, error, saved, review states. Automated screenshots need visual review, not merely their existence.
3. **P1 — Progress bloodwork reinspection:** Confirm on 390px that categories are ~76–92px, not oversized, descriptions don't clip, ≥44px targets, 5 or more scan rows where appropriate, and the bottom navigation doesn't hide content. Confirm a compact and coherent 1440px layout.
4. **P1 — actual raster placements:** Evaluate current Food/Explore/Today/Athlete/Biology WebP crops and focal positions on mobile and desktop; confirm biology disclaimer is visible and correctly associated, one composition per slot, CTA protected, no obvious image halos, light/dark contrast and 404→SVG fallback.
5. **P1 — typography and density:** Review on device for serif hierarchy versus navigational sans, correct line wrapping, large browser text and forced colors. No generic repeated tall cards across secondary routes.
6. **P2 — provenance:** Existing WebP 2x variants can exceed source resolution; preserve honest source/optimization notes and verify commercial rights during release qualification.

## Signoff boundaries
Source implementation of responsive CSS/media: **evidenced**. Reported CI/runtime QA: **engineering-reported**. Independent visual inspection: **NOT TESTED in this review**. Preferred raster bloodwork art: **NOT VERIFIED as imported**. User final owner approval: **PENDING**. No main merge, release, clinical or legal approval conveyed.

## Next action for Developer + Architect
No application-wide development stop. Provide a final current-image evidence bundle or authenticated preview for Designer optical evaluation; resolve verified category-art discrepancy if the preferred independent PNG/WebP archive is available; retain SVG if the raster fails legibility. Record revised screenshots, actual deployed SHA and patch status on PR #1. Owner remains sole final authorization before `main`.