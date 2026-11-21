# Bloom — Consumer Experience Acceptance & Four-Contract Integration
**Owner-directed Codex design handoff | 2026-11-21 | Design specification, NOT implementation evidence**

## 0. Decision, authority, and boundaries

Bloom must feel like a useful, low-effort health companion: clear first-session value without labs/devices, one meaningful consideration when independently eligible, no manufactured urgency, reliable quick capture, and understandable source-grounded science on demand. This handoff translates previously discussed TIME-01 (timing), RCV-01 (laboratory serial variation), ACTION-01 (decision and delivery), and INPUT-01 (capture) into **consumer behaviours and testable acceptance**, not four new engines or a general UI rewrite.

**Authority:** read `AGENTS.md` then `NEXT_ACTIONS.md`. Their P0 integrity → P1 biological investigation/INV-04/INV-05/INV-HELDOUT-01/INV-AI-DEDUCE-01 → P2 verified durable science → P3 consumer/source integration → P4 deferred sequence is unchanged. This specification is an **existing P3 consumer acceptance gate** with narrowly eligible earlier P0/P1 data-integrity and friction fixes. Do not advance a consumer release, claim scientific qualification, create a parallel queue, replace higher-priority science, or turn sketches below into a mandate for a new recommendation service. Continue approved work when this UX work is blocked.

**No-go:** paused Render/Mac integration, unapproved external private-health transfer/providers, new account data stores/parallel evidence graphs, unreviewed clinical actions, fabricated health scores, blanket notifications, medical diagnoses, source-free personalization, and mandatory comprehensive intake. Existing owner rule against routine before/after screenshots remains in force; verify UI function/accessibility/responsiveness with concise text receipts instead.

**Status provenance:** The current branch has `shared/experience.ts` activity, activity-routine, checkin, supplement-intake, meal-template and experiment schemas; `client/src/pages/PrecisionNutrition.tsx` uses `TodayPlanner` and check-in components; `client/src/pages/Progress.tsx` handles labs/activity/progress and legacy lab links; `client/src/pages/Insights.tsx` has a separate recommendations query; `server/biological-investigation-snapshot.ts` currently retains lab, food and confirmed supplement facts and marks activity `not-collected`. `shared/scientific-contracts.ts`, `server/investigation-candidate-admission.ts` and `shared/recorded-intake-sources.ts` are foundations, **not proof** of unified recommendation, full TIME-01, RCV or released UX. Check current HEAD and existing tests before design-to-code decisions; do not infer a `Today.tsx` page exists.

## 0A. Scope audit amendment — mandatory anti-overbuild interpretation (2026-11-21)

**This section controls how Codex interprets all later examples, UX states, H0–H4 labels and test journeys.** They are behavioural acceptance examples **when the underlying approved feature is implemented or touched**, not ten new feature epics, four new modules, new API products or permission to implement every hypothetical field. If an existing screen already safely meets a scenario, document **REUSE / NO CHANGE** and move on. If a feature lacks independently reviewed scientific/safety admission or a source store, document **DEFER / BLOCKED** rather than fabricate a component to make the UX fixture green.

### 0A.1 Verified reuse and non-duplication baseline (recheck at current HEAD)

| Existing code | What it already covers | Do NOT build merely for this handoff |
| --- | --- | --- |
| `client/src/components/TodayPlanner.tsx` | Daily meal planner, saved preferences/targets, loading/error with explicit retry, planned ≠ consumed messaging | Another day planner, duplicate meal-choice engine, generic Today recommendation runtime, or a second fetch/retry state machine |
| `client/src/pages/Progress.tsx`, `client/src/pages/PrecisionNutrition.tsx` | Dated check-ins, source-qualified lab histories/trends, missing/pending/source-only distinction, lab detail and legacy deep links | Parallel laboratory dashboard, new history database, second chart framework, duplicate source review/edit controls |
| `client/src/pages/Insights.tsx` | Legacy experimental analysis, separate `/api/health/recommendations/:userId` path, and **three-meal prerequisite for that particular analysis** | Treat legacy food suggestions/health scores as scientifically admitted recommendations; silently wire these to ACTION-01; remove the analysis prerequisite or fake results for zero-data users |
| `shared/experience.ts`, `shared/recorded-intake-sources.ts` | Activity/routines, check-ins, confirmed supplement data, meal templates, source-conscious intake | Universal event store, six new capture subsystems, new medication/symptom databases before a concrete approved use case, or implicit adherence |
| `shared/scientific-contracts.ts`, `server/investigation-candidate-admission.ts`, `server/biological-investigation-snapshot.ts` | Existing candidate contract, source/evidence admission and account-scoped private read-only snapshot/epoch controls; activity currently `not-collected` **in this snapshot** | Separate candidate engine, duplicate evidence graph, new safety authorization system, second chronological database or global health-score engine |

