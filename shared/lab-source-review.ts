import {z} from 'zod';
import {labSchema,sourceOnlyLabSchema,markerDefinitions,type Lab,type SourceOnlyLab} from './precision-nutrition';
import {hasConfirmedLabIdentity} from './lab-assay-identity';
/** Stable source snapshot excludes display projections and ownership supplied by clients. */
export function labReviewSource(source:Lab|SourceOnlyLab):Lab|SourceOnlyLab{
 const schema='sourceOnly'in source?sourceOnlyLabSchema:labSchema;
 const fields=Object.fromEntries(Object.keys(schema.shape).filter(key=>(source as any)[key]!==undefined).map(key=>[key,(source as any)[key]]));
 return schema.parse(fields);
}
export const labReviewRevisionText=(source:Lab|SourceOnlyLab)=>JSON.stringify(['lab-source-review-v1',labReviewSource(source)]);
export async function labReviewRevision(source:Lab|SourceOnlyLab){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(labReviewRevisionText(source))))).map(byte=>byte.toString(16).padStart(2,'0')).join('');}
export const labSourceReviewSchema=z.object({
 expectedRevision:z.string().regex(/^[a-f0-9]{64}$/),marker:labSchema.shape.marker,unit:z.string().min(1).max(50),
 referenceLow:z.number().finite().nonnegative().nullable(),referenceHigh:z.number().finite().nonnegative().nullable(),method:z.string().trim().min(1).max(200),reason:z.string().trim().min(1).max(300),reviewed:z.literal(true),
}).strict().superRefine((input,ctx)=>{
 if(!(markerDefinitions.find(marker=>marker.id===input.marker)?.units as readonly string[]).includes(input.unit))ctx.addIssue({code:'custom',path:['unit'],message:'Choose the unit actually reported for this marker.'});
 if(input.referenceLow!==null&&input.referenceHigh!==null&&input.referenceLow>=input.referenceHigh)ctx.addIssue({code:'custom',path:['referenceHigh'],message:'The lower reference bound must be below the upper bound.'});
});
export type LabSourceReview=z.infer<typeof labSourceReviewSchema>;
export function exactLabSourceNumber(source:Lab|SourceOnlyLab){
 if(!('sourceOnly'in source))return source.value;
 return /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(source.reportedValue)&&Number.isFinite(Number(source.reportedValue))&&Number(source.reportedValue)<=1000000?Number(source.reportedValue):null;
}
/** One explicit owner review creates a successor; originals and numeric values are immutable. */
export function applyLabSourceReview(source:Lab|SourceOnlyLab,sourceId:string,input:LabSourceReview,fingerprint:string,now:string):Lab{
 const request=labSourceReviewSchema.parse(input),value=exactLabSourceNumber(source);
 if(value===null)throw Error('LAB_REVIEW_NUMBER_UNKNOWN');
 const raw='sourceOnly'in source;
 const payload=labSchema.parse({marker:request.marker,value,unit:request.unit,measuredAt:source.measuredAt,laboratory:source.laboratory,method:request.method,fasting:source.fasting,referenceLow:request.referenceLow,referenceHigh:request.referenceHigh,notes:raw?'Source identity reviewed against original report.':source.notes,
  sourceInput:source.sourceInput,sourceReport:source.sourceReport,dateCorrection:source.dateCorrection,
  sourceCorrection:{version:1,supersedes:sourceId,previousRevision:request.expectedRevision,reviewedAt:now,reason:request.reason,requestFingerprint:fingerprint,
   original:{kind:raw?'source-only':'supported',reportedAnalyte:raw?source.reportedAnalyte:markerDefinitions.find(marker=>marker.id===source.marker)!.name,reportedValue:raw?source.reportedValue:String(source.value),reportedUnit:raw?source.reportedUnit:source.unit,reportedReferenceInterval:raw?source.reportedReferenceInterval??null:null,referenceLow:raw?null:source.referenceLow,referenceHigh:raw?null:source.referenceHigh,method:source.method}},
  unitReview:{status:'confirmed',originalValue:value,originalUnit:source.sourceInput?source.sourceInput.suppliedUnit:(raw?source.reportedUnit:source.unitReview?source.unitReview.originalUnit:source.unit),originalText:source.sourceInput?.text??(!raw?source.unitReview?.originalText??'':''),suggestedUnit:request.unit,confirmedAt:now,supersedes:null},
 });
 if(!hasConfirmedLabIdentity(request.marker,payload))throw Error('LAB_REVIEW_IDENTITY_UNKNOWN');
 return payload;
}
