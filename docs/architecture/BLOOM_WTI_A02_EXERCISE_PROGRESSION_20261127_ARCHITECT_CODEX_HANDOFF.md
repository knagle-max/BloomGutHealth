# BLOOM — Adaptive Exercise Progression, Progressive Overload & Freestyle Workout Intelligence

**Owner handoff:** `WTI-A02` · November 27, 2026 · parent `BLOOM-MOVE-WORKOUT-20261127-R1`. **Architect disposition: APPROVE as CORE Everyday + Athlete functionality**, with conservative, voluntary, equipment-aware progression. This is an **implementation-ready scoped contract under the one existing `NEXT_ACTIONS.md` queue**, not authority for production deployment, main merge, new physiologic inferences or 15 simultaneous workstreams. **Primary user outcome:** open a blank or saved workout, immediately see actual prior comparable performance across all workouts, get an explainable, editable next set target, log quickly, and never have to recall previous weights/reps manually.

## 1. Live-source review on development branch and actual gap

Inspected `enhance/bloom-experience` source:
- `client/src/pages/ActivityLog.tsx` supports selected, described and repeat activities, canonical `ExerciseCataloguePicker`, `ActivityReview`, editable manual sets and account-bound source save receipts. Already built; **reuse, never replace**.
- `client/src/components/TrainingSetsEditor.tsx` **already shows previous set information** via `previousTrainingSets` and handles focused set entry. It does not currently display a versioned next-target prescription; previous values are references and are **not copied as new actual performance**.
- `shared/training-set-history.ts` current `previousTrainingSets` uses trimmed/case-folded **exercise text plus ordinal position** across completed `TrainingSession` records only. This is a good narrow historical reference, **not yet canonical cross-template identity** across every independent `activity`, workout and routine, and it cannot distinguish same-name barbell/dumbbell/equipment variations without higher fidelity.
- `shared/experience.ts` current `actualSetsSchema` has optional source-confirmed `catalogueRef`, exercise display text, `reps`, `loadKg`, `loadUnit`, `completed`, `state`, `side`, `bodyweight` and `reportedBout`. **It does not include per-set RPE/RIR, warm-up/working/top/back-off classification or load measurement convention**. Training `Session.rpe` is session effort, **never automatically interchangeable with per-set RPE**. Additive version-compatible schema evolution is necessary before those features are claimed supported. Preserve all serialized v1 records.
- `client/src/components/ExerciseCataloguePicker.tsx` already has catalogue IDs, equipment filtering, recent/favourites and scoped custom exercise entries. Prefer an **explicit user-confirmed canonical ID** over fuzzy name; if identity not resolved, show separate **insufficient comparison/baseline** rather than promote an unreviewed match. No canonical ID fabricated.
- Existing original 44 anatomy source paths/Option B art, 553 exercise identities and 3,102 **staged/unreviewed** exercise-muscle associations must remain protected. These data do **not** confer automatic muscle stimulation or progression equivalence. **553 staged exercise entries are not the 545 proposed workout templates**; do not conflate them or wait to populate 545 templates before building progression.
- The user-supplied parent `BLOOM-MOVE-WORKOUT-20261127-R1` remains governing higher-level workout scope when available to Codex. Exact standalone full parent was **not retrieved as a repository file in this review**; Codex must request/check it if a selected implementation needs beyond the provided WTI-A02 text. Do not invent its precise schema status.

### Architectural distinction

**Progression engine reads actual history and proposes targets.** Existing source writer saves **only user-confirmed actual sets**. A selected suggestion is **not** an observed set; a workout start/schedule is not completion; timer expiry isn't a set. No second workout database, performance journal, muscle calculator, recommendation AI model or source of biological truth.

## 2. Canonical exercise-specific performance history contract

