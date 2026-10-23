# v0.5 implementation reconciliation — 2026-10-23

Source: `CURRENT_V05_REQUIREMENTS.md` through Amendment F; PR #1, `enhance/bloom-experience`, inspected baseline `58f9e63ee732a97b0f6d6f92decf3effa58f31c3`. This is a current-code supplement to the historical specialist ledgers, not a replacement or release approval. Main remains unchanged; the post-v0.5 roadmap is not started.

## Current increment: nutrition unit preferences

ARC-UNIT-001 (Amendment D), ARC-UT-03/07 and INT-2026-103 are advanced by the commit containing this file:

- Existing independent, encrypted account settings and body/hydration conversions are retained. The gap was consumption of saved energy/food-weight preferences in current food workflows.
- Today, meal-save feedback, meal analysis, daily/monthly/yearly journal summaries, practical meal choices and remaining-day projections now display the preferred energy unit. Planning percentages and canonical targets retain their original arithmetic.
- Explore accepts food masses in grams or ounces according to the account preference. Incomplete/invalid drafts hide stale results and cannot navigate to a journal save. Exact USDA identity and unrounded canonical grams survive the Explore → review → save path.
- Prepared/shopping masses use the selected display unit; the practical shopping download does too. Source household portions, original label facts, gram-based portion corrections and explicitly labelled canonical target editors retain their source units. No density inference, lab convention conversion, database migration, historical rewrite or new provider call is introduced.
- `shared/nutrition-display.ts` confines conversion to canonical kcal energy and food mass. Null, zero and partial coverage remain distinct. UI text is not parsed back into stored intake.

Validation: TypeScript and production build passed; 180 Node tests and 19 Python contracts passed locally (Node 24; cloud CI targets Node 22). New tests check incomplete/invalid ounce drafts, exact canonical mass, null/zero/partial nutrition, source-unit preservation, no double conversion and unchanged target ratios. Chromium checks cover the exact-food save payload, saved energy, separate-account unit selection, and 390/1440px light/dark views. All fixtures are synthetic and API responses intercepted; these checks do not establish real-provider or physical-device acceptance.

Paired before/after screenshots are supplied in the task's comparison gallery. Baseline is immutable `58f9e63`; candidate manifests record SHA and dirty state rather than mislabelling an uncommitted build. Reproduce with `node scripts/qa/nutrition-display-units.mjs`, `BLOOM_PLAYWRIGHT_MODULE`, `BLOOM_CHROMIUM_EXECUTABLE`, `BLOOM_REVIEW_OUTPUT`; for baseline set `BLOOM_CAPTURE_ROOT` to the immutable checkout and `BLOOM_CAPTURE_STAGE=before`. Fonts are blocked consistently, timezone America/Regina, locale en-CA, fixed fictional date/time in the runner. Specialist review remains pending. Remote CI and Render deployment are verified separately after push; neither is implied by this file.

## Today next action

ARC-UT-04 now routes a logged meal with missing energy estimates to journal review before planning. Loading and failed journal requests offer a general logging action rather than claiming an empty journal. Saved goal wording and clinical/sport eligibility remain unchanged. Pure priority tests and synthetic partial/outage browser cases cover these states; source-dependent nutrient or training-session priorities are still future work.

## Remaining work, reconciled against code

| Requirement family | Current implementation evidence | Remaining v0.5 acceptance / work |
| --- | --- | --- |
| ARC-BRAND-P0-01–07, ARC-UT-01/02/05 | Real assets in `client/public/brand`, generated tokens, branded shell, beginner and progressive Athlete setup, detached fixed demo | Full exact-candidate screen/asset review, all-screen comparison coverage, accessibility and independent Branding acceptance remain open. Existing branding is implemented, not an absent package. |
| ARC-UNIT-001 | Account-scoped settings, Profile/Progress/Athlete conversions, canonical entry helpers; this increment extends food/energy workflows | Broader remaining surfaces and exports, real-device/mixed-unit comprehension, independent correctness and design review. Not marked globally complete. |
| ARC-UT-03/04/06/07, MKT-011–020 | Capture, retry/idempotency, TodayFocus, EvidenceInsight, lab trend/source tables, biology/food explanations | Richer supported Today prioritization, consistent evidence-card adoption across all domains, full goal/context views, and source-aware null/contradiction comprehension checks. Preserve existing safety exclusions. |
| ARC-LAB-01/02/03 | Provisional unit queue, original-value reinterpretation, encrypted confirmation history, compatible-method trends | Broader reviewed catalogue/import/context coverage; qualified clinical escalation remains disabled pending clinical/science/legal validation. |
| INT-102/104/112, UT-INT-109–115 | `health-source-storage.ts`, authenticated observation/status/export/revoke/delete routes, Progress source inspection, reconciliation tests | The historical `HEALTH_INGESTION_STATUS.md` understates current storage/routes. Native permissions, real connector authentication, incremental device cursors and physical-device evidence are still absent. No real connected device is claimed; native platform choice is external. |
| BLOOM-SEC-001–010, LEG-004–008 | Rate/origin/tenant/crypto controls, scoped portability/erasure and consent boundaries; integration/security regression tests | Complete all-data/backup/vendor lifecycle and notices, managed key operations, deployed proxy/load/restore/incident exercises, independent security/privacy review. Scoped controls do not imply complete account erasure. |
| BIO-101–108, LEG-001–003/009–016 | Evidence/claim contracts, sourced food composition, contraindication/abstention gates, OFF licensing flag | Reviewed intervention/clinical coverage, scientific/legal/territorial/licensing decisions and public-launch approvals remain external or gated. No unreviewed provider or clinical feature is activated. |
| ARC-UT-08, ARC-BRAND-P0-05/06 | Synthetic browser, keyboard/reflow and regression infrastructure | Real phones, screen readers, full WCAG/200% zoom assessment, recruited persona study and seven-day follow-up remain independent work. No participant outcomes or specialist sign-offs are fabricated. |

