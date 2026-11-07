# Bloom — Lead Visual & Graphic Design Specialist Handoff
**Date:** 2026-11-07
**Specialist:** Lead Visual & Graphic Design
**Repository:** knagle-max/BloomGutHealth
**Target branch:** enhance/bloom-experience
**Status:** PROPOSED SPECIALIST GUIDANCE — assets/specification only; no product implementation or visual QA claimed
**Decision authority:** Chief Architect & Integration Lead approves / reconciles; Developer owns implementation, regression testing and final branch integration; Biology validates scientific expression; Security validates sensitive-data flows; existing Marketing & Design owner resolves brand conflicts.

## Sources and boundaries
- Reviewed attached `bloom_brand_delivery_v1(1).zip`, including tokens, handoff, screen blueprints, logos and brand concept reference.
- Reviewed attached Nutrition & Biology handoff, dated 2026-10-18, which explicitly disallows unsupported user-specific microbiome concentration, health scores and genotype=activity claims.
- Existing brand assets, everyday forest-green identity and Athlete navy/blue mode are the starting point. Do not replace existing logos unless the brand owner approves.
- No claim that code, current deployed screenshots, accessibility or responsive behavior has been inspected in this design pass. Verify against CURRENT branch head before implementation.
- All numeric/sample mock data in this document are synthetic and MUST NOT be mistaken for real user data.
- Workflow for each VIZ item: Received → Reviewed → Implemented → Tested → Specialist review.

## Vision: The Living Instrument
A premium organic scientific instrument: warm botanical editorial surfaces on top; precision, reproducibility and explicit provenance beneath. Avoid uniform bordered card grids, clinical alert panels, a dopamine/fitness gamification aesthetic, arbitrary body scores, decorative gut microbes presented as real biology, and glossy generic AI gradients. Use *quiet theatricality*: light, meaningful texture, precise spacing, restrained movement.

## Non-negotiable constraints
1. No unvalidated global gut-health score, ring, "biological age" or arbitrary readiness grade. Rings MAY visualize actual counts/progress toward an explicit user-selected target, always with a text equivalent, units, and a non-judgmental status.
2. Distinguish observed/measured, calculated, inferred association, experimental and unavailable. Use text plus icon/pattern; color alone is never the distinction. For partial logs do not portray unknown as zero.
3. Never use microbe abundance as measured metabolic flux, genotype as enzyme activity or sample pathway art as person-specific certainty.
4. WCAG 2.2 AA target; body text 16px minimum at default, high-contrast labels, 44px touch targets, keyboard focus, reduced motion and high-contrast alternatives. Verify calculated colors empirically.
5. Preserve base routes, consent, chart data, source attribution, dietary constraints, food unknown nutrient semantics and Athlete access behavior. No paywall implied by Athlete switch.
6. No sensitive user data in marketing or hero screenshots; example data must be clearly marked synthetic.

## VIZ-101 — Material & color architecture | P1 | Design proposed
Extend—not discard—the October brand tokens. Existing brand `#246B50` stays as functional primary/action color until brand review. Editorial palette:
```
--bloom-brand:#246B50; --bloom-brand-hover:#19543D;
--bloom-ink:#173E32; --bloom-ink-strong:#102B25;
--bloom-paper:#F5F3EB; --bloom-canvas:#F9FAF5;
--bloom-sage:#D9E7D5; --bloom-mist:#EDF3EC;
--bloom-clay:#D4A37C; --bloom-lilac:#C9BDE3;
--bloom-warm-white:#FFFEFA; --bloom-muted:#52685C;
--bloom-line:rgba(23,62,50,.11); --bloom-shadow:0 10px 35px rgba(18,47,37,.07);
--bloom-focus:#16634A;
--bloom-athlete-base:#0F1B2E; --bloom-athlete-surface:#182B45;
--bloom-athlete-accent:#81BEFF; --bloom-athlete-ink:#F1F6FF;
```
Material recipes: CANVAS uses flat paper with an optional CSS-only ambient wash `radial-gradient(circle at 8% 0%,rgba(217,231,213,.50),transparent 46%)`; EDITORIAL PANEL uses `background:rgba(255,254,250,.88);border:1px solid var(--bloom-line);box-shadow:var(--bloom-shadow);border-radius:28px`; INSET FIELD uses `#EDF3EC` with inner border `rgba(23,62,50,.08)`; FLOATING ACTION uses solid `#246B50`, white label and 24px radius. `backdrop-filter:blur(14px)` on overlays only, feature detected; never depend on blur for legibility. Athlete surfaces use navy, not recolored cream cards. Avoid more than 1 shadow-bearing surface per visual group.
Tailwind suggestions: `rounded-[28px] bg-[#FFFEFA]/90 shadow-[0_10px_35px_rgba(18,47,37,0.07)] ring-1 ring-[#173E32]/10`; atmospheric background as utility CSS, not a huge image.
Before: repeated equal-size white bordered panels. After: one large editorial feature, smaller flush details separated by spacing / dividers, sparse textured inset compartments.
Acceptance: one central token source, light & Athlete screenshots, 320/390/768/1440, contrast and transparency fallback verified.

