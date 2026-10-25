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

## Provider-unit costing contract

Added ai-costing.ts and four regression tests for OpenAI Responses usage subset semantics, malformed/missing counters, effective-dated exact-model tariff validation, integer micro-USD rounding and worst-case no-cache reservation. All rates are explicitly synthetic fixtures; no actual vendor price asserted. Missing usage does not become zero/actual spend. Runtime token upper bounds, provider receipts and callsite integration remain OPEN. 228 tests, TypeScript and build passed.

Ledger ac7ff5941b80d868ed22d5122648c9fcab0cc82d CI 40077584409 succeeded, including actual isolated Neon multi-connection atomic reservations/idempotent settlement/account isolation at 08:22:27 UTC. Render dep-dbe6k34s728c73c8mmfg live. No application-side monetary activation or existing Render migration.

## Planner energy target editor unit gap

Concrete audit found TodayPlanner and WeeklyPlanner target inputs still labelled/stored UI as kcal when the account selected kJ. Both now convert only the energy editor value and weekly bounds to selected kcal/kJ; input returns through the existing exact inverse to canonical targets. Other nutrient/source units unchanged. Canonical saved requests are preserved without serializing rounded display strings.

228 tests/types/build passed. Synthetic rendered scripts/qa/planner-target-units-journey.mjs verifies daily 8368 kJ for original 2000 kcal, entering 9204.8 kJ sends 2200 kcal from both daily/weekly forms, converted min/max, protein unchanged, metric reset and no overflow. Uses real domain Today plan/report with intercepted HTTP; not independent hosted acceptance. No near-identical screenshot gallery for this focused label/input fix.

Costing b092ec8c920d38be0d3a900dd0df5cfca4dc4e89 CI 40077838047 success; Render dep-dbe6lsmk1f9s73f0crr0 live.

## Capability audit source inventory

Added non-executing TypeScript AST inventory generator and hash/drift check for literal /api declarations. Actual count: 78 endpoints plus 6 middleware mounts, 13 source files. Reproduction/check passed. All dispositions remain REVIEW_REQUIRED rather than inventing runtime authorization approval. Source-only scope and exact next review priorities documented in docs/operations/API_EXPOSURE_REVIEW.md. Added CI check alongside TypeScript; no routes, permissions or providers activated. Python, dynamic routes, UI, jobs, tools, export/cache fields and full 52-feature coverage remain OPEN.

Planner target editor f2f56c376b9e9726232e4b735fc1686141dff7ad published; Render dep-dbe6oktg1s2s7392uuo0 live. CI 40078220788 completed successfully.

## Authenticated metered text AI execution

Wired existing ingredient parser, recipe ranking and recipe generation SDKs to one server-only execution guard. Credentials/consent cannot bypass missing reviewed installation, feature/account authorization, explicit limits and pinned-model tariff/bounds. No live installer, tariff, money budget, identity key or schema change configured. Core manual/curated paths remain functional; ordinary unavailable AI controls are unmounted. Requests are text-only, no tools/prior context/images/streams/background/retries. Shared reservation precedes provider invocation; replay denies. Pre-call payload/policy/role recheck; post-call role/runtime kill withholds output while settling incurred usage. Unknown outcomes keep liability. Receipts atomically retain token counts + hashed provider ID, not prompts/health/raw IDs; additive migration only isolated tests/CI.

236 full tests passed; final 8 executor tests separately validate last kill/timestamp hardening and actual SDK synthetic response/usage and quota fallback. TypeScript/build, source inventory, rendered canonical Add Food save/totals and planner kcal/kJ writes passed. No screenshot gallery for this predominantly backend slice; QA can now skip screenshot generation. Exact new CI/Render verification follows publication. Remaining actionable work includes policy composition/config validation, circuits/reconciliation, admin-only aggregates, full capability inventory and other v0.5 requirements.

