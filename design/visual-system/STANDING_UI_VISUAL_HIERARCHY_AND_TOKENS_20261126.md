# Bloom — Standing UI Visual Hierarchy & Design Token Specification

**Effective:** 2026-11-26  
**Status:** **MANDATORY VISUAL-DESIGN HANDOFF REQUIREMENT** for Branding / UI / Design System Agent and successors; **DESIGN CONTRACT, NOT APPROVED AUTOMATIC GLOBAL CODE CHANGE**.  
**Owner standing order:** The exact mandate is recorded below. Visual Designer produces paint-layer tokens and visual component state designs for every proposed screen/component set; UX Agent retains information architecture, flow, CTA location and structural layout authority under [VISUAL_LANE_AMENDMENT_01.md](VISUAL_LANE_AMENDMENT_01.md). Architect reconciles existing approved work and precedence; Codex implements and tests only eligible tasks per `AGENTS.md` and `NEXT_ACTIONS.md`.  
**First-read:** [SPECIALIST_HANDOFF.md](SPECIALIST_HANDOFF.md) and current `client/src/brand.css`, active stylesheets/theme contexts, R4/M1 design sources and [VISUAL_MATERIALS](../../docs/operations/VISUAL_MATERIALS.md). The token names below are **semantic specification slots**, not assertions that equivalent CSS variables exist. Never replace active brand tokens without a scoped review.

## Standing order (owner intent)

> For any screen or component set in Bloom, provide a **UI Visual & Design Token Specification** so engineering implementations render with deliberate hierarchy, clear contrast, and consistent spacing on the first pass.

1. **Surface elevation and contrast hierarchy:** explicit canvas, elevated surface/sheet/drawer, subtle border, primary/secondary/muted text, and primary interactive/active tokens; avoid muddy low-contrast blocks.
2. **Typography, spacing and shape:** exact font sizes/weights/line heights, padding/gap rhythm and radii for titles, labels, microcopy, inputs, chips, cards and bottom sheets/drawers.
3. **Interactive states and anti-patterns:** explicit default, hover/focus, selected/active and disabled treatments for toggles, chips, sheets and primary CTAs. Prohibit unstyled stacked form dumps, repetitive full-width boxed clutter and low-contrast prose walls.
4. **Aesthetic/asset alignment:** clean, uncluttered Bloom minimalism using approved assets. Never alter underlying scientific vectors, muscle-map path IDs, coordinates, clinical/data contracts or image rights merely for decoration.

## 1. Deliverable on EVERY screen/component proposal

Include a named **`UI Visual & Design Token Specification`** section in the handoff containing:

