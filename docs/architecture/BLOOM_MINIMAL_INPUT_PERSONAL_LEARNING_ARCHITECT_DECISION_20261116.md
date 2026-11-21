# Bloom — Intelligent Minimal-Input Experience, Progressive Personal Learning & Biological Intelligence

**Chief Architect consolidated implementation handoff**  
**Owner directive:** 2026-11-16  
**Status:** ARCHITECT APPROVED / VERSIONED IMPLEMENTATION REQUIREMENTS; no application code/deployment or scientific validation inferred  
**Codex implementation:** existing authorized branch `enhance/bloom-experience` per `AGENTS.md` and `NEXT_ACTIONS.md`; no new queue or owner approval gate  
**Scope:** Today, Food, Activity, Symptoms, Bloodwork, Biology, Explore, Progress, Athlete and later Apple-native iOS  
**Relationship:** Reconciles owner 19-section directive with existing v0.6 Core, v0.7 Generalized Biological Intelligence, adaptive guidance, private longitudinal learning, scientific evidence/action gates, source invalidation and scientific computing infrastructure.

## 1. Binding objective

**Bloom should become more knowledgeable about an individual over time and less demanding to use.** A familiar task should require less effort while still preserving actual observations, estimated quantities, uncertainty, original provider information, user choices and corrections.

The owner requires **one continuous intelligence lifecycle**, not separate food, exercise, symptom and biology AI platforms:

```text
Minimal input → reuse authorized known context → compare available observations
→ method-supported calculation or qualified estimate (or unknown)
→ context-appropriate personal calibration if reliable
→ source/uncertainty/constraint checks → useful, low-friction presentation
→ explicit accept/correct/complete input → source-faithful record + feedback
→ revision-dependent re-evaluation → refreshed eligible insight/action
```

Never require a wearable, DNA, full microbiome panel, comprehensive bloodwork, AI key or an advanced model for normal useful Core workflows. No invented measurements, zeros for unknown, hidden changes to originals, auto-consumed planned meals, auto-completed proposed exercise, unsupported causal outcomes, clinical/treatment effects, or personal microbiome metabolite production claims. Do not introduce a chatbot as the engine.

## 2. Current source audit and contract reuse

**Read-only source inspection:** `shared/meal-intelligence.ts`, `shared/wellness-actions.ts`, `shared/today-focus.ts`, `shared/lab-history.ts`, `shared/health-ingestion.ts`, `shared/health-reconciliation.ts`, `shared/experience.ts`, `shared/activity.ts`, `shared/goal-guidance.ts`, `shared/scientific-contracts.ts`, `shared/biological-model.ts`, current `NEXT_ACTIONS.md`, `AGENTS.md`. The search identified `client/src/components/ActivityReview.tsx`, `client/src/components/DeviceObservations.tsx`, existing check-in QA and captured source corrections.

| Domain / related contract | Disposition | What Codex must do |
|---|---|---|
| Canonical food, meal source, portion, preference and plan/save | **Existing foundation; full Food #12 acceptance remains open** | Reuse existing exact source and nutrient calculation; add usual/recent/favorite meal defaults and source-aware quantity suggestions where missing; never build separate Food engine |
| Activity journal, structured review, health-device observation/reconciliation | **Existing; end-to-end minimal steps-only + calibrated metrics not verified** | Reuse `shared/experience.ts`, `shared/activity.ts`, `shared/health-ingestion.ts`, `shared/health-reconciliation.ts`; honor completed vs proposed/source and overlap semantics |
| Lab identity, units, dates, trend comparability | **Existing foundation; full report Response #15 still partial** | Preserve source and old charts; reuse comparability for eligible descriptive observations; no parallel lab interpretation engine |
| Wellness choices, goals, Today and cross-domain priorities | **Existing deterministic/action foundation** | Reuse existing choice/priority authority; descriptive personal learning cannot authorize new biological claims |
| Check-in/symptom source events | **Some entry/QA infrastructure existing** | Add minimal check-in interactions as bounded UX slices; missing event is unknown, not a negative |
| Derived quantities and general-purpose estimator method registry | **Not verified as unified implementation** | Introduce smallest interoperable derived projection/method registry only where existing source contracts lack origin/method/dependency/uncertainty |
| Private personal calibration by context and baseline comparisons | **Partially planned, generalized lifecycle not verified** | Keep in existing account-scoped feedback/longitudinal domain; bounded first demonstrations; general v0.7 learning |
| Source revision invalidation and asynchronous publication safety | **Canonical foundation exists; generic dependency closure unverified** | Integrate `BLOOM_SCIENTIFIC_COMPUTING_INFRASTRUCTURE_ARCHITECT_DECISION_20261116.md`; no parallel scheduler or unchecked writer |
| Generalized associations and complex optimization | **v0.7 / advanced restricted** | Integrate `BLOOM_GENERALIZED_BIOLOGICAL_INTELLIGENCE_ARCHITECT_DECISION_20261116.md` and approved actions; don't classify user correlation as causal or clinical |

