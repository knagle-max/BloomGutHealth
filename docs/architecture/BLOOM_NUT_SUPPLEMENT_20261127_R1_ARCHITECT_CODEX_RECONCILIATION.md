# BLOOM-NUT-SUPPLEMENT-20261127-R1 — Comprehensive Supplement, Formulation, Comparison & Biological Intelligence

**Owner handoff date:** November 27, 2026. **Authority:** owner-supplied full 33-section product/scientific/UX/implementation directive in the conversation. **Architect disposition:** approve product direction, reconcile against actual source, implement as scoped reusable capabilities. **Status: design/implementation contract; NOT proof of implemented catalogue, scientific review, product approval, source licence, consumer acceptance or release.** This condensed execution document preserves the **entire original 33-section owner directive**; it does not silently replace or truncate advanced future capabilities. `AGENTS.md` governs how Codex works and `NEXT_ACTIONS.md` remains the **sole selected-work queue**, not the STI numbering below.

## Primary consumer outcome

Bloom enables a user to **find a supplement or ingredient → read its real sourced label/formulation and evidence → compare compatible products → add a product to a private personal stack → confirm the amount actually taken in one short interaction → see its source-supported contribution alongside confirmed food intake**, with appropriate review of overlap, relevant cautions and scientific uncertainty. It should work without a paid product database, retail affiliate deal or external AI. A supplement is **not beneficial by default** and a product listing, NPN, genotype or low recorded intake is **not an individualized recommendation**.

**Source identity, formulation and ingestion must be strictly separate:** (1) regulatory product licence/listing (e.g. NPN or DIN-HM); (2) independently sourced or user-confirmed **actual product/label revision**, market/package/GTIN, ingredients, forms, quantities and warnings; (3) user-owned supplement **stack scheduling/intention**; (4) explicit individual **confirmed consumed** amounts/timestamps and immutable captured label version. Neither a licence nor schedule represents a consumed supplement, approved efficacy, confirmed lot testing, present availability or present bottle content.

## Verified current reuse inventory (source-inspected, not full functional QA)

| Existing canonical source | What actual inspected code supports / cautions |
|---|---|
| `server/products.ts` & `shared/products.ts` | Authenticated product lookup, private product/label flows, barcode matching, DSLD and other source-aware product identities. `ProductRef.source` currently enumerates `usda-local/usda-branded/off/dsld/manual`; **LNHPD/NPN is not an enabled source member just by wish**—an extension must cover every resolver, validation, serialization and existing test. |
| `shared/supplement-intake.ts` | Explicit `confirmedTaken:true`, `takenAt`, `confirmedAt`, consumed servings, label-or-unlabelled snapshot, formulation version/batch and mineral basis (`elemental-label/compound-weight/unknown`). Existing explicit intake foundation; **not** proof full personal stack and scheduled adherence already exist. |
| `shared/recorded-intake-sources.ts` | One actor/date/timezone recorded food/supplement event view, with per-source contributions and `eventKind:'food'|'supplement'`, source revisions and chemical-form/mineral-basis fields. Reuse, no second dietary+supplement totals engine. |
| `shared/label-nutrient-sources.ts`, `shared/nutrient-definitions.ts`, `shared/nutrient-coverage.ts`, `shared/nutrition-summary.ts` | Label snapshots and known/zero/unknown/conflicting source coverage. Form-sensitive nutrients have explicit guards; respect original measurement bases and prevent overlap counting. Original `shared/nutrient-source-snapshot.ts` v1 is **USDA-food-specific**, not a universal supplement label snapshot. |
| `shared/supplement-reference-context.ts` | Reviewed narrow vitamin B6 source context including **distinct** reference-UL, labelled-product warning and **proposal** source types; currently **not** a general approved upper-limit/interaction authority for arbitrary nutrients. |
| `shared/biological-model.ts`, `shared/genetics-relevance.ts`, `shared/precision-nutrition.ts` | Existing biological knowledge / genetics / health context; reviewed source, identity, population/consent gate required before new supplement claims. |
| `shared/today-planner.ts`, `server/nutrition-targets.ts`, existing medication records, `shared/products.ts` | Existing general intake/personal context architecture; reuse instead of duplicate doses, schedules, targets or genotype engines. Existing actual file/schemas need reinspection at implementation HEAD. |
| [LNHPD/CNF source-native handoff](BLOOM_CANADIAN_NUTRITION_LNHPD_SOURCE_NATIVE_HANDOFF_20261122.md), [barcode defect contract](BLOOM_SUPPLEMENT_BARCODE_LOOKUP_DEFECT_CODEX_HANDOFF_20261117.md) | Prior authority for Canadian NPN/DIN-HM source identity, exact barcode fallback, product/label/consumption separation and qualified imports. Older “GI-only STOP” is historical; source/rights/clinical/deployment gates remain feature-specific. |

