# Bloom Response Intelligence — Nutrition & Biology Specialist Handoff

**Date:** 2026-11-14  
**Version:** 1.0 — specialist proposal for cross-agent review  
**From:** Nutrition & Biology Specialist  
**To:** Chief Architect & Integration Lead (primary), Developer, Marketing & Visual Design, Security / Privacy  
**Repository:** `knagle-max/BloomGutHealth`  
**Previously reviewed (predecessor handoff):** PR #1; branch `enhance/bloom-experience`; SHA `550d549a31e513cb8a7556dd7e44aec2aa1cd800` dated 2026-10-18. **This is not a verification of the current repository head.**  
**Status:** Proposed scientific requirements only; not architecture approval, implementation authorization, GitHub changes, clinical validation, or deployment verification.  
**Workflow:** Received → Reviewed → Implemented → Tested → Specialist review.

## 1. Executive decision requested

Approve **Bloom Response Intelligence (BRI)** as a P1 cross-product scientific capability: explain *what changed between measurements*, identify *plausible contributors*, highlight *unknowns and confounders*, guide *safe continuation and follow-up*, and progressively evaluate *repeated individual responses*. The initial release must remain **observational and evidence-informed**, not claim to identify personal causes from routine quarterly blood tests.

**Problem statement:** A person obtains laboratory testing every ~3 months; triglycerides, for example, may move from >2 mmol/L to 0.6 mmol/L without any systematic record connecting the outcome to changes in food, activity, weight, sleep, medication, supplements, illness, alcohol, or test conditions. Thus, even favourable results fail to produce an actionable, reliable learning loop.

**North-star user question:** "What changed, what probably matters, what am I missing, and what should I keep doing or investigate next?"

**Release thesis:** Stage 1: accurate change history and lab comparisons; Stage 2: evidence-based explanations and targeted questions; Stage 3: controlled personal experiments and validated longitudinal learning.

## 2. Provenance and predecessor alignment

This proposal builds directly on the previous specialist handoff (2026-10-18):

- **BIO-2026-101:** each personal biological claim needs evidence provenance, limitations, contradictory findings, review date.
- **BIO-2026-102:** protect all surfaces from unvalidated biological claims; classify measured / validated modelled / inferred association / experimental / unknown.
- **BIO-2026-103:** host–microbe pathway ontology supports mechanistic plausibility, **not** inferred enzyme activity or individual causal effect.
- **BIO-2026-104:** clinically valid longitudinal interpretation with units, assay, context, medications, confounders and uncertainty.
- **BIO-2026-108:** prespecified endpoints and reliable outcomes before personalized efficacy claims.

The predecessor reported **initial lab trends and check-in workflows implemented**, and **experiment/check-in tools implemented**, but **prospective validation outstanding** as of its reviewed head. Architect/Developer must check the latest branch, map overlap to the original 67-item backlog, and avoid duplicate engines. Its superseded `OLD-MICRO-01`, `OLD-SCORE-01`, `OLD-GEN-01`, `OLD-FOOD-01` findings are **not to be reopened** without reproduction against a newer head.

**Ownership:** Science owns evidence, risk review and scientific acceptance; Architect owns system consolidation and approval gate; Developer owns repository, implementation and tests; Design owns accessible experience; Security owns sensitive data protections. Science does **not** directly instruct the Developer to implement outside the Architect's review.

## 3. Intended end-user journeys

### Journey A: new quarterly lab panel
1. Import laboratory results while preserving source, observation ID, collection date/time, method, unit, fasting information (known/unknown) and corrections.
2. Compare with prior *commensurate* observations, label direction, magnitude, and limits of comparability.
3. Retrieve **only historical** interventions and exposures whose times plausibly preceded the blood draw.
4. Generate distinct sections: **Measured change**; **Potential contributors**; **Alternative explanations and missing data**; **Suggested next question**; **What to maintain / review / discuss**, with certainty labels.
5. Ask the user no more than the most decision-relevant missing questions and record responses explicitly as retrospective self-reports when applicable.
6. Persist versioned response explanation, evidentiary basis, assumptions and revision history.

