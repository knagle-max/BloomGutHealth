import {z} from 'zod';

export const LAB_REFERENCE_CORRECTION_KIND='lab-reference-range-correction';
const hash=z.string().regex(/^[a-f0-9]{64}$/);
export const copiedLabReferenceSchema=z.object({
 low:z.number().finite().nonnegative().nullable(),high:z.number().finite().nonnegative().nullable(),
 lowOperator:z.enum(['>','>=']).nullable(),highOperator:z.enum(['<','<=']).nullable(),
 unit:z.string().trim().min(1).max(50),
 laboratory:z.string().trim().max(160),reportIdentifier:z.string().trim().max(160),
 population:z.string().trim().max(300),specimen:z.string().trim().max(100),assay:z.string().trim().max(200),method:z.string().trim().max(200),
}).strict().superRefine((value,ctx)=>{
 if(value.low===null&&value.high===null)ctx.addIssue({code:'custom',message:'Copy at least one reference bound from the report.'});
 if((value.low===null)!==(value.lowOperator===null)||(value.high===null)!==(value.highOperator===null))ctx.addIssue({code:'custom',message:'Keep each operator with its supplied bound.'});
 if(value.low!==null&&value.high!==null&&value.low>=value.high)ctx.addIssue({code:'custom',message:'The lower bound must be below the upper bound.'});
});
export type CopiedLabReference=z.infer<typeof copiedLabReferenceSchema>;
export const labReferenceCorrectionCommandSchema=z.object({
 observationId:z.string().min(1).max(100),sourceRevision:hash,
 expectedCorrectionRevision:z.string().uuid().nullable(),
 limits:copiedLabReferenceSchema.nullable(),confirmedFromReport:z.literal(true),
}).strict();
export type LabReferenceCorrectionCommand=z.infer<typeof labReferenceCorrectionCommandSchema>;
/** Separate source annotation in the existing encrypted metadata version table.
 * It never replaces a measured observation or its imported limits/flags. */
export const labReferenceCorrectionSchema=z.object({
 version:z.literal(1),valueKind:z.literal('lab-reference-range-correction'),sourceId:hash,
 observationId:z.string().min(1).max(100),reportSourceId:hash,
 revision:z.string().uuid(),supersedes:hash.nullable(),sourceRevision:hash,
 limits:copiedLabReferenceSchema.nullable(),recordedAt:z.string().datetime(),requestFingerprint:hash,
}).strict();
export type LabReferenceCorrection=z.infer<typeof labReferenceCorrectionSchema>;
export const labReferenceCorrectionViewSchema=z.object({
 observationId:z.string(),sourceRevision:hash,
 current:labReferenceCorrectionSchema.nullable(),sourceCurrent:z.boolean(),historyCount:z.number().int().nonnegative(),available:z.boolean(),
 history:z.array(labReferenceCorrectionSchema),
});
export type LabReferenceCorrectionView=z.infer<typeof labReferenceCorrectionViewSchema>;
export const labSourceReferenceCorrectionsSchema=z.object({available:z.boolean(),observations:z.array(labReferenceCorrectionViewSchema)});
export type LabSourceReferenceCorrections=z.infer<typeof labSourceReferenceCorrectionsSchema>;
