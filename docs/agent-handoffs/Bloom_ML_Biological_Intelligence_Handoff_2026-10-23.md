# Bloom — ML & Biological Intelligence Specialist Handoff
**Date:** 2026-10-23 (America/Regina)  
**Owner:** Machine Learning & Biological Intelligence Specialist (scientific/ML guidance only)  
**Status:** Proposed for Chief Architect review; **no implementation, independent benchmark, security clearance or clinical sign-off**.  
**References:** Nutrition & Biology comprehensive handoff v1.1 dated 2026-10-23 (BIO-26-301–318), original ML handoff dated 2026-10-18, PROJECT_COORDINATION.md.  
**Repository:** knagle-max/BloomGutHealth; enhancement PR #1, branch enhance/bloom-experience. Biology's reviewed SHA: 5b607cfe8316567ff77f66b1ebefed01d8671e7c; verify latest head.  
**Ownership:** Chief Architect reconciles and approves intake; Developer exclusively owns implementation, tests, code and deployments. This document supplies specialist recommendations only.

## Executive position
Build an evidence-auditable host–microbe–food intelligence platform that prioritizes measurable individual outcomes and useful interventions. Organism/variant identity does not demonstrate gene expression, enzyme activity, metabolic flux, host concentration, or causal health benefit. Research graph relationships must never directly trigger clinical recommendations. Compare complex biological models with standard evidence-based nutrition baselines and abstain when incremental value is unproven.

## Architectural proposal
1. **Knowledge layer:** Federated, versioned gene–protein–enzyme–reaction–compound–organism–host pathway–food graph with canonical identifiers (NCBI/GTDB, UniProt, EC/Rhea, ChEBI, Reactome, FoodOn), species/strain/genome resolution, reaction directionality, stoichiometry, cofactors, transport and biological compartments. Separate proved from inferred edges.
2. **Evidence layer:** Distinct, versioned claim/evidence graph: PICO, study design, population, dose/preparation, outcome, effect and uncertainty, positive/null/adverse findings, bias, contrary research, licence, original source, retractions, curator and approval. Biological plausibility != intervention efficacy.
3. **Personal data layer:** Independently track assay type (16S vs shotgun vs expression/protein/metabolite), specimen, method, units, reference thresholds, detection, time, provenance, missingness and permissions. Never turn absent measurements into zero.
4. **Reasoning layer:** Deterministic safety and validated intervention constraints; evidence-grounded graph retrieval; research-only metabolic simulations (AGORA2/MICOM/COBRApy); calibrated predictive models only after independent outcome validation. LLMs draft extractions/explanations, not clinical truth or invented dose.
5. **Decision layer:** Rank safe feasible dietary/activity *substitutions* against selected measured outcomes, individual preferences, cost, burden and adherence. Surface simple action -> specific reason -> evidence/uncertainty -> evaluation; optional molecular explanation.
6. **Learning layer:** Versioned longitudinal observations and N-of-1 experiments with predeclared outcomes, confounder tracking and non-causal interpretation; consented model evaluation and champion–challenger promotion.

## Previously proposed research workstreams (carry forward)
- ML-2026-101–112 (2026-10-18 handoff): biological graph; typed assay/genome functional inference; evidence and provenance; harmonized food/molecule substrates; metabolic simulation readiness; multimodal predictive modelling; intervention optimization; long-term outcome validation; uncertainty and abstention; benchmarking; licensing and privacy; specialist release governance. Architect should map against BIO-26-301–318 and original eight BIO requirements rather than creating duplicate engineering.
- Database evaluation: GTDB/NCBI, UniProt, Rhea, ChEBI, Reactome, BRENDA, AGORA2/Virtual Metabolic Human, MICOM, HUMAnN, MGnify, HMDB, FoodOn/USDA FDC, PubMed/Europe PMC/ClinicalTrials.gov. Confirm rights for commercial use *per source and artefact*; e.g. HMDB redistribution restrictions require review.

