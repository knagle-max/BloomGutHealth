# Bloom development handoff — October 27, 2026

Branch `enhance/bloom-experience`, [PR1](https://github.com/knagle-max/BloomGutHealth/pull/1), existing [Render review app](https://bloomguthealth.onrender.com). Workspace `tea-db9toijrjlhs73850cp0`, service `srv-db9u7mjbc2fs73d86uv0`. No main merge, replacement service, credential changes, production data mutations or restricted activation. v0.5 is incomplete; v0.6 has not begun.

## Completed this continuation

| Commit | Delivered | Verification |
| --- | --- | --- |
| `33ee421` | Planning uses canonical active confirmed lab sources; pending/superseded/raw sources no longer cause false conflicts; malformed sources still deny | Actions40387901449 SUCCESS; Render live |
| `618d62e` | Explicit lab deletion removes source/unit revisions without pending-source resurrection; confirmation, stale-target rejection, safe replay and plan protection | Actions40390469923 SUCCESS; Render live |
| `1192ffb` | Source-only reimport review preserves exact threshold/qualitative/unit/reference context; no automatic merge | Actions40391046838 SUCCESS; Render live |
| `8e57897` | Immutable date revision readers, audit, canonical active lineage, unit/planning/deletion safety | Actions40392145665 SUCCESS374; Render live |
| `b26dfd0` | Reviewed date correction with reason, immutable original, receipt replay, stale-source rejection, preserved values/units and visible audit | Actions40393634801 SUCCESS376 including isolated Neon date/replay/save/deletion smoke; Render live |
| `dbe3f69` | Paste/manual/date editing require an explicit occurrence for repeated clocks; nonexistent spring times rejected; date-only precision preserved | Actions40394783399 SUCCESS377; Render live |
| `15cf2d9` | Atomic reimport endpoint compares current owned source matches under the account lock; explicit separate results, exact receipts and no legacy fallback | Actions40396269159 SUCCESS378 including real concurrent Neon201/409/review/replay; Render dep-dbfrgp7avr4c73a3u8n0 LIVE |

Latest fully verified SHA: `37605802afa921b9bb99e49e79fc29c9b08a6c8d`; Actions40430319733 SUCCESS392 and Render dep-dbfvgui9lscs738pj1tg reached LIVE. Feedback reader6857d37 SUCCESS391, actiona625c32 and UI602dcb6 SUCCESS392/live. Recorded trial/bloodwork calendar a5a7d68 has7 focused tests/types/build/actual encrypted rendered checks passing; exact Actions40431328309 and Render publication checks are in progress.

Ordinary importer adoption is verified: frozen source/key/review snapshots, partial acknowledgments, renewed review only after a changed-match409, exact receipt validation, uncertain-response replay after another match, actor/navigation lifetime guards and keyboard focus recovery. Actual encrypted App/API, ordinary/grouped and NewYork clock/date/source regressions passed.

Local source-text file intake is verified live: CSV/TSV/TXT remain on-device until canonical review; bounded reads, fresh context/identity, repeated-file review, stale-read protection, exact source rows and no hidden range interpretation. Header-prefix loss and ignored extra columns are fixed. Full383CI passed after the initially stale generated inventory was refreshed; actual encrypted file/race/receipt/mobile checks pass.

Today midnight/resume source freshness is verified live: old-code stale date/source reproduced, fixed clock/query/session-expiry/unknown-state/no-polling/outage/retry/cleanup and existing evidence/search journeys pass.

Shared workspace admission is verified live: ordinary writes have a shared30/minute actor allowance, old costly/auth ceilings remain, outage/deadline fails closed before handlers, aliases are covered, late results cannot resume and privacy export remains available.389CI and actual Neon quota/export checks passed.

BIO-09 routine-focus responses are verified in Actions and Render: protected readers, owned revision/receipt action and optional Weekly Review UI. Six self-reports retain original context; uncertain retries preserve newer responses/ratings/notes.392 tests and isolated Neon save/replay/conflict/clear smoke pass. Actual encrypted rendered lost/malformed/retry/conflict/clear/outage/320px checks pass. This slice does not establish food identity, allergy, efficacy or automatic personalization.

Today Skip/Show suggestion is verified: visit-only owner/day/action scope, no account writes or completion, explicit keyboard focus recovery and no automatic focus stealing.10 focused tests and Today/clock browser checks pass.

LAB-05 calendar context is implemented and locally verified: existing saved trial intervals alongside active confirmed lab dates, unknown legacy calendar context retained, no effect/adherence/prespecification/comparability inference. Mode/owner/read-failure/retry/320px checks pass; matched evidence docs/reviews/lab-routine-timing. Exact CI/deployment checks continue. A further UTC date-label bug in the legacy My Biology and pending-unit views was reproduced and fixed locally with the shared source-aware date helper; green rendered/type/build checks pass.

## Remaining priorities

1. Publish the date-label fix and verify exact calendar/date-fix Actions and existing Render; update PR status.
2. Continue approved v0.5 trace gaps, including FOOD12 offline confirmed-save recovery and whole-app source/accessibility coverage. Current session-only manual exact retry does not prove a durable offline queue. Routine feedback is one BIO09 slice, not full personalization acceptance.
3. Carry independent native/human/device/clinical/design/recovery/licensing gates separately; begin approved independentv0.6 when actionablev0.5 is exhausted.

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
