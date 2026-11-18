import {checkinSchema,type PrecisionReport} from './precision-nutrition';
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
 * TG/ALT references were retrieved on2026-11-17 and LDL on2026-11-18; original registry review
 * states are preserved. Only the explicitly selected marker reference supports each use. */
export function labActivityDiscussion(pair:LabPanelAssessment,context:LabActivityContext){
 if(context.status!=='available'||!context.window||!pair.latest||!pair.previous||!pair.comparable||pair.state==='source-review')return null;
 if(context.sourceIds.length!==2||context.sourceIds[0]!==pair.previous.id||context.sourceIds[1]!==pair.latest.id)return null;
 if(context.window.from!==labDateText(pair.previous.date,pair.previous.sourceReport,pair.previous.dateCorrection)||context.window.to!==labDateText(pair.latest.date,pair.latest.sourceReport,pair.latest.dateCorrection))return null;
 if(pair.id!=='triglycerides'&&pair.id!=='alt'&&pair.id!=='ldl')return null;
 const profile=labEditorialFor(pair.id);if(!profile)return null;
 const referencePath=pair.id==='alt'?'alt-blood-test':pair.id==='ldl'?'cholesterol-levels':'triglycerides-test';
 const reference=labEditorialSources(profile).find(source=>source.url===`https://medlineplus.gov/lab-tests/${referencePath}/`);
 if(!reference)return null;
 const recorded=context.observations.length>0;
 return{
  version:'activity-discussion-2026-11-18-v2',
  kind:'general-discussion-context' as const,
  markerId:pair.id,sourceIds:[pair.previous.id,pair.latest.id],activityIds:context.observations.map(event=>event.id),
  evidence:reference,
  generalContext:pair.id==='ldl'?
   'Regular physical activity may help lower LDL cholesterol in general guidance. Saved sessions do not establish regular activity, an individual LDL response or what caused this change.':pair.id==='triglycerides'?
   'Physical activity is one of several factors considered when reviewing triglycerides. A general association does not tell us how your activity affected this result.':
   'Intense exercise can affect ALT. This view does not assess exercise intensity or establish whether it influenced this result.',
  personalContext:recorded?
   `${context.observations.length} saved activity ${context.observations.length===1?'record falls':'records fall'} between the recorded collection dates. Logging coverage is unknown; these records do not show that activity increased or establish a cause.`:
   'No activity is recorded inside this collection-date window. Your activity history remains unknown; no inactivity or personal contribution is inferred.',
  counterContext:(pair.id==='triglycerides'||pair.id==='ldl')&&recorded&&pair.change!==null&&pair.change>=0?
   `${pair.id==='ldl'?'LDL cholesterol':'Triglycerides'} did not decrease in this comparison. That observation neither establishes the effect of these activities nor shows how consistently they were performed.`:null,
  nextStep:recorded?'Review the dates and details of the recorded sessions alongside the collection context. Keep recording what you actually do; no new exercise dose is suggested here.':
   'If you want to track this context, record activity you actually perform. You do not need to invent a past routine or fill in missing duration.',
  attribution:'not-established' as const,
 };
}

/** A source chronology, not an exposure model. Calendar inclusion cannot prove
 * pre-collection timing, regular adherence, increased activity or causation.
 * In particular a routine's log timestamp is not its occurrence timestamp. */
export function labActivityContext(pair:LabPanelAssessment,records:readonly ExperienceRecord[],now=Date.now()):LabActivityContext{
 const result:LabActivityContext={...labCollectionWindow(pair),observations:[],coverage:'unknown'};
 if(!result.window)return result;
 const{from,to}=result.window;
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

/** One common collection-date guard for recorded context; strict intervening
 * calendar dates never establish within-day timing or a biological window. */
function labCollectionWindow(pair:LabPanelAssessment):Pick<LabActivityContext,'sourceIds'|'window'|'status'>{
 const empty={sourceIds:[],window:null,status:'source-review' as const};
 if(!pair.latest||!pair.previous||!pair.comparable||pair.state==='source-review')return empty;
 const from=labDateText(pair.previous.date,pair.previous.sourceReport,pair.previous.dateCorrection),to=labDateText(pair.latest.date,pair.latest.sourceReport,pair.latest.dateCorrection);
 if(![pair.previous,pair.latest].every(point=>!!(point.dateCorrection?.enteredDate||point.sourceReport?.enteredDate))||from>=to)return empty;
 return{status:'available',sourceIds:[pair.previous.id,pair.latest.id],window:{from,to,basis:'recorded-calendar-dates'}};
}

export type LabWeightObservation={id:string;measuredAt:string;date:string;weight:{value:string|number;unit:'kg'|'lb';basis:'original-entry'|'stored-canonical'}};
/** Original saved measurements only, with no derived change, BMI, weight-status
 * classification or inferred scale/method equivalence. Missing stays unknown. */
export function labWeightContext(pair:LabPanelAssessment,records:PrecisionReport['checkins'],now=Date.now()){
 const base=labCollectionWindow(pair),observations:LabWeightObservation[]=[];
 const empty={...base,observations,coverage:'unknown' as const,attribution:'not-established' as const};
 if(!base.window)return empty;
 const seen=new Set<string>();
 for(const record of records){
  const{id,...payload}=record,parsed=checkinSchema.safeParse(payload);
  if(!id||seen.has(id)||!parsed.success)return{...empty,status:'source-review' as const,observations:[]};
  seen.add(id);const value=parsed.data,date=value.measuredAt.slice(0,10);
  if(value.weightKg===null||Date.parse(value.measuredAt)>now||date<=base.window.from||date>=base.window.to)continue;
  const original=value.entrySource?.fields.weight;
  observations.push({id,measuredAt:value.measuredAt,date,weight:original?{value:original.value,unit:original.unit,basis:'original-entry'}:{value:value.weightKg,unit:'kg',basis:'stored-canonical'}});
 }
 observations.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 return empty;
}

/** Canonical patient-test sources retrieved2026-11-18 support general lipid
 * weight context only; do not borrow that claim for another analyte. */
export function labWeightDiscussion(pair:LabPanelAssessment,context:ReturnType<typeof labWeightContext>){
 if(context.status!=='available'||!context.window||context.sourceIds.length!==2||!pair.previous||!pair.latest||context.sourceIds[0]!==pair.previous.id||context.sourceIds[1]!==pair.latest.id)return null;
 const current=labCollectionWindow(pair);if(!current.window||current.window.from!==context.window.from||current.window.to!==context.window.to)return null;
 if(pair.id!=='triglycerides'&&pair.id!=='ldl')return null;
 const profile=labEditorialFor(pair.id);if(!profile)return null;
 const path=pair.id==='ldl'?'cholesterol-levels':'triglycerides-test',evidence=labEditorialSources(profile).find(source=>source.url===`https://medlineplus.gov/lab-tests/${path}/`);if(!evidence)return null;
 return{version:'weight-discussion-2026-11-18-v1',evidence,sourceIds:context.sourceIds,observationIds:context.observations.map(row=>row.id),attribution:'not-established' as const,
  generalContext:'Weight-related health context is one of several considerations in lipid guidance. Recorded weights alone do not establish weight status, a consistent change or an effect on your result.',
  nextStep:context.observations.length?'Review the measurement dates, scale and conditions before comparing these observations. Your individual causes remain unknown.':'Unrecorded weight history remains unknown. You can review observations you have already saved; no past weight or change is assumed.'};
}
