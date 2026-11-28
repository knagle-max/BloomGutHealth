# Bloom — Canadian Nutrition and Licensed Natural Health Products
**Date:** 2026-11-22 | **Authority:** owner-approved design direction, NOT an active Codex task or implementation proof.  
**Target:** `knagle-max/BloomGutHealth` / `enhance/bloom-experience`.

## 0. Execution gate and reuse
Read current `AGENTS.md`, `NEXT_ACTIONS.md`. The latest authorized work is the read-only **GI-01–GI-10** baseline and source-backed gap matrix. This handoff does not alter that queue or authorize deployment, paid APIs, private-data egress or migrations. Future execution must be specifically eligible under the live queue. Preserve `server/products.ts`, `server/food-catalog.ts`, `shared/nutrient-coverage.ts`, `shared/nutrition-summary.ts`, `shared/meal-intelligence.ts`, `shared/recorded-intake-sources.ts`, private-label/consent paths, and existing FOOD/NUT/MED/SYS/PRIV harnesses; no parallel food store, nutrient calculator, security authority or recommendation engine. Existing architecture: `BLOOM_PRIVATE_DATA_AND_MYFOODDATA_ARCHITECT_IMPLEMENTATION_DECISION_20261118.md` and consumer experience contracts.

## 1. Source-native Canadian Nutrient File 2026
**Candidate source:** Health Canada Canadian Nutrient File (CNF) 2026 downloadable relational data, official dataset https://open.canada.ca/data/en/dataset/1b6139bd-ed7e-4043-bc28-ff00e10f3109 . **Do not substitute old CNF vintage.** Before use, independently retrieve, record exact authoritative file URLs, release/guide, schema, checksum, terms and Open Government Licence – Canada attribution. Audit original data and count rows rather than asserting an exact item count. Distinguish raw/cooked, enriched/unfortified, product identity, portion and household measures. Bundle a versioned compact **server-side** verified subset/relational snapshot beside, never over, existing USDA FNDDS; preserve local search during external outage.

Preserve source-native food code, food descriptions (English/French if published), nutrient identifiers, units, values, nutrient-source/method information, serving/edible-portion basis, release and retrieval dates, null/zero distinctions, precision and source rights. Build audited ID-to-canonical-nutrient mappings: units, chemical form, vitamin equivalence, fibre methodology and fortification cannot be assumed interchangeable. Unmapped/incompatible values stay unsupported; do not invent 0. Record original values and normalized values separately, with unit/source conversion evidence. **Canadian label %DV is not an individualized RDA/EAR/AI/UL or clinical target.** Market, manufacturer and package evidence—not UPC/GTIN prefix—determine whether a particular product is Canadian. CNF generic composition is not a verified brand/package formulation. Avoid label/date/market conflation.

**Critical compatibility:** `shared/nutrient-source-snapshot.ts` v1 is expressly `generic-usda-composition` and narrow. Add a separately versioned source-native reader/record only when an approved eligible code slice needs it; preserve older snapshot interpretation and no invented retrospective snapshot reconstruction. Source correction/withdrawal invalidates derived summaries and investigations using its facts.

## 2. Licensed Natural Health Products Database: NPN and DIN-HM
Health Canada source: https://health-products.canada.ca/api/documentation/lnhpd-documentation-en.html ; registry and extracts on Health Canada site. Locate product by genuine eight-digit NPN/DIN-HM; do **not** interpret arbitrary barcode digits as NPN. Capture returned identifier, licence holder/name, licence **status**, effective/last-observed date, source version, medicinal ingredient potency and dose/form basis, non-medicinal excipients, label claims and recommended conditions of use where actually listed. Active licence ≠ current market availability, verified bottle lot/formulation, safety certification, recommendation to take it or evidence of ingestion. Cancelled/suspended/stale/unavailable states must not be displayed as currently licensed. Excipients may be present without quantities; preserve unknowns, never invent dose, effect or causal GI trigger.

