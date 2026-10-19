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
