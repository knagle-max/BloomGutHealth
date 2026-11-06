import {z} from "zod";

export const VIOME_FINDINGS_VERSION="bloom-viome-findings-v1" as const;
const label=z.string().min(1).max(150).refine(s=>!!s.trim());
const position=z.object({page:z.number().int().min(1).max(20),column:z.number().int().min(1).max(3),row:z.number().int().min(1).max(1000)}).strict();
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{
  const parsed=new Date(value+"T00:00:00Z");return Number.isFinite(+parsed)&&parsed.toISOString().slice(0,10)===value;
});
const organism=z.object({name:label,correctedName:label.optional(),reportedGroup:z.enum(["Bacteria","Viruses","Eukaryotes"]),reportedStatus:z.literal("reported_present"),position}).strict();
const assessment=z.object({name:label,correctedName:label.optional(),reportedCategory:z.enum(["Improve","Attention","Maintain"]),correctedCategory:z.enum(["Improve","Attention","Maintain"]).optional(),description:z.string().min(1).max(1000).optional(),position}).strict();
const food=z.object({name:label,correctedName:label.optional(),reportedCategory:z.enum(["Enjoy","Superfood","Minimize","Avoid"]),correctedCategory:z.enum(["Enjoy","Superfood","Minimize","Avoid"]).optional(),position}).strict();
const schema=z.object({
  schemaVersion:z.literal(VIOME_FINDINGS_VERSION),provider:z.literal("Viome"),
  documentKind:z.enum(["active-gut-microbes","health-scores-foods"]),
  specimenType:z.enum(["fecal","not-supplied"]),method:z.enum(["qualitative RNA","not-supplied"]),
  biologicalDates:z.object({collectedOn:date.optional(),receivedOn:date.optional(),reportedOn:date.optional()}).strict(),
  reviewConfirmed:z.literal(true),
  organisms:z.array(organism).max(1000),assessments:z.array(assessment).max(500),foods:z.array(food).max(1000),
}).strict().superRefine((value,ctx)=>{
  if(value.documentKind==="active-gut-microbes"?(!value.organisms.length||!!value.assessments.length||!!value.foods.length):(!value.assessments.length&&!value.foods.length)||!!value.organisms.length)
    ctx.addIssue({code:"custom",message:"Inconsistent document contents"});
  for(const rows of[value.organisms,value.assessments,value.foods]){
    const positions=rows.map(row=>`${row.position.page}:${row.position.column}:${row.position.row}`);
    if(new Set(positions).size!==positions.length)ctx.addIssue({code:"custom",message:"Conflicting source positions"});
  }
});
export type ViomeFindings=z.infer<typeof schema>;
export class ViomeFindingsError extends Error{
  constructor(kind:"content"|"metadata"="content"){
    super(kind==="content"?"Viome findings contain unsupported fields or inconsistent source records. No report was saved.":"De-identified Viome findings cannot include filenames or extra report metadata. No report was saved.");
  }
}
/** Also catches unknown future versions so they cannot fall back to legacy JSON. */
export function hasViomeFindingsMarker(value:unknown):boolean{
  return !!value&&typeof value==="object"&&!Array.isArray(value)&&typeof(value as any).schemaVersion==="string"&&(value as any).schemaVersion.startsWith("bloom-viome-findings-");
}
/** Only a typed biological envelope survives. Never expose Zod's unknown-key
 * diagnostics, which could contain an identifier supplied as a property name. */
export function parseViomeFindings(input:unknown):ViomeFindings{
  const result=schema.safeParse(input);
  if(!result.success)throw new ViomeFindingsError();
  return result.data;
}
export function assertViomeImportMetadata(source:unknown,fields:object,filename:unknown){
  if(!hasViomeFindingsMarker(source))return;
  parseViomeFindings(source);
  if(Object.keys(fields).length||filename!==null&&filename!==undefined)
    throw new ViomeFindingsError("metadata");
}
