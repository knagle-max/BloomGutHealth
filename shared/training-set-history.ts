import {z} from 'zod';
import type {ActualSets, TrainingSession} from './experience';

const exerciseKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en');
export type PreviousSet = {set: ActualSets['sets'][number]; startsAt: string; title: string; position: number};

/** Read-only references, never a prescription or a prefilled current observation. */
export function previousTrainingSets(
  sets: ActualSets['sets'], history: TrainingSession[], before: string, now = Date.now(),
): (PreviousSet | undefined)[] {
  const cutoff = Math.min(Date.parse(before), now);
  if (!Number.isFinite(cutoff)) return sets.map(() => undefined);
  const sessions = history.filter(session => session.status === 'completed' &&
    Number.isFinite(Date.parse(session.startsAt)) && Date.parse(session.startsAt) < cutoff)
    .slice().sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
  const occurrences = new Map<string, number>();
  return sets.map(current => {
    const key = exerciseKey(current.exercise), occurrence = occurrences.get(key) ?? 0;
    occurrences.set(key, occurrence + 1);
    if (!key) return undefined;
    for (const session of sessions) {
      // Match the ordinal among *all* same-name rows; skipped rows must not shift later sets.
      const candidates = session.actualSets?.sets.map((set, index) => ({set, position: index + 1}))
        .filter(({set}) => exerciseKey(set.exercise) === key);
      const candidate = candidates?.[occurrence];
      if (candidate?.set.completed && candidate.set.state !== 'planned' && candidate.set.state !== 'cancelled') {
        return {...candidate, startsAt: session.startsAt, title: session.title};
      }
    }
    return undefined;
  });
}

export const completedExerciseHistoryVersion = 'completed-exercise-history-v1' as const;
type HistoryRecord = import('./experience').ExperienceRecord;
type HistorySet = ActualSets['sets'][number];
export type OwnedExerciseHistorySource = {
  /** Construct only from the current actor-bound canonical query, never another account's cache. */
  ownerId: string;
  available: boolean;
  records: readonly HistoryRecord[];
};
export type CompletedExerciseObservation = {
  key: string;
  setId: string | null;
  exercise: string;
  catalogueRef: HistorySet['catalogueRef'] | null;
  occurredAt: string;
  timeBasis: 'record-start';
  timeZone: string | null;
  reps: number | null;
  loadKg: number | null;
  loadUnit: HistorySet['loadUnit'] | null;
  side: HistorySet['side'];
  bodyweight: true | null;
  // Only explicit source context supplies convention/equipment. Never infer it
  // from catalogue tags or a preference on the current draft.
  loadConvention: NonNullable<HistorySet['loadContext']>['convention'] | null;
  equipmentInstance: string | null;
  setRole: 'working' | 'warm-up' | null;
  setEffort: number | null;
  sources: {recordId: string; updatedAt: string; kind: 'activity' | 'session'; title: string; componentId: string | null; position: number; exercisePosition: number; workingPosition: number; nonWarmupSetCount: number; occurredAt: string; timeZone: string | null}[];
};

/** Read-only performance facts over existing owned records, not another journal.
 * Ownership still belongs to the authenticated collector/API; this envelope check
 * prevents accidental cross-account reuse and discards unavailable cached facts.
 * This projection makes no comparison to a current draft or progression target.
 */
