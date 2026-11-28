# Bloom — Exercise Intelligence, Interactive Muscle Coverage and Exercise Catalog
## Owner-approved design direction · Codex/Architecture handoff · 2026-11-22

**Repository / target branch:** `knagle-max/BloomGutHealth` · `enhance/bloom-experience`.

**Authority and execution gate:** **DESIGN APPROVED; NOT AN ACTIVE CODING TASK.** Current `AGENTS.md` and `NEXT_ACTIONS.md` govern selection. On the inspected branch, the single next assignment is the **GI-01–GI-10 baseline and `file:line` gap inventory; stop before fixes**. This handoff shall be preserved for later task eligibility and shall **not** cause Codex to change the queue, implement the body map, import an exercise dataset, generate images, access live personal data or deploy anything now. An independently confirmed urgent P0 remains subject to existing precedence. All task/commit/testing claims must be reverified at the actual worktree HEAD.

**Scope:** Phase 1 = truthful exercise recognition, rights-qualified local catalog, deterministic recorded muscle coverage, restrained interactive front/back map, shared Everyday/Athlete source. Phase 2 = optional restriction-aware training balance and exercise planning **after** Phase 1 qualification and separate approval; not part of initial delivery.

**Companion file:** `Bloom_Exercise_Muscle_Map_Asset_Registry_Delta_2026-11-22.json` (new production requests BVA-0078 and BVA-0079, and required reuse reviews). This is a **proposed, unmerged delta**, not a declaration that images or code already exist. Add to canonical `docs/visual-assets/visual-asset-registry.json` only when task is eligible and ID availability is reconfirmed at HEAD; obey its existing schema/lifecycle and avoid duplicate IDs. Do not create a competing live registry.

---

## 1. Verified current-repository reuse (2026-11-22 source inspection; recheck before work)

| Existing source | What exists | Reuse / cautions |
| --- | --- | --- |
| `shared/experience.ts:84–95` `actualSetsSchema` | Actual set source fields: exercise text, reps, load, `completed`, stable optional `id`, optional side, planned/cancelled state | **Extend compatibly**; legacy readers and writers must continue working; planned/cancelled never count. |
| `shared/experience.ts:98–112` `activityComponentsSchema` | Stable component IDs and child set IDs; mixed walk/run/cycle/swim/garden/strength/other; set validation | Project at existing component/set granularity; preserve mixed-workout identity. |
| `shared/experience.ts:113–145` `activityRoutineSchema`, `activitySchema` | Planned repeatables, completed manual activity, timestamp/source and original typed description | Plans are never actual workouts; retain source text and user correction lineage. |
| `shared/experience.ts:146–160` `trainingSessionSchema` | Athlete `planned/completed/cancelled`, duration, RPE, set details | Separate representations may refer to same physical session; **do not automatically add both**. |
| `client/src/pages/ActivityLog.tsx` | Describe/select/repeat, editing, history and source acknowledgment | Build catalog selection into existing low-friction interaction rather than new logger. |
| `client/src/components/TrainingSetsEditor.tsx` | Independently editable set rows with stable draft IDs and completion controls | Keep source set identities, direct toggle and keyboard/screen-reader behavior. |
| `docs/architecture/EXERCISE_INTELLIGENCE_HANDOFF_RECONCILIATION_2026-10-29.md` | Exercise Intelligence and food-like editable review contract `ML-ACT-1001..1008`, `UT-EXAI-2701..2708`, `MKT-EXAI-2813..2819`; historical parser regressions | Existing authoritative scope; **reconcile instead of superseding/reimplementing**. Historical observed failure at earlier code is not automatically a current failure. |
| `docs/architecture/V06_HANDOFF.md` | Approved V06-TRAIN-01/02 plans for explainable readiness and workout context | Phase 1 **does not** claim those systems are implemented or scientifically validated. |
| `docs/visual-assets/visual-asset-registry.json` | Existing canonical BVA asset requirement/lifecycle registry; observed 77 items through `BVA-0077` | **Only one canonical registry**. Merge/reserve new IDs cautiously; do not recycle. |
| `BVA-0005`, `BVA-0022`, `BVA-0023` | Existing Athlete hero, exercise-technique image requirement and recovery editorial | Review for contextual reuse; none substitutes for interactive scientific SVG muscle geometry. |

