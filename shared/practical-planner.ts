import { precisionSources } from "./precision-nutrition";
import { eligiblePlanningRecipes, recipeNutrients, type WeeklyRequest } from "./weekly-planner";
import type { DietaryPreferences } from "./meal-intelligence";
import type { PrecisionReport } from "./precision-nutrition";
import type { z } from "zod";
import { practicalPreferencesSchema, type ExperienceRecord } from "./experience";
import { mealNutritionSummary } from "./nutrition-summary";
import { recipePreparation } from "./recipe-preparation";
import { goalMealFit } from "./goal-guidance";
export function practicalChoices(meals:any[], preferences:DietaryPreferences, report:PrecisionReport, request:WeeklyRequest, practical:z.infer<typeof practicalPreferencesSchema>, blocked=false, slot="dinner") {
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
  const biologyReasons:string[]=[],sourceIds:string[]=[];
  const highMetabolic=report.labs.filter(l=>!l.stale && /above/i.test(l.flag) && ["ldl","apob","hba1c","glucose","triglycerides"].includes(l.marker));
  if(highMetabolic.length&&/oat|barley|lentil|chickpea|walnut|broccoli/.test(names)){biologyReasons.push("Includes whole grains, legumes, vegetables or nuts that fit a cardiometabolic dietary pattern in the context of your recent lab results. Individual response is not predicted.");sourceIds.push("heart-guidance");}
  if(report.labs.some(l=>!l.stale&&l.marker==="folate"&&/below/i.test(l.flag))&&/lentil|chickpea|broccoli/.test(names)){biologyReasons.push("Contains folate-contributing foods. A low folate result also needs cause and B12 review; this meal is not a deficiency treatment.");sourceIds.push("mthfr-guidance");}
  if(report.genetics.findings.some(f=>f.rsid==="rs1801133"&&f.genotype&&["reported raw call","self-reported call"].includes(f.status))&&/lentil|chickpea|broccoli/.test(names)){biologyReasons.push("A reviewed MTHFR result provides secondary folate-pathway context, not evidence of a deficiency or a required supplement.");sourceIds.push("mthfr-guidance");}

  const violations=Object.entries(limits).some(([key,max])=>nutrients[key]===null||(nutrients[key]??0)+(n[mapping[key]||key]??0)>max+1e-6);
  const energyGap=Math.max(0,request.targets.calories-(n.calories??0)), proteinGap=Math.max(0,request.targets.protein-(n.protein??0));
  const score=-Math.min(.15,biologyReasons.length*.04)+Math.abs((nutrients.calories??0)-Math.min(energyGap,700))/700 + Math.max(0,Math.min(proteinGap,35)-(nutrients.protein_g??0))/35-pantryMatches.length*.12-(practical.budget==="economical"&&/oat|rice|lentil|bean|egg/.test(names)?.08:0);
  const rawNeedsHeat=/chicken|salmon|egg|barley|rice|potato|lentil/.test(names);
  return {recipe,portion,nutrients,prep,pantryMatches,biologyReasons,sourceLinks:precisionSources.filter(s=>sourceIds.includes(s.id)).map(s=>({title:s.title,url:s.url})),score,valid:!violations&&prep.minutes<=practical.minutes&&(hasHeat||!rawNeedsHeat)};
 })).filter(c=>c.valid).sort((a,b)=>a.score-b.score||a.recipe.id.localeCompare(b.recipe.id));
 const used=new Set<string>(), choices=[];
 const composition=(c:typeof candidates[number])=>c.recipe.ingredients.map(i=>i.name.toLowerCase()).sort().join("|");
 for(const kind of ["pantry","recipe","convenient"] as const){
  const eligible=candidates.filter(c=>!used.has(composition(c)));
  const pick=(kind==="pantry"?[...eligible].sort((a,b)=>b.pantryMatches.length-a.pantryMatches.length||a.score-b.score):kind==="convenient"?[...eligible].sort((a,b)=>a.prep.minutes-b.prep.minutes||a.score-b.score):eligible)[0];
  if(!pick)continue; used.add(composition(pick));
  const fits=goalMealFit([...report.context.goals,...preferences.goals],pick.recipe.ingredients.map(i=>i.name).join(" "));
  choices.push({...pick,kind,title:kind==="pantry"?(pick.prep.minutes<=20?"Quick at home":"Make at home"):kind==="recipe"?"Cook a complete meal":"Purchase & assemble option",reasons:[...pick.biologyReasons,...(pick.pantryMatches.length?[`Uses pantry items you listed: ${pick.pantryMatches.join(", ")}.`]:[]),...fits.map(f=>f.reason),"Portion checked against known remaining daily limits. Choose one option; these alternatives are not added together."],shopping:pick.prep.shopping.map(i=>({...i,grams:Math.round(i.grams*pick.portion*practical.household)})),confidence:summary.isPartial?"Provisional — logged nutrition is incomplete":"Generic composition estimates; review products and portions"});
 }
 return {choices,note:"Suggestions are alternatives for your next meal, not a full-day guarantee. Pantry availability and affordability are preference-based heuristics, not live inventory or prices. Purchase options use generic food estimates; confirm packaged or restaurant nutrition before logging."};
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
