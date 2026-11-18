export {vitaminB6ReferenceContext} from './supplement-reference-context';
import {z} from 'zod';
import data from './data/canadian-dietary-reference-subset.json';
export const dietaryReferenceLifeStageSchema=z.enum(['nonpregnant-nonlactating-adult','pregnancy-adult','lactation-adult']);
export type DietaryReferenceLifeStage=z.infer<typeof dietaryReferenceLifeStageSchema>;
export const dietaryReferenceLifeStages=[{key:'nonpregnant-nonlactating-adult',name:'Not pregnant or lactating'},{key:'pregnancy-adult',name:'Pregnancy'},{key:'lactation-adult',name:'Lactation'}] as const;
export const dietaryReferenceRowSchema=z.object({
 id:z.string().min(1),nutrientKey:z.enum(['vitamin_c_mg','magnesium_mg','calcium_mg','potassium_mg','vitamin_d_ug','vitamin_a_ug','folate_ug','vitamin_e_mg','iron_mg','vitamin_b12_ug','vitamin_k_ug','sodium_mg','zinc_mg']),
 sexReferenceCategory:z.enum(['M','F','all']),ageMinYears:z.number().int().min(19),ageMaxYears:z.number().int().min(19).nullable(),
 kind:z.enum(['EAR','RDA','AI','UL','CDRR']),amount:z.number().finite().positive(),unit:z.enum(['mg/day','µg/day','µg RAE/day','µg DFE/day','µg folic acid/day']),
 lifeStage:dietaryReferenceLifeStageSchema,referencePeriod:z.literal('usual-daily-intake'),
 dietaryPatternBasis:z.literal('source-mixed-diet').optional(),
 menstrualBasis:z.enum(['source-assumed-menstruating','source-assumed-postmenopausal']).optional(),
 sourceId:z.enum(['hc-vitamins','hc-elements']),intakeScope:z.enum(['total-intake','pharmacological-only','preformed-vitamin-a-only','synthetic-folic-acid-only','synthetic-vitamin-e-only']),smokingApplicability:z.enum(['non-smoker','not-specific']),
}).strict().superRefine((row,ctx)=>{
 if(row.lifeStage!=='nonpregnant-nonlactating-adult'&&(row.sexReferenceCategory!=='all'||row.ageMinYears>50||row.ageMaxYears===null||row.ageMaxYears>50))ctx.addIssue({code:'custom',message:'Keep published adult pregnancy/lactation categories within19–50; no extrapolation or added sex restriction'});
 const dietSpecificRequirement=(row.nutrientKey==='iron_mg'||row.nutrientKey==='zinc_mg')&&(row.kind==='EAR'||row.kind==='RDA');
 if(dietSpecificRequirement?row.dietaryPatternBasis!=='source-mixed-diet':row.dietaryPatternBasis!==undefined)ctx.addIssue({code:'custom',message:'Retain iron/zinc source dietary assumptions without personal bioavailability adjustments'});
 if(row.nutrientKey==='sodium_mg'&&row.kind!=='AI'&&row.kind!=='CDRR')ctx.addIssue({code:'custom',message:'Keep source sodium AI/CDRR separate from an unestablished UL'});
 if(row.nutrientKey==='vitamin_k_ug'&&row.kind!=='AI')ctx.addIssue({code:'custom',message:'Keep source vitamin K AI without an invented upper limit'});
 const ironFemaleRequirement=row.lifeStage==='nonpregnant-nonlactating-adult'&&row.nutrientKey==='iron_mg'&&row.sexReferenceCategory==='F'&&(row.kind==='EAR'||row.kind==='RDA');
 if(ironFemaleRequirement?row.menstrualBasis!==(row.ageMinYears===19&&row.ageMaxYears===50?'source-assumed-menstruating':row.ageMinYears===51&&row.ageMaxYears===null?'source-assumed-postmenopausal':null):row.menstrualBasis!==undefined)ctx.addIssue({code:'custom',message:'Keep source iron menstrual assumptions explicit and separate from individual status'});
 if(row.nutrientKey==='vitamin_b12_ug'&&row.kind!=='EAR'&&row.kind!=='RDA')ctx.addIssue({code:'custom',message:'Retain established adult B12 requirements; no invented upper limit'});
 if(row.nutrientKey==='potassium_mg'&&row.kind!=='AI')ctx.addIssue({code:'custom',message:'The source establishes potassium AI, not EAR/RDA/UL/CDRR'});
 if((row.nutrientKey==='vitamin_a_ug'&&row.kind==='UL')!==(row.intakeScope==='preformed-vitamin-a-only'))ctx.addIssue({code:'custom',message:'Vitamin A UL applies only to preformed vitamin A'});
 for(const[key,scope]of [['folate_ug','synthetic-folic-acid-only'],['vitamin_e_mg','synthetic-vitamin-e-only']]as const)if((row.nutrientKey===key&&row.kind==='UL')!==(row.intakeScope===scope))ctx.addIssue({code:'custom',message:'Keep synthetic folic acid and vitamin E upper limits separate from natural food forms'});
 if(row.unit!==((row.nutrientKey==='vitamin_d_ug'||row.nutrientKey==='vitamin_b12_ug'||row.nutrientKey==='vitamin_k_ug')?'µg/day':row.nutrientKey==='vitamin_a_ug'?'µg RAE/day':row.nutrientKey==='folate_ug'?(row.kind==='UL'?'µg folic acid/day':'µg DFE/day'):'mg/day'))ctx.addIssue({code:'custom',message:'Keep the source nutrient unit; no milligram/microgram or IU substitution'});
 if(row.ageMaxYears!==null&&row.ageMaxYears<row.ageMinYears)ctx.addIssue({code:'custom',message:'Retain the published ordered age category'});
 if((row.nutrientKey==='magnesium_mg'&&row.kind==='UL')!==(row.intakeScope==='pharmacological-only'))ctx.addIssue({code:'custom',message:'Magnesium UL excludes food and water; other references keep total-intake scope'});
 if(row.nutrientKey==='vitamin_c_mg'&&row.kind!=='UL'&&row.smokingApplicability!=='non-smoker')ctx.addIssue({code:'custom',message:'Keep the source nonsmoking requirement basis; no smoking adjustment is inferred'});
 if(row.sourceId!==(['vitamin_c_mg','vitamin_d_ug','vitamin_a_ug','folate_ug','vitamin_e_mg','vitamin_b12_ug','vitamin_k_ug'].includes(row.nutrientKey)?'hc-vitamins':'hc-elements'))ctx.addIssue({code:'custom',message:'Keep each nutrient with its actual source'});
});
const rows=Object.freeze(data.rows.map(row=>Object.freeze({...dietaryReferenceRowSchema.parse(row),referenceVersion:data.version})));
if(new Set(rows.map(row=>row.id)).size!==rows.length)throw Error('Keep each published dietary reference identity unique');
export type DietaryReferenceRow=z.infer<typeof dietaryReferenceRowSchema>;
export const dietaryReferenceSubset=Object.freeze({...data,rows,sources:Object.freeze(data.sources.map(source=>Object.freeze({...source})))});
/** Source facts only. Never joins a single meal/day to an adequacy probability,
 * changes a saved target, interprets a lab result or manufactures a missing DRI. */
