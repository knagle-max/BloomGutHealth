# BLOOM — Biological Optimization Intelligence
## Comprehensive scientific research, data acquisition, architecture and cross-agent handoff

**Date:** 2026-11-09  
**To:** Chief Architect & Integration Lead  
**For:** Nutrition/Biology; AI/ML; Integrations; UX/Brand; Security/Legal; User Testing; Codex  
**Priority:** v0.6 core, staged v0.7+ experimental extension  
**Status:** APPROVE CONCEPT WITH SPECIFIC EVIDENCE AND RELEASE GATES; NOT IMPLEMENTED BY THIS HANDOFF  
**Baseline inspected:** `knagle-max/BloomGutHealth`, `enhance/bloom-experience` at `633f6835f356f65befd20a0c8a45ffb699afa6b8` (moving development SHA; actual release decisions require a frozen commit).  
**Scope:** Adult-first, Canadian wellness / athletic performance / healthy longevity. This handoff does not authorize medical diagnosis, treatment, prognostic disease prediction, clinical dosing, hormone therapy or public access to unvalidated individualized molecular models.

## 1. Executive recommendation

Build **Biological Optimization Intelligence (BOI)** as a cross-cutting *function* of Bloom rather than another panel of scores. The value proposition is: **What is working well? What could be improved? What data support the inference? What realistic actions are eligible? How will we know if they helped me?** Preserve the user's vision of genes → proteins → enzymes → cofactors/substrates → reactions → microbial/host interactions → measurable outcomes; ensure every causal edge carries evidence and separate research modelling from released personal guidance.

**Three distinct products on one data foundation:**

1. **Evidence-based everyday optimization (release-eligible):** nutrition quality, physical activity, sleep regularity, recovery, strength progression, cardio fitness, habit sustainability and scientifically defensible general wellness targets. Personalized by goals, existing measurements, allergies, preferences, ability, constraints, medications/safety context and adherence.
2. **Personal response intelligence (prospectively evaluated):** repeated comparable observations and voluntary structured self-experiments; estimate changes *actually observed*, with uncertainty, confounders, objective outcome and a safe fallback; avoid asserting causality without an appropriate design.
3. **Molecular and microbiome biology laboratory (research-only until reviewed):** genome/microbiome pathways, putative metabolite and hormone influences, community flux models, food-substrate scenarios, advanced genetic associations. No personal chemical production estimates or treatment advice from source-list presence or SNPs alone.

**Don't equate** low biomarker, low dietary intake, gene variant, microbial presence, or an algorithmically low 'pathway score' with a defective system or biochemical insufficiency. Distinguish measured *status*, measured *function/response*, quantitative *capacity*, association, theoretical *pathway capacity*, and conjecture.

## 2. Research findings and governing scientific decisions

- **General healthy living matters:** AHA Life's Essential 8, 2026 AHA diet guidance and 2026 ACC exercise guidance prioritize dietary patterns, movement, smoking avoidance, sleep, cardiovascular measures, and individualized FITT training over arbitrary biochemical optimization. [R01,R02,R03]
- **Interindividual food responses are real but imperfectly predictable:** PREDICT 1 (n=1,002) reported heterogeneity in postprandial responses to identical meals, including glucose, triglycerides and insulin; relative contributions of meal, genetics and microbiome differ by outcome. Do not generalize one cohort's predictive performance to a Bloom user. [R04]
- **Personalization is not guaranteed superior:** A 2026 systematic review/meta-analysis of 15 randomized trials found modest body weight/body fat effects but inconsistent glycaemic/lipid benefits; ZOE METHOD RCT (n=347) reported TG improvement and a mix of positive/null secondary outcomes. Therefore demand objective incremental benefit over a deterministic guideline-backed baseline. [R05,R06]
- **Stool microbiome profiling utility is limited:** 2025 international expert consensus explicitly cautions that consumer microbiome tests have insufficient evidence for routine clinical utility. Require method, sequencing/transcriptomics vs metagenomics, relative-abundance status, strain resolution, collection conditions, provider-derived scores and composition caveats. [R07]
- **Wearables are imperfect:** use observed/estimated labels for sleep stages, energy expenditure and HRV. A 2026 HRV methodological review finds insufficient support for many consumer recovery prescriptions from wearable HRV. [R08]
- **GLP-1 production is not inferable from a CGM or microbiome:** total and intact active GLP-1 require appropriate time series, assay and specimen handling; 2025 mixed-meal assay methods highlight assay variability and DPP-4 degradation. Separate secretion, clearance, receptor response and downstream glucose effects. [R09]
- **Reference intake is not diagnosed deficiency:** use Canadian EAR, RDA, AI, UL correctly and distinguish usual recorded intake from physiological status, missing composition and optional clinical labs. [R10,R11]
- **Regulatory classification follows function/intended use, not disclaimers alone:** Canadian Health Canada SaMD guidance generally distinguishes general wellness from individual disease prevention/diagnosis/treatment recommendations; Legal must approve specific feature and actual displayed claims. [R12]
- **Connections need permissions and a deployable bridge:** native Apple HealthKit and Android Health Connect have consent- and permission-based mobile APIs. A browser/PWA cannot assume unrestricted access to them; use approved native companion/export pathways and supported record types, not promised native connectivity without implementation. [R13,R14]

