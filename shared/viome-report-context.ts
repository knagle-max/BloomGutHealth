import {hasViomeFindingsMarker,parseViomeFindings,type ViomeFindings} from "./viome-findings";

export class ViomeReportContextError extends Error{
 constructor(readonly code:"unavailable"|"incompatible"|"occupied"|"changed"){
  super(code==="unavailable"?"The selected report is no longer available in this account. Review your saved reports.":code==="incompatible"?"These reports cannot be linked safely. Keep them separate or choose compatible reports without conflicting known collection dates.":code==="occupied"?"That specimen event already has this report type. Review the existing report or keep this source separate.":"The saved biological findings changed or do not match this import. Review the source before reusing a report.");
 }
}
export function viomeSource(value:unknown):ViomeFindings|null{
 const source=value&&typeof value==="object"&&!Array.isArray(value)&&(value as any).sourceReport?(value as any).sourceReport:value;
 if(!hasViomeFindingsMarker(source))return null;
 try{return parseViomeFindings(source);}catch{return null;}
}
/** Compatibility permits a user-confirmed relationship, not automatic identity
 * inference. When collection dates are absent, upload dates provide selection context,
 * with explicit specimen confirmation still required. Upload dates never become collection dates. Unknown
 * methods remain unknown and are never copied from a companion document. */
export function compatibleViomeCompanion(incoming:ViomeFindings,existing:ViomeFindings){
 return incoming.documentKind!==existing.documentKind&&!existing.specimenEvent&&
  (!incoming.biologicalDates.collectedOn||!existing.biologicalDates.collectedOn||incoming.biologicalDates.collectedOn===existing.biologicalDates.collectedOn)&&
  (incoming.method==="not-supplied"||existing.method==="not-supplied"||incoming.method===existing.method)&&
  (incoming.specimenType==="not-supplied"||existing.specimenType==="not-supplied"||incoming.specimenType===existing.specimenType);
}
/** In-memory comparison only. No raw-byte or semantic fingerprint is stored.
 * Exact biological facts, multiplicity, dates and methods must match. Layout
 * positions and a separately confirmed specimen relationship are not biology.
 * User must explicitly select the existing owned record; never auto-merge. */
export function sameViomeBiologicalFacts(a:ViomeFindings,b:ViomeFindings){
 const normalize=(source:ViomeFindings)=>({provider:source.provider,documentKind:source.documentKind,specimenType:source.specimenType,method:source.method,
  biologicalDates:{collectedOn:source.biologicalDates.collectedOn||null,receivedOn:source.biologicalDates.receivedOn||null,reportedOn:source.biologicalDates.reportedOn||null},
  organisms:source.organisms.map(row=>JSON.stringify([row.correctedName||row.name,row.reportedGroup,row.reportedStatus])).sort(),
  assessments:source.assessments.map(row=>JSON.stringify([row.correctedName||row.name,row.correctedCategory||row.reportedCategory,row.description||null])).sort(),
  foods:source.foods.map(row=>JSON.stringify([row.correctedName||row.name,row.correctedCategory||row.reportedCategory])).sort(),
 });
 return JSON.stringify(normalize(a))===JSON.stringify(normalize(b));
}
export type ViomeSavedSource={id:string;processingStatus:string;structuredData:unknown;uploadedAt?:string|Date;deletionRevision?:string};
export function viomeImportContext(incoming:ViomeFindings,samples:readonly ViomeSavedSource[]){
 const complete=samples.flatMap(sample=>{const source=sample.processingStatus==="completed"?viomeSource(sample.structuredData):null;return source?[{sample,source}]:[];});
 return{
  duplicates:complete.filter(({source})=>sameViomeBiologicalFacts(incoming,source)),
  companions:complete.filter(({sample,source})=>compatibleViomeCompanion(incoming,source)&&!complete.some(other=>other.source.specimenEvent?.rootReportId===sample.id&&other.source.documentKind===incoming.documentKind)),
 };
}

/** Surgical edit of the existing source metadata; no biological value changes. */
export function withViomeSpecimenEvent(value:unknown,event?:ViomeFindings["specimenEvent"]){
 if(!viomeSource(value))throw new ViomeReportContextError("unavailable");
 const result=structuredClone(value) as any,target=result.sourceReport??result;
 if(event)target.specimenEvent=event;else delete target.specimenEvent;
 return result;
}

/** UI projection of owned saved sources; server independently verifies every mutation. */
export function savedViomeCompanions(sample:ViomeSavedSource,samples:readonly ViomeSavedSource[]){
 const source=viomeSource(sample.structuredData);
 if(!source)return{source:null,linked:[] as ViomeSavedSource[],eligible:[] as ViomeSavedSource[],reason:"Companion linking is unavailable for this source format. You can still view or delete this report."};
 const known=samples.filter(row=>row.id!==sample.id&&row.processingStatus==="completed"&&viomeSource(row.structuredData));
 const linked=known.filter(row=>source.specimenEvent?.rootReportId===row.id||viomeSource(row.structuredData)?.specimenEvent?.rootReportId===sample.id);
 const free=(row:ViomeSavedSource)=>!viomeSource(row.structuredData)?.specimenEvent&&!samples.some(other=>other.id!==row.id&&viomeSource(other.structuredData)?.specimenEvent?.rootReportId===row.id);
 const eligible=sample.processingStatus==="completed"&&!linked.length&&!source.specimenEvent?known.filter(row=>free(row)&&compatibleViomeCompanion(source,viomeSource(row.structuredData)!)):[];
 const opposite=known.filter(row=>viomeSource(row.structuredData)!.documentKind!==source.documentKind);
 const reason=sample.processingStatus!=="completed"?"This report has not finished saving.":source.specimenEvent&&!linked.length?"The linked report is unavailable. This report keeps its own findings.":!opposite.length?"No saved report of the complementary type is available.":!eligible.length&&!linked.length?"No compatible, unpaired report is available. Reports need complementary document types, compatible specimen/method and no conflicting known collection dates. When collection dates are missing, compare upload dates and confirm the specimen yourself. Dates alone never link reports.":"";
 return{source,linked,eligible,reason};
}
