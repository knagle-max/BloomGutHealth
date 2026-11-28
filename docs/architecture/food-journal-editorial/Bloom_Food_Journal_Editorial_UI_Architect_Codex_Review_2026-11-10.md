# Bloom v0.6 — Food Journal Editorial UI: Architect & Codex Review

**Review date:** 2026-11-10  
**Decision:** **APPROVE FOR ISOLATED, SOURCE-PRESERVING IMPLEMENTATION WITH SPECIFIC REVISIONS. NOT YET VISUALLY ACCEPTED.**  
**Source reviewed:** `Bloom_Food_Journal_Editorial_UI_Handoff_v1_2026-11-10.md` and `Bloom_Food_Editorial_Handoff_v1_2026-11-10.zip` (`HANDOFF.md`, `scripts/apply_food_editorial.py`, `files/food-editorial.css`); independent User Testing handoff `Bloom_User_Testing_Food_Journal_Editorial_UI_Review_2026-11-10.md`. Current source inspected on `knagle-max/BloomGutHealth`, `enhance/bloom-experience`, 2026-11-10. No local patch run, build, Render browser execution or physical-device test is claimed.

## Executive conclusion

The proposal is a **careful presentational slice**, not a Food workflow redesign. Keep its additive approach: exact-anchor classes and one tightly scoped stylesheet instead of replacing long, mature React pages. **The best visual move is turning saved meals into open journal rows with separators rather than repeated card tiles.** However, most other Food panels still gain borders, radius and shadows, retaining an overly familiar card-stack aesthetic. Accept the slice only with a plan for stronger editorial composition and a separately tracked, measurable reduction in food-logging friction.

The controlling goal is **a personal food journal that feels warm, tactile and trustworthy**, while preserving every underlying input, correction, source and history behavior. Mobile and desktop are independent first-class surfaces.

## Source findings and implementation reconciliation

1. The handoff's source baseline was `2f46108141369536eb9a777ae4edbf3a1bba567d`; current development files have moved. **Do not apply the patch to an unknown HEAD without full preflight.**
2. The independent User Testing review reported a missing `card-daily-summary` exact anchor on its inspected HEAD. On the subsequently inspected branch, `NutritionHistory.tsx` **does contain** `<Card className="mb-6 min-w-0 [overflow-wrap:anywhere]" data-testid="card-daily-summary">`, matching the handoff patcher. This fixes that *particular* reported mismatch for the inspected source, but **does not prove all anchors match or the patch executes**. Recheck each expected anchor at execution time.
3. `client/src/styles/food-editorial.css` is **not present** on the inspected branch. This is uninstalled proposed styling.
4. `brand-tokens.css` defines `--card`, `--border`, `--foreground`, etc. as HSL channel triplets in Everyday Light/Dark and Athlete Light/Dark. Therefore `hsl(var(--card))` is compatible **with those current tokens**; check all active cascade layers and theme overrides in the browser before finalizing.
5. `LogMeal.tsx` and `NutritionHistory.tsx` contain the existing canonical capture/review and journal functionality. The patch is intended to modify only imports and class names, which should remain a strict diff constraint.
6. The Python script preflights anchor counts before writes and refuses an existing nonmatching CSS file. Retain this fail-closed approach. Execute against an isolated worktree and inspect its full diff.

## Mandatory source and functional preservation

**Food capture:** Immediate existing composer; natural-language and other gated methods; category/search/barcode/photo when supported; USDA and branded source identities; editable ingredients, household portions and grams; date and time; symptoms and restaurant context; consent; review revision; partial/unknown nutrients; source conflict; frozen/ambiguous-save drafts; idempotent receipt and retry; source mismatch; delete/reuse/recent functionality. Never infer that an image depicts the recorded food.

**Journal:** 20-item incremental history with Show more; saved meal edit and deletion; source and recorded-time detail; return focus; `MealAnalysis`; `explainFoods` with existing evidence and limitations; monthly/yearly trends; stable historical day basis and units. Source absence is not zero. Known nutrient contributions are not asserted to be complete totals.

**Account and data boundaries:** No new API, schema, stored metric, fabricated status, duplicated food editor, cross-tenant stale data or clinical claim. Keep current app-owned authenticated source lifecycle and consent.

## P0 / P1 / P2 implementation decisions

