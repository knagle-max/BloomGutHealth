import {numericEntryToken} from "./numeric-entry-token";
import {z} from "zod";
import {displayToKg,quantityToCanonical,type QuantityDisplayUnit} from "./display-units";
const token=numericEntryToken;
const mass=z.object({value:token,unit:z.enum(["kg","lb"])}).strict();
const fluid=z.object({value:token,unit:z.enum(["mL","L","US-fl-oz"])}).strict();
const energy=z.object({value:token,unit:z.enum(["kcal","kJ"])}).strict();
const nonempty=(fields:object)=>Object.values(fields).some(value=>value!==undefined);
export const athleteReferenceEntrySourceSchema=z.object({version:z.literal(1),capture:z.literal("athlete-reference"),fields:z.object({weightKg:mass.optional(),energyKcal:energy.optional()}).strict().refine(nonempty)}).strict();
export const sessionEntrySourceSchema=z.object({version:z.literal(1),capture:z.literal("manual-session"),fields:z.object({fluidMl:fluid.optional()}).strict().refine(nonempty)}).strict();
export const hydrationEntrySourceSchema=z.object({version:z.literal(1),capture:z.literal("manual-hydration"),fields:z.object({preKg:mass.optional(),postKg:mass.optional(),drankMl:fluid.optional(),urineMl:fluid.optional()}).strict().refine(nonempty)}).strict();
export type AthleteReferenceEntrySource=z.infer<typeof athleteReferenceEntrySourceSchema>;
export type SessionEntrySource=z.infer<typeof sessionEntrySourceSchema>;
export type HydrationEntrySource=z.infer<typeof hydrationEntrySourceSchema>;
export type AthleteEntrySource=AthleteReferenceEntrySource|SessionEntrySource|HydrationEntrySource;
/** Metadata never changes numbers or permissions. Legacy absence stays unknown. */
export function athleteEntrySourceMatches(source:AthleteEntrySource|undefined,values:object){
 if(!source)return true;
 for(const [key,input]of Object.entries(source.fields)){
  if(!input)continue;
  const target=(values as Record<string,unknown>)[key];if(typeof target!=="number"||!Number.isFinite(target))return false;
  if(!Number.isFinite(Number(input.value)))return false;
  let converted:number;
  try{
  if(input.unit==="kg"||input.unit==="lb")converted=displayToKg(Number(input.value),input.unit);
  else converted=quantityToCanonical(key==="energyKcal"?"energy":"hydration",Number(input.value),input.unit as QuantityDisplayUnit);
  }catch{return false;}
  // Existing team energy contract is an integer kcal target; preserve that rule.
  if(key==="energyKcal")converted=Math.round(converted);
  const tolerance=8*Number.EPSILON*Math.max(Math.abs(converted),Math.abs(target));
  if(Math.abs(converted-target)>tolerance)return false;
 }
 return true;
}
