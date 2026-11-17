import {labReviewFamilies} from './lab-panel-review';
import type {Lab} from './precision-nutrition';
import {labResponseQuestions,labResponseQuestionForMarkers,recalledLabResponseContextSchema,type LabResponseContextView} from './lab-response-context';
import {labEditorialFor,labEditorialSources} from './biology-labs';
import {hasConfirmedLabIdentity} from './lab-assay-identity';
import type {recordedLabPanelReview} from './lab-panel-review';
type Family=ReturnType<typeof recordedLabPanelReview>['families'][number];
/** Reuses unchanged editorial science. This is a source/discussion projection,
 * never evidence that an exposure caused an individual's laboratory change. */
export function labFamilyGuidance(family:Family){
 const rows=family.members.flatMap(member=>{
  if(!member.latest||member.state==='source-review'||!hasConfirmedLabIdentity(member.id,member.latest))return[];
  const profile=labEditorialFor(member.id);if(!profile)return[];
  return[{markerId:member.id,name:member.name,sourceId:member.latest.id,discussion:profile.whatToDiscuss,limitations:profile.limitations,citations:labEditorialSources(profile)}];
 });
 const target=family.cues.find(row=>rows.some(profile=>profile.markerId===row.id))??family.members.find(row=>rows.some(profile=>profile.markerId===row.id));
 return{rows,action:target?.latest?{label:`Check ${target.name} source context`,href:`/precision?tab=labs&labResult=${encodeURIComponent(target.latest.id)}`} :null};
}

export const REMEMBERED_LAB_GUIDANCE_VERSION='recalled-source-guidance-2026-11-17-v1';

/** Recompute a transparent explanation from the current server-validated saved
 * answer. Never parse free text into exposures or replace laboratory facts. */
export function rememberedLabGuidance(
 family:keyof typeof labResponseQuestions,
 sources:Array<Lab&{id:string}>,
 view:LabResponseContextView|null,
){
 const latest=view?.latest,parsed=recalledLabResponseContextSchema.safeParse(latest?.record.payload);
 if(!latest?.sourceCurrent||!parsed.success||!view?.questionId)return null;
 const answer=parsed.data,question=labResponseQuestionForMarkers(family,sources.map(source=>source.marker));
 if(question==='fasting-context'&&!sources.some(source=>source.marker==='glucose'))return null;
 if(answer.family!==family||answer.question!==question||view.questionId!==question)return null;
 const ids=new Set(sources.map(source=>source.id));
 if(ids.size!==sources.length||ids.size!==answer.sourceReferences.length||answer.sourceReferences.some(source=>!ids.has(source.id)))return null;
 const members=labReviewFamilies.find(value=>value.id===family)!.markers as readonly string[];
 if(sources.some(source=>!members.includes(source.marker)||!hasConfirmedLabIdentity(source.marker,source)))return null;
 const subject={
  'medication-change':'a change in medicines',
  'fasting-context':'a fasting glucose collection',
  'acute-illness':'an acute illness',
  'iron-products':'a change in iron-containing products',
  'b12-products':'a change in vitamin B12-containing products',
 }[question];
 const summary=answer.answer==='yes'?`You recalled ${subject}. This adds context to review; it does not verify an exposure or establish its effect on a result.`:
  answer.answer==='no'?`You did not recall ${subject}. A remembered “No” does not rule out other explanations or confirm unchanged conditions.`:
  answer.answer==='prefer-not-answer'?'You chose not to answer. No exposure or explanation is inferred.':
  'This context remains unknown. Missing or untracked history is not treated as no change.';
 const window=answer.reviewWindow,event=answer.eventWindow;
 const timing=answer.answer!=='yes'?'not-applicable' as const:
  window.basis!=='source-date'||!window.from||!event?'unknown' as const:
  event.from>window.from&&event.to<window.to?'recalled-window' as const:'not-aligned' as const;
 const timingText=timing==='recalled-window'?'The remembered dates fall strictly between the recorded collection dates. Timing is recalled, not independently verified; this alone does not establish a biomarker-specific exposure window.':
  timing==='not-aligned'?'The remembered dates are not strictly between these collection dates. Same-day ordering or an event outside the comparison window cannot explain this interval from dates alone.':
  timing==='unknown'?'Collection timing or the remembered event window is incomplete. Upload dates and answer dates are not substituted for exposure timing.':null;
 const profiles=Array.from(new Set(sources.map(source=>source.marker))).flatMap(marker=>{
  const profile=labEditorialFor(marker);return profile?[{markerId:marker,name:profile.name,discussion:profile.whatToDiscuss,limitations:profile.limitations,citations:labEditorialSources(profile)}]:[];
 });
 return{
  revision:{answerId:latest.record.id,recordedAt:answer.recordedAt,question,sourceIds:Array.from(ids),guidanceVersion:REMEMBERED_LAB_GUIDANCE_VERSION},
  summary,timing,timingText,profiles,
  nextStep:answer.answer==='yes'&&['medication-change','iron-products','b12-products'].includes(question)?'Discuss the recalled product or medicine change with your clinician alongside these original results. Do not change doses based on this view.':
   question==='fasting-context'?'Check the fasting information on the original glucose report. A remembered answer does not replace the laboratory’s recorded collection context.':
   question==='acute-illness'?'Review illness and collection timing alongside the original results with your clinician. This view cannot determine whether illness affected a measurement.':
   'Review the original collection context and the marker-specific questions below with your clinician. Your individual causes remain unknown.',
  action:{label:'Review original result context',href:`/precision?tab=labs&labResult=${encodeURIComponent(sources[0].id)}`},
  attribution:'not-established' as const,
 };
}