### Journey B: pre-lab snapshot
- ~7–14 days before a known planned draw, offer a compact review of medication and supplement changes, approximate start/stop dates, exercise, bodyweight, diet, alcohol, acute illness, major stressors, fasting intention and unusual training. This is **prospective context capture**, not retrospective reconstruction.
- The workflow must permit "unknown", "not tracked" and "prefer not to answer"; no implicit zero or unchanged value.

### Journey C: a later reversal or plateau
- Identify newly recorded exposures and context differences, including **measurement conditions**, and compare multiple observation periods. If data are insufficient or simultaneous changes are inseparable, label "cannot distinguish between these explanations".

### Journey D: low-risk personal experiment (later phase)
- Propose only a scientifically suitable, optional experiment with a clear hypothesis, prespecified outcomes, intervention safety, baseline, duration, washout/carryover analysis where applicable, adherence, confounders and explicit review. No routine advice to stop prescription therapies or reverse established beneficial habits.

## 4. Scientific model and inference constraints

### 4.1 Five separate layers, never conflated

1. **Observed biomarker:** Actual measured assay result and original source.
2. **Observed exposure:** Documented behaviour/intervention/event, measured or self-reported, with temporal precision and reliability.
3. **Population evidence:** Mechanistic or clinical evidence about a plausible intervention-to-outcome relationship; context, population, size and uncertainty.
4. **Personal association:** Whether a temporal pattern is observable in this user's records; heavily limited by missingness, confounding and irregular testing.
5. **Personal causal effect:** Allowed only when a validated, suitable experimental or strong quasi-experimental design justifies it; ordinary two-point lab changes do not.

No hidden composite "confidence = 91%" without calibrated validation. Present separately **evidence strength**, **data completeness**, **temporal fit**, and **attribution status**. Avoid language implying individually proven causation ("your walking lowered triglycerides") when only plausible.

### 4.2 Lab comparison and significance

- Preserve exact collection timestamp, specimen details where available, originating lab, analyzer/assay if known, fasting status and duration, medications, acute illness, recent exercise, alcohol and other relevant preanalytical context.
- Normalize units with analyte-specific conversion factors, preserve original values; prevent comparisons between differing analytes or methodologically non-comparable assays; never substitute "normal range" as proof of improvement.
- Use published within-person biological variation, analytical imprecision and appropriate **reference change value (RCV)** **only when valid for that analyte, population and method**; report when unknown, and do not equate RCV to clinical importance. Document model/version/reference.
- Separate *direction*, *magnitude*, *exceeds expected variation (if assessable)*, *clinical significance*, and *need for follow-up*.
- Allow nonlinearity, regression to the mean, seasonal effects, baseline severity, within-person fluctuation and regression artifacts.
- Do not generalize fasting requirements; triglycerides can be interpreted nonfasting for many purposes, but consistent fasting context is valuable for monitoring and marked elevations may warrant confirmation.
- Apply clinical red flags and clinician referral rules, particularly marked hypertriglyceridemia/pancreatitis risk, critical values, medication-related abnormalities and unexpected severe shifts. These are separately vetted and jurisdiction-aware.

### 4.3 Temporal alignment

- **Bitemporal:** store when an exposure *occurred* versus when Bloom *learned/recorded* it. Preserve uncertain ranges (e.g. "began sometime in April") and actual lab collection timestamps.
- **No future leakage:** events after draw never explain earlier measured outcomes. Retrospective claims should remain marked as such, not pretend to be prospectively known.
- **Exposure windows vary by biomarker and intervention:** e.g., HbA1c integrates glycaemic exposure over weeks/months; exercise can influence triglycerides on short and longer timescales; hepatic steatosis/weight changes require their own periods. Avoid universal 90-day assumptions.
- Avoid post-treatment/collider adjustment and mediation mistakes: weight change may be a mediator of diet/exercise; treating it blindly as an independent confounder may mislead.
- When interventions co-occur or outcome measures are sparse, list hypotheses rather than rank with false precision.

### 4.4 Triglyceride initial pathway and confounder map

Clinical evidence supports evaluating dietary added sugar/refined carbohydrates and saturated fat, alcohol, weight change, activity and secondary causes (diabetes, hypothyroidism, kidney disorders, some medications, acute illnesses). Document overall cardiometabolic impact, not only TG. Mechanisms may include VLDL production and clearance, but neither pathway's individual flux is measured by a TG test.

