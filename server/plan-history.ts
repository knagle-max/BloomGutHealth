const unsafeGeneticReason=(reason:unknown)=>typeof reason==='string'&&reason.startsWith('Folate-containing ingredients are relevant to recorded MTHFR context;');
/** Stored checks never authorize current use. Only the known legacy selection
 * output that actually used genotype reasons as a numeric bonus is withdrawn;
 * unrelated historical plans and original inputs remain intact. */
export function historicalPlanRecord<T extends {kind:string;payload:unknown}>(record:T) {
 const payload=record.payload;
 if(record.kind!=='plan'||!payload||typeof payload!=='object'||Array.isArray(payload)||(payload as {type?:unknown}).type!=='weekly-plan')return record;
 const plan=payload as Record<string,any>,days=Array.isArray(plan.days)?plan.days:[];
 const affected=days.some(day=>Array.isArray(day?.meals)&&day.meals.some((meal:any)=>Array.isArray(meal?.reasons)&&meal.reasons.some(unsafeGeneticReason)));
 if(affected){
  const limitation='Historical genotype-influenced meal selections are withheld. Original targets and recorded source context remain available. Rebuild using current inputs; genotype calls no longer rank meals or set portions.';
  return {...record,interpretationStatus:'historical_genotype_ranking_withheld' as const,currentUse:'rebuild_required' as const,limitation,
   payload:{...plan,status:'blocked',blocks:[limitation],checksPassed:false,days:[],shoppingList:[],recommendations:[],rankingNote:limitation,
    historicalOutput:{withheld:true,reason:'unsupported-genotype-ranking',recordedDays:days.length,recordedMeals:days.reduce((n:number,day:any)=>n+(Array.isArray(day?.meals)?day.meals.length:0),0)}}};
 }
 return {...record,interpretationStatus:'historical_plan_not_revalidated' as const,currentUse:'rebuild_required' as const,limitation:'Saved estimates and checks describe the recorded plan only. Rebuild against current health context, preferences and sources before using it as a current plan.'};
}
