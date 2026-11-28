# BLOOM — External Data, Scientific Coverage & Acquisition
## Preserved-source register, AI/ML amendments and cross-agent implementation handoff

**Document ID:** ML-DATA-20261114-R1  
**Date:** 14 November 2026  
**Author:** AI Intelligence & Personalization Specialist  
**To:** Chief Architect & Integration Lead; cc Nutrition/Biology, Integrations, Legal, Security, UX/Brand, User Testing, Codex  
**Disposition:** **APPROVE WITH TARGETED AMENDMENTS**, retaining every original source ID and requirement family.  
**Status:** Requirements/research review, **not** proof that a listed dataset is downloaded, licensed for a particular deployment, scientifically approved, or implemented. **No source code was changed.**

## 0. Document integrity and scope of amendments

This is the downstream cross-agent handoff corresponding to the Product Owner's complete **“BLOOM — External Data, Scientific Coverage & Acquisition Architecture Handoff,” dated November 14, 2026**, supplied verbatim in the commissioning conversation. **The owner's original is controlling, unamended source material.** This derivative preserves its original **source register rows and IDs**, architecture, canonical data contracts, acquisition exemplars, full 15-scenario acceptance set, three-stage priorities and final five deliverables below. The original full wording, detailed constraints, scripts and owner amendments remain authoritative and should be retained as an archival source in Architect intake; this document does not claim to reproduce the owner's prose verbatim. The sections headed **AI/ML amendment** are additional review annotations, not retroactive alterations to the source. If the Architect packages both, the user-supplied original text must be kept as an immutable Appendix A alongside this review, not silently overwritten.

**Owner's non-negotiable direction:** Do not create another AI service, evidence graph, food/lab datastore, source acquisition platform or user checkpoint. Preserve active work, existing private-data boundaries and automatic fallbacks. **Do not add blanket data-development holds**. Authorized local reference-data acquisition, research curation, synthetic modelling, validation, metadata discovery, and safely bounded non-personal proof-of-concept work should continue independently. A specific external redistributive/public use, unauthorized privileged access, paid provider, new personal-data transmission or clinical claim needs its own applicable checks, not a universal stop-work label.

**Repository documents inspected at moving `enhance/bloom-experience` development branch, 14 November:** `docs/architecture/V06_HANDOFF.md`, `docs/architecture/STRATEGIC_PRODUCT_EVOLUTION_ARCHITECT_DECISION_2026-11-06.md`, `docs/architecture/MICRONUTRIENT_INTELLIGENCE_SCIENTIFIC_ARCHITECT_DECISION_2026-11-06.md`, `docs/architecture/RESPONSE_INTELLIGENCE_V06_ARCHITECT_RECONCILIATION_20261114.md`, `docs/architecture/CROSS_DOMAIN_PRIORITY_INTELLIGENCE_V06_ARCHITECT_ADDENDUM_20261114.md`, `docs/architecture/PYTHON_ML_RESTORATION_AND_MOLECULAR_EXPANSION_DECISION_2026-11-06.md`, `NEXT_ACTIONS.md`. Canonical dependency backlog exists at **`docs/operations/V06_DEPENDENCY_BACKLOG.md`**, not the handoff's outdated `docs/architecture/V06_DEPENDENCY_BACKLOG.md` location. Use these living files, not this report, as ultimate implementation authority after Architect consolidation.

## 1. Executive conclusions and binding clarifications recommended

1. **APPROVE T0–T3 tiering as a capability-dependency framework, not a user/data access switch.** A missing nutrient, allele, assay or source-rights decision can make *that field/claim* unavailable; it does not make independently supported goal-based, food, activity, movement, labs-as-observed, or research education unavailable. Where reference data have missing values, preserve partial results and abstain only on unsupported assertions.
2. **APPROVE local-first authoritative snapshots, optional bounded APIs and curated interventions.** External reference APIs should not receive raw individual health/genetic records. Existing consented importers and internal caching/snapshots remain canonical.
3. **Amend P2 timing:** the `M02–M11` host–microbe–reaction–metabolite source/curation workstream is **active v0.6 parallel Track B**, not parked until all T0/T1 commercial food and laboratory work is complete. Begin with licensed/permitted reference subsets and synthetic or public benchmark scenarios; restrict only the unsupported individual/clinical application of research outputs.
4. **Implement coverage as a query against existing source/claim data** with three axes: *data present*, *scientifically usable* and *eligible to affect a decision*. Do not mistake downloaded rows for independently validated claim coverage.
5. **Measure decision improvement:** for each acquisition justify a tested user scenario, a missing field/identity it resolves, source-match accuracy, source-version fidelity, performance/cost and quality against the current deterministic baseline. Preserve negative/no-improvement evidence.
6. **Reconcile the November 14 owner corrections:** Response Intelligence is **whole-report, multi-analyte**, not TG-only; Cross-Domain Priority Intelligence draws from food, activity, sleep, labs and goals without a measurement-count bias. No second planner or standalone score.
7. **Separate rights status from modelling eligibility:** no automatic public/commercial licensing conclusion; no new paid/production/vendor activation. But scientific and computational work can proceed with lawfully accessible reference metadata, public documentation, permitted local samples, synthetic scenarios and approved existing sources while individual distribution/use questions are resolved. No speculative provider availability claims.
8. **Preserve source-native semantics:** reference data `missing` is not 0, lower bound, deficiency or random model imputation. Relative abundance and pathway/strain annotations do not measure metabolite flux. Genotype association is not a treatment response. Laboratory values require analyte/specimen/method/unit/time compatibility.

