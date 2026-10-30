# Bloom — Architect reconciliation: Exercise Intelligence and food-like activity review
Date: 2026-10-29 | Status: conditional architecture approval; NOT implemented, scientifically validated or visually accepted.
Sources (Library): `Bloom_ML_Exercise_Intelligence_Architect_Handoff_2026-10-29.md` (ML-ACT-1001–1008), `Bloom_User_Testing_Exercise_Intelligence_Cross_Mode_Review_2026-10-29.md` (UT-EXAI-2701–2708), `Bloom_Exercise_Intelligence_Branding_UX_Handoff_2026-10-29.md` (MKT-EXAI-2801–2808), accompanying editable asset archive `Bloom_Exercise_Intelligence_UX_Assets_2026-10-29.zip`. Original archive transfer into GitHub and live implementation NOT verified here.

## Product direction
Owner wants the existing food experience—**describe → database match → nicely presented editable review → save once**—applied to Exercise. **Approve as a core useful workflow**, with no AI/paid provider/device dependency. The sports taxonomy/muscle work and calibration are additive features, not justification to rebuild the activity ledger or block basic logging. Use flagship visual contract and exact Exercise UX blueprint (original editable assets) after source transfer; do not build only from generated imagery.

## Architecture: crosswalk existing instead of duplicating
- `ARC-ACT-01–06` (§39 V06_HANDOFF): canonical Everyday manual activity, Today/Progress, provenance and overlap reconciliation.
- `V06-TRAIN-01/02`: Athlete plans, actual workouts, strength details, cautious recovery; these do not establish a new activity repository.
- `ML-ACT-1001–1008`: constrained interpretation, reviewed taxonomy and MET estimates, exercise-to-muscle mapping, workload constructs, provenance, corrections, evidence and adaptive inputs.
- `UT-EXAI-2701–2708`: user-flow, same-record cross-mode presentation, optional calories, dedupe and acceptance.
- `MKT-EXAI-2801–2808`: flagship visual specification; simple Everyday and deep Athlete projections.

**One account-owned source of truth:** typed canonical activity identity reused by Everyday and Athlete; check existing schema/records before extension. Planned vs completed vs cancelled, reported vs interpreted vs estimated vs device-measured, raw description, source, date/time/timezone, units and corrections. Never double count; correct Today/Progress on edit/delete/mode switch. Preserve Athlete details when switching to Everyday. Athlete calendar sessions may link to canonical completed activity; do not silently duplicate.

## Phased implementation decision
**Phase 1 (P1 immediately after/alongside approved flagship UI and Food→Today core):**
1. Prominent Add Activity in Today + Athlete. Methods: **Describe / Select / Repeat previous**. Select and manual fallback must work without AI, device, internet provider or profile/genetic tests.
2. Small curated activity catalogue with reviewed aliases; original typed text persisted; parse into *draft* only. Example 'Walked 35 minutes' populates walk + 35 minutes; 'Ran 5km in 30 min' saves reported metrics without invented HR; 'Played ball' requires clarification or generic activity. User can change actual activity choice, amounts and date before explicit save; no fabricated duration/sets/intensity.
3. Compact readable review (<=3 primary stages as UX target), partial/unknown fields honest; save → real Today and Progress once. Edit/delete reflects across both modes. Everyday card = type, duration, optional measured/estimated active kcal and known distance. No mandatory Athlete onboarding.
4. Athlete projects same record to richer strength/sport fields; strength exercises allow dynamic rows and actual sets/reps/load. Preserve unprovided fields as unknown; curated muscle labels only when reviewed. Distinguish planned session from actual work.

**Phase 2 after Phase 1 actual acceptance / in parallel only for P0 integrity:**
5. MET/population expenditure estimate **only after** Biology, Integrations/licensing and source approval: gross roughly MET×mass kg×hours; above-rest approximation (MET−1)×mass kg×hours, user-facing 'active' approximation with limitations. Do not automatically increase food allowance. No invented energy from missing mass/intensity/taxonomy or stale/conflicting weights; user can log without calories. Measured device and estimate of same bout are alternatives, not additive.
6. Reviewed exercise→muscle mappings, relevant weekly strength volume, training load duration×sRPE as *arbitrary-unit estimate*, never tissue damage, injury probability, universal readiness or fixed recovery time. Wearable dedupe only as actual integrations become available, not a v0.5 dependency.
7. Evaluate optional NLP beyond rules/menu based on held-out measured improvement, price/privacy and permissions; voice transcription optional, no paid mandatory API, sensitive content not sent without consent.

## Acceptance (bounded, no speculative framework)
- No AI/network/provider: select walk + 30 minutes; save and see Today/Progress.
- 'Ran 5km in 30 min' → reported 5km/30min, no invented HR/RPE; date and activity editable.
- '3 sets of 8 bench press at 60 kg' → strength sets/reps/load; duration and kcal unknown; Everyday summary simple and Athlete detail intact.
- Type correction and duration edit update all views once; source and original text reviewable.
- Two distinct same-day workouts stay separate; planned/not completed never appears as performed; manual/device overlap not double counted if connected.
- Unknown weight gives no unsupported energy estimate; no exercise calories automatically credited as food intake; no false physiological score.
- Cross-account, save/retry/delete, responsive 320/375/390/430 + desktop, keyboard/screen reader, and practical light/dark flows verified on actual Render build.

## Sources and gates
Original editable UX ZIP with 3 light + 1 dark SVGs, UX_BLUEPRINT and DEVELOPER_CONTRACT is in shared Bloom Library; Developer must import original files/verify manifest and preserve exact reviewed flow, not infer solely from rendered mockups. ML taxonomy dataset licences including Adult Compendium MET redistribution must be cleared before bundling. Biology reviews estimation and muscle claims; UX and User Testing review actual rendered screenshots; Security/Legal controls voice/device and health-data processing. No new paid service or public feature activation. Codex verifies existing code first and reports exact SHA, tests, Render functionality and design deviations. No need to divert from owner-urgent full flagship UI implementation; this is the Exercise portion of that work.