- **Scope/source anchors:** named screen, route, exact current component(s), current theme implementation, current token/stylesheet reference and reused asset IDs. Distinguish actually inspected source from proposed design.
- **Four-theme role map:** Everyday Light / Dark and Athlete Light / Dark for canvas, surface-0 (plain), surface-1 (content surface), surface-2 (raised card), surface-3 (sheet/drawer), border/subtle, border/strong, overlay/scrim, text-primary, text-secondary, text-muted, CTA/filled, CTA/text, selected/container, selected/outline, focus ring, error/warning/info. Provide exact values as CSS variables, color codes or HSL role references after reading existing approved tokens; give resulting on-surface contrast calculations. Do not invent a one-size-fits-all inversion.
- **Elevation and optical depth:** a single clear hierarchy of flat canvas → restrained content surface → intentionally raised card → modal sheet/drawer. Define whether a surface uses tint, border or shadow; never stack all three indiscriminately. Include any backdrop, scrim and blur role with performance/reduced transparency alternatives.
- **Typography matrix:** title, section title, card title, major metric, label, field text, body, description and microcopy. Include actual family (existing approved tokens first), CSS font size, line height, font weight, tracking, wrapping/line-clamp policy, minimum reading size and numerals/tabular-nums where relevant. If proposing Newsreader/Plus Jakarta Sans, state font availability/licensing/dependency and fallback instead of silently switching the entire app.
- **Spacing and geometry matrix:** base 4px rhythm with explicitly chosen 4 / 8 / 12 / 16 / 20 / 24 / 32px roles (deviations documented); component padding, internal gaps, between-section distances, min control height 44px, radius by surface/component, divider/border width and drawer safe-area insets. Prescribe exact values by breakpoint where visual geometry changes, while deferring layout structure to UX.
- **State matrix for EACH interactive component:** default, hover (pointer), focus-visible, selected/active, pressed, disabled, loading, error and destructive where applicable. Include border/fill/ink/icon/label/elevation/motion values; use text/icon/shape plus color to convey selection; keyboard and screen-reader semantics preserved by implementation.
- **Content-density rules:** visible hierarchy in first viewport; one dominant task/action; body copy limited to purposeful, scannable information; secondary explanations through semantic disclosure. Avoid stacked full-width boxes and repetition, but do not remove provenance, evidence, warnings, accessible labels or exact data.
- **Responsive matrix:** 320 / 390 / 768 / 1440 CSS px; Everyday/Athlete × Light/Dark; 200% text zoom, long translations, keyboard/VoiceOver, safe areas and small phone bottom controls. A screenshot of one mockup is not acceptance.
- **Asset alignment:** ID/path/source-hash and latest design/rights/science status of each reused BVA, CHART, REL, ONB or anatomical asset. Preserve vector geometry, path IDs and region mapping; decorative imagery cannot imply measured physiology.
- **Evidence/acceptance:** before/after same-SHA browser screenshots, contrast ratios, touch/keyboard focus checks, theme and reduced-motion review, functional/source provenance regression; clearly distinguish specified vs delivered vs integrated vs visually accepted.

## 2. Proposed numeric design baseline (subject to active-brand token comparison)

These are **proposed default measurements**, to be adjusted per approved screen and source, not a blanket stylesheet change. For any actual handoff, provide a filled matrix with the precise current/applicable token references.

| UI role | Proposed baseline | Required notes |
| --- | --- | --- |
| Primary page heading | 30–36px / 1.12–1.2 / 400–500 (editorial), responsive | Never replace canonical headings with decorative SVG text |
| Section title | 22–26px / 1.2–1.3 / 500–600 | More distinctive than field labels |
| Card title | 17–20px / 1.3–1.4 / 550–650 | Keep legible at 320px |
| Major metric | 28–36px / 1.05–1.2 / 600–700; tabular nums | Unit separately visible, not fake measured value |
| Body copy | 15–16px / 1.5–1.65 / 400 | Avoid narrow low-contrast text columns |
| Field label | 13–14px / 1.3–1.45 / 600 | Descriptive label, not placeholder alone |
| Supporting text | 13–14px / 1.45–1.6 / 400 | Verify AA for normal text |
| Microcopy | 12px minimum where practical / 1.4–1.5 / 500 | Do not put important consent/science information into microtype |
| Input/CTA | 44px min hit height (48px preferred primary CTA), 12–16px horizontal padding | Larger if wrapping; no fixed-height text clipping |
| Chip | 32–36px visual height, 44px effective touch target | Label and noncolor selected state |
| Compact card | 16–20px internal padding, 12–16px gap | Do not force a box around every fact |
| Primary surface/card radius | 12–18px | Choose a small coherent scale, not arbitrary per card |
| Drawer/sheet radius | 20–24px exposed corners | Clear surface separation; honor safe area |
| Section spacing | 20–32px | Visual grouping via whitespace before borders |

**Color/contrast rule:** use the exact approved per-theme brand token values. For normal text target WCAG AA 4.5:1 and for large text at least 3:1; focus/interactive boundaries and non-text icons should meet applicable 3:1 contrast. Hover-only treatment cannot replace visible focus. Disabled states may follow exceptions but must remain visually understandable. No clinical traffic-light interpretation without scientific approval.

