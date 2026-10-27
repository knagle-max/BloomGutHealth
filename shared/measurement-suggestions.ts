import {restaurantRegions} from "./restaurant-entry";
import type {DisplayUnits} from './experience';

/** A browser language tag is only a hint, never residence or market eligibility.
 * Do not maximize language-only tags into an invented region or save this hint. */
export function measurementUnitSuggestion(input:unknown,savedRegion?:unknown):{locale:string|null;region:typeof restaurantRegions[number]|null;units:DisplayUnits}{
 let locale: string|null=null,us=false;
 if(typeof input==='string'&&input.length<=128){
  try{
   const parsed=new Intl.Locale(input);
   locale=parsed.toString();
   const system=locale.match(/-ms-(metric|ussystem|uksystem)(?:-|$)/)?.[1];
   us=system==='ussystem'||(!system&&parsed.region==='US');
  }catch{/* Unknown locale retains usable metric starting suggestions. */}
 }
 const region=restaurantRegions.find(value=>value===savedRegion)||null;
 if(region!==null)us=region==='United States';
 return {locale,region,units:{height:us?'ft-in':'cm',bodyWeight:us?'lb':'kg',circumference:us?'in':'cm',hydration:us?'US-fl-oz':'mL',temperature:us?'F':'C',energy:'kcal',foodWeight:us?'oz':'g'}};
}
