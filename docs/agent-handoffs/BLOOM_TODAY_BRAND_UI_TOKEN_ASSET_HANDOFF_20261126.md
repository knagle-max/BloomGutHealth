# Bloom — Today: Brand/UI Visual Hierarchy, Tokens & Asset Reuse Handoff

**Handoff ID:** BRAND-TODAY-20261126-R1 · **Date:** 2026-11-26 · **Status:** PROPOSED SOURCE-INSPECTED BRAND SPECIFICATION; no new code, new imagery, medical approval, runtime QA or release authorization.
**Exact UX source reviewed:** Library `/Bloom gut health/Agent Handoffs/Bloom_Today_Brand_UX_Handoff_2026-11-26.md`, `UX-TODAY-BRAND-20261126-R1` (60 lines), read in full. The source's Nov 9 `main` comparison is historical, not proof of the present deployed app.
**Current code reviewed on** `knagle-max/BloomGutHealth` / `enhance/bloom-experience`: `client/src/pages/Dashboard.tsx`, `TodayFocus.tsx`, `TodayStatus.tsx`, `TodayFoodSummary.tsx`, `CompanionHero.tsx`, `WellnessChoiceDetails.tsx`, `EverydayStart.tsx`, `client/src/content/editorial-media.ts`, `client/src/styles/bloom-visual-scoped.css`, `docs/visual-assets/visual-asset-registry.json`. No current browser images, real records or deployed-screen appearance tested.
**Standing visual requirements:** [Shared agent instruction](BLOOM_STANDING_BRAND_UI_VISUAL_HIERARCHY_AND_TOKENS_20261126.md), [full token mandate](../../design/visual-system/STANDING_UI_VISUAL_HIERARCHY_AND_TOKENS_20261126.md), and [specialist succession](../../design/visual-system/SPECIALIST_HANDOFF.md). UX owns information architecture, CTA placement, component ordering and disclosure; Brand specifies appearance/tokens; Architect reconciles and selects eligible tasks; Codex builds/tests; Biology/Security review applicable source/claim/safety boundaries.

## 1. Brand verdict — preserve the premium companion; don't commission for novelty

**TODAY = ACT.** It is the warmest, most human destination of Bloom, as distinct from My Biology = Understand and Progress = Observe. The first screen must have **one source-eligible next step**: editorial, reassuring, purposeful, never punitive, clinical, overprescriptive or cluttered.

**NO NEW ORIGINAL GRAPHIC ASSETS ARE JUSTIFIED RIGHT NOW.** BVA-0001 approved Today botanical hero and existing `EditorialMedia("today")`, approved Bloom iconography, existing empty-journal art and Lucide Eat/Move/Recover glyphs already cover the conceptual roles. Do not create a bespoke morning/afternoon/evening illustration set, new wellness icons, recovery gradients or a "daily score" badge to fill a layout. The design job is **visual integration and clear state styling**. A new asset request requires a demonstrated specific production slot/gap on a current render and owner/Designer review.

**Current source facts:** `Dashboard.tsx` already renders a Today heading/date, `TodayFocus` contextual action, `TodayFoodSummary`, `ActivityRoutines`, `TodayStatus` and an existing food journal with links; additional details and sources are mostly disclosures. `TodayFocus` already delegates action selection to `todayContextAction` and `useWellnessChoices`, handles paused, errors and source freshness, and supplies `Why this?`, Adjust/Skip and source details. `CompanionHero` already supports dynamic CTA/reason and approved media; `TodayStatus` already renders Eat, Move, Recover grounded in canonical records. `TodayFoodSummary` separately summarizes food. **Potential duplication:** TodayFoodSummary and TodayStatus both show food, while the journal and nutrition disclosure repeat it; this is a UX hierarchy/reuse check, not permission for Brand to delete data or change component functionality. Today's current journal is fundamentally food-centric; the source UX's **multi-domain journal, Quick Log sheet and temporal composition are proposals**, not already shipped.

## 2. Asset audit — keep, adapt or defer

