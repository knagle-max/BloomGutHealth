# Bloom development handoff — 2026-10-25

v0.5 remains incomplete. Work is on enhance/bloom-experience, PR1 and the existing Render service. No main merge, replacement service, credential change, new live controller role or paid-provider activation. Detailed chronology and failures remain in DEVELOPMENT_LOG.md; exact resume instructions in NEXT_ACTIONS.md.

## Completed and active engineering

| Commit | Completed change | Verification |
| --- | --- | --- |
| 24e3d45 | Remove genotype-only weekly selection/portion bonuses; withdraw known affected history/export while preserving original records and safe plans | 290 tests/types/build, source and synthetic browser checks; CI40168894335 success / Render dep-dbeq0hrbc2fs738ftf00 live |
| db34aaa | Profile age changes refresh cached derived planning context | Actual UI/API/cache-family and measurement editor regressions/types/build; CI40169138091 success / Render dep-dbeq2h6k1f9s73figbc0 live |
| 8bee0ea | Withdraw exact legacy genotype-ranked precision recommendation format; qualify safe historical advice | 291 tests/types/build/source, actual report/export/UI mobile/dark checks; CI40169358740 success / Render dep-dbeq4ju7bikc73bgg9ag live |
| 42c2932 | Failed/pending daily and allergy-context checks retract old guidance; explicit retry preserves edited targets | Actual UI/API explicit/background failure/retry, canonical target regression/types/build/source; CI40169553455 success / Render dep-dbeq5p4s728c73cr1vng live |
| 135ca23 | Daily target estimates reuse validated actual adult inputs; unsupported inputs get examples and no automatic suggestions | 292 tests +6 focused/types/build/source, minor/adult rendered regressions; CI40169749224 success / Render dep-dbeq79uq1p3s73egkseg live |
| 9fa8786 | Explore retracts stale personal decision/rule attribution while general research/composition remain usable; correct obsolete genotype-ranking disclosures | 12 focused/types/build/source, actual held-fetch/failure/retry/composition/mobile/dark browser; CI40169987001 success / Render dep-dbeq94s9v7es73coihl0 live |
| 21f3bcd | Shared derived refresh after profile/preferences/labs/genetic/report changes; successful precision erasure resets related personal cache variants | Actual lab save and explicit erasure/UI/handler checks, Profile and measurement editor regressions/types/build/source pass; CI40170491815 success / Render dep-dbeqd15g1s2s739l7ki0 live |
| 815a6e8 | Legacy journal add/recalculate/delete refresh remaining-day and other derived planning caches | Actual history/save/cache and journal-failure regressions/types/build/source; CI40170760305 success / Render dep-dbeqf2ajnfac73e2f650 live |
| 7f8c813 | Recipe guidance retracts during pending/failed current-preference check; retry respects new dairy exclusion | Actual recipe handler/UI held-fetch/failure/retry/mobile/dark, daily regression/types/build/source; CI40171124172 success / Render dep-dbeqhs2jnfac73e2h8i0 live |
| c925dd5 | Confirmed precision erasure also discards cached completed source-write mutation responses | Actual source mutation +failed/successful erasure/UI/API/privacy/cache regression, Profile/types/build/source pass; CI40171734941 success / Render dep-dbeqmcmk1f9s73fj01lg live |

| 9c40672 +1a77db5 | Encrypted versioned control storage, atomic CAS/idempotent audit and immutable SQL guard; isolated schema setup fix | 298 full +14 focused/types/build/admin browser; Workflow40174679954 ran tests/Neon method smoke, but later schema-error inspection invalidated reconciliation evidence; corrected guard/repair pending. Render was live. |
| ac04c19 | Shared authentication/deletion budgets cover Express-accepted case and trailing-slash variants | 300 full +13 focused/types/build/source; two-Express-instance outage/allowance regressions; Render dep-dberkiuk1f9s73fjll3g live, CI schema stage blocked |