**Status convention:** source scaffold ≠ implemented ≠ engineering-tested ≠ hosted ≠ independently validated. Codex must inspect current HEAD and actual tests/receipts before coding; don't redo proven work.

## 3. Universal minimal-input and estimate-or-ask policy

Before prompting a user for any field, resolve:
1. Already explicitly reported in the current task? Already in Profile, saved preferences, owned history or confirmed recurring context?
2. Authorized connected observation available with valid provenance/consent and relevant timeframe?
3. Exact reproducible calculation possible from credible compatible inputs?
4. Context-appropriate personally calibrated model supported by genuine independent observations and eligibility thresholds?
5. Reviewed general model appropriate for intended low-risk use and input quality?
6. Would a further answer meaningfully change the immediate decision enough to justify burden?
7. Otherwise retain **unknown** and still complete whatever safe useful work is possible.

**Method selection must consider accuracy, applicability, recency, confidence source, and user override—not a universal source-type ranking.** A connected device estimate is still an estimate. An explicit user correction can override display/log defaults without magically transforming it into an objective physiological measurement. User-provided derived/corrected figures retain their origin and audit.

A reusable **ask/estimate/abstain selector** can run in an existing TypeScript service; avoid duplicating it in each form or creating an always-running AI agent. Default: at most one highest-information-value question at a time, and only where a question is worth the extra effort.

## 4. Source/origin model and derived quantities — preserve owner code with required mapping

Source types are **measured**, **user-reported**, **calculated**, **source-estimated**, **bloom-estimated**, **inferred**, **unknown**. They describe **data origin**, distinct from the scientific evidence/claim authority taxonomy. `inferred` means an observation interpretation/hypothesis, not an eligible numeric derived quantity.

**Owner supplied conceptual contract (retained, with amendment notes below):**
```ts
type DerivedQuantity = {
  metricId: string;
  value: number | null;
  unit: string;
  origin:
    | "measured" | "user-reported" | "calculated"
    | "source-estimated" | "bloom-estimated" | "unknown";
  sourceIds: string[];
  sourceRevisions: string[];
  methodId: string | null;
  methodVersion: string | null;
  assumptions: Array<{
    field: string;
    value: string | number | null;
    source: string;
  }>;
  uncertainty: {
    kind: "interval" | "category" | "unquantified" | "not-applicable";
    lower?: number;
    upper?: number;
    explanation?: string;
  };
  eventStart: string | null;
  eventEnd: string | null;
  calculatedAt: string;
  stale: boolean;
  reviewStatus: "not-required" | "optional" | "needed";
};
```

**Architect refinements for implementation:** Do not store original measured/user-reported records as if they were cloned estimates; distinguish a canonical source reference from a derived projection. Use existing source+revision identity, verified account scope derived on server, event intervals/timezone uncertainty, unit/assay/method validation, input dependency IDs and fingerprints. Null means no valid value; no invented lower/upper bounds or numerical reliability percentages. Add review/explicit user correction and staleness receipts via existing domain services. Versions and source dependencies must be able to retract results. `inferred` lives in existing finding/scientific claims, not the numeric `DerivedQuantity` origin union.

