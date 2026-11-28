import type {ActualSets} from './experience';
import type {completedExerciseHistory,CompletedExerciseObservation} from './training-set-history';
export const exerciseProgressionVersion='double-progression-v2' as const;
type Set=ActualSets['sets'][number];
type History=ReturnType<typeof completedExerciseHistory>;
/** A draft-only coaching heuristic, never a completed set or physiological estimate.
 * Load targets require repeated complete working-set groups and a user-reported
 * available equipment step. Unknown effort requires a third comparable exposure. */
export function exerciseProgression(current:Set,history:History,ordinal=0,options:{relevantNewOrWorseningPain?:boolean;nextAvailableLoadKg?:number}={}) {
 const comparable:CompletedExerciseObservation[]=[];
 const reference=history.observations.find(o=>o.sources.some(s=>s.exercisePosition===ordinal+1)&&(current.catalogueRef?.confirmed&&o.catalogueRef?.confirmed?o.catalogueRef.id===current.catalogueRef.id:o.exercise.trim().toLocaleLowerCase()===current.exercise.trim().toLocaleLowerCase()));
 const result=(status:'SOURCE_UNAVAILABLE'|'NO_CONFIRMED_HISTORY'|'HISTORY_AVAILABLE_NOT_COMPARABLE'|'COMPARABLE_VERIFIED',decision:'ESTABLISH_BASELINE'|'INSUFFICIENT_CONTEXT'|'REPEAT_TARGET'|'INCREASE_REPETITIONS'|'INCREASE_LOAD'|'HOLD_LOAD'|'SAFETY_HOLD',reason:string,target:{reps:number;loadKg:number}|null=null)=>({version:exerciseProgressionVersion,status,decision,reason,previous:comparable[0]??reference??null,comparable,target});
 if(history.status==='SOURCE_UNAVAILABLE')return result('SOURCE_UNAVAILABLE','INSUFFICIENT_CONTEXT','Saved exercise history is unavailable.');
 if(options.relevantNewOrWorseningPain)return result('HISTORY_AVAILABLE_NOT_COMPARABLE','SAFETY_HOLD','Do not progress this movement through new or worsening pain.');
 if(!Number.isInteger(ordinal)||ordinal<0)return result('HISTORY_AVAILABLE_NOT_COMPARABLE','INSUFFICIENT_CONTEXT','Choose a recorded set.');
 if(!current.catalogueRef?.confirmed||!current.loadContext||!current.loadUnit)return result(reference?'HISTORY_AVAILABLE_NOT_COMPARABLE':'NO_CONFIRMED_HISTORY','ESTABLISH_BASELINE',reference?'Historical reference only — confirm exercise, equipment and load basis to compare.':'Record a baseline with a confirmed exercise and load basis.');
 const matches=history.observations.filter(o=>o.setRole!=='warm-up'&&o.catalogueRef?.confirmed&&o.catalogueRef.id===current.catalogueRef!.id&&o.catalogueRef.version===current.catalogueRef!.version&&o.loadConvention===current.loadContext!.convention&&o.equipmentInstance===current.loadContext!.equipmentKey&&(o.side??null)===(current.side??null)&&!!o.bodyweight===!!current.bodyweight);
 for(const fact of matches)if(fact.sources.some(source=>(current.loadContext?.setRole==='working'?source.workingPosition:source.exercisePosition)===ordinal+1))comparable.push(fact);
 comparable.sort((a,b)=>Date.parse(b.occurredAt)-Date.parse(a.occurredAt)||a.key.localeCompare(b.key));
 const previous=comparable[0];
 if(!previous)return result(reference?'HISTORY_AVAILABLE_NOT_COMPARABLE':'NO_CONFIRMED_HISTORY','ESTABLISH_BASELINE',reference?'Historical reference only — equipment, load basis, side or exercise differs.':'No prior comparable completed set.');
 if(current.loadContext.setRole==='warm-up')return result('COMPARABLE_VERIFIED','HOLD_LOAD','Warm-up sets are not progression baselines.');
 if(current.completed||current.state==='planned'||current.state==='cancelled')return result('COMPARABLE_VERIFIED','HOLD_LOAD','Previous performance is a reference; this set is already completed, planned or cancelled.');
 if(previous.reps===null||previous.reps<1||previous.loadKg===null||previous.loadKg<=0||['assistance','bodyweight','single-limb'].includes(current.loadContext.convention))return result('COMPARABLE_VERIFIED','INSUFFICIENT_CONTEXT','Recorded values do not support this repetition/load rule.');
 if(current.loadKg!==null&&Math.abs(current.loadKg-previous.loadKg)>0.000001)return result('COMPARABLE_VERIFIED','HOLD_LOAD','You changed the load. Keep your own target or establish a new baseline.');
 const target={reps:previous.reps,loadKg:previous.loadKg};
 if(previous.setEffort!==null&&previous.setEffort>8)return result('COMPARABLE_VERIFIED','HOLD_LOAD','Reported effort was high. Repeat or edit your target; no automatic increase.',target);
 if(previous.reps<8)return result('COMPARABLE_VERIFIED','REPEAT_TARGET','Repeat the recorded target; one lower-repetition set is not a reason to deload.',target);
 if(previous.reps<12)return result('COMPARABLE_VERIFIED','INCREASE_REPETITIONS','Optional 8–12 rep guidance: try one more rep at the same load if comfortable. Effort is not assumed.',{...target,reps:previous.reps+1});
 const step=options.nextAvailableLoadKg;
 const large=step!==undefined&&Number.isFinite(step)&&step>previous.loadKg&&(step-previous.loadKg)/previous.loadKg>0.10;
 if(large)return result('COMPARABLE_VERIFIED','HOLD_LOAD','That equipment step exceeds 10%. Repeat the load; no automatic jump.',target);
 if(step===undefined||!Number.isFinite(step)||step<=previous.loadKg||step>2000)return result('COMPARABLE_VERIFIED','HOLD_LOAD','Enter the next load actually available on this equipment; no increment is guessed.',target);
 if((step-previous.loadKg)/previous.loadKg>0.05+1e-9)return result('COMPARABLE_VERIFIED','HOLD_LOAD','This step exceeds the conservative 5% coaching rule. Keep or edit your own target.',target);
 if(current.loadContext.setRole!=='working')return result('COMPARABLE_VERIFIED','HOLD_LOAD','Working-set role was not recorded. Repeat the load.',target);
 // Check complete source groups, not just the strongest set. Unknown roles,
 // unconfirmed/skipped sets or different loads must not disappear from admission.
 const recent=comparable.filter((o,index,rows)=>rows.findIndex(other=>other.occurredAt===o.occurredAt)===index).slice(0,3);
 const group=(observation:CompletedExerciseObservation)=>matches.filter(o=>o.sources.some(s=>s.recordId===observation.sources[0].recordId&&s.componentId===observation.sources[0].componentId));
 const qualifies=(observation:CompletedExerciseObservation)=>{const rows=group(observation);return rows.length===observation.sources[0].nonWarmupSetCount&&rows.every(o=>o.setRole==='working'&&o.reps!==null&&o.reps>=12&&o.loadKg!==null&&Math.abs(o.loadKg-previous.loadKg!)<1e-6&&(o.setEffort===null||o.setEffort<=8));};
 const knownEffort=recent.slice(0,2).every(o=>group(o).every(set=>set.setEffort!==null));
 const needed=knownEffort?2:3;
 if(recent.length<needed||!recent.slice(0,needed).every(qualifies))return result('COMPARABLE_VERIFIED','HOLD_LOAD','Repeat the load until complete working sets reach the top range across two comparable workouts (three when effort is unknown).',target);
 return result('COMPARABLE_VERIFIED','INCREASE_LOAD',knownEffort?'Repeated top-range working sets support an optional small available load step; restart at 8 reps.':'Three top-range workouts support an optional small available step; effort remains unknown. Restart at 8 reps.',{reps:8,loadKg:step});
}
