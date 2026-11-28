# Bloom — First-Time Onboarding: UX, Brand & Asset Review

**Date:** 2026-11-21  
**Reviewed:** `docs/agent-handoffs/Bloom_User_Review_Onboarding_Handoff_2026-11-21.md` at commit `6386a85cf16ad4859d59b274a5af5e070024bcd5` (UT-ONB-2026-001).  
**Visual-asset registry:** [`design/visual-system/ASSET_REQUEST_REGISTRY.md`](../../design/visual-system/ASSET_REQUEST_REGISTRY.md), requests **ONB-A01–A12**, all REQUESTED.  
**Disposition:** **APPROVE THE THREE-STEP PRODUCT FLOW FOR ARCHITECT INTEGRATION; COMMISSION THE SIX-GOAL ICON FAMILY AND RESPONSIVE COMPONENT KIT; DO NOT CALL IMPLEMENTED OR VISUALLY ACCEPTED.**  
**Boundary:** Static source and code inspection. Reference screenshots IMG_2735.jpeg / IMG_2736.png / IMG_2737.png were named in the source handoff but not embedded in this repository source; exact pixel fidelity to those images is **not verified**. No live app/browser, user/device, code build or privacy audit has been performed.

## Executive review

The explicit sequence—**account creation → Goals → About you → Health context → normal dashboard**—is a sound, concise onboarding model. It correctly specifies primary goal selection, truly optional sensitive context, canonical editable records, account-scoped completion and meaningful first-use behavior without forced health imports. It should replace the default food-first introduction **without sacrificing the existing fast food-entry action**.

The design requirement is **not** to create three illustration-heavy screens. The quality of this journey will come primarily from six instantly understandable goal graphics, reassuring typography, spacious form composition, reliable selection states, intelligent collapsed context inputs and an unmistakable finish transition.

## Source- and code-derived implementation observations

1. The handoff asks for six goal cards: Gut health, Longevity, General health, Metabolic health, Weight management and Athletic performance. These need one coherent expressive family; existing general app navigation icons are not enough to assume visual parity.
2. The existing `client/src/components/PremiumIcon.tsx` maps existing R4 brand symbols for Biology, Athlete, Profile and navigation. Designer should compare these before producing redundant symbols; no image or component is represented as newly delivered by this review.
3. `client/src/content/editorial-media.ts` already maps approved editorial media, including Today and Profile corner assets. A new full-screen illustration is **optional**, not foundational.
4. At reviewed source, `shared/experience.ts` defines onboarding `not-started | skipped | complete`, not the proposed in-progress/version/completedAt tracking. `EverydayStart.tsx` still offers a food-first setup and routes success to `/log-meal`. This is real functional integration work, beyond an asset assignment.
5. `design/bloom/asset-manifest.json` is explicitly a staging/source archive. Pending requests are recorded separately in `design/visual-system/ASSET_REQUEST_REGISTRY.md`; neither file should be treated as live runtime authorization.
6. Latest coordination and `NEXT_ACTIONS.md` explicitly preserve the one existing architecture queue, [skip render]/[skip ci] for docs while deployment is paused, and protected v0.5/v0.6 functionality. Do not add a competing application, data engine or onboarding state model.

## Review decisions

