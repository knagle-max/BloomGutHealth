# Bloom — Bloodwork Expanded Marker Detail: Editorial UX Architecture Decision

**Date:** 2026-11-16  
**Owner:** Chief Architect & Integration Lead  
**Status:** CLEAN CONSOLIDATED OWNER REVISION / APPROVED design direction / Codex-ready bounded v0.6 P1 implementation handoff; **not** implemented, independently reviewed, or deployment verified.  
**Target repository:** `knagle-max/BloomGutHealth`, branch `enhance/bloom-experience`  
**Source review:** `Bloom_Bloodwork_Results_Experience_Redesign_User_Testing_Handoff_2026-11-16.md`, `UT-LAB-UX-5801-R3`, `UT-LAB-5801–5819` (accessible source review), owner-provided LDL mobile image 2026-11-16, existing `V06_CORE_ADVANCED_EXECUTION_CLASSIFICATION_20261114.md`, `CROSS_DOMAIN_PRIORITY_INTELLIGENCE_V06_ARCHITECT_ADDENDUM_20261114.md`. Source inspection: `client/src/components/LabExplorer.tsx`, `LabTrend.tsx`, `LabMarkerEducation.tsx`, `LabCategoryIcon.tsx`, `EditorialMedia.tsx`, and existing visual registry references. Review is **not** live screenshot QA or clinical approval.

## 1. Binding owner intent and scope

**Controlling cross-page standard:** [Bloom Cross-Page Visual Preservation, Reference Fidelity & Additive Asset Policy](BLOOM_CROSS_PAGE_VISUAL_PRESERVATION_AND_ASSET_ADDITION_POLICY_20261116.md), also incorporated into `AGENTS.md`. Preserve all existing chart and art work, use the supplied image as the composition reference for the expanded detail only, and permit *additive* new images where useful. No earlier blanket “defer all artwork” instruction survives this consolidated revision. This is the single controlling version; no superseding amendment appendix or contradictory asset policy.

**Explicit preservation:** No replacement, redesign, deletion, reimport, renaming or regeneration of existing category/marker images, icons, illustrations, graphic assets, media registry entries, chart implementation, axes, point selection or source-report workflows. Existing source data and science logic remain authoritative. Small styling changes to the existing chart are optional, not a chart rebuild.



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

**History:** retain the existing `LabTrend.tsx` graph implementation, all chart/point assets, data values, axes, source selections, point/source drilldown, keyboard/list alternatives, comparability guard, report range behavior, date/unit/assay revisions and tested functionality. Place it in a generous readable editorial setting, with discreet axis/grid, circular point markers, clear dates, unit and a short comparability notice. The screenshot's visually smooth spline is **not universally valid**; enforce the canonical `lab-comparability` and assay/units/time rules. Keep the **existing chart's current straight/connected rendering**; a slight change to curvature, stroke, point appearance or spacing is permitted only if achievable through an existing supported chart setting or a narrowly scoped non-destructive style adjustment, without replacing chart code/assets or inventing new interpolation. This is optional rather than a required spline; never interpolate outside measured values or connect unverified comparisons. For **unverified** comparability, render separate points **with no joining curve or smoothed line**. Same-time distinct specimen/occurrence points must remain separate; never invent spacing/order. Keep chart interaction, accessible point labels and a fully equivalent tabular/list view. A single point is not a trend. A corrected date invalidates and redraws the series.

**Essential education:** two clearly separated editorial rows directly below chart and adjacent context. Small meaningful illustration/photographic vignette at left on suitable screen widths; always-visible heading + one/two concise Biology-reviewed sentences at right. At mobile, size media to a modest square/thumb and preserve reading priority; on narrow/zoom the image can become a small accent or disappear **without hiding text**. Avoid a giant artery image dominating first-party measurements. Scientific imagery is conceptual and carries no personal-data implication.

**Reference context:** one compact context strip near the history/education border, only if meaningful. Example neutral copy: `Your source report and overall context matter when interpreting this result.` Avoid a large competing card or a premature `normal` green flag. This strip is not permission to insert detailed province/provider configuration into the default flow.

**Source details:** after the primer, accessible progressively disclosed `About this measurement`, `Original reports & sources`, `Reference ranges & sources`, `Compare results`, `Learn more`. Existing source edit/review flows remain intact and truthful.

