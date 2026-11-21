# Bloom v0.6 — Combined Brand / Architect / Developer Handoff
## Editorial UI primitives + source-preserving TodayFocus redesign

**Prepared:** 2026-11-10  
**Repository:** `knagle-max/BloomGutHealth`  
**Reviewed development baseline:** `enhance/bloom-experience` at `506c43c8e48291bc50b75d2a13190ff54029e81f`  
**Status:** Design/implementation proposal **only**; no code committed, no CI run, no Render release verified.  
**Review owners:** Brand & Visual Design Specialist → Chief Architect & Integration Lead → designated UI developer/Codex.

## Executive decision

**Approve the visual direction for review; do not paste the owner's proposed replacement unmodified.** The proposed `TodayFocus.tsx` improves editorial hierarchy and action prominence but removes source disclosures and existing media. Adapt the proposed `SurfaceCard`, `TelemetryMetric`, and `EditorialHero` into existing tokens and components, not a parallel design framework. The revised reference files below preserve the current Today workflow and add a visual layer.

### Current source audit

| Existing code | Required handling |
| --- | --- |
| `client/src/components/TodayFocus.tsx` | Preserve canonical recommendation selection, loading, fallback, goals, action intent/choice, error and retry paths. |
| `client/src/components/CompanionHero.tsx` | **Reuse** as the underlying hero; it provides `<section aria-labelledby>`, an `h2` with `id="today-action-title"` and `tabIndex={-1}`, media placement and actions. |
| `client/src/components/EditorialMedia.tsx` | Preserve `slot="today"` and the existing priority/fallback behaviors. |
| `CheckinSourceDetails`, `FoodSourceDetails`, `MovementSourceDetails` | Preserve **all three**; the proposed owner replacement omitted the first two. |
| `WellnessChoiceDetails` / `useWellnessChoices` | Preserve actual intention lifecycle, alternatives, save-for-later, not-relevant, exact retry and history; no silent changes to logic. |
| `client/src/components/ui/card.tsx` | Do not replace every existing card with a new surface; restrict new surfaces to a clear design use. |
| `client/src/brand-tokens.css`, `client/src/index.css` | The source of truth for Everyday/Athlete, light/dark, type, size, contrast and motion. |
| `client/public/brand/design-tokens.json` | Reference brand concepts; existing runtime CSS tokens take precedence if different. |
| `ui/primitives.tsx` | **Not currently present** in the reviewed baseline. Create only if Brand and Architect approve the constrained extension. |

### Mandatory preservation and acceptance criteria

1. **No functional regressions:** Same `todayContextAction`, `useQuery` identity/version checks, `useWellnessChoices` controller, selected/action eligibility conditions, session fallback, action intent flows, focused heading behavior, and skip-for-visit semantics. Keep the distinction between *intended*, *performed*, and *observed*.
2. **Keep media:** Retain `EditorialMedia` on eligible states, including its raster→SVG fallback, illustration labeling and responsive sizing. Avoid replacing all photography with a dark emerald gradient.
3. **Keep provenance:** Show `CheckinSourceDetails`, `FoodSourceDetails` and `MovementSourceDetails`, including unknown/incomplete/withdrawn source states. Never hide unavailable data as healthy or sufficient.
4. **Keep scientific limitations:** Source-linked rationale, limitations, not-measured semantics and external research links remain accurate. No fabricated mechanistic effects, range classifications, nutrient deficits or implicit causal claims.
5. **Reuse hero:** The `EditorialHero` below delegates to `CompanionHero`, preserving accessible heading semantics. It does **not** create an independent second hero rendering engine.
6. **Theme safely:** All colors are from `--primary`, `--card`, `--muted`, `--foreground`, `--border` etc. No fixed emerald/stone/slate text on light cards. Monospace is for selected telemetry metadata, not every action label.
7. **Design discipline:** Use elevated surfaces sparingly. `SurfaceCard` does not add pulsing green medical badges, and `TelemetryMetric` does not infer risk, ranges, or beneficial trends.
8. **Accessibility:** Minimum 44px interactive controls, visible focus, working h2 focus restoration, keyboard-expanded evidence, 200% zoom, reduced-motion support, mobile widths (320/390/768/1440), light/dark and Everyday/Athlete modes.
9. **QA and source lifecycle:** Test goals-only, no food, missing nutrient data, session fueling, valid proposed action, selected saved choice, paused suggestion, failed wellness fetch, failed session fetch, incomplete saved action history, stale actions, deleted/edited records and account switch.
10. **No main merge on review alone:** Brand recommends visual direction; Architect reconciles contracts and version drift; UI agent implements on isolated feature branch; Codex/integration owner runs actual app/API/SQL plus visual/accessibility regressions and PR CI before integration.

## Design recommendations

- Main focus first: readable personal action, clear supporting reason, primary CTA, optional alternative action.
- Use warm, tactile layers and photography; avoid an over-dark hero that consumes the page.
- Label deep disclosure **“Why this recommendation?”** rather than clinical “Biological Rationale & Sources”; keep detailed science and source links inside.
- Keep Today approachable and Biology more precise/dense. `TelemetryMetric` is primarily for recorded metrics and deeper biological views, not decorative labeling of every suggestion.
- Avoid duplicating `Card`/`CompanionHero` APIs. The new primitives are a small, reversible proposal, not a directive for mass replacement.

## Files to supply to developer

- `TodayFocus.tsx` → proposed replacement for `client/src/components/TodayFocus.tsx`.
- `primitives.tsx` → proposed new `client/src/components/ui/primitives.tsx`.
- `today-editorial.css` → proposed new `client/src/components/ui/today-editorial.css`, imported by `primitives.tsx`.

**Implementation notes:** These are reviewed against current source interfaces, but **have not been typechecked, built, browser-tested, or deployed**. In particular, Codex must diff against branch HEAD immediately before applying the code, preserve any newer activity/nutrition changes, and adjust if APIs or class precedence changed. The sample intentionally avoids changing `CompanionHero.tsx`, backend schemas or data policy.

## Required delivery report

Brand: adopt/modify/reject verdict for each primitive, visuals against the current photographic Today, brand token decisions, and responsive mockups.  
Architect: source/feature-preservation diff, component ownership and shared-style compatibility, explicit go/no-go for UI implementation.  
Developer: link to feature PR, screenshots of Today and Biology in supported modes, test output, same-SHA CI, accessibility/keyboard check, Render preview confirmation and no known source-provenance regression.

---

# Reference implementation code

The exact source files follow and are also provided separately for direct inspection. If Brand changes the direction, preserve the functional requirements above instead of copying the sample blindly.


## Biology / Microbiome addendum (2026-11-10)

This package now includes `Biology_Microbiome_Refactor_Addendum.md` and `BiologyReportTelemetry.tsx`. The full handoff embeds both the original Today code and the Biology addendum. The Biology implementation is intentionally additive to the existing `Microbiome.tsx`, not a replacement. Fake metrics, contradictory assay labels and inferred SCFA/barrier status were removed.