# Bloom v0.6 — ML Unified Optimization & Personal Learning Research Handoff
**Date:** 2026-10-23 (America/Regina)  
**Owner:** Machine Learning & Biological Intelligence Specialist  
**Directive:** Chief Architect, Bloom v0.6 Precision Nutrition, Exercise & Biological Optimization  
**Priority:** P0 research/architecture; INFO P1  
**Status:** Source-reviewed proposal; not independently tested, approved for clinical use, or implemented. Do not interrupt v0.5 development.  
**Repository:** knagle-max/BloomGutHealth, PR #1, enhance/bloom-experience. The current working SHA must be rechecked by Developer.  
**Coordination:** Architect consolidates into docs/architecture/V06_HANDOFF.md; Codex exclusively implements/tests/commits/deploys application functionality. This specialist may publish source documentation only.

## 0. Decision and scientific boundary
**Recommendation:** Start with a transparent, constrained, evidence-reviewed, outcome-first multi-objective decision engine. Add hierarchical individual-response models only where enough comparable observations exist. Test mechanistic models and multi-omics models in a research sandbox, never assume genetics/microbial data improve conventional clinical/lifestyle-based recommendations.

Rationale: ZOE METHOD (n=347; 18 weeks) improved triglycerides (between-group mean difference -0.13 mmol/L) but not primary LDL; microbiome contribution cannot be isolated in the multicomponent intervention. Nature Medicine doi:10.1038/s41591-024-02951-6. Nature Communications 2026 doi:10.1038/s41467-026-75004-w emphasizes data quality, interpretability, confounding, causal inference and external validation. A 2024 Nature Microbiology microbial community SCFA model doi:10.1038/s41564-024-01728-4 was evaluated on several data types but is not evidence that hypothetical flux is measured individual colon or blood SCFA concentration. NIH Nutrition for Precision Health's diet × genes × microbiome × metabolism programme is a research program, not an already validated consumer optimizer: https://commonfund.nih.gov/nutritionforprecisionhealth.

## ML-OPT-01 (P0) Multi-objective optimization
**Baseline design:** an eligibility/safety gate -> small reviewed action library -> Pareto-dominance check -> transparent constrained ranking -> feasible combined plan. Do not begin with an opaque neural ranking model.
- Outcomes: categorical or physical-unit targets (e.g. ApoB, BP, waist, strength, weekly aerobic minutes, 5k time, GI symptom frequency); record direction, meaningfulness, priority and time horizon separately.
- *Hard* constraints: allergies, disclosed contraindications, applicable restrictions, scope-of-practice, no unreviewed supplements/meds, injury/medical flags, minimum nutrition safeguards, affordability ceiling if specified, time availability, consent, missingness. An ineligible action is removed, not downweighted.
- *Soft* trade-offs: goal importance, anticipated outcome benefit based on human intervention evidence, confidence, adherence, user preference, budget, prep time, convenience, ecological/ethical preferences.
- Methods compare: explicit rules + lexicographic priority; weighted additive utility after scale normalization; epsilon-constraint methods; Pareto-efficient frontier; MILP/CP-SAT for discrete meal/training scheduling. Start with rules + scored small options. Use mathematical programming only if scheduling complexity justifies it. Avoid optimizing surrogate microbiome scores.
- Constraint conflicts: report conflicting goals (e.g. aggressive calorie restriction vs muscle gain), give safe compromise/alternatives and user-controlled priority weights, not one synthetic universal "health" value. Uncertain effect sizes are ranges or direction-only, never invented percentages.
- Acceptance: for identical approved inputs and evidence version, output reproducible eligible ranked recommendations, excluded actions with reasons, identified trade-offs, a no-action/maintain option, and abstention when appropriate.
- Research cost: low/medium; open-source solvers possible, require no exotic GPU.

