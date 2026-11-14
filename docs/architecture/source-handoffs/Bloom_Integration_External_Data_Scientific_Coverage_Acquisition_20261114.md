# Bloom — Integration & Data Review: External Data, Scientific Coverage & Acquisition

**Document ID:** INT-DATA-20261114-R1  
**Date:** 2026-11-14 (America/Regina)  
**To:** Chief Architect & Integration Lead  
**From:** Integrations & Data Specialist  
**Source reviewed:** `Bloom_ML_External_Data_Scientific_Coverage_Acquisition_Review_2026-11-14.md`, document `ML-DATA-20261114-R1`, 41,520 bytes, shared Library.  
**Disposition:** **APPROVE WITH TARGETED REVISIONS**. This is a source, code and feasibility review, not licence counsel approval, live installation, independent clinical review, external-provider activation or completed model acceptance.  
**GitHub reference:** `knagle-max/BloomGutHealth` branch `enhance/bloom-experience` observed at `73fd3c59ad881f27f00cdf9703fee4ef986d6140` (2026-11-14 18:12:09 UTC). Branch is mutable. No application code, production data or provider settings modified.

## A. Executive integration decision

Approve the handoff's original **35 named source IDs (N01–N07, L01–L04, A01, R01–R05, G01–G07, M01–M11)**, the **T0–T3** capability-dependency framework, **D01–D06**, the **15 original acceptance scenarios**, and **ML-DATA-2101–2108** as *refinements* to existing v0.6 source/evidence contracts. Preserve the unamended original Product Owner handoff independently; the AI/ML derivative explicitly says it is not the full verbatim original. Its proposed seven extra scenarios (P16–P22) are useful additive cases, not replacements.

Make five focused architectural decisions:

1. **Three orthogonal statuses, not one source-present flag:** (i) source material located/downloaded and schema validated; (ii) identified/versioned/methodologically usable for a particular claim/calculation; (iii) commercially/legally, scientifically and consent-wise permitted for a particular *use*. A dataset can be locally installed but prohibited for a proposed commercial display; conversely one unlicensed source must not disable unrelated actions.
2. **Source acquisition ≠ evidence approval:** link source records to existing evidence/claim review and personal eligibility systems, not direct recommendations. A publication about bacterial metabolism does not prove personal microbial flux; a FoodOn food class does not provide nutrient composition.
3. **Restore real coverage measurements:** report supported rows and tested joins with denominators and dates. A public provider webpage, a code adapter, a configured key, a synthetic fixture and a deployed working integration are different proof classes.
4. **CNF 2026 and LOINC 2.83 deserve narrow high-value acquisition pilots** rather than wholesale indiscriminate copies or a new source database. Neither should silently alter historical USDA meals or original lab values.
5. **Active parallel molecular Track B:** begin permitted reference annotations/biochemical-model testing alongside practical food/whole-lab work; restrict personal biological model output and higher-risk claims, not all technical research.

Do not add an independent evidence graph, second nutritional total, new AI acquisition agent, whole-Bloom go/no-go flag, additional paid vendor, clinical claim activation or a compulsory source-onboarding questionnaire.

## B. What has been inspected / proof boundary

