# Bloom — Private Data High-Assurance + MyFoodData: Chief Architect Implementation Decision

**Owner requests:** Review and IMPLEMENT the exact `INT-PRIV-SEC-20261118-R2` and `PARITY-2701..2712` handoffs, November 18, 2026. **Disposition:** accepted implementation contracts **in phased, gated slices**, with security and licensing release limits. **Codex is the sole engineer**; one execution queue in `NEXT_ACTIONS.md`. This decision reconciles and takes precedence over conflicting *sequencing* language in the original proposals; do not claim their proposed full feature coverage is already built.

**Preserved authoritative original texts (read in full, not just this summary):**
- [Private Data — High-Assurance Security & iOS Architecture Addendum (R2)](../agent-handoffs/Bloom_Private_Data_High_Assurance_Security_iOS_Architecture_Addendum_2026-11-18.md). R2 overrides R1 **security refinements** only.
- [Private Data — User-Owned Database/Security Architecture Blueprint (R1)](../agent-handoffs/Bloom_Private_Data_BYODB_Security_Architecture_Handoff_2026-11-18.md). R1 portability/gateway/export contracts remain applicable.
- [MyFoodData — Data Parity, Advanced Nutrition and Biological Advantage](../agent-handoffs/Bloom_ML_MyFoodData_Data_Parity_Advanced_Nutrition_Biological_Advantage_Handoff_2026-11-18.md).

## 0. Decisions and evidence status

**Do:** Implement real source-backed nutrition usability and rigorous privacy architecture without derailing P1 dynamic biological investigation and P2 persistent science. **Do not:** build a second food/nutrient/graph/AI stack; scrape or copy proprietary MyFoodData; switch global cloud DB dynamically; expose a private health mode; promise E2EE/Signal-equivalent/privacy against a compromised OS; construct an unsigned self-designed crypto/update protocol; trigger customer hosting spend; ship native app prematurely; mark the historical v0.6 RC complete.

**Sequence:** (A) short immediate read-only security/food inventory and fix any real P0 privacy/data-integrity defects; (B) existing **P1 investigator** and **P2 persistent science** maintain development precedence; (C) a carefully bounded **S0/S1 private-data protocol + synthetic local/gateway spike** and **F0/F1/F2 core food/source parity** can reuse the same scientific contracts; (D) advanced chemistry, full recipe engine, user-facing deployment, iOS and S3 E2EE are explicitly separate gated later slices. No multiple concurrent Codex tasks; one existing queue. Owner does not need to re-approve routine engineering. Independent Security, Privacy/Legal, scientific rights and cost *activation* remain required.

**Verified against current GitHub branch, November 18/19 (source inspection only; not runtime acceptance):**
- `server/db.ts` blob `85f294ab`: globally initialized Neon environment-derived `pool/db`. **Never change its singleton dynamically for individual accounts;** gateway must be a separate configured process behind a typed adapter.
- `shared/schema.ts` blob `93728740`: private fields use encrypted JSON in `precision_profiles`, `precision_records`, `nutrition_products`, `experience_records`; `meals` and other tables have their own scopes. Existing encryption at rest for some records is **server-key**, not E2EE.
- `server/precision-crypto.ts` blob `642f6029`: Node AES-GCM encrypt/decrypt with server-held precision keys; read actual AAD/version/key rotation before making claims; reuse for existing Cloud path, never equate with user-held client encryption.
- `server/security.ts` blob `37e4efc1`: same-origin writes, session secret, safe request logging, security headers; **not sufficient** by itself for gateway device authentication, iOS vault or client-only E2EE.
- `server/routes.ts` blob `2e7b6500`: existing account-guarded route assembly; new gateway MUST NOT blindly mount all admin/preview routes.
- `shared/nutrient-source-snapshot.ts` blob `ff448a89`: immutable `nutrient-source-snapshot-v1`, **generic-usda-composition only**, `values.max(21)`, `captureNutrientSource`. Extend via **new compatible version and consumers**, not a destructive cast or global overwrite of v1 historical records.
- `shared/nutrient-definitions.ts` blob `decfb4b3` and `shared/meal-intelligence.ts` blob `2bb7b18a`: canonical nutrient definitions, source-qualification, recipe and ingredient data. Do not build a second registry/recipe runtime.
- `server/food-catalog.ts` blob `80db5d59`: versioned compact FNDDS data, source-aware `lookupCatalogueNutrition` and household portions; don't overwrite this with brand/generic name heuristic.
- `shared/nutrition-summary.ts` blob `f1b06758` and `server/nutrition-history.ts` blob `f979091c`: existing meal-day and period aggregation, but **not verified** full food + confirmed supplement actual totals/coverage.
- `server/nutrition-targets.ts` blob `c9d09987`: nutrient target reference path; distinguish RDA/EAR/AI/UL and private user target.
- `server/spend-ledger.ts` blob `55100af5`: atomic spend control for provider work; no automatic private-data transfer.
- `client/src/App.tsx` blob `37d2047f`: existing React UI, with no verified native SwiftUI app. All platform-specific code paths and tools are `TO_VERIFY_AT_HEAD`.

