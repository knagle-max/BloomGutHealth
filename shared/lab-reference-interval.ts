import {labSourceColumns} from './lab-assay-identity';
import {parseSourceReference} from './lab-source-reference';
import {canonicalLab,markerDefinitions,type Lab} from './precision-nutrition';
import {hasConfirmedLabIdentity} from './lab-assay-identity';
import {formatRecordedLabNumber} from './lab-history';
export type ReferencePoint={sourceValue:number;sourceUnit:string;unit:string;referenceLow?:number|null;referenceHigh?:number|null;method?:string;sourceInput?:Lab['sourceInput'];unitReview?:{status:string}};
export type PlotReferenceInterval={low:number|null;high:number|null;unit:string;sourceLow:number|null;sourceHigh:number|null;sourceUnit:string;lowInclusive?:boolean;highInclusive?:boolean};
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
 const raw=point.sourceInput?parseSourceReference(labSourceColumns(point.sourceInput.text)[3]||''):null;
 const operators=raw&&raw.low===low&&raw.high===high?{...(raw.lowInclusive===undefined?{}:{lowInclusive:raw.lowInclusive}),...(raw.highInclusive===undefined?{}:{highInclusive:raw.highInclusive})}:{};
 return{low:lower?.value??null,high:upper?.value??null,unit:point.unit,sourceLow:low,sourceHigh:high,sourceUnit:point.sourceUnit,...operators};
}
export function referenceIntervalText(low:number|null,high:number|null,unit:string,operators:{lowInclusive?:boolean;highInclusive?:boolean}={}){
 return low!==null&&high!==null?`${formatRecordedLabNumber(low)}–${formatRecordedLabNumber(high)} ${unit}`:high!==null?`${operators.highInclusive===false?'<':operators.highInclusive===true?'≤':'upper limit '}${formatRecordedLabNumber(high)} ${unit}; lower limit not supplied`:low!==null?`${operators.lowInclusive===false?'>':operators.lowInclusive===true?'≥':'lower limit '}${formatRecordedLabNumber(low)} ${unit}; upper limit not supplied`:'not supplied';
}
/** A nonnegative axis includes supported source bounds as well as real points.
 * Cap arithmetic at finite representable values; no interval becomes a data point. */
export function labPlotExtent(values:readonly number[],ranges:readonly (PlotReferenceInterval|null)[]){
 const data=[...values,...ranges.flatMap(r=>r?[r.low,r.high].filter((n):n is number=>n!==null):[])].filter(n=>Number.isFinite(n)&&n>=0);
 const lo=data.length?Math.min(...data):0,hi=data.length?Math.max(...data):0;
 const pad=Math.max((hi-lo)*.15,hi*.05,.01);
 return{min:Math.max(0,lo-pad),max:Math.min(Number.MAX_VALUE,hi+pad)};
}
/** Identical numbers alone do not establish applicability across laboratories. */
export function canShareSourceReference(points:readonly {laboratory:string;method:string;fasting?:string;sourceUnit:string}[],ranges:readonly (PlotReferenceInterval|null)[]){
 const first=points[0],range=ranges[0],known=(value:string)=>!!value.trim()&&!/^(unknown|not supplied)$/i.test(value.trim());
 return !!first&&!!range&&(points.length===1||known(first.laboratory)&&known(first.method))&&points.every((point,index)=>point.laboratory===first.laboratory&&point.method===first.method&&point.fasting===first.fasting&&point.sourceUnit===first.sourceUnit&&!!ranges[index]&&ranges[index]!.low===range.low&&ranges[index]!.high===range.high&&ranges[index]!.unit===range.unit&&ranges[index]!.lowInclusive===range.lowInclusive&&ranges[index]!.highInclusive===range.highInclusive);
}