**Source-truth caveat:** Existing `actualSetsSchema` contains `exercise` free text, not confirmed stable catalog identity. A typed exercise taxonomy or reviewed complete exercise database has not been established as integrated by this source inspection. Do not infer delivery from a proposal file.

## 2. Product behavior: user story and scope

**User intent:** A person can log a workout in seconds and see which anatomical regions are **represented by confirmed recorded activity**, not an estimate of muscle growth, EMG activation, recovery time, training quality or physiological damage.

**Primary Phase 1 interaction:**

1. Existing Activity / Athlete log: describe, select from curated search, or repeat an actual prior workout. A user can enter custom exercises. Do not block saving on failure to match an exercise.
2. Review the exact individual set details and distinguish planned vs. completed. Suggested exercise matches require an explicit user action to become confirmed; an exact user selection may establish confirmed mapping when the catalogue ID and version are valid.
3. A compact **My Training Coverage** panel: front/back, **Strength / Endurance** semantic toggle, **7 / 14 / 30 days**; neutral/empty state is honest, not a percentage or pathology marker.
4. Select a visual region or equivalent accessible list row to open a compact breakdown: direct/secondary **recorded resistance sets** (where applicable), completed endurance **minutes associated with** that region (where applicable), last **recorded** direct strength activity date, source exercise/workout contributions with links to original logs, and unmapped/partial coverage cautions.
5. Edit/delete/correct a source workout, confirm/change an exercise mapping, or switch account: projections update consistently. Never persist a second calculated workout fact as if source-observed.

**Excluded Phase 1:** universal hypertrophy/set thresholds, frequency prescriptions, exercise calories and energy expenditure, simulated strength adaptation, 0–4 muscle 'load intensity' tiers presented as measurement, injury diagnosis, age/sex-adjusted muscle recovery percentages, auto-physical restriction inference, AI-created canonical IDs, compulsory daily prompts, unlicensed GIFs/photos, new coaching engine, or wearables dependency.

## 3. Canonical semantic layers (separate them)

- `CanonicalMuscleId`: reviewed exercise-relevant **muscle group identity** (not an anatomical diagnosis or an SVG path).
- `MovementPattern`: direction/type of movement, including `horizontal_push`, `vertical_push`, `horizontal_pull`, `vertical_pull`, `squat`, `hinge`, `lunge`, `carry`, `core`, `rotation`, `cardio_endurance`, `mobility`, `other`. Can be multiple per exercise if reviewed.
- `SvgRegionId`: actual front/back **graphic** region, potentially multiple bilateral paths resolving to the same muscle ID. Do not equate path count with biological classifications.
- `ExerciseCatalogId`: stable versioned exercise **variation** identity (e.g., dumbbell incline press vs flat barbell bench vs narrow-grip bench; heel-elevated squat vs RDL). Avoid assigning an exact ID to ambiguous wording.
- `ExerciseMappingState`: `confirmed | candidate | unmapped` attached to source context. `confirmed` denotes **identity confirmation**, not scientifically measured muscle recruitment. `candidate` must not be counted in specific region totals by default.
- `MuscleParticipationRole`: `primary | secondary | stabilizer` metadata. **Phase 1 UI counts direct and secondary recorded work; stabilizer is descriptive detail only, excluded from total set counts by default.** No `1.0/0.5/0.25` physiology coefficients.
- `Modality`: resistance, endurance, mobility, sport, mixed or unknown. Unknown does not get forced into strength.

### Suggested initial reviewed groups (15; finalize with Biology/UX and taxonomy tests)

`pectorals`, `deltoids_anterior`, `deltoids_lateral`, `deltoids_posterior`, `triceps`, `biceps`, `forearms_grip`, `upper_back_traps`, `latissimus_dorsi`, `erector_spinae`, `abdominals_obliques`, `glutes`, `quadriceps`, `hamstrings`, `calves`.

