# Bloom — Individual Nutrient Optimality & Living Biological Digital Twin

**Date:** November 18, 2026 · **Architect disposition:** APPROVE **staged, source-calibrated nutrient intelligence** as a near-term product capability and **biological digital twin** as a long-term, evidence-gated research horizon. **No current individual exact optimum, complete physiology simulator, clinical prescribing authority or shared private-data training is approved.**

**Exact specialist source:** [Individual Nutrient Optimality & Living Biological Digital Twin — full Biology handoff](../agent-handoffs/Bloom_Individual_Nutrient_Optimality_Living_Digital_Twin_Science_Handoff_2026-11-18.md), including original owner aspiration, scientific tiers, `NI-01–10` and `NI-T01–T26`. This decision reconciles with [Genuine Biological Intelligence/Consumer Value](BLOOM_GENUINE_BIOLOGICAL_INTELLIGENCE_CONSUMER_VALUE_DIRECTIVE_20261118.md), [Persistent Scientific Learning & LLM](BLOOM_PERSISTENT_SCIENTIFIC_LEARNING_LLM_INTEGRATION_ARCHITECT_DECISION_20261118.md), [Privacy and Longitudinal Learning](PRIVACY_PRESERVING_LONGITUDINAL_AND_POPULATION_LEARNING_DECISION_20261114.md), and the current `AGENTS.md` + `NEXT_ACTIONS.md` sole execution queue. Codex sole implementer.

## 1. Owner objective translated into testable product value

Long-term: understand what amounts and forms of nutrients, diet and environmental exposures are best suited to one individual's biology **over time**, across host genes, microbial interactions, life stage, metabolic status, medical context, goals and competing outcomes. **Do not promise an exact genetically programmed dose**: physiologic regulation, epigenetics, microbiome dynamics, environmental exposures and measurement noise mean the underlying parameters may not be identifiable even from available DNA, stool and ordinary bloodwork.

**Near-term useful product:** Given actual eligible foods, confirmed taken supplements, longitudinal status/biomarkers, life-stage/goal context and applicable independent evidence, provide the **most meaningful supported interpretation** of a nutrient: known intake exposure, likely adequacy/excess *relative to an applicable reference*, status evidence, meaningful risk/conflict and a safe practical next step if warranted. It is not a decorative percent-of-optimal dashboard or a raw math restatement.

**Scientific outcome is multiobjective, not maximum dosage:** nutritional adequacy + validated health benefit and function − risks/excess − burden/feasibility, respecting protected muscle, bone, cardiovascular, digestive, safety, pregnancy, medication and personal goal contexts. No guaranteed global “ideal” or treatment based only on one source/variant.

## 2. Eight distinct nutrient quantities and three questions

**Do not collapse** these eight into a single number, source or “optimality score”:

1. **Recorded consumption**: what was actually consumed, when, in which food/supplement form/amount and source; plans/product scans/schedules are not confirmed exposure.
2. **Usual exposure**: distribution across representative days and within-person variation; missing food/micronutrient rows remain unknown, incomplete logged days are not typical intake by default.
3. **Absorption and delivery**: biological availability, chemical form, timing, food matrix, medications, digestion and compartments. Intake is not tissue delivery or absorbed amount.
4. **Requirement**: population EAR/RDA/AI/AMDR/CDRR and scientifically verified stage-specific or medical modifiers; usually ranges/distributions, not measured per-person exact requirements.
5. **Biological status**: suitable biomarker, symptom, physiology and functional measurements with assay/source context. A blood concentration does not universally prove a nutrient deficiency or tissue activity.
6. **Excess/harm**: eligible UL and other toxicity/interaction rules, with exposure route, duration, compound/elemental basis, kidney/liver context and relevant conditions.
7. **Goal-relevant outcome effect**: independently reviewed human evidence for changes in muscle, bone, cardiometabolic health, digestive tolerance and other outcomes. Evidence of adequate intake is not evidence that *more* improves health.
8. **Confidence/unknowns**: what sources, unit conversions, assay methods and decision-relevant clinical facts are missing, model validation, individual applicability and uncertainty.

Before any consequential next step, separately evaluate: **(A) probable intake adequacy/excess? (B) evidence of status deficiency/adequacy/excess? (C) does changing intake likely improve an important outcome with acceptable harm?** These can disagree. Do not infer (B) or (C) from (A).

## 3. Verified existing implementation and additive integration

