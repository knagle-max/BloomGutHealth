import {experimentSchema} from './experience';
import type {PrecisionReport} from './precision-nutrition';
import {labDateText} from './lab-history';
export type TimingPhase='baseline'|'trial'|'before'|'between'|'after'|'unknown';
export const timingLabels:Record<TimingPhase,string>={baseline:'Within stated baseline dates',trial:'Within stated trial dates',before:'Before stated dates',between:'Between baseline and trial',after:'After stated trial dates',unknown:'Original calendar context unavailable'};
/** Calendar context only. No adherence, comparability, effect or causal assessment. */
export function labRoutineTiming(input:unknown,trends:PrecisionReport['trends']){
 const parsed=experimentSchema.safeParse(input);if(!parsed.success)return null;
 const trial=parsed.data;
 const seen=new Set<string>();
 const rows=trends.flatMap(trend=>trend.points.flatMap(point=>{
  if(seen.has(point.id))return[];seen.add(point.id);
  const calendar=point.dateCorrection?.enteredDate||point.sourceReport?.enteredDate;
  const valid=calendar&&/^\d{4}-\d{2}-\d{2}$/.test(calendar)&&Number.isFinite(Date.parse(calendar))&&new Date(calendar).toISOString().slice(0,10)===calendar;
  let phase:TimingPhase='unknown';
  if(valid){
   if(calendar>=trial.startsOn&&calendar<=trial.endsOn)phase='trial';
   else if(calendar>trial.endsOn)phase='after';
   else if(trial.design&&calendar>=trial.design.baselineStartsOn&&calendar<=trial.design.baselineEndsOn)phase='baseline';
   else if(trial.design&&calendar>trial.design.baselineEndsOn)phase='between';
   else phase='before';
  }
  return[{id:point.id,name:trend.name,dateLabel:labDateText(point.date,point.sourceReport,point.dateCorrection),timestamp:point.date,calendarDay:valid?calendar:null,phase,corrected:!!point.dateCorrection}];
 })).sort((a,b)=>a.dateLabel.localeCompare(b.dateLabel)||a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
 return{trial,rows};
}
