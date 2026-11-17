import {z} from 'zod';
import {assessLabComparability,labComparabilityReasons,type LabComparabilityPoint} from './lab-comparability';
import {hasConfirmedLabIdentity} from './lab-assay-identity';
import {canonicalLab,markerDefinitions,type Lab} from './precision-nutrition';

export type LabSegmentObservation=LabComparabilityPoint&{
 id:string;sourceValue:number;sourceUnit:string;sourceInput?:Lab['sourceInput'];
 sourceReport?:{enteredDate?:string;enteredTime?:string|null};dateCorrection?:{enteredDate:string;enteredTime?:string|null};
 unitReview?:{status:string};sourceState?:'active'|'superseded'|'withdrawn';supersededIds?:readonly string[];
};
export const labSegmentReasons={...labComparabilityReasons,
 'unverified-conversion':'The original value and unit do not establish this plotted numeric unit.',
 'inactive-source':'A source observation is not active.',
 'unordered-occurrence':'These occurrences have no established order within their recorded collection day.',
 'sequence-date-unknown':'An observation has no valid timestamp, so chronological adjacency cannot be established.',
 'unclassified-comparability':'The source comparison has an unsupported or unclassified condition.',
} as const;
export type LabSegmentReason=keyof typeof labSegmentReasons;
export type LabSegmentStyle='solid'|'dashed'|'disconnected';
const timestamp=z.iso.datetime({offset:true});
export function labDisplayTimestamp(value:string):number|null{if(!timestamp.safeParse(value).success)return null;const time=Date.parse(value);return Number.isFinite(time)?time:null;}
const nonfatal=new Set<string>(['laboratory-unknown','laboratory-changed','method-unknown','method-changed','fasting-unknown','fasting-changed']);
/** Unknown future reasons always disconnect. Drawing a line never changes
 * the authoritative scientific comparison or enables a numerical response. */
export function labSegmentStyleForAssessment(assessment:{comparable:boolean;reasons:readonly string[]}):LabSegmentStyle{
 if(assessment.comparable&&assessment.reasons.length===0)return'solid';
 return !assessment.comparable&&assessment.reasons.length>0&&assessment.reasons.every(reason=>nonfatal.has(reason))?'dashed':'disconnected';
}
export function labDisplayPointIssues(marker:string,point:LabSegmentObservation):LabSegmentReason[]{
 if(!point||typeof point.id!=='string'||!point.id||typeof point.laboratory!=='string'||typeof point.method!=='string'||!['yes','no','unknown'].includes(point.fasting)||!Number.isFinite(point.value)||point.value<0||!Number.isFinite(point.sourceValue)||point.sourceValue<0||labDisplayTimestamp(point.date)===null)return['invalid-observation'];
 if(point.sourceState!==undefined&&point.sourceState!=='active')return['inactive-source'];
 if(!hasConfirmedLabIdentity(marker,point))return['assay-identity'];
 const definition=markerDefinitions.find(row=>row.id===marker);
 if(!definition||point.unitReview?.status==='pending'||!(definition.units as readonly string[]).includes(point.sourceUnit))return['unverified-conversion'];
 try{
  const converted=canonicalLab({marker:definition.id,value:point.sourceValue,unit:point.sourceUnit,method:point.method,sourceInput:point.sourceInput});
  if(!Number.isFinite(converted.value)||converted.unit!==point.unit||converted.value===0&&point.value!==0||Math.abs(converted.value-point.value)>Math.max(1,Math.abs(converted.value),Math.abs(point.value))*Number.EPSILON*32)return['unverified-conversion'];
 }catch{return['unverified-conversion'];}
 return[];
}
export function classifyLabDisplayPair(marker:string,left:LabSegmentObservation,right:LabSegmentObservation):{style:LabSegmentStyle;reasons:LabSegmentReason[]}{
 const invalid=[...labDisplayPointIssues(marker,left),...labDisplayPointIssues(marker,right)];
 if(invalid.length)return{style:'disconnected',reasons:Array.from(new Set(invalid))};
 if(Date.parse(right.date)<=Date.parse(left.date))return{style:'disconnected',reasons:['duplicate-time']};
 const a=left.dateCorrection||left.sourceReport,b=right.dateCorrection||right.sourceReport;
 if(a?.enteredDate&&a.enteredDate===b?.enteredDate&&(!a.enteredTime||!b.enteredTime))return{style:'disconnected',reasons:['unordered-occurrence']};
 const assessment=assessLabComparability(marker,[left,right]),style=labSegmentStyleForAssessment(assessment);
 return{style,reasons:assessment.reasons.map(reason=>Object.prototype.hasOwnProperty.call(labSegmentReasons,reason)?reason:'unclassified-comparability')};
}
/** A sorted working copy only; source objects/array order are untouched.
 * Invalid/inactive occurrences are retained as barriers, never skipped to
 * bridge two eligible neighbors. Unknown timestamps cannot be located safely. */
export function labDisplaySequence<T extends LabSegmentObservation>(marker:string,input:readonly T[]){
 const superseded=new Set(input.flatMap(point=>point.supersededIds||[])),times=new Map<number,number>(),days=new Map<string,{count:number;unknownTime:boolean}>();
 for(const point of input){const time=labDisplayTimestamp(point.date);if(time!==null)times.set(time,(times.get(time)||0)+1);const source=point.dateCorrection||point.sourceReport;if(source?.enteredDate){const day=days.get(source.enteredDate)||{count:0,unknownTime:false};day.count++;day.unknownTime||=!source.enteredTime;days.set(source.enteredDate,day);}}
 const points=input.map((point,index)=>{const checked=superseded.has(point.id)?{...point,sourceState:'superseded' as const}:point;return{point,checked,index,time:labDisplayTimestamp(point.date)??NaN,issues:labDisplayPointIssues(marker,checked)};}).sort((a,b)=>{
  if(Number.isFinite(a.time)&&Number.isFinite(b.time)&&a.time!==b.time)return a.time-b.time;
  if(Number.isFinite(a.time)!==Number.isFinite(b.time))return Number.isFinite(a.time)?-1:1;
  return a.point.id===b.point.id?a.index-b.index:a.point.id<b.point.id?-1:1;
 });
 const unknownTime=points.some(point=>!Number.isFinite(point.time)),unit=points.find(point=>!point.issues.length)?.point.unit??input[0]?.unit??'';
 const plottable=points.filter(point=>!point.issues.length&&point.point.unit===unit);
 const segments=points.slice(1).map((right,index)=>{
  const left=points[index],sources=[left,right].map(row=>row.point.dateCorrection||row.point.sourceReport),duplicate=[left,right].some(row=>(times.get(row.time)||0)>1),unordered=sources.some(source=>source?.enteredDate&&days.get(source.enteredDate)!.count>1&&days.get(source.enteredDate)!.unknownTime);
  const decision=unknownTime?{style:'disconnected' as const,reasons:['sequence-date-unknown']as LabSegmentReason[]}:duplicate?{style:'disconnected' as const,reasons:['duplicate-time']as LabSegmentReason[]}:unordered?{style:'disconnected' as const,reasons:['unordered-occurrence']as LabSegmentReason[]}:classifyLabDisplayPair(marker,left.checked,right.checked);
  return{left:left.point,right:right.point,...decision};
 });
 return{points:points.map(row=>row.point),plottable:plottable.map(row=>row.point),unit,segments};
}
