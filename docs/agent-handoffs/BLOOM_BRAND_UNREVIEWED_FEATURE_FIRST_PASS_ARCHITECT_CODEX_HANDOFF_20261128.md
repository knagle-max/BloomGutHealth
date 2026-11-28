# Bloom — Brand Concurrence & Architect → Codex First-Pass UI Stewardship Contract

**ID:** BRAND-STEWARDSHIP-20261128-R1 · **Issued:** 2026-11-28 · **Status:** BRAND CONCURRENCE WITH OPERATIONAL CLARIFICATIONS; SHARED ARCHITECT HANDOFF. Not independent UX, science, rights, deployed UI, or release approval.
**Source of the owner directive:** Shared Library `/Bloom gut health/Agent Handoffs/Bloom_Unreviewed_Feature_Direction_Package_R2_2026-11-28.md` (`UX-STEWARDSHIP-20261128-R2`, 141 lines), **Part A is the complete verbatim owner directive**, and Part B is the UX specialist's proposed operational addendum. R2 supersedes R1 *only as the UX package*, not the original owner instruction. This Brand concurrence accepts the shared direction and numeric defaults **subject to current approved semantic tokens and task-specific contracts**; it does not erase any original wording.
**Verified code governance on** `knagle-max/BloomGutHealth` branch `enhance/bloom-experience`: root `AGENTS.md`, `NEXT_ACTIONS.md`, `design/visual-system/STANDING_UI_VISUAL_HIERARCHY_AND_TOKENS_20261126.md`, `design/visual-system/SPECIALIST_HANDOFF.md`, `docs/agent-handoffs/BLOOM_STANDING_ARCHITECT_TO_CODEX_UI_UX_BRAND_GOVERNANCE_20261126.md`, current `client/src/styles/bloom-visual-scoped.css`, and `docs/visual-assets/visual-asset-registry.json` (101 current BVA records at review). Source/readme inspection, **not** browser screenshot or runtime accessibility certification.

## Executive architect decision

**Concur with all six baseline requirements and the November 28 UX operational amendments.** Every *authorized* feature with a consumer UI must be designed as it is built. If there is a current reviewed feature-specific UX + Brand contract, use it; otherwise Codex writes a **compact provisional Page UX & Wireframe Specification** at task start, implements an intentional consumer experience in the same change, and records independent post-build Brand and UX status. A provisional screen may be functional without claiming final visual acceptance.

**Do not add a new feature epic, re-run a completed visual audit, block unrelated code pending mockups, or supersede the sole NEXT_ACTIONS task selector.** The standing standard governs HOW eligible work is done; it does not select WHAT comes next, authorize scientific features, introduce a design-review meeting on every commit, or lift deployment/privacy/anatomy/source restrictions. The current selected WTI-A02 / EPG implementation must not be abandoned because this handoff was published.

### Brand-specific clarification — three tiers, measured overhead

1. **New or materially changed consumer screen, drawer, modal, data-entry flow, anatomy selection, persistent new asset slot:** lightweight spec **before** UI coding; current-token/benchmark audit; responsive real renders **390×844 + 1440×900** for first load and meaningful selected/expanded state; verify 320px and 200% zoom and relevant theme/mode states; focused functional, accessibility and source-state tests. This enforces existing 2026-11-26 specific screenshot rule in `AGENTS.md`.
2. **Small visible UI enhancement on existing approved component:** one-paragraph delta spec + reused tokens/states, **targeted actual rendered state and viewport** proportional to impact; screenshot as warranted; never relabel as full independent Brand acceptance without review.
3. **Purely logic/test/docs change without altered user-visible layout or state:** no invented wireframe, no mandatory screenshots or artwork. Preserve functional/source tests and indicate UI NOT APPLICABLE.

