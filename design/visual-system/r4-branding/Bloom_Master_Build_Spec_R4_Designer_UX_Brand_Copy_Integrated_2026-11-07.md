# BLOOM — PREMIUM PRODUCTION MASTER BUILD SPEC (STRUCTURAL UX BASE R3)

**Prepared:** 2026-11-07  • **Version:** UX-R3-MASTER-BUILD-BASE  • **Scope:** seven experiences plus secondary routes and global shell  • **Status:** **COMPLETE STRUCTURAL BASE / DESIGNER & BRANDING FILL-IN OPEN / BUILD AUTHORIZED IN PARALLEL**

## 0. Authority, provenance and completion rules

**Purpose:** build a complete, warm, editorial, tactile, scientifically faithful consumer application, **not** another round of minor CSS tweaks. This document is the **Structural UX-led master build base** for the Graphic Designer to enrich with finished visual values, the Branding agent to enrich with approved copy, and the Chief Architect to reconcile into the authoritative release contract. **It does not claim final Designer/Architect signoff.**

**Source tiers:**
- **VERIFIED REPO:** directly inspected code on the moving `enhance/bloom-experience` branch on 2026-11-07; file existence, visible DOM/behavior only. This is **source verification**, not a deployed screenshot or functional test.
- **VERIFIED v2.3:** extracted verbatim from the corrected scoped Designer ZIP; changes in v2.4 must supersede these values explicitly.
- **OWNER DIRECTIVE / UX REQUIREMENT:** requirements from the owner's R2 and Today template and prior Structural UX handoffs; not claims of current implementation.
- **TO COMPLETE — [owner]:** value cannot yet be grounded. The responsible agent supplies an exact value, source, evidence and status. **No blank cells; no developer guessing.**

**Package:** `Bloom_Premium_Visual_v2_3_Corrected_Scoped(1).zip`, SHA-256 **`da0c576e509058749c0029b70634b542dddd9a023c3f971f88d62636eecbdf5a`**. Canonical stylesheet within archive: `Bloom_Premium_Visual_Implementation_Release_SCOPED/styles/bloom-visual-scoped.css`. Production assets in `assets/`, visual references in `references/`. **Reference PNG/SVG is not a captured application screen.** v2.3 CSS is opt-in under `.app-shell[data-bloom-visual="premium"]`. It has a focus-visible selector bug: nested app-shell in `:is(...)`; replace with the approved flat, scoped selector before use.

**Release interpretation:** The user's latest instruction is **implement now, do not create a stop-work gate**. Deliver Today reference-matched actual screenshots early for feedback while independent work on the remaining screens continues. Do not call a screen visually accepted until real captures and reviewers' decisions exist. A specific privacy, data-fidelity, accessibility or destructive-state defect stops **that faulty change**; it must not become an artificial blanket freeze. Architect records reconciliation against older R2 D2/D8 stop language.

**Existing source inventory (verified GitHub path / behavior, NOT a visual verdict):**

| Source file | Verified fact / scope |
|---|---|
| `client/src/pages/Dashboard.tsx` | Today page `.bloom-dashboard`, `.dashboard-heading`, `<TodayFocus>`, `<TodayFoodSummary>`, `<TodayStatus>`, disclosures |
| `client/src/components/TodayFocus.tsx` | `todayContextAction`, wellness choices, contextual CTAs, evidence and source states |
| `client/src/components/CompanionHero.tsx` | `.today-focus`, `.today-focus-heading`, `.today-focus-actions`, `.today-focus-reason`; current decorative icon present |
| `client/src/components/TodayFoodSummary.tsx` | `.flagship-nourishment`, recorded nutrients, unknown values, link to journal |
| `client/src/pages/LogMeal.tsx` | `/log-meal` editor, reviewing/saving, save receipt, reconciliation states |
| `client/src/components/FoodProgress.tsx` | Recorded food series with source-aware missingness, date positions, detail disclosure, error/retry |
| `client/src/pages/Microbiome.tsx` | Gut Reports main view, report history, selected record, methodological disclosures |
| `client/src/pages/Explore.tsx` | Research concepts, relationship cards, references, limitations |
| `client/src/pages/Progress.tsx` | Nutrition/Activity/Biology tabs, source values, profile-derived units; currently duplicate unit editors |
| `client/src/pages/AthleteWorkspace.tsx` | Planned/completed/cancelled sessions, sessions, fueling/hydration and recorded edits |
| `client/src/pages/Profile.tsx` | Profile/settings, saved measurements, privacy and settings disclosures |
| `client/src/components/AppNavigation.tsx` | Desktop navigation groups, Food journal and Profile destinations |
| `client/src/components/BottomNav.tsx` | Everyday 3 destinations (Today/My biology/Progress); Athlete 5 destinations |

**Not yet verified:** `/nutrition` implementing file, `/precision` page component exact path, global `.app-shell` owner, `workspace.css` actual source path/import order, feature-flag wiring, preview URL, full asset-to-target import mapping, rendered state of all seven views. **TO COMPLETE — Developer/Architect**, before writing imports or claiming reference parity.

### Cross-screen immutable contracts

1. **Three-second surface:** one primary takeaway, one obvious next action (or explicitly no safe action), then secondary context; deep scientific telemetry remains accessible via labeled sections/disclosures.
2. **Truth / sources:** unknown ≠ zero; no food log ≠ no food intake; estimated ≠ measured; general research ≠ personalized finding; reported provider scores ≠ microbial abundance; incompatible labs ≠ comparable trajectory; planned ≠ completed; unsaved ≠ saved; revoked/not connected ≠ connected.
3. **Actions:** preserve existing account-scoped fetches, retry and mutation semantics, idempotency, `If-Match` conflicts, import provenance, dates, units and receipt states. New visuals cannot rewrite computation, fabricate a metric or silently drop an action.
4. **Controls:** accessible name, ≥44×44 CSS px usable targets, focus visible, proper disabled reason, keyboard/touch parity, screen-reader status/alert, `aria-current`/`aria-pressed` where meaningful, semantic heading order.
5. **Source-aware loading:** source failed vs empty vs partial vs stale/refetching vs review-draft vs confirmed saved must be distinct and independently testable.
6. **Art:** decorative only, never a personal scientific observation; `alt="" aria-hidden="true"` on presentational `img`, pointer-events none on overlays; hide/reposition if competing with CTA, focus, source, unit, legend or errors at 320/390/768/1440, 200% zoom, dark/Athlete, forced-colors.
7. **Motion:** maximum three defined interactions for entrance/confirmation/chart drawing plus loading treatment; zero essential information communicated only by motion; `prefers-reduced-motion` suppresses nonessential animation.
8. **Design ownership:** Designer owns palette, visuals, typography, illustrated assets, atmosphere, icon artwork, CSS paint and final visual fidelity. Branding owns voice/keys; UX owns meaning and structural interactions; Architect owns conflicts and integration; Developer owns executable code/tests; User Review owns consumer perception.
9. **Legacy UI avoidance:** flatten nested cards where possible, not at the cost of semantic grouping; use visual dividers/whitespace and editorial compositions rather than isolated border rectangles for every fact.
10. **Theme isolation:** single canonical stylesheet, opt-in scope, no-style-flag parity, explicit Everyday light/dark and Athlete; do not infer unseen dark versions from a light mockup.

### Shared production tokens — v2.3 values, all new v2.4 changes Designer-owned

| Token/primitive | Verified current value / intended role | New version owner |
|---|---|---|
| `--bv-canvas` | `#F8F9F3` Everyday light page | Designer |
| `--bv-paper` | `#F5F3EB` light paper/gradient start | Designer |
| `--bv-porcelain` | `#FFFEFA` light raised surface | Designer |
| `--bv-forest` | `#173E32` primary text/surface contrast | Designer |
| `--bv-forest-strong` | `#102B25` primary heading | Designer |
| `--bv-brand` | `#246B50` interaction emphasis | Designer |
| `--bv-secondary` | `#52685C` supporting copy | Designer |
| `--bv-sage`, `--bv-mist` | `#D9E7D5`, `#EDF3EC` subdued layers | Designer |
| `--bv-clay`, `--bv-lilac` | `#D4A37C`, `#C9BDE3` declared but usage unresolved | **TO COMPLETE — Designer:** use or remove |
| `--bv-line`, `--bv-line-soft` | `rgba(23,62,50,.11)`, `.07` restrained separation | Designer |
| `--bv-shadow` | `0 12px 32px rgba(18,47,37,.065)` | Designer |
| `--bv-shadow-focus` | `0 20px 55px rgba(18,47,37,.11)` | Designer |
| `--bv-gradient`, `--bv-ambient` | v2.3 CSS formulas, see stylesheet | Designer |
| `--bv-focus` | `#14543B` light, other mode overrides in v2.3 CSS | Designer |
| `--bv-chart`, `--bv-grid` | chart source paint, overrides per theme | Designer |
| Hero/card/control radii | `.daily-welcome`/`.today-focus` 28px, `.bloom-panel` 26px, buttons/inputs 14px, summary tiles 20px; `.bv-editorial-hero` 32px | Designer to reconcile per component |
| `h1` typography | Georgia/Iowan Old Style serif, `clamp(30px,3.2vw,42px)`, 600, `1.16`, `-.03em` | **TO COMPLETE — Designer v2.4:** comprehensive h1–h3, card title, body + mono specs, load strategy |
| Numerals | `.bv-telemetry-display [data-value]`: 600 36px/40px `ui-monospace,SFMono-Regular,Consolas,monospace`, tabular-nums | Designer |
| Modes | `html.dark` and `html[data-experience="athlete"]` variable overrides exist in v2.3 | Designer to certify contrast and precedence |
| Focus CSS | current `:is(button, .app-shell[...] a, ...)` nesting is defective | Developer applies exact approved flat selector; Designer verifies paint |
| State classes | `.bv-state-loading`, `.bv-state-empty`, `.bv-state-partial`, `.bv-state-error`, `.bv-state-review`, `.bv-state-research` | Designer v2.4 shimmer + reduced motion, UX semantic wiring |
| Verified asset inventory | `botanical-orbit.svg`, `ingredient-oats.svg`, `ingredient-berries.svg`, `organism-concept.svg`, `molecular-educational.svg`, `athlete-motion.svg`, `empty-journal.svg` | Designer art slot placements; Dev copy+hash |

### Shared navigation / shell / mobile

| Property | 1440 desktop | 390 mobile | 320/768 and other states |
|---|---|---|---|
| App shell | existing `.app-shell`, existing `.workspace-sidebar` and `.bloom-header` **VERIFIED selectors in v2.3, owner location TO COMPLETE — Developer** | header + `.bloom-bottom-nav` **VERIFIED source** | TO COMPLETE — Designer geometry, sticky behavior, safe-area |
| Nav contents | existing named groups and links; no routes removed | Everyday Today / My biology / Progress; Athlete Training / Fueling / Journal / Recovery / Compete | UX recommendation: retain existing nav, make Food entry prominent on Today/header, Profile reachable in ≤2 obvious actions; test Athlete 5 at 320 |
| Width / outer gutters | **TO COMPLETE — Designer:** explicit max width and x-padding px | **TO COMPLETE — Designer:** explicit x-padding px | 200% zoom reflow; no horizontal scroll except data tables |
| Header chrome | **TO COMPLETE — Designer:** display, spacing, icon treatment | **TO COMPLETE — Designer:** size, back/menu, CTA position | No nav icon conveys meaning without label |
| Focus and reading order | semantic page h1→takeaway→CTA→details | same DOM order; visual reflow may not reverse meaning | no focus trap from decorative overlays |

### Shared art-slot verification matrix

| Art file | Proposed route / purpose (not final placement) | Existing anchor source | Designer assignment still needed | Required test |
|---|---|---|---|---|
| `botanical-orbit.svg` | Today editorial hero | `CompanionHero.tsx` `.today-focus` | TO COMPLETE — Designer: x/y size, crop, dark/athlete, reserved text | art/CTA nonoverlap |
| `ingredient-oats.svg` | Food ingredient editorial (not food actually eaten) | `LogMeal.tsx` | TO COMPLETE — Designer: placement, states | never mistaken for logged entry |
| `ingredient-berries.svg` | Today inspiration or Food illustration | Dashboard / LogMeal | TO COMPLETE — Designer | not rendered as recommendation evidence |
| `organism-concept.svg` | Gut/biology learning illustration | `Microbiome.tsx` | TO COMPLETE — Designer | clearly generic illustration |
| `molecular-educational.svg` | Explore research context | `Explore.tsx` | TO COMPLETE — Designer | not personalized finding |
| `athlete-motion.svg` | Athlete hero / non-data motion art | `AthleteWorkspace.tsx` | TO COMPLETE — Designer | no overlap with session status |
| `empty-journal.svg` | Food/Today first-use empty state | `TodayFoodSummary.tsx`, `LogMeal.tsx` | TO COMPLETE — Designer | only confirmed empty logs |

**Art-slot implementation contract:** Designer supplies a row per placement with verified anchor selector, src, dimensions at 1440/390, reserved prose width, 320/768 and zoom behavior, forced-colors behavior, and exact CSS under the scoped app shell. A CSS `::before`/`::after` is preferred where safe; otherwise exactly one `img` with empty alt and aria-hidden at the approved structural position. UX records `PASS/FAIL/NOT TESTED` per slot after real renders; no theoretical PASS.

### Canonical cross-screen copy-key and state schema

| Key pattern | Required semantics | Owner |
|---|---|---|
| `<route>.h1`, `.takeaway`, `.primary`, `.section.<id>` | human, action-oriented, nonclinical but truthful; route name not mandatory h1 text | Branding; UX meaning review |
| `<route>.empty`, `.partial`, `.loading`, `.error`, `.retry` | named data source and exact known/unknown distinction; error≠empty | Branding / UX |
| `<route>.review.unsaved`, `.save.pending`, `.save.confirmed`, `.save.error`, `.conflict` | no false receipt; clear next action | Branding / UX / Developer |
| `<route>.source`, `.research.limit`, `.methods`, `.more` | quiet source provenance once per section, not every card | Branding / UX |
| `<route>.athlete`, `.mode` | only when content actually depends on mode | Branding / UX |

**All Branding strings below are `TO COMPLETE — Branding`** unless marked `EXISTING RUNTIME`, which means generated dynamically from current application behavior and may be edited for tone only without changing meaning. A reference headline is never automatically approved marketing copy.

### Shared accessibility & visual QA acceptance

Test across 320/390/768/1440 CSS px; mobile dark, Everyday light/dark, Athlete; 200% zoom; keyboard-only; forced-colors; reduced-motion. Document touch target ≥44px, headings, landmarks, error focus/retry, input labeling, contrast measured with final paint, no artificial sources/data, meaningful source/readiness qualifiers, RTL/long string wrapping if supported, safe areas and scroll. **TO COMPLETE — Developer:** actual screenshots with SHA and fixtures. **TO COMPLETE — Designer:** reference-to-actual numbered punch lists + measured contrast. **TO COMPLETE — User Review:** 3-second consumer quality impression. **TO COMPLETE — Architect:** final disposition.

### Implementation sequence (not a blanket gate)

| Sequence | Action | Owner | Evidence |
|---|---|---|---|
| 0 | freeze SHA/preview, inventory CSS/app-shell/current routes and v2.3 hash | Architect + Developer | exact commit, import graph |
| 1 | import original art/scoped CSS, apply focus fix, enforce flag parity | Developer | src-to-target hashes, no-flag screenshots |
| 2 | implement Today as first full live vertical slice and capture same-fixture 390/1440 | Developer | actual before/after captures |
| 3 | review Today rapidly, issue consolidated punch list; **continue independent work** | Owner / Designer / UX / User Review | written notes; not an overall stop |
| 4 | parallel design v2.4 type/art and Branding copy; feed incremental approved values | Designer / Branding / Architect | versioned manifest/keys |
| 5 | complete Food, Biology/Gut, Explore, Progress, Athlete, Profile | Developer | individual screenshot/test PR entries |
| 6 | render/repair full matrix; sign all seven | Designer, UX, User Review, Architect | real screenshot parity, state QA |

**Definition of done:** all seven views and secondary routes in this document implemented at documented SHA; no `TO COMPLETE` in approved production cells, or explicit Architect-approved nonblocking exception with exact owner/date; verified source/asset mapping; real runtime screenshots match references in composition with no scientific/provenance regression; sign-offs recorded. **Do not declare this master spec or application “fully approved” merely because this file is complete.**

---

# 1. Today — complete screen build contract

## 1. Header

| Field | Value | Evidence / owner |
| --- | --- | --- |
| Screen / routes | Today — / | Verified route mapping where source explicitly observed; remaining route aliases TO COMPLETE — Developer |
| Mockup reference | references/today-desktop.png; references/today-mobile.png | DESIGN REFERENCE ONLY; not live screen |
| Repo / branch / frozen SHA | `knagle-max/BloomGutHealth` / `enhance/bloom-experience`; **TO COMPLETE — Architect** exact frozen SHA + PR + preview URL | moving source inspected 2026-11-07 |
| Component mapping | `client/src/pages/Dashboard.tsx` + `TodayFocus.tsx`, `CompanionHero.tsx`, `TodayFoodSummary.tsx`, `TodayStatus` (import in Dashboard; exact source TO COMPLETE — Developer) | Verified noted paths; additional import chain TO COMPLETE — Developer |
| Fixture IDs | TODAY-FIRST, TODAY-RECORDED, TODAY-PARTIAL, TODAY-CHOSEN, TODAY-PAUSED, TODAY-FAILED, TODAY-ATHLETE | UX defined synthetic scenarios; Dev implements + captures |
| Spec ownership | Designer = visual; Branding = copy; UX = semantics/flows; Architect = reconciliation; Developer = exact repo mapping | Owner R2 |
| Status | STRUCTURAL DRAFT / TO COMPLETE — Designer final paint / TO COMPLETE — Branding copy / TO COMPLETE — Architect signoff / NOT TESTED visually | No fabricated approval |

## 2. Tokens used

| Token / style | Verified value / instruction | Application on this screen | Owner |
| --- | --- | --- | --- |
| Page / primary surface | `--bv-canvas #F8F9F3`, `--bv-porcelain #FFFEFA`, `--bv-paper #F5F3EB` (Everyday light v2.3) | page, selected light raised region; dark/athlete via token overrides | Designer |
| Text / CTA | `--bv-forest #173E32`, `--bv-forest-strong #102B25`, `--bv-secondary #52685C`, `--bv-brand #246B50` | headlines, supporting copy, primary action | Designer verifies AA |
| Tint / highlight | `--bv-mist #EDF3EC`, `--bv-sage #D9E7D5`; clay/lilac declared but placement unresolved | selected editorial and empty surfaces | TO COMPLETE — Designer explicit placement or deletion of unused tokens |
| Border / elevation | `--bv-line rgba(23,62,50,.11)`; `--bv-shadow 0 12px 32px rgba(18,47,37,.065)` | subtle high-level separation, not every fact | Designer |
| Radii | v2.3 hero 28 or `.bv-editorial-hero` 32; cards 26/28; buttons/inputs 14 | exact primitive variant TO COMPLETE — Designer | Designer |
| Display face | v2.3 h1 Georgia/Iowan; h2 not fully specified | h1–h3 and card titles | TO COMPLETE — Designer v2.4 font family/weights/loading |
| Body / mono | body: TO COMPLETE — Designer; mono v2.3 `ui-monospace,SFMono-Regular,Consolas,monospace` for telemetry | body and precise numerals | Designer |
| State + focus | v2.3 `.bv-state-*`; `--bv-focus` light #14543B; focus CSS requires fix | loading, partial, error, review, research, keyboard focus | Developer CSS correction, Designer paint |
| Art asset | see section 5 below | decorative non-data slots | Designer + UX |

## 3. Layout

Warm, contextual next step with a single contextual primary CTA; today’s recorded food snapshot; inspiring exploration only as editorial context, never presented as personal evidence.

Desktop: page heading/date then editorial hero and recorded journal/secondary exploration region; exact grid columns/ratio/max-width/gap TO COMPLETE — Designer. Mobile: single column page heading → contextual hero/CTA → journal; ingredient inspiration after actionable content. Maintain DOM order.

| Layout metric | Desktop 1440 | Mobile 390 | At 320/768, zoom and owner |
| --- | --- | --- | --- |
| Main max width / gutters | TO COMPLETE — Designer exact max-width + side gutter px | TO COMPLETE — Designer exact left/right padding px | Designer provide responsive clamps; Dev verify |
| Columns / composition | TO COMPLETE — Designer exact grid template + proportion, matched to reference | one reading order preserving DOM; exact layout TO COMPLETE — Designer | UX confirms action comes first |
| Section rhythm | TO COMPLETE — Designer exact vertical spacing tokens px | TO COMPLETE — Designer exact vertical spacing tokens px | Designer |
| Text line length | TO COMPLETE — Designer primary text max-width and title wrap | TO COMPLETE — Designer narrow title and body breakpoints | Designer; no clipping 200% zoom |
| Header/sidebar/bottom nav | existing `.workspace-sidebar`/`.bloom-header`; exact widths TO COMPLETE | existing `.bloom-bottom-nav`; route-appropriate item count | Designer + Architect nav paint; UX action clarity |
| Sticky/fixed elements | TO COMPLETE — Designer/Developer verified placement | TO COMPLETE — Designer/Developer safe-area and interaction clearance | UX verifies no CTA obscured |

## 4. Element map — visible DOM order

| # | Visible element | Existing component / selector | Content & source | Style / shape / spacing | Mobile behavior |
| --- | --- | --- | --- | --- | --- |
| 1 | Date/eyebrow | Dashboard `.dashboard-heading .eyebrow`, `.date-pill` | date from app; `today.eyebrow` Branding | small uppercase eyebrow; no clinical claim; visual color/spacing dimensions TO COMPLETE — Designer | same order, truncate only nonessential metadata; 320/zoom collision TO TEST — UX |
| 2 | Page h1 | Dashboard `<h1>` | `today.h1` Branding; date/time based current context | Designer h1 serif; refer v2.3 typography; visual color/spacing dimensions TO COMPLETE — Designer | wrap naturally, 3 lines desirable not truncation; 320/zoom collision TO TEST — UX |
| 3 | Takeaway | Dashboard heading or added approved slot (TO COMPLETE — Developer) | `today.takeaway` Branding | supporting copy, max width TO COMPLETE — Designer; visual color/spacing dimensions TO COMPLETE — Designer | no layout shift beyond hero; 320/zoom collision TO TEST — UX |
| 4 | Hero eyebrow/label | CompanionHero `.today-focus-heading .eyebrow` | existing `eyebrow` or `today.focusLabel` | small editorial label; visual color/spacing dimensions TO COMPLETE — Designer | retain label and heading; 320/zoom collision TO TEST — UX |
| 5 | Contextual hero title | CompanionHero `.today-focus-heading h2` | `TodayFocus` derived `todayContextAction`/chosen wellness action | Designer serif h2; visual color/spacing dimensions TO COMPLETE — Designer | retain dynamic width; 320/zoom collision TO TEST — UX |
| 6 | Hero reason | `.today-focus-reason` | `TodayFocus` reason from context, sources, state | supporting copy; visual color/spacing dimensions TO COMPLETE — Designer | full text readable; 320/zoom collision TO TEST — UX |
| 7 | Primary contextual CTA | `.today-focus-actions` | `TodayFocus` action link/button; eligible chosen action or Add food | brand action paint Designer; visual color/spacing dimensions TO COMPLETE — Designer | full-width or appropriately sized ≥44px; 320/zoom collision TO TEST — UX |
| 8 | Secondary actions | TodayFocus `.today-focus-actions` + evidence links | actual links from flow; no new actions | lower emphasis; visual color/spacing dimensions TO COMPLETE — Designer | below primary; 320/zoom collision TO TEST — UX |
| 9 | Hero illustration | existing CompanionHero `.today-focus-icon` OR dedicated approved art slot | decorative only | botanical-orbit/berries: TO COMPLETE — Designer choice, placement; visual color/spacing dimensions TO COMPLETE — Designer | hide if CTA space constrained; 320/zoom collision TO TEST — UX |
| 10 | Journal heading | TodayFoodSummary `.flagship-section-heading` | confirmed saved meal summary | serif section title Designer; visual color/spacing dimensions TO COMPLETE — Designer | below hero; 320/zoom collision TO TEST — UX |
| 11 | Journal metrics | TodayFoodSummary `.flagship-recorded-energy`, `.flagship-macros` | real saved `dailyMealSummary`; unknown ≠ 0 | mono values; inline separator not nested box; visual color/spacing dimensions TO COMPLETE — Designer | readable unit/partial; 320/zoom collision TO TEST — UX |
| 12 | Status / partial / error | `TodayStatus` + TodayFoodSummary sources | source-aware load states | state classes Designer; visual color/spacing dimensions TO COMPLETE — Designer | error not hidden behind art; 320/zoom collision TO TEST — UX |
| 13 | Why this? | TodayFocus `details.today-focus-evidence` | evidence and limitation from saved context or generic statement | quiet provenance once per section; visual color/spacing dimensions TO COMPLETE — Designer | summary ≥44px; 320/zoom collision TO TEST — UX |
| 14 | Nutrition details | Dashboard `details.today-nutrition` | recorded data source | flatten into dividers; visual color/spacing dimensions TO COMPLETE — Designer | remains reachable; 320/zoom collision TO TEST — UX |
| 15 | Inspiration/ingredients | Dashboard lower editorial area; exact anchor TO COMPLETE — Developer | research/inspiration only; `today.inspiration.*` Branding | art-friendly tiles; avoid fake personalized guidance; visual color/spacing dimensions TO COMPLETE — Designer | after useful actions; 320/zoom collision TO TEST — UX |
| 16 | Header + sidebar/mobile nav | `.bloom-header`, `.workspace-sidebar`, `.bloom-bottom-nav` | existing navigation | Designer v2.4 chrome; visual color/spacing dimensions TO COMPLETE — Designer | bottom nav no obscured CTA; 320/zoom collision TO TEST — UX |

## 5. Art assets & safety

Hero: `botanical-orbit.svg` OR `ingredient-berries.svg` — TO COMPLETE — Designer selected asset and anchored slot. First-use journal: `empty-journal.svg` when empty confirmed. Brand/sidebar icons: TO COMPLETE — Designer finished icon set. All assets are decorative; do not imply measurement.

