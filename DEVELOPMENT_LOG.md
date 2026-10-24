# Bloom development log

## 2026-10-24 — autonomous handoff

Standing owner directive: continue approved v0.5 tasks without routine questions, commit/push verified increments to `enhance/bloom-experience`, defer genuine external decisions, maintain these four root execution files and stop only on completion, genuine blockers or execution-resource exhaustion. Agents do not run after the response ends; do not imply an unattended process is continuing.

### Verified and published

- `40147fb`: combined private account export across journal, gut reports, biology, labels, settings/training and provisioned health-source data. CI 40057861646 passed. Missing optional tables are explicit, not silently empty; CI's schema prompt failure was corrected. Account-wide backup/vendor lifecycle was not completed.
- `75a598b`: bounded, allowlisted USDA transport/gateway diagnostics, without key/query/raw-response logging. Actual first key was rejected with API_KEY_INVALID. Owner then updated Render; the actual fixed public Kit Kat request returned 20 results in 806 ms at 03:35:11 UTC. This proves API access, not exact Canadian SKU or hosted save acceptance.
- `9f8302856c3e0b89490e3935a83435a1c75f5b86`: active account erasure with password/phrase/acknowledgement, transaction rollback and owned-child deletion, persistent session revocation, stale-account authorization guard and session-creation locking. Local 203 tests, types/build and synthetic browser passed. CI 40059692748 completed successfully, including real isolated-Neon synthetic-account deletion/session revocation and second-account preservation. Render `dep-dbe2k8ks728c738aphcg` reached live. No real account was deleted during verification. Backup/log/vendor retention remains explicitly outside scope. Evidence: `docs/review/account-erasure-20261024/`.
- Concurrent Architect documentation `45b972a` was preserved by rebase, not overwritten. It directs removal of repetitive product-result warning text without weakening certainty/confirmation.

### Current local increment — FOOD-506

Modified `client/src/components/ProductPicker.tsx`, `server/usda-branded.ts`, `shared/product-search.ts`, `tests/usda-branded.test.ts`; added `scripts/qa/product-result-journey.mjs` and `docs/review/product-results-20261024/`.

Behavior: literal-name matches do not claim SKU certainty; fuzzy/alias-only result sets get one hint, mixed lists mark only uncertain entries with a compact Possible match status; barcode and generic status remain distinct. Source descriptions include available serving/country/known nutrients and unique source-record descriptions. Missing serving values remain explicit. Selection still resolves the source and requires variant/amount confirmation. Buttons are unavailable during in-progress result replacement. No source credentials, provider activation or meal calculations changed.

Validation completed: TypeScript and 17 targeted product tests passed (`/tmp/product-warning-tests.log`). Synthetic browser runner passed all-fuzzy, mixed/literal, barcode, no-result/manual fallback, unique accessible descriptions, keyboard selection/confirmation and 320–1440px reflow. It produced `docs/review/product-results-20261024/results.json` and a mobile capture. These fixtures are not live provider/persistence acceptance.

Full regression/build command was rejected before execution by automatic approval review due to the account usage limit. The same execution call first confirmed CI 40059692748 was successful. This resource failure must not be bypassed. FOOD-506 is not marked verified, committed or deployed. Preserve its working files.

### Assumptions and next priorities

No automatic native/provider/license/clinical approvals. No main merge, production-data mutation or credential exposure. Next: finish FOOD-506 validation/publication, then audit backup/restore/vendor lifecycle and remaining unit/evidence surfaces in current authoritative queue order. See `NEXT_ACTIONS.md` for exact continuation.

## 2026-10-24 06:45 UTC — automatic continuation

The environment clock passed the approval review's stated reset time. A single retry through the normal approval path succeeded; no restriction was bypassed. FOOD-506 full regression now passes: 204 tests, TypeScript and production build. Existing branded save/manual fallback and advisory verification are in progress. New upstream handoffs (through d3859eb) add the v0.5 five-route Add Food chooser and P0 capability/operational controls; preserve these documentation commits when rebasing.

### FOOD-506 publication and next slice

Published `b5dce7c`; CI 40071570397 passed and Render dep-dbe58q6i0phs73bnvfr0 reached live. Product warning cleanup is verified in the development preview; hosted Canadian exact-item acceptance remains separate.

FOOD-507 local implementation: five focused chooser methods, persistent shared product/description draft, camera cleanup, neutral chooser after save, browser history and keyboard focus, optional browser dictation retained, restaurant/market descriptive JSON context. No duplicate save pipeline or invented menu nutrients. Photo interpretation is unavailable under latest approval requirements, with manual alternatives. The provisional 52-feature registry is read immutably; legacy review states normalize without becoming approved. Two restricted API paths (photo and microbial flux) now deny before provider execution and the flux component unmounts from weekly planning. This is the first gate slice, not complete regulatory/runtime coverage. 207 full tests/types/build passed. Browser fixtures prove denied camera and cross-method source-product + typed-food saving, context preservation, neutral next entry and reflow. New branded/manual save regression passed. No credentials or production data changed.