**Critical distinctions:** The existing **meal-planning alternatives** are not four competing proactive clinical/wellness recommendations; multiple recipe choices may remain available inside their meal-planning task. Legacy Insights experimental estimates are **not** authorized to be relabelled as validated personal biological scores or merged into an admitted action stream. The single-primary principle applies only to **admitted unsolicited non-safety wellness attention**, not to historical data, normal navigation, user-requested planning options, meal lists, existing source review or multiple independently reviewed safety notices. It is acceptable for Bloom to have no shared ACTION-01 display until the scientific admission and current-source lineage genuinely qualify.

### 0A.2 Build / reuse / defer decision gate

Before each proposed change Codex must answer **in its working receipt, not a separate approval ceremony**:

1. **Existing path?** Point to exact current file, route, endpoint, source and tests. If equivalent safe behaviour exists, **REUSE / NO CHANGE**.
2. **Active dependency?** State the presently unblocked P0/P1/P2/P3 queue item that actually needs it. If merely desirable from a design diagram, **DEFER** to current P3/P4 without implementation.
3. **Observable defect or measured friction?** Demonstrate a failing test, actual incompatible source state, or concrete consumer task breakdown. If none, do not expand code to satisfy theoretical completeness.
4. **Smallest reversible change?** Prefer a copy/state fix, existing selector/adapter, routing/link repair or narrow test over a new model, store, abstraction or page.
5. **Safety and science eligible?** If no approved evidence, clinical boundary or authorized source exists, show honest unavailable/educational content or **ABSTAIN**, not newly generated personal advice.
6. **Stop condition?** Once the bounded scenario passes and existing workflows remain intact, stop that slice and return to the highest-value eligible `NEXT_ACTIONS.md` task. Do not automatically begin the next H stage.

### 0A.3 Explicit non-requirements

The handoff does **not** require: implementing RCV across all biomarkers; creating a generic ACTION-01 orchestration service before there are multiple admitted consumer producers; building a new safety notification center; expanding subjective check-ins to a universal tracking API; shipping symptom or medication logging just because they appear in a six-row table; building new sleep/wearable integrations; making all four screens use an identical card; adding proactive push/digests; inventing clinical targets; creating multiple alternative layouts or mandatory screenshot receipts; writing one end-to-end browser suite per UX example; or reorganizing the UI/site navigation without a measured user-task problem.

**RCV handling:** If independently reviewed CV_A/CV_I and method eligibility are missing, RCV UI is **deferred**; existing measured trends, comparability caveats and source-review controls remain useful. The synthetic 205→210 example is a safety negative fixture, not an implementation order for a marker-specific feature.

**Sparse-data handling:** The legacy `Insights.tsx` three-meal analysis may correctly require those inputs. The product-wide first-run experience must remain welcoming and offer accessible general information or optional action **outside** that specific gated analysis. Avoid faking the experiment or rewriting the whole Insights page to make the prerequisite disappear.

**Feedback handling:** Do not add five new persistently stored feedback states just because five labels are listed in §2.2. Reuse existing response semantics or defer controls that need an independently reviewed feedback/revision contract. “Already doing this” is not consumption evidence.

**Safety handling:** Support multiple safety items **if and when reviewed eligible safety producers exist**; do not create emergency triage software or a safety-alert backend solely from this mock contract.

**Test handling:** UX-A..J are ten representative **cases**, not ten separately developed feature programmes. For each touched feature, run only applicable focused existing tests plus new negatives that prove the changed invariant; record `NOT_APPLICABLE / DEFERRED` for unreleased scientific features. Do not rerun every costly evaluation on each cosmetic change. Independent A/B/C remains the existing P1 gate, not a new UX test obligation.

### 0A.4 Product-quality review focused on existing UX