| Field | Value | Owner / test |
| --- | --- | --- |
| Art file/path | Asset(s) in statement above; **TO COMPLETE — Designer** final mapping to `client/public/brand/visual-v2/<asset>` | Designer specifies; Dev verifies src/target SHA-256 |
| Desktop slot, size, reserved text | TO COMPLETE — Designer: verified selector + x/y + CSS size + text reserved width | Developer validates live anchor; UX overlap check |
| 390/320/768 mobile | TO COMPLETE — Designer: reposition, scaling, clipping and if hidden | UX checks primary action, facts and source still visible |
| Theme/contrast/forced-colors | TO COMPLETE — Designer: Everyday light/dark, Athlete, high contrast, reduced motion | UX verifies semantics unaffected |
| Accessibility | Decoration only; empty alt + aria-hidden on `img`, noninteractive pointer events; never scientific chart data | UX requirement; Developer tests |

## 6. States & fixture contract

| Fixture / state | Input scenario | Expected content and interaction | Visual treatment / owner |
| --- | --- | --- | --- |
| TODAY-FIRST | no meals saved; journal source success | contextual Add food and truthful empty journal; no zero-intake inference | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| TODAY-RECORDED | saved meal(s), all available known amounts | recorded summary and context-derived action; no stale values | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| TODAY-PARTIAL | at least one unknown nutrient | unknown represented unavailable; partial status remains explicit | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| TODAY-CHOSEN | eligible selected wellness action | Try this / action follow-through reflected; evidence accessible | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| TODAY-PAUSED | user pauses/skips suggestion | restore action; paused is not cancelled data | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| TODAY-FAILED | one source errors; other sources may succeed | source-specific error/retry, no false empty state | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| TODAY-ATHLETE | Athlete mode with planned session | contextual fueling/session guidance; planned ≠ completed | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |

## 7. Copy table — complete key inventory / ownership

| Key | String | Meaning constraints | Owner |
| --- | --- | --- | --- |
| today.eyebrow | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.h1 | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.takeaway | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.focusLabel | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.journal.empty | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.journal.partial | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.journal.loading | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.journal.error | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.retry | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.why | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.inspiration.heading | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.source | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.action.paused | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.action.restore | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.session.planned | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| today.research.limit | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |

**Quiet provenance:** one source/date/method disclosure at the nearest meaningful section boundary, not repeated `Source:` on each metric. **TO COMPLETE — Branding** exact phrasing and slot length; **TO COMPLETE — UX** meaning approval. User-provided original labels and units remain intact.

## 8. Motion

Hero entrance, 1 subtle transition; loading shimmer only while unresolved; saved food confirmation after actual mutation. TO COMPLETE — Designer timing/easing and reduced motion.

| Interaction | Behavior | Duration / easing | Reduced motion |
| --- | --- | --- | --- |
| Hero/entry | Designer defines one unobtrusive introduction on real load | TO COMPLETE — Designer ms + easing | static |
| Loading placeholder | v2.3 has gradient state but missing animation; do not imply complete until source resolves | TO COMPLETE — Designer shimmer @keyframes | static styled region |
| Saved confirmation/chart (if applicable) | only when real saved receipt or actual plotted data exists | TO COMPLETE — Designer ms + easing | immediate state change |

## 9. Accessibility, scientific fidelity and failure checks

| Check | Acceptance criterion | Owner / status |
| --- | --- | --- |
| Contrast | Designer measures body, secondary, CTA, chart/legend, error and focus pairs in light, dark and Athlete (AA applicable); gradients sampled where text lies | TO COMPLETE — Designer, actual measurements |
| Keyboard/touch | 44×44 targets, tab sequence matches reading order, correct headings and accessible names, focused CTA not blocked | TO TEST — UX / Developer |
| Responsive | 320/390/768/1440 CSS px, 200% zoom, forced-colors, reduced-motion, no critical horizontal overflow | TO TEST — Developer / UX |
| Source truth | unknown/partial/errors/method/source and account scope as described in section 6; no fake metrics | TO TEST — Developer / UX / Biology |
| Decorative collision | art cannot overlap CTA, unit, source, error, legend, label, disclosure or focus outline | TO TEST — UX |
| Loading/error | honest source-specific states, retry without destroying local unsaved work | TO TEST — UX / Developer |

## 10. Parity check — actual application versus design reference

1. Developer captures **BEFORE ACTUAL APP** and **AFTER ACTUAL APP** at matched synthetic fixture, 390/1440, at least light/dark and relevant Athlete; 320/768 and 200% zoom in risk states. Preserve repo, SHA, preview, route, CSS viewport, DPR, mode, locale, timezone/date, fixture and state in screenshot filename or metadata.
2. Designer reviews against the named **DESIGN REFERENCE** and sends numbered punch list by element #, expected/actual, severity, affected breakpoint and screenshot evidence.
3. Developer corrects coherent set, re-renders and records deviations. UX separately checks states and keyboard/touch. User Review checks consumer/premium experience.
4. Owner sees genuine Today checkpoint promptly, **without preventing independent remaining screen implementation**; final owner/Architect accept after all seven are live.
5. **Current parity status: NOT TESTED / evidence TO COMPLETE — Developer.**

## 11. Completion checklist / signature ledger

- [ ] All TO COMPLETE items either filled with exact evidence or Architect-approved nonblocking exception
- [ ] Every element selector and importing file verified at frozen SHA
- [ ] All selected SVG files copied with SHA-256 source-to-target proof
- [ ] No extra unapproved CTA, metric, medical claim or layout meaning change
- [ ] Copy keys fully populated, Branding approved, UX meaning checked
- [ ] Designer typography/art/spacing and mobile references complete
- [ ] All fixture states tested under light/dark/Athlete as applicable
- [ ] Real screenshot parity and Designer punch list resolved
- [ ] Accessibility at 320/390/768/1440, 200% zoom, keyboard, reduced motion
- [ ] Developer build/test summary and preserved data/consent paths
- [ ] Independent User Review consumer-quality decision
- [ ] Architect documented resolution of all conflicts and final signoff

| Review lane | Current status | Required evidence |
| --- | --- | --- |
| Structural UX | SPEC WRITTEN; IMPLEMENTATION NOT TESTED | signed fixture/slot matrix |
| Designer | TO COMPLETE | v2.4 full paint and screenshot match |
| Branding | TO COMPLETE | approved copy key/value table |
| Developer | TO COMPLETE | repo path hashes, compiled app/tests/screenshots |
| Independent User Review | TO COMPLETE | live 3-second premium assessment |
| Architect | TO COMPLETE | D1–D8 and merge decision |
| Owner | TO COMPLETE | Today and final real screenshot decisions |

**Per-screen flatten instruction:** Flatten Today nutrition nested panels and ingredient mini-cards into open editorial grouping/dividers; retain distinct semantic regions, existing action hierarchy and details.

---

# 2. Food / food journal — complete screen build contract

## 1. Header

| Field | Value | Evidence / owner |
| --- | --- | --- |
| Screen / routes | Food / food journal — /log-meal; /nutrition; related saved meal paths | Verified route mapping where source explicitly observed; remaining route aliases TO COMPLETE — Developer |
| Mockup reference | references/food-desktop.png; mobile Food reference TO COMPLETE — Designer v2.4 | DESIGN REFERENCE ONLY; not live screen |
| Repo / branch / frozen SHA | `knagle-max/BloomGutHealth` / `enhance/bloom-experience`; **TO COMPLETE — Architect** exact frozen SHA + PR + preview URL | moving source inspected 2026-11-07 |
| Component mapping | `client/src/pages/LogMeal.tsx` VERIFIED; `/nutrition` page file TO COMPLETE — Developer; `FoodProgress.tsx` also used in Progress | Verified noted paths; additional import chain TO COMPLETE — Developer |
| Fixture IDs | FOOD-FIRST, FOOD-TYPING, FOOD-REVIEW, FOOD-PARTIAL, FOOD-SAVING, FOOD-SAVED, FOOD-SAVE-FAIL, FOOD-CONFLICT, FOOD-JOURNAL | UX defined synthetic scenarios; Dev implements + captures |
| Spec ownership | Designer = visual; Branding = copy; UX = semantics/flows; Architect = reconciliation; Developer = exact repo mapping | Owner R2 |
| Status | STRUCTURAL DRAFT / TO COMPLETE — Designer final paint / TO COMPLETE — Branding copy / TO COMPLETE — Architect signoff / NOT TESTED visually | No fabricated approval |

## 2. Tokens used

| Token / style | Verified value / instruction | Application on this screen | Owner |
| --- | --- | --- | --- |
| Page / primary surface | `--bv-canvas #F8F9F3`, `--bv-porcelain #FFFEFA`, `--bv-paper #F5F3EB` (Everyday light v2.3) | page, selected light raised region; dark/athlete via token overrides | Designer |
| Text / CTA | `--bv-forest #173E32`, `--bv-forest-strong #102B25`, `--bv-secondary #52685C`, `--bv-brand #246B50` | headlines, supporting copy, primary action | Designer verifies AA |
| Tint / highlight | `--bv-mist #EDF3EC`, `--bv-sage #D9E7D5`; clay/lilac declared but placement unresolved | selected editorial and empty surfaces | TO COMPLETE — Designer explicit placement or deletion of unused tokens |
| Border / elevation | `--bv-line rgba(23,62,50,.11)`; `--bv-shadow 0 12px 32px rgba(18,47,37,.065)` | subtle high-level separation, not every fact | Designer |
| Radii | v2.3 hero 28 or `.bv-editorial-hero` 32; cards 26/28; buttons/inputs 14 | exact primitive variant TO COMPLETE — Designer | Designer |
| Display face | v2.3 h1 Georgia/Iowan; h2 not fully specified | h1–h3 and card titles | TO COMPLETE — Designer v2.4 font family/weights/loading |
| Body / mono | body: TO COMPLETE — Designer; mono v2.3 `ui-monospace,SFMono-Regular,Consolas,monospace` for telemetry | body and precise numerals | Designer |
| State + focus | v2.3 `.bv-state-*`; `--bv-focus` light #14543B; focus CSS requires fix | loading, partial, error, review, research, keyboard focus | Developer CSS correction, Designer paint |
| Art asset | see section 5 below | decorative non-data slots | Designer + UX |

## 3. Layout

Fast entry → parsed candidate → identity and quantity review → explicit save → verified persisted receipt → corrections and history. Expose nutrient coverage without falsely completing unknown values.

Desktop: hero/editorial entry alongside review/history only where it preserves step order; exact grid TO COMPLETE — Designer. Mobile: one active task first, entry/review/save, then record navigation. Forms are task-centered, not stacked administrative cards.

| Layout metric | Desktop 1440 | Mobile 390 | At 320/768, zoom and owner |
| --- | --- | --- | --- |
| Main max width / gutters | TO COMPLETE — Designer exact max-width + side gutter px | TO COMPLETE — Designer exact left/right padding px | Designer provide responsive clamps; Dev verify |
| Columns / composition | TO COMPLETE — Designer exact grid template + proportion, matched to reference | one reading order preserving DOM; exact layout TO COMPLETE — Designer | UX confirms action comes first |
| Section rhythm | TO COMPLETE — Designer exact vertical spacing tokens px | TO COMPLETE — Designer exact vertical spacing tokens px | Designer |
| Text line length | TO COMPLETE — Designer primary text max-width and title wrap | TO COMPLETE — Designer narrow title and body breakpoints | Designer; no clipping 200% zoom |
| Header/sidebar/bottom nav | existing `.workspace-sidebar`/`.bloom-header`; exact widths TO COMPLETE | existing `.bloom-bottom-nav`; route-appropriate item count | Designer + Architect nav paint; UX action clarity |
| Sticky/fixed elements | TO COMPLETE — Designer/Developer verified placement | TO COMPLETE — Designer/Developer safe-area and interaction clearance | UX verifies no CTA obscured |

## 4. Element map — visible DOM order

| # | Visible element | Existing component / selector | Content & source | Style / shape / spacing | Mobile behavior |
| --- | --- | --- | --- | --- | --- |
| 1 | Route h1 and takeaway | LogMeal `.meal-page-heading h1`, `.muted` | `food.h1`, `food.takeaway` Branding | Designer serif title; visual color/spacing dimensions TO COMPLETE — Designer | first viewport; 320/zoom collision TO TEST — UX |
| 2 | Entry method | LogMeal meal editor/input chooser; exact selectors TO COMPLETE — Developer | real text/photo/structured workflows only if supported | open task region; visual color/spacing dimensions TO COMPLETE — Designer | large touch target; 320/zoom collision TO TEST — UX |
| 3 | Input and portion | existing form selectors TO COMPLETE — Developer | draft description, portions, date, servings | accessible labeled field; visual color/spacing dimensions TO COMPLETE — Designer | single column; 320/zoom collision TO TEST — UX |
| 4 | Interpretation status | candidate parser/meal record; verify implementation contract | candidate vs accepted, parse source, confidence if available | visually differentiated; visual color/spacing dimensions TO COMPLETE — Designer | not mistaken for saved; 320/zoom collision TO TEST — UX |
| 5 | Ingredient review | LogMeal review section, verify actual anchor | real proposed items, unknown nutrition marked | dividers instead of individual cards; visual color/spacing dimensions TO COMPLETE — Designer | scrollable without CTA loss; 320/zoom collision TO TEST — UX |
| 6 | Manual correction | verified edit affordance TO COMPLETE — Developer | user-entered values retained | form with validation; visual color/spacing dimensions TO COMPLETE — Designer | no hidden confirm; 320/zoom collision TO TEST — UX |
| 7 | Nutrient summary | `.saved-nutrients` and source amount helpers | real energy/protein/carbs/fat coverage | mono numbers, units; visual color/spacing dimensions TO COMPLETE — Designer | inline grid that wraps; 320/zoom collision TO TEST — UX |
| 8 | Review/save CTA | existing mutation/button anchors TO COMPLETE — Developer | save explicitly, disabled with reason while pending | highest action prominence during review; visual color/spacing dimensions TO COMPLETE — Designer | ≥44px fixed within flow; 320/zoom collision TO TEST — UX |
| 9 | Saving / receipt | LogMeal `.saved-meal`, `role=status` | server-confirmed record only | positive receipt style; visual color/spacing dimensions TO COMPLETE — Designer | focus receipt; 320/zoom collision TO TEST — UX |
| 10 | Saved meal detail | `.confirmation-source` disclosure | recorded foods, original text, corrections | quiet section source; visual color/spacing dimensions TO COMPLETE — Designer | easy to expand; 320/zoom collision TO TEST — UX |
| 11 | History/journal link | navigation `/nutrition`, saved meals | user-owned saved entries | editorial list; visual color/spacing dimensions TO COMPLETE — Designer | below entry; 320/zoom collision TO TEST — UX |
| 12 | First-use art | approved art slot near chooser only | `empty-journal.svg` or oats | art does not mimic saved meal; visual color/spacing dimensions TO COMPLETE — Designer | hide during review/error; 320/zoom collision TO TEST — UX |
| 13 | Source uncertainty | nutrition coverage and parser/lookup errors | unknown≠0, estimated≠measured | partial/error states; visual color/spacing dimensions TO COMPLETE — Designer | visible ahead save; 320/zoom collision TO TEST — UX |

## 5. Art assets & safety

`ingredient-oats.svg`, `ingredient-berries.svg` may support editorial food intro; `empty-journal.svg` for genuinely empty records. TO COMPLETE — Designer art-slot table (exact anchor, dimensions, no misleading food entry).

| Field | Value | Owner / test |
| --- | --- | --- |
| Art file/path | Asset(s) in statement above; **TO COMPLETE — Designer** final mapping to `client/public/brand/visual-v2/<asset>` | Designer specifies; Dev verifies src/target SHA-256 |
| Desktop slot, size, reserved text | TO COMPLETE — Designer: verified selector + x/y + CSS size + text reserved width | Developer validates live anchor; UX overlap check |
| 390/320/768 mobile | TO COMPLETE — Designer: reposition, scaling, clipping and if hidden | UX checks primary action, facts and source still visible |
| Theme/contrast/forced-colors | TO COMPLETE — Designer: Everyday light/dark, Athlete, high contrast, reduced motion | UX verifies semantics unaffected |
| Accessibility | Decoration only; empty alt + aria-hidden on `img`, noninteractive pointer events; never scientific chart data | UX requirement; Developer tests |

## 6. States & fixture contract

| Fixture / state | Input scenario | Expected content and interaction | Visual treatment / owner |
| --- | --- | --- | --- |
| FOOD-FIRST | authenticated user with no saved meals | show entry CTA and empty visual only after confirmed empty | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| FOOD-TYPING | draft input unsaved | retain draft; no saved claim | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| FOOD-REVIEW | parsed candidate needs item/portion review | edit/correct identity; flag unknown estimates | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| FOOD-PARTIAL | one or more nutrient totals undefined | partially known totals; do not invent macros | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| FOOD-SAVING | mutation pending | disable duplicate saves, preserve editing state | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| FOOD-SAVED | verified server receipt | saved confirmation and source detail | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| FOOD-SAVE-FAIL | network/mutation error | draft persists, retry safely | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| FOOD-CONFLICT | existing record revised elsewhere | clear conflict resolution, no overwrite | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| FOOD-JOURNAL | saved history viewed/edited | revisions, date, source available | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |

## 7. Copy table — complete key inventory / ownership

| Key | String | Meaning constraints | Owner |
| --- | --- | --- | --- |
| food.h1 | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.takeaway | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.entry.label | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.entry.placeholder | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.review.heading | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.review.unsaved | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.unknown | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.partial | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.save | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.saving | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.saved.receipt | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.error | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.retry | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.conflict | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.source | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| food.empty | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |

**Quiet provenance:** one source/date/method disclosure at the nearest meaningful section boundary, not repeated `Source:` on each metric. **TO COMPLETE — Branding** exact phrasing and slot length; **TO COMPLETE — UX** meaning approval. User-provided original labels and units remain intact.

## 8. Motion

Loading shimmer while parsing, gentle saved confirmation only after receipt. No pulsing uncertainty marker. TO COMPLETE — Designer.

| Interaction | Behavior | Duration / easing | Reduced motion |
| --- | --- | --- | --- |
| Hero/entry | Designer defines one unobtrusive introduction on real load | TO COMPLETE — Designer ms + easing | static |
| Loading placeholder | v2.3 has gradient state but missing animation; do not imply complete until source resolves | TO COMPLETE — Designer shimmer @keyframes | static styled region |
| Saved confirmation/chart (if applicable) | only when real saved receipt or actual plotted data exists | TO COMPLETE — Designer ms + easing | immediate state change |

## 9. Accessibility, scientific fidelity and failure checks

| Check | Acceptance criterion | Owner / status |
| --- | --- | --- |
| Contrast | Designer measures body, secondary, CTA, chart/legend, error and focus pairs in light, dark and Athlete (AA applicable); gradients sampled where text lies | TO COMPLETE — Designer, actual measurements |
| Keyboard/touch | 44×44 targets, tab sequence matches reading order, correct headings and accessible names, focused CTA not blocked | TO TEST — UX / Developer |
| Responsive | 320/390/768/1440 CSS px, 200% zoom, forced-colors, reduced-motion, no critical horizontal overflow | TO TEST — Developer / UX |
| Source truth | unknown/partial/errors/method/source and account scope as described in section 6; no fake metrics | TO TEST — Developer / UX / Biology |
| Decorative collision | art cannot overlap CTA, unit, source, error, legend, label, disclosure or focus outline | TO TEST — UX |
| Loading/error | honest source-specific states, retry without destroying local unsaved work | TO TEST — UX / Developer |

## 10. Parity check — actual application versus design reference

1. Developer captures **BEFORE ACTUAL APP** and **AFTER ACTUAL APP** at matched synthetic fixture, 390/1440, at least light/dark and relevant Athlete; 320/768 and 200% zoom in risk states. Preserve repo, SHA, preview, route, CSS viewport, DPR, mode, locale, timezone/date, fixture and state in screenshot filename or metadata.
2. Designer reviews against the named **DESIGN REFERENCE** and sends numbered punch list by element #, expected/actual, severity, affected breakpoint and screenshot evidence.
3. Developer corrects coherent set, re-renders and records deviations. UX separately checks states and keyboard/touch. User Review checks consumer/premium experience.
4. Owner sees genuine Today checkpoint promptly, **without preventing independent remaining screen implementation**; final owner/Architect accept after all seven are live.
5. **Current parity status: NOT TESTED / evidence TO COMPLETE — Developer.**

## 11. Completion checklist / signature ledger

- [ ] All TO COMPLETE items either filled with exact evidence or Architect-approved nonblocking exception
- [ ] Every element selector and importing file verified at frozen SHA
- [ ] All selected SVG files copied with SHA-256 source-to-target proof
- [ ] No extra unapproved CTA, metric, medical claim or layout meaning change
- [ ] Copy keys fully populated, Branding approved, UX meaning checked
- [ ] Designer typography/art/spacing and mobile references complete
- [ ] All fixture states tested under light/dark/Athlete as applicable
- [ ] Real screenshot parity and Designer punch list resolved
- [ ] Accessibility at 320/390/768/1440, 200% zoom, keyboard, reduced motion
- [ ] Developer build/test summary and preserved data/consent paths
- [ ] Independent User Review consumer-quality decision
- [ ] Architect documented resolution of all conflicts and final signoff

| Review lane | Current status | Required evidence |
| --- | --- | --- |
| Structural UX | SPEC WRITTEN; IMPLEMENTATION NOT TESTED | signed fixture/slot matrix |
| Designer | TO COMPLETE | v2.4 full paint and screenshot match |
| Branding | TO COMPLETE | approved copy key/value table |
| Developer | TO COMPLETE | repo path hashes, compiled app/tests/screenshots |
| Independent User Review | TO COMPLETE | live 3-second premium assessment |
| Architect | TO COMPLETE | D1–D8 and merge decision |
| Owner | TO COMPLETE | Today and final real screenshot decisions |

**Per-screen flatten instruction:** Single review region with dividers; maintain grouping of ingredient controls, no boxes nested around each ingredient or macro.

---

# 3. Biology & gut reports — complete screen build contract

## 1. Header

| Field | Value | Evidence / owner |
| --- | --- | --- |
| Screen / routes | Biology & gut reports — /precision; /microbiome; /biology/reports (existing route alias to verify) | Verified route mapping where source explicitly observed; remaining route aliases TO COMPLETE — Developer |
| Mockup reference | references/biology-explore-desktop.png (shared composite reference; not a standalone biology screenshot); dedicated Biology/Gut mobile and desktop comp TO COMPLETE — Designer | DESIGN REFERENCE ONLY; not live screen |
| Repo / branch / frozen SHA | `knagle-max/BloomGutHealth` / `enhance/bloom-experience`; **TO COMPLETE — Architect** exact frozen SHA + PR + preview URL | moving source inspected 2026-11-07 |
| Component mapping | `client/src/pages/Microbiome.tsx` VERIFIED; `/precision` exact page component TO COMPLETE — Developer; `GutReportOverview.tsx` NOT FOUND at prior path | Verified noted paths; additional import chain TO COMPLETE — Developer |
| Fixture IDs | BIO-NONE, BIO-QUAL, BIO-QUANT, BIO-HISTORY, BIO-MIXED, BIO-RESEARCH, BIO-FAILED, BIO-REVOKED, BIO-LOADING, BIO-PARTIAL | UX defined synthetic scenarios; Dev implements + captures |
| Spec ownership | Designer = visual; Branding = copy; UX = semantics/flows; Architect = reconciliation; Developer = exact repo mapping | Owner R2 |
| Status | STRUCTURAL DRAFT / TO COMPLETE — Designer final paint / TO COMPLETE — Branding copy / TO COMPLETE — Architect signoff / NOT TESTED visually | No fabricated approval |

## 2. Tokens used

| Token / style | Verified value / instruction | Application on this screen | Owner |
| --- | --- | --- | --- |
| Page / primary surface | `--bv-canvas #F8F9F3`, `--bv-porcelain #FFFEFA`, `--bv-paper #F5F3EB` (Everyday light v2.3) | page, selected light raised region; dark/athlete via token overrides | Designer |
| Text / CTA | `--bv-forest #173E32`, `--bv-forest-strong #102B25`, `--bv-secondary #52685C`, `--bv-brand #246B50` | headlines, supporting copy, primary action | Designer verifies AA |
| Tint / highlight | `--bv-mist #EDF3EC`, `--bv-sage #D9E7D5`; clay/lilac declared but placement unresolved | selected editorial and empty surfaces | TO COMPLETE — Designer explicit placement or deletion of unused tokens |
| Border / elevation | `--bv-line rgba(23,62,50,.11)`; `--bv-shadow 0 12px 32px rgba(18,47,37,.065)` | subtle high-level separation, not every fact | Designer |
| Radii | v2.3 hero 28 or `.bv-editorial-hero` 32; cards 26/28; buttons/inputs 14 | exact primitive variant TO COMPLETE — Designer | Designer |
| Display face | v2.3 h1 Georgia/Iowan; h2 not fully specified | h1–h3 and card titles | TO COMPLETE — Designer v2.4 font family/weights/loading |
| Body / mono | body: TO COMPLETE — Designer; mono v2.3 `ui-monospace,SFMono-Regular,Consolas,monospace` for telemetry | body and precise numerals | Designer |
| State + focus | v2.3 `.bv-state-*`; `--bv-focus` light #14543B; focus CSS requires fix | loading, partial, error, review, research, keyboard focus | Developer CSS correction, Designer paint |
| Art asset | see section 5 below | decorative non-data slots | Designer + UX |

## 3. Layout

Meaning-first person-readable interpretation of the selected source, with date and limitations, then exact source report, provider score/abundance distinctions, methods, chronology and manageable source controls.

Desktop: primary selected-report meaning summary and one next safe action before report history; precise data within deep layer. Mobile: meaning → report switch → findings → methods/history. TO COMPLETE — Designer exact grid and all text widths.

| Layout metric | Desktop 1440 | Mobile 390 | At 320/768, zoom and owner |
| --- | --- | --- | --- |
| Main max width / gutters | TO COMPLETE — Designer exact max-width + side gutter px | TO COMPLETE — Designer exact left/right padding px | Designer provide responsive clamps; Dev verify |
| Columns / composition | TO COMPLETE — Designer exact grid template + proportion, matched to reference | one reading order preserving DOM; exact layout TO COMPLETE — Designer | UX confirms action comes first |
| Section rhythm | TO COMPLETE — Designer exact vertical spacing tokens px | TO COMPLETE — Designer exact vertical spacing tokens px | Designer |
| Text line length | TO COMPLETE — Designer primary text max-width and title wrap | TO COMPLETE — Designer narrow title and body breakpoints | Designer; no clipping 200% zoom |
| Header/sidebar/bottom nav | existing `.workspace-sidebar`/`.bloom-header`; exact widths TO COMPLETE | existing `.bloom-bottom-nav`; route-appropriate item count | Designer + Architect nav paint; UX action clarity |
| Sticky/fixed elements | TO COMPLETE — Designer/Developer verified placement | TO COMPLETE — Designer/Developer safe-area and interaction clearance | UX verifies no CTA obscured |