## 3. Data collection: global contract, not an unlimited compulsory questionnaire

### 3.1 Every observation must preserve

`id`, `tenant/user`, `domain`, `canonical concept`, `source native label`, `source type/provider`, `source immutable ID and version`, `original quantity/value`, `original unit`, `canonical value/unit if safe`, `observedStart/End`, `timezone/collection clock`, `specimen if lab`, `assay/method/device/model`, `fasting/meal/exercise context`, `demographic applicability`, `reference or instrument range`, `missingness (not reported vs zero vs not measured vs partial)`, `uncertainty`, `verification state`, `consent purpose`, `last imported/revised`, `source deletion provenance`, and `duplicate/dedup key`. Derivations are pointers back to exact source snapshots and versioned evidence; never overwrite the raw report.

Use *missing, not measured, estimated, modelled, reported by provider, user-confirmed, device-recorded, clinician-confirmed, incompatible* as separate states. Never invent a benign reference genotype, basal hormone concentration, deficiency, food nutrient amount or simulated metabolite value.

### 3.2 Intake matrix — what must be collected, when and where

| Domain | Day-one / baseline UI inputs (required only when relevant) | Ongoing UI (low friction, optional) | External provider/source candidates | Why and key qualifiers |
|---|---|---|---|---|
| Consent + use scope | Age category, country/province, account/household ownership, adult consent, purpose(s), sensitive-data permissions | Source selection, source delete/export, research opt-in/off, reminder preferences | None | Distinguish family members; minors separate activation; don't silently use genetics for coaching |
| Goals + preferences | Primary goal order (healthspan, energy, metabolic, cardiovascular, muscle, endurance, recovery, gut comfort, weight), desired trade-offs and timeline, accessibility | Change goal, priority and feedback | None | Multi-objective preferences—not a secret algorithmic 'optimum' |
| Demographics + safety context | DOB or validated age-band, relevant DRI sex/life stage, optional pregnancy/lactation, height, allergies, intolerances, dietary restrictions, mobility limitations, exercise readiness | Context updates with effective dates | Profile, clinician-supplied measurements | Sex-specific reference category is not necessarily gender; obtain only what needed |
| Health/medication context | Voluntary diagnoses, symptoms relevant to activities, medications/therapy, major procedures, family history, clinician goals, supplement contraindications | Changes and effective dates, new clinical advice | Optional medical records FHIR, trusted manual entry | Never diagnose or recommend dose changes; medication affects biomarkers and interventions |
| Food/meal logging | Food preferences, disliked foods, kitchen/budget/time, food availability, baseline meal pattern | Search/barcode/voice/text, ingredient grams or validated servings, cooking/fortification, meals, beverages, timing, missing components | USDA FDC, CNF 2026, branded labels, optional OFF if licensed, grocery and recipe databases | Nutrition estimates have source-specific coverage; source unknown ≠ zero |
| Supplements | Product, dosage/form/label version, purpose, actual vs planned schedule, start/end | Confirm actual use, missed doses, changes, adverse effects | User labels/photos, verified product label data | Avoid double count fortified foods; supplement safety review by form |
| Symptoms & behavior | Preferred check-in frequency, baseline hunger/fullness, gut symptoms/energy/mood, stool pattern if relevant, discomfort, work/sleep routine | <30-second optional check-in with time and contextual notes | None | Outcome data, not direct hormone/metabolite measures; separate adverse-effect channels |
| Activity/training | Equipment, experience, baseline cardio/strength capacity, injuries, time constraints | Workouts with sets/reps/load/RPE, exertion, steps, activity type/duration, enjoyment, soreness | Apple Health/Watch, Health Connect, Garmin, Fitbit, Oura, Peloton, Strava where agreements permit; CSV/GPX/FIT | Preserve planned vs completed, device provenance and duplicate work-outs |
| Sleep/circadian | Work schedule, usual bed/wake, shift work, chronotype preference, caffeine/alcohol habits | Sleep times, subjective quality, fatigue, travel/timezone, regularity | Apple Health, Health Connect, Oura, Garmin/Fitbit | Wearable stages are estimates, not polysomnography; don't force daily detailed survey |
| Anthropometry/vitals | Weight, optional waist, device/measurement procedure, resting BP, optional body composition | Intermittent weight/waist/BP, illness, fluid status | Withings, smart BP/scale, HealthKit/Health Connect | Bioimpedance/bone-mass estimates have limits; don't use consumer scale as DXA |
| Routine labs | Optional source-linked originals and dates: lipid panel (LDL, HDL, TG, non-HDL, ApoB, Lp(a)), HbA1c, glucose, liver markers, CBC, ferritin/TSAT, B12, vitamin D as available | Same analyte longitudinal tests + sample method, fasting, lab interval, actual unit, change flags | PDF/CSV/FHIR, LifeLabs/Dynacare and provincial labs only if permitted; clinician | No automatic testing cadence, age/risk diagnoses or clinical targets from app |
| Genetics | Consent + provider, build, strand, raw calls with original tokens, assay type, phase/CNV/repeat limitations | New files, source corrections and revocation | 23andMe raw files, genetics labs, VCF if properly supported | Variant ≠ gene function; 29 supported v0.5 explanations, larger candidates require review; no unverified disease/prescription rules |
| Microbiome | Stool report provider, sample date, assay type, taxonomic rank, source reported abundance vs qualitative score, antibiotic/laxative/probiotic context | Repeat report with collection context, symptoms/diet context | Viome PDFs, raw metagenomics/metatranscriptomics only if supported/consented; sequencing partner | No stool-list → personalized flux/hormone predictions; do not assume gene expression |
| Optional glucose response | Meals with exact meal start, portion, activity and medication context | Voluntary capillary/CGM measurements, calibrated sensor chronology, comparable meal repeats | CGM vendor with approved access, Apple/Health Connect glucose data, uploads | CGM interstitial lag, sensor errors, no GLP-1 secretion inference; no clinical diagnosis |
| Optional performance physiology | Resting HR trend, aerobic pace/HR, strength progress, standardized effort | Fixed-route pace and RPE, submaximal protocol, observed repetitions/load | Chest strap/wearables, lab CPET if independently sourced | Workout performance affected by training and environment, not 'muscle gene efficiency' |
| Optional specialist assays | None compulsory | Select reviewed hormones/metabolites only with specimen, method, preanalytical conditions, timing, indication and clinician interpretation | Thyroid, sex hormones, C-peptide/glucose, IGF-1, cortisol where applicable; clinical lab | Hormone timing/medication effects profound; no blanket panels or self-directed treatment |
| Environment/psychosocial | Time-zone, shift work, typical access to healthy food, financial/time constraints | Travel, acute illness, stress, outdoor temperature optional | Weather/calendar optional, only with opt-in | Relevant confounders; no routine precise geolocation necessary |
| Adherence & outcomes | Personal priority outcome and acceptable tracking burden | Chosen action, planned/completed/paused, enjoyment, side effects, reason stopped, observed outcome | Existing goal/choice records | Needed to learn effectiveness without imputing compliance |

