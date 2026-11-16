import {z} from 'zod';

export const labResponseQuestions={
 lipids:{id:'medication-change',text:'Were any medicines changed before this collection?'},
 glycemic:{id:'fasting-context',text:'Was the glucose collection fasting?'},
 liver:{id:'acute-illness',text:'Was there an acute illness before this collection?'},
 'iron-cbc':{id:'iron-products',text:'Were iron-containing products changed before this collection?'},
} as const;
const sourceReferenceSchema=z.object({id:z.string().min(1).max(100),revision:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
const windowSchema=z.object({from:z.iso.date(),to:z.iso.date(),precision:z.enum(['day','range'])}).strict().superRefine((value,ctx)=>{
 if(value.from>value.to||value.precision==='day'&&value.from!==value.to)ctx.addIssue({code:'custom',message:'Keep a valid remembered event day or date range.'});
});
/** Reader contract only. Server-derived source proofs and learned-at time must
 * precede a dedicated writer. A recollection never changes the source report,
 * confirms performed behavior or establishes a cause. */
export const recalledLabResponseContextSchema=z.object({
 version:z.literal(1),valueKind:z.literal('recalled-context'),intentId:z.string().uuid(),
 family:z.enum(['lipids','glycemic','liver','iron-cbc']),
 question:z.enum(['medication-change','fasting-context','acute-illness','iron-products']),
 answer:z.enum(['yes','no','unknown','not-tracked','prefer-not-answer']),
 reviewWindow:z.object({from:z.iso.date().nullable(),to:z.iso.date(),basis:z.enum(['source-date','stored-timestamp','mixed-or-unknown'])}).strict(),
 eventWindow:windowSchema.nullable(),datePrecision:z.enum(['day','range','unknown','not-applicable']),
 recordedAt:z.string().datetime({offset:true}),sourceReferences:z.array(sourceReferenceSchema).min(1).max(64),
 supersedes:z.string().min(1).max(100).nullable(),notes:z.string().trim().max(1000),
}).strict().superRefine((value,ctx)=>{
 if(value.question!==labResponseQuestions[value.family].id)ctx.addIssue({code:'custom',message:'Keep the question with its marker family.'});
 if(new Set(value.sourceReferences.map(source=>source.id)).size!==value.sourceReferences.length)ctx.addIssue({code:'custom',message:'Keep each exact source once.'});
 if(value.reviewWindow.from!==null&&value.reviewWindow.from>value.reviewWindow.to)ctx.addIssue({code:'custom',message:'Keep the ordered source review window.'});
 if(value.answer==='yes'){
  if(value.eventWindow?value.datePrecision!==value.eventWindow.precision:value.datePrecision!=='unknown')ctx.addIssue({code:'custom',message:'Retain the actual precision of the remembered date.'});
 }else if(value.eventWindow!==null||value.datePrecision!=='not-applicable')ctx.addIssue({code:'custom',message:'An event date cannot be invented for this answer.'});
 if(value.answer==='prefer-not-answer'&&value.notes!=='')ctx.addIssue({code:'custom',message:'An unanswered question must not retain private notes.'});
 if(value.eventWindow&&value.reviewWindow.basis==='source-date'&&value.eventWindow.to>value.reviewWindow.to)ctx.addIssue({code:'custom',message:'A remembered pre-test event cannot be placed after the source review date.'});
 // Date-only recollections have no asserted timezone. Permit the calendar day
 // at the largest supported UTC offset; source-relative timing stays unproven.
 const learnedAt=Date.parse(value.recordedAt);
 if(value.eventWindow&&Number.isFinite(learnedAt)&&value.eventWindow.to>new Date(learnedAt+14*60*60*1000).toISOString().slice(0,10))ctx.addIssue({code:'custom',message:'A remembered event cannot be in the future.'});
});
/** Minimal replay barrier survives deletion of remembered answers. It contains
 * no answer, notes, lab values or source IDs and is not a health observation. */
export const labResponseContextLifecycleSchema=z.object({
 version:z.literal(1),valueKind:z.literal('context-lifecycle'),scopeHash:z.string().regex(/^[a-f0-9]{64}$/),
 generationId:z.string().uuid(),updatedAt:z.string().datetime({offset:true}),
 lastDelete:z.object({intentId:z.string().uuid(),requestRevision:z.string().regex(/^[a-f0-9]{64}$/)}).strict().optional(),
}).strict();
export const labResponseContextSchema=z.discriminatedUnion('valueKind',[recalledLabResponseContextSchema,labResponseContextLifecycleSchema]);
export type RecalledLabResponseContext=z.infer<typeof recalledLabResponseContextSchema>;
export type LabResponseContext=z.infer<typeof labResponseContextSchema>;

const selectionFields={family:recalledLabResponseContextSchema.shape.family,sourceIds:z.array(z.string().min(1).max(100)).min(1).max(64)};
export const labResponseContextSelectionSchema=z.object(selectionFields).strict().refine(value=>new Set(value.sourceIds).size===value.sourceIds.length,{message:'Keep each source once.'});
export const labResponseContextPrepareSchema=z.object({family:selectionFields.family,sourceReferences:recalledLabResponseContextSchema.shape.sourceReferences}).strict();
export const labResponseContextSaveSchema=z.object({
 ...labResponseContextPrepareSchema.shape,intentId:z.string().uuid(),generationId:z.string().uuid(),expectedCurrentId:z.string().min(1).max(100).nullable(),
 answer:recalledLabResponseContextSchema.shape.answer,eventWindow:recalledLabResponseContextSchema.shape.eventWindow,datePrecision:recalledLabResponseContextSchema.shape.datePrecision,notes:recalledLabResponseContextSchema.shape.notes,
}).strict();
export const labResponseContextDeleteSchema=z.object({...selectionFields,intentId:z.string().uuid(),generationId:z.string().uuid(),expectedHistoryRevision:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export type LabResponseContextSelection=z.infer<typeof labResponseContextSelectionSchema>;
export type LabResponseContextPrepare=z.infer<typeof labResponseContextPrepareSchema>;
export type LabResponseContextSave=z.infer<typeof labResponseContextSaveSchema>;
export type LabResponseContextDelete=z.infer<typeof labResponseContextDeleteSchema>;
export type LabResponseContextRecord={id:string;payload:RecalledLabResponseContext;createdAt:string;updatedAt:string};
export type LabResponseContextView={scopeHash:string;generationId:string|null;historyRevision:string;historyCount:number;latest:{record:LabResponseContextRecord;sourceCurrent:boolean}|null;asOf:string};