Specifically inspect `Insights.tsx` for experimentally derived “healthScores”, bacterial gaps, food claims and adherence/benefit wording. These are **candidate risks to audit**, not validated health scores or proof that advice is correct. Determine provenance, feature eligibility, existing disclaimers and whether they should be reworded, clearly labelled as experimental, gated or removed; do **not** replace them with a new scoring model. Similarly, `TodayPlanner` already fails closed when its current-context request fails; preserve that behaviour instead of duplicating it.

This anti-overbuild amendment narrows implementation interpretation. No previously committed source-integrity, privacy, independent-science, accessibility or reviewed safety requirement is waived.

## 0B. Physiological, life-stage and pre-analytical context — bounded four-contract amendment (2026-11-21)

**Acceptance refinement; NOT new infrastructure, scores, questionnaires or an independent workstream.** Incorporate this into INPUT-01, TIME-01, RCV-01, ACTION-01 and current consumer presentation **only when relevant to a verified P0/P1/P3 dependency**. Read current canonical schemas before a change. Existing `shared/precision-nutrition.ts` has `contextSchema.pregnancy`, conditions, medications, currentSupplements and lab-specific fasting/source entered date/time; `shared/experience.ts` already has activity, routines, dated check-ins and presentation units. The private investigation snapshot currently includes source-bound labs, food and confirmed supplements, optional genetics/microbiome and activity `not-collected`. **Do not clone these stores or assume any optional context is independently verified.**

### 0B.1 Four distinct lifecycles, not a universal tag array

| Category | Examples | Source/location | Scientific meaning |
| --- | --- | --- | --- |
| **Extended physiological state** | Pregnancy/postpartum, optional menstrual/life-stage context, menopause/perimenopause, HRT/TRT/contraception, intentional weight loss, shift-work schedule | Account-scoped self-report with source revision and actual or uncertain effective bounds; extend existing Health Context only where needed | A potentially relevant historical condition, **not** a clinically established diagnosis and never retroactively applied to older observations without valid bounds |
| **Time-bounded event/exposure** | Acute illness, infection symptom, injury/recovery, unusual intense exertion, start/stop/change of a medication or antibiotics, recent travel | Existing activity, medication or check-in source where compatible; store actual event bounds/unknowns | Candidate temporal explanation, **not** causation or proven actual medication ingestion |
| **Specimen-specific collection context** | Fasting, reported collection clock time, illness at collection, recent exercise, sample/preparation caveats | Exact laboratory record/report/specimen association with original-source accuracy and correction history | A **particular sample's** interpretation context; don't copy from today's profile or every report row |
| **Presentation preference** | Less prominent calorie/weight/macro targets, hide routine quantity totals | Existing versioned account display preferences | Presentation only; preserves canonical numbers, clinical limits, access to raw data and safety notifications |

Preserve `unknown`, `unreported`, `explicitly none`, `skipped` as distinguishable only where the source actually supports that choice. A user-asserted phrase does not establish disease, medication adherence or validated assay behavior. Menstrual/reproductive tracking is voluntary and **never triggered solely by age or recorded sex**. Use the approved condition-selector integration; no new reproductive dashboard or medication database.

### 0B.2 TIME-01 / RCV-01 distinction

TIME-01 preserves actual source precision, half-open intervals and uncertainty, checks what could precede a specimen and recognizes incomplete source coverage. Recorded timestamps alone never establish standardized overnight fasting, stable sleep, medication adherence, or actual circadian phase (especially for shift work/travel). Source corrections, consent withdrawal and policy revisions invalidate dependent private interpretations.

RCV-01 must keep **three independent assessments**: (A) method/statistical eligibility, assay comparability and reviewed applicable CV_A/CV_I, (B) applicability to current physiological/pre-analytical context, and (C) independently reviewed clinical/reference limits and longitudinal trend. **Do not globally fail RCV** because fasting, illness, exercise, pregnancy or medication has changed. Analyte- and method-appropriate reviewed evidence determines whether a factor makes the RCV model ineligible, qualifies interpretation, supplies a competing hypothesis, is immaterial, or remains unknown. RCV `does_not_exceed_rcv` does not reassure about an absolute abnormal value, and `exceeds_rcv` never proves a cause, diagnosis or stable change. Never add speculative adjustment multipliers or a medication × marker matrix.

### 0B.3 Mandatory Value-of-Information gate for proactive contextual questions (ACTION-01)