### 3.3 Four onboarding paths

- **2–4 minute essential onboarding:** adult eligibility, goals, preferences/allergies, basic profile where needed, schedule and a chosen first action. No genetic test required.
- **Optional “Make recommendations more personal”:** supplement list, activity routine, sleep, symptoms, budget/food access and recent weight/BP; progressive disclosure over first weeks.
- **Connect/import:** separate consent tiles with exact types and granular source permissions. Show a preview before persistence, scopes, coverage, duplicates, gaps, provider region and last sync. Manual/CSV/PDF fallback remains fully usable.
- **Advanced research (explicit opt-in):** microbiome raw functions/metabolite modelling, genomic annotations, structured meal-response protocols and specialist hormones. No direct recommendation changes without independent evidence gate.

### 3.4 Source priority and optional testing

Always use existing trusted source measurements first. Never direct users to purchase expansive “longevity” panels, microbiome retests, multi-omics or hormone testing as a prerequisite. Show **what the additional test would answer**, whether outcome is actionable, whether the study/protocol is validated, expected data cost/privacy, and whether a lower-cost simpler measure would suffice. For GLP-1 specifically, an ordinary CGM, appetite questionnaire or Viome report does not measure secretion; meal GLP-1 assays belong in specialist research workflows, not baseline onboarding.

## 4. Biological knowledge graph and inference

**Canonical path:** source observation → analyte/organism/variant resolution → molecule/gene/EC enzyme/receptor/reaction/substrate/cofactor → tissue/pathway → measurable phenotype/response → candidate action → outcome. Every edge needs: `edge_id`, evidence source/PMID/DOI, study population, method, human/animal/in-vitro/model, directionality, uncertainty, contradictory evidence, version, claim release tier. Build evidence separately from actual measured data.