## 4. Element map — visible DOM order

| # | Visible element | Existing component / selector | Content & source | Style / shape / spacing | Mobile behavior |
| --- | --- | --- | --- | --- | --- |
| 1 | Biology/Gut h1 | Microbiome `<h1>Gut reports</h1>`; precision h1 TO COMPLETE — Developer | `biology.h1` / `gut.h1` Branding | display serif; visual color/spacing dimensions TO COMPLETE — Designer | one clear page label; 320/zoom collision TO TEST — UX |
| 2 | Selected-report takeaway | Microbiome selected section; new semantics anchor TO COMPLETE — Developer | source/date plus accurate meaning or insufficiency | editorial headline; visual color/spacing dimensions TO COMPLETE — Designer | before management; 320/zoom collision TO TEST — UX |
| 3 | Safe next action | report import/compare/explore link from existing flow | only action supported by data | brand CTA; visual color/spacing dimensions TO COMPLETE — Designer | after takeaway; 320/zoom collision TO TEST — UX |
| 4 | Report picker/history | Microbiome `h2 Report history` | user-owned report dates and provider/source labels | flat timeline/selector; visual color/spacing dimensions TO COMPLETE — Designer | accessible switch; 320/zoom collision TO TEST — UX |
| 5 | Selected report metadata | Microbiome `h2 Selected report` | collection date, source, method, status | precise but secondary; visual color/spacing dimensions TO COMPLETE — Designer | cannot be concealed; 320/zoom collision TO TEST — UX |
| 6 | Provider qualitative scores | Microbiome selected report render; verify selector | score in native provider scale, not abundance | telemetry style only for real values; visual color/spacing dimensions TO COMPLETE — Designer | no synthetic gauges; 320/zoom collision TO TEST — UX |
| 7 | Quantitative microbial composition | Microbiome `h2 Microbial composition & change` | reported relative abundance, unit/method | chart with original values; visual color/spacing dimensions TO COMPLETE — Designer | compact but accessible table; 320/zoom collision TO TEST — UX |
| 8 | Molecules and pathway hypotheses | Microbiome `h2 Molecule & pathway hypotheses` | hypothesis/research context, not personal measurement | research visual signifier; visual color/spacing dimensions TO COMPLETE — Designer | disclosures; 320/zoom collision TO TEST — UX |
| 9 | Food patterns/next steps | Microbiome `h2 Food patterns & next steps` | qualify context limits | practical reading; visual color/spacing dimensions TO COMPLETE — Designer | no prescriptions; 320/zoom collision TO TEST — UX |
| 10 | Methods | Microbiome `details` methods/history | original method and limitations | deep disclosure; visual color/spacing dimensions TO COMPLETE — Designer | summary ≥44px; 320/zoom collision TO TEST — UX |
| 11 | Research populations | Microbiome `h2 Research populations` | cohort and evidence distinction | deep source list; visual color/spacing dimensions TO COMPLETE — Designer | references readable; 320/zoom collision TO TEST — UX |
| 12 | Stored recommendations | Microbiome `h2 Stored report recommendations` | preserved original vendor recommendations, labeled as such | source-specific region; visual color/spacing dimensions TO COMPLETE — Designer | not Bloom validation; 320/zoom collision TO TEST — UX |
| 13 | Report controls | import/edit/review/history from existing UI | user confirmation and source ownership | task-area controls; visual color/spacing dimensions TO COMPLETE — Designer | no accidental overwrite; 320/zoom collision TO TEST — UX |
| 14 | Generic organism illustration | TO COMPLETE — Designer anchor within meaning intro | `organism-concept.svg` | art not personal diagnosis; visual color/spacing dimensions TO COMPLETE — Designer | hide near numeric plot; 320/zoom collision TO TEST — UX |

## 5. Art assets & safety

`organism-concept.svg` may illustrate general microbiome concepts; not personal species measurement. TO COMPLETE — Designer whether any biological lab illustration needed and dedicated Biology + Gut reference screens.

| Field | Value | Owner / test |
| --- | --- | --- |
| Art file/path | Asset(s) in statement above; **TO COMPLETE — Designer** final mapping to `client/public/brand/visual-v2/<asset>` | Designer specifies; Dev verifies src/target SHA-256 |
| Desktop slot, size, reserved text | TO COMPLETE — Designer: verified selector + x/y + CSS size + text reserved width | Developer validates live anchor; UX overlap check |
| 390/320/768 mobile | TO COMPLETE — Designer: reposition, scaling, clipping and if hidden | UX checks primary action, facts and source still visible |
| Theme/contrast/forced-colors | TO COMPLETE — Designer: Everyday light/dark, Athlete, high contrast, reduced motion | UX verifies semantics unaffected |
| Accessibility | Decoration only; empty alt + aria-hidden on `img`, noninteractive pointer events; never scientific chart data | UX requirement; Developer tests |

## 6. States & fixture contract

| Fixture / state | Input scenario | Expected content and interaction | Visual treatment / owner |
| --- | --- | --- | --- |
| BIO-NONE | no verified report | import prompt, no claim of absent bacteria | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| BIO-QUAL | vendor qualitative scores only | native score labels, no fabricated abundance | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| BIO-QUANT | measured abundance provided | method/unit/date, precise values | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| BIO-HISTORY | multiple temporally distinct reports | method compatibility and chronology shown | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| BIO-MIXED | qualitative and quantitative sources | clear source/type separation | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| BIO-RESEARCH | pathway/cohort association | general evidence not personalized outcome | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| BIO-FAILED | one report/source fetch fails | source-specific retry and preserved other data | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| BIO-REVOKED | source access disconnected/revoked | no connected/source current claim | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| BIO-LOADING | record loading | no false empty | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| BIO-PARTIAL | import has unresolved rows | review list, missing values not zero | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |

## 7. Copy table — complete key inventory / ownership

| Key | String | Meaning constraints | Owner |
| --- | --- | --- | --- |
| biology.h1 | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.takeaway | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.report.selected | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.empty | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.partial | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.error | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.retry | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.score.provider | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.abundance | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.methods | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.research.limit | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.source | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.import | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.history | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| biology.revoked | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| gut.h1 | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| gut.takeaway | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |

**Quiet provenance:** one source/date/method disclosure at the nearest meaningful section boundary, not repeated `Source:` on each metric. **TO COMPLETE — Branding** exact phrasing and slot length; **TO COMPLETE — UX** meaning approval. User-provided original labels and units remain intact.

## 8. Motion

Subtle selected-report transition without changing measured reading or causing context confusion. TO COMPLETE — Designer.

| Interaction | Behavior | Duration / easing | Reduced motion |
| --- | --- | --- | --- |
| Hero/entry | Designer defines one unobtrusive introduction on real load | TO COMPLETE — Designer ms + easing | static |
| Loading placeholder | v2.3 has gradient state but missing animation; do not imply complete until source resolves | TO COMPLETE — Designer shimmer @keyframes | static styled region |
| Saved confirmation/chart (if applicable) | only when real saved receipt or actual plotted data exists | TO COMPLETE — Designer ms + easing | immediate state change |

## 9. Accessibility, scientific fidelity and failure checks

| Check | Acceptance criterion | Owner / status |
| --- | --- | --- |
| Contrast | Designer measures body, secondary, CTA, chart/legend, error and focus pairs in light, dark and Athlete (AA applicable); gradients sampled where text lies | TO COMPLETE — Designer, actual measurements |
| Keyboard/touch | 44×44 targets, tab sequence matches reading order, correct headings and accessible names, focused CTA not blocked | TO TEST — UX / Developer |
| Responsive | 320/390/768/1440 CSS px, 200% zoom, forced-colors, reduced-motion, no critical horizontal overflow | TO TEST — Developer / UX |
| Source truth | unknown/partial/errors/method/source and account scope as described in section 6; no fake metrics | TO TEST — Developer / UX / Biology |
| Decorative collision | art cannot overlap CTA, unit, source, error, legend, label, disclosure or focus outline | TO TEST — UX |
| Loading/error | honest source-specific states, retry without destroying local unsaved work | TO TEST — UX / Developer |

## 10. Parity check — actual application versus design reference

1. Developer captures **BEFORE ACTUAL APP** and **AFTER ACTUAL APP** at matched synthetic fixture, 390/1440, at least light/dark and relevant Athlete; 320/768 and 200% zoom in risk states. Preserve repo, SHA, preview, route, CSS viewport, DPR, mode, locale, timezone/date, fixture and state in screenshot filename or metadata.
2. Designer reviews against the named **DESIGN REFERENCE** and sends numbered punch list by element #, expected/actual, severity, affected breakpoint and screenshot evidence.
3. Developer corrects coherent set, re-renders and records deviations. UX separately checks states and keyboard/touch. User Review checks consumer/premium experience.
4. Owner sees genuine Today checkpoint promptly, **without preventing independent remaining screen implementation**; final owner/Architect accept after all seven are live.
5. **Current parity status: NOT TESTED / evidence TO COMPLETE — Developer.**

## 11. Completion checklist / signature ledger

- [ ] All TO COMPLETE items either filled with exact evidence or Architect-approved nonblocking exception
- [ ] Every element selector and importing file verified at frozen SHA
- [ ] All selected SVG files copied with SHA-256 source-to-target proof
- [ ] No extra unapproved CTA, metric, medical claim or layout meaning change
- [ ] Copy keys fully populated, Branding approved, UX meaning checked
- [ ] Designer typography/art/spacing and mobile references complete
- [ ] All fixture states tested under light/dark/Athlete as applicable
- [ ] Real screenshot parity and Designer punch list resolved
- [ ] Accessibility at 320/390/768/1440, 200% zoom, keyboard, reduced motion
- [ ] Developer build/test summary and preserved data/consent paths
- [ ] Independent User Review consumer-quality decision
- [ ] Architect documented resolution of all conflicts and final signoff

| Review lane | Current status | Required evidence |
| --- | --- | --- |
| Structural UX | SPEC WRITTEN; IMPLEMENTATION NOT TESTED | signed fixture/slot matrix |
| Designer | TO COMPLETE | v2.4 full paint and screenshot match |
| Branding | TO COMPLETE | approved copy key/value table |
| Developer | TO COMPLETE | repo path hashes, compiled app/tests/screenshots |
| Independent User Review | TO COMPLETE | live 3-second premium assessment |
| Architect | TO COMPLETE | D1–D8 and merge decision |
| Owner | TO COMPLETE | Today and final real screenshot decisions |

**Per-screen flatten instruction:** Meaning-first header outside admin/report card nesting. Related measured facts visually grouped, report history and methods in restrained disclosures, no per-taxon boxed dashboard.

---

# 4. Explore & research — complete screen build contract

## 1. Header

| Field | Value | Evidence / owner |
| --- | --- | --- |
| Screen / routes | Explore & research — /explore | Verified route mapping where source explicitly observed; remaining route aliases TO COMPLETE — Developer |
| Mockup reference | references/biology-explore-desktop.png (shared Biology+Explore composition); separate mobile Explore reference TO COMPLETE — Designer | DESIGN REFERENCE ONLY; not live screen |
| Repo / branch / frozen SHA | `knagle-max/BloomGutHealth` / `enhance/bloom-experience`; **TO COMPLETE — Architect** exact frozen SHA + PR + preview URL | moving source inspected 2026-11-07 |
| Component mapping | `client/src/pages/Explore.tsx` VERIFIED; `.relationship-card`, `.relationship-labels`, `.relationship-source` observed | Verified noted paths; additional import chain TO COMPLETE — Developer |
| Fixture IDs | EX-INITIAL, EX-RESULTS, EX-EMPTY, EX-CONFLICT, EX-RESEARCH, EX-ERROR, EX-LOADING, EX-FILTER | UX defined synthetic scenarios; Dev implements + captures |
| Spec ownership | Designer = visual; Branding = copy; UX = semantics/flows; Architect = reconciliation; Developer = exact repo mapping | Owner R2 |
| Status | STRUCTURAL DRAFT / TO COMPLETE — Designer final paint / TO COMPLETE — Branding copy / TO COMPLETE — Architect signoff / NOT TESTED visually | No fabricated approval |

## 2. Tokens used

| Token / style | Verified value / instruction | Application on this screen | Owner |
| --- | --- | --- | --- |
| Page / primary surface | `--bv-canvas #F8F9F3`, `--bv-porcelain #FFFEFA`, `--bv-paper #F5F3EB` (Everyday light v2.3) | page, selected light raised region; dark/athlete via token overrides | Designer |
| Text / CTA | `--bv-forest #173E32`, `--bv-forest-strong #102B25`, `--bv-secondary #52685C`, `--bv-brand #246B50` | headlines, supporting copy, primary action | Designer verifies AA |
| Tint / highlight | `--bv-mist #EDF3EC`, `--bv-sage #D9E7D5`; clay/lilac declared but placement unresolved | selected editorial and empty surfaces | TO COMPLETE — Designer explicit placement or deletion of unused tokens |
| Border / elevation | `--bv-line rgba(23,62,50,.11)`; `--bv-shadow 0 12px 32px rgba(18,47,37,.065)` | subtle high-level separation, not every fact | Designer |
| Radii | v2.3 hero 28 or `.bv-editorial-hero` 32; cards 26/28; buttons/inputs 14 | exact primitive variant TO COMPLETE — Designer | Designer |
| Display face | v2.3 h1 Georgia/Iowan; h2 not fully specified | h1–h3 and card titles | TO COMPLETE — Designer v2.4 font family/weights/loading |
| Body / mono | body: TO COMPLETE — Designer; mono v2.3 `ui-monospace,SFMono-Regular,Consolas,monospace` for telemetry | body and precise numerals | Designer |
| State + focus | v2.3 `.bv-state-*`; `--bv-focus` light #14543B; focus CSS requires fix | loading, partial, error, review, research, keyboard focus | Developer CSS correction, Designer paint |
| Art asset | see section 5 below | decorative non-data slots | Designer + UX |

## 3. Layout

Lead with a human-readable research question/topic finder; then a map of food↔molecule↔microbe↔pathway connections; preserve citations, populations, association directions, contradictions and limitations.

Desktop: topic search/filter editorial introduction, selected relationship story and detail shelf; mobile search first, then results and expandable evidence. Exact metrics TO COMPLETE — Designer.

| Layout metric | Desktop 1440 | Mobile 390 | At 320/768, zoom and owner |
| --- | --- | --- | --- |
| Main max width / gutters | TO COMPLETE — Designer exact max-width + side gutter px | TO COMPLETE — Designer exact left/right padding px | Designer provide responsive clamps; Dev verify |
| Columns / composition | TO COMPLETE — Designer exact grid template + proportion, matched to reference | one reading order preserving DOM; exact layout TO COMPLETE — Designer | UX confirms action comes first |
| Section rhythm | TO COMPLETE — Designer exact vertical spacing tokens px | TO COMPLETE — Designer exact vertical spacing tokens px | Designer |
| Text line length | TO COMPLETE — Designer primary text max-width and title wrap | TO COMPLETE — Designer narrow title and body breakpoints | Designer; no clipping 200% zoom |
| Header/sidebar/bottom nav | existing `.workspace-sidebar`/`.bloom-header`; exact widths TO COMPLETE | existing `.bloom-bottom-nav`; route-appropriate item count | Designer + Architect nav paint; UX action clarity |
| Sticky/fixed elements | TO COMPLETE — Designer/Developer verified placement | TO COMPLETE — Designer/Developer safe-area and interaction clearance | UX verifies no CTA obscured |

## 4. Element map — visible DOM order

| # | Visible element | Existing component / selector | Content & source | Style / shape / spacing | Mobile behavior |
| --- | --- | --- | --- | --- | --- |
| 1 | Research h1 | Explore page heading; exact h1 selector TO COMPLETE — Developer | `explore.h1` | serif editorial; visual color/spacing dimensions TO COMPLETE — Designer | first viewport; 320/zoom collision TO TEST — UX |
| 2 | Research-only eyebrow | Explore `.eyebrow` GENERAL RESEARCH | `explore.research.label` | distinct from personal report; visual color/spacing dimensions TO COMPLETE — Designer | visible on mobile; 320/zoom collision TO TEST — UX |
| 3 | Topic prompt and search | Explore existing selectors TO COMPLETE — Developer | supported indexed topics only | input + discoverability; visual color/spacing dimensions TO COMPLETE — Designer | proper labels; 320/zoom collision TO TEST — UX |
| 4 | Context/limitation | Explore `.panel-note` | population/association limitations | subtle, not hidden; visual color/spacing dimensions TO COMPLETE — Designer | above conclusions; 320/zoom collision TO TEST — UX |
| 5 | Relationship overview | Explore `.relationship-card` | actual food/molecule/organism links | open editorial layout, not generic tiles; visual color/spacing dimensions TO COMPLETE — Designer | stack meaningfully; 320/zoom collision TO TEST — UX |
| 6 | Connection direction | `.relationship-labels` | observed research direction/uncertainty | semantic arrows with text; visual color/spacing dimensions TO COMPLETE — Designer | cannot convey by color alone; 320/zoom collision TO TEST — UX |
| 7 | Evidence strength and negative findings | `.relationship-badges` / details | original study support/contradiction | qualified status; visual color/spacing dimensions TO COMPLETE — Designer | not fake score; 320/zoom collision TO TEST — UX |
| 8 | Literature/source detail | Explore `.relationship-source` | actual sources/URLs, limitations | quiet provenance once per section; visual color/spacing dimensions TO COMPLETE — Designer | details expandable; 320/zoom collision TO TEST — UX |
| 9 | Filters | existing Explore controls; exact selectors TO COMPLETE — Developer | selected filters and result count | responsive and labeled; visual color/spacing dimensions TO COMPLETE — Designer | no filter-card nesting; 320/zoom collision TO TEST — UX |
| 10 | Empty search | results empty from completed query | absence from search not biological absence | actionable next search; visual color/spacing dimensions TO COMPLETE — Designer | dedicated empty state; 320/zoom collision TO TEST — UX |
| 11 | Molecule illustration | approved editorial slot | `molecular-educational.svg` | generic concept only; visual color/spacing dimensions TO COMPLETE — Designer | never in personalized panel; 320/zoom collision TO TEST — UX |
| 12 | Navigation to Biology/Food | existing contextual links if present | routes verified before adding | secondary action; visual color/spacing dimensions TO COMPLETE — Designer | no duplicate CTA; 320/zoom collision TO TEST — UX |

## 5. Art assets & safety

`molecular-educational.svg` decorative general education. `organism-concept.svg` only if Designer selects and it does not imply personal result. TO COMPLETE — Designer exact composition.

| Field | Value | Owner / test |
| --- | --- | --- |
| Art file/path | Asset(s) in statement above; **TO COMPLETE — Designer** final mapping to `client/public/brand/visual-v2/<asset>` | Designer specifies; Dev verifies src/target SHA-256 |
| Desktop slot, size, reserved text | TO COMPLETE — Designer: verified selector + x/y + CSS size + text reserved width | Developer validates live anchor; UX overlap check |
| 390/320/768 mobile | TO COMPLETE — Designer: reposition, scaling, clipping and if hidden | UX checks primary action, facts and source still visible |
| Theme/contrast/forced-colors | TO COMPLETE — Designer: Everyday light/dark, Athlete, high contrast, reduced motion | UX verifies semantics unaffected |
| Accessibility | Decoration only; empty alt + aria-hidden on `img`, noninteractive pointer events; never scientific chart data | UX requirement; Developer tests |

## 6. States & fixture contract

| Fixture / state | Input scenario | Expected content and interaction | Visual treatment / owner |
| --- | --- | --- | --- |
| EX-INITIAL | no query | prompt/topic discovery and general research caveat | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| EX-RESULTS | supported topic with matching associations | show actual evidence and references | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| EX-EMPTY | complete search returns zero matches | no inference that topic has no biological relation | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| EX-CONFLICT | different studies disagree | counterevidence visible, no arbitrary causal score | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| EX-RESEARCH | association without personal assay | research-only label near claim | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| EX-ERROR | search/source unavailable | retry targeted to failing query | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| EX-LOADING | fetch pending | not empty prematurely | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| EX-FILTER | selected filters | clear active filter and result changes | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |

## 7. Copy table — complete key inventory / ownership

| Key | String | Meaning constraints | Owner |
| --- | --- | --- | --- |
| explore.h1 | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.takeaway | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.search | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.empty | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.loading | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.error | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.retry | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.research.label | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.research.limit | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.conflict | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.source | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.filters | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| explore.results | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |

**Quiet provenance:** one source/date/method disclosure at the nearest meaningful section boundary, not repeated `Source:` on each metric. **TO COMPLETE — Branding** exact phrasing and slot length; **TO COMPLETE — UX** meaning approval. User-provided original labels and units remain intact.

## 8. Motion

Conservative connection reveal optional; never suggests causal direction beyond source. TO COMPLETE — Designer.

| Interaction | Behavior | Duration / easing | Reduced motion |
| --- | --- | --- | --- |
| Hero/entry | Designer defines one unobtrusive introduction on real load | TO COMPLETE — Designer ms + easing | static |
| Loading placeholder | v2.3 has gradient state but missing animation; do not imply complete until source resolves | TO COMPLETE — Designer shimmer @keyframes | static styled region |
| Saved confirmation/chart (if applicable) | only when real saved receipt or actual plotted data exists | TO COMPLETE — Designer ms + easing | immediate state change |

## 9. Accessibility, scientific fidelity and failure checks

| Check | Acceptance criterion | Owner / status |
| --- | --- | --- |
| Contrast | Designer measures body, secondary, CTA, chart/legend, error and focus pairs in light, dark and Athlete (AA applicable); gradients sampled where text lies | TO COMPLETE — Designer, actual measurements |
| Keyboard/touch | 44×44 targets, tab sequence matches reading order, correct headings and accessible names, focused CTA not blocked | TO TEST — UX / Developer |
| Responsive | 320/390/768/1440 CSS px, 200% zoom, forced-colors, reduced-motion, no critical horizontal overflow | TO TEST — Developer / UX |
| Source truth | unknown/partial/errors/method/source and account scope as described in section 6; no fake metrics | TO TEST — Developer / UX / Biology |
| Decorative collision | art cannot overlap CTA, unit, source, error, legend, label, disclosure or focus outline | TO TEST — UX |
| Loading/error | honest source-specific states, retry without destroying local unsaved work | TO TEST — UX / Developer |

## 10. Parity check — actual application versus design reference

1. Developer captures **BEFORE ACTUAL APP** and **AFTER ACTUAL APP** at matched synthetic fixture, 390/1440, at least light/dark and relevant Athlete; 320/768 and 200% zoom in risk states. Preserve repo, SHA, preview, route, CSS viewport, DPR, mode, locale, timezone/date, fixture and state in screenshot filename or metadata.
2. Designer reviews against the named **DESIGN REFERENCE** and sends numbered punch list by element #, expected/actual, severity, affected breakpoint and screenshot evidence.
3. Developer corrects coherent set, re-renders and records deviations. UX separately checks states and keyboard/touch. User Review checks consumer/premium experience.
4. Owner sees genuine Today checkpoint promptly, **without preventing independent remaining screen implementation**; final owner/Architect accept after all seven are live.
5. **Current parity status: NOT TESTED / evidence TO COMPLETE — Developer.**

## 11. Completion checklist / signature ledger

- [ ] All TO COMPLETE items either filled with exact evidence or Architect-approved nonblocking exception
- [ ] Every element selector and importing file verified at frozen SHA
- [ ] All selected SVG files copied with SHA-256 source-to-target proof
- [ ] No extra unapproved CTA, metric, medical claim or layout meaning change
- [ ] Copy keys fully populated, Branding approved, UX meaning checked
- [ ] Designer typography/art/spacing and mobile references complete
- [ ] All fixture states tested under light/dark/Athlete as applicable
- [ ] Real screenshot parity and Designer punch list resolved
- [ ] Accessibility at 320/390/768/1440, 200% zoom, keyboard, reduced motion
- [ ] Developer build/test summary and preserved data/consent paths
- [ ] Independent User Review consumer-quality decision
- [ ] Architect documented resolution of all conflicts and final signoff

| Review lane | Current status | Required evidence |
| --- | --- | --- |
| Structural UX | SPEC WRITTEN; IMPLEMENTATION NOT TESTED | signed fixture/slot matrix |
| Designer | TO COMPLETE | v2.4 full paint and screenshot match |
| Branding | TO COMPLETE | approved copy key/value table |
| Developer | TO COMPLETE | repo path hashes, compiled app/tests/screenshots |
| Independent User Review | TO COMPLETE | live 3-second premium assessment |
| Architect | TO COMPLETE | D1–D8 and merge decision |
| Owner | TO COMPLETE | Today and final real screenshot decisions |

**Per-screen flatten instruction:** Use topic-led editorial narrative and side-by-side relationships where useful; remove redundant cards per filter/result without losing evidence grouping.

---

# 5. Progress & trends — complete screen build contract

## 1. Header

| Field | Value | Evidence / owner |
| --- | --- | --- |
| Screen / routes | Progress & trends — /progress | Verified route mapping where source explicitly observed; remaining route aliases TO COMPLETE — Developer |
| Mockup reference | references/progress-desktop.png; 390px Progress reference TO COMPLETE — Designer v2.4 | DESIGN REFERENCE ONLY; not live screen |
| Repo / branch / frozen SHA | `knagle-max/BloomGutHealth` / `enhance/bloom-experience`; **TO COMPLETE — Architect** exact frozen SHA + PR + preview URL | moving source inspected 2026-11-07 |
| Component mapping | `client/src/pages/Progress.tsx` and `client/src/components/FoodProgress.tsx` VERIFIED | Verified noted paths; additional import chain TO COMPLETE — Developer |
| Fixture IDs | PR-NONE, PR-ONE, PR-DATED, PR-PARTIAL, PR-METHOD, PR-SOURCE-FAIL, PR-LOADING, PR-ATHLETE | UX defined synthetic scenarios; Dev implements + captures |
| Spec ownership | Designer = visual; Branding = copy; UX = semantics/flows; Architect = reconciliation; Developer = exact repo mapping | Owner R2 |
| Status | STRUCTURAL DRAFT / TO COMPLETE — Designer final paint / TO COMPLETE — Branding copy / TO COMPLETE — Architect signoff / NOT TESTED visually | No fabricated approval |

