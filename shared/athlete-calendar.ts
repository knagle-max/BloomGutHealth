import { dateKey, type ExperienceRecord } from './experience';
/** Calendar presentation only: selected source records, never rest/readiness or
 * inferred completion. Local boundaries match the user's existing plan date. */
export function athleteCalendarSummary(records: ExperienceRecord[], date: string, now = new Date()) {
    const valid = dateKey.safeParse(date).success;
    if (!valid)
        return { validDate: false, planned: 0, completed: 0, unconfirmed: 0, session: undefined };
    const start = new Date(date + 'T00:00:00'), end = new Date(start);
    end.setDate(end.getDate() + 1);
    let unconfirmed = 0;
    const sessions = records.flatMap(record => {
        if (record.kind !== 'session' || record.payload.status === 'cancelled')
            return [];
        const at = Date.parse(record.payload.startsAt), minutes = record.payload.minutes;
        if (!Number.isFinite(at) || !Number.isInteger(minutes) || minutes < 1 || minutes > 600) {
            unconfirmed++;
            return [];
        }
        if (!['planned', 'completed'].includes(record.payload.status)) {
            unconfirmed++;
            return [];
        }
        return at < +end && at + minutes * 60000 > +start ? [record] : [];
    }).sort((a, b) => Date.parse(a.payload.startsAt) - Date.parse(b.payload.startsAt) || a.id.localeCompare(b.id));
    const planned = sessions.filter(record => record.payload.status === 'planned'), completed = sessions.filter(record => record.payload.status === 'completed');
    const session = planned.find(record => Date.parse(record.payload.startsAt) >= +now) || planned[0] || completed.at(-1);
    return { validDate: true, planned: planned.length, completed: completed.length, unconfirmed, session };
}
