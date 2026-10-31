import {Link} from "wouter";
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/lib/auth';
import {apiRequest} from '@/lib/queryClient';
import {localDate} from '@/lib/experience';
import {currentMealTimeZone} from '@shared/meal-time';
import {weeklyFoodReview} from '@shared/weekly-food-review';
import type {Meal} from '@shared/schema';
import {Button} from './ui/button';

export default function WeeklyFoodReview(){
 const{user}=useAuth(),[expanded,setExpanded]=useState(false),date=localDate(),zone=currentMealTimeZone();
 const meals=useQuery<Meal[]>({queryKey:['/api/meals',user?.id],enabled:!!user,queryFn:async({signal})=>{const rows=await(await apiRequest('GET','/api/meals',undefined,undefined,signal)).json();if(!Array.isArray(rows)||!rows.every(row=>row&&typeof row==='object'&&typeof row.loggedAt==='string'))throw Error('Your food log could not be checked.');return rows;}});
 const ready=!!user&&Array.isArray(meals.data)&&meals.fetchStatus==='idle'&&!meals.isError&&!meals.isStale;
 const review=ready?weeklyFoodReview(meals.data!,date,zone||'UTC'):null;
 return <section className="bloom-panel space-y-3" aria-labelledby="weekly-food-heading">
  <h2 id="weekly-food-heading">Ingredient names in your food log</h2>
  <p className="panel-note">A gentle look at what you recorded this week. Names come from saved ingredient details; similar names may describe the same food. This is not a dietary diversity or diet-quality score.</p>
  {!ready&&<><p role={meals.isError?'alert':'status'}>{meals.isError?'Your food log could not be checked. The ingredient summary is unavailable.':'Checking this week’s food log…'}</p>{!meals.isFetching&&<Button variant="outline" onClick={()=>void meals.refetch()}>Retry food review</Button>}</>}
  {review&&<><p>{review.from}–{review.to} · {zone?`Current device time zone: ${zone}`:'UTC calendar; device time zone unavailable.'}</p>
   {!review.entries?<p>No meals are logged in this period. Unlogged foods are not known.</p>:<>
    <p>{review.withIngredients} of {review.entries} logged meals include ingredient names.{review.withoutIngredients>0?` ${review.withoutIngredients} have no usable ingredient details and are not represented below.`:''}</p>
    {!review.foods.length?<p>Open a logged meal to review its ingredient breakdown before using this summary.</p>:<ul className="space-y-2">{review.foods.slice(0,expanded?undefined:50).map(food=><li key={food.name.toLocaleLowerCase('en')} className="break-words"><strong>{food.name}</strong> · {food.loggedMeals} logged meal{food.loggedMeals===1?'':'s'}{food.portionUnknown?' · some gram amounts unknown':''}</li>)}</ul>}
    {review.foods.length>50&&<Button variant="outline" onClick={()=>setExpanded(v=>!v)}>{expanded?'Show fewer names':'Show all recorded names'}</Button>}
   </>}
   <p className="panel-note">Use your usual preferences and restrictions when planning meals. This list cannot confirm food-group coverage, nutrient adequacy or a biological effect.</p>
   <Link className="text-link" href="/nutrition">Review my food journal</Link>
  </>}
 </section>;
}
