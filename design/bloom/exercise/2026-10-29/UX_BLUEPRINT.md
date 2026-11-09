# Bloom Exercise Intelligence — authoritative UX blueprint
Version 1.0 | 2026-10-29 | Branding & UX | Proposed for Chief Architect consolidation

## Authority and visual language
These SVGs and this contract govern the proposed visual and interaction treatment. Illustrator values are fictional. Preserve Bloom established brand v1: Everyday #246B50, Athlete #2563A6, Coach #62558D; no brand replatform. Layouts are **design references**, not working application screens. Developer may use existing shared components but may not silently substitute screen hierarchy, controls, or labels. Technical/clinical conflicts go to Architect and Branding review before visual deviation.

## 1 — Everyday Today
Top: a compact recorded-activity summary with date, duration and optional actual distance. One primary action Add activity; progress secondary. Energy is absent if not calculated: NEVER 0 for missing. Source measured/estimated/reported visible beside displayed energy. No muscle chart, RPE graph or calorie budget. If no entries, show Not recorded and Add activity, not an activity deficit. Don't route to Athlete onboarding.

## 2 — Add Activity
Single prominent Add Activity from Everyday/Athlete Today; opens a choice of Describe, Select activity and Repeat previous. Voice only if supported and explicit consent. Selecting Describe opens text entry with context-preserving Back; Enter/Continue attempts reviewed parser; no AI or offline leads to Select activity, preserving draft. Capture methods converge to ONE review (not separate persistence stores). System cannot make up missing duration or intensity; clarify only essential unknowns.

## 3 — Review before save
Hero: human-readable recognized activity + source description. Show type, duration, date/time and only actually present distance/steps/pace; surface whether each is Reported, Suggested, Measured or Estimated. Every suggested identity has Change affordance. Show only applicable athlete details; retain raw description under Details. Display only valid energy values with Estimated/Device reported and method expansion; absent mass/MET => Calories not estimated; never replace unknown with 0. Save creates exactly one canonical record with idempotent retry; after confirmation show updated Today/Progress. If uncertain save acknowledgment, present Retry safely without duplicate.

## 4 — Athlete detail (same record)
Sport-specific exercises, sets/reps/load, external effort, internal session RPE where reported, sport pace/distance, approved primary/secondary muscle assignments. Display curated anatomical association as descriptive only, never inferred tissue damage/recovery prediction. No 'training readiness' score based on single event. All edits update Everyday projection without loss of detailed data. Distinguish planned session vs actually performed; planned activities do NOT count as calories burned.

## 5 — Progress
Recorded days / weekly minutes / activity types / dates first; trends on sourced values only. Chart points are actual observations; missing days are gaps, not zero activity. Show source and last sync. Drill into original entry for corrections; avoid streak punishments, universal strain zones and unjustified smooth interpolated physiologic curves.

## 6 — Motion and tactile feel
Entry reveal 180–240ms, cards 160–220ms, save response <250ms when acknowledgment received; use transform/opacity, no layout jank. Reduced motion removes nonessential animation; no haptics required for core completion. Motion never disguises incomplete or rejected saves. Motion values are candidate tokens to validate in device review, not a claim of implemented behavior.

## 7 — State matrix
- Empty: Not recorded / Add activity.
- Partial parse: Review suggested fields, highlight missing essential field only.
- Ambiguous: Check activity; allow generic fallback.
- Offline: Manual entry available, save only with trustworthy local persistence or show explicit unsaved draft.
- Permission denied: No forced voice/wearable.
- Energy unknown: Calories not estimated.
- Unreconciled duplicate: Review overlapping records; never sum conflicting estimates.
- Planned / cancelled: distinct from performed.
- Deletion/edit: reflect across modes, History and Today without duplicate.
- Unsafe illness/pain: no automated push or promise.

## 8 — Accessibility
320/375/390px, 200% zoom, dynamic text, VoiceOver, keyboard, light/dark, reduced motion, 44px targets, semantic headings, measured/estimated communicated in text not colour alone. Icons must have meaningful labels. Long descriptions wrap naturally.

## 9 — Design acceptance
Developer submits exact commit SHA, screenshots/videos of Everyday Today, Add Activity menu, described-review, Athlete extended detail, History and each empty/ambiguous/offline/duplicate state at 320, 390 and desktop, light/dark, screen reader evidence. Branding audits pixel/behavior parity; User Testing observes unassisted task success, comprehension and edit rate. Requirement target basic selection <=3 primary stages, >=90% representative task completion proposed NOT observed. No accepted status until independent verification.
