import {z} from "zod";
import {ingredientMassEntrySchema,ingredientMassEntryMatches,type IngredientMassEntry} from "./ingredient-mass-entry";
const schema=z.object({kind:z.literal("bloom-catalogue-mass-v1"),owner:z.string().min(1).max(200),fdcId:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),grams:z.number().positive().max(3000),massEntry:ingredientMassEntrySchema}).strict().refine(value=>ingredientMassEntryMatches(value.massEntry,value.grams));
/** Navigation glue only: source text never enters query URLs or a second draft store. */
export function catalogueMassHandoff(owner:string|undefined,fdcId:number,grams:number,massEntry:IngredientMassEntry|undefined){
 if(!owner||!massEntry)return undefined;
 const parsed=schema.safeParse({kind:"bloom-catalogue-mass-v1",owner,fdcId,grams,massEntry});return parsed.success?parsed.data:undefined;
}
export function readCatalogueMassHandoff(state:unknown,owner:string|undefined,fdcId:number,grams:number):IngredientMassEntry|undefined{
 const parsed=schema.safeParse(state);
 return parsed.success&&owner&&parsed.data.owner===owner&&parsed.data.fdcId===fdcId&&parsed.data.grams===grams?parsed.data.massEntry:undefined;
}
