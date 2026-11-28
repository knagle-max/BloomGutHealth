# Bloom — Exercise, Muscle View & Pain: Brand UI / Design Token Layer
**Brand handoff ID:** BRAND-EMP-20261126-R1 · **Date:** 2026-11-26 · **Status:** PROPOSED VISUAL SPECIFICATION / SOURCE-INSPECTED; not a functional or clinical approval.
**Source UX:** `Bloom_UX_Exercise_Muscle_Pain_Page_Specification_2026-11-26.md` (Shared Library, 182 lines; source handoff ID `UX-EMP-20261126-R1`). UX retains ownership of information architecture, spatial budgets, feature scope, default periods and CTA positions. This document overlays paint, hierarchy, token and asset reuse—not a replacement UX.
**Target:** `knagle-max/BloomGutHealth`, branch `enhance/bloom-experience`. Repository source inspected 2026-11-26: `ActivityLog.tsx`, `ExerciseCataloguePicker.tsx`, `ActivityReview.tsx`, `TrainingSetsEditor.tsx`, `ActivitySetEditor.tsx`, `AnatomyRegionSelector.tsx`, `MuscleHistoryPanel.tsx`, `client/src/styles/bloom-visual-scoped.css`, `client/src/brand.css`, `client/src/visual-materials.css`, canonical BVA registry and `ANATOMY_REVIEWED_PRESENTATION_INTEGRATION_20261126.md`. Source inspection is not a screenshot or actual app QA.
**Standing mandate:** [Standing Brand/UI agent handoff](BLOOM_STANDING_BRAND_UI_VISUAL_HIERARCHY_AND_TOKENS_20261126.md) and [authoritative visual token template](../../design/visual-system/STANDING_UI_VISUAL_HIERARCHY_AND_TOKENS_20261126.md).
**Scope gate:** `AGENTS.md` and `NEXT_ACTIONS.md` remain the only active task selectors; no deployment/Render before December, no public release, no autonomous symptom-map activation or permission to alter canonical scientific relationships.

## Executive disposition

**APPROVE the UX design direction as a branding foundation subject to UX/Architect integration. Reuse the existing approved anatomy artwork. No new anatomical redraw, no replacement art direction, and no speculative exercise-role or pain heatmaps.** Most needed visual work is **component skin and state refinement**, not new illustrations.

Distinctive visual distinction:
- **Exercise discovery:** quick, search-led, calm, legible editorial utility; one action and a lightweight map browse entry point.
- **Exercise detail / active workout:** concentrated instrument/workbench; tactile set rows, crisp units, clear completed/planned/unknown states; no competing hero art.
- **Muscle View:** the reviewed anatomy is the hero; quiet blue provenance-aware training outlines; selection summary is secondary.
- **Pain log / history:** same beautiful family but clearly *separate semantics*; reported locations, hollow/unrated and number/ring glyphs only after approved policy; never show training association marks as pain severity.

Existing `AnatomyRegionSelector` presents a disclosure and toggle/list UI on `/activity`, and reviewed animation/presentation is locally integrated under `docs/verification/ANATOMY_REVIEWED_PRESENTATION_INTEGRATION_20261126.md`. Do **not** describe every UX-EMP proposed page, role colour, muscle period or symptom save sheet as already implemented. The BVA registry's `Briefed` labels for some anatomy families lag a source-code integration receipt; reconcile status before commissioning.

## UI Visual & Design Token Specification — shared EMP surfaces

### 1. Theme surface and contrast roles — source-derived BASELINE, not new global colors

Current optional premium visual CSS declares these exact role tokens; the Athlete-light override is **not Athlete-dark inversion**. Any adopted EMP component should use semantic variables mapped to these existing values without overwriting them globally:

| Role | Everyday Light | Everyday Dark | Athlete Light | Athlete Dark |
|---|---|---|---|---|
| Canvas `--bv-canvas` | `#F8F9F3` | `#101C17` | `#F8F9F3` | `#0F1B2E` |
| Quiet surface `--bv-paper` | `#F5F3EB` | `#192B24` | `#F5F3EB` | `#17263E` |
| Elevated surface `--bv-porcelain` | `#FFFEFA` | `#22382E` | `#FFFEFA` | `#182B45` |
| Strong ink `--bv-forest-strong` | `#102B25` | `#FFFFFF` | `#0F1B2E` | `#FFFFFF` |
| Regular ink `--bv-forest` | `#173E32` | `#EFF6EE` | `#0F1B2E` | `#F1F6FF` |
| Accent `--bv-brand` | `#246B50` | `#A6DEBA` | existing `hsl(var(--primary))` | `#81BEFF` |
| Secondary ink `--bv-secondary` | `#52685C` | `#CADACF` | inherited light-role token pending actual computed audit | `#C3D4E9` |
| Subtle border `--bv-line` | `rgba(23,62,50,.11)` | `rgba(229,245,233,.17)` | inherited light-role token pending actual computed audit | `rgba(241,246,255,.16)` |
| Selected wash `--bv-mist` | `#EDF3EC` | `#284434` | inherited light-role token pending actual computed audit | `#203B63` |

