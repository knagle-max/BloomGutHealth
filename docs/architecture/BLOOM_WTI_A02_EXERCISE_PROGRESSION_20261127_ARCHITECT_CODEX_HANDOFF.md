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

## 8. Owner addition — personal equipment access is a soft recommendation signal (2026-11-28)

**Binding owner product requirement.** Users must be able to specify what exercise equipment they **ordinarily have access to**, from **no equipment** through exact fixed dumbbell weights, to adjustable dumbbells, free weights, machines, cables or gym facilities. Their equipment is an influential **recommendation/ranking preference and progression availability input**, **not an absolute catalogue exclusion**. The same person may regularly train at home with limited weights, sometimes attend a fully equipped gym, travel to a hotel with a different setup, or train without equipment. Preserve **full exercise discovery** and the user's ability to manually select/log any authorized exercise regardless of saved home inventory. Do not infer that a listed gym or machine is actually available today.

### A. Account-owned access model (reuse existing settings/catalogue)

Existing verified source at reconciliation HEAD: `shared/experience.ts` `exerciseCataloguePreferencesSchema` has favourites/custom exercises but **no ordinary equipment inventory**; `shared/exercise-catalogue.ts` has a manually selected `equipment` facet; `ExerciseCataloguePicker.tsx` defaults to any equipment and does not persist an equipment-access profile. The currently progressing WTI-A02/source fields may evolve; **reinspect exact HEAD before implementation** and extend these existing user preferences, exercise catalogue and canonical training context, not a separate gym/equipment store.

A user-editable optional `Equipment I have access to` setting may contain:
- **Named context/location** (`Home`, `Gym`, `Travel` or user-defined), default/most common context, and **current selected context for today's workout**. These contexts are convenience categories, not geolocation or location-tracking permissions.
- **Equipment types**: none/bodyweight; fixed or adjustable dumbbells; bands/loops; bench; kettlebell; barbell+plates/microplates; pull-up/dip structures; cable/machine weights; bike/treadmill/rowing equipment; floor/mat and appropriately supported others. A configured **No equipment** context must remain valid.
- **Actual available increments** where relevant: exact **individual dumbbell per-hand weights** (e.g. 10/20/30 lb), adjustable ranges/increments, plate combinations and barbell starting load, cable/machine stack markings, assistance settings, kg/lb and exact load convention, with units explicit. Missing/incomplete detail is **unknown**, not unlimited machine or a fabricated increment.
- Optional **access level** `usually available`, `sometimes available`, `not in current context`, `unknown` or equivalent. Do not use time-of-day/geolocation inference to silently switch a context. Choice remains explicit and editable per workout.

### B. Ranking, recommendations and manual freedom

1. **Default exercise suggestions** favor workouts executable with the active context's **known available equipment**, user-selected time and needs, but **keep exercises using other equipment discoverable** and selectable with an informative “Requires equipment not in your current setup” or “Check availability” indicator. Equipment mismatch lowers practical fit; it is not a health/safety prohibition unless the user **explicitly chooses** a strict `Only my available equipment` filter or actual safety/access constraint is relevant.
2. Show optional `Use my equipment` soft ranking and `Only available here` strict filter **as distinct controls**. “No equipment” returns bodyweight/no-equipment recommendations without stripping the complete exercise library or preventing later gym use.
3. Workouts/programs may mix home and gym sessions. A temporary context change updates recommendations and candidate loads for **that session only** unless the user saves the default; preserve planned template, history and progression configuration. If user starts a workout originally designed for unavailable kit, offer **reviewable** substitutions from the existing catalogue, rather than rewrite it or imply all exercise variations are equivalent.
4. Reuse canonical exercise identity and vetted movement associations. Home dumbbell shoulder press is **not** automatically the same comparable load baseline as barbell or machine press. Substitution keeps the original planned exercise separate from actual chosen exercise, and actual confirmed sets drive history.
5. **Progression must use verified currently selected equipment and its exact load increments.** A 30→35 lb per-dumbbell jump is 16.7% and may warrant hold/reps/optional transition; a home profile with only 10/20/30 lb **cannot propose 35 lb**. If heavier weights become available at the gym, user can temporarily switch context and receive separate equipment-aware suggestions, but only if source/comparability is verified. Never invent that user owns microplates or can select smaller increments.
6. No inferred access from previously logged workout, membership, current GPS or recorded device; suggestions use **user-confirmed** equipment, not a silent assumption. Users lacking a saved profile get a useful general library and optional equipment-selection prompt, not mandatory onboarding.

