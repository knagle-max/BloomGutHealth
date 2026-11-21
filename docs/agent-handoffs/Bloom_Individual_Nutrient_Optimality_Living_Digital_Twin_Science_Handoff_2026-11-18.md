# BLOOM — Individual Nutrient Optimality & Living Biological Digital Twin
## Science & Biology strategic architecture / implementation handoff

**Date:** 2026-11-18  
**To:** Chief Architect & Integration Lead; Codex; AI/ML; Integrations & Data; Security & Privacy; Legal & Regulatory; UX/User Testing  
**From:** Nutrition & Biology Specialist  
**Disposition:** **APPROVE AS STRATEGIC SCIENTIFIC NORTH STAR, WITH STAGED IMPLEMENTATION AND STRICT CLAIM ELIGIBILITY.** This is NOT evidence that exact individual nutrient optima can presently be computed, and NOT authority for public medical prescriptions or unconsented pooled model training.  
**Owner direction preserved (18 November 2026):** "Right now society struggles in that we don’t really know how much of a nutrient we need and are we over or under receiving it. A biological system would have optimal amounts and it’s my belief that we should be able to gain enough information about every individual to know and be able to ensure they are receiving their optimal amount. That’s the goal for this app. Is there anything missing? How can I make that happen. It should be as easy as possible to use." Follow-up: "In time I believe we should have enough knowledge to exactly determine an ideal for everyone. Research will eventually catch up. We are all just a programmed machine of DNA (ACTG in place of 0s an 1s) and symbiotic relationships with the bacteria, mitochondria, viruses etc that live within and on us. Eventually we should be able to deconstruct exactly how all of that interacts along with what we ingest and are exposed to."

## 1. Controlling product ambition

Bloom must progress beyond a fixed RDA dashboard toward a **living, individually calibrated, source-grounded model of nutritional adequacy, tolerability, benefit and excess** in the context of each person's changing biology, environment, life stage, goals and competing health outcomes. The long-term vision is a multiscale **human–microbiome–environment digital twin** enabling increasingly personalized, evidence-validated guidance. This is a research horizon, not a current guarantee of an exact universal optimum. No marketing copy promises complete physiological observability or an infallible dose.

A more precise definition: for nutrient/intervention `n`, person `p`, time/state `t`, and prioritized outcomes `G`, Bloom aims to estimate an **evidence-supported feasible intake/exposure region** `R(n,p,t,G)` subject to safety, nutritional adequacy, consent, feasibility and protected goals. A single point optimum can be exposed only when the actual human evidence and validated model support one. Where no defensible individual numeric estimate exists, return an adequate interval, appropriate population guidance, or **unknown / discuss with a professional**, never an invented personal precision number.

Physiology is not merely a fixed DNA program. Host sequence, epigenetic and transcriptional regulation, cell state, organ function, developmental history, mitochondrial heteroplasmy/function, microbial community dynamics, virome, immune response, environment, stress, treatments, and stochastic biological variation matter. Genome + stool taxonomy cannot identify all internal rates, tissue concentrations, requirements, or causal responses. Model parameters may be structurally or practically **unidentifiable** without suitable measurements. The system must represent this limitation explicitly and improve as assay quality and research permit.

## 2. Scientific model: eight separately estimable quantities per nutrient

The canonical record must distinguish, NOT collapse:

1. **Recorded amount** — foods/supplements actually consumed; planned versus confirmed; serving/chemical form, timing and adherence; incomplete logging coverage.
2. **Usual exposure** — distribution of intake over representative days; within-person variance, food composition uncertainty, processing, supplement corrections, and absorption-related modifiers.
3. **Bioavailability and delivery** — chemical form, digestion, absorption, food matrix, timing, intestinal transit, transport and compartment delivery. Direct intake ≠ tissue availability.
4. **Likely requirement** — age/life-stage population distribution and evidence-supported personalized modifiers; where uncertain, report a range / likelihood rather than a fabricated exact requirement.
5. **Biological status** — appropriately selected biomarkers, clinical signs, relevant function and validated interpretation with method, timing, kidney/liver function, confounding and longitudinal data.
6. **Potential excess / harm** — tolerable upper limits when applicable (not a universal safety threshold), medication/supplement interactions, toxicity, accumulation and sensitive populations.
7. **Goal-dependent outcome response** — stronger evidence for muscle, bone, cardiovascular function, metabolism, pregnancy, digestive tolerance, healthy aging, etc.; distinguish surrogate biomarker and patient-important outcomes.
8. **Confidence and missingness** — input provenance, model validation, applicability, causal status, missing data and uncertainty. An estimated numeric optimum requires considerably more evidence than a dietary adequacy screen.