These 15 are **display/fitness groupings**, not an assertion of exhaustiveness of the human musculoskeletal system. Optional later subgroups (adductors, hip flexors, rotator cuff, tibialis anterior) must be considered in anatomical review. Do **not** silently map these to unrelated groups; mark coverage explicitly unavailable if catalog scope does not represent them. Each front/back SVG subpath must map to exactly one supported display group or to an explicitly noninteractive/unmapped neutral area. Multiple paths may represent one group. For example, left and right quadriceps can share a rollup group while retaining separate selectable path IDs. Anatomy review must check front/back orientation, bilateral consistency and accurate shapes.

### Identity extension (conceptual, not preapproved schema patch)

```ts
interface ExerciseIdentityReviewV1 {
  rawExerciseText: string;                     // already persisted on sets, preserve unchanged
  exerciseId: string | null;                   // only valid reviewed catalog ID or private custom ID
  mappingState: 'confirmed' | 'candidate' | 'unmapped';
  catalogRevision: string | null;              // pinned deterministic version
  mappingRevision: string | null;              // independent muscle-mapping version
  confirmedBy: 'user-selection' | 'user-review' | null;
  reviewedAt: string | null;                   // server/account scoped if stored
}
```

Keep source/snapshot schema evolution narrowly compatible and use existing correction mechanisms. Do **not** trust client-supplied `confirmedBy`/timestamps for authorization. When ambiguous (e.g., `shoulder raises`, `rows`, `press`, `skating`, `lunges` with missing variation), preserve original words and retain **candidate/unmapped** until confirmed. An exercise described by an LLM or keyword parser is not automatic confirmation. Allow explicit optional user-picked muscle tags for custom exercises, with provenance `user-reported targets` rather than reviewed exercise biology; display separately/qualified if mapping not expert-reviewed. Do not create a second physical `user_custom_exercises` store unless the existing account-owned source model cannot represent the functionality; document why first.

## 4. Catalog: curated-first, rights-qualified, offline-capable

**Suggested data source:** `yuhonas/free-exercise-db` is a candidate: its repository describes 800+ structured JSON exercises and publishes an **Unlicense** text; verify actual pinned commit, origin, rights/attribution and exercise-record provenance before bundling, and conduct independent image/media rights review before importing any images. Original source acknowledges previous data lineage. No blanket assumption that all exercise photos/instructions are independently cleared. Do not auto-fetch at runtime or generate production screenshots from external network dependencies. `wger` has exercise entries with individual Creative Commons licenses; do not wholesale mix content into Bloom without record-level rights provenance. The free ExerciseDB API documentation limits free content to **non-commercial use with attribution**; do not import its free GIFs into commercial Bloom.

**Three tiers in one reviewed catalog (design targets, not binding artificial quotas):**
- 40–80 **featured** familiar exercises, low clutter, includes common dumbbells/bodyweight and machine/cardio activities.
- Approximately 150–250 **reviewed/searchable** entries to support normal planning and robust variation-aware muscle classifications.
- Remaining **rights-approved** entries searchable under extended selection, optionally deferred pending rights/anatomy work; custom user-owned names always supported without forced mapping.

**Exercise fields:** stable ID, canonical name, synonyms/locale, modality, exercise variation, reviewed primary/secondary/stabilizer muscle roles, movement patterns, equipment options, body-side/variation semantics, instructions/license/source rights per field if carried, deprecated/merged alias behavior, catalog+mapping revision, review status and search ordering. Catalog version update must not silently reinterpret historical source facts; explicit version policy for retrospective display correction and migration, with audit/option to see recorded versus current classification.

**Deterministic importer (when eligible):** map every upstream muscle/equipment/category string through exhaustive explicit dictionary. Abort/reject unknown source labels for review; never silently discard them. Check duplicate IDs, alias collisions, inconsistent roles, mismatched variation names, non-licensed multimedia references, unsafe instruction wording, key totals and catalogue revision. Do not copy or use provider-hosted illustrations without rights. The importer is an offline build tool, not a new server/provider engine. Support Canadian/UK English variants only as search aliases if source-backed.

**Suggested variation examples for fixtures:** flat barbell bench press, incline dumbbell press, standing dumbbell overhead press, lateral raise, RDL, barbell back squat, heel-elevated squat, lat pulldown, chest-supported row, conventional deadlift, calf raise, walking, running, cycling, rowing, swimming, elliptical, yoga/mobility, skating. The initial review must distinguish direct vs assisting muscles without pretending recruitment is exact.