## VIZ-102 — Typography & information hierarchy | P1 | Design proposed
Retain Inter as app body per existing package; permit optional editorial serif (e.g. Georgia fallback) ONLY for occasional 28–40px headline/hero numeral if license/visual QA permits, never dense metrics. Precision numerals use `ui-monospace,SFMono-Regular,Consolas,monospace` `font-variant-numeric:tabular-nums`. Scale: display 40/44 mobile or 52/56 desktop; title 28/34; section 22/28; body 16/24; metadata 13/18; high-density scientific tables 13/20 minimum with responsive zoom. Tracking display -0.025em, mono +0.01em. Focal data value 36px, label 13px, unit 14px. Make one typographic hero per viewport; never show six equally prominent KPI tiles.
Before: homogeneous dashboard titles and values. After: editorial headline → immediate task → evidence annotation → scientific drilldown.
Acceptance: baseline, text zoom 200%, long bilingual labels and dynamic text must not clip.

## VIZ-103 — Icon system & illustrations | P1 | Design proposed
Create two related families:
- Interface `Botanical Line`: 24px stroke 1.75, rounded stroke caps/joins, restrained asymmetry, transparent backgrounds; consistent 20/24/32 viewBoxes. Source SVG icons must use `currentColor` wherever possible; avoid icon-as-only-label.
- Editorial `Scientific Botanical`: vector silhouettes of leaves, seeds, food fibres, digestive organs or pathway networks, with organic shapes and subtle layered translucent tints; no anthropomorphic cartoon germs, no photographic fake molecular diagrams, no unsupported user-specific biology.
- Micro-data `Instrument`: 1px grid lines, ticks, dotted uncertainty lines, sharp corners for high precision subpanels and fully rounded trend strokes.
- Vignette uses 1–3 restrained motifs maximum: `leaf-orbit.svg`, `fiber-weave.svg`, `pathway-nodes.svg`; all decorative with `aria-hidden=true` when no information encoded.
Before: decorative emojis, flat generic food clip art. After: restrained branded organic visuals matched to route and meaning.
Acceptance: SVG valid and optimized, crisp 16/24/48, dark/light contrast, accessible text accompanying meaningful icons, reduced-motion static states.

## VIZ-104 — Route-level art direction | P1 | Design proposed
| View | Hero composition | Palette signature | Distinctive visual |
|---|---|---|---|
| Today | 60/40 desktop hero split, stacked mobile; single next action and daily context | paper/forest/sage | curved botanical progress trail with explicitly named tracked task, NEVER health score |
| Food | magazine-style ingredient spotlight + practical log composer; mobile CTA anchored above safe area | oat/clay/herb green | layered ingredient cutaways, actual grams/servings distinctly labelled |
| Biology | annotated atlas: biological pathway graph + inspectable evidence drawer | deep ink/sage/lilac | node-and-link topology; measured vs hypothetical differentiated |
| Explore | discovery library with oversized editorial categories and asymmetric image crops | porcelain/greens/pollen | topic-index spreads; no generic three-card grid |
| Progress | quiet longitudinal chronicle, full-width plots with observation notes | mist/ink/lilac | source-aware trends & interval comparisons |
| Athlete | navy performance console, compact telemetry integrated with warm human copy | navy/blue/pale cyan | high-contrast timeline and training/fueling events; no fabricated recovery score |
Responsive: `max-width:1200px` editorial rail; mobile side padding 20px, desktop 32px; section gaps 32–48px; minimum card width 280px; 390px mobile hero entirely single-column, CTA in first viewport. Before: same grid design for all 6 pages. After: six editorial personalities with shared nav and tokens.
Acceptance: 320,390,768,1440 layouts; route consistency, single primary CTA and accessible orientation.

## VIZ-105 — Data visualization system | P0 safety / P1 styling | Design proposed
- Baseline plots: 2px solid measured line `#246B50`, smooth tension limited to prevent false interpolation; 20–30% area opacity fading to transparent. Points: 6px filled, 2px cream outer stroke, keyboard/tool-tip equivalent in data table. Missing observations: *line breaks*, shaded unobserved region labelled Missing, NEVER zero fill.
- Comparison bands: neutral study/reference interval with line pattern and explicit source; do not imply clinical interpretation without science sign-off.
- Uncertainty/inferred: dashed `4 4` strokes, 40% color opacity, inline `Association / experimental` labels; measured series uses solid marks. Never interpolate across disconnected dates by default.
- Charts have clear axis labels, units, dates/time zone where applicable, data provenance `Source: ...`, optional assay/unit/method, reference interval conditions, explicit empty-state.
- Metric rings allowed ONLY for direct completion e.g. "3 of 4 meals logged" or "24 of 30 g selected fiber target" when denominator is valid and complete; do not turn missing nutrient measurements into implicit progress. Ring thickness 8px, diameter 112px, round caps, text centre, status verbally stated outside color.
- Athena/Athlete telemetry: 12px mono tick labels, compact grid, blue `#81BEFF` tracked line over navy `#0F1B2E`, colorblind-friendly icons and patterns for events.
- Lab data precision: no arbitrary smoothing of measurements, lab units printed, no clinical traffic-light palette for values without validated ranges + decision support.
Before: score circles and uniform green bars imply "good/bad". After: provenance-first trend plots and target-completion graphics only.
Acceptance: test unknown, sparse, negative, irregular-date, duplicate timestamp, outlier, unit switch, multiple-source and long-label cases. SVG or canvas chart paired with accessible table/summary.