### C. First-pass UI / Brand integration

One compact **Equipment & access** preference within current activity settings/profile and one unobtrusive **Training here: Home / Gym / …** context switch in the exercise discovery/workout flow; exact placement uses the existing Brand & UX provisional governance. Everyday mode prioritizes simple equipment chips and sensible suggestions; Athlete may expose exact increment/profile controls progressively. Do not add form-card sprawl to active set entry, create new original visual art or hijack current primary **Complete set** action. Accessibility across four modes/themes, real 390×844 and 1440×900 key states, 320px, 200% zoom, keyboard, proper empty/no-equipment and source-loading/error states. User stays in control of suggestions, filter and workout selection.

### D. Acceptance — EPG-EQUIP-01..09

| ID | Acceptance |
|---|---|
| EPG-EQUIP-01 | A new user can choose `No equipment` and receive qualified bodyweight exercises while the rest of the canonical library remains findable. |
| EPG-EQUIP-02 | User with only fixed 10/20/30 lb dumbbells receives feasible home suggestions; 35 lb is not offered as available home equipment. |
| EPG-EQUIP-03 | Gym context can contain barbells, machines and distinct increments; switching context affects **future suggestions** without rewriting a saved history or global default silently. |
| EPG-EQUIP-04 | Browse shows lower-equipment-fit canonical exercises instead of hiding them; explicit `Only available here` filters strictly, with clear way to reset. |
| EPG-EQUIP-05 | Exercise substitutions are editable and never copy a mechanically incompatible load or muscle adaptation inference. |
| EPG-EQUIP-06 | Load `lb` vs `kg`, per-dumbbell vs total barbell, adjustable vs fixed equipment, and unknown increments preserve compatible units; unavailable load cannot be promoted. |
| EPG-EQUIP-07 | Missing, outdated or conflicting equipment profiles produce honest “unknown/check availability” states, not assumed unlimited gym access or forced profile completion. |
| EPG-EQUIP-08 | Settings and temporary workout-context changes respect account isolation, permissions, corrections and stale cache invalidation. |
| EPG-EQUIP-09 | Workout selection and one-tap complete-set remain usable on actual responsive Everyday/Athlete themes, no additional visual registry and no extra primary action. |

**Execution scope:** This is a new **future eligible equipment-personalization slice**, **not an interruption to the currently selected WTI-A02 first history/progression code vertical**. That existing task may accept exact user-confirmed equipment increments already available in canonical source, but must not begin an unrelated settings/profile/calendar redesign now. At next selected workout-equipment task, implement smallest end-to-end settings→soft ranking→explicit current context→safe progression step with tests and in-pass Brand/UX, rather than another architecture audit. Preserve sole `NEXT_ACTIONS.md` selector, scientific/provenance/consent restrictions and current nonshipping policy.

## 9. Owner clarification — exhaustive organized equipment picker, not a flat 57-label filter (2026-11-28)

**Binding extension to Section 8.** The user must have **a comprehensive, easy-to-select, categorized equipment inventory** rather than a flat technical equipment dropdown. Maintain one reusable, account-owned inventory of *available equipment* for the currently chosen Home/Gym/Travel (or custom) context, not separate lists in each workout. Multi-selection, search, quick presets, exact sizes, edit/remove and strict-vs-soft filtering are required. This is part of the next eligible WTI equipment-selection implementation, **not** a reason to pause or restart already functioning progression code.

### Current source coverage — actual index, not imagined exercise support

Reconciled `shared/data/exercise-selection.json` at version `owner-553-20261126`: **553 canonical exercises, 57 distinct source-native `equipment` label values** (see following mapping). `ExerciseCataloguePicker.tsx` currently builds one alphabetized `options('equipment')` select. A real consumer inventory must classify **all 57** while preserving their original searchable identity and exercise associations. The category labels below are **presentation/access-group metadata**, NOT permission to alter original exercise taxonomy, review status or muscle associations. Some names (e.g. weight bench vs flat weight bench) are related but **not automatically interchangeable requirements**. Every source-native equipment value must be represented in exactly one picker group, with explicit alias/requirement mappings in implementation, plus new equipment choices as needed.

