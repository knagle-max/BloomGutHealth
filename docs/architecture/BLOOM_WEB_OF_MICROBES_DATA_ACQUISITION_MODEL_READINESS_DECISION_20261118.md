# Bloom — Web of Microbes Data Acquisition and Model-Readiness Delta

**Owner directive:** November 18, 2026. **Architect decision:** APPROVE **bounded source inspection and qualification only**; do **not** approve downloading restricted raw data, training on uncertain rights, a new ML platform, or personal metabolic inference. **Codex** is the sole implementer, following `AGENTS.md` and the existing `NEXT_ACTIONS.md` queue. This is a v0.6 Advanced scientific-research dependency, not a second concurrent execution stream.

**Related approved architecture:** [Scientific AI Model Development Program](BLOOM_SCIENTIFIC_AI_MODEL_DEVELOPMENT_PROGRAM_ARCHITECT_DECISION_20261118.md), [task registry](../scientific-models/prediction-task-registry.json), [dataset rights ledger](../scientific-models/dataset-source-rights-catalogue.csv), [WoM source inspection receipt](../scientific-models/web-of-microbes-acquisition-receipt-20261118.json). First program benchmark remains **MICROBE-SUBSTRATE-UTIL-V1** until rights and data qualification justify changing it; the WoM experimental-metabolite task is a **separate candidate**, not silent replacement.

## 1. Verified source status and concrete acquisition route

