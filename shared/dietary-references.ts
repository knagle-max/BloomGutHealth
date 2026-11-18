export {vitaminB6ReferenceContext} from './supplement-reference-context';
import {z} from 'zod';
import data from './data/canadian-dietary-reference-subset.json';
export const dietaryReferenceRowSchema=z.object({
 id:z.string().min(1),nutrientKey:z.enum(['vitamin_c_mg','magnesium_mg','calcium_mg','potassium_mg','vitamin_d_ug','vitamin_a_ug']),
 sexReferenceCategory:z.enum(['M','F','all']),ageMinYears:z.number().int().min(19),ageMaxYears:z.number().int().min(19).nullable(),
 kind:z.enum(['EAR','RDA','AI','UL','CDRR']),amount:z.number().finite().positive(),unit:z.enum(['mg/day','µg/day','µg RAE/day']),
 lifeStage:z.literal('nonpregnant-nonlactating-adult'),referencePeriod:z.literal('usual-daily-intake'),
 sourceId:z.enum(['hc-vitamins','hc-elements']),intakeScope:z.enum(['total-intake','pharmacological-only','preformed-vitamin-a-only']),smokingApplicability:z.enum(['non-smoker','not-specific']),
}).strict().superRefine((row,ctx)=>{
 if(row.nutrientKey==='potassium_mg'&&row.kind!=='AI')ctx.addIssue({code:'custom',message:'The source establishes potassium AI, not EAR/RDA/UL/CDRR'});
 if((row.nutrientKey==='vitamin_a_ug'&&row.kind==='UL')!==(row.intakeScope==='preformed-vitamin-a-only'))ctx.addIssue({code:'custom',message:'Vitamin A UL applies only to preformed vitamin A'});
 if(row.unit!==(row.nutrientKey==='vitamin_d_ug'?'µg/day':row.nutrientKey==='vitamin_a_ug'?'µg RAE/day':'mg/day'))ctx.addIssue({code:'custom',message:'Keep the source nutrient unit; no milligram/microgram or IU substitution'});
 if(row.ageMaxYears!==null&&row.ageMaxYears<row.ageMinYears)ctx.addIssue({code:'custom',message:'Retain the published ordered age category'});
 if((row.nutrientKey==='magnesium_mg'&&row.kind==='UL')!==(row.intakeScope==='pharmacological-only'))ctx.addIssue({code:'custom',message:'Magnesium UL excludes food and water; other references keep total-intake scope'});
 if(row.nutrientKey==='vitamin_c_mg'&&row.kind!=='UL'&&row.smokingApplicability!=='non-smoker')ctx.addIssue({code:'custom',message:'Keep the source nonsmoking requirement basis; no smoking adjustment is inferred'});
 if(row.sourceId!==(['vitamin_c_mg','vitamin_d_ug','vitamin_a_ug'].includes(row.nutrientKey)?'hc-vitamins':'hc-elements'))ctx.addIssue({code:'custom',message:'Keep each nutrient with its actual source'});
});
const rows=Object.freeze(data.rows.map(row=>Object.freeze({...dietaryReferenceRowSchema.parse(row),referenceVersion:data.version})));
if(new Set(rows.map(row=>row.id)).size!==rows.length)throw Error('Keep each published dietary reference identity unique');
export type DietaryReferenceRow=z.infer<typeof dietaryReferenceRowSchema>;
export const dietaryReferenceSubset=Object.freeze({...data,rows,sources:Object.freeze(data.sources.map(source=>Object.freeze({...source})))});
/** Source facts only. Never joins a single meal/day to an adequacy probability,
 * changes a saved target, interprets a lab result or manufactures a missing DRI. */
export function dietaryReferencesFor(nutrientKey:string){return dietaryReferenceSubset.rows.filter(row=>row.nutrientKey===nutrientKey);}
export const dietaryReferenceKinds={EAR:'Estimated average requirement',RDA:'Recommended dietary allowance',AI:'Adequate intake',UL:'Tolerable upper intake level',CDRR:'Chronic disease risk reduction intake'} as const;

export const dietaryReferenceNutrients=Object.freeze([{key:'vitamin_c_mg',name:'Vitamin C'},{key:'magnesium_mg',name:'Magnesium'},{key:'calcium_mg',name:'Calcium'},{key:'potassium_mg',name:'Potassium'},{key:'vitamin_d_ug',name:'Vitamin D'},{key:'vitamin_a_ug',name:'Vitamin A'}]);
