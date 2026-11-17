# Bloom — Bloodwork Expanded Marker Detail: Editorial UX Architecture Decision

**Date:** 2026-11-16  
**Owner:** Chief Architect & Integration Lead  
**Status:** APPROVED design direction / Codex-ready bounded v0.6 P1 implementation handoff; **not** implemented, independently reviewed, or deployment verified.  
**Target repository:** `knagle-max/BloomGutHealth`, branch `enhance/bloom-experience`  
**Source review:** `Bloom_Bloodwork_Results_Experience_Redesign_User_Testing_Handoff_2026-11-16.md`, `UT-LAB-UX-5801-R3`, `UT-LAB-5801–5819` (accessible source review), owner-provided LDL mobile image 2026-11-16, existing `V06_CORE_ADVANCED_EXECUTION_CLASSIFICATION_20261114.md`, `CROSS_DOMAIN_PRIORITY_INTELLIGENCE_V06_ARCHITECT_ADDENDUM_20261114.md`. Source inspection: `client/src/components/LabExplorer.tsx`, `LabTrend.tsx`, `LabMarkerEducation.tsx`, `LabCategoryIcon.tsx`, `EditorialMedia.tsx`, and existing visual registry references. Review is **not** live screenshot QA or clinical approval.

## 1. Binding owner intent and scope

Keep the **parent Bloodwork category selector** (e.g., Heart & cholesterol) with its **existing image, composition, layout, navigation and grouping**. Do not replace category-card art with the reference screenshot. When the user expands/selects a **specific marker** (e.g., LDL cholesterol), give that detail surface the supplied premium editorial treatment. This is an **inside-the-existing-explorer** marker-detail redesign, not a standalone clinical dashboard, not a new route by default, and not a replacement of original sources, corrections, report/history, reference-range management or existing state/permissions. Keep the selected marker in context: back/close returns to the same expanded parent group; search, marker selection, scroll and focus restore as appropriate.

The reference screenshot is a **visual and structural target, not factual test data or an asset licence**. The rendered values `3.58 mmol/L`, `9 Aug 2026`, five records and chart coordinates are examples from the image/UT handoff; never hardcode these or assume five matched historical data points. Nor is the screenshot a validated clinical example or a permission to copy its artwork unlicensed. Use actual authorized report data.

**Default DOM + visual order for both mobile and desktop:** (1) marker identity and parent breadcrumb, (2) prominent latest recorded result + actual collection date/source availability, (3) history chart/record list, (4) always-visible two-part education: “What is [marker]?” and “Why does it matter?”, (5) restrained “What can these results tell us?” source-aware observation and one useful action, (6) optional deeper science, records, source corrections, comparison and reference administration. No collapse or extra click for the essential two education sections. A compact contextual reference statement can appear near result/history only if it **does not interrupt** the first three steps or introduce unverified range selection.

## 2. Architecture reconciliation with User Testing R3

- Accept `UT-LAB-5801–5819` as **one bounded presentation contract** with clinical/source/accessibility acceptance; do not create a duplicate backlog epic or user approval gate.
- R3 overrides earlier R1/R2 ordering. A conflicting illustrative journey that puts education before the result is **superseded** by the clear R3 primary directive: **result → history → visible primer**.
- Keep one latest-value display; eliminate duplicate “latest eligible plotted result,” unlabeled `Not supplied`, repetitive warnings, inline provider wizard and redundant chart/source selectors.
- Keep all meaningful capabilities reachable via `Learn more`, `Original reports & reference sources`, `Compare two results`, and existing report manager, with source audit or correction discoverable in at most two deliberate actions where authorized.
- A validated critical safety message, if one already exists in the current system, stays conspicuous; this change does **not** authorize new critical thresholds or autonomous diagnoses.
- Preserve clinical caution: reference interval ≠ personal target; provincial comparison ≠ original lab range; LDL-C ≠ LDL particle count; recorded change ≠ causal response.

## 3. Premium visual implementation specification

**Design character:** Bloom's warm, botanical, luxurious editorial science, not generic SaaS cards, flashy medical risk badges or a continuous full-screen illustration. The supplied dark forest and ivory style is a useful high-quality reference; implement **both** approved light and dark themes with existing tokens and contrasts. Use scoped styles under a marker-detail root. Reuse existing Bloom typography, brand colour variables, tactile material and motion conventions; do not globally replace the app theme or ship a screenshot as the interface.