| ID | Priority | Finding | Decision / required acceptance |
|---|---|---|---|
| ONB-R01 | P0 UX | Mandatory primary goal must be obvious without becoming a long survey. | Six easily scanned choices, one selected primary, semantic radiogroup, Continue unavailable until selected. Mobile 320px may use one column when two columns become cramped. |
| ONB-R02 | P0 data | Incomplete wizard must resume and existing accounts must not be forced back. | Reuse existing account-scoped onboarding state; Architect verifies migration, save-on-step, idempotency, version and no existing-account retroactive redirect. |
| ONB-R03 | P0 consent | Sensitive health answers may be mistaken for implied AI or provider permission. | Consent separate, explicit and revocable; finish action never implies additional grant. All records owner-scoped and editable. |
| ONB-R04 | P0 honesty | Unknown, skipped and confirmed none are different. | Reusable human-readable states and real controls; no healthy/normal default, no numeric placeholder data. |
| ONB-R05 | P1 scientific | Sex-relevant lab ranges are assay-dependent; health conditions may be user-reported. | Clear source/uncertainty and optional wording; no inferred diagnosis from a selected condition or reference-range promise. |
| ONB-R06 | P1 brand | Visual consistency across six very different goals requires coherent custom art. | Deliver ONB-A01–A06 SVG family with exactly matched optical weight, size, four-theme preview and non-stigmatizing health/weight representations. |
| ONB-R07 | P1 interaction | Step 2 screenshot mentioned height/weight but did not actually contain inputs. | Real optional height/weight, activity and unit controls; accessible error, boundary and skip behavior. No fake form made from a picture. |
| ONB-R08 | P1 interaction | Health context plus icons could be mistaken for completed input. | Four collapsed rows, each opens actual entry/edit controls. Explicit save/unknown/none options and keyboard focus. Medication and supplements may share a heading but not a canonical record. |
| ONB-R09 | P1 first-use | Goal-aware dashboard with no saved data can appear empty or falsely personalized. | One evidence-bounded next action, secondary Log food/Import bloodwork/Add context; no fake biological scores, no import obligation, no fourth wizard stage. |
| ONB-R10 | P1 brand/access | Art must not push the form below first viewport on small phones. | Same-sha 320/390/768/1440 in four themes; 200% zoom, 44px controls, no horizontal scroll, focus/VoiceOver and reduced-motion checks. |
| ONB-R11 | P2 asset efficiency | Too much decorative art becomes a cost and performance burden. | Optional post-setup vignette only after reuse audit and actual first-use screenshot identifies a gap. |
| ONB-R12 | P1 delivery | Source textual flow is not proof of screen appearance. | Designer delivers editable compositions and redlines; Codex implements and tests; independently evaluate actual render before visual acceptance. |

## Required assets — direct routing

**Commission P1 visual symbols:** `ONB-A01` gut botanical loop; `ONB-A02` longevity growth rings/sprout; `ONB-A03` general health leaf/sun rosette; `ONB-A04` metabolic energy-cycle arcs; `ONB-A05` weight-management balanced path (non-stigmatizing); `ONB-A06` athletic motion-ribbon. All six must be consistent and aesthetically aligned to the R4/M1 brand; use a single vector construction system, not unrelated icon packs.

**Commission dynamic component specifications:** `ONB-A07` interactive goal card states; `ONB-A08` three-step progress with Back/Continue and current/resumed semantics; `ONB-A09` health-context four pictograms; `ONB-A10` context chips/accordion/form/unknown/consent/error states; `ONB-A12` responsive page compositions and empty-dashboard experience. Most of these should **not** be exported as static chart-like SVGs. Their editable Figma components and redlines are the assets; implementation remains data-driven and accessible.

**Conditional:** `ONB-A11` first-use botanical empty-state vignette only if existing media fails the final composition; not a prerequisite to starting the functional onboarding implementation.

The registry provides precise individual appearance, geometry, usage, states, formats, fallback and acceptance for all 12 requested deliverables.

## Acceptance matrix

- **Step 1:** user picks any of six goals; icon, selection/check and label agree without color-only semantics; back/forward retains selection; selected goal changes dashboard emphasis, not hidden access to biological systems.
- **Step 2:** birth year/DOB input and sex-for-references label with unknown/skip; optional real height/weight/activity controls with unit changes; non-entry remains unknown; keyboard and touch usable.
- **Step 3:** all four rows expand into working controls; medicine/supplement source integrity maintained; allergy vs intolerance distinguishable; safe choices for skipped/unknown/confirmed none; user can skip.
- **First-use dashboard:** saved goal honored, no imported data required; no diagnosis/biological score fabricated; food logging, optional bloodwork import and profile edits remain discoverable.
- **Privacy and lifecycle:** interrupt and resume; existing account bypass; save retry without duplicate health rows; account switch; revocation; later profile edit; rejected consent.
- **Visual:** 320/390/768/1440, all relevant Everyday/Athlete × light/dark, normal and large text, error/empty/resume states. Actual screenshots and real interactions separately marked PASS/FAIL/NOT TESTED.

## Governance and deliverables

**Designer:** Figma/source vectors, six exported SVGs + four Health section SVGs, stateful component masters, four-theme tokens/contrast proof, responsive frames, reuse decision and proof of 24/32px legibility.  
**Architect:** crosswalk to UT-ONB-101–106 and canonical source/profile/consent ownership; schedule within existing v0.6 queue.  
**Codex:** preserve fast Food, implement account state and canonical records, build actual controls, browser/device source/privacy tests and visual screenshot evidence.  
**Biology/Security:** review assay-dependent, self-report and consent semantics.  
**Independent User Testing:** comprehension and friction review of the *running* implementation.

**Final decision:** Good product handoff. **Visual production and implementation may proceed under Architect integration; no asset, functional or visual acceptance is claimed.** The registry tracks only requested work, not completion.
