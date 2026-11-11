# Bloom — Recurring Activities & One-Tap Quick Logging
## Independent User Testing / Product Research Handoff

**ID:** UT-RECUR-5501–5516 · **Date:** 2026-11-09 · **To:** Chief Architect & Integration Lead; cc Structural UX, Branding, Graphic Designer, Integrations, Biology/ML, Developer/Codex.  
**Disposition:** APPROVE FOR v0.6 PRODUCT IMPLEMENTATION, subject to Architect deduplication. Do not pause the v0.5 owner review or demand another speculative design phase. This is a product specification and source audit, **not implemented or usability-tested**.

**Source anchor:** `knagle-max/BloomGutHealth`, PR #1, `enhance/bloom-experience` HEAD `0e41e457c1c920202b23b330e02bf2bec95073ac` at inspection. Check fresh HEAD before coding.  
**Existing code inspected:** `client/src/pages/ActivityLog.tsx`, `client/src/components/ActivityReview.tsx`, `client/src/pages/AthleteWorkspace.tsx`, `client/src/pages/Progress.tsx`, `client/src/components/ActivityWeekSummary.tsx`, `shared/activity-capture.ts`, `shared/experience.ts`.

## 1. Owner problem and product principle

Owner walks on an under-desk walking pad **every workday**, typically **10,000–15,000 steps**. They should be able to set a repeating routine, tap it on a given day, enter the **actual** steps (and optionally minutes/distance), and record it without rebuilding the activity every time. The design must generalize to strength A/B sessions, runs, cycling, swimming, yoga, classes, gardening, rehabilitation and compound training with sets/reps/load. Mobile and desktop are equal product surfaces.

**Simulated novice reaction:** “I already told Bloom this is what I do every weekday. Why must I choose the activity and set it up again?” **3-second outcome:** one prominent due routine with a visible **Log today's activity** action. **Expert outcome:** source history, original units, sets and actual timestamps remain inspectable.

This is neither an auto-generated step counter nor a new health/readiness score. A **schedule is a plan**; a **saved occurrence is an actual record only after explicit confirmation**. A skipped or unknown day is not zero activity.

## 2. Current source findings

- `ActivityLog.tsx` has `Describe`, `Select activity`, `Repeat previous`; repeat is drawn from up to five existing records, not a saved recurring plan. Repeated sets are cloned with new IDs and reset completion, which should be reused rather than regressed.
- `ActivityReview.tsx` supports activity types and independently edited duration, distance, strength sets, and component descriptions; it has no dedicated step-count field.
- `shared/experience.ts` `activitySchema` and `activityComponentSchema` support time, effort, distance, sets, component arrays, manual source, timestamps and zone, **no `steps` count, recurring-template ID or occurrence ID**. `trainingSessionSchema` supports `planned/completed/cancelled` and independent sets, but is not recurrence scheduling.
- `Progress.tsx`/`ActivityWeekSummary.tsx` aggregate **saved recorded activities** and distinguish unrecorded days from zero; preserve that invariant.
- These are current source facts. No live authenticated browser or physical device review performed. No assertion that any R4 automation already exists.

## 3. Recommended user journey — mobile

**Initial setup (once):** Activity → **Save as routine** (also available from any previously reviewed activity); choose friendly name **Workday walking pad**, activity **Indoor walking**, repeat **Mon/Tue/Wed/Thu/Fri**, optional preferred time or “Anytime,” optional effective date/end, default **target range 10,000–15,000 steps**; optional baseline duration, distance and intensity; choose **step source: walking pad / manually entered** versus watch total. Save without recording a workout.

**Weekday Today/Activity:** an editorial, compact **Today's movement** row: `Workday walking pad · weekdays · Target 10–15k steps` and **Log today**. A “Change plan” secondary control and **Skip today** are available without guilt copy. Opening Log today fills today's date and template inputs, shows editable `Steps completed [12,400]` (not silently defaulted to completed), optional `Minutes`, `Distance`, `Effort`, notes; primary **Save activity**. With no actual count, user may choose **Completed — count unknown**, if activity completion itself is explicitly confirmed, and numeric steps remain null; otherwise choose skip or leave unrecorded. Show receipt after save, with **Edit** and **Undo/remove** via existing approved history pathways. Do not invent step calories, speed or distance.

**Single-tap after first setup:** The fastest path can be `Log today → confirm prefilled duration/sets/actual values → Save`; **never count template targets as actual**. If a paired verified device supplies an actual count for the selected date and source, allow a clearly labelled **Use device reading** option, inspect time interval/source, and let user correct it; no automatic duplicate step addition.

**Other routines:** Strength A/B (e.g. Tue/Fri), Peloton bike (Sat), swim class (Wed), recurring run. Template clones exercises, loads and sets as *planned/reference*; users mark only performed sets/rep counts/load, including partial workouts. No automatic completion of the whole workout from the template. Multiple sessions on one day permitted when genuinely distinct.

## 4. Desktop layout