**Three independent questions to always answer before action:** (i) likely under/adequate/excessive *intake*? (ii) evidence of deficient/adequate/excessive *status*? (iii) does changing intake improve a personally relevant outcome, with acceptable risk? These answers can disagree.

## 3. Nutrient-specific modeling classes (do NOT apply one template to all)

- **Energy** — observed weight/body-composition/function and activity over time, illness and adaptive expenditure; not a static calculator output. Weight stability is imperfect evidence of energy balance.
- **Protein / essential amino acids** — amount and distribution, energy balance, lean mass, training, aging, tolerability and relevant renal/clinical restrictions; separate adequacy from performance targets and longevity hypotheses. Avoid universal optimization at the expense of other goals.
- **Fiber / fermentable substrates** — diverse substrate classes, dose, food matrix, tolerance, GI symptoms, microbiome functional capacity, SCFA research and variable transit; fecal taxonomy does not prove SCFA flux.
- **Iron** — menstrual loss, pregnancy, diet form, stores, inflammation, relevant laboratory status, relevant medical history; iron requirement distributions may be skewed; ferritin alone cannot solve all contextual interpretation. No routine iron prescribing based only on intake scores.
- **Vitamin B12** — dietary/fortification intake and treatment context, absorption affecting disorders or medication use, serum B12 and appropriate confirmatory tests when clinically indicated; serum B12 is not identical to intracellular function.
- **Vitamin D / calcium** — intake, sunlight/exposure context, renal context, 25(OH)D status when clinically appropriate, bone outcomes; avoid automatic testing, high-dose supplementation or equating consumer-scale bone mass with DXA.
- **Iodine / folate / choline and pregnancy-related nutrients** — stage-specific rules and exclusions, especially pregnancy or pregnancy possibility where authorized and relevant; no age/sex-only assumptions.
- **Sodium/potassium/magnesium** — food and supplement forms, BP, medication context, kidney function and appropriate safety limits; no blanket potassium supplementation advice.
- **Omega-3 and fatty acids** — dietary composition, lipid outcomes and formulation/source; optional no-seafood alternatives for users with this preference.
- **Micronutrient coverage** — per-nutrient source completeness, detection/unknown status and species-specific form conversions; no claim '100% optimal' based on partial nutrition databases.

Every nutrient must have a **profile** with state variables, required contexts, validated population references, evidence-backed personal modifiers, candidate outcome biomarkers, excess boundaries, special populations, approved action families, coverage status and evidence version. Missing profiles cannot be guessed by an LLM.

## 4. Architecture reuse — no parallel optimizer

Integrate into existing `shared/nutrition-summary.ts`, `shared/meal-intelligence.ts`, `shared/precision-nutrition.ts`, `shared/wellness-context.ts`, `server/wellness-context.ts`, existing canonical nutrition/food provenance, verified lab history, medication/supplement regimen/exposure, evidence graph, `shared/wellness-actions.ts`, goal-to-action priorities and Response Intelligence. Route scientific mechanisms through existing Explorer; do not create a second data ledger, reaction graph, science crawler, consent system or recommendation engine. Existing code inspected on `enhance/bloom-experience` November 18 2026 is **implementation evidence, not specialist acceptance**.

Suggested additive typed evaluation result (map to existing contracts; not a mandate for a new database):

