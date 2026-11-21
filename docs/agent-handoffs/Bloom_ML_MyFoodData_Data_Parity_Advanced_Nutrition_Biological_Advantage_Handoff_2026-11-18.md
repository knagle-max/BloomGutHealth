# BLOOM — MyFoodData Data Parity, Advanced Nutrition Tracking & Biological Advantage
## Full research, acquisition architecture, engineering contracts, staged acceptance and cross-agent handoff

**Date:** 18 November 2026  
**Author:** AI Intelligence & Personalization / ML Specialist  
**To:** Chief Architect & Integration Lead; Codex/Developer; Nutrition & Biology; Integrations & Data; Security & Privacy; Legal & Regulatory; Product/UX; User Testing  
**Disposition:** **APPROVE AS PRODUCT REQUIREMENTS WITH SCOPED IMPLEMENTATION AND EVIDENCE GATES.** This is a handoff, **not** a claim that MyFoodData's proprietary data are licensed, that all external sources have been ingested, or that the whole feature set has been implemented, tested or authorized. No code changes made.  
**Owner priorities (preserved):**

> **P0 — Tracking parity:** Expand source-native nutrient coverage, improve reliable food search/barcodes, finish combined actual food + supplement totals, and verify fast logging. *Makes Bloom dependable as a daily nutrition tracker.*  
> **P1 — Advanced tracking:** Amino acids, fatty acids, ingredient-level comparisons, complete recipes, reusable meals, clear estimates and custom nutrient targets. *Closes the analytical breadth gap.*  
> **P2 — Biological advantage:** Dynamic investigation of nutrient patterns, bloodwork relationships, microbiome evidence and personalized meal changes. *Makes Bloom meaningfully different.*

## 0. Controlling instruction and current-plan reconciliation

1. **Do not build a second food database, source ledger, nutrient engine, ingredient graph, recipe store, AI service, evidence graph, or recommendation engine.** Extend existing `shared/meal-intelligence.ts`, `shared/nutrient-source-snapshot.ts`, `shared/nutrition-summary.ts`, `server/food-catalog.ts`, canonical Food/Meal Review, source/provenance, consent, `shared/lab-panel-review.ts`, metered AI, reviewed claims/actions and the Python research tracks.
2. The **current** branch `enhance/bloom-experience` `NEXT_ACTIONS.md` as inspected Nov 18 expressly defers broad Food #12 / M2/M4 nutrient expansion to its historical P4 while prioritizing bounded dynamic scientific investigation and persistent learning (its own P0–P3). **Those labels are a different queue, not this owner's P0–P2 feature hierarchy.** Chief Architect must reconcile this owner-requested expansion with active tasks and preserve exact-SHA completed receipts; Codex must not silently supersede the current queue or reopen verified work solely because this handoff exists.
3. Provide **small, demonstrable value slices**, not a 35-source acquisition marathon. Missing optional data narrows only dependent computations. A useful existing Food/Today/Response pathway must not fail because a dataset, provider, amino acid or model is unavailable.
4. Model research and durable scientific learning remain active separately, and research outputs do not independently authorize medical claims or ordinary user actions. No new subscriptions, unrestricted scraping, Open Food Facts activation or proprietary MyFoodData redistribution without rights decisions.
5. Work on approved source IDs, evidence and inference is separate from model deployment; explicit statuses: architecture / source obtained / rights reviewed / mapped / scientifically validated / code integrated / locally tested / hosted verified / user accepted / permitted release. Avoid an all-green status based on source code alone.

## 1. What MyFoodData actually provides and how it acquires data

### 1.1 Direct first-party evidence, not assumptions

