# Bloom — Scientific AI Model Development Program: Chief Architect Implementation Decision

**Date:** November 18, 2026  
**Source:** Owner "Bloom — Scientific AI Model Development Program — Chief Architect and Multi-Agent Execution Plan", November 18, 2026, 16 sections, 6 model capabilities, 9 proposed agent functions.  
**Disposition:** **APPROVE STAGED SCIENTIFIC R&D INFRASTRUCTURE AND FIRST NARROW BENCHMARK.** Do not claim model trained, benchmark validated, source rights cleared, personal medical utility established, or public activation authorized by this document.  
**Execution:** Codex remains sole engineering implementer on `enhance/bloom-experience`; **`AGENTS.md` then `NEXT_ACTIONS.md`** remains sole active queue. Bounded scientific-dataset reconnaissance/spec fixtures can proceed without diverting current M3 supplement / UPC lookup, Food #12 and Response #15 or occupying a second Codex workstream. The owner requested parallel *scientific progress*, not a second simultaneous Codex execution queue or nine permanent roles.

**Core goal:** Prove **one real, measured, held-out substrate-utilization prediction task** with correct source rights, leakage prevention, reproducibility and independently challenged scientific utility. Do not train a large biological foundation model yet.

## 1. Exact present-state audit: reusable vs missing

**Read-only branch evidence (2026-11-18)**

| Existing in repo / source | Verified functionality and limits | Reuse decision |
|---|---|---|
| `ml_service/main.py`, `server/ml-service.ts` | Python FastAPI back end with internal token authentication and request bounds; TS service adapter has strict path allowlist and private HTTPS transport; not a general training orchestration API | Keep secure service boundary. Training need **not** be a live HTTP feature |
| `ml_service/research/stoichiometry.py`, `synthetic_service.py` | Small **synthetic-only** bounded exact-rational LP and fixed synthetic fixtures; explicitly not calibrated organism reconstruction, measured metabolite or human flux | Keep synthetic tests as negative controls; never use as real ground truth or benchmark |
| `ml_service/services/metabolite_predictor.py` | Legacy hard-coded gene/pathway heuristic code; its inferred concentrations are **not validated measured human metabolite predictions** | Do not use for science-ground-truth training, personal advice or claim of model readiness; preserve gated status |
| `server/metabolite-research.ts`, `RESEARCH_MODEL.md` | Private research scenario readiness and strict external adapter, blocked when curated model/service not configured; no connected validated MICOM/AGORA2 solver or model corpus demonstrated | Future research-only adapter after benchmark success, not immediate user UI |
| `shared/biological-model.ts`, `shared/evidence-network.ts` | Versioned entity/relation/evidence graph scaffolding | Reuse canonical identity/provenance; no parallel biological graph |
| `docs/architecture/AI_SCIENTIFIC_GOVERNANCE_MODEL_REGISTRY_ARCHITECT_DECISION_20261114.md` | Binding proposed/validated/restricted scientific claim/model governance, no automatic model-to-advice promotion | Reuse lifecycle and policy engine; extension only for true candidate artifacts |
| `docs/architecture/PYTHON_ML_RESTORATION_AND_MOLECULAR_EXPANSION_DECISION_2026-11-06.md` | Prior v0.6 **approved shadow-research restoration** direction; expressly preserves model/science gates | The first dataset/benchmark is a concrete bounded continuation, not replacement |
| `docs/architecture/BLOOM_SCIENTIFIC_COMPUTING_INFRASTRUCTURE_ARCHITECT_DECISION_20261116.md` | Durable work and source-epoch/version job governance specified; not proof compute service is deployed | Use for background jobs if needed; no new worker/broker/GPU infra now |
| `docs/architecture/PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md` | Owner-scoped personal learning allowed under rights, collective training deferred | **No private account data** in first shared model |
| `pyproject.toml` | Python 3.11+ deps include NumPy, pandas, scikit-learn, Biopython; no COBRApy/MICOM/PyTorch guaranteed | Use CPU scikit-learn first; add only justified experiment-scoped dependencies |
| `ML_ARCHITECTURE.md` | Explicit legacy conceptual/prototype description, not proof of validated personal metabolite results or real cohort data | Never treat aspirational diagrams/constants as measured training evidence |
| `NEXT_ACTIONS.md` | Current V06-M3 confirmed supplement source/taken, UPC fix, then existing Food/Response work | Don't change active queue or start new engineering execution stream |