Latest user explicitly authorizes v0.6 once actionable v0.5 is exhausted; external v0.5 blockers do not hold independent approved v0.6. Current actionable v0.5 remains, so no transition claimed.

## BLOOM-TODAY-01 — first action and canonical correction

One primary action now precedes explanation; duplicate empty copy removed, nutrition/deeper options disclosed, setup optional. Adjust opens/focuses the existing goal editor; one explicit canonical save updates Today. A reproduced saved-goal effective-zoom obstruction was fixed through action-first ordering, with no critical text truncation. 237 full tests/types/build, 4 focused priorities and two browser journeys passed; source/goal/error/unknown/keyboard/320–1280/effective-zoom evidence in docs/review/task-first-today-20261024. Physical/hosted/independent review remains unverified.

Prior OPS batch 861b04a6d25afd6affe1551c01761fc8801b6031 passed CI 40112511251; Render dep-dbedu4eq1p3s73e5g1cg live. Actionable v0.5 remains: next OPS provider/global circuit and configuration/reconciliation work, then capability audit. No version completion declared.

## BLOOM-OPS-01-CIRCUIT

Added shared PostgreSQL provider/platform health state and mandatory circuit admission in metered text execution. Explicit policy only; cooldown, one leased recovery probe, stale-generation fencing, known pre-call cancellation and provider-scoped immediate auth/quota/rate failure. Open circuit invokes no SDK and releases only unstarted reservation; actual failed-call liability remains reserved. No health/account/prompt data in circuit state. Migration 0011 only isolated process; no real policy activation. 243 tests/types/build passed; guarded Neon smoke now races recovery probes across connections. Today 7be1d57 CI 40114439312 passed, Render dep-dbeea2jbc2fs7385mhd0 live. Actionable v0.5 remains; continue CAP/OPS work after publication checks.

## BLOOM-CAP-01-EXPORT

Confirmed account export bypassed the ordinary API's historical-model withholding. v2 now shares the boundary, selects only metadata from generated prediction/impact/analysis/advice tables, and omits bacterial inferred functional profiles. Original source observations, encrypted lab/source units, zeros and account-owned record lineage remain; raw stored history unchanged. Historical analysis timestamp now uses original analyzedAt where appropriate. Profile copy explains withholding, with optional scope details and visible sensitive-download acknowledgement. 243 tests/types/build and v2 download/ack/retry/mobile browser passed. Isolated Neon sentinel test added. Circuit dbc2b4b CI 40115469902 passed, Render dep-dbeegdlg1s2s739asmg0 live. Continue full capability audit/internal composition; no release completion.

## BLOOM-CAP-02-UI — local-only internal photo workflow

Explicit server grant purpose/dataset/photo display scope now composes one local image preview into Add Food using the existing Settings toggle and canonical meal editor. No execution permission: direct image endpoint stays 403, ordinary users see three working methods. Shared capability polling/focus refresh fail closed; OFF/revocation aborts/removes restricted cache and unmounts/revokes image URLs while preserving text/products/focus. Grant rechecked after async preference reads; malformed kill-switch denies. No real grant/environment/migration/paid provider configured.

246 full tests, 11 final focused tests, types/build and source inventory passed. Actual capability-handler synthetic browser and ordinary Add Food / Settings regressions passed; zero model calls, one canonical save. Evidence docs/review/development-photo-20261024. Initial final inventory drift during concurrent source editing was regenerated and final check passed. Export 4f8cf14 CI 40116850822 and Render dep-dbeeoum7bikc73b6c9eg live verified. Continue independent v0.5 CAP/OPS work after publishing; physical/hosted/internal reviewer acceptance remains separate.

## BLOOM-OPS-01-REPORT — private operator liability visibility

