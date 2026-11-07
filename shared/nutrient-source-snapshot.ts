import {nutrientDefinitionDetails,NUTRIENT_DEFINITION_VERSION} from "./nutrient-definitions";
import {z} from "zod";
/** Immutable at meal review/save. This is composition evidence, not another
 * consumed total or independent verification of a chemical/biological zero. */
export interface NutrientSourceSnapshot {
 version:"nutrient-source-snapshot-v1";definitionVersion:string;
 sourceType:"generic-usda-composition";sourceId:string;sourceVersion:string;sourceUrl:string;
 ingredient:string;reviewedGrams:number;collectionDate:null;
 values:{key:string;unit:string;sourceValuePer100g:number|null;state:"estimated"|"unknown";sourceReportsZero:boolean|null;chemicalForm:string|null;activityUnit:string|null}[];
}
const valueSchema=z.object({key:z.string().min(1).max(80),unit:z.enum(["kcal","g","mg","µg"]),sourceValuePer100g:z.number().finite().nonnegative().nullable(),state:z.enum(["estimated","unknown"]),sourceReportsZero:z.boolean().nullable(),chemicalForm:z.string().max(100).nullable(),activityUnit:z.string().max(100).nullable()}).strict().superRefine((value,ctx)=>{
 if(value.state==="unknown"?(value.sourceValuePer100g!==null||value.sourceReportsZero!==null):(value.sourceValuePer100g===null||value.sourceReportsZero!==(value.sourceValuePer100g===0)))ctx.addIssue({code:"custom",message:"Unknown composition and source zero must remain distinct"});
});
export const nutrientSourceSnapshotSchema=z.object({version:z.literal("nutrient-source-snapshot-v1"),definitionVersion:z.string().min(1).max(100),sourceType:z.literal("generic-usda-composition"),sourceId:z.string().regex(/^fdc:[1-9]\d*$/),sourceVersion:z.string().min(1).max(200),sourceUrl:z.string().url().max(300),ingredient:z.string().min(1).max(120),reviewedGrams:z.number().finite().positive().max(3000),collectionDate:z.null(),values:z.array(valueSchema).min(1).max(21)}).strict().superRefine((row,ctx)=>{
 if(row.sourceUrl!==`https://fdc.nal.usda.gov/food-details/${row.sourceId.slice(4)}/nutrients`||new Set(row.values.map(v=>v.key)).size!==row.values.length)ctx.addIssue({code:"custom",message:"Resolve the original USDA source and unique nutrient fields"});
});
/** Never recreate missing old snapshots from today's mutable source catalogue. */
export function readNutrientSourceSnapshots(input:unknown){
 if(input===undefined)return{status:"not-captured" as const,snapshots:[] as NutrientSourceSnapshot[]};
 const parsed=z.array(nutrientSourceSnapshotSchema).max(20).safeParse(input);
 return parsed.success?{status:"available" as const,snapshots:parsed.data}:{status:"unsupported" as const,snapshots:[] as NutrientSourceSnapshot[]};
}
export function captureNutrientSource(input:{sourceId:string;sourceVersion:string;sourceUrl:string;ingredient:string;grams:number;per100g:Record<string,number|undefined>}):NutrientSourceSnapshot{
 return nutrientSourceSnapshotSchema.parse({version:"nutrient-source-snapshot-v1",definitionVersion:NUTRIENT_DEFINITION_VERSION,sourceType:"generic-usda-composition",sourceId:input.sourceId,sourceVersion:input.sourceVersion,sourceUrl:input.sourceUrl,ingredient:input.ingredient,reviewedGrams:input.grams,collectionDate:null,
  values:nutrientDefinitionDetails().map(def=>{const raw=input.per100g[String(def.sourceMappings.usda)],known=typeof raw==="number"&&Number.isFinite(raw)&&raw>=0;return{key:def.key,unit:def.amountUnit,sourceValuePer100g:known?raw:null,state:known?"estimated":"unknown",sourceReportsZero:known?raw===0:null,chemicalForm:def.chemicalForm,activityUnit:def.activityUnit};}),
 });
}
