# Bloom — Mobile Screenshot-Based UX Defect Handoff
Date: 2026-10-24 (America/Regina)
Owner: Branding & UX Specialist
Status: Screenshot-confirmed visual design findings; code implementation and regression validation pending
Source: user-provided Safari/iPhone screenshot, Bloom Today / food journal, 2026-10-24. Related UT-COPY-1101–1107, UT-SIMPLE-901–910, MKT-LAYOUT-1301–1306. Supersedes any conflicting empty-journal content/layout guidance in earlier branding kits.

## Findings and priorities
- **MKT-MOB-1401 | P0 usability | Header action crowding.** Screenshot shows `YOUR FOOD JOURNAL`, `On the menu today`, and `+ Add meal` occupying competing horizontal positions in a narrow card. Responsive heading/action arrangement must use grid/flex wrapping with a minimum-width strategy or stack CTA below the title. No horizontal contact/overlap at 320/375/390 CSS px and 200% zoom. One dominant journal action, not competing CTAs.
- **MKT-MOB-1402 | P0 content density | Duplicate empty journal messages.** A full-width green note begins `No meals recorded today...` and a second tall journal card repeats `A fresh page for today...`; header `Add meal` and bottom `Start your journal` repeat the CTA. Consolidate into one journal empty-state card: title `Food journal`, message `No meals yet`, optional subline `Add food to see today's nutrition`, primary button `Add food`. Preserve important distinction that empty journal is not zero intake via accessible adjacent explanation or a short optional info affordance; don't imply zero in any computed value.
- **MKT-MOB-1403 | P0 potential occlusion | Bottom navigation clearance.** Screenshot shows the next card progressing under fixed bottom navigation; verify whether scroll can reveal the entire element. Reserve actual rendered nav height + `env(safe-area-inset-bottom)` in scroll content and ensure focus/scroll-into-view clears the bar. Fail if any essential card/button remains inaccessible at the bottom. Avoid mistaking normal scrolling behind a translucent sticky nav for permanent obstruction without runtime reproduction.
- **MKT-MOB-1404 | P1 visual rhythm | Cards lack differentiation.** Screenshot shows successive heavy saturated-green panels and visible borders with little tonal hierarchy. Reduce saturated surface use to targeted accent/primary action, use neutral/card surfaces for routine information, consistent 16px mobile gutters, 16–20px card inset and 12–20px inter-card gap. Keep Everyday green brand accent rather than entire viewport blocks. Check light/dark contrast.
- **MKT-MOB-1405 | P0/P1 accessibility | Copy and controls.** One focusable CTA for empty journal; no hidden duplicated accessible buttons; 44px hit targets; natural heading order; 320/375/390px and 200% text zoom; VoiceOver; label every action. Restrict production copy to one brief explanatory line except safety/consent.

## Screenshot vs verification
Observed from screenshot: visually crowded heading/action, duplicate copy and CTA, dense green background, next card partly behind bottom nav. *Not proved from static screenshot*: permanent occlusion or exact CSS collision dimensions, because scroll behavior and viewport scaling have not been tested. Developer must reproduce in iOS Safari/Render and attach before/after screenshots/videos and DOM measurements.

## Suggested existing-source change targets (to verify at HEAD, not an instruction to edit blindly)
`client/src/pages/Dashboard.tsx` includes empty-journal description and shortcut sections; `client/src/workspace.css` includes `.app-shell .bloom-panel`, `.workspace-shortcuts`, mobile bottom nav and media queries. Trace actual DOM and component boundaries before deduping. Reuse canonical five-way Add Food route and save. Avoid creating a duplicate logging interface.

## Acceptance demonstrations
1. iPhone Safari 375px and 390px, plus 320px narrow: heading does not collide with action, any CTA fully visible.
2. Empty Today has exactly one primary Add Food invitation; supporting information can be recovered but does not repeat in giant cards.
3. At page end and after focused keyboard/VoiceOver navigation, no content is trapped under bottom nav or browser safe area.
4. Text enlargement to 200% causes predictable stacking, no clipped controls or horizontal viewport scrolling.
5. With one saved meal, journal transitions to populated summary without redundant onboarding copy.
6. Restricted graphite development features ON/OFF reflow without dead space, independently of this fix.
7. Screenshot compare Everyday light/dark and Athlete workspace, record commit SHA and test results.

## Responsibility
Chief Architect intake/priority coordination; Codex sole repository modifications/CI/Render deployment. User Testing validates task-comprehension/time, Design verifies screenshot, Security/Legal ensures no critical necessary warnings/consent suppressed. No code changes, live deployment tests or clinical assertions completed by this specialist.
