# Bloom — Supplement Barcode Lookup: Defect Correction and Codex Implementation Contract

**Date:** 2026-11-17  
**Source:** Direct Product Owner Codex handoff, four reported UPCs, exact code branch defect.  
**Disposition:** **APPROVED scoped correction** to existing Find a food or supplement experience, under current **V06-M3-CONFIRMED-SUPPLEMENT / confirmed source/label/intake workstream**. No new shopping module, paid source or alternate intake ledger.  
**Developer:** Codex on `enhance/bloom-experience`, using `AGENTS.md` and the sole `NEXT_ACTIONS.md` active task.  
**Acceptance principle:** Valid UPC → verified exact authoritative product/label when source genuinely supports that identifier → explicit source/label review before save/use; otherwise clear truthful no-match/outage and **one-tap private manual label entry with the scanned barcode already filled**. Never invent a product, dose or intake.

## 1. Source-verified defect and existing implementation

Read-only branch source inspection:
- `server/products.ts`, `ProductService.search`, line around **409**, currently conditions NIH DSLD name lookup on `if (kind !== "food" && !code)`. A valid code therefore **skips DSLD entirely**. For `kind="supplement"` the USDA/OFF branches are also suppressed, yielding only existing private labels or empty result.
- `shared/barcodes.ts` has `normalizeBarcode`, `canonicalBarcode`, `isBarcodeSearch` with GS1 GTIN-8/12/13/14 check digits; canonical form is zero-padded 14-digit string. Original string (especially leading zeros) must remain available to source requests/display. `shared/product-search.ts` gives barcode results a high score **only when returned product actually has a matching verified barcode**; `rankProducts` must not be weakened into fuzzy name ranking.
- `shared/products.ts` contains `ProductRef` with sources `usda-local/usda-branded/off/dsld/manual`, source-scoped `Product`, and `labelInputSchema` with valid optional barcode and per-serving nutrient amounts. Preserve this reusable private label identity. Any new Canadian source type must update all consumers, data migrations/resolvers/response schemas and tests or remain a **review-only metadata candidate**, not a broken `ProductRef`.
- `server/products.ts` `normalizeDSLD(raw)` currently maps validated `dsldId` label/servings and some nutrients, with data not implying USDA/Health Canada verification or safety. A DSLD search hit may be a *candidate*; to claim **barcode matched**, inspect authoritative full label `upcSku` plus exact product/formula/package. Do not bypass full label resolution or trust only `_score`, `_id`, fullName or `status`.
- Existing account-scoped `store.getNutritionProducts(userId)` resolves previously saved exact barcodes first; preserve account isolation and source persistence. Existing `/api/products` is authenticated, rate-limited, `Cache-Control:no-store`. Public data cache/in-flight source lookups must not cache private account records or mix provider release/status assumptions.
- Existing `V06-M3-CONFIRMED-SUPPLEMENT` separates formulation/product review from **actually taken** date/portion. A found product does not create a taken event or update food nutrient totals without existing explicit confirmed-consumption action.

**Verified input cases — all four pass current GS1 UPC-A check digit; keep original leading zeros:**

| UPC-A as supplied | Product name as reported by owner (not independently UPC-source certified) | GTIN-14 canonical key |
|---|---|---|
| `777672010360` | SISU B12 Methylcobalamin, 5,000 mcg | `00777672010360` |
| `023249090021` | Sports Research Vitamin C, 1,000 mg | `00023249090021` |
| `623543753242` | Naka Bromelain, 500 mg | `00623543753242` |
| `665553200101` | ALLMAX Creatine Monohydrate, 1 kg | `00665553200101` |

These owner-reported UPC↔name pairs are **test targets to resolve**, not permission to hardcode an externally verified exact barcode→product result or assume provider coverage. Retailer listings are investigation clues; do not treat a retailer title alone as a complete Supplement Facts formula.

## 2. Authoritative source capabilities verified against live public documentation (2026-11-17)

