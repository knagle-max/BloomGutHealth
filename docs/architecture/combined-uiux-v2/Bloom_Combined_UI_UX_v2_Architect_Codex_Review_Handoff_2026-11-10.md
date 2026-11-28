# Bloom — Combined UI/UX v2: Architect & Codex Review Handoff

**Issued:** 2026-11-10  
**Latest amendment:** 2026-11-10 — Owner FINAL CODEX EXECUTION DIRECTIVE: Branch Integration (Section 10; controlling execution instructions).  
**Review disposition:** **APPROVED FOR ISOLATED BRANCH INTEGRATION UNDER OWNER FINAL DIRECTIVE; SOURCE CORRECTIONS REQUIRED; VISUAL ACCEPTANCE PENDING ACTUAL EVIDENCE.**  
**Audience:** Chief Architect & Integration Lead; Codex; Structural UX; Branding & Graphic Designer; Independent User Testing.  
**Scope:** Today editorial presentation and source-preserving Biology/Gut-report telemetry; desktop and mobile equally mandatory.  
**Authority:** This review refines, not replaces, the canonical v0.6 Architect requirements and approved R4/M1 source, privacy and scientific contracts. Continue development without extra owner checkpoints; do not alter or retroactively reopen the v0.5 RC.

## 1. Reviewed evidence and limitations

- Directly inspected owner-uploaded archive `Bloom_Today_UI_Handoff_Code_v2(2).zip`, seven bundled files: `README_HEADER.md`, `Bloom_Today_Editorial_UI_Handoff.md`, `Biology_Microbiome_Refactor_Addendum.md`, `TodayFocus.tsx`, `primitives.tsx`, `today-editorial.css`, `BiologyReportTelemetry.tsx`.
- Cross-checked the current repository's `client/src/components/TodayFocus.tsx`, `CompanionHero.tsx`, `client/src/pages/Microbiome.tsx` and the absence of `client/src/components/ui/primitives.tsx` on `enhance/bloom-experience` during review. **This is a moving branch: record exact HEAD before changes.**
- Considered the previously published `Bloom_User_Testing_Combined_UI_UX_v2_Review_2026-11-10.md` including its R3 owner-amended integration directive. That review reports a later corrected Today CTA in owner-supplied text, but the uploaded `(2).zip` still contains the original hard-coded `/log-meal` fallback.
- **Not performed:** editing repository code, test runs, mobile-device or browser screenshots, live usability validation, or deployment. Source-level findings are not runtime PASS.

## 2. Executive decision matrix

| Feature | Decision | Required treatment |
|---|---|---|
| Source-preserving editorial Today hero | **ADOPT WITH CHANGES** | Reuse existing `CompanionHero` and `EditorialMedia` and the authoritative Today action, choice and freshness contracts. |
| `EditorialHero` adapter | **OPTIONAL ADOPT** | Keep it a thin wrapper only if needed; no second hero or duplicate presentation framework. Verify forwarding of `media` and focusable heading. |
| `SurfaceCard` four variants | **RESTRICT** | Avoid mandatory `rounded-2xl border` on every item. Reuse existing cards for semantic boundaries; otherwise use whitespace and typography. |
| `TelemetryMetric` | **SELECTIVE ADOPT** | Reserved for actual recorded/derived data, with sources and explicit missingness. Never produce a health score or scientific classification. |
| Proposed `TodayFocus.tsx` | **DO NOT DROP IN** | Fix canonical primary CTA and paused state, preserve source and choice behaviors, diff against current HEAD. |
| `today-editorial.css` | **MODIFY** | Use scoped, valid semantic tokens; verify `hsl(var(...))` matches actual token representation; avoid global paint leaks and duplicate CSS. |
| `BiologyReportTelemetry` | **OPTIONAL, SUBORDINATE** | Source-authentic report metadata only, if it adds value beyond existing summary; no competing card deck. |
| Replacing `BiologyHome` or `Microbiome` | **REJECT** | Keep owned report paths, source management, search, organism profiles and research. |

## 3. P0 functional fixes — before accepting this UI change

### CUI2-P0-01 — Today primary contextual action