## ML-OPT-02 (P0) Biology-to-decision architecture
**Knowledge graph (not the same as the evidence graph)**: gene/variant (genome build, allele, assay), organism (taxon/strain/genome), gene product, enzyme (EC/UniProt), reaction (Rhea), substrate/cofactor/product (ChEBI), compartment and transporter, food matrix/preparation, host pathways (Reactome), phenotype, measurable outcome.
**Typed edges:** encodes; catalyses; consumes/produces; transports; occurs_in; interacts_with; observed_association; intervention_changes_outcome. Each edge has species/strain, evidence tier, experimental vs predicted, applicability, contradictory sources, version and direction. Identity mapping ambiguity abstains.
**Distinct evidence graph:** study, PICO, population, eligibility, intervention dose/duration, comparator, outcome, effect/CI, risk of bias, null/harms, sample overlap, retraction and reviewer. Human intervention evidence must directly justify actionable recommendations: traversing metabolic plausibility graph is insufficient.
**Three trust zones:** discovery candidates -> specialist-curated research graph -> separately approved interventions/rules and independently validated response models. LLM retrieval/explanations operate on approved snapshots; simulated pathways cannot silently become prescriptions.
**Source candidates:** NCBI/GTDB, UniProt, Rhea, ChEBI, Reactome, BRENDA, FoodOn, USDA FDC, AGORA2/VMH, MICOM, HUMAnN, MGnify, PubMed/Europe PMC/ClinicalTrials.gov. Licensing and commercial redistribution must be approved by Legal/Integrations.
**Acceptance:** resistant starch fermentation, tryptophan derivatives, bile acids and oat beta-glucan pilot graphs with manually verified IDs, compartment constraints and explicit unsupported-edge negatives. P0 guard prevents phenotype claims from inferred enzyme presence.

## ML-OPT-03 (P0) Personalized response learning
**Recommendation:** no personalization by default from one before/after. User observations are longitudinal evidence, not causal confirmation. Use robust within-person trends for monitoring; if appropriate, hierarchical partial pooling across consented comparable data; optional N-of-1 with prespecified metrics and safe intervention, repeated baseline, multiple repeated observations, adherence/confounders and washout where appropriate.
**Candidates:** robust trend estimator and measurement-error model; Bayesian hierarchical effects (population prior, individual shrinkage) after longitudinal data and validation; contextual bandits only for low-risk preference/engagement selections, not autonomous clinical treatment optimization. Prefer change point and clinically meaningful change thresholds reviewed by Biology; account for autocorrelation and secular trends.
**Evidence sufficiency gate:** adequate comparable measures with assay/protocol/time stamps, stable background interventions, sufficient baseline and follow-up for the outcome, adherence and no major uncontrolled confounder. There is no universal minimum N; prespecify per-outcome reliability and method. No repeat values -> guideline default. Missingness -> maintain/reassess, never infer normality.
**Acceptance:** simulations of regression to mean, seasonal effects, simultaneous diet+training changes, device switches, missingness, inconsistent lab units, adverse symptoms; model abstains or degrades rather than inventing personal treatment effects.

## ML-OPT-04 (P0) Counterfactual comparisons
**Separate three classes:**
1. *Evidence-grounded option comparison*: e.g. swap high-saturated-fat meal for an unsaturated-fat alternative, or reallocate training days, describing population-level expected direction and burden. Can be useful immediately if licensed reviewed evidence supports each choice.
2. *Predicted individual outcomes*: allowed only for prospectively validated, calibrated, applicable model and relevant measurements; show uncertainty and counterfactual assumptions.
3. *Personal causal effect*: reserve for valid randomization/replication or very strong quasi-experimental designs; observational before/after cannot claim it.
**Methods:** target trial emulation protocols in cohorts, doubly robust estimators or causal forests only with justified no-unmeasured-confounding assumptions; randomized within-person A/B for reversible low-risk interventions when appropriate; prohibit unsafe experimentation.
**Acceptance:** a confounded diet/weight example, different training loads with new pain, and microbiome-only inference return no causal quantitative estimate. Comparisons disclose competing changes, confidence and alternative of no change.