**Not independently confirmed by this source inspection:** complete US DSLD coverage/freshness, actual LNHPD import or NPN search, barcode success across representative current products, current product-label completeness, production stack persistence, certified quality data, pharmacy interaction evidence, multi-product comparisons, actual catalogue size, UI QA, paid-provider status or deployed privacy. Codex must report these as **UNKNOWN/NOT_VERIFIED** until it produces evidence, not label them built.

## Canonical model and source governance

**Canonical ingredient:** nutrient/active identity; compound/chemical form; physiological/biological source; botanical species/plant part/extract ratio/standardized constituent; probiotic genus/species/**strain** and CFU basis; enzyme and specified activity unit; protein and separately sourced amino acid composition. **Do not infer equivalence from an ingredient's display name.** Elemental Mg ≠ magnesium-bisglycinate compound grams; folate ≠ folic acid ≠ 5-MTHF; B12 form distinctions, EPA/DHA vs fish oil mass, standardized curcumin vs turmeric powder, probiotic total CFU vs strain counts, enzyme U vs mg and IU vs mass require exact qualified conversion methods or UNKNOWN. Original label amounts/units and source precision must be retained alongside any compatible normalized estimate.

**Product/formulation:** canonical source/product identity, independent market and licence record, brand/manufacturer, exact manufacturer/label revision, package quantity/GTIN, dosage form, source/observed date, labelled serving size, active and non-medicinal ingredient and allergens, relevant safety warnings, original label/media rights, formulation changes, optional independent certification/lot evidence. No presumption from UPC/GTIN country prefixes, NPN validity to market availability or independent bottle quality, or same name to same formulation.

**Sources:** add independently audited licensed/downloadable Health Canada LNHPD (NPN/DIN-HM licence and dated status), NIH DSLD (US label snapshots, dose/form), Health Canada and NIH ODS nutrient resources, qualified published studies/critical reviews and verified independent testing/certification/recall feeds where permitted, manufacturer labels and user-confirmed package corrections. Each imported release: original URL, version/status/retrieval date, rights/attribution, SHA, validated original/accepted/rejected records, exact parser/mapping, limitation and withdrawal semantics. **Public listing ≠ freely reusable catalogue/label imagery.** Do not imply new provider cost, access, certification or completeness until verified. Manufacturer claim, government regulatory record, analytical lot certificate and reviewed scientific evidence are independent assertion types.

## Product features: progressive, source-grounded

1. **Search/discovery:** full applicable ingredient/product catalogue by form, brand, exact barcode, NPN, category, objective, formulation and relevant label facts. Category supports vitamins/minerals, amino acids/protein, creatine, fatty acids, electrolytes, fibre, pre-/pro-/syn-/postbiotics, digestive enzymes, botanicals, polyphenols, collagen, coenzymes, choline and qualified others. Product objective/marketing claims are **not** proof of outcome. General discovery may show source-uncertain products honestly; don't rank these as indicated treatments.
2. **Ingredient profiles:** What it is, food sources, forms, genuine physiology, reviewed population-specific intervention evidence, intervention form/amount/duration, negative/contradictory findings, adverse effects, known qualified interactions and uncertainty. Essential nutrient function ≠ evidence supplemental intake is beneficial. Studied dose ≠ recommended individualized dose.
3. **Ranking:** distinguish **objective relevance**, evidence, **appropriateness of supplementation**, formulation comparability, label/provenance confidence and individualized safety instead of collapsing into a clinical “best supplement for your condition” number. Full applicable catalogue remains browsable; invalid or risk-relevant items must never be promoted simply due to matching goal or source-derived deficiency speculation. No recommendation solely due to unknown food journal, genotype, microbiome score or a single lab datum. Allow transparent, evidence-aware ranking and stable sort before pagination; no obligatory LLM.
4. **Side-by-side comparisons:** two or more products: exact actives/forms, labelled serving and quantities, elemental vs compound, standardization, probiotic strain/potency basis, non-medicinal ingredients, allergen/warning, jurisdiction/listing/status, evidence applicability, source freshness, **verified** third-party certification, date-marked price and comparable per-serving/per-active-amount cost only when units/form/market support it. **Incompatible measurements appear as “not comparable,” not falsely normalized.**
5. **Private supplement stack:** save, start/stop, pause, as-needed, schedule and formulation changes without recording ingestion. Private account-scoped current/historical versions, optional morning/afternoon/evening/with-meal reminders and notes. Timings only when qualified; no invented circadian “optimality.” Reminders/selected schedule do **not** make a dose consumed.
6. **Confirm intake:** select actual label/formulation, adjust **capsule/tablet/scoop/gram/ml/drop/servings** only when label supports conversion; review timestamp/actual amount; explicitly save. Multi-supplement confirmation may batch safely but must still persist **separate** canonical consumption records with independent IDs and idempotency; preserve correction/deletion/revision/actor boundaries and historical source snapshots.
7. **Combined totals and overlap:** feed existing `recorded-intake-sources` and nutrient coverage with known compatible food/recipe/beverage/supplement intake, distinguishing source, unit, form and total/known/unknown. Never double count product declared total + breakdown or two duplicate source rows. Identify *actual supported overlap quantities* from multivitamins, standalone ingredients, electrolytes, botanicals, stimulants, probiotics and sports blends, without declaring every overlap dangerous.
8. **Qualified reference and interactions:** applicable source-, form-, population- and age-based UL/context; distinguish limits on total intake vs supplemented/fortified-only and regulatory warning vs reference vs proposal. UL **is not a target**; missing unknown ingestion ≠ safely below UL. Clinically meaningful drug–supplement, supplement–supplement and food–supplement interactions require specific reviewed evidence (named drug/ingredient identity, form/timing, severity, source, known limits, withdrawn status) with appropriate professional follow-up. No “no interactions found” safety guarantee or prescription changes.
9. **Biology/longitudinal:** existing reviewed knowledge graph handles cofactor/gene/enzyme/transporter, probiotic strain, fermentable substrate, evidence and retraction. Genotype ≠ measured enzyme activity/deficiency; vendor microbiome score ≠ product need; a supplement doesn't guarantee strain colonization; changing B12 lab ≠ proof of causal supplement effect. Use actual before/after confirmed intake, start/stop dates, confounders, medication/diet changes and accurate biomarker timestamps through existing biological investigator. Appropriate athlete evidence for creatine, protein, EAA/electrolytes/caffeine etc. with sport certification only if independently sourced.
10. **Optional AI:** label parsing and hypothesis proposals remain `CANDIDATE_UNCONFIRMED` until canonical review; may organize product comparisons and summarize qualified evidence, but cannot invent amounts, approvals/certifications, interactions, dosing, diagnoses, source IDs or record actual consumption. No unconsented external private-data transfer. AI-disabled operation is a complete fallback.

**UX/Brand:** Discover ingredient/product → source-labelled detail with active quantities and visible relevant risk → side-by-side compare → Add to Stack or Log Taken → confirm servings → traceable combined nutrient view. Prioritize primary facts and material risk; deeper molecular/clinical research behind intentional progressively disclosed sections. Stack first fold shows current saved supplements, confirmed today, relevant overlapping actives and warranted cautions, **not every speculative interaction**. Reuse actual Bloom UI/Brand tokens and existing primary pages; inspect genuine 390×844 mobile and 1440×900 desktop initial, selection, open detail and secondary/compare states plus 320/768, four themes, zoom, focus, accessibility, retries and account boundaries. Do not commission a new stock product-art family as a prerequisite.

## STI-01–23 programme scope (owner IDs retained; NOT a competing queue)

| ID | Work package | Reuse / tight implementation group |
|---|---|---|
| STI-01 | Existing supplement architecture inventory | Exact source, schema, tests, account/revision and gaps |
| STI-02 | Ingredient and formulation identity | Existing `products` / label snapshot evolution |
| STI-03 | Health Canada NPN data | Audited LNHPD importer/resolver/status |
| STI-04 | NIH Supplement Label Database | Provenance/version/label ingestion |
| STI-05 | User label and barcode | Existing `server/products` private-confirm flows |
| STI-06 | Form/quantity units | Source-qualified elemental and activity mapping |
| STI-07 | Ingredient profiles | Reviewed existing science registry/education |
| STI-08 | Discovery and ranking | Reuse search/product identity, cautious safety |
| STI-09 | Product comparison | Identical formulation source basis safeguards |
| STI-10 | Personal stack | Account-owned intent/schedule, not ingestion |
| STI-11 | Confirmed consumption | Existing `supplement-intake` writer/revisions |
| STI-12 | Combined nutrition accounting | Existing recorded source and nutrient coverage |
| STI-13 | Overlap and upper limits | Extend proven B6-specific proof narrowly, no universal UL |
| STI-14 | Reviewed interactions | Existing medication identities, specialist evidence |
| STI-15 | Scheduling and routine | Saved stack intent; optional reminders |
| STI-16 | Genetic/molecular context | Existing reviewed knowledge graph |
| STI-17 | Microbiome / strains | Existing organism/strain/sources with consent |
| STI-18 | Bloodwork/physiology | Dated sources and alternate hypotheses |
| STI-19 | Athlete supplement context | Distinct quality/sport evidence |
| STI-20 | Scientific evidence / quality | Reviewed outcome + certification provenance |
| STI-21 | Personal response investigation | One existing biological investigator |
| STI-22 | Optional AI label/evidence | Existing privacy/provider metering and validation |
| STI-23 | UX, security, performance, acceptance | Same standing mobile/desktop and provenance tests |

**Stages:** first product/ingredient identity, source and actually consumed stack; second discovery/comparison/combined intake; third overlap/qualified limits/reviewed interactions/schedules; fourth provenance-based biological context and athlete; fifth longitudinal response and advanced future modelling. The stages guide dependencies, **not** the root task sequence or a condition to use valid narrower descriptive work.

## Concrete acceptance matrix (supplement-specific ids)

| ID | Testable requirement |
|---|---|
| STI-T01 | Same NPN and label revision does not imply Canadian availability, current bottle composition, or ingestion; licence status is dated and source-native. |
| STI-T02 | US DSLD and Canadian LNHPD, manually confirmed bottle label and original unmodified historical snapshot remain separate across revisions/countries. |
| STI-T03 | Elemental magnesium vs bisglycinate weight, methyl vs cyano B12, folate forms and fish oil vs EPA/DHA remain distinguished; unsupported conversion is blocked. |
| STI-T04 | Probiotic total vs strain-specific CFU, plant/extract standardization and enzyme activity units don't silently transform into mass or strain allocations. |
| STI-T05 | Search exact verified barcode/NPN/name and unknown/outage fallback do not invent product or label quantities; respect saved private label rights. |
| STI-T06 | Full source-eligible search and cautious ranking retain lower/unknown alignment products; known danger/excluded items cannot auto-recommend. |
| STI-T07 | Side-by-side products reveal compatible amounts only; mismatched forms/units, label dates or unsupported testing appear visibly incomparable/unknown. |
| STI-T08 | Private stack create/edit/pause/stop/schedule without any actual consumption event, and account switch isolates all stack information. |
| STI-T09 | Confirmed half/one/multiple dosage with source-supported conversions produces independent idempotent canonical supplement events and correct historic label. |
| STI-T10 | Combined recorded food + recipe + supplement nutrient totals equal compatible source contributions with unknown≠zero and no product-total double count. |
| STI-T11 | Overlap identifies actually known compatible combined quantities without presenting unconfirmed missing daily intake as zero. |
| STI-T12 | Applicable upper limit or product warning checks distinguish nutrient source/form, regulatory reference vs proposal, age/life-stage, and unknown context. |
| STI-T13 | Reviewed interaction has exact drug/active, known source/severity/applicability; unsupported claims and “no interaction means safe” are suppressed. |
| STI-T14 | Genotype, single biomarker, microbial vendor score, strain listing and marketing outcome never create an unreviewed supplement need or treatment. |
| STI-T15 | Confirmed start/stop/intake and dated labs/observations retain chronology, confounders, original evidence and withdrawable citations without causal inference. |
| STI-T16 | AI disabled and no paid sources still supports existing source-backed discovery, manual label, compare when comparable, private stack and log. |
| STI-T17 | Source version/status/rights/date/attribution, certifications, price date/market and independent testing never silently inherit from manufacturer marketing. |
| STI-T18 | User confirmed corrections/deletions invalidate downstream contributions/caches without reconstructing historical source from today's changing label. |
| STI-T19 | Real 390×844/1440×900 rendered discovery, detail, comparison, stack and logging states are usable, with four themes/zoom/keyboard and important cautions visible. |
| STI-T20 | Security, consent, actor scoping, duplicate-save replay, source withdrawal and unapproved external egress remain protected. |

## First eligible Codex work and receipt

**STI-01 is a bounded source-to-code review plus actual safe implementation candidate**, not an indefinite standalone architecture survey. When selected by existing `NEXT_ACTIONS.md`: determine HEAD and the actual coverage of product search/NPN/DSLD/barcode, label snapshots, user-confirmed consumption, private stack, combined source projections, B6 overlap and actual code tests. Mark `EXISTS / PARTIAL / MISSING / SOURCE_RIGHTS_BLOCKED / NOT_TESTED` for STI-02..23 in **existing status/verification records** without a parallel backlog. Select the *smallest independently safe, genuinely missing reusable vertical*; likely candidates include (a) prove/fix exact barcode→label review→confirmed source flow; (b) robust label/form/elemental amount preservation with source-safe test; (c) personal stack intent vs consumed event test and UI. Include at least one working source-compatible code fix if concrete and eligible; no mandatory full-catalogue/clinician-signoff barrier to valid logging. Tests first for null/zero/unit/label identity and account boundaries, typecheck/build as applicable; record exact SHA and verified result.

**Source rights:** original Health Canada/NIH release versions and usage/licence statements are not independently audited in this handoff; verify before importing. No new paid provider, production DB migration, clinical medication interaction activation or private label export by default. The owner-authored original 33 sections remain the complete scope.

**Nonshipping:** preserve no Render / hosted actions before the December hold is lifted, no `main` merge, unauthorized production writes, external patient data transfer, protected Mac/Tailscale/network changes or unreviewed medical/treatment claims. Documented source-safe code may proceed in isolated authorized development scope. Don't re-open already completed work without a reproducible defect. Persist this exact contract for successor Architects under the standing [UX/Brand governance handoff](../agent-handoffs/BLOOM_STANDING_ARCHITECT_TO_CODEX_UI_UX_BRAND_GOVERNANCE_20261126.md).
