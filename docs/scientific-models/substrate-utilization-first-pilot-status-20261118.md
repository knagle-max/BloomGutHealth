# Bloom — First Substrate Utilization Scientific ML Pilot: Actual Execution Receipt

**As of:** 2026-11-18  
**Task:** `MICROBE-SUBSTRATE-UTIL-V1`  
**Overall verdict:** **REVISE / CONTINUE DATA QUALIFICATION, NOT TRAINED.** Research pipeline source code is present. The actual versioned experimental training dataset, commercial model-training rights, independent evaluation and benchmark results **are not** ready. This is an honest partial execution receipt, not a claim of a trained proprietary model.

## Dataset qualification

**Specific candidate:** Kishore et al., *Data coherence over data volume drives generalisable genome-based prediction of microbial carbon utilisation*, [Zenodo v1.1.0, record 22045234](https://zenodo.org/records/22045234), published August 21, 2026 (DOI `10.5281/zenodo.22045234`). Public provider inventory reports:
- `atleaf_phenotypes.tsv` (21.6 kB, published MD5 `cc2a99e22afca39374243509517523a7`) and `atleaf_genomes.tsv` (31.9 kB, MD5 `728b2600559263a4368b1e5eeddd2007`).
- `biolog_phenotypes.tsv` (43 kB, MD5 `6dbc57e243ed032e4ad421eecbc2b755`), `biolog_genomes.tsv` (39.5 kB, MD5 `270c437bc2336bf4e8fe667bb895940f`) and `biolog_assay_provenance.tsv` (36.4 kB, MD5 `bb50a3d176b7dfdb809abca6fbd6c002`).
- `marine_phenotypes.tsv` (36.4 kB, MD5 `436044fa6804b87b46edb204c4070431`) and `marine_genomes.tsv` (27.7 kB, MD5 `edbb3f7607cf0248d98bf6d9fc17cf34`).
- `populus_phenotypes.tsv` (23.7 kB, MD5 `a218f7920a6972ce5c420efa79bc079e`) and `populus_genomes.tsv` (9.3 kB, MD5 `2efbd6ac545998f95f285553c01bdea2`).
- `substrate_identity_all.csv` (33.3 kB, MD5 `97924d631bce8bced63477b2e0ab148d`) and `substrate_identity_common15.csv` (3.9 kB, MD5 `0a0aba9169e2ad0a382dc74e0cb4f9e9`).
- `genome_accessions.tsv` (31.8 kB, MD5 `7991543954bc74967eb3e7f763b53b7d`), `README.md` (29.1 kB, MD5 `827d41052c1191ec366f040754d6e975`), `LICENSE.txt` (631 bytes, MD5 `488fabfe29b1569a936ead6e66517823`) and the 60.2 MB `trait-prediction-data.zip` (MD5 `73d3497684079640181c13b1312bda04`).

**Important provenance distinction:** The above names, sizes and **MD5 values are publisher-claimed Zenodo metadata**; we did **not** download the corresponding original bytes or independently compute MD5/SHA256. The provider page states source matrices of 206 ATLeaf, 362 Biolog, 172 Marine and 55 Populus genome rows and 44/59/100/176 substrate columns. These are **source matrix dimensions**, not independently verified measured-positive/negative sample counts or counts of nonoverlapping strains/experiments. Record documents 822 selected genome accession records; no independently verified number of usable measurements or independent train/test groups can be stated.

**Acquisition attempt:** Public Zenodo landing page inspected through web; direct Zenodo data/API download attempts from this execution container failed because its external network/DNS access is unavailable. README/Licence preview endpoints also failed at review time. **No data bytes, original row schemas, assay phenotype code vocabulary, provenance file contents or train/test split definitions inspected.**

**Rights:** Zenodo description declares CC BY 4.0 for the deposit, but warns that original third-party phenotype and genome data remain under original licences. Commercial model-training, processed-feature, derivative redistribution and independent source provenance for each ATLeaf/Biolog/Marine/Populus subset are **not cleared**. No source may be marked `commercialTrainingRights:approved` solely because Zenodo is public or its top-level CC BY is visible. Rights blocker requires source-specific primary-file or original depositor confirmation where necessary. This report records no written approval.

## Actual code changes

| Path | Status | Role |
|---|---|---|
| `ml_service/research/substrate_utilization_pilot.py` | **CODE_PRESENT**, not runtime-proven | Actual CLI `inspect` / `freeze` / `evaluate`, original-file SHA256 requirement, metadata and rights gates, raw observation source row IDs, positive/negative vs missing qualification, transitive study/experiment/strain/genome grouping, frozen train/validation/test assignment, majority/organism/substrate/logistic baselines, confusion matrix, balanced accuracy/precision/recall/macro-F1/Brier, environment/runtime receipt, no user-record ingestion. |
| `ml_service/research/test_substrate_utilization_pilot.py` | **TEST_CODE_PRESENT**, not executed | Software-only synthetic fixtures testing rights blocker, source-hash invalidation, negative/missing label distinction, group isolation and score shapes. **Fixture outputs are not experimental metrics.** |
| `docs/scientific-models/prediction-task-registry.json` | **UPDATED** | Maintains task identity, records code present vs true training and independent evaluation absent. |
| `docs/architecture/BLOOM_SCIENTIFIC_AI_MODEL_DEVELOPMENT_PROGRAM_ARCHITECT_DECISION_20261118.md` | **EXISTING AUTHORITY** | Broader source/evidence, safety, rights, model selection, independent evaluator and release policy. |

**Technical caveat:** The current CLI accepts a **normalized long-form TSV/CSV**, not the vendor's original wide phenotype/genome matrices. **A provider-specific transformation cannot responsibly be finalized** until actual file schemas, phenotype encodings, substrate identity and assay provenance are obtained and reviewed. Do not manufacture that mapping from inferred row formats. The source manifest needs `schemaVersion:bloom-substrate-source-v1`, exact data `sourceSha256`, source/version/acquisition/origin, `commercialTrainingRights:approved`, `upstreamRightsStatus:approved`, documented `rightsReviewer` and `rightsEvidence`, `dataOrigin:verified_experimental`, `originalExperimentSource` and `measurementClass:direct_experimental_measurement`. Training requires `original_experiment_id` on normalized rows and all six source/group identifiers. Manifest assertions must be independently authenticated and corroborated before first commercial model training.

**Run commands after genuinely authorized and normalized inputs exist:**
```sh
python -m unittest ml_service.research.test_substrate_utilization_pilot
python -m ml_service.research.substrate_utilization_pilot inspect \
  --data <authorized-normalized.tsv> --manifest <approved-source-manifest.json>
python -m ml_service.research.substrate_utilization_pilot freeze \
  --data <authorized-normalized.tsv> --manifest <approved-source-manifest.json> --splits <frozen-split.json>
python -m ml_service.research.substrate_utilization_pilot evaluate \
  --data <authorized-normalized.tsv> --manifest <approved-source-manifest.json> \
  --splits <frozen-split.json> --output <experimental-benchmark-report.json>
```
`freeze` refuses to overwrite an existing split manifest. These examples require **prevalidated** real data; neither fake source approvals nor synthetic CSVs are a legitimate experimental training corpus.

## Required results and truthful status

| Reported item | Current status |
|---|---|
| Dataset commercial eligibility | **BLOCKED / UNRESOLVED** |
| Usable measured phenotype observations | **NOT VERIFIED** |
| Unique experimental strains | **NOT VERIFIED** |
| Independent studies/experimental groups | **NOT VERIFIED** |
| Actual training/evaluation | **NOT RUN** |
| Majority-class baseline score | **NOT MEASURED** |
| Organism-only / substrate-only scores | **NOT MEASURED** |
| Regularized logistic score | **NOT MEASURED** |
| Gradient-boosted score | **NOT IMPLEMENTED** (optional; only after initial baselines) |
| Generalization and OOD performance | **NOT EVALUATED** |
| Calibration and uncertainty | **Brier computation implemented; actual calibration/OOD not yet evaluated** |
| Leakage | **Group-split source code and test cases present; not executed or independently audited** |
| Runtime / compute cost | **NO TRAINING RUN; no experiment runtime/cost or paid compute measured** |
| Research-only trained artifact | **NONE** |
| Independent reviewer | **NOT PERFORMED** — cannot meaningfully evaluate held-out results before measured run |
| Public/personal prediction approval | **NOT AUTHORIZED** |

## Technical review concerns before first real execution

- **Study/strain grouping**: transitive independent groups are conservative but might create too few groups for a credible held-out set. The pilot must abstain rather than relax group separation or falsely report independence. Add related-genome/phylogenetic cluster grouping when actual accession/sequence provenance permits.
- **Phenotype semantics**: growth/no-growth may be assay- and threshold-dependent; all provider matrix codes must be explicitly decoded and signed off before becoming measured labels. An empty or NA value is never a negative observation.
- **Study/assay shift**: aggregate metrics alone conceal strong source differences; actual evaluation must include study- and substrate-level class counts and group-specific errors, with appropriate OOD coverage/abstention or explicit unassessability.
- **Model baseline applicability**: organism-only exact-strain memorization is largely ineffective for held-out strains and is a useful sanity control; avoid describing it as clinically useful. Train-only-feature fitting is essential. A source shortcut can masquerade as good prediction.
- **Task applicability**: even a credible result for plant/marine isolates does not validate a human gut strain response. No consumer dietary action, measured metabolite secretion or personal prediction from this pilot.

## Next allowed bounded steps

1. Codex retains the existing Core task execution order in `NEXT_ACTIONS.md`; this is a bounded Advanced research implementation and does not create a second queue.
2. Obtain legitimate access to exact small Zenodo source files through an approved developer execution environment, read raw headers and original README/licence, and compute **new local SHA256** for each acquired byte artifact (distinct from provider MD5).
3. Verify contributing original-source licences and commercial model-training/derivative permissions by exact file/record; seek rights clarification when ambiguous. If blocked, stop at code/synthetic-only software tests, with documented source-specific blocker.
4. Build a source-verified wide-to-long mapper preserving original growth codes, substrate stereoisomers, strain/genome/experiment/replicate IDs and missingness; reject ambiguous/unresolved units and labels.
5. Execute and fix software tests, freeze truly independent splits and report actual eligible measured counts. Independently review those splits and biologically invalid shortcuts before unsealing held-out evaluation.
6. Run CPU baseline then permitted learned model if measured trainable groups and rights suffice; publish **actual** metrics or an honest null/NO-GO. Independent reviewer challenges the resulting source, splits, metrics and model before research-only promotion.

**Recommendation: REVISE / CONTINUE dataset qualification.** Code exists; the first **genuine** scientific trained model is not yet established. No third-party biological observations or user-private data were used for training by this architectural implementation step.