**Reproduced in uploaded source:** the non-`proposed` branch contains `<Link className="hero-button" href="/log-meal">Add food</Link>` while the canonical `action.href/action.label` appears as secondary if not `/log-meal`. The current inspected branch also contains this pattern.

**Contract:** After eligibility and freshness checks, exactly **one visually dominant primary action** corresponds to the eligible action actually selected by `todayContextAction`, unless an eligible `proposed` wellness choice controls the hero. Food becomes primary **only** if it truly is the selected action. When a context action is unavailable or unsafe, use an explicit safe fallback, disabled state, or retry, not arbitrary navigation. Preserve the selected `proposed` action's `choose/choice/receipt` semantics; do not turn a proposal into a performed event.

**Targeted implementation:** retain existing `todayContextAction`, `useWellnessChoices`, route and source eligibility; for the eligible non-proposed case, render the trusted `action.href` / `action.label` as primary. Show Add food separately only as a genuine available secondary action. Avoid duplicating a button for the same route. Unit-test action selection across food, planned Athlete fueling, movement, source failure, partial food, chosen-but-not-performed, session failure, stale context, skipped, account switch.

### CUI2-P0-02 — Paused-state intent

The uploaded UI allows `paused` to alter heading/reason and show `Show suggestion`, but the fallback primary button may still show an action related to the very suggestion the user paused. Choose explicit behavior:

- On a paused suggestion, **Show suggestion** is the recovery control.
- If some other genuinely independent task is safe and available (e.g., logging food), give it a distinct independent label rather than styling it as the active paused recommendation.
- Never show an ineligible or stale personalized recommendation as active; preserve h2 focus restoration on show/skip.

### CUI2-P0-03 — Preserve real source disclosures and record states

Do not remove `CheckinSourceDetails`, `FoodSourceDetails`, `MovementSourceDetails`, `WellnessChoiceDetails`, eligibility, selected/intended vs performed and observed, source/date/provider provenance, missing data, historical choice and exact retry. Confirm error/loading/withdrawal/account-change hides prior owner's evidence and no saved indicator appears before a server-backed receipt.

### CUI2-P0-04 — Preserve organism/marker discovery

For a valid selected gut report, put **searchable, tappable organism discovery** ahead of decorative media, tall report-management controls and stacked summary metrics. The user must quickly find an organism name and open its existing `MicrobialProfile`, with original source amount, taxonomic rank, source, research limitations, Escape/Back, return focus and account isolation intact. Keep `My Biology → Bloodwork → named marker → history/details` equally discoverable; no loss of grouped original report headings, dates/units and marker details. When no report exists or loading fails, first-use/retry appropriately replaces the organism list as primary action.

## 4. Scientific/report telemetry rules

- `BiologyReportTelemetry` is **not required** if equivalent source facts are already displayed. If used, put one quiet report-identity line or compact disclosure near report selection, not two competing headline cards above the organism search on a phone.
- The label must be **“Reported organism entries with numeric values”**, not organism species count, bacterial richness or health quality. Source rows may include duplicate/nested taxonomic ranks. Do not imply a healthy cutoff.
- Diversity is shown only where the selected source supplied a valid compatible numeric value. Qualitative values and unknowns do not become zero; never infer trends across dissimilar assays. No SCFA output, inflammation, gut barrier, GLP-1 production, microbial efficiency or synthetic health score.
- `reportDate` must derive from the actual source date resolver, distinguishing *collection date* from *upload/recorded date*. Unprovided processing state is not portrayed as confirmed.
- Parent passes only current user/current report/current versioned result; deletion, report switch, account switch, 401, offline, and stale states must retract old telemetry and actions. Reuse current APIs; no new health-projection endpoint.
- Preserve methodology and strain/taxon resolution, saved original provider scores, source deletion and imported report browsing. Never use the goal/wellness-context endpoint as a microbiome observation source.

## 5. Visual design contract: deliberate compositions, not cosmetic card replacement

**Everyday Today:** warm photographic/editorial hierarchy—readable contextual action, one primary CTA, short rationale, meaningful whitespace, source details below; reserved raster/SVG media slot with safe text/image proportions and never covered controls. Keep the existing premium palette and serif system; do not substitute a single dark-green gradient as a whole design.

