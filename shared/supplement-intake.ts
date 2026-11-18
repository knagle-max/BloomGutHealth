import {z} from 'zod';
import {productResponseSchema} from './products';
import {scaleLabelAmount} from './label-portion';
import {readLabelNutrientSources} from './label-nutrient-sources';

const timestamp=z.iso.datetime({offset:true});
const mineralBasis=z.enum(['elemental-label','compound-weight','unknown']);
function canonical(value:unknown):unknown {
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)]));
 return value;
}
const sameValue=(a:unknown,b:unknown)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
/** Exact label and explicit user assertion, never a schedule or quality review.
 * Chemical equivalents and dose/safety interpretation are outside this record. */
export const supplementIntakeValueSchema=z.object({
 takenAt:timestamp,confirmedAt:timestamp,confirmedTaken:z.literal(true),
 servings:z.number().finite().positive().max(100),
 label:productResponseSchema.refine(p=>p.source!=='usda-local','A generic food estimate is not a supplement label')
  .refine(p=>JSON.stringify(p).length<=32000,'Label snapshot exceeds the supported size'),
 mineralBasis:z.object({iron_mg:mineralBasis,magnesium_mg:mineralBasis,zinc_mg:mineralBasis}).strict(),
 formulation:z.object({labelVersion:z.string().trim().min(1).max(160).nullable(),batch:z.string().trim().min(1).max(100).nullable()}).strict(),
}).strict();
export const supplementIntakeSchema=z.object({
 version:z.literal(1),valueKind:z.literal('confirmed-supplement-consumption'),
 intentId:z.uuid(),revision:z.uuid(),lifecycleId:z.uuid(),
 original:supplementIntakeValueSchema,current:supplementIntakeValueSchema,
 corrections:z.array(z.object({revision:z.uuid(),changedAt:timestamp,value:supplementIntakeValueSchema}).strict()).max(32),
}).strict().superRefine((record,ctx)=>{
 const last=record.corrections.at(-1);
 if(last?(last.revision!==record.revision||!sameValue(last.value,record.current)):!sameValue(record.original,record.current))
  ctx.addIssue({code:'custom',message:'Current intake must match its source correction history'});
 if(new Set(record.corrections.map(row=>row.revision)).size!==record.corrections.length)
  ctx.addIssue({code:'custom',message:'Correction revisions must be unique'});
 let previous=Date.parse(record.original.confirmedAt);
 for(const correction of record.corrections){
  const time=Date.parse(correction.changedAt);
  if(time<previous||Date.parse(correction.value.confirmedAt)>time)ctx.addIssue({code:'custom',message:'Correction chronology is inconsistent'});
  previous=time;
 }
});
export type SupplementIntake=z.infer<typeof supplementIntakeSchema>;

/** Projection of one owned canonical event. Original and correction snapshots
 * explain provenance; only its current value can contribute, exactly once. */
export function supplementSourceContributions(record:{id:string;userId:string;payload:unknown},actor:string|undefined){
 if(!actor||record.userId!==actor||!record.id)return{status:'scope-unavailable' as const,observations:[]};
 const parsed=supplementIntakeSchema.safeParse(record.payload);
 if(!parsed.success)return{status:'unsupported' as const,observations:[]};
 const value=parsed.data.current;
 // A prospective claim must never turn into confirmed ingestion just because
 // time passed. Dedicated writers must require confirmation after takenAt.
 if(Date.parse(value.takenAt)>Date.parse(value.confirmedAt))return{status:'confirmation-before-intake' as const,observations:[]};
 const source=readLabelNutrientSources([{labelSnapshot:value.label}]).sources[0];
 if(!source)return{status:'unsupported' as const,observations:[]};
 return{status:'available' as const,intakeId:parsed.data.intentId,revision:parsed.data.revision,
  observations:source.fields.map(field=>{
   const basis=Object.hasOwn(value.mineralBasis,field.key)?value.mineralBasis[field.key as keyof typeof value.mineralBasis]:null;
   const portionBasisCaptured=!!source.servingDescription?.trim();
   return{valueKind:'recorded_source_contribution' as const,recordId:record.id,intakeId:parsed.data.intentId,
    occurredAt:value.takenAt,confirmedAt:value.confirmedAt,sourceId:source.id,provider:source.provider,
    sourceRetrievedAt:source.retrievedAt,nutrientKey:field.key,name:field.name,unit:field.unit,
    nativeAmountPerServing:field.amount,servings:value.servings,sourceReportsZero:field.sourceReportsZero,
    portionBasisCaptured,
    amount:!portionBasisCaptured||(basis!==null&&basis!=='elemental-label')?null:scaleLabelAmount(field.amount,value.servings),
    mineralBasis:basis,chemicalForm:null,activityUnit:null,adequacyAssessment:false as const,
   };
  })};
}