## 2. Tokens used

| Token / style | Verified value / instruction | Application on this screen | Owner |
| --- | --- | --- | --- |
| Page / primary surface | `--bv-canvas #F8F9F3`, `--bv-porcelain #FFFEFA`, `--bv-paper #F5F3EB` (Everyday light v2.3) | page, selected light raised region; dark/athlete via token overrides | Designer |
| Text / CTA | `--bv-forest #173E32`, `--bv-forest-strong #102B25`, `--bv-secondary #52685C`, `--bv-brand #246B50` | headlines, supporting copy, primary action | Designer verifies AA |
| Tint / highlight | `--bv-mist #EDF3EC`, `--bv-sage #D9E7D5`; clay/lilac declared but placement unresolved | selected editorial and empty surfaces | TO COMPLETE — Designer explicit placement or deletion of unused tokens |
| Border / elevation | `--bv-line rgba(23,62,50,.11)`; `--bv-shadow 0 12px 32px rgba(18,47,37,.065)` | subtle high-level separation, not every fact | Designer |
| Radii | v2.3 hero 28 or `.bv-editorial-hero` 32; cards 26/28; buttons/inputs 14 | exact primitive variant TO COMPLETE — Designer | Designer |
| Display face | v2.3 h1 Georgia/Iowan; h2 not fully specified | h1–h3 and card titles | TO COMPLETE — Designer v2.4 font family/weights/loading |
| Body / mono | body: TO COMPLETE — Designer; mono v2.3 `ui-monospace,SFMono-Regular,Consolas,monospace` for telemetry | body and precise numerals | Designer |
| State + focus | v2.3 `.bv-state-*`; `--bv-focus` light #14543B; focus CSS requires fix | loading, partial, error, review, research, keyboard focus | Developer CSS correction, Designer paint |
| Art asset | see section 5 below | decorative non-data slots | Designer + UX |

## 3. Layout

Show an observed, sourced change or state clearly that there is insufficient comparable data. Exact dated records, scope of comparison and source types must remain available. Move shared display-unit editing to Profile only.

Desktop: meaningful summary above nutrition/activity/biology tabs, one principal graph with evidence table; mobile trend headline then filter/chart with unclipped axes and deep table. TO COMPLETE — Designer exact grid/gutters.

| Layout metric | Desktop 1440 | Mobile 390 | At 320/768, zoom and owner |
| --- | --- | --- | --- |
| Main max width / gutters | TO COMPLETE — Designer exact max-width + side gutter px | TO COMPLETE — Designer exact left/right padding px | Designer provide responsive clamps; Dev verify |
| Columns / composition | TO COMPLETE — Designer exact grid template + proportion, matched to reference | one reading order preserving DOM; exact layout TO COMPLETE — Designer | UX confirms action comes first |
| Section rhythm | TO COMPLETE — Designer exact vertical spacing tokens px | TO COMPLETE — Designer exact vertical spacing tokens px | Designer |
| Text line length | TO COMPLETE — Designer primary text max-width and title wrap | TO COMPLETE — Designer narrow title and body breakpoints | Designer; no clipping 200% zoom |
| Header/sidebar/bottom nav | existing `.workspace-sidebar`/`.bloom-header`; exact widths TO COMPLETE | existing `.bloom-bottom-nav`; route-appropriate item count | Designer + Architect nav paint; UX action clarity |
| Sticky/fixed elements | TO COMPLETE — Designer/Developer verified placement | TO COMPLETE — Designer/Developer safe-area and interaction clearance | UX verifies no CTA obscured |

## 4. Element map — visible DOM order

| # | Visible element | Existing component / selector | Content & source | Style / shape / spacing | Mobile behavior |
| --- | --- | --- | --- | --- | --- |
| 1 | Progress h1 | Progress `<h1>Progress</h1>` | `progress.h1` | Designer serif; visual color/spacing dimensions TO COMPLETE — Designer | first viewport; 320/zoom collision TO TEST — UX |
| 2 | Observed takeaway | new approved header region above domain tabs; TO COMPLETE — Developer | actual comparable data or insufficient observations | editorial result, not invented score; visual color/spacing dimensions TO COMPLETE — Designer | first fold; 320/zoom collision TO TEST — UX |
| 3 | Period + source qualifier | source/date ranges from records | `progress.period`, source labels | small explanatory line; visual color/spacing dimensions TO COMPLETE — Designer | wrap; 320/zoom collision TO TEST — UX |
| 4 | Domain tabs | Progress `TabsList.progress-domain-tabs` | Nutrition/Activity/Biology | Designer tab chrome; visual color/spacing dimensions TO COMPLETE — Designer | preserve keyboard tabs; 320/zoom collision TO TEST — UX |
| 5 | Trend metric and unit | FoodProgress selector + data | existing unit conversion from Profile | mono precision; visual color/spacing dimensions TO COMPLETE — Designer | visible units; 320/zoom collision TO TEST — UX |
| 6 | Actual-date chart | FoodProgress `.food-progress-plot` | dated recorded points; no joins across missing dates | Designer chart tokens only; visual color/spacing dimensions TO COMPLETE — Designer | responsive non-distorting plot; 320/zoom collision TO TEST — UX |
| 7 | Axis/scale/legend | FoodProgress `.food-progress-scale` | actual units and partiality | readable telemetry; visual color/spacing dimensions TO COMPLETE — Designer | do not hide scale; 320/zoom collision TO TEST — UX |
| 8 | Recorded observations table | FoodProgress `details` + `.food-progress-days` | dated exact values, meal count, partial coverage | deep semantic rows; visual color/spacing dimensions TO COMPLETE — Designer | accessible at 320; 320/zoom collision TO TEST — UX |
| 9 | Activity trajectory | Progress `TabsContent activity` | reported activities; avoid caloric expenditure estimates | readable timeline; visual color/spacing dimensions TO COMPLETE — Designer | not a readiness score; 320/zoom collision TO TEST — UX |
| 10 | Biology/labs timeline | Progress `TabsContent biology` | test source, collection date, unit, compatible methods | precision ledger; visual color/spacing dimensions TO COMPLETE — Designer | no causal claim; 320/zoom collision TO TEST — UX |
| 11 | Measurements display | Progress `#progress-measurements` | saved values + Profile display unit selections | read-only here where possible; visual color/spacing dimensions TO COMPLETE — Designer | link Profile editor; 320/zoom collision TO TEST — UX |
| 12 | Shared unit editors | currently duplicated Progress selects | TO CHANGE — Developer: remove duplicate editor or delegate exclusively to Profile; verify effect | not present in final Progress; visual color/spacing dimensions TO COMPLETE — Designer | one canonical unit editor; 320/zoom collision TO TEST — UX |
| 13 | Reproducibility/source | existing `details` records/notes | method/coverage and source revisions | quiet single section provenance; visual color/spacing dimensions TO COMPLETE — Designer | accessible after summary; 320/zoom collision TO TEST — UX |

## 5. Art assets & safety

No art inside data plot, legends or axis. `botanical-orbit.svg` only if Designer wants subtle non-data framing outside telemetry; never an ornamental score or synthetic gauge.

| Field | Value | Owner / test |
| --- | --- | --- |
| Art file/path | Asset(s) in statement above; **TO COMPLETE — Designer** final mapping to `client/public/brand/visual-v2/<asset>` | Designer specifies; Dev verifies src/target SHA-256 |
| Desktop slot, size, reserved text | TO COMPLETE — Designer: verified selector + x/y + CSS size + text reserved width | Developer validates live anchor; UX overlap check |
| 390/320/768 mobile | TO COMPLETE — Designer: reposition, scaling, clipping and if hidden | UX checks primary action, facts and source still visible |
| Theme/contrast/forced-colors | TO COMPLETE — Designer: Everyday light/dark, Athlete, high contrast, reduced motion | UX verifies semantics unaffected |
| Accessibility | Decoration only; empty alt + aria-hidden on `img`, noninteractive pointer events; never scientific chart data | UX requirement; Developer tests |

## 6. States & fixture contract

| Fixture / state | Input scenario | Expected content and interaction | Visual treatment / owner |
| --- | --- | --- | --- |
| PR-NONE | no observations | no trend conclusion | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PR-ONE | one dated value | single point, expressly not a trend | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PR-DATED | multiple compatible values nonconsecutive dates | real x-axis spacing; no fake interpolation | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PR-PARTIAL | missing quantities/dates | missing≠0, flags + details | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PR-METHOD | incompatible lab methods/units | no combined trajectory | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PR-SOURCE-FAIL | data source fetch error | retry and preserve unaffected tab | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PR-LOADING | pending | not zero graph | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PR-ATHLETE | mode athlete | activity labels reflect mode, no readiness inference | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |

## 7. Copy table — complete key inventory / ownership

| Key | String | Meaning constraints | Owner |
| --- | --- | --- | --- |
| progress.h1 | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.takeaway | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.insufficient | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.single | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.partial | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.methodMismatch | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.source | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.loading | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.error | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.retry | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.units.editInProfile | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.tabs.nutrition | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.tabs.activity | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.tabs.biology | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| progress.more | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |

**Quiet provenance:** one source/date/method disclosure at the nearest meaningful section boundary, not repeated `Source:` on each metric. **TO COMPLETE — Branding** exact phrasing and slot length; **TO COMPLETE — UX** meaning approval. User-provided original labels and units remain intact.

## 8. Motion

Chart draw only after actual records; no in-between line across missing days. Reduced motion static. TO COMPLETE — Designer.

| Interaction | Behavior | Duration / easing | Reduced motion |
| --- | --- | --- | --- |
| Hero/entry | Designer defines one unobtrusive introduction on real load | TO COMPLETE — Designer ms + easing | static |
| Loading placeholder | v2.3 has gradient state but missing animation; do not imply complete until source resolves | TO COMPLETE — Designer shimmer @keyframes | static styled region |
| Saved confirmation/chart (if applicable) | only when real saved receipt or actual plotted data exists | TO COMPLETE — Designer ms + easing | immediate state change |

## 9. Accessibility, scientific fidelity and failure checks

| Check | Acceptance criterion | Owner / status |
| --- | --- | --- |
| Contrast | Designer measures body, secondary, CTA, chart/legend, error and focus pairs in light, dark and Athlete (AA applicable); gradients sampled where text lies | TO COMPLETE — Designer, actual measurements |
| Keyboard/touch | 44×44 targets, tab sequence matches reading order, correct headings and accessible names, focused CTA not blocked | TO TEST — UX / Developer |
| Responsive | 320/390/768/1440 CSS px, 200% zoom, forced-colors, reduced-motion, no critical horizontal overflow | TO TEST — Developer / UX |
| Source truth | unknown/partial/errors/method/source and account scope as described in section 6; no fake metrics | TO TEST — Developer / UX / Biology |
| Decorative collision | art cannot overlap CTA, unit, source, error, legend, label, disclosure or focus outline | TO TEST — UX |
| Loading/error | honest source-specific states, retry without destroying local unsaved work | TO TEST — UX / Developer |

## 10. Parity check — actual application versus design reference

1. Developer captures **BEFORE ACTUAL APP** and **AFTER ACTUAL APP** at matched synthetic fixture, 390/1440, at least light/dark and relevant Athlete; 320/768 and 200% zoom in risk states. Preserve repo, SHA, preview, route, CSS viewport, DPR, mode, locale, timezone/date, fixture and state in screenshot filename or metadata.
2. Designer reviews against the named **DESIGN REFERENCE** and sends numbered punch list by element #, expected/actual, severity, affected breakpoint and screenshot evidence.
3. Developer corrects coherent set, re-renders and records deviations. UX separately checks states and keyboard/touch. User Review checks consumer/premium experience.
4. Owner sees genuine Today checkpoint promptly, **without preventing independent remaining screen implementation**; final owner/Architect accept after all seven are live.
5. **Current parity status: NOT TESTED / evidence TO COMPLETE — Developer.**

## 11. Completion checklist / signature ledger

- [ ] All TO COMPLETE items either filled with exact evidence or Architect-approved nonblocking exception
- [ ] Every element selector and importing file verified at frozen SHA
- [ ] All selected SVG files copied with SHA-256 source-to-target proof
- [ ] No extra unapproved CTA, metric, medical claim or layout meaning change
- [ ] Copy keys fully populated, Branding approved, UX meaning checked
- [ ] Designer typography/art/spacing and mobile references complete
- [ ] All fixture states tested under light/dark/Athlete as applicable
- [ ] Real screenshot parity and Designer punch list resolved
- [ ] Accessibility at 320/390/768/1440, 200% zoom, keyboard, reduced motion
- [ ] Developer build/test summary and preserved data/consent paths
- [ ] Independent User Review consumer-quality decision
- [ ] Architect documented resolution of all conflicts and final signoff

| Review lane | Current status | Required evidence |
| --- | --- | --- |
| Structural UX | SPEC WRITTEN; IMPLEMENTATION NOT TESTED | signed fixture/slot matrix |
| Designer | TO COMPLETE | v2.4 full paint and screenshot match |
| Branding | TO COMPLETE | approved copy key/value table |
| Developer | TO COMPLETE | repo path hashes, compiled app/tests/screenshots |
| Independent User Review | TO COMPLETE | live 3-second premium assessment |
| Architect | TO COMPLETE | D1–D8 and merge decision |
| Owner | TO COMPLETE | Today and final real screenshot decisions |

**Per-screen flatten instruction:** Summary and one principal visual; flatten generic bordered chart cards and nested table wrappers; do not eliminate raw values or source chronology.

---

# 6. Athlete / training day — complete screen build contract

## 1. Header

| Field | Value | Evidence / owner |
| --- | --- | --- |
| Screen / routes | Athlete / training day — /athlete; /athlete/fueling; /athlete/recovery; /athlete/competition | Verified route mapping where source explicitly observed; remaining route aliases TO COMPLETE — Developer |
| Mockup reference | references/athlete-desktop.png; Athlete 390px references TO COMPLETE — Designer | DESIGN REFERENCE ONLY; not live screen |
| Repo / branch / frozen SHA | `knagle-max/BloomGutHealth` / `enhance/bloom-experience`; **TO COMPLETE — Architect** exact frozen SHA + PR + preview URL | moving source inspected 2026-11-07 |
| Component mapping | `client/src/pages/AthleteWorkspace.tsx` VERIFIED; `BottomNav.tsx` 5 Athlete actions VERIFIED | Verified noted paths; additional import chain TO COMPLETE — Developer |
| Fixture IDs | AT-NONE, AT-PLANNED, AT-EDIT, AT-COMPLETED, AT-CANCELLED, AT-HYDRATION-PARTIAL, AT-SAVING, AT-ERROR, AT-CONFLICT, AT-REDUCED | UX defined synthetic scenarios; Dev implements + captures |
| Spec ownership | Designer = visual; Branding = copy; UX = semantics/flows; Architect = reconciliation; Developer = exact repo mapping | Owner R2 |
| Status | STRUCTURAL DRAFT / TO COMPLETE — Designer final paint / TO COMPLETE — Branding copy / TO COMPLETE — Architect signoff / NOT TESTED visually | No fabricated approval |

## 2. Tokens used

| Token / style | Verified value / instruction | Application on this screen | Owner |
| --- | --- | --- | --- |
| Page / primary surface | `--bv-canvas #F8F9F3`, `--bv-porcelain #FFFEFA`, `--bv-paper #F5F3EB` (Everyday light v2.3) | page, selected light raised region; dark/athlete via token overrides | Designer |
| Text / CTA | `--bv-forest #173E32`, `--bv-forest-strong #102B25`, `--bv-secondary #52685C`, `--bv-brand #246B50` | headlines, supporting copy, primary action | Designer verifies AA |
| Tint / highlight | `--bv-mist #EDF3EC`, `--bv-sage #D9E7D5`; clay/lilac declared but placement unresolved | selected editorial and empty surfaces | TO COMPLETE — Designer explicit placement or deletion of unused tokens |
| Border / elevation | `--bv-line rgba(23,62,50,.11)`; `--bv-shadow 0 12px 32px rgba(18,47,37,.065)` | subtle high-level separation, not every fact | Designer |
| Radii | v2.3 hero 28 or `.bv-editorial-hero` 32; cards 26/28; buttons/inputs 14 | exact primitive variant TO COMPLETE — Designer | Designer |
| Display face | v2.3 h1 Georgia/Iowan; h2 not fully specified | h1–h3 and card titles | TO COMPLETE — Designer v2.4 font family/weights/loading |
| Body / mono | body: TO COMPLETE — Designer; mono v2.3 `ui-monospace,SFMono-Regular,Consolas,monospace` for telemetry | body and precise numerals | Designer |
| State + focus | v2.3 `.bv-state-*`; `--bv-focus` light #14543B; focus CSS requires fix | loading, partial, error, review, research, keyboard focus | Developer CSS correction, Designer paint |
| Art asset | see section 5 below | decorative non-data slots | Designer + UX |

## 3. Layout

Next scheduled workout or current recorded status; one action for adding/reviewing the session; detailed planned vs completed sets, hydration and fueling distinct. Never invent performance/readiness physiology.

Desktop: strong, specific training context, session overview, editing/recovery details by tab; mobile action-first, no tables wider than viewport. Exact geometry TO COMPLETE — Designer.

| Layout metric | Desktop 1440 | Mobile 390 | At 320/768, zoom and owner |
| --- | --- | --- | --- |
| Main max width / gutters | TO COMPLETE — Designer exact max-width + side gutter px | TO COMPLETE — Designer exact left/right padding px | Designer provide responsive clamps; Dev verify |
| Columns / composition | TO COMPLETE — Designer exact grid template + proportion, matched to reference | one reading order preserving DOM; exact layout TO COMPLETE — Designer | UX confirms action comes first |
| Section rhythm | TO COMPLETE — Designer exact vertical spacing tokens px | TO COMPLETE — Designer exact vertical spacing tokens px | Designer |
| Text line length | TO COMPLETE — Designer primary text max-width and title wrap | TO COMPLETE — Designer narrow title and body breakpoints | Designer; no clipping 200% zoom |
| Header/sidebar/bottom nav | existing `.workspace-sidebar`/`.bloom-header`; exact widths TO COMPLETE | existing `.bloom-bottom-nav`; route-appropriate item count | Designer + Architect nav paint; UX action clarity |
| Sticky/fixed elements | TO COMPLETE — Designer/Developer verified placement | TO COMPLETE — Designer/Developer safe-area and interaction clearance | UX verifies no CTA obscured |

## 4. Element map — visible DOM order

| # | Visible element | Existing component / selector | Content & source | Style / shape / spacing | Mobile behavior |
| --- | --- | --- | --- | --- | --- |
| 1 | Athlete h1 / context | AthleteWorkspace route selected section, heading selector TO COMPLETE — Developer | `athlete.h1`, mode/date | Designer serif/headline consistent with athlete palette; visual color/spacing dimensions TO COMPLETE — Designer | h1 visible; 320/zoom collision TO TEST — UX |
| 2 | Upcoming/recorded session status | `RecordedSessionStatus` in AthleteWorkspace | planned/completed/cancelled | clearly text-labeled state; visual color/spacing dimensions TO COMPLETE — Designer | no color alone; 320/zoom collision TO TEST — UX |
| 3 | Primary training action | AthleteWorkspace active workflow button | start/log/edit session per real state | prominent Athlete CTA; visual color/spacing dimensions TO COMPLETE — Designer | ≥44px; 320/zoom collision TO TEST — UX |
| 4 | Session history | AthleteWorkspace session records | actual timestamps, provenance | timeline; visual color/spacing dimensions TO COMPLETE — Designer | accessible details; 320/zoom collision TO TEST — UX |
| 5 | Set/repetition inputs | `SessionForm`, `SessionEdit` | real sets, reps, load units | task-oriented grouped form; visual color/spacing dimensions TO COMPLETE — Designer | no tiny controls; 320/zoom collision TO TEST — UX |
| 6 | Fueling and hydration | `HydrationForm` / fueling route | real entered units and dates | precision values; visual color/spacing dimensions TO COMPLETE — Designer | respect Profile unit conversion; 320/zoom collision TO TEST — UX |
| 7 | Recovery response | athlete recovery route | recorded response only, no readiness inference | secondary layer; visual color/spacing dimensions TO COMPLETE — Designer | explicit provenance; 320/zoom collision TO TEST — UX |
| 8 | Competition/clean sport | `CompetitionTools` | reported product/review info with limitations | separate administrative action; visual color/spacing dimensions TO COMPLETE — Designer | avoid green pass implication; 320/zoom collision TO TEST — UX |
| 9 | Recorded edit/save | `useSessionSave`, `useExperienceMutation` in source | server receipt/revisions | visible saving and success; visual color/spacing dimensions TO COMPLETE — Designer | no duplicate saves; 320/zoom collision TO TEST — UX |
| 10 | Athlete bottom nav | BottomNav athlete items | Training/Fueling/Journal/Recovery/Compete | Designer icons/paint; visual color/spacing dimensions TO COMPLETE — Designer | 5 tabs fit 320 and zoom; 320/zoom collision TO TEST — UX |
| 11 | Decorative motion art | approved slot near intro | `athlete-motion.svg` | subtle illustrative; visual color/spacing dimensions TO COMPLETE — Designer | never over training form; 320/zoom collision TO TEST — UX |
| 12 | Deep biological interpretation | source-aware disclosure only when actual information exists | no extrapolated biomarker readiness | precision layer; visual color/spacing dimensions TO COMPLETE — Designer | source/date in detail; 320/zoom collision TO TEST — UX |

## 5. Art assets & safety

`athlete-motion.svg` proposed editorial artwork. TO COMPLETE — Designer exact position, mode-specific colors and fallback/forced-colors; never placed within input controls.

| Field | Value | Owner / test |
| --- | --- | --- |
| Art file/path | Asset(s) in statement above; **TO COMPLETE — Designer** final mapping to `client/public/brand/visual-v2/<asset>` | Designer specifies; Dev verifies src/target SHA-256 |
| Desktop slot, size, reserved text | TO COMPLETE — Designer: verified selector + x/y + CSS size + text reserved width | Developer validates live anchor; UX overlap check |
| 390/320/768 mobile | TO COMPLETE — Designer: reposition, scaling, clipping and if hidden | UX checks primary action, facts and source still visible |
| Theme/contrast/forced-colors | TO COMPLETE — Designer: Everyday light/dark, Athlete, high contrast, reduced motion | UX verifies semantics unaffected |
| Accessibility | Decoration only; empty alt + aria-hidden on `img`, noninteractive pointer events; never scientific chart data | UX requirement; Developer tests |

## 6. States & fixture contract

| Fixture / state | Input scenario | Expected content and interaction | Visual treatment / owner |
| --- | --- | --- | --- |
| AT-NONE | no session entered | one create/log action | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| AT-PLANNED | scheduled workout only | planned status cannot become completed | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| AT-EDIT | recorded sets being edited | unsaved visible, no completion receipt | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| AT-COMPLETED | server confirmed session | completed label based on actual record | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| AT-CANCELLED | cancelled | not logged as completed | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| AT-HYDRATION-PARTIAL | entry missing values | not zero or physiological inference | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| AT-SAVING | pending mutation | disable duplicate submit | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| AT-ERROR | save/refetch fails | draft remains and specific retry | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| AT-CONFLICT | revision mismatch | resolve without dropping sets | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| AT-REDUCED | prefers reduced motion | art/transition static | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |

## 7. Copy table — complete key inventory / ownership

| Key | String | Meaning constraints | Owner |
| --- | --- | --- | --- |
| athlete.h1 | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.takeaway | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.planned | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.completed | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.cancelled | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.log | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.edit.unsaved | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.save | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.saving | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.saved | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.error | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.retry | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.conflict | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.hydration.partial | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.source | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| athlete.research.limit | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |

**Quiet provenance:** one source/date/method disclosure at the nearest meaningful section boundary, not repeated `Source:` on each metric. **TO COMPLETE — Branding** exact phrasing and slot length; **TO COMPLETE — UX** meaning approval. User-provided original labels and units remain intact.

## 8. Motion

Hero entrance/saved confirmation. Never animate a numeric gain unsupported by training record. TO COMPLETE — Designer.

| Interaction | Behavior | Duration / easing | Reduced motion |
| --- | --- | --- | --- |
| Hero/entry | Designer defines one unobtrusive introduction on real load | TO COMPLETE — Designer ms + easing | static |
| Loading placeholder | v2.3 has gradient state but missing animation; do not imply complete until source resolves | TO COMPLETE — Designer shimmer @keyframes | static styled region |
| Saved confirmation/chart (if applicable) | only when real saved receipt or actual plotted data exists | TO COMPLETE — Designer ms + easing | immediate state change |

## 9. Accessibility, scientific fidelity and failure checks

| Check | Acceptance criterion | Owner / status |
| --- | --- | --- |
| Contrast | Designer measures body, secondary, CTA, chart/legend, error and focus pairs in light, dark and Athlete (AA applicable); gradients sampled where text lies | TO COMPLETE — Designer, actual measurements |
| Keyboard/touch | 44×44 targets, tab sequence matches reading order, correct headings and accessible names, focused CTA not blocked | TO TEST — UX / Developer |
| Responsive | 320/390/768/1440 CSS px, 200% zoom, forced-colors, reduced-motion, no critical horizontal overflow | TO TEST — Developer / UX |
| Source truth | unknown/partial/errors/method/source and account scope as described in section 6; no fake metrics | TO TEST — Developer / UX / Biology |
| Decorative collision | art cannot overlap CTA, unit, source, error, legend, label, disclosure or focus outline | TO TEST — UX |
| Loading/error | honest source-specific states, retry without destroying local unsaved work | TO TEST — UX / Developer |

## 10. Parity check — actual application versus design reference

1. Developer captures **BEFORE ACTUAL APP** and **AFTER ACTUAL APP** at matched synthetic fixture, 390/1440, at least light/dark and relevant Athlete; 320/768 and 200% zoom in risk states. Preserve repo, SHA, preview, route, CSS viewport, DPR, mode, locale, timezone/date, fixture and state in screenshot filename or metadata.
2. Designer reviews against the named **DESIGN REFERENCE** and sends numbered punch list by element #, expected/actual, severity, affected breakpoint and screenshot evidence.
3. Developer corrects coherent set, re-renders and records deviations. UX separately checks states and keyboard/touch. User Review checks consumer/premium experience.
4. Owner sees genuine Today checkpoint promptly, **without preventing independent remaining screen implementation**; final owner/Architect accept after all seven are live.
5. **Current parity status: NOT TESTED / evidence TO COMPLETE — Developer.**

