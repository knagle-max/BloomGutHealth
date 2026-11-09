import {dateKey,experimentSchema} from './experience';
/** Three days is a descriptive display minimum, never a power calculation or
 * evidence of reliability, significance, effectiveness or a causal effect. */
export function reviewExperiment(input:unknown,asOf=new Date().toISOString().slice(0,10)){
 const parsed=experimentSchema.safeParse(input);
 const caveat='Self-reported before/after observations cannot establish cause. Measurement variability, medicines, sleep, illness, exercise and other changes may explain differences.';
 const unavailable={status:'insufficient-data' as const,change:null,baseline:null,followup:null,unit:null,coverage:null,note:'Define a baseline, one outcome, units and a consistent measurement method.',caveat};
 if(!parsed.success||!parsed.data.design)return unavailable;
 if(!dateKey.safeParse(asOf).success)return {...unavailable,note:'The observation review date could not be confirmed. Saved measurements remain unchanged.'};
 const {design,observations,startsOn,endsOn}=parsed.data;
 const elapsed=observations.filter(o=>o.date<=asOf),before=elapsed.filter(o=>o.date>=design.baselineStartsOn&&o.date<=design.baselineEndsOn),after=elapsed.filter(o=>o.date>=startsOn&&o.date<=endsOn);
 const period=(entries:typeof observations,start:string,end:string)=>{
  const elapsedDays=asOf<start?0:Math.round((Date.parse(asOf<end?asOf:end)-Date.parse(start))/86400000)+1;
  return {recordedDays:entries.length,elapsedDays,missingDays:Math.max(0,elapsedDays-entries.length),low:entries.length?Math.min(...entries.map(o=>o.value)):null,high:entries.length?Math.max(...entries.map(o=>o.value)):null};
 };
 const coverage={asOf,futureEntries:observations.length-elapsed.length,baseline:period(before,design.baselineStartsOn,design.baselineEndsOn),followup:period(after,startsOn,endsOn),adherence:{reportedDays:after.filter(o=>o.adherence!==null).length,missingDays:after.filter(o=>o.adherence===null).length,zeroDays:after.filter(o=>o.adherence===0).length},contextNotesDays:elapsed.filter(o=>!!o.confounders).length};
 const common={unit:design.metricUnit,coverage,caveat};
 if(before.length<3||after.length<3)return {...common,status:'insufficient-data' as const,change:null,baseline:null,followup:null,note:`Recorded ${before.length} baseline and ${after.length} intervention days through ${asOf}. At least three distinct days in each period are needed for this descriptive display; this does not establish scientific adequacy. Future-dated entries are excluded.`};
 const median=(entries:typeof observations)=>{const values=entries.map(o=>o.value).sort((a,b)=>a-b),m=Math.floor(values.length/2);return values.length%2?values[m]:(values[m-1]+values[m])/2;};
 return {...common,status:'observed-change' as const,change:median(after)-median(before),baseline:median(before),followup:median(after),note:`Median values across ${before.length} baseline and ${after.length} intervention days through ${asOf}. ${after.some(o=>o.adherence===null)?'Intervention adherence is incomplete.':'Adherence was self-reported.'} ${elapsed.some(o=>!o.confounders)?'Other changes were not recorded for every observation.':'Review the recorded confounders.'} Future-dated entries are excluded. No statistical or clinical significance is inferred.`};
}
