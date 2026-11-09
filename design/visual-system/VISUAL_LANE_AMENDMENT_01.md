# Bloom Visual Lane — Boundary Amendment 01
**Date:** 2026-11-07
**Status:** Proposed aesthetic specification; implementation pending UX Agent/Architect coordination.
**Authority:** UX Agent owns navigation, route structure, CTA order/placement, content priority, component arrangement, interaction and progressive disclosure. Visual Agent owns only the paint layer (color, texture, border, shadow, type styling, icon geometry, visual chart paint). Developer implements approved UX layout without alteration.

## Supersession rule
This amendment supersedes ALL structural suggestions in `SPECIALIST_HANDOFF.md`, including the proposed 60/40 Today hero, anchored Food CTA, rail/column dimensions, mobile CTA ordering, route grid substitutions, disclosure location, and suggested relocation of actions. They are **illustrative styling examples only**, not implementation requirements. Never interpret aesthetic specifications as permission to change DOM reading order, navigation, disclosure behavior, screen inventory, primary CTA prominence/order/position, aria semantics, or data model. Avoid overwriting UX-owned spacing/layout tokens; style existing structural slots instead. Visual tokens defer to existing approved brand identity and approved WCAG requirements.

## VIZ-L01 — Locked palette and gradient map (visual-only)
Use existing functional brand green `#246B50` for primary actions; forest ink `#173E32`; strong ink `#102B25`; cream paper `#F5F3EB`; canvas `#F9FAF5`; white `#FFFEFA`; sage `#D9E7D5`; sage mist `#EDF3EC`; clay `#D4A37C`; lilac `#C9BDE3`; muted ink `#52685C`. Athlete: background `#0F1B2E`; elevated `#182B45`; accent `#81BEFF`; copy `#F1F6FF`. Do not communicate scientific state using color alone; verify contrast of every intended color pair before shipping.
- `--bloom-gradient-ambient: radial-gradient(ellipse at 8% 0%, rgba(217,231,213,.50) 0%,rgba(217,231,213,0) 46%)`
- `--bloom-gradient-chart: linear-gradient(180deg,rgba(36,107,80,.24) 0%,rgba(36,107,80,0) 100%)`
- `--bloom-gradient-warm: linear-gradient(135deg,#F5F3EB 0%,#EDF3EC 100%)`
- `--bloom-gradient-athlete: linear-gradient(180deg,#182B45 0%,#0F1B2E 100%)`
- `--bloom-gradient-athlete-chart: linear-gradient(180deg,rgba(129,190,255,.26),rgba(129,190,255,0))`

## VIZ-L02 — Typography (style only)
Body: Inter or existing approved body font `16px/24px; font-weight:400`. Page display treatment: `clamp(28px,3.6vw,48px)` / `1.12` with letter-spacing `-.025em` ONLY within UX Agent's heading slot. Section label `22px/28px,600`. Value headline `36px/40px,600`, metric unit `14px/20px`. Detailed scientific/telemetry values: `ui-monospace,SFMono-Regular,Consolas,monospace`; `font-variant-numeric:tabular-nums`; `font-feature-settings:"tnum" 1`. Metadata `13px/18px` where contrast and 200% zoom pass. Do not add headings or re-order heading levels to achieve typography.

## VIZ-L03 — Custom primitives (paint-only)
`<SurfaceCard>` maps to existing UX-owned wrapper: background `rgba(255,254,250,.88)`, 1px solid `rgba(23,62,50,.11)`, radius `28px`, shadow `0 10px 35px rgba(18,47,37,.07)`; alternate material `#EDF3EC` with `rgba(23,62,50,.08)` inner border. No changes to padding, grid span or click target. Tailwind paint: `rounded-[28px] bg-[#FFFEFA]/90 ring-1 ring-[#173E32]/10 shadow-[0_10px_35px_rgba(18,47,37,0.07)]`. Omit outer shadow on nested instances.
`<EditorialHero>` maps to the UX Agent's preexisting hero region: background `var(--bloom-gradient-warm)`; optional noninformational SVG overlay `leaf-orbit.svg` `position:absolute;inset:auto 0 0 auto;opacity:.12;pointer-events:none`; border-radius `32px`; heading style from VIZ-L02. Do not change height, action placement, layout or order. Overlay never masks text or actionable controls. Tailwind paint: `relative isolate overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#F5F3EB_0%,#EDF3EC_100%)]`.
`<TelemetryDisplay>` maps to existing metric slots: `background:#0F1B2E;color:#F1F6FF` in Athlete or `background:#EDF3EC;color:#173E32` in everyday; mono numerical type, 1px hairline separators, 4px grid patterns, focal value `36px/40px`. No new KPIs, gauges, slots, readiness claims or component reorder. Tailwind paint for Athlete: `bg-[#0F1B2E] text-[#F1F6FF] [font-variant-numeric:tabular-nums]`.

