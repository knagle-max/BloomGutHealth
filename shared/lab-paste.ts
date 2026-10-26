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
const isColumnHeading=(line:string)=>/^(marker|test|analyte)[,\t ]/i.test(line.trim());
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
  if (!Number.isFinite(Date.parse(measuredAt))) return { valid: [], pending: [], sourceOnly: [], errors: [{ line: 0, message: "Choose a valid report date." }] };
  const rows = text.split(/\r?\n/).map((raw,index)=>({raw,row:raw.trim(),index})).filter(({row})=>Boolean(row));
  if (rows.filter(({row})=>!isLabSectionHeading(row)&&!isColumnHeading(row)).length > 50) throw Error("Paste up to 50 results at a time.");
  const valid: Array<{
      line: number;
      payload: ReturnType<typeof labSchema.parse>;
    }> = [],
    errors: Array<{ line: number; message: string }> = [],
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
    const reject=(message:string)=>{
      errors.push({line:index+1,message});
      // Only explicit delimited source columns; never guess a scientific assay or unit.
      const fields=raw.split(/[,\t]/);
      if(fields.length<2||fields.length>4||fields.some(field=>field.includes('"')))return;
      const reportedValue=fields[1].trim(),reportedUnit=fields[2]?.trim()||null;
      const parsed=sourceOnlyLabSchema.safeParse({sourceOnly:true,reportedAnalyte:fields[0].trim(),reportedValue,reportedUnit,
        ...(fields[3]?.trim()?{reportedReferenceInterval:fields[3].trim()}:{}),measuredAt,laboratory:laboratory.trim()||"Not supplied",method:"Not supplied",fasting:"unknown",
        sourceInput:{text:raw,number:reportedValue,suppliedUnit:reportedUnit,capture:"pasted-report",rowOrder:index,...(reportedSection===undefined?{}:{reportedSection})}});
      if(parsed.success)sourceOnly.push({line:index+1,payload:parsed.data});
    };
    // Suggestions use only the marker catalogue, never magnitude-based clinical inference.
    const match = row
      .trim()
      .match(/^(.+?)[,\t ]+([0-9]+(?:\.[0-9]+)?)(?:[,\t ]+([^,\t]+))?(?:[,\t].*)?$/);
    if (!match) {
      reject("Use Marker, value, unit (for example LDL, 3.2, mmol/L).");
      return;
    }
    const key = normalize(match[1]),
      marker = markerDefinitions.find(
        (m) =>
          normalize(m.id) === key ||
          normalize(m.name) === key ||
          m.id === aliases[key],
      );
    if (!marker) {
      reject(`Unsupported marker: ${match[1]}. Use one of the listed tests.`);
      return;
    }
    // A second trailing value is ambiguous (possibly reference ranges or notes).
    // Preserve strict review instead of silently discarding it.
    if (match[3] && /\s/.test(match[3].trim())) {
      reject("Use a single supported source unit; enter other report details separately.");
      return;
    }
    const missingUnit = !match[3]?.trim();
    const sourceUnit=(match[3] || "").trim();
    const rawUnit = sourceUnit.replace(/μ|µ/g, "u"),
      unit = marker.units.find(
        (u) => u.toLowerCase().replace(/μ|µ/g, "u") === rawUnit.toLowerCase(),
      );
    const p = labSchema.safeParse({
      marker: marker.id,
      value: Number(match[2]),
      unit: missingUnit ? marker.units[0] : unit || rawUnit,
      measuredAt,
      laboratory: laboratory.trim() || "Not supplied",
      method: "Not supplied",
      fasting: "unknown",
      referenceLow: null,
      referenceHigh: null,
      sourceInput:{text:raw,number:match[2],suppliedUnit:missingUnit?null:sourceUnit,capture:"pasted-report",rowOrder:index,...(reportedSection===undefined?{}:{reportedSection})},
      ...(missingUnit ? {unitReview:{status:"pending",originalValue:Number(match[2]),originalUnit:null,
        originalText:raw,suggestedUnit:marker.units[0],confirmedAt:null,supersedes:null}} : {}),
      notes:
        "Imported from pasted results; verify against the original laboratory report.",
    });
    if (!p.success) {
      reject(`Check value and unit for ${marker.name}; accepted units: ${marker.units.join(", ")}.`);
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
