import {canonicalLab,markerDefinitions,type Lab} from './precision-nutrition';
import {hasConfirmedLabIdentity} from './lab-assay-identity';
import {formatRecordedLabNumber} from './lab-history';
export type ReferencePoint={sourceValue:number;sourceUnit:string;unit:string;referenceLow?:number|null;referenceHigh?:number|null;method?:string;sourceInput?:Lab['sourceInput'];unitReview?:{status:string}};
export type PlotReferenceInterval={low:number|null;high:number|null;unit:string;sourceLow:number|null;sourceHigh:number|null;sourceUnit:string};
/** Bounds come only from this observation's report. Reuse the same marker-specific
 * unit conversion as its point; neither population targets nor missing bounds are filled. */
export function sourceReferenceIntervalForPlot(marker:string,point:ReferencePoint):PlotReferenceInterval|null{
 const definition=markerDefinitions.find(d=>d.id===marker);
 if(!definition||!Number.isFinite(point.sourceValue)||point.sourceValue<0||point.unitReview?.status==='pending'||!(definition.units as readonly string[]).includes(point.sourceUnit))return null;
 if(!hasConfirmedLabIdentity(marker,point))return null;
 const low=point.referenceLow??null,high=point.referenceHigh??null;
 if(low===null&&high===null)return null;
 if([low,high].some(v=>v!==null&&(!Number.isFinite(v)||v<0))||(low!==null&&high!==null&&low>=high))return null;
 const convert=(value:number|null)=>value===null?null:canonicalLab({marker:definition.id,value,unit:point.sourceUnit,method:point.method??'',sourceInput:point.sourceInput});
 const lower=convert(low),upper=convert(high);
 if([lower,upper].some(v=>v!==null&&(!Number.isFinite(v.value)||v.value<0||v.unit!==point.unit)))return null;
 return{low:lower?.value??null,high:upper?.value??null,unit:point.unit,sourceLow:low,sourceHigh:high,sourceUnit:point.sourceUnit};
}
export function referenceIntervalText(low:number|null,high:number|null,unit:string){
 return low!==null&&high!==null?`${formatRecordedLabNumber(low)}–${formatRecordedLabNumber(high)} ${unit}`:high!==null?`upper limit ${formatRecordedLabNumber(high)} ${unit}; lower limit not supplied`:low!==null?`lower limit ${formatRecordedLabNumber(low)} ${unit}; upper limit not supplied`:'not supplied';
}
/** A nonnegative axis includes supported source bounds as well as real points.
 * Cap arithmetic at finite representable values; no interval becomes a data point. */
export function labPlotExtent(values:readonly number[],ranges:readonly (PlotReferenceInterval|null)[]){
 const data=[...values,...ranges.flatMap(r=>r?[r.low,r.high].filter((n):n is number=>n!==null):[])].filter(n=>Number.isFinite(n)&&n>=0);
 const lo=data.length?Math.min(...data):0,hi=data.length?Math.max(...data):0;
 const pad=Math.max((hi-lo)*.15,hi*.05,.01);
 return{min:Math.max(0,lo-pad),max:Math.min(Number.MAX_VALUE,hi+pad)};
}
