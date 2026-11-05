import {z} from "zod";
import {parseHeightEntry,parseMassEntry} from "./measurement-entry";
const token=z.string().max(128).regex(/^(?:\d+(?:\.\d*)?|\.\d+)$/);
export const profileMeasurementFieldsSchema=z.object({
 height:z.object({unit:z.enum(["cm","m","ft-in"]),primary:token,inches:z.union([z.literal(""),token])}).strict().refine(value=>(value.unit==="ft-in"||value.inches==="")&&parseHeightEntry(value).kind==="valid").optional(),
 weight:z.object({unit:z.enum(["kg","lb"]),value:token}).strict().refine(value=>parseMassEntry(value).kind==="valid").optional(),
}).strict();
export const profileMeasurementWriteSchema=z.object({version:z.literal(1),expectedRevision:z.union([z.literal("none"),z.string().uuid()]),fields:profileMeasurementFieldsSchema}).strict();
export type ProfileMeasurementWrite=z.infer<typeof profileMeasurementWriteSchema>;
export type ProfileMeasurementFields=z.infer<typeof profileMeasurementFieldsSchema>;
export type ProfileMeasurementSource={available:false}|{available:true;revision:string;fields:ProfileMeasurementFields};
// users currently stores PostgreSQL REAL. Bind provenance to that exact storage
// representation without changing historical numeric values or inventing precision.
export function profileMeasurementFieldsMatch(fields:ProfileMeasurementFields,values:{heightCm?:number|null;weightKg?:number|null}){
 for(const key of["height","weight"]as const){const input=fields[key];if(!input)continue;
  const target=key==="height"?values.heightCm:values.weightKg;
  const parsed=key==="height"?parseHeightEntry(input as NonNullable<ProfileMeasurementFields["height"]>):parseMassEntry(input as NonNullable<ProfileMeasurementFields["weight"]>);
  if(target==null||parsed.kind!=="valid"||Math.fround(parsed.canonical)!==Math.fround(target))return false;
 }
 return true;
}
