# Bloom — Genuine Biological Intelligence Over Descriptive Restatements

**Owner directive:** November 18, 2026 · **Chief Architect decision:** BINDING for new/promoted intelligence and materially revised Bloodwork, micronutrient, supplement, Food, Biology, Today and Response features.  
**Execution:** Codex remains sole implementer on `enhance/bloom-experience`; `AGENTS.md` governs how, `NEXT_ACTIONS.md` governs active task selection. No second insight engine, separate scientific graph, redundant recommendation service or UI redesign. Reuse existing v0.6 M2/M3 source, micronutrient and Response work and scientific evidence/permission systems.  
**Status:** SPECIFICATION / INTEGRATION CONTRACT. No claim of feature implementation or clinical validation.

## 1. Product outcome and priority rule

The primary user-facing value of Bloom is **scientifically defensible investigation of the user's actual situation**, not rephrasing numerical changes, reading reference labels aloud or emitting generic disclaimers. Every candidate featured insight must answer:

1. **Discovery:** What meaningful non-obvious discrepancy, pattern, tradeoff, opportunity or risk was actually identified?
2. **Interpretation:** Why does that finding matter with this user's recorded history, goals and relevant scientifically established context?
3. **Next step:** Is there a concrete safe proportional action or monitoring/discussion step supported by the available evidence? Not every observation demands action.
4. **Evidence:** Which original authorized source observations, study/evidence versions, qualified norms and methods support each material statement?
5. **Limits:** Which unknowns or confounders materially affect the answer? Can a useful narrower conclusion still be given?

**Admission decision:** If a candidate is only “HbA1c increased” or “Vitamin B6 is in your supplements,” do **not** promote it as an insight; preserve the numerical observation in its source/trend/detail view. Generic caveats do not make an otherwise low-value statement worth featuring. Material abnormal/safety findings are an exception: show necessary safety information even when the data cannot support a detailed interpretation; do not hide a true high-priority risk to minimize cards.

**Scientific caution is a gate and a qualifier, not the entire conclusion.** Missing optional context should narrow what Bloom can say, not cause blanket abstention. Avoid asking users for information Bloom already possesses, introducing another questionnaire or forcing manual computation.

## 2. Verified integration points at current HEAD (Codex must recheck)

- `NEXT_ACTIONS.md` currently lists **Active V06-M2 reference eligibility after qualified M3 work**; recent Core M3 supplement source receipts and glycemic reader work are recorded as qualified. **Do not use the stale assumption that M3 is always the active task**. Preserve this exact queue and its next authorized slices.
- `shared/lab-panel-review.ts` includes `recordedLabPanelReview`, lipid/glycemic/liver/iron-CBC panels, report/date alignment, goal relevance and source-qualified cues. **Extend its verified observation → relevant panel finding projection**, rather than creating a separate whole-body inference engine. Its current cues/deltas alone do not guarantee a clinically meaningful explanation.
- `shared/lab-comparability.ts`, `shared/biology-labs.ts`, `shared/lab-history.ts`, `shared/lab-report-metadata.ts`, `shared/scientific-contracts.ts` support lab identity, original sources, contextual comparability and scientific vocabulary. Use actual eligible measurements and source-provenance data. The existing dynamic-meaning specification in [Bloodwork Meaning & Longitudinal Interpretation](BLOOM_BLOODWORK_MARKER_MEANING_AND_REPORT_LAB_CONTEXT_CORRECTION_20261117.md), including `BLOOD-DYN-01–08`, remains binding.
- `shared/nutrient-source-snapshot.ts` has verified composition-source snapshots, values, grams, original source and definition versions. `shared/meal-intelligence.ts` and the existing source/confirmed supplement-intake work provide food and supplement exposure inputs. **Do not equate product lookup or a planned regimen with actually taken consumption**, and do not collapse unknown food composition into zero.
- `shared/goal-guidance.ts` stores goal guidance and practical meal fit, and `shared/wellness-actions.ts` declares candidate actions; existing Response/Today selectors and safety/evidence/protected-goal policies remain authoritative. A new user-facing conclusion may propose a typed candidate action but must pass the existing safety/action release gate.
- Canonical biological graph/evidence and scientific-model registry can provide **qualified mechanistic explanation** when needed. A pathway link, predicted capability or observed correlation is **not** a personalized biological effect, diagnosis or drug response.
- Current [science-first consumer directive](BLOOM_DEVELOPMENT_STRATEGY_AND_CONSUMER_EXPERIENCE_DIRECTIVE_20261117.md) prioritizes a few useful visible conclusions, ordinary language, minimal entry, layered scientific detail and no routine before/after screenshots.