**Before writing code:** inspect current branch HEAD and relevant routes/components/tests, document source/line/test evidence for `FOUND / PARTIAL / MISSING / UNVERIFIED / RIGHTS_PENDING`. Blob IDs above are audit starting points, **not fixed current HEAD**. Run focused check/test; do not claim independent mobile/security audit from mock code.

## 1. SECURITY — exact threat and trust contracts

### PRIV-S0 — adversarial data-flow / trust-tier specification, immediate

Add concise threat model, network egress/ingress and trust matrix for:
- `bloom_cloud` (S0, existing managed server with authorized server-side plaintext processing);
- `local_private` (S1, authenticated encrypted vault on device and **no personal-data transfer to Bloom by default**, but unlocked device/OS/backup/JS attacks remain);
- `customer_gateway` (S2, separate user-controlled HTTPS gateway to own database; host and customer provider **can see plaintext** unless additional E2EE);
- `client_e2ee` (S3 future separate reviewed option; server stores ciphertext but **cannot perform plaintext personal investigations without local compute or explicit scoped decrypting worker**, narrowing any zero-knowledge claim).

For each, list protected/unprotected fields and metadata, who holds decryption keys, inbound/outbound URLs, roles, backups/snapshots, recovery responsibility, logs, support/admin, iCloud, update chain, AI provider opt-ins, independent security reviewer and release gate. STRIDE/LINDDUN threats: IDOR, CSRF, XSS, malicious updates, BYODB SSRF, gateway hijack, OS compromise, credential leakage, signing-key theft, stale jobs, revoked device replay, traffic metadata, model prompt injection and provider outage. Document residual risks with **reproducible** test. No security claims above tested tier.

### PRIV-S1 — single typed runtime/storage contract, no active route switching

Define platform-neutral `DataExecutionTransport` and `PrivateDataStore` typed contracts in shared modules (names flexible) for: read/write immutable source records, explicit correction/retraction, source and consent epochs, account-scoped read projection, deterministic nutrition calculation, verified public science package access, export/import and health/status. Require version, source owner, stable opaque ID, record type, time zone, unit, data provenance and policy revision. Use adapter injection **at process/client composition**, not mutable `server/db.ts` global, per-request DB URLs or importing database credentials to browser/iOS. Cloud adapter must retain existing behavior byte-for-byte for ordinary users; flag `private-data-architecture-prototype` default OFF, unavailable to consumer navigation. Verify no new private network/DB access in disabled mode.

