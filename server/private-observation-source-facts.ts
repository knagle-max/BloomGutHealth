import {createHash} from 'node:crypto';
import {z} from 'zod';
import {checkinSchema as precisionCheckinSchema,type PrecisionRecord} from '../shared/precision-nutrition';
import {checkinSchema,hydrationSchema,activitySchema,trainingSessionSchema} from '../shared/experience';
import {intakeCalendarDate} from '../shared/recorded-intake-sources';
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const timestamp=z.iso.datetime({offset:true});
function instant(value:unknown):string|null {
 if(value instanceof Date)return Number.isFinite(+value)?value.toISOString():null;
 return timestamp.safeParse(value).success?value as string:null;
}
const kinds=['checkin','hydration','activity','session'] as const;
export type ObservationFeedKind=typeof kinds[number];
type FeedStats={records:number;projected:number;unsupported:number;future:number;notPerformed:number};
type SourceFact={
 id:string;domain:'checkin'|'sleep'|'hydration'|'activity';sourceId:string;sourceKind:string;revision:string;
 metric:string;amount:number|null;unit:string|null;occurredAt:string|null;calendarDate:string|null;
 dateBasis:'source-recorded-checkin-time'|'source-calendar-date'|'source-recorded-activity-time'|'source-session-start-field';
 timePrecision:'stored-timestamp-only'|'calendar-date-only'|'source-entered-timestamp'|'scheduled-field-not-confirmed-occurrence';
 timeZone:string|null;recordedAt:string;updatedAt:string|null;sourceOriginal:unknown;
 valueKind:'self-reported-observation'|'source-recorded-activity';scope:string;
 completion:'not-applicable'|'confirmed-performed'|'not-established';reportedActivity?:string;effort?:string|null;
};
/** Projection over existing owned readers, not a tracker, diagnosis, new store
 * or assertion of complete habitual intake/activity. Notes/capture prose are
 * excluded. A date-only record never acquires a fabricated midnight or zone. */
