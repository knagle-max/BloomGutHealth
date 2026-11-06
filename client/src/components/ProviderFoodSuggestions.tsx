import {useEffect,useState} from "react";
import type {ReportFoodRecommendation} from "@shared/structured-report";

/** Read-only provider history. These rows never become planner exclusions. */
export default function ProviderFoodSuggestions({foods,query,provider}:{foods:ReportFoodRecommendation[];query:string;provider:string}){
  const[category,setCategory]=useState("all"),[expanded,setExpanded]=useState(false);
  useEffect(()=>{setCategory("all");setExpanded(false);},[foods]);
  useEffect(()=>setExpanded(false),[query]);
  const categories=Array.from(new Set(foods.map(f=>f.reportedCategory)));
  const categoryValue=(value:string|null)=>value===null?"missing":`category:${value}`;
  const shown=foods.map((food,index)=>({food,index})).filter(({food})=>(category==="all"||categoryValue(food.reportedCategory)===category)&&food.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <section aria-labelledby="provider-food-suggestions-title" className="space-y-3">
    <div><h3 id="provider-food-suggestions-title">Provider food suggestions</h3><p className="panel-note">Source: {provider}. Historical provider categories, not a Bloom meal plan or a validated personal response. “Avoid” is not an allergy. Your confirmed allergies, dietary choices and tolerances take priority.</p></div>
    <label className="block">Provider food category<select className="bloom-input w-full" value={category} onChange={e=>{setCategory(e.target.value);setExpanded(false);}}><option value="all">All provider categories</option>{categories.map(c=><option value={categoryValue(c)} key={categoryValue(c)}>{c||"Category not supplied"} ({foods.filter(f=>f.reportedCategory===c).length})</option>)}</select></label>
    <p role="status">{Math.min(expanded?shown.length:10,shown.length)} shown of {shown.length} matching rows · {foods.length} total source rows</p>
    <ul className="divide-y divide-border">{(expanded?shown:shown.slice(0,10)).map(({food,index})=><li className="py-3 space-y-1 break-words" key={index}>
      <div className="flex flex-wrap justify-between gap-2"><h4 className="font-semibold">{food.name}</h4><span className="text-sm">{food.reportedCategory||"Category not supplied"}</span></div>
      <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Source details</summary><p className="panel-note">Source row {index+1}{food.sourcePage!==null?` · page ${food.sourcePage}`:" · page not supplied"}{food.sourceColumn!==null?` · column ${food.sourceColumn}`:""}.</p><p>{food.notes||"No additional provider note supplied."}</p></details>
    </li>)}</ul>
    {!shown.length&&<p>No food rows match this name and provider category.</p>}
    {!expanded&&shown.length>10&&<button type="button" className="text-link min-h-11 focus-visible:outline focus-visible:outline-2" onClick={()=>setExpanded(true)}>Show all {shown.length} matching food rows</button>}
    <p className="panel-note">Names and categories stay as supplied. Repeated names remain separate source rows. Reading these rows does not enable report influence. Optional meal ranking uses the separate account setting; allergies, nutrient targets and exclusions remain independent.</p>
  </section>;
}
