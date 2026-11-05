export type HeightEntryUnit = "cm" | "m" | "ft-in";
export type MassEntryUnit = "kg" | "lb";
type HeightToken={unit:HeightEntryUnit;primary:string;inches:string};
type MassToken={unit:MassEntryUnit;value:string};
type CircumferenceToken={unit:"cm"|"in";value:string};
type ConversionBasis<T>={canonical:number;rendered:T;original:T|null};
// Transient editor metadata, not a second stored measurement. It preserves exact
// meaning while a rounded display is switched; actual edits invalidate it.
export type HeightEntry=HeightToken&{conversionBasis?:ConversionBasis<HeightToken>};
export type MassEntry=MassToken&{conversionBasis?:ConversionBasis<MassToken>};
export type CircumferenceEntry=CircumferenceToken&{conversionBasis?:ConversionBasis<CircumferenceToken>};
export type ParseResult = { kind: "empty" } | { kind: "incomplete" } | { kind: "invalid"; reason: string } | { kind: "valid"; canonical: number };
const decimal = /^(?:\d+(?:\.\d*)?|\.\d+)$/;
function numberDraft(raw:string):number | "empty" | "incomplete" | "invalid" {
 if(typeof raw!=="string"||raw.length>128||/[\r\n]/.test(raw))return "invalid";
 const s=raw.trim();
 if(!s)return "empty";
 if(s==="."||s==="-"||s.endsWith("."))return "incomplete";
 return decimal.test(s)?Number(s):"invalid";
}
function rawMass(entry:MassToken):ParseResult {
 if(!["kg","lb"].includes(entry.unit))return{kind:"invalid",reason:"Unsupported weight unit"};
 const value=numberDraft(entry.value);
 if(typeof value!=="number")return value==="invalid"?{kind:"invalid",reason:"Enter a positive number"}:{kind:value};
 const kg=entry.unit==="lb"?value/2.2046226218487757:value;
 return kg>0&&kg<=500?{kind:"valid",canonical:kg}:{kind:"invalid",reason:"Weight is outside the supported range"};
}
function rawHeight(entry:HeightToken):ParseResult {
 if(!["cm","m","ft-in"].includes(entry.unit))return{kind:"invalid",reason:"Unsupported height unit"};
 if(typeof entry.primary!=="string"||typeof entry.inches!=="string")return{kind:"invalid",reason:"Enter a valid height"};
 const primary=numberDraft(entry.primary);
 if(primary==="empty"&&entry.unit==="ft-in"&&entry.inches.trim())return {kind:"incomplete"};
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
function entryNumber(value:number,digits:number){const rounded=Number(value.toFixed(digits));return String(rounded===0&&value!==0?value:rounded);}
function heightToken(cm:number,unit:HeightEntryUnit):HeightToken{
 if(unit==="cm")return {unit,primary:entryNumber(cm,4),inches:""};
 if(unit==="m")return {unit,primary:entryNumber(cm/100,6),inches:""};
 const total=cm/2.54;let feet=Math.floor(total/12),inches=entryNumber(total-feet*12,5);
 if(Number(inches)>=12){feet++;inches="0";}
 return {unit,primary:String(feet),inches};
}
function massToken(kg:number,unit:MassEntryUnit):MassToken{return{unit,value:entryNumber(unit==="lb"?kg*2.2046226218487757:kg,5)}};
function waistToken(cm:number,unit:CircumferenceToken["unit"]):CircumferenceToken{return{unit,value:entryNumber(unit==="in"?cm/2.54:cm,5)}};
const sameMass=(a:{unit:string;value:string},b:{unit:string;value:string})=>a.unit===b.unit&&a.value===b.value;
const sameHeight=(a:HeightToken,b:HeightToken)=>a.unit===b.unit&&a.primary===b.primary&&a.inches===b.inches;
function originalMatches<T>(original:T|null,canonical:number,parse:(value:T)=>ParseResult){if(original===null)return true;if(!original||typeof original!=="object")return false;const result=parse(original);return result.kind==="valid"&&result.canonical===canonical;}
function massBasis(entry:MassEntry){const b=entry.conversionBasis;return b&&b.rendered&&["kg","lb"].includes(entry.unit)&&Number.isFinite(b.canonical)&&b.canonical>0&&b.canonical<=500&&sameMass(entry,b.rendered)&&sameMass(entry,massToken(b.canonical,entry.unit))&&originalMatches(b.original,b.canonical,rawMass)?b:null;}
function heightBasis(entry:HeightEntry){const b=entry.conversionBasis;return b&&b.rendered&&["cm","m","ft-in"].includes(entry.unit)&&Number.isFinite(b.canonical)&&b.canonical>0&&b.canonical<=250&&sameHeight(entry,b.rendered)&&sameHeight(entry,heightToken(b.canonical,entry.unit))&&originalMatches(b.original,b.canonical,rawHeight)?b:null;}
function waistBasis(entry:CircumferenceEntry){const b=entry.conversionBasis;return b&&b.rendered&&["cm","in"].includes(entry.unit)&&Number.isFinite(b.canonical)&&b.canonical>0&&b.canonical<=300&&sameMass(entry,b.rendered)&&sameMass(entry,waistToken(b.canonical,entry.unit))&&originalMatches(b.original,b.canonical,rawWaist)?b:null;}
export function parseMassEntry(entry:MassEntry):ParseResult{const b=massBasis(entry);return b?{kind:"valid",canonical:b.canonical}:rawMass(entry);}
export function parseHeightEntry(entry:HeightEntry):ParseResult{const b=heightBasis(entry);return b?{kind:"valid",canonical:b.canonical}:rawHeight(entry);}
export function parseCircumferenceEntry(entry:CircumferenceEntry):ParseResult{const b=waistBasis(entry);return b?{kind:"valid",canonical:b.canonical}:rawWaist(entry);}
export function originalMassEntry(entry:MassEntry):MassToken|null{const b=massBasis(entry);return b?(b.original?{...b.original}:null):rawMass(entry).kind==="valid"?{unit:entry.unit,value:entry.value}:null;}
export function originalHeightEntry(entry:HeightEntry):HeightToken|null{const b=heightBasis(entry);return b?(b.original?{...b.original}:null):rawHeight(entry).kind==="valid"?{unit:entry.unit,primary:entry.primary,inches:entry.inches}:null;}
export function originalCircumferenceEntry(entry:CircumferenceEntry):CircumferenceToken|null{const b=waistBasis(entry);return b?(b.original?{...b.original}:null):rawWaist(entry).kind==="valid"?{unit:entry.unit,value:entry.value}:null;}
export function formatHeightEntry(cm:number|null,unit:HeightEntryUnit):HeightEntry {
 if(cm===null)return {unit,primary:"",inches:""};
 if(!Number.isFinite(cm)||cm<=0)throw Error("Invalid canonical height");
 const rendered=heightToken(cm,unit);return{...rendered,conversionBasis:{canonical:cm,rendered,original:null}};
}
export function formatMassEntry(kg:number|null,unit:MassEntryUnit):MassEntry {
 if(kg===null)return {unit,value:""};
 if(!Number.isFinite(kg)||kg<=0)throw Error("Invalid canonical mass");
 const rendered=massToken(kg,unit);return{...rendered,conversionBasis:{canonical:kg,rendered,original:null}};
}
export function switchHeightUnit(entry:HeightEntry,target:HeightEntryUnit):HeightEntry|ParseResult {
 if(entry.unit===target)return entry;
 const parsed=parseHeightEntry(entry);
 if(parsed.kind!=="valid")return parsed.kind==="empty"?formatHeightEntry(null,target):parsed;
 const next=formatHeightEntry(parsed.canonical,target);next.conversionBasis!.original=originalHeightEntry(entry);return next;
}
export function switchMassUnit(entry:MassEntry,target:MassEntryUnit):MassEntry|ParseResult {
 if(entry.unit===target)return entry;
 const parsed=parseMassEntry(entry);
 if(parsed.kind!=="valid")return parsed.kind==="empty"?formatMassEntry(null,target):parsed;
 const next=formatMassEntry(parsed.canonical,target);next.conversionBasis!.original=originalMassEntry(entry);return next;
}
function rawWaist(entry:CircumferenceToken):ParseResult {
 if(!["cm","in"].includes(entry.unit))return{kind:"invalid",reason:"Unsupported circumference unit"};
 const value=numberDraft(entry.value);
 if(typeof value!=="number")return value==="invalid"?{kind:"invalid",reason:"Enter a positive circumference"}:{kind:value};
 const cm=entry.unit==="in"?value*2.54:value;
 return cm>0&&cm<=300?{kind:"valid",canonical:cm}:{kind:"invalid",reason:"Circumference is outside the supported range"};
}
export function switchCircumferenceUnit(entry:CircumferenceEntry,target:CircumferenceEntry["unit"]):CircumferenceEntry|ParseResult {
 if(entry.unit===target)return entry;
 const parsed=parseCircumferenceEntry(entry);
 if(parsed.kind==="empty")return {unit:target,value:""};
 if(parsed.kind!=="valid")return parsed;
 const rendered=waistToken(parsed.canonical,target);return{...rendered,conversionBasis:{canonical:parsed.canonical,rendered,original:originalCircumferenceEntry(entry)}};
}

export type FoodMassEntry={unit:"g"|"oz";value:string;conversionBasis?:ConversionBasis<{unit:"g"|"oz";value:string}>};
type FoodMassToken=Pick<FoodMassEntry,"unit"|"value">;
function rawFoodMass(entry:FoodMassToken):ParseResult{
 if(!["g","oz"].includes(entry.unit))return{kind:"invalid",reason:"Unsupported food mass unit"};
 const value=numberDraft(entry.value);
 if(typeof value!=="number")return value==="invalid"?{kind:"invalid",reason:"Enter a positive food mass"}:{kind:value};
 const grams=entry.unit==="oz"?value*28.349523125:value;
 return grams>0&&grams<=3000?{kind:"valid",canonical:grams}:{kind:"invalid",reason:"Food mass is outside the supported range"};
}
function foodMassToken(grams:number,unit:FoodMassToken["unit"]):FoodMassToken{return{unit,value:entryNumber(unit==="oz"?grams/28.349523125:grams,8)}};
function foodMassBasis(entry:FoodMassEntry){const b=entry.conversionBasis;return b&&b.rendered&&["g","oz"].includes(entry.unit)&&Number.isFinite(b.canonical)&&b.canonical>0&&b.canonical<=3000&&sameMass(entry,b.rendered)&&sameMass(entry,foodMassToken(b.canonical,entry.unit))&&originalMatches(b.original,b.canonical,rawFoodMass)?b:null;}
export function parseFoodMassEntry(entry:FoodMassEntry):ParseResult{const b=foodMassBasis(entry);return b?{kind:"valid",canonical:b.canonical}:rawFoodMass(entry);}
export function originalFoodMassEntry(entry:FoodMassEntry):FoodMassToken|null{const b=foodMassBasis(entry);return b?(b.original?{...b.original}:null):rawFoodMass(entry).kind==="valid"?{unit:entry.unit,value:entry.value}:null;}
export function formatFoodMassEntry(grams:number|null,unit:FoodMassToken["unit"]):FoodMassEntry{
 if(grams===null)return{unit,value:""};
 if(!Number.isFinite(grams)||grams<=0)throw Error("Invalid canonical food mass");
 const rendered=foodMassToken(grams,unit);return{...rendered,conversionBasis:{canonical:grams,rendered,original:null}};
}
export function switchFoodMassUnit(entry:FoodMassEntry,target:FoodMassToken["unit"]):FoodMassEntry|ParseResult{
 if(entry.unit===target)return entry;
 const parsed=parseFoodMassEntry(entry);
 if(parsed.kind!=="valid")return parsed.kind==="empty"?formatFoodMassEntry(null,target):parsed;
 const original=originalFoodMassEntry(entry);if(original?.unit===target)return original;
 const next=formatFoodMassEntry(parsed.canonical,target);next.conversionBasis!.original=original;return next;
}