### Current code/docs observed at exact SHA
- `server/products.ts` (blob `8738cfade1feea60f03d5f5f336fb131810b54b2`) already has local USDA FNDDS fallback, optional USDA Branded client and server-side key, explicit 10 s request timeout/3 MB download cap, product-source errors, saved/manual label paths, and `BLOOM_OPEN_FOOD_FACTS_APPROVED` OFF activation gate. This verifies adapter code, **not** a working USDA key, legal approval, Canadian barcode coverage, live API test or commercial OFF permission.
- `shared/nutrient-source-snapshot.ts` (blob `ff448a89529c176117c479e8b73c1cb382ad1e78`) captures source-specific **generic USDA** 21-nutrient source snapshots with immutable per-100 g fields, separate unknown and source-reported-zero, version and unit. It **does not cover CNF** and is not a multi-provider ingestion manifest.
- `docs/operations/NUTRIENT_DEFINITION_SOURCES.md` (blob `6d2364e2b688ee0482a6897b30e82adad51c5c8c`) documents a current 21-field nutrient definition projection: source chemical form/units cautiously interpreted; **CNF mappings remain null**; missing iodine and other fields must not be synthesized; canonical historical values remain untouched.
- `docs/operations/LAB_MARKER_REFERENCE_CONTENT.md` (blob `a914fa5f97d98c9582cd83183fa9b6cd58563eb9`) documents 14 basic marker explanations plus appropriate source/assay limitations; this is **not** installation of the full LOINC vocabulary or qualified clinical interpretations.
- `docs/operations/SYNTHETIC_MOLECULAR_RESEARCH.md` (blob `a934b63ab040cf32915b23fdbad462b583ba419e`) and the Python `ml_service/research/stoichiometry.py` establish a small **synthetic exact-rational LP**, **not** an AGORA2/MICOM calibrated human gut reconstruction, mass/charge-validated microbial reaction network or personal metabolite concentration predictor. Existing broad evidence-graph links are not genome-resolved enzyme identities.
- `docs/operations/FUNCTIONAL_ORGANISM_RESEARCH.md` documents a source-cited *Ruminococcus bromii* context for a specific topic, not systematic annotation of all user organisms or validated individual production.
- `docs/operations/V06_DEPENDENCY_BACKLOG.md` is the actual dependency backlog path (not `docs/architecture/V06_DEPENDENCY_BACKLOG.md`). It documents v0.5 merged and current phase 0/1 v0.6 governance. Earlier `ML-DATA-20261114-R1` corrects this path.

**Not established:** a working CNF 2026 imported/queried database, complete DRI/LOINC/UCUM installations, GWAS v2/dbSNP canonical bulk corpus, AGORA2 model rights and imported model files, coverage denominators, current live API quotas/keys, real hosted cross-domain output, clinical claim clearance, any independently benchmarked microbiome model or full rights review. Repository file inspection does not prove absence of hidden external managed data; enumerate actual deployment/source inventories before marking `not installed` conclusively.

## C. Full 35-ID source disposition for Architect register

Key: **CODE** = code/documented internal functionality observed; **REF** = external reference documentation identified, no working local installation verified; **PRIVATE** = authorized user-data source path, not a public provider feed; **GATED** = rights/contract/privacy activation pending; **RESEARCH** = source/technical feasibility only. These are **scope indicators**, never certification of a whole source family. “Rights” always apply to specific reuse/redistribution and public deployment, not to a URL alone.

