# Security and scientific enhancement review — 18 October 2026

Scope: current `enhance/bloom-experience` implementation and its unmerged PR, not `main`. The existing project conversations **Security Requirements and Testing** and **Science and Nutrition Review**, plus `Bloom_Developer_Requirements_v1.md` / its 67-item backlog, are the primary handoffs. Additional focused source reviews were used to verify findings against this branch. The handoff's original main-branch observations are not evidence of current failures.

## Implemented in this enhancement

| Requirement | Result / verification |
| --- | --- |
| Session secrecy and fixation | Production startup refuses a missing/short/default session secret. Successful authentication regenerates and saves its server-side session. Logout revokes it. Real HTTP regression tests exercise the old cookie. |
| Authentication abuse and bounded inputs | Per-address/per-account throttles, bounded username and bcrypt byte limits, generic backend failures. Limiter has bounded memory and expiry; shared atomic storage is required before multiple instances. |
| Confidentiality of logs, cache and requests | No API response bodies or concrete account paths in request logs. All API responses are no-store; same-origin writes and security headers; account changes cancel and clear client query caches. |
| Service-to-service confidentiality | Python processing endpoints require a constant-time checked shared token. Express rejects missing/insecure configuration before sending data; authenticated destinations, no redirects, time/response limits. Browser credential CORS and interactive schema docs removed. |
| FOOD-02 / FOOD-05 / FOOD-06 | Portion-scaled generic composition across the 5,431-record USDA catalogue. Exact selected source ID is resolved by the server and retained through logging. Unknown nutrients remain unknown. |
| BIO-03 / BIO-04 / BIO-06 | Meal biology explanations use the persisted validated registry once per request, with relationship/source/version traces. A registry outage retains explicitly nutrient-only choices, without invented biological evidence. |
| Missing-data and target semantics | Daily targets, minima and explicit limits differ. Per-nutrient partial intake produces provisional comparisons; partial sums cannot certify that a daily limit is satisfied. Athlete energy is a target, not a clinical maximum. |
| GEN-03 / GEN-06 | Common MTHFR calls retain educational context but no longer independently boost food or recipe rank. No genotype-only deficiency or methylfolate requirement. |
| MICRO-03 / MICRO-04 / BIO-04 | Python outputs are restricted to reported abundances and descriptive diversity, with no invented personal effects, gene activity, doses or cohort references. Historical unsupported effect payloads are withheld without deleting source history. Unsupported prototype food-log metabolite/health-score endpoints are retired with HTTP410 and supported alternatives. The old Health insights URL leads to the sourced Diet coach. |

The existing feature branch already has authenticated profile changes, scoped precision/product/experience records, explicit microbiome score-versus-abundance distinctions, manual JSON import, unknown-date handling and relevant regression coverage. The old handoff's 'unauthenticated profile' and 'JSON not submitted' findings must not be reapplied blindly.

## Remaining launch requirements

This is an improvement to the existing application, **not** completion of all 67 requirements or an ASVS certification. Keep the following in the launch backlog:

- Independent penetration testing; systematic authorization matrix and tenant/RLS strategy; broader static/dynamic/fuzz testing and incident/restore exercises.
- Private ML hosting/firewall verification and matching production service tokens when that optional service is enabled. Absent credentials intentionally disable remote analysis and raw uploads; structured JSON/CSV/paste and local food analysis remain available.
- Upload quarantine/malware scanning and resource-isolated parsing before activating raw-sequence processing. The sequencing-to-abundance pipeline remains unimplemented.
- Encryption/retention/deletion coverage for legacy journal/report/original-file data; key management and original-file lifecycle. Precision/workspace encryption is not proof of encryption for every legacy column.
- Full domain-specific consent history, sensitive-locus controls, complete user data portability/erasure, privacy/intended-use review and operational release signoff.
- Wider reviewed biological coverage, systematic competing-evidence review and independent scientific validation. Generic food composition coverage does not imply reviewed personal genetic or microbial response for all foods.
- Supplement interaction/dose screening and clinical validation. Logging a label does not authorize a supplement recommendation.
- Future Athlete entitlement enforcement and billing remain deferred by product-owner direction. Mode is a preference, not subscription proof.

The three-primary-screen design (Today / Explore / Progress) follows the owner's later explicit direction; Food logging remains directly accessible. This intentionally differs from the handoff's proposed four-screen navigation. Existing API routes remain compatible where safe rather than renaming every endpoint to the proposed `/api/v1` contract.

## Dependency review

Compatible updates were applied without `npm audit fix --force`, including Express 4.22.3, Multer 2.4.0, proxy-addr 2.0.8, form-data 4.0.6, ws 8.22.0 and express-session 1.19.0. Drizzle ORM was upgraded to 0.45.4 and checked with the existing PostgreSQL/PGlite storage and registry tests; schema and driver choices were retained. Build-only animation plugins are now correctly declared as development dependencies.

At this review, `npm audit --omit=dev` reports **0 known advisories**. The full build/development graph still reports **13 affected packages: 6 high and 7 moderate**. These include the Tailwind 3 globbing chain through braces, chokidar, micromatch and fast-glob; Vite development-server issues; and older esbuild/PostCSS selector-parser dependencies. The [braces stack-exhaustion advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) lists no patched version, so a nonexistent compatible override was not used. The [Vite Windows development-server advisory](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) and [PostCSS selector-parser advisory](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) remain tracked build-tool risks. Repository-controlled globs/CSS are used; user meal text is not a build pattern. Keep development servers private. Production enables static serving rather than Vite middleware, but the current build installs development packages and imports Vite utilities: production dependency classification is not a claim that vulnerable tooling is absent from the deployed image or that every possible exploit is excluded. A separately tested Vite/build-tool upgrade and production artifact isolation remain follow-up work.

## Validation and operations

Run `npm run check`, `npm test`, `npm run build`, Python tests and the isolated schema-only Neon production-app smoke check. Verify real browser food-source handoff, camera fallback, responsive layouts and both modes. Production/session/ML secret values must never enter logs or this document. No production personal data is copied into tests. Review dependency advisories separately from test success; passing tests is not a security certification.
