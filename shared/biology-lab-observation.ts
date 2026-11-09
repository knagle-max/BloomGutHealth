import {hasConfirmedLabIdentity} from "./lab-assay-identity";
/** Editorial framing uses only source-native units/bounds, never a clinical target. */
export type EditorialLabObservation={sourceValue:number;sourceUnit:string;referenceLow?:number|null;referenceHigh?:number|null;method?:string;sourceInput?:{text:string};unitReview?:{status:string}};
export function sourceIntervalPosition(point:EditorialLabObservation|undefined):'above'|'below'|'within'|'unknown'{
 if(!point||!Number.isFinite(point.sourceValue)||point.sourceValue<0||!point.sourceUnit.trim())return'unknown';
 const{referenceLow:low,referenceHigh:high,sourceValue:value}=point;
 if((low!=null&&(!Number.isFinite(low)||low<0))||(high!=null&&(!Number.isFinite(high)||high<0))||(low!=null&&high!=null&&low>=high))return'unknown';
 if(low!=null&&value<low)return'below';if(high!=null&&value>high)return'above';
 return low!=null&&high!=null?'within':'unknown';
}

/** Source-native editorial comparison, restricted to the supported unit/analyte. */
export function supportedSourceIntervalPosition(marker:string,units:readonly string[],point:EditorialLabObservation|undefined){
 if(!point||!units.includes(point.sourceUnit)||point.unitReview?.status==='pending'||!hasConfirmedLabIdentity(marker,point))return 'unknown' as const;
 return sourceIntervalPosition(point);
}