## 5. Deterministic projection and source eligibility

**Input:** actual authorized source records with account, stable source ID/revision and original start time precision, optional actual set IDs, session completion, exercise catalog mapping + version, exclusions and source availability. Reuse existing source authorization, deduplication and invalidation. **Never** obtain a user's workout by joining across accounts or copying shared summaries.

**Resistive-work summary per muscle, within selected 7/14/30-calendar-day user-local window:**
- `directResistanceSetCount`: completed sets with **confirmed** exercise ID whose reviewed mapping lists muscle primary; each set can contribute to multiple muscle groups, with explicit explanation that numbers **must not** be summed across groups as unique sets.
- `secondaryResistanceSetCount`: same but mapping secondary; never double count one set twice within **one** muscle. Retain set/source ID in contribution ledger.
- `stabilizerOnlyCount`: optionally a separately identified descriptive count; no effective-set weighting.
- `lastRecordedDirectWorkDate`: last eligible direct completed set date **when known**; `null` does not prove never trained.
- `unmappedOrCandidateResistanceCount`, `sourceUnavailableCount`, and `coverageCaveat`: explicit missingness; no 'unworked' declaration.
- Distinguish actual set count from difficult/working set count: do not label general completed sets as 'hard sets', and do not use RPE to convert sets into physiologic stimulus.

**Endurance:** reported duration minutes associated with an eligible **confirmed modality and reviewed region participation**. Do not allocate partial minutes across muscles or sum region-minutes as total training minutes; a 45-minute run may be *associated with* several groups, not 45 minutes of isolated work for each. Separate resistance and endurance buckets, plus mobility/other activity when available. Do not infer muscle-level activation from time/distance, and do not classify everyday walking as the same mechanical dose as strength exercises.

**Deduplication:** Everyday `activity` and Athlete `session` may be independent actual observations. Only deduplicate if existing explicit shared identity/source linkage or a reviewed user-confirmed match unequivocally identifies the same workout; a similar timestamp, text, duration or RPE **alone is not proof** of identity. If overlap is plausible but unresolved, flag potential duplication/coverage ambiguity rather than inventing a merge or double counting as certain. One physical workout's source sets must not be counted twice merely because two UI modes render it. Planned routine/session is excluded until performed is genuinely confirmed; `completed` at session level does not automatically make all unconfirmed set children completed.

**Time:** use source timestamps, original precision and user's applicable time zone; `last worked` means **last recorded**, avoid future/scheduled inclusion and DST/calendar-window errors. Source corrections, deletion/revocation, account switch, mapping revision and conflicting edits invalidate or recompute downstream summary; downstream caches key by account+source epoch+catalog/mapping version+window+modality+current permissions.

**Output contract (illustrative):**

```ts
interface MuscleCoverageReadModelV1 {
  version: 1;
  accountScope: 'current-authenticated-user';
  window: {days: 7 | 14 | 30; timeZone: string; fromInclusive: string; throughExclusive: string};
  modality: 'strength' | 'endurance';
  catalogRevision: string;
  mappingRevision: string;
  sourceEpoch: string;
  groups: Record<string, {
    directResistanceSetCount: number | null;
    secondaryResistanceSetCount: number | null;
    enduranceAssociatedMinutes: number | null;
    lastRecordedDirectWorkDate: string | null;
    contributions: Array<{sourceId: string; sourceRevision: string; setId?: string; role: string}>;
  }>;
  coverage: {unmappedExerciseCount: number; candidateExerciseCount: number; unavailableSourceCount: number; hasIncompleteLoggingCaveat: boolean};
  scientificMeaning: 'recorded-exercise-association-not-measured-physiological-stimulus';
}
```

Here `null` means **not applicable/not assessable** for the active mode; `0` means **zero eligible, visible recorded contributions in the specified window**, not a known absence of exercise. No derived medical recommendation or external AI transfer entitlement follows from this read model. Render only the minimum authorized source details; never give the investigator unrestricted private activity notes merely because a body-map projection exists.

## 6. Interactive SVG: actual requirements and accessibility