The tension between `AGENTS.md` low-overhead no-routine-screenshot rule and its **explicit key-screen screenshot mandate** resolves this way: targeted screenshot verification for substantial consumer UI, **not** repetitive screenshot campaigns for minor/nonvisual commits. `NEXT_ACTIONS.md` defines the active task; neither rule should cause task switching.

## 1. Compact Codex prebuild contract — 15-minute-thoughtfulness, no ceremonial gate

Before touching a substantive consumer screen Codex includes **Provisional Page UX & Wireframe Specification** in the task's development note or commit/PR text (not a separate mandatory document file):

```md
PROVISIONAL BRAND & UX STEWARDSHIP REQUIRED
Task / route / worktree / base SHA:
Authorized NEXT_ACTIONS slice / specific domain contract:
Primary user job (one sentence):
Current benchmark inspected: route, component, state, source SHA, asset ID:
Current approved feature-specific UX/Brand spec: yes [link] / none
Mobile 390×844: header / primary workspace / action footer / nav / safe areas (text wireframe):
Desktop 1440×900: existing shell / main workspace / optional contextual rail (text wireframe):
Visible first: user job + essential data / input / one primary eligible CTA:
Secondary by disclosure; tertiary under explicit source / management link:
Action hierarchy: primary, secondary, Cancel/back, destructive (semantics and confirmation):
Exact live token roles (canvas/surface/border/text/CTA/focus), font and size, spacing and radii:
States: empty / loading / partial / unknown / error / saving / saved / disabled / destructive:
Source-meaning exceptions: consent, original dates/units, needed uncertainty and safety:
Existing components/assets reused; new art necessary? yes/no and evidence:
Asset slot/placeholder only if truly needed: existing BVA ID or next authorized BVA with registry path:
Verification plan / rights-science holds:
```

Short enough to create during normal planning. Reuse a current approved screen-specific contract when one exists; do **not** regenerate duplicate wireframes from scratch. If a functional feature genuinely cannot present useful UI until a prerequisite is resolved, record precise blocker, not bogus empty cards.

## 2. Operational visual baseline — Brand concurrence

These are **default measurements, not global CSS edits**. Existing approved tokens and UX composition prevail; explain intentional deviations.

| Component | Baseline / observable acceptance |
|---|---|
| First fold | At 390×844 and 1440×900, one clear job, actual result or useful input, one dominant eligible action; target primary workspace ~60–65% when reasonable, never fixed-height truncation |
| Mobile gutter | 16–20px; existing shell padding counted once |
| Component padding | 16px mobile; 20–24px desktop where surface justified |
| Rhythm | 4, 8, 12, 16, 20, 24, 32px; avoid arbitrary gaps |
| Body/inputs | 16px; input minimum 16px on mobile; support text 14px ordinarily; no critical 11px microtype |
| Tap/focus | Minimum 44×44px targets, keyboard-visible focus, noncolor state indication; 48px preferable primary CTA |
| Card header | Title, optional action/close in padded **flow** header; each button has 44px footprint plus 8px separation/clearance; title does not overlay border or collapse behind control |
| Drawer/modal | Discrete header + 44px close; independently navigable body; footer/button region with safe-area/keyboard clearance; focus trap/restore, Escape/back and draft retention where relevant |
| Floating controls | Prefer not to float. If necessary, explicitly reserve occupied bounds and touch clearance through narrow width, keyboard, zoom and translated/wrapped copy |
| Page shells | Canvas → one purposefully elevated focus surface → mostly unboxed or quiet rows → raised sheet when opened; don't stack 3 shadowed cards inside one another |
| Interaction | Distinct default, hover, focus-visible, pressed, selected, disabled, saving/error; selected is not proof of persisted data |
| Colour | Reuse four actual Bloom variants from `client/src/styles/bloom-visual-scoped.css` and `client/src/brand.css`; do not hardcode a separate green, navy, error or status palette |