**Biology:** easy-to-scan selected report identity followed by findable organism rows; scientific details in the existing sheet/profile. Prefer flat list separators and typography over nested outlined tiles. Show real data distinctly from research explanation and illustrations.

**Athlete:** maintain an independent blue visual identity for **Athlete Light and Athlete Dark**, including navigation, inputs, dialogs, charts and focus. No static navy override while the user chose light.

**CSS ownership:** use the canonical existing themed styles. Validate custom property conventions before applying `hsl(var(--...))`; avoid global selectors, new competing themes and duplicate imports. Glass blur only if contrast is verified against worst-case image pixel; forced colors and reduced transparency get solid fallbacks. Ensure image fallback, motion preferences and no layout shift.

## 6. Responsive screen contracts (both first class)

| View | 320/390 mobile | 768 tablet | 1440 desktop |
|---|---|---|---|
| Today hero | action text and CTA first; image composed in remaining reserved area; no bottom-nav collision; single-column reason/evidence | balanced media/content split or stacked with safe gutters | editorial split / meaningful width; no stretched card deck |
| Today details | collapsible named evidence, 44px taps, bounded scroll | spacious disclosure with keyboard flow | precise source drilldown at comfortable line length |
| Gut selected report | compact provider/date + organism search/list immediately discoverable; small optional telemetry below | list + lightweight report context | organism list with optional context/detail region |
| Bloodwork | tap group then named marker; sheet/drawer fits viewport, returns focus | adaptable two-column when space exists | organized group with detailed side panel or dialog |
| Appearance | Everyday Light/Dark + Athlete Light/Dark, contrast and mobile media fallback | same | same |

**Mandatory checks:** 320, 390, 768, 1440 CSS px; 200% zoom, landscape where relevant, iOS Safari if available, keyboard/screen reader availability, 44px touch targets, no sideways scrolling, no clipped CTA/sheet, no hidden science disclosures. Photos and decoration may recompose, but must not simply disappear by default from mobile without an approved reason.

## 7. Required test fixture matrix

**Today:** first-use/no meals; partial nutrients; complete recorded meal; selected eligible choice; choice saved but not performed; planned Athlete fueling with non-food destination; non-food movement; source loading; journal error; wellness choice error; session error; stale source; selected suggestion paused/resumed; skipped; account switch; offline/retry; receipt loss/concurrent changed record. Each fixture: exactly one appropriate prominent eligible primary action; no false completion or stale user data.

**Gut reports:** none; loading/failed; valid numeric diversity; qualitative-only diversity; mixed/nested taxonomic ranks; numeric abundance null vs explicit zero; collection date missing/upload date available; processing unknown; report switched/deleted; account switched. Confirm the organism search and clickable profiles dominate, telemetry is honest, and source drilldowns remain.

**Bloodwork:** imports grouped by real source heading; name click opens original dated values/trends/source; return focus; unit provisional/unknown; no cross-report false trend; report deleted/account switched.

**Visual:** same frozen commit SHA before/after screenshots at all four widths and four theme/mode combinations where applicable, populated and empty/partial/error/paused states. Designer grades editorial originality, image balance, card repetition, visual hierarchy, reading comfort, and mobile scrolling. Do not claim independent human or device PASS from automated screenshots alone.

## 8. Implementation sequence and ownership

1. **Architect:** reconcile original v2 ZIP, independent R3 instruction and latest source branch, deduplicate with v0.6 handoff; publish one approved diff map for Today, Biology and CSS. No new parallel UI framework.
2. **Codex:** on isolated feature branch, repair Today action/paused states first; tests and source preservation; then optimize Gut organism prominence and optional telemetry; preserve all canonical storage/API contracts.
3. **Designer/Brand:** implement actual visual composition with existing editorial photography and SVG fallbacks; assess mobile and desktop **together**, including all four modes.
4. **Codex QA:** TypeScript, relevant tests, build, actual logged-in app interactions where possible, screenshot matrix, accessibility checks, frozen SHA; fix P0/P1 regressions.
5. **Independent UX/Testing:** test first-glance action comprehension and organism/bloodwork discovery as separate functional and aesthetic criteria. Record `PASS / FAIL / NOT TESTED` by fixture and device; source review does not grant visual acceptance.
6. **Architect:** integrate only when affected changes meet privacy, source, action and visual acceptance; unrelated safe v0.6 development continues. Do not merge main automatically or restart v0.5.

