import {z} from "zod";
import {parseMassEntry,parseCircumferenceEntry} from "./measurement-entry";
const token=z.string().min(1).max(128).regex(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/).refine(value=>!/[\r\n]/.test(value)&&Number.isFinite(Number(value)));
const scalar=(unit:"%"|"0-10")=>z.object({value:token,unit:z.literal(unit)}).strict();
export const checkinEntrySourceSchema=z.object({
 version:z.literal(1),capture:z.literal("manual-checkin"),fields:z.object({
  weight:z.object({value:token,unit:z.enum(["kg","lb"])}).strict().optional(),
  waist:z.object({value:token,unit:z.enum(["cm","in"])}).strict().optional(),
  bodyFatPercent:scalar("%").optional(),bloating:scalar("0-10").optional(),energy:scalar("0-10").optional(),adherencePercent:scalar("%").optional(),
 }).strict().refine(fields=>Object.values(fields).some(value=>value!==undefined)),
}).strict();
export type CheckinEntrySource=z.infer<typeof checkinEntrySourceSchema>;
type Canonical={weightKg:number|null;waistCm:number|null;bodyFatPercent:number|null;bloating:number|null;energy:number|null;adherencePercent:number|null};
export function checkinEntrySourceMatches(source:CheckinEntrySource|undefined,canonical:Canonical){
 if(!source)return true;
 for(const [key,input]of Object.entries(source.fields)){
  if(!input)continue;
  const target=key==="weight"?canonical.weightKg:key==="waist"?canonical.waistCm:canonical[key as keyof Canonical];
  const converted=key==="weight"?parseMassEntry(input as {unit:"kg"|"lb";value:string}):key==="waist"?parseCircumferenceEntry(input as {unit:"cm"|"in";value:string}):{kind:"valid" as const,canonical:Number(input.value)};
  if(target===null||target===undefined||converted.kind!=="valid")return false;
  const tolerance=8*Number.EPSILON*Math.max(Math.abs(converted.canonical),Math.abs(target));
  if(Math.abs(converted.canonical-target)>tolerance)return false;
 }
 return true;
}
