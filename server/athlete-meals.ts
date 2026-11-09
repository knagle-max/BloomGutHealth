import { explainNutrientContribution } from "../shared/food-intelligence";
import { eligiblePlanningRecipes, recipeNutrients } from "../shared/weekly-planner";
import { recipePreparation } from "../shared/recipe-preparation";
import type { DietaryPreferences } from "../shared/meal-intelligence";
import type { PrecisionReport } from "../shared/precision-nutrition";
import type { buildAthleteDay } from "../shared/athlete";
export function athleteMealChoices(day:ReturnType<typeof buildAthleteDay>,preferences:DietaryPreferences,report:PrecisionReport){
 const menu=eligiblePlanningRecipes(preferences,report.context.allergies,[]);
 if(day.blocked||menu.unknownAllergies.length)return {choices:[],note:"Review athlete health context and recognized allergies before calculating meal options."};
 const proteinGap=day.remaining.proteinG??day.targets.proteinG??30,carbGap=day.remaining.carbohydratesG?.[0]??day.targets.carbohydratesG?.[0]??60;
 const candidates=menu.recipes.filter(r=>r.mealType!=="breakfast").flatMap(recipe=>[.75,1,1.5,2].map(portion=>{
  const nutrients=recipeNutrients(recipe,portion),prep=recipePreparation(recipe);
  const withinEnergy=day.targets.energyKcal===null||(day.consumed.calories??0)+(nutrients.calories??0)<=day.targets.energyKcal*1.1;
  const score=Math.abs((nutrients.protein_g??0)-Math.min(proteinGap,40))/40+Math.abs((nutrients.carbohydrates_total_g??0)-Math.min(carbGap,100))/100;
  const contributions=explainNutrientContribution(nutrients,{protein_g:{target:day.targets.proteinG},carbohydrates_total_g:{min:day.targets.carbohydratesG?.[0]},calories:{target:day.targets.energyKcal}},{protein_g:day.consumed.protein,carbohydrates_total_g:day.consumed.carbs,calories:day.consumed.calories},{protein_g:day.coverage.protein,carbohydrates_total_g:day.coverage.carbs,calories:day.coverage.calories});
  return {recipe,portion,nutrients,prep,withinEnergy,score,contributions,confidence:day.partial?"Provisional — some logged nutrients are incomplete; remaining amounts and energy fit are unverified":"Generic composition estimates against reviewed athlete targets"};
 })).filter(c=>c.withinEnergy).sort((a,b)=>a.score-b.score||a.recipe.id.localeCompare(b.recipe.id));
 const seen=new Set<string>(),choices=[];
 for(const c of candidates){if(seen.has(c.recipe.id))continue;seen.add(c.recipe.id);choices.push(c);if(choices.length===3)break;}
 return {choices,note:"Alternatives for a training-day meal, ranked against remaining reviewed carbohydrate/protein targets and energy when set. The 110% energy screening allowance is a planning heuristic, not a clinical upper limit or an instruction to stop eating. Incomplete logs make the fit provisional. This is not a complete-day adequacy or performance guarantee. Check familiar portions, timing and gut tolerance; peri-exercise fiber needs differ from whole-day fiber goals."};
}