| ID | Source and original tier | Evidence / current feasibility | Proposed action / gate |
|---|---|---|---|
| N01 | USDA FoodData Central T0 | **CODE** local FNDDS, optional USDA Branded adapter; live credentials unverified | Pin exact FNDDS/FDC release, numeric nutrient IDs, portions, branded edition; test one current API search/detail and deterministic manual fallback |
| N02 | Canadian Nutrient File 2026 T0/T1 | **REF** official 2026 *relational CSV*, 5,993 generic foods, up to 173 nutrients; 2015 searchable interface is not 2026 release | Acquire officially distributed ZIP as *one reproducible, nonpersonal local pilot*; validate food/measure/nutrient/source joins, missing cells, bilingual identity, terms, source version; never treat as Canadian GTIN catalogue |
| N03 | Health Canada DRI T0 | **REF** official tables; existing nutrient metadata incomplete for adequacy | Curated age/life-stage EAR/RDA/AI/UL etc., form/unit/population/version and not-diagnosis rules; crosscheck Biology |
| N04 | Labels/recipes T1 | **CODE** user-owned saved label and meal review | Keep private variants, GTIN-market-formulation, ingredient/serving source, timestamps and correction history; no shared branded corpus without rights |
| N05 | Open Food Facts T1/T3 | **CODE + GATED** adapter flag disabled pending legal approval | Licence-specific ODbL/DbCL/images/attribution/cache/share-alike analysis; keep manual and USDA paths |
| N06 | Canadian restaurant menus T3 | **GATED** no verified licensed national provider | Preserve manual source-backed entry; source-specific Canada menu/portion rights needed for future activation |
| N07 | FoodOn T1 | **REF** ontology for food states/identities | Versioned optional crosswalk; never infer nutrient composition from ontology class |
| L01 | Original user labs T0 | **CODE** owned source/revision/units handling | Preserve method/specimen/collection/reference and private identity; do not send labs to discovery services |
| L02 | LOINC T0/T1 | **REF**, v2.83 released Aug 19 2026; full local installation unverified | Free commercial licence is conditional, access/account needed; pin exact release, read errata for CSV files, validate component/specimen/method and local mapping confidence |
| L03 | UCUM T0 | **REF** standard conversions, partial app handling | Versioned subset and dimensional tests; analyte/assay incompatibility still blocks comparisons |
| L04 | Marker-specific evidence T0/T1 | **CODE** 14 general marker descriptions only, no full medically reviewed coverage | Incremental full-panel claim library with method/date/population, no TG-only bias and clear unreviewed-original visibility |
| A01 | Canadian movement guidance T0/T1 | **REF + CODE** existing activity source records | Link exact guideline population/version without converting workout time into observed calorie expenditure |
| R01 | NCBI E-utilities T0 | **REF** official research API | Nonpersonal searches, key/limits, PMID/version/retraction and no clinical self-approval |
| R02 | Europe PMC T0 | **REF** scholarly metadata/OA within licence | Deduplicate DOI/PMID/PMCID and full-text usage rights; preserve corrections |
| R03 | Crossref T0 | **REF** DOI metadata and updates | Citation/reference version and withdrawal; metadata alone does not establish effects |
| R04 | ClinicalTrials.gov API v2 T1 | **REF** results discovery | Study registration vs posted results vs efficacy; timestamp/source notes |
| R05 | Reviewed guidelines and trials T0 | **CODE** evidence contracts exist, review completeness unverified | Studies, nulls, harms, populations, reviewer and claim permission before ranking |
| G01 | dbSNP T1 | **REF** rs/merge/assembly reference | Reviewed subset only, never guess build or alleles |
| G02 | Ensembl REST T1 | **REF** variant annotations | Curator lookups, no raw user genotypes transmitted; pin assembly/response |
| G03 | GWAS Catalog REST v2 T1 | **REF** v2 cited; v1 retired per original handoff | Pin v2, ancestry/trait/effect allele; association not personal dietary effect |
| G04 | ClinVar T1 conditional | **REF** assertion/conflict status | Educational/reviewed restricted clinical use; no diagnosis or PGx actions |
| G05 | gnomAD T2 optional | **REF** frequency/quality | Population-level frequency, no individual ancestry inference |
| G06 | PharmGKB/CPIC T2 conditional | **REF + GATED** PGx domain | Exact data rights and qualified clinical gates before any use of prescriptions/clinical interpretations |
| G07 | Raw user genetic files T1 | **PRIVATE + CODE** consented genotype/source paths | Preserve notation, build/strand, missing genotype, CNV/repeat/haplotype limits, revocation |
| M01 | Viome PDFs/JSON T1 | **PRIVATE + CODE** bounded qualitative import source path | Never send raw PDF to reference APIs; preserve reported labels and method limits; private source privacy approval separate |
| M02 | NCBI Taxonomy/GTDB T1 | **REF** taxonomy/name crosswalk partial | Version rank/synonyms/mismatches; species not automatically strain |
| M03 | UniProtKB T2 | **REF/RESEARCH** protein and EC annotation | Reviewed strain/sequence/confidence before linking expression or function |
| M04 | Rhea T2 | **REF/RESEARCH** curated reactions; CC BY 4.0 with attribution per official source | Pin download/release/stoichiometry/direction/atom checks; no clinical permission implied |
| M05 | ChEBI T2 | **REF/RESEARCH** chemical forms | Preserve charge/protonation/stereo/compound identifiers, legal scope and mapping version |
| M06 | Reactome T2 | **REF/RESEARCH** host pathways | Enforce organism/tissue/method and literature; no false cross-species transfer |
| M07 | InterPro/RefSeq T2 | **REF/RESEARCH** sequence families and genomes | Annotation/genome ≠ measured gene expression; isolate approved reference releases |
| M08 | MICOM/AGORA2/VMH T2 | **RESEARCH + GATED** synthetic LP observed; curated AGORA2 not installed/rights-cleared by this review | Parallel small source-specific reference benchmark, model-level rights, solver, mass/charge and cross-feeding, not personal flux |
| M09 | MetaboLights/Workbench T2 conditional | **REF/RESEARCH** independent assays | Dataset-specific consent/rights, specimen/units/normalization and validation cohort |
| M10 | Food substrate chemistry T2 conditional | **REF/RESEARCH** preparations differ | Measured/validated substrate composition and bounds; fibre grams not exact fermentable flux |
| M11 | FoodOn ↔ molecules ↔ Rhea T2 optional | **RESEARCH** mapping programme | Evidence per edge and chemically identified form; never convert ontology link to personal efficacy |

