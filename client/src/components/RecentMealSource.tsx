import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/lib/auth';
import {Button} from '@/components/ui/button';
import {ingredientSchema,mealContextSchema,type Ingredient} from '@shared/meal-intelligence';
import type {Meal} from '@shared/schema';

/** An optional source for the canonical draft, never a consumption write. */
export default function RecentMealSource({disabled,onLoad}:{disabled:boolean;onLoad:(text:string,ingredients:Ingredient[],restaurant?:{restaurant:string;market:string;source:'user-entered-context'})=>void}){
  const {user}=useAuth();
  const [open,setOpen]=useState(false);
  const source=useQuery<Meal[]>({queryKey:['/api/meals',user?.id],enabled:!!user&&open});
  const current=source.fetchStatus==='idle'&&!source.isError&&!source.isStale;
  const recent=current?(source.data||[]).filter(meal=>meal.userId===user?.id).slice().sort((a,b)=>+new Date(b.loggedAt)-+new Date(a.loggedAt)).flatMap(meal=>{
    const parsed=ingredientSchema.array().min(1).max(20).safeParse((meal.intelligence as {ingredients?:unknown}|null)?.ingredients);
    if(!parsed.success||!meal.mealText.trim()||meal.mealText.length>2000)return [];
    const context=mealContextSchema.safeParse(meal.mealContext);
    return [{meal,ingredients:parsed.data,restaurant:context.success?context.data.restaurantContext:undefined}];
  }).slice(0,5):[];
  return <details className="space-y-3" onToggle={event=>setOpen(event.currentTarget.open)}>
    <summary>Review a recent meal</summary>
    <p className="panel-note">Reuse the confirmed foods, preparation and portions from one of your five most recent eligible meals. Review current nutrition before saving a new entry. Earlier entries stay as recorded.</p>
    {disabled&&<p role="status">Your current draft is kept. Finish or clear it before loading another meal.</p>}
    {source.isError?<p role="alert">Recent meals could not load. <Button type="button" variant="outline" onClick={()=>source.refetch()}>Retry recent meals</Button></p>:open&&!current?<p role="status">Checking your recent meals…</p>:open&&recent.length===0?<p>No reviewed meals are available to reuse yet.</p>:recent.map(({meal,ingredients,restaurant})=><article key={meal.id} className="precision-observation block">
      <p>{meal.mealText}</p>
      <Button type="button" variant="outline" disabled={disabled||!current} onClick={()=>onLoad(meal.mealText,ingredients,restaurant)}>Review this recent meal</Button>
    </article>)}
  </details>;
}