Suggested files/locations (verify at HEAD): new `shared/private-data-contracts.ts`, `server/private-gateway/` isolated composition (no cloud `routes.ts` copying), `client/src/lib/private-data/` capability-gated adapter, and `tests/private-data-*.test.ts`. Reuse `shared/schema.ts` domain facts and typed source/consent contracts.

### PRIV-S2 — synthetic local-only proof, **not a marketing-ready vault**

First implement platform-neutral memory/synthetic fixtures and a local encrypted proof using **reviewed** platform primitives with explicit algorithm/key lifecycle and known-answer/AEAD tamper tests. For web prototype, document origin-XSS and browser extension risk; no Secure Enclave claims. For iOS Swift prototype later: SwiftUI + CryptoKit/Keychain + Secure Enclave **P-256 wrapping or properly Keychain-protected secret**, not generic AES key inside Enclave; file protection, lock-state, backup exclusion, device-specific policy and audited recovery design. Use AES-256-GCM unique nonces/AAD binding owner, purpose, record id, version (or independently reviewed alternatives); versioned envelope, authenticated export, durable re-import and key loss failure cases. No reversible secret in QR, backend logs, compiled JS, cloud analytics or signed science. Synthetic lab, food and genotype only. Assert **zero protected content** in network/log/export outside encrypted payloads. Full local mode and iOS release are *not* authorized by a TS crypto unit test.

### PRIV-S3 — isolated customer-controlled gateway proof, synthetic only

Add independently deployable HTTPS gateway template **only with synthetic fixture**, least-privilege runtime PostgreSQL role, separate migration identity, user-controlled `DATABASE_URL` and keys in **their server secrets**, strict authentication/device scopes, rate/size/timeout caps, origin/redirect/SSRF hardening and short replay-bound request IDs. Never register cloud account DB mappings in the central service; no central proxying to arbitrary customer hostnames. Dedicated stable API, no exposed SQL/Python/raw DB sockets; Render direct iPhone HTTPS requires **public web service with strong authentication** OR user-operated VPN/mesh, NOT Render internal private service. Validate TLS/certificate, one record write/read, correction and export, database role refuses DDL/unrelated schemas, gateway offline and wrong host/cert fail closed. No new user service, Neon project or bills created without explicit owner consent; a local isolated synthetic database/gateway qualifies until user authorizes hosted provisioning. Design accessible recovery and billing/cost notice.

### PRIV-S4 — authenticated signed science/update interface

Share P2 reviewed scientific release format; use trusted **TUF**-style root/targets/snapshot/timestamp with expiring roles, version monotonicity, payload size/SHA, rights manifest, compatible schema, rollback/freeze/withdrawal protections, independent key custody and optional threshold signatures. **Do not invent a one-signature = full security system**; first build a fixture verifier/attacker-test surface and document missing operational key ceremony and independent review. Never execute downloaded JS/native scripts. Signed package distribution carries only nonpersonal reviewed evidence to clients; no personal queries. Missing/stale safety revocation policy -> explicit unavailable/abstain, never revive withdrawn claim by rollback. Reuse P2 scientific export/source graph, no parallel claim release engine.

### PRIV-S5 — future iOS + S3 gates, NOT part of first prototype's release

Native SwiftUI implements `LocalEncryptedStore`, `PrivateGatewayClient`, `SciencePackageVerifier` and deterministic parity with TS. Gate physical iPhone tests of Keychain/Enclave/locked file protection, traffic capture, iCloud/backup, crash/previews and device migration. Pairing uses authenticated ECDH/HKDF with gateway origin + purpose + expiry + roster + code binding, not QR secrets; lost/revoked device cannot access **new** protected data, but cannot be forced to forget plaintext already downloaded. User-controlled recovery kit must work on fresh hardware; total key loss may be irreversible. App Attest is a risk signal not authentication itself. S3 needs independent protocol, mobile, server and crypto audit before enabling. No S3 promise, BYODB/public enrollment or live private health migration until Security/Privacy/Legal and provider-cost gates.

### Security acceptance receipts — negative cases mandatory