## ML-OPT-05 (P0) Incremental prediction validation
**Pre-register model ladder:**
M0: reviewed guideline recommendations; M1: goals + demographics/clinical markers + diet/activity habits; M2: + validated host genetics; M3: + microbial taxonomy composition; M4: + measured microbial functional genes; M5: + metabolomics and longitudinal signals when available.
**Holdout strategy:** split by *participant*, household/site/batch where correlated, study and time. Perform entirely external-cohort evaluation, avoid fitting preprocessing/ontology mappings on held-out outcome labels. Stratify age, ancestry, medications, sex where applicable, testing vendor and missing modalities.
**Metrics:** for continuous endpoints MAE/RMSE, calibration slope/intercept and prediction interval coverage; for binary endpoints calibration/Brier and sensitivity/false alerts; for decision quality treatment-specific net benefit, constraint violations, harm, adherence, burden/cost and prospective outcomes. Report confidence intervals, preregistered clinically meaningful increment and subgroup harm. Model size/graph coverage/AUROC alone is not sufficient.
**Candidates:** publicly described PREDICT cohorts (access terms verification required); NIH Nutrition for Precision Health / All of Us (controlled workbench access, no assumption of free download); public nutrition trials and paired omics available under dataset licences; MICOM/AGORA2 as experimental *mechanistic benchmark*, not outcome gold standard. Data-set discovery is NOT permission to access or use commercially.
**Failure condition:** if M2–M5 do not improve independent results vs M1, retain M1 for decision ranking and show omics mechanisms only as educational/research content.

## ML-OPT-06 (P0) AI explanation and guardrails
**Deterministic data boundary**: validate user source/age/assay/units/roles/medications/allergies, check eligible approved interventions and professional approval scope *before* LLM.
**Structured recommendations only:** action ID, substitution, eligibility check result, applicable goal/outcome, population applicability, personal inputs used and excluded, evidence claim IDs, strength class (not fabricated probability), expected direction or withheld estimate, uncertainty/contradiction, effort/time, monitoring plan, expiry/evidence hash, abstention reason.
**LLM:** explain approved decisions, draft options under schema and evidence retrieval, no invented references, mechanism, unit conversion, individual response or escalation thresholds. No access to raw genetic/microbiome/lab data unless purpose-authorized and minimized. Independent guard checks on output.
**Red team:** cross-user data leakage; adversarial instructions in uploaded report/PubMed abstract; fabricated dose; unsupported genotype-to-enzyme-to-food link; absent allergy; conflicting lab units; missing samples; vulnerable individual, REDs risk, pain symptoms; false precision; clinician restriction; no suitable action.
**Acceptance:** zero unsafe unreviewed recommendations in P0 curated fixtures; no false claims of measured enzyme expression/flux; every released recommendation replayable from user snapshot + evidence version + rule/model version. Clinical specialist signs off on real user-facing rules.

## Shared illustrative data contracts (Architect to decide final schemas)
```json
{
  "goal": {"id":"g1","outcome_id":"ApoB","direction":"decrease","weight":0.7,"horizon_weeks":12,"priority":"user"},
  "observation": {"id":"o1","kind":"laboratory","analyte_id":"ApoB","raw_value":1.13,"raw_unit":"g/L","collection_time":"2026-10-01","source":"lab","method":null,"unit_status":"confirmed","value_status":"measured"},
  "context": {"consents":{"genomics_for_recommendations":false},"allergies_status":"unknown","minutes_available_weekly":180,"preferences":["vegetarian_optional"]},
  "action_candidate": {"id":"ACT-001","label":"replace specified saturated-fat source with unsaturated alternative","outcome_id":"ApoB","evidence_claim_ids":["CLAIM-APPROVED-EXAMPLE"],"expected_direction":"decrease","individual_effect_estimate":null,"review_status":"approved"},
  "recommendation": {"action_id":"ACT-001","eligibility":"pending_safety_confirmation","status":"not_issued","reason":"allergy/contraindication status unresolved","evidence_version":"example","monitoring":null}
}
```
This is a schema illustration only, not a claim of real measured user values or existing claim IDs.