Read-only branch inspection Nov 18, 2026. Codex must confirm HEAD/receipt before implementation. The active `NEXT_ACTIONS.md` is **V06-M2 reference eligibility** following qualified M3 source/confirmed supplement work, with tested B6 overlap and glycemic source discrepancy. Do not redo qualified work.

| Existing contract | Current use | Codex delta |
|---|---|---|
| `shared/nutrition-summary.ts`, `shared/meal-intelligence.ts` | Meal nutrient values, coverage and meal intelligence from recorded source | Source-known per-nutrient and per-day coverage, actual/unknown/unlogged distinct, usual-diet eligibility by representative dates |
| `shared/precision-nutrition.ts` | Lab/genetics/profile interpretation and original biology source graph | Use only assay-/date-qualified nutrient status observations, not universal functional conclusions or static SNP-based intake targets |
| Current confirmed supplement/taken receipts and nutrient source snapshots | Source identity, actual taken record and overlap; M2 B6/current eligibility progressed | **Extend**, don't duplicate; distinct element vs compound, supplement form, actual servings, overlap dedupe, source-revision invalidation |
| `shared/wellness-context.ts`, `server/wellness-context.ts` | Narrow dated/purpose-limited goal/profile context | Reuse authorized relevant goal, age-at-event, volunteered life stage, conditions, and contraindications; do not build a giant all-person intake form |
| `shared/wellness-actions.ts`, `shared/goal-guidance.ts`, current Response/Today | Existing choice/action/priority and safety controls | Admit only evidence-eligible **meaningful** nutrient opportunities via existing consumer-value selector. No independent nutrient optimizer/recommender |
| `shared/scientific-contracts.ts`, canonical evidence/reference policies | Claim classes/approved source and consumer-value candidate admission | Attach exact source, reference type, action eligibility, missingness and contraindications, not a new science registry |
| `shared/biological-model.ts`, `shared/evidence-network.ts`, Python model service | Mechanistic/reference graph and bounded research computing | Future compartment modeling only within existing reviewed source/reaction/ML infrastructure; no personal flux from taxon alone |

**Existing code does NOT establish independently validated nutrient-specific optimum estimates, disease diagnoses, prospective multiobjective prediction or a living whole-person simulation.**

## 4. Required near-term NutrientPersonalAssessment projection

Use source-qualified existing inputs to construct a **typed account-private per-nutrient assessment**, with a stable contract for all relevant modules (see exact illustrative `NutrientPersonalAssessment` in the source handoff; Codex may map into existing canonical types):

- Nutrient identity, form, canonical units/source values and as-of period, owner/purpose.
- Actual confirmed consumption, source-known subtotal, coverage and representative usual-intake eligibility; unknowns cannot be zero, scheduled never counted as taken.
- Correct applicable **EAR/RDA/AI/UL/AMDR/CDRR**, stage/sex/anatomy/condition where legitimately relevant and evidence source/version/territory; **RDA is not an individual's ideal**, AI isn't an EAR and UL isn't a universal toxicity diagnosis.
- Independently qualified status measures (iron/ferritin and inflammatory context, serum B12 with appropriate other evidence, 25(OH)D, etc.) preserving assay/context and uncertainty; don't infer status when no biomarker exists.
- Verified dose/compound-to-element basis and transformations, e.g. magnesium citrate label mass is **not automatically elemental magnesium**; folate DFE, B12, fatty acid preparations or bromelain activity require source-specific conversion.
- Safety: excessive confirmed supplemental overlap, relevant renal/medication and pregnancy/medical contraindication when known, never assume missing safety facts are negative.
- Goals/tradeoffs: muscle vs lipid, fiber vs gut tolerance, iron vs underlying physiology, etc., with **hard safety veto** before ranking.
- Source refs/revisions, analysis/rule/evidence versions, reason for uncertainty and abstention, optional **approved** action ID. No unsupported model-estimated absorbed nutrient amount or individual dose target.

**Presentation:** A person should understand one meaningful supported opportunity in ordinary language on relevant Food/Today/Response surfaces, with one practical choice when appropriate. Deep Biology/Explore detail on demand. No 40-gauge nutrient dashboard, fake “83% optimal”, compulsory questionnaire or repeated chart narration. If nutrition coverage is sparse, give useful ordinary food-first guidance where safe but don't label it an individual nutrient insufficiency or demand extra logging.

