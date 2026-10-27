import {useExperienceRecords} from '@/lib/experience';
import {templateSchema} from '@shared/experience';
import {ingredientSchema,type Ingredient} from '@shared/meal-intelligence';
import {Button} from '@/components/ui/button';

/** Load an owned template into the existing review, without recording consumption. */
export default function SavedMealSource({id,servings,onLoad}:{id:string;servings:number;onLoad:(description:string,ingredients:Ingredient[])=>void}) {
  const source=useExperienceRecords('meal-template');
  const current=source.fetchStatus==='idle'&&!source.isError&&!source.isStale;
  const record=current?source.data?.find(record=>record.id===id&&record.kind==='meal-template'):undefined;
  const parsed=templateSchema.safeParse(record?.payload);
  const amountValid=Number.isFinite(servings)&&servings>=.1&&servings<=10;
  const scaled=parsed.success&&amountValid?ingredientSchema.array().min(1).max(20).safeParse(parsed.data.ingredients.map(ingredient=>({...ingredient,grams:ingredient.grams===null?null:ingredient.grams*servings,...(ingredient.product?{product:{...ingredient.product,servings:ingredient.product.servings*servings}}:{})}))):undefined;
  return <section className="bloom-panel space-y-3" aria-labelledby="saved-source-title">
    <h2 id="saved-source-title">Review a saved meal</h2>
    {source.isError?<p role="alert">Saved meals could not load. <Button type="button" variant="outline" onClick={()=>source.refetch()}>Retry saved meal</Button></p>:!current?<p role="status">Checking your saved meal…</p>:!parsed.success?<p role="alert">This saved meal is no longer available in your account. Choose another saved meal or log something new.</p>:<>
      <p>{parsed.data.name} · {servings} × saved portion</p>
      <p className="panel-note">Load the saved ingredients, then review their current nutrition and adjust amounts before confirming. This creates a new journal entry; the saved recipe and earlier meals stay as recorded.</p>
      {!scaled?.success&&<p role="alert">This portion exceeds supported amounts. Return to Saved meals and choose a multiplier between 0.1 and 10.</p>}
      <Button type="button" disabled={!scaled?.success} onClick={()=>{if(parsed.success&&scaled?.success)onLoad(parsed.data.mealText||parsed.data.name,scaled.data);}}>Load saved ingredients</Button>
    </>}
  </section>;
}