```ts
type NutrientPersonalAssessment = {
  nutrientId: string; accountId: string; evaluatedAt: string;
  referenceVersion: string; evidenceVersion: string; sourceRevisionIds: string[];
  intake: { usualAmount?: number; unit?: string; plausibleRange?: [number,number]; completeness: 'adequate'|'partial'|'unknown'; actualVsPlanned: 'confirmed'|'mixed'|'unknown' };
  populationReference: { type: 'EAR'|'RDA'|'AI'|'UL'|'AMDR'|'CDRR'|'clinical'|'unavailable'; value?: number; unit?: string; eligibility: string; sourceIds: string[] }[];
  status: { biomarkerIds: string[]; interpretation: 'status-supported'|'limited'|'not-assessed'; limitations: string[] };
  requirements: { type: 'population-reference'|'qualified-personal-range'|'validated-personal-estimate'|'unknown'; range?: [number,number]; unit?: string; uncertaintyDescription: string; modelValidationId?: string };
  safety: { contraindicationsChecked: string[]; importantUnknowns: string[]; excessRisk: 'known'|'possible'|'unknown'; hardVeto: boolean };
  outcomes: { goalIds: string[]; protectedGoalIds: string[]; applicableEvidenceIds: string[]; predictedPersonalBenefit?: null };
  decision: { category: 'food-first-option'|'general-reference'|'discuss-with-clinician'|'no-change'|'abstain'; approvedActionId?: string; rationale: string };
  provenance: { assayCompatibility: string; method?: string; revisedAt?: string; purposeScope: string };
}
```

No fields should imply direct measurement when only inferred. Missing is not zero, a scheduled supplement is not taken, a genotype is not an enzyme-activity measurement, a microbiome abundance is not metabolite production, and a lab result is not a proof of dietary causation.

## 5. Life-stage and condition-aware applicability

Context is **dated and purpose-limited**. Age/sex recorded in a profile cannot independently determine anatomical screening eligibility, current reproductive status, iron losses, hormonal context or supplement safety. Relevant inputs include stage of life, pregnancy/lactation (if volunteered), menstruation, surgical history, medications, BMI/lean mass, training, chronic medical context, dietary restrictions, kidney/liver function where available, and geographic references. Use only authorized information necessary for the specific decision. Unknown or conflicting data produce a low-risk alternative or abstention. Sources and algorithms should be jurisdiction-aware and versioned.

## 6. Low-friction consumer UX — no mandatory biological questionnaire

A person opens Bloom and sees **one primary meaningful opportunity**, not 40 colored nutrient gauges. Examples of *permitted evidence-qualified copy*:

- "Your logged meals suggest your fiber intake may be below typical recommendations. Some foods are missing nutrient data. Here is a familiar fiber-containing option that fits your preferences."
- "Your protein pattern looks generally aligned with the training goal you chose, based on the meals recorded. Unlogged food may change this."
- "This supplement label lacks verified elemental magnesium information; it isn't included in your total yet. Review the label?"
- "This result is a trend in your measurements, not proof that your recent diet caused it."

Everyday: default easy, food-first practical suggestion, optional concise explanation, one-tap corrections. Athlete: deeper protein/energy/fueling distribution and recovery goal protection. Biology: status/lab/context and what evidence says. Explore: pathways and detailed molecular mechanisms. Progress: observed history and how guidance changes. Profile: optional reusable context. 

Ingestion priority: (1) existing recorded information, (2) source-backed import / label scan when separately consented, (3) validated conversion, (4) conservative personal defaults explicitly labeled, (5) at most one decision-changing question, (6) unknown. Never force repeat logs, fasting or routine tests merely to improve app confidence. Do not require wearables, microbiome tests, genetic tests, or expensive panels for ordinary usefulness.

Example interface when a user asks "Am I getting enough?": **Likely adequate / May be low / May be high / Not enough information** with a short why, source coverage and practical optional choice. Avoid fake 92%-optimal badges or claiming all nutrients are balanced.

## 7. Mechanistic digital-twin research roadmap

**Tier 0 — validated population reference + user context:** DRIs, special populations, safe food composition and evidence-based choices.

**Tier 1 — measured personal exposure:** representative habitual diet (when possible), ingredient/recipe amounts, formulations, preparation, medication/supplement actual administrations, symptoms, sleep, training, body trends; confidence and completeness.

**Tier 2 — biochemical/phenotypic calibration:** eligible routine markers, methods, physiologic conditions, functional outcomes and temporal history. Determine whether a biomarker reflects status, disease, regulation, intake or some mixture. Model lab noise and analytic uncertainty.