### FOOD-507 deployed; GATE-701-PREF verified locally

`4410ebe45d544f492801b784d5f9866ed6c2b840` passed CI 40072488627, including actual context persistence, and Render dep-dbe5fdbm8hqs73d6f5hg is live. The live USDA startup lookup still returned 20 results (775 ms) after this deployment.

Internal opt-in foundation: trusted server provisioning with explicit isolated-synthetic environment, grant expiry/territory/review reference and kill switch; separate account preference bound to the grant; ordinary accounts hidden/default denied. Switch does not clear any restricted services (effective list empty). Existing photo/flux gates unchanged. Preference export omits auth fingerprint; account erase cascades row. Additive migration guarded for isolated CI only. 210 full tests plus types/build and synthetic Settings off/on/revocation/reflow/light-dark checks passed. No real account grant, live schema change, credential change or restricted-service activation. Remaining independent work explicitly includes full 52-capability endpoint/output/job/export audit, real approved internal data/service contexts, and operational controls.

### Internal preference deployed; shared source quota verified locally

Internal-preference checkpoint rebased safely over restaurant UX handoff 72bdf6c, published as d0214c0. CI 40073617588 passed; Render dep-dbe5nh4s728c738d5grg live. No account was provisioned or restricted service activated.

OPS-702-USDA moves the existing source miss allowance into shared PostgreSQL budgets (search and detail/meal resolution), with configurable default 12/min, invalid-config/provider-store fail-closed behavior, cache reuse and private fallback. 213 full tests plus types/build passed; tests use two replicas on one actual embedded PostgreSQL budget store and cover reset and failed storage. No money-accounting or circuit-breaker completion claimed. Next independent P0 is the newly received common-chain/opt-in-nearby restaurant UX; provider-backed nearby/menu data stays blocked without approved source.

### OPS-702-USDA published; FOOD-508 verified locally

Published source budget as 80c3aad. Architect-only descendant 2f1ea40 includes the new concise-copy handoff; CI 40074216938 passed. Restaurant combobox now lists common brands/recent journal names within explicit region, with keyboard behavior and no fictitious nearby/menu data. Nearby makes no location call; source limitations remain visible while methodology is disclosed. 215 tests/types/build and mixed-method browser passed. Full-suite failure revealed chance occurrence of LDL in random ciphertext; replaced substring rejection with envelope validation, authenticated round trip and wrong-account rejection. No security gate relaxed. Next: publish/verify FOOD-508, then continue full capability exposure inventory, economics/recovery and app-wide evidenced polish. Independent actionable development remains.

### Restaurant and public-readiness supersession

Preserved 7af47d5 after push rejection. It supersedes always-five visible routes: unfinished photo/company-level Nearby must not be ordinary-user tiles or development messages. Working restaurant manual entry remains, with concise name/region/common/recent controls. Photo deep link returns to chooser without losing text; server denial remains. Profile's unfinished connection-status tiles/data load removed while stored-record export/deletion remains. 216 tests/types/build and updated browser journey passed. Restaurant commit was kept locally and combined with this superseding refinement before publication. No credentials or production data changed. Remaining independent engineering includes full capability exposure audit, AI monetary controls and recovery inventory/verification.

### Unified development mode and readiness checkpoint

Preserved the new 91f16c8 handoff. One internal-only Show development features control now spans incomplete/regulatory development intent; the preference still grants no restricted services. Added independent typed readiness/approval labels, including combined, research and hard-incident states. Final 217 tests/types/build plus public readiness/deep-link/draft and internal toggle/revocation/Appearance browser checks passed. Current public food methods are only the four working implementations; no unfinished photo/Nearby or connection-status placeholders. Preparing the exact-SHA CI/Render verification. Full capability exposure inventory, role-data-context integration, spend reservations/circuits, recovery and broader copy/layout audit remain actionable; no goal completion claim.

## Synthetic encrypted recovery regression — 2026-10-24

- Added tests/synthetic-recovery.test.ts: actual PGlite snapshot export/reload in memory with exclusively synthetic records and random ephemeral keys. Confirms original 0/null/source units, second-account isolation, both historical key IDs, wrong-account authentication failure and missing/wrong/absent key failure. Reapplies additive migration after reload.
- Explicitly demonstrates deletion resurrection from an older snapshot; managed restore must include separately reviewed erasure reconciliation before activation. This test is not a Neon/PITR, full account restore, vendor erasure or operational readiness claim. No live health data or durable key artifact.
- TypeScript and all 218 tests passed. Read-only Neon metadata audit recorded separately in BLOCKED_USER_INPUT.md; no cloud data/config mutations, restore, new service or charges. Managed target/policy/secret recovery remain external inputs.
- Previous published b859fac verified: CI 40075554046 success; Render dep-dbe65bcs728c73c8a6l0 live. Actual public Kit Kat source lookup returned 20 results at 07:49:13 UTC (800ms). Exact hosted SKU/save acceptance remains open.

