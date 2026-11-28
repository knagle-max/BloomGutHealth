import type {ActualSets} from './experience';
import type {completedExerciseHistory,CompletedExerciseObservation} from './training-set-history';
export const exerciseProgressionVersion='double-progression-v1' as const;
type Set=ActualSets['sets'][number];
type History=ReturnType<typeof completedExerciseHistory>;
/** A draft-only coaching heuristic, never a completed set or physiological estimate.
 * This first slice offers repeat/repetition targets. Automatic load increases wait
 * for supported working-set/effort evidence and available equipment increments. */
export function exerciseProgression(current:Set,history:History,ordinal=0,options:{relevantNewOrWorseningPain?:boolean;nextAvailableLoadKg?:number}={}) {
 const comparable:CompletedExerciseObservation[]=[];
 const reference=history.observations.find(o=>o.sources.some(s=>s.exercisePosition===ordinal+1)&&(current.catalogueRef?.confirmed&&o.catalogueRef?.confirmed?o.catalogueRef.id===current.catalogueRef.id:o.exercise.trim().toLocaleLowerCase()===current.exercise.trim().toLocaleLowerCase()));
 const result=(status:'SOURCE_UNAVAILABLE'|'NO_CONFIRMED_HISTORY'|'HISTORY_AVAILABLE_NOT_COMPARABLE'|'COMPARABLE_VERIFIED',decision:'ESTABLISH_BASELINE'|'INSUFFICIENT_CONTEXT'|'REPEAT_TARGET'|'INCREASE_REPETITIONS'|'HOLD_LOAD'|'SAFETY_HOLD',reason:string,target:{reps:number;loadKg:number}|null=null)=>({version:exerciseProgressionVersion,status,decision,reason,previous:comparable[0]??reference??null,comparable,target});
 if(history.status==='SOURCE_UNAVAILABLE')return result('SOURCE_UNAVAILABLE','INSUFFICIENT_CONTEXT','Saved exercise history is unavailable.');
 if(options.relevantNewOrWorseningPain)return result('HISTORY_AVAILABLE_NOT_COMPARABLE','SAFETY_HOLD','Do not progress this movement through new or worsening pain.');
 if(!Number.isInteger(ordinal)||ordinal<0)return result('HISTORY_AVAILABLE_NOT_COMPARABLE','INSUFFICIENT_CONTEXT','Choose a recorded set.');
 if(!current.catalogueRef?.confirmed||!current.loadContext||!current.loadUnit)return result(reference?'HISTORY_AVAILABLE_NOT_COMPARABLE':'NO_CONFIRMED_HISTORY','ESTABLISH_BASELINE',reference?'Historical reference only — confirm exercise, equipment and load basis to compare.':'Record a baseline with a confirmed exercise and load basis.');
 const matches=history.observations.filter(o=>o.catalogueRef?.confirmed&&o.catalogueRef.id===current.catalogueRef!.id&&o.catalogueRef.version===current.catalogueRef!.version&&o.loadConvention===current.loadContext!.convention&&o.equipmentInstance===current.loadContext!.equipmentKey&&(o.side??null)===(current.side??null)&&!!o.bodyweight===!!current.bodyweight);
 for(const fact of matches)if(fact.sources.some(source=>source.exercisePosition===ordinal+1))comparable.push(fact);
 comparable.sort((a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt)||a.key.localeCompare(b.key));
 const previous=comparable[0];
 if(!previous)return result(reference?'HISTORY_AVAILABLE_NOT_COMPARABLE':'NO_CONFIRMED_HISTORY','ESTABLISH_BASELINE',reference?'Historical reference only — equipment, load basis, side or exercise differs.':'No prior comparable completed set.');
 if(current.completed||current.state==='planned'||current.state==='cancelled')return result('COMPARABLE_VERIFIED','HOLD_LOAD','Previous performance is a reference; this set is already completed, planned or cancelled.');
 if(previous.reps===null||previous.reps<1||previous.loadKg===null||previous.loadKg<=0||['assistance','bodyweight','single-limb'].includes(current.loadContext.convention))return result('COMPARABLE_VERIFIED','INSUFFICIENT_CONTEXT','Recorded values do not support this repetition/load rule.');
 if(current.loadKg!==null&&Math.abs(current.loadKg-previous.loadKg)>0.000001)return result('COMPARABLE_VERIFIED','HOLD_LOAD','You changed the load. Keep your own target or establish a new baseline.');
 const target={reps:previous.reps,loadKg:previous.loadKg};
 if(previous.reps<8)return result('COMPARABLE_VERIFIED','REPEAT_TARGET','Repeat the recorded target; one lower-repetition set is not a reason to deload.',target);
 if(previous.reps<12)return result('COMPARABLE_VERIFIED','INCREASE_REPETITIONS','Optional 8–12 rep guidance: try one more rep at the same load if comfortable. Effort is not assumed.',{...target,reps:previous.reps+1});
 const step=options.nextAvailableLoadKg;
 const large=step!==undefined&&Number.isFinite(step)&&step>previous.loadKg&&(step-previous.loadKg)/previous.loadKg>0.10;
 return result('COMPARABLE_VERIFIED','HOLD_LOAD',large?'That equipment step exceeds 10%. Repeat the load; no automatic jump.':'Repeat the load. Working-set and effort context are not yet sufficient to suggest a load increase.',target);
}
