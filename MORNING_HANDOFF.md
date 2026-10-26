# Bloom development handoff — October 26, 2026

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

Latest fully verified full SHA: `0efaa508361bc58a1d417f77efc6022c55d46b83`; Actions40399237224 SUCCESS379 and Render dep-dbfrq7ks728c739ofodg LIVE.

Ordinary importer adoption is verified: frozen source/key/review snapshots, partial acknowledgments, renewed review only after a changed-match409, exact receipt validation, uncertain-response replay after another match, actor/navigation lifetime guards and keyboard focus recovery. Actual encrypted App/API, ordinary/grouped and NewYork clock/date/source regressions passed.

Current local source-text file intake is ready for publication: CSV/TSV/TXT are read on-device into canonical preview, with fresh context, bounded validation, source fidelity and stale-read guards. Header-prefix loss and ignored extra-reference columns are fixed. Full383 had382 successes and one stale generated crosswalk hash; after refresh final15 focused/crosswalk checks, types/build/API97+13/source130 and actual encrypted file/race/receipt/mobile browsers pass. Exact final CI383/Render verification is next. No OCR or new file/specimen identity is claimed.

## Remaining priorities

1. **P0:** Finish exact publication verification of file intake; preserve source/receipt/owner boundaries in subsequent work.
2. **P1:** Reconcile remaining lab/source acceptance against approved handoffs; unsupported PDF/image/spreadsheet interpretation is unavailable, not fabricated.
3. **P1:** Reconcile remaining whole-app/source coverage, daily feedback/search and accessibility against approved handoffs. Synthetic checks do not close independent human, device, clinical or design acceptance.
4. Carry external gates below separately. Begin approved independent v0.6 only after actionable v0.5 work is exhausted.

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
