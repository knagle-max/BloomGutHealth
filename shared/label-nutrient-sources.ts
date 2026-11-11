import {productResponseSchema} from './products';
import {nutrientDefinitionDetails} from './nutrient-definitions';
import {z} from 'zod';
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