**Tier 3 — validated mechanistic pathways:** host genes/transcripts/proteins/enzymes, mitochondria, microbiome/virome, digestion, transport, compartmentalization, cofactor availability, kinetics, host metabolism, signaling and excretion. Use Rhea/ChEBI/UniProt/NCBI and other licensed/verified sources. Separate *potential* from *activity*, tissue concentration and health outcome. Do not fill unknowns with inferred positive flux.

**Tier 4 — individualized predictive models:** fit parameters only where identifiable, train and validate in diverse external populations; hold out individuals, institutions, assays and time periods; compare against simple baseline and existing guidelines. Calibrate intervals and subgroup harm; prospective evaluation before personal effect claims.

**Tier 5 — dynamically updated biological digital twin:** only where calibrated outputs, data quality, clinical validity, real-world utility and privacy protections justify it. Continually revise model with new observations, scientific evidence and life-stage changes; abstain otherwise. True whole-person exact computation remains a hypothetical end state, not a committed product claim.

A rich molecular model is not more useful if its outputs do not improve decisions. Incremental predictive benefit, clinical relevance and safety matter more than biological graph size.

## 8. Learning and privacy

**Account-private learning:** permitted within existing authorizations; improve personal defaults, history, preferences and carefully qualified longitudinal interpretation. User acceptance or correction is not a measured biological effect. Source deletion/revocation invalidates dependent estimates, feedback, caches and outputs.

**Cross-user learning:** not yet authorized for real personal data under existing Architect `PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md`. Design opt-in contribution with separate purpose, explicit meaningful consent, pseudonymization and minimization, strong isolation, retention and withdrawal semantics, testing for membership inference and rare-genotype disclosure, and independent Security/Legal/ethics review. Never upload individual genetics/microbiome/labs/photos to a general model-training pipeline by default.

Data used to learn general requirement distributions must be representative; self-selected users with intense tracking may not represent the general population. Evaluate bias across ages, sex-related physiology, pregnancy status, ancestry, dietary patterns, health conditions and devices without inferring sensitive attributes where unavailable.

## 9. Safety, ethics and governance — non-negotiable

1. Contraindication and hazard checks before ranking; medication/condition/renal/hepatic/pregnancy interaction concerns where material. Unknown critical constraints → abstain or general alternative.
2. Preserve protected outcomes (muscle, energy sufficiency, symptoms, bone, cardiovascular priorities, function, quality of life).
3. Never manipulate people to prove causality: no treatment withdrawal, no deliberate worsening, no medically unnecessary repeated sampling.
4. Learn from normal life; request only a question with meaningful expected decision value.
5. User owns the choices; no autonomous prescribing, test ordering, supplement dosing or changes to clinician treatment.
6. Flag serious clinically significant findings under reviewed safety and professional-care policies; no autonomous diagnosis.
7. Evaluate the objective as **adequacy + meaningful benefit − harm and burden**, not maximum biomarker or compound levels.
8. AI-generated explanations cannot promote unreviewed claims or bypass deterministic server-side eligibility.
9. Scientific claim and model validity, source licenses, marketing and jurisdiction must be independently reviewed before affected public uses.

## 10. Codex execution slices — integrate, do not detour current Core

**NI-01 (Core):** Audit each existing nutrient total for coverage and unknown-vs-zero semantics; add source/actual/estimated/serving quality receipts. Reuse approved Food workflows. Exit: food and supplement totals correct under unknown and duplication fixtures.

**NI-02 (Core):** Add typed reference applicability (EAR/RDA/AI/UL/AMDR/CDRR and source/version) and avoid single '% optimal' semantics. Exit: stage-aware references and no fabricated personal precision.

**NI-03 (Core):** Implement account-private `NutrientPersonalAssessment` projection using existing wellness-context/food/lab/regimen sources and invalidation. Exit: correct time-context, privacy and source updates.

**NI-04 (Core):** Attach hard contraindication, unknown-context, competing-goal and evidence/claim gates to nutrient candidate choices using existing action registry, not new intervention engine. Exit: every proposed action has valid action ID + veto audit.