**Scientific eligibility is evaluated BEFORE questioning or consumer ranking.** If missing specimen/physiological context makes an asserted clinical/scientific conclusion unsupported, withhold that conclusion or express only the independently supportable qualified observation **immediately**; don't gamble on a user answering a prompt. Conversely, if the present observations already support a useful qualified takeaway, **show it without delaying for optional refinement**. A question is an attention candidate, not a clearance procedure or an override of scientific admission.

A non-safety question qualifies for ACTION-01's **one primary unsolicited attention slot** only when **all four gates pass**:

1. **Active decision impact:** A current authorized investigation or observation exists and plausible Yes/No/Not sure answers could materially affect hypothesis discrimination, applicability, abstention or practical next step. Never ask to complete a profile.
2. **Reviewed domain relevance:** Independently admitted, current evidence supports relevance to the *actual* analyte, assay, circumstance or scientific relationship. LLM-generated relevance alone is not permission to ask. Do **not** hardcode an exhaustive analyte-by-confounder table.
3. **Genuine missingness and answerability:** Reuse currently authorized lab metadata, existing actual activity, medication/supplement/context dates and prior question answers first. Missing log is not a negative. Consider ability to recall old events; unreliable historical recall favors qualified uncertainty.
4. **Attention, repetition and cadence:** Competes with other eligible non-safety actions/questions for the same primary slot; one short plain-language question with **Yes / No / Not sure / Skip** where appropriate. Don't loop on previously answered/skipped/dismissed specimen/window questions. Material new evidence/source/policy change allows **reconsideration**, not automatic resurfacing. On-demand context entry always remains accessible.

Classify admitted question utility qualitatively: `decision-changing` (may change conclusion/action/abstention), `interpretation-improving` (materially separates plausible hypotheses without necessarily changing action), or `informational-only` (background). Only the first two can be proactive, and even those may be withheld if user burden exceeds expected utility. This is an **auditable explanation, not a numeric VOI score or new ranking service**. Treat `not-sure` / `skip` as legitimate answers with unchanged source uncertainties. An answer is user-asserted, scoped to specimen/event/investigation, with source revision, confirmation time **separate** from event time, and account/purpose guards; never transform “yes” into a clinically verified diagnosis.

**Safety boundary:** Existing independently reviewed safety findings are not suppressed by the one-question limit or dismissal. If context is eligibility-required, scientific admission abstains or qualifies now; ACTION-01 controls whether a useful optional question reaches the user, **not** whether unsupported advice is allowed.

### 0B.4 Consumer low-number preference (P3, optional)

When requested, reduce **default prominence** of calorie/macro target/body-weight numbers in Today/Nutrition/Progress using existing display settings, while preserving actual stored values, source review, medically relevant warnings and intentional reveal/accessibility. Do not use this as evidence of a diagnosis, suppress appropriately required safety information, create a second dietary model or force a new tracking mode. Apply consistently across touched surfaces, not necessarily by rewriting untouched modules.

### 0B.5 Focused negative test cases — CTX/VOI

- `CTX-A/VOI-A`: recorded illness or a scientifically relevant missing fasting context around a lab → qualify observed change and, **only when the four gates pass**, ask one question; no diet/supplement causation.
- `CTX-B/VOI-C`: verified actual exercise or medication exposure already supplies the relevant timing → no redundant question; medication list alone does not prove taken dosing or historical start.
- `CTX-C`: pregnancy/postpartum, menopause or HRT/TRT with uncertain onset → preserve effective-date uncertainty, never infer sex/age diagnosis or invent altered clinical cutoffs.
- `CTX-D/VOI-B`: fasting context differs for an analyte where it is not material → do not globally invalidate all lab comparisons or ask irrelevant questions.
- `CTX-E`: exertion precedes blood draw → evaluate reviewed analyte relevance, not causal certainty; after-draw exercise cannot explain the earlier draw.
- `CTX-F/VOI-F`: correct/withdraw illness, medication or sample condition → dependent source epochs/investigation/presentation stale, current authorization rechecked, unrelated sources intact.
- `CTX-G/VOI-D/VOI-H`: historical recall poor, sparse coverage, unanswered important question → accept Not sure/Skip, preserve unknown, offer qualified conclusion when eligible or specific abstention when not.
- `CTX-H`: low-number display mode hides routine prominence across touched surfaces without erasing numbers or withholding safety/raw original data.
- `VOI-E`: three eligible questions plus eligible regular action → at most one unsolicited non-safety primary (or none), with others available on demand.
- `VOI-G`: previously skipped question and no material revision → no recurrence; a new source/evidence revision only re-evaluates utility, not automatic nagging.
- **Required negative:** Eligibility-required missing context cannot be fixed by an LLM question or provisional Yes/No; no unreviewed personal medical conclusion before separate source/science eligibility.