## Ten representative ML decision scenarios
| # | Goals / input | Expected behavior | Important abstention |
|---|---|---|---|
| 1 | High ApoB + hypertrophy; labs + food records | Rank fat substitutions and adequate protein/resistance training with calorie feasibility | Do not make microbiome-based LDL promises |
| 2 | MASLD concern + fat loss + endurance | Review dietary energy/fitness pathways and medically appropriate monitoring, avoid excessive restriction | Do not diagnose fibrosis from wearable weight |
| 3 | Strength + marathon training + limited time | Surface training scheduling conflicts, prioritize recovery and fueling | No single objectively optimal split |
| 4 | GI discomfort + high-fiber intervention | Offer gradual substitution/tolerability plan and symptom monitoring | Severe/red-flag symptoms -> professional assessment |
| 5 | Osteopenia concern + mobility + pain | Discuss reviewed training and appropriate bone-specific evaluation | No impact exercise mandate despite injuries |
| 6 | APOE/genotype only + no lipids | Offer ordinary evidence-based nutrition; discuss testing actionability | No genotype-only custom diet |
| 7 | 16S report and butyrate-producing genus | Treat taxon as composition, not enzyme activity or personal SCFA flux | No numeric SCFA increase prediction |
| 8 | Shotgun genes + AGORA2 simulated flux | Educational simulated potential with solver assumptions | No predicted blood concentration / treatment effect |
| 9 | Initial improvement then missing follow-up + illness | Maintain/flag uncertainty and schedule appropriate remeasurement | No success claim from one biased interval |
|10 | New retraction contradicts archived diet advice | Hold candidate evidence, withdraw impacted approved claim via reviewed release, preserve historic snapshots | No overnight unreviewed auto-update |
Each scenario requires variants for incomplete consent, allergies, medication changes and incompatible units where relevant.

## Joint LEARN-01–06: Measure -> Recommend -> Implement -> Observe -> Evaluate -> Adjust
**Contract:**
- Measure: capture target outcome, comparable baseline, history, goal horizon, quality/confounding, user authorization.
- Recommend: choose approved constrained small set, alternative/maintenance option, rationale and monitoring plan, version pinning.
- Implement: user confirms selected action, intended dose/frequency, feasibility and start date; capture adherence and concurrent changes without penalizing lapses.
- Observe: log actual relevant outcomes and adverse signals; canonical units and specimen/protocol; passive device sources as estimates where appropriate.
- Evaluate: compare with prespecified expected direction, measurement variability, duration, adverse outcomes and competing changes; classify *improved / unchanged / worse / unknown / conflicting*. Never infer causal effect from ordinary trends.
- Adjust: if safety risk, suspend unsafe action and refer appropriately; if inadequate follow-up, maintain or prompt optional measurement; if no change with adequate fidelity, consider an approved alternative; if improving, consider maintain with user preference; if contradictory, defer or specialist review. Material clinical changes require approved evidence/policy and re-eligibility.

**Illustrative timelines, Biology must validate:** daily food/workout and tolerability; weekly adherence and training summaries; weight/BP repeated with protocol over weeks; lipid/liver-marker follow-up at clinically appropriate intervals usually many weeks rather than daily; strength/endurance tests under comparable conditions across training blocks. No universal biochemical retest interval or automated critical threshold.

**Learning controls:** minimum replicates determined per endpoint, false alarm budget, data sparsity guard, participant leakage tests, rollback to old approved advice, avoid data collection without consent, clinician/coach review where jurisdiction/medical-risk demands it. Prespecify observed vs inferred data semantics and safety escalations. Individual experiments only for appropriate reversible low-risk behavior changes, not medication, dangerous training or investigation of potentially severe medical symptoms.

**Decision table**:
- Improving, good adherence, no harms -> explain observation and maintain if suitable; no causal claim.
- Unchanged with adequate protocol/follow-up -> review adherence and competing factors; choose approved substitution or professional input.
- Worsening/adverse signal -> safety check, potentially discontinue and escalate; no unilateral medical management.
- Missing/incompatible measurements -> no effectiveness judgment; explain data need and keep safe baseline.
- Contradictory outcomes (e.g. better strength, worse recovery) -> surface goal tradeoff, contextualize and choose with user/professional.
- Evidence updated/retracted -> reviewed impact mapping, explicit explanation and versioned change; preserve previous plan snapshots.