“Live” means each batch completed its development deployment; newer deployments supersede older ones. Synthetic fixtures and isolated CI do not establish real-account, physical-device or independent specialist acceptance. Control storage is administrative metadata; no runtime repository/approval adapter or mutation service is installed. Existing controller writes remain denied and no0012 control migration was applied to Render's bound database.

The exact Tester1 account, trusted runtime database binding, additive0008 preference storage and actual app read/write privileges were verified earlier. Authenticated scope/expiry and in-situ ON/OFF acceptance remain external. No credential recovery, session forging, account replacement or new grant was performed.

## Remaining priorities

1. P0 administrator control plane: separate controller authorization and fresh session/action-bound step-up with shared single-use receipt, followed by guarded mutations, current independent approval facts, runtime enforcement and UI. Storage/schema foundation is tested; parent is open.
2. P0 full52-feature runtime output/history/job/cache/revocation audit;95 referenced source files are traceability, not permission or exhaustive completion.
3. P0 operational deletion replay, key/retention/managed recovery and independent acceptance; real tariff/runtime configuration and authoritative unknown-charge evidence remain gated.
4. P0/P1 remaining concrete v0.5 evidence/unit/interaction gaps and actual product/device/accessibility/branding/security/science acceptance. Continue independent engineering while scoped inputs/reviews are deferred.
5. Reconcile/start approved independent v0.6 only after actionable v0.5 work is exhausted, carrying external blockers.

## Decisions and external acceptance

Exact questions/options/evidence are maintained in BLOCKED_USER_INPUT.md; none pauses independent coding.

| IDs / decision | Choices and recommended interim default | Impact while deferred |
| --- | --- | --- |
| GATE-701 / BLOOM-ADMIN-01: actual reviewer observations and separately approved admin identity/purpose/service/expiry | Existing authenticated Tester1 performs Profile/Add Food ON/OFF review; separately verify audited admin inputs. Keep current reviewed restrictions, no invented identity/grant/credential request | Real account/scope/access acceptance only |
| OPS-702 / PRIV-103: authorized isolated managed restore target, ceiling, RPO/RTO/retention/key/deletion policy | Supply reviewed policy/target or defer managed drill; recommend defer until explicit. Runtime binding is already known | Managed recovery and deletion-after-restore sign-off |
| OPS-702 tariff/reconcile: approved tariff/bounds/accounting identity retention and authoritative lost-response charge evidence | Reviewed configuration/evidence or default OFF; recommend no paid activation and retain unresolved liability | Real paid-operation acceptance; core curated/manual flows continue |
| NATIVE-107: shipping native HealthKit/Health Connect clients versus browser/PWA scope, platform/OS targets | Architect confirms scope; recommend continue current browser and keep unavailable native access truthful in meantime | Native implementation/real hardware acceptance |
| REST-ARCH / FOOD-508 / OFF: licensed Canadian menu source and source-rights approvals | Supply approved versioned catalogue/licence or retain manual descriptions; recommend no scraping/invented menu/OFF activation | Specific source-backed menu/OFF acceptance |
| FOOD-501: actual Canadian package/serving/search selection/save/totals evidence | Independent synthetic-account tester or owner reports exact source findings; recommend independent tester | Exact SKU acceptance, not missing API-key work |
| Asset intake / specialist gates: approved editable brand-kit path and actual running-build reviews | Versioned authorized asset path and independent reviews; recommend existing approved tokens until available | Exact asset adoption and applicable specialist sign-off |

No new owner answer is required for the next safe implementation slice. USDA is working; do not request/change/print its key. No physical Safari/VoiceOver, whole-dataset isolation, new clinical approval or live paid executor is claimed.

Current priority ADMIN-STORE-CI-02:302 full tests/types/build and schema-boundary/repair/output-guard regressions pass. New CI wrapper preserves protected rows/constraints/triggers around app reconciliation; SQL0013 repairs missing uniqueness without deleting audit. Earlier CLI silently exited0 on a logged SQL error; that evidence is corrected, not treated as green schema validation. No Render DB migration occurred. Next publication/actual CI verification pending; step-up/controller service remains unconfigured.
