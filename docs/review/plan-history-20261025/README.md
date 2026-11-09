# Historical weekly plan review

Baseline: 677cd548423cc41b26e96f15c82ea1485010ad64, loaded from its exact WeeklyPlanner source with the same Vite app, synthetic saved snapshot, light theme, 390×1000 viewport and saved-plan panel scroll anchor. Candidate uses the changed component. No real account, health record or independent participant acceptance is represented.

- [Before, original](before.png): old stored success flag appears as current checked-plan text; Save enabled.
- [After, original](after.png): historical date/qualification and explicit current-input rebuild; original estimates remain inspectable.
- [After, two callouts](after-annotated.png): **1** separates recorded estimates from current safety; **2** Save remains disabled until a fresh current-input planning operation. Callouts rendered as browser overlays after retaining the unmarked screenshot.

Regression: a synthetic saved feasible plan survives a later renal-condition update unchanged; its historical response/export is qualified, and rebuilding against current context is blocked. Keyboard rebuild sends exactly the stored canonical request; no guessed targets, automatic regeneration, history mutation or account-data transfer. Historical meal logging still means the user explicitly records what was eaten, rather than endorsing the plan. Print retains the historical notice. All saved plans stay inspectable, including records with the same version string; none receives current clearance from that string or old check flags.

Browser journey: scripts/qa/plan-history-journey.mjs; 320/390/1280 widths, dark mode, keyboard, 200% text and preserved snapshot reopening. Real 200% overflow on the planner's unwrappable buttons was fixed with scoped wrapping. Does not establish physical-device, screen-reader or independent scientific release acceptance. No gallery for the separate invisible metering change.
