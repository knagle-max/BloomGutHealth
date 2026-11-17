# Bloom — Bloodwork Editorial Visual Fidelity Implementation Correction

**Owner directive:** 2026-11-16  
**Priority:** P1 — existing Bloodwork editorial design workstream  
**Architect disposition:** APPROVED, binding acceptance correction, no new feature platform or independent backlog  
**Implementation owner:** Codex; execute under `AGENTS.md` and current `NEXT_ACTIONS.md` ordering  
**Reference:** the owner-approved mobile LDL reference supplied in conversation 2026-11-16; original Bloodwork user-testing handoff `UT-LAB-UX-5801-R3` and `UT-LAB-5801–5819`; [original expanded-marker architecture](BLOOM_BLOODWORK_MARKER_DETAIL_EDITORIAL_ARCHITECT_DECISION_20261116.md). Current rendered Ferritin is owner-reported visually below reference, but this architect document does not claim an independent screenshot/pixel audit of that Ferritin state.

## 1. Binding decision and explicit override scope

**Treat the approved LDL reference as a real visual acceptance target, not a merely inspirational example or permission to leave a generic clinical dashboard behind a forest-green background.** A technically correct collection of sections is not sufficient if the rendered result lacks reference-level quality.

This later, explicit owner instruction **authorizes substantial presentation-layer changes to the *expanded mobile and desktop Bloodwork marker-detail surfaces*, including Ferritin and LDL**. It is the scoped exception to the earlier owner-preserved mobile Biology/Bloodwork/Microbiome baseline in [adaptive layout architecture](BLOOM_ADAPTIVE_MOBILE_DESKTOP_EXPERIENCE_ARCHITECT_DECISION_20261116.md), whose default protection remains active for all *other* mobile pages and for the **existing parent Bloodwork category selector/navigation/image/layout**. This does not permit redrawing charts, swapping imagery or changing original scientific data.

Preserve canonical visual assets and meaningful component/chart functionality. **Preservation of components does not imply preservation of their current order, size, placement, wrapper layout, section boundaries or default disclosure.** New editorial presentation may significantly differ from the current mobile Ferritin rendering and should. Follow the approved reference's mobile result-first composition; use a deliberate wider editorial arrangement for desktop, not a blown-up phone stack.

## 2. Visual target — specific required improvements

1. **Result prominence:** Distinctive editorial title/hierarchy, dominant real latest measured value and adjacent unit, genuine source date/context. Avoid repeated latest-result cards, long technical preambles and secondary controls competing with the primary result. Respect source precision, missing measurement context, unverified assay and inaccessible source status.
2. **Cohesive result + history:** Make the result and existing chart feel like a single thoughtfully composed story rather than disconnected dense cards. Use the existing chart full-width in its region and enough height for legible values, points, dates and source-linked interactions. Remove *unnecessary* blank space; avoid compressing an already readable chart or hiding data simply to fit a screenshot.
3. **Material/typography fidelity:** Bloom's approved premium botanical/editorial palette, restrained glass/ink/ivory tactile materials, meaningful serif/sans hierarchy, balanced negative space, precise border and shadow use, and expressive visual rhythm. Text contrast/readability first, including light/dark and accessibility preferences. A uniform green fill or repeated generic panels does not satisfy this.
4. **Scientific image placement:** Reuse existing approved image bytes and registry entries in meaningful positions, especially beside concise always-visible “What is [marker]?” and “Why does it matter?”. Do not substitute generic icons for appropriate approved science art. Where no image exists, use existing canonical asset registry with additive **requested/reserved** art slots and fallback; Codex may create suitable smaller, high-quality contextual icons as allowed by [cross-page asset policy](BLOOM_CROSS_PAGE_VISUAL_PRESERVATION_AND_ASSET_ADDITION_POLICY_20261116.md). Never claim an asset file exists when it does not.
5. **Progressive source disclosure:** Move administrative source verification, provider/province selection, detailed methodology, compatibility explanation, corrections, raw historical records and advanced comparisons into clearly named, accessible secondary controls. Keep them reachable in a predictable number of actions and fully functional. Never bury clinically consequential qualification, unsupported comparability or confirmed critical warning needed for safe interpretation.
6. **Visible concise education:** Retain R3 order and the user-approved visible primer. Mobile: marker → latest result → history/chart → brief “What is it?” + “Why does it matter?” → simple source-grounded interpretation/next step, with related nuance where needed. Desktop: use balanced columns/rail and context so education can visually accompany the chart without changing the correct reading hierarchy or withholding information on mobile.
7. **Chart preservation:** Keep `LabTrend.tsx` chart math, provenance, point actions, accessible alternatives, lab source/assay identity, unit precision, plot extent, current comparability/solid-dashed-disconnected behavior, one-sided limit visibility and historically applicable full-span reference bands. Reframe/reposition/reuse its rendering, not replace its plotting engine or original art. Existing permitted small chart styling settings only if justified by render quality and scientific correctness.
8. **Touch and desktop:** Mobile at 320/390 must feel purpose-designed, with no excess vertical whitespace, broken source controls, horizontal scrolling or oversized administrative sections. At 1024/1440 use truly desktop-native multi-column editorial composition, larger chart and supporting interpretation. Tablet at 768 is an intentional middle state, not stretched phone.
9. **Content authenticity:** Use real owned or specifically labeled synthetic Ferritin and LDL records, dynamic source units, actual number of results, valid reference provenance and correct selected record. Reference screenshot values and art are design examples, not hardcoded user data or license grants.

