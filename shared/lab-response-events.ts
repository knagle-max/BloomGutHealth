import {activitySchema,type ExperienceRecord} from './experience';
import {labDateText} from './lab-history';
import type {LabPanelAssessment} from './lab-panel-review';

export type LabActivityContext={
 sourceIds:string[];
 window:{from:string;to:string;basis:'recorded-calendar-dates'}|null;
 observations:Array<{id:string;date:string;recordedAt:string;kind:'walking'|'activity';minutes:number|null;timing:'calendar-window-only'}>;
 status:'available'|'source-review';
 coverage:'unknown';
};

/** A source chronology, not an exposure model. Calendar inclusion cannot prove
 * pre-collection timing, regular adherence, increased activity or causation.
 * In particular a routine's log timestamp is not its occurrence timestamp. */
export function labActivityContext(pair:LabPanelAssessment,records:readonly ExperienceRecord[],now=Date.now()):LabActivityContext{
 const empty:LabActivityContext={sourceIds:[],window:null,observations:[],status:'source-review',coverage:'unknown'};
 if(!pair.latest||!pair.previous||!pair.comparable||pair.state==='source-review')return empty;
 const from=labDateText(pair.previous.date,pair.previous.sourceReport,pair.previous.dateCorrection);
 const to=labDateText(pair.latest.date,pair.latest.sourceReport,pair.latest.dateCorrection);
 // Stored timestamps without original calendar context can be upload/log dates.
 if(![pair.previous,pair.latest].every(point=>!!(point.dateCorrection?.enteredDate||point.sourceReport?.enteredDate))||from>=to)return empty;
 const result:LabActivityContext={...empty,status:'available',sourceIds:[pair.previous.id,pair.latest.id],window:{from,to,basis:'recorded-calendar-dates'}};
 for(const record of records){
  if(record.kind!=='activity'||!Number.isFinite(Date.parse(record.createdAt))||Date.parse(record.createdAt)>now)continue;
  const parsed=activitySchema.safeParse(record.payload);if(!parsed.success)continue;
  const activity=parsed.data;
  const date=activity.routineSource?.localDate||activity.startedAt.slice(0,10);
  // Same-day ordering and missing collection time/zone remain unresolved. Keep
  // only strictly intervening dates, explicitly labelled calendar context.
  if(date<=from||date>=to||Date.parse(activity.startedAt)>now)continue;
  const parts=activity.components?.items||activity.routineSource?.planSnapshot.components.items;
  const onlyWalking=!parts||parts.every(part=>part.activityId==='walk');
  const reportedWalk=!!parts?.length&&parts.every(part=>part.activityId==='walk'&&part.match==='reported');
  const selectedWalk=activity.capture?.activityId==='walk'&&activity.capture.interpretation==='user-selected';
  const confirmedRoutineWalk=activity.routineSource?.confirmedPerformed&&activity.routineSource.planSnapshot.components.items.some(part=>part.activityId==='walk');
  result.observations.push({id:record.id,date,recordedAt:record.createdAt,kind:onlyWalking&&(reportedWalk||selectedWalk||confirmedRoutineWalk)?'walking':'activity',minutes:activity.minutes,timing:'calendar-window-only'});
 }
 result.observations.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 return result;
}
