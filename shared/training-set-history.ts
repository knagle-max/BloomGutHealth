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