## 2. Original owner dependency tiers — retained

| Tier | Original scope preserved | Operational consequence (amendment) |
|---|---|---|
| **T0** | Owned food/meal/activity/goal observations; local generic food composition; reviewed nutrient references; native laboratory identity/units/ranges; reviewed lifestyle claims/actions; dated provenance and consent; deterministic baseline ranking. | Prioritize correctness and source completeness for supported calculations; provide partial/alternative actions instead of global failure. |
| **T1** | Canadian branded/label, more micronutrients, marker libraries, exercise, repeat outcomes, wearables, genetics, taxonomy/pathway context. | Source-specific enrichment; acquire when it improves an existing decision or source review. |
| **T2** | Genetic association evidence, strain genomes, enzyme/reaction/metabolite graphs, microbial reconstructions, food substrate chemistry, metabolomics and benchmarked personal-response modelling. | **Active research-engineering, independently deployable from Everyday release claims**; not a blocker to everyday actions. |
| **T3** | Conditional external restaurant, wearable, clinical, proprietary omics and premium AI providers. | Manual/local fallback; feature-scoped provider terms/cost/consent decision. |

## 3. Complete original source-ID inventory — retained with acquisition intent

The following preserves **every source ID, tier, source/provider, key official URI(s), primary acquisition mode and semantic purpose** in the owner's November 14 register. The original full per-row source text/constraints are additive and controlling; this table is a retained operational data register, not a replacement of detailed source clauses. Status labels here are **verification scope**, not installed/rights-accepted status. `SOURCE VERIFIED` means documentation/page observed, never installed.

### 3A. Food, nutrients, labs and activity (`N01–N07`, `L01–L04`, `A01`)