**Ontology identifiers:** gene HGNC/Ensembl; variants dbSNP/ClinVar/GRCh placement with build/strand; proteins UniProt; enzymes EC; reactions Rhea/MetaNetX; metabolites ChEBI/HMDB (respect licensing); microorganisms NCBI Taxonomy/GTDB with taxonomy-version/strain; food components canonical nutrient registry + USDA/CNF; labs LOINC/UCUM/FHIR Observation; conditions SNOMED only where licensed/appropriate; activity standard recorded modality and units. Taxonomy harmonization is explicit, never implicit species→strain.

**Observed strength:** repeated, valid response or status meeting a process-specific benchmark with stated context. **Possible constraint:** supported measured pattern or source-appropriate association that motivates a question. **Research hypothesis:** pathway model/variant or a microbiome association without personal functional measurement. A user may have reassuring measurements but no measured pathway efficiency. Never assign a cross-system 0–100 biological capacity score from mixed evidence.

### 4.1 Examples of bounded biological insight

- **Glucose handling:** two comparable measured meal responses; annotate portion, timing, sleep, activity, medication; recommend meal quality/substitutions with known human evidence. Never label insulin resistance or GLP-1 sensitivity from CGM alone.
- **Lipid transport:** measured lipid/ApoB trajectory plus consistent diet/activity; discuss general heart-healthy pattern and optionally clinician conversation, not genotype-based lipid treatment.
- **Vitamin A:** BCO1 variant may affect carotenoid conversion in some studies; show actual vitamin A food form/intake and missingness; no genotype-specific deficiency claim or dosing.
- **B12:** FUT2 and other variants can associate with circulating B12; consider actual assay, diet and medication context. Never call variant a B12 deficiency or identify a specific absorption inefficiency.
- **Microbiome butyrate:** studied cross-feeding organism taxa may explain pathway capacity in research, but stool presence cannot establish production or colonic exposure; no personal 'low butyrate synthesis' score from qualitative Viome.
- **GLP-1:** explain L cells, PCSK1 proglucagon processing, secretion after meals, DPP-4 breakdown, GLP1R responses. No 'percentage efficient' claims without separately validated response measure. A generic appetite/fullness pattern is not a direct GLP-1 measurement.
- **Exercise recovery:** measured training load, performance, perceived exertion, sleep and symptoms can justify practical recovery suggestions; isolated wearable HRV may not establish overtraining.

## 5. Recommendation engine: precise decision design

**First: independently validated eligibility.** Candidate actions from an approved library: increase legumes/vegetables/whole grains gradually if tolerated, improve protein distribution, substitute unsaturated for saturated fat sources, maintain activity and progressive resistance training, adjust sleep consistency, improve hydration where relevant, recover between hard sessions, meal timing only where validated. Respect user exclusion, illness, medication context, pregnancy/lactation, age, budgets, time, preferred foods, prior reactions, serving sizes, nutrient forms/upper limits, and consent.

**Ranking is not a health-risk diagnosis.** Use multi-objective expected value, with adjustable user priorities, outcome-specific evidence strength, feasible benefit (bounded), time/effort, cost, personal preference/adherence, known harms, interactions, uncertainty, data incompleteness, diversity and diminishing returns. Avoid reward for increasing every pathway metabolite or maximizing any single hormone.

A transparent heuristic formulation for an approved option `a`:

`utility(a) = weighted_expected_goal_benefit(a) × evidence_relevance(a) × feasibility(a) – burden(a) – uncertainty_penalty(a)`

This is **an internal ordering heuristic, not a calibrated medical risk score or predicted physiological effect**. Hard constraints and safety checks apply before and after optimization. Show at most 1–3 options with explanations, alternative choices, time to try and observable outcomes.

**Recommendation object:** action identity, user goal, basis (which measured observations and source quality), broad human evidence, extra biological hypothesis clearly separated, constraints, rationale, expected direction but no invented numerical promise, measurable outcome, proposed observation window, user override, confidence reason, contraindication and abstention reason; version everything.

**Do not rank clinical advice via model:** medication/supplement therapeutic dose changes, abnormal-lab treatment, hormonal manipulation, disease-specific food therapies, genetic PGx changes require separately reviewed medical intended-use authorization; default OFF.

### 5.1 Concrete response learning loop

`Baseline (7–28 days where feasible) → choose one small action → prospective plan/actual adherence → observe chosen outcome at meaningful interval → compare with baseline + confounders → show uncertainty → keep/adjust/stop with user choice`.