**One longitudinal history across templates, programs and freestyle** from user-owned completed actual `activity` and `session` source records, with stable source record ID, revision, event time, distinct set IDs and exercise `catalogueRef` when user verified. Keep planned/cancelled/draft sets out. Use **separate comparison keys** for catalogue exercise/variation, equipment, load convention (`barbell-total`, `per-dumbbell`, `combined-dumbbell`, `single-limb`, `machine-stack`, `assistance`, `bodyweight`, etc.), side and relevant exercise prescription. Any uncertain legacy free text can be shown as **unverified reference**, not a comparable progression baseline. Equipment/convention transitions require a reviewed equivalence or fresh baseline; don't transfer 30-lb-per-dumbbell to 30-lb-total-barbell. Use kg internally where existing source contract requires it; show selected kg/lb transparently.

**History evidence status:** `COMPARABLE_VERIFIED`, `HISTORY_AVAILABLE_NOT_COMPARABLE`, `NO_CONFIRMED_HISTORY`, `SOURCE_UNAVAILABLE` or equivalent explicit states. Source edits/deletions and account-switch/permission changes must invalidate derived targets; never rewrite historical performance upon rule changes. Prior data must remain available even for **blank** sessions when the selected exercise has a confirmed identity. No cross-user index/cache.

## 3. Progression methods and decisions

Methods selectable at appropriate scope: double progression (most general resistance defaults), linear, per-set, top set + back-off, RPE/RIR autoregulated, repetition, volume, duration, distance, pace, calisthenics/assistance/variation, maintenance and manual. Choose context-appropriate defaults without asking beginners to configure complexity. The method is **a versioned coaching heuristic**, not an individual physiological predictor.

Recommended deterministic decision order:
1. Actor/source/current revision/permission and actual completed sets.
2. **Comparable exercise identity and equipment+load convention**; no matching assumptions from unreviewed muscle tags.
3. Actual relevant pain/symptom flag or unknown situation: **SAFETY_HOLD** for supported relevant new/worsening exercise pain; no diagnosis and no automatic rehab prescription.
4. User override and configured method, working-set vs warm-up/top/back-off/pyramid structure, rep ranges/duration/distance and goals.
5. Completed working-set data, reported effort (per-set RPE/RIR if explicitly collected) and technique feedback (never inferred).
6. Comparable recent exposures and trends; handle single bad session as variability, two as review, persistent trend as **optional** reconsideration rather than automatic 10% deload.
7. Exact equipment available loads, minimum increment and relative increment percent.
8. Proposed target, concise why/context/version and **Accept / Edit / Ignore**; no save of uncompleted sets.

**Double progression default** for applicable general resistance sessions: if verified working sets fall within the configured 8–12-style range, favor reps at current load; when *all relevant eligible working sets* reach the top of range on comparable performance and effort is acceptable if actually known, consider next load. If effort is unknown, use conservative repeat-completed-exposure rule and ask the user—do **not** assume low RPE. If the next dumbbell pair is 30→35 lb, that is a **16.7%** increase **per dumbbell**; a conservative default may favor more reps, smaller increments or a user-opt-in heavier introductory set, rather than blindly prescribe 35 lb across all 3 sets. By contrast 135→140 lb barbell total ≈ **3.7%**. A weight increase resets reps toward a configurable lower range; exact thresholds and repeated exposure count are engineering defaults requiring specific exercise-science review and user override.

**States:** `ESTABLISH_BASELINE`, `REPEAT_TARGET`, `INCREASE_REPETITIONS`, `INCREASE_LOAD`, `INCREASE_DURATION`, `INCREASE_DISTANCE`, `ADVANCE_VARIATION`, `REDUCE_ASSISTANCE`, `HOLD_LOAD`, `REVIEW_STALL`, `CONSIDER_DELOAD`, `INSUFFICIENT_CONTEXT`, `SAFETY_HOLD`. All decisions carry version and source evidence; **none** are clinical readiness/response scores. No forced failure training or set-level RPE inferred from session effort.

## 4. Active UX, freestyle, timer and substitution

**Everyday and Athlete share canonical computation**, with mode-specific density/terminology. Most useful first view: current exercise, **Previous comparable** actual load×reps (date/unit), Proposed next load/reps and reason, editable current load/reps, set-complete toggle, simple equipment increment preference, unobtrusive optional rest. A suggestion must not obscure the original set editor or block completing an alternative. Use available set source validation and saved activity semantics. From blank session add an exercise and start actual sets **without saving a full template**. Reorder/add/remove/substitute only in the editable draft, preserving planned separately from performed. “Repeat workout” is a template until saved actual.

