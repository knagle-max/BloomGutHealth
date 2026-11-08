/** Editorial framing uses only source-native units/bounds, never a clinical target. */
export type EditorialLabObservation={sourceValue:number;sourceUnit:string;referenceLow?:number|null;referenceHigh?:number|null;method?:string};
export function sourceIntervalPosition(point:EditorialLabObservation|undefined):'above'|'below'|'within'|'unknown'{
 if(!point||!Number.isFinite(point.sourceValue)||!point.sourceUnit.trim())return'unknown';
 const{referenceLow:low,referenceHigh:high,sourceValue:value}=point;
 if((low!=null&&!Number.isFinite(low))||(high!=null&&!Number.isFinite(high))||(low!=null&&high!=null&&low>high))return'unknown';
 if(low!=null&&value<low)return'below';if(high!=null&&value>high)return'above';
 return low!=null&&high!=null?'within':'unknown';
}