## 9. Stop/ship definitions

**P0 block for affected feature:** wrong or ineligible primary action; falsely performed/saved indication; stale/cross-user source; hidden/inaccessible organism or marker detail; lost source/date/unit provenance; invented clinical, hormone, metabolite or taxonomic claims; broken mobile CTA/modal/keyboard control.

**P1 fix before visual acceptance:** repeated unnecessary bordered cards; artwork absent/washed out on mobile; content hierarchy that buries organism discovery; token/contrast failures; inaccurate report metadata; unworkable 200% zoom.

**Defer without stopping unrelated work:** hypothetical new provider connections, native hardware testing when unavailable, broader unrelated redesign, independent scientific efficacy validation for research-only claims not activated.

**Exit condition:** one exact committed source diff, passing automated regression evidence, same-SHA screenshot set for mobile/tablet/desktop and themes, and a candid list of independently tested versus untested user tasks. **Current status: REVIEWED / READY FOR CORRECTED IMPLEMENTATION; NOT DEPLOYED OR VISUALLY ACCEPTED BY THIS HANDOFF.**


---

## 10. CONTROLLING AMENDMENT — OWNER FINAL CODEX EXECUTION DIRECTIVE: BRANCH INTEGRATION

**Authority and status:** Supplied by the Product Owner on 2026-11-10, after the original review. This section is the latest controlling instruction where earlier review wording differs. It **resolves the requested implementation direction**, not proof that the changes have been applied, tested, rendered, or accepted. **Disposition: GO for isolated feature-branch implementation, conditional on source-preserving functional QA and same-SHA mobile/desktop visual evidence before PR review.** Do not reopen the v0.5 RC or stop unrelated approved v0.6 work.

### 10.1 Owner directive (execution requirements, incorporated)

1. **`TodayFocus.tsx`:** Reconcile `todayContextAction` and `useWellnessChoices` so eligible contextual `action.href`/`action.label` drive the visually primary action when no eligible `proposed` choice takes precedence. Correct paused-state recovery using **“Show suggestion.”** Preserve **all three** `CheckinSourceDetails`, `FoodSourceDetails`, `MovementSourceDetails` inside the `<details>` evidence block. Preserve `WellnessChoiceDetails` and existing choice/save/receipt semantics.
2. **`Microbiome.tsx` and `BiologyReportTelemetry.tsx`:** Preserve the existing owned, source-aware microbiome report workspace. If report telemetry is useful and not duplicative, render it as **one compact inline metadata row**, not stacked metric cards or a competing hero. **Organism search, filter tabs, and tappable `MicrobialProfile` remain dominant** for a valid selected report; preserve report selection, source identity and the original open/close/focus/back detail experience.
3. **Primitives/CSS:** Use **token-safe properties** grounded in the active theme (`var(--primary)`, `var(--card)`, `var(--muted)` as semantically applicable). Verify each variable's *actual representation* before using an HSL functional wrapper; `var(--x)` and `hsl(var(--x))` are not interchangeable. Avoid global selector leakage or heavy mandatory borders on every `SurfaceCard` variant. Prefer existing primitives and the canonical CSS scope over a parallel framework.
4. **Verification:** Run TypeScript (`tsc`/`npm run check`), relevant unit/integration/regression suites and production build. Capture **screenshots from the same frozen candidate SHA** at **320, 390, 768, and 1440 CSS px**, in **Everyday Light, Everyday Dark, Athlete Light, and Athlete Dark** where applicable. Review genuine rendered visual and accessibility quality **before PR review**; retain evidence through the affected change's merge decision.

### 10.2 Exact acceptance clarifications (needed to avoid an ambiguous PASS)