## D. Verified external-provider details and legal caveats

**Canadian Nutrient File 2026** — The official Health Canada landing page confirms 5,993 foods and up to 173 nutrients in downloadable relational CSV; the browser/search view is still 2015. This is an authoritative **generic** Canadian composition candidate; the source does not establish SKU formulation or completeness for every nutrient. See https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data/canadian-nutrient-file-about-us.html and https://open.canada.ca/data/en/dataset/1b6139bd-ed7e-4043-bc28-ff00e10f3109. Exact ZIP terms/edition and changes need a local audit; don't infer that a downloader URL alone grants every right.

**LOINC** — Official v2.83 August 19 2026; bulk ZIP download requires a (free) logged-in LOINC account, and is governed by the LOINC licence. The current official licence permits commercial use without fees *under defined terms* (including preserving native fields and restrictions on creating a competing observation ID standard). The 2.83 official release notes identify CSV issues: malformed `ComponentHierarchyBySystem.csv` line 90302 and `PartRelatedCodeMapping.csv` row 13795; implement documented mitigation and a versioned patch receipt, not silent editing. See https://loinc.org/downloads, https://loinc.org/kb/license, https://loinc.org/kb/loinc-release-notes.

**Rhea** — Official CC BY 4.0 with attribution and explicit scientific/medical disclaimer. This supports a narrow legally reviewed reference-reaction ingest, but does not validate biological flux or automatically clear any associated independently licensed model. See https://www.rhea-db.org/help/license-disclaimer.

**OFF** — Database ODbL, contents DbCL, images CC BY-SA with possible additional third-party rights; distinct cache/derivative/combined-database obligations. Existing `BLOOM_OPEN_FOOD_FACTS_APPROVED` gate remains off pending Legal's actual use determination. See https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/.

**AGORA2** — Public VMH index exposes versioned downloads (2.00 and 2.01 at reviewed page), but index access is *not* proof of commercial model-file/derivative permission, corpus provenance, exact stoichiometric validity or predictive performance. See https://www.vmh.life/files/reconstructions/AGORA2/.

**Food and lab sources** — Never treat standard common unit name or food alias as a safe automatic mapping. LOINC identity and UCUM convertibility do not establish interchangeable reference intervals. A source code alone is insufficient to establish cooking form, sodium added, folate activity equivalents, active B12, dose consumed, or micronutrient adequacy.

## E. Targeted amendments to ML-DATA-2101–2108 (not a duplicate roadmap)

| Existing ML ID | Integrations disposition / precise acceptance addition |
|---|---|
| **2101** | **APPROVE/REFINE**: return three independent flags (`materialAcquired`, `scientificUsability`, `usePermission`) plus `coverage` by exact field and reason. An uninstalled source cannot be displayed as ready; one blocked claim cannot blank Today. |
| **2102** | **APPROVE**: dataset manifest must log canonical URL, vendor release and fetch time, file/selected table checksums for public reference bytes, schema/normalizer/review version, terms edition, rights decision for each intended use. Explicit rollback restores prior source snapshot without rewriting already-saved meals/lab/genotype observations. Never hash private raw PDF in a public acquisition ledger. |
| **2103** | **APPROVE**: source-claim linkage and staged action eligibility; retired/retracted material invalidates only dependent permissions, not all user history or unrelated actions. |
| **2104** | **APPROVE**: whole-lab panel source coverage includes per-marker original label/analyte identity/specimen/method/units/observed date and review state. All markers visible even when only a subset has approved explanations; no data-rich-domain bias. |
| **2105** | **APPROVE**: two functional vertical slices: Canadian breakfast+lunch→source-backed editable dinner, and one realistic >30-row lab panel→safe whole-panel interpretation (not diagnosis). Test actual duplicate/missing source and original persistence, not only deterministic mocks. |
| **2106** | **APPROVE WITH GATES**: parallel limited Rhea/ChEBI/taxon ↔ curated model-source scenario acquisition allowed within rights; model and genome strain-mismatch explicitly unresolved. Real rights and scientific validation before any external/model file reuse or individual output. |
| **2107** | **APPROVE RESEARCH ONLY**: report mass-balance, uptake/sign, substrate and consumer constraints; distinguish `synthetic`, `reference_model`, `measured_assay`; model flux cannot become personal concentration or food-ranked efficacy. |
| **2108** | **APPROVE**: publish coverage denominators and actual source/provider/version, type of validation, negative cases, rights/claim status, latency/cost. No global metric formed by counting downloaded rows. |

