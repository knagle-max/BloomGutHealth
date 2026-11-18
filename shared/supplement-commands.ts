import {z} from 'zod';
import {productRefSchema} from './products';
import {supplementIntakeValueSchema} from './supplement-intake';

const value=supplementIntakeValueSchema.shape;
const uuid=z.uuid().transform(value=>value.toLowerCase());
export const supplementDraftSchema=z.object({
 takenAt:value.takenAt,servings:value.servings,mineralBasis:value.mineralBasis,formulation:value.formulation,
 source:z.discriminatedUnion('kind',[
  z.object({kind:z.literal('label'),product:productRefSchema.pick({source:true,id:true}).refine(p=>p.source!=='usda-local')}).strict(),
  z.object({kind:z.literal('unlabelled'),description:value.unlabelled.unwrap()}).strict(),
 ]),
}).strict().superRefine((draft,ctx)=>{
 if(draft.source.kind==='unlabelled'&&Object.values(draft.mineralBasis).some(basis=>basis!=='unknown'))ctx.addIssue({code:'custom',message:'Mineral basis stays unknown without a label'});
});
export const supplementCreateCommandSchema=z.object({
 intentId:uuid,lifecycleId:uuid,reviewRevision:z.string().regex(/^[a-f0-9]{64}$/),
 confirmedTaken:z.literal(true),draft:supplementDraftSchema,
}).strict();
export const supplementEditCommandSchema=z.object({
 editId:uuid,expectedRevision:uuid,lifecycleId:uuid,reviewRevision:z.string().regex(/^[a-f0-9]{64}$/),
 confirmedTaken:z.literal(true),draft:supplementDraftSchema,
}).strict();
export const supplementRemoveCommandSchema=z.object({expectedRevision:uuid}).strict();
export type SupplementDraft=z.infer<typeof supplementDraftSchema>;
export type SupplementCreateCommand=z.infer<typeof supplementCreateCommandSchema>;