**Missing/unverified:** no independent published experimental substrate dataset downloaded/hashed and rights-cleared for Bloom; no reviewed strain×substrate label materialization, no reproducible lineage manifests/split freezing, no real metabolic-model benchmark, no trained tested proprietary learned phenotype model, no calibrated OOD threshold, no independent locked evaluation, no approved model artifact registry entry and no product inference. The **work is to deliver these missing components**, not redesign the app.

## 2. First model selection and why

**Chosen first pilot: `MICROBE-SUBSTRATE-UTIL-V1`**, a strain/genome- and condition-specific **binary/substrate-class microbial growth or utilization phenotype** under a defined laboratory assay.

**Input (v1 minimal):** verified isolate/genome identifier and appropriately sourced annotated features (e.g. KOFAM/GAPMIND pathway/gene features), exact substrate chemical ID/isomer, assay source, medium/condition where available; assay/protocol family and missingness. **Prevent leakage:** use source/protocol metadata primarily to stratify and evaluate domain shift; don't let a source-specific field act as a trivial shortcut producing high scores. If the dataset does not include usable medium conditions, explicitly make the prediction scope **observed phenotype in a documented assay family**, not universal substrate metabolism.

**Target:** measured positive/negative carbon-source utilization/growth phenotype **under its original assay definition**, with missing/uninterpretable states separate from negatives. Do not call plate colour/growth proxy a directly measured metabolic secretion/uptake rate. If binary labels reflect an assay threshold, record it and classify ambiguous values separately.

**Why first:** Real strain×substrate measurements and preexisting feature tables make a CPU-scale supervised experiment plausible without building a full biochemical simulator. It tests the most essential Bloom science requirements: accurate labels, source/version rights, taxonomic/chemical reconciliation, biological split leakage, uncertainty and refusal on novel gut taxa. **It is a stepping stone, not a direct prediction of human gut-metabolite concentrations.**

**Explicit non-goal v1:** predicting a subject's SCFA concentration, personalized probiotic response, community exchange, human metabolite absorption or therapy outcomes. Earlier "microbial substrate utilization and/or metabolite secretion" is resolved to a **single binary utilization** benchmark first; quantitative secretion becomes a separate task only when authentic measured secretion labels exist.

## 3. Real candidate dataset, with caveat that it is not approved training corpus yet

**Candidate selected for rights/quality audit:** *Data coherence over data volume drives generalisable genome-based prediction of microbial carbon utilisation*, **Zenodo dataset version 1.1.0 (2026-08-21), DOI 10.5281/zenodo.22045234**: https://zenodo.org/records/22045234.

**Actually confirmed from publisher record on November 18, 2026:**
- Four distinct source families: **ATLeaf (206 genomes × 44 substrates), Biolog compilation (362 × 59), Marine (172 × 100), Populus (55 × 176)**. These are source matrix shapes, **not** a statement that every cell has a valid independent measured label, nor that all 795 rows represent distinct strains across datasets. Associated deposited genome selection table reports **822 selected genome records**; do not conflate genome record count with unique isolates/usable independent labels.
- The analyses focus on **15 shared substrates** across the four datasets (240 total source-specific named substrates). The record has exact substrate identity tables preserving stereochemistry. `biolog_assay_provenance.tsv` distinguishes assays within a compilation.
- Loose small phenotype/genome TSV files, `genome_accessions.tsv`, substrate identity tables, README and checksums are provided. A `trait-prediction-data.zip` (~60 MB) includes features, preset splits, benchmark tables and checkpoints; `proteomes_all_seqs.zip` (~766 MB) is **not** required for first CPU benchmark.
- The deposit asserts **CC BY 4.0**, but explicitly warns **third-party original phenotype and genome records retain their original licenses**; **commercial model-training rights cannot be presumed for every row**. The associated paper is a **preprint**, not automatically an independently reviewed clinical science product. Upstream original ATLeaf/Biolog/Marine/Populus rights and genome annotation model rights must be checked. The subject cohorts are predominantly environmental/plant/marine isolates, **not necessarily human gut microbes**, so individual gut application is out-of-distribution.

**Current rights state:** `candidate_source_not_training_approved`; **do not download into a production training corpus, train an intended commercial Bloom model using unverified upstream assets, or ship third-party checkpoints** until source-level rights, attribution, publisher corrections and dataset coverage gates pass. It is acceptable to inspect metadata/README/schema and create non-sensitive synthetic validation fixtures now. Raw data may be acquired only after permitted terms/source approval.

