# Bloom — Branding & UX Review: Six Pillars, One Coherent Experience
Date: 2026-10-24 (America/Regina)
Owner: Branding & UX Specialist
Source reviewed: Bloom_User_Testing_Six_Pillars_Experience_Gap_Review_2026-10-24.md, UT-EXPERIENCE-1401–1408.
Disposition: CONDITIONAL APPROVAL for Chief Architect consolidation; design handoff only. No claims of app implementation, user testing, deployment or clinical approval.
Source branch context in User Testing handoff: enhance/bloom-experience, 0694b5a9e91537531c2753c9879357eaa7fe225f. This is the User Testing agent's reference, not a fresh live visual audit.

## Central decision
Make Today (action), My Biology (evidence), Progress (dated responses) the three clear user destinations. Other features are tasks/details within them, not new competing dashboards. App-wide content density and spacing/overlap bugs are P0 prerequisites to new visual motivation UI. Every new visual must displace, not duplicate, verbose copy.

## Source-by-source review and design disposition
- UT-EXPERIENCE-1401 P0: APPROVE. Deliver three-destination IA map. Preserve coherent return path; avoid a fourth default tab.
- UT-EXPERIENCE-1402 P0: APPROVE with Biology/Legal review. Reuse concise recommendation evidence ladder; action + short why + source-status + edit/dismiss; never cover safety warnings in collapsed content.
- UT-EXPERIENCE-1403 P0: APPROVE. Reuse Five Ways, Photo, Restaurant kits; one canonical editable draft/save with reversible route switching.
- UT-EXPERIENCE-1404 P1: APPROVE as descriptive/provenance flow, not causal implication. Deliver event-to-progress-to-possible-plan-change journey asset.
- UT-EXPERIENCE-1405 P1/P0 safety: APPROVE. Reuse existing Visual Intelligence kits and safety constraints, but wait for v0.5 crowding fixes.
- UT-EXPERIENCE-1406 P0: APPROVE. Manual path must remain available; do not require external sources for core value.
- UT-EXPERIENCE-1407 P1/P0 safety: APPROVE study protocol guidance only; no end-to-end test has been performed.
- UT-EXPERIENCE-1408 P0 UX/P1: APPROVE as design release gate; every new section must state which earlier text/control it replaces.

## New design acceptance IDs
**MKT-EXPERIENCE-1701 (P0) — Three-destination navigation.** Today, My Biology, Progress; screen function visible on entry, one primary action. Empty pages remain actionable and concise. Additional mode-specific navigation may appear only if role-required and approved.
**MKT-EXPERIENCE-1702 (P0) — One action/evidence/progress cycle.** Flow begins with practical suggestion or manual entry; one canonical review/save; dated progress; qualified evidence; only reviewed plan changes. Historical state not rewritten.
**MKT-EXPERIENCE-1703 (P0) — Minimal copy/clear spacing.** Default cards: short heading, optional one-line reason, one action. 16px mobile gutters and 16–24px card insets as baseline; no clipped/floating headings, competing CTAs or fixed-nav occlusion. Confirm in real iPhone Safari; source-only review is insufficient.
**MKT-EXPERIENCE-1704 (P0) — Source unavailable recovery.** No connectors, provider outages, stale imports and missing official restaurant menu all preserve manual utility and explicitly mark estimates and unknowns.
**MKT-EXPERIENCE-1705 (P1, P0 safety) — Motivation displaces copy.** One or two data-inspectable indicators only, honest incomplete/rest states, no pressure to train through pain or restrict food unsafely.
**MKT-EXPERIENCE-1706 (P1, P0 release gates) — End-to-end UX verification.** Validate multi-step paths at 320/375/390 px and 200% zoom, voice/keyboard, theme/mode, error and no-data states; screenshots before/after for material corrections, exact route return and idempotent saves. Prioritize user-facing browser evidence before specialist sign-off.

## Delivered visual assets
- `three_destinations.svg`: core navigation and each area's single question, not a new layout system.
- `single_journey.svg`: one flow from action to canonical data to dated outcome to qualified change/abstention.
- `concise_today_mobile.svg`: task-first 390px mobile wireframe with correct spacing and compact activity signal, visibly synthetic.

## Dependencies / conflict resolution
Architect reconciles UT-EXPERIENCE IDs with MKT-FOOD-801–806, MKT-LAYOUT-1301–1306, MKT-MOB-1401–1405, UT-COPY-1101–1107, UT-SIMPLE-901–910, UX-OPT and Visual Intelligence. Biology/ML owns evidence/causality and safety; Integrations real provider status; Security/Legal consent; User Testing actual studies; Codex implementation and tests.

## Verification
Editable SVG source assets created. Not verified against a rendered up-to-date application; not integrated, not measured, not release approved. Do not supersede P0 safety or regulatory restrictions.