### Minimal derived source-readiness payload (recommend reusing existing contracts)

```ts
type SourceReadiness = {
  sourceId: string;                  // N01..M11 OR mapped existing ID
  datasetRelease?: string;          // undefined until actual obtained
  sourceRecordCount?: number;       // sampled/validated, never inferred from website
  material: 'not-fetched'|'metadata-only'|'downloaded'|'validated-snapshot';
  identity: 'unresolved'|'partial'|'resolved-for-scope';
  rightsByUse: {
    localResearch: 'approved'|'review-required'|'blocked';
    commercialService: 'approved'|'review-required'|'blocked';
    redistribution: 'approved'|'review-required'|'blocked';
  };
  scientificUse: 'unreviewed'|'education'|'reviewed-wellness'|'reference-simulation'|'withheld';
  permittedPurposeIds: string[];
  evidenceRevision?: string;
  acquiredAt?: string;
  validationReceipt?: string;
  missingFields: string[];
  fallback: 'local-pinned'|'manual'|'not-applicable';
};
```

This is a **derived contract/view**, not a demand for a new persisted table. Rights values are authoritative only after Legal/authorized assessment; `approved` is not self-awarded from publicly available data. Separate public reference lineage from account-owned observations and model run lineage.

## F. Release/test gates — finite executable cases

1. **N01/N02 version conflict:** two similar oats sources with different portion/nutrient bases retain original source, user selection and market; saved meal remains pinned when catalogue refreshes.
2. **N02 relational joins:** downloaded ZIP member list, names, file digests, 2026 guide/edition, key uniqueness and join cardinality; measure conversion preserved; missing row remains null rather than silently zero.
3. **L02 errata:** pinned 2.83 parsing with documented patch receipt, nonaltered official LOINC IDs and collision assertions; no claims that a source code alone yields a lab reference range.
4. **L01 full report:** 30+ panel across liver/lipids/iron/B12/glycaemia where present; every raw source row navigable, unsourced marker excluded from reviewed claim but never deleted or set normal.
5. **D01 time precedence:** retrospective entry's *occurredAt* and *recordedAt* separate; future outcome unavailable for earlier explanation, correction invalidates dependent action only.
6. **N04 supplement overlap:** planned dose not recorded as taken; elemental vs compound forms unknown unless source supports; no false nutrient totals.
7. **M02/M08 research:** genus/species/strain mismatch and wrong chemistry forms block uncertain reconstruction; producer, consumer and cross-feeding example has signed constraints, mass-balance, negative controls, sensitivity and versioned model.
8. **M08 model firewall:** simulated number stays in reference-only result; cannot enter real user gut metabolite concentration, nutrient totals, clinical flags or ranked action; denial/timeout returns no fabricated zero.
9. **N05/N06 disabled providers:** OFF/restaurant API request/flag alone cannot authorize production reuse; USDA/manual fallbacks intact; no outbound PHI to literature/ref APIs.
10. **All source families:** deletion, revocation, withdrawn claim, changed food release or correction invalidates only dependent active findings; historical records preserve the original observed or source-native value.
11. **15 original acceptance cases + P16–P22:** Architect retains actual detailed inputs/outputs and exact source rights / study-level gates; synthetic/hosted/human/qualified review reported separately.
12. **No broad activation hold:** a licence delay for one dataset does not block permitted source curation, independent T0 general wellness or permitted synthetic research.

## G. Dependencies, severity and priority