- Establish clear observation windows: daily for symptom/energy, 1–4 weeks for adherence, weeks/months for weight/fitness, appropriate lab retest only if externally scheduled/clinician-indicated. Do not infer fasting lipid or A1c change from 3 days.
- For repeated-meal experiments, use standardized test meal composition/portion, timing, activity, sleep and sensor if accessible; randomized A/B order or replicated crossover when safe; track washout/carryover and low sample size; no research-design requirement for casual advice.
- Prefer within-person paired/trend analyses controlling for collection context, regression to mean, seasonal drift, device/lab methods, acute illness, medication/weight changes and time lag. Multiple simultaneous changes prohibit confident attribution.
- Stop or abstain if data insufficient, user reports worsening, an intervention conflicts with safety constraints, or measurement variability exceeds signal. Never recommend undertaking unsafe deprivation/fasting or changing medication to 'test' a theory.
- Require user confirmation before counting an action as completed; intention ≠ adherence.

## 6. AI/ML approach — build real intelligence without invented biology

**Layer 0: canonical deterministic calculation** (existing TypeScript): food mass/source nutrient math, safety/eligibility, measured lab source, DRI/reference constraints, actual activity and sleep records, account/consent, derived state.

**Layer 1: deterministic guideline-supported planner** always working when Python/LLM disabled. Source-correct nutrition gap suggestions, reliable activity plans, simple time/affordability-aware substitutions.

**Layer 2: constrained optimizer (Python optional):** choose among approved food/meal/training options with explicit input coverage, cost/time/preferences and upper limits; replay chosen candidates through TS pre/post validators; produce genuine feasible improvements vs heuristic baseline or abstain.

**Layer 3: personal response models (shadow then gated):** learn baseline variability and relevant heterogeneity only after sufficient consented repeated outcomes, use hierarchical/regularized model, calibrated uncertainty, prospective holdouts; no prediction when out-of-domain; compare to both population baseline and deterministic personalized baseline. Protect against inverse causality and user-specific data scarcity.

**Layer 4: experimental biological simulation:** source-linked strain/gene/reaction/metabolite graph, microbiome community metabolism, food-substrate flux, host receptor hypotheses; synthetic cohorts/reference communities first, mass-balance, appropriate substrate constraints and culture/clinical benchmark validation. Keep under R0/R1/R2 research tiers until real-world utility and governance clear. Never auto-authorize food action solely from hypothetical flux.

**Layer 5: LLM communication only:** generate accessible wording from validated structured findings, cite sources, no raw uncited numerical claims, no changes to evidence eligibility or underlying science, no sending sensitive source to providers without explicit consent, contractual assessment and scoped need.

**Evaluation:** baseline action quality and adherence, objective outcome improvements, abstention appropriateness, contraindication-exclusion failures (zero tolerance), unknown→zero rates (zero tolerance), user comprehension and regret, calibration/coverage, fairness across age/sex/ancestry, throughput/cost, generalization to unseen food/device/providers and corrected source handling. Evaluate incremental lift from adding genetics, microbiome and hormone data individually; when no lift, don't weight them.

## 7. UI / product flows

### 7.1 Today — one meaningful next step
- `Today's best next step` with “why now,” eligible action, expected qualitative benefit, source/evidence and explicit choice; do not show a dozen competing biological cards.
- `Your data is incomplete` for unsupported claims; one specific optional source question rather than a large intake form. Example “Did you take your zinc supplement today?” not broad generic questionnaire.
- One-tap plan/complete/skip/edit, feedback and adverse effect path. Never infer that the app-suggested meal was eaten.

### 7.2 My Biology — systems map, not scores
- System tiles: cardiovascular/lipid, glucose/energy, muscle/performance, nutrition availability, gut microbial ecology, sleep/circadian, endocrine signals and bone/mineral. Each labelled `measured`, `pattern observed`, `research association`, `not assessed`, `source incomplete`, not traffic-light 'good gene/bad gut'.
- Each detailed pathway: **What the system does → Your actual measurements → What may influence it → What is uncertain → What ordinary changes have evidence → How to test whether it helped**. Your result, gene biology and molecular model explicitly separate.
- GLP-1 pathway page has known mechanisms, assay requirements and “No personal GLP-1 secretion measurement” when absent, not a manufactured rate/score. Specialist measurements show total/active, collection times, DPP4 inhibitors, fasting, specimen handling, drug effects, assay identity, repeatability.

### 7.3 Food / Athlete / Progress / Explore
- Food: complete nutrient coverage with `known + partial + unknown`; macro & micronutrient options selected by actual source; nutrient forms and supplement totals; no unknown deficit counting.
- Athlete: actual session plan/performance/recovery, progression/soreness/ability and stable exercise source units; integrate sleep/meal availability without genotype-based muscle rankings.
- Progress: within-person measured outcome trajectory, relevant confounders, action start/stop, adverse observations, meaningful range/baseline, no claimed causal effect without appropriate design.
- Explore: deeply researched genes, microbes, hormone peptides, food-molecule pathways, positive/negative studies, rank/strain and population scope, R&D simulations clearly distinct.

