# Bloom — Usability acceptance test tasks (to run on actual build)
Date: 2026-10-31 | TESTS NOT EXECUTED. Attach exact deployment commit, iOS/Android version, screen recording and observed steps.

| ID | Task | Acceptance |
|---|---|---|
| UX-WF-01 | From Athlete home start saved routine | <=2 user taps target, no missing routine |
| UX-WF-02 | Complete set 1 bench press | 1 explicit check, auto-rest optional, undo available |
| UX-WF-03 | Set 2 bench 60 kg ×8 → 65 kg ×10 | Direct load/reps, no loss of set 1 or set 3 |
| UX-WF-04 | Advance to row after bench | Next exercise visible/direct, no modal detour |
| UX-WF-05 | Replace machine row with dumbbell row for limited equipment | <=3 interactions after Replace, compatible exercise label, original data preserved |
| UX-WF-06 | Finish workout with incomplete set | Review clear, save response verified, incomplete status preserved |
| UX-WF-07 | Athlete → Everyday → edit set 3 then Athlete | Exact canonical set IDs/weights/reps/completion retained |
| UX-WF-08 | 'Rowed 500m, did 50 push ups and 100 sit ups' | Three editable components, no invented sets/pace/calories |
| UX-WF-09 | Today after no sleep or wearable record | One useful factual message, no fabricated readiness |
| UX-WF-10 | LDL history source correction | Exact date/unit and prior revision visible; trend recalculated as applicable |
| UX-WF-11 | Nutrition partial meal | Known totals accessible; unknown micronutrient not shown as zero |
| UX-WF-12 | Workout loading/error/offline; retry save | No double-save, no loss of edit; accurate feedback |
| UX-WF-13 | 320px, 200% zoom, screen reader, keyboard | All edits/labels and focus reachable |
| UX-WF-14 | Planned workout and imported watch workout overlap | Explicit reconciliation, no silent duplicate volume/energy |
| UX-WF-15 | Change kg↔lb display and edit | Canonical kg unchanged until explicit user save, no double conversion |

Report fields: observed before, observed after, tap count excluding typing and scrolling, time-to-task, source and deployed SHA, focus/accessibility result, defects, feature parity, pass/fail. Tested through real browser/app, not mock SVGs.