`SEC-01` mode flag OFF preserves existing Cloud Food/Response/export and no changed cloud DB selection; `SEC-02` iOS/local network private content nonleakage; `SEC-03` ciphertext inspection, AEAD tamper/AAD mismatch and nonce uniqueness; `SEC-04` restore with recovery then key loss; `SEC-05` user gateway runtime role denied DDL and cross-account reads; `SEC-06` device credential replay, revoked pair and manipulated origin/certificate denied; `SEC-07` central URL scanner/logging/telemetry no creds, URLs, private genetic/lab/meal data; `SEC-08` no personal Google/OpenAI calls without provider-specific purpose grant; `SEC-09` malicious signed-package hash/sig/version/expiry/rollback/withdrawal fail; `SEC-10` source/consent revoked during delayed compute fails closed; `SEC-11` encrypted backup/export/corrected source parity and confirmed irreversible steps; `SEC-12` Cloud/PWA/client contract cross-platform tests, 320/390 screen, accessibility, key/backup status; `SEC-13` independent review status **NOT_DONE** unless actual third-party receipts. No real health accounts in prototype. Mark mock simulated networking vs real intercepted-device network separately.

## 2. NUTRITION — MyFoodData capability parity without MyFoodData appropriation

### FOOD-F0 — audited source and product truth inventory (immediate)

Start with read-only mapping of `shared/nutrient-definitions.ts`, `shared/meal-intelligence.ts`, `shared/nutrient-source-snapshot.ts`, `shared/nutrition-summary.ts`, `server/food-catalog.ts`, daily Food routes, confirmed supplement records and Food/Meal Review UI. Record exact known *source-native* nutrient count by data type, mapped vs unmapped USDA/CNF nutrient identifiers, historical snapshot versions, food/portion identities, labels, source-coverage, barcode behaviour, saved recipe/reuse, day-zone totals, API fallback, actual local/hosted receipts. Do not equate 21 snapshot values with all possible nutrient entities or accept handoff's expected catalogue size as current truth. Source identity must include FDC type+ID+edition or Canadian CNF native ID/release and human-reviewed matching rights. Inventory `FOUND / VERIFIED / PARTIAL / UNKNOWN / ABSENT / RIGHTS_PENDING`. Record measure/gram basis, raw/cooked, market, manufacturer/product revision, input confidence and known vs missing. Never claim 150+ nutrients in Bloom without measured actual coverage.

### FOOD-F1 — narrow **real tracking correctness** near existing P0

Use existing canonical catalogue, confirmed meal/label/receipt and supplementation paths. Verify/fix: true confirmed meal+snack+beverage+**taken supplement** day totals; planned/unsaved recommendations and scheduled-but-untaken supplements contribute zero; deleted/edited/idempotent retries not double counted; local day/time-zone boundaries, original source revisions, missing-value counts, partial day known subtotals, zero vs unknown, nutrient form/unit compatibility, no inferred calcium/iron/choline/AA from generic labels. Preserve original user facts and enforce ownership. Verify sources: corrected item doesn't silently rewrite historical eaten snapshots. Use existing outputs and UI, avoid a second totals engine; disclosure only at decision-relevant point. Existing `mealNutritionSummary` / `recordedNutritionPeriod` coverage should be read and tested before changes.

### FOOD-F2 — bounded food search, exact barcode and fast log

Reuse USDA FNDDS versioned server catalogue and existing barcode/OCR/product integrations. Normalize GTIN/UPC with check-digit and leading-zero/market rules; never treat a generic food as exact branded GTIN hit; label `verified identity / plausible candidate / no-authoritative-match`; favor Canadian bilingual spelling, generic raw/cooked distinction, selection by actual reviewed source rather than name-only. For unmatched Canadian SKU, provide **prefilled only-verified-fields private label/manual fallback**. Offline/outage = saved/recent/manual, no fabricated API search; AI optional and explicit. User picks food, gram/portion, meal and date; saves idempotently; direct accurate totals refresh. A saved recipe/meal is **draft**, not consumed. Test at least 50 distinct Canadian/search/GTIN fixture cases with documented denominator, include 000-prefix, same-name different FDC, duplicate GTIN, wrong check digit, label reformulation, product unknown, network unavailable. Source rights and no false exact hit are non-negotiable.