Added a concrete read-only CLI consumer of the existing ledger with explicit dedicated credential (never application DATABASE_URL fallback), bounded repeatable-read snapshot, SQL-only provider/feature aggregates, current UTC-month actual vs estimated settlements and all outstanding liability/age. Amounts/counts are exact strings and average cost retains distinct metered-AI-account denominator; no account/request keys, receipts, prompts or health data leave SQL. Optional reviewed threshold policy is strict with no monetary defaults; exit 2 signals structured budget/aging alerts, fixed safe errors exit 1. No external notification, live DB read, provider call, refund or admin provisioning. Isolated Neon smoke extended for actual read-only snapshot.

250 full tests and 4 final focused tests passed. TypeScript initially rejected bigint literals under existing target; switched to BigInt constructors, retaining exact arithmetic. Final focused test includes future timestamp liability conservatism. Final TypeScript/build and source inventory checks passed. Pending trustworthy billing evidence remains reserved; aggregate report is not invoice reconciliation. CAP-02-UI d7a103d CI 40119564999 passed / Render dep-dbef9jmk1f9s73f975f0 live. Continue approved independent v0.5 work.

## BLOOM-SCI-01-TIME — duplicate-instant comparison and source context

Reproduced same measured instant written with different UTC offsets passing raw-string uniqueness and yielding an observed laboratory change. Comparability now checks parsed instants while retaining both original records. Existing source disclosure includes exact original timestamp/offset, source reference bounds/units (zero preserved), missing bounds and fasting context. Unit conversion is disclosed when unit differs even for zero/equal numeric values. Source intervals remain explicitly distinct from treatment targets. A keyboard-focusable scroll region keeps the richer table within mobile layout; no new dashboard or clinical rules.

251 full + 16 focused tests, types/build/inventory passed. Actual rendered synthetic duplicate/compatible/single/empty states, table/date/zero/unit/reference, keyboard and 320/375/390/1280 light/dark/effective-zoom reflow passed; no writes. Initial browser assertion used an obsolete empty-state string; corrected fixture expectation and reran. No gallery for this source-table/semantic correction. OPS report 824c6e2 CI 40119991618 (including isolated Neon read-only snapshot) passed; Render dep-dbefc7k9v7es73cfa49g live. Continue independent v0.5 engineering; no release/clinical acceptance claimed.

## BLOOM-CAP-01-SOURCE2 — route audit omissions

Reproduced source scanner omission of array-declared GET meal endpoints and generated auth/weekly/retired route families. Extracted non-executing AST helper; static arrays/templates are included, dynamic paths and global/implicit USE middleware become explicit unresolved review sites. 80 static endpoints + 6 API mounts, 13 unresolved source sites, 15 hashes. Summaries exclude inline bodies and call arguments. Aliases/chained registration/non-HTTP/52-feature authorization still open; no source findings become runtime approval.

4 actual AST/current-source assertions, standalone tool TypeScript and deterministic generation/check passed. Sandbox initially reported only file-level test pass; approved worker ran all four assertions. Application source unchanged; full suite/build runs in publication CI rather than repeating unchanged local application checks. c92a133 passed CI 40120455712; exact Render verification follows. Preserved concurrent Architect ff8fedb/b186a14 engagement handoff via fast-forward; new scope is v0.6, does not interrupt current v0.5 defects.

## BLOOM-OPS-01-CONFIG — strict staged configuration/composition

Added bounded offline policy checker and trusted server composer for existing metered text execution. Strict explicit current tariff/model/bounds/review, consistent global/account/provider/feature limits, both circuit policies, unique expiring account/feature grants and separate stable identity secret. Invalid/stale/contradictory policy fails without sensitive echo. Parse snapshot resists later caller mutation; runtime/grant/time/Legal rechecks deny errors. Default real Legal registry remains denied, UI grants do not confer paid execution, and production startup still installs no executor. No provider/DB credential loaded by offline validation; no live config/migration/paid activation.

259 full tests passed, including four configuration/default-clearance-denial/actual-PGlite-composition/CLI privacy tests. Final types/build/inventory passed. a8c8c93 passed CI 40120787805 and Render dep-dbefh3ubs3rs73c2mpeg live. Reconciled stale parent backlog wording and normalized its table; earlier foundation evidence is preserved while current integration status is explicit. Continue independent capability and reconciliation/lifecycle engineering.

