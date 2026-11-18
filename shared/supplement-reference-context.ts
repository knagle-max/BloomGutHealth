import {z} from 'zod';
import data from './data/vitamin-b6-reference-context.json';
import type {Product} from './products';
const source={id:z.string().min(1),authority:z.string().min(1),referenceEdition:z.string().min(1),sourcePublishedOn:z.string(),sourceDatePrecision:z.enum(['day','month']),sourceTitle:z.string().min(1),sourceUrl:z.url(),sourceBasis:z.string().min(1),note:z.string().min(1)};
export const vitaminB6ReferenceEntrySchema=z.discriminatedUnion('kind',[
 z.object({...source,kind:z.literal('reference_ul'),amount:z.number().positive(),unit:z.literal('mg/day'),ageMinYears:z.number().int().min(18),intakeScope:z.literal('total-food-and-supplement-intake')}).strict(),
 z.object({...source,kind:z.literal('health_product_warning'),amount:z.number().positive(),operator:z.literal('>='),unit:z.literal('mg/day'),intakeScope:z.literal('natural-health-product-labelled-daily-dose')}).strict(),
 z.object({...source,kind:z.literal('regulatory_proposal'),status:z.literal('proposal'),amount:z.number().positive(),unit:z.literal('mg/serving'),cautionAbove:z.number().positive(),intakeScope:z.literal('supplemented-foods-including-caffeinated-energy-drinks'),effectiveFrom:z.null()}).strict(),
]).superRefine((row,ctx)=>{
 if(!(row.sourceDatePrecision==='day'?z.iso.date():z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/)).safeParse(row.sourcePublishedOn).success)ctx.addIssue({code:'custom',message:'Preserve the actual source publication-date precision.'});
 try{const url=new URL(row.sourceUrl);if(url.protocol!=='https:'||!['ods.od.nih.gov','efsa.onlinelibrary.wiley.com','www.canada.ca'].includes(url.hostname))ctx.addIssue({code:'custom',message:'Retain the inspected authority source.'});}catch{ctx.addIssue({code:'custom',message:'Retain the inspected authority source.'});}
});
const entries=data.entries.map(row=>Object.freeze(vitaminB6ReferenceEntrySchema.parse(row)));
if(new Set(entries.map(row=>row.id)).size!==entries.length)throw Error('Duplicate B6 source identity');
export const vitaminB6ReferenceContext=Object.freeze({...data,entries:Object.freeze(entries)});
/** Declaration recognition only: never establishes amount equivalence, daily
 * exposure, a product's regulatory class, safety or a prescribed dose. */
export function hasVitaminB6Declaration(label:Pick<Product,'perServing'|'labelDeclarations'|'otherNutrients'>|null|undefined){
 if(!label)return false;
 if(Object.hasOwn(label.perServing,'vitamin_b6_mg'))return true;
 const names=[...(label.labelDeclarations??[]),...(label.otherNutrients??[])].map(row=>row.name.trim().toLowerCase().replace(/\s+/g,' '));
 const forms=new Set(['pyridoxine','pyridoxine hydrochloride','pyridoxine hcl','pyridoxal','pyridoxamine','pyridoxine 5 phosphate','pyridoxal 5 phosphate','pyridoxamine 5 phosphate']);
 return names.some(name=>/^vitamin b[ -]?6(?:\s*\([^)]*\))?$/.test(name)||forms.has(name.replace(/[′’']/g,'').replace(/-/g,' ').replace(/\s+/g,' ')));
}
