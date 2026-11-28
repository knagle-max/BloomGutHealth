import {hasConfirmedLabIdentity} from './lab-assay-identity';

export type LabComparabilityPoint={
 date:string;value:number;unit:string;laboratory:string;method:string;
 fasting:'yes'|'no'|'unknown';sourceInput?:{text:string};
};
export const labComparabilityReasons={
 'insufficient-results':'At least two recorded results are needed.',
 'assay-identity':'The analyte or assay identity needs confirmation from the source.',
 'invalid-observation':'A recorded value, unit or date is unavailable or invalid.',
 'duplicate-time':'Two results share a recorded timestamp; their order is not established.',
 'laboratory-unknown':'The laboratory is not recorded for every result.',
 'laboratory-changed':'The recorded laboratory differs between results.',
 'method-unknown':'The method is not recorded for every result.',
 'method-changed':'The recorded method differs between results.',
 'units-differ':'The recorded units cannot be compared in one canonical unit.',
 'fasting-changed':'The recorded fasting context differs between results.',
 'fasting-unknown':'Fasting context is needed for this comparison and is not recorded.',
} as const;
export type LabComparabilityReason=keyof typeof labComparabilityReasons;
const known=(value:string)=>!!value.trim()&&!/^(unknown|not supplied)$/i.test(value.trim());

/** Source-context assessment only, shared by chart and report-level readers.
 * Compatible records do not establish clinical significance or causality.
 * No source values, dates, units, or missing context are repaired here. */
export function assessLabComparability(marker:string,points:readonly LabComparabilityPoint[]){
 const reasons:LabComparabilityReason[]=[],first=points[0];
 if(points.length<2)reasons.push('insufficient-results');
 if(points.some(point=>!hasConfirmedLabIdentity(marker,point)))reasons.push('assay-identity');
 if(points.some(point=>!Number.isFinite(point.value)||!Number.isFinite(Date.parse(point.date))||!point.unit.trim()))reasons.push('invalid-observation');
 if(new Set(points.map(point=>Date.parse(point.date))).size!==points.length)reasons.push('duplicate-time');
 if(points.some(point=>!known(point.laboratory)))reasons.push('laboratory-unknown');
 if(first&&points.some(point=>point.laboratory!==first.laboratory))reasons.push('laboratory-changed');
 if(points.some(point=>!known(point.method)))reasons.push('method-unknown');
 if(first&&points.some(point=>point.method!==first.method))reasons.push('method-changed');
 if(first&&points.some(point=>point.unit!==first.unit))reasons.push('units-differ');
 if(first&&points.some(point=>point.fasting!==first.fasting))reasons.push('fasting-changed');
 if(['glucose','triglycerides'].includes(marker)&&points.some(point=>point.fasting==='unknown'))reasons.push('fasting-unknown');
 return{comparable:reasons.length===0,reasons};
}
