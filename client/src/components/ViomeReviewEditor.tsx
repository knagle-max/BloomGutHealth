import {useState} from "react";
import {parseViomeFindings,type ViomeFindings} from "@shared/viome-findings";
type Kind="organisms"|"assessments"|"foods";
export default function ViomeReviewEditor({value,onChange,onEditingChange,disabled}:{value:ViomeFindings;onChange:(next:ViomeFindings)=>void;onEditingChange:(editing:boolean)=>void;disabled:boolean}){
 const [kind,setKind]=useState<Kind>(value.organisms.length?"organisms":"assessments"),[query,setQuery]=useState(""),[page,setPage]=useState(0),[edit,setEdit]=useState<{index:number;name:string;category:string}|null>(null),[error,setError]=useState("");
 const rows=value[kind],matching=rows.map((row,index)=>({row,index})).filter(({row})=>`${row.name} ${row.correctedName||""} ${"reportedCategory"in row?row.correctedCategory||row.reportedCategory:row.reportedGroup}`.toLowerCase().includes(query.trim().toLowerCase())),shown=matching.slice(page*10,page*10+10);
 const apply=()=>{if(!edit)return;const next=structuredClone(value),row=next[kind][edit.index];if(!row)return;
  if(edit.name.trim()===row.name)delete row.correctedName;else row.correctedName=edit.name.trim();
  if("reportedCategory"in row){if(edit.category===row.reportedCategory)delete row.correctedCategory;else (row as any).correctedCategory=edit.category;}
  try{onChange(parseViomeFindings(next));setEdit(null);onEditingChange(false);setError("");}catch{setError("Use a biological label of 1–150 characters and one of the reported categories. Do not enter personal identifiers.");}
 };
 return <fieldset disabled={disabled} className="min-w-0 space-y-3 border-0 p-0 m-0"><legend className="font-semibold">Review all source rows</legend>
  <p className="panel-note">Corrections keep the original biological label and source position. Categories describe the provider report; they do not become allergies, nutrient values or validated diet rules.</p>
  {!!value.organisms.length&&<p className="panel-note">{["Bacteria","Viruses","Eukaryotes"].map(group=>`${value.organisms.filter(row=>row.reportedGroup===group).length} ${group}`).join(" · ")}</p>}
  {!!value.assessments.length&&<p className="panel-note">{["Improve","Attention","Maintain"].map(category=>`${value.assessments.filter(row=>(row.correctedCategory||row.reportedCategory)===category).length} ${category}`).join(" · ")}</p>}
  {!!value.foods.length&&<p className="panel-note">{["Enjoy","Superfood","Minimize","Avoid"].map(category=>`${value.foods.filter(row=>(row.correctedCategory||row.reportedCategory)===category).length} ${category}`).join(" · ")}</p>}
  <label className="block">Record type<select className="bloom-input w-full" disabled={!!edit} value={kind} onChange={e=>{setKind(e.target.value as Kind);setPage(0);setEdit(null);}}><option value="organisms">Organisms ({value.organisms.length})</option><option value="assessments">Assessments ({value.assessments.length})</option><option value="foods">Foods ({value.foods.length})</option></select></label>
  <label className="block">Search source rows<input className="bloom-input w-full" disabled={!!edit} type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);setEdit(null);}} /></label>
  <p role="status">{matching.length?`${page*10+1}–${Math.min(page*10+10,matching.length)} of ${matching.length} rows`:"No matching source rows"}</p>
  <ol className="divide-y divide-border">{shown.map(({row,index})=><li key={`${row.position.page}:${row.position.column}:${row.position.row}`} className="py-3 space-y-1 break-words">
   <p className="font-medium">{row.correctedName||row.name}</p><p className="text-sm">{"reportedCategory"in row?row.correctedCategory||row.reportedCategory:row.reportedGroup+" · reported present"} · page {row.position.page}, column {row.position.column}, row {row.position.row}</p>
   {!!row.correctedName&&<p className="panel-note">Original biological label: {row.name}</p>}
   {"correctedCategory"in row&&row.correctedCategory&&<p className="panel-note">Original category: {row.reportedCategory}</p>}
   <button className="text-link min-h-11 focus-visible:outline focus-visible:outline-2" type="button" disabled={!!edit} onClick={()=>{setEdit({index,name:row.correctedName||row.name,category:"reportedCategory"in row?row.correctedCategory||row.reportedCategory:""});onEditingChange(true);setError("");}}>Edit {row.correctedName||row.name}</button>
  </li>)}</ol>
  <div className="flex gap-4"><button className="text-link min-h-11 disabled:opacity-50" type="button" disabled={!page||!!edit} onClick={()=>setPage(page-1)}>Previous rows</button><button className="text-link min-h-11 disabled:opacity-50" type="button" disabled={(page+1)*10>=matching.length||!!edit} onClick={()=>setPage(page+1)}>Next rows</button></div>
  {edit&&<section className="rounded-xl border border-border p-4 space-y-3" aria-label="Correct source row"><label className="block">Corrected biological label<input autoFocus className="bloom-input w-full" value={edit.name} maxLength={150} onChange={e=>setEdit({...edit,name:e.target.value})} /></label>
   {kind!=="organisms"&&<label className="block">Corrected provider category<select className="bloom-input w-full" value={edit.category} onChange={e=>setEdit({...edit,category:e.target.value})}>{(kind==="assessments"?["Improve","Attention","Maintain"]:["Enjoy","Superfood","Minimize","Avoid"]).map(category=><option key={category}>{category}</option>)}</select></label>}
   {error&&<p role="alert">{error}</p>}<div className="flex flex-wrap gap-4"><button className="text-link min-h-11" type="button" onClick={apply}>Apply row correction</button><button className="text-link min-h-11" type="button" onClick={()=>{setEdit(null);onEditingChange(false);setError("");}}>Cancel correction</button></div>
  </section>}
 </fieldset>;
}
