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
