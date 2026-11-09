# Bloom v0.5 — Full Release Candidate: Integration & Data Integrity Final Review

**Review date:** 2026-11-08 (America/Regina)  
**Review role:** Integration & Data Specialist, independent source/evidence inspection  
**Verdict:** **CONDITIONAL / NOT YET FULL INDEPENDENT PUBLIC-RELEASE ACCEPTANCE**. The engineering integration candidate is **acceptable for final coordinated review**. No new reproducible current-RC critical integration defect was established in this inspection; residual evidence, privacy, provider and operator gates are below.  
**Application candidate:** `d20e384b9223bef553f6a0def273f0d697028846`, branch `enhance/bloom-experience`, PR #1  
**Current branch HEAD at review:** `f077da1aade3da240180c5bdccc5981702603205`, two commits ahead; difference consists of evidence, QA scripts and development logs, not application client/server/shared changes. The RC document remains pinned to the preceding application commit.  
**Review preview:** https://bloomguthealth.onrender.com/ (link supplied by Developer; not personally authenticated and exercised here).  
**Developer-reported Render deploy:** `dep-dbofv1dg1s2s738gu23g`, LIVE in supplied RC report; **not independently confirmed through Render connector**, which requires explicit workspace selection.  
**Architect policy:** `docs/architecture/V05_SINGLE_FINAL_RC_GATE_AUTONOMOUS_EXECUTION_20261108.md`. One final owner checkpoint; no feature-by-feature owner approval and no unauthorized main merge.

## Executive conclusion
The full-RC packet is materially stronger than the Nov 7 integrated checkpoint. **CI run 42533189930 was independently checked via GitHub API: completed/success at exact application SHA `d20e384...`.** Both the isolated hosted persistence step and the normal live-isolated-Neon production-app startup step passed; the full engineering packet states **672/672 tests**. Earlier failed CI runs are superseded and must not be reported as active release failures. The CI cleanup job was **skipped**, not passed; review database lifecycle and permissions remain operator evidence topics.

The Developer's full-RC report additionally documents an authenticated hosted synthetic-account test of cookie/session preservation, source-token Profile data, immutable routine revisions/retries, owner isolation, account export, account erasure and session revocation. This is positive **Developer/CI engineering evidence**, not this specialist personally performing the hosted session. The report states the review app is now bound to a separate empty-template-0 database on schema-only branch `review/bloom-v05`, with 150 catalog columns / 24 app-role contracts. Prior production-named database remains separate with its records untouched. No migration or production data change was performed in this specialist review.

### Evidence classification
- **Independently verified:** source repository, current/head/RC SHA comparison, exact GitHub workflow success and named passed jobs, original handoffs and requirements, source code paths and operational checkpoint claims.
- **Documented by Developer, not independently repeated:** 672 test assertions, live Render deploy ID, actual hosted session actions and DB endpoint/schema mapping, private attachment/compiled-source MuPDF comparison, browser viewport/device simulation.
- **NOT RUN / NOT GRANTED:** this agent's own authenticated hosted end-to-end account run, direct Render service/DB inspection, physical iPhone Safari/VoiceOver, independent actual-document semantic PII audit, external provider commercial rights decision, comprehensive backup/vendor deletion and public-launch Legal/Security signoff. Do not convert these into defects unless an affected flow fails.

