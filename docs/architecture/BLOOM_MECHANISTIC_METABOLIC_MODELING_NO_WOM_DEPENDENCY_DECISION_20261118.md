# Bloom — Mechanistic Microbial Metabolic Modeling: Web of Microbes Dependency Removed

**Date:** November 18, 2026 · **Authority:** Direct Product Owner / Chief Architect directive · **Disposition:** APPROVED bounded engineering implementation path **without** WoM or PMkbase dependency.  
**Implementation owner:** Codex, sole implementer, on `enhance/bloom-experience`; `AGENTS.md` and `NEXT_ACTIONS.md` remain the sole execution policy/priority.  
**Related documents:** [Scientific AI Model Program](BLOOM_SCIENTIFIC_AI_MODEL_DEVELOPMENT_PROGRAM_ARCHITECT_DECISION_20261118.md), [WoM Acquisition](BLOOM_WEB_OF_MICROBES_DATA_ACQUISITION_MODEL_READINESS_DECISION_20261118.md), [Python ML Restoration](PYTHON_ML_RESTORATION_AND_MOLECULAR_EXPANSION_DECISION_2026-11-06.md), [model task registry](../scientific-models/prediction-task-registry.json), [dataset rights ledger](../scientific-models/dataset-source-rights-catalogue.csv).

## 1. Binding supersession and scope

**Web of Microbes, PMkbase and any single experimental dataset are OPTIONAL evidence/benchmark acquisition tracks, never a blocker for implementing the first real microbial constraint-based modeling baseline.** This supersedes earlier wording in the scientific AI program that might suggest experimental label rights/data acquisition are prerequisite to *every* biological solver implementation. Rights/measurements **remain mandatory** before claiming **experimental validation or training proprietary supervised predictors**. Do not conflate “a metabolic model executes” with “a proprietary learned biological predictor was experimentally validated.”

Two **parallel scientific capabilities** within the same existing Python ML service and governed model/graph registry:

1. **MECHANISTIC-SINGLE-STRAIN-V1 — first executable milestone:** a legitimate, rights-qualified genome-scale (or appropriately curated smaller strain-specific) metabolic reconstruction; actual real CPU linear-programming solver; source-checked medium/substrate/reaction bounds; baseline and perturbation; output as **predicted feasible flux / growth / exchange**, not measured secretion, concentration or medical effect. Can be implemented **without experimental training labels** after model-data rights review.
2. **MICROBE-SUBSTRATE-UTIL-V1 and/or MICROBIAL-METABOLITE-OBSERVATION-V1 — independent measured-data research:** curated measured strain×condition targets, legitimate rights, independent splits and holdout baselines. WoM/PMkbase/BacDive or other datasets may contribute but cannot block the mechanistic engineering path. No learned-model promotion until actual independent experimental benchmark.

**Architectural freedom:** Codex may use a better-suited open source model/solver/library (e.g. COBRApy with HiGHS/GLPK as available) instead of requiring specific names or layouts, provided real reconstruction, correct chemistry, rights, bound semantics, reproducibility, falsification tests and safety gates remain intact. No new platform/microservice/graph/recommendation engine.

## 2. Current repository audit (source verified from branch on Nov 18)

| Path | Present state | Reuse/add |
|---|---|---|
| `ml_service/research/stoichiometry.py` | Finite synthetic exact-rational LP used only for tiny synthetic networks. Docstring expressly disclaims curated organism reconstructions and biological calibration. | Keep synthetic controls **unchanged as separate synthetic tier**; do not retitle or promote as real. Add a real reconstruction loader + LP solver adapter independently under existing ML service. |
| `ml_service/research/synthetic_service.py` | Fixed synthetic scenarios and strict Pydantic requests | Keep negative/structure tests; do not feed its synthetic outcomes into real biology ground truth. |
| `ml_service/main.py` | FastAPI with internal authentication and bounded synthetic research endpoint | Reuse secured backend; **training and initial solver milestone can run offline as reproducible CLI/tests**, no early public API. Add protected research endpoint only after verified permissions/limits/contract. |
| `server/ml-service.ts` | Strict allowlist including `/api/ml/research/synthetic` | Reuse; any future model endpoint explicit allowlist + research gate + auth, never unrestricted proxy or browser access. |
| `server/metabolite-research.ts` | Source/protocol boundary and explicit no-connected-model result | Preserve honest unavailable fallback; wire only after real solver path validated and approved. |
| `shared/biological-model.ts`, `shared/evidence-network.ts` | Typed biological entities, relations/evidence scaffolding | Extend **existing canonical** source/provenance/identity mapping; no competing graph or inferred causal links. |
| `pyproject.toml` | Python/NumPy/pandas/scikit-learn, **COBRApy and MICOM not installed** | Add a pinned CPU-compatible solver/Cobra dependency only when the model-run experiment needs it; test environment on actual CI/runtime. |
| `docs/scientific-models/` | Existing prediction registry + candidate source rights catalogue | Add one distinct **mechanistic capability task**, source/model manifests and executable result receipts, not 7 new projects. |