Other source candidates tracked in [dataset-source-rights-catalogue.csv](../scientific-models/dataset-source-rights-catalogue.csv) include UniProt, Rhea, ChEBI, MGnify, Qiita, AGORA2/VMH, MICOM-compatible resources, MetaboLights and human interventions. These serve **different roles**: Rhea/ChEBI verified chemistry vocabulary; UniProt annotations are evidence-tiered; MGnify functional potential is not growth outcome; AGORA2 models are *reconstructions*, not empirical measured labels. **No data source is currently approved solely because it is accessible on the web.**

**Rights directly verified on provider pages:** Rhea CC BY 4.0 with attribution; ChEBI CC BY 4.0; UniProt states CC BY 4.0 for copyrightable database parts. Still check actual release/file-level source restrictions, annotation redistribution, permissions and attribution, and any original study conditions. No source URL in the ledger is a download approval.

### Proof needed before data status `TRAIN_ELIGIBLE`

1. Each *exact selected source file* has owner/repository URL, stable accession/DOI, version, publication/retraction status, acquisition time, bytes hash, source and collection protocol, license (including upstream), commercial-training/redistribution/derivative-right status, intended application scope, source and rights reviewer disposition.
2. Confirm label semantics, missingness, positive/negative calls, replicate structure, taxonomic strain/genome group, medium/protocol and experimental conditions. Are the 15 "common substrates" truly chemically identical and comparable across assays? **Test, don't assume.**
3. Confirm overlap and related genomes across sources and phylogeny; preserve original published source-specific splits for reproducibility but freeze an **independent** holdout for Bloom. Don't select thresholds after observing holdout results.
4. If no usable rights-cleared, appropriately labeled subset survives, **stop/revise pilot with explicit `DATA_BLOCKED` report**; don't invent observations, borrow private Bloom account samples or call computational predictions ground truth.

## 4. Reusable data and evidence contracts (additive, no new monolith)

**Source manifest fields**: `datasetId`, accession/URI, version/retrievedAt, publisher, license per original included artifact, permitted commercial/training/redistribution rights, original publication/assay, total and included counts, sample/strain identity, file and transformed SHA256, component checksums, source corrections/withdrawals, processing version, required attribution, reviewer status.

**Observation fields** (only actual applicable fields): `experimentId`, `replicateId`, `isolateId`, `genomeId`, `taxonId` (nullable), `substrateId` with stereochemical identity, `medium`, `temperature`, `time`, `cultureProtocol`, `assayMeasurement/units`, `reportedPhenotype`, `targetConversionRuleVersion`, `groundTruthClass`, `missingness`, `sourceId`, `sourceRowId`, `rightsRecordId`, `splitGroupIds`. All original units preserved even if normalized.

**Truth classes:** `direct_experimental_measurement`, `experimentally_verified_annotation`, `curated_published_reference`, `computed_inference`, `LLM_candidate`, `synthetic_simulation`, `user_report`, `unsupported_unresolved`. Pilot labels require measured experimentally defined phenotypes; no unreviewed annotations or LLM extraction as evaluation truth. Distinguish model-produced label from lab result and actual user report.

**Pipeline:** authorized source manifest → licensed file fetch immutable artifact hash → parse original rows → quarantine ambiguous/duplicate/missing/rights-unclear → source/chemical/strain crosswalk → original measured phenotype and conversion rule → rights-filtered normalized observations → frozen independent group splits → baselines → candidate model(s) → untouched test and subgroup/OOD reporting → independent review → `research_only` artifact with source snapshot. All steps reproducible from pinned inputs; no manual silent data fixes.

**Reuse:** scientific entity/evidence IDs from `shared/biological-model.ts`, `shared/evidence-network.ts`; existing model/evidence governance; ML Python service boundaries. Raw training datasets and large artifacts **must not** be checked into GitHub or stored inside end-user Neon health accounts. Start with file manifests and local/offline versioned experiments; choose storage/deployment later only if genuinely needed. If new API eventually exists, model calls are bounded/authenticated through `server/ml-service.ts` and authorized research-only exposure, not exposed directly to clients.

## 5. Baseline, split and independent evaluation plan

**Freeze scientific target and eligible measurement before training.** Only one first task.

### Leakage-resistant splitting

