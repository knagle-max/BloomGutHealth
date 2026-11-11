import {z} from "zod";
import {scaleDatabaseNutrients,type MealIntelligence} from "./meal-intelligence";
import {nutrientDefinitionDetails,NUTRIENT_DEFINITION_VERSION} from "./nutrient-definitions";
import {readNutrientSourceSnapshots} from "./nutrient-source-snapshot";
const recordedTimestamp=z.iso.datetime({offset:true});
export interface RecordedFoodRecord {id:string;userId:string;loggedAt?:Date|string|null;}
export interface NutrientObservation {
 valueKind:"recorded_source_contribution";mealId:string;sourceIndex:number;
 occurredAt:string|null;dateBasis:"meal-record-time"|"not-recorded";
 nutrientKey:string;amount:number|null;unit:string;
 nativeAmountPer100g:number|null;nativeUnit:string;sourceReportsZero:boolean|null;
 chemicalForm:string|null;activityUnit:string|null;
 state:"known"|"verified_zero"|"unknown"|"conflicting"|"estimated";
 source:{id:string;version:string;definitionVersion:string;url:string};
 adequacyAssessment:false;
}
/** Projection of an already saved owned food event. Reuse the existing nutrient
 * calculation on frozen source inputs; no new store, summed intake or targets.
 * The UI owner check is not a replacement for server record authorization. */
export function recordedNutrientObservations(analysis:MealIntelligence,meal:RecordedFoodRecord,accountScope:string|undefined){
 if(!accountScope||meal.userId!==accountScope||!meal.id)return{status:"scope-unavailable" as const,observations:[] as NutrientObservation[]};
 const captured=readNutrientSourceSnapshots(analysis.nutrientSourceSnapshots);
 if(captured.status!=="available")return{status:captured.status,observations:[] as NutrientObservation[]};
 const rawTime=meal.loggedAt,time=rawTime instanceof Date?rawTime:typeof rawTime==="string"&&recordedTimestamp.safeParse(rawTime).success?new Date(rawTime):null;
 const occurredAt=time&&Number.isFinite(+time)?time.toISOString():null;
 const definitions=nutrientDefinitionDetails(),observations:NutrientObservation[]=[];
 captured.snapshots.forEach((snapshot,sourceIndex)=>{
  const supported=snapshot.definitionVersion===NUTRIENT_DEFINITION_VERSION;
  const fields=snapshot.values.flatMap(value=>{const def=definitions.find(d=>d.key===value.key);return supported&&def&&value.unit===def.amountUnit&&value.sourceValuePer100g!==null?[{nutrient:{id:def.sourceMappings.usda},amount:value.sourceValuePer100g}]:[];});
  const contributions=scaleDatabaseNutrients([{grams:snapshot.reviewedGrams,foodNutrients:fields}],1,false);
  for(const value of snapshot.values){
   const definition=definitions.find(d=>d.key===value.key),conflicting=!!definition&&value.unit!==definition.amountUnit;
   const amount=supported&&!conflicting&&definition?contributions.find(n=>n.key===value.key)?.amount??null:null;
   observations.push({valueKind:"recorded_source_contribution",mealId:meal.id,sourceIndex,occurredAt,dateBasis:occurredAt?"meal-record-time":"not-recorded",nutrientKey:value.key,amount,unit:value.unit,nativeAmountPer100g:value.sourceValuePer100g,nativeUnit:value.unit,sourceReportsZero:value.sourceReportsZero,chemicalForm:value.chemicalForm,activityUnit:value.activityUnit,state:conflicting?"conflicting":amount===null?"unknown":"estimated",source:{id:snapshot.sourceId,version:snapshot.sourceVersion,definitionVersion:snapshot.definitionVersion,url:snapshot.sourceUrl},adequacyAssessment:false});
  }
 });
 return{status:"available" as const,observations};
}