## New ML acceptance recommendations from Biology v1.1 review
**ML-26-201 — Canonical identity resolution (P1).** Every biological identifier mapping retains ontology version, source, organism/strain/genome, confidence and ambiguity. Negative and mismatched identity tests must fail safely. Avoid matching only common bacterial names.

**ML-26-202 — Separate biological knowledge and evidence graphs (P0 for personal claims/P1 general).** Distinguish a valid biochemical capability from evidence a food intervention changes a human outcome. Every recommendation claim traces to applicable reviewed evidence; contradictory/null records remain discoverable.

**ML-26-203 — Mechanistic prediction benchmarks (P1 research).** Benchmark enzyme capability, microbial substrate utilization, cross-feeding and metabolic predictions against independent measured data; report sample, split policy, confidence intervals, failure conditions, baseline performance, out-of-distribution testing. Do not report flux as measured metabolite concentration.

**ML-26-204 — Machine-readable causal boundaries (P0).** Typed edges differentiate known reaction, inferred capability, association, experimentally observed activity, simulated flux and causal intervention effect. Reject graph traversal or LLM explanations that upgrade category without separate evidence.

**ML-26-205 — Value-of-information engine (P1 research).** Assess whether more lab, genetic, microbiome or metabolic testing could alter an intervention decision enough to justify expense, burden and privacy cost. Do not market assays without demonstrated incremental clinical decision value.

**ML-26-206 — Champion–challenger model governance (P1 / P0 before efficacy claims).** Retain approved baseline; separately test challengers on held-out participant/cohort data with predeclared metrics for calibration, clinical relevance, subgroup harm, safety, burden and incremental benefit. Require clinical review and controlled, reversible model release.

## Biology handoff assessment
**Approved as research direction for Architect consolidation, NOT implementation or clinical release sign-off.** BIO-26-301–312 align with proposed outcome-first, mechanistic, evidence and longitudinal architecture. BIO-26-313–318 add particularly important living-evidence capabilities: surveillance, structured appraisal, claim lifecycle, safe re-evaluation, drift/prospective evaluation and update explanations. Deduplicate new ML requirements above with BIO-26-302/309/310/313–317.

**Two isolated trust paths:**
- Research discovery updates a *candidate* biological and evidence graph, including new, strengthening, weakening, contradictory and withdrawn findings.
- Approved decision guidance changes only after source integrity checks, structured appraisal, applicability review, biological specialist sign-off, architect intake and Developer-controlled versioned release with rollback.
No article-to-live-recommendation or continuous unreviewed retraining path.

## Research before implementation
A. Reconstruct three pathways end-to-end (resistant starch fermentation, tryptophan metabolism, bile acid modification) to measure identifier accuracy, compartment handling, contradictory source claims and unsupported links.  
B. Test assay-informed function inference: 16S taxonomy vs shotgun functional potential vs measured activity/metabolites.  
C. Benchmark AGORA2/MICOM predictions against experimental or held-out metabolomics; document missing microbial strains, substrate mapping, solver, propagation of uncertainty and abstention.  
D. External outcome-model ablations: clinical+diet baseline, then genetics, then microbiome, then metabolomics, checking value added, leakage and calibration.  
E. Pilot a living-review pipeline with PubMed/Europe PMC/ClinicalTrials.gov, correction/retraction dependency mapping, licence review, sample source-span extraction audits and rollback rehearsal.

## Specialist acceptance and handoff
- ML specialist: schema/identifier and prediction benchmark design; model validity, calibration and leakage; research extraction failure auditing.
- Biology: clinical applicability, intervention evidence, safety and language sign-off.
- Security: genetic/health data protection, permitted processing, licensing/supply chain.
- Design and User Testing: clarity of observed/estimated/simulated status, burden and comprehension.
- Architect: deduplicated intake and conflict resolution.
- Developer: sole implementation/GitHub/test/deployment ownership once architect-approved.

**Do not represent proposed systems as shipped.** No evidence of independent clinical validation or user-outcome benefit was established in this handoff.