| Existing ID / source | Current state / design decision | Designer action |
|---|---|---|
| **BVA-0001 Today editorial hero** / `editorial-media.ts` `today` | Canonical BVA says approved replacement source; runtime mapping currently has meadow WebP and matching SVG. Source manifest and live image may not be same owner-approved revision. | **REUSE.** Verify source hash/current real render; crop/placement studies only; choose narrow side/supporting art without pushing CTA below fold. Do not redraw. |
| `CompanionHero` + Bloom brand icon | Working semantic component and logo source; no missing asset | **REUSE.** Improve typography, contrast, CTA dominance and spacing, not a new hero art component. |
| `TodayStatus` Lucide Utensils/Activity/Moon | Three live icons already in code | **REUSE.** Shared 16px optical weight; retain text labels and recorded/source states. No standalone new icon commission. |
| **BVA-0008 Empty Food journal** + `journal-empty` | Existing mapped SVG, BVA registry status Identified rather than fully acceptance-verified | **REUSE subject to file/runtime proof**; if inadequate, improve empty-state UI typography/action first. No new picture currently warranted. |
| `TodayFoodSummary`, existing food journal | Working canonical summaries in source | **REUSE** real unit/count/partial messaging; tune visual weight and avoid repeated equally strong sections. |
| **BVA-0027 No activity recorded** | Briefed/rejected earlier design; no accepted new candidate | **NOT A TODAY BLOCKER.** Today already uses "Not recorded" text in Move. Commission only if authorized standalone Activity screen actually requires a rich empty state; not for Today decorative parity. |
| `WellnessChoiceDetails` + source disclosures | Existing choice/status/why states | **REUSE**; style as intentional compact disclosures, not decorative stack of choice cards. |
| Existing five-method food capture / canonical editors | Existing functionality per UX, specific components not independently re-audited here | **NO NEW IMAGE / FORM**. Any quick-log menu must route to current authorized capture methods, not duplicate forms. |

**No new BVA ID or image procurement.** Any `today` media revision conflict is a **delivery/manifest reconciliation task**, not a commission for a second illustration. No stock hero image as final. Existing BVA registry remains the single image asset authority; these **TODAY-UI** IDs are interface handoff deliverables only.

## 3. Editable UI design deliverables — design work, not artwork requests

| ID | Priority | Real design deliverable | Scope / states |
|---|---|---|---|
| **TODAY-UI01** | P0 | Next-step component composition on current `CompanionHero` / `TodayFocus` | Valid eligible non-food action, food fallback, chosen-but-not-performed, active Athlete session, morning/midday/evening *only where actual action differs*. Primary CTA unmistakable; Why/Adjust/Skip quieter. |
| **TODAY-UI02** | P0 | Hero/source choice state matrix | Loading, context stale, error/retry, paused/Show suggestion, partial nutrition, no records, safety/material warning, successful save. Text & accessible state; avoid false achievement. |
| **TODAY-UI03** | P1 | Day-so-far Eat/Move/Recover strip | Recorded, not recorded, planned, partial, estimated, unknown, fetching and failed state. Match existing `TodayStatus`, no phantom progress rings. |
| **TODAY-UI04** | P1 | Dated food-journal preview and source navigation | 2–3 actual current events, empty/loading/error, edit/deep link, View all. Multi-domain event rows are **future conditional** until UX/Architect authorizes verified event types. |
| **TODAY-UI05** | P1 conditional | Quick Log launcher/sheet design | Only after UX/Architect approves actual supported routes. Food, Activity and authorized Pain/Measurement; existing five food methods preserved in their canonical capture flow. One CTA per active state. |
| **TODAY-UI06** | P0 | Shared theme/typography/spacing/CTA state and responsive redline sheet | Exact current Everyday/Athlete × Light/Dark tokens + proposed component-only values, anti-clutter checks, 320/390/768/1440, 200% zoom. |
| **TODAY-UI07** | P0 | Visual QA and source-meaning storyboard | Initial, selected/paused, drawer/disclosure, empty/error, lower fold; real-vs-placeholder manifest, focus/keyboard/safe area, same-SHA browser screenshot **when available**. |

**Commission NOW:** UI01/UI02/UI03/UI04/UI06/UI07 as design review work, **only if actual current screenshots show need**; preserve already compliant existing components. **Conditional:** UI05; do not commission a separate screen pack or icon set until the product supports it. This scope is not authorization for new sources or algorithms.

## 4. UI Visual & Design Token Specification — TODAY

### 4.1 Role-based palette, existing source tokens

Read actual computed styles in the selected build. `bloom-visual-scoped.css` exposes the following role tokens on the premium shell; Athlete Light overrides some but not all roles.

| Semantic role | Everyday Light | Everyday Dark | Athlete Light | Athlete Dark |
|---|---|---|---|---|
| Canvas `--bv-canvas` | `#F8F9F3` | `#101C17` | `#F8F9F3` | `#0F1B2E` |
| Supporting paper `--bv-paper` | `#F5F3EB` | `#192B24` | `#F5F3EB` | `#17263E` |
| Raised card/sheet `--bv-porcelain` | `#FFFEFA` | `#22382E` | `#FFFEFA` | `#182B45` |
| Primary ink `--bv-forest` | `#173E32` | `#EFF6EE` | `#0F1B2E` | `#F1F6FF` |
| Strong ink `--bv-forest-strong` | `#102B25` | `#FFFFFF` | `#0F1B2E` | `#FFFFFF` |
| Interactive `--bv-brand` | `#246B50` | `#A6DEBA` | existing `hsl(var(--primary))` | `#81BEFF` |
| Secondary `--bv-secondary` | `#52685C` | `#CADACF` | inherited/compute | `#C3D4E9` |
| Border, wash, focus | `--bv-line`, `--bv-mist`, `--bv-focus` | existing equivalents | compute active cascade | existing equivalents |