**Important:** `client/src/styles/bloom-visual-scoped.css` contains separate source selectors for mode and theme. Compute actual styles from mounted components before claiming all four values above as fully accurate; Athlete Light has an override that resets selected tokens only, and CSS cascade matters. The previous shared generic panel paint in `visual-materials.css` has a 28px surface radius; its unscoped material style is already in production source. Do not globally introduce an incompatible second surface system.

**EMP-specific semantic aliases (proposed only, component-scoped):** `--emp-canvas:var(--bv-canvas)`, `--emp-map-surface:var(--bv-porcelain)`, `--emp-detail-surface:var(--bv-paper)`, `--emp-ink:var(--bv-forest-strong)`, `--emp-secondary:var(--bv-secondary)`, `--emp-line:var(--bv-line)`, `--emp-interactive:var(--bv-brand)`, `--emp-selected:var(--bv-mist)`, `--emp-focus:var(--bv-focus)`. For a contained sheet use elevated porcelain and theme-resolved opaque scrim; no permanent glass blur.

**Layer hierarchy:** flat canvas → unboxed contextual heading → one calm elevated map/workspace surface → one selected-context bottom sheet/desktop rail. Use soft 1px dividing lines *or* delicate depth; avoid deeply nested cards inside the map panel. Chart and anatomy backgrounds never receive heavy gradients or tints that obscure existing geometry. Selected sheet must have enough contrast from map; verify AA 4.5:1 normal text, 3:1 non-text focus/selection boundaries after composition, including translucent overlays.

### 2. Exact typography roles — proposed EMP implementation values

Use existing approved font variables first (`var(--font-sans)` for UI; approved editorial serif/Georgia fallback only for headline); do **not** silently introduce external Newsreader/Plus Jakarta Sans dependency.

| Role | px / weight / line-height / letter-spacing | Use |
|---|---|---|
| Main heading | mobile 30px / 600 / 1.16 / −0.02em; desktop 34px / 600 / 1.16 / −0.02em | One page heading; existing serif premium heading when opt-in |
| Subheading/section | 20px / 600 / 1.25 / −0.015em | 'Explore by muscle', active set title |
| Result/region heading | 18px / 650 / 1.3 / −0.01em | Exercise name, selected shoulder |
| Body/input | 16px / 400–500 / 1.5 / 0 | Search result, data entry and explanations |
| Control/button | 14px / 600 / 1.3 / 0 | Segmented choice, filters, CTA text if it fits with 44px height |
| Inline metadata | 13px / 500 / 1.45 / 0 | Date, source, equipment, set labels |
| Noncritical microcopy | 12px / 500 / 1.45 / 0.01em | Mini legend only; no sensitive consent/safety text at this size |
| Numerical set value | 20px / 650 / 1.2; tabular-nums | Reps, load, last performed; always show units or unknown |

Preserve UX source copy-length budgets: page title 5 words/32 chars; helper 15/95; control 3/24; CTA 4/28; contextual note 20/120, with justified safety/accessibility exceptions. A compact label never removes an essential unit/source qualification.

### 3. Spacing, radius and depth — proposed EMP local scale