Only run fixture subsets applicable to the **specific touched integration**; synthetic cases do not establish scientific/clinical validation or justify implementing unused context fields. Reuse `UX-A..J`, `INT-01..12`, existing admission and source-revision tests and P1 blind A/B/C rather than establishing another testing platform.

### 0B.6 Scope and stop

Codex first inspects current HEAD `contextSchema`, actual source history, activity/read-only investigation, specimen fasting/time, account display preferences and scientific admission; classify **REUSE / NARROW CHANGE / DEFER**. First candidate should be **one genuine decision-changing context case** using existing sources, not a six-field onboarding expansion. No new universal physiological record, condition-specific engine, questionnaire, pregnancy/cycle tracker, medication-effect table, clinical reference catalogue, push system, cross-surface preference rewrite or new release claim from this document. Continue `NEXT_ACTIONS.md` P0 → P1 → P2 → P3 → P4 with scientific/private data and deployment restrictions. **STATUS: SPECIFIED ONLY; implementation/tests/independent review not claimed.**

## 1. Product interaction principles and priorities

1. **Value with sparse data:** No lab, connected device, microbiome upload or three-meal minimum should make the *whole product* feel broken. Existing features requiring specific input must honestly explain their own prerequisites; offer useful, explicitly general education and a clear optional first action elsewhere, not made-up personalized inferences.
2. **One primary non-safety attention item:** A reviewed and eligible recommendation, *or* one decision-changing missing-input question, *or* intentional silence. Safety findings have a separate reviewed plural channel; do not bury or rank them using consumer engagement heuristics.
3. **One canonical decision:** Today, Nutrition, Progress and Insights display or link to the same current authorized finding/action/presentation revision. No per-screen independent suggestion generation or stale copied cards. The screens can remain distinct contextual views.
4. **Truth over convenience:** Template ≠ consumption, planned ≠ taken/performed, missing ≠ absent, displayed values ≠ user-confirmed unless explicit. Preserve event time precision distinct from confirmation time; corrections invalidate dependent facts and decisions.
5. **Plain-language first, drill-down available:** What was observed, what it may mean, what is uncertain, and the next optional consideration. No fabricated diagnoses, causation, scores or default presentation of RCV equations.
6. **Avoid tracking fatigue:** Only request observations when an answer is plausibly decision-changing and low burden; all logging remains accessible on demand without proactive nudges.

## 2. Concrete surface states and behaviours

### 2.1 Today / first-run / calm state

At least these distinct states must be supported in the existing Today experience (inspect actual routed components, do not assume a page filename):

- `sparse_data`: welcome with one optional high-value entry point (e.g. health interests, meal, authorized records, or explore reviewed general science); **no assertion** that nothing about health needs attention; no upload wall or compulsory questionnaire.
- `eligible_primary`: one concise action or targeted question, with short “Why this?”, one appropriate next control and optionally “More detail”; if context-limited, say so. Display eligible safety information separately under reviewed rules.
- `no_new_action`: calm text such as “No new suggestions right now” (not “you are healthy” or “nothing needs attention”), plus ordinary access to history, optional capture and Explore. No placeholder recommendation generated to fill a slot.
- `loading/error/offline/unavailable`: distinguish fetching, no eligibility, failed source load, revoked consent and genuinely empty records; fail closed, show a retry where appropriate; **do not render “nothing new” if eligibility could not be checked**.
- `stale_or_withdrawn`: suppress the old actionable conclusion and show neutral “This suggestion has changed or is no longer current” with a safe path to current eligible context, or a clear unavailable message if none exists.

The above are **presentation states**, not new server truth about health. Use existing design system, accessible controls and restrained text. Do not generate a list of all eligible findings on Today.

### 2.2 Actions, feedback and safety

For ordinary non-safety cards offer proportional interactions when supported: **Why this?**, **More detail**, **Not relevant**, **Already doing this**, **Maybe later**. Avoid five permanent buttons on a compact card: use a light secondary affordance/menu; make feedback optional. Existing `focusFeedbackResponses` (`liked/disliked/intolerant/not-applicable/helped/no-benefit`) may be adapted where semantics match; do not silently rewrite those source meanings or overload feedback as a clinical fact.

