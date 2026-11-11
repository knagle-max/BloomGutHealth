# Bloom — AI/ML Specialist Review of Biological Optimization Intelligence

**Document ID:** ML-BOI-20261109-R1  
**Date:** 2026-11-09  
**From:** AI Intelligence & Personalization Specialist  
**To:** Chief Architect & Integration Lead; cc Biology, Integrations, UX/Brand, Security, Legal, User Testing, Codex  
**Disposition:** **APPROVE WITH TARGETED REVISIONS** for architectural consolidation; not implementation or model validation.  
**Source reviewed:** `Bloom_Biological_Optimization_Intelligence_Architecture_v06_2026-11-09.md` (266-line shared document; source snapshot identifies `enhance/bloom-experience` @ `633f6835f356f65befd20a0c8a45ffb699afa6b8`).  
**Repository cross-check:** `docs/architecture/V06_HANDOFF.md`, `NEXT_ACTIONS.md`, `ML_ARCHITECTURE.md`, `RESEARCH_MODEL.md` at the source-named revision. No tests, deployment, biological model training or claim approval performed.  
**Governance:** Chief Architect alone consolidates requirements; Developer/Codex alone changes app source after scope gate. No new v0.5 requirements.

## 1. Decision for Architect

Accept BOI as an *integrating product capability*, not a second data system, new biological health-score service or replacement for the ML roadmap. Preserve the three distinct source-described experiences: (1) reviewed everyday wellness actions, (2) conservatively evaluated individual response, and (3) molecular and microbial research modelling. The document is detailed and generally sound, but the program needs a stronger **parallel molecular R&D commitment**, narrower contract and dependency definitions, a more precise optimization objective, and stage-specific reproducible model-validation gates.

The central revision is **BOI-013 must not be interpreted as “do not develop microbial molecules until Phase 4.”** Product direction already approved active v0.6 microbial gene→enzyme→reaction→substrate→metabolite computational work under `ML-REST-1806` and `ML-BIOMODEL-1901–1908`. Synthetic reference-model ingestion, reaction curation, scenario engine, and mathematical/biological benchmark work can progress in parallel with the practical food/activity optimizer after v0.5. This does *not* authorize personal biological flux predictions, clinically consequential output or new paid infrastructure.

## 2. What the source gets right — retain unchanged

1. Source-native, immutable observations, explicit original units/time/method, consent, uncertainty, and corrections versus model derivations.
2. Unmeasured *not equal to zero*; taxon identification not equal to strain, genetic capacity, gene expression, metabolite production, concentration or clinical effect.
3. User goals and hard safety eligibility preceding ranking; routine guidance useful without expensive omics or devices.
4. TypeScript/Express/PostgreSQL remain ownership/permission/source and action authority; Python computes bounded candidates; TS rechecks them; LLM only interprets or explains reviewed structured material.
5. Human-guided longitudinal observation and explicit adherence events; no causal inference from uncontrolled pre/post changes.
6. No cross-domain 0–100 biological efficiency score; distinguish measured, modelled and research-only information.
7. Wearable, DRI, hormone and glucose claims require measurement-specific limits, not fabricated personal physiology.
8. No forced genetic, CGM, hormone, stool or wearable uploads; progressive onboarding and manual alternatives.
9. Scope/release boundaries for clinically consequential interpretation and sensitive biological information.

## 3. Material recommendations and acceptance crosswalk