- Base 4px increments; micro icon gap 6–8; button icon/label 8; input stack 8–12; filter chips 8; result rows 12; related fields 12–16; workspace sections 20–24; between major sections 24–32.
- Default page left/right padding: 16px at 320–390, 24px at 768, 32px at 1440 **within the currently approved UX shell**. Preserve existing nav and breakpoint behavior; don't force a global shell override.
- Map internal padding: 12px phone, 16px tablet, 20px desktop. Maintain source aspect ratio and full approved art; no crop, stretch or CSS transform that invalidates hit geometry. Map target itself may be visually smaller than 44px **only with full accessible list/picker counterpart**.
- Primary input/search: 48px visual height, 14px radius; primary CTA: minimum 48px with 16px horizontal padding, 14px radius; segmented switch: 40px visual height inside a 44px minimum touch target, 12px radius; chips: 34px visual height with 44px operable hit, 999px pill; standard result item: 52–64px depending wrap; set row: 56–72px depending number/units.
- Surface rules: map/workspace radius 22px; inline detail region 16px; bottom sheet exposed corners 24px; selected row radius 12px. The app already has contextual 26/28px panel shells—don't double-box them or override shared panel tokens without Architect/Brand reconciliation. Use max 1px subtle border on main workspace, no shadow on nested rows; one restrained ambient shadow only for raised sheet or map when distinct.
- Bottom sheet: content-driven height, viewport/keyboard-safe max-height, independent scroll only if needed, scrim light/dark opacity empirically QA'd, safe bottom inset `env(safe-area-inset-bottom)`. Don't assert a fixed 60% height or trap nested scroll.

### 4. Reusable interaction states — proposed style mapping

| Component | Default | Hover | Focus-visible | Selected/active | Disabled/unknown | Error/loading |
|---|---|---|---|---|---|---|
| Front / Back and Training / Explore | Soft no-border pill on clean surface | light tonal tint | 3px `--emp-focus` ring + 3px offset | active filled paper + subtle 1px strong border, check/pressed semantics | readable muted text | preserve state while fetching |
| Category / filter chip | subtle neutral surface with 1px line | quiet surface tint | same focus ring | solid selected accent outline + check; removable `x` only when a filter is applied | lower emphasis and explanation | retain previous filters and show retry |
| Exercise result | clean unboxed row, thin separators only | gentle hover background | 3px ring around operable row | highlight selection without implying saved | unavailable status visible | inline retry + manual entry |
| Primary CTA | strong forest/blue fill, on-accent ink tested | small contrast change | clear focus outside edge | pressed state ≤1px translate or static tint | disabled until eligible, reason if needed | explicit saving spinner/status, no premature success |
| Actual set row | neutral content line, left status glyph | gentle hover on edit target | independent toggle/edit focus | completed: check + label, not merely green | planned dashed outline, unknown remains open circle; cancelled dash + text | block duplicate save, preserve draft |
| Anatomy region | original SVG art/IDs unchanged | exact reviewed hit-footprint emphasis | exact footprint outline + equivalent list focus | clear selected outline + selected list row | deep/unmapped list-only; no nearest-region substitution | image fallback to list, stable state |
| Pain location | neutral body art with no old marker by default | exact reviewed valid target outline | target + accessible list focus | region name + side in sheet | broad/unresolved maps to text fallback; no fake location | draft retained; explicit save failure |
| Pain history marks | **Only approved existing behavior** | marker inspection | keyboard selection via list | selected dated observation | unrated/historical/no observation distinct | show no fabricated counts |

**Meaning is not color:** Training source roles use text/patterns and restrained blue strokes; pain is a separate ring/hollow/location vocabulary only once Biology/Owner approves. Do not encode both as visually interchangeable heatmap fills. Never use red/amber/green severity heatmaps or represent pain as damage. Don't invent "well-trained", soreness, muscular activation, or recovery indicators.

### 5. Motion and feedback

- Transition for controls only: 120–180ms opacity/surface tint; no anatomy interpolation, path morphing, pulsing dots or floating magnifier. No visual smoothing that changes selected geometry.
- Respect `prefers-reduced-motion`: instant state change; existing source position and focus stay stable. Loading states must reserve enough height to prevent action jump; spinner with visible status or skeleton appropriate.
- When a selected region opens a sheet, preserve selection behind it and restore focus to the exact source control on dismiss. Do not auto-pan/zoom away from a selected tiny anatomy region.

## Screen-specific Brand UI contracts (UX proposal preserved)

### UX-EX-01 — Exercise search, discovery and selection
**Look:** functional editorial catalogue with one inviting search focus, secondary category pills and small map-preview window; visually lighter than a hero image. Search result list should take precedence when typing (per UX). Default recent exercises only from actual records; unpopulated state clean text + search CTA rather than invented workout thumbnail. Use existing `ExerciseCataloguePicker.tsx` search/filter/selection; style its nested `<details>` filter as an intentional single filter sheet/disclosure, avoid a wall of three full-width select boxes. Equipment/category/muscle should be small but 44px-target selectable chips or a well-spaced sheet. A labelled source/candidate state appears only in selected detail, not as a dozen dense badges in initial results. A row has exercise name (18px), concise classification (13px), right aligned 44px Add icon+label. Search 48px tall, results 56px minimum.
**Asset decision:** BVA-0078/79 already supplies anatomy; reuse small static preview of same approved art where UI permits, not a new tiny clickable muscle SVG. BVA-0052 Activity hero and BVA-0022 exercise technique are *not required* for discovery initial render; leave empty hero slot rather than commissioning unnecessary imagery.

