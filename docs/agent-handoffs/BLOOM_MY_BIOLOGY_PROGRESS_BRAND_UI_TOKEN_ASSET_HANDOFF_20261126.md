# Bloom — My Biology & Progress: Brand/UI Design Token and Asset Reuse Handoff

**Handoff:** BRAND-BIOPROG-20261126-R1 · **Date:** 2026-11-26 · **Status:** SOURCE-INSPECTED BRAND DESIGN SPECIFICATION / PROPOSED, NOT IMPLEMENTED OR OWNER SIGN-OFF.
**Reviewed exact UX source:** `Bloom_My_Biology_Progress_Brand_UX_Handoff_2026-11-26.md` in `/Bloom gut health/Agent Handoffs/`, ID `UX-BIOPROG-BRAND-20261126-R1` (113 lines). Preserve its UX roles, data and limits.
**Repo:** `knagle-max/BloomGutHealth` / `enhance/bloom-experience`. Source inspected: `client/src/pages/PrecisionNutrition.tsx`, `client/src/components/BiologyHome.tsx`, `client/src/pages/Progress.tsx`, `client/src/components/FoodProgress.tsx`, `client/src/content/editorial-media.ts`, `client/src/styles/bloom-visual-scoped.css`, and `docs/visual-assets/visual-asset-registry.json`. This is static source review, not authenticated runtime or pixel inspection.
**Other controlling handoffs:** [standing visual hierarchy and design tokens](BLOOM_STANDING_BRAND_UI_VISUAL_HIERARCHY_AND_TOKENS_20261126.md), [Bloodwork/Microbiome brand handoff](BLOOM_BLOODWORK_MICROBIOME_BRAND_UI_TOKEN_ASSET_HANDOFF_20261126.md), [Exercise/Muscle/Pain brand handoff](BLOOM_EXERCISE_MUSCLE_PAIN_BRAND_UI_TOKEN_LAYER_20261126.md), and root `AGENTS.md`/`NEXT_ACTIONS.md`. Never start a second task queue or bypass holds.

## 1. Creative thesis and preserve/change decision

- **Today = Act:** one next action. **My Biology = Understand:** a beautiful, source-honest biological atlas/index. **Progress = Observe:** dated, user-selected longitudinal records. Do **not** put Today's recommendations, tasks, scores or reminders into either page.
- **My Biology:** premium editorial, curious and calm, botanical-organic with scientific discipline; four instantly recognizable data doors. Existing approved visuals are already strong; use generous type and intelligent space rather than a large unverified digital twin.
- **Progress:** more analytical and instrument-like, a single dominant real chart on calm porcelain, precise unit/date hierarchy, restrained sage/blue plot accents, and concise linked changes. No wall of equally weighted cards; no 12-chart grid. The two screens should feel like paired destinations, not duplicated dashboards.
- Keep real source, consent, historical observations, correction flows, existing deep links, assay/method comparability, report taxonomy, and existing Today/Progress mode separation. No custom biological health scores or personal organ-colouring.

**Source-code observations:** `BiologyHome.tsx` already renders precisely four primary source destinations using `EditorialMedia` slots `biology-bloodwork`, `biology-gut`, `biology-genetics`, `biology-measurements`. It currently also includes `MuscleHistoryPanel` inside the home section. This can become visually over-dense; UX/Architect must decide its subordinate placement, not Brand delete it. `Progress.tsx` currently supports Nutrition/Activity/Biology tabs with Athlete default Activity and explicit legacy links redirecting to `/precision?tab=labs`. It has no standalone featured-metric Overview, timeline or two-series comparison component in the inspected source. `FoodProgress.tsx` already supplies legitimate dated recorded-day plots, 7/28/all controls, and exact missing/partial handling. **Reuse this science/data contract instead of building a parallel chart engine.**

## 2. Real asset inventory and commission decision

**Verdict: NO NEW ORIGINAL ILLUSTRATION IS JUSTIFIED NOW.** There is sufficient existing art to design the intended pages, while a novel atlas must first pass a reuse proof. This handoff raises UI composition and component work only—not permanent new BVA image requests.

