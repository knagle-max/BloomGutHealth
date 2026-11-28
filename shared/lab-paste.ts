import {labValidationIssues,labValidationMessage,type LabValidationIssue} from "./lab-validation-issues";
import {additionalLabSourceIdentity,normalizedLabUnit,labUnitKey} from './lab-source-identity';
import {parseSourceReference} from './lab-source-reference';
import {additionalLabMarkers} from './additional-lab-markers';
import {vitaminDAssayIdentity,labSourceColumns} from "./lab-assay-identity";
import { markerDefinitions, labSchema, sourceOnlyLabSchema, type SourceOnlyLab } from "./precision-nutrition";
const aliases: Record<string, string> = {
  ldlcholesterol: "ldl",
  hdlcholesterol: "hdl",
  hemoglobina1c: "hba1c",
  haemoglobina1c: "hba1c",
  a1c: "hba1c",
  "25ohvitamind": "vitamin_d",
  vitamind: "vitamin_d",
  vitaminb12: "b12",
  serumfolate: "folate",
  alanineaminotransferase: "alt",
  aspartateaminotransferase: "ast",
};
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
/** Explicit report headings only; never infer biological categories from a row. */
export const isLabSectionHeading=(line:string)=>/^\[[^\r\n]*\]$/.test(line.trim());
const isColumnHeading=(line:string)=>{
  const fields=line.split(/[,\t]/).map(field=>normalize(field.trim()));
  const names=["marker","test","analyte","markername","testname","analytename"];
  if(fields.length>1)return fields.length<=4&&names.includes(fields[0])&&["value","result"].includes(fields[1])&&
    (fields.length<3||["unit","units"].includes(fields[2]))&&(fields.length<4||["reference","referenceinterval","referencerange"].includes(fields[3]));
  return /^(?:marker|test|analyte)(?:\s+name)?\s+(?:value|result)(?:\s+units?(?:\s+reference(?:\s+(?:range|interval))?)?)?$/i.test(line.trim());
};
/** Keep physical row positions and source headings while removing acknowledged results. */
export function labPasteCorrections(text:string,errorLines:number[]):string {
  if(errorLines.some(line=>line<1))return text;
  const keep=new Set(errorLines);
  return text.split(/\r?\n/).map((raw,index)=>keep.has(index+1)||isLabSectionHeading(raw)?raw:"").join("\n");
}
export function parseLabPaste(
  text: string,
  measuredAt: string,
  laboratory = "Not supplied",
) {
  if (text.length > 30000)
    throw Error("Paste up to 30,000 characters at a time.");
  const dateCheck=labSchema.shape.measuredAt.safeParse(measuredAt);
  if(!dateCheck.success){const issues=labValidationIssues(dateCheck.error.issues.map(issue=>({...issue,path:["measuredAt",...issue.path]})));return{valid:[],pending:[],sourceOnly:[],errors:[{line:0,message:labValidationMessage(issues),issues}]};}
  const rows = text.split(/\r?\n/).map((raw,index)=>({raw,row:raw.trim(),index})).filter(({row})=>Boolean(row));
  if (rows.filter(({row})=>!isLabSectionHeading(row)&&!isColumnHeading(row)).length > 50) throw Error("Paste up to 50 results at a time.");
  const valid: Array<{
      line: number;
      payload: ReturnType<typeof labSchema.parse>;
    }> = [],
    errors: Array<{ line: number; message: string;issues?:LabValidationIssue[] }> = [],
    pending: typeof valid = [];
  const sourceOnly:Array<{line:number;payload:SourceOnlyLab}>=[];
  let reportedSection:string|undefined,sectionBlocked=false;
  rows.forEach(({raw,row,index}) => {
    if(isLabSectionHeading(raw)){
      sectionBlocked=raw.length>1000;
      reportedSection=sectionBlocked?undefined:raw;
      if(sectionBlocked)errors.push({line:index+1,message:"Source section exceeds 1,000 characters. Correct it before importing its results."});
      return;
    }
    if(isColumnHeading(row))return;
    if(sectionBlocked){errors.push({line:index+1,message:"Correct the preceding source section before importing this result."});return;}
    if(raw.length>1000){errors.push({line:index+1,message:"Source row exceeds 1,000 characters. Correct it before importing."});return;}
    const reject=(message:string,issues?:LabValidationIssue[])=>{
      errors.push({line:index+1,message,...(issues?{issues}:{})});
      // Only explicit delimited source columns; never guess a scientific assay or unit.
      const fields=labSourceColumns(raw);
      if(fields.length<2||fields.length>4)return;
      const reportedValue=fields[1].trim(),reportedUnit=fields[2]?.trim()||null;
      const parsed=sourceOnlyLabSchema.safeParse({sourceOnly:true,reportedAnalyte:fields[0].trim(),reportedValue,reportedUnit,
        ...(fields[3]?.trim()?{reportedReferenceInterval:fields[3].trim()}:{}),measuredAt,laboratory:laboratory.trim()||"Not supplied",method:"Not supplied",fasting:"unknown",
        sourceInput:{text:raw,number:reportedValue,suppliedUnit:reportedUnit,capture:"pasted-report",rowOrder:index,...(reportedSection===undefined?{}:{reportedSection})}});
      if(parsed.success)sourceOnly.push({line:index+1,payload:parsed.data});
    };
    const delimited=labSourceColumns(raw);
    if(!delimited.length){reject("Quoted source columns are incomplete or ambiguous. Correct the original row before importing.");return;}
    if(vitaminDAssayIdentity(delimited[0])==='different-or-ambiguous'){
      reject("This vitamin D assay is not confirmed as 25-hydroxy vitamin D. Retain the original observation as source-only for separate assay review.");return;
    }
    if(delimited.length>4){reject("Additional source columns need separate review. Keep the original row and enter its reported result and interval explicitly.");return;}
    const reference=parseSourceReference(delimited[3]||'');
    if(!reference){reject("The reported reference text is not a supported numeric interval. Keep it as source-only or review its exact bounds without inventing a normal range.");return;}
    const numeric='(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?';
    let match:RegExpMatchArray|null;
    if(delimited.length>=2){
      const measured=delimited[1].trim().match(new RegExp(`^(${numeric})(?:\\s*([^\\d\\s].*))?$`));
      if(!measured){reject("Enter an exact source number, keeping thresholds or qualitative findings as source-only.");return;}
      const embedded=measured[2]?.trim(),supplied=delimited[2]?.trim();
      if(embedded&&supplied&&labUnitKey(embedded)!==labUnitKey(supplied)){reject("Two conflicting source units need review before this result can be interpreted.");return;}
      match=[raw,delimited[0].trim(),measured[1],supplied||embedded||''] as RegExpMatchArray;
    }else match=row.trim().match(new RegExp(`^(.+?)\\s+(${numeric})(?:\\s*([^\\d\\s].*))?$`));
    if(!match){reject("Use Marker, value, unit and optionally the report reference range.");return;}
    const identified=additionalLabSourceIdentity(match[1],match[3]);
    if(identified.ambiguous){reject(identified.ambiguous);return;}
    const key=normalize(match[1]),marker=markerDefinitions.find(m=>
      identified.id?m.id===identified.id:normalize(m.id)===key||normalize(m.name)===key||m.id===aliases[key]||(m.id==='vitamin_d'&&vitaminDAssayIdentity(match[1])==='25-hydroxy'));
    if(!marker){reject(`Unsupported marker: ${match[1]}. Its original source value remains available for review.`);return;}
    const missingUnit=!match[3]?.trim(),sourceUnit=(match[3]||'').trim();
    const unit=normalizedLabUnit(sourceUnit,marker.units),rawUnit=sourceUnit.replace(/[µμ]/g,'u');
    const p = labSchema.safeParse({
      marker: marker.id,
      value: Number(match[2]),
      unit: missingUnit ? marker.units[0] : unit || rawUnit,
      measuredAt,
      laboratory: laboratory.trim() || "Not supplied",
      method: "Not supplied",
      fasting: "unknown",
      referenceLow: reference.low,
      referenceHigh: reference.high,
      sourceInput:{text:raw,number:match[2],suppliedUnit:missingUnit?null:sourceUnit,capture:"pasted-report",rowOrder:index,...(reportedSection===undefined?{}:{reportedSection})},
      ...(missingUnit ? {unitReview:{status:"pending",originalValue:Number(match[2]),originalUnit:null,
        originalText:raw,suggestedUnit:marker.units[0],confirmedAt:null,supersedes:null}} : {}),
      notes:
        "Imported from source text; verify against the original laboratory report.",
    });
    if (!p.success) {
      const issues=labValidationIssues(p.error.issues);reject(labValidationMessage(issues,marker),issues);
      return;
    }
    if ([...valid,...pending].some((v) => v.payload.marker === p.data.marker)) {
      reject(`Duplicate ${marker.name}; import different test dates separately.`);
      return;
    }
    (missingUnit ? pending : valid).push({ line: index + 1, payload: p.data });
  });
  return { valid, errors, pending, sourceOnly };
}

/** Reuse the parser's existing aliases for local navigation search, not diagnosis. */
export function labMarkerSearchTerms(marker:string):string[]{
 return [marker,...additionalLabMarkers.filter(m=>m.id===marker).flatMap(m=>[...m.aliases]),...markerDefinitions.filter(m=>m.id===marker).map(m=>m.name),...Object.entries(aliases).filter(([,id])=>id===marker).map(([name])=>name)];
}