- `not_relevant`: reduce equivalent future non-safety nudges; do not change scientific finding/evidence.
- `already_doing`: capture *feedback about action relevance*, **not** a confirmed consumed food/dose/medication/event.
- `maybe_later`: defer in a bounded manner without periodic nagging; no automatic assumption that the action was completed.
- `why_this`: cite current, source-scoped observed context plus reviewed evidence, uncertainty and applicability. If missing, omit personalized explanation rather than inventing it.
- On true `new_source/new_evidence/context_change/policy_change`, **re-evaluate** but do not automatically resurface. `scheduled_review` only for demonstrably useful, opted-in cadence. Distinguish reviewed safety-policy notices from ordinary suppression.

Support multiple current safety presentations with independent source/policy lineage; safely consolidate visual chrome if multiple notices exist without dropping an independently required notice. Never use the ordinary one-action cap, dismiss or mute to hide required reviewed safety information. Never let unreviewed LLM prose define safety severity.

### 2.3 Cross-surface owner and navigation

- Resolve one **server-authoritative** `findingId` (evidence/source identity), `actionId` (canonical intervention), and `presentationDecisionId` plus current `sourceEpoch/evidenceVersion/policyVersion` (or existing equivalent). An action may have one primary owner (Today or appropriate Nutrition/Progress/Insights context); other surfaces reference/open it, not create duplicate nudges.
- Semantic de-dup checks intervention **type + target + intended change + context + authority**. “Record supplement intake” is **not** equivalent to “change dose” or “stop supplement”. Where equivalence is uncertain, don't make a hazardous merge.
- Deep links must resolve against **current account ownership, source revision, scientific eligibility and presentation decision** on open; stale cached text cannot be actionable. If the item is withdrawn or the viewer changed accounts, show a neutral unavailable/superseded state, never resurrect prior personal information. Accessible direct links to current records/scientific detail remain allowed.
- Preserve complete underlying labs, reports, eligible scientific citations and history on demand even if the current primary action is `none`.
- Cache keys, browser back/forward, account switching, reauthorization, feedback mutation and source correction must not leave mismatched actions across screens.

## 3. INPUT-01 consumer capture ergonomics (reuse current schemas)

Define a small reusable **Open → Select → Confirm → Undo/Correct** interaction wherever existing capture is available; optional fields disclosed only when scientifically meaningful. Prefer proven canonical storage; do not add a universal `recurring_input` table.

| Input | Fast path | Truthful state and key negative |
| --- | --- | --- |
| Symptoms | Recent symptom → record presence → optional severity/start/end/context | Not logged ≠ absent. Check whether canonical symptom store exists **before** proposing schema; bounded addition only when eligible. |
| Confirmed supplements | Display saved product/dose where known → confirm actually taken, or skipped/unknown | Schedule/template ≠ taken. User confirms exactly what is shown; unknown quantity/timing stays unknown; event time ≠ click time. Repeated submit idempotent. |
| Sleep/energy/recovery | Optional quick subjective check-in, prefill only authorized actual facts | Existing `checkinSchema` requires energy/hunger/digestion/sleepHours/adherence; **do not silently write invented defaults** to claim an optional one-tap check-in. Either keep existing required form or implement a schema-safe bounded optional record with independent tests. Subjective ≠ measured. |
| Activity | Select/repeat a completed activity or review existing authorized record | Existing `activitySchema` and routines distinguish completion; `routineSource.timestampBasis='log-time'` is not independently observed event onset. Missing device coverage ≠ no exercise. |
| Medication history | Report change with date/source/context; correction path | Reported change ≠ prescriber authorization; **do not** recommend start/stop/dose changes; inspect if an existing canonical medication store is present first. |
| Repeat meals/staples | Recent/favourite/template → review actual portion/composition → log eaten | Template ≠ eaten. Adjusting today's portion creates a distinct actual consumed record; template and past meals unchanged. Double-tap/idempotency tested. |

For every capture: store server-scoped source ID/revision, confirmed facts vs explicit unknowns, temporal bounds at **actual** source precision, event time separate from `confirmedAt`, and corrections/withdrawals. A user-confirmed “just now” should preserve the stated precision/method, not masquerade as an independent device measurement. Validate which displayed fields were actually confirmed; never let a client-supplied `confirmedFields` array self-authorize additional trusted facts.