export function dietaryReferencesFor(nutrientKey:string,lifeStage:DietaryReferenceLifeStage='nonpregnant-nonlactating-adult'){return dietaryReferenceSubset.rows.filter(row=>row.nutrientKey===nutrientKey&&row.lifeStage===lifeStage);}
export const dietaryReferenceKinds={EAR:'Estimated average requirement',RDA:'Recommended dietary allowance',AI:'Adequate intake',UL:'Tolerable upper intake level',CDRR:'Chronic disease risk reduction intake'} as const;

export const dietaryReferenceNutrients=Object.freeze([{key:'vitamin_c_mg',name:'Vitamin C'},{key:'magnesium_mg',name:'Magnesium'},{key:'calcium_mg',name:'Calcium'},{key:'potassium_mg',name:'Potassium'},{key:'vitamin_d_ug',name:'Vitamin D'},{key:'vitamin_a_ug',name:'Vitamin A'},{key:'folate_ug',name:'Folate'},{key:'vitamin_e_mg',name:'Vitamin E'},{key:'iron_mg',name:'Iron'},{key:'vitamin_b12_ug',name:'Vitamin B12'},{key:'vitamin_k_ug',name:'Vitamin K'},{key:'sodium_mg',name:'Sodium'},{key:'zinc_mg',name:'Zinc'}]);
