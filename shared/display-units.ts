export type HeightUnit="cm"|"m"|"ft-in";
export type WeightUnit="kg"|"lb";
export const inchesPerCm=1/2.54;
export const poundsPerKg=2.2046226218487757;
export function heightToCm(value:number,unit:HeightUnit,inches=0):number {
 if(!Number.isFinite(value)||!Number.isFinite(inches)) throw Error("Invalid height");
 if(unit==="cm")return value;
 if(unit==="m")return value*100;
 return (value*12+inches)*2.54;
}
export function cmToHeight(cm:number,unit:HeightUnit):{primary:number;inches:number} {
 if(unit==="cm")return {primary:cm,inches:0};
 if(unit==="m")return {primary:cm/100,inches:0};
 const total=cm*inchesPerCm;
 const feet=Math.floor(total/12);
 return {primary:feet,inches:total-feet*12};
}
export function kgToDisplay(kg:number,unit:WeightUnit):number {return unit==="lb"?kg*poundsPerKg:kg;}
export function displayToKg(value:number,unit:WeightUnit):number {return unit==="lb"?value/poundsPerKg:value;}

/** Source values stay canonical; presentation never mutates recorded provenance. */
export type QuantityKind = "circumference"|"hydration"|"temperature"|"energy"|"foodWeight";
export type QuantityDisplayUnit = "cm"|"in"|"mL"|"L"|"US-fl-oz"|"C"|"F"|"kcal"|"kJ"|"g"|"oz";
const allowed: Record<QuantityKind, readonly QuantityDisplayUnit[]> = {
 circumference:["cm","in"], hydration:["mL","L","US-fl-oz"],
 temperature:["C","F"], energy:["kcal","kJ"],foodWeight:["g","oz"],
};
export function quantityFromCanonical(kind:QuantityKind,value:number,unit:QuantityDisplayUnit):number {
 if (!Number.isFinite(value) || !allowed[kind].includes(unit)) throw Error("Invalid display unit or value");
 switch(kind){
  case "circumference":return unit==="in"?value/2.54:value;
  case "hydration":return unit==="L"?value/1000:unit==="US-fl-oz"?value/29.5735295625:value;
  case "temperature":return unit==="F"?value*9/5+32:value;
  case "energy":return unit==="kJ"?value*4.184:value;
  case "foodWeight":return unit==="oz"?value/28.349523125:value;
 }
}
export function quantityToCanonical(kind:QuantityKind,value:number,unit:QuantityDisplayUnit):number {
 if (!Number.isFinite(value) || !allowed[kind].includes(unit)) throw Error("Invalid entry unit or value");
 switch(kind){
  case "circumference":return unit==="in"?value*2.54:value;
  case "hydration":return unit==="L"?value*1000:unit==="US-fl-oz"?value*29.5735295625:value;
  case "temperature":return unit==="F"?(value-32)*5/9:value;
  case "energy":return unit==="kJ"?value/4.184:value;
  case "foodWeight":return unit==="oz"?value*28.349523125:value;
 }
}