### FOOD-F3 — compatible source-native nutrient expansion, **after P1/P2 unless required by actual research**

Add v2 extension/reader for `NutrientSourceSnapshot` rather than widening v1 `.max(21)` and labeling v1 analytical. Define `NutrientFact` with canonical ID + original source nutrient ID, release/edition, source+market, reported/analytical/calculated/estimated/unknown, per100g/per serving basis, value/status, original and normalized unit, original declared zero vs unreported, chemical form, uncertainty/revision/scope, parent-child semantics. Backward-compatibility migration/parser: v1 unchanged and readable; v2 verified sampled; source-specific source mapping and stable numeric conversion; large broad data held server-side, not shipped to browsers. Pin rights-reviewed USDA Foundation, SR Legacy, FNDDS, branded, and **actual** Health Canada CNF 2026 relational dataset in independently verified bounded snapshots with checksum/manifest. CNF 2015 API is not CNF 2026 data; don't claim it is. OFF remains disabled until ODbL/image rights review. Third-party MyFoodData API/database absent licence; never scrape/rehost/clone proprietary service. Food type counts and nutritional coverage are measured not marketing estimates.

### FOOD-F4 — advanced nutrition chemistry and recipe reuse, deferred until meaningful science dependency

- Individual amino acids (leucine, lysine, tryptophan etc.) only where source contains true AA values; compute essential/BCAA totals only with component coverage. `protein_g` is **not** a leucine measurement.
- Individual fatty acids (ALA/EPA/DHA/LA/AA, etc.) separate from fat totals and aggregate unsaturated parents; no double-count across total-fat/sat/mono/poly constituent tree; unknown species stay unknown. Test fish nutrient data if useful as chemistry fixture, but no seafood meal suggestions are required.
- Recipe source/revision, raw edible input mass, added oil/salt, measured cooked batch yield, serving/plated grams and validated per-food nutrient retention (unknown retention -> do not invent). Save/reuse draft ≠ consumed; consumed receipt pins recipe revision and grams forever. Compare foods/recipes on same gram, energy or serving basis with user-selected target and tradeoffs; UL never becomes a goal.
- Optional estimated-branded-food composition strictly **research-only**: constrain candidate ingredient mixture to actual declared macros, preserve label fields, benchmark on held-out chemically measured foods, report per-nutrient error/calibration/abstention and extreme fortification/indistinguishable-macros negatives. Never upgrade model estimate to a measured nutrient or make deficiency/excess/medical advice from it.

### FOOD-F5 — join nutrition with core intelligence, not a second AI

Use P1 private dynamic investigator + P2 verified shared evidence to ask meaningful questions based on actual source-qualified consumption, labs, source dates, microbiome limitations and goals; novel competing explanations, separate contrary/null findings; one genuinely useful supported choice, or abstain. Static programmed per-marker nutrient advice is not strategy. Exact food totals remain deterministic. Defer comprehensive Food #12 planner to after scientific proof; keep already working logging, search and portions.

### Food acceptance matrix