## VIZ-L04 — Chart visual rules (preserve data, axes and interactions)
Measured line: `#246B50`, `stroke-width:2.5`, round caps/joins. Points 6px diameter and 2px cream outline, visually emphasized selected point 9px with 2px focus halo; retained tooltips, keyboard equivalents and source. Gradient under line uses `--bloom-gradient-chart`, opacity <= .24; no curve smoothing that implies observed values or obscures outliers. Missing data breaks the stroke; it never becomes zero or an area fill. Dotted `stroke-dasharray:4 4` with text legend for inferred/research. Grid lines `rgba(23,62,50,.12)`, ticks 13px mono, axes 1px. Athlete swap to `#81BEFF`, grid `rgba(241,246,255,.15)`, gradient `--bloom-gradient-athlete-chart`. Existing reference intervals, scales, units, table fallbacks and scientific provenance are UX/Biology-owned and unchanged.
Ring styling ONLY where the UX Agent and science model already authorize a meaningful denominator: 112px OD, 8px stroke, rounded cap, undertrack `rgba(36,107,80,.12)`, completion `#246B50`; Athlete undertrack `rgba(129,190,255,.16)`, completion `#81BEFF`. Keep the exact preexisting label and aria equivalent; no new score/gauge. Distinguish missing observations with explicit text/patterns.

## VIZ-L05 — Tactile surface & motion
Microborder `1px solid rgba(23,62,50,.11)`; inset hairline `1px solid rgba(23,62,50,.08)`; shadow `0 10px 35px rgba(18,47,37,.07)`; radius set `16,20,28,32px` for visual wrapper styles; overlays alone may use `backdrop-filter:blur(14px)` with opaque CSS fallback. Do not use blur on body text or chart labels. Existing interaction timings remain UX-owned; purely decorative transitions may use `180ms cubic-bezier(.2,.8,.2,1)` and must be removed when `prefers-reduced-motion:reduce`.

## VIZ-L06 — Before/after aesthetic descriptions (same UX skeleton)
- Today: BEFORE UX-owned greeting, action and context inside flat institutional gray borders; AFTER identical elements and positions dressed in warm paper, forest typography, subtle sage atmospheric wash and restrained botanical watermark.
- Food: BEFORE existing entry controls and nutrient data in gray/white neutral boxes; AFTER identical controls in warm-white tactile fields, clay highlights for food imagery and precise mono nutrient annotations. No CTA movement.
- Biology: BEFORE existing source, pathway and evidence panes in generic box styling; AFTER same panels/sequence with ink typography, sage analytical substrate and lilac dotted research-only relationships; no invented anatomy/flux.
- Explore: BEFORE existing collections in generic white tiles; AFTER same collection/grid structure with atmospheric fills, editorial headings and distinctive line iconography; no category moves.
- Progress: BEFORE existing chart spaces with flat green lines; AFTER same charts, axes and inspection controls with faint area gradients, crisp labeled points and provenance-compatible fine ticks.
- Athlete: BEFORE existing performance slots in dark generic widgets; AFTER exact slots on layered navy, blue measurement strokes and crisp mono telemetry; no invented readiness values.
Acceptance snapshots compare pre/post DOM/route/CTA ordering: **pixel paint changes are permitted, structural diffs are not**.

## Delivery / test checklist
1. Developer maps `SurfaceCard`, `EditorialHero`, `TelemetryDisplay` to existing UX components without changing their hierarchy or API.
2. Visual regression at 320/390/768/1440 and 200% zoom; contrast WCAG 2.2 AA; reduced motion; supported dark/light modes and Athlete.
3. Snapshot assertion: navigation, CTA coordinates/order, DOM reading order and progressive disclosure triggers remain UX-approved.
4. Data viz checks: missing/partial data, variable units, duplicates/outliers, series labels, plot focus, scientific status and recorded vs inferred distinctions.
5. Approval: UX Agent for hierarchy non-regression; Biology for chart semantics; Architect for integration; Developer for execution.
**Status of all items:** designed/specification delivered, NOT implemented, NOT tested, NOT approved.
