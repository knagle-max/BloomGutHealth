import{z}from'zod';
import type{PrecisionReport}from'./precision-nutrition';
import{tasteMatches}from'./food-preference-policy';
import{snapshotFoods}from'./food-snapshot';
import type{ReportFoodRecommendation}from'./structured-report';
export const MICROBIOME_FOOD_INFLUENCE_VERSION='microbiome-food-influence-v1';
export type MicrobiomeFoodControl={enabled:boolean;reportId:string|null;reportRevision:string|null;ignoredFoodIds:string[]};
export type MicrobiomeFoodSource={id:string;revision:string;provider:string;date:string|null;foods:ReportFoodRecommendation[]};
const exact=(value:string)=>value.trim().replace(/\s+/g,' ').toLocaleLowerCase('en-US');
/** Same existing prepared-food catalogue identity, with no stem, alias or category expansion. */
export function exactReportFoodId(name:string):string|null{
 const matches=snapshotFoods.filter(food=>exact(food.name)===exact(name)||exact(food.description)===exact(name));
 return matches.length===1?matches[0].id:null;
}
// Curated recipe uses this explicitly cooked grain label; no source-name alias expansion.
const recipeIdentity:Record<string,string>={'cooked brown rice':'rice','cooked quinoa':'quinoa'};
function exactRecipeFoodId(name:string){return exactReportFoodId(name)||recipeIdentity[exact(name)]||null;}
const category=(value:string|null)=>({superfood:1,superfoods:1,enjoy:1,minimize:-1,avoid:-1}as Record<string,number>)[exact(value||'')]??null;
export type ReportFoodMatch={foodId:string;name:string;category:string;page:number|null;direction:number};
export type MicrobiomeFoodTrace={version:typeof MICROBIOME_FOOD_INFLUENCE_VERSION;reportId:string;reportRevision:string;provider:string;date:string|null;matches:ReportFoodMatch[];contributed:boolean;baselinePosition:number;position:number};
/** Unknown, conflicting or ignored identities contribute zero. Counts remain source counts. */
export function resolveMicrobiomeFoodMatches(source:MicrobiomeFoodSource,ignored:readonly string[]=[]){
 const grouped=new Map<string,ReportFoodRecommendation[]>();
 for(const row of source.foods){const id=exactReportFoodId(row.name);if(id&&!ignored.includes(id))grouped.set(id,[...(grouped.get(id)||[]),row]);}
 const matches=new Map<string,ReportFoodMatch>();
 for(const[id,rows]of Array.from(grouped)){const categories=new Set(rows.map(row=>exact(row.reportedCategory||'')));const direction=category(rows[0].reportedCategory);if(categories.size!==1||direction===null)continue;matches.set(id,{foodId:id,name:rows[0].name,category:rows[0].reportedCategory!,page:rows[0].sourcePage,direction});}
 return matches;
}
/** Optional ordering within an existing caller-defined primary-priority tier only.
 * Caller first applies allergies/exclusions and independent nutrition/evidence constraints.
 * Comparison against the unchanged baseline proves each marker's causal rank contribution. */
export function applyMicrobiomeFoodInfluence<T extends{id:string;ingredients:readonly{name:string}[]}>(baseline:readonly T[],control:MicrobiomeFoodControl|undefined,source:MicrobiomeFoodSource|null,primaryTier:(row:T)=>string):Array<T&{microbiomeFood?:MicrobiomeFoodTrace}>{
 if(!control?.enabled||!source||control.reportId!==source.id||control.reportRevision!==source.revision)return[...baseline];
 const matches=resolveMicrobiomeFoodMatches(source,control.ignoredFoodIds);
 const scored=baseline.map((row,index)=>{const relevant=Array.from(new Set(row.ingredients.map(ingredient=>exactRecipeFoodId(ingredient.name)).filter((id):id is string=>!!id))).flatMap(id=>matches.has(id)?[matches.get(id)!]:[]);return{row,index,relevant,score:Math.sign(relevant.reduce((sum,match)=>sum+match.direction,0))};});
 // Never leapfrog a different primary priority, even if an equal tier recurs later.
 const ordered:typeof scored=[];for(let start=0;start<scored.length;){let end=start+1;while(end<scored.length&&primaryTier(scored[end].row)===primaryTier(scored[start].row))end++;ordered.push(...scored.slice(start,end).sort((a,b)=>b.score-a.score||a.index-b.index));start=end;}
 return ordered.map((item,index)=>item.relevant.length?{...item.row,microbiomeFood:{version:MICROBIOME_FOOD_INFLUENCE_VERSION,reportId:source.id,reportRevision:source.revision,provider:source.provider,date:source.date,matches:item.relevant,contributed:index!==item.index&&item.score!==0,baselinePosition:item.index,position:index}}:item.row);
}

/** Display-only ordering. Do not feed provider opinions into reportFor/AI/planning context. */
export function reportFoodDisplay<T extends PrecisionReport>(report:T,control:MicrobiomeFoodControl|undefined,source:MicrobiomeFoodSource|null,softDislikes:readonly string[]=[]){
 const recommendations=applyMicrobiomeFoodInfluence(report.recommendations,control,source,recipe=>JSON.stringify([recipe.priority,tasteMatches(recipe.ingredients,softDislikes).length]));
 // These existing broad food labels have no preparation assertion. Exact resolver
 // abstention is intentional; do not substitute a cooked identity from an ID.
 const foods=applyMicrobiomeFoodInfluence(report.foods.map(food=>({id:food.id,ingredients:[{name:food.name}],food})),control,source,row=>String(row.food.priority)).map(row=>({...row.food,...(row.microbiomeFood?{microbiomeFood:row.microbiomeFood}:{})}));
 return{...report,recommendations,foods};
}

export type MicrobiomeFoodPlanning={control:MicrobiomeFoodControl;source:MicrobiomeFoodSource|null;revision:string};

export const microbiomeFoodPlanningGuardSchema=z.object({settingRevision:z.string().regex(/^[a-f0-9]{64}$/),reportId:z.string().min(1).max(200).nullable(),reportRevision:z.string().regex(/^[a-f0-9]{64}$/).nullable()}).strict();
export function microbiomeFoodPlanningGuard(influence:MicrobiomeFoodPlanning){return{settingRevision:influence.revision,reportId:influence.control.enabled?influence.source?.id||null:null,reportRevision:influence.control.enabled?influence.source?.revision||null:null};}