export function completedExerciseHistory(
  source: OwnedExerciseHistorySource,
  options: {actorId: string; before: string; asOf: string; excludeRecordIds?: readonly string[]},
) {
  if (!options.actorId.trim() || source.ownerId !== options.actorId) throw Error('EXERCISE_HISTORY_SCOPE_MISMATCH');
  const instant = z.string().datetime({offset:true});
  if (!instant.safeParse(options.before).success || !instant.safeParse(options.asOf).success) throw Error('EXERCISE_HISTORY_TIME_REQUIRED');
  const before = Date.parse(options.before), asOf = Date.parse(options.asOf);
  if (!Number.isFinite(before) || !Number.isFinite(asOf)) throw Error('EXERCISE_HISTORY_TIME_REQUIRED');
  const cutoff = Math.min(before, asOf);
  const observations: CompletedExerciseObservation[] = [];
  const excluded: {recordId: string; reason: string}[] = [];
  const conflictingSetKeys: string[] = [];
  const response = (status: 'SOURCE_UNAVAILABLE' | 'NO_CONFIRMED_HISTORY' | 'HISTORY_AVAILABLE_NOT_COMPARABLE') => ({
    version: completedExerciseHistoryVersion, ownerId: source.ownerId, status,
    before: options.before, asOf: options.asOf, observations, excluded, conflictingSetKeys,
    qualification: 'Recorded completed sets only. Times are parent record starts, not individual set timestamps. Load convention/equipment require explicit stored context; set role and set effort require explicit stored context. These are references, not progression targets.',
  });
  if (!source.available) return response('SOURCE_UNAVAILABLE');
  if (source.records.length > 5000) throw Error('EXERCISE_HISTORY_LIMIT');
  const ignored = new Set(options.excludeRecordIds ?? []);
  const records = new Map<string, HistoryRecord>(), conflicts = new Set<string>(), invalidRevisions = new Set<string>();
  for (const record of source.records) {
    const owner = (record as HistoryRecord & {userId?: string}).userId;
    if (owner !== undefined && owner !== options.actorId) throw Error('EXERCISE_HISTORY_SCOPE_MISMATCH');
    if (record.kind !== 'activity' && record.kind !== 'session') continue;
    if (ignored.has(record.id)) continue;
    // An invalid/newest revision must not uncover an older accepted payload.
    if (!instant.safeParse(record.updatedAt).success) { invalidRevisions.add(record.id); continue; }
    const old = records.get(record.id);
    if (!old || Date.parse(record.updatedAt) > Date.parse(old.updatedAt)) { records.set(record.id, record); conflicts.delete(record.id); }
    else if (Date.parse(record.updatedAt) === Date.parse(old.updatedAt) && JSON.stringify(record) !== JSON.stringify(old)) conflicts.add(record.id);
  }
  for (const id of Array.from(invalidRevisions)) conflicts.add(id);
  for (const id of Array.from(conflicts)) { records.delete(id); excluded.push({recordId: id, reason: 'ambiguous-source-revision'}); }
  const candidates: CompletedExerciseObservation[] = [];
  const unconfirmed = new Set<string>();
  let inspectedSets = 0;
  const collect = (record: Extract<HistoryRecord, {kind:'activity'|'session'}>, sets: HistorySet[], occurredAt: string, componentId: string | null) => {
    const time = Date.parse(occurredAt);
    if (!instant.safeParse(occurredAt).success || !Number.isFinite(time) || time >= cutoff) { excluded.push({recordId: record.id, reason: 'not-before-cutoff'}); return; }
    const positions=new Map<string,number>(),workingPositions=new Map<string,number>();
    for (const [index, set] of Array.from(sets.entries())) {
      const identity=set.catalogueRef?.id??exerciseKey(set.exercise),exercisePosition=(positions.get(identity)??0)+1;positions.set(identity,exercisePosition);
      const workingPosition=(workingPositions.get(identity)??0)+(set.loadContext?.setRole==='warm-up'?0:1);workingPositions.set(identity,workingPosition);
      if (++inspectedSets > 20000) throw Error('EXERCISE_HISTORY_LIMIT');
      if (!set.completed || set.state === 'planned' || set.state === 'cancelled') { if (set.id) unconfirmed.add('set:' + set.id.toLowerCase()); continue; }
      if (candidates.length >= 20000) throw Error('EXERCISE_HISTORY_LIMIT');
      candidates.push({
        key: set.id ? 'set:' + set.id.toLowerCase() : 'legacy:' + JSON.stringify([record.id, componentId, index]),
        setId: set.id?.toLowerCase() ?? null, exercise: set.exercise,
        catalogueRef: set.catalogueRef ? {...set.catalogueRef} : null,
        occurredAt, timeBasis: 'record-start', timeZone: record.kind === 'activity' ? record.payload.timeZone : null, reps: set.reps, loadKg: set.loadKg, loadUnit: set.loadUnit ?? null,
        side: set.side ?? null, bodyweight: set.bodyweight ?? null,
        loadConvention: set.loadContext?.convention ?? null, equipmentInstance: set.loadContext?.equipmentKey ?? null, setRole: set.loadContext?.setRole ?? null, setEffort: set.loadContext?.effortRpe ?? null,
        sources: [{recordId: record.id, updatedAt: record.updatedAt, kind: record.kind as 'activity' | 'session', title: record.payload.title,
          componentId, position: index + 1, exercisePosition, workingPosition,
          nonWarmupSetCount:sets.filter(other=>(other.catalogueRef?.id??exerciseKey(other.exercise))===identity&&other.loadContext?.setRole!=='warm-up').length, occurredAt, timeZone: record.kind === 'activity' ? record.payload.timeZone : null}],
      });
    }
  };
  for (const record of Array.from(records.values())) {
    if (Date.parse(record.updatedAt) > asOf) { excluded.push({recordId: record.id, reason:'source-after-asof'}); continue; }
    if (record.kind === 'session') {
      if (record.payload.status === 'completed') collect(record, record.payload.actualSets?.sets ?? [], record.payload.startsAt, null);
    } else if (record.kind === 'activity') {
      // A routine's log-time is not the exercise occurrence time. Keep its actual
      // dated source in the journal, but do not silently order it as an exposure.
      if (record.payload.routineSource?.timestampBasis === 'log-time') { excluded.push({recordId: record.id, reason: 'reported-day-not-exact-time'}); continue; }
      if (record.payload.components) for (const part of record.payload.components.items)
        collect(record, part.actualSets?.sets ?? [], record.payload.startedAt, part.id);
      else collect(record, record.payload.actualSets?.sets ?? [], record.payload.startedAt, null);
    }
  }
  const unique = new Map<string, CompletedExerciseObservation>(), setConflicts = new Set<string>();
  const basis = (row: CompletedExerciseObservation) => JSON.stringify([row.exercise, row.catalogueRef, Date.parse(row.occurredAt), row.reps, row.loadKg, row.loadUnit, row.side, row.bodyweight, row.loadConvention, row.equipmentInstance,row.setRole,row.setEffort]);
  for (const row of candidates.sort((a, b) => a.sources[0].recordId.localeCompare(b.sources[0].recordId))) {
    const old = unique.get(row.key);
    if (!old) unique.set(row.key, row);
    else if (basis(old) !== basis(row)) setConflicts.add(row.key);
    else old.sources.push(...row.sources);
  }
  for (const key of Array.from(unconfirmed)) if (unique.has(key)) setConflicts.add(key);
  for (const key of Array.from(setConflicts)) { unique.delete(key); conflictingSetKeys.push(key); }
  for (const row of Array.from(unique.values())) {
    row.sources = Array.from(new Map(row.sources.map(s => [JSON.stringify([s.recordId, s.componentId, s.position]), s])).values());
    observations.push(row);
  }
  observations.sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || a.key.localeCompare(b.key));
  excluded.sort((a,b) => a.recordId.localeCompare(b.recordId) || a.reason.localeCompare(b.reason));
  conflictingSetKeys.sort();
  return response(observations.length || excluded.length || conflictingSetKeys.length ? 'HISTORY_AVAILABLE_NOT_COMPARABLE' : 'NO_CONFIRMED_HISTORY');
}
