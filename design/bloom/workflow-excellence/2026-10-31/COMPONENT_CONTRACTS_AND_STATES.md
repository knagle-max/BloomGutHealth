# Bloom — Workflow component and state contracts
Version 1.0 | design-only | 2026-10-31
**Existing brand:** evergreen #246B50, deeper #173F32, ivory #FAF9F4, sage #88AA91, dark neutral #162A22. Reuse established typography/components; no new sub-brand.

## Architecture / feature-preservation invariants
- All modes use one canonical session with exercise IDs, source text/spans, set-level reps/loads/units/completion, provenance and revision history.
- Everyday explicitly retains add/edit/delete sets and full rep/load editing; Athlete alone adds muscle maps, estimated energy, effort/volume/analysis.
- Reported total reps do not imply set count: '50 push-ups' = 50 total, sets unknown.
- Never merge planned with completed merely because they share date; linked via explicit identity/status.
- No fake calorie estimates for absent time/body mass; no fake zero for unknown biomarkers, macros or exercise values.
- Revised data must not erase advanced fields; preserve source, date, units, chart, research citations and historical corrections.
- No asset should be necessary for data entry; neutral text fallbacks are first-class.

## Components (presentation contracts; not implementation code)
### WorkoutLaunch
props: savedRoutine[], recentSession[], activeDraft?, onStartRoutine, onStartEmpty, onResume; states idle/loading/offline/error/empty; default CTA 'Resume workout' if actual draft exists else 'Start workout'.

### ExerciseSetEditor
props: exerciseId, exerciseName, performedSets[{id,reps?,loadCanonicalKg?,displayUnit,completed,origin}], previousSets[], totalReps? (without set division), timers?, readOnly, onChangeSet(id,patch), onAddSet, onRemoveSet, onCompleteSet, onUndo.
Rules: explicit 'Previous' read-only column; weight/reps directly editable; completion button 44px minimum; no conversion of missing reps to zero; autosave state is visible; preserve ordered set IDs.

### ExerciseReplacementSheet
props: currentExerciseId, equipmentAvailable[], candidates[{id,name,equipment,movement,primaryMuscleIds}], onSelect, onCancel.
Rules: do not overwrite previous exercise set records; warn about incompatible attributes; fallback to original and manual entry.

### WorkoutReviewSave
props: workoutId, draftSummary, sourceStatus, uncompletedSets, onSave, onContinue, onDiscard; states saving/saved/failed/offline.
Rules: clear 'Finish and save' and error retry; no success toast without server ack; local draft retained on save failure.

### TodayMeaningCard
props: sourceMetric?, measuredAt?, observation?, interpretation?, nextAction?, evidenceLink?; state stale/insufficient/loading/error; only one priority message at top; no algorithmic personalized verdict from insufficient data.

### BiomarkerBrowser / MarkerDetail
props: categories, markerId, observations[{value,unit,date,source,status}], selectedDate?, comparator?, onOpenSource, onCorrect; states empty/loading/partial/error/restricted.
Rules: recent value and date visible; trend only if comparable data; source/lab date correction reachable, research expansion one action away.

### NutritionSummary
props: knownMacroTotal?, nutrientCompleteness, highlightedTargets, allNutrients, onExpand.
Rules: show 3–5 highlights, deep full-list; missing != zero; per-nutrient status and source; no false coverage total.

## States matrix
| Component | Empty | Loading | Error/offline | Data partial | Success |
|---|---|---|---|---|---|
| WorkoutLaunch | Start an empty workout | Skeleton routines | 'Offline: start a local draft' when supported | Resume saved draft | Routine preview |
| ExerciseSetEditor | Add first set | Preserve editable draft; delayed history | Retain local edits, retry; no silent wipe | 'Reps not recorded' | Checkmark + timer with undo |
| Replacement | 'No matches for equipment' plus show all | Filter placeholder | Keep existing exercise | Label suggestions as candidates | Confirm selection |
| Save | No completed sets: confirm save-as-incomplete | Disabled duplicate submit | 'Not saved; retry' | Mark partial session clearly | Server-confirmed saved state |
| Today | 'Log your first activity' | Height-stable skeleton | Most recent cached timestamp | 'Not enough data to interpret' | One relevant insight |
| Biology | 'Import or enter a result' | Skeleton category rows | Source failed / stale date | 'Some results unavailable' | Dated value + trend, source |
| Nutrition | No foods logged | Skeleton | Preserve diary; show totals unavailable | Partial nutrient coverage | Highlights + expandable all |

## Accessibility and responsive acceptance
320px: set table retains all columns via horizontally contained labeled scroll OR stacked set rows; never obscure Done/check buttons. 44×44px pointer/touch targets. 200% zoom and text scaling: two-line labels, no fixed-height clipped rows. Focus returns from substitution sheet to original exercise. Keyboard: tab through every editable set, visible focus and programmatic names 'Bench press, set 2, weight, kilograms'. VoiceOver announces previous as historical, not editable. Dark palette WCAG AA contrast where feasible and manual measured checks. Motion optional; no time pressure. All major actions have textual equivalents.
