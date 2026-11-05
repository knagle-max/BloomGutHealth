import {useEffect,useId,useRef,useState} from "react";
import {formatFoodMassEntry,parseFoodMassEntry,switchFoodMassUnit,type FoodMassEntry} from "@shared/measurement-entry";
/** Only valid canonical mass leaves the editor; unfinished text keeps its labeled unit. */
export default function FoodMassInput({grams,unit,onChange}:{grams:number|null;unit:"g"|"oz";onChange:(grams:number|null)=>void}){
 const [entry,setEntry]=useState<FoodMassEntry>(()=>formatFoodMassEntry(grams!==null&&Number.isFinite(grams)&&grams>0?grams:null,unit));
 const lastCanonical=useRef(grams),errorId=useId();
 useEffect(()=>{
  if(lastCanonical.current!==grams){lastCanonical.current=grams;setEntry(formatFoodMassEntry(grams!==null&&Number.isFinite(grams)&&grams>0?grams:null,unit));return;}
  setEntry(old=>{const next=switchFoodMassUnit(old,unit);return "unit"in next?next:old;});
 },[grams,unit]);
 const parsed=parseFoodMassEntry(entry),valid=parsed.kind==="valid";
 return <div><label>Amount eaten ({entry.unit})<input className="bloom-input" type="text" inputMode="decimal" maxLength={128} value={entry.value}
  aria-invalid={!valid} aria-describedby={!valid?errorId:undefined} onChange={e=>{
   const next:FoodMassEntry={unit:e.target.value.trim()===""?unit:entry.unit,value:e.target.value},value=parseFoodMassEntry(next),canonical=value.kind==="valid"?value.canonical:null;
   setEntry(next);lastCanonical.current=canonical;onChange(canonical);
  }}/></label>
  {!valid&&<p id={errorId} role="alert">Enter a positive mass up to {entry.unit==="oz"?"105.82 oz":"3,000 g"}. Finish decimals before continuing.</p>}
  {entry.unit!==unit&&<p className="panel-note" role="status">This unfinished entry keeps its original unit. Finish or clear it to use your updated preference.</p>}
 </div>;
}
