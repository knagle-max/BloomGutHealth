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
/** A due draft has unknown actual duration/distance/count and no checked set. */
export function routineActualParts(plan:ActivityRoutinePlan,id=()=>crypto.randomUUID()){
 return routinePlannedParts(plan.components.items,id).map(part=>({...part,minutes:null,distanceM:null,...(part.actualSets?{actualSets:{version:1 as const,sets:part.actualSets.sets.map(set=>({...set,state:'described' as const}))}}:{})}));
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