## 11. Completion checklist / signature ledger

- [ ] All TO COMPLETE items either filled with exact evidence or Architect-approved nonblocking exception
- [ ] Every element selector and importing file verified at frozen SHA
- [ ] All selected SVG files copied with SHA-256 source-to-target proof
- [ ] No extra unapproved CTA, metric, medical claim or layout meaning change
- [ ] Copy keys fully populated, Branding approved, UX meaning checked
- [ ] Designer typography/art/spacing and mobile references complete
- [ ] All fixture states tested under light/dark/Athlete as applicable
- [ ] Real screenshot parity and Designer punch list resolved
- [ ] Accessibility at 320/390/768/1440, 200% zoom, keyboard, reduced motion
- [ ] Developer build/test summary and preserved data/consent paths
- [ ] Independent User Review consumer-quality decision
- [ ] Architect documented resolution of all conflicts and final signoff

| Review lane | Current status | Required evidence |
| --- | --- | --- |
| Structural UX | SPEC WRITTEN; IMPLEMENTATION NOT TESTED | signed fixture/slot matrix |
| Designer | TO COMPLETE | v2.4 full paint and screenshot match |
| Branding | TO COMPLETE | approved copy key/value table |
| Developer | TO COMPLETE | repo path hashes, compiled app/tests/screenshots |
| Independent User Review | TO COMPLETE | live 3-second premium assessment |
| Architect | TO COMPLETE | D1–D8 and merge decision |
| Owner | TO COMPLETE | Today and final real screenshot decisions |

**Per-screen flatten instruction:** One editorial workout overview; set rows grouped by exercise with spacing/dividers rather than cards per set. Separate planned and actual.

---

# 7. Profile, privacy & settings — complete screen build contract

## 1. Header

| Field | Value | Evidence / owner |
| --- | --- | --- |
| Screen / routes | Profile, privacy & settings — /profile | Verified route mapping where source explicitly observed; remaining route aliases TO COMPLETE — Developer |
| Mockup reference | references/profile-desktop.png; 390px Profile reference TO COMPLETE — Designer v2.4 | DESIGN REFERENCE ONLY; not live screen |
| Repo / branch / frozen SHA | `knagle-max/BloomGutHealth` / `enhance/bloom-experience`; **TO COMPLETE — Architect** exact frozen SHA + PR + preview URL | moving source inspected 2026-11-07 |
| Component mapping | `client/src/pages/Profile.tsx` VERIFIED; `.profile-workspace`, `.profile-settings-list`, `.profile-editor`, `#nutrition-profile`, `#profile-account` | Verified noted paths; additional import chain TO COMPLETE — Developer |
| Fixture IDs | PF-PRISTINE, PF-DIRTY, PF-SAVING, PF-SAVED, PF-CONFLICT, PF-ERROR, PF-REVOKED, PF-EXPORT, PF-DELETE, PF-MODE | UX defined synthetic scenarios; Dev implements + captures |
| Spec ownership | Designer = visual; Branding = copy; UX = semantics/flows; Architect = reconciliation; Developer = exact repo mapping | Owner R2 |
| Status | STRUCTURAL DRAFT / TO COMPLETE — Designer final paint / TO COMPLETE — Branding copy / TO COMPLETE — Architect signoff / NOT TESTED visually | No fabricated approval |

## 2. Tokens used

| Token / style | Verified value / instruction | Application on this screen | Owner |
| --- | --- | --- | --- |
| Page / primary surface | `--bv-canvas #F8F9F3`, `--bv-porcelain #FFFEFA`, `--bv-paper #F5F3EB` (Everyday light v2.3) | page, selected light raised region; dark/athlete via token overrides | Designer |
| Text / CTA | `--bv-forest #173E32`, `--bv-forest-strong #102B25`, `--bv-secondary #52685C`, `--bv-brand #246B50` | headlines, supporting copy, primary action | Designer verifies AA |
| Tint / highlight | `--bv-mist #EDF3EC`, `--bv-sage #D9E7D5`; clay/lilac declared but placement unresolved | selected editorial and empty surfaces | TO COMPLETE — Designer explicit placement or deletion of unused tokens |
| Border / elevation | `--bv-line rgba(23,62,50,.11)`; `--bv-shadow 0 12px 32px rgba(18,47,37,.065)` | subtle high-level separation, not every fact | Designer |
| Radii | v2.3 hero 28 or `.bv-editorial-hero` 32; cards 26/28; buttons/inputs 14 | exact primitive variant TO COMPLETE — Designer | Designer |
| Display face | v2.3 h1 Georgia/Iowan; h2 not fully specified | h1–h3 and card titles | TO COMPLETE — Designer v2.4 font family/weights/loading |
| Body / mono | body: TO COMPLETE — Designer; mono v2.3 `ui-monospace,SFMono-Regular,Consolas,monospace` for telemetry | body and precise numerals | Designer |
| State + focus | v2.3 `.bv-state-*`; `--bv-focus` light #14543B; focus CSS requires fix | loading, partial, error, review, research, keyboard focus | Developer CSS correction, Designer paint |
| Art asset | see section 5 below | decorative non-data slots | Designer + UX |

## 3. Layout

Human-readable preference/account control center, canonical display units and profile measurements, trusted source and privacy controls, clear unsaved/saved/conflict handling; retain auditability and data portability.

Desktop: editorial heading and grouped account/preferences/data sections with restrained panels. Mobile: settings as clear disclosures and large controls; preserve dirty/conflict indicators in viewport. TO COMPLETE — Designer measurements.

| Layout metric | Desktop 1440 | Mobile 390 | At 320/768, zoom and owner |
| --- | --- | --- | --- |
| Main max width / gutters | TO COMPLETE — Designer exact max-width + side gutter px | TO COMPLETE — Designer exact left/right padding px | Designer provide responsive clamps; Dev verify |
| Columns / composition | TO COMPLETE — Designer exact grid template + proportion, matched to reference | one reading order preserving DOM; exact layout TO COMPLETE — Designer | UX confirms action comes first |
| Section rhythm | TO COMPLETE — Designer exact vertical spacing tokens px | TO COMPLETE — Designer exact vertical spacing tokens px | Designer |
| Text line length | TO COMPLETE — Designer primary text max-width and title wrap | TO COMPLETE — Designer narrow title and body breakpoints | Designer; no clipping 200% zoom |
| Header/sidebar/bottom nav | existing `.workspace-sidebar`/`.bloom-header`; exact widths TO COMPLETE | existing `.bloom-bottom-nav`; route-appropriate item count | Designer + Architect nav paint; UX action clarity |
| Sticky/fixed elements | TO COMPLETE — Designer/Developer verified placement | TO COMPLETE — Designer/Developer safe-area and interaction clearance | UX verifies no CTA obscured |

## 4. Element map — visible DOM order

| # | Visible element | Existing component / selector | Content & source | Style / shape / spacing | Mobile behavior |
| --- | --- | --- | --- | --- | --- |
| 1 | Profile h1 | Profile `.science-heading h1` | `profile.h1` Branding | Designer serif; visual color/spacing dimensions TO COMPLETE — Designer | clear; 320/zoom collision TO TEST — UX |
| 2 | Intro/takeaway | Profile `.science-heading .eyebrow`; subline slot TO COMPLETE — Developer | `profile.takeaway` Branding | warm copy; visual color/spacing dimensions TO COMPLETE — Designer | first fold; 320/zoom collision TO TEST — UX |
| 3 | Account summary | `#profile-account` `<details>` | actual user account/source | section heading + divider; visual color/spacing dimensions TO COMPLETE — Designer | safe disclosure; 320/zoom collision TO TEST — UX |
| 4 | Appearance and mode | Profile settings group selector TO COMPLETE — Developer | real theme/mode preferences | nonclinical controls; visual color/spacing dimensions TO COMPLETE — Designer | consistent across modes; 320/zoom collision TO TEST — UX |
| 5 | Nutrition profile | `#nutrition-profile`, `.profile-editor` | profile fields saved separately | task-oriented input group; visual color/spacing dimensions TO COMPLETE — Designer | labels adjacent; 320/zoom collision TO TEST — UX |
| 6 | Canonical units | Profile units settings and displayUnits from `useExperience` | height, weight, energy, hydration, circumference | one editor here only; visual color/spacing dimensions TO COMPLETE — Designer | no duplicate in Progress; 320/zoom collision TO TEST — UX |
| 7 | Source connections | Profile source/disclosure sections selector TO COMPLETE — Developer | connected, pending, revoked states from real capabilities | label true state; visual color/spacing dimensions TO COMPLETE — Designer | no green connected when revoked; 320/zoom collision TO TEST — UX |
| 8 | Privacy / consent | Profile privacy region selector TO COMPLETE — Developer | real source scopes, export/delete controls | high-clarity hierarchy; visual color/spacing dimensions TO COMPLETE — Designer | confirm irreversible; 320/zoom collision TO TEST — UX |
| 9 | Unsaved indicator | Profile `dirty` and save handler | draft differs from confirmed server | review state, not saved; visual color/spacing dimensions TO COMPLETE — Designer | persistent through fetch; 320/zoom collision TO TEST — UX |
| 10 | Saving / confirmation | real mutation success only | server revision/receipt | succinct positive feedback; visual color/spacing dimensions TO COMPLETE — Designer | announce status; 320/zoom collision TO TEST — UX |
| 11 | Conflict resolution | Profile source revision, `If-Match` context | user can keep/reconcile edits | error + safe choice; visual color/spacing dimensions TO COMPLETE — Designer | no silent overwrite; 320/zoom collision TO TEST — UX |
| 12 | Deep record metadata | Profile measurement `<details>` | original source text, date and units | quiet disclosure; visual color/spacing dimensions TO COMPLETE — Designer | still accessible; 320/zoom collision TO TEST — UX |
| 13 | Illustration/icon | TO COMPLETE — Designer; no mandatory food/molecule art | decorative if beneficial | unobtrusive; visual color/spacing dimensions TO COMPLETE — Designer | never covers fields; 320/zoom collision TO TEST — UX |

## 5. Art assets & safety

Current v2.3 package contains profile reference but no profile-specific illustration. TO COMPLETE — Designer: approved art or explicit none, icon system, 390px reference.

| Field | Value | Owner / test |
| --- | --- | --- |
| Art file/path | Asset(s) in statement above; **TO COMPLETE — Designer** final mapping to `client/public/brand/visual-v2/<asset>` | Designer specifies; Dev verifies src/target SHA-256 |
| Desktop slot, size, reserved text | TO COMPLETE — Designer: verified selector + x/y + CSS size + text reserved width | Developer validates live anchor; UX overlap check |
| 390/320/768 mobile | TO COMPLETE — Designer: reposition, scaling, clipping and if hidden | UX checks primary action, facts and source still visible |
| Theme/contrast/forced-colors | TO COMPLETE — Designer: Everyday light/dark, Athlete, high contrast, reduced motion | UX verifies semantics unaffected |
| Accessibility | Decoration only; empty alt + aria-hidden on `img`, noninteractive pointer events; never scientific chart data | UX requirement; Developer tests |

## 6. States & fixture contract

| Fixture / state | Input scenario | Expected content and interaction | Visual treatment / owner |
| --- | --- | --- | --- |
| PF-PRISTINE | saved values and no local edits | no false save badge | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PF-DIRTY | local changes not saved | unsaved message clearly shown | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PF-SAVING | request pending | disable duplicate saving; keep draft | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PF-SAVED | server confirms revision | saved receipt/status | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PF-CONFLICT | concurrent mutation/source change | show conflict; preserve local form | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PF-ERROR | failed save or source fetch | source-specific error/retry, not empty | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PF-REVOKED | source consent revoked | show disconnected, old records only if legitimately retained | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PF-EXPORT | export pending/complete | actual output/receipt | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PF-DELETE | deletion staged | explicit irreversible confirmation | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |
| PF-MODE | theme/Athlete change | data remains owner-scoped; visual mode updates | TO COMPLETE — Designer state paint; TO COMPLETE — Branding string; UX verifies meaning; Dev screenshots |

## 7. Copy table — complete key inventory / ownership

| Key | String | Meaning constraints | Owner |
| --- | --- | --- | --- |
| profile.h1 | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.takeaway | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.account | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.preferences | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.units | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.privacy | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.dirty | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.saving | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.saved | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.conflict | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.error | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.retry | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.source.connected | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.source.revoked | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.export | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.delete.confirm | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.measurements | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |
| profile.more | TO COMPLETE — Branding final text (no fabricated approved copy) | UX validates in recorded, empty, error and mode contexts; original runtime-generated labels remain dynamic where applicable | Branding; UX MEANING OK/EDIT REQUIRED |

**Quiet provenance:** one source/date/method disclosure at the nearest meaningful section boundary, not repeated `Source:` on each metric. **TO COMPLETE — Branding** exact phrasing and slot length; **TO COMPLETE — UX** meaning approval. User-provided original labels and units remain intact.

## 8. Motion

State transition on save only; no motion during privacy/consent decision. TO COMPLETE — Designer.

| Interaction | Behavior | Duration / easing | Reduced motion |
| --- | --- | --- | --- |
| Hero/entry | Designer defines one unobtrusive introduction on real load | TO COMPLETE — Designer ms + easing | static |
| Loading placeholder | v2.3 has gradient state but missing animation; do not imply complete until source resolves | TO COMPLETE — Designer shimmer @keyframes | static styled region |
| Saved confirmation/chart (if applicable) | only when real saved receipt or actual plotted data exists | TO COMPLETE — Designer ms + easing | immediate state change |

## 9. Accessibility, scientific fidelity and failure checks

| Check | Acceptance criterion | Owner / status |
| --- | --- | --- |
| Contrast | Designer measures body, secondary, CTA, chart/legend, error and focus pairs in light, dark and Athlete (AA applicable); gradients sampled where text lies | TO COMPLETE — Designer, actual measurements |
| Keyboard/touch | 44×44 targets, tab sequence matches reading order, correct headings and accessible names, focused CTA not blocked | TO TEST — UX / Developer |
| Responsive | 320/390/768/1440 CSS px, 200% zoom, forced-colors, reduced-motion, no critical horizontal overflow | TO TEST — Developer / UX |
| Source truth | unknown/partial/errors/method/source and account scope as described in section 6; no fake metrics | TO TEST — Developer / UX / Biology |
| Decorative collision | art cannot overlap CTA, unit, source, error, legend, label, disclosure or focus outline | TO TEST — UX |
| Loading/error | honest source-specific states, retry without destroying local unsaved work | TO TEST — UX / Developer |

## 10. Parity check — actual application versus design reference

1. Developer captures **BEFORE ACTUAL APP** and **AFTER ACTUAL APP** at matched synthetic fixture, 390/1440, at least light/dark and relevant Athlete; 320/768 and 200% zoom in risk states. Preserve repo, SHA, preview, route, CSS viewport, DPR, mode, locale, timezone/date, fixture and state in screenshot filename or metadata.
2. Designer reviews against the named **DESIGN REFERENCE** and sends numbered punch list by element #, expected/actual, severity, affected breakpoint and screenshot evidence.
3. Developer corrects coherent set, re-renders and records deviations. UX separately checks states and keyboard/touch. User Review checks consumer/premium experience.
4. Owner sees genuine Today checkpoint promptly, **without preventing independent remaining screen implementation**; final owner/Architect accept after all seven are live.
5. **Current parity status: NOT TESTED / evidence TO COMPLETE — Developer.**

## 11. Completion checklist / signature ledger

- [ ] All TO COMPLETE items either filled with exact evidence or Architect-approved nonblocking exception
- [ ] Every element selector and importing file verified at frozen SHA
- [ ] All selected SVG files copied with SHA-256 source-to-target proof
- [ ] No extra unapproved CTA, metric, medical claim or layout meaning change
- [ ] Copy keys fully populated, Branding approved, UX meaning checked
- [ ] Designer typography/art/spacing and mobile references complete
- [ ] All fixture states tested under light/dark/Athlete as applicable
- [ ] Real screenshot parity and Designer punch list resolved
- [ ] Accessibility at 320/390/768/1440, 200% zoom, keyboard, reduced motion
- [ ] Developer build/test summary and preserved data/consent paths
- [ ] Independent User Review consumer-quality decision
- [ ] Architect documented resolution of all conflicts and final signoff

| Review lane | Current status | Required evidence |
| --- | --- | --- |
| Structural UX | SPEC WRITTEN; IMPLEMENTATION NOT TESTED | signed fixture/slot matrix |
| Designer | TO COMPLETE | v2.4 full paint and screenshot match |
| Branding | TO COMPLETE | approved copy key/value table |
| Developer | TO COMPLETE | repo path hashes, compiled app/tests/screenshots |
| Independent User Review | TO COMPLETE | live 3-second premium assessment |
| Architect | TO COMPLETE | D1–D8 and merge decision |
| Owner | TO COMPLETE | Today and final real screenshot decisions |

**Per-screen flatten instruction:** Account/preferences/privacy are semantic section groups with dividers and purposeful disclosure, not admin card per toggle. Retain protective confirmation boundaries.

---

# 8. Cross-route implementation plan, ownership and unresolved values

## 8.1 File-and-component bridge (implementation targets, not an instruction to discard functional internals)

| Stream | Verified existing code | New presentation target / work item | Preserve |
|---|---|---|---|
| Shell | `AppNavigation.tsx`, `BottomNav.tsx`, `.bloom-header` and `.workspace-sidebar` | canonical opt-in CSS, Designer chrome icons, app-shell flag wiring TO COMPLETE — Developer | routes, mode-specific nav, keyboard destinations |
| Today | `Dashboard.tsx`, `TodayFocus.tsx`, `CompanionHero.tsx`, `TodayFoodSummary.tsx` | editorial hero art, dynamic headline/CTA, open food summary, warm copy | `todayContextAction`, choice and evidence source logic |
| Food | `LogMeal.tsx`; `/nutrition` implementing file TO COMPLETE | task-centered entry/review/receipt, empty art, styled real journal | parsing review, missing coverage, mutation receipts |
| Biology/Gut | `Microbiome.tsx`; `/precision` implementation TO COMPLETE | meaning-first report + reference-ready sources/timelines | provider method, dates, research limitations, original values |
| Explore | `Explore.tsx` | narrative relationship view, conceptual molecular art | provenance, negative evidence, source citations |
| Progress | `Progress.tsx`, `FoodProgress.tsx` | actual-date chart paint, meaning-first summary; remove extra unit editing here | report dates, partial data, source compatibility; Profile units authoritative |
| Athlete | `AthleteWorkspace.tsx` | athlete art, training-first action, less boxed set entry | planned/completed status, real sets, mutation safeguards |
| Profile | `Profile.tsx` | calmer privacy/settings groups and canonical units | draft, conflict, privacy, measurement provenance |

**Structural reusable component:** Existing `PremiumSectionBoundary` TSX contract in `Bloom_UX_R2_Slots_Structural_Implementation_Handoff_2026-11-07.md`, Section 6, is approved as a **template**, not proof it exists. Developer must implement and run typecheck if used. Branding passes all visible copy via props/constants; Designer can apply scoped style classes; page h1 remains in page component, `headingLevel` is 2 or 3, copy is never hard-coded by the boundary. No guessed `TelemetryMetric`/`SurfaceCard` import: Architect/Developer first inspect actual `components/ui/` and implement approved primitives based on Designer-approved canonical classes.

## 8.2 v2.4 Designer completion appendix (MANDATORY visual values, not a new gate on unrelated coding)

| ID | Required exact delivery | Owner | Currently |
|---|---|---|---|
| DES-01 | Single v2.4 CSS with every selector prefixed `.app-shell[data-bloom-visual="premium"]`; fix focus rule, maintain theme variants | Designer / Developer | TO COMPLETE |
| DES-02 | Named display-serif, body, mono with weights/load fallback; h1–h3/card titles, responsive type scale | Designer | TO COMPLETE |
| DES-03 | For all seven experiences: exact 1440 and 390 layouts, gutters/columns, section rhythm, hero/journal reserve, safe-area | Designer | TO COMPLETE |
| DES-04 | Art-slot table: anchor verified with Developer, asset, desktop placement, mobile/zoom/forced-colors behavior, reserved prose width | Designer + Developer + UX | TO COMPLETE |
| DES-05 | Actual light/dark/Athlete text/CTA/chart/state contrast values and AA reports | Designer | TO COMPLETE |
| DES-06 | Complete state paint, loading shimmer keyframes and reduced-motion fallback, ≤3 documented animations | Designer | TO COMPLETE |
| DES-07 | 390px reference for Food, Progress, Profile, and dedicated biology/Explore/Athlete if no equivalent; sidebar icons/header glyph | Designer | TO COMPLETE |
| DES-08 | Per-route flatten diagram mapping element numbers to boundary/divider/whitespace treatments, no fake gauges | Designer | TO COMPLETE |
| DES-09 | SHA-256 manifest update with corrected asset CSS source and all selected originals | Designer + Developer | TO COMPLETE |

## 8.3 Branding completion appendix (MANDATORY copy values, not permission to invent biomedical claims)

Provide one UTF-8 file `client/src/content/premium-copy.ts` (or Architect-approved equivalent), **TO COMPLETE — Developer/Architect path**, with typed route → component → state keys from each section 7 and copy lengths. Branding supplies voice rules, banned clinical/admin terms for primary surfaces, six before/after examples, human quiet-provenance phrase, loading/empty/partial/review/saved/error/retry/research/conflict messages for each applicable route. UX reviews all claims for source fidelity. Dynamic Today action titles and user-derived data **remain computed**—Branding styles templates, it does not replace a contextual action with a static tagline.

## 8.4 D1–D8 explicit architectural reconciliation log (every row nonblank)

| Decision | Proposed implementation default | Needs recorded answer |
|---|---|---|
| D1 freeze | pin commit, PR, preview and official v2.3 archive SHA above; verify target asset folder | TO COMPLETE — Architect exact SHA/URLs |
| D2 staged delivery | Today first live slice, **nonblocking checkpoint** while independently scoped views continue; latest owner instruction supersedes blanket stop | TO COMPLETE — Architect written resolution |
| D3 art slot | verified selector + CSS pseudo-element or one decorative `img` with empty alt, no flow/focus/data overlap | TO COMPLETE — Architect approval per slot |
| D4 chrome | Designer paint; UX existing routes; Everyday 3 bottom, Athlete 5 pending usability tests | TO COMPLETE — Architect decision after 320/zoom test |
| D5 copy | Branding words; UX validates truth; Developer keys; current code runtime labels respected | TO COMPLETE — Architect ownership confirmation |
| D6 legacy CSS | discover actual workspace.css path/import chain; scoped override collisions inventory | TO COMPLETE — Developer / Architect |
| D7 motion/art | animated loading/reduced motion and first-use illustration in planned production; no fabricated timing | TO COMPLETE — Designer durations and Architect scope |
| D8 owner checkpoint | actual Today images promptly, owner can reject Today; don't freeze independent routes | TO COMPLETE — Architect resolution of older stop text |

## 8.5 Work packets for Codex (implementation-first)

| Packet | Concrete action | Output | Dependency |
|---|---|---|---|
| P0 inventory | freeze SHA + inspect app shell/import graph/selectors and CSS collision; hash v2.3 | repo/path/asset list | none |
| P1 visuals | import scoped CSS+7 SVGs; fix focus selector; flag parity and semantic primitives | committed implementation + baseline diff | P0 |
| P2 Today | redesign layout using existing dynamic CTA, exact art slot, screenshot 390/1440, state fixtures | genuine live screenshot gallery + punch list | P1; Designer can refine in parallel |
| P3 Food | progressive meal entry/review/receipt and mobile form layout | working Food states + images | P1 |
| P4 Biology | selected-report meaning-first, method/source detail retained | working Biology/Gut views + images | P1 |
| P5 Explore | research narrative and link provenance | working research states + images | P1 |
| P6 Progress | progress interpretation, honest dated data, one unit editor only | working trends + images | P1 |
| P7 Athlete | actual sessions/sets/fueling and art | working mode-specific view + images | P1 |
| P8 Profile | user settings/privacy, dirty/conflict/receipt, profile units | working settings view + images | P1 |
| P9 parity | capture state×viewport×mode matrix; repair visual and UX defects | full gallery + QA signoffs | P2–P8 |

## 8.6 Provenance, review and screenshot ledger template

| Route | Fixture | Mode/theme | Width/DPR | Reference image | Before actual screenshot | After actual screenshot | SHA/preview | Designer | UX | User Review | Architect |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Today | TODAY-FIRST | Everyday/light | 390 / TO COMPLETE — Developer | `today-mobile.png` | TO COMPLETE — Developer | TO COMPLETE — Developer | TO COMPLETE — Architect | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
| Food | FOOD-REVIEW | Everyday/light | 390 / TO COMPLETE — Developer | TO COMPLETE — Designer mobile | TO COMPLETE — Developer | TO COMPLETE — Developer | TO COMPLETE — Architect | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
| Gut | BIO-QUAL | Everyday/light | 1440 / TO COMPLETE — Developer | `biology-explore-desktop.png` composite | TO COMPLETE — Developer | TO COMPLETE — Developer | TO COMPLETE — Architect | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
| Explore | EX-CONFLICT | Everyday/dark | 390 / TO COMPLETE — Developer | TO COMPLETE — Designer mobile | TO COMPLETE — Developer | TO COMPLETE — Developer | TO COMPLETE — Architect | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
| Progress | PR-PARTIAL | Everyday/light | 390 / TO COMPLETE — Developer | TO COMPLETE — Designer mobile | TO COMPLETE — Developer | TO COMPLETE — Developer | TO COMPLETE — Architect | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
| Athlete | AT-PLANNED | Athlete | 390 / TO COMPLETE — Developer | TO COMPLETE — Designer mobile | TO COMPLETE — Developer | TO COMPLETE — Developer | TO COMPLETE — Architect | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |
| Profile | PF-CONFLICT | Everyday/dark | 390 / TO COMPLETE — Developer | TO COMPLETE — Designer mobile | TO COMPLETE — Developer | TO COMPLETE — Developer | TO COMPLETE — Architect | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED |

**Final rule:** Design references and unit-test success can never substitute for a real app visual parity signoff. Equally, absence of the final signoff is not a justification to defer already unambiguous engineering implementation. Preserve progress in the branch and surface genuine blockers by screen and contract ID.


---

# APPENDIX D — GRAPHIC DESIGNER COMPLETION (ADDITIVE, SOURCE-PRESERVING)

# BLOOM — R3 COMPREHENSIVE BUILD SPEC: GRAPHIC DESIGNER REVIEW & COMPLETION APPENDIX

**ID:** VIS-R3-COMPLETION-2026-11-07-R1  
**Date:** 2026-11-07  
**Recipient:** Branding, Chief Architect, Structural UX, Codex/Developer, User Review  
**Publication target:** `/Bloom gut health/Agent Handoffs/`  
**Repository target:** `knagle-max/BloomGutHealth` / `enhance/bloom-experience` (NOT a claim of a commit)  
**Status:** **DESIGNER VISUAL VALUES PROVIDED; MASTER SPEC NOT YET FINAL/APPROVED.** One complete coordinated premium application is the end state; no interim owner review is required by the user's latest direction. Final user review occurs immediately before publishing to main. Engineering and specialist QA still occur throughout development.  
**Source documents:** `Bloom_Premium_Production_Master_Build_Spec_UX_Base_R3_2026-11-07.md` (168,580 bytes); `Bloom_Master_Build_Spec_R3_Designer_Architect_Package_2026-11-07.zip`; Designer v2.4 R2 asset ZIP; earlier R2 Architect, UX and Branding Continuity handoffs. This document only supplies DESIGNER-OWNED specifications and architectural conflict findings. It does not invent Branding copy or approve UX/Architect decisions.

## 1. Overall review verdict

**Comprehensive structural base: YES. Frozen, immediately executable, fully signed-off final spec: NOT YET.** R3 has seven complete 11-part screen contract sections, fixtures, element inventories, copy keys, mapping and source/claims constraints. It contains **729 literal `TO COMPLETE` occurrences** (including repeated template placeholders); those belonging to Branding, Architect, UX and Developer cannot be silently resolved by the Designer. The R3 transport ZIP includes **v2.3** assets, while the newer, previously published Designer delta is **v2.4** with mobile references, typography and corrected focus selector. The Architect must explicitly choose v2.4 as the visual source, verify the version/hash and prevent a v2.3 regression. Do not load two visual CSS files.

**Critical latest owner precedence:** the user's instruction for **no user reviews during implementation** supersedes older R2 proposals to stop after Today awaiting the owner's written GO. Developer may build Today first, capture/assess internally and continue all remaining views, with one consolidated **user review immediately before main**. The Chief Architect must record D2/D8 explicitly; keep QA regression and Specialist/Architect reviews during development. No main merge or production acceptance is implied.

**Source-verified vs proposed:** prior repository review observed `Dashboard.tsx`, `TodayFocus`, `CompanionHero`, `TodayFoodSummary`, `Explore`, `Progress`, `AthleteWorkspace`, `Profile`, `workspace.css`. Proposed visual selectors in this appendix are conditional on re-inventory at a **frozen SHA**. The designer has NOT inspected a live authenticated Render application or approved screenshots. All product values must be rendered from existing domain state; reference screenshots are synthetic art targets only.

## 2. Single-file design authority and precise material tokens

**CANONICAL ARTIFACT:** `styles/bloom-visual-scoped.css` from the attached R3 Designer Completion Asset ZIP. This is a **replacement evolution** of v2.4, not a second stylesheet. Developer copies only this version to `client/src/styles/bloom-visual-scoped.css` and imports it once after `workspace.css`. All selectors are contained beneath `.app-shell[data-bloom-visual="premium"]`. Turn on only by Architect-approved rollout flag. Unflagged appearance must be unchanged.

### Full token table (CSS variables, actual hex/values)

| Token | Everyday light | Everyday dark | Athlete | Role |
|---|---|---|---|---|
| `--bv-canvas` | `#F8F9F3` | `#101C17` | `#0F1B2E` | shell canvas |
| `--bv-paper` | `#F5F3EB` | `#192B24` | `#17263E` | editorial background |
| `--bv-porcelain` | `#FFFEFA` | `#22382E` | `#182B45` | surfaced material |
| `--bv-forest` | `#173E32` | `#EFF6EE` | `#F1F6FF` | main text |
| `--bv-forest-strong` | `#102B25` | `#FFFFFF` | `#FFFFFF` | emphasized text |
| `--bv-secondary` | `#52685C` | `#CADACF` | `#C3D4E9` | subtext, labels |
| `--bv-brand` | `#246B50` | `#A6DEBA` | `#81BEFF` | emphasis; NOT score |
| `--bv-sage / --bv-mist` | `#D9E7D5 / #EDF3EC` | `#345442 / #284434` | `#254967 / #203B63` | subtle panels |
| `--bv-clay / --bv-lilac` | `#D4A37C / #C9BDE3` | decorative only | decorative only | food/research **decoration**, not status text |
| `--bv-line` | `rgba(23,62,50,.11)` | `rgba(229,245,233,.17)` | `rgba(241,246,255,.16)` | 1px microborders |
| `--bv-shadow` | `0 12px 32px rgba(18,47,37,.065)` | `0 16px 35px rgba(0,0,0,.23)` | `0 16px 32px rgba(2,10,25,.28)` | one elevated surface max per cluster |
| `--bv-focus` | `#14543B` | `#A6DEBA` | `#81BEFF` | 3px accessible outline |
| `--bv-gradient` | `linear-gradient(135deg,#F5F3EB,#EDF3EC)` | `linear-gradient(135deg,#22382E,#29483A)` | `linear-gradient(135deg,#203B63,#0F1B2E)` | approved editorial slot only |

**Sampled contrast ratios (WCAG 2 luminance formula):** Forest `#173E32` on canvas `#F8F9F3` ≈11.2:1; secondary `#52685C` on porcelain `#FFFEFA` ≈5.96:1; brand `#246B50` on porcelain ≈6.32:1; dark text `#EFF6EE` on `#22382E` ≈11.4:1; Athlete cyan `#81BEFF` on navy ≈8.83:1. These do not prove contrast for every overlaid/translucent gradient or interaction state. For white text on the **light** brand green, use `#FFFFFF` (verify over actual filled button); for light/dark Athlete bright-accent button backgrounds use navy ink `#0F1B2E` for sufficient contrast. Do not use clay or lilac as small text.

### Typography (every heading from h1 through h3 and card titles)

| Element | Desktop CSS | ≤639px CSS | Color |
|---|---|---|---|
| h1 | 42px max / 48.7px line height / 600 / -0.03em; `clamp(30px,3.2vw,42px)` | 32px/37.4px, weight 600 | strong ink |
| h2 / editorial card title | `clamp(23px,1.9vw,30px)` / 1.23 / 550 / -0.018em | 24px/29.5px | ink |
| h3 / empty heading | 20px/26.4px / 600 / -0.012em | 19px/25px | ink |
| body | 16px/24px / 400 | 16px/24px | ink |
| supporting note | 14px/21px / 400 | 14px/21px | secondary |
| eyebrow | 12px/17px / 650 / 0.12em | same; wrap rather than clip | secondary |
| primary action label | 15px/21px / 650 | 15px/21px / 650 | contrast-adjusted action ink |
| numerals | 36px/40px / 600, tabular mono | 32px/38px / 600 | ink |
| chart tick / data label | 13px/18px mono; accessible alternative table | same; avoid collisions | secondary |

**Installed system fallback only:** editorial serif `"Iowan Old Style", Baskerville, "Palatino Linotype", Georgia, serif`; UI body `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`; numerals `ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`. Do NOT fetch remotely, redistribute fonts or invent proprietary font licensing. Retain the real heading levels and DOM order. No artificial `font-synthesis` for scientific data is required.

### Structural geometry clarification

**Do not let art direction overwrite UX hierarchy.** Visual Designer can provide *paint geometry* (radii 14 controls / 20 inset / 26 surfaces / 28 hero / 32 editorial hero; material 1px; illustration maximums; typographic line length). The UX agent / Architect authorizes column count, source order, sidebars, breakpoints, CTA width and position, and sticky behavior. For a precise no-guess implementation, reuse the existing `workspace.css` geometry at frozen SHA unless the UX R3 structural table explicitly supplies different values; do NOT infer a 60/40 column layout from a mock. **Verified prior source baseline**: `.workspace-sidebar` width 224px, `.bloom-header-inner` height 76px, `.workspace-content` margin-left 224px, `.app-shell main` max-width 1160px, main padding 36px 40px 64px on wide screens. These are source-observed baselines, NOT approvals to change UX geometry. Requested new grid ratios remain `Architect/UX decision required` rather than Designer invention.

**Designer-owned spacing rhythm within existing slots:** surface interior padding 24px desktop / 20px mobile when no UX-specific padding exists; between textual title and caption 8px; within semantic metric row 12px; within *visual* panel groups 24px; major typographic sections 32px desktop / 24px mobile. These are styling defaults, not permission to reorder/move wrapper siblings or relocate a CTA. Apply only when component's existing accessible/UX contract does not already define spacing.

## 3. Definitive visual element styling by destination (attach to R3 sections 1–7)

| R3 section | Paint-only visual instructions; mapped to existing candidate selectors | Decorative asset / responsive rule | Flat treatment and evidence state |
|---|---|---|---|
| **1 Today** | `.dashboard-heading h1` editorial serif h1; `.today-focus-heading h2` editorial serif h2; `.today-focus-reason` 16/24 secondary; `.today-focus-actions` existing actions with 14px radii and min 44px; `.flagship-section-heading` h2 23–30px; `.flagship-recorded-energy` numeric mono; `.date-pill` and `.eyebrow` as neutral secondary; `.today-focus` background gradient, radius 28, shadow. **All selectors require branch verification.** | `botanical-orbit.svg` in approved empty decorative pocket of existing `.today-focus`, max 220px / 30% desktop, at mobile 110px and .07 opacity OR hidden if any conflict. `empty-journal.svg` only in confirmed empty journal. | `.flagship-macros` use baseline/dividers rather than per-nutrient cards, preserving unit labels and partial data; empty/partial/error text visible before illustration. No hero art behind actionable data. |
| **2 Food** | existing `FoodEntryChooser` / `LogMeal` / `NutritionHistory` material: porcelain editor, inset portion fields mist, 14px control radii, 16/24 food descriptions, 14/21 labels, tabular mono source-composition values; active review stage uses quiet paper inset and explicit unsaved text. | `ingredient-oats.svg` and `ingredient-berries.svg` in **pre-entry/confirmed-empty decorative slot only**, no illustration on top of active search, scanner, allergens, portion review or receipt; on mobile 104px max or hidden. | Use a single primary editor material, internal 1px dividers instead of stacked 26px panels for every ingredient. Do not flatten an editable/error/confirmation boundary that UX needs. |
| **3 Biology & Gut Reports** | `.biology-context`, `.biology-summary-tile` get warm anatomical atlas treatment: strong forest headings; measured values in mono; source tags secondary 14/21; scientific evidence drawer remains text-first, with the exact method/date. | `organism-concept.svg` and `molecular-educational.svg` only as abstract research decoration where source not misidentified; 160px max desktop / hidden at ≤639px if text/source competes. | Flatten subordinate decorative tiles using `.bv-flat-group` only where UX marks them safe; research relationships use dashed `4 4` lines *with text*. No false microbiome abundance rendering. |
| **4 Explore** | editorial concept headings and category markers; muted porcelain/mist surface with nonsemantic lilac wash; research pathway graphic strokes 2px, dashed if abstract; source text `bv-provenance` quiet and legible. | `molecular-educational.svg` in an approved decorative intro area only, 160px desktop / ≤104px mobile or hidden. | Replace excessive nested *visual* boundaries with whitespace + hairlines, keeping every evidence/source/study link and research disclaimer. |
| **5 Progress** | `.progress-workspace`, `FoodProgress.tsx`: measured stroke 2.5px round, 6px points + 2px porcelain outline, chart grid 1px soft, source ticks 13/18 mono; never add smooth splines or an inferred continuous area; only show an authorized completion ring with real denominator. | **No art behind data plots**. Optional `botanical-orbit.svg` in confirmed empty state only, 128px and .10 opacity; hide mobile if crowded. | Flat external plot stage with a clear exact-data details disclosure; remove second-order border/shadow only on UX-approved wrappers. Reference intervals and provenance stay visible. |
| **6 Athlete** | `.athlete-mode` palette from scoped variables: navy canvas `#0F1B2E`, raised `#182B45`, cyan `#81BEFF`, ink `#F1F6FF`; true numeric labels mono, clear record statuses (planned/completed/cancelled by words + noncolor symbol); retain source/provenance. | `athlete-motion.svg` in approved noninteractive workout-intro region, 170px max desktop, at ≤639px 104px or hidden. Never overlap sets/reps/fuel. | No fictional readiness/recovery metric; visually flatten repeated nested training summary panels but preserve editable set groups and save states. |
| **7 Profile** | `.science-heading h1` serif; `#profile-account`, `#nutrition-profile` and existing source/privacy details warm porcelain with separator hairlines; labels readable 14/21, forms 16/24, focus 3px; error/conflict distinct by text + 1px rose outline only in real error states. | **No mandatory illustration** (decision rather than invented asset). Optional `botanical-orbit.svg` only on verified noninteractive intro pocket, max 120px desktop; hide on mobile and when editing/consent active. | Explicitly do not flatten consent/revoke/delete confirmation or profile dirty/If-Match conflict boxes; aesthetic whitespace on noncritical settings groups only. |

**Responsive references already exist in v2.4:** `today-mobile.svg`, `food-mobile.svg`, `biology-mobile.svg`, `explore-mobile.svg`, `progress-mobile.svg`, `athlete-mobile.svg`, `profile-mobile.svg`; desktop originals present for Today/Food/Biology-Explore/Progress/Athlete/Profile. A conceptual reference is neither a source of DOM order nor evidence of a deployed UI. **Do not recreate those from scratch.** The R3 pack currently contains a nested v2.3 ZIP rather than the v2.4 art archive. Fix by replacing that embedded ZIP after Architect version approval and updating its SHA256SUMS, not by loading both.

## 4. Art safety table / technical flag

| Art | Source path | Approved mechanism requested | Screen safety |
|---|---|---|---|
| botanical orbit | `assets/botanical-orbit.svg` | `.bv-editorial-hero[data-bv-art="botanical-orbit"][data-bv-art-safe="true"]::after` | only with verified unused decorative zone; hide at zoom/collision |
| oats | `assets/ingredient-oats.svg` | same explicit art flag on Food intro, or one `<img alt="" aria-hidden="true">` if UX approves | not while reviewing meal |
| berries | `assets/ingredient-berries.svg` | Food first-use illustration only; explicit approved `img` if needed | food source/portion visible |
| conceptual organism | `assets/organism-concept.svg` | Biology selected *research* intro only | no real taxa implied |
| educational molecules | `assets/molecular-educational.svg` | Explore research intro only | do not imply validated measured molecule |
| athletic motion | `assets/athlete-motion.svg` | Athlete introductory art-only slot | no overlap workouts/numerics |
| journal empty | `assets/empty-journal.svg` | confirmed-empty illustration; not a loading/error/partial state | no false absence of eating |

**Exact art CSS safety contract:** `.app-shell[data-bloom-visual="premium"] .bv-editorial-hero[data-bv-art][data-bv-art-safe="true"]` activates noninteractive pseudo-element at right 1rem, top 50%, max width `min(30%,220px)`, opacity `.18`, pointer-events none, z-index 0; child content foreground z-index 1. At ≤639px max width 110px/opacity `.07`; at forced-colors disable art; at **200% zoom / cramped headings / error**, remove the attribute or hide the element, not a fact. The developer must capture the actual DOM/rects at 320, 390, 768, 1440 and zoom before setting the safety flag. If no verified text clearance, leave the slot disabled. Do not insert structural wrappers without UX approval.

**Critical implementation observation:** a pseudo-element with `z-index:0` does not by itself reserve textual room. For a permitted hero art, UX must approve either an existing, genuinely empty right-side pocket, or a purely decorative `<img>` placed in its already-owned optional illustration slot. **Do not add `padding-right` to the primary CTA container to make room** without UX/Architect approval. If art and text compete, hide art.

## 5. State paint matrix (all R3 fixture rows)

| State (existing UX source) | Visual-only treatment | Forbidden visual implication |
|---|---|---|
| loading | `.bv-state-loading`: soft mist–porcelain skeleton shimmer 1.6s linear; label remains real status, not decorative pseudo-content; reduced-motion makes static | don't show stale value as new |
| empty (confirmed successful source) | mist inset, optional empty-journal figure max 128px, readable first action | no “zero eaten” conclusion |
| partial / unknown | a 2px dashed brand under-rule **plus explicit text** `Partial` or `Unknown`, numeric tables keep `null` | never convert null to zero |
| error | porcelain + thin `#AD675B` border and required retry/status text | no red “poor health” indicator |
| review / unsaved | paper inset + 1px forest hairline, visible unsaved copy | not a successful save |
| saving | existing busy action + static/dynamic (reduced-motion) tiny inline activity indication; do not alter mutation semantics | not confirmed |
| confirmed saved | natural acknowledgement and `bv-save-confirmed` 260ms animation only after server receipt | no optimistic fake receipt |
| research / contradictory | research surface, dashed conceptual link and explicit limitations text | not a personal effect |
| conflict / revision | neutral surface with rose 1px boundary, visible correction options | no silent overwrite |
| revoked / disconnected | neutral muted connection appearance plus explicit disconnected text | no implied active data sync |
| planned Athlete | navy surface with neutral outlined status and text `Planned` | not performed work |
| completed Athlete | cyan point marker plus word `Completed` | only actual completed session |

## 6. Motion parameters (nonessential and bounded)

| Effect | Class / trigger | Duration / easing | Reduced-motion |
|---|---|---|---|
| Hero entrance | `.bv-hero-enter` on genuine first mount only | 280ms `cubic-bezier(.2,.8,.2,1)`, 5px vertical | none |
| Saved confirmation | `.bv-save-confirmed[data-save-state="confirmed"]` after server receipt | 260ms same ease, scale .992→1 | none; keep text |
| Chart reveal | `.bv-chart-ink[data-chart-ready="true"]` on newly loaded real series | 420ms same ease, fade only | none; underlying true data always present |
| Loading skeleton | `.bv-state-loading` when UX's source really loading | 1600ms linear background shimmer | static mist panel |

Never animate a scientifically meaningful data value to a fabricated intermediate number, autoplay infinite organ/organism motion, or announce persistence based on animation.

## 7. Mandatory acceptance decisions the Architect must close (non-Designer ownership)

| ID | Decision still required | Owner | Codex must NOT guess |
|---|---|---|---|
| A-01 | D1 frozen commit SHA, PR, preview and final asset source hashes | Architect/Developer | yes |
| A-02 | D2/D8 remove in-progress **owner checkpoint stop** per latest owner direction; final owner review before main only | Architect | yes |
| A-03 | D3 approve art slots and conditional markup with UX safety at 320/390/768/1440/200% | UX + Architect | yes |
| A-04 | D4 mobile bottom nav item count and existing mode routing; retain source current unless explicitly changed | UX + Architect | yes |
| A-05 | D5 approved copy keys and single-section quiet source wording; semantic checks | Branding + UX | yes |
| A-06 | D6 exact stylesheet import/cascade, current owner and long-lived flag/no-flag parity | Developer + Architect | yes |
| A-07 | D7 animation and empty-state art included in v0.6 premium milestone (approved aesthetic defaults in §6) | Architect | yes |
| A-08 | Verified actual app screenshots and independent visual pass after implementation before main | Developer + Designer + User Review + Architect | yes |

**Review timing clarification:** no user reviews needed during development as explicitly requested; developer should not block progress on owner's Today screenshot decision. Internal cross-agent visual QA after implementation is still required, and the final owner review immediately precedes publishing to main. Codex builds complete seven-destination premium milestone, not a sequence of public aesthetic patch releases.

## 8. Acceptance gate (what “pixel-perfect” means without faking evidence)

- Every *design-owned* color, type face/fallback, material, border, spacing, art scaling, state treatment and icon use is traceable to this Appendix or the canonical CSS asset; any divergence gets a numbered PR note and Designer disposition.
- Existing UX state/structure, the one truthful next action, and scientific provenance are preserved. The mockup is not a substitute for actual source-aware content or approved component hierarchy.
- Compare real after screenshots to design references at 390/1440 and also check 320/768, 200% zoom, keyboard, light/dark, Athlete, forced colors and reduced motion, including loading/empty/partial/review/error/confirmed/research states. Do not label references “AFTER ACTUAL APP”.
- **Do not self-certify visual completion from code/CI.** Designer verdict by route: VISUAL PASS / VISUAL FAIL / NOT VERIFIED; UX verdict separately, Architect accepts integration. Owner reviews the finished complete application before main.
- One premium build acceptance; no partial “premium finish” declared after Today.

## 9. Findings prioritized for the Brand/Architect combined master

| Finding | Severity | Required action |
|---|---|---|
| R3-01 729 `TO COMPLETE` occurrences; source calls itself UX BASE R3 | BLOCKS “final comprehensive” label | Branding, Architect and Developer fill their owned exact fields and resolve template duplicates before formally freezing final contract. This Designer Appendix fills **visual** design only. |
| R3-02 R3 transport ZIP embeds v2.3; v2.4 richer art/typography pack exists separately | HIGH | Architect selects canonical visual version and republishes corrected package/hash; no duplicate sheets. |
| R3-03 Older R2 owner Today GO vs user's latest final-review-only instruction | HIGH | Architect reconcile D2/D8 explicitly: internal Today QA, no user stop, final user review before main. |
| R3-04 Hard-coded layout grid and CTA placement cannot be chosen by Designer under lane contract | HIGH | UX supplies exact geometry or declares existing CSS geometry binding. Do not force mock screenshot grid. |
| R3-05 Art slots unverified in actual DOM | HIGH | Developer selector inventory + UX overlap testing before setting `data-bv-art-safe`. |
| R3-06 Screenshots and complete visual acceptance absent | FINAL RELEASE BLOCKER | capture true application across states/themes and submit for Designer/UX/User Review/Architect review before main. |
| R3-07 Typography, accent colors, states and visual paint originally incomplete | RESOLVED IN DESIGNER APPENDIX | use exact values/one CSS version; no CSS code improvisation. |

**Designer decision:** the premium art direction is approved for coordinated implementation **subject to exact integrated master source/version resolution**, not released as visually finished. This append-only completion document preserves the Brand/UX master intact while telling Codex precisely what is and is not authorized.


---

# APPENDIX U — STRUCTURAL UX R4 CLOSURE (LATER, UX-AUTHORITATIVE)

# BLOOM — Premium Production R4: Structural UX Decisions Closed and Implementation Contract

**Owner:** Structural UX Agent • **Date:** 2026-11-07 • **Status:** UX DESIGN DECISIONS COMPLETE / RUNTIME TESTS NOT YET EXECUTED • **Repo:** `knagle-max/BloomGutHealth` • **Target:** `enhance/bloom-experience`.

**Effective precedence:** This appendix supplements `Bloom_Master_Build_Spec_R3_With_Designer_Appendix_2026-11-07.md`; it supersedes earlier **UX-owned** `TO COMPLETE` and contradictory owner-checkpoint instructions. It **does not** overwrite the Designer's actual visual decisions, Branding's copy, Architect's deployment decisions, or runtime evidence. No new arbitrary workflow gate is created. Implement now on the development branch; seek final owner review before main.

## 1. Deterministic integration rules — UX decisions closed

| ID | Resolved structural decision | Implementation consequence / proof |
|---|---|---|
| UX-01 | **Seven distinct journeys; no one-template-for-all hero.** Shared visual tokens may recur, but task hierarchy follows each route's existing source state. | Today=action; Food=entry/review/receipt; Biology=selected interpretation/source; Explore=research question/evidence; Progress=observed change; Athlete=next session and status; Profile=settings/privacy. |
| UX-02 | **Today contextual primary action always wins over decorative reference CTA.** | Preserve `TodayFocus.tsx` current `todayContextAction` and `useWellnessChoices`; when selected action is eligible render its active CTA, and retain Add food as secondary when applicable. |
| UX-03 | **Everyday bottom navigation remains three primary destinations** (Today, My biology, Progress). Athlete retains its five existing destinations. | Verified `client/src/components/BottomNav.tsx`. Food via Today/Add food, Journal via navigation menu; Profile via menu/header. Never eliminate desktop `AppNavigation.tsx` destinations. 320px/zoom overflow is a QA fixture, not permission to silently remove destinations. |
| UX-04 | **Art cannot displace content.** Each artwork placement is optional progressive enhancement. | CSS-only `::before/::after` on a verified inert region, or one decorative `<img alt="" aria-hidden="true">` when Architect approves a concrete insertion. Avoid duplicate alt announcements, clickable art and aria-hidden ancestor of real controls. Suppress at collision breakpoints/states and forced-colors. |
| UX-05 | **No fixed two-column ratio is mandated by Structural UX.** | At desktop, preserve source reading order; Designer may style existing valid multi-column containers. At 390 and 320 collapse to a single semantic column. No CSS `order`/grid reordering of CTA, alert, source or receipt. Existing workspace geometry is default until Architect approves structural reflow. |
| UX-06 | **Only one prominent primary action per active task region.** | Secondary links remain available as text/link controls. Selection changes CTA synchronously with state; draft/review/receipt determine the next safe action. |
| UX-07 | **Single section-level quiet provenance** plus per-observation evidence in expanded details. | Source label appears once adjacent to the most relevant section; detailed tables still show required date, unit, method or evidence for each observation. No source suppression where method differs across rows. |
| UX-08 | **Preserve dedicated loading/error/empty/partial/review/saving/saved/research/conflict states.** | Error is never shown as empty; stale cached data can remain visible with refreshing status; saved requires persisted receipt; conflicts require user review, no silent overwrite. |
| UX-09 | **Only Profile is the editing home for shared display units.** | Progress displays converted read-only values and links to Profile; preserve all existing unit types, their underlying canonical observations and source units. Moving editor means preserving functional access, not deleting functionality. |
| UX-10 | **No invented visual telemetry.** | No implied trend across missing dates, synthetic readiness/disease scores, fictitious microbiome organism proportions or plausible-looking mock readings in real UI. Decorative graphics must be distinguishable from user measurements. |
| UX-11 | **Flatten paint-only first.** Remove border/shadow layers when safe; only remove actual DOM wrappers if they have no landmarks, headings, form grouping, loading/error boundaries or focus behavior. | Nested semantic groups remain even where their visual border is removed. Functional components and query boundaries are reused. |
| UX-12 | **Today is internal calibration, not a development stop.** | Capture today 390/1440 promptly and send to Designer/UX; continue independent Food/Biology/Explore/Progress/Athlete/Profile work. Owner reviews complete application before main. |