**Category parent:** unchanged existing `LabCategoryArt` / `LabCategoryIcon` and category `summary` layout. Existing illustrated parent imagery is canonical. No expanded-detail artwork should accidentally replace parent imagery or alter parent click targets.

**Detail opening:** optional subtle breadcrumb `Heart & cholesterol / LDL cholesterol` consistent with parent context. Subdued small category caption and expressive serif marker title; large but well-balanced whitespace. Back returns to parent, avoids losing search/selection.

**Latest result:** a single focal soft-glass/ink/forest surface with prominent numeric value and smaller aligned unit; concise locale-formatted actual collection date and truthful source provenance. Avoid dark text over busy photography. Use overlay or flat opaque fallback where contrast is uncertain; no misleading green/red status hue without approved basis. No hardcoded clinical grade, range band, or source availability label when source isn't accessible.

**History:** generous, readable responsive chart, with discreet axis/grid, circular point markers, clear dates, unit and a short comparability notice. The screenshot's visually smooth spline is **not universally valid**; enforce the canonical `lab-comparability` and assay/units/time rules. For confirmed commensurate points, prefer straight segments or a shape-preserving monotonic interpolation that cannot overshoot observed values and is labelled a visual guide only. For **unverified** comparability, render separate points **with no joining curve or smoothed line**. Same-time distinct specimen/occurrence points must remain separate; never invent spacing/order. Keep chart interaction, accessible point labels and a fully equivalent tabular/list view. A single point is not a trend. A corrected date invalidates and redraws the series.

**Essential education:** two clearly separated editorial rows directly below chart and adjacent context. Small meaningful illustration/photographic vignette at left on suitable screen widths; always-visible heading + one/two concise Biology-reviewed sentences at right. At mobile, size media to a modest square/thumb and preserve reading priority; on narrow/zoom the image can become a small accent or disappear **without hiding text**. Avoid a giant artery image dominating first-party measurements. Scientific imagery is conceptual and carries no personal-data implication.

**Reference context:** one compact context strip near the history/education border, only if meaningful. Example neutral copy: `Your source report and overall context matter when interpreting this result.` Avoid a large competing card or a premature `normal` green flag. This strip is not permission to insert detailed province/provider configuration into the default flow.

**Source details:** after the primer, accessible progressively disclosed `About this measurement`, `Original reports & sources`, `Reference ranges & sources`, `Compare results`, `Learn more`. Existing source edit/review flows remain intact and truthful.

**Motion/accessibility:** reduced-motion honours no chart animation/parallax; forced colors/high-contrast and reduced transparency get solid surfaces; no text on image-only contrast; no layout shift; 44px+ touch targets; keyboard chart focus, accessible labels/list; readable 200% zoom; no horizontal overflow or footer collision; localised dates and units; decorative images `alt=""` with adjacent visible scientific explanation. Screen-reader DOM order exactly follows the R3 order.

## 4. Artwork and asset registry: proposed assets only (not produced)

Integrate **only** via the existing canonical visual/asset registry and `EditorialMedia` (or `shared/scientific-visuals.ts` when the existing registry owns this kind of scientific illustration). Inspect HEAD to select the true canonical registry; **do not create a competing registry or silently point to missing files**. All new media gets registry identifier, placement, concept, proposed filename/format, aspect ratio, light/dark strategy, real source/licence/rights review, SHA-256 when imported, dimensions, fallback, conceptual label, and accessibility semantics. No invented checksum or source status.

| Proposed asset ID | Target / placement | Suggested visual | State and fallback |
|---|---|---|---|
| `LAB-DETAIL-ART-01` | Optional expanded-marker hero background only | Macro editorial arterial lumen / LDL plaque **conceptual**, earthy reds/gold and forest tones; not an individual's arteries | **Requested, not supplied**. Default to readable botanical gradient/no media until independently created, reviewed and licensed; content must stand alone. |
| `LAB-DETAIL-ART-02` | LDL “What is it?” thumbnail | Faithful, clearly conceptual LDL lipoprotein particle depiction (do not imply microscopic photograph) | **Requested, not supplied**. Existing suitable reviewed science visual if available; else decorative neutral motif with text, no broken image. |
| `LAB-DETAIL-ART-03` | LDL “Why does it matter?” thumbnail | Conceptual cross-section of atherosclerotic plaque, anatomically restrained and not frightening | **Requested, not supplied**. Reuse suitable reviewed illustration or omit art; never invent personalized pathology. |
| `LAB-DETAIL-ART-04` | Generalized biomarker class placeholders | Curated organ/molecule/cell-themed editorial scientific vignette by reviewed marker class (lipids, liver, kidney, CBC, nutrients, etc.) | **Optional later**. No one-off art gate for each of 30+ lab analytes; use a finite reviewed category-family set with consistent safe fallback. |

