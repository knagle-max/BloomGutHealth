# Specialist Handoff — Marketing & Design
**Date:** 2026-10-18 · **Status:** Proposed guidance · **Reviewed:** `enhance/bloom-experience` / `550d549a31e513cb8a7556dd7e44aec2aa1cd800` · **PR:** #1 (open)

**Reviewed sources:** `PRODUCT_DIRECTION.md`, `ENHANCEMENT_REVIEW.md`, `design_guidelines.md`, `client/src/workspace.css`, `client/src/components/AppHeader.tsx`, `client/src/components/AppNavigation.tsx`, `client/src/components/BottomNav.tsx`, `client/src/pages/Dashboard.tsx`, `client/src/pages/Explore.tsx`, PR #1 description. **Limit:** code/document review, not an independent screen-reader/physical-phone audit. Individual agent chat handoffs not independently available as source files; Developer to reconcile.

### Design requirements for Developer backlog
Each item starts at **Received**; subsequent workflow: Received → Reviewed → Implemented → Tested → Specialist review. All apply to reviewed branch/commit above and must be revalidated if head changes.

| ID | Priority | Recommendation | Why | Acceptance criteria |
|---|---|---|---|---|
| MKT-001 | P0 | Evidence-semantic visual system | Older guidelines include unsupported color-coded gut-health score. Scientific review rejects modeled personal health outputs. | No aggregate gut-health score unless scientifically validated and approved; labels differentiate measured, calculated, estimated, and research-only; color never sole source of meaning; empty/unknown data remains explicitly unknown. |
| MKT-002 | P0 | Today: clear next action | Current dashboard has focus, welcome, metrics, meal list, multiple shortcut areas; risk of competing primary actions. | One primary next action visible at 320px and 390px; previous data understandable without scrolling through a wall of cards; first-use / partially logged / full / outage states shown; food logging stays one tap away. |
| MKT-003 | P0 | Food and biology explainers | Evidence graph is powerful but too technical for first-time users; scientific caveats must be understood. | Each explanation provides in order: what it is, why it might matter, whether Bloom uses it for *this person's* priority, evidence type and limitations, citation link; wording reviewed by Biology agent; no research association represented as individual clinical effect. |
| MKT-004 | P0 | Sensitive-data copy and consent UX | Personal genetics, labs, microbiome data require clear user control and trustworthy claims. | Plain-language labels for source and access; actionable permission choice for optional photos/AI; easy deletion/export entry points, no dark patterns; Security agent signs off on copy/flows and actual behavior. |
| MKT-005 | P1 | Consistent brand tokens/assets | Existing CSS themes and older design guidelines diverge; app identity feels inconsistent across modes. | Developer selects approved tokens or documents deviations; logo/app icons sharp from 32–512px; light/dark assets tested; Everyday and Athlete visually distinct but structurally consistent; WCAG 2.2 AA target verified on actual components. |
| MKT-006 | P1 | Logging experience resilience | Barcode, manual, and image paths should support fast use without pressure to fabricate precision. | User can complete manual entry when scanner denied; review serving and item before save; unknown nutrient fields display “Not available,” not zero; edit/correct flow and clear success/errors; keyboard/mobile checks. |
| MKT-007 | P1 | Navigation and orientation | Core 3 screens plus expandable tools and athlete 5-tab experience need predictable cross-mode transitions. | Current location shown; desktop/mobile same destinations and labels; persistent way to log meals; bottom controls clear of safe area; mode transition does not imply paywall or alter data. |
| MKT-008 | P1 | Data visualization safeguards | Charts can misrepresent partial intake, microbiome abundance, genetic effects, and time comparisons. | Every plot has units, dates, source, enough labels without color, explicit missingness, accessible text equivalent; never displays a favorable zero from absent measurement; small-screen and reduced-motion checks. |
| MKT-009 | P2 | Onboarding and value proposition | Precision-nutrition complexity can overwhelm free Everyday users. | Short optional onboarding: goal, dietary restrictions, connect data later, first task; skip available; no unnecessary health-information collection; Athlete explained as a separate mode, not paid feature yet. |
| MKT-010 | P2 | App-store/web marketing package | Future launch needs recognizable identity and defensible claims. | Approved wordmark, app icon, screenshots using synthetic examples, claim review by Nutrition and Security, trademark assessment before publication; free-core offering accurately described. |

### Superseded directions
1. `design_guidelines.md` “Gut Health Score Circle” and excellent/good/attention ranges are **superseded** by MKT-001 until independent scientific validation. No circular score, score-derived rank, or color-coded numerical health classification by default.
2. `design_guidelines.md` original 4-tab mobile navigation (Dashboard/Log/Insights/Profile) is **superseded** by agreed Today / Explore / Progress and persistent logging affordance, MKT-007.
3. Earlier broad marketing language that might promise microbiome optimization is **superseded** by evidence-aware claim standards in `CONTENT_AND_SCIENCE.md`.

### Cross-specialist conflicts/decisions for Developer
- BIOLOGY: determine which claims and strength-of-evidence labels can be used, especially pathways, host variants, microbe associations, athlete recovery, and lab/genetic observations. Proposed UI must not confer stronger certainty than supplied evidence.
- SECURITY: approve precise privacy and image/AI consent copy; review whether any screen includes sensitive records in share/export previews, logs, app-switcher previews, or cached state.
- PRODUCT: approve athlete naming, future subscription distinction and brand/trademark strategy. No access entitlements based on mode toggle.
- DEVELOPER: decide ordering/technical mechanism for adopting design tokens and SVG assets; preserve current routes, security controls and scientific semantics; do not treat delivered PNG screenshots as tests.

### Specialist review after implementation
Require a PR/head SHA and screenshots across 320, 390, 768 and 1440 widths, dark/light, Everyday/Athlete, plus keyboard/focus and reduced-motion recording. Review against each acceptance criterion as Pass / Needs changes / Not tested. The Developer owns automated checks and browser execution; Design owner evaluates UI/copy/results.