**Source-verified role examples, not all completed token certification:** `--bv-canvas` Everyday Light `#F8F9F3`, Everyday Dark `#101C17`, Athlete Dark `#0F1B2E`; `--bv-porcelain` `#FFFEFA` / `#22382E` / `#182B45`; `--bv-brand` `#246B50` / `#A6DEBA` / `#81BEFF`. Athlete Light resolves a separate CSS override; compute actual cascade from mounted build. Use theme-correct text/border/focus/selected roles rather than copy/pasting these three standalone colors. Normal-text AA target 4.5:1 and meaningful nontext/focus boundary target 3:1 where applicable. No false 'passed AA' without measurement.

## 3. Default hierarchy, microcopy and actions

**PRIMARY:** user task, essential current source-grounded observation/input, one eligible main action, meaningful time/unit/source/uncertainty and material warning. **SECONDARY:** optional fields, history, filters, source/education/context where not immediately necessary, via thoughtful disclosure or detail pane. **TERTIARY:** original records/methods/audits/management accessed through an intentional source/advanced path. Exceptions are **not optional:** Bloodwork owner R3 latest result → trend → *visible by default* What is it?/Why does it matter?; clinically/materially consequential caveats, consent, accessibility instructions and actual comparability must not vanish into collapsed accordions.

**One main action per task state** (not 'always a button that says Save'). Secondary Cancel/edit/review/adjust in coherent ghost/outline/toolbar or separate navigation, destructive Delete isolated from normal finish action, semantic consequence-specific confirmation if irreversible. **Remove an unsaved item** and **Delete an already stored observation** must not be conflated. Disable only for true validation/provenance blocks, explain blockers once when actionable; saving guards against duplicate submit; error preserves a draft; success only when canonical persistence confirmed; planned/selected/proposed ≠ completed/saved.

**Copy budgets:** page title ≤5 words/~32 chars; section heading ≤6/~40; helper ≤15/~95; chip/tab ≤3/~24; button ≤4/~28; contextual note ≤20/~120. Exceptions for exact lab/taxon names, original units, safety, consent, accessibility and important research uncertainty. **Do not narrate blank optional fields.** Replace “Reps not recorded. Load not recorded. Completion not confirmed.” with labels "Repetitions", "Weight (lb)", deliberate "Complete set" and a helpful validation line only on genuine submission/eligibility conflict. In code preserve distinct `unknown`, `not-entered`, `not-applicable`, explicit zero, planned, completed and source error; minimalist UI never destroys semantics.

**Reject at code review:** border-intersecting titles, overlapping floating dismiss/back buttons, 320px clipped input, unstyled stacked field dumps, repetitive 100%-width boxed cards, red/green health scores inferred from generic units, copy pasted raw missing-field telemetry, duplicate primary buttons or unsafe destructive proximity, visual assets treated as functional proof, charts with fabricated zeros, genotype/biology inferences without reviewed data.

## 4. Approved component benchmarks — purpose, not screen copy

**Before implementation verify current HEAD and actual rendered reference**, not merely design-file name:

- **Today** `Dashboard.tsx`, `TodayFocus.tsx`, `CompanionHero.tsx`: editorial heading, contextual single action, rationale/source disclosure; source-aware eligible CTA; do not reuse stale fallback Add food as a universal recommendation.
- **Bloodwork** `LabExplorer.tsx`, `LabTrend.tsx`, `LabMarkerEducation.tsx`: real value/unit/date, chart, visible essential questions, source methodology/comparability.
- **Microbiome** `Microbiome.tsx`, `MicrobialProfile.tsx`, `OrganismPortrait.tsx`: approved portraits, research/report separation, content depth under clear disclosure.
- **Exercise** `ExerciseCataloguePicker.tsx`, `TrainingSetsEditor.tsx`, `ActivitySetEditor.tsx`, `AnatomyRegionSelector.tsx`, `MuscleHistoryPanel.tsx`: search/review-before-save, precise sets/units, accessible map/list; preserve protected 44 original SVG source paths and hit geometry. Reuse approved EMP-UI01–04 design references; UI05–09 may be design-only and must not be mistaken for working screens.
- **My Biology / Progress** `BiologyHome.tsx`, `Progress.tsx`, `FoodProgress.tsx`: four source doors and authentic dated trends; proposed atlas/timeline/comparison are not automatically implemented.
- **Food capture** verify exact entry components/current HEAD; reuse current five-method capture and canonical review/save, don't create a second meal system.