## BLOOM-CAP-01-CROSSWALK — all-registry source traceability

Added initial 52-ID crosswalk across declared UI/API/logic/jobs/Python/stored/export/cache surfaces, with explicit mixed/denied/incident/not-implemented states and no permission promotion. 75 unique source files hashed; CI validates exact current registry membership/version and source drift. Source is read as text, never application imports. Two actual tests cover completeness/duplicates/unknown IDs/unsafe paths, no approval promotion and drift. Standalone tool types/inventory passed. No runtime behavior or approval changed; per-action exhaustive/runtime authorization remains open.

Unknown-outcome matching is separately recorded BLOCKED_USER_INPUT: no trustworthy zero-charge inference from missing store:false responses or reservation age. Preserve liability/manual fallback, no paid activation. b2b1597 passed CI 40121354184 / Render dep-dbefkhajnfac73dpgahg live. Continue independent runtime boundary review.

Continuation handoff refreshed in MORNING_HANDOFF.md with delivered batches, remaining priorities and deduplicated owner decisions. Next selected runtime review is saved-plan replay; current list returns stored payloads, UI gives generic rebuild warning and PLAN_VERSION predates later code changes. This is a source finding/next reproduction target, not proof that all historical plans are unsafe. No speculative mass-disable implemented. Latest 4eb07f9 Render dep-dbefp56q1p3s73e7lt30 live; CI 40122101603 passed.

Latest implementation 4eb07f9 fully passed publication CI 40122101603 (all validation steps successful) and existing Render dep-dbefp56q1p3s73e7lt30 is live. Working handoff records latest exact state. No full release completion or all-blocked claim; independent saved-output/runtime review can resume immediately.

## BLOOM-CAP-01-COHORT — truthful local report composition

After the usage-review rejection (test was not executed), UTC clock was 23:43 on 2026-10-24, later than the stated 21:23 retry time. Normal approval then succeeded; no bypass. Preserved concurrent Architect 5f9389c/0694b5a/b7f5796/0bf5c57 admin/coherent-experience requirements via fast-forward.

Confirmed Node cohort API proxied arbitrary older-sidecar output despite current Python declaring no validated reference dataset; legacy comparator contains hard-coded sample sizes/profiles. Cohort API now gives authenticated no-store explicit unavailable reference state without querying processing/account storage. Public prototype selectors/model button removed; general sourced studies remain. Result UI distinguishes withheld unsupported history from zero stored records.

Also confirmed analysis transferred health percentages to Python, ignored its values, recomputed locally and recorded caller-requested cohorts despite comparing none. New cohesive owned-source handler performs only existing descriptive summary locally, preserves original percentages/zero, records reported-composition and no compared cohorts, writes no generated metabolites/advice/genome inference. Functional-only reports still fail before mutation; errors stay private. Single-positive Shannon negative-zero caught by focused test and normalized to zero. No schema/provider/role activation.

264 full + 7 focused tests, types/build and source checks passed. Synthetic browser studies/zero/withholding/keyboard/320–1280 light/dark/zoom/outage passed; matched selective evidence docs/review/reported-cohort-20261024. Browser harness root and single-process context restart were corrected; no application failure hidden. Isolated Neon production smoke extended for real local persistence with ML credentials blank; not run against live user data. Publication CI/Render follows. Next P0 includes newly approved BLOOM-ADMIN-01 governance foundation, with real roles/activation default denied.

## BLOOM-ADMIN-01-READ — active scoped foundation