## A. Operational integration matrix
| Flow | Current RC evidence and status | Independent acceptance boundary |
|---|---|---|
| Generic food composition | **IMPLEMENTED/ENGINEERING TESTED:** bundled versioned USDA FNDDS food and source-specific household portions; canonical source identity and missing/zero safeguards | Source formulation and serving depend on user review; generic estimate is not verified Canadian branded product |
| USDA Branded live search | **ADAPTER EXISTS, EXTERNAL CONFIG NOT PROVEN HERE:** existing `server/products.ts` uses FoodData Central key, bounded response, timeout, source error warnings/manual saved-label fallback | Actual deployed credential/USDA success/Canadian formulation not independently certified; never treat missing key as Food capture unavailability |
| Open Food Facts | **DISABLED/LICENSING GATED:** flag `BLOOM_OPEN_FOOD_FACTS_APPROVED` in server code | Legal ODbL/database and images/attribution signoff before activation; not core v0.5 blocker while disabled |
| Restaurant menu API | **NO VERIFIED LICENSED CANADIAN LIVE PROVIDER**; manual restaurant/market/serving entry supported | External menu provider is deferred; no false claim of exact nearby or Canadian chain-nutrition matching |
| Food capture/review/save | **IMPLEMENTED/ENGINEERING TESTED:** source-specific meal review digest, version-check on save, complete ingredients, household units, draft replay, history/reuse, Today/Progress | Developer CI/hosted evidence positive; independent physical and realistic provider coverage pending |
| Microbiome PDF | **IMPLEMENTED/ENGINEERING TESTED** for supported native PDF shapes; PDF.js browser extraction and deidentified report fixture tests | Supplied deidentified/reconstructed 7/13-page reports are source-specific; real unredacted originals and open-world PII semantic acceptance not certified |
| Microbiome source records | **IMPLEMENTED/ENGINEERING TESTED:** original categories/labels/positions and qualitative semantics; reviewed edits; owned companion/reimport/delete | Do not equate strain-like label with proved strain, relative abundance, toxin/genes/function or metabolite levels; no universal Viome-layout claim |
| Genetics | **IMPLEMENTED/ENGINEERING TESTED BOUNDED:** original alleles/notations, source state and evidence restrictions, owner-scoped imports and deletions | No unsupported clinically consequential/genetic medicine conclusions; independent scope and source-specific human review pending |
| Laboratory | **IMPLEMENTED/ENGINEERING TESTED BOUNDED:** original unit/date/source, revisions, reimport/correction and plan-lineage invalidation | Same-day specimens do not imply same test; independent nonstandard lab-format and method/units cross-check needed |
| Activity/Athlete | **IMPLEMENTED/ENGINEERING TESTED:** manually supplied session/sets/performed status, stable IDs, unit/source correction and persistence | Live device synchronization/HealthKit/Health Connect **not** v0.5 prerequisite; do not imply connected device or measured expenditure |
| Planning/progress | **IMPLEMENTED/ENGINEERING TESTED:** canonical owned inputs, plan source invalidation, partial values and no assumed outcome | Developer-hosted lifecycle is positive; actual third-party and longitudinal efficacy not established |
| Account/session/data lifecycle | **IMPLEMENTED/ENGINEERING TESTED:** authenticated ownership checks, source deletion, session revocation, private export and account active-data erasure in hosted synthetic test | Backups, vendors, retention and oversized export remain Security/Legal/operational controls; active-account deletion ≠ immediate backup erasure |
| Python, native wearables, optional photo/AI | **DISABLED/DEFERRED FUTURE SCOPE** or narrowly gated | No v0.5 integration blocking expectation; neither configured provider nor browser-only UI means native sensor permission |

## B. Findings, exact severity, risk and minimum correction

### INT-RC-F01 — One fixed application/deployment/CI publication receipt
**Class:** Release identity/evidence; **Severity:** P1 release assurance, **not a reproduced runtime defect**.  
**Reproduction:** RC manifest pins app `d20e384...` while branch HEAD is `f077da1...`. GitHub compare: two intervening commits `cfc9e8e...` (evidence + compiled attached-source QA) and `f077da1...` (cookie assertion failure output cleanup), with no client/server/shared application changes. GitHub Actions 42533189930 exact app SHA SUCCESS. Render deploy identity appears in Developer packet but not independently queried by this specialist.  
**Risk:** Reviewers could accept different code or test evidence; later QA script adjustment changes test verification semantics without altering app.  
**Dependency / minimum action:** Architect freeze/identify app SHA, audit evidence SHA and Render deploy/build fingerprint as separate fields; provide endpoint/app SHA + deployment/config flag receipt without secrets. Do not relabel a moving branch as an identical build. Confirm whether corrected QA scripts were run at `f077da1` before final owner approval. No code rewrite needed if receipts reconcile.

