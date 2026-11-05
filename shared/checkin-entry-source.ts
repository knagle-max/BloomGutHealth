import {numericEntryToken} from "./numeric-entry-token";
import {z} from "zod";
import {parseMassEntry,parseCircumferenceEntry,originalMassEntry,originalCircumferenceEntry,type MassEntry,type CircumferenceEntry} from "./measurement-entry";
const token=numericEntryToken;
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

/** Capture only known original tokens. A copied canonical value has no invented origin. */
export function captureCheckinEntrySource(weight:MassEntry,waist:CircumferenceEntry,scalars:Partial<Record<"bodyFatPercent"|"bloating"|"energy"|"adherencePercent",string>>):CheckinEntrySource|undefined{
 const fields:CheckinEntrySource["fields"]={};
 const mass=originalMassEntry(weight),circumference=originalCircumferenceEntry(waist);
 if(mass)fields.weight=mass;
 if(circumference)fields.waist=circumference;
 for(const key of["bodyFatPercent","bloating","energy","adherencePercent"]as const){
  const value=scalars[key];
  if(value!==undefined&&value!=="")fields[key]={value,unit:key==="bloating"||key==="energy"?"0-10":"%"};
 }
 return Object.keys(fields).length?checkinEntrySourceSchema.parse({version:1,capture:"manual-checkin",fields}):undefined;
}
