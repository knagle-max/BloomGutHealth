import {labDisplaySequence,labDisplayTimestamp,type LabSegmentObservation} from './lab-display-segments';
import {sourceReferenceIntervalForPlot,type PlotReferenceInterval} from './lab-reference-interval';
import type {PublishedMatch} from './lab-provider-ranges';
type Point=LabSegmentObservation&{referenceLow?:number|null;referenceHigh?:number|null};
type Bounds={low:number|null;high:number|null;unit:string};
export type ReferenceHistory<R extends Bounds>={scope:'full-history'|'periods'|'selected-only';shared:R|null;periods:Array<{sourceIds:string[];from:string;to:string;interval:R}>;reason:string};
const known=(value:string)=>!!value.trim()&&!/^(unknown|not supplied|not reported|not recorded|unspecified|not-specified)$/i.test(value.trim());
const sourceContext=(point:Point,marker:string)=>known(point.laboratory)&&known(point.method)&&(!['glucose','triglycerides'].includes(marker)||point.fasting!=='unknown')?JSON.stringify([point.laboratory,point.method,point.fasting,point.unit]):null;
/** Applicability is established separately for each observation. Matching report
 * IDs/dates are not required when every original report supplies the same bound.
 * Chronological periods never cross an unsupported or unordered occurrence. */
function history<R extends Bounds>(marker:string,points:readonly Point[],evidence:(point:Point)=>{interval:R;signature:string}|null):ReferenceHistory<R>{
 const fallback:ReferenceHistory<R>={scope:'selected-only',shared:null,periods:[],reason:'History does not establish one applicable interval for every observation.'};
 const display=labDisplaySequence(marker,points),eligible=new Set(display.plottable.map(point=>point.id));
 const rows=display.points.map(point=>{const supplied=eligible.has(point.id)?evidence(point):null,item=supplied?.interval.unit===point.unit?supplied:null,context=sourceContext(point,marker);return{point,item,key:item&&context?context+':'+item.signature:null};});
 if(rows.length===1&&rows[0].item)return{scope:'full-history',shared:rows[0].item.interval,periods:[],reason:'The interval belongs to the single displayed source observation.'};
 if(rows.length>1&&rows[0].key&&rows.every(row=>row.key===rows[0].key))return{scope:'full-history',shared:rows[0].item!.interval,periods:[],reason:'Every displayed source independently supports this exact interval and matching laboratory, assay/method, fasting and canonical unit context.'};
 if(rows.some(row=>labDisplayTimestamp(row.point.date)===null))return fallback;
 const timestamps=new Map<number,number>(),days=new Map<string,{count:number;unordered:boolean}>();
 for(const {point}of rows){const time=labDisplayTimestamp(point.date)!;timestamps.set(time,(timestamps.get(time)||0)+1);const source=point.dateCorrection||point.sourceReport;if(source?.enteredDate){const day=days.get(source.enteredDate)||{count:0,unordered:false};day.count++;day.unordered||=!source.enteredTime;days.set(source.enteredDate,day);}}
 const periods:ReferenceHistory<R>['periods']=[];let group:typeof rows=[];
 const flush=()=>{if(group.length>1&&Date.parse(group.at(-1)!.point.date)>Date.parse(group[0].point.date))periods.push({sourceIds:group.map(row=>row.point.id),from:group[0].point.date,to:group.at(-1)!.point.date,interval:group[0].item!.interval});group=[];};
 for(const row of rows){const source=row.point.dateCorrection||row.point.sourceReport,time=labDisplayTimestamp(row.point.date)!,day=source?.enteredDate?days.get(source.enteredDate):undefined;
  if(!row.key||!source?.enteredDate||(timestamps.get(time)||0)>1||day&&day.count>1&&day.unordered){flush();continue;}
  if(group.length&&row.key!==group[0].key)flush();group.push(row);
 }flush();
 return periods.length?{...fallback,scope:'periods',periods,reason:'Intervals are shown only between consecutive source samples supporting each matching reference regime; gaps remain uncovered.'}:fallback;
}
export function originalReferenceHistory(marker:string,points:readonly Point[],correctedSourceIds:ReadonlySet<string>=new Set()):ReferenceHistory<PlotReferenceInterval>{
 return history(marker,points,point=>{const interval=correctedSourceIds.has(point.id)?null:sourceReferenceIntervalForPlot(marker,point);return interval?{interval,signature:JSON.stringify([interval.low,interval.high,interval.unit,interval.lowInclusive??null,interval.highInclusive??null])}:null;});
}
/** A profile/category match or a provisional publication is not historical
 * source proof. Each reviewed match must retain its own source/version checks. */
export function publishedReferenceHistory(marker:string,points:readonly Point[],matches:ReadonlyMap<string,{match:PublishedMatch;sourceReviewed:boolean}>):ReferenceHistory<PublishedMatch>{
 return history(marker,points,point=>{const value=matches.get(point.id),range=value?.match.range;
  if(!value?.sourceReviewed||!range||range.markerId!==marker||range.kind!=='reference_interval'||range.availability==='provisional'||range.scientificReviewStatus!=='verified'||range.rightsStatus!=='verified-for-display'||!range.rightsSourceUrl)return null;
  return{interval:value.match,signature:JSON.stringify([range.id,range.provider,range.province,range.sourceDocumentDate,range.sourceVersion??null,value.match.low,value.match.high,value.match.unit,range.lowInclusive??null,range.highInclusive??null])};
 });
}