- Primary **leave-one-source-study/culture-panel-out** when number of independent studies, assay comparability and labels permit. Biolog is a *compilation*, so its sub-study provenance must be used; merely holding "Biolog" as one dataset is not enough.
- Independent genome/strain clusters and phylogenetic family sensitivity; no related genomes, duplicate isolate, technical replicate or source-derived annotation feature duplicates across protected splits.
- Hold out substrata only if the chosen task is cross-substrate generalization and enough substrate families exist; don't claim that metric for ordinary known-substrate model.
- Group labels and splits **frozen with hashes before candidate fitting**, and protected from hyperparameter selection. Use source/organism leave-out as distinct performance claims. Publication baseline/preset splits are useful for reproducing literature but cannot be treated as genuinely novel independent validation without overlap audit.
- In-domain and OOD evaluation separately; allow **abstention** for no homolog coverage/novel substrate/domain/assay.
- No negative constructed from a missing assay entry.

### Three/four models in increasing complexity

1. **Simple prevalence baseline:** measured class frequency per substrate using training only; source-adjusted if valid, with class imbalance understood.
2. **Curated biochemical-rule baseline** if an actually validated rule exists, returning unknown rather than inventing growth from gene annotations.
3. **Simple statistical baseline:** regularized logistic regression using licensed training-only features and missingness handling.
4. **Optional gradient-boosted tree** (scikit-learn HistGradientBoosting or other permitted CPU library) if enough labeled independent groups justify it.
5. **Optional mechanistic FBA / AGORA2** only if matching organism/medium/models available, rights permit, and growth phenotype mapping is testable. No requirement to pretend synthetic LP engine is a mechanistic microbial prediction baseline.

Benchmark should report per substrate/source and pooled where valid: balanced accuracy, precision, recall, macro-F1, Brier/calibration, risk-coverage as abstention expands, scientific negative controls, dataset shift and confidence intervals under group-level bootstrap (if enough groups). Compare to simplest baseline with uncertainty—not arbitrary "80% accuracy" acceptance target. Freeze **go/no-go** as meaningful held-out improvement with credible uncertainty, no obvious strain/study leakage, valid negative control and no systematic chemistry impossibilities; if uncertain/null, retain simpler rule and publish the honest null result. No unverified test performance numbers.

**Use CPU-first**: scikit-learn present in `pyproject.toml`; pandas/NumPy available. No GPU required for initial feature-table classifier and no foundation-model pretraining. Research compute/hardware costs below are planning estimates, not a purchased service quote.

## 6. Minimum compute + indicative costs

**First audit/feature-table pilot** uses existing developer machine/CI runner CPU with ~4–8 vCPUs and 8–16 GB RAM if unpacking the ~60 MB derived archive (reported ~453 MB), substantially less if selecting the small TSVs. Start from the loose phenotype/genome matrices and frozen folds; benchmark resource usage before allocating a worker. Minimal local disk ~2–5 GB incl temp/derived outputs; don't pull 766 MB proteome archive initially.

**Approximate per reproducible pilot (non-vendor estimates, excluding personnel/review):**
- Manifest/schema/curation and first fixed small CPU baselines: **$0–$10 incremental** if existing machine/CI quotas suffice; otherwise ~**$2–$20** in metered CPU execution, dependent on resource/region/runtime.
- Repeated grouped CV and limited hyperparameter trial: plan **$5–$50** if paid CPU runtime needed; increase budget only with actual logs.
- Optional genome annotation/proteome computations or MICOM/FBA: no estimate approved until scope/model/solver, memory, credits, rights and measured runtime known; larger tasks can be expensive. **Do not imply a free CPU pilot proves the complete platform is inexpensive.**
- **No unapproved new paid GPU, subscription, experiment tracker or external data/API**; attach actual measured runtime/cost to the experiment manifest after execution.

Any hard spend/cost limit comes from current owner/operational policy, not these illustrative ranges.

## 7. Nine proposed agent functions reconciled with Codex sole implementer

**Important owner-workflow resolution:** The source proposes "Agents A–I" with suggested GPT/Claude/Gemini models. Treat these as **bounded accountability functions/optional independent reviews**, *not* instructions to create nine persistent agents, a new approval committee, or install/procure providers. Codex remains **sole implementation owner**. The Chief Architect writes scope, validation and UX contract, delegates targeted research/review to available agents only where scientific/material risks justify it. Do not assert access to named external model versions/providers unless tools and rights confirm them.

