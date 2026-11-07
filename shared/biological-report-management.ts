import{z}from'zod';
export const biologicalReportCategorySchema=z.enum(['microbiome','bloodwork','genetics']);
const revision=z.string().regex(/^[a-f0-9]{64}$/);
export const managedReportSchema=z.object({id:z.string().min(1).max(200),revision,type:z.enum(['report','result','dataset']),source:z.string().min(1).max(200),status:z.string().min(1).max(200),sourceDate:z.string().max(100).nullable(),sourceDateKind:z.enum(['collection','recorded']).nullable(),deletable:z.boolean(),uploadedAt:z.string().max(100).nullable(),observations:z.number().int().nonnegative().nullable(),versions:z.number().int().positive().nullable(),active:z.boolean().optional(),viewHref:z.string().regex(/^\/(?!\/)/).nullable()}).strict();
export const biologicalReportSnapshotSchema=z.object({category:biologicalReportCategorySchema,reports:z.array(managedReportSchema),selectionRevision:revision.optional(),selectionState:z.enum(['active','none','unavailable']).optional()}).strict();
export const biologicalReportDeleteSchema=z.object({category:biologicalReportCategorySchema,scope:z.enum(['selected','category']),reports:z.array(z.object({id:z.string().min(1).max(200),revision}).strict()).min(1).max(1000),selectionRevision:revision.optional(),confirmed:z.literal(true)}).strict().superRefine((value,ctx)=>{if(new Set(value.reports.map(row=>row.id)).size!==value.reports.length)ctx.addIssue({code:'custom',path:['reports'],message:'Review each selected source once.'});if(value.category==='genetics'&&!value.selectionRevision)ctx.addIssue({code:'custom',path:['selectionRevision'],message:'Review the active genetic source selection.'});});
export const BIOLOGICAL_REPORT_DELETE_CONFIRM='delete-biological-reports';
export type BiologicalReportCategory=z.infer<typeof biologicalReportCategorySchema>;
export type ManagedReport=z.infer<typeof managedReportSchema>;
export type BiologicalReportSnapshot=z.infer<typeof biologicalReportSnapshotSchema>;
export type BiologicalReportDelete=z.infer<typeof biologicalReportDeleteSchema>;
export class BiologicalReportConflict extends Error{constructor(){super('Saved reports or source selection changed. Reload and review the exact sources before deleting.');}}