A 2026 ACC/AHA dyslipidemia guideline recommends reduced added sugar/refined carbohydrate and saturated fat, minimized alcohol, physical activity and weight management for elevated triglycerides; lifestyle response magnitude varies. The 2026 International Atherosclerosis Society consensus endorses nonfasting screening with fasting confirmation for sufficiently high TG and investigation of secondary causes. See sources §11.

**Do not** treat microbiome taxa, Viome-derived pathway scores, genotype, supplement use, or lipid biomarkers as a validated personal enzyme-flux measurement. If genetics/microbiome are included, they can supply carefully qualified background *hypotheses* only where credible evidence exists, and never trump actual clinical observations.

## 5. Data contract proposed for architecture review

Minimum entities (illustrative conceptual model, **not** a schema mandate):

- `BiomarkerObservation`: source record ID, analyte coding, value, canonical/original unit, collection timestamp and timezone, laboratory, method, fasting/method uncertainty, corrections, clinical context, provenance.
- `ExposureEvent`: category (`food_pattern`, `activity`, `bodyweight`, `sleep`, `medication`, `supplement`, `alcohol`, `illness`, `other`), dose/intensity/value with units, start/end range, recurrence/adherence, source, recorded-at time, confidence of recall, change type, explicit unknown.
- `OutcomeComparison`: paired observation identifiers, interval, percent/absolute change, comparability assessment, expected-variation assessment if permissible, clinical interpretation and version.
- `EvidenceLink`: source DOI/URL, study design and population, exposure, comparator, outcome, timescale, effect direction/magnitude if robust, uncertainties, contraindications, contradictory sources, review date.
- `ResponseHypothesis`: linked comparison and exposures, mechanistic rationale, supporting/contrary evidence, window fit, missing confounders, attribution class, explanation revision history.
- `Question/Answer`: reason asked, user answer including unknown, event time claimed, answered-at time, source/reliability, effect on interpretation.
- `ActionSuggestion`: maintain/measure/discuss/review/test, contraindications, evidence provenance, **never automatic prescription change**, user acknowledgement and later outcome.
- `PersonalExperiment`: predeclared hypothesis/outcome/design, safety screening, dates, exposure adherence, carryover, analysis and negative results (phase 3 only).

**Architecture decision:** Reuse canonical active labs, immutable lab corrections/import receipts and existing experiment/check-in infrastructure; prohibit copying laboratory histories into a second independent source of truth. Require deletion/consent lifecycle that propagates into cached model outputs.

## 6. Prioritized scientific requirements (new IDs; crosswalk to existing backlog mandatory)

### BIO-2026-109 — Longitudinal exposure/change ledger — **P1**
**Acceptance:** recorded vs occurrence timestamps, bounded date uncertainty, start/stop/dose/adherence revisions, source provenance, structured unknowns, retrospective flag; chart and query histories reproducible. Two reviewers can identify precisely which event existed before a selected blood draw. No absent-event-as-zero error.

### BIO-2026-110 — Biomarker comparability and change significance — **P1**
**Acceptance:** unit conversions tested; methods and fasting conditions preserved; RCV only when warranted and sourced; separation of statistical vs clinical significance; abstention if assay mismatch, insufficient data or invalid reference values; escalation on critical values.

### BIO-2026-111 — Evidence-linked response hypotheses — **P1**
**Acceptance:** observed changes generate possible contributors with per-hypothesis reason, credible citations, population applicability, correct temporal window, competing explanations, negative evidence, confidence dimensions and explicit **not proven personally** statement; no spurious precise causal percentages.

### BIO-2026-112 — Adaptive pre/post-lab capture — **P1**
**Acceptance:** optional pre-lab snapshot, limited post-result high-information queries, no redundant questioning, unknown/decline options, user-visible provenance and editable corrections; retrospective details never overwritten into false prospective records.

### BIO-2026-113 — Continuation and follow-up decision support — **P1**
**Acceptance:** separate `maintain`, `review`, `monitor`, `discuss with clinician`, `test hypothesis`; consider potential tradeoffs (e.g., TG versus LDL-C/ApoB, nutritional adequacy, adverse symptoms); no unsupported stop/restart recommendations; documented clinical safety review.