**Do not use screenshots as user-facing art assets.** If the source screenshot was user-generated, it still only establishes visual direction, not third-party art rights for inclusion in Bloom. Parent category image stays unchanged. First functional visual pass must not block on missing assets. If design produces missing art, Codex imports exact approved bytes with verified manifest and no external runtime image dependency.

## 5. Component/data boundaries and proposed code contract

`LabExplorer.tsx` currently renders `LabMarkerEducation` before `LabTrend` inside the expanded marker. Reorder via a **single cohesive detail presenter**, with `LabTrend` preserving existing analytic/source logic. `LabMarkerEducation` should expose a simple primer independent from expanded deeper sections. Avoid rewriting canonical `PrecisionReport`, source record, assay or source-revision model; the new view model is a derived presentation projection from those existing contracts.

**Illustrative TypeScript design contract (Codex must reconcile with HEAD types):**

```ts
type LabMarkerDetailView = {
  markerId: string;
  categoryId: string;
  title: string;
  recordedResultCount: number;
  latest: null | {
    sourceObservationId: string;
    valueText: string;       // canonical formatter, no guessed precision
    unitText: string | null;
    collectionDateText: string | null;
    dateProvenance: "collection" | "reported" | "unknown";
    sourceStatus: "available" | "unavailable" | "unverified";
    referenceIntervalText: string | null; // original verified source only
  };
  history: {
    points: Array<{ id: string; dateText: string; valueText: string; sourceId: string }>;
    comparability: "comparable" | "not-comparable" | "unverified";
    reasonCodes: string[];
    connectPoints: boolean; // TRUE only if canonical comparison authorizes it
  };
  education: {
    whatItMeasures: string | null; // specialist-reviewed and marker specific
    whyItMatters: string | null;
    reviewedEvidenceIds: string[];
  };
  contextualObservation: string | null; // descriptive only; source anchored
  nextAction: null | { label: string; href: string; reason: string };
  sourceRevisionFingerprint: string; // server-verified, not supplied by client
};
```

**Integration pseudocode (illustrative, not claimed existing API):**

```ts
function buildMarkerDetail(report: PrecisionReport, markerId: string): LabMarkerDetailView {
  const entry = findOwnedMarkerEntryFromExistingExplorer(report, markerId);
  const history = getSourcePreservingLabHistory(entry);
  const comparability = evaluateWithExistingLabComparability(history);
  const primer = getReviewedEducationOrUnknown(markerId);
  return {
    ...sourceBoundIdentityAndLatest(entry, history),
    history: {
      points: preserveEveryOriginalOccurrence(history),
      comparability: comparability.status,
      reasonCodes: comparability.reasonCodes,
      connectPoints: comparability.status === "comparable" && hasOrderedDistinctTimes(history),
    },
    education: primer,
    contextualObservation: reviewedDescriptiveObservationOnly(history, comparability),
    nextAction: selectExistingSafeSourceAction(entry),
    sourceRevisionFingerprint: getCurrentAuthenticatedRevisionFingerprint(report),
  };
}
```

The illustrative helper names **are not instructions to introduce duplicate helper services**. Prefer modifying current `LabExplorer`, `LabTrend` and `LabMarkerEducation` directly or adding a small presentational `LabResultOverview` when useful. `LabTrend` already owns real plot/comparison/source selection and should retain it. `LabSourceHistory` and existing source manager remain authoritative for source records/corrections. Code that determines labels/units/dates must reuse canonical formatters and owner permissions. New asset slot identifiers should be registered within the existing asset schemas only after verifying compatibility, with truthful `requested`/`fallback` state.

## 6. UX copy (proposed; Biology review required)

