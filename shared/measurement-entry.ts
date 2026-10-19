export type HeightEntryUnit = "cm" | "m" | "ft-in";
export type MassEntryUnit = "kg" | "lb";
export type HeightEntry = { unit: HeightEntryUnit; primary: string; inches: string };
export type MassEntry = { unit: MassEntryUnit; value: string };
export type ParseResult = { kind: "empty" } | { kind: "incomplete" } | { kind: "invalid"; reason: string } | { kind: "valid"; canonical: number };
const decimal = /^(?:\d+(?:\.\d*)?|\.\d+)$/;
function numberDraft(raw:string):number | "empty" | "incomplete" | "invalid" {
 const s=raw.trim();
 if(!s)return "empty";
 if(s==="."||s==="-"||s.endsWith("."))return "incomplete";
 return decimal.test(s)?Number(s):"invalid";
}
export function parseMassEntry(entry:MassEntry):ParseResult {
 const value=numberDraft(entry.value);
 if(typeof value!=="number")return value==="invalid"?{kind:"invalid",reason:"Enter a positive number"}:{kind:value};
 const kg=entry.unit==="lb"?value/2.2046226218487757:value;
 return kg>0&&kg<=500?{kind:"valid",canonical:kg}:{kind:"invalid",reason:"Weight is outside the supported range"};
}
export function parseHeightEntry(entry:HeightEntry):ParseResult {
 const primary=numberDraft(entry.primary);
 if(typeof primary!=="number")return primary==="invalid"?{kind:"invalid",reason:"Enter a valid height"}:{kind:primary};
 let cm=primary;
 if(entry.unit==="m")cm=primary*100;
 if(entry.unit==="ft-in"){
  const inches=numberDraft(entry.inches);
  if(inches==="invalid")return {kind:"invalid",reason:"Enter valid inches"};
  if(inches==="incomplete")return {kind:"incomplete"};
  const withinFoot=inches==="empty"?0:inches;
  if(!Number.isInteger(primary)||primary<0||withinFoot<0||withinFoot>=12)return {kind:"invalid",reason:"Use whole feet and 0–11.999 inches"};
  cm=(primary*12+withinFoot)*2.54;
 }
 return cm>0&&cm<=250?{kind:"valid",canonical:cm}:{kind:"invalid",reason:"Height is outside the supported range"};
}
export function formatHeightEntry(cm:number|null,unit:HeightEntryUnit):HeightEntry {
 if(cm===null)return {unit,primary:"",inches:""};
 if(!Number.isFinite(cm)||cm<=0)throw Error("Invalid canonical height");
 if(unit==="cm")return {unit,primary:String(Number(cm.toFixed(4))),inches:""};
 if(unit==="m")return {unit,primary:String(Number((cm/100).toFixed(6))),inches:""};
 const total=cm/2.54,feet=Math.floor(total/12);
 return {unit,primary:String(feet),inches:String(Number((total-feet*12).toFixed(5)))};
}
export function formatMassEntry(kg:number|null,unit:MassEntryUnit):MassEntry {
 if(kg===null)return {unit,value:""};
 if(!Number.isFinite(kg)||kg<=0)throw Error("Invalid canonical mass");
 return {unit,value:String(Number((unit==="lb"?kg*2.2046226218487757:kg).toFixed(5)))};
}
export function switchHeightUnit(entry:HeightEntry,target:HeightEntryUnit):HeightEntry|ParseResult {
 const parsed=parseHeightEntry(entry);
 return parsed.kind==="valid"?formatHeightEntry(parsed.canonical,target):parsed.kind==="empty"?formatHeightEntry(null,target):parsed;
}
export function switchMassUnit(entry:MassEntry,target:MassEntryUnit):MassEntry|ParseResult {
 const parsed=parseMassEntry(entry);
 return parsed.kind==="valid"?formatMassEntry(parsed.canonical,target):parsed.kind==="empty"?formatMassEntry(null,target):parsed;
}