Implementing separate server-provisioned metadata-read role, expiry/service/environment/purpose binding and no tester inheritance. Admin prefix denies non-admin reads/writes; direct changes remain denied even for reviewers. Source manifest projects only review fields, never conflates source flags with readiness, approved scope, deployed availability or rollout; unknown verification remains explicit. Actual new role-only page has search/filter/details and unavailable actions/reasons, no public navigation footprint. Role/error removes metadata and cancels its real fetch; optional transport AbortSignal preserves existing header calls and also lets default readonly queries honor logout cancellation. No real role provisioning, migration or activation/mutation implementation.

9 focused actual-role/API/preview tests and type checks passed. First actual-handler browser passed ordinary/tester/fake-client denial, source fields/search/filter and real request revocation. Final extra native AbortSignal/full suite is running. Initial query transport parameter type mismatch corrected using backward-compatible fifth signal argument; no source functionality weakened. Real administrator provisioning question recorded separately, per indexed explicit no-invented-role requirement. Cohort f3dce55 passed CI 40144577299 (including isolated production persistence without ML credentials); Render dep-dbeka50473hc7397ncpg live.

ADMIN-01-READ milestone: 267 full + 9 focused tests/types/build and source checks passed. Actual-handler browser passed ordinary/tester/fake-client denial, all 52 fields/filters, 320–1280 light/dark/zoom/keyboard and role/network/cache removal (one actual request and AbortSignal aborted); existing Settings and canonical Add Food regressions passed. Final static evidence links were checked with types/build/browser; unchanged broad suite was not repeated for that content-only completion. Source crosswalk now 81 files. No actor/patient/prompt data or real grant in evidence. CI smoke now explicitly seeds/deletes a disposable synthetic read-only admin on the already-isolated PR database, tests real production login/session/API/no-promotion/deleted-session behavior, then continues ordinary-account checks. Syntax checked; actual isolated CI run pending publication. Parent mutations/step-up/audit/rollback/rollout are not implemented.

## BLOOM-ADMIN-01-POLICY — source flags are not execution permission

Added a shared trusted-facts decision and integrated the existing restricted guard. Fixed latent source-Boolean promotion path: a source approval/public flag alone cannot enable restricted execution. Canonical unknown/incident/research/category boundaries cannot be overridden even by a trusted approval adapter. Implementation/material, independent scope/evidence per-role validity/version, legal/security/specialist quorum and no self-approval are separate from enabled control, bounded expiry, audience/cohort/percentage and subject consent. High-consequence requirements are explicit reviewed policy, never inferred from a free-text purpose label. Individual reviewer expiries/digests checked; control cannot outlive the earliest approval.

270 full + 7 focused tests, final types/build/source checks passed. Independent Python HMAC vectors test stable account rollout, revision independence, 0/10/50/100 monotonicity and explicit cohorts. Table boundary tests cover mismatch/revocation/expired individual review, scope widening, forged fields, unknown classification and no private decision echo. Early iteration model broadened into canonical authority/individual evidence checks before publication; final frozen milestone rerun passed. No source-flag changes, live proof/subject/state/consent adapters, rollout key, approvals, provider calls, schema or mutations installed. Default actual restricted behavior stays denied; safe T1 routes preserved. No screenshot gallery for backend-only work.

Admin READ 3ce8e9c passed CI 40146891714 including disposable PostgreSQL-backed production auth/read/no-promotion/deleted-session checks; existing Render dep-dbekqptg1s2s739hatf0 live. Parent governance storage/step-up/audit/rollout/live integration remains open. Next dependency-enabling OPS assessment: the optional science coaching SDK has a source gate but no monetary execution wrapper; integrate with existing shared metering without enabling it.

## 2026-10-25 — owner P0 and policy publication
- Preserved Architect ed8fffb via rebase; published policy slice as 92baf7b554efa881d21702e1568e59b00f94f1fc. Prior frozen verification: 270 full + 7 focused tests/types/build/source checks. Render dep-dbeljvcs728c73cnumn0 live; CI 40150423339 passed.
- Investigated actual tester1 before unrelated work: exact username query on connected production branch returned zero rows; workspace database differs from connected endpoints and read failed DNS. Render service metadata verifies existing public review service/branch but not database binding/synthetic dataset clearance. Consolidated one GATE-701 decision and precise resumption steps; no live changes or credentials accessed.
- Continuing independent OPS science-ranking SDK accounting. No new paid provider enablement or real review grant.

