import {recognizedMealTimeZone} from './meal-time';

/** Observed log names only: no species, food-group, adequacy or clinical inference. */
export function weeklyFoodReview(meals:Array<{loggedAt:Date|string;intelligence?:unknown}>,endDate:string,timeZone:string){
 const end=Date.parse(endDate+'T00:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(endDate)||!Number.isFinite(end)||new Date(end).toISOString().slice(0,10)!==endDate||!recognizedMealTimeZone(timeZone))throw Error('Choose a valid review date and time zone.');
 const from=new Date(end-6*86400000).toISOString().slice(0,10);
 const calendar=new Intl.DateTimeFormat('en',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'});
 const foods=new Map<string,{name:string;loggedMeals:number;portionUnknown:boolean}>();
 let entries=0,withIngredients=0;
 for(const meal of meals){
  const instant=new Date(meal.loggedAt);if(!Number.isFinite(+instant))continue;
  const parts=Object.fromEntries(calendar.formatToParts(instant).map(p=>[p.type,p.value])),day=`${parts.year}-${parts.month}-${parts.day}`;
  if(day<from||day>endDate)continue;entries++;
  const raw=meal.intelligence&&typeof meal.intelligence==='object'?(meal.intelligence as {ingredients?:unknown}).ingredients:undefined;
  const ingredients=Array.isArray(raw)?raw.filter((item):item is {name:string;grams?:unknown}=>!!item&&typeof item.name==='string'&&!!item.name.trim()&&item.name.trim().length<=120):[];
  if(ingredients.length)withIngredients++;
  const seen=new Set<string>();
  for(const item of ingredients){
   const name=item.name.trim().replace(/\s+/g,' '),key=name.toLocaleLowerCase('en');
   const current=foods.get(key)||{name,loggedMeals:0,portionUnknown:false};
   if(!seen.has(key)){current.loggedMeals++;seen.add(key);}
   if(typeof item.grams!=='number'||!Number.isFinite(item.grams)||item.grams<=0)current.portionUnknown=true;
   foods.set(key,current);
  }
 }
 return {from,to:endDate,timeZone,entries,withIngredients,withoutIngredients:entries-withIngredients,foods:Array.from(foods.values()).sort((a,b)=>b.loggedMeals-a.loggedMeals||a.name.localeCompare(b.name,'en'))};
}