- [MyFoodData data documentation](https://www.myfooddata.com/about-the-data) identifies USDA Foundation/Standard Reference, USDA FNDDS, USDA branded, Open Food Facts, directly user-entered/private-label and manually captured branded/restaurant records as sources; it describes its own supplemental nutrient estimation. Published database counts are **their marketing/source totals**, not independently verified, unique, Canadian, currently reachable or analytically complete foods.
- [MyFoodData About](https://www.myfooddata.com/about.php) describes links back to USDA and tools for **150+ nutrients**, nutrient rankings and ratios, ingredient comparisons, amino-acid calculation and recipe analysis. [Public instructions](https://www.myfooddata.com/instructions) show search, portions, recipes, meal entry and custom targets.
- [MyFoodData feature listing](https://www.myfooddata.com/) and [Android listing](https://play.google.com/store/apps/details?id=com.myfooddata.userpage.twa) describe 100+ nutrient tracking, barcode and label scanning, recipes/favourites, day plans, offline, water, weight and exercise records and advanced nutrition metrics. These are **claimed product capabilities**, not proof of Bloom integration, accuracy or regulatory scope.
- MyFoodData's API is **not a generally available public data source for Bloom**; reproduce capability through appropriately licensed source datasets and independent implementation, not by copying its database, website or proprietary matching logic.

### 1.2 Exact public-data composition

| Source | Practical role | Acquisition mode | Scientific fidelity / legal constraint |
|---|---|---|---|
| **USDA FoodData Central Foundation (Oct 2026 release)** | Analytical measured ingredient profiles, individual amino/fatty acids when populated; variability and methods | Pin official downloadable CSV/JSON subset; server API for approved discovery | Full nutrient list is food-dependent. Preserve FDC ID, data type, basis, nutrient IDs, method/derivation, release and source. CC0 underlying USDA data; review non-USDA submissions separately. |
| **USDA SR Legacy (final Apr 2018)** | Broad historical analytical composition, including rich amino/fatty-acid profiles | Pinned local download | No assumption of current SKU formula or fresh commodity composition; clearly mark legacy vintage. |
| **USDA FNDDS 2021–2023 (Oct 2024 download)** | Prepared/generic foods, household portions, composition of consumed foods | Keep and expand existing compact server-side FNDDS snapshot | Existing code already uses FNDDS 2021–2023; use source/native portion and distinguish generic from branded. |
| **USDA Branded (Oct 2026 release)** | GTIN/brand/variant/market-specific packages and label declarations | Server-side indexed bulk subset + bounded official API lookups | Branded labels tend to omit amino acids/fatty acids and many micronutrients; **unreported is unknown**; product changes over time. |
| **Health Canada Canadian Nutrient File 2026** | Canada-specific composition, forms, prepared foods and portions | Relational CSV ZIP and tables; local versioned ingest | CNF 2015 web API is not automatically the 2026 database. Follow 2026 guide/table joins; not a branded Canadian SKU catalogue. |
| **Verified private label / recipe** | Canadian barcode misses, custom foods and own cooking | Owned entry, nutrition label review, immutable per-consumption source revisions | User-entered label is not authoritative provider data; no private record copied to shared corpus without rights. |
| **Open Food Facts (conditional)** | Wider international barcode coverage | **OFF by default**, separate bounded API and/or licensed snapshot | ODbL share-alike/attribution and separate image rights; community reports may be incomplete; requires existing Legal/provider decision. |
| **Commercial restaurant/manufacturer sources (conditional)** | Canadian menus and SKU enrichment | Written rights/approved API or manually user-confirmed labels | No inferred provider API, crawling or redistribution right; market/date/portion/restaurant specific. |
| **Health Canada DRIs / reviewed references** | Appropriate nutrient target context | Approved versioned local reference rules | EAR/RDA/AI/UL/AMDR/CDRR/form/life stage not interchangeable; not deficiency diagnosis. |

**Official anchors:** [USDA downloads](https://fdc.nal.usda.gov/download-datasets/), [USDA data documentation](https://fdc.nal.usda.gov/data-documentation/), [USDA API](https://fdc.nal.usda.gov/api-guide/), [USDA data dictionary](https://fdc.nal.usda.gov/portal-data/external/dataDictionary), [CNF 2026 dataset](https://open.canada.ca/data/en/dataset/1b6139bd-ed7e-4043-bc28-ff00e10f3109), [CNF 2026 overview](https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data/canadian-nutrient-file-about-us.html), [DRIs](https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables.html). USDA's source release table at review lists Oct 2026 Foundation/Branded, FNDDS 2021–2023, Apr 2018 SR Legacy. CNF 2026 is a linked set of Food Name/Group/Source, Nutrient Name/Amount/Source and Measure/Weight files, not a single flat foods table.

### 1.3 The estimation technique worth researching — not copying unquestioned

[MyFoodData's published method](https://www.myfooddata.com/about-the-data): for a branded or restaurant food with partial label information, map its ingredient list (or food description if ingredients absent) to USDA reference foods; fit ingredient mixture weights to declared protein/fat/carbohydrate and sometimes calories/sugar/fibre/sodium; fill **only missing** nutrient fields as weighted reference values. MyFoodData reports a per-macro 5 g per 100 g fit tolerance (some food-type exceptions), and drops estimated amino/fatty fractions when the summed estimates exceed reported parent protein/fat beyond its internal tolerance. Its users can turn estimated values off. These specific rules describe **MyFoodData's claimed approach, not a scientifically validated Bloom threshold**.

**Bloom decision:** Develop an **optional, clearly labelled estimated-composition research path**. Do not assume composition is identifiable from macros: ingredients are often reordered, ingredient percentages unknown, cooking yields matter, fortification is variable, and several mixtures may satisfy identical macro labels yet differ drastically in iron, choline, fatty acids and amino acids. Treat matching macros as a consistency filter, **never a measurement validation certificate**. Benchmark blindly against products with held-out measured full-nutrient values. Before any user display, define nutrient/site-specific error, coverage, calibration and abstention requirements; preserve reported nutrients unchanged and maintain separate `reported` / `analytical` / `calculated` / `estimated` / `unknown` states. No estimated input silently becomes authoritative DRI adequacy, excess/UL, medical or biological action.

## 2. Baseline repository inventory and exact next audit

**Source inspected:** `knagle-max/BloomGutHealth`, branch `enhance/bloom-experience`, Nov 18 moving head. This is **source inspection only**, not a complete implementation inventory or hosted acceptance.

- `server/food-catalog.ts` declares a **versioned compact USDA FNDDS composition dataset, server-only**, source records and household portions. `lookupDatabaseNutrition`-style flows and `NutrientSourceSnapshot` exist; do not replace them.
- `shared/meal-intelligence.ts` contains `nutrientDefinitions` and canonical ingredients/recipes; the catalogue source enum includes `usda-fndds` and typed food/ingredient detail. Existing recipe definitions do not prove a full user-owned recipe editor or cooking-yield workflow.
- `shared/nutrient-source-snapshot.ts` currently accepts **only generic USDA composition** and a `values` array capped at **21**; `captureNutrientSource` currently assigns known source values the label `estimated` (not necessarily the semantic class `measured analytical`), while absent values are unknown. **This contract must be extended/migrated deliberately** for >100 amino/fatty fields and multiple source types. Do not simply expand array max without checking storage, export, API, consumers and source meaning. Retain historical snapshots and their definition versions.
- `shared/nutrition-summary.ts` aggregates known nutrients with partial-coverage distinctions. Must verify actual food-plus-confirmed-supplement day totals and correct partial-day semantics end-to-end.
- `NEXT_ACTIONS.md` currently prioritizes dynamic AI research/knowledge durability, and marks elective exhaustive nutrient/food enhancement deferred. Architect owns reconciliation of this new requested feature hierarchy, preserving the current science milestone.

**Required read-only audit artifact (Codex / Integrations):** Existing food types and number of records by source, canonical nutrient keys, source-native nutrient IDs mapped to those keys, known coverage by source/type, recipe/save/reuse/portion status, barcode routes and provider fallbacks, OCR/photo/AI consent, confirmed supplement event integration, current UI performance and all valid exact-SHA test receipts. Mark every entry `FOUND / VERIFIED / PARTIAL / UNKNOWN / ABSENT / RIGHTS_PENDING`, with source file/line/test. **Do not assume the feature is absent merely because one TS file does not mention it.**

## 3. P0 — Daily tracking parity (release-first product utility)

### PARITY-2701 — Local source-native nutrient registry and identity

- Extend the existing canonical nutrient registry with source-specific IDs and namespaces; include nutrient chemical forms, activity units, per-100g/serving basis, true reported zeros versus missing, original values and source methodology.
- Preserve data type and FDC/CNF ID, market, brand, preparation, moisture, edible portion, original label revision, and estimate tier. Separate multiple FDC foods with the same name.
- Adopt **versioned bounded local data snapshot jobs** with manifest: release, download URI, checksum, tables, row counts, mapping and QA receipt, rights decision, rollback. Allow provider API for discovery, not a requirement for core logging.
- User source correction must preserve existing historical eaten snapshots, re-evaluate active derived totals, and not retroactively change yesterday's intake without an explicitly reviewed historical source correction.

### PARITY-2702 — Food search and barcode identity

- Exact barcode/GTIN + package/market/brand first; then verified product identity; then generic candidates clearly distinguished. Strip presentation separators safely, preserve leading zeros/GTIN normalization/check digit. Never claim generic food is an exact product/barcode hit or treat vitamin-brand NPN as GTIN identity.
- Search indexed local generic/Canadian/approved branded records using spelling, language, synonyms, preparation and reasonable typo tolerance. Return source badges, nutrient completeness, serving basis, recently used/favourites, Canadian relevance; avoid ranking unverified brand over explicit exact matching source.
- Selection remains user-confirmed; unresolved barcode → `no-authoritative-match` + fast private-label entry prefilled only with genuinely scanned information, no random replacement or invented product nutrition. Provide offline saved/recent/manual fallback.
- Benchmark **50+ Canadian scenarios**: generic staples, bilingual names, raw/cooked differences, known FDC branded GTIN, Canadian SKU not in USDA, formula version, invalid/checksum mismatch, leading zero, duplicate GTIN conflicts and network outage. Measure exact-match precision, top-3 selected identity, no-false-match count, median/p95 search latency and abandonment. Don't promise 100% Canadian barcode coverage.

### PARITY-2703 — Combined confirmed actual intake

- Calculate actual meal + snack + beverage + **confirmed taken** supplement contributions by nutrient, calendar timezone and value form. Planned meals, recommended recipes, scheduled-but-unconfirmed supplements and looked-up labels **do not count as consumed**.
- Distinguish source-complete known total vs known subtotal with missing contributors, original vs estimated additions, native unit conversion, over-limit context only where appropriate form and life-stage are verified. For overlapping nutrients from multiple confirmed supplements, sum with compatible identity/forms; otherwise display separate known records and an unresolved conversion.
- Reconcile same supplement taken twice, saved receipt retries, corrections/deletion, fortified food double-count controls, historical product formula changes and partial days. Maintain count and coverage denominators; no blank-as-zero or false DRI adequacy.

### PARITY-2704 — Fast logging and interoperability

- One entry path for recent/favourite/saved meal, search, barcode, label scan, text/voice if actually supported and permissioned, manual private-label fallback. AI parsing is optional, metered, source-neutral; user reviews food identity/amount and verifies persistence. Avoid an AI provider requirement for simple logging.
- Verify saved meal/day plan can be reused **as a draft** without silently marking a meal eaten. One-tap edit of portion, ingredient, brand and date; undo, retry/idempotency and direct daily subtotal update. Food safety/allergy exclusions before plan suggestions.
- Device/offline/source outage must degrade to local saved foods and manual entry; never claim untested offline full sync or live barcodes.
- Usability: screen reader, keyboard, 320/390px, 200% zoom, thumb-friendly quick action, real-device camera permissions; measure task completion and time without inventing a target unsupported by actual testing.

**P0 EXIT:** Authenticated realistic Canadian user logs a known generic food, correctly resolved branded barcode and an unmatched Canadian barcode via verified private label; reuses a saved meal; logs 2 meals, beverage and taken supplement; sees source-qualified actual day totals with partial unknowns; edits/deletes/retries; reloads and exports; second account sees none; no AI/provider needed to complete manual task.

## 4. P1 — Advanced detailed tracking and recipes

### PARITY-2705 — Amino acid profile

- Source-native amino acids including leucine, isoleucine, valine, lysine, methionine, cystine, threonine, tryptophan, phenylalanine, tyrosine, histidine, valine and remaining populated common AAs. Preserve individual nutrient IDs and g/mg native conversion, protein-method differences, absent entries, and sum-versus-protein consistency checks.
- Views: grams per serving, per 100 g, per meal, confirmed day; essential amino acids and branched-chain sum only where component coverage supports the total; disclose that a missing component is unknown, not zero.
- Source-backed meal improvement examples: compare protein ingredients or portion sizes while respecting energy, allergies, tolerability and dietary preference; a leucine amount is *composition*, not proven muscle protein synthesis or an individual's requirement response.

### PARITY-2706 — Fatty acid composition and chemistry

- Preserve **total fat and measured individual fractions separately**: saturated/mono/poly, omega-3 ALA/EPA/DHA, omega-6 LA/AA and other constituent species when source IDs reliably support them. An unspecified polyunsaturated-fat total does **not** identify EPA or DHA. Avoid double counting subtotal and constituents.
- Parent-child nutrient ontology with proof that nested groups are not independent. Mixed food oils/cooking preparation and branded reformulation remain source-/date-specific. Fatty acid ratios, if shown, require meaningful denominators and clear scope; no disease predictions.

### PARITY-2707 — Complete recipe and reuse engine

- Own recipes with stable ID/revision, ingredient source ID/edition, raw input edible grams, preparation loss/retention where reviewed, optional cooking water change and **final cooked batch yield in grams**, serving count or actual plated grams, user custom changes and substitutions.
- Base calculation: `recipe nutrient total = Σ ingredient edible-input g × source nutrient/100 g × validated retention factor (where applicable)`; `per-serving = verified final recipe total / declared portions` or `per-g cooked = total / measured cooked yield`. No generic cooking loss factor if unknown. Cooking with added oil/salt counted when recorded. Distinguish raw vs cooked database records and prevent duplicated retention transformations.
- Recipe created/saved/edited without eaten event; meal log makes immutable recipe revision + exact actual portion snapshot; later recipe revision never rewrites historical logged meals. Portion choice and cooked-vs-raw distinctions visible.
- Support ingredient swap compare, batch scaling, favourites, recurring meals/day templates, filtered search/reuse and simple source metadata disclosure. Full nutrition profile determined by coverage of underlying ingredients, not invented completeness.

### PARITY-2708 — Custom targets and nutrient comparison

- User-configurable daily/meal targets for macro/micronutrients, protein distribution where appropriate and optional amino/fatty subcomponents; distinguished from reviewed DRIs, provider goals and clinical thresholds. Reject unsafe target inference; UL is not a desired target.
- Compare two foods / recipe variants on equal **user-selected gram, energy, or serving basis**, with traceable differences and protected goal/constraint tradeoffs. Permit food-group nutrient density and multi-nutrient filters but display evidence source and denominator; don't rank nonexistent fields as zero.
- Time-series charts display known component subtotals, logged-day coverage, confirmed supplements separately or stacked without double count, and incomplete days as incomplete; avoid fabricated habitual intake.

### PARITY-2709 — Estimated composition (research first, feature-gated)

- Candidate pipeline: parse *actual* ingredient list → verified reference-food identity → constrained nonnegative mixture optimization → macro/label consistency screen → out-of-sample nutrient uncertainty estimate → per-nutrient result with `source=estimated_model`, version, interval, reasons to abstain. No external personal food or sensitive data sent without lawful consent.
- Include brand formulation/fortification, processing and moisture; candidate may fail rather than invent. Test negative examples with two indistinguishable-macro formulations and heavily fortified/unknown ingredients. Label-reported values always win on identity; no source values overwritten.
- Validate on withheld **independently measured** complete profiles, by nutrient/food type and subgroup, including negative controls and dataset leakage; report MAE, bias, p95 error, coverage, failure/abstention, upper-limit false positives and decision reversal rate. Define thresholds before release; synthetic fitting tests alone are insufficient.
- Initially permit opt-in research preview of estimates when legally and technically authorized; **never use an unvalidated estimate to claim deficiency, nutrient excess/UL, medical risk or a direct personal molecular effect**. Comparisons should allow `reported-only` toggle and separately explain estimates.

**P1 EXIT:** Two ingredient variants compared on equal basis; a full cooked-yield batch recipe saved/relogged and revised; leucine, essential AAs, ALA/EPA/DHA and chosen micronutrients display source-native known coverage or explicit unknown; custom targets work without mistaking UL for a goal; estimated data can be disabled and never silently promoted into source-truth.

## 5. P2 — Bloom's biological intelligence advantage

### PARITY-2710 — Source-qualified dynamic nutrient investigations

- Query actual authorized meal/day exposure and supplement confirmations from canonical state, plus appropriately comparable lab trajectories, goals, activity and reviewed genetics/microbiome context **only if scope/consent permits**. Ask useful questions instead of restating that a nutrient changed.
- Existing dynamic investigator generates candidate competing explanations; validate food source IDs, timing, units, data completeness, lab method, intervention evidence, contrary/null studies and user-eligible actions. An LLM must not compute nutrient totals or independently authorize a physiological claim.
- Example: compare a current protein/fibre-rich dinner option to a higher saturated-fat option while protecting energy/protein and tracing observed lipid and exercise context. Do not say a specific dietary change caused an individual's lab response without appropriate causal design.
- Under sparse logging, report the specific missing decision-relevant fact, offer a general safe action, or abstain; never fabricate intake deficits.

### PARITY-2711 — Persistent scientific learning and microbiome research

- Reuse existing `BLOOM_PERSISTENT_SCIENTIFIC_LEARNING_LLM_INTEGRATION_ARCHITECT_DECISION_20261118.md`, reviewed graph, scientific claim and model registries. Distinguish unverified hypothesis, independently checked paper/evidence, scoped approved public knowledge, private observed individual response, simulated metabolite output and model training set/weights.
- Continue active Python reference organism→gene→enzyme→reaction→substrate→produced/consumed metabolite/cross-feeding modelling; food substrate identity matters (e.g. fibre type vs total fibre); never convert a qualitative Viome taxon into measured strain flux.
- Persist rights-cleared nonpersonal knowledge in reviewed immutable manifests and reproducible restores independent of dev DB resets; user records excluded. Scientific releases independently benchmarked, reversible, and withdrawn claims must stay withdrawn. No automatic self-training from LLM answers or personal health records.

### PARITY-2712 — Useful decision benchmark

- For realistic paired cases compare baseline manual tracking + current deterministic suggestions versus added nutrient detail and dynamic investigation. Record grounded calculation precision, eligibility exclusions, false-support/citation claims, specific actions discovered, utility to user, burden, opt-out, latency/cost and abstention.
- P2 is *not* achieved by showing 100+ decorative nutrients or generic microbe mechanisms; at least one meaningful previously non-obvious evidence-grounded meal choice/question must survive independent fact/evidence/claim audit.

**P2 EXIT:** On an authorized test fixture with food/supplement and applicable lab data, Bloom generates a nontrivial, source-correct competing-hypothesis interpretation and one useful eligible meal change or honest abstention; the reasoning has source/claim receipts and correct update/withdrawal after source correction. Research-only microbiome flux remains separate from ordinary recommendation ranking.

## 6. Shared data contracts (illustrative extensions, not a second persistence platform)

```ts
type NutrientFact = {
  nutrientId: string; // canonical chemical/form-specific definition
  sourceNutrientId: string; sourceRecordId: string; sourceRelease: string;
  originalAmount: number | null; originalUnit: string; basis: 'per100g'|'perServing'|'perRecipe';
  servingGrams?: number | null; normalizedAmount?: number | null; normalizedUnit?: string;
  provenanceClass: 'analytical'|'provider_reported'|'calculated'|'model_estimated'|'unknown';
  valueStatus: 'known'|'reported_zero'|'unknown'|'not_applicable'|'ambiguous';
  estimateModelId?: string; uncertainty?: {lower:number;upper:number;method:string};
  sourceRevision: string; scope: 'public_reference'|'private_user_label';
};
type TrackedIntakeReceipt = {
  accountScopedOpaqueId: string; occurredAt: string; recordedAt: string;
  status: 'planned'|'draft'|'confirmed_consumed'|'retracted';
  foodOrRecipeSourceRevision: string; actualEdibleGrams: number;
  componentNutrientRefs: string[]; sourceInputHash: string;
};
type NutrientCoverage = {
  nutrientId: string; knownContribution: number | null;
  knownSourceCount: number; unknownSourceCount: number;
  contributionCompleteness: 'complete_for_logged_inputs'|'partial'|'unknown';
  hasModelEstimates: boolean; loggingCompleteness: 'known_complete'|'partial_or_unknown';
};
```

Source-specific **units and chemical forms must be validated** before aggregation; e.g. amino acid constituent mass and complete protein are not independent addends, and EPA/DHA are subcomponents of fat. Immutable food consumption source versions differ from the latest catalogue record. The current generic `nutrientSourceSnapshotSchema` is narrow and must retain backwards compatibility when expanded, not globally relabel all historical source facts as newly analyzed.

## 7. Implementation slices, owner decisions and acceptance fixtures

| Slice | Implementer/owner | Smallest objective proof | Status now |
|---|---|---|---|
| S0 actual inventory and rights/provenance audit | Codex + Integrations + Biology | File/line/source/table nutrient counts; explicit unavailable/unknown; no duplicate stack | TO VERIFY |
| S1 generic/Canadian source and barcode/search correctness | Codex + Integrations | 50+ test cases, source identity precision, no false GTIN, offline/manual fallback | PROPOSED |
| S2 confirmed food + supplement logging and fast reuse | Codex + Biology + UX | Real DB+UI corrections, source/coverage and account isolation | EXISTING PARTS; VERIFY GAPS |
| S3 full registry and amino/fatty source-native mapping | Codex + Biology | Parent/constituent units, 100+ optional definitions, source completeness and precision | PROPOSED |
| S4 user-owned recipe/yield, comparisons, targets | Codex + UX/Biology | Cooked yield, immutable logged revisions, equal basis and custom targets | EXISTING PARTS; VERIFY GAPS |
| S5 optional estimated nutrient research | AI/ML + Biology; Codex code | Held-out blind nutrient validation; no promotion without evidence/rights | RESEARCH PROPOSED |
| S6 dynamic personal interpretation/meal substitution | AI/ML + Biology + Codex | LLM/hypothesis competing claims with deterministic checks, baseline lift | EXISTING ACTIVE SCIENCE WORK; INTEGRATE |
| S7 persistent scientific release and microbial pathways | Existing Advanced Python/science governance | Rights-cleared releases, fresh restore, withdrawal, reproducible simulation | ACTIVE SEPARATE TRACK |

**Critical cases** (each expected/actual, named fixtures, source revisions, exact SHA, pass/fail/abstain):

1. Same name, different FDC IDs/raw/cooked and Canadian package variant: never silently collapse.
2. 000-prefix GTIN/UPC, failed check digit, contradictory product results and no-authoritative-match: no false exact product hit.
3. Offline/missing API and no AI key: user can create actual food/supplement log and see truthful subtotals.
4. Incomplete branded label lacking choline/leucine: **unknown**; not zero or source-complete, no false deficiency.
5. Known zero on verified label vs not-listed value: distinct status; source-native serving conversion correct.
6. Mixed USDA/CNF source nutrient keys: stable independent identifier and units, no name-only join.
7. Two meals + taken multivitamin + planned omega-3 supplement: only taken contributes; no double counting.
8. Repeated save/retry, edited portion, deleted meal, corrected product formula: no ghost meals or silent historical rewrite.
9. Egg, lentil, chicken and protein powder with partially known AAs: correct grams and coverage; never substitute protein grams as exact leucine mass.
10. Salmon/soy/vegetable oil examples for **reference tests only**: ALA, EPA, DHA and omega-6 separated; a generic PUFA field never supplies missing EPA/DHA. (No seafood recipe recommendations are required.)
11. Recipe mixes raw ingredients then cooked yield and saved leftovers; nutrition scales correctly for plated edible grams; water loss does not create nutrients.
12. Same recipe revised after meal logging: historic consumed snapshot unchanged.
13. Ingredient-mixture estimator fits macronutrients but gets fortification wrong: abstain/large uncertainty, not false micronutrient claim.
14. Misleading model estimate changes an upper-limit status: baseline source-only view preserved and no auto-warning from unvalidated value.
15. Multi-goal dinner tradeoff: protect allergies, protein, energy, time/taste constraints and explicit user selection; proposed not consumed.
16. Sparse food logs with measured lab marker: no 'you are deficient' or deterministic causal attribution.
17. Qualitative stool taxon, no strain gene/source: research education may show, no personal SCFA amount.
18. AI provider 429/timeout/hallucinated number: schema validator rejects; baseline plan/food tracking continues.
19. Revoked source, account switch and delayed AI job: stale cross-account recommendation/report cannot render.
20. Real user fast-log task: independent observer verifies success, time, error rate, accessibility; do not label simulated automation as human acceptance.
21. Source and evidence review/withdrawal: a retracted claim disappears from action ranking, historic trace retained appropriately, unrelated foods still work.
22. Full data upgrade restores original nutrient version and reproducible output for historical replay, no silent change in old meals.

### Practical benchmarks (pre-register numeric thresholds before release; do not invent performance)

- **Identity**: top-1 exact barcode correctness, top-3 food retrieval, false matches, manual fallback rate, Canadian regional coverage with known denominator.
- **Nutrients**: coverage by nutrient × FDC/CNF/source type and quality, source math error by basis/serving, error in external reference fixture, known-vs-estimated proportions.
- **Recipes**: source grammar/portion/yield accuracy, edit/reuse and historic snapshot preservation.
- **Models**: measured-profile blinded MAE/p95/bias/uncertainty coverage and abstention; independent user-value lift vs deterministic baseline, not just better training-set fit.
- **Experience**: real authenticated task success, time to log, correction effort, keyboard/VoiceOver/mobile, source failure handling.

## 8. Cross-agent delivery responsibilities

- **Chief Architect:** treat this as an explicit nutrition parity and advanced-value owner request; reconcile against current Nov 18 science-first execution queue *without losing prior tasks*; map to existing Issues #12/#15, M2/M3/M4, reference provenance, scientific governance, Advanced Python tracks and delivery ledger. No extra queue, new owner checkpoint, separate team/stack, broad Core stop-work gate or unauthorized production change.
- **Codex:** sole implementing engineer. Inspect exact current HEAD and evidence first; amend existing schemas/modules through bounded slices; publish source+CI+real database/browser receipts, actual achieved coverage; record deferred/blocked/provider-rights status narrowly. No auto main merge.
- **Integrations & Data:** USDA/CNF imports, Canadian search, source-release manifests, licences, GTIN exactness, provider fallbacks, historical snapshot contracts; review provider terms before enablement.
- **Nutrition & Biology:** source-native nutrient form/mapping, compositional sums, DRI/UL context, recipe yield/retention validation, protein/AA and fat interpretation boundaries; scientific study evidence and conflicting food rules.
- **AI/ML:** optional estimated composition calibration/benchmark, hallucination filtering, dynamic insight baseline/abstention, assay/source checks, research-versus-release guard and incremental-value evaluation. Existing metered provider and scientific memory contracts only.
- **Security/Privacy:** account isolation, private labels/recipes and third-party processing, sensitive cross-domain data consent, cached/job invalidation; public-reference-only source acquisition, rights/retention.
- **Legal:** official and third-party source rights, Open Food Facts ODbL/image constraints, manufacturer/restaurant reuse, regulatory intended-use for disease-related output. License concerns restrict affected providers/features, not core logging.
- **UX & User Testing:** task-efficient find/scan/verify/save, source vs estimated disclosures, manageable nutrient depth, ingredient comparison and recipe UX; uncoached real-world Canadian tests and accessibility.

## 9. Required Architect closure package (one existing backlog integration)

1. Source-by-source actual **availability and rights matrix**, with version/API/local mode, nutrient and identity coverage, latest source SHA/receipt; no licence assumed from access.
2. **Capability × source × nutrient** coverage and reason-coded missingness report showing what is implemented, available, estimated or not supported.
3. Mapped tasks to current existing files and stable issue IDs, ordered into bounded feature slices without displacing current scientific-learning proof or claiming Core finished.
4. One engineering demonstration of **P0 tracking actual combined food/supplement intake** with reliable source identity, source correction, barcode miss fallback and real user flow.
5. One engineering demonstration of **P1 advanced composition/recipe/compare/target** with scientifically correct missingness and immutable consumed revisions.
6. One independent research example showing **P2 biological insight improvement** versus baseline, with competing evidence and safe action eligibility.
7. Honest release record distinguishing coded, tested, hosted, independently accepted, and future research; permission/rights controls feature-scoped.

## 10. Final science/product decision

**Adopt MyFoodData as a feature and completeness benchmark, not as Bloom's new provider or source of proprietary data.** Source-native detailed nutrition coverage should be improved from USDA FDC and CNF 2026 with robust search/GTIN and actual food+supplement totals. Advanced amino-acid/fatty-acid, recipes, comparisons and targets should reuse canonical nutrition data and expose unknowns. Optional model-imputed nutrients are an R&D capability requiring blind nutrient-level validation, not an automatic measured truth. Bloom's real differentiation is source-correct, evidence-checked biological interpretation integrated with existing labs, goals, microbiome research and durable scientific memory. Research development continues without claiming individual clinical predictions or blocking working daily tracking.

**Reference boundaries:** Public web documentation examined November 18, 2026; current downloads/access rights and endpoints should be rechecked at actual ingestion time. Repository file inspection is not a full runtime audit. The proposed priority ordering is for Architect reconciliation, not an unauthorized rewrite of the current `NEXT_ACTIONS.md` selector.