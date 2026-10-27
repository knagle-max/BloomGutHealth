# Bloom development handoff — October27,2026

Branch `enhance/bloom-experience`, [PR1](https://github.com/knagle-max/BloomGutHealth/pull/1), existing [Render review app](https://bloomguthealth.onrender.com), workspace tea-db9toijrjlhs73850cp0/service srv-db9u7mjbc2fs73d86uv0. v0.5 remains active/incomplete; v0.6 has not begun. Owner core-functionality override3d2c6f8/b04b9b2 is incorporated: normal useful journeys first, noncritical edges deferred. No main merge, production-data/credential changes or restricted activation.

Latest fully verified reader `2042b61a2ae37070713ea62718d56390b47a0dea`: Actions40450056987 SUCCESS395; Render dep-dbg2hgjbc2fs739pbts0 LIVE. Everyday activity capture is locally complete with396 passing tests and awaits publication/exact CI/Render below.

## Development summary

| Commit | Completed behavior | Verification |
| --- | --- | --- |
|6857d37, a625c32,602dcb6|Optional Weekly Review routine responses, original context, explicit clear, revision/receipt retry protection, numerical ratings preserved|Actions391/392/392 SUCCESS; Render reached LIVE; actual encrypted rendered workflow|
|3760580|Today visit-only Skip/Show suggestion; keyboard focus recovery without automatic focus jumps|Actions40430319733 SUCCESS392; Render LIVE; Today clock/source regressions|
|a5a7d68|Optional recorded routine dates alongside bloodwork, source-calendar/unknown context and source-failure recovery; no causal/effect claims|Actions40431328309 SUCCESS393; Render reached LIVE; encrypted normal journey|
|91eda2f|My Biology/pending-unit dates honor entered/corrected calendars rather than UTC date slicing|Actions40431821839 SUCCESS393; Render descendant verified; red/green browser reproduction|
|8a1217f|Visit-only offline review/save waiting states and opt-in exact reconnect retry; queued reviews stop on navigation/account change|Actions40433153715 SUCCESS393; Render dep-dbfvu7nf3r2c73b2fthg LIVE;8 representative actual HTTP/PostgreSQL browser scenarios|
|2042b61|Encrypted manual-activity readers/filter/export/correction/deletion before capture|Actions40450056987 SUCCESS395; Render LIVE;5 focused schema/API/storage tests|

Earlier active lab-source, immutable date/unit lineage, explicit deletion, atomic reimport, local source-text intake and Today midnight/resume fixes remain verified in DEVELOPMENT_LOG.md. Existing source/medical/tenant/consent gates remain required.

Everyday activity now works locally end to end: Today Move→Log activity→save/exact uncertain retry→correct duration→Today→Progress→delete. It uses the existing encrypted experience store and owned routes; duration-only correction preserves source instant/timezone. General movement does not become an Athlete workout or infer energy expenditure, RPE, climate or fueling targets. Full396 tests PASS, types/build/API100+13/source130 PASS, actual encrypted rendered flow and previous movement regression PASS, keyboard320px. Matched evidence: docs/reviews/everyday-activity. Isolated Neon smoke includes create/replay/correct/delete. Capture commit and exact publication checks are the immediate next step.

## Remaining priorities

1. Publish/verify the activity vertical slice, exact Actions/Render and PR metadata.
2. Reconcile approved v0.5 requirement traces and normal core journeys; prioritize a missing food, Everyday, import or Athlete path over further edge matrices. Deferred across-restart offline persistence is explicitly not claimed.
3. Raw Viome format compatibility is BLOCKED_TECHNICAL: full reviewed handoff/representative export absent; one referenced gist read failed CONNECT403. Existing canonical structured import remains available. Do not guess provider schema or request credentials.
4. Keep native/device/human, independent clinical/legal/design, recovery and provider-rights gates separate. Transition automatically to approved independentv0.6 once actionablev0.5 is exhausted.

## User decisions and external evidence

No new credential or user decision was needed for the work above. Full questions, choices, rationale and deferral impacts remain in [BLOCKED_USER_INPUT.md](BLOCKED_USER_INPUT.md); historical resolved asset/key entries must not be reopened merely because they remain in the log.

| Item | Exact decision/evidence needed | Recommended default and deferral impact |
| --- | --- | --- |
| NATIVE-107 | Does v0.5 require native HealthKit/Health Connect clients, or browser/PWA with truthful unavailable device integration? | Continue browser work; retain unavailable native connections until platform/OS/entitlements are specified. Native implementation/device acceptance remains open. |
| ARTIFACT-FOODREVIEW-BLOODWORK | What authorized repository path contains the original October25 Food Review and Bloodwork ZIPs/editable sources? | Versioned originals and hashes. Only new-pack fidelity/review is blocked;174 earlier originals are verified. |
| OPS-702 / PRIV-103 | Which isolated synthetic managed restore target/cost ceiling and reviewed RPO/RTO, retention, historical-key recovery and deletion-reconciliation policy are authorized? | Defer managed drill until explicit target/policy; continue synthetic recovery engineering. No live copy/restore/key retrieval is authorized. |
| REST-ARCH / FOOD-508 | Which licensed, versioned Canadian menu source is approved for items, sizes, modifiers, provenance and nutrients? | Keep manual descriptions; do not fabricate or activate a menu catalogue. |
| FOOD-501 / ARC-REVIEW-01 | Authorized hosted evidence for the intended Kit Kat/Michelina's product selection/save/totals path and the owner's same-meal overview/detail incident | Independent synthetic-account tester or owner findings. USDA key is already corrected; source-independent work continues. Exact hosted incident/variant acceptance remains open. |
| GATE-701 / BLOOM-ADMIN-01 / paid capabilities | Real reviewed tester/admin account scope and expiry, independent authorization and monetary/provider-rights evidence for activation | Keep default-denied/restricted/incident features off. Do not fabricate a session, grant, tariff, licence or clinical review. |

OFF, incident-disabled genetic ranking, unapproved model outputs and controller activation remain disabled. Managed recovery, native device/VoiceOver/Tester1, independent clinical/legal/design/study acceptance and new original packs are not claimed complete.

After answers, native scope/assets/approved catalogue/recovery and reviewed provisioning can resume independently. Unblocked file intake and whole-app correctness work can resume immediately without waiting for them.
