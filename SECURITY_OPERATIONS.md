# Security controls and open operational requirements — 18 October 2026

This is an implementation inventory and operating procedure, not an independent security assessment or signed risk acceptance. Baseline: enhance/bloom-experience at 550d549a31e513cb8a7556dd7e44aec2aa1cd800. Future requirements pass through the Chief Architect & Integration Lead.

## Request policy and shared budgets

Cookie-authenticated API mutations (including login/logout/signup) require an exact Origin match. Without Origin, only `Sec-Fetch-Site: same-origin` is accepted. Cross-site and sibling-site metadata are denied even with a supplied Origin. The application never substitutes forwarded-host values for Host. Render uses one trusted proxy hop. Optional `APP_ORIGIN` pins the externally visible scheme/host/port; configure the exact origin without a trailing slash. Browser fetch and multipart uploads supply Origin normally. Non-browser mutation clients must supply the expected Origin; cookie possession does not bypass this policy. CORS is not an authorization mechanism.

All replicas use the PostgreSQL request_budgets table, an atomic upsert and database time. Authentication is limited to 60 attempts/source and 20/account per 15 minutes; resource actions to 120/source and 30/account per minute. Covered paths include upload/import, analysis, recipe/coach/planning/photo/transcription and exports. The source budget is checked first. Account and address keys are HMAC-SHA256 digests with the shared session secret; raw identities are not retained. Accounts share the login/signup budget to avoid alternate-route bypass. Local auth/resource guards remain additional controls. A shared-database failure returns 503, never a weaker per-instance fallback. Limits expire; denied requests do not extend windows. Bounded cleanup removes expired rows each minute; active identities keep one row per budget. Quantitative legitimate-user false-positive testing remains open.

Migration 0006 is additive and idempotent. Startup also ensures this table/index, matching the existing session-store startup pattern. CI tests schema creation and concurrent limiter objects with embedded PostgreSQL; production-app CI exercises the real PostgreSQL transport. Do not replace this with process memory when adding replicas. Rollback can retain the unused table.

## Upload/service boundary

Only JSON/CSV reports enter the Express importer. Multipart content is bounded to 2 MiB, one file, four small fields and five parts, held in bounded memory rather than staged on disk. UTF-8 decoding is strict; actual JSON/CSV structure and report schema must pass. JSON has depth/node limits; CSV has a 1,000-taxon row bound. Compressed formats are not accepted or decompressed. Malformed, oversized and raw-sequence inputs are rejected. This reduces the active attack surface; it is not malware quarantine or resource-isolated raw processing. Aggregate concurrent-upload memory/CPU testing is outstanding.

The Python upload path is disabled in authenticated middleware before multipart parsing; no raw-file processor is activated. Analysis refuses server paths and only handles structured reported percentages. Express sends only the required taxa/percentages and nonidentifying processing placeholders, not account identifiers, notes or whole report content. Bearer authentication remains mandatory. Private-network placement/token rotation verification is still an operational release requirement. Historical raw-file paths are withheld from sample APIs but are not erased from storage by this change.

## Encryption/key rotation

Legacy version-1 records remain readable using PRECISION_DATA_KEY. No existing key is changed in this release. To prepare rotation, put base64 32-byte keys in the hosting secret store as a JSON map in PRECISION_DATA_KEYRING and select a safe identifier using PRECISION_ACTIVE_KEY_ID. Version-2 envelopes record the identifier and bind version, key ID and user ID in GCM AAD. Missing, wrong, malformed or tampered keys/envelopes fail closed. Never commit or print either configuration.

Rotation procedure: verify a protected backup and restore in isolation; provision old/new keys through a managed secret store; stage the ring and active ID together; test legacy and new reads; re-encrypt records in an independently reviewed, resumable transaction/batch migration; verify counts and decryption after restore; retain prior keys until old ciphertext and protected backups expire. This pass supplies format support and tests, not the production re-encryption job, managed KMS deployment, actual key rotation or backup drill.

## Restricted-data/storage inventory

| Store/location | Data | Current application protection | Export/delete coverage and gap |
| --- | --- | --- | --- |
| users | Login hash, profile, preferences | bcrypt password; other fields not application-encrypted; authenticated profile routes | Complete account lifecycle unfinished |
| session | Login identity/session state | Secret-signed secure/HttpOnly/SameSite cookies, PostgreSQL store, regenerated IDs | Logout revokes session; full account deletion unfinished |
| meals | Food text, totals, ingredients, symptoms/context | Account route/storage checks; legacy columns not application-encrypted | Individual meal deletion exists; all-account export/delete unfinished |
| microbiome_samples, bacterial_composition | Original report JSON, taxa, metadata, optional historical raw path | Ownership guards; raw paths withheld at API; legacy fields not application-encrypted | Full erasure/original retention unfinished |
| ml_analyses, metabolites, health_impacts, recommendations | Derived/historical outputs | Owner check through sample; unsupported outputs withheld | Retention and deletion inventory unfinished |
| precision_profiles, precision_records | Genetics, labs, health context, plans/check-ins | User-bound AES-256-GCM; account-specific queries | Precision export/clear exists; backups/vendor coverage unverified |
| nutrition_products | Private labels/barcodes | User-bound encrypted payload | Full account lifecycle unverified |
| experience_settings, experience_records | Training, recovery, saved meals, experiments, supplements | User-bound encrypted payload; account-specific queries | Experience export/clear exists; backup retention open |
| biology_* and public reference tables | Curated public research and food composition | Version fingerprint; no personal records intended | Reference-data lifecycle only |
| request_budgets | HMAC identity digest, count, expiry | No health payload/raw identity; bounded expiry cleanup | Short-lived abuse metadata, not included in user export |
| Express upload memory | Report bytes during request | Bounded format/structure; no new disk originals | Request-lifetime only; concurrent-load validation outstanding |
| AI provider | Consented images, minimized recipe/coach context | Structured prompts, store:false, request-specific image consent | Vendor terms/residency/retention and consent revision history require review |
| Optional ML host, legacy files, logs, backups | Historical originals and derived records | Token auth and sanitized application logs | Hosting encryption, firewall, backup retention/restore not independently verified |

Database-provider encryption and TLS are infrastructure controls; they do not replace column/application encryption or prove all environments are correctly configured. No production personal data is copied to tests.

## Authorization/release evidence matrix

| Boundary | Automated evidence | Remaining gap |
| --- | --- | --- |
| Authentication/session rotation/logout | security.test.ts, built-app Neon smoke | Independent reverse-proxy/session security audit |
| Precision read/write/export/delete/plan | precision-storage.test.ts, precision-nutrition.test.ts, weekly-planner.test.ts | Full endpoint/job matrix and operational async audit |
| Experience read/write/export/delete | experience-api.test.ts, experience-storage.test.ts | Complete account retention/consent coverage |
| Catalog/product/source logging | catalogue-selection.test.ts, products.test.ts, food-intelligence-routes.test.ts | Full fuzz and concurrency audit |
| Microbiome | structured-report.test.ts, analysis-boundary.test.ts, specialist-security.test.ts | End-to-end all-route two-account audit still incomplete |
| ML boundary | test_service_auth.py, test_analysis_evidence.py, test_analysis_guard.py, ml-service.test.ts | Deployed private-network and token rotation checks |
| Shared budgets/origin/upload/key envelopes | specialist-security.test.ts | Independent load/false-positive and penetration tests |

Application tests cover portions of ASVS authentication, session, access-control, validation, cryptography, communications and logging concerns. A numbered ASVS 5.0 mapping, independent penetration test, incident exercise, complete backup restore and signed risk register are outstanding; this document is not ASVS compliance.