export function privateObservationSourceFacts(input:{actor:string;precision:readonly PrecisionRecord[];experience:Record<ObservationFeedKind,readonly unknown[]>;asOf:Date;viewTimeZone:string}){
 if(!input.actor||!Number.isFinite(+input.asOf))throw Error('PRIVATE_OBSERVATION_SOURCE_UNAVAILABLE');
 const today=intakeCalendarDate(input.asOf.toISOString(),input.viewTimeZone);if(!today)throw Error('PRIVATE_OBSERVATION_SOURCE_UNAVAILABLE');
 const facts:SourceFact[]=[],stats:Record<string,FeedStats>={},feedRevisions:Record<string,string>={};
 const initialize=(kind:string,rows:readonly unknown[])=>{
  if(!Array.isArray(rows)||rows.length>=2000)throw Error('PRIVATE_OBSERVATION_SOURCE_UNAVAILABLE');
  const seen=new Set<string>();
  for(const value of rows){if(value&&typeof value==='object'){
   if('userId'in value&&value.userId!==input.actor)throw Error('PRIVATE_OBSERVATION_SOURCE_UNAVAILABLE');
   if('id'in value&&typeof value.id==='string'){if(seen.has(value.id))throw Error('PRIVATE_OBSERVATION_SOURCE_UNAVAILABLE');seen.add(value.id);}
  }}
  stats[kind]={records:rows.length,projected:0,unsupported:0,future:0,notPerformed:0};feedRevisions[kind]=hash(rows);
 };
 const precision=input.precision.filter(row=>row.kind==='checkin');initialize('precision-checkin',precision);
 const header=(row:any,sourceKind:string)=>{
  const recordedAt=instant(row.createdAt),updatedAt=row.updatedAt===undefined?null:instant(row.updatedAt);
  if(typeof row.id!=='string'||!row.id||!recordedAt||(row.updatedAt!==undefined&&!updatedAt)){stats[sourceKind].unsupported++;return null;}
  if(Date.parse(recordedAt)>+input.asOf||(updatedAt!==null&&Date.parse(updatedAt)>+input.asOf)){stats[sourceKind].future++;return null;}
  return {sourceId:row.id,sourceKind,revision:hash(row),recordedAt,updatedAt};
 };
 const append=(base:Omit<SourceFact,'id'|'metric'|'amount'|'unit'|'sourceOriginal'>,metric:string,amount:number|null,unit:string|null,sourceOriginal:unknown=null)=>{
  if(amount===null)return;
  facts.push({...base,id:`observation:${base.sourceKind}:${base.sourceId}:${metric}`,metric,amount,unit,sourceOriginal});
 };
 for(const row of precision){
  const base=header(row,'precision-checkin');if(!base)continue;
  const parsed=precisionCheckinSchema.safeParse(row.payload);if(!parsed.success){stats['precision-checkin'].unsupported++;continue;}
  const value=parsed.data;if(Date.parse(value.measuredAt)>+input.asOf){stats['precision-checkin'].future++;continue;}
  const common={...base,domain:'checkin' as const,occurredAt:value.measuredAt,calendarDate:null,dateBasis:'source-recorded-checkin-time' as const,timePrecision:'stored-timestamp-only' as const,timeZone:null,valueKind:'self-reported-observation' as const,scope:'single-recorded-checkin',completion:'not-applicable' as const};
  for(const [key,unit]of [['bloating','0-10'],['energy','0-10'],['weightKg','kg'],['waistCm','cm'],['bodyFatPercent','%'],['adherencePercent','%']]as const){
   const original=key==='weightKg'?value.entrySource?.fields.weight:key==='waistCm'?value.entrySource?.fields.waist:value.entrySource?.fields[key];
   append(common,key,value[key],unit,original??null);
  }
  stats['precision-checkin'].projected++;
 }
 for(const kind of kinds){
  const rows=input.experience[kind];initialize(kind,rows);
  for(const raw of rows){
   if(!raw||typeof raw!=='object'||!('kind'in raw)||raw.kind!==kind||!('payload'in raw)){stats[kind].unsupported++;continue;}
   const row=raw as any,base=header(row,kind);if(!base)continue;
   if(kind==='checkin'||kind==='hydration'){
    const parsed=(kind==='checkin'?checkinSchema:hydrationSchema).safeParse(row.payload);
    if(!parsed.success){stats[kind].unsupported++;continue;}
    const value=parsed.data;if(value.date>today){stats[kind].future++;continue;}
    const common={...base,domain:(kind==='hydration'?'hydration':'checkin') as SourceFact['domain'],occurredAt:null,calendarDate:value.date,dateBasis:'source-calendar-date' as const,timePrecision:'calendar-date-only' as const,timeZone:null,valueKind:'self-reported-observation' as const,scope:kind==='hydration'?'hydration-session-only':'single-calendar-checkin',completion:'not-applicable' as const};
    if(kind==='checkin'){
     const values=checkinSchema.parse(value);
     append({...common,domain:'sleep'},'sleepHours',values.sleepHours,'h');
     for(const key of ['energy','hunger','digestion','soreness']as const)append(common,key,values[key],'0-10');
    }else{
     const values=hydrationSchema.parse(value);
     for(const [key,unit]of [['drankMl','mL'],['preKg','kg'],['postKg','kg']]as const)append(common,key,values[key],unit,values.entrySource?.fields[key]??null);
     append(common,'sessionMinutes',values.minutes,'min');
     // Legacy parser defaults do not establish an explicitly reported zero.
     if(values.entrySource?.fields.urineMl)append(common,'urineMl',values.urineMl,'mL',values.entrySource.fields.urineMl);
    }
   }else if(kind==='activity'){
    const parsed=activitySchema.safeParse(row.payload);if(!parsed.success){stats[kind].unsupported++;continue;}
    const value=parsed.data;if(Date.parse(value.startedAt)>+input.asOf){stats[kind].future++;continue;}
    const common={...base,domain:'activity' as const,occurredAt:value.startedAt,calendarDate:null,dateBasis:'source-recorded-activity-time' as const,timePrecision:'source-entered-timestamp' as const,timeZone:value.timeZone,valueKind:'source-recorded-activity' as const,scope:'recorded-activity-description',reportedActivity:value.title,effort:value.effort,completion:(value.routineSource?.confirmedPerformed?'confirmed-performed':'not-established') as SourceFact['completion']};
    append(common,'durationMinutes',value.minutes,'min');append(common,'distanceM',value.distanceM??null,'m');
    // A running description with unknown duration is still an activity source.
    if(value.minutes===null&&value.distanceM==null)facts.push({...common,id:`observation:activity:${row.id}:record`,metric:'activity-record',amount:null,unit:null,sourceOriginal:null});
   }else{
    const parsed=trainingSessionSchema.safeParse(row.payload);if(!parsed.success){stats[kind].unsupported++;continue;}
    const value=parsed.data;if(value.status!=='completed'){stats[kind].notPerformed++;continue;}
    if(Date.parse(value.startsAt)>+input.asOf){stats[kind].future++;continue;}
    const common={...base,domain:'activity' as const,occurredAt:value.startsAt,calendarDate:null,dateBasis:'source-session-start-field' as const,timePrecision:'scheduled-field-not-confirmed-occurrence' as const,timeZone:null,valueKind:'source-recorded-activity' as const,scope:'completed-session-record',reportedActivity:value.title,effort:value.intensity,completion:'confirmed-performed' as const};
    append(common,'durationMinutes',value.minutes,'min');append(common,'gutComfort',value.gutComfort,'0-10');
   }
   stats[kind].projected++;
  }
 }
 return {facts,stats,feedRevisions,coverage:'partial-or-unknown' as const,calendarFilteringBasis:'snapshot-view-calendar-not-original-source-zone' as const};
}
