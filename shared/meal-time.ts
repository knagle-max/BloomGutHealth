/** Timestamp provenance is optional for old meals; never infer a historical zone. */
export function recognizedMealTimeZone(value:unknown):value is string {
 if(typeof value!=='string'||!value.length||value.length>100)return false;
 try{new Intl.DateTimeFormat('en',{timeZone:value});return true;}catch{return false;}
}
export function currentMealTimeZone():string|null {
 try{const zone=Intl.DateTimeFormat().resolvedOptions().timeZone;return recognizedMealTimeZone(zone)?zone:null;}catch{return null;}
}
/** Unaware corrections retain the source zone only while the recorded instant stays unchanged. */
export function preserveMealTimeZone<T extends {eatenAt?:string;timeZone?:string|null}>(previous:unknown,next:T,loggedAt:Date|string):T & {timeZone?:string|null}{
 if('timeZone' in next||!previous||typeof previous!=='object')return next;
 const zone=(previous as {timeZone?:unknown}).timeZone;
 if(!recognizedMealTimeZone(zone))return next;
 if(next.eatenAt&&+new Date(next.eatenAt)!==+new Date(loggedAt))return next;
 return {...next,timeZone:zone};
}
export function recordedMealTime(loggedAt:Date|string,context:unknown):string|null {
 const zone=context&&typeof context==='object'?(context as {timeZone?:unknown}).timeZone:undefined;
 if(!recognizedMealTimeZone(zone)||!Number.isFinite(+new Date(loggedAt)))return null;
 return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short',timeZone:zone}).format(new Date(loggedAt))+` (${zone})`;
}
