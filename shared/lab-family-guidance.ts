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