**Component-scoped semantic aliases, NOT new global palette:** `--today-canvas:var(--bv-canvas)`; `--today-next-surface:var(--bv-porcelain)`; `--today-secondary-surface:var(--bv-paper)`; `--today-ink:var(--bv-forest-strong)`; `--today-meta:var(--bv-secondary)`; `--today-primary:var(--bv-brand)`; `--today-selection:var(--bv-mist)`; `--today-border:var(--bv-line)`; `--today-focus:var(--bv-focus)`. Current CSS and color contrast must be audited in actual browser before shipping; no certification claimed.

### 4.2 Typography exact proposed screen values

| Role | px / weight / line-height / tracking | Notes |
|---|---|---|
| Page title/date | title 30px phone, 34px desktop / 600 / 1.16 / -0.02em; date 13–14px / 500 / 1.4 | One dominant page heading, actual local date |
| Next step title | 22px mobile, 26px desktop / 600 / 1.2 / -0.02em | Highest **action** visual weight |
| Section title | 18px / 600 / 1.3 | Day so far / Journal |
| Body and reason | 16px / 400 / 1.5 | One qualifying reason visible, no prose wall |
| Label/filter/action | 14px / 600 / 1.4 | Why/Adjust/Skip still visibly interactive |
| Record/source note | 13–14px / 450–500 / 1.45 | Essential caveats cannot be hidden as decorative microtype |
| Decorative eyebrow | 12px / 650 / 1.4 / +0.08em | 'YOUR NEXT STEP'; no health status claims |
| Recorded values | 18–20px / 650 / 1.2; tabular numerals | Match actual unit, time, counts; planned vs completed labelled |

Use existing approved `var(--font-sans)` and editorial heading font/fallback, not automatic remote font load. All scientific meaning delivered through live text, not image typography.

### 4.3 Geometry, elevation and first-fold rhythm

- Source UX 390×844 budget: header 88; next-step area **264**; day-so-far **144**; journal preview **124**; actions/context **144**; nav/safe **80**. Sum 844; 532px primary workspace. Desktop 1440×900: header 104, workspace 576, secondary 140, nav/spacing 80. **These are planning proportions, not fixed-height CSS.**
- At 320–390px, local content horizontal padding 16px unless shell already pads; at 768px 24px; at 1440px 32px; **avoid double-padding**.
- Main Next Step panel **one** elevated porcelain/calm warm surface with 20–24px interior gap/padding, radius 20–24px; approved media scaled to a supporting side/corner crop, not a full-bleed banner above CTA. If imagery increases first-fold height, remove/reduce imagery before compressing text or button.
- Day-so-far row: mostly flat, 3 compact columns or wrapping at 320/200% zoom, separators or whitespace—not three nested cards; 12px between icon/label/value and 8px internal text gaps.
- Journal rows: 52–64px minimum with real event time, event name, source/brief detail, chevron or edit affordance, thin divider; no large source icons per entry.
- Main CTA min 48px visual height, 14px radius, 16px horizontal padding. Secondary text actions each min 44px hit target, 8–12px gap. Selection chips 34–36px visual/44px tap if present.
- Sheet/drawer if later authorized: elevated porcelain, 24px exposed corner radius, opaque enough for legible text, viewport/keyboard-aware height and bottom safe-area inset, real focus trap and focus restore.
- Surface order **canvas → one prominent Next Step → unboxed/tinted three-part summary → flat dated journal → subordinate disclosures**. Avoid a wall of nested 26–28px panels with matching shadows. Current R4 material CSS has 26/28px cards; avoid piling a new shell on them.

### 4.4 Interaction state matrix

| Control/surface | Default | Hover / focus-visible | Active/selected | Disabled/loading/error |
|---|---|---|---|---|
| Primary contextual CTA | Strong readable Everyday forest or Athlete blue fill; actual eligible action label | Slight tonal tint on hover; **3px focus outline** and offset, no layout jump | pressed state with no false save | Disabled if action ineligible; loading announce status; error retains manual capture route |
| Secondary Add food / Quick log | Text or outline; never rivals eligible primary | visible underline/focus ring | routes to actual canonical capture | Missing sources don't block independent authorized capture |
| Why this? / Adjust / Skip | Clear 14px text, comfortable target | explicit focus | opened disclosure; Skip suppresses suggestion without marking done | paused shows only Show suggestion as recovery primary |
| Eat / Move / Recover | icon+label+real source value | row focus/hover tint | navigates actual source | Not recorded/partial/estimated/planned/cancelled distinct; no fabricated goal ring |
| Journal entry | real event time and summary | underline/tint + ring | opens canonical record/editor | failed fetch shows retry; missing event is not zero |
| Quick log sheet (conditional) | closed, trigger secondary | visible focus | supported category selected, existing capture flow opens | unsupported category absent; no dead icon or duplicate save |
| Hero media | approved decorative supporting art | no hover if not clickable | no synthetic interactive organ/plant effects | absent/failure leaves title, reason, CTA usable |