| Asset / source | What exists | Decision |
|---|---|---|
| **BVA-0003** Biology editorial hero | Approved source and existing Biology slot | **Reuse if helpful** as a restrained small atlas contextual scene; no full-width hero above four destinations. Verify current delivered exact artwork and license. |
| **BVA-0032/33/34/35** four Biology data tiles | All **Integrated** in canonical BVA registry and used by `BiologyHome.tsx` | **Mandatory reuse.** No separate redesign of vial, gut, genetics or measurement illustrations. |
| **BVA-0010/11/12**, BVA-0018 | Existing cardiovascular, glycaemic, liver and genetics art | **Use for system lenses** where scientifically reviewed and visually appropriate; otherwise simple labelled text/brand icon. Do not invent endocrine or immune anatomical imagery merely to fill a slot. |
| **BVA-0021**, **BVA-0006**, `progress-scene` | Existing Progress editorial assets/slot | **Reuse or reduce**. The chart, not a decorative art scene, must dominate Progress first fold. BVA-0006 has an Identified lifecycle; don't assume approved. |
| **BVA-0078/79** muscle anatomy | Review-tested local presentation with protected geometry | **No redraw.** Musculoskeletal lens links to canonical muscle view; no independent clickable miniature paths. |
| **BVA-0087–89** symptom body map | Design sources exist, but science/production activation gated | **Do not reproduce or activate** inside Progress timeline or Biology merely for illustration. Link to authorized Pain where appropriate. |
| **CHART-A/B/C/D/E** | Prior visualization designs and source packages, varying integration/acceptance states | **Reuse token/pattern and chart interaction contracts**, not static chart screenshots or unrelated new graph illustration. Actual data must be plotted by the app. |

**Conditional only after actual tested screen demonstrates insufficiency:** if no approved Biology hero can be cropped into a credible small atlas/selector, design a **functional interactive atlas composition** using existing Biology art + existing labeled system navigation. No new anatomical organ illustration is automatically required. Commission a new original vector only after UX/Architect specifies verified selectable system hit areas, a real usage gap, and safeguards against depicting organ health; do not invent it as a prerequisite. Similarly no new charts, timeline icons, measurement glyphs or progress hero art required until actual reuse proves inadequate.

## 3. Required editable UI DESIGN deliverables (not illustration files)

| ID | Priority | Design output and exact visible states | Production decision |
|---|---|---|---|
| **BP-UI01** | P0 | My Biology home: compact contextual atlas, four BVA-0032..35 data doors, systems entry, source/availability/date labels; populated/empty/partial/loading/error | **New responsive composition**, reuse all art |
| **BP-UI02** | P1 conditional | Biological systems index & one Metabolism system detail: verified education-only vs personal source entries, linked Bloodwork/Genetics/Nutrition/Measurements, more/unavailable/unknown | **Only if system lens authorized**. Reuse existing category imagery; no new illustrations |
| **BP-UI03** | P0 | Progress Overview: one user-changeable featured metric/chart, range, real latest/date/unit, compatible change qualifier and up to three compact linked observations; empty/one-point/missing/noncomparable/error | **New UI composition**; chart uses existing data/CHART language |
| **BP-UI04** | P0 | Shared metric/period selector: 7d/30d/90d/1y/All where supported, picker sheet, selected/disabled/source-unavailable/focus and return | **New reusable UI component spec**, not artwork |
| **BP-UI05** | P1 | Progress domain Navigation: Overview/Nutrition/Activity(or Training)/Biology; Wellbeing only if real source, deep-link retaining and original mode-specific content | **Refine existing Tabs**, no new nav graphics |
| **BP-UI06** | P1 optional | Chronological event timeline: actual dated food/activity/lab/report/measurement/pain sources, type icon/label, corrections, source link, no events/partial/error | **New data-bound UI component** only once canonical event unification exists; reuse Lucide icons |
| **BP-UI07** | P2 optional | Compare: two metric selectors, same date window, aligned small multiples with separate original units and no false interpolation; unequal coverage, incompatible method, single point, unknown dates | **New exploratory component** only after Architecture/Biology authorizes data eligibility; reuse CHART-E01/E02 and scientific caveat grammar |
| **BP-UI08** | P0 | Four-theme foundation: exact semantic surfaces/contrast and typography/spacing/selection tokens for both pages; 320/390/768/1440 + 200% zoom | **Mandatory design-token sheet**—no new image |
| **BP-UI09** | P0 | Shared state/QA storyboard: initial, selected metric/atlas, open sheet, loading, empty, source-limited and failure; screen-reader/tabular fallback, source routes and genuine browser proof | **Editable state boards & developer redlines**, no new image |