**Motion/accessibility:** reduced-motion honours no chart animation/parallax; forced colors/high-contrast and reduced transparency get solid surfaces; no text on image-only contrast; no layout shift; 44px+ touch targets; keyboard chart focus, accessible labels/list; readable 200% zoom; no horizontal overflow or footer collision; localised dates and units; decorative images `alt=""` with adjacent visible scientific explanation. Screen-reader DOM order exactly follows the R3 order.

## 4. Preserve existing assets; add useful new visuals through the canonical registry

**No existing asset may be replaced, redrawn, renamed, silently reimported, deleted or superseded for this redesign.** Keep parent `LabCategoryArt`, `LabCategoryIcon`, approved science imagery, original byte hashes/paths, visual assets, media fallbacks and chart assets as currently implemented. Inspect both `client/src/content/editorial-media.ts`/`visual-asset-ids.ts` and `shared/scientific-visuals.ts`/`shared/data/scientific-visual-assets.json` to choose the actual canonical owning registry. Do not create a second registry. Reuse a suitable existing reviewed image before requesting a new one, without altering that image.

**New assets are additive and permitted when a location benefits from visual reinforcement.** Large/signature images should have meaningful reserved footprints, intentional placeholders, source and scientific briefs, and additive **requested** registry records; do not claim actual art exists. A placeholder is a reserved presentation region, not a fake broken image or fabricated file path. The user especially wants illustrative thumbnails beside the visible education about what the marker is and why it matters. Codex may create high-quality **small** icons or other supporting visuals directly when appropriate and consistent with Bloom; use existing design tokens/icon primitives first, and register new standalone media where applicable. Small CSS decoration does not need fake asset records.

| Additive proposed ID | Location | Direction | Delivery and fallback |
|---|---|---|---|
| `LAB-DETAIL-ART-01` | Optional LDL expanded-detail atmospheric hero | Premium, conceptual arterial/lipoprotein imagery, warm-earth/forest palette; subordinate to legible value and current original chart | Large art: create reserved ratio slot plus **requested** entry if needed; keep existing visuals untouched. Show refined existing-surface fallback until licensed/reviewed file delivered |
| `LAB-DETAIL-ART-02` | Immediately alongside “What is LDL cholesterol?” | Scientifically plausible conceptual lipoprotein particle thumbnail, not a photomicrograph or patient result | Prefer existing suitable approved art unchanged; otherwise add reserved thumbnail and registry request, with text visible and neutral meaningful fallback |
| `LAB-DETAIL-ART-03` | Immediately alongside “Why does it matter?” | Accurate conceptual arterial wall/plaque illustration, never a claim of personal pathology | Prefer existing reviewed artwork; otherwise add reserved thumbnail and registry request; maintain the explanation without art |
| `LAB-DETAIL-ART-04` | Other marker families as appropriate | Reusable reviewed thumbnails by actual biological topic (liver, kidneys, cells, hormones, nutrients) rather than hundreds of unrelated decorative images | Finite additive family slots where needed; preserve existing categories and imagery |
| `LAB-DETAIL-ICON-CONTEXT` etc. | Optional reference context, about measurement, units, history, comparability, original report/provenance | Small premium, restrained icons with correct semantics and consistent geometry/stroke/material; use `lucide-react` or already licensed symbols first | Codex may create suitable new compact SVG or CSS/icon-library visuals; register independent new media only, never overwrite old originals. Omit needless art |

**Asset registry contract (illustrative additive metadata, not an instruction to invent missing file paths):**

```ts
type MarkerDetailAssetRequest = {
  id: string;                          // new stable ID only
  placement: "marker-hero" | "what-it-is" | "why-it-matters" | "context" | "metadata";
  markerId: string | null;             // null only for reusable/family art
  intent: string;                      // scientifically meaningful art brief
  lifecycle: "requested" | "review" | "approved";
  requestedAspectRatio: number | null;
  sourceAssetId: string | null;        // existing asset reused WITHOUT replacement
  filePath: string | null;             // null until actual file exists
  sha256: string | null;               // null until bytes verified
  conceptual: boolean;
  accessibility: "decorative" | "informative";
  fallback: "existing-art" | "reserved-surface" | "existing-icon" | "text-only";
};
```