## 2. Authoritative files and existing selectors (source inspected 2026-11-07)

| Experience | Source mapping verified | What Developer must preserve |
|---|---|---|
| Today | `client/src/pages/Dashboard.tsx` `.bloom-dashboard`, `.dashboard-heading`; `client/src/components/TodayFocus.tsx`; `CompanionHero.tsx` `.today-focus`, `.today-focus-actions`, `.today-focus-reason`; `TodayFoodSummary.tsx` `.flagship-nourishment`; `TodayStatus.tsx` | Dynamic action; source-aware meal summary; movement source disclosure; partial/error states |
| Food | `client/src/pages/LogMeal.tsx`, `client/src/pages/NutritionHistory.tsx`, `client/src/components/FoodEntryChooser.tsx`, `client/src/components/FoodProgress.tsx` | Meal method selection, review-before-save, dated history, receipt, unknown nutrition, source detail |
| Biology and Gut | `client/src/pages/PrecisionNutrition.tsx`, `client/src/pages/Microbiome.tsx` | Report identity/date/source, qualitative vs numeric separation, method and limitations |
| Explore | `client/src/pages/Explore.tsx` `.relationship-card` and research/source components | Concept associations never reclassified as personalized results; category evidence |
| Progress | `client/src/pages/Progress.tsx` `.progress-domain-tabs`, `#progress-measurements`; `FoodProgress.tsx` `.food-progress-plot`, `.food-progress-days` | Dated x coordinates, partial visual label, full detail observations, distinct source states |
| Athlete | `client/src/pages/AthleteWorkspace.tsx` `RecordedSessionStatus`, `SessionForm`, `HydrationForm`, `SessionEdit`, `CompetitionTools` | Session planned/completed/cancelled; working saves/revisions; measured vs planned quantities |
| Profile | `client/src/pages/Profile.tsx` `.profile-workspace`, `#profile-account`, `#nutrition-profile` | Dirty/unsaved state, profile unit editor, privacy and conflict behavior |
| Shell | `client/src/components/AppNavigation.tsx`, `BottomNav.tsx`, `client/src/workspace.css` | All existing routes, active state, focus, nav destination consistency |

**This table verifies file existence/source anchors, not complete route mounting, DOM collision safety or deployed functionality.** Developer records exact router configuration, component import chain and frozen SHA in PR as an implementation fact, not a new UX decision.

## 3. Per-screen final UX composition: element precedence and flattening

| Screen | Visible surface (first 3 seconds) | Middle task region | Deep disclosure and exact evidence | Safe flattening; prohibited changes |
|---|---|---|---|---|
| Today | Page h1/date; source-state-aware contextual hero title, reason, one primary action | TodayFoodSummary and TodayStatus, then inspiration/other links | `Why this?`, sources and limitations; nutrition detail | Replace unnecessary visual inset rectangles with dividers, but preserve `TodayFocus` logic and CTA, `TodayStatus` links |
| Food | Page h1, method chosen or one obvious entry action | ingredient/portion review with explicit unsaved/save/receipt distinction; journal history once saved | original input, estimated vs known composition, per-meal source and correction | Flatten individual candidate subcards; never make an entry appear saved before a receipt; photo/scan icon isn't a scanner promise |
| Biology/Gut | Selected report/context summary with source/date and plain-language, evidence-qualified significance | observation groups and report selection/history accessible without making management the only takeaway | methods, collection details, taxa/functional hypotheses separated, old analyses | Flatten numeric dashboards but preserve source/method identities and different evidence grades |
| Explore | Search/topic/question plus clear “general research” boundary | relationships and filters, one next exploration action | source/limitations/negative evidence, studies and cohorts | Open editorial relationship grouping, no personal clinical inference or hidden citations |
| Progress | Observed trend or statement insufficient comparable records; timeframe/source at surface | Nutrition/Activity/Biology tabs and date-aware charts | numerical plot scale, explicit coverage, daily/table results, methods and original unit | Flatten chart frame, keep axis/legend; remove duplicated edit controls only when Profile link functional |
| Athlete | Training/session heading; planned vs completed state; one pertinent action | set/repetition/hydration/fueling controls and history as relevant to active sub-route | source events, saved revisions, hypotheses separated from sensor data | Flatten decorative set cards; preserve actual form grouping and all five nav entries |
| Profile | Page h1; account/settings entry and status; no fake “wellness score” | appearance, canonical units, connections, save/unsaved controls | consent, export/deletion, source revisions and measurement history | Flatten setting wrappers, never privacy confirmation, errors or dirty indicators |

**A page can contain multiple semantic sections but only one active above-fold task emphasis.** A visual reference's sample hero/CTA does not authorize replacing an existing task-specific structure.

## 4. Seven-screen artwork slot decisions — implementation-ready default behavior

The Designer's artwork selection and paint are authoritative, but the UX insertion behavior is now determined. **The default is optional art on existing noninteractive containers, never a hard dependency for actions.** The Developer must still measure real overlap; do not claim art-slot PASS without a screenshot.

| Slot | Verified candidate / task | UX-approved insertion strategy | Suppress in these cases | Status |
|---|---|---|---|---|
| TODAY-HERO | `.today-focus` / `CompanionHero` with action+reason | Add `data-bv-art` + `data-bv-art-safe="true"` to verified inert hero; pseudo-element with pointer-events:none; never wrap controls | 320px, 200% zoom, long title, errors, action expansion if overlapping; hide rather than relocate CTA | CONTRACT APPROVED; actual collision NOT TESTED |
| TODAY-JOURNAL-EMPTY | `TodayFoodSummary` confirmed no meals after successful query | One decorative image in empty-only branch, *after* textual empty heading/CTA in reading order | loading, failed query, partial known records, not-yet-hydrated sources | CONTRACT APPROVED; rendering NOT TESTED |
| FOOD-FIRST | `FoodEntryChooser` verified initial chooser | CSS decorative pocket or one trailing empty-alt image | selected method/edit/review/saving/error and narrow zoom where displaced | CONTRACT APPROVED; rendering NOT TESTED |
| BIO-INTRO | `PrecisionNutrition`/`Microbiome` non-data introduction | abstract illustration only beside a narrative, not against organism chart | report-source error, crowded method summaries, 320/zoom, forced colors | CONTRACT APPROVED; rendering NOT TESTED |
| EXPLORE-INTRO | `Explore` research context | research schematic beside nonpersonal research label | where conflicts with search/filter or source details, forced colors | CONTRACT APPROVED; rendering NOT TESTED |
| PROGRESS-EMPTY | `Progress` source-success insufficient-record state only | approved empty illustration outside plots | any measured plot, failed load, scale/axis or partial records present | CONTRACT APPROVED; rendering NOT TESTED |
| ATHLETE-INTRO | `AthleteWorkspace` inactive illustration region | approved presentational asset in hero/header only | while editing sets, live session status/error, mobile/zoom collision | CONTRACT APPROVED; rendering NOT TESTED |
| PROFILE-INTRO | optional Profile noninteractive top description | **Not required**: omit decorative art if it competes with account/consent actions | any form, dirty warning, conflict, privacy control, narrow screens | CONTRACT APPROVED; rendering NOT TESTED |

**Exact DOM/paint bridge:** canonical CSS uses `.app-shell[data-bloom-visual="premium"]` opt-in; `data-bv-art-safe="true"` means only “this particular container is approved for decorative CSS,” not “passed real-device testing.” Do not set it on a wrapper that includes nested labels/controls unless artwork placement leaves an established text safe region. At responsive failure remove art rather than shift functional elements. Preserve `alt="" aria-hidden="true"`; if art communicates unique functional meaning it is *not* decorative and must return to UX for semantic treatment.

## 5. Navigation and responsive interaction rules (closed)

- **Everyday mobile bottom:** three items **Today, My biology, Progress** as currently implemented. Add food is accessible via existing Today primary/secondary actions and existing menu; do not add new tab. Profile accessible through mobile header/menu, at most two clear taps from Today; if current menu structure fails, create a semantic “Profile & settings” header/menu link without changing bottom bar.
- **Athlete mobile bottom:** preserve five **Training, Fueling, Journal, Recovery, Compete**. At 320px, ensure each rendered control has 44px usable width/height, visible text (wrap label up to two lines), and safe-area bottom padding; if horizontal fit impossible at 200% zoom, allow vertical/scrollable menu alternative with all five routes rather than clipping or silently reducing destinations. Any new fallback remains keyboard accessible and preserves active page.
- **Desktop:** retain navigation groups including `More tools` and `Manage`; map selected route to `aria-current="page"`. Reveal active sub-route within groups; no fake logo controls.
- **Hierarchy:** page `h1` once; route section headings `h2`; within section `h3`. Optional local section title may be omitted only when a meaningful accessible label exists and heading continuity remains. CTA and error announced before optional details. No CSS `order` for reading order.
- **Targets/focus:** every primary action and nav control at least 44 CSS px usable target; `:focus-visible` styling from Designer canonical CSS; visible label for icon buttons; no hover-exclusive information.
- **Zoom/reflow:** at 320/390/768/1440 and 200% zoom, no horizontal document overflow, except intentional scroll on an explicitly labeled data-table region; preserve input visibility and state text. 200% zoom may trigger mobile navigation geometry but must not bury Profile/privacy or retry actions.

## 6. Operational fixture matrix — exact source states, not mock personal data

Fixtures below are data contracts for automated/integration screenshot fixtures. **Developer owns deterministic seed values and exact IDs**; no fabricated clinical scores are allowed. Use a synthetic account with stable records only and isolate it from production accounts.

| Route | Fixture IDs and required independent states | Expected controls/semantics |
|---|---|---|
| Today | `TODAY-FIRST`, `TODAY-RECORDED`, `TODAY-PARTIAL`, `TODAY-CHOSEN`, `TODAY-PAUSED`, `TODAY-FAILED`, `TODAY-ATHLETE` | Specific action from actual action-selection function; failure doesn't make intake zero; source disclosure |
| Food | `FOOD-FIRST`, `FOOD-METHOD`, `FOOD-DRAFT`, `FOOD-REVIEW`, `FOOD-PARTIAL`, `FOOD-SAVING`, `FOOD-SAVED`, `FOOD-ERROR`, `FOOD-CONFLICT` | Review-before-save; portions and source; confirmed receipt only after server save |
| Biology/Gut | `BIO-NONE`, `BIO-LOADING`, `BIO-SELECTED`, `BIO-QUAL`, `BIO-QUANT`, `BIO-PARTIAL`, `BIO-ERROR`, `BIO-RESEARCH`, `BIO-HISTORY`, `BIO-REVOKED` | Provider score ≠ abundance; test date/method and unavailable states remain |
| Explore | `EX-FIRST`, `EX-SEARCH`, `EX-RELATION`, `EX-RESEARCH`, `EX-PARTIAL`, `EX-ERROR`, `EX-CONFLICT`, `EX-NONE` | General research disclaimer and sources, no personalized implication |
| Progress | `PR-NONE`, `PR-RECORDED`, `PR-PARTIAL`, `PR-SINGLE`, `PR-INCOMPAT`, `PR-ERROR`, `PR-ACTIVITY`, `PR-ATHLETE` | Time positions reflect dates; no line across missing days; source/detail observations |
| Athlete | `AT-EMPTY`, `AT-PLANNED`, `AT-COMPLETED`, `AT-CANCELLED`, `AT-DRAFT`, `AT-SAVING`, `AT-SAVED`, `AT-ERROR`, `AT-PARTIAL`, `AT-CONFLICT` | Planned ≠ completed; actual sets and measured hydration only; receipt after save |
| Profile | `PF-FIRST`, `PF-RECORDED`, `PF-EDIT`, `PF-UNSAVED`, `PF-SAVING`, `PF-SAVED`, `PF-CONFLICT`, `PF-ERROR`, `PF-REVOKED`, `PF-PRIVACY` | No source reauthorization implied by decoration; explicit save/conflict/privacy |

**Required browser acceptance** for every meaningful fixture: correct action+route, source/date/unit, status text, focus order, click/keyboard, 320/390/768/1440, 200% zoom, Everyday light/dark and Athlete where supported, forced colors and reduced motion. Until actual execution, test result = **NOT TESTED**, not PASS. Capture screenshot metadata (`branch SHA`, `route`, `fixture`, `mode`, `theme`, `width`, `DPR`, `locale`, `date/timezone`, `preview URL`).

## 7. UX meaning policy for the Branding copy table — approved now

Branding owns final wording and key IDs. UX approves these semantic contracts; exact copy is not pre-approved without seeing its text.

| Copy type | Exact meaning constraint | Safe example pattern, **NOT final Branding copy** |
|---|---|---|
| Source label | At most one **section-level** source label; row details show method where varying | “From your saved [source] record, collected [date].” |
| Empty | Empty log only means no entries in available source; never no intake or zero nutrients | “No saved entries for this period.” |
| Partial | Distinguish known totals, unknown fields and source coverage | “Some recorded values are unavailable; shown numbers are known contributions.” |
| Error | Name affected source and offer a specific retry | “Your saved [source] couldn't be loaded. Try again.” |
| Unsaved | Draft exists only locally | “Review these details before saving.” |
| Saving | Pending server result | “Saving your changes…” |
| Saved | Persisted server response, not optimistic UI | “Saved to your journal.” |
| Conflict | Concurrent/stale version, user decides next action | “This record changed since you opened it. Review before saving again.” |
| Research | Cited evidence relates to studied populations, not user biomarker effects | “Research context—not a measurement or prediction about you.” |
| Revoked | Previous access not active | “This source is no longer connected.” |
| Planned | Future intent, never performance fact | “Planned session.” |
| One observation | Not a trend | “One recorded date; more dates are needed to show change.” |

**Copy integration:** keys under `today.*`, `food.*`, `biology.*`, `explore.*`, `progress.*`, `athlete.*`, `profile.*`; dynamic action title/label and provider-native scientific terms come from existing trusted runtime state. Any new text changing claims requires UX semantic review; stylistic text-only changes can ship without another round of master documentation. There is no UX-owned wording placeholder left for Developer to invent.

## 8. Production component contract and integration

The attached `PremiumSectionBoundary.tsx` is a complete typed React example for an opt-in section boundary, **not a command to replace existing page shells wholesale**. It accepts final Branding copy as props; `titleClassName` and `takeawayClassName` leave paint to Designer; `headingLevel` supports h2/h3, and `accessibleLabel` covers intentionally untitled sections. Union states are `loading`, `empty`, `error` (retry), `ready` (partial/refreshing), `review` (unsaved), `saving`, `saved` (requires receiptId), `research` (limitation). No hard-coded copy; no fake saved state; no decoration. Source label occurs once.

**Explicit integration fix from R2:** R2's first example mapped saved state to `bv-state-review`; R4 removes that incorrect mapping. R4 also adds explicit `saving`, handles accessible section label and disables pending action. Designer may style a dedicated saved state by adding a scoped class; Developer must not accidentally show review paint on saved receipt.

**Wiring checks:**
1. `useQuery` error vs successful empty vs background refreshing—caller maps correct union kind.
2. `review` and `saving` never use `saved` until response receipt supplies an ID.
3. `sourceLabel` comes from the current account's permitted source; never carry another account's stale cache.
4. The component does not compute nutrition, date aggregation, risk or research findings, nor invoke mutation outside an explicit action callback.
5. Existing component-specific retry, `If-Match`, focus restoration and safe save behavior remain canonical.

## 9. One-stage PR implementation ledger — NO DOCUMENTATION STOP

| Packet | Developer action | Acceptance evidence |
|---|---|---|
| S0 | Pin branch SHA, inspect router/app-shell/CSS imports and approved assets | PR inventory, exact hashes and paths |
| S1 | Use Designer R3 single canonical scoped CSS; stage Batch 1 icons separately; resolve duplicate assets and animation precedence in an asset-slot mapping | one import, one active art per slot, no style leakage |
| S2 | Today source-preserving hero + art; 390/1440 real screenshot and states | actual images, not mock; internal calibration |
| S3 | Food entry/review/receipt; rewrite visual wrappers only | save/error/unknown fixtures and 390 screenshot |
| S4 | Biology report meaning-first; source-specific caveats intact | report/date/method fixtures, 390 screenshot |
| S5 | Explore question-led research, not personal score | evidence/limitation 390 screenshot |
| S6 | Progress meaning-first, faithful dated chart, Profile-only unit editor | missing/single/incompatible records tests |
| S7 | Athlete status and activity controls preserved | planned/completed/cancelled + saved receipt tests |
| S8 | Profile complete settings, consent/privacy and conflict | all settings functions, dirty/conflict tests |
| S9 | Browser/device matrix + Designer, UX, User Review and Architect acceptance, owner sees consolidated experience before main | screenshot parity and signed result |

**This handoff closes UX decisions, not unperformed work.** `NOT TESTED` remains on actual art collision, focus/reflow, full-state screen rendering, keyboard and visual parity until Codex supplies an authenticated running application and screenshots. No new broad engineering hold is authorized; fix a defective screen while other packets continue.

## 10. Ownership and remaining non-UX dependencies (explicit, no guessing)

| Owner | Exact completion required | Is this a stop-all-work gate? |
|---|---|---|
| Branding | finalized route/state strings and lengths; current runtime dynamic labels preserved until reviewed | No |
| Designer | active R3/Batch1 asset winner mapping, final art positions/colors, one motion cascade; real screenshot visual pass | No |
| Architect | frozen branch SHA, exact import/route map, source/hash ledger, reconcile D1–D8 and master source version | No |
| Developer | actual code integration, deterministic fixtures, tests, live screenshot matrix | No |
| User Review | independent 3-second and task success evaluation on real app | Final acceptance evidence, not implementation stop |
| Owner | complete premium product review before main | Final publication decision |
| Structural UX | structural contracts in §§1–9 | **COMPLETE ON PAPER; RUNTIME VERIFICATION NOT TESTED** |

**Do not claim the overall master spec is completely signed or the production UI is finished until the above tasks have actual outputs.** No developer should infer the missing paint/copy/asset/version values. All known independent implementations can proceed now.


## Attached executable example

The following file is included separately in the transport ZIP as `PremiumSectionBoundary.tsx`, rather than inlined here. It is a reference for the Developer to integrate selectively, not verified as compiled in the repository.

---

> **R4 Designer integration revision · 2026-11-07**  
> This copy preserves the preexisting R4 master and UX R4 closure, and appends the Graphic Designer's later 87-SVG asset-closure specification. Any earlier wording that treats the seven starter SVGs or Batch 1 alone as the complete deliverable is superseded by Appendix V. The canonical archive for production illustration assets is `Bloom_Production_Assets_Final_Batches_1_to_6_2026-11-07.zip`; the canonical premium CSS remains the single scoped stylesheet from the approved v2.4/R3 Designer Completion Package. No package constitutes deployed acceptance. **No interim owner review; owner reviews complete integrated product before main.**

## APPENDIX V — GRAPHIC DESIGNER FINAL ASSET CLOSURE (R4 CANONICAL INTEGRATION)

**Date:** 2026-11-07  
**Owner:** Visual & Graphic Designer  
**Status:** Asset production complete; NOT implemented / NOT rendered-app accepted.  
**Applies to:** Branding R3 master, Designer R3 Appendix A, Architect R2, approved UX Code Bridge.  
**New canonical asset artifact:** `Bloom_Production_Assets_Final_Batches_1_to_6_2026-11-07.zip`. Its `manifest.json` provides SHA-256 for **all 87 individual SVGs** and for the bundled stylesheets. Old batch ZIPs remain historical inputs; **do not load asset duplicates or earlier competing CSS.**


## V0. R4 additive resolution and implementation source map

| Source domain | Authoritative production input | Scope/precedence |
|---|---|---|
| R4 interaction, DOM and user journeys | Existing R4 master, including Appendix U | Unchanged; UX authority |
| R4 visual layout, typography, palette | Existing Designer appendix in this R4 and the canonical `bloom-visual-scoped.css` from v2.4/R3 Designer package | One CSS import; no competing skins |
| All illustrations, icons, individual state art | `Bloom_Production_Assets_Final_Batches_1_to_6_2026-11-07.zip` | 87 individual SVGs; source file bytes and hashes in consolidated asset manifest |
| Additional motion source | `batch-1-original/motion.css` inside final asset archive | OPTIONAL. Resolve per-trigger duplication with canonical CSS; do not blindly import both |
| Source label / provenance | Existing trusted app data / R4 UX copy semantics | Never generated from illustration or display fixture |
| Owner signoff | R4 finish gate | Final full-application review before main, not a Today checkpoint |

**Resolution of earlier R4 narrative:** The older `S1`/`S2` implementation ledger is a permissible internal order, not an authorization to stop after Today for owner review. The old R4 sentence referring to "Batch 1 icons separately" remains valid only as a file grouping within the final Batches 1–6 archive. In all route art mappings prefer Appendix V; avoid introducing two different hero images in a single slot. `TO COMPLETE` entries in inherited tables are not automatically solved by this artwork addition; each keeps its assigned owner until approved. This revision does not silently approve outstanding Architect D1–D8 or Branding string decisions.

**Asset verification:** The final archive and manifest are provided as exact transport files. Each file must be verified at import SHA by Developer; this revision itself is a specification and transport update, not proof of a repository commit or of a live screenshot.

## B1. Resolution of remaining art coverage

This completes the code-authored production asset inventory for existing approved destinations: 20 Batch 1 icons, 5 Batch 1 illustrations, 50 additional SVGs (Batches 2–5), and 12 final workflow-specific state SVGs in Batch 6. All 87 SVGs use the approved hard-coded Everyday/Athlete colors, or `currentColor` for icons. No SVG embeds text, external assets, scripts, gradients, or fonts. This **does not** create or approve new routes, score concepts, health claims, CTA placements, navigation entries or state machines.

**Priority and precedence:** For each actual screen, the existing source-aware action and UX-owned structure take priority over showing decorative artwork. The illustration should be absent rather than obscure a label, result, unit, uncertainty, evidence link, or interactive control. Art placements are conditional on Architect-approved slots and DOM verification at frozen SHA.

## B2. New Batch 6: exact file and situation table

| Asset file (inside final ZIP) | Route | Existing state / permissible element | Semantics / restraint | SHA-256 prefix (full hash in manifest) |
|---|---|---|---|---|
| `batch-6-final-states/state-consent-revoked.svg` | /profile | revoked permissions | do not imply active connection | `8a9500df62b1abaf…` |
| `batch-6-final-states/state-device-sync-pending.svg` | /athlete; /profile | pending source sync | requires real pending source | `26c9e4a3aa143fe6…` |
| `batch-6-final-states/state-no-search-results.svg` | /explore | empty results after search | not unavailable server | `62daa9dd0aea719d…` |
| `batch-6-final-states/state-no-training-history.svg` | /athlete | no sessions saved | planned not completed | `c5d86501fe6c2358…` |
| `batch-6-final-states/state-offline.svg` | shared | offline read or reconnect | do not imply no records | `833e13db7cece4ca…` |
| `batch-6-final-states/state-partial-nutrition.svg` | /nutrition; /log-meal | partial nutrient panel | partial source; unknown not zero | `1a4830a81faeaec5…` |
| `batch-6-final-states/state-save-uncertain.svg` | /log-meal; /athlete | unsure save receipt | never show confirmed | `a650abd23a618fab…` |
| `batch-6-final-states/state-source-conflict.svg` | /profile | draft revision conflict | does not resolve a conflict | `45a684d971bfd809…` |
| `batch-6-final-states/state-source-import-review.svg` | /microbiome; /precision | import-review unsaved | not yet validated data | `04e9966a7fb12222…` |
| `batch-6-final-states/state-source-stale.svg` | /profile; /progress | last sync/source summary | stale, not measured fresh | `19bfbb951b05c010…` |
| `batch-6-final-states/state-sparse-progress.svg` | /progress | insufficient comparable dates | no inferred trend | `5b4f6f7d1d33e5b3…` |
| `batch-6-final-states/state-unavailable-measurement.svg` | /progress | unknown measurement | no falsely continuous line | `9010c8d35af6f2c1…` |

All 12 are viewBox `0 0 480 480`, transparent SVG, `alt=""` and `aria-hidden="true"` when used with real text status. Their visibility must be derived from **existing actual state**, not from route alone. Never show an uncertain save asset after confirmed persistence, or a success asset without a verified receipt. Do not infer absence of records from a pending source, or disconnected status from a mere sync delay.

## B3. Installation and exact source precedence

1. **Do not modify pre-existing approved Bloom logo/app icons.** No new app icon, favicon, mascot, stock photography, or external font is mandated by the premium-production scope. Branding/Architect should separately audit existing app identity assets.
2. Move `batch-1-original/*.svg`, `batch-2-heroes/*.svg`, `batch-3-states/*.svg`, `batch-4-food-science/*.svg`, `batch-5-system-onboarding/*.svg`, `batch-6-final-states/*.svg` into a versioned public path, retaining group and filename to avoid collision. E.g. `client/public/brand/visual-v3/<batch-name>/<filename>`; Architect/Developer approve actual path. No duplicate paths for `hero-athlete.svg` and `athlete-motif.svg`.
3. **One canonical premium visual skin:** `styles/bloom-visual-scoped.css` (source from R3 Designer package, copied unchanged and hashed in final ZIP). Load once after `workspace.css` and activate only behind `.app-shell[data-bloom-visual="premium"]`. This is not permission to load old v2, v2.2, v2.3 or `supporting-asset-classes.css`. The canonical CSS includes historic dark/Athlete overrides in addition to the constrained SVG palette; this appendix does not independently approve new paint colors.
4. `styles/motion.css` from Batch 1 is **optional source code**, not a second visual theme. Some durations/keyframes overlap canonical v2.4: Developer must inventory classes, choose **one implementation for each trigger**, and record the selected source for each animation in the integration table; do not import both blindly. No motion confirms a save before server receipt. Respect `prefers-reduced-motion`, and use no animated interpolation of scientific outcomes.
5. **Icon rule:** icons use `currentColor`, 24px viewBox, 1.75px round stroke; text semantics live in parent accessible button/link/status. Existing accessible icon components can be retained if equivalent; never introduce mismatched double icons or invent nav items.
6. If an art slot cannot safely place an SVG at 320/390/768/1440 and 200% zoom, omit/hide it there and record a deviation. Art remains decorative; no art-only inaccessible semantics. Confirm forced-colors and dark variants visually.