- Use **two new** clean **original vector assets**, front/anterior and back/posterior, each with identifiable anatomically reviewed region/path identifiers, neutral/base and selected states. Reuse SVG files in both themes; **CSS tokenized presentation** supplies Athlete blue and light/dark contrast, not duplicated static image generations.
- Single neutral human adult silhouette; do not infer sex, gender, age, diagnosis or body type from a profile. Any alternative silhouette is an optional later design review, not new automatic personalization.
- Front/back control, strength/endurance segmented control, 7/14/30 window choice. Compact mobile-first panel; avoid stacking gauges. Region fill visually distinguishes *recorded presence* or clear qualitative strata such as 'none recorded / some / more' only if the **legend explains the chosen purely descriptive thresholds** and Biology/UX review approves. Prefer simple presence-highlighting for initial rollout.
- Click/tap and keyboard equivalent focusable anatomical area or synchronised fully operable list of muscle groups; accessible names include side/region, modality, actual recorded count and uncertainty. No color-only meaning, no hover-only actions; visible focus, minimum touch targets where feasible, screen-reader reading order and responsive 320px/large text/reduced-motion support. A path itself must not be the only mechanism to reach content; list fallback mandatory.
- Drawer displays source contributions, original exercise name, confirmed mapping status, actual dates and completion; no hidden numerical 'activation' intensity. Empty state: 'No direct sets recorded for [group] in the last 14 days', with 'Only activities logged in Bloom are shown' when appropriate. Never display 'You neglected [group]' or 'X% recovered'.
- UI must not accidentally reuse `BVA-0022` exercise technique photo as a data-driven body map; that is an editorial/movement study asset, not anatomy geometry. Avoid anatomically inaccurate AI-generated muscle segmentation being promoted to educational truth.

## 7. Biology and AI boundary

**Phase 1:** pure deterministic projections, no model needed. The biological investigator may later consume a **permission-filtered source-qualified, time-bound summary** of actual recorded workout history. It may observe temporal overlap before a lab draw (e.g., CK/AST) or alongside fatigue/soreness; it **must not** assert exercise caused elevated biomarkers, compute tissue injury, endorse training despite restrictions, establish readiness or predict safe recovery time. Lab source/assay/date and confounder qualification remain mandatory. "Intense" needs real recorded session-intensity evidence, not simply a large number of weighted sets.

**Phase 2 (separate explicit eligibility and safety signoff):** use movement pattern, goals, equipment, reported restrictions and recently recorded work to present modest suggestions such as 'You have recorded push exercises but no pulling sets in this window; would you like to review a pulling option?' Do not interpret an injury field as physiologic clearance, diagnose asymmetry, or claim an optimum push/pull ratio. Check injury/restriction status and medical context via existing authorized canonical sources, use one existing ACTION/VOI system, and preserve user autonomy. Default not to nag on sparse logs.

## 8. Asset registry and existing art reconciliation

**Canonical registry:** `docs/visual-assets/visual-asset-registry.json`. On observed branch (2026-11-22), registry has entries up to `BVA-0077`, with `BVA-0005` Athlete editorial hero, `BVA-0022` exercise-technique study (previous rendition rejected, outstanding review/production) and `BVA-0023` recovery editorial (existing approved owner art, runtime review flags). **Do not silently change these records or falsely promote their lifecycle.** The BVA system requires actual source files, checksums, production rights, scientific/anatomical review when relevant, responsive rendered evidence and accessibility.

**Proposed additions (companion JSON):**
- `BVA-0078`: anterior interactive muscle map base **editable SVG geometry**, neutral anatomy, versioned stable paths.
- `BVA-0079`: posterior interactive muscle map base **editable SVG geometry**, same identity, line weight and geometry conventions.