## 5. Reusable versioned estimation methods (owner contract retained)

```ts
interface EstimationMethod<Input, Output> {
  id: string;
  version: string;
  supports(input: Input): boolean;
  estimate(input: Input): {
    quantity: Output | null;
    assumptions: string[];
    sourceIds: string[];
    uncertainty: unknown;
    abstentionReason?: string;
  };
}
```

**Engineering amendments:** `supports` is a method-specific executable eligibility check, not a promise based on registry metadata; use schema-validated input, bounded resource costs, restricted output domains and explicit confidence/uncertainty semantics. Include source/revision/method/parameter fingerprints in internal result, and typed reason codes for absent/unsafe estimates. Use real numerical baselines and independent benchmarks for each estimator. Register only scientifically reviewed, intended-use-eligible estimators; no general model-generated numeric effects.

Low-cost deterministic calculations should execute in existing TypeScript. Python is for independently justified advanced numerical methods; use the previously accepted durable-job and release gates for asynchronous workloads.

## 6. Account-private progressive calibration (owner contract retained)

**Stages:** A) population prior → B) relevant personal context → C) repeated comparable personal patterns → D) calibration using independent paired reference observations → E) error/drift monitoring, staleness and fallback. None implies every metric becomes personally calibratable.

```ts
type PersonalCalibration = {
  metricId: string;
  contextKey: string;
  methodId: string;
  methodVersion: string;
  parameters: Record<string, number>;
  supportingObservationIds: string[];
  supportingSourceRevisions: string[];
  calibrationStatus:
    | "population" | "contextual" | "pattern-learned"
    | "individually-calibrated" | "stale" | "insufficient-data";
  sampleCount: number;
  effectiveSampleSize?: number;
  uncertaintyMethod?: string;
  errorMetrics?: Record<string, number>;
  calibratedAt: string;
  lastEvaluatedAt: string;
  userOverride: boolean;
};
```

**Architect refinements:** Server-derived owner/consent, strict versioned context schema, actual observation ancestry, provenance of independent labels and method lineage, error measures with sample sufficiency, held-out/forward-time checks where possible, drift detection, reset and correction visibility. Status is a reproducible method outcome, not a casual number-of-records threshold. One correction isn't necessarily a stable habitual pattern. Explicit user overrides persist until deliberately revised/reset. Do not train a learned parameter on its own estimated outputs or downstream derived values from the same source lineage; perform a dependency ancestry check. Device energy estimate can be a calibration *target for agreement with that device*, not a validation of true caloric expenditure.

Corrections must preserve original source history and the corrected context. Dependent estimates and findings update on source revisions; unrelated branches remain stable; eventual wearable import may supersede less reliable predictions but not erase user events or duplicate totals. No cross-user learning, pooling or shared training.

## 7. Walking/activity reference implementation

**Low-friction input:** steps alone, activity type + duration, distance + time, completed workout, supported imported source, explicitly user-reported calorie figure. Reuse existing weight and relevant user context subject to recency/units and appropriate estimation needs. Everyday Activity remains simpler than Athlete detailed training. Save original partial entries as such.

**Correctness:** Steps/time => cadence; steps + independently measured distance => step-distance calibration; distance/time => observed average pace/speed (with correct elapsed vs moving time); neither step count nor time alone measures stride length. As an illustration, 10,000 steps over 60–90 minutes is approximately 111–167 steps/min **only for those example sessions**; not an established universal person-specific range. No fake distance, calorie, session time, or daily total.

**Owner-supplied conventional energy approximations (retained):**
```ts
// Approximate conventional MET-based energy formulae; not a measurement.
// kcal ≈ MET × bodyMassKg × durationHours
// active kcal ≈ (MET - 1) × bodyMassKg × durationHours
```
The formulas are eligible only with appropriate activity-intensity mapping, weight/time reliability, source version and a clear assumption about 1 MET / resting energy approximations. Distinguish *gross session* from *above-rest activity* energy, daily active energy and total daily expenditure. Do not infer exact calorie deficit or use device calories as ground-truth energy without direct validation.