| Source BOI ID | Review disposition | Decision / precise addition | Priority |
|---|---|---|---|
| BOI-001/002/016/017 | **APPROVE / REUSE** | Existing canonical observations, evidence lifecycle, private consent and deletion must be mapped field-by-field. Define one unambiguous input snapshot and inference lineage; no duplicate observation/evidence tables. | v0.6 P0 |
| BOI-003/004/005 | **APPROVE / NARROW** | Collect only features required for an approved decision. Actual supplements versus planned, nutrient null/partial, current safety context, dated activity/sleep and device de-duplication are critical; wide intake matrix is a reference, not mandatory onboarding or a mandate to connect all vendors. | v0.6 P0/P1 |
| BOI-006/008/009 | **APPROVE / IMPLEMENT FIRST** | Reuse existing Today choices, food eligibility and action ledger; first practical objective is **one eligible cross-domain decision** with documented hard constraints, trade-offs, alternatives, editable user priority and confirmation. Measured outcomes can be reviewed descriptively; no claim of achieved benefit. | v0.6 P0 |
| BOI-012 | **APPROVE / DEFINE BASELINE** | Compare multi-goal Python solver with a *strong feasible deterministic planner on the same candidate set and constraints*. Define feasibility and optimality gap, goal-tradeoff diversity, runtime/CPU/memory, user edits, completeness and fallback. Solver mathematical optimality is not biological validation. | v0.6 P1 |
| BOI-013 | **REVISE — HIGHEST CONCERN** | Split **R&D start** (v0.6 parallel) from **personal model activation** (later, claim/rights/evaluation gated). Keep a committed molecular modelling workstream, not vague Phase 4 deferral. See section 4. | v0.6 active R&D |
| BOI-011/015 | **REVISE / STAGE** | Optional n-of-1 observations and response modelling should not be treated as a regulatory or statistical experiment by default; retain user-chosen tracking, attrition/confounders, preregistered offline comparisons, minimum sample gates and no causal personalized efficacy. Promote only after prospective incremental utility and calibration. | v0.6 later P1/P2 |
| BOI-007/014 | **APPROVE EDUCATIONAL ONLY** | Source-linked hormone and pathway knowledge is valuable, but GLP-1 and other hormone mechanisms must not be converted into inferred secretion, receptor efficiency or personal treatment optimization. | v0.6 P1/P2 |
| BOI-010 | **DEFER ACTIVATION** | Browser/PWA does not provide native HealthKit/Health Connect automatically. Preserve manual/import workflows; native bridge dependent on real entitlements/rights and independent verification. | feature-scoped |
| BOI-018 | **APPROVE / REVISE METRICS** | Separate semantic correctness, safety, UX, mathematical feasibility, predictive calibration, research biochemical fidelity, and business/compute budgets; one benchmark score cannot certify them all. | crosscutting |

## 4. Required molecular modelling preservation: active development, separately gated activation

### ML-BOI-2001 — One traceable host–microbe–molecule graph

**Reuse** existing organism/function evidence contracts and graph; no second graph. Edges are typed by species/strain, genes, enzymes (EC), reaction stoichiometry, cofactors, compartments, producer/consumer identity, substrate, product, host interaction, and exact source evidence. Each edge records biological model, specimen/method, directionality, context, source version, licence, positive and conflicting findings. No evidence link is automatically assumed to represent observed individual activity.

**Acceptance:** at least one end-to-end audited reference pathway containing production *and* consumption/cross-feeding, with a negative incomplete/ambiguous strain case; every graph edge auditable. Synthetic fixtures explicitly not personal data. No release of personal amounts.

### ML-BOI-2002 — Build and run a real reproducible biological reference scenario

Extend the existing source-free Python synthetic solver and research adapter, rather than reactivating legacy proxy concentrations. Choose one scientifically narrow SCFA-related example, review model/dataset licensing, assign source/reference version, reconstruct compartment-balanced reactions, define limiting substrates, uptake bounds, feasible flux and explicit objectives. Show reference-only baseline versus hypothetical substrate perturbation, diagnostics and reproducibility. All physiological interpretations limited to *model behaviour*.

**Acceptance:** the identical versioned synthetic/reference inputs generate stable outputs; infeasible substrate, mass-balance, cross-feeding, omitted species and missing reactions correctly abstain or explain invalidity. A synthetic solver passing mathematical tests alone is **not** evidence of measured gut response.

### ML-BOI-2003 — Separate three optimization objectives

Do not conflate **(a)** observed concentration (a measurement), **(b)** community reaction flux / theoretical secretion potential (a mathematical model quantity), and **(c)** human health benefit (clinical outcome). A model may optimize candidate flux under its assumptions while Bloom's released everyday plan only optimizes *independently approved eligible actions*. Include alternate trade-offs: no action, nutritionally adequate food, unwanted co-products and substrate competition; do not maximize any single molecule blindly. Explicitly differentiate modelled producer and consumer, net exchange and host absorption/transit.