Styling may not reorder the source-selected CTA, hide reviewed safety warning, or replace 'intention saved' with 'completed'. A suggested action and a recorded action are distinct. Time-of-day art must not create unsourced claims.

### 4.5 Animation and accessibility

- 120–180ms quiet hover/selection tint; instant under reduced motion. No pulsing progress rings, pretend growth animations, predicated wellness trends or animated score blooms.
- Contrast: WCAG AA normal 4.5:1, nontext/focus 3:1 as applicable; verify actual composed values and all four theme states. Use 3px focus treatment from `brand.css` and 44px min controls; 200% zoom, 320 width, keyboard safe area/focus restoration.
- Material science/safety/consent caveats appear near affected action; source method/long descriptions in intentional "Why this?" disclosure, **not** a visually dominant audit.
- Exact status/refresh when changing account or local date; no yesterday's action presented as live personalized advice due to stale cache.

## 5. Screen-by-screen art direction and non-regression

**Next Step:** look like a premium editorial prompt, not a promotional banner: clear eyebrow, human-scale heading, one source-backed sentence, a single filled action. Existing art sits at the side/upper corner and can fade on 320px; do not crop or over-contrast it against text. Separate "Try this"/"Save for later" intention controls (when actually eligible) from real logging routes; show "Why this?" and "Adjust" quietly and accessibly.

**Day so far:** label Eat/Move/Recover with restrained equal-weight mini icons but do not give 3 equally large dashboard cards. The source status must be the visual hierarchy (meal count, confirmed session, or recorded sleep), followed by provenance. Text "Not recorded" is not a warning state. The distinct `TodayFoodSummary` shows more nutrition detail and can remain subordinate by UX-approved disclosure; its data is canonical.

**Journal:** keep a short dated preview and View all, with the existing food journal as first supported baseline. Do not imply `Dashboard` currently has a multi-domain unified journal. Pending pain/symptom and measurement row treatments should only be designed from real authorized source schemas. Sensitive observations in shared/device contexts must remain private.

**Quick Log:** preserve food's five existing methods and canonical review/save; if approved, a clean category launcher is a dynamic 44px-target sheet—not five new food-capture illustrations or a second form engine. The menu must only show actually available authorized capture routes and preserve drafts/back behavior.

## 6. Designer deliverable contract, gates and acceptance

Deliver **editable UI boards**, not static hand-drawn replacements for working Today code: TODAY-UI01..07 at 390×844 and 1440×900 (initial, one selected, loading/empty/error, paused, source ineligible, active workout as applicable), with 320/768 and 200% reflow notes, Everyday/Athlete light/dark, complete type/space/contrast/responsive tokens, source/asset IDs, provenance/rights, focus order and QA states. Use clearly marked synthetic demonstration content and actual current screenshots for before/after only when truly captured from the same build.

**Source UX T01–T16 remain unexecuted**; designer reports design conformity to T01/T03/T04/T09/T10/T13/T15/T16 while functional/security/science ownership applies to remainder. P0: erroneous action saved/choice conflation, account/date cache leak, source stale advice, broken logging, safety/privacy or essential accessibility. P1: buried CTA, cluttered first fold, competing secondary CTA, cramped 320px, source copy wall. P2: decorative crop/seasonal media polish. The source's "3 seconds" recognition goal is a proposed human-test threshold, not observed evidence.

**No new permanent image asset request. No registry rewrite.** If actual current screen reveals a genuine missing source illustration after artwork-reuse review, submit a *single bounded BVA change request* to the canonical registry with exact slot/alternatives, source rights, scientific meaning and real screenshot evidence—do not create speculative art variants.

**Architect/UX decisions needed:** whether to change current food-centered journal to unified, Quick Log route support and permission, current duplicated source summary hierarchy, time-specific display semantics, and which first fold can be made lean without losing existing details. The new three-step onboarding spec also must not overwrite Today for existing accounts or silently alter sources. Architect selects work through `NEXT_ACTIONS.md` and respects existing deployment holds. No rollout or build verification authorized by this branding spec.

**Final recommendation:** Keep Bloom's approved Today art. Commission **zero new graphics**. Deliver a tightly art-directed, token-exact **Today interface refinement** in which the real eligible action—not a decorative hero or fallback food button—is the focus, and the rest of the day's evidence reads with quiet clarity.