- **Primary CTA precedence:** Only a currently eligible, source-fresh, actionable `proposed` choice may override the canonical contextual action. Otherwise the primary link/button's destination and label must both derive from the authorized `todayContextAction` result; if unusable, show a clearly non-actionable/loading/retry state rather than navigating arbitrarily. Exactly one primary action is visible. Do not auto-mark a chosen option as performed.
- **Paused state:** “Show suggestion” restores the paused recommendation; a separate safe independent task can remain available but must never appear as the paused recommendation itself. Keep focus restoration on the existing heading, without duplicate primary CTAs. Test pending/failed choices, session feeding/fueling, non-food action, skipped, stale sources, and account change.
- **Three detail components:** Verify that all three detail components render within the existing evidence disclosure for applicable owned data, and remain reachable by keyboard even under partial/failed source states. The source-backed rationale and `WellnessChoiceDetails` must not be deleted or flattened into unsupported text.
- **Microbiome interaction priority:** On 320/390 mobile, a valid selected report exposes organism search and filter tabs **without a scroll through new metadata cards**. Rows have adequate tap targets, an accessible name and a return-focus target for `MicrobialProfile`. On 768/1440, use available width intentionally, preserving exact source and research detail. For no report/loading/error, make first-use/retry primary rather than an empty list.
- **Compact telemetry:** One subordinate report metadata row only, with no repeated source/provider/date if already visibly present. Numeric diversity is strictly source-verified and method-dependent; a numeric source-row count is not unique species count, microbial richness, or health. Preserve collection vs import date semantics, unresolved/partial state, and retraction on report deletion/switch/account switch. **Omit redundant telemetry entirely** when it adds no new user value.
- **CSS safety:** Verify color tokens across all four theme combinations, including modal/portal surfaces, focus, hover and selected states. Never assume a token can be directly interpolated into `hsl()`; correct or replace incompatible declarations before acceptance. Use the existing `.app-shell[data-bloom-visual="premium"]` scope or an equivalently restricted integration scope, never unqualified global theming. Maintain media fallback, forced-colors, reduced motion and legible contrast.
- **Responsive/visual evidence:** At each named viewport and applicable theme, record page/fixture, exact candidate SHA, browser and screenshot path/URL in the PR. Include Today populated, first-use, partial/failed, eligible non-food and paused; Gut valid report, empty/error, mixed-rank organism list, and opened organism profile; bloodwork name-to-detail and return focus. Test 200% zoom, keyboard, safe-area/overlap, 44px touch controls and no horizontal overflow. **Automated screenshot success is not independent human visual/clinical approval**.

### 10.3 Issue disposition after this amendment

| Prior concern | Resolution supplied by owner | Current acceptance state |
| --- | --- | --- |
| Incorrect primary `Add food` fallback | Explicit contextual `action.href` / `action.label` priority | **Direction resolved; code and runtime pending** |
| Paused suggestion appears active | Dedicated “Show suggestion” recovery and safe independent actions | **Direction resolved; state QA pending** |
| Loss of scientific source details | Explicitly retain all three evidence components | **Preservation mandated; tests pending** |
| Telemetry dominating gut exploration | One compact inline metadata row; organism search/filter/profile first | **Hierarchy resolved; screenshots pending** |
| Repetitive generic bordered cards | No mandatory heavy borders, token-safe minimal primitives | **Design constraint resolved; visual quality pending** |
| Desktop/mobile disparity | Same-SHA four-width, four-theme review | **Verification protocol resolved; execution pending** |
| Shallow editorial treatment versus R4 quality | Stronger layout/photography/whitespace needed beyond CSS | **Still a visual acceptance criterion**, not an additional approval gate |

### 10.4 Final Codex handoff / definition of done

**Implement in one isolated feature branch** against a newly recorded HEAD, diffing rather than replacing existing components. Prepare a concise source-preservation changelog and a PR evidence bundle: commits, TypeScript result, relevant suite results, production build, route/CTA tests, owned-source and data-state tests, browser screenshots by viewport/theme/fixture, accessible focus/touch/zoom assessment, and a `PASS / FAIL / NOT TESTED` matrix. The Architect reconciles ownership and the Designer/Structural UX assess actual composition; no independent visual PASS may be asserted from source or screenshots that have not been reviewed. A failed or untested critical case must remain named and corrected or expressly scoped before merge. No fresh approval round is needed to begin the work.

**Updated verdict:** **YES — the owner's final directive resolves the substantive implementation ambiguity and authorizes integration.** It does **not** by itself prove premium visual quality, actual accessibility, or production correctness. **Ready to implement, not yet accepted as implemented.**