| Target | Evidence checked, Nov 18 | Actual acquisition state | Codex next step |
|---|---|---|---|
| **Kosina et al. (2018)**, [DOI](https://doi.org/10.1186/s12866-018-1256-y) | Open-access article says original Web of Microbes site's About tab historically provided an SQLite download; paper describes increased/decreased/no-change net extracellular abundance assertions. | Historical description confirmed; **no currently working SQLite export URL or raw SQLite bytes obtained**. `webofmicrobes.org` redirects to metatlas/NERSC endpoint not verified functional. | Discover a documented live original/archival URL via publisher attachments, author, archive or Northen Lab contacts; verify public right/terms before download. Do **not** bypass defunct site's access restrictions. |
| [BERDL/KBase project](https://beril.kbase.us/projects/webofmicrobes_explorer) | Public Web of Microbes report names `kescience_webofmicrobes` tables `compound, environment, organism, project, observation`, with public derived reports and notebook-linked results. Archive action count data described below. | **Public project summary available; bulk collection export unauthenticated NOT confirmed.** BERDL JupyterHub is presented as query interface; authorization may be required. | Inspect documented read-only export/API and workspace permission. Ask authorized maintainer for access/terms if bulk export not openly granted. No scraping project HTML as if it were underlying experimental rows. |
| [Northen Lab GitHub](https://github.com/northenlab/webofmicrobes) | Public repo `main` at commit `de19b23dcb9ef4b183bc22000ff0655303f7f46e` (Nov 6 2026), has `LICENSE`, `wom/README.md`, `wom/loaders/config.py`, `wom/loaders/loaders.py`, `wom/processed_data/exometabolite.parquet` (GitHub directory reports **612,963 bytes**), trained model directories, and multiple upstream source file **names** in config. Source code inspected; **no raw experimental data bytes downloaded/hashed or Parquet rows independently inspected**. | Evaluate actual software and **each upstream observation file** licence separately; request missing raw source matrices `wom_1, wom_3–11, nature_2021` and original assay/experiment metadata from maintainers. If authorized, download pinned exact files and hash bytes. Do not equate software license with raw dataset commercial training permission. |
| [de Raad et al. (2022)](https://doi.org/10.3389/fmicb.2022.855331), GNPS2-associated | A separate defined-medium cultivation/exometabolomics study is publicly discoverable; GNPS2 may host metabolomics analysis and related datasets. | Exact raw LC-MS data accession, downloadable format, rights and organism/replicate-linked labels **not verified**. No GNPS2-specific WoM 2018 bulk export confirmed. | Follow exact paper data availability, supplementary source and accession; verify GNPS/MassIVE dataset IDs, controls and access separately. |

**Important finding:** Current Northen GitHub model code does define **both consumed and secreted** derived categories, but it is **newer/different processing**, not proof the 2018 BERDL archive contains organism decreases. The publicly visible `wom/loaders/config.py` sets `CONSUMED_THRESHOLD=-2`, `SECRETED_THRESHOLD=2`; `wom/loaders/loaders.py` maps numeric values <= -2 to consumed and >= +2 to secreted; **NaN is mapped to neutral in this code**, which is not an experimentally verified negative. The loader sorts by timepoint and retains the latest organism row in one path, so replicate and time-series preservation require separate source inspection before training. The public code's categorical labels are **proposed transformations**, not verified underlying biological assay truth. Any new consumptions must be traced back to actual measured extracellular decreases with source/control/protocol/thresholds.

**Rights:** The Northen Lab repository `LICENSE` is a copyright notice and redistribution software license, not a blanket permission to commercially train on every upstream phenotype table, GNPS data, ChEBI/UniProt data or deposited checkpoints. File-specific original rights and whether commercial ML training/model redistribution is permitted remain open. Seek written clarification from Northen Lab/LBNL/BERDL and relevant underlying depositors where ambiguous; preserve replies/permissions and restrictions in the established source/rights ledger. A public GitHub download is not proof of rights.

## 2. Archived BERDL action codes and count verification

The **public BERDL project report** [action semantics](https://beril.kbase.us/wiki/sources/pitfalls) separates actor type:
- Control (`The Environment`): `D` = detected in starting medium; `N` = not detected in starting medium.
- Organism: `I` = increased signal relative to control; `E` = emerged/newly detected when absent from initial medium; `N` = no significant change at report's assay criteria.
- **No organism-level decrease/consumption action in this archived 2018 subset**. **Never treat `D` as decreased for organisms**, `N` as consumed, or missing as zero/no consumption.
- `E` = observed appearance relative to baseline/detection limit; the BERDL authors interpret it as de novo production, but **do not assert de novo biosynthesis mechanism without experiment/isotope/identity and assay verification**.

**Report counts—not a verified independent raw extract**:
| Actor + code | Rows reported |
|---|---:|
| Control D | 742 |
| Control N | 1,023 |
| Organism I | 1,338 |
| Organism E | 1,155 |
| Organism N | 7,509 |

The project describes **10,744** observations across 37 organism inventory rows, 589 compound records, 10 environments and 5 projects. **Reconciliation required:** These five action-code counts sum to **11,767**, not 10,744; excluding control `N` yields 10,744. This strongly suggests the published aggregate uses a specific filter/join, but **do not assert exact unique observation count until original rows and notebook SQL predicates are inspected.** `E` and `I` are reported mutually exclusive per observation, not automatically independent experiments. Some “organism” records may be controls, mixtures or synthetic/report placeholders; independently count real isolates, experiments and replicates.

## 3. Scientific data eligibility: candidate separate task, not a fake flux model

**2018 BERDL archived observations:** Potential task `MICROBE-EXOMETABOLITE-INCREASE-EMERGENCE-V1` only if licensed raw rows and independent labels available. Potential **two-headed outcomes**: (a) increased signal among baseline-detected compounds, and (b) newly detected signal among baseline-undetected compounds. Avoid a single binary “produced” target that mixes detection limits with secretion rate. Both need confirmed controls, compound, source sample, timing, assay, and organism+environment. `N` can at most be a source-qualified **not significantly changed** comparator if measured/covered, not a biological negative “can't produce” label. No consumption classifier from BERDL 2018.

**2026 Northen Lab processing and 2022 de Raad:** Could support a **separate** `MICROBE-EXOMETABOLITE-DECREASE-V1` after verification that raw organism condition x metabolite measurement really decreased relative to control, that normalization and thresholds are justified, and that actual independent studies/isolate groups and rights allow learning. A README promising a consumed model is not direct evidence that test labels are experimental gold standards.

**No enzyme flux:** Measured extracellular relative abundance changes represent net medium concentration/signal changes under exact conditions, not reaction-specific activity, per-cell productivity, human host concentration, daily exposure, transport flux or dietary effects. An `E` row is not necessarily a newly synthesized organism-specific molecule where non-detection and release from pre-existing substrate can explain it.

**Compound identities:** BERDL reports only 257 identified of 589 compound entries in one reconciliation; it notes formula-only matching is ambiguous (107 WoM compounds expand to 900 candidate ModelSEED molecules). Preserve unknown features, true structural IDs/stereochemistry, LC-MS adducts and QC rather than guessing a structure from exact mass or formula. Taxon and medium identity have the same source-qualified caution.

**Trainable row selection policy:** Only experimentally evidenced source organism + source experiment + chemical feature/compound + medium + timepoint/control + method/detection threshold + observed category or measured fold change + replicate/QC + provenance + rights disposition. Missing fields nullable with task-specific eligibility checks; unknown not zero, no “all absent pairs are negative.” Quarantine actor/action ambiguities and unresolved compound aliases.

## 4. Bounded acquisition and inspection pipeline (Codex owns implementation)

**No new data platform.** Reuse the owner-approved [scientific model program](BLOOM_SCIENTIFIC_AI_MODEL_DEVELOPMENT_PROGRAM_ARCHITECT_DECISION_20261118.md), source/rights registry, standard Python/Parquet/SQLite inspection and scoped experiment manifests; `ml_service/research/` is a possible home, not mandatory.

1. **WOM-01 Source-access probes:** URL status, documented endpoints, auth/access requirements, source version and rights; no automated login or scraping around consent. Log `PUBLIC_METADATA_ONLY`, `AUTHORIZED_RAW`, `AUTH_REQUIRED`, `NOT_FOUND`, `RIGHTS_UNCLEAR`.
2. **WOM-02 Rights-qualified retrieval:** Fetch only public and legally reusable/specific authorized raw artifact; hash original raw bytes SHA256, captured exact URL, response content type/ETag/time, commit/accession/license, owner and auth class. Never place potentially restricted raw data in public Git or personal user Neon.
3. **WOM-03 Read-only schema reconnaissance:** SQLite tables/columns/row counts and FKs when SQLite exists; Parquet columns and metadata; TSV source file/header; inspect control/action/replicate/experiment/medium/time/compound/source columns. Strict no arbitrary SQL from client, no live DB writes; bounded file/time limits. Count row-to-join inflation.
4. **WOM-04 Action code glossary:** Evidence-ground every `(actor_type, code)` to an original source definition and use disjoint `CONTROL_DETECTED / CONTROL_UNDETECTED / ORGANISM_INCREASE / ORGANISM_EMERGED / ORGANISM_UNCHANGED / ORGANISM_DECREASE` if actually verified. Preserve original code alongside derived enumeration and rule version.
5. **WOM-05 Identity and measurement audit:** Validate compound IDs, CAS/ChEBI/ModelSEED only exact identity, mass formula ambiguities, missingness/detection thresholds, sample prep/LC-MS platform, medium/time/strain/repeats, QA and control normalization. No inferred measured flux.
6. **WOM-06 Leakage and held-out feasibility:** Group by organism strain/isolate, environmental source, experiment/batch, replicates, compound family and study. Measure how many independent groups per eligible label; early data from only a handful of isolates is likely insufficient for broad generalization. Freeze future test split only after qualifying rights/labels and audit overlaps with Northen model source or original dataset.
7. **WOM-07 Tiny baseline feasibility (after rights only):** medium-only and organism-only predictors, class prevalence, any chemistry-informed baseline and held-out strain/study metrics if sufficient. Because the pilot could be highly imbalanced, report per-class, uncertainty/calibration, abstention, group holdout and trivial shortcut ablations. **No fabricated benchmark outcomes.**
8. **WOM-08 Decision and receipt:** Output one of `GO_MEASURED_LABELS_RIGHTS_AND_SPLITS_OK` (to train *research-only* candidate), `NO_GO_INADEQUATE_DATA_OR_LABELS`, `BLOCKED_ACCESS_OR_LICENSE`; document exact blocker and next legitimate acquisition action.

**Do not overwrite current task selection:** Codex continues `NEXT_ACTIONS.md` confirmed supplement intake/UPC/ Food #12/Response #15. This is a bounded v0.6 Advanced scientific readiness work item to execute when eligible; no second Codex queue, no UI redesign or new public scientific prediction cards.

## 5. Reconciled first-model decision

Existing approved primary task `MICROBE-SUBSTRATE-UTIL-V1` (experimental *growth/utilization*) is not equivalent to WoM's *extracellular metabolite increase/emergence*. **Keep distinct dataset, target, assay, baseline and model promotion states**. This request adds a possible experimental metabolite-response pilot but **does not silently replace the existing first-model selection**, unless verified data rights + independent experiment coverage justify a revised explicit decision. If 2018 archived data really contain zero organism decrease, **do not invent negative/decrease labels**. Review newer separate assays for true measured decreases.

**Cost estimate:** metadata/schema probes and small authorized SQLite/TSV inspection may fit existing developer compute/CI at ~$0 incremental, otherwise ~$1–$10 for bounded CPU; actual training runtime/pricing requires real bytes, row counts and exact baseline selection. No new paid vendor/GPU subscription, automated external export or contact tool action without required authorization. This is a planning estimate, not observed cost.

## 6. Acceptance and deliverables

- `WOM-ACC-01`: Each of original site/SQLite, BERDL, Northen repo, de Raad/GNPS2 carries an actual access status and primary source link; missing bytes explicitly missing.
- `WOM-ACC-02`: No scraped/bypassed access; written licensing clarification where needed; public visibility never auto-grants training.
- `WOM-ACC-03`: Raw file manifest with original SHA256 and source/version/time **only for bytes actually obtained**, no invented raw dataset hash; GitHub file blob SHA and raw SHA256 not conflated.
- `WOM-ACC-04`: BERDL summary 10,744 vs 11,767 code sums flagged and independently reconciled with exact source SQL/row data before promotion.
- `WOM-ACC-05`: Actor-specific I/E/N vs control D/N semantics tested; every zero, missing, decrease and unchanged distinction preserved; unknown labels quarantined.
- `WOM-ACC-06`: Old 2018 archive NO organism consumption task; newer numeric “consumed” source must trace to original measured decrease and processing threshold.
- `WOM-ACC-07`: Compound formula/name candidate mapping does not silently create verified chemical identity; assay method and original features survive.
- `WOM-ACC-08`: Timepoint, replicate, experiment, study, medium and isolate groups audited; no source-based group leakage; training/test groups counted from actual rows.
- `WOM-ACC-09`: Dataset blocked on rights/access leads to inspected schema fixtures and `BLOCKED` receipt only, **no training model or invented evaluation metrics**.
- `WOM-ACC-10`: Independent source audit reports real eligible/negative label counts, baselines and go/no-go after raw rights/labels pass; research only.
- `WOM-ACC-11`: Synthetic fixtures are marked `synthetic`, never used as measured biology or validation truth; no private user accounts.
- `WOM-ACC-12`: No disruption to v0.6 Core, personal source isolation or existing science model/consent governance.

**Delivered architect artifacts:** this decision, [machine-readable source-access and action-code receipt](../scientific-models/web-of-microbes-acquisition-receipt-20261118.json) and standing `AGENTS.md` reference. No raw dataset, actual schema/record counts or live SQL query rights were obtained in this review. Those are **Codex next work**, not claimed delivered assets.

**Current explicit go/no-go:** **NO-GO for training from the BERDL 2018 snapshot today** (no organism consumption observations, no acquired licensed raw bytes and inadequate independently verified grouping). **CONDITIONAL GO for acquisition/inspection**, with separate increase/emergence model feasibility *pending*. Newer Northen/GNPS data may alter that decision only following experimental and licence review.