Priorities reflect visual-design and preservation needs, **not** developer authorization. Existing capable screens must be preserved if actual current screenshots demonstrate they satisfy the relevant criteria. Do not design a complex paid illustration package to implement BP-UI02, 06 or 07 before underlying canonical UX/data permission exists.

## 4. UI Visual & Design Token Specification — both pages

### 4.1 Current premium stylesheet role foundation

Values from the inspected **existing** `client/src/styles/bloom-visual-scoped.css`; use it as the palette of record, not a competing palette. Athlete-light resets only some variables; resolve final CSS cascade on the actual mounted build rather than treating inherited light values as certified.

| Role | Everyday Light | Everyday Dark | Athlete Light | Athlete Dark |
|---|---|---|---|---|
| Canvas `--bv-canvas` | `#F8F9F3` | `#101C17` | `#F8F9F3` | `#0F1B2E` |
| Subtle paper `--bv-paper` | `#F5F3EB` | `#192B24` | `#F5F3EB` | `#17263E` |
| Elevated surface `--bv-porcelain` | `#FFFEFA` | `#22382E` | `#FFFEFA` | `#182B45` |
| Primary text `--bv-forest` | `#173E32` | `#EFF6EE` | `#0F1B2E` | `#F1F6FF` |
| Strong text `--bv-forest-strong` | `#102B25` | `#FFFFFF` | `#0F1B2E` | `#FFFFFF` |
| Interaction `--bv-brand` | `#246B50` | `#A6DEBA` | existing `hsl(var(--primary))` | `#81BEFF` |
| Secondary `--bv-secondary` | `#52685C` | `#CADACF` | light token; compute on runtime | `#C3D4E9` |
| Border/selected/focus | Existing `--bv-line`, `--bv-mist`, `--bv-focus` | Theme-specific existing roles | CSS cascade inspection | Theme-specific existing roles |

**Component-local semantic aliases, suggested not shipped:** `--bp-atlas-panel:var(--bv-porcelain)`; `--bp-chart-panel:var(--bv-porcelain)`; `--bp-secondary-panel:var(--bv-paper)`; `--bp-divider:var(--bv-line)`; `--bp-selected:var(--bv-mist)`; `--bp-accent:var(--bv-brand)`; `--bp-text:var(--bv-forest-strong)`; `--bp-muted:var(--bv-secondary)`; `--bp-focus:var(--bv-focus)`. Preserve original lab chart methods and category semantics; all selected/active state relies on text and indicator as well as colour.

### 4.2 Typographic precision — suggested screen-level style values

| UI role | Size / weight / line-height / tracking | Notes |
|---|---|---|
| Page heading | 30px mobile, 34px desktop / 600 / 1.16 / −0.02em | Current approved headline font/fallback; no forced remote fonts |
| Section heading | 20px / 600 / 1.25 / −0.01em | 'Your biological data' or 'Other recorded changes' |
| Data door or metric title | 17–18px / 600 / 1.3 | Full readable name, no clipping |
| Major latest metric | 32px mobile, 38px desktop / 650 / 1.08; tabular numerals | Unit 16px and collection/event date 13–14px |
| Body/input | 16px / 400–500 / 1.5 | Source clarity; do not shrink scientific content |
| Label and select | 14px / 600 / 1.4 | Meaningful action state |
| Caption/source/method | 13–14px / 450–500 / 1.45 | Actual source/time visible when material |
| Minor decorative eyebrow | 12px / 600 / 1.4 / +0.08em | Not a place for critical caveats |