| Proposed function | Actual owner / output and acceptance |
|---|---|
| A Scientific ML architect | Chief Architect owns fixed task definition, I/O contract, truth classes, baselines, release boundaries; expert independent challenge optional |
| B Dataset and rights discovery | Research review provides [source-rights ledger](../scientific-models/dataset-source-rights-catalogue.csv) and exact file/upstream disposition; separate legal confirmation when material |
| C Literature evidence extraction | Bounded automated **candidate** source extraction with locators/uncertainty, never certified truth |
| D Independent biological review | Independent evidence/assay/taxon/source dispute review and explicit accept/revise/reject, risk-tiered—not LLM rubber stamp |
| E Data engineering | **Codex** versioned parsing/normalization/quarantine/lineage and tests |
| F Mechanistic modeling | **Codex** evaluates appropriate FBA models if eligible; expert can challenge mechanisms; synthetic LP stays synthetic |
| G ML training | **Codex** locked splits, baselines, trained candidate artifacts, manifests and reproducible run |
| H Independent ML evaluation | Separate reviewer **not the model implementer** works from frozen results and checks leakage, OOD, calibration, error, prior baseline and reproducibility; human professional review where warranted |
| I Bloom integration | **Codex** guarded adapter/flag/fallback with existing research-only rights; no personal recommender permission |

**Agent efficiency:** Only material source rights, scientific validity and locked benchmark independence call for second-agent review. Unnecessary repeated cross-model re-review wastes tokens and gives no scientific certainty. Store concise machine-readable review receipts, not enormous repeated strategic handoffs.

## 8. Concrete repo changes Codex should deliver (minimal adequate)

**Reference artifacts prepared by architect** (not training execution):
- [prediction-task-registry.json](../scientific-models/prediction-task-registry.json) — seven scoped task IDs, with **one selected first**; registry metadata is not a trained model.
- [dataset-source-rights-catalogue.csv](../scientific-models/dataset-source-rights-catalogue.csv) — ten concrete source families, source URL, original-vs-derived rights, usage restrictions/uncertainty; candidate datasets not ingested.

**First Codex work selection once current queue permits:**

1. `SML-01` **Repository+data audit receipt**: actual current Python/TS service/pipelines, existing source/evidence/model registers, license and legal status, exact file list and SHA, implementation gaps. Fail build attempts that silently substitute synthetic examples for experimental labels.
2. `SML-02` **Task and dataset contract**: one typed first task, target provenance, source manifest, truth/rights schema, structured assay context/replicates, chemical identity, immutable source hash, quarantined record list.
3. `SML-03` **Exact dataset rights and source acquisition**: audit candidate Zenodo v1.1.0 README/LICENSE plus all upstream ATLeaf/Biolog/Marine/Populus source terms. Select a **specific rights-cleared** subset. If none, stop training with clearly specified blocker and a next candidate; no made-up label.
4. `SML-04` **Data quality and split freeze**: idempotent importer preserving original file hashes, strain/genome crosswalk and substrate isomers, missing/negative distinction, test/training lineage; group-holdout with a locked split manifest and leakage audit.
5. `SML-05` **Reproducible baselines**: simple class-frequency, biologically justified rule (if available), regularized logistic; optional mechanistic model only if *actually applicable*. Frozen outputs, no invented score.
6. `SML-06` **One optional trained classifier**: only if data and baseline clear. No GPU dependence; CPU gradient boosting only if independent units/labels support learning. Artifact is versioned with architecture, seed, hyperparameters, dataset and code SHA, environment, compute usage and fitted calibration.
7. `SML-07` **Locked independent evaluation**: compare against baselines on unused study/strain splits; OOD and abstention, negative controls, error/limitations and subgroup/test coverage; independent review decision, null result accepted.
8. `SML-08` **Research-only registry/inference**: only for eligible benchmark candidate and source-rights-allowed use, add minimal versioned model adapter/feature gates to existing Python science service, use existing TS approved path list and source/authorization handling; no consumer-facing personalized advice, new permanent nav tab or genetic/microbiome-account predictive claims.
9. `SML-09` **Reproducibility receipt**: pinned source/feature/split/artifact hashes, environment/CPU and actual cost, independent evaluation review, source update/retraction invalidation, fallback and no-model status. Separate `SOURCE_READY`, `TRAINED`, `INDEPENDENT_TESTED`, `RESEARCH_ELIGIBLE`, `PUBLIC_FEATURE_ENABLED`, `CLINICALLY_ACTIONABLE`.

**Proposed directory roles—not prescribed file relocation:**
```text
docs/scientific-models/       task registry, source-rights ledger, benchmark review index
ml_service/research/         existing synthetic controls + appropriate genuine experimental task modules
ml_service/...               small task-specific feature/validation/train/evaluate code if needed
tests/...                    source, leakage, split, calibration, access and no-personal-use fixtures
existing scientific registry model status and existing service adapter
```
Do not create unbounded directories `experiments/`, `models/`, `training/`, `dataset-snapshots/` until used. Large raw dataset/model files stay out of Git and private account storage; manifest contains artifact locations/hashes where authorized.