## B4. Route completeness checklist for Developer / review

| Route(s) | Primary artwork | Relevant state/spot assets | Nonvisual condition / check |
|---|---|---|---|
| Today `/` | `batch-1-original/hero-today.svg` | `empty-journal.svg`, state-partial-nutrition, state-source-stale | Existing Today contextual action, confirmed journal vs partial unknown; no universal CTA |
| Food `/log-meal`, `/nutrition` | `batch-2-heroes/hero-food.svg` | food spots, empty-food-plan, state-save-uncertain, state-source-import-review | Source-aware parsing/review, servings, receipt and account owner |
| Biology `/precision`, Gut Reports `/microbiome` | `batch-2-heroes/hero-biology.svg` | empty-biology-report, empty-labs, conceptual science spots, state-source-import-review | Source report method/date, no fabricated quantities; conceptual tags |
| Explore `/explore` | `batch-2-heroes/hero-explore.svg` | empty-explore, state-no-search-results, conceptual pathway/organism | Research only unless validated personal observation; study limitations reachable |
| Progress `/progress` | `batch-2-heroes/hero-progress.svg` | empty-progress, state-sparse-progress, state-unavailable-measurement | Real date spacing and comparable methods; no fake trend, no zero fill |
| Athlete `/athlete` | `batch-2-heroes/hero-athlete.svg` or existing `athlete-motif.svg` (Designer chooses on rendered view; never both in same hero) | empty-athlete, state-no-training-history, state-device-sync-pending | Planned and completed distinct; no fictional readiness |
| Profile `/profile` | `batch-2-heroes/hero-profile.svg` | empty-connections, state-consent-revoked, state-source-conflict, state-source-stale | Draft revision preservation, permission truth, privacy controls not obscured |
| Shared states | No mandatory hero | state-error, state-permission, state-not-found, state-offline, state-success | Use only on actual server-authoritative state; message and retry control always readable |

## B5. Required visual QA and status

- The new 12 state SVGs were parsed, color/dependency validated and rasterized at 480px. The **complete 87-file library** was XML parsed, SHA-256 indexed, and checked for disallowed SVG structures/colors. A representative earlier hero/icon SVG was rasterized as a spot check. This is **static asset QA**, not a browser/device acceptance.
- Designer must review **actual** after screenshots with same source-safe fixtures as before, across 320/390/768/1440, 200% zoom, Everyday light/dark and Athlete, keyboard, reduced motion and forced colors. Sketch/reference art is never a screenshot of the running app.
- Developer owns inclusion, real source-state binding, import chain and tests. Structural UX owns art-slot safety/DOM sequence. Branding owns strings. Chief Architect reconciles source/copy/route conflicts. No user interim review: owner final review immediately precedes merge to main.
- Remaining unresolved work is **integration and signoff, not a request to invent more decorative assets.** Do not describe the app as visually finished before the real rendered screens pass.

## B6. Change record and final Designer disposition

**NEW** Batches 1–6 consolidated in one source archive; **NEW** Batch 6 adds 12 state-specific illustrations; **UNCHANGED** original Batch 1–5 SVG bytes; **UNCHANGED** single canonical v2.4 visual CSS; **ADDED** manifest with file-size and SHA-256 for all assets.

**Designer asset disposition:** `ASSET LIBRARY COMPLETE FOR CURRENT R3 SCOPE / VISUAL IMPLEMENTATION NOT VERIFIED`. This appendix supersedes older statements that the 7-SVG starter illustration set represents all available art. It does not override the UX screen contracts or Architect decisions.


---

# APPENDIX B — BRAND COPY CONSOLIDATION (R4 ADDITIVE; SUPERSEDES BRANDING-OPEN PLACEHOLDER FOR AUTHORING)

**Copy authored and integrated; Branding Agent final signoff not independently verified.** The earlier `TO COMPLETE — Branding` references refer to original tables; use the completed keys in this appendix as the working copy. All original Designer Appendix V, Batch 6 mapping, UX closure and earlier R4 text are preserved unchanged. This appendix does not attest live implementation.

# Bloom — R4 Brand Voice & Seven-Route Microcopy Production Completion

**Date:** 2026-11-07 · **Version:** R4-COPY-CONSOLIDATION-01 · **Scope:** seven experience groups, common states and runtime-owned content

**Provenance/approval:** This is assistant-authored, implementation-ready *proposed* copy grounded in `Bloom_Brand_Strategy_UX_Product_Evolution_Handoff_2026-11-06.md`, Branding/UX Continuity v1.5, and R4 UX meaning contracts. A standalone final BRAND-R2-VOICE deliverable or Branding Agent's signature was not located in the accessible shared Library. Therefore **do not represent these strings as signed off by the Branding Agent**. They are a complete working copy set; the Branding Agent can approve/edit in place without blocking independent implementation.

## A. Voice guide

**Three traits:** Warm without false familiarity; lucid without clinical jargon; precise without overconfidence.

**Sentence rules:** User-first action verbs; short sentences on the primary surface; one supported takeaway and next action; explain exclusions and uncertainty near the claim; no guilt, shame or competitive health scores; research is not the user's measured outcome; use dates, methods and units only when sourced; avoid saying a save succeeded before a confirmed receipt; respect already localized/runtime-generated labels.

**Primary-surface vocabulary to avoid:** Dashboard, Metrics, Overview, Compliance, Patient, Biomarker Optimization, Deficiency Detected, Guaranteed, Fix Your Gut, Your Microbiome Needs, Perfect Day, Failed Goal, Cheat Meal, Detox, AI Doctor. Terms may remain in technical or legal contexts where accurate; this is not an instruction to rename technical fields.

**Provenance rule:** Show a quiet, accessible source statement **once per section**, with per-row distinctions where methods or providers differ; never hide the source of an individualized claim. Static `*.source` is a fallback label only, not a substitute for provider/date metadata.

**Source precedence:** Current user-specific action strings, values, units, report names, collection times, consent and persistence states always come from the existing trusted runtime. These strings are not a replacement for those data bindings.

## B. Before/after examples (new proposals grounded in brand strategy)

| Avoid | Prefer |
|---|---|
| Your gut needs more diversity. | Your report lists these organisms. Explore what research says about them. |
| You consumed zero nutrients today. | No nutrient amounts were recorded for today. |
| Patient Dashboard | Today |
| Data synchronization failed. | Your connected information could not update. Try again. |
| You reached your optimal readiness score. | Your recorded training information is ready to review. |
| AI recommends this treatment for you. | Research has explored this idea; it is not a personal treatment recommendation. |

## C. Copy table (204 exact keys including 11 runtime-reserved keys)

| Route | Component/state | Key | String or runtime instruction | Character limit |
|---|---|---|---|---|
| today | default/contextual | `today.eyebrow` | A day at your pace | 70 |
| today | default/contextual | `today.h1` | A little more clarity for today. | 70 |
| today | default/contextual | `today.takeaway` | Begin with what matters to you. Your next step can be simple. | 100 |
| today | default/contextual | `today.focusLabel` | A useful next step | 70 |
| today | default/contextual | `today.primaryFallback` | Add food | 70 |
| today | default/contextual | `today.secondary` | Explore your options | 70 |
| today | default/contextual | `today.journalTitle` | Today so far | 70 |
| today | default/contextual | `today.journalEmpty` | No meals saved today. You can begin whenever it suits you. | 70 |
| today | empty | `today.empty` | Start with a meal or a goal. Reports and devices are optional. | 70 |
| today | partial | `today.partial` | Some saved meals have missing nutrient details. Known amounts are shown; unknown amounts remain unavailable. | 108 |
| today | loading | `today.loading` | Checking today’s saved information… | 70 |
| today | error | `today.error` | Your saved day could not load. You can try again. | 70 |
| today | default/contextual | `today.retry` | Try again | 70 |
| today | reviewUnsaved | `today.reviewUnsaved` | Review your choice before confirming it. | 70 |
| today | saving | `today.saving` | Saving your choice… | 70 |
| today | saved | `today.saved` | Your choice is saved. | 70 |
| today | saveUncertain | `today.saveUncertain` | We could not confirm that your choice was saved. Check before trying again. | 90 |
| today | default/contextual | `today.researchLimit` | Background research helps explain ideas; it does not measure your response. | 100 |
| today | default/contextual | `today.source` | Based on the records currently available to Bloom. | 70 |
| today | conflict | `today.conflict` | Your saved information has changed. Review the latest version before continuing. | 100 |
| today | stale | `today.stale` | Some connected information may be out of date. See its last recorded date. | 90 |
| today | default/contextual | `today.paused` | Suggestion paused for this visit. | 70 |
| today | default/contextual | `today.chosen` | Your selected option is ready. | 70 |
| today | default/contextual | `today.athlete` | Training plans can help shape your next step when they are available. | 70 |
| today | default/contextual | `today.why` | Why this step? | 70 |
| food | default/contextual | `food.eyebrow` | YOUR FOOD JOURNAL | 70 |
| food | default/contextual | `food.h1` | Make room for the meals that matter. | 70 |
| food | default/contextual | `food.takeaway` | Record what you ate, then check the details before saving. | 100 |
| food | default/contextual | `food.primary` | Add a meal | 70 |
| food | default/contextual | `food.secondary` | Review food journal | 70 |
| food | default/contextual | `food.section` | Your recorded food | 70 |
| food | empty | `food.empty` | No meals saved for this period. That does not mean you ate nothing. | 70 |
| food | partial | `food.partial` | Some nutrient amounts are unknown. Available totals include only known recorded contributions. | 100 |
| food | loading | `food.loading` | Checking your saved meals… | 70 |
| food | error | `food.error` | Your food journal could not load. Try again to see your saved entries. | 70 |
| food | default/contextual | `food.retry` | Retry journal | 70 |
| food | reviewUnsaved | `food.reviewUnsaved` | Review the foods, portions and uncertain details before saving. | 70 |
| food | saving | `food.saving` | Saving your meal… | 70 |
| food | saved | `food.saved` | Your meal has been saved to your journal. | 70 |
| food | saveUncertain | `food.saveUncertain` | We could not confirm this meal was saved. Check your journal before submitting it again. | 90 |
| food | default/contextual | `food.source` | Amounts come from the foods and sources recorded in this journal. | 70 |
| food | default/contextual | `food.researchLimit` | Food research offers context, not a measured personal effect. | 100 |
| food | conflict | `food.conflict` | This meal changed while you were editing. Review the latest version before saving. | 100 |
| food | default/contextual | `food.unavailable` | Nutrient amount unavailable | 70 |
| food | default/contextual | `food.missingDays` | Unlogged days are not plotted as zero. | 70 |
| food | default/contextual | `food.edit` | Review or correct this meal | 70 |
| food | default/contextual | `food.unknownPortion` | Portion needs review | 70 |
| food | default/contextual | `food.allergy` | Check ingredients and allergy information before saving. | 70 |
| food | default/contextual | `food.noMatch` | No matching foods found. Try another description or add details manually. | 90 |
| food | default/contextual | `food.confirmedEntries` | Saved food entries | 70 |
| biology | default/contextual | `biology.eyebrow` | YOUR BIOLOGY | 70 |
| biology | default/contextual | `biology.h1` | Understand the information you have. | 70 |
| biology | default/contextual | `biology.takeaway` | See what your records report, what they cannot tell you, and what deserves a closer look. | 100 |
| biology | default/contextual | `biology.primary` | Review your reports | 70 |
| biology | default/contextual | `biology.secondary` | Explore the science | 70 |
| biology | default/contextual | `biology.section` | Your recorded observations | 70 |
| biology | empty | `biology.empty` | No reports saved here yet. You can still use Bloom without one. | 70 |
| biology | partial | `biology.partial` | Some report fields are missing or cannot be compared. Only supported observations are shown. | 100 |
| biology | loading | `biology.loading` | Checking saved reports… | 70 |
| biology | error | `biology.error` | Your saved reports could not load. Try again to review them. | 70 |
| biology | default/contextual | `biology.retry` | Retry reports | 70 |
| biology | reviewUnsaved | `biology.reviewUnsaved` | Review the source, date and matching details before importing. | 70 |
| biology | saving | `biology.saving` | Saving reviewed report details… | 70 |
| biology | saved | `biology.saved` | Your reviewed report details are saved. | 70 |
| biology | saveUncertain | `biology.saveUncertain` | We could not confirm this report was saved. Check your reports before retrying. | 90 |
| biology | default/contextual | `biology.source` | Reported by the selected source on its recorded date. | 70 |
| biology | default/contextual | `biology.researchLimit` | Research about organisms and pathways is not a measurement of your own pathway activity. | 100 |
| biology | conflict | `biology.conflict` | A source record changed. Review the revised report before continuing. | 100 |
| biology | stale | `biology.stale` | This result reflects its collection date, not necessarily today. | 70 |
| biology | default/contextual | `biology.methods` | How this result was reported | 70 |
| biology | default/contextual | `biology.incompatible` | These observations use different methods or definitions and are not shown as one trend. | 90 |
| biology | default/contextual | `biology.notMeasured` | Not measured in this report | 70 |
| biology | default/contextual | `biology.providerScore` | This is a source-reported score, not a direct abundance measurement. | 70 |
| biology | revoked | `biology.revoked` | This source is no longer connected. | 70 |
| explore | default/contextual | `explore.eyebrow` | EXPLORE THE WHY | 70 |
| explore | default/contextual | `explore.h1` | Follow your curiosity. | 70 |
| explore | default/contextual | `explore.takeaway` | Explore foods, organisms and molecules through research, with uncertainty kept in view. | 100 |
| explore | default/contextual | `explore.primary` | Explore a topic | 70 |
| explore | default/contextual | `explore.secondary` | See your biology | 70 |
| explore | default/contextual | `explore.section` | Research to explore | 70 |
| explore | empty | `explore.empty` | No topics matched this search. Try a broader term. | 70 |
| explore | partial | `explore.partial` | Some research details are unavailable. The available references are shown. | 100 |
| explore | loading | `explore.loading` | Looking through research topics… | 70 |
| explore | error | `explore.error` | Research topics could not load. Try again. | 70 |
| explore | default/contextual | `explore.retry` | Retry search | 70 |
| explore | reviewUnsaved | `explore.reviewUnsaved` | Review your selection before adding it to your saved topics. | 70 |
| explore | saving | `explore.saving` | Saving your selection… | 70 |
| explore | saved | `explore.saved` | Your selection is saved. | 70 |
| explore | saveUncertain | `explore.saveUncertain` | We could not confirm this selection was saved. Check your saved topics. | 90 |
| explore | default/contextual | `explore.source` | Based on the research sources linked in this section. | 70 |
| explore | default/contextual | `explore.researchLimit` | Findings from studies are not a personal measurement, diagnosis or guaranteed effect. | 100 |
| explore | conflict | `explore.conflict` | This saved selection has changed. Review it before continuing. | 100 |
| explore | default/contextual | `explore.noResults` | No results for those terms | 70 |
| explore | default/contextual | `explore.evidence` | What the evidence says | 70 |
| explore | default/contextual | `explore.limits` | What we do not know | 70 |
| explore | default/contextual | `explore.personality` | Research context, not a personal finding | 70 |
| explore | default/contextual | `explore.methods` | Study details and limitations | 70 |
| progress | default/contextual | `progress.eyebrow` | YOUR PROGRESS | 70 |
| progress | default/contextual | `progress.h1` | See change in context. | 70 |
| progress | default/contextual | `progress.takeaway` | Look at what you recorded over time, with gaps and differences clearly marked. | 100 |
| progress | default/contextual | `progress.primary` | Review your trends | 70 |
| progress | default/contextual | `progress.secondary` | Add a record | 70 |
| progress | default/contextual | `progress.section` | Your recorded timeline | 70 |
| progress | empty | `progress.empty` | No records are available for this selection yet. | 70 |
| progress | partial | `progress.partial` | Some records are incomplete. Missing values are not treated as zero. | 100 |
| progress | loading | `progress.loading` | Checking recorded history… | 70 |
| progress | error | `progress.error` | Your recorded history could not load. Try again. | 70 |
| progress | default/contextual | `progress.retry` | Retry history | 70 |
| progress | reviewUnsaved | `progress.reviewUnsaved` | Review the date, source and units before saving this measurement. | 70 |
| progress | saving | `progress.saving` | Saving your measurement… | 70 |
| progress | saved | `progress.saved` | Your measurement has been saved. | 70 |
| progress | saveUncertain | `progress.saveUncertain` | We could not confirm this measurement was saved. Check your history before retrying. | 90 |
| progress | default/contextual | `progress.source` | Shown from the recorded source and date for each observation. | 70 |
| progress | default/contextual | `progress.researchLimit` | Changes over time do not, on their own, show what caused them. | 100 |
| progress | conflict | `progress.conflict` | This observation has changed. Review the latest record before saving. | 100 |
| progress | default/contextual | `progress.onePoint` | One recorded date is not enough to show a trend. | 70 |
| progress | default/contextual | `progress.incompatible` | These results cannot be compared reliably across source or method. | 70 |
| progress | default/contextual | `progress.missing` | Measurement unavailable | 70 |
| progress | default/contextual | `progress.correction` | This data looks wrong | 70 |
| progress | default/contextual | `progress.units` | Change display units in Profile | 70 |
| progress | default/contextual | `progress.compare` | Compare recorded dates | 70 |
| athlete | default/contextual | `athlete.eyebrow` | YOUR TRAINING DAY | 70 |
| athlete | default/contextual | `athlete.h1` | Make space for how you move. | 70 |
| athlete | default/contextual | `athlete.takeaway` | Keep plans, completed sessions and fueling records clear and separate. | 100 |
| athlete | default/contextual | `athlete.primary` | Record a session | 70 |
| athlete | default/contextual | `athlete.secondary` | Review fueling | 70 |
| athlete | default/contextual | `athlete.section` | Your training records | 70 |
| athlete | empty | `athlete.empty` | No training sessions saved for this period. | 70 |
| athlete | partial | `athlete.partial` | Some session details are missing. Recorded details are shown without filling gaps. | 100 |
| athlete | loading | `athlete.loading` | Checking your training records… | 70 |
| athlete | error | `athlete.error` | Your training records could not load. Try again. | 70 |
| athlete | default/contextual | `athlete.retry` | Retry training records | 70 |
| athlete | reviewUnsaved | `athlete.reviewUnsaved` | Review your session details before saving. | 70 |
| athlete | saving | `athlete.saving` | Saving your session… | 70 |
| athlete | saved | `athlete.saved` | Your session has been saved. | 70 |
| athlete | saveUncertain | `athlete.saveUncertain` | We could not confirm the session was saved. Check your records before retrying. | 90 |
| athlete | default/contextual | `athlete.source` | From the training records you saved or connected. | 70 |
| athlete | default/contextual | `athlete.researchLimit` | General training research does not establish your personal readiness or response. | 100 |
| athlete | conflict | `athlete.conflict` | This session changed while you were editing. Review the latest entry. | 100 |
| athlete | default/contextual | `athlete.planned` | Planned session | 70 |
| athlete | default/contextual | `athlete.completed` | Completed session | 70 |
| athlete | default/contextual | `athlete.cancelled` | Cancelled session | 70 |
| athlete | syncPending | `athlete.syncPending` | A connected activity source has not finished syncing. | 70 |
| athlete | default/contextual | `athlete.noReadiness` | No validated readiness estimate is available. | 70 |
| athlete | default/contextual | `athlete.hydration` | Record hydration | 70 |
| profile | default/contextual | `profile.eyebrow` | MAKE BLOOM YOURS | 70 |
| profile | default/contextual | `profile.h1` | Your information, your choices. | 70 |
| profile | default/contextual | `profile.takeaway` | Manage what Bloom remembers, how information appears, and which sources you allow. | 100 |
| profile | default/contextual | `profile.primary` | Review your settings | 70 |
| profile | default/contextual | `profile.secondary` | Manage your data | 70 |
| profile | default/contextual | `profile.section` | Your settings and sources | 70 |
| profile | empty | `profile.empty` | No connected sources are listed. You can still add information manually. | 90 |
| profile | partial | `profile.partial` | Some settings or source details are unavailable. Review before changing them. | 100 |
| profile | loading | `profile.loading` | Checking your settings… | 70 |
| profile | error | `profile.error` | Your settings could not load. Try again. | 70 |
| profile | default/contextual | `profile.retry` | Retry settings | 70 |
| profile | reviewUnsaved | `profile.reviewUnsaved` | You have changes that are not saved. | 70 |
| profile | saving | `profile.saving` | Saving your settings… | 70 |
| profile | saved | `profile.saved` | Your settings have been saved. | 70 |
| profile | saveUncertain | `profile.saveUncertain` | We could not confirm these settings were saved. Check before trying again. | 90 |
| profile | default/contextual | `profile.source` | Source access and last update are shown for each connection. | 70 |
| profile | default/contextual | `profile.researchLimit` | Adding information does not guarantee a specific recommendation or outcome. | 100 |
| profile | conflict | `profile.conflict` | Your settings changed elsewhere. Review the latest version before saving. | 100 |
| profile | revoked | `profile.revoked` | This source is no longer connected. | 70 |
| profile | syncPending | `profile.syncPending` | This source is waiting to finish syncing. | 70 |
| profile | stale | `profile.stale` | The latest available record may be out of date. | 70 |
| profile | default/contextual | `profile.privacy` | Privacy, access and export | 70 |
| profile | default/contextual | `profile.delete` | Review deletion options | 70 |
| profile | default/contextual | `profile.consent` | Manage permissions | 70 |
| profile | default/contextual | `profile.units` | Display units | 70 |
| shared | default/contextual | `shared.offline` | You appear to be offline. Saved information may still be available. | 70 |
| shared | default/contextual | `shared.retry` | Try again | 70 |
| shared | default/contextual | `shared.close` | Close | 70 |
| shared | default/contextual | `shared.back` | Back | 70 |
| shared | default/contextual | `shared.more` | Learn more | 70 |
| shared | default/contextual | `shared.expand` | Show details | 70 |
| shared | default/contextual | `shared.collapse` | Hide details | 70 |
| shared | default/contextual | `shared.review` | Review details | 70 |
| shared | default/contextual | `shared.source` | Where this information came from | 70 |
| shared | default/contextual | `shared.unknown` | Not available | 70 |
| shared | default/contextual | `shared.notRecorded` | Not recorded | 70 |
| shared | default/contextual | `shared.notConnected` | Not connected | 70 |
| shared | stale | `shared.stale` | Last updated on {date} | 70 |
| shared | saved | `shared.saved` | Saved | 70 |
| shared | default/contextual | `shared.unsaved` | Unsaved changes | 70 |
| shared | error | `shared.error` | Something could not load. Try again. | 70 |
| shared | default/contextual | `shared.noData` | No saved records available | 70 |
| shared | default/contextual | `shared.methods` | Sources and methods | 70 |
| shared | default/contextual | `shared.research` | Research context | 70 |
| shared | default/contextual | `shared.edit` | Edit | 70 |
| shared | default/contextual | `shared.skip` | Not now | 70 |
| shared | default/contextual | `shared.confirm` | Confirm | 70 |
| shared | default/contextual | `shared.cancel` | Cancel | 70 |
| today | dynamic | `today.focusTitle` | EXISTING RUNTIME: todayContextAction / selected wellness choice; never replace with generic static headline | runtime |
| today | dynamic | `today.focusReason` | EXISTING RUNTIME: action.reason and evidence/limits | runtime |
| today | dynamic | `today.focusCTA` | EXISTING RUNTIME: selected action.linkLabel or appropriate action; preserve context | runtime |
| food | dynamic | `food.nutrientValues` | EXISTING RUNTIME: recordedFoodPeriod and nutrientDisplay; never replace missing with zero | runtime |
| food | dynamic | `food.receiptId` | EXISTING RUNTIME: server save receipt only | runtime |
| biology | dynamic | `biology.observationLabel` | EXISTING RUNTIME: provider report term with source and method | runtime |
| biology | dynamic | `biology.collectionDate` | EXISTING RUNTIME: original collection date and revisions | runtime |
| explore | dynamic | `explore.citation` | EXISTING RUNTIME: article/study title URL plus evidence class | runtime |
| progress | dynamic | `progress.trend` | EXISTING RUNTIME: only validated comparable dated observations; no fabricated narrative | runtime |
| athlete | dynamic | `athlete.trainingStatus` | EXISTING RUNTIME: planned/completed/cancelled, never inferred | runtime |
| profile | dynamic | `profile.permissions` | EXISTING RUNTIME: actual scope and current authorization status | runtime |

## D. Implementation and meaning rules

1. The attached `bloomCopy.ts` exports `bloomCopy` as a typed, read-only object. It does not automatically change current UI text. Integrate each key only where the corresponding real state and route exist.
2. Apply `empty` only after successful source response confirms no entries; a loading, offline, revoked, stale or error result is never empty.
3. Apply `saved` only after a confirmed server receipt; use `saveUncertain` if confirmation fails or is ambiguous, and offer check-before-retry. Never duplicate a mutation blindly.
4. Preserve `todayContextAction()` and selected wellness action headline and CTA dynamically; static `today.h1` belongs to the page heading only.
5. Bind user and date values in trusted runtime; `shared.stale` has `{date}` placeholder, not a literal date.
6. Keep page heading levels and labels semantic. A key with fixed wording does not authorize adding a control, score, feature, route, or modifying a clinical claim.
7. For a research relationship, cite study/source and limitation within the same section; no inferred personal effect or diagnosis.
8. Dynamic provider or science terminology cannot be overwritten with more marketing-friendly text if that changes source meaning.
9. Longest strings must be tested at 320px and 200% zoom; limits above are planning thresholds, not permission to truncate meaning.
10. No completed Branding Agent approval is inferred; changes affecting scientific truth require Structural UX/science review before release.

## E. Outstanding evidence, not missing authored copy

- Branding Agent countersignature: NOT VERIFIED; review and edit this complete table rather than generating a separate proposal.
- Developer integration of keys into live components: NOT IMPLEMENTED IN THIS PACKAGE.
- Screenshot line wrapping, error focus behavior, translations and runtime parity: NOT TESTED.
- Architect final integration/source-version choice and release approval: NOT VERIFIED.