A spacious schedule panel or 7-day strip shows **Today / Upcoming / Completed / Skipped / Unrecorded** with routines; the selected day's right-side quick editor displays the relevant actual fields and, for strength, independent exercise rows and sets. Clicking a due routine immediately focuses actual-entry control. Do not fill the screen with nested generic cards or administrative calendar controls. Both surfaces use the **same recurrence, source, occurrence, editor, save and correction contracts**.

## 5. Data and recurrence contract for Architect / Developer

**Extend existing canonical model; do not create a parallel exercise journal.** Suggested names only; map to current tables/IDs:

- `RecurringActivityTemplate`: owner, immutable template ID, version/revision, title, activity type, component templates with per-set planned IDs/reference units, display metadata, suggested target ranges (steps/minutes/distance/reps/load as appropriate), recurrence (`weekdays` with selected weekday set, local time zone, effective start/end), optional preferred time, paused/active, created/updated, source+consent; never a saved completed workout.
- `Occurrence`: stable deterministic `(ownerId, templateId, localDate, occurrenceKey)` for scheduled instance and status `due|completed|skipped|unrecorded|rescheduled|cancelled` **without marking future events done**. Link completed instance to one or more explicit activity records where supported. Handle reschedule, timezone/DST, weekends/holidays manually; weekdays are based on selected local date, not UTC day boundary. Avoid creating thousands of future occurrence rows up front; materialize a bounded visible horizon.
- `ActualActivityObservation`: record source-linked actual metric values with `steps` as **nonnegative integer or null** and `stepScope='walking_pad_session'|'whole_day_device'|'other_defined_interval'`, exact interval, original units, source device/manual, optional duration/distance, actual/estimated flag and original record identity. Reconcile to current Activity schema or introduce a typed optional metric extension with explicit migration and legacy compatibility. Distinguish **target min/max** from actual; zero only when explicitly observed/confirmed. Do **not infer steps from km or minutes**.
- **Separate plan from actual:** start/stop/skip/pause/absence states; reschedule affects only explicitly chosen instances, not historic logs. Editing template defaults must never mutate prior recorded workouts. Saving a day uses authenticated, source-revision-checked, idempotent create/update; one exact occurrence completion under retry. Additional workouts are allowed but explicitly separate, never accidental duplicate saves.
- **Sources and integration:** manual pad count is not automatically a full-day watch total; tag interval/device and aggregation policy. If wearable steps overlap pad steps, do not sum blindly; choose explicit scope, precedence and provenance with user review. Device integration only where actually available/authorized (PWA does not magically read Apple Health). Do not double count mirrored devices.
- **Consistency:** canonical activity records appear in Activity history, Progress, Athlete where appropriate, Today summaries, exports and deletion; no separate total shadow state. Maintain saved original unit/source revision and immutable correction semantics.
- **Privacy:** recurrence preference is account-scoped; no public/shared employer schedule by default; device permission and removal separately controlled; no precision-location requirement.

## 6. Requirements and priority

| ID | Requirement | Priority / disposition |
|---|---|---|
| UT-RECUR-5501 | Save any reviewed activity as named reusable routine/template, with no history rewrite | P0 v0.6 |
| UT-RECUR-5502 | Weekday/selected-day recurrence with timezone, pause, effective dates and manual skip/reschedule | P0 |
| UT-RECUR-5503 | Due Today/Activity quick action, mobile and desktop, no forced questionnaire | P0 |
| UT-RECUR-5504 | Actual steps as typed nullable observation, separate from a 10–15k target range and device totals | P0 |
| UT-RECUR-5505 | Other activity metrics: duration, distance, pace/power where sourced, exertion, notes | P0/P1 |
| UT-RECUR-5506 | Strength templates clone *planned* sets/reps/load and preserve partial completed sets | P0 |
| UT-RECUR-5507 | Editing one occurrence vs all future occurrences clear; historical saves immutable | P0 |
| UT-RECUR-5508 | Idempotent save, duplicate occurrence prevention, retry after lost response and conflict handling | P0 |
| UT-RECUR-5509 | Actual device and manual activity/source reconciliation; no blind watch+pad addition | P0 |
| UT-RECUR-5510 | Missed/paused/unrecorded ≠ zero or failed adherence; no punitive streaks | P0 |
| UT-RECUR-5511 | One canonical journal/Progress/Today/Athlete synchronization with historical dates and units | P0 |
| UT-RECUR-5512 | 320/390/768/1440 mobile/tablet/desktop, touch target ≥44px, keyboard/VoiceOver, 200% zoom, both themes/modes | P0 |
| UT-RECUR-5513 | Premium editorial quick-action presentation; no Bland/SaaS admin calendar; genuine mobile first viewport | P1 visual |
| UT-RECUR-5514 | User-editable reminder preference optionally; no unsolicited notifications | P2 |
| UT-RECUR-5515 | Last-used defaults and “repeat previous” shortcuts continue to work offline/error as appropriate; no erased drafts | P0 |
| UT-RECUR-5516 | Respect existing v0.5 owner RC review; no v0.5 scope restart and no duplicate coach scheduling architecture | Governance |