## 9. Model registry and promotion authority

Registry states: `proposed`, `data_available`, `training_implemented`, `internal_benchmarked`, `independent_evaluated`, `research_use_eligible`, `specific_explanatory_use_approved`, `specific_recommendation_use_approved`, `restricted_or_withdrawn`. **These are lifecycle labels, not automatic sequential transitions.** Source ownership/licensing, model scope/quality, OOD, independent challenge, and evidence/safety evaluator remain separate hard requirements. No trained model/LLM is independent clinical authority.

**Public/personal privacy:** model 1 uses only correctly licensed public/reference data, with neither private Bloom health records nor cross-user aggregates. Within-account response calibration is separate and remains source-/consent-scoped, no shared gradient updates. Collective shared training is **off by default** and requires separate owner/Legal/Security/consent approval, opt-out/withdrawal lifecycle and reidentification risk analysis. No external private personal inputs to unrelated foundation model APIs by default. Cost, inference latency and fallback are independently tested.

**Potential foundation models:** Microbiome Genome Model (MGM), protein models, AlphaGenome, AlphaFold etc only as **candidate capabilities** after task-specific license, API, provenance, benchmark and privacy review; do not claim any model is available, current, licensed for commercial use or useful to predict diet response merely because its name appears. **Foundation-model adoption is a benchmark comparison**, not a strategic goal or default cost.

## 10. Acceptance / falsification tests

- `SML-ACC-01`: source downloaded only with file-specific origin/version/right; manual sample counts and original vs observed phenotype class reconciled; ambiguity quarantined, missing isn't negative.
- `SML-ACC-02`: negative labels are actual assay non-growth or predeclared threshold under experimental method, **not synthetic negatives or undetected database rows**.
- `SML-ACC-03`: same strain/genome/technical replicate or related study provenance cannot cross protected train/test boundary; independent source/study and phylogeny splits each report actual coverage.
- `SML-ACC-04`: leaked metadata/source shortcuts and overly correlated accession features found by challenge/ablation; all feature construction fit on training only.
- `SML-ACC-05`: training and tests use fixed seed/hashes/environment; full CPU rerun yields expected outcome within numerical tolerance; no invented metrics in receipt.
- `SML-ACC-06`: result vs substrate stereoisomer cannot silently merge; different medium/assay and label thresholds retained; incompatibility abstains.
- `SML-ACC-07`: simple prevalence/rule/logistic and optional metabolic baseline compared on **identical** held-out cases; no choosing favorable test subset after candidate results.
- `SML-ACC-08`: model probabilities calibrated and OOD abstention evaluated at locked coverage; no personal glucose/SCFA concentration or clinical claims.
- `SML-ACC-09`: negative/null benchmark → reject model promotion, keep simpler baseline and limitations; no hand-edited acceptance threshold to force pass.
- `SML-ACC-10`: independent challenge cannot retrain or select parameters on protected test, reports leakage, performance variability, subgroups and scientific plausibility.
- `SML-ACC-11`: source withdrawal/rights change invalidates affected training lineage and research inference, without corrupting unrelated user data or reference graph.
- `SML-ACC-12`: research-only inference disabled by default, source/model versions and original assay scope visible, unsupported novel gut taxon/condition → abstention, private account never included in model training or external request.
- `SML-ACC-13`: existing React/Express/Neon/Python interface intact, M3/Food/Response no regressions and model unavailable results in truthful no-model fallback.
- `SML-ACC-14`: no expensive GPU/paid provider/monthly infrastructure without actual measured need, cost and owner approval; no screenshots by default.
- `SML-ACC-15`: first milestone status **FAILED/NOT_STARTED** unless actual source files/hashes, experiment manifest, frozen split, measured target, baselines, candidate model, independent test, artifact and reviewed inference are all present.

**Definition of first successful milestone:** A **genuine source-measured** strain×substrate task, a legally eligible versioned dataset, leakage-resistant frozen independent test, reproducible CPU training and simple/appropriate mechanistic baselines, independently challenged metrics/OOD/uncertainty, valid artifacts and research-only inference with strict abstention. Graph exploration, generic LLM explanation, synthetic simulation or a model checklist do NOT meet that definition.