`FOOD-01` source-native count/report with each source's licence and real coverage; `FOOD-02` 50+ distinct Canadian/GTIN precision fixtures and no false exact matches; `FOOD-03` two consumed meals + drink + taken supplement, excludes planned supplement/meal; `FOOD-04` edits/deletion/idempotent repeats/source revisions; `FOOD-05` known zero vs absent choline/leucine, mixed forms, partial totals; `FOOD-06` source identity raw/cooked/market/brand and per-100g/serving conversion; `FOOD-07` v1 snapshot read unchanged across any v2 migration; `FOOD-08` amino/fatty totals parent-child no double-count; `FOOD-09` cooked recipe yield and historical immutable replay; `FOOD-10` estimator hallucinated fortification abstains; `FOOD-11` no-AI/offline manual food logging and direct day updates; `FOOD-12` two-account/private label isolation and source revoked mid-request; `FOOD-13` one meaningful hypothesis-driven nutrition suggestion vs current baseline, false DOI/429 fallback; `FOOD-14` 320/390px, 200%/keyboard/real camera/device only where actually tested. Preserve old tests; do not fake hosted or real-person receipts.

## 3. Cross-workstream reuse and implementation order

| Time/queue | Required proof | Status |
|---|---|---|
| Immediate narrow P0 | Security trust/egress threat inventory + Food source/receipt audit + stop-the-line critical privacy/identity/numeric fixes only | **To implement** |
| Existing P1 | Novel hypothesis test from private canonical data, source-reviewed evidence or honest abstention | **Current top science priority** |
| Existing P2 | Gemini candidate → independent reviewed source → immutable scientific package, two clean restores, revocation survives rollback | **Current second science priority** |
| First shared foundation after P2 | Private-data transport v1 + synthetic local encrypted source/restore + synthetic separate gateway proof; Food actual confirmed totals + verified barcodes/search | **Approved bounded prototype** |
| Future elective expansion | Source-native AA/fatty acids, full recipe yields, custom targets, licensed bounded dataset increases | **Defer unless needed by new P1 hypothesis** |
| Separate release/security gates | Production BYODB, local vault for real health data, physical SwiftUI, passkey/pairing, backup and S3 E2EE | **NOT AUTHORIZED FOR RELEASE** |

**Architect review decisions:** Security R2 is not a demand to replace current cloud or turn all Cloud traffic into E2EE; implement optional portable design and synthetic demonstrator only. MyFoodData handoff is a capability-comparison blueprint, not a licensed data feed nor a reason to reset science-first priority to broad tracking parity. Do not call a candidate `approved` because a schema passed; independently source/review and check rights. Source-specific critical blockers constrain only that feature. Render service and Neon database for ordinary Cloud **must not be modified** for private gateway testing; create no billable resource without owner consent.

## 4. Codex implementation process & exact reporting

Codex: read three originals, this decision, `AGENTS.md`, `NEXT_ACTIONS.md`, the two existing science architecture decisions. At **current HEAD** produce two compact matrices with file:line, present/partial/missing, version, authority, affected consumer and test. Address urgent unsafe behavior via narrow change; otherwise implement in the above one queue. Commit focused tests then code with exact-SHA receipts. No needless large dashboard/UI redesign.

Each completed vertical slice must report:
1. scope and files updated, actual branch head and base; what preexisting behavior was preserved;
2. `SPECIFIED / IMPLEMENTED / LOCAL_TEST_PASS / HOSTED_TEST_PASS / INDEPENDENT_SECURITY_REVIEW / PRIVACY_LEGAL_AUTHORIZED / PHYSICAL_IOS_VERIFIED / CONSUMER_ACTIVATED` (independently; never infer one from another);
3. data-source licence/availability and true per-source nutrient coverage; exact FDC/CNF keys and source vintage;
4. synthetic account isolation and adversarial negative tests, meaningful source arithmetic and backward compatibility;
5. provider requests/cost actually incurred vs reserved estimates, no unapproved external health transfer;
6. unresolved independent crypto/mobile audit, platform trust/cost and optional feature gates; the next eligible P0/P1/P2 action.

**Exit:** Codex may close a bounded synthetic protocol/food tracking slice with proof, but cannot mark private security modes, complete MyFoodData parity, independent audits, S3 E2EE or broad native iOS production as shipped without their separate receipts and approvals.
