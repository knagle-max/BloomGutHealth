import {activitySchema,type ExperienceRecord} from './experience';
import {labDateText} from './lab-history';
import type {LabPanelAssessment} from './lab-panel-review';
import {labEditorialFor,labEditorialSources} from './biology-labs';

export type LabActivityContext={
 sourceIds:string[];
 window:{from:string;to:string;basis:'recorded-calendar-dates'}|null;
 observations:Array<{id:string;date:string;recordedAt:string;kind:'walking'|'activity';minutes:number|null;timing:'calendar-window-only'}>;
 status:'available'|'source-review';
 coverage:'unknown';
};

/** A small discussion projection over the current chronology and canonical
 * citations, not a hypothesis or a second evidence/causal model. The cited
 * public test references were retrieved on2026-11-17; original registry review
 * states are preserved. Only these two references support this specific use. */
export function labActivityDiscussion(pair:LabPanelAssessment,context:LabActivityContext){
 if(context.status!=='available'||!context.window||!pair.latest||!pair.previous||!pair.comparable||pair.state==='source-review')return null;
 if(context.sourceIds.length!==2||context.sourceIds[0]!==pair.previous.id||context.sourceIds[1]!==pair.latest.id)return null;
 if(context.window.from!==labDateText(pair.previous.date,pair.previous.sourceReport,pair.previous.dateCorrection)||context.window.to!==labDateText(pair.latest.date,pair.latest.sourceReport,pair.latest.dateCorrection))return null;
 if(pair.id!=='triglycerides'&&pair.id!=='alt')return null;
 const profile=labEditorialFor(pair.id);if(!profile)return null;
 const reference=labEditorialSources(profile).find(source=>source.url===`https://medlineplus.gov/lab-tests/${pair.id==='alt'?'alt-blood-test':'triglycerides-test'}/`);
 if(!reference)return null;
 const recorded=context.observations.length>0;
 return{
  version:'activity-discussion-2026-11-17-v1',
  kind:'general-discussion-context' as const,
  markerId:pair.id,sourceIds:[pair.previous.id,pair.latest.id],activityIds:context.observations.map(event=>event.id),
  evidence:reference,
  generalContext:pair.id==='triglycerides'?
   'Physical activity is one of several factors considered when reviewing triglycerides. A general association does not tell us how your activity affected this result.':
   'Intense exercise can affect ALT. This view does not assess exercise intensity or establish whether it influenced this result.',
  personalContext:recorded?
   `${context.observations.length} saved activity ${context.observations.length===1?'record falls':'records fall'} between the recorded collection dates. Logging coverage is unknown; these records do not show that activity increased or establish a cause.`:
   'No activity is recorded inside this collection-date window. Your activity history remains unknown; no inactivity or personal contribution is inferred.',
  counterContext:pair.id==='triglycerides'&&recorded&&pair.change!==null&&pair.change>=0?
   'Triglycerides did not decrease in this comparison. That observation neither establishes the effect of these activities nor shows how consistently they were performed.':null,
  nextStep:recorded?'Review the dates and details of the recorded sessions alongside the collection context. Keep recording what you actually do; no new exercise dose is suggested here.':
   'If you want to track this context, record activity you actually perform. You do not need to invent a past routine or fill in missing duration.',
  attribution:'not-established' as const,
 };
}

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
