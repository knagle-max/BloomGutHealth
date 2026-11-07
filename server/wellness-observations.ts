import {createHash} from "node:crypto";
import type {ExperienceRecord,ActualSets} from "../shared/experience";
import type {WellnessMovementObservation} from "../shared/wellness-actions";
const setFacts=(source:ActualSets|undefined):WellnessMovementObservation["sets"]=>{
 const sets=source?.sets.filter(s=>!s.reportedBout);
 if(!sets?.length)return null;
 const confirmedCompleted=sets.filter(s=>s.completed&&s.state!=="planned"&&s.state!=="cancelled").length;
 const explicitlyCancelled=sets.filter(s=>s.state==="cancelled").length;
 return{recorded:sets.length,confirmedCompleted,notConfirmed:sets.length-confirmedCompleted-explicitlyCancelled,explicitlyCancelled};
};
/** Caller supplies the owned, consistent day-filtered canonical snapshot. No raw
 * descriptions, notes, health fields or choice events leave through this view. */
export function movementSourceObservations(account:string,records:readonly ExperienceRecord[],now:Date):WellnessMovementObservation[]{
 return records.flatMap((record):WellnessMovementObservation[]=>{
  if(record.kind!=="activity"&&record.kind!=="session")return[];
  const payload=record.payload;
  const startsAt=record.kind==="session"?record.payload.startsAt:record.payload.startedAt;
  const sourceRevision=createHash("sha256").update(JSON.stringify(["movement-source-v1",account,record.id,record.kind,payload,record.updatedAt])).digest("hex");
  const common={sourceId:record.id,sourceKind:record.kind,sourceRevision,startsAt,updatedAt:record.updatedAt,temporalStatus:Date.parse(startsAt)>+now?"future-entry" as const:"elapsed-entry" as const};
  if(record.kind==="session")return[{...common,componentId:null,valueKind:record.payload.status==="completed"?"marked-completed-session":record.payload.status==="cancelled"?"cancelled-session":"planned-session",reportedMinutes:null,scheduledMinutes:record.payload.minutes,sets:setFacts(record.payload.actualSets)}];
  if(record.payload.components)return record.payload.components.items.map(part=>({...common,componentId:part.id,valueKind:"self-reported-activity",reportedMinutes:part.minutes,scheduledMinutes:null,sets:setFacts(part.actualSets)}));
  return[{...common,componentId:null,valueKind:"self-reported-activity",reportedMinutes:record.payload.minutes,scheduledMinutes:null,sets:setFacts(record.payload.actualSets)}];
 });
}
