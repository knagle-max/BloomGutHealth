import {intoleranceWarnings,tasteMatches} from "./food-preference-policy";
import { explainRecipeBiology } from "./recipe-intelligence";
import type { BiologicalRegistry } from "./biological-model";
import { explainNutrientContribution, type TargetRange } from "./food-intelligence";
import { eligiblePlanningRecipes, recipeNutrients, type WeeklyRequest } from "./weekly-planner";
import type { DietaryPreferences } from "./meal-intelligence";
import type { PrecisionReport } from "./precision-nutrition";
import type { z } from "zod";
import { practicalPreferencesSchema, type ExperienceRecord } from "./experience";
import { mealNutritionSummary } from "./nutrition-summary";
import { recipePreparation } from "./recipe-preparation";
import { goalMealFit } from "./goal-guidance";
export function practicalChoices(meals:any[], preferences:DietaryPreferences, report:PrecisionReport, request:WeeklyRequest, practical:z.infer<typeof practicalPreferencesSchema>, blocked=false, slot="dinner", registry?:BiologicalRegistry) {
 const summary=mealNutritionSummary(meals), n=summary.totals;
 const mapping:Record<string,string>={calories:"calories",protein_g:"protein",fiber_g:"fiber",sodium_mg:"sodium",fat_saturated_g:"fat_saturated_g",carbohydrates_total_g:"carbs",fat_total_g:"fat"};
 const limits:Record<string,number>={calories:request.targets.calories*1.1,sodium_mg:request.targets.sodium,fiber_g:request.targets.fiberMaximum,fat_saturated_g:request.targets.saturatedFat};
 for(const [key,t] of Object.entries(request.nutrientTargets))if(t.max!==null)limits[key]=t.max;
 const recipeMenu=eligiblePlanningRecipes(preferences,report.context.allergies,request.customRecipes);
 if(blocked||recipeMenu.unknownAllergies.length) return {choices:[],note:"Review your health context, recognized allergies and daily targets before generating personalized choices."};
 const hasHeat=practical.equipment.includes("stove")||practical.equipment.includes("oven");
 const pantry=practical.pantry.map(v=>v.toLowerCase());
 const candidates=recipeMenu.recipes.filter(r=>slot==="breakfast"?r.mealType==="breakfast":slot==="snack"?r.mealType==="snack":r.mealType==="main").flatMap(recipe=>[.5,.75,1,1.25,1.5].map(portion=>{
  const nutrients=recipeNutrients(recipe,portion),prep=recipePreparation(recipe), names=recipe.ingredients.map(i=>i.name.toLowerCase()).join(" ");
  const pantryMatches=pantry.filter(p=>names.includes(p));
  const biology=explainRecipeBiology(recipe.foodIngredients.map(i=>i.foodId),report,preferences,registry), biologyReasons=biology.reasons;
  const targetRanges:Record<string,TargetRange>={calories:{target:request.targets.calories},protein_g:{min:request.targets.protein},fiber_g:{min:request.targets.fiber,max:request.targets.fiberMaximum},sodium_mg:{max:request.targets.sodium},fat_saturated_g:{max:request.targets.saturatedFat},...request.nutrientTargets};
  const appKey=(key:string)=>({protein:"protein_g",fiber:"fiber_g",sodium:"sodium_mg",carbs:"carbohydrates_total_g",fat:"fat_total_g"}[key]||key);
  const contributions=explainNutrientContribution(nutrients,targetRanges,Object.fromEntries(Object.entries(n).map(([key,value])=>[appKey(key),value])),Object.fromEntries(Object.entries(summary.coverage).map(([key,value])=>[appKey(key),value])));
  const limitChecks=Object.entries(limits).map(([key,max])=>{
   const priorKey=mapping[key]||key, prior=n[priorKey], amount=nutrients[key];
   const knownPrior=typeof prior==="number"&&Number.isFinite(prior);
   const complete=knownPrior&&summary.coverage[priorKey]?.partial===false;
   const exceeded=typeof amount==="number"&&amount+(knownPrior?prior:0)>max+1e-6;
   return {key,maximum:max,basis:key==="calories"&&request.nutrientTargets.calories?.max==null?"planning energy allowance":"selected maximum",status:amount===null||amount===undefined?"unverified":exceeded?"exceeded":complete?"within-known-intake":"unverified"};
  });
  const violations=limitChecks.some(c=>c.status==="exceeded")||Object.keys(limits).some(key=>nutrients[key]===null||nutrients[key]===undefined);
  const energyGap=Math.max(0,request.targets.calories-(n.calories??0)), proteinGap=Math.max(0,request.targets.protein-(n.protein??0));
  const score=Math.min(.1,tasteMatches(recipe.ingredients,preferences.softDislikes).length*.02)-Math.min(.15,biologyReasons.length*.04)+Math.abs((nutrients.calories??0)-Math.min(energyGap,700))/700 + Math.max(0,Math.min(proteinGap,35)-(nutrients.protein_g??0))/35-pantryMatches.length*.12-(practical.budget==="economical"&&/oat|rice|lentil|bean|egg/.test(names)?.08:0);
  const rawNeedsHeat=/chicken|salmon|egg|barley|rice|potato|lentil/.test(names);
  return {recipe,portion,nutrients,prep,pantryMatches,biologyReasons,biologyVersion:biology.version,biologyAvailable:biology.available,biologyNote:biology.note,limitChecks,relationshipIds:biology.relationshipIds,contributions,sourceLinks:biology.sources,score,valid:!violations&&prep.minutes<=practical.minutes&&(hasHeat||!rawNeedsHeat)};
 })).filter(c=>c.valid).sort((a,b)=>a.score-b.score||tasteMatches(a.recipe.ingredients,preferences.softDislikes).length-tasteMatches(b.recipe.ingredients,preferences.softDislikes).length||a.recipe.id.localeCompare(b.recipe.id));
 const used=new Set<string>(), choices=[];
 const composition=(c:typeof candidates[number])=>c.recipe.ingredients.map(i=>i.name.toLowerCase()).sort().join("|");
 for(const kind of ["pantry","recipe","convenient"] as const){
  const eligible=candidates.filter(c=>!used.has(composition(c)));
  const pick=(kind==="pantry"?[...eligible].sort((a,b)=>b.pantryMatches.length-a.pantryMatches.length||a.score-b.score):kind==="convenient"?[...eligible].sort((a,b)=>a.prep.minutes-b.prep.minutes||a.score-b.score):eligible)[0];
  if(!pick)continue; used.add(composition(pick));
  const fits=goalMealFit([...report.context.goals,...preferences.goals],pick.recipe.ingredients.map(i=>i.name).join(" "));
  choices.push({...pick,kind,title:kind==="pantry"?(pick.prep.minutes<=20?"Quick at home":"Make at home"):kind==="recipe"?"Cook a complete meal":"Purchase & assemble option",reasons:[...pick.biologyReasons,...intoleranceWarnings(pick.recipe.ingredients,report.context.intolerances),...(pick.pantryMatches.length?[`Uses pantry items you listed: ${pick.pantryMatches.join(", ")}.`]:[]),...fits.map(f=>f.reason),pick.limitChecks.some(c=>c.status==="unverified")?"Known amounts do not show an exceeded planning constraint, but some logged nutrients are missing. Daily limit compliance is unverified. Choose one option; these alternatives are not added together.":"Portion checked against selected daily limits and the planning energy allowance using complete logged nutrient values. Choose one option; these alternatives are not added together."],shopping:pick.prep.shopping.map(i=>({...i,grams:Math.round(i.grams*pick.portion*practical.household)})),confidence:summary.isPartial?"Provisional — logged nutrition is incomplete":"Generic composition estimates; review products and portions"});
 }
 return {choices,biologyAvailable:!!registry,note:(!registry?"Reviewed biological explanations are temporarily unavailable; choices use nutrient composition and practical preferences only. ":"")+"Suggestions are alternatives for your next meal, not a full-day guarantee. Pantry availability and affordability are preference-based heuristics, not live inventory or prices. Purchase options use generic food estimates; confirm packaged or restaurant nutrition before logging."};
}
export function weeklyReview(records:ExperienceRecord[], mode:"everyday"|"athlete", endDate:string) {
 const end=Date.parse(endDate)+86400000, start=end-7*86400000, previous=start-7*86400000;
 const checks=records.filter(r=>r.kind==="checkin"&&r.payload.mode===mode&&Date.parse(r.payload.date)<end);
 const period=(low:number,high:number)=>checks.filter(r=>r.kind==="checkin"&&Date.parse(r.payload.date)>=low&&Date.parse(r.payload.date)<high);
 const current=period(start,end), prior=period(previous,start);
 const mean=(arr:typeof checks,k:"energy"|"hunger"|"digestion"|"sleepHours")=>arr.length?Math.round(arr.reduce((a,r)=>a+(r.kind==="checkin"?r.payload[k]:0),0)/arr.length*10)/10:null;
 const metrics=(["energy","hunger","digestion","sleepHours"] as const).map(k=>({key:k,current:mean(current,k),previous:mean(prior,k)}));
 let next="Choose one practical focus for the next week, such as keeping a regular meal routine. Record how consistently you tried it.";
 if(current.some(r=>r.kind==="checkin"&&r.payload.professionalReview))next="You requested professional review. Export this review for your dietitian or clinician before making further changes.";
 else if(mode==="athlete"&&current.filter(r=>r.kind==="checkin"&&r.payload.energy<=3).length>=2)next="Repeated low energy deserves a fueling and recovery review with your sports dietitian or clinician. Do not respond by restricting intake further.";
 else if(current.filter(r=>r.kind==="checkin"&&r.payload.digestion<=3).length>=2)next="Review meal timing and portions against your symptom notes. Change one thing at a time; persistent or concerning symptoms need professional assessment.";
 return {mode,from:new Date(start).toISOString().slice(0,10),to:endDate,entries:current.length,metrics,next,experiments:records.filter(r=>r.kind==="experiment"&&r.payload.mode===mode),note:"Self-reported patterns are observations, not proof that a food caused a change. Missing check-ins are not zeros; tracking cannot replace clinical assessment."};
}