## 2026-10-25 — science ranking metering
- Added independently bounded/granted science-ranking to strict configuration and the existing shared metered executor. Science route uses authenticated account/request plus explicit consent, account-specific availability and no-store responses; source gates remain closed without independent approval.
- Actual SDK interception verifies reservation precedes execution, forced store=false/output cap, actual usage settlement, curated fallback with unknown quota liability, source revocation withholding and open-circuit zero further SDK calls. Missing installation/account/consent/source clearance never calls SDK. Added strict configuration test for missing science policy and non-inherited recipe grants.
- Focused 25 substantive assertions/tests passed; types/build/source inventories passed. First test iteration correctly encountered the shared quota circuit when it attempted a later SDK call; reordered independent scenarios, retained the circuit and verified its blocking. Full regression: 272 tests passed; no live paid activation or migration.

## 2026-10-25 — historical plan current-safety distinction
- Science ranking published 677cd548423cc41b26e96f15c82ea1485010ad64, CI 40150701019 passed / Render dep-dbelm0cs728c73co094g live.
- Reproduced: exact saved feasible plan still returned old checksPassed=true after renal-context change; no historical interpretation status. Fresh planning correctly blocks the same account. Initial regression fails at the missing historical status, proving the concrete gap.
- API/export now annotate saved weekly plans as historical/not revalidated without changing payload, request, observations, units or zero targets. UI records saved date, labels reasoning/checks as at-save, disables resave until explicit current-context rebuild, preserves inspection and explicit eaten-meal logging. Old matching version strings confer no current clearance. No automatic regeneration or new clinical model.
- 12 focused tests/types pass, account isolation/export preservation verified. Matched source-baseline gallery docs/review/plan-history-20261025; browser keyboard exact-request rebuild/renal refusal/reopen/mobile/dark/200% passes. Browser found existing long-button overflow at enlarged text; fixed within weekly planner. 273 full tests/types/build/source checks passed. Publication pending.

## 2026-10-25 — deployment-bound internal reviewer grants
- Published plan history acd83890d1ee61513e2e7f918cca5db3afdd6fa9; Render dep-dbelod8473hc7398qhm0 live, CI 40151045106 passed.
- Internal UI review grants now require exact platform service identity matching the reviewed grant, with missing/mismatched identities and non-finite clock denied. No grant or environment changed on Render. Existing reviewed environment/territory/expiry/scope/fingerprint and independent restricted execution remain required.
- 9 focused tests/types passed. Actual-handler synthetic browser verifies mismatched deployment retracts local image, revokes object URL/cancels restricted cache and preserves canonical manual draft/save. Reused journey now supports screenshot suppression/output outside repository; no redundant gallery.
- Existing isolated CI smoke extended with its own server-only synthetic display grant, actual production login/PostgreSQL preference ON/OFF, no inference permission and ordinary-account/deleted-session denial. Not yet CI verified. 273 full tests/types/build/source checks passed. Added concrete safe provisioning/revoke procedure; actual tester1 still blocked on verified binding/account/dataset/migration review.