v0.5 remains incomplete. Implemented, tested, deployed and independently accepted are separate states. Continue approved independent engineering; blocked provider/legal/clinical features stay disabled.

## Weekly planning and recipe-library unit follow-through — 2026-10-23

ARC-UNIT-001, ARC-UT-03/07: weekly plan day/meal energy, energy checks and bounds, nutrient detail rows, prepared ingredient quantities, shopping/print quantities and recipe-library shopping masses now use the saved independent energy/food-mass preferences. Canonical target editors are explicitly labelled. Source instructions, planner arithmetic, account snapshots, safety decisions and meal-log payloads are preserved. No schema or credential changes.

TypeScript, all 180 Node tests and production build passed. The reproducible synthetic Chromium runner covers light/dark 390/1440px views, unknown versus zero, source-unit preservation, incomplete-plan save blocking, canonical save/log requests, recipe-library ounce quantities and fresh kcal/gram settings. [Four matched comparison pairs and manifests](../review/weekly-units-20261023/README.md) accompany the code. These are isolated real-component screen tests with mocked APIs, not device/provider or specialist acceptance. Remote CI and deployment are verified after push. Broader unit surfaces, all-domain evidence consistency and previously listed external gates remain open; this increment does not complete v0.5.

## Athlete nutrition and hydration display follow-through — 2026-10-23

ARC-UNIT-001: Athlete daily team energy target, known intake, meal-option energy, prepared shopping weights and sweat-loss estimates honor the independent saved energy/food-mass/hydration preferences. Existing canonical calculations, reviewed profile targets, safety blocks, nutrient conventions, source instructions and gram-based meal-review links are unchanged. Missing energy remains unavailable and invalid hydration estimates remain flagged.

TypeScript, all 180 Node tests and production build passed. [Synthetic browser evidence](../review/athlete-units-20261023/README.md) covers overview/fueling, 390/1440px, light/dark, mixed unit settings, fresh metric settings, null values, canonical review links and reflow. No new gallery is generated for routine unit changes under the updated visual-evidence directive. Independent review and the remaining v0.5 backlog remain open.

Prior batch `3513138`: GitHub Actions run `40016773955` passed (including isolated schema-only Neon setup, unit/integration tests, production build and live persistence); Render deploy `dep-dbdrt0eq1p3s73f0rbl0` reached `live`. Later architect documentation commits are retained. Remote CI/deployment for this Athlete batch is checked separately after push.

## Redundancy audit P0 controls — 2026-10-23

UT-RED-201/202, MKT-RED-001: Profile uses one master group; My Biology Progress uses one unit editor per preference and labelled check-in fields. Unsaved valid values convert only after preference persistence succeeds; failed saves preserve their original value/unit. Unfinished drafts cannot be silently reinterpreted or submitted. Feet/inches without feet no longer count as empty. The existing account-scoped settings store and canonical profile/check-in representation are retained.

UT-RED-207/MKT-RED-002 is verified here as a regression boundary: original lab numbers/units and inferred-unit status do not change with display preferences; existing tests retain pending-unit exclusion from canonicalization, clinical flags and downstream ranking. No new clinical inference is activated.

Validation: TypeScript, 182 Node tests, production build and [synthetic route-level browser assertions](../review/unit-editors-20261023/README.md). UT-RED-208 coverage includes failed saves, incomplete inputs, repeated changes, canonical payloads, responsive layouts and keyboard/zoom surrogates. Real-device, screen-reader and independent acceptance remain open. UT-RED-203–206 are the next actionable consolidated requirements; v0.5 remains incomplete.

## Outcome-first Progress and shared dietary editor — 2026-10-23

UT-RED-203/204 and MKT-RED-003/004: Progress now leads with the latest five dated body/response observations, preserves dates and missing values, links directly to a dated check-in subview and keeps the undated Profile snapshot/settings secondary. Weekly forms/experiments are disclosed after observational views. Laboratory source/method comparability remains intact.

Profile and My Biology show concise preferences/exclusions and separately identified allergy/safety context, linking to the existing Meal Planner editor/store. No second preferences store or clinical-goal editor is added. Shared editor updates invalidate the existing workspace queries. My Biology now accepts validated `tab=progress` and `tab=labs` links, with invalid values falling back to Overview.

Validation: TypeScript, all 182 Node tests, production build and extended synthetic browser checks for editor ownership, propagation, safety context, dated navigation and 320–1440px/keyboard/zoom surrogates. [Matched changed-screen comparison with callouts](../review/progress-layout-20261023/README.md); independent acceptance remains pending. P0 batch `2081821` passed CI run `40022253191` and reached Render `live` (`dep-dbdsgto473hc73bg41vg`). UT-RED-205/206 remain actionable; broader external v0.5 gates remain open.