Keep three identities separate: (1) **regulatory licence information**, (2) **user-verified current package label**, (3) **actual user-recorded ingestion**. Preserve label images/revision and private saved-product capability. Give original official text when translated/normalized fields are uncertain. Public NPN requests must not transmit user identity, medication, microbiome, symptoms or health profile. Bounded latency/spend/failure, cached age and refresh review; allow manual entry without API service.

## 3. Canadian retail lookup
Use existing USDA branded, NIH DSLD and optionally rights-approved Open Food Facts integrations, Canadian ingredient/label matching and private labels. Support bilingual queries and exact GTIN where qualified, never presume GS1 prefix means Canada or USA. UPC match alone is not formulation/vintage certainty. Conflict on serving size, nutrient unit or source market => user review. Keep mandatory label nutrient fields separate from nondisclosed micronutrients and preserve source-native units, zero versus unknown and incomplete diary coverage.

## 4. Consumer flow and UI
Quick source/result summary: recognizable name, Canadian generic vs licensed product vs private verified label distinction, available portion/dose basis, original source and freshness, known nutrient coverage, ambiguous match warning and one compact Review/Use action. No new hero artwork required. Inspect existing Food and Nutrition visual assets before proposing a BVA entry. Use the single existing visual asset registry for any demonstrably necessary new original.

## 5. Source/legal/security gates
Official data rights, licence conditions and attribution must be reviewed against exact downloaded assets—including translations/photos or unrelated embedded rights. Pin source checksums, record processing script and reproducible import counts. Public queries are separated from account-private application. On correction, withdrawn licence, label mismatch or consent change, invalidate derived views; do not lose the original observation. No unapproved external health data transfer, cloud provider activation, product claim, clinical dosage, production migration or duplicate database. Code existence ≠ source validation ≠ clinical/release qualification.

## 6. Acceptance: CAN-01–CAN-16 (fold into existing suites; not a build queue)
| ID | Required outcome |
|---|---|
| CAN-01 | Exact official CNF release and source bytes, licence, attribution, deterministic import count and checksum recorded. |
| CAN-02 | Food codes and source preparations preserved; no silent Canada/USA substitution. |
| CAN-03 | Source fortification, vitamin forms, nutrient units and methods remain traceable. |
| CAN-04 | Missing/null, source-reported zero and incompatible/unmapped nutrients distinguished. |
| CAN-05 | Portion and edible gram conversions source-grounded; unknown portion does not produce invented totals. |
| CAN-06 | English/French aliases do not combine separate food identities. |
| CAN-07 | Server-side bundled source available offline with measured latency/size and existing FNDDS intact. |
| CAN-08 | Version-1 nutrient snapshots remain readable; v2, when eligible, keeps true source/native facts without retroactive inference. |
| CAN-09 | NPN and DIN-HM only resolve valid product/licence identities; don't confuse with UPC. |
| CAN-10 | Cancelled/suspended/stale licences never silently shown active, available or safe. |
| CAN-11 | Medicinal ingredient quantities/forms, excipient identity and dose basis remain distinct from actual package label. |
| CAN-12 | Missing excipient amounts never become numeric nutrient values or scientifically proven triggers. |
| CAN-13 | External Health Canada request timeout/status/error handled; manual/private label fallback works. |
| CAN-14 | Market identity based on verified product evidence, never UPC prefix. |
| CAN-15 | Source/label correction and revocation invalidate derived results; account isolation and no private external egress. |
| CAN-16 | Canadian %DV remains separate from individualized targets/upper limits; partial diary not called nutritionally complete. |

## 7. Receipt / stop
When eligible, deliver current HEAD `file:line` inventory (`FOUND/PARTIAL/ABSENT/RIGHTS_PENDING/NOT_TESTED`), rights/source manifest, one smallest additive code slice, tests and real consumer results, model/provider/private egress audit, gaps and scientific status. **Stop now: design documentation publication only; GI baseline unchanged.**