Map the proposed schema to the actual existing registry rather than force a parallel implementation. Asset requests are implementation-ready metadata, **not generated images**. Only assign real license/source/rights/sha after acquisition. A large, important asset must have an explicit requested slot and visual fallback; smaller supporting assets may be produced by Codex where appropriate. No external runtime photo URL dependency, invented artwork/licence/checksum, or blocked basic page while imagery is missing.

**Scientific and UX quality:** Images support written explanations; if a thumbnail cannot be scientifically described confidently, omit or reserve it rather than supply incorrect anatomy. Concept art must not masquerade as the user's measured blood, actual microscopic evidence, or a clinical outcome. Follow original responsive/theming/reduced-motion/alt/decorative constraints. The reference image supplies artistic direction only, not permission to copy its embedded artwork.

## 5. Component/data boundaries and proposed code contract

`LabExplorer.tsx` currently renders `LabMarkerEducation` before `LabTrend` inside the expanded marker. Reorder via a **single cohesive detail presenter**, with `LabTrend` **preserving its existing chart implementation, assets, selectors, scales, source links and analytic/source logic**. `LabMarkerEducation` should expose a simple primer independent from expanded deeper sections. Avoid rewriting canonical `PrecisionReport`, source record, assay or source-revision model; the new view model is a derived presentation projection from those existing contracts.

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

The illustrative helper names **are not instructions to introduce duplicate helper services**. Prefer modifying current `LabExplorer`, `LabTrend` and `LabMarkerEducation` directly or adding a small presentational `LabResultOverview` when useful. `LabTrend` already owns real plot/comparison/source selection and should retain it. `LabSourceHistory` and existing source manager remain authoritative for source records/corrections. Code that determines labels/units/dates must reuse canonical formatters and owner permissions. New asset requests and successfully created small original assets are additive entries within the existing owning registry after checking compatibility; preserve all old paths, identifiers and hash values.

## 6. UX copy (proposed; Biology review required)

- Marker title: `LDL cholesterol`; small count: `5 results` (actual dynamic count).
- Measurement label: `Latest recorded result`; unit separate but next to the number, not duplicated.
- Chart: `Your LDL history`; note: `Values shown from your recorded observations.` **Only** when comparable, optionally add a plain-language difference. If not: `We can see the recorded values, but have not confirmed they can be directly compared.`
- Education 1: `What is LDL cholesterol?` — `LDL particles carry cholesterol through your blood. LDL-C measures the amount of cholesterol carried by those particles.`
- Education 2: `Why does it matter?` — `Cholesterol carried in LDL particles contributes to plaque buildup in artery walls. What a result means for you also depends on your overall cardiovascular risk.`
- Source links: `Original reports & sources`, `Check report details`, `Compare two results`.

These are **drafts** until Biology approval; source and personal risk wording cannot exceed reviewed clinical authority. For unsupported/unidentified markers, show the source-native label and data, and abstain from borrowed marker education rather than filling text with generic invented science.

## Mandatory chart visibility correction — one-sided reference bounds (Owner directive, 2026-11-16)

**Acceptance P1 for the currently displayed GGT result, and for any marker with a valid single reported reference boundary:** A source-valid lower-only or upper-only reference boundary must render as a **visibly discernible horizontal reference line** on the existing `LabTrend` plot when reference display is enabled, accompanied by an unambiguous label (e.g., “Upper reference limit: 65 U/L” for a source-confirmed upper limit of 65 U/L). A numeric label with no visible line fails acceptance. Do not invent or presume an unreported opposite bound, represent a one-sided limit as a two-sided normal interval, or shade a fabricated full interval.

**Diagnose rather than replace:** `LabTrend.tsx` already branches on `commonInterval.low` and `commonInterval.high` to render boundary `<line>` SVG elements, while the existing `<rect>` band is intentionally limited to two-sided intervals. Codex must inspect actual rendered CSS, SVG coordinate placement, clipping, stroke/contrast and current reference source eligibility before changing anything. A line in the DOM or a boundary label alone is insufficient: browser screenshot/pixel and interaction checks must confirm a continuous, clearly visible rule on mobile and desktop, including dark/light and high-contrast/forced-colors modes.