**No dead-end content:** no “gene helps process X” without enzyme/substrate/molecular role; no generic “research not available” paragraph stacks. Where knowledge limited provide short useful factual context and a clear unresolved-identity reason. Plain-language first layer; literature, method and raw source behind one disclosure.

### 7.4 Permissions and connection dashboard
- Exact source connection state (`connected`, `not connected`, `not supported`, `auth expired`, `permission partial`, `sync stale`, `provider unavailable`), what imported, last sync, data exclusions, original source view and export/delete.
- Never label an unsupported connection live. HealthKit/Health Connect require actual native capability; provide export/manual pathways in PWA.
- Offer consent per use: personal storage/analysis, external vendor processing, research simulation, cross-source correlation, notification, data export/sharing. No bundled consent to medical or research use.

## 8. Architecture and engineering contracts

**Reuse existing modules.** In-scope files inspected: `shared/meal-intelligence.ts`, `shared/nutrition-summary.ts`, `shared/precision-nutrition.ts`, `shared/genetics-catalogue.ts`, `shared/biology-content.ts`, `shared/functional-microbiome.ts`, `shared/goal-guidance.ts`, `server/food-catalog.ts`, `server/nutrition-targets.ts`, `server/ml-service.ts`, `NEXT_ACTIONS.md`. At the November 9 development snapshot there is an established source-linked journal, genetically bounded catalogue, lab source/assay safeguards, functional-science educational registry, optional secure Python adapter and emerging v0.6 nutrient/movement and action histories. **No full physiological optimizer, validated personal GLP-1, digital twin, native wearable connection or complete 2026 DRI engine is claimed implemented here.** Architect should re-scan later SHAs to avoid duplicate code.

**Suggested composable contracts** (do not duplicate existing source tables):

```ts
type EvidenceStatus = 'measured'|'device_estimate'|'provider_assessment'|'association'|'modeled'|'unverified'|'unavailable';
type ScientificClaim = {claimId:string; version:string; conceptId:string; populationScope:string; evidenceType:string; sources:{doi?:string;pmid?:string;url:string}[]; contradictions?:string[]; reviewState:'pending'|'approved_education'|'approved_wellness_action'|'research_only'|'disabled'; updatedAt:string;};
type BiologicalFinding = {id:string; systemId:string; title:string; evidenceStatus:EvidenceStatus; observationRefs:string[]; claimIds:string[]; inferenceLimit:string; recommendedNextData?:string; eligibility:'educational'|'wellness_action'|'research_only'|'blocked';};
type ActionProposal = {id:string; goalIds:string[]; reviewedActionId:string; inputSnapshotHash:string; sourceRefs:string[]; evidenceClaimIds:string[]; constraintsChecked:string[]; costs?:{timeMin?:number;budget?:number}; measureOutcome:{id:string;window:string;method:string}; alternatives:string[]; confidence:'supported'|'limited'|'insufficient'; abstentionReason?:string;};
type Experiment = {id:string; consentVersion:string; goalId:string; protocolId:string; baselineWindow:string; observationSchemaVersion:string; interventionStart:string; adherenceEvents:string[]; outcomeObservations:string[]; confounders:string[]; evidenceStatus:'descriptive'|'prospectively_replicated'|'research_only';};
```

**Service separation:** canonical Express/TS authority owns identity, eligibility, provenance, action ledger, persistence, consent; private optional Python optimization/simulation service receives minimised structured inputs, sends candidate solutions + model version and diagnostics, **never privileged writes**; TS revalidates; optional generation only summarizes grounded fields. Revision/invalidation cascade whenever source imported/corrected/deleted, age category, medications, pregnancy, goals, consent or scientific claim/retraction changes. Audit every displayed finding and action by claim/model/input and exact user decision.

**Data ingestion interface:** `(raw provider record → source snapshot → explicit mapper/provenance → typed canonical Observation → derived claim-bound view)`, idempotent, tenant-specific, versioned, resilient to partial failures. Deduplicate workout & lab records by provider original IDs/times/device/assay, not naive same-day rows. Never combine individual lab units without validated analyte mapping; distinguish FHIR LOINC+UCUM coding from free-text inference. External APIs optional and fall back to manual import.

**Sources in developer research:** USDA and CNF for food; Canadian DRIs; LOINC/UCUM/FHIR for labs; Apple HealthKit / Android Health Connect via native; provider integrations only when data, pricing, approval and license verified; genotype raw with true build/strand; Viome as provider-derived qualitative/score-specific records; metagenomics and proteomics only if actual specimen and methods support them.