## 3. Current component mapping — keep capability, decouple presentation

Current repository (inspect latest HEAD before editing) includes:
- `client/src/components/LabExplorer.tsx`: parent category navigation, expanded marker selection, entry/detail composition;
- `client/src/components/LabTrend.tsx`: chart, reference-range administration, comparisons, selected source, plotting and accessibility;
- `client/src/components/LabMarkerEducation.tsx`: reviewed marker education and primer/deeper presentation mode;
- `client/src/components/EditorialMedia.tsx`: registered media and fallback;
- canonical source/history/assay/reference/consent contracts under `shared/`.

**Do not rewrite scientific calculations or replicate source-state authority.** Favor a focused presentation orchestrator extracting the existing chart and source controls as reusable subviews / placements, maintaining their shared context and event bindings; don't duplicate source management or reimplement axis/comparability rules. It is acceptable to modify JSX composition, section order, scoped CSS, typography and responsive layout substantially. Where `LabTrend` couples drawing and reference administration, decouple *presentation* using a prop/slot/presenter as needed while preserving one owner of state, selections, mutations and scientific eligibility. Do not maintain a second chart implementation.

### Illustrative composition contract (not a claim of production code)
```tsx
type MarkerEditorialComposition = {
  summary: "latest-recorded-result";
  history: "existing-lab-trend";
  education: "always-visible-reviewed-primer";
  interpretation: "eligible-source-grounded-insight" | "honest-abstention";
  administration: "progressive-accessible-disclosure";
  image: "reuse-existing-approved-art" | "registered-requested-fallback";
};

// Presentation composition only; source/state/permissions remain in current services:
function ExpandedMarkerEditorialView(props: ExistingMarkerDetailProps) {
  return (
    <section className="bloom-marker-editorial">
      <MarkerIdentityAndResult {...props} />
      <div className="bloom-marker-main-layout">
        <ExistingLabTrendVisualization {...props} />
        <ExistingReviewedPrimer {...props} />
      </div>
      <ExistingEligibleObservation {...props} />
      <ExistingSourceAndComparisonControls {...props} progressive />
    </section>
  );
}
```
**These are conceptual component labels only**. Codex must use existing actual types and component APIs after inspecting HEAD. Rendering the chart and source administration through different *presentation subcomponents* does not authorize duplicate domain calculations, versioned data stores or parallel selections. No gratuitous framework change.

## 4. Explicit visual acceptance gate — separate from correctness tests

Codex must **capture actual rendered browser screenshots** with realistic Ferritin and LDL fixtures (at least one with multiple comparable historical records and one with a one-sided/uncertain reference case), in **320, 390, 768, 1024 and 1440 CSS pixels**; use both light/dark and relevant zoom, keyboard/forced-colors/reduced-motion conditions as appropriate. Screenshots must come from the actual app at a known commit; do not offer static design mocks as implementation proof. Clearly label synthetic or owner-permitted sample data.

**Compare against the approved original LDL reference**, and document by dimension (with a concise PASS/FAIL/NOT TESTED plus screenshot evidence):
- result/identity focal hierarchy, typography scale and type pairing;
- composition, spacing, vertical whitespace and information density;
- placement/visibility of existing science artwork, including fallback when missing;
- chart prominence, proportion, historical point/axis/reference visibility;
- material treatment, background, section transitions and theme consistency;
- relevant concise education, nuance placement and default-vs-disclosed complexity;
- adaptive mobile/tablet/desktop layout rather than mobile enlargement;
- real tap targets, focus order, 200% text zoom and non-misleading scientific state.

**Do not claim visual PASS based on CSS assertions, React DOM presence or functional tests only.** Require a documented visual-fidelity review (human comparative assessment supported by screenshots and explicitly marked discrepancies). If the original reference cannot be accessed by Codex at review time, mark direct comparison `NOT TESTED — reference unavailable`; use the embedded design requirements to progress but do not invent exact pixel equivalence. No arbitrary invented universal similarity percentage.

### Preserve distinct existing gates

- **Functional:** selection, source correction, comparison, keyboard, source navigation, responsive transitions, account isolation and original art fallback.
- **Scientific:** exact observed records, assay comparability, range applicability, uncertainty and approved action boundaries.
- **Security:** source grants, consent, account changes, stale caches and no foreign-account information.
- **Visual:** actual screenshot comparison to the owner's approved reference and rich editorial quality. **All are required** to call the scoped experience accepted; none substitutes for the others.

## 5. Scheduling and priority

This is a **P1 quality correction within the already authorized Bloodwork editorial workstream**, not a new major feature, backlog platform or v0.7 discovery initiative. `NEXT_ACTIONS.md` continues as the one active queue; Codex should integrate this visual-fidelity requirement into the relevant existing Bloodwork work once the current critical source/integrity slice is safely completed. Prior implementation receipts remain valid for what they genuinely tested; visual-fidelity acceptance is separately open until demonstrated.

No new owner approvals for standard implementation. Existing rules still prohibit unapproved destructive production DB changes, main merges, paid services, medical claims and new sensitive-data sharing.

**Definition of done:** Actual Ferritin and LDL expanded pages reproduce the approved premium Bloom editorial design language and intentional device compositions, while retaining scientific accuracy, existing chart/source interactions, complete historical/source access, accessibility, original approved assets and authorized privacy.