### INT-RC-F02 — Complete report-source/semantic PII validation
**Class:** Independent privacy and source-fidelity gate; **Severity:** P0 before accepting arbitrary real-user uploaded PDFs, **not demonstrated leakage**.  
**Reproduction:** `docs/verification/V05_FULL_RELEASE_CANDIDATE_20261108.md` reports locally compiled parser tests on two supplied **deidentified/reconstructed** files, 94 taxa/22 assessments/371 foods, independent in-memory MuPDF name/category/location oracle. Explicitly excludes unredacted originals and semantic PII certification. Earlier 299-food synthetic regression remains a separate fixture.  
**Risk:** Unknown provider layouts, accidental identity-bearing biological text, hidden-layer oddities, missing date/description content.  
**Dependency / minimum action:** Security + Biology + User Testing inspect allowlisted native upload and a representative authorized unredacted/private-source workflow with local/noncommitted canaries; validate PII exclusion across request/DOM/browser storage/logs/export/cache/backups and no false counts or numeric promotion. Ensure meaningful unavailable/repair messages for unsupported dates and scans. Treat individual out-of-template PDF as unsupported until validated; do not invent rows or force JSON conversion. The public feature must not claim all Viome exports work.

### INT-RC-F03 — External food-source activation truth and market coverage
**Class:** Feature-scoped external/licensing/quality; **Severity:** P1 for enabled provider, otherwise deferred.  
**Reproduction:** `server/products.ts` has optional USDA Branded key and gated OFF adapter. No independently observed live Canadian SKU coverage or OFF rights signoff. Generic USDA FNDDS and private labels remain available.  
**Risk:** wrong country/formulation/serving, stale label, mistaken nutrient precision, ODbL licensing violations when enabled.  
**Dependency / minimum action:** Keep OFF disabled absent actual Legal approval; record displayed source, edition, country, retrieval date, partial nutrient coverage; verify deployment keys and quotas without disclosing secrets. Sample a bounded Canadian barcode set only if USDA is configured; otherwise document manual fallback. Do not activate restaurant feed for v0.5.

### INT-RC-F04 — Actual hosted account/tenant and correction/erasure independent witness
**Class:** Independent operation evidence; **Severity:** P1 release assurance, elevated to P0 if real cross-account exposure reproduced.  
**Reproduction:** Developer reports authenticated hosted test at isolated review DB, covering cookies, export, erasure, owner denial and session revocation; no independently executed second-party test or physical device in this review.  
**Risk:** unsupported behavior specific to hosted proxy, login persistence, revisions, source correction/deletion, failures after partial writes.  
**Dependency / minimum action:** Authorized independent testing of **two synthetic accounts** on the exact deployment: food→Today→Progress; source-specific lab/genetics/Viome import and correction; activity edit; saved plan invalidation; lost-response retry; stale revision 409; delete/export/revoke/session invalidation; cross-user direct-ID denial. Record SHA, build, browser, fixtures, status/screenshots with no personal data. Test targeted, not re-run full unit suite.

### INT-RC-F05 — Review database lifecycle, real-user onboarding and retained data
**Class:** Operational boundary; **Severity:** P1 release assurance, **not current schema defect**.  
**Reproduction:** Full-RC packet says separate template0 schema-qualified review database, non-expiring review branch and hosted-write qualification expiring 2026-11-15; prior production-named records untouched and not copied. CI Neon PR cleanup job is skipped.  
**Risk:** stale review data, mistaken promotion of isolated test binding to public user product, mismatch between intended account expectations and new empty database, deletion/backups/retention ambiguity.  
**Dependency / minimum action:** Operator attest database source/region/ownership and retention/cost, namespaced synthetic accounts, test guard expiry, preview-only status, cleanup responsibility and main/production migration decision. Do not silently restore production-named URL or delete prior database; preserve deliberate rollback contract. No destructive operation authorized by this review.

