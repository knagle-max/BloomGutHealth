import {athleteReferenceEntrySourceSchema,sessionEntrySourceSchema,hydrationEntrySourceSchema,athleteEntrySourceMatches,type AthleteReferenceEntrySource,type SessionEntrySource,type HydrationEntrySource,type AthleteEntrySource} from "./athlete-entry-source";
import type {MassEntry} from "./measurement-entry";
type Raw={value:string;unit:string};
/** Keep only original fields still bound to current values; never rebuild origins. */
function retained(source:AthleteEntrySource|undefined,values:object):Record<string,Raw>{
 const fields:Record<string,Raw>={};if(!source)return fields;
 for(const[key,input]of Object.entries(source.fields))if(input&&athleteEntrySourceMatches({...source,fields:{[key]:input}}as AthleteEntrySource,values))fields[key]={...input};
 return fields;
}
function matching<T extends AthleteEntrySource>(source:T,values:object):T{if(!athleteEntrySourceMatches(source,values))throw Error("Original entries do not match current values");return source;}
export function captureAthleteReferenceSource(previous:AthleteReferenceEntrySource|undefined,values:{weightKg:number|null;energyKcal:number|null},mass:Pick<MassEntry,"unit"|"value">|null,energy:Raw|undefined,profileCopy=false):AthleteReferenceEntrySource|undefined{
 const fields=retained(previous,values);
 if(profileCopy)delete fields.weightKg;
 else if(mass)fields.weightKg={...mass};
 if(energy&&energy.value!=="")fields.energyKcal={...energy};
 return Object.keys(fields).length?matching(athleteReferenceEntrySourceSchema.parse({version:1,capture:"athlete-reference",fields}),values):undefined;
}
export function captureSessionEntrySource(previous:SessionEntrySource|undefined,fluidMl:number|null,original?:Raw):SessionEntrySource|undefined{
 const values={fluidMl},fields=retained(previous,values);
 if(original&&original.value!=="")fields.fluidMl={...original};
 return Object.keys(fields).length?matching(sessionEntrySourceSchema.parse({version:1,capture:"manual-session",fields}),values):undefined;
}
export function captureHydrationEntrySource(values:{preKg:number;postKg:number;drankMl:number;urineMl:number},inputs:Partial<Record<"preKg"|"postKg"|"drankMl"|"urineMl",Raw>>):HydrationEntrySource|undefined{
 const fields=Object.fromEntries(Object.entries(inputs).filter(([,input])=>input&&input.value!==""));
 return Object.keys(fields).length?matching(hydrationEntrySourceSchema.parse({version:1,capture:"manual-hydration",fields}),values):undefined;
}
/** Server-side compatibility: unaware editors retain unchanged source fields only. */
export function mergeAthleteEntrySource(previous:AthleteEntrySource|undefined,proposed:AthleteEntrySource|undefined,values:object,profileCopy=false):AthleteEntrySource|undefined{
 const capture=proposed?.capture??previous?.capture;if(!capture)return undefined;
 const fields=retained(previous,values);if(profileCopy)delete fields.weightKg;
 Object.assign(fields,proposed?.fields??{});
 if(!Object.keys(fields).length)return undefined;
 const schema=capture==="athlete-reference"?athleteReferenceEntrySourceSchema:capture==="manual-session"?sessionEntrySourceSchema:hydrationEntrySourceSchema;
 return matching(schema.parse({version:1,capture,fields}),values);
}