**Reconciliation:** watch/phone step overlaps, Peloton/Apple Health session overlap, overlapping manual entries, daily/activity aggregates, duplicate provider imports. Preserve originals but use source identity/interval precedence and existing reconciliation rules to avoid double-counting. User correction not silently overwritten; HealthKit is future native and observer delivery not continuous real-time.

## 8. Food, symptoms and adaptive decisions

**Food #12 priority:** Recent, favourites, usual confirmed meals, repeat previous meal, candidate food match, brand/product, quick portion adjust, recipe-ingredient suggestions and substitutions within existing source catalogs. A saved or proposed meal is **not** evidence of consumption. Confirm intake explicitly. Learn user-confirmed recurring portions/preparation/substitutions only in suitable context; repeated correction can set contextual defaults; avoid imposing one correction globally. Unknown micronutrients remain unknown, allergens/exclusions are hard vetoes, candidate match and nutrient source are independently distinguished. Ask one high-impact clarification rather than every missing seasoning mass.

**Symptom/check-in:** Quick Better / Usual / Worse / Skip for digestion or another relevant user-chosen concern; details optional, existing event schema/source identity retained; skipped day is not absence of symptom. Learn recurrence/timing and preferred terminology but not inferred causation or a medical diagnosis. User should be able to inspect/correct historical records.

**Today/BOI/Response:** Use existing Cross-Domain Priority Intelligence, `shared/wellness-actions.ts`, `shared/today-focus.ts`, `shared/goal-guidance.ts`, Food and Response #15 sources. Main view typically one eligible primary action and a few coherent secondary insights, not one message per lab marker/organism. Source-specific safety, evidence eligibility, multiple-goal tradeoffs and actual feasibility are *gates*, not an undifferentiated statistical score. Dismissal teaches preference/practicality, not scientific effect; accepting an action does not mean performed. No weak personal correlation becomes an approved intervention.

**Science education:** Layer 1 immediate meaning and relevant action; Layer 2 measured changes/context/uncertainty/tradeoffs; Layer 3 genes, organisms, pathways, studies, mechanisms and source evidence on explicit exploration. Preserve the owner-approved Bloodwork latest → existing chart/history → two always-visible concise *What is it?* and *Why does it matter?* primer → optional depth. Never hide critical validated risk warnings or falsify claims to reduce words.

## 9. Adaptive UX preservation and native boundary

Follow `BLOOM_ADAPTIVE_MOBILE_DESKTOP_EXPERIENCE_ARCHITECT_DECISION_20261116.md` and `BLOOM_CROSS_PAGE_VISUAL_PRESERVATION_AND_ASSET_ADDITION_POLICY_20261116.md`. **Owner primarily reviews by phone; existing mobile Biology, Bloodwork and Microbiome presentation is a protected baseline** except explicit separately authorized mobile changes and necessary correctness/security/accessibility fixes. Improve desktop compositions intentionally without cloning business logic, replacing existing art/charts, or changing mobile as a side effect. New large art: truthful reserved placeholder + canonical registry request; suitable small supporting assets may be created additively by Codex.

Preserve purposeful desktop/tablet/mobile input and content parity; 320/390/768/1024/1440 px, themes, zoom, pointer/touch/keyboard, accessible text, source details and precise corrections. Future native SwiftUI is separate UI using canonical backend and science contracts, not React port/duplicate intelligence stack.

## 10. Source dependence and compute architecture

Origin and calibration outputs depend on the **exact canonical source revisions**. Source correction, delete, consent or claim version change:
- promptly invalidates only dependent estimates, personal models, findings and action projections;
- safely recomputes only eligible affected work; no unrelated full-account model reruns;
- cancels/supersedes stale background jobs and prevents old publication;
- preserves source record/audit and user override semantics; account isolation at reads, compute, caches and writes;
- rechecks current source/evidence/consent/lease/eligibility atomically before publication per `BLOOM_SCIENTIFIC_COMPUTING_INFRASTRUCTURE_ARCHITECT_DECISION_20261116.md`.