- Marker title: `LDL cholesterol`; small count: `5 results` (actual dynamic count).
- Measurement label: `Latest recorded result`; unit separate but next to the number, not duplicated.
- Chart: `Your LDL history`; note: `Values shown from your recorded observations.` **Only** when comparable, optionally add a plain-language difference. If not: `We can see the recorded values, but have not confirmed they can be directly compared.`
- Education 1: `What is LDL cholesterol?` — `LDL particles carry cholesterol through your blood. LDL-C measures the amount of cholesterol carried by those particles.`
- Education 2: `Why does it matter?` — `Cholesterol carried in LDL particles contributes to plaque buildup in artery walls. What a result means for you also depends on your overall cardiovascular risk.`
- Source links: `Original reports & sources`, `Check report details`, `Compare two results`.

These are **drafts** until Biology approval; source and personal risk wording cannot exceed reviewed clinical authority. For unsupported/unidentified markers, show the source-native label and data, and abstain from borrowed marker education rather than filling text with generic invented science.

## 7. Responsive/state and safety acceptance

**Required journeys (map to UT-LAB-5801–5819 without expanding scope):**

1. Default marker: category parent unchanged; marker expanded beneath it; value/date → chart/list → two visible educational rows, at 320/390/768/1440 and both themes, with document order preserved.
2. With five authentic source rows: dynamic count, values/dates/precision and tap-through agree exactly with existing `PrecisionReport` and source correction APIs. No screenshot numbers hardcoded.
3. Comparability unverified: unconnected points, one explanatory notice; no smoothed line/directional or clinical improvement claim.
4. Comparability verified: accurate chronological plot; compare actual numeric change where permitted; no interpolation outside measured bounds, no causal or risk badge.
5. Single point/none: no false trend or zero; truthful empty-state invitation where relevant.
6. Duplicate same-time labs: separate points/record occurrences, no invented slope or source merge.
7. Report-supplied bounds/unknown range: original bounds only when valid; no silent provincial published fallback.
8. Selected published provisional reference: only sourced, applicability-labelled inside optional administration; original source preserved; preview ≠ saved.
9. Unit/assay ambiguity and source-only analytes: original value retained; no falsely confirmed trend or educational model.
10. Source correction/deletion/consent withdrawal/account switch: no stale value, cached art-dependent content, or cross-account view; focus safely resets.
11. Image absent, 404, slow/offline, forced-colors and reduced transparency: text-first functional fallback, no contrast failure or layout shift.
12. Keyboard, VoiceOver, touch, zoom, mobile Safari and accessible chart list alternative preserve task parity; screen-reader order result/history/primer.
13. Real original report/source/correction reachable in 1–2 intentional interactions; `Compare two` remains available but not visually dominant.
14. Clinically reviewed critical message (if already supported) not hidden by collapse or overlay; no newly fabricated threshold.
15. Novice teach-back: can explain measurement and relevance without tapping any educational disclosure, can identify latest value and tell if timeline comparison is confirmed.

**Evidence reporting:** exact branch SHA, automated test receipts, current screenshot(s) at same SHA for 320/390/768/1440 in light/dark and Everyday/Athlete as appropriate; accessibility checks, source/account/API/correction tests, Render preview deployed SHA, independent human/clinical review explicitly PASS / FAIL / NOT TESTED. Tests must verify **actual rendered output**, not CSS selectors alone. Avoid creating fabricated verification or clinical acceptance.

## 8. Codex delivery/queue instructions

- This is **v0.6 P1 visual/structural UX**, to be integrated with ongoing C2 Bloodwork/Response and source fidelity work. The existing `NEXT_ACTIONS.md` and `V06_DEPENDENCY_BACKLOG.md` continue to govern ordering; no interruption of active P0 C2 engineering and no new approval cycle.
- Codex should implement the *presentation layer first* and preserve existing data and scientific functions. Reuse canonical media registry and current design tokens. Missing images become registered requested assets/fallbacks, not blockers or unsupported runtime URLs.
- Do not merge `main`, change production databases, add paid services, activate clinical claims or expose new data without corresponding authorization.
- Owner must receive exact implementation SHA, active review URL, working states, test evidence and truthful remaining exceptions; this document itself is not runtime acceptance.

## 9. Code-preservation/publication policy

This handoff preserves actionable UX source logic and includes a proposed versioned view contract and pseudocode. If specialists supply code in later handoffs, retain it verbatim as a source appendix or cite its exact file/revision and provide explicit amendments; do not silently omit code. Publish architect-approved Codex handoffs in the authorized GitHub branch under `docs/architecture/`, verify remote bytes, and link the commit. Local artifacts are supplementary.