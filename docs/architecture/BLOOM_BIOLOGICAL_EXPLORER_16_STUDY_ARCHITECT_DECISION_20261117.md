# Bloom — Biological Explorer: 16-Study Scientific Review — Chief Architect Implementation Decision

**Owner/science source:** November 17, 2026, revised v1.1.  
**Disposition:** **APPROVE WITH BINDING SCIENTIFIC, IDENTIFIER, EVIDENCE, RIGHTS, SOURCE-CONTEXT AND RELEASE LIMITS.** This is an actionable Codex specification, not implementation confirmation or independent primary-paper validation.  
**Preserved originals:** [Complete three-part owner and Biology handoff](../agent-handoffs/Bloom_Biological_Explorer_Full_Handoff_16_Studies_Revision_2026-11-17.md), including Part A original, Part B **BIO-EXP-01–49** and Part C **BIO-EXP-50–67**; [actual 16-study importable CSV matrix](../scientific-seeds/Bloom_Explorer_16_Study_Coverage_Matrix_2026-11-17.csv). Preserve original full source and all ten pathway fixtures A–J.  
**Implementation:** Codex on `enhance/bloom-experience`, under `AGENTS.md` and the *only* active selector `NEXT_ACTIONS.md`.  
**Date-sensitive research:** Each of the 16 candidate studies is **source-literature to verify**, not approved published scientific claims. Exact study methods, endpoints, harms, primary/secondary results, rights and current correction/retraction status must be checked against originals before public-specific claims are activated. The GLP-1 discussed paper (#14) and microbiome-intelligence MR (#15) remain unresolved identities, not arbitrary guesses.

## 1. User-visible outcome, scope and what is NOT being built

**Explore makes real biological mechanisms understandable and useful without inventing a personal finding.** Users can search by goal, scientific topic, enzyme, organism, metabolite, pathway, food and study. One selected topic should answer:
1. **What is it and why might it matter?** One clear evidence-qualified insight.
2. **What is scientifically known?** Relevant reaction participants, necessary conditions, branch points and human-vs-laboratory evidence.
3. **What do my data actually show?** Only authorized source measurements at correct resolution, including "not measured" where appropriate; no assumption from reported genus.
4. **What can I reasonably do?** Independently approved, practical action only when applicable and safe, otherwise useful explanation and abstention.
5. **Can I follow future research?** Optional private interest in meaningful reviewed updates, not an assumption that following equals targeting/increasing the enzyme.

**Consumer-first:** The default page shows succinct useful interpretation, no large raw graph, no sixteen giant equally weighted study cards, no permanent new tab or multi-section dashboard. Supporting explanation and focused pathways are on demand; deep layers retain original chemistry, molecular identity, study result tables, uncertainty, sources, licensing and negative evidence. Preserve the premium Explore imagery and shared Bloom design assets, but don't start another general UI redesign.

**Not authorized:** a separate biological graph/research crawler or scientific AI system; personal enzyme, bile acid, SCFA or GLP-1 flux based on taxonomy alone; auto-targeted longevity/cancer/cognition/hormone treatments; unvalidated protein restriction or micrometabolite optimization; user-data-based external publication queries; clinical claims derived from abstract-only summaries; a special BSH-only visual template/algorithm.

## 2. Verified existing repo integration points vs required changes

Read-only GitHub branch inspection during this review shows:
- `shared/biological-model.ts` — canonical `BiologicalRegistry` with entities, directional relationships, evidence references and schema; **extend its typed graph vocabulary and source validation**, don't replace it.
- `shared/evidence-network.ts` — linked pathway/substrate/organism/variant nodes and broad evidence relation classes; these are scaffolding, **not** independently validated stoichiometric reactions.
- `shared/scientific-contracts.ts` — global claim types and audit helpers, including `relationshipClaimKind` currently returning `inferred-association` for all existing graph edges; **this is insufficient to promote distinct human RCT vs mouse intervention vs null endpoint**. Add qualified claim/result projection while preserving old read interfaces and no upgrade of legacy evidence.
- `shared/science-coach.ts` — current curated literature and pathway vocabulary; legacy content is not automatically approved as a new exact reaction.
- `client/src/pages/Explore.tsx` — existing Explore search and registry/node selection, and Food composition link; extend its reading/navigation progressively, preserve existing functionality and visual assets.
- `shared/meal-intelligence.ts`, existing Food intake and protected goals/plan guidance — connect to **existing approved action candidates**, not a second personal recommender or new nutrient total.
- `docs/scientific-seeds/Bloom_Microorganism_Catalogue_Seed_v1.json` and `docs/architecture/BLOOM_MICROORGANISM_CATALOGUE_ARCHITECT_DECISION_20261117.md` — 190 provisional organism reference entries; **shared organism identity only after taxonomic review**; never make duplicate reference copies per study.
- `docs/architecture/BLOOM_GENERALIZED_BIOLOGICAL_INTELLIGENCE_ARCHITECT_DECISION_20261116.md` — existing generalized discovery/evidence rules and staged V06-LIVE-EXT/UPD, V06-12/13 mapping. Use as scientific engine authority.
- `AGENTS.md` — latest owner directive requires **implementation-ready specs with Codex coding autonomy**, science-first 80/20 approximate effort, ordinary-first interface, no app-wide redesign.

**Evidence status:** These are source-level inspection facts, not evidence of live application implementation or hosted acceptance. Codex must inspect actual current HEAD, existing migrations, evidence data and tests. Any proposed paths/types below are **binding semantic requirements but illustrative code shape**. Existing better-equivalent contracts may be used and reported.

## 3. Required five additive capabilities (not five new engines)

### EXP-16-F01 — Study-specific intervention/exposure identity
Add a source-qualified typed definition of intervention/exposure with preparation and formulation:
- Exact material: whole-food pattern vs isolated substrate/nutrient vs *live* species/strain vs **pasteurized/nonviable strain/preparation** vs engineered laboratory bacterium vs drug vs bundled lifestyle program.
- Stable organism/strain/formulation/preparation/canonical molecular IDs when verified; dose, route, timing, duration, adherence actually observed, comparator, processing, batch where meaningful, participant context and version.
- **No inheritance**: stool `Akkermansia` detection ≠ received pasteurized *A. muciniphila* MucT; mouse engineered strain ≠ ordinary consumer probiotic; a scheduled supplement ≠ actual administered dose; bundled ZOE programme effect cannot be attributed to one ingredient.

### EXP-16-F02 — Trial/study **result**, not a paper-level "positive" flag
Record each outcome result separately, with:
- Study DOI/PMID/PMCID and publisher/preprint/correction chain; source snapshot/rights/review state.
- Study design and population, inclusion/exclusion, animal/in-vitro/human distinction, arms, exact intervention, comparator, time/follow-up, outcome ID/units, primary/secondary/exploratory status, preregistration and sample attrition/missingness where reported.
- Reported effect sizes/uncertainty/p-values when independently verified, harm/adverse/negative/null outcomes, sponsor/funding conflicts and incompatible populations/estimands. Unknown numeric data remain null.
- **Scoped conflicts:** only compare/combine genuinely corresponding populations/interventions/comparators/outcomes. Different studies' glucose prediction, weight loss and glycemic response are **not interchangeable outcomes**.
- A null primary endpoint must not disappear because an exploratory endpoint improved.

### EXP-16-F03 — Predictive model evidence separate from **benefit of acting**
For model claims retain model target, feature availability, training/holdout/external validation, calibration, cohort/population shift, comparator baseline, licensing and supported deployment scope. Separately track trials showing that applying model-guided advice improves **real human outcomes**. Predicting postprandial response with meaningful discrimination does not establish superior long-term weight loss. No default personalized prediction without independent validation using actual Bloom input sources.

### EXP-16-F04 — Specific molecule/reaction/compartment identity
Preserve precise chemical structure distinctions: conjugated versus unconjugated bile acids; positional/stereo isomers (e.g. isoalloLCA vs related forms), host BA–MCY conjugates, Rhea/ChEBI/EC/UniProt identities, host vs microbial catalysts, source-experimental scope, reaction substrates/products/cofactors/stoichiometry/direction, transport and intestinal versus hepatic compartments. Unknown coefficient/gene/kinetic constant stays unknown. No graph traversal that silently turns a species → gene → enzyme → metabolite → clinical benefit into a causal personal fact.

### EXP-16-F05 — Evidence conflict/withdrawal scoped to exact question
Store sources and results with version/retraction/correction/negative/harm flags, conflicts grouped by equivalent estimands, evidence review state and dependent claims/actions. Independent reviewer approves claim promotion; a literature crawler or LLM extraction may only create a **candidate**. A correction/retraction invalidates *affected* outputs and followed-topic digests without deleting unrelated evidence. Public lookup never sends private health/profile inputs to publishers.

## 4. Study-by-study release matrix — preserve all sixteen, no invented confirmations

The [canonical source matrix](../scientific-seeds/Bloom_Explorer_16_Study_Coverage_Matrix_2026-11-17.csv) identifies each topic, reference and minimum acceptance. **Use that actual CSV, not a synthetic replacement.**

| # | Specific scientific release test | Negative / uncertain interpretation to preserve |
|---|---|---|
| 01 BSH aging | Bile salt hydrolase → conjugated substrate deconjugation; distinct human observational longevity cohort and aged-mouse engineered intervention results | No human survival benefit, no verified personal BSH activity or targeting action |
| 02 Pasteurized *Akkermansia* MucT | Verify randomized trial's exact strain and pasteurized processing, actual comparator and weight-maintenance endpoints | Stool abundance or live bacteria cannot be substituted for tested preparation |
| 03 Protein/amino acid restriction | Review-level nutrient sensing and human adequacy/age/activity/pregnancy considerations | Do not prescribe low protein for longevity against muscle/adequacy goals |
| 04 Bile acid HSDH → AR/immune | Correct isomer, cellular receptor, tumor/mouse model and evidence tiers | No cancer, anti-PD1, testosterone or clinical hormone treatment advice |
| 05 Mouse host–microbe metabolic model | Compartment-/tissue-scoped rodent model, omics assumptions, measured vs predicted | No individual human biological age or metabolic decline |
| 06 ZOE METHOD RCT | Bundled diet/lifestyle exposure and specific primary/secondary endpoints | No attributing whole intervention to microbiome, meal algorithm or one nutrient |
| 07 SCFA community model | Ex-vivo/culture validation and inferred flux distinct from actual measurements | No measured personal SCFA production based on bacterial composition |
| 08 Urolithin A conversion | Ellagic acid/ellagitannins, metabotypes, community-level culture/LC-MS | Correlated species not independently proven causal producer |
| 09 Personal Diet Study | Record comparator and **null primary weight-loss superiority** (reported P=.16) | Do not treat glycemic prediction accuracy as successful weight-loss intervention |
| 10 Centenarian novel bile-acid biosynthesis | Strain-specific isoalloLCA reaction and centenarian enrichment distinct | No inferred lifespan benefit |
| 11 Microbiome–diet–cardiometabolic cohort | Cohort associations with confounders and measurement context | No individual disease or dietary response |
| 12 PREDICT 1 | Time-resolved postprandial physiology, distinct endpoints and **publisher correction lineage** | No unvalidated Bloom model prediction |
| 13 2015 glycemic prediction | Model inputs, validation, outcome target and population | Not equivalent to proven intervention-driven weight loss |
| 14 Historical GLP-1 discussion | Keep research **topic placeholder** until actual original paper is identified | No invented citation, strain or recommended GLP-1 boosting action |
| 15 Microbiome-intelligence MR | Keep **unresolved identity / possible preprint** separate from any independently identified related paper | No IQ/cognitive prediction or flora manipulation |
| 16 Host BA–MCY/FXR | Host VNN1, molecular conjugation, intestinal FXR vs liver response with source-specific mouse/preclinical evidence | No approved human cholesterol/NAFLD intervention |

The review's strongest correction is the **2022 null weight-loss comparison** despite other positive personalized-nutrition literature; preserve **both** sources and what outcomes each tested. For studies 14 and 15, the exact formerly discussed reference was not supplied. **Unresolved IDs are visible in scientific curation but not presented as independently confirmed articles to consumers.**

## 5. BSH/aging case as full-path cross-domain benchmark (BIO-EXP-49)

Treat the Nov 16, 2026 *Cell Metabolism* study as a scientific case, **not** production-validated therapy. Its source DOI is `10.1016/j.cmet.2026.10.016`; verify exact primary methods, cohorts, numerical endpoints, gene/substrate IDs, conflicting evidence and rights before public-specific effects.

**Expected chain:** host hepatic bile-acid conjugation → biliary/intestinal transport → source-qualified microbial BSH deconjugation (specific glycine/taurine conjugates, EC 3.5.1.24; inspect exact Rhea reaction) → diverse downstream microbial/host transformations and possible reabsorption/signaling → distinct human cohort association and aged-mouse outcome. Each step has its own compartment and observability: `possible capability`, `gene detected`, `expression`, `enzyme activity measured`, `metabolite measured`, `human outcome` are **different**, not transitive.

**Personal case A:** A user has a reported bacterial genus associated with some BSH-bearing lineages, but no functional gene assay. Show exact reported organism/date/sample and **"BSH activity was not measured"**; no personal flux, bile acids or inferred longevity. **Personal case B:** No report: useful public article remains, no fake overlay. **Action case:** no BSH-targeted supplement/probiotic/life-extension recommendation; independent reviewed healthspan actions may still be shown under their own human evidence and approved safety framework.

Do **not** satisfy this case via a hardcoded BSH-only pipeline: demonstrate the same renderer/query/claim gate in at least four other dissimilar pathways and a held-out new pathway.

## 6. Engineering integration order — concrete but Codex autonomous

Use the current code contracts above and existing domain/consent/asset services. Suggested bounded slices, **not** new competing task queue:

1. **EXP-16-01 identity + source ingest** — Import/parse existing 16-row CSV as versioned **candidate/reference** literature metadata, canonical DOI/PMID/preprint/correction IDs where verified, original order, uncertainty, no automatic public claim promotion; idempotent reimport, provenance, fake DOI and withdrawn-source tests.
2. **EXP-16-02 study results / estimands** — Add typed outcome results to existing evidence model, null/negative results and exact conflict scope. Prefer minimal compatible additive APIs; source `studyId/resultId/version`, comparator/outcome/population explicit. For Personal Diet null endpoint show a useful true research summary with source; don't present as a personal meal plan verdict.
3. **EXP-16-03 exposure identity** — Extend canonical food/intervention exposure semantics as needed to represent pasteurized MucT, live strains, isolate, drug and bundled programs; source label and process vs observed consumption separate.
4. **EXP-16-04 molecular/reaction graph** — Add source-reviewed reaction/molecule identity and compartment to existing biological graph, initialize bounded curated BSH, isoalloLCA, HSDH, BA–MCY/FXR cases. Reuse organic scientific asset vocabulary; register missing *major* signature artwork requests in canonical asset registry only after asset inventory.
5. **EXP-16-05 prediction-vs-intervention evidence** — Add distinct model-target/validation vs effect-of-using-model semantics. No new inference API unless a genuinely licensed and validated model and approved eligibility exists.
6. **EXP-16-06 conflict/withdrawal** — Version source candidates, correction/retraction propagation and optional following inside existing scientific-update lifecycle; purpose scoped, account-private and no external private query.
7. **EXP-16-07 goal/topic read API** — Query bounded, source-backed subgraphs by intent `learn | see-my-data | follow | find-actions | track-outcome`; public education works signed-out, authenticated personal projections are server-authorized, and `find-actions` delegates to approved existing action/contraindication service. Implement stable source/graph/version and response fields without assuming specific example TypeScript file path.
8. **EXP-16-08 focused consumer Explore experience** — Preserve current `Explore.tsx`, search and navigational features, authorized media; provide concise primary finding, optional “How it works” focused pathway, “My data actually show” only on authorized evidence, “What can I do?” when independently approved, detailed evidence/limits on demand. Accessible linear alternate to graph, 320/390/768/1024/1440 views; do **not** flood screen with all 16 study cards or generic badges.
9. **EXP-16-09 fixtures / acceptance / heldout** — All original BIO-EXP-01–49 + added 50–67 and ten pathway fixtures; isolate private overlays/taxon aliases and measured/predicted cases. Include same common mechanism renderer handling a new dissimilar source-reviewed study with no hardcoded case branch.
10. **EXP-16-10 verified release evidence** — Record accepted code SHA, source hashes/rights, primary-paper review states, tests, rendered snapshots, science/privacy/clinical/legal approvals and actual hosted/production status separately. No promotion of content via source ingestion alone.

The above slices align to original `SCI-16-01–10`, `EXP-C01–C10` and `V06-LIVE-EXT/UPD` but **do not supersede existing `NEXT_ACTIONS.md` task order**. The current active task remains confirmed supplement-taken records; v0.6 Food #12/Response #15 and integrity follow. Generalized Explorer enrichment belongs primarily to **v0.7 / Advanced**, unless necessary for already authorized correctness. No speculative large-scale pathway simulation now.

## 7. Safety/security test fixtures and visual acceptance

**Binding original acceptance:** `BIO-EXP-01–49` and `BIO-EXP-50–67` remain in the preserved 3-part source; **do not lose any negative cases**. Specific mandatory integrated checks:
- Exact source/paper identity and corrected publisher metadata, 16-row accounting and 14/15 uncertainty.
- Null/negative outcome available in search, summaries, evidence drilldown and contradictory literature; positive study elsewhere cannot silently overwrite.
- Distinct viable/pasteurized/engineered vs stool-detected taxon, original source/strain rank, original source units/timing and formulation.
- Exact bile-acid stereochemical identity and tissue/compartment; unknown chemistry/assay/flux remain unknown.
- Mouse, in vitro, cohort, RCT and MR assumptions remain separate; no clinical/individual causal claim from a chain of weaker edges.
- Proteins, athlete training, pregnancy/lactation and contraindications are preserved in goal/action eligibility; no low-protein advice from review alone.
- No public query leaks private phenotype/microbiome/genetic content; account A/B, source revision, correction, opt-out, offline external source and stale worker.
- Missing citations, withdrawn rights, retracted results, duplicate DOI, falsified reference, no original paper and model failures → nonpromoted safe educational/unknown fallback.
- Source-grounded user intent: research-interest follow != request to alter pathway; default output has one clear useful conclusion, no forced CTA and no long disclaimer pile.
- Real responsive (320/390/768/1024/1440), a11y and keyboard pathways; existing design/approved original asset preservation and visual acceptance of actual functioning app; no image generation by replacing relevant approved art.
- Independent claim evaluation plus permitted actions, not UI-only text; **zero false personal enzyme/metabolite measurements and zero unapproved treatment recommendations** in known adversarial release fixtures.

## 8. What is genuinely implementation-ready versus still external

**Included and published:** complete 3-part handoff (owner Part A verbatim, Science Part B, 16-study amendment Part C), authentic provided 16-row CSV normalized as importable data, specific existing code touchpoints from live branch inspection, architecture contract, phased bounded tasks, conflict and scientific negative assertions. The handoff preserves study source links but **no independent full primary-paper method/results extraction is implied**.

**External/specialist dependencies before assertive publishing:** validated primary paper methods and outcomes, source identity recovery for 14/15, rights for commercial redistribution and third-party molecular databases, independent scientific and medically consequential claims review, regulator/privacy checks for clinical advice, and model performance studies for individual predictions. Codex can build research-ready data, UI and tests without holding unrelated v0.6 functionality hostage.

**Definition of done:** Any source-backed topic, not just the BSH example, can be searched and explained through correct reaction participants, experimental/personal observability and human outcome evidence; individual overlay is source/consent-correct; null/conflicting findings remain visible; practical actions only arise from independent eligible human evidence. Users see one helpful clear answer before the underlying biological complexity.