Deterministic high-value quick calculations must remain interactive and available without Python. More expensive v0.7 methods use bounded registered models and durable processing as needed. Do not duplicate the biological knowledge graph, evidence authority, nutritional DB, Food optimizer, auth/consent manager or recommendation registry.

## 11. Required acceptance inventory — owner IDs retained

The full owner directive controls all individual test IDs. The grouped text below is an **index**, not a reduction in acceptance coverage. Codex must maintain the exact named IDs and test evidence, with unimplemented stages explicitly `NOT_TESTED` rather than PASS.

| Group | Mandatory acceptance |
|---|---|
| General estimation | EST-01..08: supported missing-input estimate; safe unknown/clarification; source-vs-derived separation; method+source lineage; easy persistent correction; no self-validation; dependency recalculation; unaffected derivations stable |
| Personal calibration | CAL-01..15: baseline first; paired observed patterns; cadence ≠ stride; independent distance for step calibration; drift refresh; dedup; food correction learning; baseline fallback; wearables reconciliation; deletion; tenant isolation; reusable lifecycle; overrides; inspect/reset; held-out model-vs-baseline |
| Activity | ACT-01..09: steps-only; duration/type; reuse weight; stale profile; active-vs-total kcal; overlapping sources; device/manual reconciliation; preserved corrections; abstain unsupported |
| Food | FOOD-01..08: usual meals; contextual portions; products/recipes corrections; unknown micronutrients; chosen ≠ consumed; targeted clarifications; recalc; restrictions |
| Symptoms | SYM-01..05: one-tap check-in; optional detail; no causal claims; no fabricated observations; missing ≠ no symptoms |
| Insights | INS-01..07: 40+ lab rows concise prioritized; 80+ taxa uncluttered; full history available; grouped findings; weak hypotheses below strong evidence; goal/conflict-aware; works with absent domains |
| Education | EDU-01..06: novice clarity; depth on demand; citations/method available; concise uncertainty; origin distinguishability; original artwork unchanged |
| Security | SEC-01..05: tenant; revocation; deletion; stale-job publish gate; no shared population model learning |
| UX | UX-01..06: adapted device layouts; estimate correction in both; keyboard/touch/AT; zoom; scientific details available; no connected device needed |

**Cross-domain synthetic fixtures:**
1. **Walking minimal-input:** steps-only; no observed duration/distance fabricated. Add actual 10k steps+time sessions, cadence becomes calculated/personal-pattern; add **independently** recorded distance and demonstrate calibrated step estimate with held-out error vs general prior. Inject same source twice and prove no confidence inflation. Remove paired distance and demonstrate model falls back.
2. **Food usual-breakfast:** repeated confirmed oatmeal/milk/blueberries with known ingredient portions, reusable usual meal and contextual defaults, material portion correction triggers improved suggestion; unconfirmed proposed meal never logged consumed; missing zinc/B12/etc remains unknown; allergies/exclusions veto.
3. **Device merge:** manual walk, phone steps, Apple Health/Peloton duplicate/overlap, one event included in summary where appropriate; preserve each original record and explicit source energy type, revocation triggers source-dependent fallback.
4. **Symptoms:** digestion Better/Usual/Worse/Skip, optional details, absent day unknown; temporal co-occurrence never labelled caused.
5. **Large sources:** synthetic 40+ analyte lab panel and 80+ organism microbiome report produce concise, deduplicated actionable *qualified* highlights with full history/drilldown; no clinical or metabolite inventing.
6. **Two accounts + racing worker:** correction, deletion and consent withdrawal during calibration/association job; no stale publication, cross-user leakage, duplicate action effect or cross-account model parameters.
7. **Privacy/UX:** no device/biology data present, user can still log and receive safe goals-based suggestions; mobile 390 remains owner-approved while desktop 1440 gains intentional composition; accessible correction/reset/reasoning; no existing art asset replaced.

