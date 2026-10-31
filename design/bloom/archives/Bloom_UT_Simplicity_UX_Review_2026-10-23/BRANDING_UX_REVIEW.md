# Bloom — Branding & UX Review: User Testing Roadmap Simplicity Audit
Date: 2026-10-23 (America/Regina)
Owner: Branding & UX Specialist
Reviewed source: Bloom_User_Testing_Roadmap_Simplicity_Audit_2026-10-23.md; UT-SIMPLE-901–910.
Repository context: knagle-max/BloomGutHealth PR #1 enhance/bloom-experience, head d2d2bbcd655dc86f91f024ba404cce27d8ce1fd3. Branch head verified; no live app or participant testing conducted.
Disposition: APPROVE WITH CONDITIONS FOR CHIEF ARCHITECT CONSOLIDATION. Deliverable: editable standalone SVG UX patterns and review, not product deployment. Codex owns implementation, testing and GitHub.

## Review decisions / asset gap assessment
| Source | Decision | Design asset action |
|---|---|---|
| UT-SIMPLE-901 P0 Today task-first | APPROVE | Reuse v0.6 unified day-plan wireframes and existing TodayFocus; no duplicate Today kit |
| UT-SIMPLE-902 P0 concise My Biology index | APPROVE | **NEW** mobile SVG and reusable screen contract |
| UT-SIMPLE-903 P0 Progress first | APPROVE | Reuse v0.5 Scientific Insights chart/table kit; remove duplicate unit controls; no new chart kit |
| UT-SIMPLE-904 P0 short goals wizard | APPROVE | Reuse UX-OPT-01 flow; v0.6 interaction prototype remains future deliverable |
| UT-SIMPLE-905 P1/P0 Athlete progressive layers | APPROVE | Reuse three-state guidance and post-workout kits; keep safety cues outside accordions |
| UT-SIMPLE-906 P0 unified nutrition | APPROVE | Reuse Five Ways, Photo and Restaurant kits; same draft/editor |
| UT-SIMPLE-907 P0 recommendation disclosure | APPROVE | **NEW** compact evidence-disclosure ladder SVG; use Scientific Insights content semantics |
| UT-SIMPLE-908 P1/P0 sources | APPROVE | **NEW** Connections summary SVG and status/permission pattern |
| UT-SIMPLE-909 P0 Research/Coach | APPROVE with Legal/Security conditions | Existing research consent concept is insufficient for production; full reviewable flows remain outstanding |
| UT-SIMPLE-910 P1/P0 clutter budget | APPROVE | **NEW** screen-inventory checklist in this handoff; no ornamental asset |

## Incremental design requirements
**MKT-SIMPLE-1001 (P0): One primary action per first viewport.** Today shows one next action and at most compact Eat/Move/Recover summaries; all detail on demand. Acceptance: critical warnings and provenance limitations never hidden; user can find act/skip/edit quickly on 320px; no duplicate task panels. Maps UT-SIMPLE-901, UX-OPT-02.
**MKT-SIMPLE-1002 (P0): Four-domain My Biology index.** Measurements, Bloodwork, Microbiome, Genetics each show last valid observation date, origin, completeness and an explicit View/Add. No biology mechanism graph or settings duplication in default view. Acceptance: user can identify incomplete/unknown unit and navigate to canonical verifier; no 'healthy' implication from missing data. Maps UT-SIMPLE-902/903, UT-RED-201/207.
**MKT-SIMPLE-1003 (P0): Explanation ladder.** Action/relevance visible; inputs/status/limitations one expansion; full mechanism/source optional deeper link. Critical risk, safety or contraindication visible initially. Acceptance: measured vs reported vs inferred vs simulated identified correctly in user study; all quantitative information sourced. Maps UT-SIMPLE-907, Scientific Insights kit.
**MKT-SIMPLE-1004 (P1, P0 for consent): One Connections center.** Show provider, link state, last successful sync and access to imported records/permissions/revocation. Manual entry remains operable. Acceptance: connection lost/revoked/duplicate/offline differentiable; no misleading auto-sync; no repeated request on each measurement page. Maps UT-SIMPLE-908, Integrations.
**MKT-SIMPLE-1005 (P0 privacy): Separate Research and Coach entry.** Research enrolment opt-in, consent-purpose details and limitations explicit; Coach data only with athlete grants. No initial setup coercion, no implied data access. Acceptance: privacy-conscious user declines all while still using core features; critical revocation caveats remain visible. Maps UT-SIMPLE-909, UT-RNET-701–710, BIO-COACH.
**MKT-SIMPLE-1006 (P1, P0 correctness): Screen clutter budget.** Each surface must document first visible task, canonical settings owner, status, expansion, critical caveats, recovery and error. Accessibility 320px/200%/keyboard/VoiceOver. Acceptance: cross-app review identifies and removes duplicate controls and unintended double-save paths; independently time real tasks. Maps UT-SIMPLE-910/UT-RED-208.

## Screen inventory rubric for Codex and QA
Per route capture: screen ID, workspace, main user question, PRIMARY action, secondary actions, first-viewport information, collapse/disclosure content, critical noncollapsible warnings, one canonical editor/settings source, input provenance, missing/error/offline states, permissions, back/cancel/draft persistence, alternate pathway and duplicate-save regression cases. Record screen snapshots at mobile 320/375px and desktop, light/dark. Do not equate source check with app test.

## Copy examples
My Biology: “Bloodwork · Last result May 12 · Units need review” (synthetic example); no fake clinical status.
Connected source: “Needs attention · Last synced 2 days ago. Your existing records remain visible; you can add measurements manually.”
Evidence: “Why this may help you” / “Information used” / “Read research details”. State “General evidence; not measured in you” when applicable.
Uncertain: “We don’t have enough information to interpret this result yet.” No default healthy-state badge.
Consent: “Research is optional. Choosing not to participate will not affect your everyday tracking.”
No-data: “No genetics report connected. Your general guidance remains available.”

## Validation scenarios
Novice with no labs; imported lab with unresolved original unit; sparse historical progress; user with conflicting goals; Athlete with no device; Coach viewing only approved training summary; revoked provider; optional research declined; user switches food entry routes mid-draft; screen reader user at 320px. Test first-task discovery, errors, source comprehension, duplicate controls and completed canonical saves. The User Testing targets >=90% task completion and >=80% source comprehension are proposed study criteria, NOT achieved results.

## Dependencies, conflicts, effort
Reuse v0.5 Evidence Insight Card/ObservationTrend and Five-Ways/Food kits; preserve working TodayFocus. No new divergent component library. Science owns clinical prioritization, ML evidence status, Security/Legal permissions, Integrations sync, Architect reconciliation, Codex app code and actual tests.
Design effort low/medium for index and connections summary, medium for information hierarchy and disclosure responsive QA, high for fully governed research consent. All images are synthetic visual structure, not working screens.
Outstanding architecture decisions: single canonical unit preference owner; rules for selecting Today next action; eligibility and content of critical warnings; what provider capabilities may be displayed; when Research and Coach routes become available. Do not suggest implementation verified.

## Sign-off
**Branding & UX:** APPROVE user-testing recommendations for Architect intake, with explicit P0 constraints and new editable pattern concepts.
**Not verified:** final UX integration, participant study, clinical safety, consent language, device connection functionality, app release.