**Example correct output semantics, not prewritten clinical answers:**
- Fully verified supplemental B6 from two **actually taken** products + relevant reference eligible → assess a potential overlap using known-source subtotal and original forms, with correct uncertainty and a low-burden review action. If one supplement was only planned, it is not counted.
- Measured serum B12 relative to applicable source interval plus intake and medication context can support a qualified status discussion; cannot claim absorbed dose, intracellular sufficiency or treatment need from serum alone.
- A few incomplete food days and missing branded vitamin K field → retain unknown coverage, give general food option rather than falsely report deficiency.
- A protein/muscle goal coexists with lipid or kidney caution → select a food option satisfying protected goals or abstain; no blanket low-protein longevity action.

## 5. Nutrient-family evidence tiering and scientific differences

Build/extend **small per-nutrient reviewed profiles**, not a universal genetic optimum rule. Each profile carries sources/review, references, eligible forms, biomarker applicability, high/low consequences, possible intervention pathways, uncertainty, specific risk conditions and approved action families.

| Nutrient family | Meaningful domain-specific context | Critical avoided inference |
|---|---|---|
| Energy | Body-weight/function and activity history, illness/medication and adaptive expenditure | Stable weight does not uniquely measure metabolic expenditure |
| Protein/EAA | Quantity/distribution, exercise/age, energy status, muscle and tolerability, renal caveats | No universal restriction or growth assumption from an observational longevity paper |
| Fiber and substrates | Food type/fermentation/tolerance/symptoms and effective intake | Reported fecal species ≠ personally measured SCFA production |
| Iron | Source form, likely losses, inflammation, ferritin/iron labs and voluntary stage/clinical context | Ferritin by itself is not a precise iron requirement calculator |
| B12 | Dietary form and supplements, medication/absorption, serum B12 and validated confirmatory status where appropriate | A serum level isn't a direct dose-response model or cellular B12 assay |
| D/calcium/bone | Intake, 25(OH)D, calcium, kidney context and actual bone outcomes | Smart-scale bone mass isn't DXA, no auto high-dose D |
| Folate/iodine/choline | Life-stage-specific published evidence and reproductive context with consent | Sex/profile-age alone does not establish pregnancy or intake need |
| Sodium/potassium/magnesium | Confirmed form and units, BP, medications and kidney history | No unapproved potassium or magnesium supplementation based on a single number |
| Fatty acids/omega-3 | Form/source, lipids and personal food preferences | Model-predicted lipid improvement isn't measured clinical benefit |

**Female reproductive feature rule remains separate:** saved Profile `sex === "female"` gates **availability of Bloom's female reproductive tracker** per owner direction. Clinical nutrient/protective population references may require voluntarily confirmed life-stage/anatomy and other relevant factors; do not expose female reproductive tracking when male/unknown, and do not infer pregnancy for nutrient eligibility from sex alone.

## 6. Digital-twin research tiers: approved progression, not current product promise

- **Tier 0:** Reviewed population requirements and source-qualified lifestyle context. This is near-term eligible general guidance.
- **Tier 1:** Authenticated historical food, supplements, actual intake, meds, symptoms, sleep, activity and source coverage; descriptive exposure patterns. No fake complete-day totals.
- **Tier 2:** Method-compatible clinical labs and functional status with context/evidence, bounded correlation/response history, **no unproven personal causation**.
- **Tier 3:** Mechanistic compartment host–microbe/mitochondrial/enzyme models from reviewed reactions, organ/location, stoichiometry and boundary conditions. Reuse existing Python solver/metabolic model research; modeled possible products/flux ≠ person-specific measured concentration.
- **Tier 4:** Individualized outcome predictors trained on real permitted data with independent external holdouts, calibrated intervals, identity/applicability and subgroup harms; simple reference/rule baseline comparison required. No deployment if no demonstrated decision value.
- **Tier 5:** Continuously updating limited digital-twin representation only for **validated measured states and identifiable model parameters**; broader whole-human physiological simulator is a distant aspiration. Version source/evidence and learn only from actual user-confirmed observations and permitted context. Do not claim an exact total biology model.

**Owner interpretation:** The digital twin is a *modular scientific capability horizon*, not an excuse to build expensive multi-organ simulation or show speculative personal molecular diagrams today. Every increment must improve actual decisions or validation/reproducibility. Future models that do not outperform basic guidance on externally tested usefulness should not be promoted.

## 7. Execution sequence and tests

Map source `NI-01–NI-10` into **existing** active v0.6 and Advanced scopes, not another queue:

1. **NI-01/02 current Core/M2:** Confirm existing per-nutrient source totals and missing/zero/form/life-stage reference status, deduped actual supplement intake and source-owned corrections. Current tested B6 work is ancestry, **not** reason to recreate it. Fix gaps as source-scoped enhancements.
2. **NI-03/04 next eligible Core integration:** Versioned private `NutrientPersonalAssessment` projection and existing Response consumer-value/action/gate connection. Begin with **two** high-value families where source coverage exists (e.g. B6 overlap and protein/fiber tradeoff), using current tested M2 facts; then expand to B12, iron and others after validated reference/assay review.
3. **NI-05 scoped UX:** Show only meaningful user-relevant action/monitor opportunity in existing Food/Today; deeper coverage/reference and research in Biology/Explore. Preserve source edit/reload and one-tap repair; no new prominent nutrient-optimality tab.
4. **NI-06/07 Advanced/v0.7:** Review nutrient biomarker links and stage/medication/condition modifiers with evidence IDs, assay, territory and legal/clinical release.
5. **NI-08 Advanced research:** Mechanistic compartment model within existing scientific graph/Python stack with mass balance, conditions, controls, external models/rights and explicit modeled-vs-observed states; independent from user advice.
6. **NI-09/10 future:** Independent prospective personal calibration/digital-twin benefit and separately approved opt-in collective learning with Security/Legal privacy/reidentification and withdrawal semantics. Not current Core work.

**Maintain original tests `NI-T01–NI-T26` in specialist file. Add integrated tests:**
- `NUT-INT-01`: Same user with no actual consumption and two planned vitamin supplements → no actual intake, no overlap alert; with both confirmed taken → source-known subtotal + reference-qualified interpretation only if meaningful.
- `NUT-INT-02`: Child/adult, athlete/nonathlete, menstruating/nonmenstruating (voluntarily sourced) and pregnancy unknown transitions reflect correct *at-event* eligibility; Profile sex does not invent anatomy/menstrual loss/pregnancy.
- `NUT-INT-03`: Serum B12 flagged with missing label/diet and medication context supports bounded discussion without fabricated deficiency, enzyme deficiency or automatic dosing.
- `NUT-INT-04`: User changes brand label/source, corrects meal or revokes purpose permission → affected assessment and candidate insight regenerate; unrelated nutrient sources unchanged, old job cannot republish.
- `NUT-INT-05`: Fiber preference/fermentation hypothesis conflicts with recorded GI symptoms; protect tolerability and current medication/clinical restrictions over a speculative butyrate goal.
- `NUT-INT-06`: “Am I getting enough?” with incomplete food coverage produces honestly limited source-based guidance or ordinary healthy food option, no fake exact percentage/deficiency diagnosis and no repeated compulsory logging.
- `NUT-INT-07`: A model cannot promote numeric personal optimal intake or individualized benefit unless external validation, identifiability, eligible context, source rights, error/calibration and independent release are recorded.
- `NUT-INT-08`: User-facing claims pass `BIO-VALUE-01–16`: meaningful discovery/interpretation/action when warranted, not “B6 exists” or “read this reference”; clinically important harm remains visible, even with source uncertainty.
- `NUT-INT-09`: Two accounts and purpose revocation cannot leak inferred nutrient status or personal target into shared knowledge releases/training/model/prompt corpus; no default collective data processing.
- `NUT-INT-10`: Basic deterministic nutrition, edits and legitimate core functions remain usable during any Python/LLM/external reference outage; no screenshots required.

**Reporting:** `SPECIFIED`, `SOURCE_FACTS_READY`, `ENGINEERING_TESTED`, `CONSUMER_VALUE_TESTED`, `HOSTED_VERIFIED`, `INDEPENDENT_SCIENCE_REVIEWED`, `RIGHTS_ACCEPTED`, `NUMERIC_PERSONAL_PREDICTION_APPROVED` and `CLINICAL_USE_APPROVED` separate.

## 8. Final boundary and success

No alternate ontology/evidence model, duplicate optimizer, personal biological graph, whole-person inference vendor, mass clinical questionnaires, private pooled learning, medical dose advice, false optimum, or broad UI redesign.

**Success now:** Bloom intelligently reconciles confirmed intake, validated human references, source-qualified biomarkers, real-life goals and important risk context into a concise, genuinely helpful and correct conclusion—with automatic source revision, minimum user effort and safe abstention. **Success later:** method-validated, externally calibrated physiological and personal-response predictions that materially improve important user outcomes beyond simpler rules. One is not evidence that the other has already been built.
