import type {Lab,SourceOnlyLab} from './precision-nutrition';
import type {AnyLabHistoryRow} from './lab-history';
function facts(lab:Lab|SourceOnlyLab){
 if("sourceOnly" in lab)return JSON.stringify(["source-only",lab.reportedAnalyte,lab.reportedValue,lab.reportedUnit,lab.reportedReferenceInterval??null,Date.parse(lab.measuredAt),lab.laboratory,lab.method,lab.fasting]);
 const sourceUnit=lab.sourceInput?lab.sourceInput.suppliedUnit:lab.unitReview?lab.unitReview.originalUnit:lab.unit;
 return JSON.stringify(["supported",lab.marker,lab.unitReview?.originalValue??lab.value,sourceUnit,Date.parse(lab.measuredAt),lab.laboratory,lab.method,lab.fasting,lab.referenceLow,lab.referenceHigh]);
}
/** Advisory source matches, never identity proof or automatic deletion/merging. */
export function possibleLabReimports(incoming:Lab|SourceOnlyLab,existing:readonly AnyLabHistoryRow[]){
 const signature=facts(incoming);
 return existing.filter(row=>{
  if(incoming.sourceReport&&row.sourceReport?.importId===incoming.sourceReport.importId)return false;
  for(const key of ['reportIdentifier','specimenIdentifier'] as const){
   const next=incoming.sourceReport?.[key],prior=row.sourceReport?.[key];
   if(next?.trim()&&prior?.trim()&&next!==prior)return false;
  }
  return signature===facts(row);
 });
}