| Original ID | Original reference and canonical URL | Acquisition; preserve original limits | AI/ML verification or note |
|---|---|---|---|
| **N01 T0** | USDA FoodData Central [download](https://fdc.nal.usda.gov/download-datasets/); [API](https://fdc.nal.usda.gov/api-guide/) | Local pinned Foundation/FNDDS/other types + bounded server Food Search/Details. Retain FDC ID, data type, nutrient ID/unit/basis, branded edition/formulation. | Official default API **1,000 requests/hour/IP**; key server-only. Types are not interchangeable. |
| **N02 T0/T1** | Canadian Nutrient File 2026 [official](https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data/canadian-nutrient-file-about-us.html); [catalogue](https://open.canada.ca/data/en/dataset/1b6139bd-ed7e-4043-bc28-ff00e10f3109); [all-files ZIP](https://open.canada.ca/data/dataset/1b6139bd-ed7e-4043-bc28-ff00e10f3109/resource/019f2a90-e3a9-489d-b6e1-f74f4ba1d006/download/cnf_fcen_all-files-data_2026.zip); [documented API](https://produits-sante.canada.ca/api/documentation/cnf-documentation-en.html) | Pin **relational** Food Name/Source/Group, Nutrient Name/Amount/Source, Measure Type/Name/Weight Conversion, 2026 guide. Preserve food codes and missing cells. | **SOURCE VERIFIED:** 2026 data is downloadable; Health Canada says older searchable **2015** UI still serves as interim interface. Do not infer CNF API serves 2026. CNF is not a branded SKU database. |
| **N03 T0** | Health Canada [DRI tables](https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables.html) | Curated local age/life-stage EAR/RDA/AI/UL/CDRR/AMDR/EER, appropriate chemical forms; UL ≠ target, below AI ≠ deficiency. | Support an *adequacy eligibility* method, never automatic diagnosis or exact intake from missing nutrition data. |
| **N04 T1** | Manufacturer/brand nutrition labels; user-entered recipes and product snapshots | User-confirmed private labels, GTIN/market/variant/date/servings/grams, recipe yield, missing nutrients, ingredient/allergen source. | Original private labels do not imply rights to publish a global commercial branded corpus. |
| **N05 T1/T3** | [Open Food Facts API](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/) | Optional API `GET /api/v3/product/{gtin}` + separate v2 search; Canada/serving/quality source review; manual fallback. | Preserve original **feature-scoped rights-not-activated** status; research/documentation work can proceed. ODbL/database and image licence obligations must be scoped. |
| **N06 T3** | Canadian restaurant menus; candidate HealthyFastFood, FatSecret, Menu-FLIP, Nutritionix, official restaurant info | Only genuinely supported/appropriately licensed supplier, source-specific Canadian menu/portion/date; manual restaurant entry available. | No fabricated integrations/endpoint promises. |
| **N07 T1** | [FoodOn OLS](https://www.ebi.ac.uk/ols4/ontologies/foodon); [OWL release](https://purl.obolibrary.org/obo/foodon.owl) | Optional versioned local identity ontology, food-state/preparation crosswalk. | Food type does **not** determine nutrients or recipe composition. |
| **L01 T0** | User's laboratory report and source lab intervals | Keep original analyte/specimen/method/value/unit/date/reference context and immutable revisions. | Lab-specific interval is not synthesized from literature and cannot be silently replaced. |
| **L02 T0/T1** | [LOINC downloads](https://loinc.org/downloads); [LOINC terms](https://loinc.org/get) | Licensed pinned local terminology by component/property/timing/specimen/scale/method; optional controlled API. | **SOURCE VERIFIED:** v2.83 dated August 19, 2026; LOINC identification is not interpretation/reference ranges. |
| **L03 T0** | [UCUM](https://ucum.org/); [NLM UCUM](https://ucum.nlm.nih.gov/) | Local trusted compatible-unit conversions. | Numeric convertibility does not override incompatible assay or specimen/method. |
| **L04 T0/T1** | Marker-specific literature/guidelines from R01–R05 and lab/professional material | Curated local marker-family claims for lipids, glycaemia, liver, CBC/iron, B12, renal etc.; effect variability, nulls, context, clinical/education boundary. | **Must serve full lab reports with source-safe observations even when claim coverage incomplete; no universal TG-driven prioritization.** |
| **A01 T0/T1** | [Canadian 24-Hour Movement Guidelines](https://csepguidelines.ca/) and reviewed exercise/sleep evidence | Locally reviewed general guidance, age/population, dose as studied, constraints and uncertainty. | Actual activity ≠ generated calorie burn; cross-device workout/step duplication control. |

### 3B. Research and evidence updates (`R01–R05`)

| Original ID | Reference | Acquisition and retained constraints |
|---|---|---|
| **R01 T0** | [NCBI E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25499/) | Server-only periodic `esearch` → `esummary/efetch`, PMIDs/DOIs/version/abstract/retraction; 3 requests/s without key by stated guidance; research queries contain no person-specific health/genetics. |
| **R02 T0** | [Europe PMC REST](https://www.ebi.ac.uk/europepmc/webservices/rest/) | Curation discovery; bounded search/page metadata, PMID/DOI/PMCID dedup; open-access full text only within article licence. |
| **R03 T0** | [Crossref REST](https://api.crossref.org/) | DOI metadata/updates/corrections/withdrawals, polite contact and quotas; metadata not study-effect verification. |
| **R04 T1** | [ClinicalTrials.gov API v2](https://clinicaltrials.gov/data-api/about-api) | Optional study registration/results discovery and null-publication reconciliation; registration is not outcome efficacy. |
| **R05 T0** | Reviewed authoritative guidelines and primary intervention literature | Existing versioned `evidenceClaim` + `approvedAction` records with **intervention as studied, comparator, population, outcomes, harm, uncertainty, contradictions, reviewer/revision**. AI extraction cannot self-promote. |

**Original proposed cadence retained:** weekly correction/retraction checks for active claims; monthly candidate research discovery; quarterly structured review or faster for consequential changes. This is an **internal operating target, not a provider SLA or automated promotion gate**.

### 3C. Genetics (`G01–G07`)

| Original ID | Reference/URL | Acquisition and interpretation limit |
|---|---|---|
| **G01 T1** | [dbSNP](https://www.ncbi.nlm.nih.gov/snp/) | Pinned subset for rsID/merged IDs/assembly/position/alleles; unknown build/strand must remain unknown. |
| **G02 T1** | [Ensembl REST](https://rest.ensembl.org/) | Review-time variation/VEP lookup, local reviewed annotation; assembly, palindromic allele, effect-allele checks. |
| **G03 T1** | [GWAS Catalog REST v2](https://www.ebi.ac.uk/gwas/docs/programmatic-access/rest-api/) | Curated studies, ancestry/population, effect allele/estimate and trait metadata; **v1 retired August 2026, use v2 only**. Association ≠ personalized response to food. |
| **G04 T1/conditional** | [ClinVar](https://www.ncbi.nlm.nih.gov/clinvar/docs/access/) | Curated variant assertions, conflicts, submission/review status, CNV/indel coverage limitations; no automatic clinical advice. |
| **G05 T2/optional** | [gnomAD](https://gnomad.broadinstitute.org/) | Curated allele-frequency/quality data, no person-level ancestry inference from an allele. |
| **G06 T2/conditional** | [PharmGKB](https://www.pharmgkb.org/); [CPIC](https://cpicpgx.org/) | Professional/educational PGx research only pending specific licence/clinical intended-use review; phase/CNV/haplotype absent from typical consumer file. |
| **G07 T1** | Original consented genetic file: 23andMe/VCF/vendor | User-native alleles, build, genotype, missing/ambiguous tokens and revocation; **APOE isoform needs both defining SNPs**, many HLA/repeats/CNV/haplotypes not derivable from one rsID. |

**Original completeness rule retained:** count *catalogued, observed, harmonized, scientifically reviewed and intervention-eligible* independently; avoid artificial variant-count goals or double-counting correlated FADS loci.

### 3D. Microbiome, host-microbe pathways and molecular models (`M01–M11`)

| Original ID | Reference/URL | Acquisition and interpretation limit |
|---|---|---|
| **M01 T1** | Private Viome/vendor PDF or supported JSON | Original reported category/taxon/date/assay; do not transform provider qualitative status into abundance, strain, gene expression or measured metabolite; no raw private file sent to external research API. |
| **M02 T1** | [NCBI Taxonomy](https://www.ncbi.nlm.nih.gov/taxonomy); [GTDB](https://gtdb.ecogenomic.org/downloads) | Pinned identifiers/synonyms/ranks/versions; explicit provider/taxonomy crosswalk with ambiguity; do not assert named species is genome-resolved strain. |
| **M03 T2** | [UniProtKB](https://www.uniprot.org/help/api) | Scoped reviewed/computational gene/protein/EC/organism-strain annotations; expression not inferred. |
| **M04 T2** | [Rhea](https://www.rhea-db.org/help/download) | Reaction IDs, substrates/products, stoichiometry, direction, compartment and transport bounds. |
| **M05 T2** | [ChEBI](https://www.ebi.ac.uk/chebi/downloads) | Chemical identity, charge/form, synonyms, isomer fidelity; chemical names are not interchangeable. |
| **M06 T2** | [Reactome](https://reactome.org/ContentService/) | Source-scoped host pathway and species/human-specific assertions; no false microbe↔host pathway transfer. |
| **M07 T2** | [InterPro](https://www.ebi.ac.uk/interpro/); [NCBI RefSeq](https://www.ncbi.nlm.nih.gov/refseq/) | Reviewed strain/protein-family/reference sequence annotations; homology ≠ expression or individual function. |
| **M08 T2** | [MICOM](https://micom-dev.github.io/micom/); [AGORA2](https://www.digitalmetabolictwin.org/reconstructions); [VMH model archive](https://www.vmh.life/files/reconstructions/AGORA2/) | Pinned Python solver/reconstruction versions and permitted model files; theoretical exchange/cross-feeding/production and consumption, with bounds, mass balance, benchmarks and explicit reference conditions. **Active v0.6 research Track B.** |
| **M09 T2/conditional** | [MetaboLights](https://www.ebi.ac.uk/metabolights/); [Metabolomics Workbench](https://www.metabolomicsworkbench.org/) | Permitted independent reference study/assay dataset with compartment, concentration/measurement limits, timing, population, units, rights; no user concentration inferred. |
| **M10 T2/conditional** | Food substrate/fibre chemistry from reviewed papers and licensed food-chemistry sources | Preparation-specific fermentable fractions, resistant starch, polyphenols, culture/reaction bounds; never `fiber g → exact personal flux`. |
| **M11 T2/optional** | [FoodOn](https://www.ebi.ac.uk/ols4/ontologies/foodon) + compound/reaction crosswalks | ID-specific Food/CNF/FDC→chemical→ChEBI/Rhea→gene/enzyme/strain links; recorded evidence quality, separate measured host outcomes. |

**Original research distinctions preserved:** taxon occurrence ≠ strain/genome identity; enzyme annotation ≠ expression; substrate availability ≠ uptake; reaction feasibility ≠ actual in vivo flux; modelled community production ≠ stool/plasma measured concentration; receptor mechanism ≠ validated food intervention; simulated benefit ≠ approved personal health claim.

## 4. Original engineering contracts — retained and minimally strengthened

### 4.1 Existing manifest and evidence-link contracts (original field names retained)

```ts
export type DatasetManifest = {
  id: string;
  sourceUri: string;
  mode: 'download' | 'api-snapshot' | 'human-reviewed';
  release: string;
  retrievedAt: string;
  checksumSha256?: string; // public/reference bytes only, NEVER raw private user PDF
  schemaVersion: string;
  providerTermsUri: string;
  rightsDecision: 'approved-scoped' | 'review-required' | 'blocked';
  rightsReference?: string;
  selectedTablesOrScope: string[];
  rowCounts?: Record<string, number>;
  validationReceipt?: string;
  scientificReviewer?: string;
  supersedes?: string;
};

export type EvidenceLink = {
  targetEntityId: string;
  relationship: string;
  sourceDatasetId: string;
  sourceRelease: string;
  sourceRecordId: string;
  evidenceClaimId?: string;
  evidenceClass: 'observed'|'association'|'experiment'|'mechanism'|'simulation'|'reviewed-action';
  populationOrModel?: string;
  reviewedStatus: 'draft'|'approved'|'restricted'|'withdrawn';
  limitations: string[];
};
```

**AI/ML amendment:** adapt these to existing canonical source/evidence/version/consent records rather than introducing new tables. Use a read-only/derived *coverage index* with fields such as `capabilityId`, `sourceRequirement`, `datasetRelease`, `identityResolution`, `scientificUseScope`, `actionEligibility`, `privacyPurpose`, `sampleCoverageDenominator`, `failureReason`, `benchmarkReceipt`. These may be a view/derived report; do **not** require additional persisted copies of personal observations.

### 4.2 Original data acquisition patterns retained

1. USDA FDC: authenticated **server-only** search/details; API key never browser-visible. Example `GET /fdc/v1/foods/search?query=rolled%20oats` with key (or documented POST); ensure provider data type, nutrient IDs, amount basis and edition retained.
2. CNF 2026: download the official all-files ZIP from N02 in a controlled ingestion job; checksum, inspect ZIP members and 2026 Users Guide, stage/validate relational joins and activate a versioned snapshot. Never silently mix the older 2015 API into the 2026 snapshot.
3. PubMed/Europe PMC/Crossref: server-only scheduled **non-personal** research search; versioned candidate claims and correction/retraction checks; reviewed evidence, not automatic approved action.
4. Ensembl/GWAS v2/dbSNP: curator-controlled reference lookups without uploading user genotype; retain assembly/allele and build uncertainties.
5. Source job: `fetchBounded → parse → validate → stage immutable snapshot → review applicability and rights → atomically switch active version`, with last reviewed snapshot preserved for rollback and historic replay. **Do not turn public-source acquisition into a per-user wait on an external API.**

These are existing owner examples and safe operational semantics, not evidence connectors are live. Use bounded payload/network, safe egress hosts, retries, licence attribution and separate owner/source permissions.

## 5. Original decision-context refinements (`D01–D06`) — retained

| ID | Original owner requirement retained | AI/ML extension |
|---|---|---|
| **D01** | Date-aware exposure/context timeline, occurredAt vs recordedAt; diet, movement, medication/supplements and illness, fasting and precollection details; absence unknown. | Derive no change exposure from no records; add temporal exclusion for observations recorded after outcome but concerning earlier dates unless source confirmed. |
| **D02** | Representative food/day coverage, actual vs planned supplements, no food-log subtotals as actual usual intake. | `coverage` enters recommendation eligibility and confidence separately; do not use data richness as surrogate for health priority. |
| **D03** | One operational coverage index of claim identity, direction, study/population, null/contradictions, licence/review/action state. | Add graph-edge evidence provenance and `canExplain` vs `canRank` vs `canSimulate` computed permissions. |
| **D04** | Ask whether a missing datum changes a decision; no genetic testing compulsion. | Use decision-value ablation: choose the *one* missing detail most likely to alter an eligible action, not a global intake checklist. |
| **D05** | One top action and up to 3 nonredundant alternatives, deterministic safety first, equal consideration across goals, no global lab score. | Candidate families should be ranked based on goal relevance, evidence and feasibility, not whichever domain has most measurements or literature edges. |
| **D06** | Exact micronutrient/form/assay limitations, no calculated composition imputation disguised as observed. | Source coverage matrix per nutrient/food type and method; optional model-estimate fields remain separate and cannot pass source completeness checks. |

## 6. AI/ML amendments (ML-DATA-2101–2108) — implementation-ready

| ID / phase | Change and reuse | Acceptance / proof | Owner |
|---|---|---|---|
| **ML-DATA-2101 / P0** | **Capability-to-source join** over existing V06 source/claim catalogue; row per computation and specific required data identity/edition, permission, scientific use and fallback. No new DB engine. | Produce accurate `supported / supported-partial / scientifically-unqualified / source-unavailable` verdicts for 15 original fixtures, with reason-coded omitted claims and useful independent actions preserved. | Architect + Integrations + ML |
| **ML-DATA-2102 / P0** | **Dataset source and feature version handshake.** Extend source manifest, dataset schema and calculation receipts; original and current source snapshots intact. | Snapshot A→B changes result only on explicit re-evaluation, no silent historical food rewrite; audit `sourceRelease`, `mappingVersion`, nutrient/form basis and missingness. Offline/stale API uses valid cached version. | Integrations + Codex |
| **ML-DATA-2103 / P0** | **Scientific claim/action provenance coverage:** index existing claim registry, not second graph; source population, direction, controls/nulls, allowed role in explanation vs action vs research. | Missing/withdrawn/unreviewed source cannot silently support an *approved action*; independent reviewed alternatives still work. Graph edge imported from publication cannot self-activate personal advice. | Biology + ML |
| **ML-DATA-2104 / P0** | **Whole-report response & cross-domain priority context.** Respect Nov 14 all-marker decision and one cross-domain ranker. Separate evidence strength from reliability of recorded personal data and actual feasibility. | Two report families + activity/food with unequal record counts: high relevant effect not suppressed by data quantity; no TG-only pathway; identify exactly which marker claims lack reviewed evidence; avoid causal certainty. | Biology + ML + UX |
| **ML-DATA-2105 / P0/P1** | **Real user-value verification:** Today→concrete dinner based on breakfast/lunch and goals; lab report→safe evidence-supported interpretation; maintain existing editable review and exposure timeline. | 15 owner acceptance cases, synthetic source fixtures, source-safe portions/grams, nullable nutrients, allergies hard veto, chosen ≠ performed. Verify no silent label/source retro-mutation. | Codex + UT + Biology |
| **ML-DATA-2106 / active v0.6 Track B** | **Molecular reference dataset ingestion and model coverage.** Reuse one versioned gene/strain/enzyme/reaction/metabolite graph and existing private Python research service; acquire *permitted* small releases of M02–M11, prioritizing one fully documented producer-consumer/cross-feeding case. | At least one real source-identified reference model (not just synthetic LP), reproducible mass balance/direction, substrate bounds, negative control and sensitivity; logged model/reconstruction/solver version and source licence scope; failure and unmatched organism states remain explicit. | ML + Biology + Integrations + Codex |
| **ML-DATA-2107 / active v0.6 Track B** | **Biological optimization and validation.** Two-objective demonstration: maximize theoretical desired production while monitoring undesired co-products/cost/feasible substrate, compare baseline, robust parameter ranges and abstain when no measured calibration. | Pair approved substrate-reference variants with theoretical outputs; verify Pareto/non-dominance or constrained trade-offs, mass balance, sign, uptake bounds, cross-feeding; do not claim predicted *personal concentration* or alter normal nutrition ranking. Model baseline must include simple literature/substrate method. | ML + Biology + UT |
| **ML-DATA-2108 / P1** | **Measured incremental value and regression/rights checks.** Offline scoring, coverage denominators, source health, change/retraction/rights-scoped copy, claim/application version rollback. | Publish matrix of before/after source-matching accuracy, nutrition coverage, lab panel applicability, evidence-supported actions, latency/storage and false personal claim rate; 0 fabricated unknown→zero, 0 violated hard allergies; research can keep operating in appropriately approved environment when a specific public integration is not yet enabled. | Architect + Integrations + Security/Legal + UT |

**No newly requested owner decision** for the above within already approved v0.6 scope. New paid provider, unrestricted raw personal-data export or public clinical feature activation remains a separately scoped decision.

### 6.1 A proposed minimal source-capability contract (extension only)

```ts
type DerivedCapabilityReadiness = {
  capabilityId: string;
  inputSnapshotRefs: string[];
  requiredReferenceReleases: string[];
  coverage: { supported: string[]; unknown: string[]; notComparable: string[] };
  scientificEligibility: 'general_wellness'|'reviewed_personal_wellness'|'education'|'research_simulation'|'withheld';
  allows: { explanation: boolean; normalActionRanking: boolean; researchSimulation: boolean };
  abstentionReasons: string[];
  safeFallbackActionIds: string[];
  evidenceClaimVersion: string;
  computedAt: string;
};
```

**Design clarification:** `allows.researchSimulation === true` does **not** imply `allows.normalActionRanking === true`. A private synthetic/research result does not create a new patient measurement; a consumer source-list taxon is not a verified strain; a modelled molecule is not a measured human metabolite. Do not infer release tier solely from whether the backend can compute numbers.

## 7. Preserved original 15 acceptance scenarios + targeted extension

The original owner test suite is preserved **without deletions**. All outcomes must be tested where applicable against current *actual* source/revision, not silently supplied invented data.

| # | Original test case — expected behavior retained | Further AI/ML assertion |
|---|---|---|
| 1 | Goals only, without labs/omics/wearables/food source yields feasible general evidence-supported action. | Prove no compulsory cross-domain data. |
| 2 | Canadian breakfast+lunch → concrete dinner, source-backed ingredients/grams/portions, exclusion veto, editable review, never auto-eaten. | One baseline comparator, one realistic alternate. |
| 3 | Missing iodine/choline from label remains unknown, not zero/deficiency/exact DRI adequacy. | Verify per-nutrient source coverage metadata. |
| 4 | Conflicting food snapshot versions/market branded variants shown and frozen historical eaten snapshot not rewritten. | Versioned source replay/rollback. |
| 5 | Planned supplement not confirmed taken does not count consumed; form and elemental distinctions before upper-limit statement. | Temporal planned/actual separation. |
| 6 | Complete Canadian 30+ lab report retains all originals; meaningful multiple marker families compete, TG is not privileged; assay/date comparability. | Ranked action considers supported whole panel, and unreviewed rows remain viewable. |
| 7 | Retrospective exposure/fasting context has occurredAt and recordedAt; exclude post-collection exposures; correction invalidates derived output. | No post-outcome attribution leak. |
| 8 | Missing APOE defining SNP no isoform, ambiguous palindromic/build no false flip, correlated FADS no independent multiplication; source viewable. | No genotype-only food action. |
| 9 | Qualitative microbiome taxon supports qualified educational info, not numeric SCFA flux, actual abundance or microbial vitamin amount; unknown substrate edges withheld. | Explicit `canExplain` not `canRank`/personal `canSimulate`. |
| 10 | Source strain/enzyme/Rhea/ChEBI reaction, producers/consumers, mass balance, negative controls, sensitivity and licence receipt; research-labelled only. | **Active** v0.6 Track B milestone with executable Python reference solver and baseline comparison. |
| 11 | Multi-goal, sparse food/richer activity yields nonbiased domain ranking, one real action with alternatives. | Ablate extra data; ranking does not reward measurement-count. |
| 12 | API outage uses approved local snapshot; correction/retraction invalidates affected claim/explanation; no stale inference. | Preserve unaffected actions and pinned previous data for historical replay. |
| 13 | OFF/restaurant feature not activated by API response/flag alone; saved/manual alternatives work. | Dataset rights decision feature-specific, not generalized source acquisition failure. |
| 14 | No raw genetic/Viome/lab source sent to research APIs; deletion, source/account/consent change invalidates active derived outputs. | Independent test of no outbound personal payload, including model benchmarking. |
| 15 | Genuine human task study across mixed goals, food/activity/lab/omics; user understands action, source, uncertainty, alternatives. | Record actual human evidence vs automated PASS separately. |

**Additional focused cases, not replacing originals:** P16 known calorie-only food does not populate sodium/folate; P17 mass conversion meal grams→substrate flux disallowed without compound/uptake evidence; P18 Rhea exchange model producing a molecule cannot assert stool concentration; P19 AGORA2 model strain mismatch does not silently substitute a species; P20 source rights pending cannot cause global outages to already supported actions or permitted internal nonpersonal R&D; P21 retracted trial withdraws only affected claim permissions, leaving unrelated claims; P22 entire panel with liver/iron/lipid signals picks relevant supported non-TG next action when appropriate.

## 8. Original architecture, acquisition and delivery sequence — retained

**Original sequence retained as Owner text intent:** P0-1 source inventory → P0-2 reference minimum → P0-3 Today dinner and full-panel lab user-value gates → P0-4 knowledge-coverage view → P1 optional enrichment → P2 advanced research datasets. **Amendment:** P2's *reference research acquisition and executable modelling* may begin concurrently with P0 steps, with a small, licensed/permitted subset; its *personal action activation* remains subject to evidence and claim scope. This removes artificial sequential waiting while preserving priorities.

**Original Chief Architect required outputs retained:**

1. **External Data Dependency Register** — all `N/L/A/R/G/M` source IDs or merged canonical identifiers; provider release, exact acquisition, terms, scope, refresh, owner and actual status.
2. **Capability × Source × Scientific Coverage Matrix** — function, required inputs, source editions, claim eligibility, missing behavior, deterministic fallback, tests and environment.
3. **Source Rights Decision Log** — distinguish documentation/research access, local ingestion, commercial public use, cache/redistribution/derived outputs and image rights; classify actual intended use, not only URL availability.
4. **Minimal Codex delta assignments** — code paths and source/consent/claim benchmarking, no duplicate APIs/planners.
5. **Real measured coverage report** — only meaningful denominators, exact inspected population/dataset/version; unknowns and mismatched methodology are reason-coded. **Architect must also preserve original requirement #6:** separate specified, obtained, rights-cleared, scientific-reviewed, implemented, tested, deployed and real-user-validated statuses.

**Original source IDs counted and preserved:** `N01–N07` (7); `L01–L04` (4); `A01` (1); `R01–R05` (5); `G01–G07` (7); `M01–M11` (11); total **35 named source entries**, plus `D01–D06`, original 15 acceptance scenarios, illustrative `DatasetManifest` and `EvidenceLink`, scripts/patterns and 11 official source categories indexed by the source register. The commissioning original contains the complete command syntax and should be archived verbatim by Architect alongside this data-preserving crosswalk.

## 9. Provenance-verified source notes and pending verification

**Direct verification on 14 November 2026, limited to named official pages:**
- USDA [FDC API](https://fdc.nal.usda.gov/api-guide/) documents Food Search + Details, API key and default 1,000/hour/IP.
- Health Canada's [CNF landing page](https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data/canadian-nutrient-file-about-us.html) confirms 2026 relational CSV distribution, 5,993 foods and up to 173 nutrients, and 2015 searchable interface continuing as an interim tool; [Open Canada catalogue](https://open.canada.ca/data/en/dataset/1b6139bd-ed7e-4043-bc28-ff00e10f3109) lists the exact all-files archive and table resources.
- [GWAS REST v2](https://www.ebi.ac.uk/gwas/docs/programmatic-access/rest-api/) is the supported service; v1 retired August 2026.
- [LOINC release notes](https://loinc.org/kb/loinc-release-notes) confirm v2.83 August 2026, with two listed CSV errata relevant for exact ingestion; see source before installing a bulk vocabulary.
- [MICOM documentation](https://micom-dev.github.io/micom/) describes microbial-community exchange, abundance-aware modelling and growth/cooperation trade-offs; its publication and Python package do not validate personal flux.
- [AGORA2 public archive](https://www.vmh.life/files/reconstructions/AGORA2/) exposes version folders; **model-file use rights and independently assessed model fit are still to be established for the intended activation.**

**Not independently confirmed in this report:** any installed CNF 2026 release or its working table joins; all dataset licences and permitted uses; AGORA2 model-file rights; current full source count in Bloom's database; user-specific data coverage; viability/flux benchmark; real-world clinical effects; running live 2026 APIs under Bloom credentials. Do not mark these verified based on this handoff or generic provider pages.

## 10. Cross-agent implementation assignments (delta only)

- **Chief Architect (decision):** map all 35 original source IDs and ML-DATA-2101–2108 into `docs/operations/V06_DEPENDENCY_BACKLOG.md`, `V06_HANDOFF.md`, November 14 cross-domain and full-panel owner decisions and existing GitHub Issues. Choose a small source-backed end-to-end P0 vertical slice and parallel Track B reference case; avoid new owner gates.
- **Nutrition/Biology (science):** select exact high-impact lab analyte families, review source-version and claim/effect applicability, DRI chemical forms and nutrients, resolve producer/consumer and strain evidence for one metabolite reference model, record contradictory/null studies; distinguish observation, associative explanation and approved wellness action.
- **Integrations (source acquisition):** enumerate actual installed USDA/CNF/DRI/LOINC/UCUM and food/genetic/microbe reference rows, access methods and snapshots; design provider-source edition and old-to-new mapping receipts; bounded, reproducible import; never blanket fail when API is down.
- **Legal/Regulatory (specific use):** source-by-source licence/redistribution/caching/commercial/figure/model terms as intended, clinical vs educational claim boundaries. No broad “data work halted” disposition where lawful noncommercial/internal reference research can proceed.
- **Security/Privacy:** strict separation of public reference acquisition from private accounts, consent, source-locked derivations, account deletion/export and research viewer; no external user-PHI query; no silent production/premium activation.
- **UX/Brand:** one specific source-grounded action with uncertainty and alternatives; editable meal review and full-panel review, source labels and case-specific unknowns; research viewer clear theoretical/reference/simulated identity, not an apparently measured personal value.
- **User Testing:** verify 15 original acceptance cases + focused 16–22; denominator-based scientific comprehension and meaningful action; separate automated, actual hosted and independent human evidence.
- **Codex:** implement only Architect-reconciled delta; inspect current files and receipts; source-aware import/validity/snapshot/receipt, no new source database/AI graph; extend one existing Python private research path in parallel, test synthetic+reference and preserve v0.5/main production guarantees.

## 11. Final Specialist disposition

**APPROVE WITH TARGETED AMENDMENTS, NO NEW GENERAL DATA-BLOCKING REQUIREMENT.** Preserve all original source candidates and the owner's exact detailed wording in Architect provenance. Execute local source acquisition and genuine scientific computation in parallel where safe, prioritize source-backed food and whole-report lab user usefulness, maintain research simulation scope and explicitly separate computed possibility from measured personal biology and released clinical advice. This handoff is **not** a second architecture or permission to introduce a paid provider, expose personal data, bypass a source licence or activate clinical claims. No new Product Owner decision required for scoped research and existing approved engineering.