**NIH DSLD** (https://dsld.od.nih.gov/api-guide ; https://api.ods.od.nih.gov/dsld/v9/): `GET /search-filter` explicitly supports looking up **barcode/UPC SKU**. Official guide instructs quoting numeric barcode in `q` (URL-encoded quotation marks), rather than treating the barcode as ordinary unquoted text. Returned full `/label/{dsldId}` includes `upcSku` on relevant records. Before coding, inspect the current endpoint schema and representative real responses for `q` quoting, `upcSku` shape/format, search response pagination, active/off-market status, exact supported representations and any undocumented constraints. Search may match other fields; **verify the returned actual label identifier** before surfacing a strong match. Normalization may allow GTIN equivalent padding and hyphen/spacing without accepting a different check-digit/pack size. Use exact query shape and intentionally finite budgets/timeout.

**Health Canada LNHPD** (https://health-products.canada.ca/api/documentation/lnhpd-documentation-en.html ; https://www.canada.ca/en/health-canada/services/drugs-health-products/natural-non-prescription/applications-submissions/product-licensing/licensed-natural-health-products-database.html): public JSON/XML API and nightly-updated database of licensed products with **NPN/DIN-HM, identity, licence holder, ingredient, dose-form, warnings**. LNHPD search fields are product name, holder, ingredients, NPN and licensing attributes; **UPC is not an official LNHPD search identifier**. Treat NPN as regulatory licence identity distinct from UPC/GTIN and package SKU. LNHPD's listed ingredients/doses may be relevant **licensed formula information**, not necessarily the exact currently marketed package Supplement Facts/lot/serving or proof of a UPC link. Match the *right product and formulation* before displaying regulatory information and retain sourced date/status. For unresolved barcode, use an explicitly labeled *possible licensing record* only if defensibly connected by independent SKU+NPN/manufacturer evidence; never automatically assign an NPN from name similarity alone.

**Other barcode-aware sources:** Evaluate source licence, Canadian coverage, provider terms, reliability, rate limits and exact SKU/UPC support before integrating. OFF is currently **disabled pending source licensing review** in this repository; do not casually turn it back on or pretend Open Food Facts/retailer pages provide verified exact supplement ingredient composition. Product-to-NPN joins need verified label/manufacturer linkage and should not create a second, unsourced authority for dose. Provider outages must not appear as negative existence proof.

## 3. Implementable resolution algorithm — deterministic priority, no invented matches

**Search dispatch:**
1. Determine request `kind`; if input is numeric/barcode-intended, validate exact UPC/GTIN and reject invalid with useful correction message and private manual-label entry path. Preserve original digits and canonical normalized key.
2. Check own-account manual/saved barcode records first, with exact canonical equality and accurate `Your saved label` provenance; current formula confirmation.
3. For `kind=all|supplement` valid barcode, use **dedicated, bounded DSLD barcode-specific query**, not generic `supplementSearchQuery` product-name pathway. The official DSLD query is an exact quoted code (encoded via `URLSearchParams({q: '\"'+originalDigits+'\"', ...})`); if provider field stores codes with grouping spaces or GTIN padding, try a **small documented list** of validated equivalent encodings only after testing. Do not fuzzily match neighbouring UPCs or ignore a mismatch.
4. For candidate hits, load full DSLD records via existing `/label/{dsldId}` resolution. Extract the label's actual `upcSku` (possibly multiple forms), compare canonical normalized identifiers to searched code, verify brand + formula/strength + serving/pack variant if available. Mark mismatch/unknown as `not verified` even if provider returned it from quoted search; preserve raw source and retrieval timestamp.
5. If multiple exact-code rows, surface their distinct formula/label dates/package variants with explicit user confirmation, **not** automatically choose the first or overwrite an existing saved product. A historical/off-market variant can be shown with dated provenance and caution.
6. Optional Canadian supplement identity source: after source capability/rights review, query licensed natural health products **by NPN or product/licence-holder name**, but this is **not a verified UPC lookup** absent independent UPC→NPN evidence. Keep Canadian source result typed and lower-confidence than exact barcode match; do not merge or count nutrients automatically.
7. If no authoritative exact match (or provider outage/limit), preserve barcode and offer **Save my package label** opening the existing manual label form prefilled with the scanned UPC and kind=supplement, with no need to retype. Allow user to supply brand, exact name, formulation, strength and ingredient forms/quantities/serving via package text, manual entry or permitted photo-assisted extraction with explicit review. No invented nutrient values.
8. Save/reload/correct under existing account-owned manual label pipeline. Future scan resolves saved label immediately. Product lookup, label review, and **actually taken** consumption are three separate state changes.

**Response state and UX:** distinguish `exact-barcode-verified`, `saved-private-label`, `possible-not-verified`, `no-authoritative-match`, `provider-unavailable`, `invalid-barcode` through existing response/warning structure if possible, adding a minimal backward-compatible typed status when needed. Retain original UPC in response. No empty screen or repeated disclaimers; show **one** clear next action, typically `Enter my label` when unresolved. Empty source result, 403/429/timeout and off-market status are not equivalent. Use accurate descriptions and no falsely confident green exact-match presentation.

**Safe result projection:**
- Verified barcode match requires trusted provider label `upcSku` comparison and distinct source ID; *name plus code entered by caller* is never enough.
- Exact brand/product/form/strength/package size/serving should be compared when known, never fabricated where missing. A UPC often identifies a package but a database may omit package details; absent facts remain `unknown`, with confirmation required.
- Nutrients only from full source label with stated basis (e.g., microgram B12 as methylcobalamin, vitamin C form, bromelain mass and possibly enzyme activity units, creatine form and serving). **Do not confuse ingredient mass with activity units or compound elemental amounts**. The four reported product names are not enough to populate nutrient fields.
- Resolve stale/withdrawn label when user selects it, and recheck authoritative source and existing source version before using it in a saved entry.

## 4. Implementation touchpoints and autonomy

Codex should inspect exact current branch state and revise these **existing** functions rather than add a new parallel product system:
- `server/products.ts`: supplement code path, DSLD UPC query/label verification, bounded provider failure, exact source identity, returned state and retrieval timestamp.
- `shared/barcodes.ts`: reuse canonical GTIN-14 and raw input; only extend if real grouped DSLD `upcSku` representations demonstrate need. Existing 8/12/13/14-digit validation stays.
- `shared/products.ts`: only minimal optional verified match/source provenance fields if actually required; preserve existing `ProductRef` and source validation for old records. A proper `lnhpd` source requires verified end-to-end resolver/storage/UI type updates; otherwise use public regulatory corroboration in an expressly separate, reviewed read-model.
- `shared/product-search.ts`: keep strong barcode matching; introduce limited verified mapped identifiers only after an explicit source mapping.
- Existing Find food/supplement component, query hooks, manual label creation route and source snapshots: route every unresolvable scan directly to prefilled manual label, save/reload under account, do not auto-create intake.
- Existing `NEXT_ACTIONS.md` V06-M3 workflow: add narrow defect acceptance within same current workstream, not an unrelated P1 UI redesign or new programme.

**Codex implementation freedom:** this is a binding observable and data-truth contract, not a mandate for exact helper names, source-provider count, a specific new type/module layout or a new DB. Implement the least complex reusable adapter that meets the real source contract. No new paid API/vendor until rights/cost review. If a provider does not expose a trustworthy exact match, return honest no-match plus manual source creation rather than inventing it.

## 5. Mandatory tests — source fixtures and actual provider classification

**UPCs (input as string, check-digit and leading-zero preservation):**
- `SB-UPC-01` `777672010360`, owner label SISU B12 Methylcobalamin 5,000 mcg.
- `SB-UPC-02` `023249090021`, owner label Sports Research Vitamin C 1,000 mg.
- `SB-UPC-03` `623543753242`, owner label Naka Bromelain 500 mg.
- `SB-UPC-04` `665553200101`, owner label ALLMAX Creatine Monohydrate 1 kg.

For **each** UPC assert: existing validation passes, exact source barcode verification if a live authorized provider returns the code, appropriate product/formula/pack distinction, original digits preserved, no substitute if only name is similar, and direct prepopulated manual-label fallback if no exact match. A test must not require NIH to contain a Canadian-only product or assign package details absent from source. Record actual provider coverage as `verified`, `not found`, `unavailable` or `not yet checked`, not an invented guaranteed hit.

**Further tests:**
- `SB-UPC-05` DSLD quoted UPC query encoded correctly; provider hit without `upcSku` or with different barcode **does not pass verified exact**; grouped UPC text normalizes only with valid check digit; GTIN14 zero-padding equivalent.
- `SB-UPC-06` Private saved label wins for exact same UPC; another account's saved label is never displayed; account switch/revoke/cache isolation.
- `SB-UPC-07` Two real variants sharing name but distinct UPC or country/formulation are never auto-interchanged; label historical/off-market variants stay distinct.
- `SB-UPC-08` LNHPD NPN and product name cannot be used as barcode equality or complete current Supplement Facts; missing licensed dose/serving remains unknown.
- `SB-UPC-09` Source 404, 429, 5xx, timeout, DNS, schema change and licensing denial return honest outage/no-match types, manual fallback and bounded source logs (no private source payload).
- `SB-UPC-10` Scan/typed barcode → manual prefilled exact original code → valid label nutrients/serving captured → saved → reload → rescan recognized; edit/undo/delete and idempotent retries preserve original source and private ownership.
- `SB-UPC-11` Barcode/product selection never creates taken event, prescription, Food consumed amount or automatic nutrient intake; **explicit confirmed supplement use** increments once, with corrected source-native/elemental basis.
- `SB-UPC-12` Partial/unknown ingredient amount and supplement activity unit never guessed or counted toward clinical adequacy. Product source provenance/retrieval date visible in source detail.
- `SB-UPC-13` Existing non-supplement food barcode and text search regressions stay stable; no source type schema break for saved historical entries.
- `SB-UPC-14` Real responsive UI at 320/390/768/1024/1440 with keyboard, scanner permission denied, paste/type input, errors and one meaningful action; no generic UI redesign.
- `SB-UPC-15` A product with valid NPN but conflicting UPC, absent manufacturing package linkage or outdated formulation is not presented as confirmed exact SKU; allow a separate voluntary review of Canadian licensing metadata.

**Verification evidence:** exact commit SHA, automated unit/provider mock integration, recorded sanitized live provider query/outcome for each UPC where permitted, real UI scan/type→lookup→saved label→explicit taken path, 2-account/cache, source outage, retrieval timestamp, original unit/ingredient form and error fallback, exact hosted status. Use `SPECIFIED`, `CODE_PRESENT`, `ENGINEERING_TESTED`, `LIVE_PROVIDER_VERIFIED`, `RENDERED_USER_FLOW_VERIFIED`, `HOSTED_VERIFIED` separately. **No test passes merely because a retailer listing exists or a fake mocked matching result was constructed.**

## 6. Source citations and license/applicability

- NIH Office of Dietary Supplements: [DSLD API guide](https://dsld.od.nih.gov/api-guide) explicitly describes `GET /search-filter` barcode/UPC SKU with quoted URL-encoded exact codes; [v9 API](https://api.ods.od.nih.gov/dsld/v9/) documents `upcSku` returned field. Provider response details and usage terms must be checked live during implementation.
- Health Canada: [LNHPD API](https://health-products.canada.ca/api/documentation/lnhpd-documentation-en.html), [public LNHPD page](https://www.canada.ca/en/health-canada/services/drugs-health-products/natural-non-prescription/applications-submissions/product-licensing/licensed-natural-health-products-database.html), and [search guide](https://www.canada.ca/en/health-canada/services/drugs-health-products/reports-publications/natural-health-products/licensed-natural-health-products-database-lnhpd-user-guide-september-2008.html). NPN/DIN-HM is regulatory identity; LNHPD is not advertised as a UPC barcode resolver and may not reflect exact current retail package content. Regulatory licensing claims are only within recommended conditions.
- Existing code citations: `server/products.ts`, `shared/barcodes.ts`, `shared/product-search.ts`, `shared/products.ts` inspected November 17, 2026; methods/types are preserved subject to actual latest HEAD inspection.

**Definition of done:** All four user-reported valid UPCs take a legitimate exact supplement barcode resolution route, and *when that source cannot verify the SKU* users can preserve the scanned code in a private reusable label without retyping it. Exact source identity/portion/ingredient truth is retained, and finding a supplement never pretends that it was taken.
