# Bloom overnight development handoff — 2026-10-26

Branch enhance/bloom-experience; [PR1](https://github.com/knagle-max/BloomGutHealth/pull/1). Existing Render workspace tea-db9toijrjlhs73850cp0/service srv-db9u7mjbc2fs73d86uv0 only. No main merge, replacement service, production credentials, real-user/grant changes or restricted provider activation.

## Completed and published this continuation

| Commit | Delivered | Exact Actions run; Render verified live |
| --- | --- | --- |
|0f26541|Optional goal setup freshness, partial-save/draft/exclusion integrity and late-account continuation guard.|40252980254 SUCCESS|
|58568f6|Everyday Move opens dated saved session records without switching mode; planned/completed/cancelled/error distinct.|40253489175 SUCCESS|
|9b0bca3|Saved-template durable meal receipts, one-row retry/concurrency and linked source refresh.|40254006736 SUCCESS|
|aae4676|Legacy journal create/correct/delete uncertain-write recovery, retained drafts, pending editor freeze.|40254541527 SUCCESS|
|280119d|Current-only journal totals/targets/history; paused values withdraw; actual zero/unknown distinct.|40254927370 SUCCESS|
|8a25e48|Unconfirmed correction hides stale nutrition/analysis, freezes pending portions and retains retry draft.|40255449705 SUCCESS|
|fba8a6c|Numeric barcode-only routing; invalid identifiers call no provider; zero-overlap results filtered.|40256223204 SUCCESS|
|1099d03|Detached normalized per-label identity/serving/value/provenance snapshot; legacy absence remains absent.|40274276334 SUCCESS|
|01fdc50|Confirmed fractional macro display defect: positive P/C/F no longer round to literalzero; same precision across views; fat confirmation metric.|40275565437 SUCCESS|
|ae6f4eb|Reader-first optional exact lab source section/order support, encrypted/owned/confirmed-unit compatibility.|40276417421 SUCCESS|
|d326aff|Writer preserves reported headings/raw row/unit/order; correction-only drafts retain context without repeated acknowledged rows; export roundtrip.|40277856219 SUCCESS|
|09092d5|Indexed food replacement retains known mass; incompatible amount requires explicit review; untouched source annotations idempotent.|40279374233 SUCCESS|
|13495c9|No silent ingredient truncation: extraction retains all; existing20-entry bound returns400 before lookup/write.|40281888953 SUCCESS|
|7a03290|Dynamic Add/Remove ingredient review retains unrelated drafts and current serving basis.|40285115830 SUCCESS; LIVE|
|e38bfd0|Homemade hints retrieve Generic estimates without inventing Home-prepared labels.|40285639945 FAILED stale API inventory; fixed in567a744; LIVE|
|567a744|Working ingredient-based search fallback preserves canonical drafts; reviewed inventory refreshed.|40286095050 SUCCESS; LIVE|
|041cdac|Unknown source mass remains unknown in complete meal total; known nutrients/truezeros retained.|40286642337 SUCCESS; LIVE|

Latest verified code:041cdac20e0cfd4fdfa2fccf71e5bc95828dc1cc, Render dep-dbfg54h5efls73bus4sg LIVE.344 full tests/types/build/API92+13/source119 and canonical food save/PGmacro browsers passed. Historical full SHAs/deployments and corrections are in DEVELOPMENT_LOG/BACKLOG. The homequery inventory-only CI failure is disclosed; the following fallback commit passed the repaired gate. No skipped checks.

## Current lab source-history batch

Existing optional sourceInput is now carried into longitudinal DTO points and exposed read-only in Progress source details and My Biology latest-result details. Verbatim heading, raw row, physical line, number token and originally supplied unit remain separate from canonical converted values. Legacy absence remains unrecorded. No inferred panel/taxonomy, clinical interpretation, schema migration or writer change. New UI source mapped;120 source files.3 focused metadata/encrypted PGlite/owner-isolation/report tests, types/build, API/source checks and actual rendered source/offset/zero/reference/keyboard/mobile/dark plus exact whitespace/latest/legacy browser PASS. Full345 suite PASS; publish and verify exact Actions+Render.

Minor source/backend/copy changes use code/test evidence. Selective substantial visual review remains docs/review/today-movement-20261026/README.md.174 original earlier design files/current packs verified; later FoodReview/Bloodwork packs unavailable separately. No physical-device, human study or independent clinical acceptance inferred.

## Remaining v0.5 priorities

| Priority | Outstanding | Next concrete action |
| --- | --- | --- |
|P0|Actual owner hosted macro discrepancy and exact packaged SKU/market acceptance.|Authorized same-ID/source/DTO capture on current Render; fractional bug is confirmed independently, not declared sole root cause.|
|P0|Food homemade/prepared/brand/market and food-vs-supplement semantic routing/ranking.|Audit actual catalogue/source metadata and golden queries before rule changes; no inferred exact SKU/Home-prepared labels or made-up confidence.|
|P0|Whole-profile same-account concurrent writes and draft conflict resolution.|Current acknowledgements are freshness-bound; arbitrary whole-profile writes remain last-writer-wins. Add real CAS/source conflict safeguards with storage/browser cases.|
|P0/P1|Full FoodReview pre-save/live preview, dynamic source-qualified default matches, split/merge and final concise layout.|Reuse current ingredient array/save/receipts; retrieve original new editable kit before design-fidelity claims.|
|P0/P1|Lab source panel/specimen identity, independent reimport ambiguity, unknown analytes and full grouped longitudinal display.|Extend canonical provenance safely; preserve original headings versus taxonomy, dynamic actual dates/counts and clinical abstentions. Current initial-paste metadata/export is not full panel acceptance.|
|P0/P1|Complete goal→feedback→dated Progress→next-day journey and remaining whole-app master integration.|Audit delivered paths first; no duplicate goal/action/observation store or invented product metrics.|
|Scoped external|Tester1 signed-in acceptance, native/device/VoiceOver, clinical/licensing/Design/User Testing, managed restore/retention/provider billing, real controller provisioning.|Keep specific unreviewed features default-denied; continue unrelated engineering.|

Basic Everyday activity entry and adaptive training remain sequenced for v0.6; current Move source fix does not deliver those features. Existing export/active erasure, source-unit/currentness, reviewed Athlete and default-denied control-plane foundations remain; full release approval is not inferred.

## User decisions/external evidence

Exact questions, choices, defaults and impact: BLOCKED_USER_INPUT.md. Highest-leverage groups:

- Hosted capture: independent authorized synthetic tester, or owner findings from the existing review flow. Recommend independent same-ID evidence. Deferral blocks exact owner/SKU acceptance only; no fabricated sessions.
- New assets: version original FoodReview/Bloodwork editable ZIPs in repo, or provide authorized readable library access. Recommend repository originals/hashes. Earlier174 files are resolved; only new-pack fidelity is blocked.
- Native/platform/device and operational restore/cost/retention policy: confirm authorized targets and reviewed boundaries if required by release scope. Recommend keeping unavailable integrations/paid operations disabled until inputs exist.
- OFF/clinical/provider/controller rights or grants: scoped specialist evidence and explicit provisioning inputs; no self-enrolment, invented tariffs or production activation.

No repeated deploy approval or API-key request is needed. No new noncritical question pauses development. Continue from NEXT_ACTIONS.md and PERSISTENT_TASK_INDEX; verify latest remote/CI/Render first. Agents do not run after a final response ends.
