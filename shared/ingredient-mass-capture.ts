import {ingredientMassEntrySchema,ingredientMassEntryMatches,type IngredientMassEntry} from "./ingredient-mass-entry";
/** Only literal valid manual input becomes original metadata. Never reconstruct it. */
export function captureIngredientMassEntry(value:string,unit:"g"|"oz",grams:number|null):IngredientMassEntry|undefined{
 const parsed=ingredientMassEntrySchema.safeParse({version:1,capture:"manual-portion",value,unit});
 return parsed.success&&ingredientMassEntryMatches(parsed.data,grams)?parsed.data:undefined;
}