The existing services are not proof that multi-domain clinically meaningful interpretation has been implemented or medically approved. Codex must inspect HEAD, confirm source/consent eligibility and report demonstrated coverage honestly.

## 3. Reuse existing engines: one factual finding → meaning → authorized action

**Do not create another recommendation/insight engine or unbounded LLM medical reasoning service.** Extend the existing scoped Response Intelligence and nutrient/Bloodwork goal-selected projections. Use a minimal typed **consumer-value admission contract** as an output boundary/selector input, not a parallel recommendation service.

```ts
// Illustrative only; Codex may reuse equivalent existing structures.
type MeaningfulInsightCandidate = {
  candidateId: string;
  findingType: "source-observed" | "reviewed-interpreted" |
    "cross-domain-qualified" | "safety-critical";
  observationRefs: readonly {sourceId:string;revision:string;date?:string}[];
  relevantUserGoalIds: readonly string[];
  finding: string;                // nontrivial signal, not a value restatement
  biologicalMeaning: string|null; // what can be supported for this person
  evidenceRuleIds: readonly string[];
  applicability: "supported"|"conditional"|"insufficient";
  practicalNextStepId: string|null; // existing gated action / discussion / monitoring
  materialUnknowns: readonly string[];
  prohibitedClaims: readonly string[];
  priorityReason: string|null;
  releaseState: "feature-eligible"|"detail-only"|"abstain"|"safety-critical";
  sourceEpoch: string;             // recheck before caching, rendering or async publish
};
```

**Gates, in this order:**
1. **Source admission:** Validate exact account/purpose/consent, method/unit/source versions; compare compatible data; confirm ingestion state, actual taken actions and time. No inferred values or fake missing zeros.
2. **Significance/discovery:** Identify panel/cross-domain/longitudinal patterns using reviewed marker-specific and reference-eligibility logic; distinguish noise, natural variance, age/medication/treatment effects and genuine discordance. The finding may be “important source uncertainty” only when decision-critical and fixable.
3. **Evidence applicability:** Match scientific conclusions to relevant measured analyte, population, assay, life stage, country/units, dose/formulation, and study class; retain contradictions, observed-vs-predicted distinctions, multiple plausible causes and honest abstention.
4. **Action/safety:** Propose an existing approved candidate next step when the evidence warrants it, subject to contraindications, protected goals, local jurisdiction, user consent and serious-abnormality handling. Do not prescribe medication changes, impose targets, diagnose disease or automatically claim clinical urgency without independently reviewed release.
5. **Consumer-value selection:** Default main surface shows a few high-value candidates that **explain something meaningful beyond the source numbers** and have a legitimate purpose. Rank by safety and practical user value, goal alignment and recency, not by number of available metrics. Demote restatements to chart/details. Dedupe common-cause and near-identical insights (one glycemic overview, not six cards quoting same rise).
6. **Clear explanation:** Evidence-backed, concise and contextual. A constrained text generator may paraphrase a fact-first approved interpretation; it cannot create facts, causes, thresholds, actions or urgency. Deterministic safe fallback must remain useful; an unavailable LLM is not an excuse to emit generic filler.

**Absence of a good insight is an acceptable outcome.** Show a useful static feature (history/chart/meal plan) rather than filling empty cards, prompting unnecessary inputs or manufacturing recommendations. Conversely, a genuine concerning result should never be hidden because an action hasn't been selected.

## 4. Specific integration fixtures

### 4A. Multi-marker glycemic reasoning — not a glorified delta