**Rest timer** Phase 2: configurable base and exercise-specific duration, auto after real set confirmation if enabled, +15/-15, pause/resume/skip, accessible optional signal, background restoration only where supported; not an exercise or rest-physiology measurement. No false app-background capabilities assumed.

**Substitution** Phase 2: allow equipment-/movement-/muscle-relevant alternatives only with reviewed associations, user confirmation and distinct new exercise baseline. No cross-variant load copy or physiological equivalence claim. Lower unreviewed coverage remains explicit.

**PRs & Progress** Phase 2: max recorded comparable load, reps at same load, load at reps, appropriate volume (declare measurement convention), duration/distance/pace; optional estimated 1RM labelled **estimated**, formula/version/applicability. Never equate more reps to proportionate hypertrophy or imply per-muscle biological stimulus.

## 5. Delivery slices, no catalogue-driven delay

| Owner ID | Capability | Activation & dependencies |
|---|---|---|
| EPG-01 | Current history/source inventory | Verify actual activity/session merge & canonical ID/comparability |
| EPG-02 | Exercise-level strategy/settings | Reuse current setting revisions; default + override only if needed |
| EPG-03 | Deterministic double progression | Pure versioned function with conservative missing/RPE/equipment handling |
| EPG-04 | Top/set/back-off progression | Add source-safe set role fields before relying on them |
| EPG-05 | Equipment load increments | Owned available equipment, lb/kg and load convention |
| EPG-06 | Optional per-set RPE/RIR | New versioned original observation fields; session `rpe` stays separate |
| EPG-07 | Freestyle execution | Existing ActivityLog/TrainingSetsEditor/ExerciseCataloguePicker, not duplicate |
| EPG-08 | Previous + suggested targets | Inline existing editor; suggestions never actual record |
| EPG-09 | Optional rest timer | Phase 2, no timer=performance assumptions |
| EPG-10 | Substitution | Reviewed candidate identity + separate prior-load baseline |
| EPG-11 | Personal records and analytics | Comparable source-only Progress and Athlete views |
| EPG-12 | Stall and optional deload | Repeated comparable evidence, optional and contextual |
| EPG-13 | Cardio/bodyweight methods | Duration/distance/pace, assistance and variation when source supported |
| EPG-14 | Muscle/nutrition/biology | Existing canonical read models, reviewed science only |
| EPG-15 | Correction, privacy, accessibility | Revision/account/cache and real rendered QA |

**First functional slice:** Codex should **NOT wait for all proposed workout templates, science engines, or per-set RPE schema**. In the next *eligible* workout task under `NEXT_ACTIONS.md`, implement:
(a) one common **read-only cross-template completed-exercise history projection** combining relevant source-backed activity and session sets with safe verified IDs/conventions;
(b) versioned pure **double-progression** suggestion (repeat/reps/load/hold/establish baseline, with equipment-aware steps and no pain escalation);
(c) **visible Previous and Suggested** in existing `TrainingSetsEditor` when source/eligibility supports it, with easy ignore/edit. Keep absent info plainly absent; no forced prefill as completed actual. Implement tested synthetic fixtures and real 390×844/1440×900 screen acceptance. This **may be split into 2 small work commits** as needed under one current task selector; cannot be declared complete from handoff docs alone.

**Next slices:** equipment/profile + source-safe RPE/roles and top/back-off, rest, PR/substitutions, stall/deload, cardio, then qualified biological context. Report `IMPLEMENTED_VERIFIED / PARTIAL / DEFERRED / NOT_TESTED` for each, exact HEAD, test receipts, render images and remaining gaps; do not manufacture 15 work packages in parallel.

## 6. Explicit tests to add (EPG-T01–T20)