## 7. Scenario and acceptance matrix

1. Create workday pad schedule Mon–Fri 10k–15k; Monday due only; weekends not due.
2. On Tuesday enter **12,400 actual pad steps**; saved receipt displays actual; 10k/15k remain target only.
3. On Wednesday tap “Log today” and leave steps unknown; no auto-saved 12,500 or previous actual; explicit completion confirmation required.
4. Thursday is unrecorded; Friday UI must not infer zero or “failed workout.”
5. Skip holiday Monday without guilt; following Tuesday normal; pausing schedule does not erase past workouts.
6. Move a scheduled workout to the next day, then edit just that occurrence; other weeks unchanged.
7. Update future template target from 10–15k to 8–12k; historic activity and actuals untouched.
8. Create strength A with 3 exercises/3 sets each; complete two sets of one exercise, leave other sets planned; count only performed.
9. Repeat a saved multi-component activity and verify fresh stable per-set IDs, original-source retention and completed flags reset.
10. Manually enter pad 12,400 and import whole-day Watch 14,100; totals do not become 26,500; scope/source visible.
11. Duplicate/retry/lost-save response creates one occurrence and one actual activity record, with explicit receipt and conflict recovery.
12. Switch account mid-edit; no cross-user routine/step exposure; draft cannot save to wrong owner.
13. At 320/390 mobile, log and correct one due routine using one thumb, no overlays/interfering bottom nav; focus returns after save.
14. At 768/1440 desktop, keyboard tab sequence follows date→actual metrics→review/save; edit template vs edit occurrence is unmistakable.
15. DST change / timezone travel / local date change produces a single due instance on intended local day, not duplicated or automatically completed.
16. Export and delete routine: exported actuals remain source-labeled; deleting a template does not silently delete past actual activities; account erasure removes both under current policy.
17. Device disconnected / offline / manual fallback still permits honest logging; no phantom synced count.
18. User can choose strength, bike, run, swim, yoga and compound/mixed workouts, not just steps, and their appropriate actual fields appear.

**Independently timed usability targets (proposed, not measured):** setup under 60–90 seconds for a basic weekly pattern; subsequent completion under 15 seconds when actual one-number metric is known; no more than 2–3 actions after selecting the due activity, excluding meaningful quantity editing; ≥90% uncoached successful log and ≥80% comprehension that schedule target ≠ actual. Measure on real phone and desktop before marking accepted. These are test objectives, not claims.

## 8. Product wording examples (Branding to finalize)

- `Workday walking pad` · `Usually Mon–Fri` · `Aim 10,000–15,000 steps`  
- `Log today` → `Steps completed` (empty until confirmed) · `Save activity`  
- `Not today` / `Move to another day` / `Change schedule`  
- On success: `Recorded 12,400 walking-pad steps for Tuesday`  
- Unknown: `Activity completed; steps not recorded` (only after explicit attestation)  
- Conflict: `This day's entry changed elsewhere. Review the latest record before saving.`

Never label “Target reached” if the user didn't record a count; never say “You missed your walk” from an unrecorded day. No synthetic numbers or estimates presented as observed.

## 9. Agent responsibilities and delivery plan

**Chief Architect:** deduplicate against `shared/experience.ts`, scheduling/Coach/ML roadmaps, authorize smallest additive schema and UI scope; maintain source/provenance and phase ownership, not a new platform.  
**Structural UX:** design due-action → edit actual → save, recurrence edit one/all, reschedule/skip/pause, empty/offline and mobile/desktop semantics.  
**Branding/Graphic Designer:** make a tactile, inviting activity strip and focused quick editor; Everyday warm botanical vs Athlete precise navy/blue, no nested flat admin cards. Review real screenshots at all widths with exact-fixture records.  
**Biology/ML:** ensure step metrics and exertion/energy claims remain appropriately bounded; routines are not personal metabolic inference.  
**Integrations:** source IDs, interval overlap, device sync and manual fallback; HealthKit/Health Connect gated by real native access.  
**Security/Legal:** account and consent isolation, export/deletion/retention.  
**Developer/Codex:** after Architect reconciliation, reuse ActivityLog/ActivityReview/sets and canonical activity storage, implement recurrence/steps with tests; provide commit/CI/Render evidence and actual 320/390/768/1440 screenshots.  
**Independent User Testing:** evaluate 3-second novice, full expert drill-down, Bland/SaaS Alert, fast completion, actual understanding of targets vs saved values, and cross-mode mobile/desktop acceptance. Current status **NOT TESTED; no app code changed**.

**Immediate execution sequence (no artificial hold):** Architect crosswalk → UX + Designer/Branding parallel layouts/copy → Developer ships functional quick-log slice (walk+steps) and generic template recurrence → extend strength/compound templates → source-device reconciliation when available → independent rendered/task review and targeted corrections. No blanket delay of unrelated v0.5 acceptance.