| Issue / deficiency | Severity | Risk | Exact dependency | Minimum correction | Priority |
|---|---|---|---|---|---|
| CNF 2026 full dataset/joins not shown installed | P1 feature gap, **not current outage** | Canadian generic coverage less complete | Download permission/edition, importer join QA, checked source-to-recommendation path | One bounded pilot, pinned ZIP/keys/nutrient basis/source snapshots | v0.6 T0/T1 |
| LOINC 2.83 full vocabulary not shown installed | P1 source gap | Incorrect assay/code conflation if auto-mapped | Logged-in download licence, specific member files and errata | Curated marker subset first, ambiguity handling and versioned mapping | v0.6 T0/T1 |
| 21-field USDA nutrient definitions only | P1 coverage | Missing iodine/choline/alternate forms may otherwise look like 0 | Biology-approved nutrient definitions and real source rows | Coverage metadata + unknown state; no synthetic amounts | v0.6 T0/T1 |
| Research molecular solver synthetic only | P1 Track B R&D | Mathematical result mistaken for measured gut output | Curated allowed strain/reaction/model data, reference assay, rights and Biology | One source-linked model benchmark; no personal activation | v0.6 T2 |
| OFF/restaurant data rights unresolved | External activation gate | Database reuse/territorial infringement | Legal's actual use review/provider agreement | Keep disabled and source-backed manual workflows | T3 later |
| Historical source/version/retractions coverage matrix not yet shown | P1 contract gap | Stale estimates or invalid claim permissions | Existing graph, storage and dataset manifests | Derived coverage audit with exact denominators and withdrawal tests | v0.6 crosscutting |
| External API key/availability unknown | Environmental validation, **not defect proven** | Misleading “connected” claims | Operator key/deploy/source logs and consent | Report configured vs working vs rights-cleared separately | T1/T3 conditional |
| Clinical/PGx/personal flux interpretation | Restricted activation | Unsupported health decisions | Qualified science/legal/security review | Default deny; preserve everyday actions and education | Later |

## H. Handoff to Chief Architect — binding choices requested

1. Record **APPROVE WITH TARGETED REVISIONS** for `ML-DATA-20261114-R1`, and preserve the owner's original Nov 14 source handoff verbatim as independent provenance.
2. Integrate all 35 source IDs and D01–D06 with existing v0.6 IDs and `docs/operations/V06_DEPENDENCY_BACKLOG.md`; do not create another requirement/evidence ledger.
3. Assign the smallest two user-value slices (Canadian mixed-source dinner and whole-lab panel) and one parallel Track B producer-consumer reference model. Require versions/rights/coverage and tests for each.
4. Authorize only already-approved bounded research and existing-source engineering; no new paid/production operations or provider contracts. Legal is accountable for specific rights; Biology for interpretation and approved intervention; Developer for code; Security for privacy; User Testing for real task comprehension.
5. Require an actual runtime coverage inventory before declaring any 2026 CNF, LOINC 2.83, GWAS v2 or AGORA2 ingestion complete; retain existing manually usable features during acquisition.
6. No new owner product decision is needed for scoped acquisition review and non-personal, permitted synthetic research. Any new expenditure, rights commitment, production health-data transfer, or clinical output remains separately authorized.

## Source citations and inspection limitations

**Requested handoff:** private Library `Bloom_ML_External_Data_Scientific_Coverage_Acquisition_Review_2026-11-14.md` (ML-DATA-20261114-R1; 41.5 KB). Exact source was reopened and read. This derivative is its Integration Specialist review, not a silent replacement of original text.

**Official webpages separately consulted 2026-11-14:**
- CNF: https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data/canadian-nutrient-file-about-us.html
- LOINC: https://loinc.org/downloads ; https://loinc.org/kb/license ; https://loinc.org/kb/loinc-release-notes
- Rhea: https://www.rhea-db.org/help/license-disclaimer
- Open Food Facts: https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/license-be-on-the-legal-side/
- AGORA2 public index: https://www.vmh.life/files/reconstructions/AGORA2/

No files downloaded from CNF/LOINC/AGORA2, no licensing agreement accepted, no authenticated USDA call, no production/database inspection, no actual model benchmarking, no independent medical/legal conclusion or code changes. The inspection establishes implemented code/docs and official source terms only to the degree stated.