## INFO-01–04 (P1) Value of biological information
**Question:** Will a new result plausibly *change the next safe action*, enough to justify financial, time, false-positive, privacy and treatment consequences? Measure expected decision value, not information quantity.
**Classes:** Food record/clinically appropriate lipid/BP/functional measures commonly actionable for specific goals. Consumer wearables provide repeated context but have artifacts. Genetic testing has locus/indication-specific use (some medically actionable; most wellness SNP scores not diet-prescriptive). 16S mostly taxonomy; shotgun adds functional *potential*, not expression; metatranscriptomics adds RNA-level activity proxies, metaproteomics expressed proteins, metabolomics measured sample-specific molecules; all have assay and ecological context; not substitutes for direct physiological outcomes.
**Decision rule:** Only recommend collecting additional test if (1) a specific pending decision could change; (2) result quality/applicability sufficient; (3) credible alternate actions exist; (4) expected incremental outcome decision benefit likely exceeds cost/burden/privacy/false positives; (5) clinically appropriate access/referral; (6) consent. Otherwise say 'This test is unlikely to change our current recommendation.'
**Counterexamples:** asymptomatic exerciser with sufficient protein and good performance need not buy stool metagenomics; LDL issue warrants lipid/ApoB context rather than a microbiome test; variants without validated diet-response effect should not change meal ranking. Do not equate vendor test availability with health benefit.

## Dependencies, cost and architecture gates
- **Biology:** BIO-OPT-01–05 evidence-graded intervention/effect/safety library and per-goal measurement ranges; sign off intervention claims, interpretation, clinical escalation.
- **Integrations:** provenance-aware food, workout, lab and omics contracts; licence/source evaluations; *real* available APIs vs vendor-gated.
- **Security/Legal:** consent and protected categories, health/medical intended use, evidence/licence supply chain, prompt minimization.
- **UX/Testing:** daily unified plan, visible confidence distinctions, no data pressure, tradeoff explanations; test all ten scenarios.
- **Architect:** deduplicate with BIO-26-301–318, BIO-COACH-401–417, ML-26-201–206, ML-COACH-201–206 and original v0.5 backlog; approve trust gates and contracts.
- **Developer/Codex:** alone owns product changes. Any proposal here is not software authorization.
- **Feasibility:** deterministic rules and schema/provenance (medium engineering, low incremental compute); external evidence data curation (high ongoing expert cost); independent omics cohort access (contract/institution limits), metabolic solver/modelling (high research complexity); prospective health-outcome studies (high cost/time), no blanket efficacy claims.
- **Version/status:** Reviewed public research sources but did not reproduce original datasets, run model benchmarks, inspect latest repository runtime, or conduct participant trials. No claim that v0.6 exists.

## References, null/limitations and review date
- ZOE METHOD RCT (2024), doi:10.1038/s41591-024-02951-6: mixed outcomes, no significant LDL-primary improvement, components inseparable.
- Quinn-Bohmann et al. *Nat Microbiol* (2024), doi:10.1038/s41564-024-01728-4: promising SCFA mechanistic predictions but human concentrations/clinical efficacy not established by simulated flux.
- *Nature Communications* perspective (July 2026), doi:10.1038/s41467-026-75004-w: ML validation, causal and data-quality limitations.
- NIH Nutrition for Precision Health: https://commonfund.nih.gov/nutritionforprecisionhealth ; research underway.
- NIH All of Us: https://www.nih.gov/allofus ; restricted Researcher Workbench for some data; access ≠ commercial rights.
- Supporting Biology handoffs: Bloom_Biology_Comprehensive_Research_Handoff_2026-10-23.md (v1.1), Bloom_Biology_Coach_Performance_Handoff_2026-10-23.md (v1.1).
**Reviewed 2026-10-23.** All specific clinical intervention content awaits Biology approval and independent evidence assessment.
