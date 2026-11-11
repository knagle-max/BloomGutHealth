import {activityComponentSchema,dateKey,type ActivityRoutinePlan,type ActivityComponent,type Activity,type RoutineOccurrenceOverride,type ActivityRoutine} from './experience';

/** Calendar-day identity in the saved routine zone; never a UTC weekday. */
export function routineLocalDate(timeZone:string,now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 return dateKey.parse(['year','month','day'].map(key=>parts.find(part=>part.type===key)!.value).join('-'));
}
export function routineDue(plan:ActivityRoutinePlan,date:string){
 dateKey.parse(date);
 return !plan.paused&&date>=plan.effectiveFrom&&(!plan.effectiveTo||date<=plan.effectiveTo)&&plan.weekdays.includes(new Date(date+'T12:00:00Z').getUTCDay());
}
/** Clear actual quantities. Planned source loads/reps remain editable references. */
export function routinePlannedParts(items:readonly ActivityComponent[],id=()=>crypto.randomUUID()){
 return items.map(part=>{const {sourceSpan,...source}=part;return activityComponentSchema.parse({...source,id:id(),steps:null,...(part.actualSets?{actualSets:{version:1,sets:part.actualSets.sets.map(set=>({...set,id:id(),completed:false,state:'planned'}))}}:{})});});
}
/** UUIDv5 ties each original planned child to one versioned calendar occurrence.
 * Identity only: authorization remains the owned record and transaction guard. */
export async function routineActualChildId(revision:string,scheduledDate:string,plannedId:string){
 dateKey.parse(scheduledDate);
 const namespace='e10e05c299ce4cb29834f5a50bf3ee2e',name=new TextEncoder().encode(JSON.stringify(['bloom-routine-child-v1',revision,scheduledDate,plannedId]));
 const bytes=new Uint8Array(16+name.length);for(let i=0;i<16;i++)bytes[i]=parseInt(namespace.slice(i*2,i*2+2),16);bytes.set(name,16);
 const digest=new Uint8Array(await crypto.subtle.digest('SHA-1',bytes)).slice(0,16);digest[6]=(digest[6]&15)|80;digest[8]=(digest[8]&63)|128;
 const hex=Array.from(digest,byte=>byte.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
/** Unknown actuals and fresh per-occurrence children; plan snapshot IDs make
 * original set provenance recoverable even after independent additions/removals. */
export async function routineActualParts(plan:ActivityRoutinePlan,scheduledDate:string){
 return Promise.all(plan.components.items.map(async source=>{
  const part=routinePlannedParts([source])[0];
  return {...part,id:await routineActualChildId(plan.revision,scheduledDate,source.id),minutes:null,distanceM:null,...(part.actualSets?{actualSets:{version:1 as const,sets:await Promise.all(part.actualSets.sets.map(async(set,index)=>({...set,id:await routineActualChildId(plan.revision,scheduledDate,source.actualSets!.sets[index].id!)})))}}:{})};
 }));
}
export function routineSourceMatches(activity:Activity,plan:ActivityRoutinePlan,now=new Date(),overrides:Record<string,RoutineOccurrenceOverride>={}){
 const source=activity.routineSource;
 if(!source||JSON.stringify(source.planSnapshot)!==JSON.stringify(plan)||source.revision!==plan.revision||source.timeZone!==plan.timeZone||!routineDue(plan,source.scheduledDate))return false;
 const override=overrides[source.scheduledDate];
 if((override?.revision??null)!==source.occurrenceRevision||override?.state==='skipped'||(override?.state==='rescheduled'?override.toDate!==source.localDate:source.scheduledDate!==source.localDate))return false;
 const at=new Date(activity.startedAt);
 return Number.isFinite(+at)&&+at<=+now&&source.localDate===routineLocalDate(plan.timeZone,at)&&source.localDate===routineLocalDate(plan.timeZone,now);
}

/** Bounded day projection only; overrides are intentions, not activity records. */
export function routineOccurrencesForDate(routine:ActivityRoutine,date:string){
 dateKey.parse(date);if(routine.plan.paused)return[];
 const original=routineDue(routine.plan,date)&&!routine.occurrenceOverrides[date]?[date]:[];
 const moved=Object.entries(routine.occurrenceOverrides).flatMap(([from,override])=>override.state==='rescheduled'&&override.toDate===date&&routineDue(routine.plan,from)?[from]:[]);
 return [...original,...moved].sort().map(scheduledDate=>({date,scheduledDate,occurrenceRevision:routine.occurrenceOverrides[scheduledDate]?.revision??null}));
}
export function addRoutineDays(date:string,days:number){dateKey.parse(date);const at=new Date(date+'T12:00:00Z');at.setUTCDate(at.getUTCDate()+days);return at.toISOString().slice(0,10);}