**NI-05 (Core):** One low-friction nutritional opportunity and editable food-first next action on Today/Food; optional deeper details in Biology/Explore. Exit: real app flow on 320px / desktop, user can decline, correct and see uncertainty.

**NI-06 (Advanced):** Curate per-nutrient status biomarkers and uncertainty factors (iron, B12, vitamin D, protein, fiber, sodium/potassium, calcium etc.). Exit: reviewed human evidence and applicability, no automated diagnosis.

**NI-07 (v0.7+):** Source-backed requirement modifier registry (pregnancy, activity, clinical context, medication interactions) with benefit-harm outcomes and rights. Exit: cross-population test fixtures, stale evidence invalidation.

**NI-08 (Advanced research):** Build modular physiologic compartment models in existing biological reaction graph and Python research stack. Exit: mass balance, known parameter provenance, null/negative control, no model-to-action shortcut.

**NI-09 (Research):** Holdout external validation, calibration and utility evaluation for personalized estimates. Exit: prospective proof of meaningful added benefit over basic guidelines before release of numeric personal optima.

**NI-10 (Future governance):** Opt-in and validated cross-user learning, following existing independent approval and threat model; user-private learning works without it.

All items must be reconciled to `NEXT_ACTIONS.md`, `docs/operations/V06_DEPENDENCY_BACKLOG.md`, v0.6 C0/C1/C2 and current owner build-first/one integrated RC policy. Do not create new main roadmap or interrupt unfinished Food #12 / report-wide Response #15 for speculative digital-twin research. Codex may proceed with approved isolated engineering and synthetic research; public personal inference remains separately gated.

## 11. Mandatory acceptance tests (new NI-T01–NI-T26)

- **T01** Age/life-stage-specific reference uses valid source and timeframe; absent status never guessed from a profile sex value.
- **T02** Two days of diet logs do not produce an 'exact daily requirement'.
- **T03** Missing vitamin K in a branded source is unknown, not 0 µg and not 'deficient'.
- **T04** Duplicate multivitamin and imported supplement do not double count.
- **T05** Scheduled dose without administration evidence contributes no confirmed consumption.
- **T06** 'Magnesium citrate 500 mg' is not counted as 500 mg elemental magnesium absent appropriate verified composition.
- **T07** Valid nutrient form/unit conversion handles folate DFE and relevant forms without assuming interchangeability.
- **T08** Intake adequate by a reference but functional biomarker abnormal: distinguish intake from biological status and clinical differential; no automated treatment.
- **T09** Intake below RDA without EAR or sufficiently representative recording: qualified risk, not confirmed deficiency.
- **T10** Intake above UL: relevant hazard/context disclosure, not blanket toxicity diagnosis; avoid unreviewed dosing change.
- **T11** High protein/muscle goal and LDL goal coexist; food choices satisfy both or abstain.
- **T12** GI tolerance worsens on higher-fiber food; do not continue escalating solely for substrate/SCFA enthusiasm.
- **T13** Serum B12 and MMA context differ: only clinically appropriate source-reviewed interpretation, no single-score diagnosis.
- **T14** Pregnancy/lactation unknown: no inference and no unsafe blanket individualized target.
- **T15** Menstruating vs nonmenstruating iron-context time transition adjusts future guidance, not past lab interpretation retroactively.
- **T16** Kidney disease or relevant medication unknown blocks high-risk potassium/supplement recommendation.
- **T17** Genotype alone cannot produce a deterministic individualized micronutrient optimum.
- **T18** Stool taxon percent alone cannot produce personal enzyme activity, substrate delivery or SCFA flux.
- **T19** Validated lab change plus dietary change does not prove causal credit; note co-exposures and uncertainty.
- **T20** Sparse data produces useful population-based food suggestion or abstention without fake precision.
- **T21** A user can complete typical meal recording without visiting any biology dashboard or entering a medical history.
- **T22** An updated ingredient, changed dose, deleted lab source or consent revocation invalidates dependent estimates and cached outputs.
- **T23** Two accounts cannot access each other's personal requirement estimates or inferred conditions.
- **T24** External model failure preserves deterministic Food, nutrition totals and source-faithful Bloodwork.
- **T25** Quantitative personalized estimate is withheld unless method, validation cohort, calibrated uncertainty and biological applicability are documented.
- **T26** An advanced algorithm that adds no externally validated utility over a simple baseline does not gain release eligibility.

