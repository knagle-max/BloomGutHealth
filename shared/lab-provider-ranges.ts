import {formatRecordedLabNumber} from './lab-history';
import {z} from 'zod';
import {canonicalLab,markerDefinitions,type Lab} from './precision-nutrition';
import {hasConfirmedLabIdentity} from './lab-assay-identity';
export const labRangeSchema=z.object({
 id:z.string().min(1),label:z.string().min(1).max(200).optional(),provider:z.string().min(1),province:z.string().min(1),markerId:z.string().min(1),specimen:z.string().min(1),assay:z.string().min(1).optional(),method:z.string().min(1).optional(),
 ageMinYears:z.number().finite().nonnegative().optional(),ageMaxYears:z.number().finite().nonnegative().optional(),ageMinInclusive:z.boolean().default(true),ageMaxInclusive:z.boolean().default(true),sexReferenceCategory:z.enum(['M','F','all']),fasting:z.enum(['yes','no','either']),
 effectiveFrom:z.iso.date(),effectiveTo:z.iso.date().optional(),kind:z.enum(['reference_interval','clinical_decision_limit','risk_threshold']),
 low:z.number().finite().nonnegative().optional(),lowInclusive:z.boolean().optional(),high:z.number().finite().nonnegative().optional(),highInclusive:z.boolean().optional(),unit:z.string().min(1),
 sourceUrl:z.url().refine(value=>new URL(value).protocol==='https:'),sourceDocumentDate:z.iso.date(),page:z.number().int().positive().optional(),scientificReviewStatus:z.enum(['verified','pending']),
}).strict().superRefine((range,ctx)=>{
 if(range.low===undefined&&range.high===undefined||range.low!==undefined&&range.high!==undefined&&range.low>=range.high)ctx.addIssue({code:'custom',message:'Keep explicit, ordered reference bounds.'});
 if(range.effectiveTo&&range.effectiveTo<range.effectiveFrom)ctx.addIssue({code:'custom',message:'Invalid effective interval.'});
 if(range.ageMinYears!==undefined&&range.ageMaxYears!==undefined&&range.ageMinYears>range.ageMaxYears)ctx.addIssue({code:'custom',message:'Invalid collection age interval.'});
});
export type LabRange=z.infer<typeof labRangeSchema>;
export type ProviderRangeContext={provider:string;province:string;markerId:string;specimen:string;assay:string;method:string;ageAtCollection:number|null;sexReferenceCategory:'M'|'F'|null;fasting:'yes'|'no'|'unknown';collectedOn:string;sourceUnit:string;plotUnit:string;sourceInput?:Lab['sourceInput'];unitReview?:{status:string}};
const key=(value:string)=>value.trim().toLowerCase(),known=(value:string)=>!!value.trim()&&!/^(unknown|not supplied|not-specified)$/i.test(value.trim());
/** Independently verified, exact applicability only. Current profile age/sex,
 * specimen identifiers and values cannot fill unknown collection context. */
export function matchProviderRanges(input:ProviderRangeContext,ranges:readonly unknown[]){
 const definition=markerDefinitions.find(marker=>marker.id===input.markerId);
 if(!definition||!known(input.provider)||!known(input.province)||!known(input.specimen)||!known(input.assay)||!known(input.method)||!z.iso.date().safeParse(input.collectedOn).success||input.ageAtCollection===null||!Number.isFinite(input.ageAtCollection)||input.ageAtCollection<0||input.unitReview?.status==='pending'||!(definition.units as readonly string[]).includes(input.sourceUnit)||!hasConfirmedLabIdentity(input.markerId,input))return[];
 return ranges.flatMap(value=>{
  const parsed=labRangeSchema.safeParse(value);if(!parsed.success)return[];const range=parsed.data;
  if(range.scientificReviewStatus!=='verified'||key(range.provider)!==key(input.provider)||key(range.province)!==key(input.province)||range.markerId!==input.markerId||!known(range.specimen)||key(range.specimen)!==key(input.specimen)||!range.assay||!range.method||key(range.assay)!==key(input.assay)||key(range.method)!==key(input.method)||input.collectedOn<range.effectiveFrom||range.effectiveTo!==undefined&&input.collectedOn>range.effectiveTo||range.sexReferenceCategory!=='all'&&range.sexReferenceCategory!==input.sexReferenceCategory||range.fasting!=='either'&&range.fasting!==input.fasting)return[];
  const age=input.ageAtCollection!;
  if(range.ageMinYears!==undefined&&(age<range.ageMinYears||age===range.ageMinYears&&!range.ageMinInclusive)||range.ageMaxYears!==undefined&&(age>range.ageMaxYears||age===range.ageMaxYears&&!range.ageMaxInclusive)||!(definition.units as readonly string[]).includes(range.unit))return[];
  const convert=(value:number|undefined)=>value===undefined?null:canonicalLab({marker:definition.id,value,unit:range.unit,method:input.method,sourceInput:input.sourceInput});
  const low=convert(range.low),high=convert(range.high);
  if([low,high].some(bound=>bound&&(!Number.isFinite(bound.value)||bound.unit!==input.plotUnit)))return[];
  return[{range,low:low?.value??null,high:high?.value??null,unit:input.plotUnit}];
 });
}
/** No provider entry has independent verification in this repository yet.
 * Owner-supplied examples are source leads, never active normal intervals. */
export const publishedLabRanges:readonly LabRange[]=[];
export const providerRangeSourceLeads=[
 {provider:'LifeLabs',province:'BC',date:'2025-09-02',url:'https://lifelabs.azureedge.net/lifelabs-wp-cdn/2025/10/BC_Ranges_Sep25-6798eab0dfdde.pdf',status:'pending',kind:'reference_interval'},
 {provider:'LifeLabs',province:'ON',date:'2024-07-08',url:'https://lifelabs.azureedge.net/lifelabs-wp-cdn/2024/06/UPDATED-REPORTING-OF-VITAMIN-B12.pdf',status:'pending',kind:'clinical_decision_limit'},
 {provider:'LifeLabs',province:'ON',date:'2024-09-09',url:'https://www.lifelabs.com/notification/update-to-reporting-of-ferritin-in-ontario/',status:'pending',kind:'clinical_decision_limit'},
]as const;

export function publishedRangeText(match:{low:number|null;high:number|null;unit:string;range:Pick<LabRange,'lowInclusive'|'highInclusive'>}){
 const {low,high,unit,range}=match;
 if(low!==null&&high!==null)return `${formatRecordedLabNumber(low)}–${formatRecordedLabNumber(high)} ${unit}`;
 if(low!==null)return `${range.lowInclusive===false?'>':range.lowInclusive===true?'≥':'lower limit '}${formatRecordedLabNumber(low)} ${unit}; upper limit not supplied`;
 if(high!==null)return `${range.highInclusive===false?'<':range.highInclusive===true?'≤':'upper limit '}${formatRecordedLabNumber(high)} ${unit}; lower limit not supplied`;
 return 'Reference unavailable';
}