### INT-RC-F06 — Source-version compatibility and absent-value regression
**Class:** Acceptance boundary with positive code coverage; **Severity:** P1 if a current RC fixture fails; **no current failure independently reproduced**.  
**Reproduction:** Existing receipt and source-specific tests and latest full-RC source documentation claim preserved original lab/genetic notation, source-version checks, null-versus-zero, idempotent replay, selected source and user correction.  
**Risk:** updates replacing original evidence, quantitative microbiome score inferred from ordinal category, wrong unit or stale ingredient source silently affecting plans.  
**Dependency / minimum action:** Finite targeted regression fixtures: true zero vs absent vs unmeasured; 94 qualitative taxa vs source-specific 371 foods; 299 synthetic foods remain separate; independent same-day labs; alleles not measured; changed label/portion induces review conflict; deleted source invalidates only dependent plans; old sources unchanged on retry. No duplicate science/store architecture.

## C. Practical go/no-go recommendation
**Engineering integration checkpoint: PASS (bounded to submitted CI and Developer QA evidence).** The former Neon schema-binding gap and failing older CI are no longer active on this app candidate, per current verified run and supplied isolated-review qualifications. No reproduced current-RC P0 integration defect emerged from this independent document/code review.

**Independent integration/public-release signoff: CONDITIONAL / NOT GRANTED.** The concrete remaining acceptance actions are: (1) one verified immutable app-build/Render/environment receipt; (2) independent semantic PII/source fidelity for enabled real-report import; (3) independent hosted two-account data lifecycle exercise; (4) operator backup/retention and disabled-provider manifests; (5) Legal/Security/Science/User Testing approvals only where relevant to enabled release features. These should be one coordinated final review, not a new engineering programme or a request for already approved routine owner decisions.

**Do not hold v0.5 for:** HealthKit, Apple Watch, Health Connect, optional Garmin/Polar/Strava/Oura/WHOOP/Peloton, full Canadian restaurant API, unapproved OFF, external paid AI, clinical genetics/diagnosis, unsupported metabolite prediction, simulated Python ML, or v0.6 research. For disabled capabilities verify honest no-provider fallback and inaccessible execution routes.

## D. Sources inspected and provenance
- GitHub: `docs/verification/V05_FULL_RELEASE_CANDIDATE_20261108.md` and `.json`, published after the candidate app SHA, and `docs/architecture/V05_SINGLE_FINAL_RC_GATE_AUTONOMOUS_EXECUTION_20261108.md`.
- GitHub Actions run 42533189930 exact `d20e384...` completed **success**; job "Create Neon branch and verify Bloom" succeeded in every listed step, including exact hosted persistence, app startup, unit/embedded PostgreSQL tests, build and browser verification; cleanup job skipped.
- GitHub branch compare `d20e384...f077da1` identified only documentation/QA scripts and source evidence changes after app SHA; latest branch workflow run 42536362821 also succeeded but is not a substitute for exact-app SHA artifact mapping.
- `docs/verification/V05_FULL_RC_QUALIFICATION_20261108.md`: historical production-named database gap explicitly withdrawn after isolated review DB rebinding.
- Existing integration source `server/products.ts`, `server/report-routes.ts`, `shared/structured-report.ts`, `server/health-source-storage.ts`, `server/health-source-routes.ts`, plus source-provenance, lab and meal/Viome receipts inspected in Nov 7 independent review.
- Architect's Nov 7 final acceptance report is superseded **for the engineering state** by Nov 8 full-RC receipt; independent specialist responsibilities remain.

**No application code, paid provider, production credentials, data, database migrations, Render deployment, main branch or production records were changed by this review.**