import {mealRecordRevision} from './meal-edit';
import {z} from 'zod';
import {readNutrientSourceSnapshots} from '../shared/nutrient-source-snapshot';
import type {Meal} from '../shared/schema';
import type {WellnessFoodObservation} from '../shared/wellness-actions';
/** A minimized projection of saved owned journal records. No totals, inferred
 * servings, absorption or adequacy; original composition stays in the journal. */
export function foodSourceObservations(account:string,records:readonly Meal[],now:Date):WellnessFoodObservation[]{
 return records.filter(record=>!!account&&record.userId===account).map(record=>{
  const rawTime:unknown=record.loggedAt,date=rawTime instanceof Date?rawTime:typeof rawTime==='string'&&z.iso.datetime({offset:true}).safeParse(rawTime).success?new Date(rawTime):null;
  const recordedAt=date&&Number.isFinite(+date)?date.toISOString():null;
  const source=record.intelligence&&typeof record.intelligence==='object'&&!Array.isArray(record.intelligence)?readNutrientSourceSnapshots((record.intelligence as Record<string,unknown>).nutrientSourceSnapshots):readNutrientSourceSnapshots(undefined);
  return{sourceId:record.id,sourceKind:'meal',sourceRevision:mealRecordRevision({...record,loggedAt:rawTime instanceof Date&&!Number.isFinite(+rawTime)?null as any:record.loggedAt}),valueKind:'recorded-meal',recordedAt,dateBasis:recordedAt?'meal-record-time':'not-recorded',temporalStatus:!recordedAt||!Number.isFinite(+now)?'unknown':Date.parse(recordedAt)>+now?'future-entry':'elapsed-entry',genericSourceStatus:source.status,capturedGenericSources:source.status==='available'?source.snapshots.length:null};
 });
}