For a user with source-qualified HbA1c and glucose measures, inspect:
- actual HbA1c result, units and conversion, time between measurements, laboratory/protocol and reference interval/eligible medical thresholds;
- fasting vs random glucose, units/method/time; if collected differently, **don't** pretend they are interchangeable;
- additional authorized and available data **only if genuinely recorded**: weight trajectory, actual activity, measured diet or energy/CHO exposures, medication starts/changes and conditions potentially affecting HbA1c accuracy (red-cell conditions/turnover, iron status, pregnancy/life-stage when eligible);
- multi-marker concordance/discordance, sustained vs one-off patterns and uncertainty.

**Promotable outcome:** an eligible, review-approved interpretation of whether the overall glycemic pattern suggests a materially relevant shift or discrepancy; its clinical limits; one proportionate follow-up, if applicable. **Not promotable:** “HbA1c increased; more context is needed.” If only HbA1c is available, use its source-qualified level and known evidence to give the best bounded interpretation, not default nothing. Do not assert weight, food or a drug caused the change solely because timestamps align. Do not diagnose diabetes or recommend medication adjustment without independently approved rules and clinician context.

**Missing data:** no linked glucose or incomplete diet means avoid saying **“all glycemic markers worsened”** or “diet caused it”; it does not preclude interpreting the actual verified HbA1c result in an appropriate source and population context.

### 4B. Supplement nutrient overlap — actual total and source-coverage audit

Combine same-day **confirmed taken** supplement sources and eligible consumed food using canonical ingredient form, mass, unit, serving and date. Distinguish:
- multiple products containing the same nutrient vs actually taken multiple overlapping doses; planned prescriptions and viewed products are NOT consumed;
- fully verified exact nutrient amounts/form vs incomplete product records, unknown servings, uncertain supplement activity vs nutrient mass, nutrient chemical forms and bioavailability claims;
- eligible dietary reference value by region/age/sex/life-stage/medical context and **whether the reference legitimately applies to oral supplement/product exposure**, as opposed to an inappropriate total or upper limit;
- confirmed **known-source subtotal** versus complete-day intake; a partial subtotal is NOT the individual's total exposure, deficiency diagnosis, risk proof or clinical nutrient sufficiency status.

**Promotable outcome:** a verified meaningful overlap (e.g. two separately confirmed taken B6 supplements create a known combined supplemental B6 amount) with exact source-linked quantities, source/reference comparability, clear incomplete-coverage caveat and practical discussion of duplicate supplementation or verifying labels; do not automatically diagnose toxicity, recommend unilateral stopping prescribed supplements or infer unmeasured dietary B6. If data don't establish a meaningful overlap or applicable safety reference, show the confirmed source list/subtotal in the details, not an “insight” announcing that B6 exists.

**User effort:** Reuse existing label receipts and known intake facts automatically; missing label details should be repairable from the product or source context where encountered, never require new per-insight manual calculations.

### 4C. Goal-relevant tradeoffs

Evaluate compatible cross-domain examples using source-backed values and applicable guideline evidence: decreasing triglycerides while LDL-C/ApoB remain elevated, insufficient known protein relative to a user's **stated goal** only if enough food coverage and an independently eligible target exist, or active allergy/restriction contraindications when food recommendations are being considered. Don't create novel health optimization from unvalidated microbiome/pathway predictions. An action not relevant to a user's chosen goal should not be prominently shown unless materially safety-critical.

## 5. Acceptance by actual usefulness, not accurate repetition

**Consumer-value tests — required on representative real-compatible synthetic cases and current source contracts:**