### BIO-2026-114 — Structured N-of-1 study design — **P2, gated**
**Acceptance:** study eligibility, reversibility, safe intervention, prespecified outcome and timeframe, sufficient repeated measures, washout/carryover assessment, adherence, confounders, null results, transparent analysis, clinician oversight when needed; clinical/causal claims withheld pending validation.

### BIO-2026-115 — Longitudinal personalization and calibration — **P2, gated**
**Acceptance:** reproducible cross-cycle hypothesis revision, correction for selection bias and missingness, time trends and repeated measures, holdout/prospective evaluation where applicable, uncertainty calibration, neutral results retained; personal efficacy claim threshold approved in advance by Science and Architect.

## 7. MVP scientific decision workflow

1. Receive lab outcome; validate original observation and compare with previous assay.
2. Calculate change and assess whether reliable/clinically relevant; if not assessable, state why.
3. Retrieve documented pre-draw exposure changes in biomarker-specific windows; preserve data capture times.
4. Evaluate tested, cited evidence for plausible intervention→outcome pathways and relevant risk factors.
5. Generate hypothesis objects only if there is a confirmed exposure or a distinctly labelled *missing-history question*.
6. Produce **observed change**, **candidate explanation(s)**, **alternative explanation(s)**, **missing evidence**, **safe next action**.
7. Save a versioned explanation tied to the exact laboratory observations and evidence version; revise after user feedback instead of silently changing its provenance.
8. Test against negative cases and abstain where supported evidence or reliable exposure history is absent.

**Prohibited output:** "Exercise caused 60% of your triglyceride reduction" or "Discontinue omega-3 because it no longer helps" from two nonexperimental observations.

**Permitted output:** "Walking increased before this test. Greater physical activity can lower triglycerides in population studies. Weight/diet and fasting status also changed or are unknown, so we cannot isolate walking's contribution. It may be worth maintaining your activity and recording these factors before the next draw."

## 8. Required validation test matrix

At minimum, implement adversarial fixtures and specialist-reviewed expected answers:

1. TG 2.1→0.6 with **four simultaneous lifestyle changes**: do not attribute individually.
2. TG 2.1→0.6 with **no exposure history**: identify observed difference; pose a question, no speculative causal ranking.
3. TG values with **different fasting conditions**: flag comparability; do not assume fasting fully explains change.
4. Lab specimen collection earlier than event, but event entered later: **no future exposure leakage**.
5. Clinical result imported with **corrected collection date or unit**: rerun association with versioned audit trail.
6. Changed instrument or noncommensurate assay: appropriately abstain.
7. No real change but extreme baseline outlier: account for regression-to-mean/variation.
8. Medication/supplement change plus dangerous value: escalate safely; never suggest unreviewed discontinuation.
9. Dietary change improves TG but worsens LDL-C/ApoB: avoid single-marker celebration.
10. Sparse follow-up, contradictory studies, genotype-only hypothesis or microbiome inferred-flux claim: abstain from personalized causal or mechanistic assertion.
11. Pregnant/minor/complex comorbidity or unverified jurisdiction: restrict interpretation to supported scope.
12. Missing, withdrawn or deleted sensitive source history: generated explanations should not retain prohibited personal data.

Developer to implement programmatic regression tests; Science to review representative outputs including wrong/unknown scenarios. Any large language model used must have structured, deterministic scientific guardrails and not independently invent exposures, evidence, units, physiology, source URLs or causality scores.

## 9. UX/brand handoff to Design

**Principle:** warmth and clarity at the surface; rigorous measurement/evidence details on demand, aligned with Bloom's premium organic scientific instrument aesthetic.

Suggested result hierarchy:

- **Your result changed**: measured values, dates, units; don't overclaim "improved" without clinical basis.
- **What may explain it**: show only documented candidate changes; distinct `Population evidence` versus `Your evidence` indicators.
- **What else could explain it?**: fasting, medication, illness, testing context and other meaningful uncertainties.
- **What to do next**: maintain safe habits, capture context, ask clinician, repeat when indicated, or design a suitable experiment.
- **See the science**: cited study population, quality, counterevidence, pathway with measured/inferred distinctions.

