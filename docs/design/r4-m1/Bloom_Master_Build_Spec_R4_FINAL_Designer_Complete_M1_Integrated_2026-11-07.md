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