**Evaluation KPIs:** food-entry completion time, correction burden, nutrient-source coverage, adequacy classification calibration, false-under/over-risk warnings, adverse safety violations (zero tolerance), abstention appropriateness, user comprehension and net benefit, bias across relevant groups, incremental effectiveness vs general guidance and latency/cost. Never use user click-through as evidence of biological benefit.

## 12. Source dossier and scientific support (read/review before clinical claim publication)

1. National Academies, *Dietary Reference Intakes: Applications in Dietary Assessment* (2000), https://www.nationalacademies.org/read/9956/chapter/19 — population EAR/RDA and uncertainty of individual usual requirements.
2. National Academies, *Overview of the DRI Process* (2023), https://www.ncbi.nlm.nih.gov/sites/books/NBK591037/ — reference distributions and applicability.
3. National Academies, *Guiding Principles for Developing Dietary Reference Intakes Based on Chronic Disease* (2017), https://www.ncbi.nlm.nih.gov/books/NBK465016/ — chronic-disease endpoints cannot simply be equated to preventing deficiency.
4. NIH ODS, *Vitamin B12, Health Professional Fact Sheet*, https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/ — biomarker and absorption/medication context.
5. Brennan et al., *Key evidence for personalised nutrition: a review of randomised controlled trials* (2026), https://pubmed.ncbi.nlm.nih.gov/41493072/ — personalized intervention trial heterogeneity.
6. *Precision Nutrition at a Crossroads: From Biological Prediction to Contextual Implementation* (2026), https://advances.nutrition.org/article/S2161-8313%2826%2900178-X/fulltext — advanced prediction does not always add demonstrable value over practical personalization.
7. Lutsker et al., *Optimizing metabolic health through deep-phenotyping-based personalized nutrition* (2026), https://www.nature.com/articles/s41574-026-01308-y — multivariate biological and behavior/context-aware nutrition research.
8. Bloom existing source materials: `shared/nutrition-summary.ts`, `shared/meal-intelligence.ts`, `shared/precision-nutrition.ts`, `shared/wellness-context.ts`, `shared/wellness-actions.ts`, `docs/architecture/V06_CORE_ADVANCED_EXECUTION_CLASSIFICATION_20261114.md`, `docs/architecture/ADAPTIVE_HEALTH_GUIDANCE_ARCHITECT_RECONCILIATION_20261114.md`, `docs/architecture/PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md`, and previously published Science & Biology Response/Exposure/Explorer handoffs.

Source URLs identify material for scientific validation, not blanket approval of all possible derived claims or redistributive data rights. Current access to NIH/National Academies descriptions is sufficient for scientific rationale; Codex and reviewers still must source-verify each activated rule and intervention.

## 13. Cross-agent responsibilities and disposition

- **Chief Architect:** reconcile with canonical v0.6 Core/Advanced lanes, existing source graph and release classification; avoid duplicate systems; assign missing bounded slices.
- **Codex:** implement typed projection, risk/coverage and safety gates, low-friction experience, tests and verified deployment receipts; no autonomous medical decisions.
- **Biology:** nutrient-specific evidence and source/assay interpretation approval, safe nonnumeric fallbacks, adverse-condition tests.
- **ML:** uncertainty, identifiability, external calibration, out-of-distribution detection, modeling and holdout evaluation.
- **Integrations:** food and label identity, elemental forms, source revisions and interoperability.
- **Security/Legal:** sensitive data purpose/consent, processing, rights, clinical intended-use and population-learning rules.
- **UX/User Testing:** low logging friction, comprehensible coverage and status, accessible real devices and safe personal preference controls.

**Final scientific decision:** Architectural research direction supported. **General wellness population-evidence guidance may move through existing approvals; validated individualized estimates only through independent tiered scientific/technical/privacy/legal release gates.** A biologically complete exact simulator is a research objective, not a presently established capability.