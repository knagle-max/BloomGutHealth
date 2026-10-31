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

/** Actual occurrences of a browser-local wall clock, including half-hour DST folds. */
export function localLabDateInstants(enteredDate: string, enteredTime: string) {
  if (!z.iso.date().safeParse(enteredDate).success || (enteredTime && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(enteredTime))) throw Error('Choose a valid test date and collection time.');
  const clock = enteredTime || '12:00', date = new Date(`${enteredDate}T${clock}:00`);
  const pad = (value: number) => String(value).padStart(2, '0');
  const matches = (value: Date) => `${value.getFullYear()}-${pad(value.getMonth()+1)}-${pad(value.getDate())}` === enteredDate && `${pad(value.getHours())}:${pad(value.getMinutes())}` === clock;
  if (!Number.isFinite(+date) || !matches(date)) throw Error('This local time does not exist in your current timezone. Review the source date and time.');
  const offsets = enteredTime ? Array.from(new Set([new Date(+date-86400000).getTimezoneOffset(), date.getTimezoneOffset(), new Date(+date+86400000).getTimezoneOffset()])) : [date.getTimezoneOffset()];
  return offsets.map(offset => new Date(+date+(offset-date.getTimezoneOffset())*60000)).filter(matches)
    .sort((a,b)=>+a-+b).map(value=>({measuredAt:value.toISOString(),offsetMinutes:value.getTimezoneOffset()}));
}
/** No absent-time provenance is invented and ambiguous occurrences require an explicit choice. */
export function labMeasuredAtFromLocal(enteredDate: string, enteredTime: string, selectedInstant?: string): string {
  const choices=localLabDateInstants(enteredDate,enteredTime);
  if(choices.length>1&&!selectedInstant)throw Error('This collection time occurs twice. Choose its UTC offset or leave collection time empty.');
  const selected=selectedInstant?choices.find(choice=>choice.measuredAt===selectedInstant):choices[0];
  if(!selected)throw Error('Review the collection time and its selected UTC offset.');
  return selected.measuredAt;
}
export function labDateChangeFromLocal(enteredDate: string, enteredTime: string, reason: string, selectedInstant?: string): LabDateChange {
  return labDateChangeSchema.parse({ enteredDate, ...(enteredTime ? { enteredTime } : {}), measuredAt:labMeasuredAtFromLocal(enteredDate,enteredTime,selectedInstant), reason, reviewed: true });
}

export function labUtcOffsetLabel(offsetMinutes:number){return `UTC${offsetMinutes<=0?"+":"-"}${String(Math.floor(Math.abs(offsetMinutes)/60)).padStart(2,"0")}:${String(Math.abs(offsetMinutes)%60).padStart(2,"0")}`;}