| ID | Required proof |
|---|---|
| EPG-T01 | Same user-confirmed canonical dumbbell shoulder press in Upper A, custom, Full B has one history across all three; same-name barbell/machine records excluded from comparable baseline. |
| EPG-T02 | Completed activity and completed training session sources both contribute once, with correct revisions/date/order; planned/cancelled/warmup excluded where role known. |
| EPG-T03 | Missing ID, load convention, dissimilar equipment or unavailable history => baseline/insufficient context rather than guessed increase; legacy same-text history still viewable clearly as unverified. |
| EPG-T04 | For 3×8–12 at 30 lb per dumbbell, 12/12/12 and user-reported appropriate RPE, 35 lb next step (16.7%) yields HOLD/REPS or optional heavier transition, **not compulsory 35 × all**. |
| EPG-T05 | 135→140 lb total barbell displays ≈3.7% increment and keeps separate load convention. |
| EPG-T06 | 10/10/9 target 8–12 suggests repetition improvement; one below-target session doesn't mandate deload. |
| EPG-T07 | Session-level sRPE isn't copied into a working set; unknown RPE remains unknown, doesn't imply ease or muscular failure. |
| EPG-T08 | High effort after upper-range completion favors hold, absent forced increase. |
| EPG-T09 | Relevant user-reported new/worsening exercise pain triggers safety hold and appropriate non-diagnostic advice; unrelated report isn't inferred to mean exercise injury. |
| EPG-T10 | Top, back-off, independently-progressed and warm-up groups evaluate only their correct eligible set types once such roles are supported. |
| EPG-T11 | Fixed dumbbell increments, adjustable dumbbells, machine stack, microloading, and pounds/kg correctly limit candidates to actually available equipment. |
| EPG-T12 | A single challenging exposure never auto-deloads; repeat difficulty prompts review; persistent decline optional deload only, not automatic unrelated plan rewrite. |
| EPG-T13 | Blank workout → add exercise → display verified prior, modify load/reps, explicitly complete set, canonical save and correct return; no mandatory template creation. |
| EPG-T14 | Accept/Edit/Ignore suggestion doesn't create actual event; completed only through original idempotent writer. |
| EPG-T15 | Rest timer adjustment +15/-15/pause/skip never changes completed actual sets or runs indefinite background work. |
| EPG-T16 | Exercise substitution retrieves independent baseline; no copied absolute load from incompatible variation or unreviewed association promotion. |
| EPG-T17 | PR and duration/distance/pace compare only compatible event, source measurement and time; estimated 1RM explicitly labelled. |
| EPG-T18 | Corrections/deletes/equipment change/profile changes cause revision-aware recompute without altering old confirmed performance or cross-account leakage. |
| EPG-T19 | Same exercise Everyday/Athlete shares actual history and rule engine, different presentation only; no AI/external paid source required. |
| EPG-T20 | Real 390×844 and 1440×900 initial, active-set, previous/suggested/secondary states in four themes plus 200% zoom, touch/keyboard/focus and accessible label/focus restoration. |

## 7. Scientific and operational gates

**Verified references:** 2026 ACSM position stand DOI `10.1249/MSS.0000000000003897`, PubMed `41843416`, published April 2026; supports progressive resistance training and variability in effective prescription, **not a universal per-set threshold**. 2009 ACSM progression stand PMID `19204579` historically proposed 2–10% increases in particular conditions; **not universal personalized safe increment**. Exact rule thresholds, pain gates, physiological projections and algorithm behavior require appropriate review. No individual hypertrophy, readiness, injury, rehabilitation, disease or guaranteed recovery claim; user reports are not diagnoses. This is a coaching suggestion over recorded performance, not clinician advice.

**Preserve** separate accepted source IDs vs staged 553 exercise metadata, 53 muscle descriptors and 3,102 **unreviewed** stage relationships, original 44 art paths/Option B parent/child geometry and canonical source restrictions. Avoid using missing muscle relationships to block actual safe set logging.

**Governance:** The original owner handoff is approved product direction but **this review did not run app code/test screenshots or implement UI**. Codex is sole engineering implementer on authorized nonshipping worktree; existing `AGENTS.md` and `NEXT_ACTIONS.md` control. No Render until December hold lifted, main merge, protected system changes, production migration, paid provider, external personal-data transfer or unsupported clinical action. A verified bounded vertical with actual tests beats a documentation-only loop. Persist this contract for future Architects.