**Prompt policy:** Proactive single-input questions enter ACTION-01's one non-safety attention slot only if material, user-answerable, not already known/dismissed and likely to change eligibility/safety. “I don't know” must be accepted; avoid repeated “log more” prompts. User-initiated entry always remains possible.

## 4. Laboratory interpretation as one coherent story

In Progress, the consumer should see **three independently sourced dimensions**, not an RCV-only reassurance or a stack of redundant charts:

1. **Absolute level & clinical/reference context:** actual marker/value/unit, collection date/source, independently applicable reviewed limits or “not evaluated/not applicable”; reference intervals are not automatically individualized treatment targets.
2. **Longitudinal trend:** compatible measured points and clearly marked missing, unverified or method-incomparable observations; no confident trajectory from insufficient data.
3. **Pairwise statistical change (RCV, if eligible):** result `exceeds_rcv/does_not_exceed_rcv/unavailable/ineligible`, direction, reviewed method and assumptions. `does_not_exceed_rcv` **does not** imply normal/safe/no follow-up; `exceeds_rcv` **does not** imply cause/diagnosis/treatment.

**Hierarchy:** one plain-language supported takeaway → latest value and interpretable trend → details on limits, comparability, RCV and original sources → deeper evidence/uncertainties. If RCV not implemented/reviewed, omit the statistic with a truthful explanation rather than fake a value. If clinical assessment unavailable, show measured facts and explicitly say context cannot be established here. Keep professional follow-up language within reviewed safety/action policies.

**Synthetic demonstration, not a user fact:** comparable results 205→210 with a hypothetical reviewed clinical limit of 180 and a sub-RCV change: communicate that the difference may fit expected variation **while the absolute level remains above the applicable limit**; never “nothing to watch.” Opposite examples: exceeds RCV but no known important clinical conclusion; method-incomparable pair must abstain from RCV. No static marker-specific rule encoded to satisfy examples.

## 5. Four-contract integration and exact acceptance flows

Logical reuse, not a new fixed pipeline: canonical/authorized source capture (INPUT) → read-only temporal and coverage projection (TIME) → existing evidence-grounded private investigation (optionally eligible RCV and independently reviewed trend/limit) → existing scientific/safety admission → shared ACTION presentation. Re-collect and re-authorize before admission and **before display**; source correction, evidence withdrawal, permissions changes and feedback invalidate relevant decision presentations.

**End-to-end journey fixtures (synthetic/authorized only; build using current application routes):**

- **UX-A — First-time sparse:** no labs, devices, microbiome or meals. Optional useful entry, clearly general vs personal, no blank dashboard/upload gate, no fabricated insights.
- **UX-B — Returning silence:** known sources, zero eligible new actions; Today calm (not broken), ordinary history accessible, no safety claim implicit in silence.
- **UX-C — Quick capture:** repeat meal portion edit, planned vs confirmed supplement, subjective check-in and activity; no double-write, correct precision, undo/correction and minimal redundant typing.
- **UX-D — Labs together:** above applicable clinical criterion + sub-RCV change and another method-incomparable pair; clear level/trend/RCV separation, no false reassurance or forced RCV.
- **UX-E — Dismiss/defer/already doing:** feedback suppresses repeated ordinary nudge yet leaves source facts and independent reviewed safety intact; meaningful revision triggers reconsideration, not automatic resurfacing.
- **UX-F — Cross-surface identity:** same eligible finding on Today/Nutrition/Progress/Insights, at most one action owner; other views reference same current decision; account switch, cached tab, browser history and deep link cannot resurrect stale/private advice.
- **UX-G — Correction/withdrawal:** correction to intake/event time/lab source and later evidence revocation invalidate scientific calculation, derived conclusion, cross-surface cards and deep links; audit remains account-scoped.
- **UX-H — Deeper science:** concise interpretation, review of supporting and contradictory/null evidence when available, applicability and uncertainty, original source links, no ungrounded causal claim.
- **UX-I — Multiple safety vs primary:** two independently eligible safety findings coexist alongside one non-safety action; neither safety finding hidden by cap, dismissal, clustering, stale caches or changes in surface owner.
- **UX-J — Unavailable/offline:** cannot fetch authorization/eligibility; no “nothing new” false success, no cached actionable claims; neutral retry and offline-safe source views only where specifically eligible.