| Primary group | Source-native values already used by the 553 exercises | Additional user-selectable capabilities to represent (may initially have no supported exercises) |
|---|---|---|
| **No equipment / bodyweight** | Bodyweight; Bodyweight / open space; Wall | Floor/open space, chair, doorway clearance, stable household support (declare true needs), barefoot vs shoes optional |
| **Dumbbells & free weights** | Dumbbell; Kettlebell; Barbell; EZ curl bar; Trap bar; Weight plate; Landmine attachment | Fixed dumbbells by exact per-hand weights; adjustable dumbbells with min/max/step or discrete set; kettlebell exact sizes; Olympic/standard bar (bar weight), fractional plates/microplates; dumbbell handles, collars, landmine attachment, weighted mace/club when qualified |
| **Benches, racks & platforms** | Weight bench; Flat weight bench; Incline weight bench; Upright weight bench; Squat rack; Stable step or box; Step or sturdy platform; Plyometric box | Adjustable bench (flat/incline/decline support when known), power rack, half rack, squat stands, safety arms/spotter support, step platform, lifting platform, blocks |
| **Cable & strength machines** | Cable machine; Resistance machine; Lat pulldown machine; Leg extension machine; Lying leg curl machine; Smith machine; Cable rope attachment; Rope attachment; Seated row attachment; Straight-bar attachment | Functional trainer/dual cable, pulley towers, assisted pull-up/dip, leg press, hack squat, chest press, shoulder press, pec deck, seated/lying hamstring curl, calf raise, row, abdominal, glute machines; exact plate/stack increments and handle attachments |
| **Bands, suspension & gymnastics** | Resistance band; Suspension trainer; Gymnastic rings; Pull-up bar | Mini-loop band, long loop band, tube/handle band, band-resistance levels, door anchor, dip bars, parallettes, push-up handles, ab wheel, gymnastics bar, assisted pull-up bands |
| **Functional, loaded carry & conditioning** | Medicine ball; Sandbag; Weighted vest; Rucksack; Weighted sled; Yoke; Jump rope; Stability ball | Slam/wall ball, weighted backpack/carry bag, sled push/pull harness, battle ropes, agility ladder/cones, balance pad, exercise step, grip trainers, farmer carry handles |
| **Cardio & endurance machines** | Treadmill; Exercise bike; Air bike; Bicycle; Rowing machine; Elliptical trainer; Stair stepper; Ski ergometer | Stationary upright/recumbent/spin bike, smart trainer, stair climber, walking pad, curved/manual treadmill, ski machine, spin bike, rowing machine variant, pedal ergometer |
| **Mobility, recovery & floor equipment** | Exercise mat; Foam roller | Yoga mat, yoga block/strap, massage ball, mobility stick, stretching strap, balance board, yoga bolster, resistance stretching band; avoid claiming treatment efficacy |
| **Sport, swimming & outdoor** | Pool; Pool or open water; Skates; Skis; Kayak; Canoe; Paddleboard | Track, open-running route, hill/stairs, stairs/step, soccer/football/basketball equipment, tennis/racquet gear, swim fins/kickboard, skis/poles, cross-country ski kit, skates/ice access, rollerblades, paddle/boat equipment; some are **location or facility access**, not owned physical objects |

**Common coverage not in source-native index:** accessories and machine subtypes above are selectable as user inventory, but **must not unlock fabricated exercise↔equipment eligibility**. Map only through verified recipe/exercise requirement semantics; when exercise applicability is not defined, show `compatibility unknown`, not automatic recommended or guaranteed feasible. Add optional new categories/entries through one versioned controlled picker vocabulary as needed, not unbounded duplicates or synthetic exercise records.

### Concrete interaction contract — fast for simple users, comprehensive for advanced