## Owner restaurant acceptance failure corrected

Architect 8cb808e records no menu items after brand selection. Removed dedicated ordinary restaurant-search choice and moved optional restaurant context into Describe under Log a restaurant meal. No fake menu records or source activation. Legacy restaurant links preserve descriptions and open the manual context. Synthetic browser verifies three chooser paths, absence of unfinished controls, keyboard brand/market selection, no GPS, camera-denied/manual fallback, selected product plus described food in one save and daily calories. Full catalogue blocked on source rights; record is distinct from working manual context.

Recovery regression published dd59a6beb43f512391e54a21b81a8f91ac33083f after preserving Architect 11cf8f7/8cb808e. Exact CI/deploy pending at publication.

Restaurant readiness correction: 218 tests, TypeScript and production build passed; synthetic rendered journey passed at mobile through desktop. Actual menu-source/live acceptance remains blocked, not inferred from fixture success.

## Today mobile journal — screenshot-backed P0 fix

Removed duplicated empty nutrition panel and duplicated journal CTA, shortened heading to Food journal and kept No meals yet plus explicit unknown intake. Empty Today focus no longer duplicates the journal logging action. Logged/partial/error focus paths preserved. Heading/action wrap; mobile row now shows energy missingness previously hidden by legacy CSS. Safe-area-aware bottom padding and focus scroll spacing preserve reachability above fixed navigation.

Actual before/after Chromium renders at 320/375/390, light/dark, one incomplete meal, disconnected state, canonical keyboard Add food, 44px target, no horizontal overflow, focus and page-end clearance passed. Existing Today session/goal/partial/unavailable regression passed. 218 full tests, TypeScript and production build passed. CSS root zoom generated a harness-only header overflow; replaced with reduced CSS viewport model, explicitly not physical zoom acceptance. Actual Safari/VoiceOver remains external. Neutral cards already in baseline; no invented palette defect.

Restaurant correction published b023b8156863b6596e90211653d02fd2544eb5ae; Render dep-dbe6c8pr5j6c73fj9n80 live. Recovery dd59a6b CI 40076326533 passed and Render dep-dbe6b3ijnfac73dfobog was live.

## Coaching provider availability respects capability policy

Science AI status previously checked only credentials, although bloom.coach.general remains HIDDEN_PENDING_APPROVAL. Both configured SDK factory and returned execution now check the central restricted policy; direct forged consent/provider credentials cause zero provider calls while returning a curated evidence plan. Unavailable AI control is absent without an unavailable company-setup tile. Pure injected-ranker tests remain synthetic and cannot be selected through HTTP. No capability activated and no credentials changed.

219 tests, TypeScript, production build and synthetic rendered curated evidence workflow passed. Full source/capability inventory, recipe/parser cost enforcement and monetary ledger remain independently OPEN. This gate does not certify all AI services safe or budgeted.

Today mobile 316fa8a6c72c48af754281e054d4671b8e838069: CI 40076962159 success; Render dep-dbe6fjs9v7es73c62o3g live. Restaurant b023b81 CI 40076500931 also success.

## Atomic monetary accounting foundation (no provider activation)

Added additive ai_spend_requests migration/Drizzle schema and SpendLedger with PostgreSQL transaction/advisory-lock serialization, HMAC account/request keys, integer micro-USD, explicit configured per-account daily/monthly and feature/day plus provider/platform month ceilings and shared concurrency. Retry returns prior state, settlement is idempotent and account-scoped, conflicting settlement rejects, actual overage persists, unknown outcome stays reserved across calendar resets, known pre-execution release frees allowance. Missing config denies; DB failure throws without permitting execution.

Targeted embedded PostgreSQL tests passed; full suite/build in progress. Added guarded isolated-Neon multi-connection smoke to CI and support migration only in explicitly isolated preview process. No existing Render schema migration, key/tariff/budget configuration, paid API, provider enablement, account-data copy or actual billing took place. Not connected to current parser/recipe SDKs: runtime integration, billed-unit receipts, tariff freshness, circuits, aggregate alerts and secret/retention policy remain OPEN. docs/operations/AI_SPEND_LEDGER.md records exact integration and rollback constraints.

Science gate 4d5d4f04312900a89860a83af7b97f1ff3bbe7a2 CI 40077179797 success, Render dep-dbe6h66k1f9s73f08tg0 live.

Ledger batch local verification: all 224 tests, TypeScript and production build passed. UTC-reset test uses a non-UTC database session and checks month-boundary behavior. Real multi-connection Neon CI is pending publication; no runtime billing enforcement is claimed.
