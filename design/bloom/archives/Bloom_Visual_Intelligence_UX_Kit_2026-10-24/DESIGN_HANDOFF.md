# Bloom — Branding & UX Review: Visual Intelligence & Motivation
**Date:** 2026-10-24 (America/Regina)  
**Owner:** Branding & UX Specialist  
**Source:** `Bloom_User_Testing_Visual_Intelligence_Motivation_Review_2026-10-24.md`, UT-VIS-1201–1208.  
**Decision:** APPROVE WITH CONDITIONS FOR CHIEF ARCHITECT CONSOLIDATION. P1 v0.6 workstream; P0 correctness/accessibility constraints. Not deployed or user-tested. Codex exclusively implements, tests and commits.

## Design position
Visual signals must **replace** explanatory copy, not decorate it. At most one motivational status on Today and a small number of relevant activity/nutrition indicators, with detail on click/tap. Reuse existing Today, Progress and Athlete surfaces and brand tokens; Everyday green, Athlete blue, Coach indigo. The supplied SVG and HTML are editable design demonstrations using synthetic data, not actual connected measurements or complete code integration.

## Source review / disposition
| Source ID | Priority | Branding decision / deliverable |
|---|---|---|
| UT-VIS-1201 | P0 trust/P1 | Approve. Every indicator has inspectable source/date/goal/caveats and an editable data path. Interactive HTML prototype included. |
| UT-VIS-1202 | P1 | Approve. Four activity states: recorded, partial sync, no record, planned rest. Never equate no record with inactivity. |
| UT-VIS-1203 | P0/P1 | Approve. Show logged amount vs target and incompleteness conspicuously; progress graphic cannot imply complete nutrition coverage. |
| UT-VIS-1204 | P1 | Conditional: encouraging message only if safe/eligible, relevant, accurate and dismissible. No pressure with pain, injury, underfueling or rest. |
| UT-VIS-1205 | P1 | Approve. Specific dated accomplishment, source inspectable, no punishing streak. |
| UT-VIS-1206 | P0/P1 | Approve. SVGs, CSS state tokens, compact static animation-alternative mockup, Everyday/Athlete variants and HTML interactions provided. Actual screen-reader/device testing pending. |
| UT-VIS-1207 | P1/P0 factual | Approve test design. Targets are proposed, not achieved; evaluate reduction of copy and genuine comprehension/engagement. |
| UT-VIS-1208 | P1 | Approve. Reuse existing Today/Progress/Athlete; no dashboard/generic score. Details replace paragraphs; no duplicate summaries. |

## Incremental design requirements
**MKT-VIS-1501 · P0** — Indicator has status **and** data drill-down. All default-visible visuals have an accessible name, semantic meaning, source/date/status and correction route. Detail includes actual basis, missingness and limitations. Test with stale/edited/revoked observations. Maps UT-VIS-1201/1206.

**MKT-VIS-1502 · P0 accuracy / P1 UI** — Distinguish **Recorded / Sync incomplete / No record / Planned rest** using words and shape/icon, never green/red alone. No unlogged-day failure. Activity review reveals actual dated source. Maps UT-VIS-1202.

**MKT-VIS-1503 · P0 accuracy** — Nutrition graphic must expose denominator, coverage and estimate status; when data are incomplete say `Logged so far` / `Some foods have unknown amounts`. Never imply nutrient target achieved from incomplete evidence; do not turn missing into zero. Maps UT-VIS-1203, UT-COPY-1101–1107.

**MKT-VIS-1504 · P1 with P0 safety checks** — 'Almost there' and milestones are optional, dismissible, never punitive; if sources/eligibility unclear show neither. Clinically material safety warnings outside optional details. Maps UT-VIS-1204/1205.

**MKT-VIS-1505 · P0 accessibility / P1 style** — Common indicator visual vocabulary, no looping animation or essential information in animation, 44px intended tap targets, dark/light mode, reduced-motion, semantic labels; compact ring and activity state have stable DOM focus when expanded. Maps UT-VIS-1206.

**MKT-VIS-1506 · P1** — Every new visual displaces specific previous copy. Today one prominent status and compact summary; Progress full dated history; Athlete relevant session state. At 320px no overlapping headers, clipped rings or bottom-nav obstruction. Maps UT-VIS-1208, MKT-MOB-1401–1405.

## UI copy and information hierarchy
Activity: `Activity recorded` / `Sync incomplete` / `No activity recorded` / `Rest day planned`.
Nutrition: `Protein logged` / `Logged so far` / `Some entries are incomplete` / `Review foods`.
Encouragement: `10 g to your protein target` only for fully qualified, approved goal and sufficient data; otherwise omit. Avoid `You failed`, `No exercise today`, `You're unhealthy`.
Milestone: `Logged meals on 3 days this week` (only with exact dates/recorded data). No invented improvements in gut function, physiology or lifespan.

## Technical UX contract for Architect / Codex
Visual state must be **derived** from canonical journal/exercise records and approved goal definitions. React components should accept status enum, source references, timezone window, completeness and eligibility fields from a server-authorized domain model. No manual fake percentage as fallback. Reuse current journal arithmetic and corrections, not separate client nutrient totals. Source-changing, permission-revocation and sync-lag must invalidate visible state. Do not load unsafe motivation triggers by default. `details` or accessible expandable information should preserve focus and remain inspectable with keyboard/VoiceOver.

## Asset manifest
- `visual_statuses.svg`: editable matrix of activity-day states and compact nutrition example.
- `visual_states_athlete.svg`: Athlete blue variant, rest-respecting status.
- `visual-motivation.css`: scoped visual state + layout tokens, prefers-reduced-motion static safety.
- `interactive_prototype.html`: standalone no-network prototype with buttons to switch activity state, toggle coverage and reveal basis. **Synthetic sample values only.** Not a production component.
- This handoff.

## Acceptance tests requested
1. Four activity states are distinguishable with no color and announced to screen readers.
2. No record and delayed device sync never mean zero activity; planned rest never a failure.
3. Missing oil or estimate updates nutrition coverage and prevents falsely complete progress.
4. Editing/saving same meal does not double count; visible numbers match canonical journal.
5. At 320/375/390px, 200% zoom, light/dark, reduced motion, VoiceOver and keyboard, neither card nor drilldown overlaps other controls.
6. Unsafe/pain/underfueling/rest and missing-goal cases show no pressure-oriented nudge.
7. Expanded basis includes source and last observation date, with correction route.
8. Time-to-action and comprehension measured against concise text-first baseline; no claim retention uplift absent longitudinal research.

## Boundary
Research claims, progress denominators, and unsafe-nudge eligibility need Biology/ML sign-off; consent, telemetry and patient privacy need Security/Legal; source sync and deduplication need Integrations. Architect reconciles and sequences v0.6. Codex handles code/testing/deployment. This design does **not** certify data accuracy, clinical appropriateness, app availability, WCAG compliance or observed retention benefit.