**Surface hierarchy:** uncluttered canvas → one prominent clean chart/atlas surface → unboxed or lightly divided sub-destination rows → sheets/drawers only for selection/deep detail. Border and shadow should not both dominate; avoid four equally weighted nested rectangular cards. Don't make the map an illustration-heavy digital twin or chart a magical predictive graph.

### 4.3 Spacing and component geometry — suggestions, not global replacements

- 4px spacing scale, typical gaps 8px controls; 12px row icon/text; 16px card/row internal; 20–24px section gap; 32px large section separation.
- Existing shell dictates horizontal padding. Proposed local content padding: **16px at 320/390**, **24px at 768**, **32px at 1440** when no shared wrapper provides it. Do not double-pad.
- Four biology doors: full selectable tile/row height **≥72px**, art ~40–56px where sourced; 2×2 only when 320px/200% readable; else natural vertical rows. Surface radius 16px; no invented border per text line.
- Small atlas hero: illustration area ~140–168px on mobile (as UX visual budget allows), 1:1 source aspect preserved; textual systems index must remain visible. Hotspots only if actual source system link reviewed and keyboard equivalent exists.
- Featured Progress chart: broad content surface with ~20px radius, 16px interior mobile/24px desktop; graph itself may use responsive height ~190–240px mobile; point inspection popup can't cover original record link. Actual chart time domain must remain true.
- Filter / metric controls: **44px minimum** targets; search/CTA 48px when applicable; pills 34–36px visual with 44px effective hit; sheet exposed radius 24px; account for keyboard and bottom safe area. Avoid fixed body heights to satisfy the 844px conceptual budget.
- Dividers 1px subtle on noninteractive grouping; a visible 3px focus outline with offset; accordions/tabs must have accessible labels and focus restoration.
- Motion 120–180ms subtle opacity/tint only; **no data-created chart interpolation**, prefilled fake point animation, live organ pulses or parallax atlas; reduced motion instant.

### 4.4 Interactive-state matrix

| Component | Normal | Hover / focus | Selected / active | Missing / disabled / loading / error |
|---|---|---|---|---|
| My Biology source tile | approved art + name + honest source status | modest surface wash / 3px focus | selected navigates to canonical profile, not fake personalised organ map | no-source 'Add' still navigable; loading blocks stale status |
| System lens row | exact reviewed topic + relevant canonical sources | hover tint / focus | opened system with selected label/Back | unimplemented system **not** rendered as dead CTA; education-only clearly flagged |
| Period control | calm compact chip | focus visible separate from hover | filled/outlined + label, ARIA state | unavailable range explained; no source records ≠ zero |
| Featured metric picker | label + current unit; 44px | focus | selected metric visibly named, genuine data-only | invalid/incompatible metric excluded or explicitly labelled |
| Chart selection | source point, honest date | precise focus/tooltip | selected point with value/unit/date/source, table equivalent | one point no trend; missing gaps; source-method mismatch not falsely joined |
| Timeline item | type icon + actual date and summary | focus on row | links canonical record; back restores filter | withdrawn/deleted entries not phantom dots; no causal icon |
| Comparison | two clearly labelled metric cards | focus per selector | aligned time axes, independent units | missing/non-comparable shown as missing; no dual-axis misleading slopes |
| Sheets/dialogs | hidden / stable UI | summary focus | source/select with close and focus return | retry preserves draft and state; keyboard not trapped |

### 4.5 Scientific and content guardrails

The exact UX handoff controls these: source date vs upload date, source assay intervals, numeric vs qualitative microbiome, measurement provenance, nutrition logged days ≠ zero, role associations ≠ muscle activation, genotype not mutable, symptoms not automatically medical, no biological data completeness score. No red/green "better" arrow without a reviewed metric interpretation; change = direction and value, **not** positive/negative judgment. Cross-domain comparisons are at most time-aligned observations, never causal links or estimated physiology. Preserve `BP-01..BP-16` source acceptance and `R3` Bloodwork result→trend→visible education order.

## 5. Screen-specific composition / reuse directions