**Performance and real user value:** Establish actual baseline for meal logging, ordinary activity, symptom check-in, mandatory interaction count, useful-question rate, number of estimate corrections, calibration held-out error vs baseline, double-count rate, time to find salient lab/organism information, source/citation navigation and feasible action completion. Select thresholds from appropriate representative tested tasks—not invented universal targets. A fast but inaccurate app fails; a safe app asking needless questions also fails. Track requested vs completed actions separately.

## 12. Delivery slicing, existing work priorities

| Slice | Accepted and required | Boundary |
|---|---|---|
| **v0.6 C0 foundation** | True origin/source distinction where touched; unknown/zero separation; correction/revision and safety; small no-friction choose/ask/abstain orchestration reused through existing services | Not a new universal data store or expensive model |
| **v0.6 Food #12 (P0)** | Recent/repeat/usual meal, source-specific portions and label fidelity, editable quantities, review/save vs consumed, minimal questions, user preferences | Do not delay complete sourced dinner/meal journey for advanced calibration |
| **v0.6 Response #15 (P0)** | Report-wide cross-marker grounded priorities, source comparability, chart/source/educational depth without clutter | No new clinical diagnoses or experimental causal estimates |
| **v0.6 Activity/Symptoms/Today (bounded)** | Fast capture with source fidelity, cadence/speed deterministic math and safe optional reviewed MET estimate, lightweight symptom check-in, one safe useful Today action | Walking/portion calibration pilot **only if** it doesn't displace C1/C2 |
| **v0.7 private learning** | Versioned general estimation/calibration method registry, context-specific learning/held-out validation, controlled revisions, new estimators, selected meaningful longitudinal associations | No repeated invented outcome, uncontrolled broad AI, population training |
| **Advanced** | Appropriate research-only host–microbe, mechanisms, sophisticated causal model, external scientific models with method/rights/consent gate | No automatic personalized metabolite flux or treatment response |

**Codex sequencing:** `NEXT_ACTIONS.md` owns active work and current Core/critical fixes. This handoff is a binding functional standard on touched screens, not a second competing work queue or request to pause current source-range work. Before each slice Codex checks current HEAD/test evidence and selects minimal deltas; preserve already completed work. Scope new features in v0.7 unless explicit owner requirement qualifies as refinement of existing v0.6 acceptance.

## 13. Responsible specialist review and release

- **Architect:** reconcile scientific and UX architecture, eliminate duplicate engines and classify current capability vs release.
- **Nutrition/Biology:** approve individual estimate domains and model assumptions, source applicability, health consequences, reviewed marker education and nutrition rules.
- **Science/ML:** method eligibility/calibration error, effective independent sample size, leakage and held-out tests; test against simple baselines.
- **Integrations:** canonical observation identity, overlaps, import revisions, background invalidation.
- **Security/Privacy:** purpose/consent, two-account isolation, deletion, stored learned preference/model lifecycle, privacy-minimized telemetry.
- **UX/User Testing:** minimal input decision value, comprehension, correction/reset, time/interaction baseline; mobile preservation/desktop improvements.
- **Codex:** code, unit/integration/hosted tests, exact SHA evidence; do not independently authorize medical claims.

**Statuses separately recorded:** owner requirements approved; code present; source acquired; rights cleared; engineering-tested; deployed/exact SHA verified; method scientifically validated; independently UAT/security tested; release eligible. None may be inferred from this document alone.

## 14. Final definition of done

A person can provide minimal information; Bloom uses what it already knows; calculates or responsibly estimates what it can; asks only necessary clarifications; learns confirmed contexts/paired independent observations with explicit provenance; corrects and resets easily; avoids duplicate provider records; prioritizes supported decisions across numerous biology observations; reveals rich science on demand; and remains usable without connected devices or complete omics. All changes are source-revision/consent-safe and account-private. No estimate is ever recycled as independent proof of itself.

**Governing product standard:** The complexity belongs in Bloom’s intelligence. Clarity, control, scientific honesty and practical benefit belong to the user.
