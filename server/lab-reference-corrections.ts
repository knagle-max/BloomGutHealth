import {createHash} from 'node:crypto';
import {labReviewRevisionText} from '../shared/lab-source-review';
import {labReferenceCorrectionSchema,type LabReferenceCorrectionView} from '../shared/lab-reference-correction';
import type {Lab,PrecisionRecord} from '../shared/precision-nutrition';
import type {LabReportMetadata} from '../shared/lab-report-metadata';

export const referenceHash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
export const referenceStreamId=(userId:string,observationId:string)=>referenceHash(['lab-reference-range-v1',userId,observationId]);
/** An unrelated report row or an overlay preference must not invalidate this fact.
 * The clinical source and actual performing identity remain part of its binding. */
export const referenceSourceRevision=(source:Lab,identity:LabReportMetadata['identity'])=>referenceHash(['lab-reference-source-v1',labReviewRevisionText(source),identity]);
export function referenceCorrectionView(userId:string,observationId:string,sourceRevision:string,records:PrecisionRecord[],ready=true):LabReferenceCorrectionView{
 const stream=referenceStreamId(userId,observationId),rows=records.filter(row=>(row.payload as any)?.sourceId===stream);
 const candidates=rows.flatMap(row=>{const parsed=labReferenceCorrectionSchema.safeParse(row.payload);return parsed.success&&parsed.data.observationId===observationId?[{id:row.id,payload:parsed.data}]:[];});
 const superseded=new Set(candidates.flatMap(row=>row.payload.supersedes?[row.payload.supersedes]:[])),heads=candidates.filter(row=>!superseded.has(row.id));
 const byId=new Map(candidates.map(row=>[row.id,row])),chain:typeof candidates=[],visited=new Set<string>();let cursor=heads.length===1?heads[0]:undefined;
 while(cursor&&!visited.has(cursor.id)){visited.add(cursor.id);chain.push(cursor);cursor=cursor.payload.supersedes?byId.get(cursor.payload.supersedes):undefined;}
 const available=ready&&rows.length===candidates.length&&new Set(candidates.map(row=>row.payload.revision)).size===candidates.length&&(rows.length===0||heads.length===1&&chain.length===rows.length&&chain.at(-1)?.payload.supersedes===null);
 const current=available?chain[0]?.payload??null:null;
 return{observationId,sourceRevision,current,sourceCurrent:!!current&&current.sourceRevision===sourceRevision,history:available?chain.slice(1,21).map(row=>row.payload):[],historyCount:Math.max(0,rows.length-1),available};
}