**Acceptance:** modelled SCFA output cannot enter nutrient totals, personal metabolite charts, clinical alert scores or recommendation ranking; TS rechecks eligibility. Reference scenario and released food guidance remain separate even if they discuss the same food.

### ML-BOI-2004 — Biochemical and predictive evaluation, without invented targets

Predefine challenge: compare stoichiometric/constraint model to (1) a documented naïve capability baseline and (2) independently measured experimental perturbation results only where rights, assay identity and conditions are reliable. Evaluate *coverage, directional agreement, per-metabolite error where concentrations/flux are genuinely measured, uncertainty interval calibration, sensitivity, computational load, failure/abstention*, with participant/sample leakage controls. Where independent gold standard absent, retain R&D simulation with **no personal predictive accuracy claim**.

**Acceptance:** signed reproducible model card with assay/model source, dataset rights, benchmark partitions, negative tests, calibration limitation and versioned failure cases; external scientific domain review before production claims.

### ML-BOI-2005 — Model-to-user firewall and staged display

Tier A: reviewed molecular mechanisms in Science Explorer (education). Tier B: isolated internal/reference-data simulation (no actual user data, no published personal results). Tier C: optional *explicitly hypothetical*, reviewed research illustration only after licensing, legal/security, source/assumption verification and user comprehension. Tier D: actual personal inference or intervention advice—disabled until independent predictive and specific clinical/intended-use gates. Feature flag for each distinct tier, no implied automatic promotion. An opt-in label alone is insufficient approval.

**Acceptance:** no default-enabled path from synthetic/research response to personal coaching; no user report implicitly enrolled; revocation stops research context; failures and missing evidence produce honest explanation rather than hallucinated numbers.

### ML-BOI-2006 — Separate value demonstrations

Maintain two engineering success stories: **(i)** working Python cross-domain eligible-option optimization reaching user review and beating the baseline on predeclared practical metrics; **(ii)** functioning Python reference microbial molecule scenario that passes genuine biochemical controls. Neither substitutes for the other. A third future story is user-response prediction with held-out longitudinal accuracy and appropriate abstentions. Publish provenance, latency/cost, exact GitHub and deployment SHA independently.

**Acceptance:** no declaration of BOI 'implemented' on the basis of one Today screen, generic AI copy, endpoint healthcheck, or toy LP alone.

## 5. TypeScript ↔ Python contracts and cost/safety boundaries

**TypeScript authority:** consent/scope; source snapshots; identity; eligibility and clinical gates; recorded meals/activities; evidence claims; action identity; revalidation before save. **Python:** pure bounded optimization and model research; inputs minimized and versioned; no privileged database writes and no third-party data calls by default.

For the *everyday optimizer*, use only opaque candidate IDs, sources and numeric attributes necessary to solve; schema version, snapshot revision, allowed objective IDs, explicit hard/soft constraint flags, source coverage and allowed-user scope. Do not transmit raw SNP, lab values, Viome PDFs or free-text sensitive notes unless independently necessary and authorized. The solver responds with `{requestId, contextRevision, solverVersion, feasible, selectedCandidateIds, objectiveValues, constraintAudit, limitations}`; never a newly invented approved action. Express verifies the same revision/consent and constraints before user confirmation.

For *research modelling*, a distinct but reuse-compatible command payload must include `{researchProtocolVersion, referenceModelId, referenceModelHash, substrateAssumptions, communityAssumptions, solverSettings, resultType:'synthetic_reference', claimTier:'research_only'}` and validated, bounded numerical and rights metadata. Raw user measurements are explicitly not accepted in the first v0.6 modelling tranche.

Proposed resource caps should be measured against representative instances; no paid new provider, GPU service, independent flux server or wide memory store without authorization. Keep safe TS fallback on unavailable Python. Model hashes and claim provenance must survive answer revisions and source retractions.

