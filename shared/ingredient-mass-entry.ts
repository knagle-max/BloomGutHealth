import {z} from "zod";
import {numericEntryToken} from "./numeric-entry-token";
import {quantityToCanonical} from "./display-units";
export const ingredientMassEntrySchema=z.object({version:z.literal(1),capture:z.literal("manual-portion"),value:numericEntryToken,unit:z.enum(["g","oz"])}).strict();
export type IngredientMassEntry=z.infer<typeof ingredientMassEntrySchema>;
export function ingredientMassEntryMatches(source:IngredientMassEntry|undefined,grams:number|null){
 if(!source)return true;
 if(grams===null||!Number.isFinite(grams)||!Number.isFinite(Number(source.value)))return false;
 let converted:number;try{converted=quantityToCanonical("foodWeight",Number(source.value),source.unit);}catch{return false;}
 return converted>0&&converted<=3000&&Math.abs(converted-grams)<=8*Number.EPSILON*Math.max(Math.abs(converted),Math.abs(grams));
}