Avoid celebratory green "caused by" badges, uncalibrated probabilities, unvalidated pathway animation implying true metabolite flux, anxiety-inducing unknowns, and excessive daily manual tracking. Integrate response explanations with Biology and Progress, surfaced from Today when a new result arrives. Design owns detailed placement, nomenclature, accessibility and brand assets.

## 10. Cross-team review requests and unresolved architecture choices

**Chief Architect (decision required):** verify current repository and existing APIs; map BIO-2026-109…115 to backlog and 104/108; decide canonical temporal/event model, evidence engine reuse, phased release boundaries, source-of-truth contract, observability, and acceptance gates. Resolve whether a lightweight v1 lab-response explanation can ship without any personal causal scoring (science recommends yes).

**Developer (after architect approval):** inspect current head; map duplicates; plan schema migrations and reproducible audit trails; implement tests and instrumentation; return implementation evidence and exact commit SHA for specialist review. Do not infer authorization to push from this document.

**Marketing & Visual Design:** design distinction between general scientific evidence and individual association; prototype result-linked explanations, gentle missing-data questions, pre-lab snapshot, and accessible uncertainty wording; use approved brand assets.

**Security & Privacy:** review explicit consent for connected health sources, third-party model exposure, provenance, encryption/access control, derived explanations retention, deletion/correction propagation, secondary-use restrictions and export. No model training or external sharing implied by ingesting sensitive health records.

**Science specialist:** supply evidence matrix for initial analytes (TG first, then HDL/LDL/ApoB, HbA1c, liver enzymes, BP etc.), validate clinical rules and counterevidence, review red flags, execute scientific acceptance audit after developer testing.

**Open questions (do not block stage-1 recordkeeping):** exact target jurisdiction(s), assay method availability, Apple Health connectivity and data entitlement, supported nutrition adherence resolution, pre-lab reminder scheduling capabilities, medical review workflow, approved citation/ontology structure, definition of minimum measurement density for personalized inference.

## 11. Scientific references and review boundary

1. **2026 ACC/AHA multisociety guideline on dyslipidemia** — specific recommendations for lifestyle management of elevated triglycerides, including added sugar/refined carbohydrate, alcohol, activity and weight management: https://doi.org/10.1016/j.jacc.2025.11.016
2. **International Atherosclerosis Society Consensus Statement (2026)** — hypertriglyceridemia evaluation, nonfasting/fasting context, secondary causes: https://www.nature.com/articles/s41569-026-01358-9
3. **CONSORT Extension for N-of-1 Trials (CENT), BMJ 2015** — suitability, design and reporting requirements for individually randomized trials: https://www.bmj.com/content/350/bmj.h1738
4. **Previous Bloom Nutrition & Biology Specialist Handoff, 2026-10-18** — project-specific scope, safeguards, priorities, predecessor status; reviewed directly from uploaded file.

**Important evidence caveats:** (a) These references establish population-level and methodological principles, **not** validity of a Bloom attribution algorithm; (b) no specific triglyceride RCV threshold is hard-coded in this proposal because source/method/population suitability must be confirmed; (c) cited sources should be version-controlled and supplemented with analyte-specific literature before release; (d) research evidence is current as reviewed 2026-11-14, but neither implementation nor clinical deployment has been independently audited.

## 12. Delivery and release sign-off

**Current state:** SCIENCE PROPOSAL PREPARED — Architect review required.  
**Next workflow status:** **Received** when the architect/developer formally ingests and reconciles against the live backlog.  
**Definition of Stage 1 done:** meaningful laboratory comparison; truthful temporally annotated intervention history; explicit unknowns; source integrity; safe user-facing interpretation and no invented causal explanations.  
**Definition of Stage 2 done:** validated evidence registry mapping, hypothesis output tests, conservative personalized explanations, appropriate clinical follow-up and accessible UX.  
**Definition of Stage 3 done:** prespecified, ethically appropriate experimental capabilities with prospective validation and calibrated uncertainty before any causal language.

**Requested decision:** Accept BRI as a cross-cutting P1 capability in principle, then reconcile with architecture and existing backlog; defer personal causal effect estimation until validated.