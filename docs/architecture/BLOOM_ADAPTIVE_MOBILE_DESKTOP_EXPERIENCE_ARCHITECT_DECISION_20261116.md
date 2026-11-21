# Bloom — Adaptive Mobile & Desktop Experience Architecture
**Owner directive:** November 16, 2026  
**Architect disposition:** APPROVED; standing responsive UX and code-architecture requirement, incremental implementation in existing v0.6 workstreams  
**Repository:** `knagle-max/BloomGutHealth` · authorized development branch `enhance/bloom-experience`  
**Authority and relationship:** Direct owner directive; complements `AGENTS.md`, `BLOOM_CROSS_PAGE_VISUAL_PRESERVATION_AND_ASSET_ADDITION_POLICY_20261116.md`, existing design tokens, `V06_HANDOFF.md`, approved layout/UX work and `NEXT_ACTIONS.md`. No duplicate task queue, app-wide rewrite, mobile/desktop duplicate applications, additional platform migration or new owner approval cycle.

## November 17 owner clarification — selective preservation, not absolute mobile-layout freeze

The newer [application-wide visual DNA decision](BLOOM_APPLICATION_WIDE_VISUAL_DNA_AND_SELECTIVE_PRESERVATION_20261117.md) is authoritative for the question of *how much composition may change*. Mobile Biology, Bloodwork and Microbiome remain **valuable existing design baselines**: preserve their approved artwork, charts, original source interactions and scientific data and avoid gratuitous redesign. However, the owner now **expressly permits meaningful presentation-layer improvements on those mobile pages** wherever the rendered composition/typography/disclosure/spacing fails the approved LDL editorial quality benchmark. The prior November 16 “do not redesign, reorganize, restyle” wording below applies only to **unrequested, unnecessary redesign for desktop adaptation**; it is **not** a blanket veto on quality fixes or this later owner-approved visual evolution. Existing Bloodwork marker-detail P1 visual-fidelity correction remains explicitly authorized. Desktop still must be purpose-built rather than an enlarged mobile page. Preserve feature and science parity across layouts.

---

## Owner clarification — mobile Biology/Bloodwork/Microbiome baseline is preserved; desktop is the improvement target (2026-11-16)

**Highest-precedence scope clarification for this adaptive UX directive:** The product owner primarily reviews and specifies features on a phone. The **existing mobile Biology, Bloodwork and Microbiome pages have been iteratively optimized based on that phone experience and are the accepted presentation baseline**. **Do not redesign, reorganize, restyle, replace artwork, adjust chart presentation, or otherwise change those mobile layouts merely to satisfy this desktop-adaptation directive.** The visible owner-observed desktop problem is that desktop pages resemble enlarged mobile pages. **Prioritize genuinely desktop-specific composition and space usage** on those experiences. Tablet may receive deliberate intermediate adaptation, but must not force changes to the established mobile UX.

**Exception scope:** A later explicit owner-requested mobile change (including a targeted mobile Bloodwork/chart requirement), a confirmed correctness/security/safety/accessibility defect, or an unavoidable shared bug fix may change the affected mobile portion **only to the minimal necessary extent**. This preservation instruction does **not** cancel earlier explicit owner-directed mobile Bloodwork improvements or ongoing active fixes; those remain in their separately scoped handoffs and `NEXT_ACTIONS.md`. Do not interpret desktop work as permission to reopen other completed mobile decisions.

**Desktop target:** Maintain the exact same source/marker/organism/illustration records, chart engines, semantics, selected-state controls and scientific evidence. At desktop content widths, restructure **presentation** (e.g. balanced multi-column editorial layouts, side-by-side chart and explanations, contextual side rail, readable-width copy, larger use of existing science media, persistent navigation as appropriate) without simply widening a narrow column or stretching cards. Start from current responsive components and styling; add desktop-specific wrappers/layout containers only when needed, keeping all domain logic shared. Never replace existing assets or clone feature implementations.

**Regression rule:** Before/after desktop screenshots must demonstrate meaningful improved use of available width at 1024 and 1440px. Paired 320/390px reference screenshots of existing Biology/Bloodwork/Microbiome must remain visually/functionally equivalent **except the narrowly authorized, separately tracked mobile changes**. Check touch, chart history, source correction, organism profiles, data authorization, focus/selection, light/dark, tablet/zoom and image fallbacks. Record any authorized mobile diff explicitly rather than treating unintended visual drift as acceptable.

**Other pages:** Continue device-appropriate work incrementally for Today, Food, Explore, Progress and Athlete, applying the same principle of preserving already owner-refined mobile experiences unless separately requested.

---

## 1. Binding architectural principle

Bloom must provide **two equally intentional web experiences** (mobile and desktop), plus a deliberate intermediate tablet presentation. Neither web experience should feel like a stretched or compressed copy of the other. **Share everything that should be consistent; separate only presentation and interaction patterns that benefit materially from being different.**