**Cross-layer INT-01..12** from the four-contract plan remain design-level checks; add focused negative cases for planned-not-taken, date-only precision, unknown coverage, RCV ineligibility, independent clinical limits, no causal leap, one owner, safety multiplicity, one question, appropriate silence, invalidation and account isolation. Existing INV-HELDOUT-01 / INV-AI-DEDUCE-01 independent A/B/C remain the overarching P1 science go/no-go. No replacement benchmark, hidden-case leakage or clinical claims from synthetic UI fixtures.

**Consumer task acceptance:** representative users can state the main takeaway *and uncertainty*; navigate to why/evidence; log and correct without invented facts; dismiss an irrelevant nudge; find the same active recommendation across views; recover from stale links; start with no health uploads. Record tasks completed/failed, factual-entry errors, steps and redundant-entry count, comprehension and repeat-nudge burden. Compare to simple current workflow, not just click-through/engagement. Independent real-user acceptance remains NOT_RUN until authorized. Do not add mandatory screenshot collection.

## 6. Delivery plan integrated into existing queue

**H0 — Read-only mapping (first relevant P3 consumer task; no code changes):** inspect current HEAD route structure (Today component may live under PrecisionNutrition/TodayPlanner), `Progress.tsx`, `Insights.tsx`, templates/checkins/activity/supplements, backend source revisions/candidate admission and current tests. Produce a brief actual-file map with columns *existing behaviour / gap / smallest reuse / source+privacy test / UX fixture*. Confirm how standalone Insights recommendations relate to scientifically admitted candidates; do not assume they are the same. Distinguish design from implementation and check permissions/authorization.

**H1 — First usable increment (P3; small earlier source-safe fixes permitted):** fix the highest-impact *verified* sparse-data/Today state and one shared-consumer presentation seam, without making a broad UI rewrite or enabling unqualified scientific advice. Prefer short copy, clear optional entry, honest loading/error/no-new-action states. Do not advertise “fully unified ACTION-01” without server admission and cross-surface tests.

**H2 — Friction and invalidation (P3 or a bounded P0 source-integrity issue):** one fast capture/correction workflow using current canonical records; safe confirmed fields, idempotency, date precision; stale decision/deep-link invalidation; no new intake store. Implement only what the actual inventory finds missing; do not force symptoms/medications into unrelated existing schemas.

**H3 — Unified labs/RCV explanatory view (P3 after applicable scientific review):** present absolute/trend/eligible statistical variation from current server-authorized calculations. Where RCV-01 isn't independently reviewed or built, show accurate lab measurements/trends and candid limitations; do not block general progress view.

**H4 — Evaluation and release gates:** run focused UX-A..J and INT negatives; existing P1/P2 tests; independent A/B/C under its frozen protocol when authorized; accessibility/responsiveness; account/consent/withdrawal checks. Record `PROVEN` (bounded exact SHA/tests), `IN FLIGHT`, `EXPLORATORY`, `BLOCKED` with explicit engineering/science/provider/hosted/consumer status. Consumer ENABLED requires separately met release gates.

**Execution:** Codex is sole engineer. At each eligible queue handoff, choose one smallest high-value gap and implement/verify where safe; do not pause P1/P2 for exhaustive mockups or static copy polishing. Log only a concise three-field context breadcrumb on material context changes in the existing development log/checkpoint.

## 7. Definition of done / Codex receipt

For each material UX slice, report: exact current branch/commit, files inspected/changed, existing components reused, source/permission invariants, UX fixture and negative test results, focused existing science regressions, accessibility/responsive interactions actually checked (or NOT_TESTED), user-friction delta if measurable, current `PROVEN/IN FLIGHT/EXPLORATORY` scope, independent A/B/C and real-user status, and remaining blocker/next eligible queue task. A documentation commit alone is **SPECIFIED**, not IMPLEMENTED/TESTED/INDEPENDENTLY REVIEWED/CONSUMER ENABLED.

**Acceptance:** A new user can get honest first value without a data wall; an established user sees one eligible primary consideration or deliberate silence without four competing nudges; familiar facts are reused without inventing events; clinical context/trends/eligible RCV are understandable; stale and withdrawn claims fail closed; evidence is available to interested users; safety, privacy and independent science gates remain intact.