**Review existing before making new:**
- `BVA-0005` Athlete hero: maintain for broader Athlete presentation; confirm latest owner-approved replacement/byte transfer and correct crop; never count as workout-specific art.
- `BVA-0022` Exercise technique study: reuse for featured movement card **only if** rendition, form, rights, high-contrast themes and current owner review genuinely pass. Existing rejected image cannot be restored silently. If unready use typography/icon fallback.
- `BVA-0023` recovery editorial: use only where contextually appropriate; not proof of a user's recovery or anatomy asset.
- Existing `design/bloom/exercise-intelligence/2026-10-29/amendment-d-v1.4` and Exercise Intelligence UX originals: audit actual files, hashes and amendment status; keep already approved child-set behavior. The attached `bloom_brand_delivery_v1(1).zip` in the current conversation contains `bloom-icon-athlete.svg`, athlete icons, a monochrome icon, logos and design tokens, **but no anatomical map**; it is an earlier brand delivery candidate, not automatic replacement of later approved visual assets. Do not copy it over current code unreviewed.

**Data semantics are not art production:** Region-to-SVG path mapping is a reviewed versioned deterministic data adapter. Require both technical path/schema validation and human anatomy review. Do not create custom photographic hero images or 3D muscle assets to satisfy this feature.

## 9. Detailed acceptance matrix — reuse existing harness; no new runner

The IDs below are **scoped requirements for later eligible implementation**, not an independent 16-item execution queue. Reconcile with `ML-ACT-1001..1008`, `UT-EXAI-2701..2708`, `MKT-EXAI-2813..2819`, `ATH-01..08`, `SNAP-01..04`, `SYS-01..10`, `PRIV-01..12` before writing tests. Name fixtures uniquely and attach source revisions and actual test receipts.

| ID | Synthetic fixture / procedure | Pass (required) | Hard fail |
| --- | --- | --- | --- |
| EX-MAP-01 | 3×10 bench, confirmed flat barbell variant; all sets complete | Chest direct sets = 3, source traceable; triceps/ant delts according reviewed secondary roles; no fractional 'effective sets' | Inferred activation %, unsupported science score, untraceable counts |
| EX-MAP-02 | 5 set bench with first 2 complete; remaining 3 planned | Only two completed sets count in all modes | Counting all five or a planned routine |
| EX-MAP-03 | `shoulder raises` with 7 set entries, no selected variation | Candidate/unmapped; no automatic deltoid detail added | Keyword guesses lateral delts or inflates coverage |
| EX-MAP-04 | User explicitly selects lateral raise, changes to front raise later | Recompute appropriate deltoid group; preserve original text and review revisions | Stale historical rollup or unlogged edit of source |
| EX-MAP-05 | 45-minute run and 30-minute cycling, confirmed completed | Endurance view associates appropriate regions and durations; strength direct sets remain 0 **recorded** | Endurance minutes convert into strength sets or summed across regions as total minutes |
| EX-MAP-06 | Same run represented once in Everyday and once in Athlete, explicit same-session linkage | Count once, show legitimate shared source | Double counting due to dual UI surfaces |
| EX-MAP-07 | Similar workouts two sessions, same time/duration, no explicit linkage | Preserve separate records, flag uncertainty if material | Silent dedup on timestamp/name heuristic |
| EX-MAP-08 | Workout edited to remove completed set, deleted entirely, or revoked | Current window/read model and detail invalidate; no resurrected contribution | Stale chart / cache / investigator fact |
| EX-MAP-09 | 14-day history empty; only 1 recorded workout of unknown completeness | 'No direct sets recorded' with coverage caveat, no universal deficit claim | 'You never trained hamstrings' or mandatory prescription |
| EX-MAP-10 | Custom 'my floor circuit', 3 user-tagged regions, no reviewed catalog ID | User tag shown qualified; no fabricated reviewed exercise mapping | Invented canonical identity or medical semantics |
| EX-MAP-11 | RDL, squat, heel-elevated squat, flat/incline press all confirmed | Versioned variation-specific mappings; correct muscles and distinct patterns | Collapse materially different variations to one generic mapping |
| EX-MAP-12 | 7/14/30 day windows over DST and exact boundary; future planned workout | Correct local calendar boundaries, no scheduled/future inclusion | UTC/off-by-one duplication or future work marked done |
| EX-MAP-13 | Account A and B in same session; concurrent queries | No cross-account read/cache or source IDs | A's muscle detail displayed for B |
| EX-MAP-14 | Catalog mapping revision changes after prior recorded workouts | Reproducible explicit revision behavior, updated/provenanced summary; no silent rewrite of source text | Past workouts silently change meaning without version trace |
| EX-MAP-15 | External dataset has unknown muscle string, duplicate IDs or unverified image paths | Build rejects or quarantines; preserves source license metadata | Silent dropping, duplicate exercise IDs, unauthorized GIF/photo bundling |
| EX-MAP-16 | Mobile 320px, desktop, keyboard-only, screen-reader, dark/light, reduced motion | Every group accessible using list fallback; readable legend and controls | Only clickable SVG path, clipped tooltip, color-only data |
| EX-MAP-17 | Deleted/unavailable SVG, feature toggle off or no JavaScript geometry | Functional accessible textual/list summary or safe neutral fallback | Blank/broken key activity view; invented numbers |
| EX-MAP-18 | CK elevation after strength work, missing assay/illness/training specificity | Only cautious temporal context if authorized; refrain from causation and precise recovery estimate | Claims workouts explain CK/AST or prescribes recovery without evidence |
| EX-MAP-19 | Injury/restriction entered, incomplete record, push-focused routine | Phase 1 purely descriptive; phase 2 suggestion withheld until allowed review/constraints | Recommends contraindicated exercise or nags about injury-associated missing work |
| EX-MAP-20 | Partial account logs, candidate exercises and rejected data edits | Distinct `0` vs unknown, full contribution ledger and honest fallback | Presents full-body 100% coverage or fabricates historical workouts |
| EX-MAP-21 | Complete current app source renders existing approved athlete exercise UI, with mapping feature disabled | Existing logging, compact child sets, source review, Athlete navigation and images unchanged | Breaks known MKT-EXAI review regressions or makes map required to log |
| EX-MAP-22 | Offline/no provider/network and custom manual logged exercise | Select built-in catalog, save existing manual workout if permitted, or explicitly pending; no dependency on third-party API | Claims saved when not; blocks manual capture on API outage |

