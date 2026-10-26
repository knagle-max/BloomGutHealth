import { z } from 'zod';
import { labSchema, sourceOnlyLabSchema, labEnteredContext, type Lab, type SourceOnlyLab } from './precision-nutrition';
export const labDateChangeSchema = z.object({
  enteredDate: z.iso.date(),
  enteredTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).optional(),
  measuredAt: z.string().datetime({ offset: true }).refine(value => Date.parse(value) <= Date.now(), 'Future measurements are not allowed'),
  reason: z.string().trim().min(1).max(300),
  reviewed: z.literal(true),
}).strict();
export type LabDateChange = z.infer<typeof labDateChangeSchema>;

/** Replaces entry context only; original facts remain in both immutable observations. */
export function applyLabDateChange(source: Lab | SourceOnlyLab, sourceId: string, input: LabDateChange, fingerprint: string, now: string): Lab | SourceOnlyLab {
  const request = labDateChangeSchema.parse(input), previous = labEnteredContext(source);
  if (previous?.enteredDate === request.enteredDate && previous.enteredTime === request.enteredTime) throw Error('LAB_DATE_UNCHANGED');
  const dateCorrection = {
    version: 1 as const, supersedes: sourceId, previousMeasuredAt: source.measuredAt,
    ...(previous?.enteredDate ? { previousEnteredDate: previous.enteredDate } : {}),
    ...(previous?.enteredTime ? { previousEnteredTime: previous.enteredTime } : {}),
    enteredDate: request.enteredDate, ...(request.enteredTime ? { enteredTime: request.enteredTime } : {}),
    correctedAt: now, reason: request.reason, requestFingerprint: fingerprint,
  };
  const { enteredDate: _oldDate, enteredTime: _oldTime, ...identity } = source.sourceReport || {};
  const payload = { ...source, measuredAt: request.measuredAt, dateCorrection,
    ...(source.sourceReport ? { sourceReport: { ...identity, importId: source.sourceReport.importId, enteredDate: request.enteredDate, ...(request.enteredTime ? { enteredTime: request.enteredTime } : {}) } } : {}),
  };
  return 'sourceOnly' in source ? sourceOnlyLabSchema.parse(payload) : labSchema.parse(payload);
}

/** Browser-local wall clock validation, including skipped DST times/dates. No absent-time provenance is invented. */
export function labDateChangeFromLocal(enteredDate: string, enteredTime: string, reason: string): LabDateChange {
  if (!z.iso.date().safeParse(enteredDate).success || (enteredTime && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(enteredTime))) throw Error('Choose a valid test date and collection time.');
  const clock = enteredTime || '12:00', date = new Date(`${enteredDate}T${clock}:00`);
  const pad = (value: number) => String(value).padStart(2, '0');
  const calendar = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  if (!Number.isFinite(+date) || calendar !== enteredDate || `${pad(date.getHours())}:${pad(date.getMinutes())}` !== clock) throw Error('This local time does not exist in your current timezone. Review the source date and time.');
  return labDateChangeSchema.parse({ enteredDate, ...(enteredTime ? { enteredTime } : {}), measuredAt: date.toISOString(), reason, reviewed: true });
}
