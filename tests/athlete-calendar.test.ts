import test from 'node:test';
import assert from 'node:assert/strict';
import { athleteCalendarSummary } from '../shared/athlete-calendar';
import { trainingSessionSchema, type ExperienceRecord } from '../shared/experience';
const record = (id: string, startsAt: string, status: 'planned' | 'completed' | 'cancelled' = 'planned', minutes = 60) => ({ id, kind: 'session', payload: trainingSessionSchema.parse({ title: id, startsAt, status, minutes, intensity: 'easy', discipline: 'endurance' }) }) as ExperienceRecord;
test('calendar selects the next saved local-day plan stably, preserves actual completion and excludes cancellation/outside dates', () => {
    const date = '2026-10-25', start = new Date(date + 'T00:00:00'), at = (hours: number) => new Date(+start + hours * 3600000).toISOString();
    const records = [record('later', at(19)), record('first', at(15)), record('done', at(8), 'completed'), record('cancelled', at(14), 'cancelled'), record('tomorrow', at(30)), record('night', at(-.5), 'planned', 60)];
    const before = structuredClone(records);
    const summary = athleteCalendarSummary(records, date, new Date(at(12)));
    assert.equal(summary.session?.id, 'first');
    assert.equal(summary.planned, 3);
    assert.equal(summary.completed, 1);
    assert.equal(summary.validDate, true);
    assert.deepEqual(records, before);
    const empty = athleteCalendarSummary([], date, new Date(at(12)));
    assert.equal(empty.session, undefined);
    assert.equal('restDay' in empty, false);
    assert.equal('readiness' in empty, false);
});
test('invalid source dates and durations require review rather than crashing or creating a rest/complete claim', () => {
    const valid = record('saved', '2026-10-25T15:00:00Z');
    const malformed = [{ ...valid, id: 'bad-date', payload: { ...valid.payload, startsAt: 'invalid' } }, { ...valid, id: 'bad-duration', payload: { ...valid.payload, minutes: 0 } }] as ExperienceRecord[];
    const summary = athleteCalendarSummary(malformed, '2026-10-25');
    assert.equal(summary.unconfirmed, 2);
    assert.equal(summary.session, undefined);
    assert.equal(athleteCalendarSummary([valid], '2026-02-30').validDate, false);
});
