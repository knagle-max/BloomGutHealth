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
|3385e5a|Original lab row, heading, number, unit and physical line available in latest and longitudinal source details.|40287210671 SUCCESS; LIVE|
|3726265|Freeze submitted Profile including units; guard repeated pending submits; minor safety refresh retained.|40287917826 SUCCESS; LIVE|
|3481677|Dirty Profile fields survive current-source refresh; changed values need explicit review, unrelated preferences do not conflict.|40288612595 SUCCESS; LIVE|
|7891efa|Current web reviewed-revision saves compare/update atomically; stale two-tab writes409; explicit latest resets all fields.|40290012763 SUCCESS including actual Neon concurrency; LIVE|
|dc57033|Explicit homemade USDA salsa ranks before generic alternatives; generic/reference review uses preparation/grams, no relabelling.|40291022595 SUCCESS; LIVE|
|30971dd|Food-entry startsfood sources, no automaticNIH; explicit supplementselection/filterdraft retained.|40291601343 SUCCESS; LIVE|

Latest verified code:30971dd6a738d21403b43490bc3446e90d7d310c, Render dep-dbfgqkuq1p3s73f72jr0 LIVE.348full/types/build/API92+13/source122 and source/canonicalfood/retry/PG correction browsers pass. Isolated productionNeon Profileconcurrency evidence belongs to7891efa Actions40290012763 (also passes inlaterCI). Historical SHAs/deployments and correctedclaims are in DEVELOPMENT_LOG/BACKLOG; inventory-onlyfailedhomequery fixedby567a744.

## Lab source-history delivered

Existing optional sourceInput is now carried into longitudinal DTO points and exposed read-only in Progress source details and My Biology latest-result details. Verbatim heading, raw row, physical line, number token and originally supplied unit remain separate from canonical converted values. Legacy absence remains unrecorded. No inferred panel/taxonomy, clinical interpretation, schema migration or writer change. New UI source mapped;120 source files.3 focused metadata/encrypted PGlite/owner-isolation/report tests, types/build, API/source checks and actual rendered source/offset/zero/reference/keyboard/mobile/dark plus exact whitespace/latest/legacy browser PASS. Full345 suite PASS; Actions40287210671 SUCCESS and exact Render LIVE verified.

Minor source/backend/copy changes use code/test evidence. Selective substantial visual review remains docs/review/today-movement-20261026/README.md.174 original earlier design files/current packs verified; later FoodReview/Bloodwork packs unavailable separately. No physical-device, human study or independent clinical acceptance inferred.

## Remaining v0.5 priorities

| Priority | Outstanding | Next concrete action |
| --- | --- | --- |
|P0|Actual owner hosted macro discrepancy and exact packaged SKU/market acceptance.|Authorized same-ID/source/DTO capture on current Render; fractional bug is confirmed independently, not declared sole root cause.|
|P0|Food homemade/prepared/brand/market and food-vs-supplement semantic routing/ranking.|Audit actual catalogue/source metadata and golden queries before rule changes; no inferred exact SKU/Home-prepared labels or made-up confidence.|
|P0|Whole-profile same-account concurrent writes and draft conflict resolution.|Current web versioned Profile saves have atomic CAS and dirty conflict review. Inventory/enforce versioned legacy writers and implement separate Experience/settings CAS; legacy no-header compatibility can still overwrite.|
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

## Current Profile pending protection

Held Profile response reproduced editable submitted Age despite pending Save. Whole Profile fieldset now freezes including units; submit guard prevents repeated pending/invalid/source-error submissions. Actual App/precision/Athlete normal and committed503 age17 journeys pass, one mutation and current minor safety guards after refresh. Full345/types/build/source checks PASS; publication and exact CI/Render verification next. This is pending-draft protection, not complete same-account CAS or external-refetch conflict handling.

## Dirty Profile source review — locally verified

Actual external refresh discarded an unsaved180cm measurement for saved171cm. Dirty age/height/weight fields now remain; current source required before Save, changed canonical source blocks overwrite until explicit Load latest saved profile. Unrelated preference refresh causes no false conflict. Acknowledged save adopts fresh values after refresh; committed503 retains draft/no success.345full/types/build/API/source120 and actual held-source/unrelatedpreferences/normal/unknown-response/mobile/minor-safety/mixedunit browsers PASS. No server CAS; read-to-write race and cross-client writes remain open. Publish/verify exact CI+Render next.

## Atomic versioned Profile source — locally verified

Current web adopts private source revision and sends quoted If-Match. Server validates owner/header and compares revision under row lock before update; stale409 does not apply draft. Actual two tabs/SQL preserve dirty fields until explicit review; explicit Load latest now also resets measurements when only saved age changed. Malformed read blocks Save.347full/types/build/API92+13/source122 and actual API/PGlite/two-tab, source/draft/unknownresponse/minor-safety/mixedunit browsers PASS. Real Neon production concurrency smoke awaits exactCI. PROFILE_REVISION_CONTRACT.md documents compatibility/backout: noheader legacy writers remain allowed, so universal Profile/settings CAS is still open. No schema or real-account mutation.

## Explicit homemade-source follow-up — local validation

Only one bundled USDA record explicitly says homemade: Salsa red2709739. It now ranks first for homemade intent, category comes from actual source description only, generic soup remains Generic, and selected reference foods review grams/preparation rather than package identity.4 focused and actual App/ProductService/canonical food/PGlite30g save/snapshot/keyboard/mobile PASS. Full348/types/build/API/source122 and canonical packaged retry regression PASS; publication/exactCI+Render next. Broader brand/market/semantic search and full recipe acceptance remain open.

## Food-entry source routing — locally verified

Search foods now startsfood sources viaoptionalPickerinitialKind; explicit supplementselection survivesmethodswitches and stillqueriesNIH. Unknown/mixed/correction contexts keepdefaultall. Actual ProductService/browser provesnoautomaticNIHcallforfoodentry; numericidentifier/manual/nomatch cases, canonicalpackaged/fallback/lostresponse/Athlete andPG foodreplacement allPASS.348full/types/build/API92+13/source122 PASS. dc57033 sourceprepared commitLIVE/Actions40291022595 stillinprogress; newroutingpublicationverification next.

## Saved food-preferences source recovery — local PASS

Actual HEAD editor committednuts exclusion butsynthetic503 retainedoldcache. onSettled nowrefreshes savedprefs and linkedpersonal planning, freezespendingwrites, retainsdirtyrawtext, and requiresreviewofchangedcurrent source.348full/types/build/API/source122 and actualApp/handlers/PGlite plusfirstgoal/practicalchoice/minor-safety browsers PASS. Publish/exactCI+Render next. Optional serverpreference source revisions are nextcandidate; no current preferenceCAS claim.
