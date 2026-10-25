# Bloom — Whole-Application Experience Redesign, Branding & UX Master Handoff
**Date:** 2026-10-25 (America/Regina)  
**Owner:** Branding & UX Specialist  
**Disposition:** P0 APP-WIDE DESIGN DIRECTION / ASSETS DELIVERED FOR ARCHITECT INTAKE. Not implemented, user-tested or production verified.  
**Corrective scope:** Product owner explicitly clarifies that the whole application—not just Today—must be redesigned. The previous `Bloom_Today_Experience_Redesign_Handoff_2026-10-25.md` is **subsumed** by this master direction; it remains a Today component reference, not the scope boundary.

## Non-negotiable goal
Deliver a distinctively Bloom, visually compelling, calm and functionally excellent product across ALL workspaces and user journeys. This is an experience redesign, **not a cosmetic padding pass**. Every surface should make its main action obvious, communicate data states visually and honestly, and show detail on request. Do not add generic ornamental cards or decorative medical claims.

## Architecture and navigation
Use three predictable consumer destinations: **Today (act)**, **My Biology (understand)**, **Progress (observe changes)**. Food is a contextual entry route with five methods and one canonical review/save; Athlete and Coach are distinct role-based workspaces using same system; settings, connections, research and deep scientific exploration are subordinate purpose-specific routes. Preserve genuine functionality and every regulatory/server-side restriction. Do not introduce secondary dashboards for each AI feature.

## App-wide visual system
Everyday green #246B50, Athlete blue #2563A6, Coach indigo #62558D. Restricted dev-only features use graphite in their **intended layout positions** with clear textual classifications, server-authorized only. Shared typography/body 16px, support 14px, spacing baseline 4/8/12/16/20/24/32px, card padding mobile 16px and desktop 20-24px, phone gutters 16-20px; semantic source/error/warning meanings independent of workspace hue. These are design baselines to validate in rendered app, not overrides to blindly paste.

## Required journeys & acceptance
- **New user / onboarding / goals:** baseline value without wearables, genomics or microbiome; short guided goal selection, constraints and conflicts; no wall of text.
- **Today:** one prominent action; compact Eat/Move/Recover and optional visible progress. No stacked equal-weight cards; source/uncertainty available.
- **Add Food / journal:** every fresh Add Food shows five methods; source clarity and graceful fallback; one editable draft, one save, compact confirmations; no mobile heading/action collisions or bottom-nav overlap.
- **My Biology / deep science:** concise Measurements/Bloodwork/Microbiome/Genetics overview; optional why/evidence/pathway exploration; no personal enzyme activity inferred from incomplete assay.
- **Progress:** dated trends and milestones first; canonical settings elsewhere; incomplete and incompatible measurement states visible.
- **Athlete:** next workout, intensity, recovery guidance and optional details; rest and missing-data states non-punitive.
- **Coach:** distinct indigo roster/calendar/athlete shared plan workflow; granular athlete permissions; **full Coach role screen detail needs Architect approval**.
- **Connections:** one hub with source status/sync dates/permissions, manual fallback and no duplicate setup.
- **Settings / accessibility:** canonical units, motivation Quiet/Balanced/Celebratory, motion preferences, notification permissions and privacy.
- **Research and internal development:** separated, purpose-specific controls; regulatory release gating enforced server-side; no inaccessible dead spaces when authorized development features hidden.

## Design deliverables included
14 editable mobile SVG **concept wireframes** (Today, Add Food, Food Review, Progress, My Biology, Goals, Connections, Settings, Athlete Home, Workout Review, Coach Home, Athlete Plan, Research, Explore Science), reference CSS tokens and a screen-by-screen acceptance inventory. Concepts communicate the unified design language and interaction architecture; **they do not represent a complete desktop/dark-mode production design system or fully designed screen interactions**. Continue using already delivered specialized photo, restaurant, Scientific Insights, Athlete, Digital Twin, research and VIS assets without creating duplicate implementations.

## New requirement IDs
**MKT-APP-2101 P0 — Whole-app transformation:** Apply unified elevated UX to all principal screens/workspaces, not merely Today. Acceptance: screen inventory and before/after rendered snapshots at named commit for all major paths; representative real tasks pass.
**MKT-APP-2102 P0 — Responsive quality:** Consistent gutters/insets, deliberate hierarchy; no collisions, clipped nav, scroll trap or overlapping buttons at 320,375,390,768,1024,1440px and 200% zoom; inspect iPhone Safari including on-screen keyboard and safe areas.
**MKT-APP-2103 P0 — Content reduction:** Short action + context, detailed why/evidence on request; no redundant instruction blocks or tiny 10px actionable copy; keep safety warnings and meaningful consent visible.
**MKT-APP-2104 P0 — Cohesive interactive patterns:** Canonical CTA, success/undo, loading, incomplete/estimated/source, draft recovery, accessible empty/error, source detail, keyboard and VoiceOver across all domains.
**MKT-APP-2105 P0 — Purposeful brand expression:** Expressive, not bland: hero hierarchy, subtle gradients/illustration where information value exists, distinctive consistent icons and carefully chosen microinteractions; no gratuitous rings, medical implication or clutter.
**MKT-APP-2106 P0 — Existing architecture continuity:** Five food methods/one save, three destinations, workspace identity, authorization, no duplicate unit preferences, no unapproved AI/biology assertions.
**MKT-APP-2107 P0 — Screenshot/design signoff:** Codex supplies exact SHA, route, viewports, mode and light/dark captures, including blank/partial/populated/error states; Design and User Testing accept before marking complete. Source-only CSS review not sufficient.
**MKT-APP-2108 P1 — Complete remaining responsive screen assets:** After Architect decides navigation and role contracts, finish high fidelity mobile/desktop, dark-mode and interactive prototypes for full Coach, research, onboarding and advanced Biology in a common system.

## Crosswalk and priority
Supersedes scope narrowness (not safety) of MKT-EXPD-2001–2007; continues MKT-POLISH-1301–1306, MKT-MOB-1401–1405, MKT-TODAY-1901–1907, MKT-FOOD-801–806, MKT-VIS-1501–1605, MKT-SIMPLE-1001–1006 and UT-COPY / UT-SIMPLE / UT-EXPERIENCE. Architect should merge overlapping items, prioritize current v0.5 correctness and app-wide P0 render defects, then implementation and gradual v0.6 extensions without duplicate component libraries.

## Current verification
Assets created; existing code may not match concepts. Not independently rendered, integrated, tested or deployed; no current SHA asserted by this handoff. Codex exclusively owns code, testing, GitHub and Render. Biology/Security/Legal maintain safety/consent gates. Chief Architect owns consolidation and signoff sequencing. Branding & UX requests screenshots and interactive review evidence before final acceptance.