Each task note identifies one **specific** benchmark for its needed behaviour and one not-to-copy caveat, with source SHA and any real screenshot evidence. No blanket endorsement that current implementations are aesthetically perfect.

## 5. Asset/placeholder policy — verified canonical path and minimalism

**Verified permanent source-of-truth for newly commissioned visual artwork:** `docs/visual-assets/visual-asset-registry.json` with single `BVA-####` identity and existing `allowedLifecycle` statuses. On review it contains **101** records, ending `BVA-0101`. **Do not invent BVA-0102 now**; number is allocated only during an *authorized selected task* after verifying latest HEAD and existing IDs. `design/bloom/asset-manifest.json` is historic staging, **not** a parallel pending-request registry. Distinct scientific mapping registries have independent subject truth and must not be overwritten.

**Decision tree**
1. Does the UI really need independently commissioned artwork? Most forms, charts, error messages, icons and content dividers **do not**. CSS/semantic text/icon-library glyph/skeleton does **not** require a BVA ID. Avoid a decoratively invented hero.
2. Search BVA records, approved delivery packages and runtime media slot by **semantics + location + identity + variants**. Reuse existing ID and asset, including a neutral existing fallback, when sufficient.
3. If an actual design-dependent visual slot is necessary but approved source is inaccessible, keep approved BVA identity, show clean fallback, record `SOURCE_TRANSFER_BLOCKED`, do **not** create new ID or regenerate original.
4. Only if genuinely novel persistent original art is needed and task eligible: define logical slot,  width/height + aspect/crop, all applicable themes/modes, alt/fallback, source/rights, owner, scientific-review constraints, exact expected output and honest `Identified`/`Briefed` + `PLACEHOLDER_ONLY_NOT_ARTWORK`. Reserve **existing** ID if matching, otherwise allocate next sequential BVA *after current-head check*. Place a restrained aspect-locked local CSS/SVG or text fallback only if needed. Update single canonical registry and designer worklist/index **in same scoped commit**, together with consumer slot, parity tests and development receipt.
5. On final artwork arrival, keep **same** BVA identity; verify source original bytes/hash/rights, replace fallback, preserve size/alt/variants, retest app and advance **DELIVERED / INTEGRATED / VERIFIED** separately. Never claim a placeholder is approved art.

**Required registry parity checks:** unique ID, existing matching slots reused (no duplicate), exact path and hash when delivered, consumer references logical ID/fallback appropriately, asset lifecycle matches actual bytes, no external beacon or bogus stock placeholder, image load fail preserves layout at 320/390/1440 and four themes, no protected science/path IDs altered. Clinical biology art requires its independent authority, not aesthetic guesses. Reuse existing first-party icons where possible; **no new illustrations are required by this standing package**.

## 6. Codex implementation receipt — required for meaningful consumer UI

