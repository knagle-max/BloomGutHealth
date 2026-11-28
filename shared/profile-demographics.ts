import {z} from 'zod';
export const birthYearSchema=z.number().int().min(1900).max(2200);
/** Calendar-year age, not a claim that the birthday has already occurred. */
export function ageInYear(birthYear:unknown,year:number):number|null{
 const parsed=birthYearSchema.safeParse(birthYear);if(!parsed.success||!Number.isInteger(year))return null;
 const age=year-parsed.data;return age>=0&&age<=130?age:null;
}
export function labProfileDemographics(profile:{birthYear?:unknown;age?:unknown;sex?:unknown}|null|undefined,collectedOn:string,recordedAt:string){
 const collectionDateKnown=z.iso.date().safeParse(collectedOn).success;
 const sourceYear=collectionDateKnown?Number(collectedOn.slice(0,4)):z.iso.datetime({offset:true}).safeParse(recordedAt).success?Number(recordedAt.slice(0,4)):NaN;
 const hasBirthYear=birthYearSchema.safeParse(profile?.birthYear).success,yearAge=ageInYear(profile?.birthYear,sourceYear);
 return{ageAtCollection:hasBirthYear?yearAge:null,sexReferenceCategory:profile?.sex==='male'?'M' as const:profile?.sex==='female'?'F' as const:null,
 ageBasis:yearAge!==null?(collectionDateKnown?'birth-year-collection':'birth-year-recorded')as 'birth-year-collection'|'birth-year-recorded':'unknown' as const,year:Number.isFinite(sourceYear)?sourceYear:null};
}
