# Bloom autonomous development backlog

Branch: `enhance/bloom-experience`. Last published implementation: `9f8302856c3e0b89490e3935a83435a1c75f5b86`.

This execution ledger follows the owner's overnight directive. Scope and priority remain governed by `AGENTS.md`, `docs/architecture/CURRENT_V05_REQUIREMENTS.md` and `docs/architecture/ACTIVE_EXECUTION_QUEUE.md`. Finish v0.5 before v0.6. Do not merge main or alter credentials without the relevant authorization. Do not claim independent acceptance from synthetic tests.

| ID | Priority | Task | Status | Dependencies / evidence |
| --- | --- | --- | --- | --- |
| FOOD-501 | P0 | Separate USDA Branded lookup, private-label fallback, saved meal and daily totals | IMPLEMENTED; live SKU acceptance open | `2154939`; provider error classification `75a598b`. Owner corrected the key; actual Render public Kit Kat probe returned 20 results at 2026-10-24T03:35:11Z. Exact Canadian variant, selection and saved-meal acceptance still required. OFF stays disabled. |
| FOOD-506 | P0 | Remove repeated suggestion warnings while preserving match certainty and confirmation | IMPLEMENTED_AND_TESTED; publication pending | Four modified source/test files plus `scripts/qa/product-result-journey.mjs` and review artifacts. TypeScript and 17 targeted tests passed. Synthetic browser journey passed. After the stated reset time, normal approval succeeded: 204 tests, TypeScript and build passed. Existing save-path and advisory checks are being verified before publication. |
| PRIV-101 | P0 | Combined account-record export | VERIFIED_PREVIEW | `40147fb`; CI 40057861646 passed, Render live. Read-only account snapshot; explicit optional-storage state; no passwords/session material/internal paths. |
| PRIV-102 | P0 | Password-confirmed active account erasure and stored-session revocation | VERIFIED_PREVIEW; specialist review pending | `9f83028`; 203 Node tests, types/build and synthetic browser passed. CI 40059692748 passed including real isolated-Neon erasure and second-account checks. Render `dep-dbe2k8ks728c738aphcg` live. |
| PRIV-103 | P0 | Backup retention, erasure propagation through restore, operational-log and vendor lifecycle | OPEN | Audit existing provider/configuration and approved retention requirements first. Implement/test with isolated synthetic data; actual destructive backup operations require separate authorization. No claim of full backup/vendor erasure. |
| TODAY-104 | P1 | Supported goal/session Today action | IMPLEMENTED; wider acceptance open | Included before `50f5120`; incomplete journals keep priority. Remaining work is reviewed gap context and acceptance, not another CTA system. |
| UNIT-105 | P1 | Audit remaining unit/export/chart/accessible-label surfaces | OPEN | Preserve canonical stored values and original clinical/source units. Identify concrete gaps before editing; do not redo delivered unit editors. |
| BIO-106 | P1 | Consistent evidence/missingness presentation and reviewed clinical catalogue/context | OPEN; individual clinical activation gates apply | Reuse existing components and reviewed sources. Scientific kit is reported in shared Library; verify actual asset access before claiming adoption. Do not invent findings or clinical approval. |
| NATIVE-107 | Conditional P0 | Real HealthKit/Health Connect and hardware acceptance | BLOCKED_USER_INPUT / platform dependency | See `BLOCKED_USER_INPUT.md`. Browser is explicitly unsupported for actual device access; do not substitute mocks as native completion. |
| ACCEPT-108 | Release | Independent branding, biology, security/privacy/legal, device/accessibility/persona acceptance | EXTERNAL_REVIEW_PENDING | Synthetic tests and preview deployment do not constitute sign-off. Continue independent engineering. |
| V06-109 | Future | v0.6 roadmap | DEFERRED | v0.5 remains incomplete. |

Execution resources recovered after the stated reset time on 2026-10-24. Normal approval succeeded; resume autonomous implementation. Earlier rejection remains recorded in the development log.