## 9. Priority / dependencies / owner-ready backlog

| ID | Phase | Work and minimum exit | Priority |
|---|---|---|---|
| BOI-001 | 0 | Architect freeze scope, intended-use/features, baseline SHA, inventory current capabilities, health claims and data-rights; 1 shared contract | P0 |
| BOI-002 | 1 | Typed source observation + evidence/claim graph + missingness/capability/consent flags, history invalidation, unit tests | P0 |
| BOI-003 | 1 | Progressive onboarding, profile applicability, source consent and clinical/safety exclusions with minimal UI burden | P0 |
| BOI-004 | 1 | Food, supplements, micronutrients/DRI and FoodData/CNF source audit; missingness and exact form | P0 |
| BOI-005 | 1 | Activity/sleep/mood/symptoms/adherence context; device + manual sources, duplicate control, subjective vs objective | P0 |
| BOI-006 | 2 | Evidence library of reviewed nonclinical actions and contraindication-safe deterministic decision engine with abstention | P0 |
| BOI-007 | 2 | Biological Systems Explorer with observed versus possible versus unknown source-native facts, deep evidence | P1 |
| BOI-008 | 2 | My Opportunities & Today prioritized 1–3 options; clear constraints, time/cost/preferences; “choose, log, observe” | P0 |
| BOI-009 | 2 | Progress actions→outcomes, baseline windows, context/trend and explicit missing-data flags | P0 |
| BOI-010 | 3 | Optional HealthKit/Health Connect native bridge, device/provider/permission lifecycle; PWA fallback | P1 |
| BOI-011 | 3 | Bounded response experiments, baseline/replication/confounder controls, research and wellness separation | P1 |
| BOI-012 | 3 | Python constrained optimization benchmark vs deterministic with hard TS pre/post checks and de-risked fallback | P1 |
| BOI-013 | 4 | Modelled microbiome gene→reaction→metabolite, hormones & receptors; synthetic calibrated research only | P1 R&D |
| BOI-014 | 4 | Hormone/peptide education plus optional strictly validated specialist assay data, no inferred efficiency scores | P1 |
| BOI-015 | 4 | User-response ML shadow evaluation + preregistered prospective lift/fairness/abstention; separately gate | P2 |
| BOI-016 | all | Consent/revocation, cross-tenant isolation, age/pregnancy/medication clinical boundaries, encrypted source access | P0 |
| BOI-017 | all | Scientific review log & contradiction/retraction/version invalidation; explainability + observed-claim review | P0 |
| BOI-018 | all | Independent novice/device/keyboard/mobile and objective use/outcome testing, held-out external data | P0 |

**Dependencies:** 001 → 002/003 → 004/005 → 006 → 007–009; 010 and 014 optional; 011 requires 005/009; 012 requires 004/006/008; 013 can start R&D alongside 004–012 on synthetic data but cannot authorize personal action; 015 requires repeated consented outcomes and preregistered evaluation. No needless science feature gating of canonical everyday guidance. Continue approved independent v0.6 work in parallel; respect Architect control of developer directions.

## 10. Acceptance matrix (minimum)

1. A new adult with only goals and food allergies gets an explainable useful action, no DNA/microbiome/lab requirement.
2. Missing nutrient in a food is *unknown*, not zero and never yields a fabricated gap.
3. DRI below AI is not categorized as diagnosed deficiency; user has optional intake completeness action.
4. Supplement scheduled but not confirmed taken does not contribute to consumed totals; forms/UL checks apply to actual records.
5. No recommendation conflicts with recorded allergy, dietary exclusion, pregnant/lactating state, known contraindication or clinician-set restriction.
6. A qualitative Viome taxon or provider score never becomes abundance, strain, metabolite flux, GLP-1 value or clinical diagnosis.
7. Valid variant allele, unphased pair and missing genotype do not produce false status/phenotype; gene action requires genotype+claim-specific evidence.
8. Genetic data consent revoked => no further personalized genetic features, source-derived caches invalidated and deletion/export policy honored.
9. Apple HealthKit/Health Connect shown not connected unless native permitted bridge and exact data type authorized; CSV fallback usable.
10. Wearable sleep stages and expenditure clearly marked estimates, no fabricated 'recovery efficiency'.
11. Multiple device duplicate steps/workouts do not double count; conflicting source rows receive review.
12. Missing collection method or assay disallows mixed lab trends and source reference claims; verify 25OH D vs 1,25(OH)2 D, time and original units.
13. CGM meal data do not result in inferred insulin resistance or measured GLP-1 secretion; no glycaemic diagnosis without authorized clinical feature.
14. User-selected action does not count as eaten/performed until receipt; retry no duplicate.
15. Changing weight, medications, exercise baseline or goals invalidates affected plans; old historical observations remain.
16. Two-account simultaneous imports/deletions/exports never disclose personal sources or stale personalized advice.
17. Python down or model uncertain => deterministic baseline intact; no invented ML score.
18. User can see why a suggestion was made, exact data used, evidence, alternatives and how to decide if it helped.
19. Research-only molecular pathway produces no user-specific numerical flux/therapy or food rank change.
20. N-of-1 single-meal observation cannot assert causation; limited sample/confounders/changed medications trigger abstention.
21. Older users, accessibility, mobility limitations and no-device users can complete same core wellness journey.
22. Host/food source rights/claim intent/clinical-review disabled entitlements verified before any external research or public feature activation.
23. Explicitly verify user comprehension that ‘possible constraint’ is a hypothesis, not a diagnosis.
24. A system with no observed problem can show 'no identified constraint' rather than invent a new optimization target.
25. Validate published model improves held-out real outcomes and user task burden relative to baseline before enabling personal response ML.

