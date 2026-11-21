# SEC-0 / FOOD-0 — current source and trust inventory

Source base: `cbc90d130f543943a759b58f0bd91d1ddad09272` (development branch).
This closes the bounded **read-only inventory**, not independent security,
model validity, private-mode release or full nutrition-parity acceptance.
No production records, credentials, private device identifiers or individual
experiment results were inspected. No networking, hosting or deployment changed.

Authority: `BLOOM_PRIVATE_DATA_AND_MYFOODDATA_ARCHITECT_IMPLEMENTATION_DECISION_20261118.md`
and its three preserved R1/R2/PARITY originals, read for this inventory. Their
specialist priority labels do not replace the single science-first queue.

Statuses: VERIFIED = inspected code plus scoped synthetic software evidence;
FOUND = source exists; PARTIAL = limited implemented scope; MISSING = absent
from inspected implementation; UNVERIFIED = needs actual operational evidence;
RIGHTS_PENDING = no new ingestion/reuse clearance established here.

## Security/trust matrix

| Surface | Status and exact source | Trust / protected and unprotected data | Evidence / remaining gate |
|---|---|---|---|
| Existing cloud database | FOUND — `server/db.ts:13` | One environment-derived server pool. Never mutate it per account or accept browser DB credentials. Runtime/provider administrators are trusted. | Source inspection only; no hosted role/KMS/region/backups queried. |
| Precision/genetic/lab records, context, private labels and experience payloads | VERIFIED scoped — `shared/schema.ts:308`, `server/precision-crypto.ts:17` | AES-256-GCM server-held keys; random12-byte nonce; legacy/account AAD and v2 key-id/account AAD. Metadata IDs/kinds/timestamps remain visible. This is not client E2EE. | Existing encryption/tamper/account tests in1002-test pass. Current AAD does not bind record ID/type/purpose; optional portable-vault design must not inherit stronger claims. No bulk Cloud retrofit performed. |
| Meals and microbiome tables | FOUND — `shared/schema.ts:74`, `shared/schema.ts:280` | Meal text/analysis and microbiome structured JSON/notes are ordinary schema fields, not covered by the precision payload envelope. DB/provider protection is a separate layer, unverified here. | Owned source readers/deletion tested. Do not claim all health fields are application-encrypted or zero knowledge. |
| Authentication and requests | VERIFIED scoped — `server/auth-routes.ts:15`, `server/security.ts:42`, `server/security.ts:58` | bcrypt password hashes; same-origin state-changing requests; no-store API responses. Request logs use route templates/status/duration, not concrete paths/query/body. Sessions and server key holders remain trusted. | Account/CSRF/IDOR/security fixtures pass. This does not prove host telemetry, browser extensions or operational log retention safe. |
| Export and erasure | VERIFIED scoped — `server/account-export.ts:15`, `server/account-routes.ts:5`, `server/account-erasure.ts:10` | Existing account export decrypts owned records into a bounded JSON download; it is **not an encrypted recovery bundle**. Erasure transaction removes active application records; backups/logs/provider copies expressly outside its promise. | Account isolation, delayed download/account change and transactional rollback tests pass. Actual encrypted backup/restore and retention operations UNVERIFIED. |
| Private investigation | VERIFIED scoped — `server/biological-investigation-snapshot.ts:24`, `server/private-investigation-runner.ts:22` | Canonical purpose-authorized owned facts, explicit genetic/microbiome inclusion, current-source recollection and monotonic deadline. No external transfer permission. | Actual encrypted SQL source revocation/deletion and two-account fixture pass. No qualified private inference runtime installed or clinical inference approved. |
| AI egress | PARTIAL — `server/metered-ai.ts:42`, `server/scientific-question-boundary.ts:8`, `server/gemini-science-research.ts:1` | Existing executor checks consent/authorization, bounds, ledger/circuit; public research task adapter remains candidate-only. Schema acceptance is not permission for private provider transfer. | Synthetic outage/spend/source tests pass. No live call, key inspection or provider activation in this audit. Provider-specific real personal-data authority remains separate. |
| Scientific packages | PARTIAL — `server/scientific-release.ts`, `server/scientific-release-storage.ts` | Exact reviewed digests and durable withdrawal govern source-only metadata/releases. Two clean databases exercise restore/retraction. | Implemented integrity/authority checks are **not TUF signatures**, production distribution, independent source truth or model training permission. Proposed migrations not applied live. |
| S1 local private vault | MISSING as consumer mode | Current local MICOM CLI stores private files outside Git; that is not a general encrypted client health vault. PWA unlocked JS/extension/OS risk remains. | No local-mode network capture, authenticated encrypted account restore or physical-device privacy acceptance. |
| S2 customer gateway | MISSING as installed product | No account-specific DB URL routing or customer gateway enrolled. Separate configured composition would be required; no central arbitrary-host proxy. | Prototype contract remains approved but no new listeners/host infrastructure created. Mac remote integration PAUSED. |
| S3 client E2EE / native iOS | MISSING / independent review NOT_DONE | No claim of Secure Enclave, device-only master keys, pairing/recovery or ciphertext-only server computation. | Crypto/mobile/server/security/privacy review and physical hardware gates remain separate. |

### Threats and residual risks