```md
### Provisional UI / Brand & UX Notes
Feature/route:
Selected NEXT_ACTIONS task and implementation authority:
Base SHA / implementation SHA:
Review: PROVISIONAL — BRAND VISUAL NOT REVIEWED / UX NOT TESTED
Primary user job and one eligible task-action:
Existing component/asset benchmarks, source revision, actual preview path:
390×844 initial and selected wireframe + 1440×900 composition (text or link):
Information hierarchy and required visible safety/education exceptions:
Primary/secondary/destructive actions and Cancel/back/save semantics:
Exact existing semantic CSS token roles and justified local deviations:
Spacing, 44px targets, modal/header/sticky clearance:
States: loading, empty, partial, selected, disabled, error, saved, draft retained:
Existing asset/BVA ID reused; NEW art? if yes why; placeholder slot/path/dimensions; registry parity receipt:
Screenshots: real rendered URL/fixture/viewport/theme/commit SHA; missing evidence = NOT TESTED
Tests: canonical records, focus/keyboard, 320/390/768/1440 and 200% zoom as applicable:
Source truth/consent/rights/privacy/anatomy constraints and any active holds:
Known Brand/UX open issues and next actual review:
Status: IMPLEMENTED / ENGINEERING TESTED / BRAND VISUAL NOT REVIEWED / UX NOT TESTED etc independently
```

Don't upload personal or proprietary health observations in screenshots or external review. Use synthetic fixtures with obvious labels. Screenshots for new/major user-visible flows must be **visually inspected by Codex** (header intersections, sticky footer, text reflow, dark/athlete legibility, initial action) at **390×844 and 1440×900** and selected/empty/error as appropriate, plus 320px and 200% checks. If browser/environment is inaccessible, report exact missing proof `NOT TESTED` and do not pass visual acceptance; follow current queue on blocker instead of fabricating a pass. Independently owned Brand and UX reviews can follow ordinary authorized implementation without introducing a blanket freeze.

### Lightweight QA matrix — map to UX R2 ST-T01..16

| Gate | Evidence and expected result |
|---|---|
| Source & task | Exact task, source SHA, authorized route; no competing queue or data engine |
| Above fold | Main job/action perceptible in static 390 screenshot; '3 seconds' is a **human-test target**, not CI proof |
| Geometry | No overlapping header/close/disclosure; 44×44 click targets, mobile keyboard/footer safe area |
| Copy | One clear CTA; no optional blank-field telemetry; specific destructive wording |
| Data and meaning | No fake zero, inferred health status or source-less score; critical caveat and consent visible |
| Progress/draft | Disabled/loading/saving/failed/retry/persisted states truthful and no duplicate saves |
| Token/theme | Current CSS role tokens, Everyday/Athlete Light/Dark as applicable, focus-visible and sufficient contrast |
| Asset parity | Canonical BVA ID/slot/path/variant/fallback/rights/lifecycle matches source; missing art does not break task |
| Responsive | 320, 390, 768, 1440; 200% zoom, long labels, focused/keyboard action not hidden |
| Specialist review | Brand visual and UX usability statuses separately recorded; not assumed approved from build pass |

## 7. Architect adoption sequence (NO extra ceremony)

1. Preserve **R2 Part A verbatim** in its shared Library source. This Brand handoff is an implementation companion **not** a rewrite or a second owner-directive copy.
2. Embed a **small link and selected-task conditional** in root `AGENTS.md`, rather than duplicating the entire text and causing drift. Existing Nov 26 standing Architect → Codex handoff remains active; this Nov 28 addendum specializes *unreviewed* work.
3. For each eligible selected new feature, route Codex the exact current task contract, this spec if no completed feature UI contract, the one relevant benchmark and BVA registry pointer. No extra mandatory PR or review ceremony.
4. On completion, check actual screenshot/fixture/viewport and high-impact ST-T checklist; receive Provisional Notes. Architectural validation is engineering non-regression, not automatic Brand acceptance.
5. Brand reviews visual sophistication, data/typography hierarchy, asset/identity integrity; UX reviews task clarity, keyboard and usability; Biology and Security remain authoritative for science/privacy. Status separated; queue continues where not blocked by actual high-impact defect.
6. Successor Brand/UX/Architect/Codex must follow this addendum alongside source R2 and their existing standing handoffs. Supersede version explicitly in-place and archive old results, not proliferate competing rules.

**No new visual assets, new feature designs, app code, master science data or deployment required by this governance work.**