## 11. Scientific and operational governance

**Evidence registry review:** NIH/Health Canada/major clinical statements and high-quality human trials first for actions; observational/metagenomic studies for hypotheses; source records immutable. Reviewer must record positive and null studies and whether observed benefits are outcomes relevant to user goals; PMID/DOI actually resolves to cited claim and method.

**Product intended use:** helps adults explore nutrition, physical activity, sleep and recovery opportunities aligned to goals; records personal observations; does not diagnose, treat or manage disease. This is a proposed intended-use boundary, not an automatic legal classification. Clinical risk scoring, PGx, endocrine treatment, abnormal lab diagnosis and disease-specific personal interventions separately disabled by default until Legal/medical review and regulatory assessment.

**Privacy:** health/genomic data explicit purposes and granular opt-in, least data/retention, encrypted transport and controlled at-rest access, scoped vendor processing, no data sale/ads, storage location/transfers, account isolation, consent revocation, immutable correction audit vs deletion, user export, source erasure and backup lifecycle; report true backup/vendor limitations. No unapproved raw DNA/stool/labs sent to LLMs. High-level wellness and sensitive research consent isolated.

**Product metrics:** weekly active *meaningful actions*, food logging completeness and effort, personalization source coverage, permission/data freshness, objective adherence and 4–12 week measurable outcomes where appropriate, trust/comprehension, adverse-effect and over-recommendation reports, proportion of relevant suggestions declined, abstention correctness, science claim remediation time; not number of pathways counted or forced “optimization score.”

## 12. External source and evidence register

- [R01] AHA Life's Essential 8 (2025): https://newsroom.heart.org/facts/life-s-essential-8
- [R02] AHA Dietary Guidance (2026): https://professional.heart.org/en/science-news/2026-dietary-guidance-to-improve-cardiovascular-health/top-things-to-know
- [R03] 2026 ACC Exercise Scientific Statement: https://www.jacc.org/doi/full/10.1016/j.jacc.2026.09.008
- [R04] Berry et al., PREDICT1 (2020): https://www.nature.com/articles/s41591-020-0934-0
- [R05] Personalized nutrition 2026 systematic meta-analysis: https://link.springer.com/article/10.1186/s12986-026-01130-3
- [R06] ZOE METHOD 2024 RCT: https://www.nature.com/articles/s41591-024-02951-6
- [R07] International Microbiome Testing Consensus 2025: https://pmc.ncbi.nlm.nih.gov/articles/PMC12343204/
- [R08] 2026 HRV rigor and reproducibility guidance: https://journals.physiology.org/doi/full/10.1152/ajpheart.00041.2026
- [R09] 2025 mixed meal tolerance test assay considerations: https://www.nature.com/articles/s41366-025-01866-7
- [R10] Health Canada DRIs: https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables.html
- [R11] Health Canada DRI assessment: https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/assessment-summary.html
- [R12] Health Canada SaMD scope: https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/application-information/guidance-documents/software-medical-device-guidance-document.html
- [R13] Apple HealthKit overview: https://developer.apple.com/documentation/healthkit
- [R14] Android Health Connect data types: https://developer.android.com/health-and-fitness/health-connect/data-types
- [R15] HL7 FHIR US Core laboratory observation data: https://www.hl7.org/fhir/us/core/STU3.1.1/StructureDefinition-us-core-observation-lab.html
- [R16] 2026 AHA dyslipidemia guideline: https://www.jacc.org/doi/10.1016/j.jacc.2025.11.016
- [R17] 2025 wearable nocturnal HR/HRV validation: https://pubmed.ncbi.nlm.nih.gov/40834291/

*Publication status:* This document is an engineering/scientific proposal based on inspected repository components and external research, not evidence that the full architecture is shipped, clinically validated or clinically approved.