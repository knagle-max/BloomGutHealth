import {z} from 'zod';
import {labSchema,labSourceReportSchema,labDateCorrectionSchema} from './precision-nutrition';
import {hasConfirmedLabIdentity} from './lab-assay-identity';
import {assessLabComparability} from './lab-comparability';
import {recordedLabDifference,latestRecordedLabContext} from './lab-history';
const id=z.string().min(1).max(128);
export const investigationNumericClaimSchema=z.object({
 id,operation:z.enum(['source-value','recorded-difference']),
 observationIds:z.array(id).min(1).max(2).refine(ids=>new Set(ids).size===ids.length),
 value:z.number().finite(),unit:z.string().trim().min(1).max(50),
}).strict().refine(claim=>claim.observationIds.length===(claim.operation==='source-value'?1:2),'Wrong source count for operation');
export type InvestigationNumericClaim=z.infer<typeof investigationNumericClaimSchema>;
const factSchema=z.object({
 id,domain:z.literal('lab'),sourceId:id,revision:z.string().min(1).max(4096),
 marker:z.string().min(1).max(100),amount:z.number().finite().nonnegative().max(1_000_000),unit:z.string().min(1).max(50),
 occurredAt:z.iso.datetime({offset:true}),laboratory:z.string().max(500),method:z.string().max(500),
 fasting:z.enum(['yes','no','unknown']),computationEligible:z.boolean(),
 sourceReport:labSourceReportSchema.nullable().optional(),dateCorrection:labDateCorrectionSchema.nullable().optional(),
 sourceInput:z.object({text:z.string().max(1000)}).passthrough().nullable().optional(),
}).passthrough();
export type InvestigationLabNumericFact=z.infer<typeof factSchema>;
/** Source arithmetic only. No code expressions, arbitrary tools, unit guessing,
 * personal significance, thresholds, source discovery or scientific approval.
 * Trusted facts must come from the current owned canonical snapshot. */
export function verifyInvestigationNumericClaims(claims:unknown,facts:unknown,eligibleObservationIds:readonly string[]):boolean{
 const claimRows=z.array(investigationNumericClaimSchema).max(12).safeParse(claims);
 if(!claimRows.success)return false;if(!claimRows.data.length)return true;
 const parsed=z.array(factSchema).max(2000).safeParse(facts);
 if(!parsed.success||new Set(claimRows.data.map(row=>row.id)).size!==claimRows.data.length)return false;
 const byId=new Map(parsed.data.map(row=>[row.id,row]));if(byId.size!==parsed.data.length)return false;
 const eligible=new Set(eligibleObservationIds);
 for(const claim of claimRows.data){
  const rows=claim.observationIds.map(id=>byId.get(id));
  if(rows.some(row=>!row||!eligible.has(row.id)||!row.computationEligible||!hasConfirmedLabIdentity(row.marker,{...row,sourceInput:row.sourceInput??undefined})||!labSchema.safeParse({marker:row.marker,value:row.amount,unit:row.unit,measuredAt:row.occurredAt,laboratory:row.laboratory,method:row.method,fasting:row.fasting,referenceLow:null,referenceHigh:null,sourceReport:row.sourceReport??undefined,dateCorrection:row.dateCorrection??undefined}).success))return false;
  const first=rows[0]!;let computed=first.amount;
  if(claim.operation==='recorded-difference'){
   const second=rows[1]!;if(first.marker!==second.marker)return false;
   const points=[first,second].map(row=>({...row,sourceInput:row.sourceInput??undefined,sourceReport:row.sourceReport??undefined,dateCorrection:row.dateCorrection??undefined,date:row.occurredAt,value:row.amount}));
   if(!assessLabComparability(first.marker,points).comparable||latestRecordedLabContext(points).point?.id!==second.id)return false;
   const difference=recordedLabDifference(points);if(difference===null)return false;computed=difference;
  }
  if(claim.unit!==first.unit)return false;
  // Floating arithmetic only: never an assay tolerance or permission to round
  // away a discrepancy. Compare only in the original source unit.
  const tolerance=Number.EPSILON*16*Math.max(Number.MIN_VALUE,Math.abs(computed),Math.abs(claim.value));
  if(!Number.isFinite(computed)||(claim.operation==='source-value'&&claim.value!==computed)||(computed===0)!==(claim.value===0)||Math.abs(claim.value-computed)>tolerance)return false;
 }
 return true;
}