| Threat (STRIDE/LINDDUN) | Current protection / reproducible evidence | Residual limitation / required next proof |
|---|---|---|
| IDOR, stale account, revoked source replay | Owned SQL predicates, actor checks, stable source/consent epochs; full account/source tests and new SQL collector integration | A compromised trusted server can still read authorized plaintext. New adapters must preserve these boundaries. |
| CSRF, session theft, origin XSS | Same-origin writes, active sessions and no-store; security/account browser fixtures | No assurance against compromised origin, extension, unlocked OS, clipboard or screen capture. No private vault enabled. |
| Credentials in URLs/logs / SSRF | Route-template logging; no browser DB credentials or dynamic global DB switching added | Host/third-party telemetry and future gateway DNS/redirect/pairing require independent review; no generic gateway URL fetch allowed. |
| Host/database/backup operator exposure | Server envelope for named tables; ownership and bounded export | Plaintext fields/metadata and server key access exist; backup/KMS/residency unverified. Plain JSON export requires private custody. |
| Malicious model/evidence, prompt injection | Strict schemas, exact reviewed sources, numerical/reference checks, candidate-only outputs, withdrawal latch | Signature/source truth/biological applicability are separate. No arbitrary generated code or tools permitted. |
| Signed update compromise, replay/freeze | Existing immutable reviewed releases/withdrawals; rollback tests | No TUF root/targets/snapshot/timestamp ceremony or independent key custody implemented. Do not substitute one signature for that system. |
| Outage, delayed jobs, source changes | Deterministic normal tracking fallback; bounded local worker, post-compute source check, monotonic deadline | Mac/private engine availability is not a production dependency. Physical device, browser storage eviction and real recovery remain unverified. |

## Food/source truth matrix

The existing `scripts/source-coverage.ts --verify` was reused; no second inventory
engine or catalogue was added. It inspected public checked-in references only.
Current aggregate counts: **5431 unique FNDDS foods,22188 portion rows,21 native
nutrient IDs;33 compact planning/logging rows with33 exact adapter source matches**.
These are repository counts, not Canadian branded coverage or150+ nutrients.

| Capability/source | Status / source anchor | Current verified scope | Unavailable / narrowed scope |
|---|---|---|---|
| FNDDS source identity and portions | VERIFIED scoped — `server/food-catalog.ts:15`, `server/data/fndds-manifest.json`, `scripts/build-food-catalog.py:9` | FNDDS2021–2023; all5431 IDs unique; compact digest/count match manifest; household measures retained. Builder omits missing fields, not zero-fills them. | Original public archive not reacquired/rehashed; sourceArchiveReverified=false. Native food values are not proof of individual analytical measurements or current brand formula. |
| Canonical nutrient definitions | PARTIAL — `shared/nutrient-definitions.ts:17` |21 generic-USDA definitions;22 recorded-source definitions including separate label B6. Each uses source-specific units/form semantics. All21 compact FNDDS fields are finite/nonnegative in this snapshot. | No native CNF mapping in this registry (`cnf:null`). No leucine/AA/EPA/DHA measurement from protein/fat totals. Numeric field availability is not biological completeness. |
| Historical immutable source | VERIFIED scoped — `shared/nutrient-source-snapshot.ts:14` | v1 generic-USDA only, max21 values; captured source/version/grams; known source values remain classified estimated; unknown and source-reported zero distinct. No recreation from current catalogue. | Source-native v2 expansion absent; never silently widen/relabel old v1 snapshots. |
| Labels and exact product identity | VERIFIED scoped — `server/products.ts:128`, `server/usda-branded.ts:25` | Authoritative barcode field matching, provenance/market/date, bounded provider budget and private label fallback; exact product is not generic-food match. | No50-case independently measured Canadian precision benchmark established by current16-state browser checks. No universal live SKU/offline barcode claim. |
| Food + confirmed supplement source view | VERIFIED scoped — `shared/recorded-intake-sources.ts:44`, `shared/nutrient-coverage.ts:28` | Confirmed actual events, owner/source/revision/zone, zero/unknown/conflicting, native form/unit grouping; planned or merely saved sources excluded. | Compatible-group subtotal is not habitual intake, complete-day coverage, absorption, deficiency or all-form equivalence. Do not equate source-panel coverage with every dashboard aggregate. |
| Actual user flow | VERIFIED engineering — current Progress and chart-first browser journeys | Actual App→HTTP→fresh encrypted SQL fixtures, keyboard, source correction/delete/retry/account switch,32 combined responsive/theme/mode/zoom states | Synthetic automation, not independent human/device/VoiceOver acceptance; no hosted deployment. |
| CNF2026 / Foundation / SR breadth | PARTIAL / RIGHTS_PENDING for new ingestion | Existing source truth preserved; no new download/import or provider enabled | No installed CNF2026 relational snapshot proven in inspected data directories; CNF2015 API must not be relabelled2026. External source/release/rights need exact qualification. |
| MyFoodData / Open Food Facts | RIGHTS_PENDING for new reuse/activation | MyFoodData is a benchmark, not licensed data feed; no scraping/rehosting. Existing optional OFF path is not newly enabled. | Licence/attribution/image/provider approval needed before affected new use. No proprietary parity claim. |
| Recipes, advanced comparisons, estimation | PARTIAL / deferred | Existing recipes/reuse and ordinary source-backed food flows preserved | Full cooked-yield/retention/history parity,100+ nutrient coverage, AA/fatty sums/custom-target breadth and blind estimate validation are not completed by this audit. No guessed yield, fortification or nutrient species. |

## Disposition and next queue action

No new urgent runtime privacy or numeric defect was established by this bounded
source audit. Do not invent one to justify a rewrite. Defence-in-depth ignore
patterns were completed for private experiment/credential/scratch directories;
seven positive path checks and two public-document negative checks passed.
Previously flagged historical demo credential candidate remains privately tracked;
its validity/exposure/remediation and any history rewrite are not established here.

SEC-0/FOOD-0 inventory: **IMPLEMENTED_AND_TESTED_SCOPED**. S1–S4 product/crypto,
source-native v2, source/clinical review,50-case Canadian benchmark and independent
acceptance remain feature-scoped open work. Follow existing P1/P2 precedence;
no infrastructure work is required to continue local scientific development.