## 6. Reconciliation against existing approved IDs

**Do not duplicate:** `V06-09` host–microbe model, `V06-12` goal-to-action, `V06-13` adaptive response, `V06-14` functional gene evidence, `V06-17` source trust, `ML-OPT-01–06`, `ML-REST-1801–1808`, `ML-BIOMODEL-1901–1908`, `ML-MOLEC-1201–1206`, `ML-STRAT-1701–1708`. Map `BOI-001–018` and `ML-BOI-2001–2006` as **acceptance refinements** to those canonical workstreams; do not create new parallel requirements ledgers or duplicated evidence pipelines. Existing `RESEARCH_MODEL.md` explicitly states it has no validated flux model. Repo `NEXT_ACTIONS.md` mentions source-free synthetic LP/private HTTP math controls; neither establishes validated personal biology.

**Implementation order / no artificial pause:** v0.5 release gate remains separate. In v0.6, initiate (a) practical baseline and bounded optimizer, and (b) reaction/source registry plus model benchmarks concurrently in the permitted engineering capacity. Research reference solver can advance on synthetic data while rights are evaluated; real licensed database ingestion awaits review. Actual personal flux model promotion is a later independent stage. Integrate simple Today/Explore content only after each relevant evidence/claim UI gate—not as a prerequisite to developing research math.

## 7. Cross-agent decision requests

- **Chief Architect:** adopt BOI as crosscutting capability; crosswalk exact IDs; expressly commit parallel molecular R&D; establish separate claim tiers and dual evidence of working Python code; prevent BOI broad requirements from re-opening v0.5 or displacing existing source/evidence foundations.
- **Biology:** identify a feasible first SCFA/cross-feeding reference pathway and reaction constraints; curate organism strain/genome/enzymes, stoichiometry and producer/consumer direction; confirm what is known under culture conditions vs human gut. Document human evidence for any independent real-food action and flag misleading wording.
- **Integrations:** evaluate versioned licensed model/reaction resources and deterministic CPU solvers; actual FastAPI–Express transport and source scope; set data/compute budget from benchmarks, not imagined prices.
- **Security & Privacy:** confirm research flag, no raw patient inputs, default-deny routes, payload bound, account isolation, cache/log retention, deletion and no shadow processing of private biology without consent.
- **Legal & Regulatory:** assess claim-by-claim intended use, difference between educational pathways and individual hormone/toxin/disease guidance, dataset rights and externally visible research simulation; non-clinical disclaimer alone is not authorization.
- **UX/Brand:** design plainly-labelled 'what the model explores' vs 'what your result measured', with alternatives, sensitivity, no false precision and progressive source disclosure; avoid an opaque bio-efficiency score.
- **User Testing:** independent comprehension that synthetic model flux is not measured personal production, and task value of ordinary choices, on exact candidate SHA; no v0.5 retrospective Python requirement.
- **Codex:** after Architect consolidation, inventory first, implement two separate synthetic proof-of-function pipelines (general optimizer and molecular research), test with real Python process and TypeScript revalidation, retain safe inactive feature flags; report exact commit and deployment; do not bring back original legacy fake concentrations.

## 8. Scientific source and validation limits

This review is grounded in the provided BOI document and source-named repository files. It does **not** independently verify the handoff's R01–R17 papers, their reported effect sizes, dates, licensing or guideline currency. Those citations must be separately checked by Biology/Legal before publication. Specifically the source cites 2026 AHA/ACC guidance, 2026 meta-analysis, 2025 expert microbiome consensus, GLP-1 assay limitations and Health Canada SaMD context; they are *claims of the handoff*, not independent research verification here. Any empirical biological model benchmark is **not supplied** in the handoff, and no new model results are inferred.

**Decision:** APPROVE WITH TARGETED REVISIONS. BOI is architecturally coherent and compatible with the user's original AI vision, provided BOI-013 becomes an active staged v0.6 research-engineering track and the one graph/one approval authority boundary is preserved. No user decision needed for this review or synthetic design planning. New cost, real sensitive-data use, externally visible consequential claims and production activation remain independently authorized.