## 3. Named interactive-state example (template — must be completed per component)

| State | Surface/border | Text/icon | Motion / accessibility |
| --- | --- | --- | --- |
| Default | Surface-1, subtle border or clean unboxed form | High-contrast ink | Accurate semantic control |
| Hover | Modest surface tint/outline; no layout jump | Stable readable ink | Pointer only |
| Focus-visible | 2–3px focus-ring contrast + offset | No text change required | Keyboard focus independent of hover |
| Selected / active | Deliberate active fill or visible outline + check/indicator | Active ink with AA contrast | State exposed via aria-pressed/checked/selected |
| Pressed | Slight depth/tint shift; optional micro-scale only if non-disruptive | Legible | Reduced-motion static alternative |
| Disabled | Distinct muted/disabled role | Readable reason elsewhere when needed | Noninteractive semantics; not merely opacity |
| Loading | Stable frame + progress/status text | No misleading success | Announce status, prevent duplicate action |
| Error | Clear label, inline recovery and accessible status | Contrast-safe | Keep prior input values; do not rely on red alone |

## 4. Anti-pattern checklist — MUST reject

- Low-contrast grey/green prose over similarly tinted material; muddy multi-layer panels with ambiguous foreground/background.
- Generic unstyled stacks of field labels and inputs without hierarchy, sensible grouping, or one clear CTA.
- Repeated, full-width nested bordered cards for every paragraph, footnote, label or informational fact.
- A one-off mixture of 10/11/12px body/micro text, clipped labels, inaccessible control heights or brittle absolute placement.
- Multiple competing primary call-to-actions, giant hero imagery crowding the first task, ornamental gradients making plots or source text harder to inspect.
- Light and dark modes that simply invert color instead of independently reviewing surfaces and contrast; Athlete that is just bright neon.
- New vector tracing, shadow effects, heatmaps or overlays that alter canonical science graph positions, muscle anatomy paths, lab observation values, molecule structures or hit targets.
- Baked-in fake biological metrics in illustrations or decorative uncertainty replacing source metadata.

## 5. Reusable cut-and-fill specification for each new screen

```md
### UI Visual & Design Token Specification — [SCREEN / COMPONENT]
Source: [current exact route / file / SHA or NOT INSPECTED]
UX structure: [approved composition reference; no structural change proposed]
Existing approved assets: [BVA / CHART / ONB / REL IDs, SHA, lifecycle]

1. Hierarchy: [primary heading, one primary action, content groups, source disclosures]
2. Theme tokens: [role-by-role values for Everyday L/D and Athlete L/D]
3. Elevation: [canvas/surface/card/sheet relative contrast, borders and shadow]
4. Type: [element → font family, px, weight, line-height, tracking, wrap]
5. Space/shape: [component → padding, gap, radius, dividers, breakpoint]
6. Controls: [default/hover/focus/pressed/selected/disabled/loading/error exact appearance]
7. States: [empty, partial, success, offline, source-withdrawn, safety-sensitive]
8. Assets: [reuse/modify/defer, exact link to registry and vector invariants]
9. Acceptance: [320/390/768/1440; four themes; 200%; WCAG; keyboard/touch; real browser; source data]
Owner: Branding visual treatment | UX structural | Architect reconcile | Codex implement | Biology/Security where relevant
Status: SPECIFIED — no implementation or test claim
```

## 6. Successor-agent operating instruction

**At every takeover, read this standing order before proposing a component or artwork bundle.** Include a complete UI Visual & Design Token Specification with each screen/component handoff, even when it reuses existing approved assets. If a request is only a standalone artwork, supply its intended UI surface, theme roles and responsive/selection treatments rather than guessing a new screen layout. Review current actual component code and assets first. Call out missing token definitions and propose bounded changes through Architect/UX; no parallel registry, no autonomous new release/deploy. Add the spec to the same handoff as the asset, or link a versioned common token matrix plus only the precise deviations—never leave implementation to infer contrast, spacing, typography or states.