- `BIO-VALUE-01`: One normal within-noise lab change, no reviewed meaningful clinical shift → not promoted as a headline; dated chart unchanged.
- `BIO-VALUE-02`: Source-compatible HbA1c + independently timed glucose + appropriate historical context → meaningful interpretation/qualified potential discrepancy, not only values/deltas. If HbA1c only, still give supported level-context interpretation.
- `BIO-VALUE-03`: A1c and glucose disagree or fasting differs → appropriate assay/confounder caveat, no fabricated diagnosis or a generic “more data” wall.
- `BIO-VALUE-04`: Two source-verified B6 products **both actually taken** with confirmed servings → sum a known *supplemental exposure* exactly once, qualify reference and overlap, identify supported practical review; do not equate with total-day B6 where food incomplete.
- `BIO-VALUE-05`: Two identical products merely scanned/saved/planned but not confirmed taken → no consumed overlap/risk insight and no automatic nutrient addition.
- `BIO-VALUE-06`: Missing label amount/source or incomplete food reporting → no guessed quantities, deficiency or adequacy verdict; still use known confirmed subtotal where meaningful, source repair action contextual.
- `BIO-VALUE-07`: New lab result or supplement correction, consent revoke, account switch or evidence version change → only affected in-account candidate conclusions invalidate; stale insights never persist.
- `BIO-VALUE-08`: Known user goals, preferences and contraindications influence value/eligible next steps; no unsolicited irrelevant intervention; safety material items cannot be hidden by low relevance.
- `BIO-VALUE-09`: Source-observed vs research association vs clinical/intervention evidence clearly distinguishable in supporting detail and output; linked mechanisms don't become personal causes or advice.
- `BIO-VALUE-10`: Candidate fails to answer “so what?” and has no material safety meaning/qualified next step → `detail-only` not Today/featured; no generic observation feed.
- `BIO-VALUE-11`: A high-value insight defaults to one concise conclusion, one optional useful next step and evidence/uncertainty on demand; source UI and full science remain accessible.
- `BIO-VALUE-12`: A relevant abnormal finding with required review-approved safety guidance remains visible despite limited input or absence of a recommended action; no unsupported urgency.
- `BIO-VALUE-13`: Candidate is explainable from actual account source revisions and evidence IDs; model output cannot insert causes or acts that source evidence didn't authorize.
- `BIO-VALUE-14`: Held-out cases across CBC/lipid/liver/nutrient/goal groups produce truly distinct relevant meanings rather than parameter-swapped boilerplate; no prompt-only proof of scientific correctness.
- `BIO-VALUE-15`: No fake combined totals, no user-query-driven data collection or commercial personalized diagnosis, and no second insight service/source ledger.
- `BIO-VALUE-16`: No material action provided? The finding may be a legitimate informative high-priority safety or clinically important explanation. No generic action requirement just to fill a card; true action eligibility still governs.

**Reporting:** Separate `SPECIFIED`, `SOURCE_FACT_READY`, `INTERPRETATION_RULE_REVIEWED`, `ENGINEERING_TESTED`, `CONSUMER_VALUE_TESTED`, `HOSTED_VERIFIED`, `INDEPENDENT_SCIENCE_ACCEPTED` and `PERSONAL/CLINICAL_RELEASED`. No screenshot proofs by default. Passing a source read or generating generic caution prose does **not** pass `CONSUMER_VALUE_TESTED`.

## 6. Codex scoped engineering order

**Do not displace `NEXT_ACTIONS.md`.** When its existing M2/M3 source and Response/CDPI slices are next eligible:
1. Audit the actual current Response/Today selector inputs and outputs, `recordedLabPanelReview`, nutrient source-readers, known-source subtotal and confirmed taken flows for candidate generation; identify the missing **minimum** cross-domain fact joins without creating a new view DB or separate query service.
2. Add **bounded** source-backed, marker/nutrient-family-specific interpretive facts and candidate quality/admission checks into the existing response architecture; preserve raw source data, deterministic context, source/evidence version dependencies and release.
3. Implement *one* glycemic multi-marker and *one* verified nutrient overlap end-to-end first, with nontrivial positive and negative controls. Prefer reusable rule/evidence contracts that can apply to CBC, lipid, liver, and other domain cases.
4. Verify source applicability, time/coverage and account/consent isolation; content/decision science review for any diagnosis/risk/action threshold before consumer promotion.
5. Evaluate actual user-facing copy, goal selection and missing-data fallback by the concrete “so what / why / now what” tests; remove low-value default cards rather than enlarging the page.
6. Extend by scientific/evidence priority and test capacity; make thoughtful decisions autonomously without per-rule approval. Record actual integration SHA and omissions, not another planning essay.

**Authority:** Owner expects Codex to perform the investigative work, not tell the user to do arithmetic or consult generic reference numbers. The science engine must produce the most useful **supported** conclusion available, then use concise, clear presentation. **Missing information reduces specificity, not a blanket excuse to stop.** 