**Not demonstrated as shipped:** licensed local AGORA2 SBML file, strain-specific reconstruction bytes and raw SHA256; actual FBA/pFBA result on a real organism; validated reaction/compartment crosswalk; real source-reviewed scenario controls; independent experiment comparison; real-model inference; public personalized inference. A published architecture/ML service is not solver evidence.

## 3. Source, license and fit assessment: no blanket AGORA2 entitlement

**AGORA2:** Source [AGORA2 repository](https://github.com/VirtualMetabolicHuman/AGORA2), [Nature Biotechnology paper](https://www.nature.com/articles/s41587-022-01628-0), [VMH download portal](https://www.vmh.life/reconstructionDownload). Paper describes genome-scale reconstructions for **7,302 microbial strains** and reaction-level model conventions compatible with VMH. GitHub's **MIT repository license does not by itself establish rights to separately downloaded reconstruction data**. Exact VMH model (version, file, license, allowed commercial use/model inference/redistribution/model derivatives) **NOT independently cleared**: Codex must inspect the actual portal terms or obtain specific written clarification **before incorporating model bytes into commercial Bloom artifacts**. A website allowing academic download is not the same as commercial license. If AGORA2 commercial rights cannot be confirmed, select **a different genuinely licensed strain-specific SBML reconstruction** with known provenance and exact intended use; do not replace it with a synthetic toy and call it the first biological milestone.

**COBRApy:** Python constraint-based reconstruction/optimization library; inspect actual runtime and solver licensing, pin tested version and solver backend; use real FBA/pFBA and `cobra.io.read_sbml_model` or equivalent validated reader. An optimization solver's *optimal numerical flux* is conditional on objective and bounds, not a biological measurement. Verify SBML import, reaction IDs, model compartments, optimization statuses (optimal/infeasible/unbounded/numerical), growth objective semantics, and exchange reaction sign conventions, rather than assuming negative always means consumption without mapping.

**MICOM:** [micom-dev/micom](https://github.com/micom-dev/micom) is Apache-2.0 licensed software for community models and exchanges. **Evaluate only; not required for the first single-strain milestone.** Community absolute organism abundances, medium, growth trade-off, taxon-model mapping and solver limits need separate experimental assumptions. Its license does not automatically license all bundled or imported AGORA2/community model files.

**gutSMASH:** [gutSMASH code](https://github.com/victoriapascal/gutsmash), [project site](https://gutsmash.bioinformatics.nl/about). Model genome-derived primary-metabolism gene cluster *capabilities*, not measured production. AGPL-3.0 source code requires software distribution/network-service review before installing into proprietary deployed architecture; dependencies and database rights separate. Evaluate as **offline, isolated, legally reviewed supplementary experimental prediction**, **not** a mandatory module in the FBA execution path. The project's public site accepting jobs is not permission to send private user genomes or bulk sequences.

**BacDive:** [DSMZ about and license](https://bacdive.dsmz.de/about), [API](https://api.bacdive.dsmz.de/). Strain-level growth and phenotypes may support actual independent benchmark targets, with explicitly recorded assay medium/conditions and negative classes. Official site says CC BY 4.0 **AND asks commercial users to contact them**; potential additional benefit-sharing rules may apply. Need written commercial model-training/derived-model right disposition and attribution before treating bulk BacDive phenotype exports as approved commercial training data. Search/UI accessibility is not blanket bulk download authorization. Species-level BacDive phenotype is not automatically a strain-specific trait.

**Web of Microbes and PMkbase:** remain **nonblocking optional measured-data tasks**. Their access/rights/archived action-code constraints still apply independently. No automatic consumption labels from WoM 2018 “unchanged.”

## 4. First bounded source-reviewed model: selection contract

**Codex task:** Source and register a specific **strain**, not merely a species name. Select small valid model subset **1 initially**, at most **2–3** independently reviewed reconstructions for initial engineering. These must be original non-synthetic reconstruction files with:
- `modelId`, organism strain identifier, genome accession where supported, reconstruction version/repository publication/DOI, license/rights, source URL, file SHA256, acquisition time, reconstruction method and gap-filling details.
- SBML or appropriate source format; parseable **reaction/metabolite/gene bounds**, exchange/transport, biomass objective, relevant compartment constraints; distinguish model predictions vs assay labels.
- Source-linked demonstrated substrate reaction and one **possible** product exchange (verify reaction identities and medium flux allowance, not only a theoretical graph path).
- An interpretable **baseline medium**, including default bound semantics, oxygen/redox assumption, allowed carbon/nitrogen sources, transport/extracellular compartment, time/unit basis and exact exchange sign.
- A contrasting medium/scenario (e.g. one source-qualified substrate uptake disabled/restricted) with **all else held constant**. No assertion that limiting this substrate uniquely changes output if alternative substrates or alternative optima exist.

**Quality gates before solver invocation:** rights status, model SHA, parse errors, duplicate/stale identifiers, unbalanced internal reactions where inspectable, chemically impossible source/sink, biomass definition, no free carbon/reducing equivalent/ATP from closed media without validated exceptions; known gap-filling artifacts and alternative optima. Do not require perfect model validity but flag assumptions/limitations explicitly and reject invalid scenario artifacts.

## 5. Typed identity and mapping into current biological graph

**Reconcile canonical identifiers without throwing away original strings.** Strongest available source mapping priority:
- Original VMH/AGORA reaction/metabolite/gene IDs and model release/source for round-trip source truth;
- Rhea reaction crosswalk only when substrate/product direction and stoichiometry match (not a name string resemblance);
- ChEBI exact chemical IDs including protonation/isomer/charge/compartment distinction;
- EC/enzyme/protein/UniProt only at **supported strain/gene evidence tier**, not a "gene present = enzyme active" shortcut;
- existing `shared/biological-model.ts` / `shared/evidence-network.ts` stable graph IDs and claim/evidence classifications, never a second master reference.

**Required graph relation types** (extend or map to canonical equivalent): `reconstruction_contains_reaction`, `reaction_consumes_substrate`, `reaction_produces_product`, `reaction_requires_cofactor`, `reaction_in_compartment`, `reaction_uses_transport`, `reaction_associated_with_gene`, `model_predicted_exchange`. Each carries model hash/version, condition/scenario ID, evidence class, direction and uncertainty. A candidate predicted flux edge **must not become a universal biological fact or reviewed personal diet action**. No invented EC, stereochemistry, thermodynamics or human compartment mapping.

**Suggested source-independent contract (illustrative, adapt to existing systems):**
```ts
type ReconstructionModelRef = {
  id: string; strainId: string; modelVersion: string; sourceId: string;
  originalModelSha256: string; rightsStatus: "approved" | "review_needed" | "restricted";
  compartments: readonly string[]; sourceReactionIds: readonly string[];
};
type MechanisticScenario = {
  reconstructionId: string; scenarioId: string;
  mediumSourceId: string; uptakeBounds: Readonly<Record<string, number>>;
  oxygenAssumption: "defined_anaerobic" | "defined_aerobic" | "other_specified";
  objectiveReactionId: string; solverVersion: string;
  environmentAssumptions: readonly string[];
};
type MechanisticSolverReceipt = {
  reconstructionId: string; inputHashes: readonly string[]; scenarioId: string;
  solverStatus: "optimal" | "infeasible" | "unbounded" | "error";
  objectiveValue: number | null; fluxUnits: string | null;
  candidateExchanges: readonly {exchangeReactionId:string; feasibleFlux:number|null; direction:"uptake"|"secretion"|"unknown"}[];
  warnings: readonly string[]; observedBiology: false;
};
```
**Do not assign universally physiological `mmol/gDW/h` unless the reconstruction/medium/constraints genuinely support that unit interpretation.**

## 6. Actual CPU baseline and contrasting-scenario execution

Implement using a **real general linear optimization solver** (e.g. COBRApy with a suitable installed CPU solver, not the tiny synthetic vertex enumerator).

1. **Load pinned licensed model**, assert source hash, supported SBML/model ontology, strain identity, nonempty gene/reaction/metabolite set and explicit bounds.
2. **Validate defaults**: exchange directions, open/closed medium, objective, oxygen, biomass/growth constraints, transport boundaries, numerical tolerances. Record unmodified original source/bounds separately from scenario overlays.
3. **Run model-control baseline:** expected growth or reaction viability under source-reviewed medium, solver `status`, objective, bounded feasible exchange flux/reaction set. Solver may yield multiple optima; **FVA or constrained per-exchange optimization** when needed to support claims about possible products.
4. **Run substrate-limited contrasting scenario**, with one explicitly named substrate uptake constrained to zero/specified limit, all other relevant bounds equal. Re-evaluate objective and feasible exchanges; positive/negative controls should be real model constraints, not merely expected strings in fixtures.
5. **Run negative controls**: invalid substrate ID, blocked transport, source-closed medium where growth should fail under model assumptions, infeasible or unbounded objective, missing reaction/gene, impossible directed output or mass imbalance; method explicitly handles realistic model anomalies without saying "no metabolites produced" solely from zero single optimal flux.
6. **Record actual solver artifact** as machine-readable result **only after execution**: code commit, exact model bytes SHA256/licence, Python/COBRApy/solver versions, source medium and scenario version, objective and solver status, selected exchange min/max or FVA, runtime/CPU, numerical tolerances and warnings.
7. **Compare with published experimental observation** under sufficiently matching strain, substrate, conditions, medium, measurements and licensing; represent `observed`, `model_possible`, `unmeasured`, `inconsistent`, `not_comparable` distinctly. Even a correct model-predicted exchange cannot be treated as measured substrate uptake or host exposure.
8. **Expose nothing to consumer UI** until research-only source/model/safety review and existing typed service integration. Offline CLI/test receipt is the first milestone; no public inference endpoint required.

**Reproducibility:** run twice in a fresh pinned environment if practical, assert same model checksum/medium settings and objective/constraint outputs within solver tolerance; no nondeterministic fixture cherry-picking. Cache by model hash + solver + objective + bounds + scenario revision; raw model data/derived artefacts in rights-approved locations, not private user database or public Git if restricted.

## 7. Staging and exact Codex order (no parallel execution queue)

**MM-01 (now eligible as scoped scientific R&D):** Confirm repository files/ML adapter/graphs and existing research constraints at HEAD; document precise gaps (this source audit is baseline, not substitute for code inspection).
**MM-02:** Qualify AGORA2 model licensing and accessible exact model format/strain options; compare alternative licensed reconstruction if blocked. Verify MICOM/COBRApy/solver versions and intended licenses.
**MM-03:** Select one–three **rights-approved strain reconstructions** and source/assay/mapping; register model file provenance, exact licensed distribution status, medium, source hashes when acquired.
**MM-04:** Introduce narrowly scoped Python real-model parser + CPU solver + rigorous numeric and source validity tests under `ml_service/research/` (or equivalent). **Preserve `synthetic-vertex-lp-v1` completely distinct.**
**MM-05:** Map actual source reactions/enzyme/substrate/product/compartments to existing graph by source-qualified read projection; avoid bulk evidence edge rewrite.
**MM-06:** Execute actual baseline and perturbation with positive/negative controls; write reproducible artifact with measured runtime/CPU and solver statuses.
**MM-07:** Compare to source-reviewed independent measured reactions/metabolites if accessible; maintain independent data acquisition and error/abstention. **Empirical validation can remain blocked while engineering solver milestone succeeds**, but scientific empirical claims cannot be released.
**MM-08:** Evaluate gutSMASH offline/AGPL boundaries and BacDive phenotype rights/coverage independently. Treat optional findings as evidence candidates only.
**MM-09:** Approve a narrowly gated research-only service integration **only if** science/privacy/right/compute/security criteria passed; no personal therapeutic inference.

**Do not displace:** Active `NEXT_ACTIONS.md` V06-M3 supplement source UPC/label acceptance, Food #12, Response #15 and correctness. This directive authorizes independent source/model research and next bounded Advanced capability as engineering schedule permits, **not another Codex or nine-agent work queue**. Codex should not spend excessive time composing architecture documents, broad UX redesign or screenshots.

## 8. Acceptance and falsification

- `MM-ACC-01` WoM/PMkbase not referenced as a required dependency/gate in build/runtime/tests for mechanistic solver.
- `MM-ACC-02` Actual non-synthetic **strain-specific** model source, verified rights, exact bytes SHA256 and version; old synthetic LP stays declared synthetic.
- `MM-ACC-03` Strict parser validates model, actual compartments, reaction bounds, biomass objective and media; no invented IDs or silently gap-filled substrate.
- `MM-ACC-04` Actual CPU solver returns genuine `optimal`/`infeasible` statuses, objective and source-linked reactions/exchanges with unit assumptions.
- `MM-ACC-05` Baseline and substrate-limited scenario differ only by declared bounds; demonstrate expected change when supported and no fictitious change otherwise; check alternative optima.
- `MM-ACC-06` FVA or constrained exchange envelope separates `possible` from `always occurs`; 0 flux in one optimum isn't "cannot produce."
- `MM-ACC-07` Medium, oxygen, transport and extracellular assumptions explicitly recorded; close impossible free growth/carbon/redox sources where scientifically testable.
- `MM-ACC-08` Original model reaction/metabolite/gene IDs map through canonical graph, preserves stereochemistry/compartment/evidence and unknown crosswalk safely.
- `MM-ACC-09` Experimental comparison uses genuinely compatible measured conditions and exact study provenance, not synthetic simulated figures; if no measurements, model still runs but `EXPERIMENTALLY_VALIDATED=false`.
- `MM-ACC-10` gutSMASH capabilities not confused with functional activity; AGPL/code license and services/private-genome rules reviewed before integration.
- `MM-ACC-11` BacDive or other phenotype dataset trained only after commercial-model/derived-data rights and assay/source identity verified; not a prerequisite.
- `MM-ACC-12` Model errors, infeasible scenarios, missing model, source withdrawal, licensing denial or solver unavailable produce explicit abstention/block, no personal exposure or clinical claims.
- `MM-ACC-13` Reproducible model hash, solver/pinned environment, scenario medium, objective and tolerance, CPU runtime/cost, original provenance and source-linked artifacts.
- `MM-ACC-14` Existing user data/evidence/account protections and Core tasks unaffected; no second model service, recommendation engine, raw model leakage or public UI predictor.
- `MM-ACC-15` First milestone PASS **only** with real licensed strain reconstruction, actual solver run, substrate/scenario comparison, model reactions and candidate products, reproducible controls and limitations. **Independent experimental prediction success is a distinct gate**; never claim trained model if only FBA ran.

**Status/report labels:** `ARCHITECTURE_APPROVED`, `MODEL_SOURCE_IDENTIFIED`, `MODEL_RIGHTS_ACCEPTED`, `MODEL_BYTES_VERIFIED`, `SOLVER_CODE_PRESENT`, `ACTUAL_SOLVER_EXECUTED`, `EXPERIMENTALLY_CHALLENGED`, `RESEARCH_RELEASE_APPROVED`, `PERSONAL/CLINICAL_USE_APPROVED`. Each independent; don't claim PASS for a design brief.

## 9. External rights and evidence references checked Nov 18, 2026

- AGORA2 original: https://github.com/VirtualMetabolicHuman/AGORA2 ; https://www.vmh.life/reconstructionDownload ; https://www.nature.com/articles/s41587-022-01628-0 — 7,302 strain reconstructions, actual model-data distribution separate from MIT repository.
- MICOM: https://github.com/micom-dev/micom — Apache-2.0 package, community modeling optional.
- gutSMASH: https://gutsmash.bioinformatics.nl/about ; https://github.com/victoriapascal/gutsmash — specialized primary-metabolism detection, AGPL-3.0 software.
- BacDive: https://bacdive.dsmz.de/about ; https://api.bacdive.dsmz.de — CC BY 4.0 public site and explicit commercial contact request, DSI benefit-sharing terms may apply.
- COBRApy: https://opencobra.github.io/cobrapy/ — Python model/solver technical docs; verify specific installed version and optimization backend.

**Definition of done:** A source-rights-qualified strain metabolic reconstruction runs on a real CPU optimization solver under clearly declared medium/substrate conditions, produces reproducible feasible reaction/exchange results and a contrasting perturbation with honest biological limits. Web of Microbes and PMkbase are **not** prerequisites. Empirical training, independent experimental prediction quality and personalized public use remain separately controlled.