## 2026-10-25 — recorded nutrition period integrity
- Reviewer binding 01ccc321b8f419bc00e7c4209e90734e4d043612 passed CI 40151281521; filtered job log confirms actual production-session synthetic ON/OFF/no-inference and deleted-session denial. Render dep-dbelq3eq1p3s73edc7og live. Real tester1 prerequisites remain unresolved.
- Reproduced unchanged extracted monthly/yearly handler returning zero for missing energy and ignoring sourced intelligence fiber; failing test proves null→0 before implementation.
- Replaced ~210 duplicated aggregation lines with domain-owned history routes reusing existing mealNutritionSummary. Canonical totals/coverage, zeros/nulls/partial estimates, two-decimal per-logged-day average and explicit UTC calendar preserved across monthly/yearly/breakdown. Strict year/month validation, compatible padded month, exclusive period end/leap year, auth-before-store/no-store and private failures tested. No stored records changed.
- UI marks partial known estimates and unavailable nutrients, removes misleading adequacy colors, identifies current targets, keeps optional disclosure and displays errors distinct from empty history. Actual browser discovered narrow-card overflow; scoped history reflow fixed. Journal's existing legacy save/edit/delete now invalidates indefinitely cached period queries; browser verifies one mocked save refreshes actual-handler summaries without reload. kJ affects display only.
- 275 full + 2 focused tests/types/build/source checks pass; actual-handler browser unknown/zero/partial/kJ/save-refresh/mobile/dark/private outage passes. Existing isolated CI smoke extended for production history totals/fiber/UTC denominators; pending publication. No gallery: data qualification and localized wrapping, no major new screen/workflow. No real provider calls or live database writes.

## 2026-10-25 — journal outage recovery without fabricated values
- Nutrition history f3e57ca3067ce9b969d70788e2e3acef897a5617 passed CI 40151817599 / Render dep-dbelu0g473hc7398vegg live.
- Reproduced rendered summary outage: no explicit failure, fabricated zeros and percentage display from client fallbacks. Browser regression failed waiting for the missing safe recovery state.
- Summary, planning-target and full-journal failures now have independent fixed messages/retry. Daily failure hides stale cached totals; target failure preserves known source totals/zeros without guessed comparisons; full-history failure preserves separately available today entries and marks incompleteness. Removed client numeric target defaults. Unknown macros no longer acquire 0% badges/progress bars. Historical current-target display also respects unavailable target data.
- 275 full tests/types/build/source checks pass; browser covers initial outage, cached-success→failed-refresh, known zero/unknown, actual retry, source fallback/older-history exclusion, private errors and 320/1280. Previous actual-handler history/partial/kJ/save-refresh journey also passes. No schema/provider operation or major normal-state UI redesign/gallery.
- Current next source issue identified for reproduction: server target endpoint substitutes unrecorded demographics, unlike newly removed client outage fallbacks. No change claimed yet.

## 2026-10-25 — example references versus profile estimates
- Journal recovery 775cbc3676e8a7faf9430777e3ae0f1256f321e2 passed CI 40152227192 / Render dep-dbem145g1s2s739i5m5g live.
- Reproduced unchanged extracted target route using missing profile fields as assumed male/30/175cm/75kg; no example/source metadata. Regression failed at missing explicit example basis.
- Target route now belongs to a narrow module. It requires authentication/exact owner and existing account; failed/missing storage never becomes examples. Supported available adult profile fields retain the exact existing energy/macro formula; missing/invalid/unknown/minor/non-positive estimate inputs use explicit existing journal example references without inventing demographics. Fixed nutrient numbers are labelled general examples even with a profile-based estimate. No medical requirement or release clearance inferred.
- Source note/profile link and example/current-estimate labels are integrated into the existing journal/history. Removed remaining numeric client target substitutions and percentage displays when a comparator is unavailable. kJ conversion changes display only. No public feature activation, provider call, schema or real user-data write.
- 278 full + 3 focused tests/types/build/source checks passed; independent fixed arithmetic vectors, input/failure/ownership/privacy boundaries; actual-handler browser example→profile, canonical kJ/history label, cached failed refresh/retry and mobile passed. Minor old TypeScript target rejected Set iteration syntax; corrected to Array.from and final checks pass.
- Existing isolated production CI extended to create/read/clear only its own synthetic profile and verify explicit examples, formula values and tenant isolation. Pending publication/CI. Next investigate source conflict between known minor Profile and adult planning context; no fix claimed yet.