**Single source of truth** for scientific data, backend, authorization, imports, analytics, schemas, UI tokens, approved art, image/asset registry, state and business logic. Preserve completed working interfaces and charts unless the owner explicitly directs replacement or a real defect/safety/accessibility issue requires a bounded correction. New assets are additive following the standing cross-page preservation policy.

### Architectural separation rule
| Concern | Default implementation |
|---|---|
| Server/data/science/permissions/consent/units | One canonical implementation; never device-fork |
| Hooks, data fetching, mutations, domain state | Shared across compositions |
| Asset IDs, files, fonts/illustrations, editorial metadata | One canonical registry and bytes; optional context-specific crop/art direction within the same entry |
| Simple controls and components | One responsive implementation with tokens, CSS grid/flex and appropriate container queries |
| Complex page layout | Shared feature controller, optionally distinct mobile/tablet/desktop **presentation components** when materially justified |
| Input interactions | Touch/pointer/keyboard adapted through supported controls and capability awareness |
| Native iPhone SwiftUI later | Separate Apple-native UI consuming existing Bloom API/backend, source data and science, not cloned React UI |

**No mandate for separate MobilePage and DesktopPage files**. Separation only after showing that a single responsive composition cannot meet usability without complex conditional duplication. Do not maintain parallel sets of business rules or API calls. Avoid rendering two fully functional copies hidden by CSS (duplicate forms, accessibility IDs, queries or side effects).

## 2. Device-specific intent and common capabilities

### Mobile web
Touch-first focused tasks; clear primary action; intentional bottom navigation; one principal content flow; concise supporting metadata; progressive disclosure of genuinely secondary technical/administrative controls; tap targets and focus states; no offscreen chart controls or sideways scrolling. Preserve meaningful science/education and access to source/correction details. Avoid turning every screen into a long stack of repetitive cards.

### Tablet/intermediate
Deliberate one- or two-column layouts based on content constraints; adaptive navigation (compact rail, drawer or persistent pane when appropriate); comfortable touch controls; charts and supporting text can align side by side when they remain legible. Do not assume tablet equals enlarged phone.

### Desktop
Multi-column editorial compositions when content benefits; persistent navigation where appropriate; larger charts and scientific images; contextual panels, side-by-side editing and comparison; efficient pointer and keyboard workflows. Use available horizontal space meaningfully while respecting readable text line lengths; avoid huge stretched phone cards or blank margins due to arbitrary max-width ceilings. Desktop can show details concurrently that mobile places behind progressive disclosure.

**Feature parity means equivalent abilities and information access, not identical appearance or identical interaction steps.** No essential information or controls may become desktop-exclusive or mobile-exclusive without a justified accessible alternative.

## 3. Layout and capability strategy

- Prefer layout based on actual available **container space** (CSS grid/flex/container queries); use a small, coherent set of app-level breakpoints only where composition changes materially. No hardcoded dependence on a phone/tablet model name.
- Consider viewport width and height, orientation, pointer coarseness/hover, keyboard presence, text zoom, browser chrome/safe areas, reduced motion, reduced transparency and forced-colors. Do not infer touch support solely from narrow viewport. Desktop browsers may be narrow; tablets may have keyboards/pointers.
- At constrained sizes, preserve explicit controls and meaningful titles, prevent overlay/bottom-bar collisions, and keep focus/scroll restoration correct. At large sizes, split complex information intentionally, not simply scale fonts/cards or enlarge empty hero areas.
- Responsive images use original assets where possible; use `object-fit`, art-directed crops or suitable existing variants within the **same** registry ID and rights/quality envelope. Do not regenerate or replace original art because of device width. Large new images have registered requested placeholders; small supporting visuals may be created to Bloom standard and registered when applicable.
- On layout transitions preserve unsaved edits, selected lab point, chosen meal, chart focus, loading/error status and other user state; no duplicate mutation or reset due to breakpoint/orientation changes.

## 4. Implementation examples — illustrative code, NOT verified source exports

Prefer a single shared responsive component for simple presentation:
```tsx
export function NutrientSummary({ summary }: { summary: CanonicalNutritionSummary }) {
  return (
    <section className="nutrient-summary">
      <NutrientMetric metric={summary.protein} />
      <NutrientMetric metric={summary.fibre} />
      <NutrientMetric metric={summary.energy} />
    </section>
  );
}
// CSS sketch (adapt to existing tokens):
// .nutrient-summary { display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:var(--bloom-gap); }
```

For complex workflows, separate view composition without duplicating data logic:
```tsx
function FoodPlannerFeature() {
  const controller = useCanonicalFoodPlanner(); // existing shared source/state/mutations
  return <AdaptiveFoodPlannerView controller={controller} />;
}
// AdaptiveFoodPlannerView may share subcomponents in different editorial
// compositions via container queries, or delegate to MobilePlannerLayout /
// DesktopPlannerLayout only when interaction meaningfully differs.
// Keep one owner of form state, write permissions and save semantics.
```

These names are **architectural examples only**. Codex must inspect current HEAD and reuse existing hooks/components/queries and current design system rather than introducing competing abstractions. Never write a universal breakpoint hook when CSS resolves the layout without JS.

