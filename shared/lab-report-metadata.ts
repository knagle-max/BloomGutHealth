import {labSourceReferenceCorrectionsSchema} from './lab-reference-correction';
import {z} from 'zod';
import type {LabOverlayPreference} from './lab-overlay-preference';

/** Annotation/export tag for the separate encrypted report-metadata entity.
 * This is neither a lab observation nor a provider scientific range registry. */
export const LAB_REPORT_METADATA_KIND='lab-report-metadata';
export const labProvinces=['BC','AB','SK','MB','ON','QC','NB','NS','PE','NL','YT','NT','NU'] as const;
export const reportProviderIdentitySchema=z.object({
 provider:z.enum(['LifeLabs','Dynacare','other','unknown']),otherProvider:z.string().trim().max(120),
 province:z.enum(['',...labProvinces]),location:z.string().trim().max(160),assertion:z.literal('user-confirmed'),
}).strict().superRefine((value,ctx)=>{
 if(value.provider==='other'&&!value.otherProvider)ctx.addIssue({code:'custom',path:['otherProvider'],message:'Name the laboratory stated on the report'});
 if(value.provider!=='other'&&value.otherProvider)ctx.addIssue({code:'custom',path:['otherProvider'],message:'A separate name belongs only to Other laboratory'});
});
export const reportOverlayPreferenceSchema=z.object({provider:z.enum(['original-report','LifeLabs','other','none']),province:z.string().trim().max(60),otherProvider:z.string().trim().max(120)}).strict();
export const labReportMetadataCommandSchema=z.object({
 sourceRevision:z.string().regex(/^[a-f0-9]{64}$/),metadataRevision:z.string().uuid().nullable(),
 identity:reportProviderIdentitySchema.nullable(),identityReviewed:z.boolean(),overlay:reportOverlayPreferenceSchema,
}).strict();
export type LabReportMetadataCommand=z.infer<typeof labReportMetadataCommandSchema>;
export const labReportMetadataSchema=z.object({
 version:z.literal(1),sourceId:z.string().regex(/^[a-f0-9]{64}$/),groupKey:z.string().max(5000).nullable(),
 revision:z.string().uuid(),supersedes:z.string().max(100).nullable(),sourceRevision:z.string().regex(/^[a-f0-9]{64}$/),
 identity:reportProviderIdentitySchema.nullable(),identityAssertedAt:z.string().datetime().nullable(),
 overlay:reportOverlayPreferenceSchema,recordedAt:z.string().datetime(),receiptHash:z.string().regex(/^[a-f0-9]{64}$/),
}).strict();
export type LabReportMetadata=z.infer<typeof labReportMetadataSchema>;
const metadataHistorySchema=labReportMetadataSchema.pick({revision:true,recordedAt:true,sourceRevision:true,identity:true,identityAssertedAt:true,overlay:true});
export const labReportMetadataViewSchema=z.object({current:labReportMetadataSchema.nullable(),sourceCurrent:z.boolean(),history:z.array(metadataHistorySchema),historyCount:z.number().int().nonnegative(),available:z.boolean()});
export const labManagedSourceSchema=z.object({
 id:z.string().regex(/^[a-f0-9]{64}$/),revision:z.string().regex(/^[a-f0-9]{64}$/),scope:z.enum(['report','result']),results:z.number().int().nonnegative().nullable(),records:z.number().int().positive(),dates:z.array(z.string()),
 manageable:z.boolean().optional(),savedAt:z.string().nullable().optional(),detailRecordId:z.string().max(100).optional(),groupKey:z.string().nullable().optional(),
 originalLaboratories:z.array(z.string()).optional(),reportIdentifiers:z.array(z.string()).optional(),specimenIdentifiers:z.array(z.string()).optional(),
 dateContexts:z.array(z.object({date:z.string(),precision:z.enum(['source-date','source-time','stored-timestamp-only'])})).optional(),metadata:labReportMetadataViewSchema.optional(),referenceCorrections:labSourceReferenceCorrectionsSchema.optional(),
});
export type LabManagedSource=z.infer<typeof labManagedSourceSchema>;
export type LabReportMetadataView={current:LabReportMetadata|null;sourceCurrent:boolean;history:Array<{revision:string;recordedAt:string;sourceRevision:string;identity:LabReportMetadata['identity'];identityAssertedAt:string|null;overlay:LabOverlayPreference}>;historyCount:number;available:boolean};
export function reportProviderName(identity:LabReportMetadata['identity']){return !identity||identity.provider==='unknown'?null:identity.provider==='other'?identity.otherProvider:identity.provider;}
/** Stable identity fingerprint excludes overlay preferences; source or performing
 * provider changes withdraw prior fact-specific comparison confirmations. */
export function reportIdentityBasis(sourceRevision:string,metadata:LabReportMetadata|null){return JSON.stringify([sourceRevision,metadata?.identity??null,metadata?.identityAssertedAt??null]);}

export class LabReportMetadataError extends Error{
 constructor(public readonly status:400|404|409|503,message:string){super(message);this.name='LabReportMetadataError';}
}

export const sourceOverlayKey=(source:Pick<LabManagedSource,'id'|'groupKey'>)=>source.groupKey||`independent-source:${source.id}`;
export function laboratorySourceTitle(source:LabManagedSource){const confirmed=source.metadata?.sourceCurrent?reportProviderName(source.metadata.current?.identity??null):null;if(confirmed)return confirmed;const original=(source.originalLaboratories||[]).filter(label=>!/^\s*(?:not supplied|unknown|not recorded|unspecified)?\s*$/i.test(label));return original.length===1?original[0]:original.length>1?'Multiple original laboratory labels':'Laboratory not recorded';}