### My Biology / BP-UI01
Design as **small atlas + four trusted entrances + reviewed systems**. The four BVA-0032..35 art tiles already render in code. Keep their approved artwork large enough to recognize but do not overpromote the abstract Biology banner. System labels use current category icons or text, with verified source lens links; don't place reactive biological heatmaps over a human silhouette. The existing `MuscleHistoryPanel` above data tiles merits an actual screenshot/UX check for buried entrances; recommend disclosure or relocation only after UX decision. Desktop atlas may sit beside the 2×2 doors; mobile fits a compact approx 168px hero without clipping the 532px first-fold workspace. Atlas artwork is not a clinical diagnostic display.

### Progress / BP-UI03
Use one **precise, configurable dated observation** as hero, not 12 panels. Latest value is *reported/latest recorded* with unit/date rather than generic "Today". Period selection remains explicit; date range displayed. Under chart, up to three compact actual eligible changes, then clear "View timeline" entrance. Existing `Progress.tsx` Tab three-way and `FoodProgress` 7/28/all are **not** replaced by a speculative global 30-day default until Architect reconciles deep links/source eligibility and supported time windows. Preserve a user-selected pinned metric only when persisted correctly, consented and genuinely eligible. On desktop featured chart ~2/3 content and changes ~1/3; no bento-grid imitation.

### Biology system lens / BP-UI02
Use 6 initial labels (Metabolism/Hormones/Immune/Digestion/Cardiovascular/Musculoskeletal) **only where source-reviewed content can be opened**; unimplemented topics should appear as noninteractive education index or be withheld. Reuse category art where it semantically fits; don't commission another row of organ portraits. Each opened lens starts with explicit "Recorded observations" and separate "Explore the science" sections, not inferred personal health facts. Deep liver/renal etc only after supported evidence and role ownership are established.

### Timeline / BP-UI06 and Compare / BP-UI07
These are **new data/UX capabilities**, not artwork commissions. Build design references only if Architect authorizes; current repository already has dated activity/check-in/labs through canonical components. Timeline uses small existing icons with quiet date rails; never an automatic event-caused-event visualization. Compare uses linked small multiples **not dual-axis composite**; actual units, source dates, coverage and a no-comparison state. Reuse CHART-E source design motifs where independently accepted.

## 6. Production, acceptance and owner decisions

**Design release now:** BP-UI01, BP-UI03, BP-UI04, BP-UI05, BP-UI08, BP-UI09 **as paint/UI comps** using existing assets, provided Architect has selected eligible work. **Design conditional:** BP-UI02 (source-reviewed systems), BP-UI06 (timeline schema), BP-UI07 (valid cross-domain pairs). No new BVA original graphics requests at this stage.

For each designer package supply editable Figma/components (not raster-only mocks), labelled real-vs-placeholder asset manifest, before/after screenshots only if current same-build render actually captured, 390×844 + 1440×900 initial/default and selected states, 320/768 and 200% edge cases, four themes, loading/empty/error/noncomparable, complete focus/hover/selected/disabled states, tokens and spacing/redlines, keyboard/list/ARIA tabular chart alternatives, source/rights/clinical-status crosswalk and exact asset hashes.

**Architect decisions:** (a) whether new "Overview" becomes default while preserving explicit `?view=` links; (b) system lens supported memberships and privacy; (c) eligible global period/pinned metric scope; (d) real timeline event identity/date rules; (e) comparable cross-domain metric eligibility; (f) whether current My Biology directory requires any layout change. These are not approvals issued by this branding document.

**Code and runtime QA:** Preserve `BiologyHome`, `LabExplorer/LabTrend`, `FoodProgress`, `Progress`, `MicrobialProfile`, canonical record APIs, route links and consent/account cache separation. Actual current built browser screenshots at 390×844 and 1440×900 for default/selected/open sheets; 320/768/200%, four themes, reading order and source links; real AT and device separately NOT TESTED. **No source edits, deployment, asset production or independent UX/clinical sign-off claimed by this handoff.**

**Final brand decision:** The duo should become Bloom's signature atlas-and-observation experience using artwork already produced. Commission **zero** new graphics today. Invest the design effort in coherent, accessible premium interface composition, not speculative organs, scores or decorative dashboards.