## 5. Per-experience adaptation matrix

| Major view | Mobile intent | Desktop intent | Shared invariant |
|---|---|---|---|
| Today | One primary action, focused daily path, concise supporting context | Primary action with related goal/evidence/next-step context aligned where valuable | One canonical priority engine, action/choice lifecycle |
| Food | Touch-first add/edit meal, portions and review/save; nutrition context progressively displayed | Side-by-side meal editor, sourced nutrient totals and optional plan/alternatives | Same food source, nutrient math, restrictions, draft/consumed distinction |
| Bloodwork | Parent selector retained; expanded marker latest→history→visible beginner science→context; clear chart/source controls | Wider existing chart with contextual facts and source/education composition; avoid forcing mobile stack | Same chart engine/assets, source dates, assay comparability, reference application, correction and safe evidence |
| Biology | Focused organism/marker detail, progressive exploration | Relationship/context workspace, larger visualization when helpful | Same biological graph, evidence, user observation meaning and release gates |
| Explore | Search/browse → focused detail with reliable back navigation | Browse + selected detail/relationships side-by-side where useful | Same content/identity/evidence sources |
| Progress | Accessible readable dated trends and useful single comparisons | More comprehensive comparative trends/timelines in parallel | Same source series, selected ranges, revision/abstention logic |
| Athlete | Fast workout logging and timely actions, manageable training readouts | Training history, routine planning, fueling/metrics overview | Same activity records, completion semantics, scientifically allowed targets |
| Coach (if enabled) | Private, task-focused role-aware actions | Wider participant/context workspace | Same role/consent and ownership constraints |

These are design intentions within already approved feature scope. They do not authorize additional claims, data reads or premature Coach/native activation.

## 6. Verification and acceptance

For Today, Food, Bloodwork, Biology, Explore, Progress and Athlete, **when those pages are touched or evaluated as an integrated release**:
1. Capture real mobile/tablet/desktop screenshots at **320, 390, 768, 1024 and 1440 CSS px** in relevant light/dark modes, plus representative orientation/viewport height. Confirm a distinct intentional composition at each scale and consistent use of the original art.
2. Test touch, mouse, keyboard (including visible focus), screen reader interactions as applicable, larger text and **200% zoom**, reduced motion, forced colors and safe area/bottom navigation. Report any device-only test (physical Safari/VoiceOver) as untested if not performed.
3. No horizontal overflow, colliding controls, cut-off graphs, duplicate inaccessible hidden controls, lost selection/edit state or misleading chart semantics.
4. Desktop meaningfully uses available space without long-line body text, excessive empty margins or oversized mobile cards. Tablet has its own deliberate structure. Mobile prioritizes tasks without excessively expanding admin/source settings in the default view.
5. **Parity testing:** For each tested scenario, identify the same underlying source data, controls and supported user actions across sizes; mobile/desktop may use different placements, not different authority or logic.
6. Existing visual art and chart assets preserve registry IDs and unchanged bytes/hashes unless specifically authorized; any new large art placeholder/registry entry is additive and truthful, small new art is high quality/semantically justified.
7. Test source/correction/authorization behavior with size changes and account changes; prove an orientation switch or breakpoint doesn't commit a form twice or erase draft state.
8. Include missing/one-result/many-results, loading/failure, slow images, unsupported science, and long names/localized text states where relevant.
9. Compare actual screenshots against owner-provided examples; document justified deviations, not a merely cosmetic CSS selector count.
10. Record **exact commit SHA, test/CI receipt, verified preview SHA and scope**, with `PASS/FAIL/NOT_TESTED`. Do not assert independent device acceptance from simulated layout only.

## 7. Scheduling, architecture ownership and non-goals

- This is a **standing incremental standard** applying whenever Codex works on an existing approved v0.6 experience and later workstreams. It does **not** demand an app-wide simultaneous redesign, feature rewrite or two sets of pages.
- `AGENTS.md` is the concise execution-entry point, `NEXT_ACTIONS.md` remains the single task selector, the cross-page design/asset policy owns preservation, and this document owns the device-appropriate composition acceptance.
- The architect resolves conflict with specific user reference instructions; UX/Brand validate visual quality, Codex implements in existing components, Biology/Security protect science/data/permissions. Owner review is not an additional stage for every responsive breakpoint.
- Deferred Apple-native SwiftUI iPhone client is a separate implementation that shares Bloom backend/scientific contracts; do not make React code an enforced cross-platform UI library.
- **Non-goals:** React/native rewrite, new routing systems, duplicate mobile/desktop feature code, regenerated artwork, separate asset registries, arbitrary device-specific backend fields, unnecessary JS viewport logic, redundant animations or speculative large-scale UI refactoring.

## 8. Definition of done

Each major Bloom experience is deliberately composed and accessible on mobile, tablet and desktop, with the same real data, scientific authority, approved brand art, user capabilities and dependable state. Separate only what truly improves human interaction; keep shared science and functional code canonical.
