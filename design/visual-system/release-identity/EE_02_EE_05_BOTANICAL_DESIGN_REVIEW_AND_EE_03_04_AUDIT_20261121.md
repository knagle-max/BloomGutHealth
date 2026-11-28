# Bloom scientific Easter eggs — EE-02 / EE-05 design prototype, EE-03 / EE-04 audit

**Date:** 2026-11-21
**Status:** `DESIGN_CANDIDATE / OWNER_REVIEW_PENDING / SHARED_LIBRARY_DELIVERED / NOT_INTEGRATED / NOT_DEPLOYED`.
**Priority:** P3/P4 polish only when eligible through active `AGENTS.md` + `NEXT_ACTIONS.md`; deployment/network pause remains.

## Exact transferable package

Shared Library path (upload confirmed): `/Bloom gut health/Agent Handoffs/Bloom_Easter_Eggs_EE02_EE05_Design_Review_2026-11-21.zip`

ZIP SHA-256: `6b025c11b6d7aa1c66e5ed48cddb6ffe7f46aaedec1e9794145319ebc2b5f022`; ZIP integrity and file-level SHA-256 manifest checked. ~512KB.

Contents: standalone responsive `index.html`, `styles.css`, `app.js`; byte-identical original SVG references `bloom-icon-everyday.svg`, `bloom-icon-monochrome.svg` from the supplied archived `bloom_brand_delivery_v1(1).zip` and `REL-A04-genesis-identity-editable.svg` from already-approved REL-A04 package; `desktop_preview.png`, `mobile_preview.png`, `README.md`, `QA_RESULTS.md`, `ASSET_DISPOSITION.md`, `manifest.json`.

### EE-02 Genesis-to-Hydrogen
- **REUSE EXISTING** approved REL-A04 Genesis typography and botanical brand reference.
- **CODE-GENERATED** a lightweight restrained button-triggered sprout-to-REL-A01-like H element transformation. Current resting state correctly says **Bloom 0.6.0 · Pre-release development build**. Hydrogen only appears as **future / not yet launched** opt-in preview.
- No separate logo/emblem authorization or 1.0 release implication. Existing release-version source `shared/product-release.ts` remains authority for eventual implementation.

### EE-05 Hidden Bloom logo
- **REUSE EXISTING** original Bloom leaf/sprout path geometry copied without modifying original SVG; independent motion prototype uses derived inline geometry.
- **CODE-GENERATED** one restrained ~680ms CSS petal spread and bud lift. Activates by click, touch, press-hold or keyboard via real button. Reduced-motion displays static final pose. No audio, haptics, analytics, achievements or personal data.
- **CAVEAT:** archived brand delivery is a reference, not independent verification of exact current canonical runtime logo or commercial rights. Codex must compare current approved brand asset before reuse; never replace live logo based solely on this ZIP.

### EE-03 DNA discovery
- **DEFERRED**, not generated. Repository text search for standalone `DNAHelix` or `helix` did not confirm a suitable current reviewed source; user handoff requires audit existing Biology/Genetics media and Biology review before creating new scientific DNA illustration/model. No simulated double helix misrepresented as reviewed.

### EE-04 Microbial discovery
- **REUSE EXISTING** `client/src/components/PremiumIcon.tsx` mapping for route `/explore` (`batch-1-original/icon-explore.svg`) as a possible discovery marker, subject to active asset/UX check; no icon family generated.
- **DEFERRED** source-reviewed microorganism educational facts. Existing `docs/architecture/SCIENTIFIC_ICONOGRAPHY_FINAL_IMPLEMENTATION_DECISION_2026-10-30.md` and organism profile assets/facts need per-taxon science/rights review. Never fabricate facts or use a portrait as actual sample microscopy.

## QA evidence and remaining gates

Local Chromium/Playwright tests passed: initial Genesis state, preview/reset, floral trigger, 4-theme switch, 390px mobile root overflow check, reduced-motion animation disabled, browser JS errors zero. Screenshots are local illustrations, not app integration evidence.

Not tested: real touchscreen long press, assistive screen readers, source-matched actual official logo, contrast audit, forced colors/200% zoom/real browser matrix, scientific and rights signoffs, host/runtime integration. Record those as pending. This handoff does not change the active execution queue or promote a design prototype to shipped code.

## Owner review needed

Review EE-02/EE-05 visual direction and motion using package screenshots/prototype. Until owner response do not mark assets approved; while waiting, the exact files remain usable for design inspection and future bounded Codex intake.