- The visual line should align with the actual bound's vertical numeric position on the existing plot; use an appropriate contrasting stroke/weight/pattern from existing Bloom tokens. Do not confuse it with the recorded sample series or a clinical decision/risk threshold, which must be distinguished by labels/styles.
- The plot extent must include a valid reference limit where the relevant current source/assay and plot unit qualify. Do not force a line for an invalid, incompatible, unreviewed or unavailable bound. If no valid bound exists, say so rather than using the screenshot's 65 U/L as data.
- A two-sided interval may retain its **existing** shading and both boundary lines. One-sided intervals require one visible bound line and no invented other boundary.
- Preserve all current chart code/data, measured points, axis semantics, source provenance, unit/assay safeguards, chart assets, original records, point/source selection, edit/retraction and access behavior. Apply the narrowest display/style correction; do not introduce a replacement chart or art.
- Test: source-confirmed upper-only GGT (including a bound falling within plot extent), lower-only marker, genuine two-sided interval, missing/invalid bound, boundary close to a plotted value or canvas edge, corrected/deleted source, account switch, 320/390/768/1440 CSS px, light/dark and forced-colors. In each valid one-sided case assert **both** source-matched text and visible full chart reference rule; in missing cases assert no misleading line.

This requirement is an explicit **working-chart refinement**, not authorization to replace or redraw chart assets, force published provincial ranges, apply invented clinical cutoffs or change the standing cross-page preservation rule.

## Full-history reference-band extent — owner refinement (2026-11-16)

**User goal:** The shown provisional interval (e.g., 135–170 g/L) appears as an extremely narrow vertical strip centered on the selected result. The desired display for an **interval applicable to the entire displayed historical series** is a horizontal band spanning the full plot width, with visible lower and upper bound lines at the correct y-values, consistent with the existing chart style.

**Binding safety/application condition:** Full-width is permitted **only if the exact reference interval is appropriate across the plotted history**. The screenshot explicitly says “Provisional published comparison interval · selected result only”; that status must not silently become “applies to all results.” A source-specific or time/assay/age/sex/context-dependent interval is not automatically historical. Do not silently apply a recent or provisional range to tests with different labs, assays, applicable demographic categories, source reporting methods, units, or incompatible reference regimes. The existing source/revision policy remains authoritative.

**Codex implementation:**
1. Preserve existing `LabTrend.tsx`, chart assets, and source/interaction paths. Inspect existing `localBand`, `bandLeft`, `bandRight`, `commonInterval`, `sharedInterval` and `sourceReferenceIntervalForPlot` before changing plot presentation; the current narrow strip reflects the selected-result-local band branch, not an absent fill implementation.
2. Add a small, independently testable **reference applicability** decision to the existing source/range projection. It must establish whether *each displayed historical observation* qualifies for the same exact reference interval, with provenance/units/method/assay/demographic/collection-date applicability and any published/provisional status retained. Do not use “same marker ID” or visual chart connectivity alone as proof. If provenance permits a single historical interval, extend existing SVG band `x=0`, `width=100` with existing bound lines across the full plot; preserve current shading color/opacity and use existing asset-free display logic.
3. If range applicability changes over time or by laboratory, show source-qualified segmented/per-period ranges only where supported, with clear labels; do not invent coverage between unsupported dates. If only the selected result qualifies, retain a localized band or show its reference limits separately, **explicitly** explaining “applies to selected result only”; never imply full-history applicability.
4. Preserve whether the source is *original laboratory range*, *reviewed published comparison*, or *provisional published comparison*. Published intervals are not the original reference supplied by a lab or personalized risk/target ranges. Do not assert an unreviewed published band applies to all past tests because user's profile today happens to match.
5. Existing upper-only or lower-only ranges remain visible as horizontal bound lines (subject to actual scope of applicability); do not create a two-sided band without both confirmed bounds.
6. Acceptance tests: one same-method/same-applicable-band historical series -> existing shaded band and both edges occupy **entire chart x-span**, not selected-point width; source-incompatible labs -> no global band; age/sex/date-conditional provisional comparison -> no historical extension unless individually established; selected-result-only -> localization + honest label; lower/upper one-sided -> visible correct line, no invented opposite edge; selection changes, original report edits, revocations and account switch correctly invalidate view. Validate actual screenshots at mobile and desktop, both themes, forced-colors, not simply DOM width attributes.
7. If the underlying source data cannot establish the range across the historical results, show an optional, unmistakably labeled *illustrative comparison guide* only if separately reviewed/authorized for this audience and clearly differentiated from source-applicable reference ranges; otherwise abstain. No misleading full-width clinical reference fill.