| ID | Priority | Decision / executable requirement |
|---|---|---|
| FED-01 | P0 | Execute exact-anchor preflight on the **actual integration HEAD**. On failure, reconcile that one changed anchor manually; do not loosen script into generic replacements. |
| FED-02 | P0 | Diff only expected CSS import and TSX class changes. Any hook, API, condition, save, source or data-value change must be separately reviewed and tested. |
| FED-03 | P0 | Keep review-confirm-save integrity, partial nutrition and loss-of-ack/idempotent handling across Add, Edit and History. |
| FED-04 | P1 | Keep the open separator-row journal treatment; make meal identity, recorded time, portion and Edit action legible without a pile of nested cards. |
| FED-05 | P1 | Treat new card/border/shadow styles in composer, tools, review, summary and trends as provisional. Designer must reduce repetitive framing after inspecting real rendered states. |
| FED-06 | P1 | Resolve the existing **clunky add/edit meal** complaint separately: single clear primary action; minimal steps to revise one ingredient or serving; predictable draft restoration. CSS alone does not close this requirement. |
| FED-07 | P1 | At mobile 320/390: place Add/Edit/Save access clearly, avoid bottom-tab obstruction and horizontal overflow, support native number keyboard, long food descriptions, source labels and keyboard/VoiceOver focus. |
| FED-08 | P1 | At tablet 768/desktop 1440: use width intentionally; avoid stretched single columns and endless boxed panels; maintain functional parity, appropriate line length and accessible journal scanning. |
| FED-09 | P1 | Verify Everyday Light/Dark, Athlete Light/Dark, 200% zoom, forced-colors where applicable, reduced motion, 44px touch targets and WCAG AA contrast in actual UI. |
| FED-10 | P1 | Test media failure/fallback and ensure decorative photography is not represented as a photo of the user's recorded meal. |
| FED-11 | P1 | Screenshot and document one frozen commit across first-use, composed, draft review, edit, source error/partial, confirmed save, journal history and trends on all four viewports. Record PASS/FAIL/NOT TESTED rather than assuming visual success from build. |
| FED-12 | P2 | Extract reusable journal row/summary components only after behavior parity; consider improved day navigation and compact metrics in a later scoped change, not a competing source-of-truth journal. |

## Layout requirements

### Mobile 320 / 390 CSS px
The first viewport must tell the user **what they can enter next**; a decorative masthead must not bury the actual composer. The primary entry field and Save/Review affordance must remain prominent and usable over the keyboard and above the bottom navigation or via intentional scrolling. Compact chronology: date heading → meal identity/source/time → real value and coverage → action. Long labels wrap rather than overflow. Error or pending-save state takes precedence over decorative art. Inline details and dialogs fit mobile width and restore focus.

### Tablet 768 / Desktop 1440 CSS px
Maintain the same canonical journey, but permit a balanced journal/sidebar or summary/details composition where it shortens scanning—not because all pages must be two-column. Use natural editorial spacing and restrained typography; avoid giant gradients and repeated identical white cards. Source research can remain in progressive disclosures.

### All modes
Use the existing design tokens and single canonical styling cascade. Do not hardcode Everyday emerald or Athlete navy into cross-theme components. Preserve original approved media and alt/illustrative labeling. Focus-visible states must survive all contrast variants.

## Exact QA journeys

1. Empty Food → start adding with one obvious action, without implying zero intake.
2. Compose natural-language meal → review and correct one component → save → journal/Today/Progress agree.
3. Open saved meal → change only one portion and original-source identity where appropriate → save with no unrelated recalculation.
4. Unknown or partial nutrition → existing known totals remain; incomplete status visible.
5. 409 source revision → safe retry/edit; no silently replaced user's changes.
6. Lost save acknowledgement and reconnect → one row, truthful receipt.
7. Recent/saved meal reuse → no accidental mutation of original.
8. Meal delete → history and totals update; focus returns predictably.
9. Show more 20→40+, calendar/date identity, month and year summaries unchanged.
10. Relevant `MealAnalysis`/`explainFoods` accessible without fake mechanistic claims.
11. Account switch/deletion/stale response → no preceding account's Food state exposed.
12. Every relevant task at 320/390/768/1440, Everyday/Athlete Light/Dark, zoom, keyboard/reduced-motion; actual screenshots and test receipts pinned to exact SHA.

## Delivery and acceptance

**Architect:** reconcile with current v0.6 Food UX and media contracts; allow isolated visual slice without reopening completed v0.5.  
**Codex:** exact-anchor preflight; checked-in minimal TSX+CSS diff; `npm run check`, affected tests, production build and browser task tests; same-SHA screenshots, route/theme/fixture, preview and CI evidence.  
**Designer/Brand:** judge actual rendering, particularly how many borders remain, hierarchy, image-to-content ratio and warmth; propose focused corrections not mass new components.  
**Structural UX:** assess task count/clarity for adding and editing a meal independently of styling.  
**Independent User Testing:** report practical task outcomes separately from visual appeal; no blanket PASS without execution.

**Final disposition:** **APPROVE TO IMPLEMENT AS A SCOPED PRESENTATION EXPERIMENT, CONDITIONAL ON HEAD RECONCILIATION.** This does not certify the Food UX redesign, replace the unified editor, approve rendered visuals or authorize public launch. Preserve a concrete follow-on task to simplify Add/Edit flows.