1. **Entry screen:** “What can you use?” with search field; one-tap **No equipment**; **Home essentials**, **Dumbbells only**, **Full gym**, **Cardio equipment** as editable starting presets (not inferred from account type). Choosing a preset **shows its selected components for review**; “Full gym” is a broad convenience profile, not assertion that every machine is present.
2. **Grouped checklist:** Expandable categories with clear icon + count and **search across groups and aliases**; multiple selection, batch select/remove, sticky/visible selected summary and clear way to reset. Use human-facing labels (“Dumbbells”, “Pull-up bar”) while retaining exact canonical source labels in mapping. No 57-item flat select and no one-at-a-time save loop. Long categories should be collapsible and searchable, not a nested card wall.
3. **Detail only when selected:** e.g. Dumbbells → `Fixed weights` chips with manually editable discrete values (e.g. 10,20,30 lb) or `Adjustable` min/max/step; barbell/plates → known bar weight and plate pairs; bench → flat/adjustable/incline; bands → levels; machine → exact supported increment if known. Avoid demanding granular setup for users who just want “Dumbbells”; quantity, unit and accessibility remain editable with `unknown` when not provided.
4. **Contexts:** Home, Gym, Travel and custom can save separate selections. Distinguish `usually`/`sometimes` availability; one-tap switch during a session must **not overwrite** default saved context. Accessibility-only/no-equipment mode remains genuinely usable without account setup.
5. **Recommendations:** “Matches your current equipment” first by default, while all safe source-authorized exercises remain searchable. Show **“Needs other equipment”** or **“Availability unknown”** gently; `Only available here` **user-initiated strict filter** is separate and reversible. Recommendations that require more than one item must evaluate **ALL required equipment** and valid alternatives, not a one-label OR. An optional exercise requiring a bench must not be promoted just because user has dumbbells; bench requirements and supported substitutions are explicit.
6. **Progression:** only suggest next physical load if it exists among confirmed available sizes/increments for **that context**, using correct per-dumbbell/total-barbell/stack convention. In a Home `10/20/30lb` setup, no `35lb` increment; at gym a comparable verified exercise can use the gym's confirmed available steps.
7. **Data model:** a versioned **categorized selection vocabulary / mapping**, not a parallel canonical exercise inventory. Persist immutable stable choice IDs and user-selected values in the existing `exerciseCatalogue` preferences or canonical account settings when suitable, with safe migration/defaults, source validation, max counts and account isolation. Preserve user custom descriptions and cases not present in predefined groups. Never treat equipment catalogue labels as automatically reviewed biomechanics or safe exposure.
8. **UI/Brand first pass:** reuse current settings panels, drawer/sheet and shared field/chip/checkbox primitives, 44px targets, real mobile 390×844 and desktop1440×900 plus320/200%, four theme states, keyboard focus return and concise helper text. No new commissioned illustration or BVA ID is required for a list selector. Account save/update/error/unauthorized/unknown states must be truthful and reversible.

### Acceptance — EPG-EQUIP-CAT-01..10

| ID | Required proof |
|---|---|
| EPG-EQUIP-CAT-01 | All **57** source-native equipment labels from current 553-exercise catalogue resolve to exactly one category entry; no unmapped value and no accidental duplicate identity. |
| EPG-EQUIP-CAT-02 | User selects `No equipment`, saves, returns, and still browses full catalogue with strict filter off; bodyweight recommendations remain accessible. |
| EPG-EQUIP-CAT-03 | User selects fixed 10/20/30lb dumbbells with quick multi-select, unit remains explicit and stored after reload. |
| EPG-EQUIP-CAT-04 | Search “cable”, “bench”, “bar”, “bike”, “pull-up”, “bands” and aliases reveals correct categories and choices; multi-select remains keyboard accessible. |
| EPG-EQUIP-CAT-05 | Presets provide reviewed **editable selections** and neither “Home essentials” nor “Full gym” silently claims all machines/weights. |
| EPG-EQUIP-CAT-06 | Gym/Travel/Home contexts preserve distinct saved inventories; temporary switch doesn't change default or unrelated history. |
| EPG-EQUIP-CAT-07 | Mixed-requirement exercises need all actually required items; absent bench, rack, attachment or unknown machine compatibility isn't false-feasible. |
| EPG-EQUIP-CAT-08 | Unknown accessories/extra subtypes remain selectable, without inventing exercise associations or safety qualification; legacy/source labels still search. |
| EPG-EQUIP-CAT-09 | Soft matching and explicit strict filter differ; user can always reset and browse lower-fit equipment exercises. |
| EPG-EQUIP-CAT-10 | Equipment-selection consumer flow passes actual responsive/theme/focus, safe save/retry/account-switch and no new asset registry checks. |

**Codex handoff:** When the next eligible equipment feature is selected, first implement a **single testable grouped vocabulary** with **automated exact-57-source-label coverage**, then a practical categorized multi-select tied to existing preferences, then context-aware soft ranking and equipment-aware progression. Keep the current selected history/progression or source-correction task moving until eligible; avoid creating a documentation-only loop and don't require a full machine catalogue implementation to deliver Home Dumbbells/No Equipment value. **Do not edit the 553 record labels or invent extra exercise results** to increase coverage.