**Owner-facing desired output:** Users should see a meaningful, readable full-history reference zone **whenever scientifically supportable**, and not a thin local stripe when the same bound legitimately applies across their complete history. No chart replacement or alteration of current image assets.

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
11. Requested hero/educational image absent, 404, slow/offline, forced-colors and reduced transparency: visible reserved or existing visual fallback with all text and source tasks intact, no contrast failure or layout shift; independently test newly produced small icons.
12. Keyboard, VoiceOver, touch, zoom, mobile Safari and accessible chart list alternative preserve task parity; screen-reader order result/history/primer.
13. Real original report/source/correction reachable in 1–2 intentional interactions; `Compare two` remains available but not visually dominant.
14. Clinically reviewed critical message (if already supported) not hidden by collapse or overlay; no newly fabricated threshold.
15. Novice teach-back: can explain measurement and relevance without tapping any educational disclosure, can identify latest value and tell if timeline comparison is confirmed.\n16. Existing-asset preservation: exact paths/hashes of existing imagery and original registry IDs remain unchanged, plus visual/fallback behavior tested; additive new entries never shadow originals.\n17. Existing chart preservation: before/after actual point selection, axis/reference/assay semantics, source drilldown, keyboard and value comparison regressions pass; optional curvature is small, settings-based and medically honest.\n18. Added image slots: visually appropriate requested registry entries and working placeholders next to novice educational sections where necessary; new small Codex icons high-quality and contextually valid; no fictional image file or checksum.

**Evidence reporting:** exact branch SHA, automated test receipts, current screenshot(s) at same SHA for 320/390/768/1440 in light/dark and Everyday/Athlete as appropriate; accessibility checks, source/account/API/correction tests, Render preview deployed SHA, independent human/clinical review explicitly PASS / FAIL / NOT TESTED. Tests must verify **actual rendered output**, not CSS selectors alone. Avoid creating fabricated verification or clinical acceptance.

## 8. Codex delivery/queue instructions

- This is **v0.6 P1 visual/structural UX**, to be integrated with ongoing C2 Bloodwork/Response and source fidelity work. The existing `NEXT_ACTIONS.md` and `V06_DEPENDENCY_BACKLOG.md` continue to govern ordering; no interruption of active P0 C2 engineering and no new approval cycle.
- Codex should implement the *presentation layer first* and preserve existing data and scientific functions. Reuse canonical media registry and current design tokens. Missing **new** large images receive additional requested registry entries and good reserved fallbacks; useful new small icons can be created/registered by Codex. Existing images/graphics and chart assets are immutable for this design pass.
- Do not merge `main`, change production databases, add paid services, activate clinical claims or expose new data without corresponding authorization.
- Owner must receive exact implementation SHA, active review URL, working states, test evidence and truthful remaining exceptions; this document itself is not runtime acceptance.

## 9. Code-preservation/publication policy

**Cross-page applicability:** This handoff inherits the [standing preservation, reference fidelity and additive asset policy](BLOOM_CROSS_PAGE_VISUAL_PRESERVATION_AND_ASSET_ADDITION_POLICY_20261116.md). Codex must respect current work and current priorities, use owner visual examples for the scoped screen, request/placeholder large missing visuals, create high-quality small contextual art where useful, and never modify already-complete graphic assets without explicit owner scope or necessary corrective justification.



This handoff preserves actionable UX source logic and includes a proposed versioned view contract and pseudocode. If specialists supply code in later handoffs, retain it verbatim as a source appendix or cite its exact file/revision and provide explicit amendments; do not silently omit code. Publish architect-approved Codex handoffs in the authorized GitHub branch under `docs/architecture/`, verify remote bytes, and link the commit. Local artifacts are supplementary.