## VIZ-106 — Science and uncertainty grammar | P0 | Design proposed
UI reading order: **Action / observation → Why it may matter → Evidence status → inspect source/pathway**. Use identical data-semantic names across app and map to existing Biology taxonomy; proposed display terms:
`Measured` = directly observed source;
`Calculated` = transparent computation, source known;
`Association` = observed in studies, not necessarily causal for user;
`Research model` = experimental hypothesis, not clinical prediction;
`Not available` = not observed.
Example copy: "Fibre intake recorded: 18 g from logged foods. Some foods have incomplete nutrient data, so daily total may be understated." DO NOT claim 18g fully known if unknown items present; label "At least 18 g recorded" where appropriate.
Display labels neutrally: small pictogram + text (not red/yellow/green ranking). Clickthrough has references, study population, limitations, uncertainty and date.
Before: misleading personalized pathway effectiveness. After: explicit distinction between suggestion and evidence.
Acceptance: Biology reviews all illustrations that imply host/microbe reaction; MKT-001 and BIO-2026-101/102 mapped, claims audit approved before production.

## VIZ-107 — Interaction & motion | P1 | Design proposed
Motion tokens: enter 180ms `cubic-bezier(.2,.8,.2,1)`; chart reveal 350ms only when observed data available; hover/focus 120ms; drawer 220ms; never continuous floating algae or pulsating organ animation. Motion limited to 8px translation and opacity; prefers-reduced-motion disables nonessential transitions/animation. Tracked chart value cursor must work by keyboard and touch.
Before: visually noisy "alive" dashboard. After: microinteractions feel like physical instrument controls.
Acceptance: `prefers-reduced-motion` test, keyboard interaction, 44px targets, safe-area nav overlay.

## VIZ-108 — Before/after mock composition detail | P1 | Design proposed
TODAY before = greeting + many KPI tiles + shortcut row. After = `Good morning` quiet 13px eyebrow; serif optional `What nourishes you today?` 36px; single 56px primary action; a 2/3 width seasonal recipe visual with evidence annotation and source disclosure; right 1/3 narrow Daily Log ribbon; mobile action precedes imagery.
FOOD before = scanner/manual/photo buttons in three panels. After = warm full-width log toolbar (Search + Scan + Add), ingredient imagery below, selected servings in a discrete inset field; nutrient provenance on disclosure.
BIOLOGY before = microbe score tiles. After = black-ink biological atlas, focus on one selected pathway; small measured markers and dotted research relations; evidence drawer always available; no imagined flux.
EXPLORE before = standard cards. After = two-column asymmetric atlas tiles with consistent category labels and genuine context; one full-bleed botanic category hero max per row.
PROGRESS before = many isolated green sparkline tiles. After = one long trend with event annotations + two text callouts; date/source footnote; optional scientific table.
ATHLETE before = generic dark KPI tiles. After = focal workout or fueling timeline with high-contrast 24px numeric event labels, restrained cyan curve, explicit missing/wearable source status and no fabricated readiness.
For each screen use fixture states: no data, partial data, complete data, import pending, import error, conflicting evidence and restricted consent.

## VIZ-109 — Delivery and dependencies | P1 | Design proposed
Files in `design/visual-system/`: handoff, tokens JSON, and SVG vector motifs. Existing approved brand logo source lives in prior brand package; production developer should copy approved logos from brand delivery into existing asset pipeline rather than generating a duplicate.
Dependencies: VIZ-101→VIZ-102/103→VIZ-104/105/106→VIZ-107/108.
Implementation suggestion: add visual tokens as CSS variables + Tailwind theme aliases, refactor shared `PageMasthead`, `EditorialPanel`, `MetricFigure`, `EvidenceLabel`, `DataProvenance`, `TelemetryChart` primitives. No charts should be created from invented personal values.
Review checklist: page snapshots at 320/390/768/1440; everyday + athlete + device light/dark variants; keyboard-only; OS text zoom; reduced motion; automated accessible color/semantic checks; Biology + Security approval where implicated; before/after screenshots per view.

## Handoff summary / review request to Architect
- VIZ-101 material/tokens — Received/proposed
- VIZ-102 typography — Received/proposed
- VIZ-103 original icon/illustration grammar — Received/proposed
- VIZ-104 six route compositions — Received/proposed
- VIZ-105 telemetry plots & completion-only rings — Received/proposed
- VIZ-106 evidence/missingness — Received/proposed
- VIZ-107 interaction motion — Received/proposed
- VIZ-108 before-after & fixture set — Received/proposed
- VIZ-109 delivery integration — Received/proposed
**No shipped UI, deployed screenshots or QA signoff claimed.**