### UX-EX-02 — Exercise detail and active logging
**Look:** selected movement name with restrained contextual info and high-fidelity map-or-demo workspace. On phone never stack full anatomy and demo; reuse existing anatomy only if source-reviewed exercise association exists. Approved source technique/demonstration if licensing and review permits; **BVA-0022 remains a real conditional gap** (prior rejected visual). If no approved demo, show "Demonstration unavailable" only inside an explicitly selected Technique view, not a blank playable tile. Active set entry is the primary tactile interface: completed checkbox/label, set number, reps and load column with tabular numbers, units in secondary readable ink, current set quietly raised, previous real set as one line. Reuse `ActivityReview.tsx`, `TrainingSetsEditor.tsx`, `ActivitySetEditor.tsx`; no new logging database. A status/change control must not look like a published observation until backend confirms.
**Asset decision:** no new muscle image needed. Conditional technique art only after exact licensed reviewed exercise footage/images exist.

### UX-MUS-01 — Training and Explore muscle view
**Look:** single large accurately framed sculpture/anatomy on light neutral or navy porcelain with enough negative space. Preserve current original 24-front + 20-back Overview selectable paths and separate reviewed 34-front + 28-back Detailed footprints, six list-only residuals, native list fallback, original silhouette and yellow illustrations. Existing presentation receipt `c813f807` is locally engineering tested; **this is sufficient artwork for initial brand implementation**. New UI must not redraw source geometry or change the hit/paint split. Show only reviewed/logged association overlays, never activation heatmap, measured training intensity, or ambiguous side assertions. A side/role legend should remain plainly legible when map viewport is 320px; default text may read "Recorded associations" not "Muscle activation". Selection summary uses a bottom sheet (mobile) or one right rail (desktop) when UX approves—not a second full-height card.
**Source caveat:** `MuscleHistoryPanel.tsx` currently uses an optional `<details>`, 7/14/30-day history selector and recorded association labels; the new UX handoff proposes a different default 7/30/Custom control, Training/Explore tabs, and selectable sheet. Treat these as **unimplemented UX changes** requiring Architect reconciliation, not paint-only updates. Existing `AnatomyRegionSelector` layer toggle and detailed-view controls must remain reachable until authorized replacement.

### UX-PAIN-01 — Pain reporting
**Look:** respectful, calm health journal. Neutral anatomical body (reuse symptom art BVA-0087/0088), not a red injury mannequin; one obvious "Where do you feel discomfort?" line. No historical dots before an explicit History action. Selected area introduces a single opaque, high-contrast ivory/evergreen sheet, subtle top handle, selected location title and optional severity/type/date controls. Foreground readability is more important than background blur. Primary Save is only enabled at actual allowed validation state and shown only within selected form. Use source record labels "Reported by you" instead of medical certainty. Location unknown/other is full quality text path, not the broken remainder of the map. Never invent a pain save UI or persist symptom IDs based solely on this design.
**Asset decision:** BVA-0087/88 source prototypes and BVA-0089 marker kit already exist, but their canonical mapping and production approval are NOT complete. Reuse those exact source files for visual design studies; **do not draw new symptom maps or activate** on product route before owner/Architect/Biology gates. Production request is a verified export/binding + review, not a second invented illustration.

### UX-PAIN-02 — Pain history
**Look:** same map composition but intentionally different from new capture: a compact date-range and legend row, dated record markers only where approved, selected history sheet with readable dates/counts and accessible list alternative. Source UX's proposed ring policy (1/2/3 ring severity and hollow unrated, 0 distinguishable) has **NOT been accepted** by this brand review, and is pending scientific/owner decision. Do not create red location heatmaps or automatically show historical high observations as current. Use explicitly annotated "Latest reported" and date, not "Current pain". Dated record notes remain private and intentionally revealed. State matrix: no records, some unrated, rated, explicit 0, unknown scale, overlapping marks, withdrawn/corrected record, data failed. Do not decorate a scale mismatch as numeric certainty.

## Asset register reconciliation: REUSE / conditional development

