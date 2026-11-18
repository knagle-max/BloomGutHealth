import {productResponseSchema} from './products';
import {nutrientDefinitionDetails} from './nutrient-definitions';
import {z} from 'zod';
import {labelPortionSchema,scaleLabelAmount} from './label-portion';
import type {RecordedFoodRecord} from './nutrient-observations';
/** Read the immutable label already attached to the meal. This never resolves a
 * current product, scales portions, adds totals or asserts a chemical equivalent. */
export function readLabelNutrientSources(input:unknown){
 const definitions=nutrientDefinitionDetails();
 if(input===undefined)return {status:'not-captured' as const,sources:[],missing:0,unsupported:0};
 if(!Array.isArray(input))return {status:'unsupported' as const,sources:[],missing:0,unsupported:1};
 let missing=0,unsupported=0;
 const sources=input.flatMap((detail,index)=>{
  if(!detail||typeof detail!=='object'){unsupported++;return[];}
  if(!('labelSnapshot'in detail)||detail.labelSnapshot===undefined){missing++;return[];}
  const parsed=productResponseSchema.safeParse(detail.labelSnapshot);if(!parsed.success){unsupported++;return[];}
  const snapshot=parsed.data;
  return [{index,id:snapshot.id,provider:snapshot.source,name:snapshot.name,brand:snapshot.brand,servingDescription:snapshot.servingDescription||null,servingGrams:snapshot.servingGrams,retrievedAt:z.iso.datetime({offset:true}).safeParse(snapshot.retrievedAt).success?snapshot.retrievedAt:null,url:snapshot.url,
   fields:definitions.map(def=>({key:def.key,name:def.key==='vitamin_a_ug'?'Vitamin A (basis unconfirmed)':def.key==='folate_ug'?'Folate (basis unconfirmed)':def.name,unit:def.amountUnit,amount:snapshot.perServing[def.key]??null,sourceReportsZero:snapshot.perServing[def.key]===undefined?null:snapshot.perServing[def.key]===0})),
   unmappedFields:Object.entries(snapshot.perServing).filter(([key])=>!definitions.some(def=>def.key===key)).map(([key,amount])=>({key,amount,unit:null})),
   otherIngredients:snapshot.otherNutrients??[],
  }];
 });
 return {status:sources.length?(missing||unsupported?'partial' as const:'available' as const):unsupported?'unsupported' as const:'not-captured' as const,sources,missing,unsupported};
}

/** Read-only contribution from a saved owned event and its captured source.
 * Does not confirm that a supplement was taken, sum foods, or assign a form. */
export function recordedLabelContributions(input:unknown,meal:RecordedFoodRecord,accountScope:string|undefined){
 if(!accountScope||meal.userId!==accountScope||!meal.id)return{status:'scope-unavailable' as const,sources:[]};
 const view=readLabelNutrientSources(input);
 const rawTime=meal.loggedAt,time=rawTime instanceof Date?rawTime:typeof rawTime==='string'&&z.iso.datetime({offset:true}).safeParse(rawTime).success?new Date(rawTime):null;
 const occurredAt=time&&Number.isFinite(+time)?time.toISOString():null;
 return {status:view.status,sources:view.sources.map(source=>{
  const detail=Array.isArray(input)?input[source.index]:undefined;
  const portion=labelPortionSchema.safeParse(detail?.labelPortion);
  // A mismatched detail identity is not proof for the frozen source label.
  const identityMatches=detail?.source===source.provider&&detail?.name===source.name;
  const servings=portion.success&&identityMatches?portion.data.servings:null;
  return {sourceIndex:source.index,mealId:meal.id,occurredAt,dateBasis:occurredAt?'meal-record-time' as const:'not-recorded' as const,
   servings,portionStatus:servings===null?'not-confirmed' as const:'captured' as const,
   fields:source.fields.map(field=>({...field,nativeAmountPerServing:field.amount,
    amount:servings===null?null:scaleLabelAmount(field.amount,servings),
    chemicalForm:null,activityUnit:null,adequacyAssessment:false as const,
    valueKind:'recorded_source_contribution' as const})),
  };
 })};
}