**Release checkpoints:** (1) engineering with real exact HEAD/source-epoch receipts; (2) Biology/anatomy mapping review; (3) security/account/source invalidation; (4) accessibility/brand/UI review of original SVG light/dark/mobile; (5) hosted/consumer review when separately authorized. No phase is `CONSUMER_READY` simply because tests pass locally.

## 10. Bounded work plan once eligible (not now)

**Gate 0 — task eligibility:** Show explicit queue permission or owner-scoped instruction after GI baseline receipt; inspect relevant existing tests/revisions and registry actual HEAD; return a reuse/gap matrix **before changes**. No speculative broad change.

**Slice 1 — catalog + identity:** Rights review; pinned, reviewed local subset; backwards-compatible optional exercise ID + review state; existing describe/select/repeat and stable child sets. Prove EX-MAP-02/03/04/11/14/15/21/22.

**Slice 2 — projection:** Pure source-scoped strength/endurance read model; contribution/dedup/invalidation/time handling; no visual image dependency. Prove EX-MAP-01/05/06/07/08/09/10/12/13/20.

**Slice 3 — SVG map & registry:** Confirm actual BVA ID availability; review/reuse earlier approved assets, create/review original anatomically correct front/back SVGs, wire accessible list fallback, verify light/dark/mobile; no lifecycle promotion until evidence. Prove EX-MAP-16/17.

**Slice 4 — controlled context exposure:** Only after investigator input eligibility and permissions are verified; add descriptive workout participation to existing snapshot if justified and safe, no new recommendation pathway. Prove EX-MAP-18 and existing INV/SEC guardrails. Phase 2 planning explicitly remains pending.

**Stop conditions:** rights not verified; inaccurate SVG anatomy; no safe compatible identity store; ambiguous double-log linkage; incomplete confirmed exercise role review; evidence/permission boundary fails; current queue not eligible. Report blockers, don't silently weaken requirements, and don't generate/replace asset bytes without source/owner/design/rights checks.

**Required Codex receipt when work becomes eligible:** actual HEAD/branch, what was already built, exact file:line+SHA evidence, source license and review matrix, selected smallest slice, changed files only, focused test commands/results with failure taxonomy, asset registry IDs/lifecycle and hashes, independent Science/Security/Design statuses, blockers, and next task **under the existing queue**. Do not claim hosted validation from local tests. Do not commit handoff artifacts or alter active queue unless specifically authorized.