| ID | Source state / design decision | Next design work |
|---|---|---|
| `BVA-0078/0079` | Existing reviewed anatomy presentation locally integrated (receipt `c813f807`); canonical BVA lifecycle text may lag; source vectors and art are sufficient | **REUSE, DO NOT REDRAW**. Audit the actual render and final anatomy/rights acceptance; adjust surrounding UI only. |
| `BVA-0087/0088` | Symptom map designs and exact 320×820 art source/prototype exist; region identity and production activation gated | **REUSE source design, NO NEW ART**. Await canonical mapping, approved hit targets and rights/QA. |
| `BVA-0089` | Existing history ring/marker source design candidate | **REUSE FOR STUDY ONLY** until ring policy and source semantics approved. No new icon kit needed now. |
| `BVA-0022` | Technique study still Briefed; previous image rejected | **CONDITIONAL NEW SOURCE** only when an exercise demonstration slot is authorized, with human reviewed biomechanics and rights. |
| `BVA-0005/0052` | Athlete hero approved or Activity Log hero briefed | **NO HERO ON MAP-FIRST / SEARCH-FIRST** landing. Reuse elsewhere only after visual role is demonstrated. |
| `CHART-A01/A02/A06/A07/C06` | Existing designer-source visualization kits | **REUSE semantics** for focus, selection, unknown/source indicator; do not invent conflicting colors. |

**No new permanent BVA IDs proposed.** The major remaining assignment is a branded interactive UI component package, not new source artwork. In particular, do not commission 4 new male/female anatomy variants or repurpose exercise-path IDs for symptom locations.

## Deliverable list — Designer → Architect/Codex (not new illustrations)

1. **EMP-UI01 Search & filter component skin:** exact input/chip/result/empty/error/loading/matched-source states; inspect and reuse existing `ExerciseCataloguePicker`.
2. **EMP-UI02 Exercise detail + selected movement state:** map/demo switch, source qualification, equipment/role legend, mobile/desktop; no new illustration.
3. **EMP-UI03 Set workbench:** row density, reps/load number treatment, edit/complete/planned/unknown states, previous actual set, existing per-set identity.
4. **EMP-UI04 Anatomy viewport chrome:** precise map mat, Front/Back, Overview/Detailed, equivalent list affordance, selected region and anti-overlap focus; exact source geometry unchanged.
5. **EMP-UI05 Region context sheet/rail:** selected region, side, recorded occurrence/source links, close/restore focus and keyboard semantics.
6. **EMP-UI06 Pain capture form sheet:** optional rating, type/date, unresolved text path, saving/retry/unknown and privacy styles; UX implementation still gated.
7. **EMP-UI07 Pain history legend/observation states:** only approved ring policy, 0/unrated/unknown/no-record discrete style and dated inspection.
8. **EMP-UI08 Four-theme responsive comparison sheet:** 320, 390, 768, 1440px; Everyday Light/Dark, Athlete Light/Dark; 200% zoom and reduced motion, map loading/failure/list and optional no-data.
9. **EMP-UI09 Design tokens / CSS mapping / accessibility receipt:** token role table and exact selected-state matrix, contrast screenshots and code-level placement notes, visual before/after actual same-SHA captured **when implemented**.

Each component must be **editable Figma master or equivalent vector/component source**, semantic styles, CSS-token mapping and handoff redlines; no generic body artwork or static PNG as a substitute for accessible working controls. UX approves structure; Architect resolves current-route differences; Codex implements eligible changes and verifies with real 390×844 and 1440×900 browser screenshots.

## Acceptance / handoff constraints

- Source UX requirements `EMP-T01..T16` remain intact and are not marked complete here. Design specifically contributes to `EMP-T01,T05,T08,T09,T11,T13,T15`; engineering/science/privacy own remaining tests.
- Verify existing source geometry and hashes, all 44 original Overview paths, 62 detailed footprints and 6 list-only residuals. Never change anatomical geometry for visual polish.
- Distinguish Workout association vs Pain self-report in background, fills, marker grammar, legends, dates and accessible text.
- No-data must mean *no eligible records in selected period* or *unknown mapping* precisely, not no training/no pain.
- Responsive actual UI at 320/390/768/1440 and same-source 390×844, 1440×900 screenshots including default, selected region, open sheet, dense 200% text, keyboard and image failure fallback; real device/VoiceOver independently tested and labeled not-run until performed.
- Always provide before/after if making substantial layout/paint changes; keep the original approved anatomy visible and preserve real source detail under intentional disclosure.
- **State:** SPECIFIED / SOURCE INSPECTED. No new asset production, UX implementation, clinical mapping approval, accessibility certification or public enablement claimed.
