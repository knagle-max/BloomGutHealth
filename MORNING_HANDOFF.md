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

Latest fully verified reader SHA: `6857d376b83a3b1ec2a791ab09704de501caf516`; Actions40428485309 SUCCESS391 and Render dep-dbfv8is9v7es73ds900g reached LIVE. Response action `a625c32c8b959fdf558b17229bd618b8a5c25655` is LIVE on Render dep-dbfvb9c9v7es73dsc460; Actions40429071687 is running. Its392-test local suite, types/build and encrypted regression checks pass.

Ordinary importer adoption is verified: frozen source/key/review snapshots, partial acknowledgments, renewed review only after a changed-match409, exact receipt validation, uncertain-response replay after another match, actor/navigation lifetime guards and keyboard focus recovery. Actual encrypted App/API, ordinary/grouped and NewYork clock/date/source regressions passed.

Local source-text file intake is verified live: CSV/TSV/TXT remain on-device until canonical review; bounded reads, fresh context/identity, repeated-file review, stale-read protection, exact source rows and no hidden range interpretation. Header-prefix loss and ignored extra columns are fixed. Full383CI passed after the initially stale generated inventory was refreshed; actual encrypted file/race/receipt/mobile checks pass.

Today midnight/resume source freshness is verified live: old-code stale date/source reproduced, fixed clock/query/session-expiry/unknown-state/no-polling/outage/retry/cleanup and existing evidence/search journeys pass.

Shared workspace admission is verified live: ordinary writes have a shared30/minute actor allowance, old costly/auth ceilings remain, outage/deadline fails closed before handlers, aliases are covered, late results cannot resume and privacy export remains available.389CI and actual Neon quota/export checks passed.

BIO-09 routine-focus responses now have protected readers, an owned revision/receipt action, and locally verified optional Weekly Review UI. Six explicit self-reports retain their original context; uncertain retries cannot duplicate writes or overwrite newer responses, and newer ratings/notes remain intact. Full392 local action tests and final6 regressions pass; the actual encrypted rendered journey covers lost/malformed acknowledgments, conflicts/review, clear, source outage, owner isolation and320px keyboard flow. Matched synthetic before/after evidence is in docs/reviews/focus-feedback. UI publication and exact CI/Render verification remain the immediate step. No food identity, allergy or automatic clinical/personalization behavior is inferred.

## Remaining priorities

1. Verify exact action/UI Actions and Render; publish final SHA and status.
2. Continue approved v0.5 source-trace reconciliation, including broader food/supplement feedback identity and whole-app accessibility/source coverage. Routine-focus feedback is one concrete slice, not proof that all BIO09 is complete.
3. Carry independent human/device/clinical/design/recovery/licensing gates separately; start approved independent v0.6 when actionable v0.5 is exhausted.

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
